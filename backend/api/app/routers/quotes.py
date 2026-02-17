from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func as sql_func

from app.database import get_db
from app.dependencies import get_user_cookie
from app.models.project import Project
from app.models.price_quote import PriceQuote
from app.schemas.user_content import PriceQuoteCreate, PriceQuoteOut, PriceQuoteSummary

router = APIRouter(prefix="/api/v1/projects", tags=["price-quotes"])


@router.post("/{slug}/quotes", response_model=PriceQuoteOut, status_code=201)
async def submit_quote(
    slug: str,
    body: PriceQuoteCreate,
    user_cookie: str = Depends(get_user_cookie),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_project(slug, db)
    quote = PriceQuote(
        project_id=project.id,
        user_cookie=user_cookie,
        price_per_sqft=body.price_per_sqft,
        configuration=body.configuration,
    )
    db.add(quote)
    await db.commit()
    await db.refresh(quote)
    return PriceQuoteOut(
        id=quote.id,
        price_per_sqft=quote.price_per_sqft,
        configuration=quote.configuration,
        is_mine=True,
        created_at=quote.created_at,
    )


@router.get("/{slug}/quotes", response_model=PriceQuoteSummary)
async def get_quotes(
    slug: str,
    user_cookie: str = Depends(get_user_cookie),
    db: AsyncSession = Depends(get_db),
):
    project = await _get_project(slug, db)

    result = await db.execute(
        select(PriceQuote)
        .where(PriceQuote.project_id == project.id)
        .order_by(PriceQuote.created_at.desc())
    )
    quotes = result.scalars().all()

    quote_list = [
        PriceQuoteOut(
            id=q.id,
            price_per_sqft=q.price_per_sqft,
            configuration=q.configuration,
            is_mine=(q.user_cookie == user_cookie),
            created_at=q.created_at,
        )
        for q in quotes
    ]

    prices = [q.price_per_sqft for q in quotes]
    return PriceQuoteSummary(
        quotes=quote_list,
        count=len(quotes),
        avg_price=round(sum(prices) / len(prices), 0) if prices else None,
        min_price=min(prices) if prices else None,
        max_price=max(prices) if prices else None,
    )


async def _get_project(slug: str, db: AsyncSession) -> Project:
    result = await db.execute(select(Project).where(Project.slug == slug))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
