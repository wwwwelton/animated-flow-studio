# Guia do Animated Flow Studio

Recursos do editor distribuído na versão 3.0.1. Para instalação e testes, veja o README da raiz.

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
- Velocidades: 0,1×–8× global e por legenda; marcadores: 1–8; tamanho inicial: 1 rem, editável de 0,1875 a 2 rem. O JSON salva 16 unidades SVG para 1 rem.
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
- `assets/system-design/`: 81 ícones SVG originais, com nomes e categorias; inclui sete protocolos de API.
- `assets/custom/`: forma SVG do componente reativo e manifesto.
- `src/components/`: fontes SVG parametrizadas e manifesto de compilação; veja `src/components/README.md` para adicionar formas.

Os símbolos System Design representam componentes, conceitos, padrões e métricas. Os 75 termos numerados da referência original resultaram em 74 símbolos porque Disponibilidade aparecia duas vezes. O catálogo também inclui sete ícones vetoriais originais para REST, GraphQL, gRPC, WebSockets, Webhooks, SSE e MQTT. Não são recortes da referência. Para exportar um bloco completo com texto e estilo, selecione-o e use Componente selecionado (SVG).

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
