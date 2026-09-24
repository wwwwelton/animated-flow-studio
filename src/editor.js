'use strict';
const F=FlowCore,$=id=>document.getElementById(id),board=$('board'),KEY='animated-flow-project-v2',OLD='animated-flow-project';
let project=F.studioTemplate(),selected=null,connecting=false,connectFrom=null,gesture=null,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,undoStack=[],redoStack=[],clock=0;
try{const raw=localStorage.getItem(KEY)??localStorage.getItem(OLD);if(raw)project=F.normalize(JSON.parse(raw));}catch(e){status('Projeto anterior não carregado: '+e.message)}
function status(s){$('status').textContent=s;}
function uid(){return 'id'+(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2));}
function checkpoint(){undoStack.push(JSON.stringify(project));if(undoStack.length>60)undoStack.shift();redoStack=[];buttons();}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(project));status('Salvo neste navegador');}catch{status('Armazenamento indisponível. Salve o JSON.');}}
function buttons(){$('undo').disabled=!undoStack.length;$('redo').disabled=!redoStack.length;}
function save({panel=false,legend=false}={}){F.growCanvas(project);canvasFields();persist();draw();if(panel)inspect();if(legend)legendEditor();buttons();}
function draw(){const old=board.querySelector('svg');if(old)clock=old.getCurrentTime();board.innerHTML=F.render(project,{interactive:true,controls:true,selected,paused});const svg=board.querySelector('svg');svg.setCurrentTime(clock);if(paused)svg.pauseAnimations();fit();}
function fit(){if(gesture){board.style.width=(project.width*gesture.scale+2)+'px';return;}const z=$('zoom').value,available=$('viewport').clientWidth-56;board.style.width=(z==='fit'?Math.min(project.width,Math.max(300,available)):project.width*Number(z))+'px';}
function canvasFields(){$('canvasWidth').value=project.width;$('canvasHeight').value=project.height;$('autoGrow').checked=project.autoGrow!==false;$('growthMargin').value=project.growthMargin??48;}
function projectFields(){canvasFields();for(const id of ['diagramTitle','kicker','description'])$(id).value=project[id==='diagramTitle'?'title':id];$('canvasWidth').value=project.width;$('canvasHeight').value=project.height;$('grid').checked=project.grid;$('showLegend').checked=project.showLegend;}
function setProject(p){checkpoint();project=F.normalize(p);selected=null;connectFrom=null;connecting=false;$('connect').classList.remove('active');clock=0;projectFields();legendEditor();inspect();save();}
function position(e){const svg=board.querySelector('svg'),r=svg.getBoundingClientRect();return{x:(e.clientX-r.left)*project.width/r.width,y:(e.clientY-r.top)*(project.height+F.headerHeight(project))/r.height-F.headerHeight(project)};}
function descendants(id){const set=new Set([id]);for(let i=0;i<project.nodes.length;i++)for(const n of project.nodes)if(set.has(n.parent))set.add(n.id);return set;}
board.addEventListener('pointerdown',e=>{if(e.button!==0)return;const play=e.target.closest('[data-play]');if(play){paused=!paused;draw();return;}const handle=e.target.closest('[data-resize]'),target=e.target.closest('[data-node]'),edge=e.target.closest('[data-edge]');if(target){e.preventDefault();const id=target.getAttribute('data-node');if(connecting){if(!connectFrom){connectFrom=id;status('Agora selecione o destino.');}else if(connectFrom!==id){checkpoint();const line={id:uid(),source:connectFrom,target:id,label:'',traffic:project.legends.filter(l=>['request','response'].includes(l.id)).map(l=>l.id),duration:8,route:'orthogonal',sourcePort:'auto',targetPort:'auto',offset:0};project.edges.push(line);selected={type:'edge',id:line.id};connecting=false;connectFrom=null;$('connect').classList.remove('active');save({panel:true});}return;}selected={type:'node',id};checkpoint();const p=position(e),ids=descendants(id),rect=board.querySelector('svg').getBoundingClientRect();gesture={kind:handle?'resize':'move',id,p,scale:rect.width/project.width,origin:F.clone(project.nodes.filter(n=>ids.has(n.id)))};board.setPointerCapture(e.pointerId);draw();inspect();}else if(edge){selected={type:'edge',id:edge.getAttribute('data-edge')};draw();inspect();}else{selected=null;draw();inspect();}});
board.addEventListener('pointermove',e=>{
  if(!gesture)return;
  const p=position(e),snap=v=>e.altKey?v:Math.round(v/2)*2;
  const dx=snap(p.x-gesture.p.x),dy=snap(p.y-gesture.p.y),oldHeader=F.headerHeight(project);
  const result=F.transformNodes(project,gesture.origin,dx,dy,{kind:gesture.kind,id:gesture.id});
  draw();canvasFields();
  // Keep the grabbed point stable when the origin or header changes. The scale
  // stays frozen until pointerup, including when the selected zoom is "fit".
  const viewport=$('viewport');
  viewport.scrollLeft+=result.shiftX*gesture.scale;
  viewport.scrollTop+=(result.shiftY+F.headerHeight(project)-oldHeader)*gesture.scale;
  const after=position(e);
  gesture.p.x+=after.x-p.x-(gesture.kind==='move'?result.shiftX:0);
  gesture.p.y+=after.y-p.y-(gesture.kind==='move'?result.shiftY:0);
});
function endGesture(){if(!gesture)return;gesture=null;save({panel:true});}
board.addEventListener('pointerup',endGesture);board.addEventListener('pointercancel',endGesture);
function add(type){if(project.nodes.length>=500){status('Limite de 500 componentes.');return;}checkpoint();const count=project.nodes.length,n={id:uid(),type,label:F.TYPES[type],subtitle:'',x:50+count%5*32,y:60+count%5*28,w:['group','swimlane'].includes(type)?450:type==='connector'?60:190,h:['group','swimlane'].includes(type)?230:type==='decision'?100:type==='connector'?60:62,color:'#ffffff',icon:'none',parent:null};if(project.autoGrow===false){n.w=Math.min(n.w,project.width);n.h=Math.min(n.h,project.height);n.x=Math.min(n.x,project.width-n.w);n.y=Math.min(n.y,project.height-n.h);}project.nodes.push(n);selected={type:'node',id:n.id};save({panel:true});}
function remove(){if(!selected)return;checkpoint();if(selected.type==='node'){const ids=descendants(selected.id);project.nodes=project.nodes.filter(n=>!ids.has(n.id));project.edges=project.edges.filter(e=>!ids.has(e.source)&&!ids.has(e.target));}else project.edges=project.edges.filter(e=>e.id!==selected.id);selected=null;save({panel:true});}
function field(parent,label,value,onchange,{type='text',options,min,max,step}={}){const l=document.createElement('label'),i=document.createElement(options?'select':type==='textarea'?'textarea':'input'),id=uid();l.textContent=label;l.htmlFor=id;i.id=id;if(options){for(const [v,t]of options){const o=document.createElement('option');o.value=v;o.textContent=t;i.append(o);}}else if(type!=='textarea')i.type=type;if(min!==undefined)i.min=min;if(max!==undefined)i.max=max;if(step!==undefined)i.step=step;i.value=value??'';i.addEventListener('change',()=>{const v=type==='number'?Number(i.value):i.value;if(type==='number'&&(!Number.isFinite(v)||(min!==undefined&&v<min)||(max!==undefined&&v>max))){status('Valor fora do intervalo.');i.value=value;return;}checkpoint();onchange(v);save();});parent.append(l,i);return i;}
function colorField(parent,label,item,key,fallback){
 const row=document.createElement('div'),title=document.createElement('label'),picker=document.createElement('input'),hex=document.createElement('input');
 row.className='element-color';title.textContent=label;picker.type='color';picker.id=uid();title.htmlFor=picker.id;
 picker.value=item[key]??fallback;hex.value=picker.value;hex.maxLength=7;hex.spellcheck=false;
 hex.setAttribute('aria-label',label+' em hexadecimal');hex.placeholder='#000000';
 const commit=value=>{
  const next=value.trim().replace(/^#?/,'#');
  if(!/^#[0-9a-f]{6}$/i.test(next)){hex.value=picker.value;status('Cor inválida. Use # e seis dígitos hexadecimais.');return;}
  if(next.toLowerCase()===(item[key]??fallback).toLowerCase()){picker.value=next;hex.value=next.toLowerCase();return;}
  checkpoint();item[key]=next.toLowerCase();picker.value=item[key];hex.value=item[key];save();
 };
 picker.addEventListener('change',()=>commit(picker.value));hex.addEventListener('change',()=>commit(hex.value));
 row.append(picker,hex);parent.append(title,row);
}
function elementColors(parent,item,isNode){
 const section=document.createElement('section'),heading=document.createElement('h3');
 section.className='element-colors';heading.textContent='Cores';section.append(heading);
 const fields=isNode
  ? [...(item.type==='text'?[]:[['Preenchimento','color','#ffffff'],['Borda','borderColor','#000000']]),
     ['Texto','textColor','#000000'],
     ...(['text','group','swimlane'].includes(item.type)?[]:[['Subtítulo','subtitleColor','#000000'],['Ícone','iconColor','#333333']])]
  : [['Linha e setas','strokeColor','#000000'],['Rótulo','textColor','#000000']];
 for(const [label,key,fallback]of fields)colorField(section,label,item,key,fallback);
 parent.append(section);
}
function inspect(){if($('componentExport'))$('componentExport').disabled=selected?.type!=='node';const panel=$('inspector');panel.replaceChildren();const h=document.createElement('h2');h.textContent='Seleção';panel.append(h);const item=selected&&(selected.type==='node'?project.nodes:project.edges).find(n=>n.id===selected.id);if(!item){const p=document.createElement('p');p.className='hint';p.textContent='Selecione um bloco ou trilho para editar. Use Conectar e clique na origem e no destino.';panel.append(p);return;}field(panel,'Rótulo',item.label,v=>item.label=v,{type:'textarea'});if(selected.type==='node'){field(panel,'Forma',item.type,v=>{item.type=v;if(v==='system'&&!String(item.icon).startsWith('sd:'))item.icon='sd:server';inspect();},{options:Object.entries(F.TYPES)});field(panel,'Subtítulo',item.subtitle,v=>item.subtitle=v);field(panel,'Ícone',item.icon,v=>item.icon=v,{options:[...(item.type==='system'?[]:[['none','Nenhum'],['database','Banco de dados'],['server','Servidor'],['api','API'],['code','Código'],['cube','Armazenamento'],['bolt','Cache'],['services','Serviços'],['network','Rede'],['brain','IA'],['dots','Mais']]),...Object.values(F.SYSTEM_DESIGN).map(c=>['sd:'+c.id,c.label])]});elementColors(panel,item,true);for(const [key,label]of [['x','Posição X'],['y','Posição Y'],['w','Largura'],['h','Altura']]){const isSize=['w','h'].includes(key);field(panel,label,item[key],v=>{const ids=descendants(item.id),originals=F.clone(project.nodes.filter(n=>ids.has(n.id)));F.transformNodes(project,originals,['x','w'].includes(key)?v-item[key]:0,['y','h'].includes(key)?v-item[key]:0,{kind:isSize?'resize':'move',id:item.id});inspect();},{type:'number',min:isSize?24:project.autoGrow?-5000:0,max:5000});}const childIds=descendants(item.id);field(panel,'Grupo pai',item.parent??'',v=>item.parent=v||null,{options:[['','Nenhum'],...project.nodes.filter(n=>['group','swimlane'].includes(n.type)&&!childIds.has(n.id)).map(n=>[n.id,n.label])]});}else{elementColors(panel,item,false);field(panel,'Trajeto',item.route,v=>item.route=v,{options:[['orthogonal','Ortogonal arredondado'],['curve','Curva'],['straight','Linha reta']]});const ports=[['auto','Automático'],['left','Esquerda'],['right','Direita'],['top','Topo'],['bottom','Base']];field(panel,'Saída da origem',item.sourcePort,v=>item.sourcePort=v,{options:ports});field(panel,'Entrada do destino',item.targetPort,v=>item.targetPort=v,{options:ports});field(panel,'Deslocamento do trilho',item.offset,v=>item.offset=v,{type:'number',min:-2000,max:2000});field(panel,'Duração da solicitação (s)',item.duration,v=>item.duration=v,{type:'number',min:.2,max:120,step:.1});const label=document.createElement('label');label.textContent='Tráfego nesta conexão';panel.append(label);for(const l of project.legends){const row=document.createElement('label');row.className='traffic-option';const c=document.createElement('input');c.type='checkbox';c.checked=item.traffic.includes(l.id);c.onchange=()=>{checkpoint();item.traffic=c.checked?[...item.traffic,l.id]:item.traffic.filter(id=>id!==l.id);save();};const t=document.createElement('span');t.textContent=l.label;row.append(c,t);panel.append(row);}}
}
function legendEditor(){const box=$('legendEditor');box.replaceChildren();for(const l of project.legends){const row=document.createElement('div');row.className='legend-row';field(row,'Nome da legenda',l.label,v=>{l.label=v;inspect();});const controls=document.createElement('div');controls.className='color-shape';const c=document.createElement('input');c.type='color';c.value=l.color;c.setAttribute('aria-label','Cor de '+l.label);c.onchange=()=>{checkpoint();l.color=c.value;save();};const s=document.createElement('select');s.setAttribute('aria-label','Símbolo de '+l.label);for(const[v,t]of [['square','Quadrado'],['circle','Círculo'],['diamond','Losango']]){const o=document.createElement('option');o.value=v;o.textContent=t;s.append(o);}s.value=l.shape;s.onchange=()=>{checkpoint();l.shape=s.value;save();};const del=document.createElement('button');del.textContent='×';del.title='Remover '+l.label;del.onclick=()=>{checkpoint();project.legends=project.legends.filter(v=>v.id!==l.id);for(const e of project.edges)e.traffic=e.traffic.filter(id=>id!==l.id);save({legend:true,panel:true});};controls.append(c,s,del);row.append(controls);field(row,'Sentido',l.direction,v=>l.direction=v,{options:[['forward','Origem → destino'],['reverse','Destino → origem']]});box.append(row);}}

function addSystem(id){
 if(project.nodes.length>=500){status('Limite de 500 componentes.');return;}
 checkpoint();const n=F.systemNode(id,{id:uid(),x:50+project.nodes.length%5*32,y:60+project.nodes.length%5*28});
 if(project.autoGrow===false){n.x=Math.min(n.x,project.width-n.w);n.y=Math.min(n.y,project.height-n.h);}
 project.nodes.push(n);selected={type:'node',id:n.id};save({panel:true});
}
const searchKey=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function renderPalette(){
 const system=$('paletteMode').value==='system',palette=$('palette');
 $('systemFilters').hidden=!system;palette.replaceChildren();palette.classList.toggle('system-palette',system);
 const query=searchKey($('componentSearch').value.trim()),category=$('componentCategory').value;
 const entries=system?Object.values(F.SYSTEM_DESIGN).filter(c=>(!category||c.category===category)&&searchKey(c.label+' '+c.english+' '+c.id).includes(query)):Object.entries(F.TYPES).filter(([type])=>type!=='system').map(([id,label])=>({id,label}));
 $('componentCount').textContent=entries.length+' componentes';
 for(const c of entries){
  const b=document.createElement('button');b.dataset.shape=system?'system':c.id;if(system)b.dataset.component=c.id;
  b.title=system?c.label+' · '+c.english+' · '+({component:'Componente',concept:'Conceito',pattern:'Padrão',metric:'Métrica'}[c.kind]):'Adicionar '+c.label;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('aria-hidden','true');svg.setAttribute('viewBox',system?'0 0 64 64':'-2 -2 86 46');
  svg.innerHTML=system?F.systemGlyph(c.id):F.shape({type:c.id,w:82,h:42,color:'#ffffff'});
  svg.querySelectorAll('.node-shape,.node-detail').forEach(n=>{n.setAttribute('stroke','#111');n.setAttribute('stroke-width','1.3');if(n.classList.contains('node-detail'))n.setAttribute('fill','none');});
  const text=document.createElement('span');text.textContent=c.label;b.append(svg,text);b.onclick=()=>system?addSystem(c.id):add(c.id);palette.append(b);
 }
 if(!entries.length){const empty=document.createElement('p');empty.className='hint';empty.textContent='Nenhum componente encontrado.';palette.append(empty);}
}
for(const category of new Set(Object.values(F.SYSTEM_DESIGN).map(c=>c.category))){const o=document.createElement('option');o.value=o.textContent=category;$('componentCategory').append(o);}
$('paletteMode').onchange=renderPalette;$('componentSearch').oninput=renderPalette;$('componentCategory').onchange=renderPalette;renderPalette();
$('systemTemplate').onclick=()=>setProject(F.systemTemplate());$('systemGallery').onclick=()=>setProject(F.systemGallery());
for(const [id,key]of [['diagramTitle','title'],['kicker','kicker'],['description','description']])$(id).onchange=()=>{try{const next=F.normalize({...project,[key]:$(id).value});checkpoint();project=next;save();}catch(e){status(e.message);projectFields();}};
for(const [id,key]of [['canvasWidth','width'],['canvasHeight','height']])$(id).onchange=()=>{
  try{
    const next=F.clone(project),value=Number($(id).value);
    const result=F.resizeCanvas(next,key==='width'?value:next.width,key==='height'?value:next.height);
    checkpoint();project=next;save({panel:true});
    if(result.constrained)status('Tamanho mínimo ajustado para manter todos os componentes visíveis.');
  }catch(e){canvasFields();status(e.message);}
};
$('autoGrow').onchange=()=>{checkpoint();project.autoGrow=$('autoGrow').checked;save({panel:true});};
$('growthMargin').onchange=()=>{const value=Number($('growthMargin').value);if(!Number.isFinite(value)||value<0||value>500){canvasFields();status('Use uma margem entre 0 e 500 px.');return;}checkpoint();project.growthMargin=value;save();};
$('fitContent').onclick=()=>{checkpoint();F.resizeCanvas(project,project.width,project.height,{fit:true});save({panel:true});};
for(const id of ['grid','showLegend'])$(id).onchange=()=>{checkpoint();project[id]=$(id).checked;save();};$('zoom').onchange=fit;window.addEventListener('resize',fit);
$('addLegend').onclick=()=>{if(project.legends.length>=20){status('Limite de 20 legendas.');return;}checkpoint();project.legends.push({id:uid(),label:'Novo tráfego',color:'#ffca76',shape:'square',direction:'forward'});save({legend:true});};$('connect').onclick=()=>{connecting=!connecting;connectFrom=null;$('connect').classList.toggle('active',connecting);status(connecting?'Selecione o bloco de origem.':'Conexão cancelada.');};$('delete').onclick=remove;
$('undo').onclick=()=>{if(!undoStack.length)return;redoStack.push(JSON.stringify(project));project=JSON.parse(undoStack.pop());selected=null;projectFields();legendEditor();inspect();save();};$('redo').onclick=()=>{if(!redoStack.length)return;undoStack.push(JSON.stringify(project));project=JSON.parse(redoStack.pop());selected=null;projectFields();legendEditor();inspect();save();};
$('studioTemplate').onclick=()=>setProject(F.studioTemplate());$('gallery').onclick=()=>setProject(F.gallery());$('blank').onclick=()=>setProject({...F.studioTemplate(),title:'Novo fluxograma',kicker:'ANIMATED FLOW STUDIO · NOVO PROJETO',description:'',nodes:[],edges:[]});
$('preview').onclick=()=>{document.body.classList.add('presentation');selected=null;draw();};$('previewExit').onclick=()=>{document.body.classList.remove('presentation');draw();};document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;if(e.key==='Escape'){connecting=false;connectFrom=null;$('connect').classList.remove('active');status('Conexão cancelada');}if(e.key==='Delete')remove();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();$(e.shiftKey?'redo':'undo').click();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();$('redo').click();}});
const downloads=[];function offer(name,blob,auto=true){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.textContent='Baixar '+name;$('downloadLinks').prepend(a);downloads.push({url,a});if(downloads.length>10){const old=downloads.shift();old.a.remove();URL.revokeObjectURL(old.url);}if(auto)a.click();}
$('componentExport').onclick=()=>{const n=selected?.type==='node'&&project.nodes.find(n=>n.id===selected.id);if(n)offer('componente.svg',new Blob([F.componentSVG(n)],{type:'image/svg+xml;charset=utf-8'}));};
function svgExport(staticMode=false){return F.render(project,{static:staticMode});}
$('svgExport').onclick=()=>offer('fluxograma.svg',new Blob([svgExport()],{type:'image/svg+xml;charset=utf-8'}));$('staticSvgExport').onclick=()=>offer('fluxograma-estatico.svg',new Blob([svgExport(true)],{type:'image/svg+xml;charset=utf-8'}));$('jsonExport').onclick=()=>offer('fluxograma.json',new Blob([JSON.stringify(project,null,2)],{type:'application/json'}));
$('pngExport').onclick=()=>{const img=new Image(),url=URL.createObjectURL(new Blob([svgExport(true)],{type:'image/svg+xml;charset=utf-8'}));img.onload=()=>{const canvas=document.createElement('canvas');canvas.width=project.width*2;canvas.height=(project.height+F.headerHeight(project))*2;const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,canvas.width,canvas.height);canvas.toBlob(b=>{if(b){offer('fluxograma.png',b);status('PNG exportado: '+canvas.width+' × '+canvas.height);}else status('Falha no PNG.');URL.revokeObjectURL(url);},'image/png');};img.onerror=()=>{URL.revokeObjectURL(url);status('Não foi possível renderizar o PNG.');};img.src=url;};
$('mdExport').onclick=()=>{const safe=s=>String(s).replace(/[\[\]<>]/g,'').replace(/\n/g,' '),md=`# ${safe(project.title)}\n\n${project.description}\n\n![${safe(project.title)}](fluxograma.svg)\n\n## Legendas\n\n${project.legends.map(l=>'- '+l.label+' ('+l.color+')').join('\n')}\n\n## Conexões\n\n${project.edges.map(e=>'- '+safe(project.nodes.find(n=>n.id===e.source).label)+' → '+safe(project.nodes.find(n=>n.id===e.target).label)+(e.label?': '+safe(e.label):'')).join('\n')}\n\nSalve o SVG na mesma pasta deste arquivo. O suporte à animação depende do visualizador Markdown.\n`;offer('fluxograma.svg',new Blob([svgExport()],{type:'image/svg+xml;charset=utf-8'}),false);offer('fluxograma.md',new Blob([md],{type:'text/markdown;charset=utf-8'}));status('Markdown gerado. Baixe também o SVG pelo link abaixo.');};
$('pdfExport').onclick=()=>window.print();$('htmlExport').onclick=()=>{const html='<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+F.esc(project.title)+'</title><style>body{margin:24px;background:#f5f5f5}svg{display:block;max-width:100%;height:auto;background:white;border:1px solid #ddd;margin:auto}button{margin-bottom:12px;padding:8px;background:white;border:1px solid #bbb;border-radius:8px}</style><button id="play">Pausar / reproduzir</button>'+svgExport()+'<script>const s=document.querySelector("svg");document.getElementById("play").onclick=()=>s.animationsPaused()?s.unpauseAnimations():s.pauseAnimations();if(matchMedia("(prefers-reduced-motion: reduce)").matches)s.pauseAnimations();<\/script></html>';offer('fluxograma.html',new Blob([html],{type:'text/html;charset=utf-8'}));};
$('import').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{if(f.size>5000000)throw Error('Arquivo acima de 5 MB.');const next=F.normalize(JSON.parse(await f.text()));setProject(next);}catch(err){status('Importação rejeitada: '+err.message);}e.target.value='';};
window.addEventListener('beforeprint',()=>{board.innerHTML=F.render(project,{static:true});});window.addEventListener('afterprint',draw);
projectFields();legendEditor();inspect();draw();buttons();
