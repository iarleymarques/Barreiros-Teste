from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.encryption import encrypt_val, decrypt_val
from app.models.colaborador import ColaboradorCadastro
from app.models.usuario import Usuario
from app.schemas.colaborador import ColaboradorCreate, ColaboradorOut, StatusUpdate
from app.services.protocolo import gerar_protocolo
from app.api.deps import get_current_user

router = APIRouter()

def _descriptografar_colaborador(col):
    if not col:
        return col
    col.cpf = decrypt_val(col.cpf)
    col.rg = decrypt_val(col.rg)
    col.telefone = decrypt_val(col.telefone)
    col.agencia = decrypt_val(col.agencia)
    col.conta = decrypt_val(col.conta)
    col.chave_pix = decrypt_val(col.chave_pix)
    return col

@router.post("", response_model=ColaboradorOut, status_code=status.HTTP_201_CREATED)
def criar_cadastro_colaborador(dados: ColaboradorCreate, db: Session = Depends(get_db)):
    protocolo = gerar_protocolo()
    agora_str = datetime.now().strftime("%d/%m/%Y %H:%M:%S")

    dados_dict = dados.model_dump()
    # Criptografa dados sensíveis antes de gravar no PostgreSQL
    dados_dict["cpf"] = encrypt_val(dados_dict.get("cpf"))
    dados_dict["rg"] = encrypt_val(dados_dict.get("rg"))
    dados_dict["telefone"] = encrypt_val(dados_dict.get("telefone"))
    dados_dict["agencia"] = encrypt_val(dados_dict.get("agencia"))
    dados_dict["conta"] = encrypt_val(dados_dict.get("conta"))
    dados_dict["chave_pix"] = encrypt_val(dados_dict.get("chave_pix"))

    colaborador = ColaboradorCadastro(
        protocolo=protocolo,
        data_emissao=agora_str,
        **dados_dict
    )
    db.add(colaborador)
    db.commit()
    db.refresh(colaborador)
    return _descriptografar_colaborador(colaborador)

@router.get("", response_model=List[ColaboradorOut])
def listar_colaboradores(
    search: Optional[str] = Query(None, description="Busca por Nome"),
    status: Optional[str] = Query(None, description="Filtro por status (PENDENTE, VALIDADO)"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    query = db.query(ColaboradorCadastro)
    if search:
        termo = f"%{search.strip()}%"
        query = query.filter(ColaboradorCadastro.nome_completo.ilike(termo))
    if status:
        query = query.filter(ColaboradorCadastro.status == status)
    
    lista = query.order_by(ColaboradorCadastro.created_at.desc()).all()
    return [_descriptografar_colaborador(c) for c in lista]

@router.get("/{colaborador_id}", response_model=ColaboradorOut)
def obter_colaborador(
    colaborador_id: str, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    item = db.query(ColaboradorCadastro).filter(ColaboradorCadastro.id == colaborador_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Ficha cadastral não encontrada")
    return _descriptografar_colaborador(item)

@router.patch("/{colaborador_id}/status", response_model=ColaboradorOut)
def atualizar_status(
    colaborador_id: str, 
    payload: StatusUpdate, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    item = db.query(ColaboradorCadastro).filter(ColaboradorCadastro.id == colaborador_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Ficha cadastral não encontrada")
    item.status = payload.status
    db.commit()
    db.refresh(item)
    return _descriptografar_colaborador(item)
