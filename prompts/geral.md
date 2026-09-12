# ESPECIFICAÇÃO GERAL DO PROJETO - SOLAR COCA-COLA

## 1. Visão Geral do Sistema
O **Portal de Cadastro Solar Coca-Cola** é uma aplicação web corporativa destinada ao onboarding, coleta e validação cadastral de colaboradores da Solar Coca-Cola (com foco inicial na unidade de Cascavel - CE e expansão regional). 

O sistema substitui formulários manuais por um fluxo digital seguro, intuitivo e moderno, que ao final do processo gera automaticamente um **Recibo / Comprovante Oficial de Cadastro em PDF** padronizado com a identidade visual da Solar.

----

## 2. Perfis de Usuário (Controle de Acesso)
1. **Colaborador / Novo Colaborador**:
   - Cria conta ou acessa o portal com credenciais (E-mail e Senha).
   - Preenche e atualiza seus dados cadastrais através de um formulário interativo guiado (passo a passo).
   - Revisa as informações, aceita os termos da LGPD e baixa o Comprovante/Recibo em PDF.
2. **Administrador / Recursos Humanos (RH)**:
   - Acesso a um painel de gestão exclusivo.
   - Consulta e busca de colaboradores por CPF, Nome, Setor ou Data.
   - Visualização e download dos comprovantes em PDF gerados.
   - Alteração do status do cadastro (*Pendente*, *Validado*, *Revisão Solicitada*).
   - Exportação de listagens e relatórios (CSV / Excel).

---

## 3. Fluxo e Módulos do Sistema

### 3.1. Módulo de Autenticação e Segurança
- **Tela de Login**:
  - Campos: E-mail e Senha.
  - Opções: "Lembrar de mim", "Esqueci minha senha" e "Primeiro Acesso / Cadastre-se".
- **Tela de Registro de Conta (Primeiro Acesso)**:
  - Criação de usuário vinculada ao CPF e E-mail corporativo/pessoal.
  - Criação de senha forte com confirmação.
- **Recuperação de Senha**:
  - Envio de link/código de redefinição de senha por e-mail.

---

### 3.2. Módulo de Formulário de Cadastro (Multi-Step Wizard)
O formulário será dividido em etapas claras com barra de progresso visual:

#### **Etapa 1: Dados Pessoais**
- Nome Completo
- CPF (com máscara e validação de dígitos verificadores)
- RG e Órgão Emissor / UF
- Data de Nascimento (com cálculo automático de idade / verificação de maioridade)
- Gênero / Identidade de Gênero
- Estado Civil
- Nacionalidade / Naturalidade
- Nome Completo da Mãe e do Pai

#### **Etapa 2: Contato e Endereço**
- E-mail Principal e E-mail Alternativo
- Telefone Principal (WhatsApp) e Telefone de Recado
- CEP (com preenchimento automático via API ViaCEP)
- Logradouro (Rua, Avenida, etc.)
- Número e Complemento (Apartamento, Bloco, etc.)
- Bairro
- Cidade e Estado (UF)

#### **Etapa 3: Dados Bancários & Pagamento**
- Chave PIX (com seleção do tipo: CPF, E-mail, Telefone ou Chave Aleatória)
- Banco (Lista suspensa dos principais bancos do Brasil / Código Febraban)
- Tipo de Conta (Conta Corrente, Conta Salário, Poupança)
- Agência (com dígito)
- Número da Conta (com dígito)
- Titularidade da conta (confirmação se a conta é do próprio colaborador)

#### **Etapa 4: Dados Profissionais & Lotação**
- Unidade Solar Coca-Cola (ex: *Unidade Cascavel - CE*, *Fábrica Maracanaú*, *CD Itaitinga*, *Sede Fortaleza*)
- Cargo / Função pretendida ou atual
- Matrícula / Registro do Empregado (caso já possua)
- Setor / Departamento (ex: Logística, Produção, Vendas, Administrativo, Manutenção)
- Data Prevista de Início / Admissão
- Turno de Trabalho (se aplicável)

#### **Etapa 5: Revisão, Declaração e Termos de Consentimento (LGPD)**
- Tela com o resumo completo de todos os dados preenchidos para conferência.
- Checkbox obrigatório: **Termo de Veracidade** (*"Declaro que todas as informações prestadas são verdadeiras..."*).
- Checkbox obrigatório: **Termo de Consentimento para Tratamento de Dados Pessoais** conforme a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
- Botão final de submissão: **"Finalizar Cadastro e Gerar Recibo"**.

---

### 3.3. Módulo de Geração do Recibo / Comprovante em PDF
Ao submeter o formulário, o sistema gera instantaneamente um documento PDF corporativo profissional:

- **Cabeçalho**:
  - Logo oficial da **Solar Coca-Cola**.
  - Título: *Comprovante Cadastral do Colaborador - Solar Coca-Cola*.
  - Número de Protocolo Único (ex: `SCC-2026-XXXXXX`) e Data/Hora da emissão.
- **Corpo do Documento**:
  - Blocos tabulares organizados com todos os dados: Pessoais, Contato, Endereço, Dados Bancários/PIX e Dados Profissionais.
- **Autenticidade e Validação**:
  - QR Code ou Código Hash para conferência rápida de autenticidade do documento pelo RH.
  - Carimbo digital de confirmação de envio.
- **Rodapé Corporativo**:
  - Texto legal: *Documento gerado eletronicamente pelo Sistema de Cadastro da Solar Coca-Cola - Unidade Cascavel/CE. Todos os direitos reservados ©.*
- **Ações Disponíveis**:
  - Download imediato do arquivo `.pdf`.
  - Envio automático de uma cópia em anexo para o e-mail do colaborador.
  - Opção de reimprimir/baixar novamente a qualquer momento na área logada.

---

### 3.4. Painel de Gestão do RH / Administrador
- **Dashboard Resumo**:
  - Total de cadastros realizados no mês/dia.
  - Cadastros pendentes de revisão vs. Cadastros homologados.
- **Tabela de Colaboradores**:
  - Colunas: Foto/Avatar, Nome, CPF, Setor, Unidade, Data de Cadastro, Status e Ações.
  - Busca rápida por nome, CPF ou e-mail.
  - Filtros por Unidade (Cascavel, Maracanaú, etc.) e Status do cadastro.
- **Ações do RH**:
  - Visualizar ficha detalhada na tela.
  - Baixar o PDF oficial original.
  - Notificar colaborador caso algum dado precise de retificação.
  - Exportar base de dados para planilhas (Excel/CSV).

---

## 4. Requisitos de Interface, Usabilidade e Design (UI/UX)
- **Identidade Visual Solar Coca-Cola**:
  - Cores: Vermelho Solar (#F40009 / Vermelho Coca-Cola), Preto (#111111), Branco (#FFFFFF), Cinza Corporativo (#F5F5F7).
  - Tipografia moderna (Inter, Roboto ou Montserrat).
  - Componentes com visual premium: bordas arredondadas, sombras suaves, micro-animações de transição e feedback ao usuário (toasts/alertas).
- **Validações em Tempo Real**:
  - Máscaras automáticas nos campos: `000.000.000-00` (CPF), `(00) 00000-0000` (Telefone), `00000-000` (CEP).
  - Validador real de CPF (aviso instantâneo caso o CPF seja inválido).
  - Feedback visual de campos obrigatórios não preenchidos.
- **Responsividade Total**:
  - O portal deve funcionar perfeitamente em Smartphones, Tablets, Laptops e Desktops.

---

## 5. Requisitos de Segurança & LGPD
- Senhas criptografadas com algoritmos seguros (bcrypt / argon2).
- Proteção de rotas autenticadas via JWT (JSON Web Token) ou cookies de sessão HttpOnly.
- Proteção e sigilo total dos dados sensíveis bancários e de identificação civil.
- Registro de logs de auditoria (data/hora e IP do envio das informações).

---

## 6. Arquitetura Técnica Sugerida
- **Frontend**: React + Vite (JavaScript/TypeScript), CSS / TailwindCSS / Vanilla CSS com paleta Solar, Lucide Icons, jsPDF / html2canvas ou @react-pdf/renderer.
- **Backend**: Node.js (Express ou Fastify) com arquitetura RESTful.
- **Banco de Dados**: PostgreSQL, MySQL ou SQLite (para ambiente local/desenvolvimento).
- **Serviços Complementares**:
  - API ViaCEP para busca de endereço.
  - Nodemailer / Resend para envio de e-mails com o PDF em anexo.

---

## 7. Rodapé Padrão
> **Desenvolvido por Solar Coca-Cola Cascavel CE - Todos os direitos reservados ©**