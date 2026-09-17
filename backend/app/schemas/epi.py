from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel


class EPICreate(BaseModel):
    descricao: str
    fabricante: Optional[str] = None
    data_fabricacao: Optional[str] = None
    validade_epi: Optional[str] = None
    numero_ca: Optional[str] = None
    validade_ca: Optional[str] = None
    estoque_real: float = 0.0
    estoque_minimo: float = 0.0
    unidade: str = "UN"
    categoria: Optional[str] = "OUTROS"
    observacao: Optional[str] = None


class EPIUpdate(BaseModel):
    descricao: Optional[str] = None
    fabricante: Optional[str] = None
    data_fabricacao: Optional[str] = None
    validade_epi: Optional[str] = None
    numero_ca: Optional[str] = None
    validade_ca: Optional[str] = None
    estoque_real: Optional[float] = None
    estoque_minimo: Optional[float] = None
    unidade: Optional[str] = None
    categoria: Optional[str] = None
    observacao: Optional[str] = None


class EPIOut(BaseModel):
    id: int
    descricao: str
    fabricante: Optional[str] = None
    data_fabricacao: Optional[str] = None
    validade_epi: Optional[str] = None
    numero_ca: Optional[str] = None
    validade_ca: Optional[str] = None
    estoque_real: float
    estoque_minimo: float
    unidade: str
    categoria: Optional[str] = "OUTROS"
    observacao: Optional[str] = None
    situacao: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EntregaEPICreate(BaseModel):
    epi_id: int
    colaborador_nome: str
    colaborador_registro: Optional[str] = None
    setor: Optional[str] = None
    funcao: Optional[str] = None
    local: Optional[str] = None
    cod_epi: Optional[str] = None
    tamanho: Optional[str] = None
    quantidade: float = 1.0
    data_entrega: str
    motivo: str = "A"  # A, P, TR, D, F, DP, MU
    observacao: Optional[str] = None
    termo_assinado: bool = False


class EntregaEPIOut(BaseModel):
    id: str
    epi_id: int
    colaborador_nome: str
    colaborador_registro: Optional[str] = None
    setor: Optional[str] = None
    funcao: Optional[str] = None
    local: Optional[str] = None
    cod_epi: Optional[str] = None
    tamanho: Optional[str] = None
    quantidade: float
    data_entrega: str
    motivo: str
    observacao: Optional[str] = None
    termo_assinado: bool
    created_at: datetime
    epi: Optional[EPIOut] = None

    class Config:
        from_attributes = True


class EntregaEPIUpdate(BaseModel):
    epi_id: Optional[int] = None
    colaborador_nome: Optional[str] = None
    colaborador_registro: Optional[str] = None
    setor: Optional[str] = None
    funcao: Optional[str] = None
    local: Optional[str] = None
    cod_epi: Optional[str] = None
    tamanho: Optional[str] = None
    quantidade: Optional[float] = None
    data_entrega: Optional[str] = None
    motivo: Optional[str] = None
    observacao: Optional[str] = None
    termo_assinado: Optional[bool] = None


class FuncionarioEPICreate(BaseModel):
    nome: str
    funcao: Optional[str] = "Ajudante de Motorista"
    setor: Optional[str] = "Distribuição"
    local: Optional[str] = "Cascavel"
    registro: Optional[str] = None
    data_entrada: Optional[str] = None


class FuncionarioEPIUpdate(BaseModel):
    nome: Optional[str] = None
    funcao: Optional[str] = None
    setor: Optional[str] = None
    local: Optional[str] = None
    registro: Optional[str] = None
    data_entrada: Optional[str] = None


class FuncionarioEPIOut(BaseModel):
    id: str
    nome: str
    funcao: str = "Ajudante de Motorista"
    setor: str = "Distribuição"
    local: str = "Cascavel"
    registro: Optional[str] = None
    data_entrada: Optional[str] = None
    total_epis: int = 0


class ImportacaoResultadoOut(BaseModel):
    total_linhas: int
    inseridos: int
    atualizados: int
    falhas: int
    erros: List[str] = []
    mensagem: str


class PreviewPlanilhaOut(BaseModel):
    total_linhas: int
    colunas: List[str]
    linhas: List[dict]

