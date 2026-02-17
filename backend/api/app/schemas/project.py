from pydantic import BaseModel


class AmenityOut(BaseModel):
    name: str
    category: str | None = None

    class Config:
        from_attributes = True


class ProjectListItem(BaseModel):
    """Lightweight project data for listing — no content blobs."""

    id: int
    slug: str
    name: str
    builder_name: str
    builder_slug: str
    city_name: str | None = None
    locality_name: str | None = None
    location_text: str | None = None

    configurations: str
    bhk_options: list[int] | None = None
    total_units: int | None = None
    towers: int | None = None
    floors: str | None = None
    area_text: str | None = None
    area_acres: float | None = None
    unit_sizes_text: str | None = None
    unit_size_min: int | None = None
    unit_size_max: int | None = None
    units_per_acre: float | None = None

    price_text: str | None = None
    price_min_cr: float | None = None
    price_max_cr: float | None = None

    possession_text: str | None = None
    possession_year: int | None = None

    rera_number: str | None = None
    rera_registered: bool = False

    clubhouse_text: str | None = None
    open_space_text: str | None = None

    lat: float | None = None
    lng: float | None = None

    builder_url: str | None = None

    class Config:
        from_attributes = True


class ProjectDetail(ProjectListItem):
    """Full project data including content blobs and amenities."""

    clubhouse_sqft: int | None = None
    open_space_pct: float | None = None

    description: str | None = None
    standout_features: str | None = None
    location_highlights: str | None = None

    amenities: list[AmenityOut] = []

    class Config:
        from_attributes = True
