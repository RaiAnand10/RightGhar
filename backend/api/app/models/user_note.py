import datetime

from sqlalchemy import Integer, ForeignKey, Text, String, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.database import Base


class UserNote(Base):
    __tablename__ = "user_notes"
    __table_args__ = (
        UniqueConstraint("project_id", "user_cookie", name="uq_note_project_user"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_cookie: Mapped[str] = mapped_column(String(36), nullable=False)
    note_text: Mapped[str] = mapped_column(Text, nullable=False)
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
