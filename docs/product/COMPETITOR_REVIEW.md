# B01 — comparação documental de produtos

Data da consulta: 28/09/2026. Tarefa comparada: criar um fluxo de projeto com componentes ligados, mostrar o tráfego, editar o diagrama e compartilhá-lo para visualização ou edição. Esta é uma revisão de documentação pública; não representa observação de uso ou um compromisso de implementar todas as opções encontradas.

| Produto | Criar e editar | Animar o fluxo | Compartilhar ou recuperar | Fonte |
|---|---|---|---|---|
| Animated Flow Studio 3.0.1 | Editor SVG offline, 81 símbolos System Design, 19 formas de fluxograma, conectores e JSON reimportável. | Tokens por legenda, incluindo sete protocolos, pausa, velocidade e HTML animado. | JSON, SVG, PNG e HTML; impressão em PDF. O armazenamento no navegador é local. | [README](../../README.md), [interface](../../src/editor-shell.html), [ações de exportação](../../src/editor-actions.js) |
| Whimsical | Fluxogramas, templates e atalhos para criar formas. | A página consultada não documenta partículas de tráfego em conectores; isso exige verificação no produto. | Incorporação em outros arquivos, comentários e histórico de versões. | [Flowcharts](https://whimsical.com/flowcharts) |
| diagrams.net / draw.io | Editor de diagramas com conectores configuráveis. | Animação de fluxo nos conectores, com duração e direção configuráveis; SVG e GIF animado são formatos documentados. | PNG/SVG com dados editáveis e opções de PDF/HTML/URL. | [Conectores animados](https://www.drawio.com/docs/manual/connectors/connector-animate/), [exportações](https://www.drawio.com/docs/manual/export/export-diagram/), [compartilhar para editar](https://www.drawio.com/docs/manual/collaboration/share-to-edit-diagram/) |
| Excalidraw / Excalidraw+ | Canvas e bibliotecas; a página consultada não especifica animação de tráfego. | A página consultada documenta apresentação ao vivo, mas não animação de partículas em conectores; verificar no produto. | Exportação PNG/SVG/JSON; o Plus oferece colaboração, acesso somente leitura e apresentações. | [Excalidraw+ para equipes](https://plus.excalidraw.com/excalidraw-for-teams) |

## Lacunas candidatas, sem compromisso de implementação

| Hipótese | Impacto esperado na jornada | Evidência | Incerteza e próxima verificação |
|---|---|---|---|
| GIF animado direto facilitaria uma prévia em canais que não executam SVG/HTML. | Compartilhar o movimento sem pedir ao destinatário que abra HTML. | O draw.io documenta GIF animado; o Animated Flow Studio oferece HTML/SVG animados e PNG estático. | Não sabemos se usuários compartilham nesses canais nem se o custo de exportação vale o benefício; observar B02 e B07. |
| Arquivo de imagem que reabre para edição poderia reduzir a perda do JSON separado. | Recuperação mais simples ao receber um PNG/SVG. | O draw.io documenta dados do diagrama embutidos em PNG/SVG; o Animated Flow Studio documenta JSON como cópia transferível. | Tamanho do arquivo, compatibilidade e demanda são desconhecidos; medir na jornada B02/B07. |
| Comentários, histórico de versões e colaboração podem ajudar revisão em equipe. | Menos trocas manuais de arquivos durante revisão. | Whimsical e Excalidraw+ documentam recursos de equipe; o editor atual salva localmente. | O público prioritário e a necessidade de colaboração ainda não foram observados; validar com participantes antes de planejar rede/contas. |

## Próxima observação reproduzível

Usar o mesmo diagrama de três componentes em cada produto: criar dois conectores, alterar o sentido ou a velocidade do tráfego quando disponível, mover um componente, exportar e tentar reabrir uma cópia editável. Registrar plano usado, navegador, data, passos e resultado; marcar “não verificado” em vez de supor ausência de recurso. A prioridade das hipóteses só será revista após B02 e B03.

## Decisão posterior — SVG editável no editor local

Em 28/09/2026, a pessoa solicitante autorizou decisões de implementação baseadas nesses três concorrentes, mantendo o lançamento adiado. A revisão das fontes oficiais confirmou dois padrões úteis: [draw.io salva dados editáveis em PNG e SVG](https://www.drawio.com/docs/manual/collaboration/diagram-data-image-formats/) e o [código oficial do Excalidraw oferece a opção de embutir a cena em PNG/SVG](https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/locales/en.json). O [Whimsical privilegia criação rápida com botões de adição e atalhos](https://whimsical.com/learn/get-started/flowcharts), enquanto a [exportação oficial](https://whimsical.com/learn/imports-exports/exporting-from-whimsical) destaca imagens e código Mermaid. Essas informações vêm de documentação pública; não são observação de usuários.

Decisão para B07/B08: permitir que **SVGs completos exportados pelo Animated Flow Studio** sejam reabertos como projetos, por meio de uma cópia codificada do JSON em `<metadata>`. O caso de uso é enviar uma prévia visual sem separar um segundo arquivo para continuar a edição depois. O editor aceita SVG animado e estático produzidos por ele, rejeita SVG sem projeto, preserva o JSON como formato direto de dados e não altera PNG, PDF ou SVG de componente. Foi escolhida a menor extensão que usa o exportador existente; colaboração, GIF e dados editáveis em PNG permanecem sem decisão de implementação. Os critérios são roundtrip de nós, conexões, legendas e estados reativos, abertura normal da imagem em navegador e rejeição legível de arquivos sem metadados.
