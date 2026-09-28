# Runtime View

## Edição e renderização

```mermaid
sequenceDiagram
    actor U as Usuário
    participant E as Editor
    participant C as FlowCore
    participant S as SVG
    U->>E: altera componente/conexão
    E->>C: normalize(project)
    C-->>E: projeto validado
    E->>C: render(project)
    C-->>E: SVG
    E->>S: substitui board
```

## Tráfego

Cada legenda define símbolo/efeito, tamanho, velocidade e direção. As conexões referenciam uma ou mais legendas. O renderer produz trilhos e markers; o runtime monta as animações respeitando `prefers-reduced-motion`.
