# Diretrizes para agentes de desenvolvimento

Este arquivo orienta alterações neste repositório. Aplique as regras ao código que criar ou modificar; não faça reformas fora do escopo da tarefa. Instruções específicas do projeto, convenções do framework e decisões de arquitetura documentadas prevalecem sobre as preferências gerais deste arquivo.

## Antes de alterar

- Leia o `README`, os arquivos de configuração, os testes relevantes e quaisquer `AGENTS.md` aplicáveis aos diretórios envolvidos.
- Entenda a funcionalidade existente e suas interfaces antes de modificar código. Procure padrões já usados no repositório e mantenha a solução consistente.
- Identifique os comandos reais de formatação, lint, tipagem, teste e build nas configurações do projeto. Não invente comandos nem instale dependências sem necessidade.
- Planeje alterações pequenas e verificáveis. Preserve interfaces públicas e dados existentes, salvo quando a tarefa exigir mudança; nesse caso, atualize consumidores, testes e documentação.

## Estilo de código

- **Clean Code:** escreva código legível, com nomes que expressem intenção, funções coesas e limites claros entre responsabilidades. Melhore trechos próximos à alteração quando isso reduzir complexidade sem ampliar o escopo.
- **SOLID:** aplique SRP, OCP, LSP, ISP e DIP onde houver necessidade real de extensão, substituição ou isolamento. Não crie interfaces, hierarquias ou camadas apenas para demonstrar um princípio.
- **KISS:** prefira a solução mais simples que satisfaça os requisitos e preserve os contratos.
- **YAGNI:** implemente apenas necessidades atuais ou compromissos explicitamente definidos; não antecipe funcionalidades, otimizações ou generalizações hipotéticas.
- **DRY:** centralize conhecimento e regras de negócio repetidos; duas ocorrências parecidas com razões de mudança diferentes podem continuar separadas.
- Cada função deve ter uma finalidade clara e cada módulo, uma responsabilidade principal. Prefira funções curtas; use 4 a 20 linhas como referência, não como limite obrigatório. Extraia trechos quando isso melhorar a leitura ou permitir reutilização real.
- Prefira arquivos focados; acima de aproximadamente 500 linhas, avalie separar por responsabilidade, respeitando as convenções do framework. Não divida arquivos apenas para cumprir uma contagem.
- Use nomes específicos e consistentes com o domínio. Evite nomes genéricos como `data`, `handler` e `Manager` quando houver uma alternativa clara. O nome deve ser fácil de localizar e distinguir no repositório; não imponha uma quantidade artificial de resultados de busca.
- Declare tipos explícitos nas interfaces públicas e nos pontos em que a inferência prejudique a compreensão ou a segurança. Evite `any`, `Dict` sem parâmetros e funções sem tipos em linguagens que oferecem tipagem; siga os idiomatismos da linguagem.
- Remova duplicação de regras de negócio. Extraia lógica compartilhada quando houver repetição significativa; não introduza abstrações para uma única ocorrência simples.
- Prefira retornos antecipados a blocos condicionais profundos. Simplifique o fluxo quando houver mais de dois níveis de aninhamento, sem prejudicar a clareza.
- Faça validação nas fronteiras do sistema. Mensagens de erro devem identificar o campo ou a operação e o formato esperado. Inclua o valor recebido apenas se ele não contiver segredos, dados pessoais ou conteúdo excessivo.

## Comentários e documentação

- Preserve comentários existentes que registrem intenção, contexto ou origem de uma decisão. Ao alterar o comportamento relacionado, atualize o comentário; remova-o apenas se estiver comprovadamente obsoleto e sem valor histórico.
- Comente o **porquê** de decisões pouco óbvias, não o que o código já mostra.
- Documente funções e interfaces públicas conforme a convenção da linguagem: explique propósito, contrato e restrições relevantes. Inclua um exemplo de uso quando ele ajudar a evitar ambiguidade.
- Registre o número da issue, referência de decisão ou commit quando uma solução depender de um bug específico ou limitação externa conhecida; não invente referências.
- Atualize `README`, exemplos, configuração e documentação de API quando comandos ou comportamento visível mudarem.

## Testes

- Mantenha no `README` os comandos reais das suítes Node e Python e dos testes de navegador opcionais. Use os comandos existentes se já estiverem documentados.
- Teste comportamento novo e alterado, incluindo casos de erro importantes. Correções de bugs devem ter um teste de regressão que falhe antes da correção, quando isso for viável.
- Dê cobertura a novas funções com lógica relevante, especialmente funções públicas. Funções triviais, composição de framework e simples delegações podem ser cobertas por um teste de comportamento maior, sem testes artificiais por função.
- Mantenha testes **F.I.R.S.T.**: rápidos, independentes, repetíveis, autoavaliáveis e escritos junto com a mudança.
- Isole serviços externos e operações caras ou instáveis. Prefira fakes nomeados e reutilizáveis para APIs, banco de dados e sistema de arquivos quando tornarem o teste mais claro; use recursos reais em testes de integração quando isso verificar um risco que os fakes não capturam.
- Não use snapshots frágeis nem mocks que apenas reproduzam a implementação. Verifique resultados observáveis e contratos.
- Execute os testes relevantes, formatador, lint e verificação de tipos disponíveis antes de concluir. Rode a suíte completa quando a abrangência da mudança ou as regras do projeto justificarem.

## Dependências e arquitetura

- Injete dependências externas e variantes de implementação por construtor ou parâmetro quando isso facilitar testes, substituição ou isolamento. Constantes e funções puras não precisam de injeção.
- Coloque SDKs e bibliotecas externas atrás de uma interface fina pertencente ao projeto quando isso proteger regras de negócio ou reduzir acoplamento. Evite wrappers que só repassem chamadas sem acrescentar valor.
- Siga a estrutura e os pontos de extensão do framework (por exemplo, Django, Rails, Next.js). Escolha caminhos previsíveis para código, testes e recursos.
- Não introduza dependências, camadas ou padrões de arquitetura sem necessidade concreta. Reutilize componentes existentes antes de criar novos.
- Preserve compatibilidade de API, esquemas e migrações quando aplicável. Mudanças incompatíveis exigem plano de atualização e testes apropriados.

## Formatação e observabilidade

- Use o formatador padrão ou configurado pelo projeto (`gofmt`, `cargo fmt`, `prettier`, `black`, `rubocop`, entre outros). Deixe a ferramenta decidir detalhes de estilo.
- Respeite configurações existentes de lint e tipagem; não desative uma regra global para fazer uma mudança local passar.
- Em serviços, emita logs estruturados com campos estáveis e identificadores de correlação quando disponíveis. Use JSON quando o destino de observabilidade esperar esse formato; não altere o formato de toda a aplicação sem necessidade.
- Em ferramentas de linha de comando, escreva a saída destinada à pessoa usuária em texto legível. Direcione diagnósticos ao canal adequado e nunca registre segredos ou dados sensíveis sem proteção.

## Entrega

<ul>
  <li>Faça a menor alteração que resolva a tarefa por completo. Não sobrescreva trabalho preexistente de outras pessoas.</li>
  <li>Ao concluir, informe o que mudou, quais verificações foram executadas e qualquer limitação material. Se um teste não puder ser executado, explique o motivo sem declarar que passou.</li>
  <li>Kaizen - melhoria contínua:
    <ul>
        <li>Entenda o comportamento atual e o objetivo antes de alterar o código.</li>
        <li>Prefira a menor mudança que resolva a causa do problema ou melhore o resultado.</li>
        <li>Preserve comportamentos e contratos existentes; atualize os testes quando a mudança alterar o comportamento.</li>
        <li>Evite agrupar refatorações sem relação com a tarefa.</li>
        <li>Execute as verificações relevantes e informe o que mudou e os resultados.</li>
        <li>Registre melhorias descobertas fora do escopo como sugestões para uma próxima etapa.</li>
        <li>Use feedback e revisões para orientar o próximo ciclo de melhoria.</li>
    </ul>
  </li>
</ul>

## Contexto específico do projeto

- O editor offline usa JavaScript, SVG e HTML; a API e o build usam Python 3.10+, `uv` e `ruff`. Os testes de navegador usam Node.js 20+ e Playwright.
- Edite os arquivos fonte em `src/`. `src/flow-core.js`, `src/editor.js` e `editor.html` são gerados por `uv run python build.py`; regenere-os após mudar suas fontes.
- Tokens de tráfego e seus efeitos ficam em `src/core-engine.js` e `src/traffic-runtime.js`. Mantenha tamanho, opacidade e movimento coerentes entre editor e exportações. O campo JSON `legends[].size` permanece em unidades SVG; o editor apresenta rem.
- Preserve a portabilidade entre Linux e Windows, inclusive caminhos de arquivo e comandos documentados.
- Comandos confirmados: `uv run ruff check .`, `uv run ruff format --check .`, `uv run python build.py`, `node --test tests/*.cjs` e `uv run python3 -m unittest discover -s tests -v`.
- Quando a mudança envolver interação ou exportação no navegador, use `node tests/editor-browser.js`. Os testes de navegador requerem Playwright e Chromium instalados, conforme o `README`.

<!-- generated:docs-index:start -->
## Project Artifacts

Consulte os artefatos disponíveis quando forem relevantes:

- [TASKS.md](./TASKS.md) — Tarefas de implementação e critérios de conclusão.
- [BACKLOG.md](./BACKLOG.md) — Oportunidades e trabalho futuro.
- [README.md](./README.md) — Apresentação, instalação e uso do projeto.

## Catálogo de documentos

Consulte os documentos relevantes antes de planejar ou alterar partes relacionadas do projeto.
Os links descrevem o conteúdo disponível; agentes externos podem exigir leitura explícita.

| Documento | Finalidade | Assuntos e responsabilidades | Quando consultar |
| --- | --- | --- | --- |
| [BACKLOG.md](BACKLOG.md) | Preparar para lançamento público um editor de diagramas de projetos com fluxo animado e mais de 80 componentes SVG de System Design. Os usuários prioritários são pessoas que criam  | Propostas/requisitos documentados: Objetivo e base de decisão, Critério de prioridade, Marcos e decisões, Decisões operacionais baseadas no projeto, Decisões e limites desta candidata, B01 compara Whimsical, diagrams.net e Excalidraw/Excalidraw+ nas tarefas de criar, conectar, animar quando disponível, editar, exportar e reabrir um fluxo de três componentes. A matriz e as fontes estão em `docs/product/COMPETITOR_REVIEW.md`., B02 usa a jornada Cliente → API → Banco de dados de `docs/product/USER_JOURNEY_STUDY.md`. A revisão interna do código orienta correções pequenas e reproduzíveis; ela não substitui sessões com pessoas do púb | Antes de planejar ou alterar áreas relacionadas |
| [FEATURE_BACKLOG.md](FEATURE_BACKLOG.md) | Ideias reunidas a partir dos recursos públicos de Whimsical, diagrams.net e Excalidraw. A lista prioriza o que combina com um editor de diagramas offline e gratuito; é uma proposta | Prioridade alta, Prioridade média, Exploração, Referências consultadas, **Biblioteca de templates e exemplos** — transformar os modelos fixos existentes em catálogo pesquisável por categoria (API, arquitetura, produto, processo), com prévia e botão para duplicar o diagrama., **Atalhos e criação rápida de fluxos** — documentar os atalhos existentes, adicionar menu de comandos e criar um próximo bloco/conector a partir do bloco selecionado., **Opções avançadas de exportação** — acrescentar escala ajustável, fundo transparente e recorte do conteúdo às exportações existentes; manter importação/exp | Antes de planejar ou alterar áreas relacionadas |
| [README.en.md](README.en.md) | [Português (Brasil)](README.md) | Get started, Open the editor, Examples, Editor controls, Generate a diagram with Python, Development and tests, Build, lint, and tests without a browser, Browser tests, Architecture and project structure, Known limits, Contributing, Updates, 📝 License and credits | Antes de planejar ou alterar áreas relacionadas |
| [README.md](README.md) | [English](README.en.md) | Começar, Abrir o editor, Exemplos, Controles do editor, Gerar um diagrama com Python, Desenvolvimento e testes, Build, lint e testes sem navegador, Testes com navegador, Arquitetura e estrutura, Limites conhecidos, Contribuindo, Atualizações, 📝 Licença e créditos, Contexto do projeto, Propósito, Repositório: https://github.com/wwwwelton/animated-flow-studio, Tipo: editor web offline com API Python, Linguagens: Python, JavaScript, HTML, CSS, Ferramentas de desenvolvimento: Ruff e Playwright, Testes: Node.js (`node:test`), Python (`unittest`) e Playwright, O que este projeto faz e para quem? — Editor de fluxogramas e arquiteturas com tráfego animado em SVG. O pacote descrito neste README inc | Antes de planejar ou alterar áreas relacionadas |
| [TASKS.md](TASKS.md) | Base: versão 2.3 entregue anteriormente. O primeiro commit registra essa base. | Propostas/requisitos documentados: 1 — Efeitos de tráfego, 2 — Tipografia, 3 — Catálogo SVG, 4 — Velocidade, 5 — Centralização, 6 — Tabelas, 7 — Conectores, 8 — Zoom suave, 9 — Mover canvas, 10 — Conexões por arraste, 11 — Componente custom reativo, Entrega 3.0, Correção 3.0.1 — tarefa 1: documentação, Correção 3.0.1 — tarefa 2: execução e distribuição, 12 — Componentes e tráfego dos sete protocolos de API, Backlog para lançamento público | Antes de planejar ou alterar áreas relacionadas |
| [assets/system-design/README.md](assets/system-design/README.md) | 81 símbolos SVG originais em arquivos individuais: 74 conceitos dos 75 termos numerados do PDF fornecido pelo usuário (Disponibilidade, termos 38 e 67, foi unificada) e sete protoc | Animated Flow Studio — System Design | Antes de planejar ou alterar áreas relacionadas |
| [docs/GUIA_DO_EDITOR.md](docs/GUIA_DO_EDITOR.md) | Recursos do editor distribuído na versão 3.0.1. Para instalação e testes, veja o README da raiz. | Uso, Navegar no canvas, Tráfego, Tipografia, Tabelas, Conexões many-to-many, Custom: estado reativo, Catálogos e extensão, Exportações e exemplos, Efeitos: marcador, pulso, brilho, rastro de marcadores, cometa com cauda afilada e fluxo tracejado., Símbolos: quadrado, círculo, losango, triângulo, seta e estrela., Velocidades: 0,1×–8× global e por legenda; marcadores: 1–8; tamanho inicial: 1 rem, editável de 0,1875 a 2 rem. O JSON salva 16 unidades SVG para 1 rem., Tempo efetivo do percurso = tempo base da conexão ÷ velocidade global ÷ velocidade da legenda., Alterar a velocidade global preserva | Antes de planejar ou alterar áreas relacionadas |
| [docs/adr/0001-local-first-single-file-editor.md](docs/adr/0001-local-first-single-file-editor.md) | Accepted | Status, Contexto, Decisão, Consequências, Uso simples e portátil., Menor custo operacional., Recursos colaborativos em tempo real exigirão uma camada opcional futura, sem quebrar o modo local-first. | Antes de planejar ou alterar áreas relacionadas |
| [docs/adr/0002-architecture-as-code.md](docs/adr/0002-architecture-as-code.md) | Accepted | Status, Contexto, Decisão, Consequências, Documentação revisável em pull requests., Diagramas permanecem próximos do código., Não há obrigação de modelar classes ou cada detalhe interno. | Antes de planejar ou alterar áreas relacionadas |
| [docs/adr/0003-consistent-traffic-visual-scale.md](docs/adr/0003-consistent-traffic-visual-scale.md) | Accepted | Status, Contexto, Decisão, Consequências, Legendas e fluxos ficam visualmente coerentes., Conectores grossos recebem setas proporcionais sem crescimento excessivo., Novos protocolos devem reutilizar as mesmas métricas. | Antes de planejar ou alterar áreas relacionadas |
| [docs/adr/README.md](docs/adr/README.md) | Use um ADR quando uma decisão mudar estrutura, contrato, compatibilidade ou operação do produto. | Architecture Decision Records | Antes de planejar ou alterar áreas relacionadas |
| [docs/architecture/README.md](docs/architecture/README.md) | A documentação arquitetural do projeto segue uma abordagem leve: **C4 + fluxos + ADR + contratos + SDD**. O objetivo é explicar o sistema sem depender de UML formal e manter as dec | Mapa de leitura | Antes de planejar ou alterar áreas relacionadas |
| [docs/architecture/components.md](docs/architecture/components.md) | flowchart TB | Editor, Regras de dependência, `core-engine.js` permanece sem DOM e sem rede., UI pode depender do core; core não depende da UI., arquivos gerados (`flow-core.js`, `editor.js`, `editor.html`) não são fonte primária de edição., componentes SVG entram pelo manifesto e pelo build. | Antes de planejar ou alterar áreas relacionadas |
| [docs/architecture/containers.md](docs/architecture/containers.md) | flowchart LR | C4 · Containers | Antes de planejar ou alterar áreas relacionadas |
| [docs/architecture/context.md](docs/architecture/context.md) | Animated Flow Studio é um editor local-first para construir diagramas de arquitetura e fluxos com SVG animado, sem exigir backend para uso normal. | Objetivo, Fronteiras, O editor funciona offline com os assets empacotados., Rede é opcional e usada apenas para fontes externas quando selecionadas., Diagramas ficam no navegador até serem exportados pelo usuário. | Antes de planejar ou alterar áreas relacionadas |
| [docs/architecture/deployment.md](docs/architecture/deployment.md) | O produto não exige backend de produção. | Deployment View | Antes de planejar ou alterar áreas relacionadas |
| [docs/architecture/runtime.md](docs/architecture/runtime.md) | sequenceDiagram | Edição e renderização, Tráfego | Antes de planejar ou alterar áreas relacionadas |
| [docs/contracts/project-schema.md](docs/contracts/project-schema.md) | O JSON exportado é a fonte portátil do diagrama. O schema lógico é validado por `FlowCore.normalize()`. | Contrato · Project JSON, `version`, `title`, `kicker`, `description`;, `width`, `height`, `autoGrow`, `growthMargin`, `grid`;, `nodes[]` — componentes e geometria;, `edges[]` — origem, destino, rota, conector e tráfego;, `legends[]` — identidade visual e comportamento de cada fluxo;, `trafficSpeed` e `showLegend`. | Antes de planejar ou alterar áreas relacionadas |
| [docs/flows/editor-runtime.md](docs/flows/editor-runtime.md) | flowchart LR | Flow · Editor runtime | Antes de planejar ou alterar áreas relacionadas |
| [docs/flows/export.md](docs/flows/export.md) | flowchart LR | Flow · Exportação | Antes de planejar ou alterar áreas relacionadas |
| [docs/product/COMPETITOR_REVIEW.md](docs/product/COMPETITOR_REVIEW.md) | Data da consulta: 28/09/2026. Tarefa comparada: criar um fluxo de projeto com componentes ligados, mostrar o tráfego, editar o diagrama e compartilhá-lo para visualização ou edição | Lacunas candidatas, sem compromisso de implementação, Próxima observação reproduzível, Decisão posterior — SVG editável no editor local | Antes de planejar ou alterar áreas relacionadas |
| [docs/product/QUALITY_BASELINE.md](docs/product/QUALITY_BASELINE.md) | Estado: linha de base automatizada executada em 28/09/2026. Falta observação manual com participantes e abertura das exportações em leitores externos. A ausência de relato não equi | Execução de referência, Triagem complementar — impressão e inserção, Continuidade após o adiamento da candidata | Antes de planejar ou alterar áreas relacionadas |
| [docs/product/RELEASE_READINESS.md](docs/product/RELEASE_READINESS.md) | Estado: **lançamento adiado por decisão da pessoa solicitante em 28/09/2026**. O pacote avaliado foi a versão 3.0.1 gerada do commit `d8da778` em `dist/animated-flow-studio.zip`. E | Propostas/requisitos documentados: Evidência disponível, Pendências antes da decisão, Registro da decisão humana, B01: comparação documental de Whimsical, diagrams.net e Excalidraw em `COMPETITOR_REVIEW.md`. As lacunas listadas são hipóteses, não requisitos aprovados., B03: 62 testes Node, 9 Python, cenário integrado em Chromium e geração de PDF passaram na linha de base de `QUALITY_BASELINE.md`., B05: inserção repetida evita sobreposição quando há espaço. O catálogo pode ser acionado por Espaço com o botão em foco, enquanto o canvas conserva Espaço + arraste após receber foco. Esses cenários passaram em Chromium., B06: impress | Antes de planejar ou alterar áreas relacionadas |
| [docs/product/USER_JOURNEY_STUDY.md](docs/product/USER_JOURNEY_STUDY.md) | Estado: sem sessões nesta candidata; a pessoa solicitante informou que não terá participantes. O roteiro permanece disponível para uma rodada futura. Público: pessoas que criam flu | Tarefas para cada participante, Registro por sessão, Revisão interna do projeto — 28/09/2026 | Antes de planejar ou alterar áreas relacionadas |
| [docs/sdd/README.md](docs/sdd/README.md) | Features maiores seguem este ciclo leve: | Spec-Driven Development, `spec.md` — comportamento observável e critérios de aceitação;, `plan.md` — arquitetura, arquivos afetados e riscos;, `tasks.md` — passos pequenos, testáveis e ordenados. | Antes de planejar ou alterar áreas relacionadas |
| [src/components/README.md](src/components/README.md) | Edite os arquivos desta pasta e execute `uv run python build.py` na raiz. O editor distribuído é autocontido; não precisa buscar arquivos SVG durante o uso. | Componentes SVG | Antes de planejar ou alterar áreas relacionadas |

## Detalhamento dos documentos

### [BACKLOG.md](BACKLOG.md)

Assuntos documentados: Objetivo e base de decisão; Critério de prioridade; Marcos e decisões; Decisões operacionais baseadas no projeto; Decisões e limites desta candidata; B01 compara Whimsical, diagrams.net e Excalidraw/Excalidraw+ nas tarefas de criar, conectar, animar quando disponível, editar, exportar e reabrir um fluxo de três componentes. A matriz e as fontes estão em `docs/product/COMPETITOR_REVIEW.md`.; B02 usa a jornada Cliente → API → Banco de dados de `docs/product/USER_JOURNEY_STUDY.md`. A revisão interna do código orienta correções pequenas e reproduzíveis; ela não substitui sessões com pessoas do público prioritário.; Para a linha de base B03, “suave” significa que inserir componentes repetidamente evita sobreposição quando há espaço, mover/conectar/usar zoom preserva o diagrama e imprimir não reinicia o relógio de tráfego. Interrupções percebidas por usuários ainda precisam ser observadas.; B04–B06 podem corrigir defeitos reproduzidos internamente enquanto B02 aguarda participantes. A pessoa solicitante autorizou a escolha de uma melhoria baseada nos concorrentes: SVG do diagrama com projeto editável embutido, registrado em `docs/product/COMPETITOR_REVIEW.md`. Outras funcionalidades de B08 continuam condicionadas a um caso de uso comprovado.; A pessoa solicitante informou que não terá participantes para B02. A revisão interna continua útil para defeitos reproduzíveis, mas os critérios de observação de usuários de B02 permanecem sem atendimento; isso é um risco explícito para a decisão B09.; A pessoa solicitante decidirá o lançamento. Não haverá validação no Windows agora; a evidência de navegador desta rodada é de Linux/Chromium.; Nenhuma data de lançamento ou compromisso externo foi informada. Outras opções de B08 permanecem adiadas até existir um caso de uso verificável.; Em 28/09/2026, a pessoa solicitante decidiu adiar a candidata `d8da778` para obter mais evidência. O registro da decisão e do pacote avaliado está em `docs/product/RELEASE_READINESS.md`. Melhorias posteriores não mudam essa decisão nem constituem uma nova versão candidata..

### [FEATURE_BACKLOG.md](FEATURE_BACKLOG.md)

Assuntos documentados: Prioridade alta; Prioridade média; Exploração; Referências consultadas; **Biblioteca de templates e exemplos** — transformar os modelos fixos existentes em catálogo pesquisável por categoria (API, arquitetura, produto, processo), com prévia e botão para duplicar o diagrama.; **Atalhos e criação rápida de fluxos** — documentar os atalhos existentes, adicionar menu de comandos e criar um próximo bloco/conector a partir do bloco selecionado.; **Opções avançadas de exportação** — acrescentar escala ajustável, fundo transparente e recorte do conteúdo às exportações existentes; manter importação/exportação JSON, SVG/PNG e impressão em PDF já disponíveis.; **Auto-layout** — organizar automaticamente fluxogramas em árvore, fluxo, camadas ou distribuição circular, com opção de desfazer.; **Biblioteca de ícones e componentes** — acrescentar favoritos e importação de bibliotecas SVG locais à busca e reutilização já disponíveis no catálogo System Design.; **Histórico local e restauração** — ir além do desfazer/refazer atual: criar snapshots nomeados, comparar versões e recuperar uma anterior sem perder o estado atual.; **Múltiplas páginas e camadas** — separar visões do mesmo projeto e permitir ocultar, bloquear e reordenar camadas.; **Importação de Mermaid** — converter texto Mermaid em objetos editáveis, com aviso claro quando algum elemento não puder ser convertido.; **Apresentação por quadros** — acrescentar quadros/cenas e ordem de navegação ao modo de apresentação já disponível.; **Desenho livre e anotações** — caneta, marcador e borracha para rascunhos sobre o canvas.; **Mídia no canvas** — adicionar imagens e links de vídeo como contexto, com suporte a arquivo local e prévia.; **Links, notas e tags nos elementos** — guardar documentação e abrir links relacionados ao selecionar um nó ou conexão.; **Tema escuro e preferências de canvas** — tema claro/escuro, snap-to-grid e cores/estilos padrão configuráveis; a grade já pode ser ligada ou desligada.; **Geração de diagrama a partir de texto** — receber uma descrição, produzir uma proposta editável e pedir confirmação antes de substituir conteúdo existente.; **Edição colaborativa** — cursores de participantes, presença e sincronização em tempo real; manter o modo local disponível.; **Comentários ancorados** — comentários em nós/conexões, respostas e marcação de itens resolvidos.; **Compartilhamento somente leitura** — link ou pacote exportado que abre uma visualização sem habilitar edição.; **Wireframes básicos** — componentes de interface para rascunhar telas e conectá-las a fluxos de navegação.; Whimsical: quadros de canvas infinito, templates, colaboração, comentários, mídia, histórico, diagramas gerados por IA e wireframes — https://whimsical.com/ e https://whimsical.com/flowcharts; diagrams.net: importação/exportação, Mermaid, múltiplas páginas, camadas, organização automática, geração por IA e compartilhamento — https://www.drawio.com/docs/manual/ e https://www.drawio.com/docs/features/; Excalidraw: canvas infinito, bibliotecas, colaboração, apresentações, comentários, exportação e geração de diagrama por texto — https://plus.excalidraw.com/ e https://plus.excalidraw.com/excalidraw-for-teams.

### [README.en.md](README.en.md)

Assuntos documentados: Get started; Open the editor; Examples; Editor controls; Generate a diagram with Python; Development and tests; Build, lint, and tests without a browser; Browser tests; Architecture and project structure; Known limits; Contributing; Updates; 📝 License and credits.

### [README.md](README.md)

Assuntos documentados: Começar; Abrir o editor; Exemplos; Controles do editor; Gerar um diagrama com Python; Desenvolvimento e testes; Build, lint e testes sem navegador; Testes com navegador; Arquitetura e estrutura; Limites conhecidos; Contribuindo; Atualizações; 📝 Licença e créditos; Contexto do projeto; Propósito; Repositório: https://github.com/wwwwelton/animated-flow-studio; Tipo: editor web offline com API Python; Linguagens: Python, JavaScript, HTML, CSS; Ferramentas de desenvolvimento: Ruff e Playwright; Testes: Node.js (`node:test`), Python (`unittest`) e Playwright; O que este projeto faz e para quem? — Editor de fluxogramas e arquiteturas com tráfego animado em SVG. O pacote descrito neste README inclui 19 componentes de fluxograma, 81 símbolos de System Design, sete protocolos de API, componentes SQL/NoSQL/Schema e um componente Custom com texto e cor reativos ao tráfego..

### [TASKS.md](TASKS.md)

Assuntos documentados: 1 — Efeitos de tráfego; 2 — Tipografia; 3 — Catálogo SVG; 4 — Velocidade; 5 — Centralização; 6 — Tabelas; 7 — Conectores; 8 — Zoom suave; 9 — Mover canvas; 10 — Conexões por arraste; 11 — Componente custom reativo; Entrega 3.0; Correção 3.0.1 — tarefa 1: documentação; Correção 3.0.1 — tarefa 2: execução e distribuição; 12 — Componentes e tráfego dos sete protocolos de API; Backlog para lançamento público.

### [docs/GUIA_DO_EDITOR.md](docs/GUIA_DO_EDITOR.md)

Assuntos documentados: Uso; Navegar no canvas; Tráfego; Tipografia; Tabelas; Conexões many-to-many; Custom: estado reativo; Catálogos e extensão; Exportações e exemplos; Efeitos: marcador, pulso, brilho, rastro de marcadores, cometa com cauda afilada e fluxo tracejado.; Símbolos: quadrado, círculo, losango, triângulo, seta e estrela.; Velocidades: 0,1×–8× global e por legenda; marcadores: 1–8; tamanho inicial: 1 rem, editável de 0,1875 a 2 rem. O JSON salva 16 unidades SVG para 1 rem.; Tempo efetivo do percurso = tempo base da conexão ÷ velocidade global ÷ velocidade da legenda.; Alterar a velocidade global preserva a fase do tráfego e dos componentes reativos; os tempos de manutenção de estado acompanham a mesma escala. Pausa mantém a posição atual. O botão Reiniciar volta ao início.; Texto ao entrar e ao sair; habilitação independente de alternância de texto.; Cor ao entrar e ao sair; habilitação independente de alternância de cor.; Transição de cor entre 0 e 5 s.; Manter estado entre 0 e 30 s; zero mantém até o próximo evento.; Filtro de legendas; nenhuma marcada significa todas.; `assets/flowchart/`: 19 SVGs de formas de fluxograma e manifesto.; `assets/system-design/`: 81 ícones SVG originais, com nomes e categorias; inclui sete protocolos de API.; `assets/custom/`: forma SVG do componente reativo e manifesto.; `src/components/`: fontes SVG parametrizadas e manifesto de compilação; veja `src/components/README.md` para adicionar formas..

### [docs/adr/0001-local-first-single-file-editor.md](docs/adr/0001-local-first-single-file-editor.md)

Assuntos documentados: Status; Contexto; Decisão; Consequências; Uso simples e portátil.; Menor custo operacional.; Recursos colaborativos em tempo real exigirão uma camada opcional futura, sem quebrar o modo local-first..

### [docs/adr/0002-architecture-as-code.md](docs/adr/0002-architecture-as-code.md)

Assuntos documentados: Status; Contexto; Decisão; Consequências; Documentação revisável em pull requests.; Diagramas permanecem próximos do código.; Não há obrigação de modelar classes ou cada detalhe interno..

### [docs/adr/0003-consistent-traffic-visual-scale.md](docs/adr/0003-consistent-traffic-visual-scale.md)

Assuntos documentados: Status; Contexto; Decisão; Consequências; Legendas e fluxos ficam visualmente coerentes.; Conectores grossos recebem setas proporcionais sem crescimento excessivo.; Novos protocolos devem reutilizar as mesmas métricas..

### [docs/architecture/README.md](docs/architecture/README.md)

Assuntos documentados: Mapa de leitura.

### [docs/architecture/components.md](docs/architecture/components.md)

Assuntos documentados: Editor; Regras de dependência; `core-engine.js` permanece sem DOM e sem rede.; UI pode depender do core; core não depende da UI.; arquivos gerados (`flow-core.js`, `editor.js`, `editor.html`) não são fonte primária de edição.; componentes SVG entram pelo manifesto e pelo build..

### [docs/architecture/context.md](docs/architecture/context.md)

Assuntos documentados: Objetivo; Fronteiras; O editor funciona offline com os assets empacotados.; Rede é opcional e usada apenas para fontes externas quando selecionadas.; Diagramas ficam no navegador até serem exportados pelo usuário..

### [docs/architecture/runtime.md](docs/architecture/runtime.md)

Assuntos documentados: Edição e renderização; Tráfego.

### [docs/contracts/project-schema.md](docs/contracts/project-schema.md)

Assuntos documentados: `version`, `title`, `kicker`, `description`;; `width`, `height`, `autoGrow`, `growthMargin`, `grid`;; `nodes[]` — componentes e geometria;; `edges[]` — origem, destino, rota, conector e tráfego;; `legends[]` — identidade visual e comportamento de cada fluxo;; `trafficSpeed` e `showLegend`..

### [docs/product/COMPETITOR_REVIEW.md](docs/product/COMPETITOR_REVIEW.md)

Assuntos documentados: Lacunas candidatas, sem compromisso de implementação; Próxima observação reproduzível; Decisão posterior — SVG editável no editor local.

### [docs/product/QUALITY_BASELINE.md](docs/product/QUALITY_BASELINE.md)

Assuntos documentados: Execução de referência; Triagem complementar — impressão e inserção; Continuidade após o adiamento da candidata.

### [docs/product/RELEASE_READINESS.md](docs/product/RELEASE_READINESS.md)

Assuntos documentados: Evidência disponível; Pendências antes da decisão; Registro da decisão humana; B01: comparação documental de Whimsical, diagrams.net e Excalidraw em `COMPETITOR_REVIEW.md`. As lacunas listadas são hipóteses, não requisitos aprovados.; B03: 62 testes Node, 9 Python, cenário integrado em Chromium e geração de PDF passaram na linha de base de `QUALITY_BASELINE.md`.; B05: inserção repetida evita sobreposição quando há espaço. O catálogo pode ser acionado por Espaço com o botão em foco, enquanto o canvas conserva Espaço + arraste após receber foco. Esses cenários passaram em Chromium.; B06: impressão preserva o relógio da animação, conferido em Chromium com 3,5 s antes e depois.; B07: JSON reabre para edição; o modo HTTP salvou um projeto e o recuperou após recarregar. HTML e SVG abertos como documento no Chromium preservam animação; PNG e PDF representam um quadro estático. O SVG também renderizou como imagem estática no `rsvg-convert`. A interface e o guia explicam essas diferenças.; B08: nenhuma ampliação de catálogo foi selecionada para esta candidata. A matriz B01 registra hipóteses sem caso de uso confirmado; o backlog permite decidir o lançamento sem B08.; B02: a pessoa solicitante informou que não terá participantes nesta rodada. A observação de usuários permanece sem evidência; a revisão interna não substitui esse resultado.; B07: conferir outros leitores externos. A pessoa solicitante informou que não pode validar no Windows agora; a linha de base atual cobre Linux/Chromium e uma renderização estática com `rsvg-convert`.; Triar qualquer erro novo com ambiente, reprodução e impacto. Nenhum bloqueador foi confirmado nos cenários automatizados registrados até agora.; A pessoa solicitante decidiu adiar o lançamento para obter mais evidência. Nenhuma nova data foi informada..

### [docs/product/USER_JOURNEY_STUDY.md](docs/product/USER_JOURNEY_STUDY.md)

Assuntos documentados: Tarefas para cada participante; Registro por sessão; Revisão interna do projeto — 28/09/2026.

### [docs/sdd/README.md](docs/sdd/README.md)

Assuntos documentados: `spec.md` — comportamento observável e critérios de aceitação;; `plan.md` — arquitetura, arquivos afetados e riscos;; `tasks.md` — passos pequenos, testáveis e ordenados..
<!-- generated:docs-index:end -->
