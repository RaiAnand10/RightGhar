from sqlalchemy import String, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Locality(Base):
    __tablename__ = "localities"
    __table_args__ = (UniqueConstraint("name", "city_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    city_id: Mapped[int] = mapped_column(Integer, ForeignKey("cities.id"), nullable=False)

    city: Mapped["City"] = relationship(back_populates="localities")
    projects: Mapped[list["Project"]] = relationship(back_populates="locality")
