from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.permissao_trabalho import PermissaoTrabalho
from app.models.usuario import Usuario
from app.schemas.permissao_trabalho import (
    PermissaoTrabalhoCreate,
    PermissaoTrabalhoUpdate,
    PermissaoTrabalhoOut,
    TIPOS_PT,
)
from app.api.deps import get_current_user
import uuid

router = APIRouter()


def _gerar_numero_pt(tipo: str, db: Session) -> str:
    """Gera número sequencial automático no formato PT-TIPO-AAAAMMDD-NNNN."""
    hoje = datetime.utcnow().strftime("%Y%m%d")
    prefixo_map = {
        "ALTURA": "ALT",
        "ESPACO_CONFINADO": "ESC",
        "ELETRICIDADE": "ELE",
        "TRABALHO_QUENTE": "QTE",
        "QUIMICOS": "QUI",
    }
    prefixo = prefixo_map.get(tipo, "PT")
    # Conta quantas PTs deste tipo foram criadas hoje
    count = (
        db.query(PermissaoTrabalho)
        .filter(
            PermissaoTrabalho.tipo == tipo,
            PermissaoTrabalho.numero_pt.like(f"PT-{prefixo}-{hoje}-%"),
        )
        .count()
    )
    seq = str(count + 1).zfill(4)
    return f"PT-{prefixo}-{hoje}-{seq}"


@router.get("", response_model=List[PermissaoTrabalhoOut])
def listar_pts(
    tipo: Optional[str] = Query(None, description="Filtrar por tipo de PT"),
    status: Optional[str] = Query(None, description="Filtrar por status"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Lista todas as Permissões de Trabalho, com filtros opcionais."""
    query = db.query(PermissaoTrabalho)
    if tipo:
        query = query.filter(PermissaoTrabalho.tipo == tipo.upper())
    if status:
        query = query.filter(PermissaoTrabalho.status == status.upper())
    return query.order_by(PermissaoTrabalho.created_at.desc()).all()


@router.get("/{pt_id}", response_model=PermissaoTrabalhoOut)
def obter_pt(
    pt_id: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Retorna uma PT específica pelo ID."""
    pt = db.query(PermissaoTrabalho).filter(PermissaoTrabalho.id == pt_id).first()
    if not pt:
        raise HTTPException(status_code=404, detail="Permissão de Trabalho não encontrada")
    return pt


@router.post("", response_model=PermissaoTrabalhoOut, status_code=status.HTTP_201_CREATED)
def criar_pt(
    dados: PermissaoTrabalhoCreate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Cria uma nova Permissão de Trabalho."""
    tipo_upper = dados.tipo.upper()
    if tipo_upper not in TIPOS_PT:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo inválido. Use um dos seguintes: {', '.join(TIPOS_PT)}",
        )

    numero_pt = dados.numero_pt or _gerar_numero_pt(tipo_upper, db)

    pt = PermissaoTrabalho(
        id=str(uuid.uuid4()),
        tipo=tipo_upper,
        numero_pt=numero_pt,
        dados=dados.dados,
        responsavel=dados.responsavel,
        local_trabalho=dados.local_trabalho,
        data_inicio=dados.data_inicio,
        status=dados.status or "EMITIDA",
    )
    db.add(pt)
    db.commit()
    db.refresh(pt)
    return pt


@router.put("/{pt_id}", response_model=PermissaoTrabalhoOut)
def atualizar_pt(
    pt_id: str,
    dados: PermissaoTrabalhoUpdate,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Atualiza campos de uma PT existente."""
    pt = db.query(PermissaoTrabalho).filter(PermissaoTrabalho.id == pt_id).first()
    if not pt:
        raise HTTPException(status_code=404, detail="Permissão de Trabalho não encontrada")

    updates = dados.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(pt, field, value)
    pt.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(pt)
    return pt


@router.patch("/{pt_id}/status", response_model=PermissaoTrabalhoOut)
def atualizar_status_pt(
    pt_id: str,
    novo_status: str = Query(..., description="Novo status: EMITIDA | APROVADA | ENCERRADA | CANCELADA"),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Atualiza apenas o status de uma PT."""
    status_validos = ["EMITIDA", "APROVADA", "ENCERRADA", "CANCELADA"]
    if novo_status.upper() not in status_validos:
        raise HTTPException(
            status_code=400,
            detail=f"Status inválido. Use: {', '.join(status_validos)}",
        )
    pt = db.query(PermissaoTrabalho).filter(PermissaoTrabalho.id == pt_id).first()
    if not pt:
        raise HTTPException(status_code=404, detail="Permissão de Trabalho não encontrada")
    pt.status = novo_status.upper()
    pt.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(pt)
    return pt


@router.delete("/{pt_id}")
def deletar_pt(
    pt_id: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Remove permanentemente uma PT."""
    pt = db.query(PermissaoTrabalho).filter(PermissaoTrabalho.id == pt_id).first()
    if not pt:
        raise HTTPException(status_code=404, detail="Permissão de Trabalho não encontrada")
    db.delete(pt)
    db.commit()
    return {"message": f"PT {pt.numero_pt} removida com sucesso"}
