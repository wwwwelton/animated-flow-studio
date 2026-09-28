# ADR-0003 · Escala visual consistente para tráfego e conectores

## Status
Accepted

## Contexto
Legenda, partículas animadas e pontas de seta usavam escalas independentes, causando diferenças perceptíveis de peso e tamanho.

## Decisão
Centralizar métricas visuais em `TRAFFIC_VISUAL`. Todas as legendas começam em 1 rem (16 unidades SVG); o tamanho configurado em cada legenda controla tanto o símbolo da legenda quanto suas partículas. O editor apresenta rem, enquanto o JSON preserva `size` em unidades SVG para compatibilidade. As geometrias dos protocolos compartilham um viewBox 16 × 16 e usam a mesma opacidade máxima dos marcadores comuns. Conectores usam seta base de 10 unidades, escalando suavemente com a espessura da linha.

## Consequências
- Legendas e fluxos ficam visualmente coerentes.
- Conectores grossos recebem setas proporcionais sem crescimento excessivo.
- Novos protocolos devem reutilizar as mesmas métricas.
