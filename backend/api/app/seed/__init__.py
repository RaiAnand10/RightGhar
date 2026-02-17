"""
Seed the database from the existing markdown property files in frontend/content/properties/.
Each file has YAML frontmatter (metadata) + markdown body (content).

Run this script from backend/api/:
    python -m app.seed.seed_from_data
"""

import os
import re
import sys
import yaml
from decimal import Decimal, InvalidOperation

import psycopg2
from psycopg2.extras import execute_values


# ---------------------------------------------------------------------------
# Parsing helpers
# ---------------------------------------------------------------------------

def parse_markdown_file(filepath: str) -> dict | None:
    """Parse a markdown file with YAML frontmatter."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    match = re.match(r"^---\n(.*?)\n---\n?(.*)", content, re.DOTALL)
    if not match:
        return None

    try:
        metadata = yaml.safe_load(match.group(1))
    except yaml.YAMLError:
        return None

    body = match.group(2).strip()
    return {"metadata": metadata, "content": body}


def slugify(text: str) -> str:
    """Convert text to URL-safe slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


def extract_price_cr(price_str: str | None) -> float | None:
    """Extract price in crores from string like '₹2.25 CR' or '₹85 Lakh'."""
    if not price_str:
        return None
    match = re.search(r"(\d+\.?\d*)\s*(CR|Cr|cr|crore|L|Lakh|lakh|lac)", price_str, re.IGNORECASE)
    if not match:
        return None
    value = float(match.group(1))
    unit = match.group(2).lower()
    if unit.startswith("cr"):
        return value
    if unit.startswith("l"):
        return value / 100
    return value


def extract_year(possession_str: str | None) -> int | None:
    """Extract year from possession string."""
    if not possession_str:
        return None
    match = re.search(r"20\d{2}", possession_str)
    return int(match.group(0)) if match else None


def extract_bhk_options(config_str: str | None) -> list[int]:
    """Extract BHK numbers from config string like '2, 2.5 & 3 BHK'."""
    if not config_str:
        return []
    # Find all numbers before BHK
    numbers = re.findall(r"(\d+(?:\.\d+)?)\s*(?:&|,|BHK)", config_str, re.IGNORECASE)
    # Also match trailing BHK
    if not numbers:
        numbers = re.findall(r"(\d+(?:\.\d+)?)", config_str)
    # Only keep integer BHK values (2, 3, 4, 5), skip 2.5
    return sorted(set(int(float(n)) for n in numbers if float(n) == int(float(n))))


def parse_area_acres(area_str: str | None) -> float | None:
    """Extract numeric acres from '6.68 Acres'."""
    if not area_str:
        return None
    match = re.search(r"(\d+\.?\d*)\s*(?:acres?|ac)", area_str, re.IGNORECASE)
    return float(match.group(1)) if match else None


def parse_unit_sizes(unit_str: str | None) -> tuple[int | None, int | None]:
    """Parse '1345 - 1981 Sq. Ft.' into (min, max)."""
    if not unit_str:
        return None, None
    # Remove commas from numbers
    cleaned = unit_str.replace(",", "")
    numbers = re.findall(r"(\d+)", cleaned)
    if len(numbers) >= 2:
        return int(numbers[0]), int(numbers[-1])
    if len(numbers) == 1:
        return int(numbers[0]), int(numbers[0])
    return None, None


def parse_clubhouse_sqft(clubhouse_str: str | None) -> int | None:
    """Parse '37,593 Sq. Ft.' into 37593."""
    if not clubhouse_str or clubhouse_str.upper() == "TBD":
        return None
    cleaned = clubhouse_str.replace(",", "")
    match = re.search(r"(\d+)", cleaned)
    return int(match.group(1)) if match else None


def parse_open_space_pct(os_str: str | None) -> float | None:
    """Parse '80%' into 80.0."""
    if not os_str or os_str.upper() == "TBD":
        return None
    match = re.search(r"(\d+\.?\d*)\s*%", os_str)
    return float(match.group(1)) if match else None


def detect_city(location: str | None) -> str | None:
    """Detect city from location string."""
    if not location:
        return None
    loc_lower = location.lower()
    if "hyderabad" in loc_lower or "secunderabad" in loc_lower:
        return "Hyderabad"
    if "bangalore" in loc_lower or "bengaluru" in loc_lower:
        return "Bangalore"
    return None


def detect_locality(location: str | None) -> str | None:
    """Extract locality (first part before comma) from location string."""
    if not location:
        return None
    parts = [p.strip() for p in location.split(",")]
    if len(parts) >= 2:
        # First part is usually locality, last part is city
        # But sometimes it's "Osman Nagar, Hyderabad" or "Gopanpally-Gachibowli, Hyderabad"
        locality = parts[0]
        # Remove parenthetical info
        locality = re.sub(r"\(.*?\)", "", locality).strip()
        return locality if locality else None
    return None


def extract_sections(content: str) -> dict:
    """Extract overview, standout features, amenities, location sections from markdown."""
    sections = {
        "description": "",
        "standout_features": "",
        "location_highlights": "",
        "amenities_by_category": {},
    }

    # Split by ## headers
    parts = re.split(r"(?=^## )", content, flags=re.MULTILINE)

    for part in parts:
        header_match = re.match(r"^## (.+)", part)
        if not header_match:
            # Content before first ## header (usually just the # title)
            continue

        header = header_match.group(1).strip().lower()
        body = part[header_match.end():].strip()

        if "overview" in header:
            sections["description"] = body

        elif "standout" in header or "feature" in header or "highlight" in header and "location" not in header:
            sections["standout_features"] = body

        elif "amenities" in header or "facilities" in header:
            # Parse amenities by sub-category (### headers)
            current_cat = "general"
            for line in body.split("\n"):
                cat_match = re.match(r"^### (.+)", line)
                if cat_match:
                    current_cat = cat_match.group(1).strip().lower()
                    continue
                # Bullet items
                item_match = re.match(r"^[-*•]\s+(.+)", line)
                if item_match:
                    item = item_match.group(1).strip()
                    # Remove bold markdown
                    item = re.sub(r"\*\*(.+?)\*\*", r"\1", item)
                    # Some items have description after colon - just take the name
                    if sections["amenities_by_category"].get(current_cat) is None:
                        sections["amenities_by_category"][current_cat] = []
                    sections["amenities_by_category"][current_cat].append(item)

        elif "location" in header or "connectivity" in header or "nearby" in header:
            sections["location_highlights"] = body

    return sections


# ---------------------------------------------------------------------------
# Main seed logic
# ---------------------------------------------------------------------------

def seed():
    # Try multiple possible locations for content directory
    candidates = [
        # When running from backend/api/ locally
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "frontend", "content", "properties"),
        # When running inside docker with volume mount
        "/frontend_content/properties",
    ]
    content_dir = None
    for c in candidates:
        resolved = os.path.abspath(c)
        if os.path.isdir(resolved):
            content_dir = resolved
            break

    if not content_dir:
        print(f"ERROR: Content directory not found. Tried: {[os.path.abspath(c) for c in candidates]}")
        sys.exit(1)

    # Parse all markdown files
    properties = []
    for fname in sorted(os.listdir(content_dir)):
        if not fname.endswith(".md"):
            continue
        filepath = os.path.join(content_dir, fname)
        parsed = parse_markdown_file(filepath)
        if parsed:
            properties.append(parsed)

    print(f"Parsed {len(properties)} properties from {content_dir}")

    # Connect to DB
    db_url = os.environ.get(
        "DATABASE_URL_SYNC",
        "postgresql+psycopg2://rightghar:rightghar_dev@localhost:5432/rightghar",
    )
    # psycopg2 needs plain postgresql:// URL
    dsn = db_url.replace("postgresql+psycopg2://", "postgresql://")
    conn = psycopg2.connect(dsn)
    conn.autocommit = False
    cur = conn.cursor()

    try:
        # Clear existing data (in correct order for FK constraints)
        cur.execute("DELETE FROM project_amenities")
        cur.execute("DELETE FROM amenities")
        cur.execute("DELETE FROM projects")
        cur.execute("DELETE FROM localities")
        cur.execute("DELETE FROM cities")
        cur.execute("DELETE FROM builders")

        # --- Collect unique builders, cities, localities ---
        builders = {}  # name -> slug
        cities = {}    # name -> id (placeholder)
        localities = {}  # (name, city_name) -> id (placeholder)

        for prop in properties:
            meta = prop["metadata"]
            builder_name = meta.get("builder", "Unknown")
            if builder_name not in builders:
                builders[builder_name] = slugify(builder_name)

            location = meta.get("location", "")
            city = detect_city(location)
            if city and city not in cities:
                cities[city] = None

            locality = detect_locality(location)
            if locality and city:
                key = (locality, city)
                if key not in localities:
                    localities[key] = None

        # --- Insert builders ---
        builder_rows = [(slugify(name), name) for name in sorted(builders)]
        execute_values(
            cur,
            "INSERT INTO builders (slug, name) VALUES %s",
            builder_rows,
        )
        cur.execute("SELECT id, name FROM builders")
        builder_map = {row[1]: row[0] for row in cur.fetchall()}
        print(f"Inserted {len(builder_map)} builders")

        # --- Insert cities ---
        for city_name in sorted(cities):
            cur.execute(
                "INSERT INTO cities (name) VALUES (%s) RETURNING id",
                (city_name,),
            )
            cities[city_name] = cur.fetchone()[0]
        print(f"Inserted {len(cities)} cities")

        # --- Insert localities ---
        for (loc_name, city_name) in sorted(localities):
            city_id = cities.get(city_name)
            if city_id:
                cur.execute(
                    "INSERT INTO localities (name, city_id) VALUES (%s, %s) RETURNING id",
                    (loc_name, city_id),
                )
                localities[(loc_name, city_name)] = cur.fetchone()[0]
        print(f"Inserted {len(localities)} localities")

        # --- Collect all amenities across all projects first ---
        all_amenities = {}  # (name, category) -> None
        for prop in properties:
            sections = extract_sections(prop["content"])
            for cat, items in sections["amenities_by_category"].items():
                for item in items:
                    # Normalize: take just the amenity name (before any colon description)
                    clean_name = item.split(":")[0].strip() if ":" in item else item.strip()
                    if clean_name and len(clean_name) < 200:
                        all_amenities[(clean_name, cat)] = None

        # Insert amenities
        amenity_rows = [(name, cat) for (name, cat) in sorted(all_amenities)]
        if amenity_rows:
            execute_values(
                cur,
                "INSERT INTO amenities (name, category) VALUES %s ON CONFLICT (name) DO NOTHING",
                # amenity names must be unique, so if two categories have same name, first wins
                [(name, cat) for (name, cat) in amenity_rows],
            )
        cur.execute("SELECT id, name FROM amenities")
        amenity_map = {row[1]: row[0] for row in cur.fetchall()}
        print(f"Inserted {len(amenity_map)} amenities")

        # --- Insert projects ---
        project_amenity_links = []  # (project_slug, amenity_name) to resolve after

        for prop in properties:
            meta = prop["metadata"]
            body = prop["content"]
            sections = extract_sections(body)

            slug = meta.get("id", slugify(meta.get("project", "unknown")))
            name = meta.get("project", "Unknown")
            builder_name = meta.get("builder", "Unknown")
            builder_id = builder_map.get(builder_name)
            if not builder_id:
                print(f"  WARNING: Builder '{builder_name}' not found for {slug}")
                continue

            location = meta.get("location", "")
            city = detect_city(location)
            locality = detect_locality(location)
            locality_id = localities.get((locality, city)) if locality and city else None

            area_acres = parse_area_acres(meta.get("area"))
            total_units = meta.get("totalUnits")
            if isinstance(total_units, str):
                try:
                    total_units = int(total_units)
                except ValueError:
                    total_units = None

            towers = meta.get("towers")
            if isinstance(towers, str):
                try:
                    towers = int(towers)
                except ValueError:
                    towers = None

            # Units per acre
            units_per_acre = None
            if total_units and area_acres and area_acres > 0:
                units_per_acre = round(total_units / area_acres, 2)

            price_text = meta.get("price")
            price_min_cr = extract_price_cr(price_text)

            possession_text = meta.get("possession")
            possession_year = extract_year(possession_text)

            unit_size_min, unit_size_max = parse_unit_sizes(meta.get("unitSizes"))

            rera = meta.get("rera", "")
            rera_registered = bool(rera and rera.upper() != "TBD" and rera.upper() != "NA")

            bhk_options = extract_bhk_options(meta.get("configuration"))

            lat_val = meta.get("lat")
            lng_val = meta.get("lng")
            try:
                lat_val = float(lat_val) if lat_val else None
            except (ValueError, TypeError):
                lat_val = None
            try:
                lng_val = float(lng_val) if lng_val else None
            except (ValueError, TypeError):
                lng_val = None

            cur.execute(
                """
                INSERT INTO projects (
                    slug, name, builder_id, locality_id, location_text,
                    configurations, bhk_options, total_units, towers, floors,
                    area_text, area_acres, unit_sizes_text, unit_size_min, unit_size_max,
                    units_per_acre,
                    price_text, price_min_cr, price_max_cr,
                    possession_text, possession_year,
                    rera_number, rera_registered,
                    clubhouse_text, clubhouse_sqft, open_space_text, open_space_pct,
                    lat, lng,
                    description, standout_features, location_highlights,
                    builder_url, status
                ) VALUES (
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s,
                    %s,
                    %s, %s, %s,
                    %s, %s,
                    %s, %s,
                    %s, %s, %s, %s,
                    %s, %s,
                    %s, %s, %s,
                    %s, %s
                ) RETURNING id
                """,
                (
                    slug,
                    name,
                    builder_id,
                    locality_id,
                    location or None,
                    meta.get("configuration", ""),
                    bhk_options or None,
                    total_units,
                    towers,
                    str(meta.get("floors", "")) or None,
                    meta.get("area") or None,
                    area_acres,
                    meta.get("unitSizes") or None,
                    unit_size_min,
                    unit_size_max,
                    units_per_acre,
                    price_text,
                    price_min_cr,
                    None,  # price_max_cr — not in current data
                    possession_text,
                    possession_year,
                    rera if rera else None,
                    rera_registered,
                    meta.get("clubhouse") or None,
                    parse_clubhouse_sqft(meta.get("clubhouse")),
                    meta.get("openSpace") or None,
                    parse_open_space_pct(meta.get("openSpace")),
                    lat_val,
                    lng_val,
                    sections["description"] or None,
                    sections["standout_features"] or None,
                    sections["location_highlights"] or None,
                    meta.get("url") or None,
                    "active",
                ),
            )
            project_id = cur.fetchone()[0]

            # Collect amenity links
            for cat, items in sections["amenities_by_category"].items():
                for item in items:
                    clean_name = item.split(":")[0].strip() if ":" in item else item.strip()
                    amenity_id = amenity_map.get(clean_name)
                    if amenity_id:
                        project_amenity_links.append((project_id, amenity_id))

        print(f"Inserted {len(properties)} projects")

        # --- Insert project_amenities ---
        if project_amenity_links:
            # Deduplicate
            project_amenity_links = list(set(project_amenity_links))
            execute_values(
                cur,
                "INSERT INTO project_amenities (project_id, amenity_id) VALUES %s ON CONFLICT DO NOTHING",
                project_amenity_links,
            )
        print(f"Inserted {len(project_amenity_links)} project-amenity links")

        conn.commit()
        print("✅ Seed completed successfully!")

    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    seed()
