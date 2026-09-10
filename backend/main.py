import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text, func
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.core.security import get_password_hash
from app.core.encryption import encrypt_val
from app.api.v1.api import api_router
from app.models import (
    Usuario, 
    FuncionarioBase, 
    RegistroFuncionario, 
    DiaristaLancamento, 
    Recibo, 
    ColaboradorCadastro,
    DocumentoColaborador,
    PessoaJuridicaCadastro,
    DocumentoPessoaJuridica
)

# Inicializa as tabelas no banco de dados PostgreSQL (Barreiro) automaticamente na inicialização
def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        
        # Garante compatibilidade de tamanho para campos criptografados
        with engine.connect() as conn:
            migration_sqls = [
                "ALTER TABLE pessoas_fisicas_cadastros ALTER COLUMN cpf TYPE TEXT;",
                "ALTER TABLE pessoas_fisicas_cadastros ALTER COLUMN rg TYPE TEXT;",
                "ALTER TABLE pessoas_fisicas_cadastros ALTER COLUMN telefone TYPE TEXT;",
                "ALTER TABLE pessoas_fisicas_cadastros ALTER COLUMN agencia TYPE TEXT;",
                "ALTER TABLE pessoas_fisicas_cadastros ALTER COLUMN conta TYPE TEXT;",
                "ALTER TABLE pessoas_fisicas_cadastros ALTER COLUMN agencia DROP NOT NULL;",
                "ALTER TABLE pessoas_fisicas_cadastros ALTER COLUMN conta DROP NOT NULL;",
                "ALTER TABLE pessoas_fisicas_cadastros ALTER COLUMN chave_pix TYPE TEXT;",
                "ALTER TABLE funcionarios_base ALTER COLUMN chave_pix TYPE TEXT;",
                "ALTER TABLE diaristas_lancamentos ALTER COLUMN chave_pix TYPE TEXT;",
                "ALTER TABLE recibos ALTER COLUMN cpf_diarista TYPE TEXT;",
                "ALTER TABLE recibos ALTER COLUMN chave_pix TYPE TEXT;",
                "ALTER TABLE funcionarios_base ADD COLUMN IF NOT EXISTS data_entrada VARCHAR(20);",
                """
                DO $$
                BEGIN
                    IF to_regclass('public.colaboradores_cadastros') IS NOT NULL THEN
                        -- Preserva exclusivamente o cadastro solicitado e seus anexos.
                        INSERT INTO pessoas_fisicas_cadastros
                        SELECT * FROM colaboradores_cadastros
                        WHERE nome_completo ILIKE '%PEDRO ALCANTRA%'
                        ON CONFLICT (id) DO NOTHING;

                        IF to_regclass('public.documentos_colaboradores') IS NOT NULL THEN
                            INSERT INTO documentos_pessoas_fisicas
                            SELECT d.* FROM documentos_colaboradores d
                            INNER JOIN colaboradores_cadastros c ON c.id = d.colaborador_id
                            WHERE c.nome_completo ILIKE '%PEDRO ALCANTRA%'
                            ON CONFLICT (id) DO NOTHING;
                            DROP TABLE documentos_colaboradores;
                        END IF;

                        DROP TABLE colaboradores_cadastros;
                    END IF;
                END $$;
                """,
                """
                CREATE TABLE IF NOT EXISTS registro_funcionarios (
                    id VARCHAR PRIMARY KEY,
                    nome VARCHAR(150) NOT NULL,
                    funcao VARCHAR(100),
                    data_entrada VARCHAR(20),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
                """,
                """
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1 FROM information_schema.columns 
                        WHERE table_name='registro_funcionarios' AND column_name='profissao'
                    ) THEN
                        UPDATE registro_funcionarios 
                        SET funcao = COALESCE(NULLIF(funcao, ''), profissao)
                        WHERE funcao IS NULL OR funcao = '';
                        
                        ALTER TABLE registro_funcionarios DROP COLUMN profissao;
                    END IF;
                END $$;
                """
            ]
            for sql in migration_sqls:
                try:
                    conn.execute(text(sql))
                except Exception as ex:
                    print(f"Migration notice: {ex}")
            conn.commit()
        
        # Carga inicial (seed) apenas se não houver nenhum usuário
        db = SessionLocal()
        try:
            # Usuário Padrão para Login com Senha Hashada (BCrypt) caso o banco seja 100% novo
            if db.query(Usuario).count() == 0:
                user_padrao = Usuario(
                    email="colaborador@irmaosbarreiro.com.br",
                    senha=get_password_hash("123")
                )
                db.add(user_padrao)
                db.commit()
                print("SEED: Usuário padrão criado com senha criptografada (BCrypt)!")
        finally:
            db.close()
    except Exception as e:
        print(f"Aviso ao inicializar DB: {e}")

# Executa criação de tabelas e seeds
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API RESTful oficial da Distribuidora Irmãos Barreiro com criptografia de dados sensíveis e conectada ao PostgreSQL (Barreiro).",
    version="1.0.0"
)

# Configuração flexível e segura de CORS para comunicação com o Frontend
env_origins = os.getenv("ALLOWED_ORIGINS", "")
custom_origins = [o.strip() for o in env_origins.split(",") if o.strip()]
ALLOWED_ORIGINS = list(set([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://distribuidorairmaosbarreiros.up.railway.app"
] + custom_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.up\.railway\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclui os roteadores da API v1
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {
        "empresa": "Distribuidora Irmãos Barreiro",
        "status": "online",
        "banco_de_dados": "PostgreSQL (Barreiro)",
        "criptografia": "BCrypt (senhas) & AES-128/Fernet (dados sensíveis)",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "database": "connected", "encryption": "active"}
