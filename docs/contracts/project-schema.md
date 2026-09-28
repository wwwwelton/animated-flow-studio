# Contrato · Project JSON

O JSON exportado é a fonte portátil do diagrama. O schema lógico é validado por `FlowCore.normalize()`.

Campos principais:

- `version`, `title`, `kicker`, `description`;
- `width`, `height`, `autoGrow`, `growthMargin`, `grid`;
- `nodes[]` — componentes e geometria;
- `edges[]` — origem, destino, rota, conector e tráfego;
- `legends[]` — identidade visual e comportamento de cada fluxo;
- `trafficSpeed` e `showLegend`.

`legends[].size` usa unidades SVG: 16 corresponde ao tamanho inicial de 1 rem exibido no editor. Valores antigos continuam válidos; a interface converte entre rem e unidades SVG ao editar.

Compatibilidade deve ser preservada ao adicionar campos: novos campos devem possuir defaults e projetos antigos devem continuar normalizáveis.
