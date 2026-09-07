from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, create_access_token
from app.models.usuario import Usuario
from app.schemas.auth import LoginRequest, Token, UserOut
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    email_clean = login_data.email.strip()
    user = db.query(Usuario).filter(Usuario.email.ilike(email_clean)).first()
    
    # Resposta idêntica para usuário não encontrado ou senha inválida (evita enumeração)
    credenciais_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciais inválidas. Verifique seu e-mail e senha.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not user:
        raise credenciais_invalidas
    
    if not verify_password(login_data.senha, user.senha):
        raise credenciais_invalidas
            
    access_token = create_access_token(subject=user.id)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserOut.model_validate(user)
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: Usuario = Depends(get_current_user)):
    return current_user
