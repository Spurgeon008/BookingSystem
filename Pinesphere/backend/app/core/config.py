from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Database
    DATABASE_URL: str = "postgresql+psycopg2://Manager:Spurgeon1414@localhost:5432/ticket_db"

    # JWT
    SECRET_KEY: str = "change-me-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Redis / Celery
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    # Email (Mailtrap SDK)
    MAILTRAP_API_TOKEN: str = ""
    ADMIN_EMAIL: str = ""
    EMAIL_FROM: str = "noreply@ticketbook.com"
    EMAIL_FROM_NAME: str = "TicketBook"


settings = Settings()