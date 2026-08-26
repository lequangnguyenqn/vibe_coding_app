from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Food Expiry Tracker API"
    database_url: str = "postgresql+asyncpg://postgres:postgres@db:5432/food_tracker"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
