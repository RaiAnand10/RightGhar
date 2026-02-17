from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://rightghar:rightghar_dev@localhost:5432/rightghar"
    # Sync URL for Alembic migrations
    database_url_sync: str = "postgresql+psycopg2://rightghar:rightghar_dev@localhost:5432/rightghar"

    # Azure OpenAI settings
    AZURE_OPENAI_ENDPOINT: str = ""
    AZURE_OPENAI_KEY: str = ""
    AZURE_OPENAI_DEPLOYMENT: str = "gpt-4o"
    AZURE_OPENAI_API_VERSION: str = "2024-12-01-preview"

    class Config:
        env_file = ".env"


settings = Settings()
