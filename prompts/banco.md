# Sub-tabela de Ano/Mês/Dia e Relatório Mensal Consolidado em PDF (Diaristas)

Implementação de uma estrutura de sub-tabela anual e mensal na tela de **Relação de Diaristas**, garantindo que cada cadastro fique estritamente vinculado ao seu respectivo dia, mês e ano vigente, acompanhada da nova funcionalidade de **Gerar Relatório Mensal em PDF** com consolidação de diaristas (sem duplicidade de nomes), exibindo Nome, Profissão, Quantidade de Diárias e Valor Total com a identidade visual da Distribuidora Irmãos Barreiro.

---

## 1. Visão Geral dos Requisitos

1. **Sub-tabela por Ano Vigente, Mês e Dias**:
   - Exibir na Relação de Diaristas a navegação pelo **Ano Vigente** (ex: 2026).
   - Apresentar uma **sub-tabela dos 12 meses do ano vigente** (Janeiro a Dezembro) com métricas consolidadas de cada mês (quantidade de diaristas, diárias e valor total).
   - Ao selecionar um mês, abrir a **sub-tabela dos dias daquele mês**, indicando quais dias têm lançamentos e permitindo selecionar qualquer dia ou visualizar todos os registros do mês.
   - Ao cadastrar um diarista em determinado dia, mês e ano, o registro deve ser automaticamente atribuído àquela data e estar visível exatamente sob aquele dia, mês e ano vigente na relação.

2. **Gerar Relatório Mensal em PDF**:
   - Botão de ação direta para emissão de relatório oficial em PDF de qualquer mês selecionado.
   - **Regra de ouro: Não pode haver nomes repetidos**. Se um diarista prestou diárias em múltiplos dias daquele mês, seus lançamentos serão agregados em uma única linha contendo a soma das diárias e o valor total acumulado.
   - Tópicos obrigatórios na tabela do relatório:
     - **Nome** (do diarista)
     - **Profissão**
     - **Quantidade de diárias** (total do mês)
     - **Valor total** (soma dos valores no mês)
   - Identidade visual estrita da empresa:
     - Paleta de cores da Distribuidora Irmãos Barreiro (vermelho corporativo `#dc2626`/`#991b1b`, preto/grafite `#18181b`, branco e verde esmeralda para valores).
     - Logo oficial da empresa no cabeçalho.
     - Destaque claro e explícito de **qual mês e ano** aquele relatório se refere (ex: *RELATÓRIO MENSAL CONSOLIDADO DE DIARISTAS — SETEMBRO DE 2026*).
     - Bloco de totalização executiva e assinaturas para conferência financeira.

---

## 2. Mudanças Propostas

### Frontend

#### [NEW] [RelatorioMensalModal.jsx](file:///c:/Users/iarle/Desktop/SITE%20-%20IRM%C3%83OS%20BARREIROS/frontend/meu-projeto/src/components/RelatorioMensalModal.jsx)
- Componente dedicado para visualização e emissão do Relatório Mensal em PDF.
- Permite selecionar o Mês e Ano de interesse.
- Realiza a consolidação por nome (normalizando espaços e maiúsculas) para garantir **zero repetição de nomes**.
- Renderiza o documento no padrão gráfico da empresa (logo corporativa, cabeçalho vermelho bordô, badges, tabela estilizada com Nome, Profissão, Qtd. Diárias, Valor Total e rodapé de assinaturas).
- Exporta em PDF via `html2canvas` + `jsPDF` em alta definição (resolução nítida A4 retrato) com download automático (`Relatorio_Mensal_Diaristas_Setembro_2026.pdf`) e opção de impressão.

#### [MODIFY] [RelacaoDiaristas.jsx](file:///c:/Users/iarle/Desktop/SITE%20-%20IRM%C3%83OS%20BARREIROS/frontend/meu-projeto/src/components/RelacaoDiaristas.jsx)
- Adicionar controle de **Ano Vigente** (com seletor do ano atual).
- Adicionar a **Sub-tabela de Meses do Ano Vigente**:
  - Exibe os 12 meses com contagem de diaristas, total de diárias e valor total acumulado no mês.
  - Permite expandir/selecionar o mês ativo.
- Adicionar a **Sub-tabela dos Dias do Mês Selecionado**:
  - Exibe os dias do mês com resumo de lançamentos.
  - Permite filtrar a tabela principal para o dia clicado ou visualizar todos os diaristas do mês.
- Integrar o botão **"Gerar Relatório Mensal (PDF)"** com acesso rápido ao modal de emissão do relatório mensal.
- Assegurar que ao clicar em "Cadastrar Diarista", a data inicial enviada seja exatamente o dia/mês/ano atualmente selecionado.

#### [MODIFY] [CadastrarDiarista.jsx](file:///c:/Users/iarle/Desktop/SITE%20-%20IRM%C3%83OS%20BARREIROS/frontend/meu-projeto/src/components/CadastrarDiarista.jsx)
- Garantir que o campo de data receba e respeite com precisão a data selecionada na Relação de Diaristas.
- Exibir com clareza o dia, mês e ano selecionados para conferência antes de salvar.

#### [MODIFY] [PortalColaborador.jsx](file:///c:/Users/iarle/Desktop/SITE%20-%20IRM%C3%83OS%20BARREIROS/frontend/meu-projeto/src/components/PortalColaborador.jsx)
- Manter a sincronização da data e do ano/mês ativo ao navegar entre "Relação de Diaristas" e "Cadastrar Diarista", posicionando o usuário de volta no dia, mês e ano do diarista recém-cadastrado.

### Backend

#### [MODIFY] [diaristas.py](file:///c:/Users/iarle/Desktop/SITE%20-%20IRM%C3%83OS%20BARREIROS/backend/app/api/v1/endpoints/diaristas.py)
- Adicionar parâmetro de query opcional `mes` (`YYYY-MM`) no endpoint `GET /api/v1/diaristas` para permitir filtros eficientes por mês diretamente no banco de dados quando necessário.

---

## 3. Plano de Verificação

### Testes Manuais e Visuais
1. **Navegação Anual, Mensal e Diária**:
   - Abrir a tela de Relação de Diaristas e verificar a sub-tabela com os meses do ano vigente (2026).
   - Selecionar diferentes meses (ex: Janeiro, Agosto, Setembro) e checar se os dias correspondentes são exibidos corretamente na sub-tabela de dias.
2. **Cadastro no Dia/Mês/Ano Correto**:
   - Selecionar um dia específico (ex: 15 de Setembro de 2026) e clicar em "+ Cadastrar Diarista".
   - Confirmar o cadastro e verificar se ele aparece exatamente no dia 15, no mês de Setembro e ano 2026.
3. **Consolidação sem Nomes Repetidos**:
   - Cadastrar o mesmo diarista (ex: "CARLOS ALBERTO SILVA") em 2 dias diferentes do mesmo mês (ex: 2 diárias no dia 10 e 1 diária no dia 15).
   - Abrir o Relatório Mensal daquele mês e confirmar que "CARLOS ALBERTO SILVA" aparece **apenas uma única vez**, totalizando 3 diárias e a soma dos valores.
4. **Geração de PDF do Mês**:
   - Clicar em "Gerar Relatório Mensal (PDF)".
   - Conferir se o documento gerado:
     - Apresenta claramente o Mês e Ano de referência no topo.
     - Contém as colunas: **Nome**, **Profissão**, **Quantidade de diárias** e **Valor total**.
     - Segue as cores corporativas (vermelho `#dc2626`/`#991b1b`, preto e branco com detalhes dourados/esmeralda).
     - Baixa o arquivo `.pdf` perfeitamente formatado e nítido.
