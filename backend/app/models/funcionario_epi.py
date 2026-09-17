import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer
from app.core.database import Base


class FuncionarioEPI(Base):
    """
    Tabela EXCLUSIVA do módulo de Controle de EPIs (NR-6).
    Completamente separada de funcionarios_base, registro_funcionarios
    e pessoas_fisicas_cadastros. Não mistura dados de outros módulos.
    """
    __tablename__ = "funcionarios_epis"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    nome = Column(String(150), nullable=False, index=True)
    funcao = Column(String(100), nullable=True, default="Ajudante de Motorista")
    setor = Column(String(100), nullable=True, default="Distribuição")
    local = Column(String(100), nullable=True, default="Cascavel")
    registro = Column(String(50), nullable=True)   # Matrícula/CPF para constar na ficha PDF
    data_entrada = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
