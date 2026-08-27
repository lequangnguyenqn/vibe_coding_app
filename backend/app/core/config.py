from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Food Expiry Tracker API"
    database_url: str = "postgresql+asyncpg://postgres:postgres@db:5432/food_tracker"
    jwt_secret_key: str = "change-me-in-production-with-at-least-32-bytes"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    resend_api_key: str = ""
    resend_from_email: str = "Food Expiry Tracker <onboarding@resend.dev>"
    resend_to_emails: str = ""
    expiry_alert_days: int = 7

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
