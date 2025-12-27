#!/usr/bin/env python3
"""
Geocode properties using Nominatim (OpenStreetMap) API.
Updates the lat/lng values in property markdown files.
"""

import os
import re
import time
import requests
from pathlib import Path

# Nominatim API endpoint
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

# Path to properties
PROPERTIES_DIR = Path(__file__).parent.parent.parent / "frontend" / "content" / "properties"

# Default coordinates (to identify properties that need geocoding)
DEFAULT_LAT = "17.4195"
DEFAULT_LNG = "78.358"

def geocode_location(location: str) -> tuple[float, float] | None:
    """
    Geocode a location string using Nominatim API.
    Returns (lat, lng) tuple or None if not found.
    """
    # Clean up location string and add India for better results
    search_query = f"{location}, India"
    
    # Remove parenthetical notes like "(Aparna Deccan Town)"
    search_query = re.sub(r'\([^)]*\)', '', search_query).strip()
    
    params = {
        "q": search_query,
        "format": "json",
        "limit": 1,
        "countrycodes": "in",  # Limit to India
    }
    
    headers = {
        "User-Agent": "PickYourFlat/1.0 (property geocoding script)"
    }
    
    try:
        response = requests.get(NOMINATIM_URL, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        if data and len(data) > 0:
            lat = float(data[0]["lat"])
            lng = float(data[0]["lon"])
            return (lat, lng)
        
        # If full location fails, try just the first part (locality)
        locality = location.split(",")[0].strip()
        locality = re.sub(r'\([^)]*\)', '', locality).strip()
        
        # Add Hyderabad if not already present
        if "hyderabad" not in locality.lower():
            search_query = f"{locality}, Hyderabad, India"
        else:
            search_query = f"{locality}, India"
            
        params["q"] = search_query
        
        response = requests.get(NOMINATIM_URL, params=params, headers=headers, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        if data and len(data) > 0:
            lat = float(data[0]["lat"])
            lng = float(data[0]["lon"])
            return (lat, lng)
            
        return None
        
    except Exception as e:
        print(f"  Error geocoding '{location}': {e}")
        return None


def extract_frontmatter(content: str) -> tuple[dict, str]:
    """Extract frontmatter and body from markdown content."""
    match = re.match(r'^---\n(.*?)\n---\n(.*)$', content, re.DOTALL)
    if not match:
        return {}, content
    
    frontmatter_text = match.group(1)
    body = match.group(2)
    
    # Parse frontmatter
    frontmatter = {}
    for line in frontmatter_text.split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip().strip('"')
            frontmatter[key] = value
    
    return frontmatter, body


def update_frontmatter(content: str, lat: float, lng: float) -> str:
    """Update lat/lng in frontmatter."""
    # Update lat
    content = re.sub(
        r'^(lat:)\s*[\d.]+',
        f'lat: {lat:.4f}',
        content,
        flags=re.MULTILINE
    )
    
    # Update lng
    content = re.sub(
        r'^(lng:)\s*[\d.]+',
        f'lng: {lng:.4f}',
        content,
        flags=re.MULTILINE
    )
    
    return content


def needs_geocoding(frontmatter: dict) -> bool:
    """Check if property has default coordinates."""
    lat = frontmatter.get("lat", "")
    lng = frontmatter.get("lng", "")
    
    # Check if using default coordinates
    return lat == DEFAULT_LAT or lng == DEFAULT_LNG or lng == "78.3580"


def main():
    print("=" * 60)
    print("Property Geocoding Script")
    print("=" * 60)
    
    if not PROPERTIES_DIR.exists():
        print(f"Error: Properties directory not found: {PROPERTIES_DIR}")
        return
    
    property_files = list(PROPERTIES_DIR.glob("*.md"))
    print(f"Found {len(property_files)} property files\n")
    
    needs_update = []
    already_geocoded = []
    
    # First pass: identify which properties need geocoding
    for filepath in property_files:
        content = filepath.read_text(encoding="utf-8")
        frontmatter, _ = extract_frontmatter(content)
        
        if needs_geocoding(frontmatter):
            needs_update.append((filepath, frontmatter))
        else:
            already_geocoded.append(filepath.stem)
    
    print(f"Properties with unique coordinates: {len(already_geocoded)}")
    print(f"Properties needing geocoding: {len(needs_update)}\n")
    
    if not needs_update:
        print("All properties already have unique coordinates!")
        return
    
    # Second pass: geocode properties that need it
    updated = 0
    failed = []
    
    for i, (filepath, frontmatter) in enumerate(needs_update):
        location = frontmatter.get("location", "")
        project = frontmatter.get("project", filepath.stem)
        
        print(f"[{i+1}/{len(needs_update)}] {project}")
        print(f"  Location: {location}")
        
        if not location or location == "TBD":
            print("  Skipping: No valid location")
            failed.append((project, "No valid location"))
            continue
        
        # Respect rate limit (1 request per second)
        time.sleep(1.1)
        
        coords = geocode_location(location)
        
        if coords:
            lat, lng = coords
            print(f"  Found: {lat:.4f}, {lng:.4f}")
            
            # Update the file
            content = filepath.read_text(encoding="utf-8")
            updated_content = update_frontmatter(content, lat, lng)
            filepath.write_text(updated_content, encoding="utf-8")
            
            updated += 1
            print("  ✓ Updated")
        else:
            print("  ✗ Could not geocode")
            failed.append((project, location))
    
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"Successfully updated: {updated}")
    print(f"Failed to geocode: {len(failed)}")
    
    if failed:
        print("\nFailed properties:")
        for project, location in failed:
            print(f"  - {project}: {location}")


if __name__ == "__main__":
    main()
