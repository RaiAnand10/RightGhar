import datetime
from decimal import Decimal

from sqlalchemy import String, Integer, ForeignKey, Boolean, Date, Numeric, Text, ARRAY, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    builder_id: Mapped[int] = mapped_column(Integer, ForeignKey("builders.id"), nullable=False)
    locality_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("localities.id"), nullable=True)
    location_text: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Configuration & sizing
    configurations: Mapped[str] = mapped_column(Text, nullable=False)
    bhk_options: Mapped[list[int] | None] = mapped_column(ARRAY(Integer), nullable=True)
    total_units: Mapped[int | None] = mapped_column(Integer, nullable=True)
    towers: Mapped[int | None] = mapped_column(Integer, nullable=True)
    floors: Mapped[str | None] = mapped_column(String(50), nullable=True)
    area_text: Mapped[str | None] = mapped_column(String(100), nullable=True)
    area_acres: Mapped[Decimal | None] = mapped_column(Numeric(8, 2), nullable=True)
    unit_sizes_text: Mapped[str | None] = mapped_column(String(200), nullable=True)
    unit_size_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    unit_size_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    units_per_acre: Mapped[Decimal | None] = mapped_column(Numeric(8, 2), nullable=True)

    # Pricing
    price_text: Mapped[str | None] = mapped_column(String(200), nullable=True)
    price_min_cr: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    price_max_cr: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)

    # Possession
    possession_text: Mapped[str | None] = mapped_column(String(200), nullable=True)
    possession_date: Mapped[datetime.date | None] = mapped_column(Date, nullable=True)
    possession_year: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Regulatory
    rera_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    rera_registered: Mapped[bool] = mapped_column(Boolean, default=False)

    # Community
    clubhouse_text: Mapped[str | None] = mapped_column(String(200), nullable=True)
    clubhouse_sqft: Mapped[int | None] = mapped_column(Integer, nullable=True)
    open_space_text: Mapped[str | None] = mapped_column(String(100), nullable=True)
    open_space_pct: Mapped[Decimal | None] = mapped_column(Numeric(5, 2), nullable=True)

    # Geo
    lat: Mapped[Decimal | None] = mapped_column(Numeric(10, 7), nullable=True)
    lng: Mapped[Decimal | None] = mapped_column(Numeric(10, 7), nullable=True)

    # Content blobs
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    standout_features: Mapped[str | None] = mapped_column(Text, nullable=True)
    location_highlights: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Links
    builder_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Housekeeping
    status: Mapped[str] = mapped_column(String(50), default="active")
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    builder: Mapped["Builder"] = relationship(back_populates="projects")
    locality: Mapped["Locality | None"] = relationship(back_populates="projects")
    amenities: Mapped[list["Amenity"]] = relationship(
        secondary="project_amenities", lazy="selectin"
    )
