from typing import Any, Dict, Optional
from datetime import datetime
from pydantic import BaseModel, Field


# Tipos de PT aceitos pelo sistema
TIPOS_PT = [
    "ALTURA",
    "ESPACO_CONFINADO",
    "ELETRICIDADE",
    "TRABALHO_QUENTE",
    "QUIMICOS",
]


class PermissaoTrabalhoCreate(BaseModel):
    tipo: str = Field(..., description="Tipo da PT: ALTURA | ESPACO_CONFINADO | ELETRICIDADE | TRABALHO_QUENTE | QUIMICOS")
    numero_pt: Optional[str] = None
    dados: Dict[str, Any] = Field(default_factory=dict, description="Campos dinâmicos do formulário em JSON")
    responsavel: Optional[str] = None
    local_trabalho: Optional[str] = None
    data_inicio: Optional[str] = None
    status: Optional[str] = "EMITIDA"


class PermissaoTrabalhoUpdate(BaseModel):
    dados: Optional[Dict[str, Any]] = None
    responsavel: Optional[str] = None
    local_trabalho: Optional[str] = None
    data_inicio: Optional[str] = None
    status: Optional[str] = None


class PermissaoTrabalhoOut(BaseModel):
    id: str
    tipo: str
    numero_pt: Optional[str] = None
    dados: Dict[str, Any]
    responsavel: Optional[str] = None
    local_trabalho: Optional[str] = None
    data_inicio: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
