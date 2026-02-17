from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.project import Project
from app.models.builder import Builder
from app.models.locality import Locality
from app.models.city import City
from app.schemas.project import ProjectListItem, ProjectDetail

router = APIRouter(prefix="/api/v1/projects", tags=["projects"])


@router.get("", response_model=list[ProjectListItem])
async def list_projects(db: AsyncSession = Depends(get_db)):
    """Return all active projects with listing-level data."""
    stmt = (
        select(Project)
        .options(
            selectinload(Project.builder),
            selectinload(Project.locality).selectinload(Locality.city),
        )
        .where(Project.status == "active")
        .order_by(Project.name)
    )
    result = await db.execute(stmt)
    projects = result.scalars().all()

    return [_to_list_item(p) for p in projects]


@router.get("/{slug}", response_model=ProjectDetail)
async def get_project(slug: str, db: AsyncSession = Depends(get_db)):
    """Return full detail for a single project by slug."""
    stmt = (
        select(Project)
        .options(
            selectinload(Project.builder),
            selectinload(Project.locality).selectinload(Locality.city),
            selectinload(Project.amenities),
        )
        .where(Project.slug == slug)
    )
    result = await db.execute(stmt)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return _to_detail(project)


def _to_list_item(p: Project) -> dict:
    return {
        "id": p.id,
        "slug": p.slug,
        "name": p.name,
        "builder_name": p.builder.name,
        "builder_slug": p.builder.slug,
        "city_name": p.locality.city.name if p.locality and p.locality.city else None,
        "locality_name": p.locality.name if p.locality else None,
        "location_text": p.location_text,
        "configurations": p.configurations,
        "bhk_options": p.bhk_options,
        "total_units": p.total_units,
        "towers": p.towers,
        "floors": p.floors,
        "area_text": p.area_text,
        "area_acres": float(p.area_acres) if p.area_acres else None,
        "unit_sizes_text": p.unit_sizes_text,
        "unit_size_min": p.unit_size_min,
        "unit_size_max": p.unit_size_max,
        "units_per_acre": float(p.units_per_acre) if p.units_per_acre else None,
        "price_text": p.price_text,
        "price_min_cr": float(p.price_min_cr) if p.price_min_cr else None,
        "price_max_cr": float(p.price_max_cr) if p.price_max_cr else None,
        "possession_text": p.possession_text,
        "possession_year": p.possession_year,
        "rera_number": p.rera_number,
        "rera_registered": p.rera_registered,
        "clubhouse_text": p.clubhouse_text,
        "open_space_text": p.open_space_text,
        "lat": float(p.lat) if p.lat else None,
        "lng": float(p.lng) if p.lng else None,
        "builder_url": p.builder_url,
    }


def _to_detail(p: Project) -> dict:
    base = _to_list_item(p)
    base.update(
        {
            "clubhouse_sqft": p.clubhouse_sqft,
            "open_space_pct": float(p.open_space_pct) if p.open_space_pct else None,
            "description": p.description,
            "standout_features": p.standout_features,
            "location_highlights": p.location_highlights,
            "amenities": [
                {"name": a.name, "category": a.category} for a in p.amenities
            ],
        }
    )
    return base
