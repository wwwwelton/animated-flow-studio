# Animated Flow Studio 2.3

Editor visual offline e biblioteca Python para fluxogramas SVG animados. Sem dependências de execução, servidor, CDN ou API.

## Abrir

Extraia **toda** a pasta e abra `editor.html` no Chrome, Edge ou Firefox. Alternativamente:

```bash
python animated_flow.py --editor
```

O editor é um HTML autônomo. Os arquivos em `src/` são os fontes legíveis usados para gerá-lo. A biblioteca Python usa o renderer em `src/flow-core.js`; mantenha a pasta junto do módulo.

## Componentes compactos (2.3)

Os 74 componentes de System Design usam o mesmo estilo dos cartões de fluxograma: retângulo branco com borda preta, cantos discretamente arredondados, ícone à esquerda e texto à direita. Tamanho inicial: **190 × 62 px**. A paleta também usa linhas compactas.

Ao abrir um projeto anterior, os componentes que ainda usam o tamanho padrão antigo (180 × 140 px) são convertidos automaticamente. Tamanhos personalizados são preservados. A borda cinza padrão anterior passa a preta; cores personalizadas continuam editáveis. Os IDs, grupos e conexões são mantidos. O campo `systemLayout` impede repetir a conversão ao reabrir o JSON.

## Biblioteca de System Design

Em **Componentes → Biblioteca**, escolha **System Design (74)**. Busque em português ou inglês, filtre por categoria e clique para inserir. As 18 formas clássicas continuam na biblioteca Fluxograma.

- 74 SVGs originais, baseados nos 75 termos numerados do PDF fornecido. Disponibilidade (38 e 67) foi unificada.
- Categorias: clientes e infraestrutura, dados e armazenamento, cache, sistemas distribuídos, mensageria, resiliência e desempenho.
- O catálogo distingue componentes, conceitos, padrões e métricas no manifesto e na dica de cada botão. Alguns símbolos representam conceitos abstratos; não são notações padronizadas.
- Blocos redimensionáveis, rótulos e cores editáveis, grupos, conexões e tráfego animado, com os mesmos controles do editor.
- Selecione um bloco e use **Componente selecionado (SVG)** para exportar somente ele, incluindo suas cores, rótulos e tamanho.
- Em cartões clássicos, o campo **Ícone** também oferece todos os novos símbolos.
- **Modelos → Arquitetura de pedidos** abre um exemplo com API, cache, banco, fila e consumidor. **Catálogo System Design** mostra a coleção completa.

### Arquivos e personalização

`assets/system-design/` contém um SVG por símbolo (64 × 64, fundo transparente), mais `manifest.json` com nomes, categorias, classificação e números dos termos de referência. Os desenhos foram criados com primitivas vetoriais; não são recortes, cópias ou vetorização das ilustrações do PDF. O PDF original não está incluído.

Nos arquivos SVG avulsos, altere `style="color:#334155"` na raiz para mudar a cor. Para CSS externo, remova essa declaração e defina `color` no SVG inline; CSS da página não recolore o conteúdo de `<img src="...">`. Para criar um componente de cor e tamanho personalizados, prefira o exportador do editor.

`examples/system-design.json` e `examples/system-design-catalog.json` são projetos editáveis; os SVGs e PNGs correspondentes permitem visualizar os resultados fora do editor.

```python
from animated_flow import Diagram, Node

flow = Diagram('Minha arquitetura')
flow.add_node(Node('cache', 'Cache', 60, 60, width=190, height=62,
                   type='system', icon='sd:cache', icon_color='#2563eb'))
flow.save('arquitetura.html')
```

Os identificadores válidos estão em `manifest.json`. Projetos com os novos símbolos exigem o editor 2.3; projetos anteriores continuam aceitos. Em blocos System Design, o rótulo e subtítulo exibem até duas linhas cada.

Para editar o catálogo e reconstruir os SVGs e o catálogo embutido:

```bash
python tools/build_system_design.py
python build.py
```

### Validação desta versão

27 testes Node.js e 7 testes Python passaram. Todos os 74 SVGs foram analisados como XML e o catálogo e exemplo foram renderizados com Inkscape e revisados visualmente. A verificação interativa com Playwright não foi executada: o ambiente não tinha Chromium e o download do navegador falhou. A execução dos testes não requer navegador:

```bash
node --test tests/*.cjs
PYTHONPATH=. python -m unittest discover -s tests -p 'test_python.py'
```

## Montar e editar

1. Clique em uma forma na paleta.
2. Arraste para mover. Arraste o quadrado azul no canto para redimensionar.
3. Clique em **Conectar**, na origem e no destino.
4. Selecione a linha e escolha os tipos de tráfego, portas, duração e trajeto.
5. Edite os rótulos no painel direito. As alterações dos campos são aplicadas ao sair do campo ou pressionar Enter.
6. Use **Apresentar** para ocultar os painéis. O botão da figura pausa e retoma a animação.

**Delete** exclui a seleção; **Esc** cancela a criação de conexão; **Ctrl/Cmd+Z** desfaz; **Ctrl+Y** ou **Ctrl/Cmd+Shift+Z** refaz. Segurar Alt durante o arraste desativa o alinhamento de 2 px.

O projeto é salvo no armazenamento local do navegador. Exporte JSON para ter uma cópia transferível. A versão 2 tenta migrar automaticamente o projeto local da versão 1; arquivos JSON antigos também podem ser importados.

## Cores dos elementos

Selecione um componente ou conexão e use a seção **Cores** no painel direito. Cada cor pode ser escolhida pelo seletor visual ou digitada em hexadecimal (`#RRGGBB`).

- Componentes: preenchimento, borda, texto, subtítulo e ícone. Os controles são mostrados conforme a forma; texto livre tem apenas cor de texto.
- Conexões: linha e setas, além da cor do rótulo. As cores dos marcadores animados continuam sendo definidas nas legendas.
- Alterações são salvas no navegador, aceitam desfazer/refazer e acompanham JSON, SVG, PNG, HTML, Markdown com SVG e impressão em PDF.

Na API Python, use `Node(..., color='#fff1cc', border_color='#912345', text_color='#164567', subtitle_color='#765432', icon_color='#123abc')` e `Edge(..., stroke_color='#117744', text_color='#773399')`. O atributo legado `Edge.color` continua representando a cor do tráfego, não da linha. Projetos anteriores mantêm as cores padrão ao importar.

Importe `examples/cores.json` para experimentar um diagrama colorido pronto.

## Tamanho do background / área de desenho

No painel direito, em **Área de desenho**:

- **Largura / Altura:** altere as dimensões manualmente (300 a 5000 px por eixo). Uma redução nunca corta os componentes existentes; o campo mostra o menor valor que os comporta.
- **Crescer automaticamente:** ativo por padrão. Arrastar ou redimensionar um componente além da borda aumenta a área. Funciona também para grupos e mudanças de posição/tamanho pelo painel.
- **Margem de expansão:** espaço extra após ultrapassar uma borda; padrão de 48 px, configurável de 0 a 500 px.
- **Ajustar ao conteúdo:** reduz o espaço vazio à direita e abaixo, respeitando a margem e o tamanho mínimo. Não elimina o espaço à esquerda/topo.

Ao cruzar a borda esquerda ou superior, todos os componentes são deslocados juntos para manter coordenadas positivas e preservar suas posições relativas. A área não diminui automaticamente quando um componente retorna. Durante o arraste, a escala fica estável; o modo “Ajustar à tela” é reaplicado ao soltar.

Desativar o crescimento automático limita o arraste/redimensionamento às bordas atuais. A área máxima é 5000 × 5000 px; nesse limite, o movimento para fora é contido e a margem pode ser menor. Grupos, conexões, desfazer/refazer, JSON e exportações acompanham as novas dimensões.

Na API Python: `Diagram('Exemplo', width=900, height=600, auto_grow=True, growth_margin=48)`. O HTML e a importação do JSON aplicam a expansão no renderer.

## Legendas

As legendas são configuráveis e associadas às conexões. Cada tipo possui nome, cor, símbolo e sentido:

| Padrão | Símbolo | Cor | Sentido |
|---|---|---|---|
| Solicitação | Quadrado arredondado | `#70a0ff` | Origem → destino |
| Resposta | Círculo | `#9ae8c5` | Destino → origem |
| Alterações (CDC) | Losango | `#bb8ae8` | Origem → destino |

Uma conexão pode animar vários tipos ao mesmo tempo. Adicione legendas como erro, aprovação, evento e replicação. Excluir uma legenda remove suas referências das conexões. Ocultar a legenda visual mantém as animações. O modelo inicial usa as três legendas da referência.

## Formas disponíveis

Cartão/serviço, processo, início/fim, decisão, entrada/saída, subprocesso, documento, banco de dados, entrada manual, preparação, espera, conector, conector de página, anotação, texto livre, grupo/contêiner, raia e fila.

Formas clássicas equivalentes às usadas por editores como draw.io; não há importação do formato `.drawio`. Grupos podem ter filhos: defina **Grupo pai** no painel. Mover um grupo move seus descendentes; excluir um grupo exclui também seus filhos e conexões. Formas sobrepostas visualmente só pertencem ao grupo se esse vínculo for definido.

## Visual do Animated Flow Studio

O Animated Flow Studio usa cartões brancos com raio de 4 px, contorno preto fino, títulos compactos, subtítulos monoespaçados e figuras com borda cinza de 1 px. Solicitação é um quadrado azul, Resposta é um círculo verde e Alterações (CDC) usam um losango roxo. As cores e os símbolos podem ser configurados pelas legendas.

O preset **Arquitetura Animated Flow Studio** organiza clientes à esquerda, o núcleo de processamento no centro, recursos à direita e serviços de eventos abaixo. Os trilhos têm 1 px e curvas de 8 px; os marcadores móveis têm 8 px. `animateMotion` SVG anima o tráfego nos dois sentidos.

A fonte local é Arial/sans-serif e os ícones usam traçados SVG simples, mantendo o projeto autônomo e sem dependências externas.

## Exportação

| Formato | Resultado |
|---|---|
| SVG animado | Vetor com legendas e partículas; sem interface de edição |
| SVG estático | Vetor sem partículas ou animações |
| PNG | Imagem 2× com cabeçalho, formas e legendas |
| Markdown + SVG | Markdown com referência à imagem, legendas e conexões em texto; baixe também o SVG no link exibido |
| PDF | Impressão do diagrama pelo navegador → Salvar como PDF; prefira paisagem e desative cabeçalhos/rodapés do navegador |
| JSON | Projeto completo, reimportável |
| HTML de apresentação | Arquivo autônomo com botão de reprodução |

PNG e PDF não preservam movimento. Alguns leitores Markdown bloqueiam ou congelam SVG animado; abra o SVG/HTML diretamente para visualizar a animação. `prefers-reduced-motion` é respeitado. As exportações não contêm seleção, alças nem painéis de edição.

## API Python

```python
from animated_flow import Diagram, Node, Edge, Legend

flow = Diagram('Solicitação e resposta')
flow.add_node(Node('client', 'Cliente', 80, 200, icon='api'))
flow.add_node(Node('service', 'Serviço', 520, 200, icon='server'))
flow.add_edge(Edge('client', 'service', traffic=('request', 'response')))
flow.save('fluxo.html')
flow.save_json('fluxo.json')
```

`python example.py` gera `demo.html` e `demo.json`. O JSON é editável na interface. A API Python gera o HTML e o projeto; os formatos gráficos são exportados pelo editor.

## Desenvolvimento e validação

```bash
python build.py
node --test tests/test_core.cjs
python -m unittest discover -s tests -p 'test_*.py'
```

27 testes (20 JavaScript e 7 Python) cobrem formas, tráfego, exportação, migração, validação, cores e os limites da área de desenho. As cores são verificadas na serialização, no SVG e nos eventos dos campos com DOM mínimo simulado. SVGs de referência e catálogo foram renderizados para inspeção visual. Não foi possível executar testes de interação em navegador nesta sessão: o navegador disponível bloqueou a abertura de arquivos locais. Não foram simulados cliques reais em navegador.

## Limites atuais

- Layout manual; os trilhos não evitam automaticamente todos os obstáculos.
- Não há auto-conexões (um bloco conectado a si mesmo).
- Sem parser `.drawio`, Mermaid ou BPMN.
- Até 500 blocos, 1000 conexões e 20 legendas.
- As fontes e métricas podem variar entre sistemas; ajuste largura/altura para textos extensos.
