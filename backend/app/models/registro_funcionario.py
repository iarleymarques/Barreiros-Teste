import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from app.core.database import Base

class RegistroFuncionario(Base):
    __tablename__ = "registro_funcionarios"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nome = Column(String(150), index=True, nullable=False)
    funcao = Column(String(100), nullable=True)
    data_entrada = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)