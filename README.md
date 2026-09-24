# Animated Flow Studio 3.0

Editor visual de diagramas SVG animados, com biblioteca Python. Abra `editor.html` no navegador após extrair o ZIP. O editor é autocontido e funciona offline com fontes locais; Google Fonts precisa de internet no primeiro carregamento. Não há servidor nem dependências para usar o editor.

## O que mudou

| Tarefa | Recurso |
|---|---|
| 1 | Seis efeitos: marcador, pulso, brilho, rastro, cometa e fluxo tracejado; seis símbolos, tamanho e quantidade configuráveis |
| 2 | Tamanho de fonte/subtítulo, bold, italic, code e família Google Fonts ou local em componentes e rótulos de conexões |
| 3 | Formas de fluxograma em arquivos SVG separados e manifesto extensível |
| 4 | Velocidade global e por legenda, pausa e reinício |
| 5 | Canvas centralizado, ajuste à tela e botão Centralizar |
| 6 | Tabelas SQL, NoSQL e Schema com cabeçalhos e células editáveis |
| 7 | Seta saída, entrada, curva, bidirecional; linha simples, tracejada, pontilhada e dupla |
| 8 | Zoom suave com Ctrl/Cmd + roda, mantendo o ponto sob o cursor |
| 9 | Arraste do fundo, botão do meio, Espaço + arraste e modo Mover canvas |
| 10 | Conexão por arraste de portas; várias entradas/saídas por porta e reconexão das duas pontas |
| 11 | Categoria Custom com componente que reage ao tráfego alternando texto, cor ou ambos |

Os cartões de System Design e o componente Custom mantêm o visual compacto: retângulo branco, **borda preta, ícone à esquerda e texto à direita**, inicialmente 190 × 62 px.

## Uso

1. Escolha a biblioteca Fluxograma, System Design ou Custom e clique no componente para inserir.
2. Arraste o corpo para mover; use o quadrado azul para redimensionar. Selecione para editar no painel direito.
3. Passe o mouse sobre um componente e arraste uma porta azul até uma porta ou o corpo do destino. Também é possível usar Conectar → origem → destino.
4. Selecione a conexão para alterar estilo, trajeto, portas, posição das âncoras, rótulo e tráfego. Arraste os círculos das pontas para reconectar.
5. Exporte o JSON para continuar em outro navegador, ou SVG/PNG/HTML para apresentar.

Os campos são aplicados ao perder o foco. Há salvamento automático no navegador e histórico de desfazer/refazer. O JSON é a cópia transferível; o armazenamento do navegador pode ser limpo pelo usuário ou pelo sistema.

### Navegar no canvas

| Ação | Gesto |
|---|---|
| Zoom 5%–400% | Ctrl/Cmd + roda do mouse |
| Mover a área de desenho | Arrastar o fundo com botão esquerdo |
| Mover sobre um componente | Botão do meio, Espaço + arraste ou modo Mover canvas |
| Centralizar | Botão Centralizar |
| Exibir a página inteira | Ajustar à tela |
| Desfazer/refazer | Ctrl/Cmd + Z; Ctrl/Cmd + Shift + Z ou Ctrl + Y |
| Excluir seleção | Delete |
| Cancelar conexão | Esc |
| Desativar alinhamento durante arraste | Alt |

Mover o canvas não altera as posições dos componentes. Largura/altura da página variam entre 300 e 5000 px. O crescimento automático preserva os componentes ao cruzar as bordas; desative-o para limitar o desenho à página. Ajustar ao conteúdo remove espaço excedente à direita e abaixo.

### Tráfego

Abra uma legenda pelo nome para editar efeito, símbolo, cor, sentido, velocidade, tamanho e quantidade. A conexão escolhe quais legendas percorrem seu trajeto. A direção das setas do conector e a direção do tráfego são independentes.

- Efeitos: marcador, pulso, brilho, rastro de marcadores, cometa com cauda afilada e fluxo tracejado.
- Símbolos: quadrado, círculo, losango, triângulo, seta e estrela.
- Velocidades: 0,1×–8× global e por legenda; marcadores: 1–8; tamanho: 3–32 px.
- Tempo efetivo do percurso = tempo base da conexão ÷ velocidade global ÷ velocidade da legenda.
- Velocidade global reinicia o relógio. Pausa e reinício controlam animações e componentes reativos juntos.

### Tipografia

Selecione qualquer componente ou conexão. Escolha a fonte sugerida ou digite o nome da família do Google Fonts; configure tamanho, bold, italic e code. Code usa uma fonte monoespaçada: preserva famílias identificadas como Mono/Code/Courier/Consolas/Inconsolata, ou usa Courier New. Para texto grande, aumente também o bloco: o texto se ajusta ao espaço disponível.

O carregamento usa a API CSS2 do Google Fonts, sem chave. Fontes baixadas são incorporadas em SVG, PNG e HTML exportados quando possível. Se a rede/família falhar, o editor avisa e usa uma fonte de reserva. A API Python carrega as fontes ao abrir o HTML; use o exportador do editor para incorporá-las. A cobertura de pesos/itálicos depende da família; o navegador pode sintetizar estilos ausentes.

### Tabelas

Na biblioteca Fluxograma, insira Tabela. Selecione SQL, NoSQL ou Schema no inspector. O modelo preenche uma estrutura inicial; trocá-lo substitui as células atuais e pode ser desfeito. Edite 1–12 colunas e 0–40 linhas de dados, além de títulos, cabeçalhos e células. Aumentar linhas preserva os dados existentes; reduzir remove as linhas/colunas excedentes, com suporte a desfazer.

### Conexões many-to-many

Cada porta pode receber várias conexões de entrada e saída. O mesmo par de componentes pode ter mais de uma ligação, identificada separadamente e com deslocamento ajustável. As portas aceitam os dois sentidos. Soltar sobre o corpo escolhe uma borda próxima; selecionar a linha permite ajustar a âncora de 0 a 1. O editor não impede cruzamentos nem faz roteamento automático para evitar todos os obstáculos.

### Custom: estado reativo

Na biblioteca **Custom**, insira o componente reativo e configure:

- Texto ao entrar e ao sair; habilitação independente de alternância de texto.
- Cor ao entrar e ao sair; habilitação independente de alternância de cor.
- Transição de cor entre 0 e 5 s.
- Manter estado entre 0 e 30 s; zero mantém até o próximo evento.
- Filtro de legendas; nenhuma marcada significa todas.

Entrada ocorre quando um marcador termina o percurso; saída quando inicia. O sentido reverso troca esses papéis. Eventos posteriores substituem o estado atual; se entrada e saída ocorrerem juntas, entrada tem prioridade. Após o tempo de manutenção, volta ao rótulo/cor base. Isso representa o tráfego animado do diagrama, sem conexão automática com eventos de aplicações externas.

## Catálogos e extensão

- `assets/flowchart/`: 19 SVGs de formas de fluxograma e manifesto.
- `assets/system-design/`: 74 ícones SVG originais, com nomes e categorias.
- `assets/custom/`: forma SVG do componente reativo e manifesto.
- `src/components/`: fontes SVG parametrizadas e manifesto de compilação; veja `src/components/README.md` para adicionar formas.

Os símbolos System Design representam componentes, conceitos, padrões e métricas. Os 75 termos numerados da referência original resultaram em 74 símbolos porque Disponibilidade aparecia duas vezes. São desenhos vetoriais originais, não recortes da referência. Para exportar um bloco completo com texto e estilo, selecione-o e use Componente selecionado (SVG).

Projetos anteriores continuam importáveis. Os antigos cartões System Design com tamanho padrão de 180 × 140 px são migrados para o formato compacto uma vez, preservando tamanhos personalizados, IDs, grupos e conexões. Novos recursos exigem o editor 3.0.

## Exportações e exemplos

| Formato | Resultado |
|---|---|
| JSON | Projeto completo e reimportável |
| SVG animado | Traços e marcadores animados; runtime de estados reativos quando necessário |
| SVG estático | Estado atual dos componentes, sem movimento |
| SVG do componente | Somente o bloco selecionado |
| PNG | Imagem do estado atual, até 2×; limitada a 16 milhões de pixels |
| HTML | Apresentação independente com pausa/reprodução e estados reativos |
| Markdown + SVG | Texto e referência à imagem; baixe os dois arquivos oferecidos |
| PDF | Impressão do navegador → Salvar como PDF |

**Para compartilhar transições reativas, prefira HTML.** SVG aberto como documento no navegador executa o runtime; SVG usado em `<img>`, leitores Markdown e outros visualizadores pode ter scripts bloqueados. PNG/PDF/SVG estático não preservam movimento. A preferência de movimento reduzido é respeitada na apresentação.

Em `examples/`, abra `v3-features.html` para ver tabelas e estados reativos; importe `v3-features.json` para editar. Há também exemplos de arquitetura, cores, catálogo de formas e System Design, com JSON/SVG/PNG. `editor-preview.png` mostra a interface.

## Arquitetura e build

Sem framework ou dependências de execução. Python 3.10+ para build/API; Node.js 18+ para testes puros. O projeto separa:

- `src/core-engine.js`: schema, SVG, tipografia, tabelas, conexões e cálculo dos eventos.
- `src/canvas.js`, `icons.js`, `templates.js`: geometria, ícones e modelos.
- `src/traffic-runtime.js`: aplicação dos estados ao relógio SVG.
- `src/font-manager.js`: download e incorporação de fontes.
- `src/editor-main.js`, `editor-colors.js`, `editor-actions.js`: interação, controles e exportação.
- `src/editor-shell.html`, `editor.css`: interface.
- `tools/build_components.py`, `build_system_design.py`: geração dos catálogos.

```bash
python3 build.py
node --test tests/*.cjs
PYTHONPATH=. python3 -m unittest discover -s tests -p 'test_python.py'
```

`src/flow-core.js`, `src/editor.js` e `editor.html` são gerados. Edite os módulos de origem e reconstrua.

### API Python

```python
from animated_flow import Diagram, Node, Edge, Legend

flow = Diagram('Eventos', traffic_speed=1.5)
flow.add_legend(Legend('event', 'Evento', effect='comet', speed=2))
flow.add_node(Node('client', 'Cliente', 40, 100,
                   type='system', icon='sd:client',
                   typography={'fontFamily': 'Inter', 'fontSize': 16, 'bold': True}))
flow.add_node(Node('state', 'Aguardando', 380, 100,
                   type='reactive', icon='sd:server',
                   reactive={'enterText': 'Recebido', 'exitText': 'Enviando',
                             'text': True, 'color': True, 'hold': 2, 'transition': .3}))
flow.add_edge(Edge('client', 'state', traffic=('event',), connector='curve', route='curve'))
flow.save('eventos.html')
flow.save_json('eventos.json')
```

`python3 example.py` regenera `demo.html` e `demo.json`. A validação completa do schema é feita pelo motor JavaScript ao abrir o HTML/importar JSON. Os dicionários de tipografia, tabela e estado reativo seguem o schema do editor.

## Validação e Git

Nesta versão passaram **38 testes Node e 7 testes Python**, além dos testes de interação em Chromium: fontes, velocidade, centralização, tabelas, conectores, zoom, pan, conexões, estado reativo, persistência e exportações JSON/PNG/SVG/HTML. A integração de fontes usou respostas HTTP controladas e bytes de uma fonte real; isso não comprova disponibilidade ao vivo do Google.

Para repetir os testes de navegador, instale Playwright e seu Chromium em um ambiente de desenvolvimento:

```bash
npm install --no-save playwright
npx playwright install chromium
node tests/editor-typography.js
node tests/editor-browser.js
node tests/editor-task.js 10  # executa apenas a tarefa indicada (4 a 11)
```

`AFS_BROWSER_PATH` pode apontar para outro Chromium. A fixture de fontes usa `/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf`; em outro sistema defina `AFS_TEST_FONT_PATH` para um TTF disponível. Fontes e navegador de teste não são distribuídos.

`TASKS.md` registra a conclusão sequencial das 11 tarefas. O histórico usa Conventional Commits, começando pela base entregue anteriormente e por um checkpoint explícito do trabalho iniciado antes da orientação sequencial. O pacote inclui `history.bundle` com todos os commits:

```bash
git clone history.bundle ../animated-flow-history
cd ../animated-flow-history
git log --oneline
```

Limites: 500 componentes, 1000 conexões e 20 legendas; sem auto-conexões, parser `.drawio`/Mermaid/BPMN ou layout automático. A validação de navegador desta entrega foi feita em Chromium; outros navegadores podem ter diferenças de fontes e SVG.
