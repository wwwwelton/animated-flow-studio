from pathlib import Path
from dataclasses import replace
from animated_flow import Diagram, Edge, Legend, Node

flow = Diagram(
    "Fluxo de IA de ponta a ponta",
    description="Solicitações e respostas percorrem o mesmo trilho em sentidos opostos.",
)
for legend_id, legend in flow.legends.items():
    flow.legends[legend_id] = replace(legend, size=8)
flow.add_legend(Legend("approval", "Aprovação humana", "#ffd085", "diamond", effect="glow", size=8))
for n in [
    Node("user", "Usuário", 45, 260, icon="api"),
    Node("context", "Contexto / RAG", 335, 260, subtitle="Busca e memória", icon="database"),
    Node(
        "llm",
        "LLM / SLM",
        625,
        260,
        subtitle="Decisão",
        icon="brain",
        type="reactive",
        typography={"bold": True},
        reactive={"enterText": "Processando", "exitText": "Respondendo", "hold": 1.5},
    ),
    Node("tool", "Ferramentas", 1025, 120, subtitle="API / MCP", icon="code"),
    Node("check", "Aprovado?", 1025, 400, height=120, type="decision"),
]:
    flow.add_node(n)
flow.add_edge(Edge("user", "context"))
flow.add_edge(Edge("context", "llm"))
flow.add_edge(Edge("llm", "tool"))
flow.add_edge(Edge("llm", "check", traffic=("approval",)))
root = Path(__file__).resolve().parent
flow.save(root / "demo.html")
flow.save_json(root / "demo.json")
print("Gerados demo.html e demo.json. Abra demo.json no editor para editar.")
