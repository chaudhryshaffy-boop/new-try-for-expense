from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl
from typing import Optional
import os


class Settings(BaseSettings):
	model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, env_file_encoding="utf-8")

	PROJECT_NAME: str = "Finance API"
	ENV: str = os.getenv("ENV", "development")
	TESTING: bool = os.getenv("TESTING", "0") == "1"

	API_V1_PREFIX: str = "/api"
	BACKEND_CORS_ORIGINS: list[AnyHttpUrl] | list[str] = [
		"http://localhost:5173",
		"http://127.0.0.1:5173",
	]

	DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+pysqlite:///./finance.db")

	SUPABASE_JWT_SECRET: Optional[str] = os.getenv("SUPABASE_JWT_SECRET")
	SUPABASE_JWKS_URL: Optional[str] = os.getenv("SUPABASE_JWKS_URL")

	OPENAI_API_KEY: Optional[str] = os.getenv("OPENAI_API_KEY")


settings = Settings()