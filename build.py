"""Build the offline single-file editor using only the standard library."""
from pathlib import Path
root = Path(__file__).resolve().parent
source = root / 'src'
shell = (source / 'editor-shell.html').read_text()
for token, name in [('/*EDITOR_CSS*/', 'editor.css'), ('/*FLOW_CORE*/', 'flow-core.js'), ('/*EDITOR_JS*/', 'editor.js')]:
    shell = shell.replace(token, (source / name).read_text())
(root / 'editor.html').write_text(shell, encoding='utf-8')
print(root / 'editor.html')
