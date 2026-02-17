from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import logging

from app.database import get_db
from app.models.project import Project
from app.models.locality import Locality
from app.schemas.chat import ChatRequest, ChatResponse
from app.schemas.project import ProjectListItem
from app.services.openai_service import OpenAIService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["chat"])

# Singleton service instance
openai_service = OpenAIService()


def _to_list_item(p: Project) -> dict:
    """Convert a Project ORM object to the ProjectListItem dict shape."""
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


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    """
    Chat endpoint that processes user messages and returns AI responses
    with referenced project listings.
    """
    try:
        logger.info(f"Received chat request for session: {request.session_id}")

        answer, project_slugs = await openai_service.chat_completion(
            session_id=request.session_id,
            message=request.message,
        )

        # Resolve slugs to full ProjectListItem objects from DB
        references = []
        if project_slugs:
            stmt = (
                select(Project)
                .options(
                    selectinload(Project.builder),
                    selectinload(Project.locality).selectinload(Locality.city),
                )
                .where(Project.slug.in_(project_slugs))
                .where(Project.status == "active")
            )
            result = await db.execute(stmt)
            projects = result.scalars().all()

            # Maintain the order from the AI response
            slug_to_project = {p.slug: p for p in projects}
            for slug in project_slugs:
                if slug in slug_to_project:
                    references.append(_to_list_item(slug_to_project[slug]))

        return ChatResponse(response=answer, references=references)

    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat request: {str(e)}",
        )
