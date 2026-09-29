# Backlog de produto — Animated Flow Studio

## Objetivo e base de decisão

Preparar para lançamento público um editor de diagramas de projetos com fluxo animado e mais de 80 componentes SVG de System Design. Os usuários prioritários são pessoas que criam fluxos de projetos. Segundo a entrevista, a qualidade da interface, a suavidade de uso e das animações devem orientar a próxima sequência de trabalho.

**Fatos documentados no repositório:** a versão 3.0.1 oferece 81 símbolos de System Design, 19 componentes de fluxograma, edição no navegador, tráfego animado e exportação em JSON, SVG, PNG e HTML. `TASKS.md` registra a conclusão das tarefas da versão 3.0 e de correções da 3.0.1. Esses recursos não entram novamente como entregas pendentes.

**Decisão expressa na entrevista:** examinar opções dos concorrentes e possíveis lacunas antes de decidir o que acrescentar para o lançamento. Adicionar componentes, corrigir erros e criar funcionalidades são sinais de avanço, mas ainda não há lista de lacunas ou erros confirmados.

**Hipótese de planejamento:** melhorar os fluxos principais de edição e animação terá mais valor imediato que ampliar o catálogo já existente. A comparação com concorrentes e a observação de usuários devem confirmar ou alterar essa ordem.

## Critério de prioridade

A ordem abaixo é **provisória**. Valor para a jornada principal, risco para a confiança no produto e capacidade de desbloquear decisões vêm primeiro; esforço e dependências servem para ordenar itens de valor semelhante. **P0** antecede a decisão de lançamento; **P1** depende das evidências dos itens P0; **P2** permanece como oportunidade. Não há prazo, capacidade da equipe ou responsável definidos, portanto os marcos indicam sequência, não datas.

| ID | Prioridade | Item e resultado esperado | Dependências e risco | Critérios verificáveis |
|---|---|---|---|---|
| B01 | P0 | **Comparar produtos concorrentes.** Identificar opções relevantes para criar, animar, editar e compartilhar diagramas de projetos; registrar lacunas reais e pontos fortes do editor. | Depende da escolha de produtos e tarefas comparáveis. Risco: transformar presença de uma opção concorrente em requisito sem evidência de valor para o usuário. | Matriz com produtos avaliados, data, fonte ou observação reproduzível, tarefa comparada e situação no Animated Flow Studio. Cada lacuna candidata traz impacto esperado, evidência e incerteza; nenhuma entra automaticamente como funcionalidade comprometida. |
| B02 | P0 | **Observar a jornada principal.** Verificar onde usuários encontram dificuldade ao criar componentes, conectar, ajustar animações e exportar um fluxo. | Requer participantes representativos e tarefas definidas. Risco: priorizar preferências da equipe sem observar uso. | Registro das tarefas realizadas, pontos de atrito observados, gravidade e passos para reproduzi-los. As melhorias propostas apontam para uma observação ou são marcadas como hipótese. |
| B03 | P0 | **Triar erros e estabelecer uma linha de base de qualidade.** Reproduzir problemas de interface, animação, salvamento e exportação antes de ordenar correções. | Pode avançar junto com B01 e B02. Faltam relatos de erros específicos; não se presume que haja regressões conhecidas. | Cada erro confirmado registra ambiente, passos, resultado esperado e obtido, impacto e evidência de reprodução. Os fluxos principais têm uma verificação de referência, incluindo projeto salvo e reaberto e exportações aplicáveis. |
| B04 | P0 | **Corrigir falhas confirmadas que impeçam a jornada principal.** Restaurar a criação, edição, animação ou recuperação de diagramas quando B03 encontrar defeitos de alto impacto. | Depende de reprodução em B03. O escopo só pode ser fechado após a triagem. | Para cada correção, o cenário que falhava passa a funcionar, há verificação de regressão pertinente e o resultado é conferido no navegador. Nenhum erro bloqueador confirmado permanece aberto na decisão de lançamento. |
| B05 | P1 | **Melhorar a fluidez da interface.** Reduzir os pontos de atrito mais relevantes encontrados em B02, especialmente nas ações repetidas de edição. | Depende de B02 para escolher mudanças concretas e de uma referência de comportamento para avaliar o resultado. Risco: “interface de qualidade” é subjetivo sem tarefas observáveis. | Cada mudança tem um cenário de antes e depois. Usuários conseguem concluir a tarefa afetada sem o obstáculo registrado; ações de arrastar, conectar, mover e usar zoom preservam o diagrama e não introduzem regressões nos fluxos relacionados. |
| B06 | P1 | **Aprimorar a continuidade das animações.** Investigar interrupções, saltos ou perda de sincronização percebidos nos cenários levantados em B02 e B03. | Depende de cenários reproduzíveis. O projeto já dispõe de velocidade, pausa, reinício e efeitos de tráfego; a entrega deve tratar problemas observados nesses comportamentos. | Os cenários escolhidos mantêm percurso e estado visual coerentes ao iniciar, pausar, retomar, alterar velocidade e reabrir a exportação apropriada. A validação registra navegador, cenário e resultado visual observado. |
| B07 | P1 | **Revisar a confiabilidade do compartilhamento.** Conferir se uma pessoa consegue preservar e apresentar o trabalho por JSON e pelas exportações oferecidas. | Depende da linha de base de B03. Risco conhecido na documentação: o salvamento no navegador não substitui uma cópia transferível em JSON; leitores que exibem SVG como imagem podem restringir a animação. | Um projeto representativo é exportado, reimportado quando aplicável e apresentado nos formatos documentados. Diferenças e limitações são registradas de forma compreensível para o usuário; defeitos encontrados recebem prioridade conforme impacto. |
| B08 | P2 · hipótese | **Ampliar o catálogo ou adicionar opções ausentes.** Selecionar apenas componentes e funcionalidades cuja utilidade seja sustentada por B01, B02 ou pedidos verificáveis. | Depende das evidências de B01 e B02 ou de um pedido específico da pessoa solicitante. Risco: aumentar o número de opções sem melhorar a criação de fluxos. | Para cada adição aprovada, há caso de uso, comportamento esperado, posição no catálogo e critério de aceitação próprio. Componentes novos aparecem no editor e sobrevivem a salvar, reabrir e exportar. Itens sem evidência permanecem como hipótese. |
| B09 | P1 | **Preparar a decisão de lançamento público.** Consolidar evidências de qualidade, problemas conhecidos, documentação e escopo da versão candidata. | Depende de B01–B04 e da validação das entregas escolhidas em B05–B08. Publicar é uma decisão humana explícita. | Registro da versão candidata, testes e cenários executados, erros abertos com impacto, limitações comunicadas e decisão humana de lançar ou adiar. A documentação descreve o comportamento efetivamente entregue. |

## Marcos e decisões

| Marco | Resultado demonstrável | Condição para avançar |
|---|---|---|
| **M1 — Evidência para priorização** | Matriz de concorrentes, observação da jornada e triagem de erros concluídas. | Revisar a ordem de B04–B08 com base nas lacunas e nos problemas confirmados. |
| **M2 — Fluxo principal confiável** | Criar, editar, animar, salvar e recuperar um diagrama representativo funciona nos cenários acordados; falhas bloqueadoras confirmadas foram resolvidas. | Validar os cenários no navegador e registrar problemas restantes e seu impacto. |
| **M3 — Versão candidata ao público** | Melhorias selecionadas estão verificadas, exportações e documentação foram conferidas, e há um registro de riscos residuais. | Pessoa responsável pelo produto decide publicar ou adiar com base nas evidências de B09. |

Uma versão menor pode seguir para decisão em M3 sem B08 se o fluxo principal estiver confiável e as lacunas adiadas estiverem registradas. Uma falha confirmada que impeça criar, recuperar ou apresentar o diagrama exige nova avaliação antes do lançamento.

## Decisões operacionais baseadas no projeto

- B01 compara Whimsical, diagrams.net e Excalidraw/Excalidraw+ nas tarefas de criar, conectar, animar quando disponível, editar, exportar e reabrir um fluxo de três componentes. A matriz e as fontes estão em `docs/product/COMPETITOR_REVIEW.md`.
- B02 usa a jornada Cliente → API → Banco de dados de `docs/product/USER_JOURNEY_STUDY.md`. A revisão interna do código orienta correções pequenas e reproduzíveis; ela não substitui sessões com pessoas do público prioritário.
- Para a linha de base B03, “suave” significa que inserir componentes repetidamente evita sobreposição quando há espaço, mover/conectar/usar zoom preserva o diagrama e imprimir não reinicia o relógio de tráfego. Interrupções percebidas por usuários ainda precisam ser observadas.
- B04–B06 podem corrigir defeitos reproduzidos internamente enquanto B02 aguarda participantes. A pessoa solicitante autorizou a escolha de uma melhoria baseada nos concorrentes: SVG do diagrama com projeto editável embutido, registrado em `docs/product/COMPETITOR_REVIEW.md`. Outras funcionalidades de B08 continuam condicionadas a um caso de uso comprovado.

## Decisões e limites desta candidata

- A pessoa solicitante informou que não terá participantes para B02. A revisão interna continua útil para defeitos reproduzíveis, mas os critérios de observação de usuários de B02 permanecem sem atendimento; isso é um risco explícito para a decisão B09.
- A pessoa solicitante decidirá o lançamento. Não haverá validação no Windows agora; a evidência de navegador desta rodada é de Linux/Chromium.
- Nenhuma data de lançamento ou compromisso externo foi informada. Outras opções de B08 permanecem adiadas até existir um caso de uso verificável.
- Em 28/09/2026, a pessoa solicitante decidiu adiar a candidata `d8da778` para obter mais evidência. O registro da decisão e do pacote avaliado está em `docs/product/RELEASE_READINESS.md`. Melhorias posteriores não mudam essa decisão nem constituem uma nova versão candidata.

Revisar este backlog ao concluir M1 e sempre que surgir um erro de alto impacto ou nova evidência de uso. Pedidos e opções de concorrentes devem permanecer identificados como **hipóteses** até receberem caso de uso, prioridade e critérios verificáveis.
