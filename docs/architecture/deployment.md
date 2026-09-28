# Deployment View

O produto não exige backend de produção.

```text
Distribuição ZIP
  ├─ editor.html       -> abre localmente
  ├─ assets/           -> catálogo SVG
  ├─ examples/         -> exemplos editáveis
  └─ Python opcional   -> servidor local / geração programática
```

Para desenvolvimento, Node.js executa testes e Playwright; Python/uv executa build, lint e testes da API.
