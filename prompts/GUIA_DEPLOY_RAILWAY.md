# 🚂 Guia Definitivo de Deploy no Railway — Distribuidora Irmãos Barreiro

Este guia fornece o passo a passo completo, detalhado e prático para hospedar todo o sistema (**Banco de Dados PostgreSQL**, **Backend FastAPI** e **Frontend React/Vite**) na plataforma em nuvem **Railway**.

---

## 🏗️ 1. Visão Geral da Arquitetura no Railway

No Railway, você criará um **único projeto** contendo 3 serviços conectados:

```text
┌─────────────────────────────────────────────────────────────┐
│                    PROJETO NO RAILWAY                       │
│                                                             │
│   ┌──────────────────┐               ┌──────────────────┐   │
│   │   PostgreSQL     │◄──────────────┤ Backend FastAPI  │   │
│   │  (Plugin Nativo) │ DATABASE_URL  │   (Python 3.11)  │   │
│   └──────────────────┘               └────────▲─────────┘   │
│                                               │             │
│                                          VITE_API_URL       │
│                                               │             │
│                                      ┌────────┴─────────┐   │
│                                      │  Frontend React  │   │
│                                      │  (Vite Preview)  │   │
│                                      └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ 2. Alterações Realizadas no Projeto para o Railway

Para que o deploy funcione sem fricção e de forma automatizada, foram criados os seguintes arquivos no repositório:

1. **`backend/requirements.txt`**:
   - Contém todas as dependências do FastAPI, Uvicorn, SQLAlchemy, Psycopg2, BCrypt e criptografia sem referências locais.
2. **`backend/Procfile`**:
   - Informa ao Railway exatamente como iniciar a aplicação:
     `web: uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}`
3. **`backend/Dockerfile`**:
   - Container Docker padrão com Debian slim e suporte a compiladores de banco (`libpq-dev`), garantindo 100% de confiabilidade no build.
4. **`backend/main.py`**:
   - Atualizado para ler dinamicamente a variável de ambiente `ALLOWED_ORIGINS`, permitindo que você informe a URL do frontend sem alterar o código.
5. **`frontend/meu-projeto/src/services/api.js`**:
   - Atualizado para ler a variável `import.meta.env.VITE_API_URL`, conectando-se automaticamente à API de produção do Railway.
6. **`frontend/meu-projeto/package.json`**:
   - Adicionado o script `"start": "vite preview --host 0.0.0.0 --port ${PORT:-5173}"` para servir o site em produção.

---

## 🚀 3. Passo a Passo do Deploy no Railway

### Passo 1: Criar o Projeto e o Banco de Dados
1. Acesse **[railway.com](https://railway.com)** e faça login com sua conta (recomendado via GitHub).
2. Clique no botão **"New Project"**.
3. Selecione a opção **"Provision PostgreSQL"**.
4. O Railway criará o banco de dados em segundos.
5. *(Opcional)* Clique no card do PostgreSQL -> aba **"Variables"** e observe a variável `DATABASE_URL` (o backend se conectará nela automaticamente).

---

### Passo 2: Subir o Serviço de Backend (FastAPI)
1. No mesmo painel do projeto, clique no botão **"+ New"** (ou aperte `Ctrl + K` / `Cmd + K`).
2. Selecione **"GitHub Repo"** e escolha o repositório do projeto **`SITE - IRMÃOS BARREIROS`**.
3. Assim que o card do serviço for criado, clique nele e vá até a aba **"Settings"**:
   - Em **Service Name**, você pode renomear para `backend`.
   - Em **Root Directory**, clique em "Edit" e digite: `/backend` e clique em **Save**.
4. Agora vá até a aba **"Variables"** e adicione as seguintes variáveis de ambiente:

| Variável | Valor Recomendado | O que faz |
|---|---|---|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` *(ou selecione a referência do banco)* | Conexão automática com o PostgreSQL |
| `SECRET_KEY` | `irmaos_barreiro_prod_2026_chave_secreta_jwt_longa_e_segura` | Chave de assinatura dos tokens de autenticação |
| `ALGORITHM` | `HS256` | Algoritmo do JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `480` | Validade do login (8 horas) |
| `ALLOWED_ORIGINS` | `http://localhost:5173` *(atualizaremos no Passo 4 com a URL do frontend)* | Origens autorizadas para o CORS |

5. Gere um domínio público para o Backend:
   - Ainda no card do backend, vá na aba **"Settings"** -> role até a seção **"Networking"**.
   - Clique no botão **"Generate Domain"**.
   - O Railway gerará um endereço público seguro com HTTPS, por exemplo:  
     `https://backend-production-xxxx.up.railway.app`
   - **Copie essa URL**, pois vamos usá-la no frontend!

---

### Passo 3: Subir o Serviço de Frontend (React / Vite)
1. No mesmo painel do Railway, clique novamente em **"+ New"**.
2. Selecione **"GitHub Repo"** e selecione o **mesmo repositório**.
3. Clique no novo card criado e vá até a aba **"Settings"**:
   - Em **Service Name**, renomeie para `frontend`.
   - Em **Root Directory**, clique em "Edit" e digite: `/frontend/meu-projeto` e clique em **Save**.
   - Em **Build Command**, o Railway detectará automaticamente `npm run build`.
   - Em **Start Command**, digite: `npm run start` (ou `vite preview --host 0.0.0.0 --port $PORT`).
4. Vá até a aba **"Variables"** e adicione:

| Variável | Valor |
|---|---|
| `VITE_API_URL` | `https://backend-production-xxxx.up.railway.app/api/v1` |

> ⚠️ **IMPORTANTE:** Substitua pelo domínio real gerado no Passo 2 e certifique-se de incluir `/api/v1` no final!

5. Gere o domínio público para o Frontend:
   - Vá na aba **"Settings"** -> seção **"Networking"**.
   - Clique em **"Generate Domain"**.
   - O Railway gerará o link público do seu site, por exemplo:  
     `https://frontend-production-yyyy.up.railway.app`
   - **Copie essa URL!**

---

### Passo 4: Conectar o CORS do Backend ao Frontend
Agora que o frontend possui uma URL pública na internet:
1. Clique novamente no card do **`backend`**.
2. Vá até a aba **"Variables"**.
3. Edite a variável **`ALLOWED_ORIGINS`** e coloque a URL do frontend gerada no Passo 3:
   ```env
   ALLOWED_ORIGINS=https://frontend-production-yyyy.up.railway.app
   ```
4. O Railway detectará a alteração e reiniciará o backend em menos de 15 segundos.

---

### Passo 5: Inicialização e Primeiro Acesso

O backend foi programado com migração e seed automáticos (`init_db()`):
- No primeiro boot, ele cria automaticamente todas as tabelas no PostgreSQL do Railway.
- Ele cria o usuário de acesso inicial com senha criptografada via BCrypt:
  - **E-mail:** `colaborador@irmaosbarreiro.com.br`
  - **Senha inicial:** `123`

Abra a URL pública do seu frontend no navegador:
1. Acesse `https://frontend-production-yyyy.up.railway.app`.
2. Faça o login com o e-mail e senha padrão.
3. Teste o lançamento de diárias, visualização de colaboradores, geração de recibos e os relatórios em PDF diários e mensais da aba **Solar**.

---

## 🌐 4. (Opcional) Usando seu Próprio Domínio (ex: `irmaosbarreiro.com.br`)

Se a empresa possuir um domínio próprio (ex: Registro.br, GoDaddy, Hostinger, Cloudflare):
1. No card do **`frontend`** no Railway, em **"Networking"**, clique em **"Custom Domain"**.
2. Digite seu domínio (ex: `app.irmaosbarreiro.com.br` ou `www.irmaosbarreiro.com.br`).
3. O Railway fornecerá um registro `CNAME` para você cadastrar no seu gerenciador de DNS.
4. No card do **`backend`**, você pode adicionar `api.irmaosbarreiro.com.br`.
5. Basta atualizar a variável `ALLOWED_ORIGINS` no backend e `VITE_API_URL` no frontend para refletir seu domínio corporativo! O Railway gera e renova os certificados SSL (HTTPS) gratuitamente de forma automática.

---

## 📋 Resumo das Variáveis de Ambiente no Railway

### No Serviço `backend`:
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
SECRET_KEY=sua_chave_secreta_super_segura_de_producao
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
ALLOWED_ORIGINS=https://seu-frontend.up.railway.app
```

### No Serviço `frontend`:
```env
VITE_API_URL=https://seu-backend.up.railway.app/api/v1
```

---
*Tudo pronto para publicação! Seu sistema funcionará com alta disponibilidade, banco de dados gerenciado, HTTPS automático e total segurança.*
