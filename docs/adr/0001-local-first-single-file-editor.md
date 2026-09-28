# ADR-0001 · Editor local-first e exportável como arquivo único

## Status
Accepted

## Contexto
O produto deve abrir rapidamente, funcionar offline e ser fácil de compartilhar sem infraestrutura obrigatória.

## Decisão
Manter o editor distribuível como `editor.html` autocontido, com runtime no navegador e backend opcional.

## Consequências
- Uso simples e portátil.
- Menor custo operacional.
- Recursos colaborativos em tempo real exigirão uma camada opcional futura, sem quebrar o modo local-first.
