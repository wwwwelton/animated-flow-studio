# C4 · Containers

```mermaid
flowchart LR
    Browser[Editor HTML] --> Core[FlowCore · SVG renderer/schema]
    Browser --> Runtime[FlowTraffic · animações]
    Browser --> Fonts[Font manager]
    Browser --> Store[localStorage]
    Browser --> Exports[Exportadores]
    Build[build.py] --> Browser
    Build --> Core
    Py[animated_flow.py] --> CoreContract[JSON/SVG contract]
```

| Container | Responsabilidade |
|---|---|
| `editor.html` | aplicação final autocontida |
| `src/core-engine.js` | schema, geometria e renderização SVG pura |
| `src/editor-*.js` | estado, interação e UI |
| `src/traffic-runtime.js` | execução do tráfego animado |
| `src/font-manager.js` | fontes locais/remotas e embedding |
| `build.py` | compila módulos e manifests nos artefatos finais |
| `animated_flow.py` | API Python opcional para geração programática |
