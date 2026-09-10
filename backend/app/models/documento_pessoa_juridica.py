import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, ForeignKey, Integer, LargeBinary, String, UniqueConstraint

from app.core.database import Base


class DocumentoPessoaJuridica(Base):
    __tablename__ = "documentos_pessoas_juridicas"
    __table_args__ = (UniqueConstraint("pessoa_juridica_id", "posicao", name="uq_documento_pj_posicao"),)

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    pessoa_juridica_id = Column(String, ForeignKey("pessoas_juridicas_cadastros.id"), nullable=False, index=True)
    posicao = Column(Integer, nullable=False)
    nome_arquivo = Column(String(255), nullable=False)
    content_type = Column(String(100), nullable=False)
    tamanho_bytes = Column(Integer, nullable=False)
    arquivo = Column(LargeBinary, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
