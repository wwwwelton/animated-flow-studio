# B03 — linha de base de qualidade

Estado: linha de base automatizada executada em 28/09/2026. Falta observação manual com participantes e abertura das exportações em leitores externos. A ausência de relato não equivale à ausência de defeito.

| Cenário | Resultado esperado | Evidência a registrar |
|---|---|---|
| Abrir e editar | Componentes podem ser criados, movidos, conectados e redimensionados; seleção e zoom continuam operando. | Navegador, projeto inicial, ações e resultado. |
| Tráfego | Tokens seguem o conector; pausa, retomada e velocidade preservam posição e significado. | Protocolo, path, velocidade, captura ou descrição visual. |
| Salvar e recuperar | JSON exportado volta ao editor com nós, conectores, legendas e ajustes. | Arquivo de exemplo, passos e comparação. |
| Apresentar e compartilhar | SVG/HTML animado e PNG/PDF estáticos seguem o comportamento documentado. | Formato, leitor/navegador e resultado. |

Para cada defeito confirmado, registrar ambiente, passos, resultado esperado e obtido, gravidade e evidência de reprodução antes de iniciar B04. Documentar limitações do formato separadamente de falhas do editor.

## Execução de referência

Ambiente: Linux, Node.js 26.8.2, Python 3.14.7, Chromium headless fornecido pelo Playwright; base Git `1fc5e00`. O fluxo de navegador abriu `editor.html` como arquivo local. Seu teste de fonte usa resposta de rede controlada, sem consultar a disponibilidade do Google Fonts.

| Verificação | Resultado observado |
|---|---|
| `node --test tests/*.cjs` | 62 testes passaram. Cobre dados, símbolos, paths de tráfego, direção, opacidade, estilos, PNG e portabilidade. |
| `uv run python3 -m unittest discover -s tests -v` | 9 testes passaram, incluindo roundtrip de dados e validação de componentes. |
| `node tests/editor-browser.js` | Passou: abrir, inserir/editar, conectar/reconectar, mover, zoom, undo/redo, animar e pausar, JSON exportado/reaberto, PNG 300 dpi, SVG e HTML animados; nenhum erro de página. |
| Chromium headless: impressão em PDF | `page.pdf()` produziu PDF válido de 397.106 bytes. `beforeprint` mostrou zero partículas animadas; `afterprint` restaurou cinco partículas no editor. |
| `uv run ruff check .` e `uv run ruff format --check .` | Passaram; 32 arquivos Python já formatados. |

O sandbox inicial impediu processos filhos do teste de portabilidade (`EPERM`) e a inicialização do Chromium (`Operation not permitted`). A suíte Node e o cenário de navegador foram repetidos fora dessa restrição e passaram; essas falhas iniciais não foram classificadas como defeitos do produto.

Nenhuma falha bloqueadora foi confirmada nos cenários automatizados acima. Ainda faltam observação de uso real e verificação manual da legibilidade de cada exportação em leitores externos. B04 não recebe correção de código sem um defeito reproduzido.

## Triagem complementar — impressão e inserção

Em Chromium, com animação pausada em 3,5 s, gerar PDF acionou `beforeprint` e `afterprint`; antes da correção, o SVG restaurado estava em 0 s. A causa era a leitura do relógio do SVG estático durante `draw()`. O editor agora guarda o tempo antes da impressão e recria o SVG animado a partir desse valor. A repetição do cenário terminou em 3,5 s. É uma falha de continuidade B06, sem perda do projeto.

Dois cliques seguidos em Processo usavam a mesma posição central. A nova busca de espaço livre colocou os nós em `(405, 188)` e `(615, 188)` no cenário de 1000 × 600 px. Quando não houver espaço livre dentro da página, a posição central continua sendo a alternativa; essa limitação deve ser observada nas sessões B02.

Após a correção, os 62 testes Node e o cenário integrado em Chromium passaram novamente. O SVG exportado nesse cenário também foi aberto pelo `rsvg-convert` e produziu uma imagem legível com três componentes e duas conexões; como esperado para um leitor de imagem, esse resultado é estático. O PNG exportado foi inspecionado visualmente e manteve texto e conexões legíveis. Outros leitores e Windows ainda não foram verificados.
