for(const category of new Set(Object.values(F.SYSTEM_DESIGN).map(c=>c.category))){const o=document.createElement('option');o.value=o.textContent=category;$('componentCategory').append(o);}
for(const name of F.FONTS){const o=document.createElement('option');o.value=name;$('fontFamilies').append(o);}
for(const [id,label]of Object.entries(F.CONNECTORS)){const o=document.createElement('option');o.value=id;o.textContent=label;$('connectorType').append(o);}
$('paletteMode').onchange=renderPalette;$('componentSearch').oninput=renderPalette;$('componentCategory').onchange=renderPalette;renderPalette();
for(const [button,factory]of [['studioTemplate',F.studioTemplate],['gallery',F.gallery],['systemTemplate',F.systemTemplate],['systemGallery',F.systemGallery],['featureTemplate',F.featureTemplate]])$(button).onclick=()=>setProject(factory());
$('blank').onclick=()=>setProject({...F.studioTemplate(),title:'Novo fluxograma',kicker:'ANIMATED FLOW STUDIO',description:'',nodes:[],edges:[]});
for(const [id,key]of [['diagramTitle','title'],['kicker','kicker'],['description','description']])$(id).onchange=()=>{const next=F.normalize({...project,[key]:$(id).value});checkpoint();project=next;save();};
for(const [id,key]of [['canvasWidth','width'],['canvasHeight','height']])$(id).onchange=()=>{try{const next=F.clone(project),v=Number($(id).value),r=F.resizeCanvas(next,key==='width'?v:next.width,key==='height'?v:next.height);checkpoint();project=next;save({panel:true});if(r.constrained)status('Tamanho ajustado para manter os componentes visíveis.');}catch(e){status(e.message);canvasFields();}};
$('autoGrow').onchange=()=>{checkpoint();project.autoGrow=$('autoGrow').checked;save();};
$('growthMargin').onchange=()=>{const value=Number($('growthMargin').value);if(!Number.isFinite(value)||value<0||value>500){canvasFields();status('Margem entre 0 e 500 px.');return;}checkpoint();project.growthMargin=value;save();};
$('fitContent').onclick=()=>{checkpoint();F.resizeCanvas(project,project.width,project.height,{fit:true});view.fit=true;save({panel:true});};
for(const id of ['grid','showLegend'])$(id).onchange=()=>{checkpoint();project[id]=$(id).checked;save();};
$('zoom').onchange=()=>{stopZoom();view.fit=$('zoom').value==='fit';if(!view.fit)view.scale=Number($('zoom').value);centerCanvas();};
$('centerCanvas').onclick=()=>{stopZoom();centerCanvas();};$('panMode').onclick=()=>$('panMode').classList.toggle('active');
window.addEventListener('resize',fit);
$('trafficSpeed').oninput=()=>$('speedReadout').textContent=$('trafficSpeed').value+'×';
$('trafficSpeed').onchange=()=>{const speed=Number($('trafficSpeed').value);checkpoint();project.trafficSpeed=speed;clock=0;stopTraffic();board.replaceChildren();save();};
$('restartTraffic').onclick=()=>{clock=0;stopTraffic();board.replaceChildren();draw();};
$('toggleTraffic').onclick=()=>{paused=!paused;$('toggleTraffic').textContent=paused?'Reproduzir':'Pausar';draw();};
$('addLegend').onclick=()=>{if(project.legends.length>=20){status('Limite de 20 legendas.');return;}checkpoint();project.legends.push({id:uid(),label:'Novo tráfego',color:'#ffca76',shape:'square',direction:'forward',effect:'packet',speed:1,size:8,count:1});save({legend:true});};
$('connect').onclick=()=>{connecting=!connecting;connectFrom=null;$('connect').classList.toggle('active',connecting);viewport.classList.toggle('connecting',connecting);status(connecting?'Clique na origem e no destino, ou arraste uma porta azul.':'Conexão cancelada.');};
$('delete').onclick=remove;
function historyStep(undo){const from=undo?undoStack:redoStack,to=undo?redoStack:undoStack;if(!from.length)return;to.push(JSON.stringify(project));project=F.normalize(JSON.parse(from.pop()));selected=null;projectFields();legendEditor();inspect();save();FlowFonts.ensure(project).then(reportFontWarnings);}
$('undo').onclick=()=>historyStep(true);$('redo').onclick=()=>historyStep(false);
$('preview').onclick=()=>{document.body.classList.add('presentation');selected=null;view.fit=true;draw();};$('previewExit').onclick=()=>{document.body.classList.remove('presentation');view.fit=true;draw();};
document.addEventListener('keydown',e=>{
 if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;
 if(e.code==='Space'){e.preventDefault();spaceDown=true;viewport.classList.add('pan-ready');}
 if(e.key==='Escape'){gesture=null;connecting=false;connectFrom=null;$('connect').classList.remove('active');viewport.classList.remove('connecting','panning');board.querySelector('.connection-preview')?.remove();}
 if(e.key==='Delete')remove();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();historyStep(!e.shiftKey);}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();historyStep(false);}
});
document.addEventListener('keyup',e=>{if(e.code==='Space'){spaceDown=false;viewport.classList.remove('pan-ready');}});window.addEventListener('blur',()=>{spaceDown=false;gesture=null;viewport.classList.remove('pan-ready','panning','connecting');});
const downloads=[];
function offer(name,blob,auto=true){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.textContent='Baixar '+name;$('downloadLinks').prepend(a);downloads.push({url,a});if(downloads.length>10){const old=downloads.shift();old.a.remove();URL.revokeObjectURL(old.url);}if(auto)a.click();}
function currentTime(){return board.querySelector('svg')?.getCurrentTime()??clock;}
function safeJSON(value){return JSON.stringify(value).replace(/</g,'\\u003c');}
function runtimeScript(p,svgExpression){return $('flowCoreSource').textContent+'\n'+$('trafficRuntimeSource').textContent+'\nFlowTraffic.mount('+svgExpression+','+safeJSON(p)+',FlowCore);';}
async function svgExport(staticMode=false,component=null){
 const snapshot=F.clone(project),time=currentTime();status('Preparando exportação…');
 const fonts=await FlowFonts.embed(component?{nodes:[component],edges:[]}:snapshot);
 let svg=component?F.componentSVG(component):F.render(snapshot,{static:staticMode,time:staticMode?time:0});
 if(fonts.css)svg=svg.replace('</style>',fonts.css+'</style>');
 if(!staticMode&&!component&&snapshot.nodes.some(n=>n.type==='reactive'))svg=svg.replace(/<\/svg>\s*$/,()=>'<script><![CDATA['+runtimeScript(snapshot,'document.documentElement').replace(/]]>/g,']]]]><![CDATA[>')+']]></script></svg>');
 if(fonts.warnings.length)status('Exportado com fonte local de reserva: '+fonts.warnings.join('; '));else status('Exportação pronta.');
 return svg;
}
async function exportAction(action){try{await action();}catch(e){status('Falha na exportação: '+e.message);}}
$('componentExport').onclick=()=>exportAction(async()=>{const n=selected?.type==='node'&&selectedItem();if(n)offer('componente.svg',new Blob([await svgExport(true,F.clone(n))],{type:'image/svg+xml;charset=utf-8'}));});
$('svgExport').onclick=()=>exportAction(async()=>offer('fluxograma.svg',new Blob([await svgExport()],{type:'image/svg+xml;charset=utf-8'})));
$('staticSvgExport').onclick=()=>exportAction(async()=>offer('fluxograma-estatico.svg',new Blob([await svgExport(true)],{type:'image/svg+xml;charset=utf-8'})));
$('jsonExport').onclick=()=>offer('fluxograma.json',new Blob([JSON.stringify(project,null,2)],{type:'application/json'}));
$('pngExport').onclick=()=>exportAction(async()=>{
 const svg=await svgExport(true),width=project.width,height=project.height+F.headerHeight(project),factor=Math.min(2,Math.sqrt(16000000/(width*height)));
 const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
 try{const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('Não foi possível renderizar o SVG.'));img.src=url;});const canvas=document.createElement('canvas');canvas.width=Math.round(width*factor);canvas.height=Math.round(height*factor);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG indisponível.');offer('fluxograma.png',blob);}finally{URL.revokeObjectURL(url);}
});
$('htmlExport').onclick=()=>exportAction(async()=>{
 const snapshot=F.clone(project),svg=await svgExport(false),clean=svg.replace(/<script><!\[CDATA\[[\s\S]*?\]\]><\/script>/g,'');
 const script=runtimeScript(snapshot,'document.querySelector("svg")')+'\nconst s=document.querySelector("svg");document.getElementById("play").onclick=()=>s.animationsPaused()?s.unpauseAnimations():s.pauseAnimations();if(matchMedia("(prefers-reduced-motion: reduce)").matches)s.pauseAnimations();';
 const html='<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+F.esc(snapshot.title)+'</title><style>body{margin:24px;background:#f5f5f5;font-family:Arial}svg{display:block;max-width:100%;height:auto;margin:auto;background:white}button{margin:0 0 15px;padding:8px 12px}</style><button id="play">Pausar / reproduzir</button>'+clean+'<script>'+script+'<\/script></html>';
 offer('fluxograma.html',new Blob([html],{type:'text/html;charset=utf-8'}));
});
$('mdExport').onclick=()=>exportAction(async()=>{const safe=s=>String(s).replace(/[\[\]<>]/g,'').replace(/\n/g,' ');const md=`# ${safe(project.title)}\n\n${project.description}\n\n![${safe(project.title)}](fluxograma.svg)\n\n## Conexões\n\n${project.edges.map(e=>'- '+safe(project.nodes.find(n=>n.id===e.source).label)+' → '+safe(project.nodes.find(n=>n.id===e.target).label)).join('\n')}\n\nAbra a exportação HTML para executar transições reativas; visualizadores de SVG podem bloquear scripts.\n`;offer('fluxograma.svg',new Blob([await svgExport()],{type:'image/svg+xml;charset=utf-8'}),false);offer('fluxograma.md',new Blob([md],{type:'text/markdown;charset=utf-8'}));});
$('pdfExport').onclick=()=>window.print();
$('import').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>5000000)throw Error('Arquivo acima de 5 MB.');setProject(JSON.parse(await file.text()));}catch(err){status('Importação rejeitada: '+err.message);}e.target.value='';};
window.addEventListener('beforeprint',()=>{const t=currentTime();stopTraffic();board.innerHTML=F.render(project,{static:true,time:t});});window.addEventListener('afterprint',draw);
projectFields();legendEditor();inspect();draw();buttons();FlowFonts.ensure(project).then(reportFontWarnings);
