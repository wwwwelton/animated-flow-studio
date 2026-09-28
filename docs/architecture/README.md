# Arquitetura do Animated Flow Studio

A documentação arquitetural do projeto segue uma abordagem leve: **C4 + fluxos + ADR + contratos + SDD**. O objetivo é explicar o sistema sem depender de UML formal e manter as decisões versionadas junto do código.

## Mapa de leitura

1. [`context.md`](context.md) — C4 nível 1: usuários, sistema e fronteiras.
2. [`containers.md`](containers.md) — C4 nível 2: editor, core SVG, runtime, build e API Python.
3. [`components.md`](components.md) — C4 nível 3: módulos principais do editor.
4. [`runtime.md`](runtime.md) — fluxo de edição, renderização, animação e exportação.
5. [`deployment.md`](deployment.md) — execução offline, HTTP local e distribuição.
6. [`../flows/`](../flows/) — fluxos operacionais importantes.
7. [`../adr/`](../adr/) — decisões arquiteturais e seus trade-offs.
8. [`../contracts/`](../contracts/) — contratos persistidos e interfaces públicas.
9. [`../sdd/`](../sdd/) — especificação e plano de implementação por feature.

Regra: documente **estrutura** em C4, **comportamento** em fluxos, **por quê** em ADR e **o que será implementado** em SDD.
