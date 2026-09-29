# B02 — roteiro de observação da jornada principal

Estado: pronto para sessões, sem participantes observados ainda. Público: pessoas que criam fluxos de projetos. Registrar experiência prévia com diagramas, navegador, sistema operacional e se usam arquivo local ou servidor HTTP. Não registrar dados pessoais no repositório.

## Tarefas para cada participante

1. Abrir o editor e criar um fluxo Cliente → API → Banco de dados com três componentes.
2. Ligar os componentes, mover a API e ajustar um conector curvo.
3. Escolher uma legenda de tráfego, alterar velocidade e tamanho, pausar e retomar a animação.
4. Salvar JSON, reabrir o projeto e confirmar componentes, conexões e configurações.
5. Exportar HTML animado e PNG; explicar qual arquivo enviaria a outra pessoa.

Não ensinar o caminho antes de a pessoa tentar. Se ela pedir ajuda, registrar o ponto exato e a instrução dada. Ao final, pedir que identifique a ação mais difícil e o resultado que esperava. Repetir as mesmas tarefas em produtos comparados apenas quando houver tempo e acesso equivalente.

## Registro por sessão

| Campo | Valor a preencher |
|---|---|
| Sessão e data | Identificador anônimo; data |
| Perfil e ambiente | Experiência, navegador, sistema, modo arquivo/HTTP |
| Tarefa e resultado | Concluída, concluída com ajuda ou não concluída |
| Atrito observado | Ação, passo, resultado esperado/obtido e evidência sem dados pessoais |
| Gravidade | Bloqueia a tarefa, exige desvio ou apenas causa hesitação |
| Reprodução | Passos para repetir o problema e projeto JSON sem dados privados, se aplicável |
| Hipótese de melhoria | Referência ao atrito; manter como hipótese até priorização |

Antes de priorizar outras mudanças B05/B06, reunir os registros, separar defeitos reproduzíveis de dificuldade de descoberta e escolher as mudanças com maior impacto na tarefa. Nenhuma conclusão sobre usuários deve ser inferida apenas de uma revisão interna.

## Revisão interna do projeto — 28/09/2026

Esta revisão não contém participantes. Dois pontos verificáveis foram selecionados para correção enquanto as sessões são organizadas:

| Tarefa | Evidência interna | Resultado antes e depois |
|---|---|---|
| Inserir componentes repetidamente | `addNode` em `src/editor-main.js` usava sempre o centro do viewport. | Antes, cliques sucessivos no catálogo colocavam os nós sobre a mesma área. Agora o segundo nó procura espaço livre perto da seleção; em Chromium, dois processos ficaram em `(405, 188)` e `(615, 188)`, sem sobreposição. |
| Imprimir sem perder o estado da animação | `beforeprint` substituía o SVG animado e `afterprint` chamava `draw`, que lia o relógio do SVG estático. | Antes, o tempo passou de 3,5 s a 0 s. Após o ajuste, permaneceu em 3,5 s em Chromium. |

Esses resultados justificam as correções pontuais B05/B06, mas não identificam os atritos mais importantes para usuários. As sessões reais continuam necessárias para fechar B02 e priorizar outras mudanças.
