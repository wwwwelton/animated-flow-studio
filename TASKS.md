# Registro de execução

Base: versão 2.3 entregue anteriormente. O primeiro commit registra essa base.
O segundo preserva a implementação que já estava em andamento quando foi solicitada execução sequencial. A conclusão, os ajustes e a validação de cada tarefa passam a seguir a ordem de 1 a 11, com commits separados.

## 1 — Efeitos de tráfego
Concluída: marcador, pulso, brilho, rastro, cometa e fluxo tracejado; seis símbolos, tamanho e quantidade ajustáveis. Cometa usa cauda afilada e rastro usa marcadores separados. Validação: duas verificações Node, incluindo todas as combinações efeito/símbolo.

## 2 — Tipografia
Concluída: tamanho, subtítulo, bold, italic, code e família Google/local em todos os componentes e rótulos de conexões. Code preserva famílias monoespaçadas selecionadas. Teste real em Chromium validou controles, renderização em todos os tipos, download/incorporação binária com respostas HTTP controladas e fallback offline. A disponibilidade ao vivo do Google não é garantida pelo teste.

## 3 — Catálogo SVG
Concluída: 19 componentes de fluxograma em SVG independentes, manifesto extensível, compilação no editor offline e categoria custom separada. Corrigidos os caminhos dos manifests exportados; todos os arquivos referenciados foram resolvidos e analisados como XML. Guia de extensão em src/components/README.md.

## 4 — Velocidade
Concluída: velocidade global e por legenda de 0,1× a 8×, pausa e reinício. O tempo da conexão é dividido pelos dois multiplicadores. Validados o cálculo no motor e a duração real do animateMotion após alterar os controles em Chromium; pausa/reinício também conferidos.

## 5 — Centralização
Concluída: canvas centralizado na área de edição, ajuste à tela e botão Centralizar. Teste em Chromium cobriu abertura, redimensionamento da janela, zoom 100% e retorno ao ajuste automático.

## 6 — Tabelas
Concluída: presets SQL, NoSQL e Schema; 1–12 colunas, 0–40 linhas de dados, edição das células/cabeçalhos, cor e tipografia. Testes cobriram troca dos três modelos, expansão, conteúdo Unicode, zero linhas, JSON e desfazer a remoção de dados.

## 7 — Conectores
Concluída: seta de saída, entrada, curva, bidirecional, linha, tracejada, pontilhada e dupla. Testes verificaram marcadores/traçados SVG, seleção dos oito estilos no inspector e persistência ao reabrir.

## 8 — Zoom suave
Concluída: Ctrl/Cmd + scroll com interpolação, ancoragem no cursor e limites 5%–400%. Teste real do mouse confirmou aumento da escala, estabilidade do ponto sob o cursor, limite inferior e ausência de zoom sem modificador.

## 9 — Mover canvas
Concluída: arraste com botão esquerdo no fundo, botão do meio sobre qualquer região, Espaço + arraste e modo Mover canvas. Testes de mouse em Chromium confirmaram os quatro modos sem alterar as coordenadas dos componentes.

## 10 — Conexões por arraste
Concluída: quatro portas por componente, arraste para porta ou borda do destino, várias entradas/saídas na mesma porta, pares repetidos e reconexão das duas pontas. Testes cobriram fan-in/fan-out, duplicatas, posições de âncora, reconexão de origem/destino, undo/redo e rejeição de auto-conexão.

## 11 — Componente custom reativo
Concluída: categoria Custom separada, ícone à esquerda, texto à direita e borda preta. Entrada/saída alteram texto, cor ou ambos; filtro de legendas, duração da transição e retorno ao estado base configuráveis. Relógio sincronizado com pausa/velocidade. Testes unitários e Chromium cobriram filtros, eventos simultâneos, sentido reverso, opções independentes, transição CSS, pausa, JSON e SVG/HTML exportados reabertos. A exportação inclui o runtime após todos os elementos SVG.

## Entrega 3.0
Documentação e exemplos atualizados. Verificação final: 38 testes Node, 7 testes Python, tarefas de navegador isoladas 4–11, tipografia em navegador e cenário integrado com exportações reabertas, todos aprovados. SVGs de exemplo analisados como XML e interface/figura 3.0 revisadas visualmente. Fontes externas testadas com fixture de rede, não como prova de disponibilidade do Google. Pacote inclui histórico completo em history.bundle.

## Correção 3.0.1 — tarefa 1: documentação
README reorganizado para uma única versão, com execução por arquivo/HTTP, exemplos prontos, exemplo Python completo, desenvolvimento e recuperação do histórico antigo. Detalhes de uso separados em docs/GUIA_DO_EDITOR.md. Os comandos de distribuição/teste descrevem o contrato da correção 3.0.1, implementado na tarefa 2 seguinte.

## Correção 3.0.1 — tarefa 2: execução e distribuição
Corrigidos os três problemas reportados: distribuição com repositório .git completo; fonte TTF de teste incluída com licença, independente do sistema; runner sem argumentos executando tarefas 4–11 em ordem e com --help/validação de entrada. Adicionados package.json/package-lock.json para npm ci, Node 20+ compatível com a dependência fixada, URLs de arquivo portáveis e fechamento do navegador também em caso de erro. O empacotador cria um clone independente sem remotes/configurações pessoais e mantém history.bundle como cópia portátil.

Validação: npm ci; 40 testes Node; 7 testes Python; editor-typography.js; editor-browser.js; editor-task.js sem argumentos (oito tarefas); --help e argumentos inválidos; fonte incluída, override válido e override inválido; exemplo Python do README. Todos aprovados. Os testes de navegador usaram Chromium disponível neste ambiente; o CachyOS do usuário não foi executado aqui.

## 12 — Componentes e tráfego dos sete protocolos de API
Concluída: componentes SVG REST, GraphQL, gRPC, WebSockets, Webhooks, SSE e MQTT refinados no padrão de cartão do editor, com ícone à esquerda e texto legível à direita. Efeitos próprios disponíveis nas legendas de tráfego; modelo editável e demo HTML/SVG/JSON atualizados. Build e verificações de sintaxe JavaScript concluídos.

## Backlog para lançamento público

Origem: [BACKLOG.md](BACKLOG.md). Este registro acompanha execução; itens condicionais só viram mudança de produto após evidência. O histórico das tarefas 1–12 acima permanece como registro das entregas anteriores.

| Ordem | ID | Tarefa | Estado e próxima ação |
|---|---|---|---|
| 13 | B01 | Comparar criação, animação, edição e compartilhamento em produtos concorrentes. | Comparação documental concluída em `docs/product/COMPETITOR_REVIEW.md`; hipóteses de valor ainda aguardam observação de uso. |
| 14 | B02 | Observar a jornada principal com pessoas que criam diagramas de projetos. | A pessoa solicitante informou que não terá participantes. Roteiro e revisão interna registrados; critério de observação real não atendido nesta candidata. |
| 15 | B03 | Triar erros e registrar linha de base de interface, animação, salvamento e exportação. | Linha de base e triagem complementar em `docs/product/QUALITY_BASELINE.md`; encontrada e corrigida uma falha de continuidade após impressão. Falta observação manual. |
| 16 | B04 | Corrigir falhas bloqueadoras confirmadas pela triagem. | Nenhuma falha bloqueadora confirmada na linha de base automatizada; aguarda defeito reproduzido em B03/B02. |
| 17 | B05 | Melhorar ações repetidas de edição que apresentarem atrito. | Inserção repetida procura espaço livre; Espaço ativa botões do catálogo por teclado e continua habilitando o pan do canvas. Cenários Chromium passaram; prioridade de outros ajustes segue incerta sem B02. |
| 18 | B06 | Corrigir interrupções ou saltos de animação observados. | Impressão preserva o relógio da animação (3,5 s → 3,5 s em Chromium). Novos cenários dependem de B02/B03. |
| 19 | B07 | Conferir recuperação e apresentação por JSON e exportações. | JSON/SVG/PNG/HTML/PDF conferidos em Chromium; SVG estático renderizou no `rsvg-convert`. Editor por HTTP salvou e reabriu o projeto; outros leitores e Windows ainda pendentes. |
| 20 | B08 | Adicionar componentes ou opções ausentes com utilidade demonstrada. | Adiado nesta candidata: a comparação B01 gerou hipóteses, mas ainda não há caso de uso verificado por B02 ou pedido específico. Reavaliar após evidência. |
| 21 | B09 | Consolidar a versão candidata e a decisão de lançamento. | Decisão registrada em `docs/product/RELEASE_READINESS.md`: **adiar** a candidata `d8da778` para obter mais evidência. Reavaliar após B02 e validação no Windows. |
