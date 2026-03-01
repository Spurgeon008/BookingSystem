from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    
    DATABASE_URL: str = ""

    
    SECRET_KEY: str = ""
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    SMTP_EMAIL: str = ""
    SMTP_PASS: str = ""

    
    ADMIN_EMAIL: str = ""


settings = Settings()
