# ADR-0003 · Escala visual consistente para tráfego e conectores

## Status
Accepted

## Contexto
Legenda, partículas animadas e pontas de seta usavam escalas independentes, causando diferenças perceptíveis de peso e tamanho.

## Decisão
Centralizar métricas visuais em `TRAFFIC_VISUAL`. A legenda usa 16 unidades (mesma referência do tráfego padrão) e conectores usam seta base de 10 unidades, escalando suavemente com a espessura da linha.

## Consequências
- Legendas e fluxos ficam visualmente coerentes.
- Conectores grossos recebem setas proporcionais sem crescimento excessivo.
- Novos protocolos devem reutilizar as mesmas métricas.
