# ADR-0002 · Arquitetura como código leve

## Status
Accepted

## Contexto
UML completo adicionaria manutenção e formalidade desnecessárias para o tamanho e ritmo do projeto.

## Decisão
Usar C4 em Markdown/Mermaid, fluxos, ADRs e contratos versionados no Git. SDD registra requisitos, plano e tarefas de features maiores.

## Consequências
- Documentação revisável em pull requests.
- Diagramas permanecem próximos do código.
- Não há obrigação de modelar classes ou cada detalhe interno.
