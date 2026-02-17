from datetime import date, datetime
from enum import Enum
from typing import Literal
from pydantic import BaseModel, Field


# --- Price Quotes ---

BHK_OPTIONS = Literal["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK"]


class PriceQuoteCreate(BaseModel):
    price_per_sqft: int = Field(gt=0, description="Price in ₹ per sq.ft")
    configuration: BHK_OPTIONS = Field(description="e.g. '3 BHK'")
    quoted_date: date | None = Field(None, description="Date the price was quoted; defaults to today")


class PriceQuoteOut(BaseModel):
    id: int
    price_per_sqft: int
    configuration: str
    quoted_date: date
    is_mine: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


class PriceQuoteSummary(BaseModel):
    quotes: list[PriceQuoteOut]
    count: int


# --- Reviews ---

class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    review_text: str = Field(min_length=1, max_length=5000)


class ReviewOut(BaseModel):
    id: int
    rating: int
    review_text: str
    is_mine: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ReviewSummary(BaseModel):
    reviews: list[ReviewOut]
    count: int
    avg_rating: float | None = None


# --- User Notes ---

class NoteCreate(BaseModel):
    note_text: str = Field(min_length=1, max_length=10000)


class NoteOut(BaseModel):
    note_text: str
    updated_at: datetime
    project_slug: str | None = None

    class Config:
        from_attributes = True


# --- Favorites ---

class FavoriteOut(BaseModel):
    slug: str
    created_at: datetime
