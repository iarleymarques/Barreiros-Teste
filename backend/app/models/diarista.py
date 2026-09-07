import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, ForeignKey
from app.core.database import Base

class DiaristaLancamento(Base):
    __tablename__ = "diaristas_lancamentos"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    funcionario_id = Column(String, ForeignKey("funcionarios_base.id"), nullable=True)
    nome = Column(String(150), index=True, nullable=False)
    profissao = Column(String(100), nullable=True)
    data = Column(String(10), index=True, nullable=False)  # ISO Date YYYY-MM-DD
    valor_diaria = Column(Float, nullable=False)
    quantidade_diarias = Column(Integer, default=1)
    valor_total = Column(Float, nullable=False)
    tipo_pix = Column(String(30), default="cpf")
    chave_pix = Column(Text, nullable=False)
    observacoes = Column(Text, nullable=True)
    pago = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
