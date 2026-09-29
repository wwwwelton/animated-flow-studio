# B09 — preparação da decisão de lançamento

Estado: registro preliminar, sem aprovação de publicação. Versão candidata documental: 3.0.1; a versão efetiva de um pacote futuro deve ser conferida no momento de gerá-lo.

## Evidência disponível

- B01: comparação documental de Whimsical, diagrams.net e Excalidraw em `COMPETITOR_REVIEW.md`. As lacunas listadas são hipóteses, não requisitos aprovados.
- B03: 62 testes Node, 9 Python, cenário integrado em Chromium e geração de PDF passaram na linha de base de `QUALITY_BASELINE.md`.
- B05/B06: inserção repetida evita sobreposição quando há espaço; impressão preserva o relógio da animação. Ambos foram conferidos em Chromium.
- B07: JSON reabre para edição; HTML e SVG abertos como documento no Chromium preservam animação; PNG e PDF representam um quadro estático. O SVG também renderizou como imagem estática no `rsvg-convert`. A interface e o guia explicam essas diferenças.
- B08: nenhuma ampliação de catálogo foi selecionada para esta candidata. A matriz B01 registra hipóteses sem caso de uso confirmado; o backlog permite decidir o lançamento sem B08.

## Pendências antes da decisão

- B02: observar pessoas que criam fluxos de projetos com o roteiro preparado; participantes serão fornecidos depois. A revisão interna não substitui esse resultado.
- B07: conferir outros leitores externos e, se o público usar Windows, repetir a jornada nesse sistema. A linha de base atual cobre Linux/Chromium e uma renderização estática com `rsvg-convert`.
- Triar qualquer erro novo com ambiente, reprodução e impacto. Nenhum bloqueador foi confirmado nos cenários automatizados registrados até agora.
- Definir responsável pela decisão e eventual data de lançamento; nenhuma data foi informada.

## Registro da decisão humana

| Campo | A preencher quando houver evidência suficiente |
|---|---|
| Versão e pacote avaliados | Commit, artefato e data |
| Cenários executados | Navegadores, sistemas e formatos |
| Erros abertos e impacto | Referências à triagem, sem supor ausência de erros |
| Limitações comunicadas | Armazenamento local, SVG em leitores de imagem, fontes externas e outras encontradas |
| Decisão | Lançar ou adiar, pessoa responsável e data |
