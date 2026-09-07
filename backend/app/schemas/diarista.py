from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class DiaristaCreate(BaseModel):
    funcionario_id: Optional[str] = None
    nome: str
    profissao: Optional[str] = None
    data: str  # ISO YYYY-MM-DD
    valor_diaria: float
    quantidade_diarias: int = 1
    tipo_pix: str = "cpf"
    chave_pix: str
    observacoes: Optional[str] = ""
    pago: bool = False

class DiaristaUpdate(BaseModel):
    nome: Optional[str] = None
    profissao: Optional[str] = None
    data: Optional[str] = None
    valor_diaria: Optional[float] = None
    quantidade_diarias: Optional[int] = None
    tipo_pix: Optional[str] = None
    chave_pix: Optional[str] = None
    observacoes: Optional[str] = None
    pago: Optional[bool] = None

class DiaristaOut(DiaristaCreate):
    id: str
    valor_total: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
