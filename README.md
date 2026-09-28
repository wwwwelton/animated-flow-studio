# Animated Flow Studio 3.0.1

Editor de fluxogramas e arquiteturas com tráfego animado em SVG. Possui 19 componentes de fluxograma, 81 símbolos de System Design (incluindo sete protocolos de API), tabelas SQL/NoSQL/Schema e componente Custom que alterna texto/cor conforme o tráfego. Os cartões usam borda preta, ícone à esquerda e texto à direita.

Este README descreve **o pacote 3.0.1**. O editor roda no navegador; Python é opcional para servir os arquivos, gerar exemplos ou reconstruir o projeto. Node.js e Playwright são usados somente no desenvolvimento e nos testes.

## 1. Como rodar o editor

Extraia o ZIP em uma pasta nova, entre em `animated_flow` e abra **`editor.html`** no navegador. Não precisa executar `npm install` para usar o editor.

Se preferir abrir por endereço HTTP, execute dentro da pasta:

```bash
cd animated_flow
uv run python3 -m http.server 8000 --bind 127.0.0.1
```

Acesse **http://127.0.0.1:8000/editor.html**. Use Ctrl+C para encerrar o servidor. No Windows sem `python3`, use `uv run python -m http.server 8000 --bind 127.0.0.1`.

As fontes locais funcionam offline. Google Fonts precisa de rede no primeiro carregamento; em caso de falha, o editor usa uma fonte de reserva e avisa. O projeto é salvo no navegador; exporte JSON para manter uma cópia e transferi-lo entre navegadores. Abrir por `file://` e por HTTP pode usar armazenamentos separados.

## 2. Exemplos prontos

Com o servidor acima em execução:

| Exemplo | Como abrir |
|---|---|
| Tabelas e componente reativo | http://127.0.0.1:8000/examples/v3-features.html |
| 7 protocolos de API e efeitos de tráfego | http://127.0.0.1:8000/examples/api-7-protocols.html ou o botão **7 protocolos de API** em Modelos |
| Fluxo de IA com Python | http://127.0.0.1:8000/demo.html |
| Diagrama dos protocolos para importar | `examples/api-7-protocols.json` |
| Prévia do diagrama | `examples/api-7-protocols.png` e `examples/api-7-protocols.svg` |
| Arquitetura de pedidos | Importe `examples/system-design.json` no editor |
| Todas as formas de fluxograma | Importe `examples/componentes.json` |
| Catálogo System Design | Importe `examples/system-design-catalog.json` |
| Cores personalizadas | Importe `examples/cores.json` |

Os HTMLs também podem ser abertos diretamente. JSONs são projetos editáveis; SVGs e PNGs na mesma pasta são visualizações. Para animações dos protocolos e reações de texto/cor, prefira o HTML: leitores que exibem SVG como imagem podem bloquear seu JavaScript. A exportação PNG registra 300 dpi e limita a imagem a 16 megapixels; diagramas grandes mostram um aviso se a resolução precisar ser reduzida. Todos os marcadores começam em 1 rem (16 unidades SVG). O tamanho de qualquer legenda pode ser editado entre 0,1875 e 2 rem; legenda e partículas usam o mesmo valor. O JSON e a API Python preservam o campo `size` em unidades SVG para manter projetos existentes compatíveis. Os símbolos de protocolo mantêm a geometria normalizada em um viewBox 16 × 16 e usam a mesma curva de opacidade dos marcadores de solicitação e resposta: 0 → 0,86 → 0,86 → 0 ao longo do percurso. O modelo de API usa as cores Bootstrap: REST azul, GraphQL rosa, gRPC roxo, WebSockets laranja, Webhooks vermelho, SSE ciano e MQTT verde. Webhooks percorre o conector em loop, com uma pausa curta entre eventos.

### Gerar um diagrama com Python

Requer `uv` e Python 3.10 ou superior. O projeto não usa bibliotecas Python de runtime:

```bash
uv run python example.py
```

O comando atualiza `demo.html` e `demo.json`. Abra o HTML para assistir ou importe o JSON no editor.

Para criar outro exemplo, salve o código abaixo em `meu_fluxo.py`, ao lado de `animated_flow.py`, e execute `uv run python meu_fluxo.py`:

```python
from animated_flow import Diagram, Node, Edge, Legend

flow = Diagram("Cliente e serviço", traffic_speed=1.5)
flow.add_legend(Legend("evento", "Evento", effect="comet", speed=2))
flow.add_node(Node("cliente", "Cliente", 40, 100, type="system", icon="sd:client"))
flow.add_node(
    Node(
        "servico",
        "Aguardando",
        380,
        100,
        type="reactive",
        icon="sd:server",
        typography={"fontSize": 16, "bold": True},
        reactive={
            "enterText": "Recebido",
            "exitText": "Enviando",
            "text": True,
            "color": True,
            "hold": 2,
        },
    )
)
flow.add_edge(Edge("cliente", "servico", traffic=("evento",), connector="curve", route="curve"))
flow.save("meu-fluxo.html")
flow.save_json("meu-fluxo.json")
```

## 3. Controles principais

| Ação | Controle |
|---|---|
| Inserir um componente | Biblioteca Fluxograma, System Design ou Custom |
| Editar texto, fonte, tamanho e cores | Selecione o componente; use o painel direito |
| Conectar | Arraste uma porta azul até outra porta ou componente |
| Reconectar | Selecione a linha e arraste uma das pontas |
| Zoom suave | Ctrl/Cmd + roda do mouse |
| Mover o canvas | Arraste o fundo; ou botão do meio; ou Espaço + arraste |
| Centralizar | Centralizar / Ajustar à tela |
| Ajustar efeitos e velocidade | Abra uma legenda de tráfego pelo nome |
| Desfazer/refazer | Ctrl/Cmd+Z / Ctrl/Cmd+Shift+Z |
| Guardar o projeto | Exportar JSON |

Detalhes de tabelas, efeitos, conectores, eventos e exportações estão em [docs/GUIA_DO_EDITOR.md](docs/GUIA_DO_EDITOR.md).

A arquitetura é documentada de forma leve com **C4 + fluxos + ADR + contratos + SDD**. Comece por [docs/architecture/README.md](docs/architecture/README.md); decisões ficam em [docs/adr/](docs/adr/) e specs de features em [docs/sdd/](docs/sdd/).

## 4. Desenvolvimento e testes

Requer Python 3.10+ e Node.js 20+. Execute os comandos na raiz `animated_flow`.

Instale `uv` seguindo a [documentação oficial](https://docs.astral.sh/uv/getting-started/installation/). `uv sync` cria o ambiente virtual e instala as ferramentas de desenvolvimento, incluindo o Ruff. O arquivo `uv.lock` fixa as versões para reproduzir esse ambiente.

### Build, lint e testes sem navegador

```bash
uv sync
uv run ruff check .
uv run ruff format --check .
uv run python build.py
node --test tests/*.cjs
uv run python3 -m unittest discover -s tests -v
```

### Testes com navegador

```bash
npm ci
npx playwright install chromium
node tests/editor-typography.js
node tests/editor-browser.js
node tests/editor-task.js
```

`node tests/editor-task.js` executa as tarefas 4–11 em sequência, cada uma com sessão isolada. Para escolher uma ou consultar a ajuda:

```bash
node tests/editor-task.js 10
node tests/editor-task.js --all
node tests/editor-task.js --help
```

Também há atalhos: `npm test`, `npm run test:typography`, `npm run test:browser` e `npm run test:tasks`.

A fonte usada nos testes está incluída em `tests/fixtures/DejaVuSans.ttf`, junto da licença. **Não é necessário instalar fontes no sistema.** Opcionalmente, `AFS_TEST_FONT_PATH` seleciona outro arquivo TTF; um caminho inválido gera mensagem clara.

No CachyOS/Arch/WSL, o aviso `OS is not officially supported` informa que o Playwright escolheu uma distribuição alternativa. Se o download terminou, isso não é falha de instalação. Caso o navegador efetivamente não inicie, examine o erro de inicialização; também é possível selecionar um Chromium já instalado:

```bash
AFS_BROWSER_PATH="$(command -v chromium)" node tests/editor-browser.js
```

Use esse comando somente se `command -v chromium` retornar um executável. `AFS_BROWSER_PATH` aceita qualquer caminho absoluto válido para um Chromium compatível. Os testes são headless e não exigem abrir uma janela gráfica.

Os testes de fontes usam respostas de rede controladas, incluindo bytes de fonte real; eles não verificam a disponibilidade ao vivo do Google Fonts. A validação desta entrega em Chromium não comprova compatibilidade com todo sistema operacional.

## 5. Git e histórico de commits

O ZIP 3.0.1 contém um repositório Git completo em **`.git/`**, com os commits anteriores e as correções desta versão. Após extrair em uma pasta nova:

```bash
cd animated_flow
git status
git log --oneline
```

Não é necessário `git init`, nem definir `GIT_DISCOVERY_ACROSS_FILESYSTEM`.

**Se você ainda usa o pacote anterior:** ele continha somente `history.bundle`, sem `.git`. Para recuperar seu histórico em uma nova pasta, preservando a pasta atual:

```bash
# Execute dentro da pasta antiga que contém history.bundle
git clone history.bundle ../animated-flow-recuperado
cd ../animated-flow-recuperado
git log --oneline
```

Esse comando recupera os arquivos commitados no bundle. Alterações locais que você fez na pasta antiga devem ser copiadas depois para a nova pasta. O bundle continua incluído como cópia portátil do histórico.

## 6. Estrutura e extensão

| Caminho | Finalidade |
|---|---|
| `editor.html` | Editor pronto para abrir |
| `animated_flow.py`, `example.py` | API e exemplo Python |
| `src/core-engine.js`, `canvas.js`, `icons.js`, `templates.js` | Motor, geometria, ícones e modelos |
| `src/editor-*.js`, `editor.css`, `editor-shell.html` | Interface e controles |
| `src/traffic-runtime.js`, `font-manager.js` | Eventos e fontes |
| `src/components/` | Formas SVG parametrizadas e manifesto |
| `assets/flowchart/`, `assets/system-design/`, `assets/custom/` | SVGs individuais |
| `tests/` | Testes puros e testes de navegador |
| `examples/` | Projetos e exportações |
| `TASKS.md` | Registro histórico das tarefas |

Para adicionar uma forma SVG, siga [src/components/README.md](src/components/README.md) e execute `uv run python build.py`. `src/flow-core.js`, `src/editor.js` e `editor.html` são gerados: altere os módulos de origem.

Para gerar o ZIP de distribuição, com Git completo e bundle:

```bash
uv run python tools/package_release.py
```

O comando requer Git, uma branch ativa e árvore de trabalho limpa; grava o pacote em `dist/animated-flow-studio.zip`. Ele empacota os arquivos commitados e não inclui `node_modules`, caches ou configurações pessoais do repositório.

Limites do editor: 500 componentes, 1000 conexões e 20 legendas; tabelas com 1–12 colunas e 0–40 linhas. Não há importação `.drawio`/Mermaid/BPMN, auto-conexões ou roteamento completo para evitar obstáculos.
