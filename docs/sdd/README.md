# Spec-Driven Development

Features maiores seguem este ciclo leve:

```text
Intent -> Requirements -> Spec -> Architecture/ADR -> Plan -> Tasks -> Code -> Tests
```

Para cada feature, crie `docs/sdd/<id>-<slug>/` com:

- `spec.md` — comportamento observável e critérios de aceitação;
- `plan.md` — arquitetura, arquivos afetados e riscos;
- `tasks.md` — passos pequenos, testáveis e ordenados.

Mudanças pequenas podem ir direto para código + teste quando não introduzem decisão arquitetural.
