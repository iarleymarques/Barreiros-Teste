from typing import Optional
from datetime import datetime
from pydantic import BaseModel

class ReciboCreate(BaseModel):
    diarista_id: Optional[str] = None
    nome_diarista: str
    cpf_diarista: Optional[str] = None
    funcao: Optional[str] = None
    valor_unitario: Optional[float] = None
    dias_trabalhados: Optional[int] = 1
    tem_almoco: Optional[bool] = True
    valor_almoco: Optional[float] = 0.0
    valor_total: float
    valor_extenso: Optional[str] = None
    tipo_pix: Optional[str] = None
    chave_pix: Optional[str] = None
    data_referencia: str
    status_pagamento: bool = True
    observacoes: Optional[str] = ""

class ReciboOut(ReciboCreate):
    id: str
    numero_recibo: str
    valor_extenso: str
    created_at: datetime

    class Config:
        from_attributes = True
