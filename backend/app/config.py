"""Environment-driven settings for LeaseLens backend."""
from __future__ import annotations

import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    llm_api_key: str = ""
    llm_base_url: str = "https://api.openai.com/v1"
    llm_model: str = "gpt-4o-mini"
    llm_timeout_seconds: int = 45
    llm_max_retries: int = 1

    max_upload_mb: int = 10
    max_pdf_pages: int = 30
    max_text_chars: int = 60000

    allowed_origins: str = "http://localhost:5173,http://localhost:3000"
    demo_fallback_enabled: bool = True
    fuzzy_quote_threshold: int = 90

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


settings = Settings()
