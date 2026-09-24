"""Compile editable SVG templates + manifest into the offline renderer.

Run after editing src/components/manifest.json or an SVG template.
SVG geometry is trusted project code, never loaded from diagram JSON.
"""
from pathlib import Path
import json
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'src/components'
ALLOWED = {'svg','g','path','rect','circle','ellipse','polygon','polyline','line'}

def compile_catalog():
    manifest = json.loads((SOURCE/'manifest.json').read_text())
    catalog = {}
    out = ROOT/'assets/flowchart'
    out.mkdir(parents=True,exist_ok=True)
    for entry in manifest['components']:
        ident = entry['id']
        if ident in catalog:
            raise ValueError(f'Duplicate component {ident}')
        file = (SOURCE/entry['file']).resolve()
        if not file.is_relative_to(SOURCE.resolve()):
            raise ValueError('Template must be inside src/components')
        template = file.read_text()
        tree = ET.fromstring(template)
        for el in tree.iter():
            if el.tag.split('}')[-1] not in ALLOWED:
                raise ValueError(f'Unsupported SVG element: {el.tag}')
            for attr,value in el.attrib.items():
                if attr.lower().startswith('on') or attr.split('}')[-1] in ('href','style') or 'url(' in value.lower():
                    raise ValueError('Templates cannot run code or load external resources')
        inner = template[template.index('>')+1:template.rindex('</svg>')].strip()
        catalog[ident] = {**entry, 'svg':inner}
        if entry['category']=='flowchart':
            (out/(ident+'.svg')).write_text(template.replace('{{fill}}','#ffffff').replace('{{stroke}}','#000000'))
    core_path = ROOT/'src/flow-core.js'
    core=core_path.read_text()
    start='/* COMPONENTS_START */'; end='/* COMPONENTS_END */'
    block=start+'\nconst COMPONENTS='+json.dumps(catalog,ensure_ascii=False,separators=(',',':'))+';\n'+end
    if start in core:
        core=core[:core.index(start)]+block+core[core.index(end)+len(end):]
    else:
        core=core.replace("'use strict';","'use strict';\n"+block,1)
    core_path.write_text(core)
    (out/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
    print(f'Compiled {len(catalog)} SVG component definitions')

if __name__=='__main__':
    compile_catalog()
