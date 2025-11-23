from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "PinkHouse"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # API
    API_PREFIX: str = "/api/v1"
    
    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/pinkhouse"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    CACHE_TTL: int = 3600  # 1 hour
    
    # AI APIs
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    
    # Scraping
    SCRAPER_API_KEY: Optional[str] = None
    SCRAPE_TIMEOUT: int = 30
    SCRAPE_RATE_LIMIT: float = 1.0  # requests per second per site
    
    # OCR
    TESSERACT_CMD: str = "/usr/bin/tesseract"
    OCR_CONFIDENCE_THRESHOLD: float = 0.85
    
    # File upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "/tmp/pinkhouse/uploads"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
