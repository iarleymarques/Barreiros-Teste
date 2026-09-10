from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PessoaJuridicaCreate(BaseModel):
    razao_social: str
    nome_fantasia: Optional[str] = None
    cnpj: str
    endereco_pj: Optional[str] = None
    tipo_alvara: Optional[str] = None
    numero_alvara: Optional[str] = None
    inscricao_municipal: Optional[str] = None
    inscricao_imobiliaria: Optional[str] = None
    inscricao_estadual: Optional[str] = None
    porte: Optional[str] = None
    horario_funcionamento: Optional[str] = None
    socio_administrador: Optional[str] = None
    categoria_atuacao: Optional[str] = None
    regime_tributacao: Optional[str] = None
    atividade_principal: Optional[str] = None
    atividade_secundaria: Optional[str] = None
    area_instalacoes: Optional[str] = None
    validade_alvara: Optional[str] = None
    data_emissao_alvara: Optional[str] = None
    codigo_validacao: Optional[str] = None
    email: Optional[str] = None
    telefone: Optional[str] = None
    cep: Optional[str] = None
    logradouro: Optional[str] = None
    numero: Optional[str] = None
    complemento: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    banco: Optional[str] = None
    outro_banco: Optional[str] = None
    tipo_conta: Optional[str] = None
    agencia: Optional[str] = None
    conta: Optional[str] = None
    tipo_pix: Optional[str] = None
    chave_pix: Optional[str] = None
    cargo: Optional[str] = None
    outro_cargo: Optional[str] = None
    unidade: Optional[str] = None
    turno: Optional[str] = None
    sede: Optional[str] = None
    aceitou_termos: bool = True


class PessoaJuridicaOut(PessoaJuridicaCreate):
    id: str
    protocolo: str
    created_at: datetime

    class Config:
        from_attributes = True
