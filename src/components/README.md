# Componentes SVG

Edite os arquivos desta pasta e execute `uv run python build.py` na raiz. O editor distribuído é autocontido; não precisa buscar arquivos SVG durante o uso.

Para adicionar uma forma:

1. Crie `flowchart/minha-forma.svg` ou `custom/minha-forma.svg` com `viewBox="0 0 100 100"` e `preserveAspectRatio="none"`.
2. Use `{{fill}}` e `{{stroke}}` para cores editáveis, `vector-effect="non-scaling-stroke"` nas bordas.
3. Adicione ao `manifest.json` um objeto com `id` único, `label`, `category: "flowchart"`, `file: "flowchart/minha-forma.svg"`, `renderer: "standard"`, `width`, `height` e `textInset` (fração da largura usada como margem).
4. Use `category: "flowchart"` ou `category: "custom"` no manifesto e execute o build. A forma entra no catálogo, na paleta, na validação JSON e nas exportações. Para cartões com o desenho no alto e rótulo embaixo, defina `renderer: "protocol"`, `width: 205`, `height: 104`; o renderer reserva a área superior para o SVG. Confira o texto dentro da geometria e as conexões laterais.

São permitidos svg, g, path, rect, circle, ellipse, polygon, polyline e line. Scripts, eventos, estilos arbitrários e recursos externos são rejeitados. O renderer usa a geometria original e aplica a tipografia separadamente.

`table` e `reactive` têm comportamento especializado em `src/core-engine.js`; `reactive` também usa `src/traffic-runtime.js`. O campo renderer documenta esses casos; criar outro comportamento exige implementá-lo no motor. Novas formas estáticas não precisam de alterações no motor.

O build exporta SVGs individuais e manifests separados em `assets/flowchart` e `assets/custom`. Cada `file` de um manifest exportado é relativo à própria pasta. Os 74 ícones de System Design permanecem em `assets/system-design`.
