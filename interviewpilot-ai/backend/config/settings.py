from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "InterviewPilot AI"
    environment: str = "development"
    api_prefix: str = "/api/v1"

    database_url: str = "sqlite:///./interviewpilot.db"

    gemini_api_key: str | None = None
    gemini_model: str = "gemini-1.5-flash"
    cors_origins: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
