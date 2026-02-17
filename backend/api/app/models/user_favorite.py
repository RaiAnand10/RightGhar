import datetime

from sqlalchemy import String, DateTime, PrimaryKeyConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database import Base


class UserFavorite(Base):
    __tablename__ = "user_favorites"
    __table_args__ = (
        PrimaryKeyConstraint("user_cookie", "project_slug"),
    )

    user_cookie: Mapped[str] = mapped_column(String(36), nullable=False)
    project_slug: Mapped[str] = mapped_column(String(150), nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
