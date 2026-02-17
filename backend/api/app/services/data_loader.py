import logging
from typing import List, Dict, Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import async_session
from app.models.project import Project
from app.models.locality import Locality

logger = logging.getLogger(__name__)


class DataLoader:
    """Service for loading project data and formatting it for AI prompt context."""

    def __init__(self):
        self.projects: List[Dict] = []
        self._loaded = False

    async def load_data(self):
        """Load all active projects from the database."""
        try:
            async with async_session() as session:
                stmt = (
                    select(Project)
                    .options(
                        selectinload(Project.builder),
                        selectinload(Project.locality).selectinload(Locality.city),
                        selectinload(Project.amenities),
                    )
                    .where(Project.status == "active")
                    .order_by(Project.name)
                )
                result = await session.execute(stmt)
                db_projects = result.scalars().all()

                self.projects = []
                for p in db_projects:
                    self.projects.append({
                        "slug": p.slug,
                        "name": p.name,
                        "builder": p.builder.name if p.builder else "Unknown",
                        "city": p.locality.city.name if p.locality and p.locality.city else "Unknown",
                        "locality": p.locality.name if p.locality else "Unknown",
                        "location_text": p.location_text or "",
                        "configurations": p.configurations,
                        "bhk_options": p.bhk_options or [],
                        "total_units": p.total_units,
                        "towers": p.towers,
                        "floors": p.floors,
                        "area_text": p.area_text,
                        "area_acres": float(p.area_acres) if p.area_acres else None,
                        "unit_sizes_text": p.unit_sizes_text,
                        "price_text": p.price_text,
                        "price_min_cr": float(p.price_min_cr) if p.price_min_cr else None,
                        "price_max_cr": float(p.price_max_cr) if p.price_max_cr else None,
                        "possession_text": p.possession_text,
                        "possession_year": p.possession_year,
                        "rera_number": p.rera_number,
                        "rera_registered": p.rera_registered,
                        "clubhouse_text": p.clubhouse_text,
                        "open_space_text": p.open_space_text,
                        "description": p.description or "",
                        "standout_features": p.standout_features or "",
                        "amenities": [a.name for a in p.amenities] if p.amenities else [],
                    })

                self._loaded = True
                logger.info(f"Loaded {len(self.projects)} projects for AI context")

        except Exception as e:
            logger.error(f"Error loading project data: {str(e)}")
            self.projects = []

    async def ensure_loaded(self):
        """Ensure data is loaded (lazy initialization)."""
        if not self._loaded:
            await self.load_data()

    def get_project_by_slug(self, slug: str) -> Optional[Dict]:
        """Get a specific project by slug."""
        for project in self.projects:
            if project["slug"] == slug:
                return project
        return None

    def get_projects_by_slugs(self, slugs: List[str]) -> List[Dict]:
        """Get multiple projects by their slugs."""
        result = []
        for slug in slugs:
            project = self.get_project_by_slug(slug)
            if project:
                result.append(project)
        return result

    def format_for_prompt(self) -> str:
        """Format all project data for inclusion in AI system prompt."""
        if not self.projects:
            return "No projects available."

        formatted_parts = []
        for p in self.projects:
            amenities_str = ", ".join(p["amenities"][:20]) if p["amenities"] else "Not available"
            entry = f"""
=== PROJECT SLUG: {p['slug']} ===
Name: {p['name']}
Builder: {p['builder']}
City: {p['city']}
Locality: {p['locality']}
Location: {p['location_text']}
Configurations: {p['configurations']}
BHK Options: {', '.join(str(b) for b in p['bhk_options']) if p['bhk_options'] else 'N/A'}
Total Units: {p['total_units'] or 'N/A'}
Towers: {p['towers'] or 'N/A'}
Floors: {p['floors'] or 'N/A'}
Area: {p['area_text'] or 'N/A'} ({p['area_acres']} acres)
Unit Sizes: {p['unit_sizes_text'] or 'N/A'}
Price: {p['price_text'] or 'On Request'} (₹{p['price_min_cr']}-{p['price_max_cr']} Cr)
Possession: {p['possession_text'] or 'TBD'} (Year: {p['possession_year'] or 'TBD'})
RERA: {p['rera_number'] or 'N/A'} (Registered: {p['rera_registered']})
Clubhouse: {p['clubhouse_text'] or 'N/A'}
Open Space: {p['open_space_text'] or 'N/A'}
Description: {p['description'][:300] if p['description'] else 'N/A'}
Standout Features: {p['standout_features'][:300] if p['standout_features'] else 'N/A'}
Amenities: {amenities_str}
================================
"""
            formatted_parts.append(entry.strip())

        return "\n\n".join(formatted_parts)
