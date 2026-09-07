from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class FuncionarioBaseCreate(BaseModel):
    nome: str
    profissao: Optional[str] = None
    tipo_pix: Optional[str] = "cpf"
    chave_pix: Optional[str] = None
    ativo: Optional[bool] = True
    data_entrada: Optional[str] = None

class FuncionarioBaseOut(FuncionarioBaseCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class FuncionarioRegistroCreate(BaseModel):
    nome: str
    funcao: Optional[str] = None
    profissao: Optional[str] = None
    data_entrada: Optional[str] = None

class FuncionarioRegistroOut(BaseModel):
    id: str
    nome: str
    funcao: Optional[str] = None
    profissao: Optional[str] = None
    data_entrada: Optional[str] = None
    total_diarias: int = 0
    total_valor: float = 0.0
    created_at: datetime

    class Config:
        from_attributes = True

class FuncionarioRelatorioDiaria(BaseModel):
    id: str
    data: str
    funcao: Optional[str] = None
    profissao: Optional[str] = None
    valor_diaria: float
    quantidade_diarias: int
    valor_total: float
    pago: bool
    observacoes: Optional[str] = None

class FuncionarioRelatorioOut(BaseModel):
    id: str
    nome: str
    funcao: Optional[str] = None
    profissao: Optional[str] = None
    data_entrada: Optional[str] = None
    total_diarias: int = 0
    total_valor: float = 0.0
    diarias: List[FuncionarioRelatorioDiaria] = []
