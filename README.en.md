# Animated Flow Studio 3.0.1

[Português (Brasil)](README.md)

A flowchart and architecture editor with animated SVG traffic. The package described in this README includes 19 flowchart components, 81 System Design symbols, seven API protocols, SQL/NoSQL/Schema components, and a Custom component with traffic-reactive text and color.

> This README describes package 3.0.1. The editor runs in a browser. Python is optional for serving the files or generating examples; Node.js and Playwright are used for development and tests.

![Example flowchart](public/fluxograma.svg)

## Get started

### Open the editor

Extract the package into a folder and open `editor.html` in your browser. No dependencies need to be installed to use the editor.

To serve it over HTTP, open a terminal at the project root:

```bash
uv run python3 -m http.server 8000 --bind 127.0.0.1
```

Open <http://127.0.0.1:8000/editor.html>. On Windows, if `python3` is unavailable, use:

```powershell
uv run python -m http.server 8000 --bind 127.0.0.1
```

Press `Ctrl+C` to stop the server. Opening the editor through `file://` and HTTP may use separate storage. Projects are saved in the browser; export JSON to keep a copy or move a project to another browser.

Local fonts work offline. Google Fonts requires a network connection on first load; if the request fails, the editor uses a fallback font and displays a notice.

## Examples

Open the HTML examples directly or through the local server:

| Example | File or action |
| --- | --- |
| Tables and reactive component | [`examples/v3-features.html`](examples/v3-features.html) |
| Seven API protocols and traffic | [`examples/api-7-protocols.html`](examples/api-7-protocols.html) or the **7 protocolos de API** button in Templates |
| AI flow with Python | [`demo.html`](demo.html) |
| Editable protocol project | Import [`examples/api-7-protocols.json`](examples/api-7-protocols.json) |
| Protocol previews | [`examples/api-7-protocols.png`](examples/api-7-protocols.png) and [`examples/api-7-protocols.svg`](examples/api-7-protocols.svg) |
| Request architecture | Import [`examples/system-design.json`](examples/system-design.json) |
| Flowchart components | Import [`examples/componentes.json`](examples/componentes.json) |
| System Design catalog | Import [`examples/system-design-catalog.json`](examples/system-design-catalog.json) |
| Custom colors | Import [`examples/cores.json`](examples/cores.json) |

The JSON files are editable projects; PNGs and SVGs in `examples/` are previews. Animated and static SVGs exported by the editor include project data and can be reopened through **Arquivo → Abrir projeto JSON ou SVG editável** (File → Open editable JSON or SVG project). Regular SVGs, older SVGs without this data, and component SVGs cannot be imported as projects.

For protocol animations and reactive text/color, prefer HTML export: some viewers that display SVG as an image block its JavaScript. PNG export records 300 dpi and limits the image to 16 megapixels; large diagrams may require lower resolution. Markers start at 1 rem (16 SVG units). Legend sizes can be changed from 0.1875 to 2 rem, and particles follow the legend size. JSON and the Python API preserve the `size` field in SVG units for compatibility with existing projects.

Protocol symbols use normalized geometry in a 16 × 16 `viewBox` and share the request/response marker opacity curve: `0 → 0.86 → 0.86 → 0`. API template colors are REST blue, GraphQL pink, gRPC purple, WebSockets orange, Webhooks red, SSE cyan, and MQTT green. Webhooks loop along the connector, with a short pause between events.

## Editor controls

| Action | How to use it |
| --- | --- |
| Add a component | Use the Flowchart, System Design, or Custom libraries |
| Edit text, font, size, or colors | Select the component and use the right panel |
| Connect components | Drag a blue port to another port or component |
| Reconnect a line | Select the line and drag one of its endpoints |
| Smooth zoom | `Ctrl`/`Cmd` + mouse wheel |
| Pan the canvas | Drag the background, use the middle mouse button, or `Space` + drag |
| Center the diagram | Use **Centralizar / Ajustar à tela** (Center / Fit to screen) |
| Adjust traffic and speed | Open a traffic legend by name |
| Undo/redo | `Ctrl`/`Cmd` + `Z` / `Ctrl`/`Cmd` + `Shift` + `Z` |
| Save the project | Export JSON or SVG from the editor |

The detailed guide is in [`docs/GUIA_DO_EDITOR.md`](docs/GUIA_DO_EDITOR.md).

## Generate a diagram with Python

Requires `uv` and Python 3.10 or later. The project has no Python runtime libraries. To generate the included examples:

```bash
uv run python example.py
```

This command updates `demo.html` and `demo.json`. Open the HTML in a browser or import the JSON into the editor.

Python API example:

```python
from animated_flow import Diagram, Edge, Legend, Node

flow = Diagram("Client and service", traffic_speed=1.5)
flow.add_legend(Legend("event", "Event", effect="comet", speed=2))
flow.add_node(Node("client", "Client", 40, 100, type="system", icon="sd:client"))
flow.add_node(
    Node(
        "service",
        "Waiting",
        380,
        100,
        type="reactive",
        icon="sd:server",
        typography={"fontSize": 16, "bold": True},
        reactive={
            "enterText": "Received",
            "exitText": "Sending",
            "text": True,
            "color": True,
            "hold": 2,
        },
    )
)
flow.add_edge(Edge("client", "service", traffic=("event",), connector="curve", route="curve"))
flow.save("my-flow.html")
flow.save_json("my-flow.json")
```

Save the code as `my_flow.py` next to `animated_flow.py`, then run `uv run python my_flow.py`.

## Development and tests

Requires Python 3.10 or later and Node.js 20 or later. Run commands from the project root. Install `uv` using the [official documentation](https://docs.astral.sh/uv/getting-started/installation/). `uv sync` creates the virtual environment and installs development tools, including Ruff; `uv.lock` pins the versions for this environment.

### Build, lint, and tests without a browser

```bash
uv sync
uv run ruff check .
uv run ruff format --check .
uv run python build.py
node --test tests/*.cjs
uv run python3 -m unittest discover -s tests -v
```

### Browser tests

```bash
npm ci
npx playwright install chromium
node tests/editor-typography.js
node tests/editor-browser.js
node tests/editor-task.js
```

`node tests/editor-task.js` runs tasks 4–11 in isolated sessions. To run a specific task or view help:

```bash
node tests/editor-task.js 10
node tests/editor-task.js --all
node tests/editor-task.js --help
```

Available shortcuts: `npm test`, `npm run test:typography`, `npm run test:browser`, and `npm run test:tasks`.

The font used by tests is included at `tests/fixtures/DejaVuSans.ttf`, along with its license. You do not need to install fonts system-wide. Optionally, `AFS_TEST_FONT_PATH` selects another TTF file; an invalid path produces a clear error.

On CachyOS, Arch, or WSL, the `OS is not officially supported` notice means Playwright selected an alternative distribution. If the browser does not start, inspect the launch error. You can also select an installed Chromium:

```bash
AFS_BROWSER_PATH="$(command -v chromium)" node tests/editor-browser.js
```

Use this command only if `command -v chromium` returns an executable. `AFS_BROWSER_PATH` accepts an absolute path to a compatible Chromium binary. Tests run headlessly and do not require a graphical window.

Font tests use controlled network responses, including real font bytes; they do not check live Google Fonts availability. Chromium validation does not prove compatibility with every operating system.

## Architecture and project structure

The architecture uses C4, flows, ADRs, contracts, and SDD. Start with [`docs/architecture/README.md`](docs/architecture/README.md); decisions are in [`docs/adr/`](docs/adr/) and feature specifications are in [`docs/sdd/`](docs/sdd/). The release plan is in [`BACKLOG.md`](BACKLOG.md), tasks in [`TASKS.md`](TASKS.md), and product materials in [`docs/product/`](docs/product/).

| Path | Purpose |
| --- | --- |
| `editor.html` | Browser-ready editor |
| `animated_flow.py`, `example.py` | Python API and example |
| `src/core-engine.js`, `canvas.js`, `icons.js`, `templates.js` | Engine, geometry, icons, and templates |
| `src/editor-*.js`, `editor.css`, `editor-shell.html` | Interface and controls |
| `src/traffic-runtime.js`, `font-manager.js` | Traffic events and fonts |
| `src/components/` | Parametric SVG shapes and manifest |
| `assets/flowchart/`, `assets/system-design/`, `assets/custom/` | Component SVG files |
| `tests/` | Unit and browser tests |
| `examples/` | Example projects and exported previews |
| `TASKS.md` | Task log |

To add an SVG shape, follow [`src/components/README.md`](src/components/README.md) and run `uv run python build.py`. `src/flow-core.js`, `src/editor.js`, and `editor.html` are generated; edit the source modules instead.

To create the distribution ZIP with the Git history:

```bash
uv run python tools/package_release.py
```

The command requires Git, an active branch, and a clean working tree. It writes `dist/animated-flow-studio.zip`; ignored files such as `node_modules`, caches, and personal repository settings are excluded.

The distribution ZIP includes the complete Git repository in `.git/`. After extracting it, inspect the history with:

```bash
git status
git log --oneline
```

You do not need to run `git init` or set `GIT_DISCOVERY_ACROSS_FILESYSTEM`. To recover history from an older package containing only `history.bundle`, run this in a new folder:

```bash
git clone history.bundle ../animated-flow-recovered
cd ../animated-flow-recovered
git log --oneline
```

This recovers files committed in the bundle. Copy any uncommitted local changes from the old folder afterward.

## Known limits

The editor supports up to 500 components, 1,000 connections, and 20 legends. Tables support 1–12 columns and 0–40 rows. Importing `.drawio`, Mermaid, or BPMN files, automatic connections, and full obstacle-avoiding routing are not available.

## Updates

The project is updated regularly with bug fixes and code optimizations.

## License and credits

This project is licensed under the GNU General Public License v3.0. See [`LICENSE`](LICENSE) for the full terms.

---

Developed by Welton Leite  👋 <br/>
[LinkedIn](https://www.linkedin.com/in/welton-leite-b3492985/) · [GitHub](https://github.com/wwwwelton)
