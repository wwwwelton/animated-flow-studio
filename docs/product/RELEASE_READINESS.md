# B09 — preparação da decisão de lançamento

Estado: registro preliminar, sem aprovação de publicação. Versão candidata documental: 3.0.1; a versão efetiva de um pacote futuro deve ser conferida no momento de gerá-lo.

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
- A pessoa solicitante é responsável pela decisão de lançamento e ainda não decidiu publicar ou adiar. Nenhuma data foi informada.

## Registro da decisão humana

| Campo | A preencher quando houver evidência suficiente |
|---|---|
| Versão e pacote avaliados | Commit, artefato e data |
| Cenários executados | Navegadores, sistemas e formatos |
| Erros abertos e impacto | Referências à triagem, sem supor ausência de erros |
| Limitações comunicadas | Armazenamento local, SVG em leitores de imagem, fontes externas e outras encontradas |
| Decisão | Lançar ou adiar, pessoa responsável e data |
