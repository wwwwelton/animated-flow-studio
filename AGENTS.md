# Diretrizes para agentes de desenvolvimento

Este arquivo orienta alterações neste repositório. Aplique as regras ao código que criar ou modificar; não faça reformas fora do escopo da tarefa. Instruções específicas do projeto, convenções do framework e decisões de arquitetura documentadas prevalecem sobre as preferências gerais deste arquivo.

## Antes de alterar

- Leia o `README`, os arquivos de configuração, os testes relevantes e quaisquer `AGENTS.md` aplicáveis aos diretórios envolvidos.
- Entenda a funcionalidade existente e suas interfaces antes de modificar código. Procure padrões já usados no repositório e mantenha a solução consistente.
- Identifique os comandos reais de formatação, lint, tipagem, teste e build nas configurações do projeto. Não invente comandos nem instale dependências sem necessidade.
- Planeje alterações pequenas e verificáveis. Preserve interfaces públicas e dados existentes, salvo quando a tarefa exigir mudança; nesse caso, atualize consumidores, testes e documentação.

## Estilo de código

- **Clean Code:** escreva código legível, com nomes que expressem intenção, funções coesas e limites claros entre responsabilidades. Melhore trechos próximos à alteração quando isso reduzir complexidade sem ampliar o escopo.
- **SOLID:** aplique SRP, OCP, LSP, ISP e DIP onde houver necessidade real de extensão, substituição ou isolamento. Não crie interfaces, hierarquias ou camadas apenas para demonstrar um princípio.
- **KISS:** prefira a solução mais simples que satisfaça os requisitos e preserve os contratos.
- **YAGNI:** implemente apenas necessidades atuais ou compromissos explicitamente definidos; não antecipe funcionalidades, otimizações ou generalizações hipotéticas.
- **DRY:** centralize conhecimento e regras de negócio repetidos; duas ocorrências parecidas com razões de mudança diferentes podem continuar separadas.
- Cada função deve ter uma finalidade clara e cada módulo, uma responsabilidade principal. Prefira funções curtas; use 4 a 20 linhas como referência, não como limite obrigatório. Extraia trechos quando isso melhorar a leitura ou permitir reutilização real.
- Prefira arquivos focados; acima de aproximadamente 500 linhas, avalie separar por responsabilidade, respeitando as convenções do framework. Não divida arquivos apenas para cumprir uma contagem.
- Use nomes específicos e consistentes com o domínio. Evite nomes genéricos como `data`, `handler` e `Manager` quando houver uma alternativa clara. O nome deve ser fácil de localizar e distinguir no repositório; não imponha uma quantidade artificial de resultados de busca.
- Declare tipos explícitos nas interfaces públicas e nos pontos em que a inferência prejudique a compreensão ou a segurança. Evite `any`, `Dict` sem parâmetros e funções sem tipos em linguagens que oferecem tipagem; siga os idiomatismos da linguagem.
- Remova duplicação de regras de negócio. Extraia lógica compartilhada quando houver repetição significativa; não introduza abstrações para uma única ocorrência simples.
- Prefira retornos antecipados a blocos condicionais profundos. Simplifique o fluxo quando houver mais de dois níveis de aninhamento, sem prejudicar a clareza.
- Faça validação nas fronteiras do sistema. Mensagens de erro devem identificar o campo ou a operação e o formato esperado. Inclua o valor recebido apenas se ele não contiver segredos, dados pessoais ou conteúdo excessivo.

## Comentários e documentação

- Preserve comentários existentes que registrem intenção, contexto ou origem de uma decisão. Ao alterar o comportamento relacionado, atualize o comentário; remova-o apenas se estiver comprovadamente obsoleto e sem valor histórico.
- Comente o **porquê** de decisões pouco óbvias, não o que o código já mostra.
- Documente funções e interfaces públicas conforme a convenção da linguagem: explique propósito, contrato e restrições relevantes. Inclua um exemplo de uso quando ele ajudar a evitar ambiguidade.
- Registre o número da issue, referência de decisão ou commit quando uma solução depender de um bug específico ou limitação externa conhecida; não invente referências.
- Atualize `README`, exemplos, configuração e documentação de API quando comandos ou comportamento visível mudarem.

## Testes

- Mantenha no `README` os comandos reais das suítes Node e Python e dos testes de navegador opcionais. Use os comandos existentes se já estiverem documentados.
- Teste comportamento novo e alterado, incluindo casos de erro importantes. Correções de bugs devem ter um teste de regressão que falhe antes da correção, quando isso for viável.
- Dê cobertura a novas funções com lógica relevante, especialmente funções públicas. Funções triviais, composição de framework e simples delegações podem ser cobertas por um teste de comportamento maior, sem testes artificiais por função.
- Mantenha testes **F.I.R.S.T.**: rápidos, independentes, repetíveis, autoavaliáveis e escritos junto com a mudança.
- Isole serviços externos e operações caras ou instáveis. Prefira fakes nomeados e reutilizáveis para APIs, banco de dados e sistema de arquivos quando tornarem o teste mais claro; use recursos reais em testes de integração quando isso verificar um risco que os fakes não capturam.
- Não use snapshots frágeis nem mocks que apenas reproduzam a implementação. Verifique resultados observáveis e contratos.
- Execute os testes relevantes, formatador, lint e verificação de tipos disponíveis antes de concluir. Rode a suíte completa quando a abrangência da mudança ou as regras do projeto justificarem.

## Dependências e arquitetura

- Injete dependências externas e variantes de implementação por construtor ou parâmetro quando isso facilitar testes, substituição ou isolamento. Constantes e funções puras não precisam de injeção.
- Coloque SDKs e bibliotecas externas atrás de uma interface fina pertencente ao projeto quando isso proteger regras de negócio ou reduzir acoplamento. Evite wrappers que só repassem chamadas sem acrescentar valor.
- Siga a estrutura e os pontos de extensão do framework (por exemplo, Django, Rails, Next.js). Escolha caminhos previsíveis para código, testes e recursos.
- Não introduza dependências, camadas ou padrões de arquitetura sem necessidade concreta. Reutilize componentes existentes antes de criar novos.
- Preserve compatibilidade de API, esquemas e migrações quando aplicável. Mudanças incompatíveis exigem plano de atualização e testes apropriados.

## Formatação e observabilidade

- Use o formatador padrão ou configurado pelo projeto (`gofmt`, `cargo fmt`, `prettier`, `black`, `rubocop`, entre outros). Deixe a ferramenta decidir detalhes de estilo.
- Respeite configurações existentes de lint e tipagem; não desative uma regra global para fazer uma mudança local passar.
- Em serviços, emita logs estruturados com campos estáveis e identificadores de correlação quando disponíveis. Use JSON quando o destino de observabilidade esperar esse formato; não altere o formato de toda a aplicação sem necessidade.
- Em ferramentas de linha de comando, escreva a saída destinada à pessoa usuária em texto legível. Direcione diagnósticos ao canal adequado e nunca registre segredos ou dados sensíveis sem proteção.

## Entrega

<ul>
  <li>Faça a menor alteração que resolva a tarefa por completo. Não sobrescreva trabalho preexistente de outras pessoas.</li>
  <li>Ao concluir, informe o que mudou, quais verificações foram executadas e qualquer limitação material. Se um teste não puder ser executado, explique o motivo sem declarar que passou.</li>
  <li>Kaizen - melhoria contínua:
    <ul>
        <li>Entenda o comportamento atual e o objetivo antes de alterar o código.</li>
        <li>Prefira a menor mudança que resolva a causa do problema ou melhore o resultado.</li>
        <li>Preserve comportamentos e contratos existentes; atualize os testes quando a mudança alterar o comportamento.</li>
        <li>Evite agrupar refatorações sem relação com a tarefa.</li>
        <li>Execute as verificações relevantes e informe o que mudou e os resultados.</li>
        <li>Registre melhorias descobertas fora do escopo como sugestões para uma próxima etapa.</li>
        <li>Use feedback e revisões para orientar o próximo ciclo de melhoria.</li>
    </ul>
  </li>
</ul>

## Contexto específico do projeto

- O editor offline usa JavaScript, SVG e HTML; a API e o build usam Python 3.10+, `uv` e `ruff`. Os testes de navegador usam Node.js 20+ e Playwright.
- Edite os arquivos fonte em `src/`. `src/flow-core.js`, `src/editor.js` e `editor.html` são gerados por `uv run python build.py`; regenere-os após mudar suas fontes.
- Tokens de tráfego e seus efeitos ficam em `src/core-engine.js` e `src/traffic-runtime.js`. Mantenha tamanho, opacidade e movimento coerentes entre editor e exportações. O campo JSON `legends[].size` permanece em unidades SVG; o editor apresenta rem.
- Preserve a portabilidade entre Linux e Windows, inclusive caminhos de arquivo e comandos documentados.
- Comandos confirmados: `uv run ruff check .`, `uv run ruff format --check .`, `uv run python build.py`, `node --test tests/*.cjs` e `uv run python3 -m unittest discover -s tests -v`.
- Quando a mudança envolver interação ou exportação no navegador, use `node tests/editor-browser.js`. Os testes de navegador requerem Playwright e Chromium instalados, conforme o `README`.
