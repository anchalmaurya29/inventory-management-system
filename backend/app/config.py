from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql://inventory_user:inventory_password@localhost:5432/inventory_db"
    frontend_origin: str = "https://inventory-management-system-d2o2.onrender.com"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
