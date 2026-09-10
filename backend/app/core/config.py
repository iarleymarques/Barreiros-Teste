import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Distribuidora Irmãos Barreiro - Backend API"
    API_V1_STR: str = "/api/v1"
    
    # URL do Banco de Dados PostgreSQL (pgAdmin 4 - Banco 'Barreiro')
    DATABASE_URL: str
    
    # Autenticação JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480  # 8 horas
    ENVIRONMENT: str = "production"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
