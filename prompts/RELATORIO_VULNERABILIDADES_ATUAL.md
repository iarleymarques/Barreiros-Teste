# Relatório de vulnerabilidades — Distribuidora Irmãos Barreiro

Data da revisão: 10/09/2026  
Método: revisão estática do código-fonte. Este documento não substitui teste de invasão, análise de infraestrutura ou auditoria LGPD.

## Resumo executivo

Foram identificados riscos que podem permitir acesso indevido aos dados pessoais e financeiros cadastrados, comprometimento de autenticação e indisponibilidade do sistema. A prioridade imediata é remover credenciais padrão, introduzir controle de acesso por perfil e limitar tentativas de login.

| ID | Severidade | Situação | Resumo |
| --- | --- | --- | --- |
| VULN-01 | Crítica | Corrigida | Segredo JWT e credenciais de banco não possuem mais valores padrão no código |
| VULN-02 | Crítica | Corrigida | Seed só pode ocorrer explicitamente em desenvolvimento com senha fornecida por variável de ambiente |
| VULN-03 | Alta | Aberta | Não existe autorização por perfil: qualquer usuário autenticado acessa e altera dados de todos |
| VULN-04 | Alta | Corrigida | Login limitado a 5 tentativas por IP a cada 15 minutos |
| VULN-05 | Média | Corrigida | Upload confirma assinatura do arquivo e força download seguro |
| VULN-06 | Média | Corrigida | CORS aceita apenas origens declaradas explicitamente |
| VULN-07 | Média | Corrigida | JWT é enviado por cookie HttpOnly, não por `sessionStorage` |
| VULN-08 | Média | Corrigida | Cadastros públicos possuem limite de 10 envios por IP por hora |
| VULN-09 | Média | Corrigida | Exclusões automáticas de tabelas/colunas foram removidas da inicialização |

## Achados

### VULN-01 — Segredos e acesso ao banco com valores padrão no código

**Evidência:** `backend/app/core/config.py` define valores padrão para `DATABASE_URL` e `SECRET_KEY` diretamente no repositório.

**Impacto:** se o ambiente não sobrescrever essas variáveis, terceiros que conheçam o código podem assinar JWTs válidos e tentar acessar o banco. Como a mesma chave também deriva a chave de criptografia Fernet, a exposição pode afetar dados criptografados em repouso.

**Correção recomendada:** remover todos os valores padrão sensíveis; falhar a inicialização quando `DATABASE_URL` ou `SECRET_KEY` não existirem; gerar segredo longo e aleatório por ambiente; armazenar exclusivamente nos secrets do Railway; rotacionar imediatamente as credenciais e a chave já utilizadas.

### VULN-02 — Criação automática de usuário com senha previsível

**Evidência:** `backend/main.py`, em `init_db()`, cria um usuário padrão com senha conhecida sempre que a tabela de usuários estiver vazia.

**Impacto:** um banco novo ou recriado pode ficar acessível imediatamente por credenciais públicas/previsíveis.

**Correção recomendada:** remover esse seed de produção. Para desenvolvimento, deixá-lo em script separado, condicionado explicitamente a `ENVIRONMENT=development`, com senha aleatória impressa apenas localmente.

### VULN-03 — Ausência de controle de acesso por perfil (RBAC)

**Evidência:** as rotas protegidas verificam apenas `get_current_user`. Endpoints de colaboradores, pessoas jurídicas, diaristas, recibos e documentos aceitam qualquer usuário autenticado, sem verificar dono do cadastro, função ou permissão administrativa.

**Impacto:** qualquer conta válida pode listar, baixar, alterar ou excluir informações de outros usuários, incluindo CPF, RG, dados bancários, PIX e documentos. Isso é especialmente sensível sob LGPD.

**Correção recomendada:** adicionar papéis e permissões (por exemplo, `admin`, `rh`, `financeiro`, `leitura`); associar registros ao usuário/empresa responsável; validar autorização em cada endpoint; aplicar o princípio do menor privilégio; registrar trilha de auditoria de leitura, download, alteração e exclusão.

### VULN-04 — Login sem rate limit ou bloqueio progressivo

**Evidência:** `backend/app/api/v1/endpoints/auth.py` processa login sem limite de tentativas, CAPTCHA, atraso progressivo ou bloqueio temporário.

**Impacto:** credenciais fracas podem ser descobertas por força bruta ou credential stuffing.

**Correção recomendada:** limitar por IP e por conta (por exemplo, 5 tentativas em 15 minutos), usar atraso progressivo, registrar falhas, considerar CAPTCHA após tentativas repetidas e exigir senhas fortes. Monitorar e alertar tentativas anormais.

### VULN-05 — Validação insuficiente de arquivos enviados

**Evidência:** `backend/app/api/v1/endpoints/colaboradores.py` e `documentos_pessoas_juridicas.py` validam principalmente `arquivo.content_type`, que é fornecido pelo cliente. Os arquivos são depois retornados com `Content-Disposition: inline`.

**Impacto:** um atacante autenticado pode enviar conteúdo disfarçado, explorar visualizadores no navegador ou armazenar arquivos indevidos. Há também consumo de memória, pois o arquivo inteiro é lido antes do processamento.

**Correção recomendada:** validar assinatura/magic bytes de PDF/JPEG/PNG no servidor; recodificar imagens; usar antivírus/antimalware; trocar a entrega para `Content-Disposition: attachment`; limitar tamanho no proxy e fazer upload em streaming; manter nomes de arquivo gerados pelo servidor.

### VULN-06 — Política CORS excessivamente ampla

**Evidência:** `backend/main.py` usa `allow_origin_regex=r"https://.*\.up\.railway\.app"` junto de `allow_credentials=True`.

**Impacto:** qualquer aplicação hospedada sob o domínio Railway correspondente ao padrão passa a ser tratada como origem confiável, ampliando a superfície para requisições autenticadas e futuros usos de cookies.

**Correção recomendada:** remover a expressão regular e manter uma lista explícita e mínima de origens de produção e desenvolvimento. Reavaliar `allow_credentials=True` se cookies não forem usados.

### VULN-07 — JWT acessível ao JavaScript do navegador

**Evidência:** `frontend/meu-projeto/src/services/api.js` armazena `token_barreiro` em `sessionStorage`.

**Impacto:** qualquer XSS no mesmo domínio pode extrair o token e utilizá-lo até expirar.

**Correção recomendada:** priorizar cookie `HttpOnly`, `Secure` e `SameSite`; reforçar CSP; evitar inserção de HTML não confiável; reduzir a duração do token e implementar revogação/rotação.

### VULN-08 — Endpoints públicos de cadastro sem defesa contra abuso

**Evidência:** `POST /api/v1/colaboradores` e `POST /api/v1/pessoas-juridicas` não exigem autenticação e não aplicam rate limit ou validações antifraude visíveis.

**Impacto:** automação pode criar registros falsos, aumentar custos e degradar o banco. Como os formulários tratam dados pessoais, também aumenta o risco de uso indevido do fluxo.

**Correção recomendada:** confirmar se o cadastro deve ser público. Se sim, aplicar rate limit, CAPTCHA/desafio, limites por IP, validação de dados e fila/moderação; se não, exigir autenticação.

### VULN-09 — Exclusão automática de tabelas durante inicialização

**Evidência:** `backend/main.py` possui migração executada ao iniciar a aplicação que pode executar `DROP TABLE` em tabelas legadas.

**Impacto:** erro de ambiente ou tabela inesperada pode causar perda de dados e indisponibilidade.

**Correção recomendada:** mover migrações para ferramenta versionada (Alembic), remover comandos destrutivos da inicialização, exigir backup e aprovação explícita para qualquer `DROP`, e executar migrações em pipeline controlado.

## Plano de correção sugerido

1. **Imediato:** rotacionar segredo JWT, credenciais de banco e qualquer senha padrão; remover o seed automático de produção.
2. **Até 7 dias:** implementar RBAC e rate limit no login; restringir CORS às origens exatas.
3. **Até 30 dias:** endurecer uploads, migrar token para cookie `HttpOnly`, criar auditoria e mover migrações para Alembic.
4. **Contínuo:** SAST no CI, atualização de dependências, revisão periódica de permissões e teste de invasão antes de mudanças relevantes.

## Observações

- Há controles positivos já presentes: senhas são hasheadas com bcrypt; JWTs têm expiração; vários dados sensíveis e anexos são criptografados em repouso; uploads possuem tipos e tamanho máximos definidos.
- Criptografia em repouso não substitui autorização adequada: as rotas atualmente descriptografam e retornam dados completos para usuários autenticados sem distinção de perfil.
