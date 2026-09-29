# B09 — preparação da decisão de lançamento

Estado: **lançamento adiado por decisão da pessoa solicitante em 28/09/2026**. O pacote avaliado foi a versão 3.0.1 gerada do commit `d8da778` em `dist/animated-flow-studio.zip`. Este registro não autoriza publicação.

SHA-256 do pacote avaliado: `aad64cd3aa6c4f5dc8d91eb808522e456dc2569912951a3e3f70f8aa052bbc85`. O ZIP passou na verificação de integridade, contém `.git/` com HEAD `d8da778`, não contém `history.bundle` e seu `editor.html` abriu isoladamente em Chromium com cinco componentes e sem erros de página.

## Evidência disponível

- B01: comparação documental de Whimsical, diagrams.net e Excalidraw em `COMPETITOR_REVIEW.md`. As lacunas listadas são hipóteses, não requisitos aprovados.
- B03: 62 testes Node, 9 Python, cenário integrado em Chromium e geração de PDF passaram na linha de base de `QUALITY_BASELINE.md`.
- B05: inserção repetida evita sobreposição quando há espaço. O catálogo pode ser acionado por Espaço com o botão em foco, enquanto o canvas conserva Espaço + arraste após receber foco. Esses cenários passaram em Chromium.
- B06: impressão preserva o relógio da animação, conferido em Chromium com 3,5 s antes e depois.
- B07: JSON reabre para edição; o modo HTTP salvou um projeto e o recuperou após recarregar. HTML e SVG abertos como documento no Chromium preservam animação; PNG e PDF representam um quadro estático. O SVG também renderizou como imagem estática no `rsvg-convert`. A interface e o guia explicam essas diferenças.
- B08: nenhuma ampliação de catálogo foi selecionada para esta candidata. A matriz B01 registra hipóteses sem caso de uso confirmado; o backlog permite decidir o lançamento sem B08.

## Pendências antes da decisão

- B02: a pessoa solicitante informou que não terá participantes nesta rodada. A observação de usuários permanece sem evidência; a revisão interna não substitui esse resultado.
- B07: conferir outros leitores externos. A pessoa solicitante informou que não pode validar no Windows agora; a linha de base atual cobre Linux/Chromium e uma renderização estática com `rsvg-convert`.
- Triar qualquer erro novo com ambiente, reprodução e impacto. Nenhum bloqueador foi confirmado nos cenários automatizados registrados até agora.
- A pessoa solicitante decidiu adiar o lançamento para obter mais evidência. Nenhuma nova data foi informada.

## Registro da decisão humana

| Campo | Decisão de 28/09/2026 |
|---|---|
| Versão e pacote avaliados | 3.0.1, commit `d8da778`, ZIP local indicado acima |
| Cenários executados | 62 testes Node, 9 Python, Chromium em arquivo local e HTTP, PDF, SVG estático em `rsvg-convert` e editor extraído do ZIP |
| Erros abertos e impacto | Nenhum bloqueador confirmado nos cenários executados; B02 e Windows sem evidência |
| Limitações comunicadas | Projeto salvo localmente requer JSON para transferência; SVG em leitores de imagem pode não executar scripts; fontes externas dependem de rede; sem sessões B02 e validação no Windows |
| Decisão | **Adiar para obter mais evidência**, pela pessoa solicitante, em 28/09/2026 |

Para uma nova decisão, executar as sessões B02 quando houver participantes e repetir a jornada no Windows quando disponível. Atualizar este registro com o commit e o checksum do novo pacote avaliado; o ZIP desta candidata não deve ser tratado como lançamento aprovado.
