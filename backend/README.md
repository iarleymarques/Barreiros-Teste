# Especificação e Planejamento do Backend
**Distribuidora Irmãos Barreiro**

Consulte o arquivo principal na raiz do projeto: [PLANO_DESENVOLVIMENTO_BACKEND.md](../PLANO_DESENVOLVIMENTO_BACKEND.md)

## Resumo Rápido de Instalação e Configuração

### Stack Recomendada (FastAPI / Python)
1. **Ativar o Ambiente Virtual**:
   ```bash
   # Windows (PowerShell)
   .\.venv\Scripts\Activate.ps1
   ```

2. **Instalar Dependências**:
   ```bash
   pip install fastapi "uvicorn[standard]" sqlalchemy alembic pydantic pydantic-settings python-jose[cryptography] passlib[bcrypt] num2words python-multipart
   ```

3. **Estrutura de Pastas Esperada**:
   - `app/api/v1/endpoints/`: Controladores/Rotas da API (`auth.py`, `colaboradores.py`, `diaristas.py`, `funcionarios.py`, `recibos.py`)
   - `app/models/`: Entidades relacionais SQLAlchemy (`usuario`, `colaborador`, `funcionario`, `diarista`, `recibo`)
   - `app/schemas/`: Schemas de entrada e saída Pydantic
   - `app/main.py`: Ponto de entrada do servidor ASGI com suporte a CORS (`http://localhost:5173`)

4. **Execução em Desenvolvimento**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
