import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, JSON
from app.core.database import Base


class PermissaoTrabalho(Base):
    """
    Tabela de Permissões de Trabalho (PTs) — Distribuidora Irmãos Barreiro.

    Armazena os 5 tipos de PT:
      - ALTURA
      - ESPACO_CONFINADO
      - ELETRICIDADE
      - TRABALHO_QUENTE
      - QUIMICOS
    """
    __tablename__ = "permissoes_trabalho"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    # Tipo da PT: identifica qual dos 5 formulários foi preenchido
    tipo = Column(String(50), nullable=False, index=True)

    # Número da PT (gerado automaticamente com prefixo + data + sequencial)
    numero_pt = Column(String(30), nullable=True, index=True)

    # Dados do preenchimento serializados como JSON para máxima flexibilidade
    # (cada tipo tem campos diferentes; JSON permite adicionar campos sem migration)
    dados = Column(JSON, nullable=False, default=dict)

    # Responsável pela emissão
    responsavel = Column(String(150), nullable=True)

    # Setor / local do trabalho
    local_trabalho = Column(String(200), nullable=True)

    # Data e hora de início prevista (string ISO para simplicidade)
    data_inicio = Column(String(30), nullable=True)

    # Status: EMITIDA | APROVADA | ENCERRADA | CANCELADA
    status = Column(String(30), default="EMITIDA", nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
