"""Animated Flow 2.1: dependency-free Python API and an offline SVG editor."""
from __future__ import annotations
from dataclasses import asdict, dataclass, field
from pathlib import Path
from html import escape
import json
import math

ROOT = Path(__file__).resolve().parent

@dataclass(frozen=True)
class Legend:
    id: str
    label: str
    color: str = '#70a0ff'
    shape: str = 'square'
    direction: str = 'forward'
    effect: str = 'packet'
    speed: float = 1
    size: float = 8
    count: int = 1

@dataclass(frozen=True)
class Node:
    id: str
    label: str
    x: float
    y: float
    width: float = 190
    height: float = 62
    subtitle: str = ''
    color: str = '#ffffff'
    type: str = 'card'
    icon: str = 'none'
    parent: str | None = None
    border_color: str = '#000000'
    text_color: str = '#000000'
    subtitle_color: str = '#000000'
    icon_color: str = '#333333'
    typography: dict = field(default_factory=dict)
    table: dict | None = None
    reactive: dict | None = None

@dataclass(frozen=True)
class Edge:
    source: str
    target: str
    label: str = ''
    color: str = '#70a0ff'  # v1 compatibility: used for an automatic custom legend
    duration: float = 8
    reverse: bool = False
    traffic: tuple[str, ...] = ('request', 'response')
    route: str = 'orthogonal'
    source_port: str = 'auto'
    target_port: str = 'auto'
    offset: float = 0
    stroke_color: str = '#000000'
    text_color: str = '#000000'
    connector: str | None = None
    line_width: float = 1
    source_anchor: float = .5
    target_anchor: float = .5
    typography: dict = field(default_factory=dict)

class Diagram:
    def __init__(self, title: str, *, width: int = 1278, height: int = 633,
                 description: str = '', kicker: str = 'FIGURA 01 · ARQUITETURA',
                 auto_grow: bool = True, growth_margin: float = 48,
                 traffic_speed: float = 1):
        if not all(math.isfinite(n) and 300 <= n <= 5000 for n in (width, height)):
            raise ValueError('Canvas dimensions must be between 300 and 5000')
        if not math.isfinite(growth_margin) or not 0 <= growth_margin <= 500:
            raise ValueError('Growth margin must be between 0 and 500')
        self.auto_grow, self.growth_margin = auto_grow, growth_margin
        if not math.isfinite(traffic_speed) or not .1 <= traffic_speed <= 8:
            raise ValueError('Traffic speed must be between 0.1 and 8')
        self.traffic_speed = traffic_speed
        self.title, self.width, self.height = title, width, height
        self.description, self.kicker = description, kicker
        self.nodes: dict[str, Node] = {}
        self.edges: list[Edge] = []
        self.legends = {
            'request': Legend('request', 'Solicitação', '#70a0ff'),
            'response': Legend('response', 'Resposta', '#9ae8c5', 'circle', 'reverse'),
            'cdc': Legend('cdc', 'Alterações (CDC)', '#bb8ae8', 'diamond'),
        }
        self.show_legend = True
        self.grid = True

    def add_legend(self, legend: Legend) -> Diagram:
        if not legend.id or legend.id in self.legends:
            raise ValueError('Legend ID must be unique')
        if legend.shape not in ('square', 'circle', 'diamond', 'triangle', 'arrow', 'star') or legend.direction not in ('forward', 'reverse'):
            raise ValueError('Invalid legend symbol or direction')
        self.legends[legend.id] = legend
        return self

    def add_node(self, node: Node) -> Diagram:
        if not node.id or node.id in self.nodes:
            raise ValueError('Node ID must be unique')
        if not all(math.isfinite(n) for n in (node.x, node.y, node.width, node.height)):
            raise ValueError('Node geometry must be finite')
        if node.width < 24 or node.height < 24:
            raise ValueError('Minimum node size is 24')
        self.nodes[node.id] = node
        return self

    def add_edge(self, edge: Edge) -> Diagram:
        if edge.source not in self.nodes or edge.target not in self.nodes or edge.source == edge.target:
            raise ValueError('Two distinct existing endpoints are required')
        if not math.isfinite(edge.duration) or not .2 <= edge.duration <= 120:
            raise ValueError('Duration must be between 0.2 and 120 seconds')
        if any(t not in self.legends for t in edge.traffic):
            raise ValueError('Unknown traffic legend')
        self.edges.append(edge)
        return self

    def to_dict(self) -> dict:
        legends = [asdict(v) for v in self.legends.values()]
        edges = []
        for i, e in enumerate(self.edges):
            traffic = list(e.traffic)
            if e.color != '#70a0ff':
                lid = f'custom-{i}'
                legends.append(asdict(Legend(lid, e.label or f'Tráfego {i+1}', e.color)))
                traffic = [lid]
            source, target = (e.target, e.source) if e.reverse else (e.source, e.target)
            edges.append(dict(id=f'edge-{i}', source=source, target=target, label=e.label,
                              traffic=traffic, duration=e.duration, route=e.route,
                              sourcePort=e.source_port, targetPort=e.target_port, offset=e.offset,
                              strokeColor=e.stroke_color, textColor=e.text_color,
                              connector=e.connector, lineWidth=e.line_width,
                              sourceAnchor=e.source_anchor, targetAnchor=e.target_anchor,
                              typography=e.typography))
        nodes = []
        for n in self.nodes.values():
            d = asdict(n)
            d['w'], d['h'] = d.pop('width'), d.pop('height')
            for source, target in (('border_color', 'borderColor'), ('text_color', 'textColor'),
                                   ('subtitle_color', 'subtitleColor'), ('icon_color', 'iconColor')):
                d[target] = d.pop(source)
            nodes.append(d)
        return dict(version=3, trafficSpeed=self.traffic_speed, title=self.title, kicker=self.kicker, description=self.description,
                    width=self.width, height=self.height, autoGrow=self.auto_grow,
                    growthMargin=self.growth_margin, grid=self.grid, showLegend=self.show_legend,
                    legends=legends, nodes=nodes, edges=edges)

    def render(self) -> str:
        core = (ROOT / 'src' / 'flow-core.js').read_text(encoding='utf-8')
        traffic = (ROOT / 'src' / 'traffic-runtime.js').read_text(encoding='utf-8')
        fonts = (ROOT / 'src' / 'font-manager.js').read_text(encoding='utf-8')
        payload = json.dumps(self.to_dict(), ensure_ascii=False).replace('<', '\\u003c')
        return f'''<!doctype html><html lang="pt-BR"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>{escape(self.title)}</title>
<style>body{{margin:24px;background:#f5f5f5}}#diagram svg{{display:block;max-width:100%;height:auto;border:1px solid #ddd;background:white;margin:auto}}button{{padding:8px 12px;background:white;border:1px solid #aaa;border-radius:6px;margin-bottom:14px}}</style>
<button id="play">Pausar / reproduzir</button><div id="diagram"></div>
<script>{core}</script><script>{traffic}</script><script>{fonts}</script><script>
const project=FlowCore.normalize({payload});document.getElementById('diagram').innerHTML=FlowCore.render(project);
const svg=document.querySelector('svg');document.getElementById('play').onclick=()=>svg.animationsPaused()?svg.unpauseAnimations():svg.pauseAnimations();
FlowTraffic.mount(svg,project,FlowCore);FlowFonts.ensure(project);
if(matchMedia('(prefers-reduced-motion: reduce)').matches)svg.pauseAnimations();
</script></html>'''

    def save(self, path: str | Path) -> Path:
        target = Path(path)
        target.write_text(self.render(), encoding='utf-8')
        return target

    def save_json(self, path: str | Path) -> Path:
        target = Path(path)
        target.write_text(json.dumps(self.to_dict(), ensure_ascii=False, indent=2), encoding='utf-8')
        return target

if __name__ == '__main__':
    import argparse
    import webbrowser
    parser = argparse.ArgumentParser(description='Animated Flow Studio')
    parser.add_argument('--editor', action='store_true', help='Open the offline editor')
    args = parser.parse_args()
    if args.editor:
        webbrowser.open((ROOT / 'editor.html').as_uri())
    else:
        parser.print_help()
