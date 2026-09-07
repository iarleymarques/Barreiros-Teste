import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text
from app.core.database import Base

class FuncionarioBase(Base):
    __tablename__ = "funcionarios_base"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nome = Column(String(150), index=True, nullable=False)
    profissao = Column(String(100), nullable=True)
    tipo_pix = Column(String(30), default="cpf")
    chave_pix = Column(Text, nullable=True)
    ativo = Column(Boolean, default=True)
    data_entrada = Column(String(20), nullable=True) # Data de admissao/inicio na empresa (ex: 2026-02-07 ou 07/02/2026)
    created_at = Column(DateTime, default=datetime.utcnow)
