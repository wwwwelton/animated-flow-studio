"""Build the offline editor + renderer from SVG catalog and JS modules."""

from pathlib import Path
import json
import runpy

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "src"
runpy.run_path(str(ROOT / "tools/build_system_design.py"), run_name="__main__")
data = json.loads((SOURCE / "system-design.json").read_text())
wrapper = "(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FlowCore=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){\n'use strict';\n"
catalog = (
    "/* SYSTEM_DESIGN_START */\nconst SYSTEM_DESIGN="
    + json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    + ";\n/* SYSTEM_DESIGN_END */\n"
)
parts = "\n".join(
    (SOURCE / name).read_text()
    for name in ("core-engine.js", "canvas.js", "icons.js", "templates.js")
)
exports = "return {COMPONENTS,SYSTEM_DESIGN,TYPES,LEGENDS,EFFECTS,VISUAL_EFFECTS,PROTOCOL_FLOW_STYLES,SYMBOLS,CONNECTORS,FONTS,TRAFFIC_VISUAL,CANVAS_LIMIT,DEFAULT_MARGIN,esc,color,clone,normalize,render,shape,nodeLabels,typography,textStyle,makeNode,systemNode,systemGlyph,componentSVG,tablePreset,normalizeTable,streams,reactiveStates,closestPort,port,contentBounds,growCanvas,resizeCanvas,transformNodes,headerHeight,route,lines,studioTemplate,gallery,systemGallery,systemTemplate,featureTemplate,protocolTemplate};\n});\n"
(SOURCE / "flow-core.js").write_text(wrapper + catalog + parts + exports)
runpy.run_path(str(ROOT / "tools/build_components.py"), run_name="__main__")
(SOURCE / "editor.js").write_text(
    "\n".join(
        (SOURCE / name).read_text()
        for name in (
            "project-svg.js",
            "editor-main.js",
            "editor-colors.js",
            "editor-actions.js",
            "png-export.js",
        )
    )
)
shell = (SOURCE / "editor-shell.html").read_text()
for token, name in [
    ("/*EDITOR_CSS*/", "editor.css"),
    ("/*FLOW_CORE*/", "flow-core.js"),
    ("/*TRAFFIC_RUNTIME*/", "traffic-runtime.js"),
    ("/*FONT_MANAGER*/", "font-manager.js"),
    ("/*EDITOR_JS*/", "editor.js"),
]:
    content = (SOURCE / name).read_text()
    if name.endswith(".js"):
        content = content.replace("</script", "<\\/script")
    shell = shell.replace(token, content)
(ROOT / "editor.html").write_text(shell, encoding="utf-8")
print(ROOT / "editor.html")
