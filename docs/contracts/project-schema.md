# Contrato · Project JSON

O JSON exportado é a fonte portátil do diagrama. O schema lógico é validado por `FlowCore.normalize()`.

Campos principais:

- `version`, `title`, `kicker`, `description`;
- `width`, `height`, `autoGrow`, `growthMargin`, `grid`;
- `nodes[]` — componentes e geometria;
- `edges[]` — origem, destino, rota, conector e tráfego;
- `legends[]` — identidade visual e comportamento de cada fluxo;
- `trafficSpeed` e `showLegend`.

Compatibilidade deve ser preservada ao adicionar campos: novos campos devem possuir defaults e projetos antigos devem continuar normalizáveis.
