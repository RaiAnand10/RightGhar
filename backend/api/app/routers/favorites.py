from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from app.database import get_db
from app.dependencies import get_user_cookie
from app.models.user_favorite import UserFavorite

router = APIRouter(prefix="/api/v1/me/favorites", tags=["favorites"])


@router.get("", response_model=list[str])
async def get_favorites(
    user_cookie: str = Depends(get_user_cookie),
    db: AsyncSession = Depends(get_db),
):
    """Return list of favorited project slugs."""
    result = await db.execute(
        select(UserFavorite.project_slug)
        .where(UserFavorite.user_cookie == user_cookie)
        .order_by(UserFavorite.created_at.desc())
    )
    return list(result.scalars().all())


@router.put("/{slug}", status_code=200)
async def add_favorite(
    slug: str,
    user_cookie: str = Depends(get_user_cookie),
    db: AsyncSession = Depends(get_db),
):
    """Add a project to favorites (idempotent)."""
    existing = await db.execute(
        select(UserFavorite).where(
            UserFavorite.user_cookie == user_cookie,
            UserFavorite.project_slug == slug,
        )
    )
    if not existing.scalar_one_or_none():
        fav = UserFavorite(user_cookie=user_cookie, project_slug=slug)
        db.add(fav)
        await db.commit()
    return {"status": "ok"}


@router.delete("/{slug}", status_code=200)
async def remove_favorite(
    slug: str,
    user_cookie: str = Depends(get_user_cookie),
    db: AsyncSession = Depends(get_db),
):
    """Remove a project from favorites."""
    await db.execute(
        delete(UserFavorite).where(
            UserFavorite.user_cookie == user_cookie,
            UserFavorite.project_slug == slug,
        )
    )
    await db.commit()
    return {"status": "ok"}
