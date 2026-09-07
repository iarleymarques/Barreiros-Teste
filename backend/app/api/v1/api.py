from fastapi import APIRouter
from app.api.v1.endpoints import auth, colaboradores, funcionarios, diaristas, recibos

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
api_router.include_router(colaboradores.router, prefix="/colaboradores", tags=["Fichas de Colaboradores"])
api_router.include_router(funcionarios.router, prefix="/funcionarios-base", tags=["Catálogo de Funcionários"])
api_router.include_router(diaristas.router, prefix="/diaristas", tags=["Lançamentos de Diaristas"])
api_router.include_router(recibos.router, prefix="/recibos", tags=["Emissão de Recibos"])
