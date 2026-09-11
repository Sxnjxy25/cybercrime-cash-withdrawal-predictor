import os
from pathlib import Path
from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_SQLITE_PATH = BASE_DIR / "cyberpredictx.db"

class Settings(BaseSettings):
    PROJECT_NAME: str = "CYBERPREDICT X"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "cyberpredictx_secure_secret_key_sih_2026_pro_level"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # SQLite default with reliable absolute path, easily switches to PostgreSQL if DATABASE_URL env var set
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_SQLITE_PATH.as_posix()}")

settings = Settings()
