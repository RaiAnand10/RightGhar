from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://rightghar:rightghar_dev@localhost:5432/rightghar"
    # Sync URL for Alembic migrations
    database_url_sync: str = "postgresql+psycopg2://rightghar:rightghar_dev@localhost:5432/rightghar"

    class Config:
        env_file = ".env"


settings = Settings()
