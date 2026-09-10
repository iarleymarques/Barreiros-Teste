import uuid
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, LargeBinary, String, UniqueConstraint

from app.core.database import Base


class DocumentoColaborador(Base):
    __tablename__ = "documentos_colaboradores"
    __table_args__ = (
        UniqueConstraint("colaborador_id", "tipo_documento", name="uq_documento_por_slot"),
    )

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    colaborador_id = Column(String, ForeignKey("colaboradores_cadastros.id", ondelete="CASCADE"), nullable=False, index=True)
    tipo_documento = Column(String(50), nullable=False)
    nome_arquivo = Column(String(255), nullable=False)
    content_type = Column(String(100), nullable=False)
    tamanho_bytes = Column(Integer, nullable=False)
    arquivo = Column(LargeBinary, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
