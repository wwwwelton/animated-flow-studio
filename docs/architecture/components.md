# C4 · Components

## Editor

```mermaid
flowchart TB
    State[Project state] --> Normalize[normalize]
    Normalize --> Render[render]
    Render --> SVG[SVG board]
    Input[Pointer / keyboard] --> Actions[editor actions]
    Actions --> State
    Palette[component manifests] --> Actions
    State --> Inspect[Inspector]
    State --> Legend[Traffic legend editor]
    State --> Export[Export pipeline]
```

### Regras de dependência

- `core-engine.js` permanece sem DOM e sem rede.
- UI pode depender do core; core não depende da UI.
- arquivos gerados (`flow-core.js`, `editor.js`, `editor.html`) não são fonte primária de edição.
- componentes SVG entram pelo manifesto e pelo build.
