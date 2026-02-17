from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert

from app.database import get_db
from app.dependencies import get_user_cookie
from app.models.project import Project
from app.models.review import Review
from app.schemas.user_content import ReviewCreate, ReviewOut, ReviewSummary

router = APIRouter(prefix="/api/v1/projects", tags=["reviews"])


@router.post("/{slug}/reviews", response_model=ReviewOut, status_code=201)
async def submit_review(
    slug: str,
    body: ReviewCreate,
    user_cookie: str = Depends(get_user_cookie),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_project(slug, db)

    # Upsert: insert or update on (project_id, user_cookie)
    stmt = pg_insert(Review).values(
        project_id=project.id,
        user_cookie=user_cookie,
        rating=body.rating,
        review_text=body.review_text,
    )
    stmt = stmt.on_conflict_do_update(
        constraint="uq_review_project_user",
        set_={"rating": body.rating, "review_text": body.review_text},
    )
    await db.execute(stmt)
    await db.commit()

    # Fetch the upserted row
    result = await db.execute(
        select(Review).where(
            Review.project_id == project.id,
            Review.user_cookie == user_cookie,
        )
    )
    review = result.scalar_one()
    return ReviewOut(
        id=review.id,
        rating=review.rating,
        review_text=review.review_text,
        is_mine=True,
        created_at=review.created_at,
        updated_at=review.updated_at,
    )


@router.get("/{slug}/reviews", response_model=ReviewSummary)
async def get_reviews(
    slug: str,
    user_cookie: str = Depends(get_user_cookie),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_project(slug, db)

    result = await db.execute(
        select(Review)
        .where(Review.project_id == project.id)
        .order_by(Review.created_at.desc())
    )
    reviews = result.scalars().all()

    review_list = [
        ReviewOut(
            id=r.id,
            rating=r.rating,
            review_text=r.review_text,
            is_mine=(r.user_cookie == user_cookie),
            created_at=r.created_at,
            updated_at=r.updated_at,
        )
        for r in reviews
    ]

    ratings = [r.rating for r in reviews]
    return ReviewSummary(
        reviews=review_list,
        count=len(reviews),
        avg_rating=round(sum(ratings) / len(ratings), 1) if ratings else None,
    )


async def _get_project(slug: str, db: AsyncSession) -> Project:
    result = await db.execute(select(Project).where(Project.slug == slug))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
