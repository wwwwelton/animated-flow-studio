# ADR-0003 · Escala visual consistente para tráfego e conectores

## Status
Accepted

## Contexto
Legenda, partículas animadas e pontas de seta usavam escalas independentes, causando diferenças perceptíveis de peso e tamanho.

## Decisão
Centralizar métricas visuais em `TRAFFIC_VISUAL`. A legenda genérica usa 16 unidades por padrão e os protocolos usam 14 unidades por padrão; o tamanho configurado em cada legenda controla tanto o símbolo da legenda quanto suas partículas. As geometrias dos protocolos compartilham um viewBox 16 × 16. Conectores usam seta base de 10 unidades, escalando suavemente com a espessura da linha.

## Consequências
- Legendas e fluxos ficam visualmente coerentes.
- Conectores grossos recebem setas proporcionais sem crescimento excessivo.
- Novos protocolos devem reutilizar as mesmas métricas.
