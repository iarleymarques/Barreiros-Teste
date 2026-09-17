from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid


class EPI(Base):
    """
    Modelo para Controle de Estoque Mínimo e Validade de EPIs (NR-6).
    """
    __tablename__ = "epis"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    descricao = Column(String(255), nullable=False, index=True)
    fabricante = Column(String(150), nullable=True)
    data_fabricacao = Column(String(30), nullable=True)  # ex: 2024-01-10 ou texto
    validade_epi = Column(String(30), nullable=True)     # Validade do produto
    numero_ca = Column(String(50), nullable=True, index=True) # Certificado de Aprovação
    validade_ca = Column(String(30), nullable=True)     # Validade do Certificado
    estoque_real = Column(Float, default=0.0, nullable=False)
    estoque_minimo = Column(Float, default=0.0, nullable=False)
    unidade = Column(String(20), default="UN", nullable=False) # UN, PAR, KIT, CX
    categoria = Column(String(50), default="OUTROS", nullable=True) # CABECA_AUDITIVO, OCULAR_FACIAL, LUVAS, CALCADOS, ERGONOMIA, OUTROS
    observacao = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relacionamento com entregas
    entregas = relationship("EntregaEPI", back_populates="epi", cascade="all, delete-orphan")

    @property
    def situacao(self) -> str:
        """
        Retorna 'COMPRAR' se o estoque real estiver igual ou abaixo do estoque mínimo,
        caso contrário 'OK'.
        """
        if (self.estoque_real or 0) <= (self.estoque_minimo or 0):
            return "COMPRAR"
        return "OK"


class EntregaEPI(Base):
    """
    Registro individual de entrega de EPI a colaboradores (NR-6 / Art. 482 CLT).
    """
    __tablename__ = "entregas_epis"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    epi_id = Column(Integer, ForeignKey("epis.id", ondelete="CASCADE"), nullable=False)
    
    # Dados do Colaborador
    colaborador_nome = Column(String(150), nullable=False, index=True)
    colaborador_registro = Column(String(50), nullable=True)  # Matrícula ou CPF
    setor = Column(String(100), nullable=True)
    funcao = Column(String(100), nullable=True)
    local = Column(String(100), nullable=True)
    
    # Dados da Entrega (Conforme Ficha Física - Imagem 2)
    cod_epi = Column(String(20), nullable=True) # Código 1 a 20 da tabela de consulta
    tamanho = Column(String(30), nullable=True) # Ex: M, G, 38, 41
    quantidade = Column(Float, default=1.0, nullable=False)
    data_entrega = Column(String(30), nullable=False)
    
    # Motivo da Entrega:
    # A = Admissão, P = Perda, TR = Necessidade de Troca, D = Demissão, F = Furto, DP = Danos Provocados, MU = Mudança de função
    motivo = Column(String(20), default="A", nullable=False)
    observacao = Column(Text, nullable=True)
    termo_assinado = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    epi = relationship("EPI", back_populates="entregas")
