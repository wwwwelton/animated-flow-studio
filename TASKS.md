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
