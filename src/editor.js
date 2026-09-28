'use strict';
const F=FlowCore,$=id=>document.getElementById(id),board=$('board'),viewport=$('viewport'),KEY='animated-flow-project-v2',OLD='animated-flow-project';
let project=F.featureTemplate(),selected=null,connecting=false,connectFrom=null,gesture=null,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,undoStack=[],redoStack=[],clock=0,stopTraffic=()=>{},spaceDown=false;
let view={x:0,y:0,scale:1,fit:true},zoomFrame=0,zoomTarget=null;
try{const raw=localStorage.getItem(KEY)??localStorage.getItem(OLD);if(raw)project=F.normalize(JSON.parse(raw));}catch(e){status('Projeto anterior não carregado: '+e.message);}
function status(s){$('status').textContent=s;}
function uid(){return 'id'+(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2));}
function checkpoint(){undoStack.push(JSON.stringify(project));if(undoStack.length>60)undoStack.shift();redoStack=[];buttons();}
function buttons(){$('undo').disabled=!undoStack.length;$('redo').disabled=!redoStack.length;}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(project));status('Salvo neste navegador');}catch{status('Armazenamento indisponível. Salve o JSON.');}}
function save({panel=false,legend=false}={}){F.growCanvas(project);canvasFields();persist();draw();if(panel)inspect();if(legend)legendEditor();buttons();}
function applyView(){board.style.width=project.width+'px';board.style.transform=`translate(${view.x}px,${view.y}px) scale(${view.scale})`;$('zoomReadout').textContent=Math.round(view.scale*100)+'%';}
function centerCanvas(){
 const width=viewport.clientWidth,height=viewport.clientHeight,total=project.height+F.headerHeight(project);
 if(view.fit)view.scale=Math.max(.05,Math.min(1,(width-48)/project.width,(height-48)/total));
 view.x=(width-project.width*view.scale)/2;view.y=(height-total*view.scale)/2;applyView();
}
function fit(){if(view.fit)centerCanvas();else applyView();}
function draw(){
 const old=board.querySelector('svg');if(old)clock=old.getCurrentTime();stopTraffic();
 board.innerHTML=F.render(project,{interactive:true,controls:true,selected,paused,time:clock});
 const svg=board.querySelector('svg');svg.setCurrentTime(clock);if(paused)svg.pauseAnimations();$('toggleTraffic').textContent=paused?'Reproduzir':'Pausar';
 stopTraffic=FlowTraffic.mount(svg,project,F);fit();
 if(selected?.type==='edge'){
  const e=project.edges.find(e=>e.id===selected.id);if(e){const a=project.nodes.find(n=>n.id===e.source),b=project.nodes.find(n=>n.id===e.target),r=F.route(a,b,e),g=svg.querySelector('#af-board');
   for(const [end,point]of [['source',r.start],['target',r.end]]){const c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',point[0]);c.setAttribute('cy',point[1]);c.setAttribute('r',6);c.setAttribute('class','edge-handle');c.dataset.reconnect=e.id;c.dataset.end=end;g.append(c);}
  }
 }
}
function canvasFields(){$('canvasWidth').value=project.width;$('canvasHeight').value=project.height;$('autoGrow').checked=project.autoGrow;$('growthMargin').value=project.growthMargin;}
function projectFields(){canvasFields();for(const [id,key]of [['diagramTitle','title'],['kicker','kicker'],['description','description']])$(id).value=project[key];$('grid').checked=project.grid;$('showLegend').checked=project.showLegend;$('trafficSpeed').value=project.trafficSpeed;$('speedReadout').textContent=project.trafficSpeed+'×';}
function setProject(p){const next=F.normalize(p);checkpoint();project=next;selected=null;connectFrom=null;connecting=false;$('connect').classList.remove('active');clock=0;stopTraffic();board.replaceChildren();view.fit=true;projectFields();legendEditor();inspect();save();FlowFonts.ensure(project).then(reportFontWarnings);}
function position(e){const rect=viewport.getBoundingClientRect();return {x:(e.clientX-rect.left-view.x)/view.scale,y:(e.clientY-rect.top-view.y)/view.scale-F.headerHeight(project)};}
function descendants(id){const set=new Set([id]);for(let i=0;i<project.nodes.length;i++)for(const n of project.nodes)if(set.has(n.parent))set.add(n.id);return set;}
function selectedItem(){return selected&&(selected.type==='node'?project.nodes:project.edges).find(n=>n.id===selected.id);}
function defaultTraffic(){return project.legends.filter(l=>['request','response'].includes(l.id)).map(l=>l.id);}
function connectorPreset(){const connector=$('connectorType').value;return {connector,route:connector==='curve'?'curve':connector==='line'?'straight':'orthogonal'};}
function newEdge(source,target,sourcePort='auto',targetPort='auto',sourceAnchor=.5,targetAnchor=.5){
 if(source===target){status('Escolha outro componente para o destino.');return;}
 if(project.edges.length>=1000){status('Limite de 1000 conexões.');return;}
 const peers=project.edges.filter(e=>(e.source===source&&e.target===target)||(e.source===target&&e.target===source));
 const e={id:uid(),source,target,sourcePort,targetPort,sourceAnchor,targetAnchor,label:'',traffic:defaultTraffic(),duration:8,offset:peers.length*22,...connectorPreset()};
 const clean=F.normalize({...project,edges:[...project.edges,e]}).edges.at(-1);checkpoint();project.edges.push(clean);selected={type:'edge',id:clean.id};save({panel:true});
}
function stopZoom(){cancelAnimationFrame(zoomFrame);zoomTarget=null;}
function previewConnection(point){
 const svg=board.querySelector('svg');let path=svg.querySelector('.connection-preview');if(!path){path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('class','connection-preview');svg.querySelector('#af-board').append(path);}
 let origin;
 if(gesture.kind==='reconnect'){const e=project.edges.find(e=>e.id===gesture.id),id=gesture.end==='source'?e.target:e.source,n=project.nodes.find(n=>n.id===id),side=gesture.end==='source'?e.targetPort:e.sourcePort,anchor=gesture.end==='source'?e.targetAnchor:e.sourceAnchor;origin=F.port(n,side==='auto'?'right':side,anchor);}
 else {const n=project.nodes.find(n=>n.id===gesture.source);origin=F.port(n,gesture.side,gesture.anchor);}
 path.setAttribute('d',`M${origin[0]} ${origin[1]}L${point.x} ${point.y}`);
}
viewport.addEventListener('pointerdown',e=>{
 if(e.target.closest('.canvas-toolbar'))return;
 if(e.button!==0&&e.button!==1)return;stopZoom();
 const port=e.target.closest('[data-port]'),handle=e.target.closest('[data-resize]'),target=e.target.closest('[data-node]'),edge=e.target.closest('[data-edge]'),reconnect=e.target.closest('[data-reconnect]');
 if(e.button===1||spaceDown||$('panMode').classList.contains('active')){
  e.preventDefault();view.fit=false;gesture={kind:'pan',x:e.clientX,y:e.clientY,origin:{...view}};viewport.setPointerCapture(e.pointerId);viewport.classList.add('panning');return;
 }
 if(e.target.closest('[data-play]')){paused=!paused;draw();return;}
 if(reconnect){e.preventDefault();gesture={kind:'reconnect',id:reconnect.dataset.reconnect,end:reconnect.dataset.end};viewport.setPointerCapture(e.pointerId);previewConnection(position(e));return;}
 if(port){e.preventDefault();gesture={kind:'connect',source:port.dataset.owner,side:port.dataset.port,anchor:.5};viewport.setPointerCapture(e.pointerId);viewport.classList.add('connecting');previewConnection(position(e));return;}
 if(target){
  e.preventDefault();const id=target.dataset.node;
  if(connecting){if(!connectFrom){connectFrom=id;status('Agora selecione o destino.');}else{newEdge(connectFrom,id);connectFrom=null;connecting=false;$('connect').classList.remove('active');}return;}
  selected={type:'node',id};view.fit=false;const ids=descendants(id);gesture={kind:handle?'resize':'move',id,p:position(e),origin:F.clone(project.nodes.filter(n=>ids.has(n.id))),started:false};viewport.setPointerCapture(e.pointerId);draw();inspect();return;
 }
 if(edge){selected={type:'edge',id:edge.dataset.edge};draw();inspect();return;}
 e.preventDefault();selected=null;view.fit=false;gesture={kind:'pan',x:e.clientX,y:e.clientY,origin:{...view}};viewport.setPointerCapture(e.pointerId);viewport.classList.add('panning');draw();inspect();
});
viewport.addEventListener('pointermove',e=>{
 if(!gesture)return;
 if(gesture.kind==='pan'){view.x=gesture.origin.x+e.clientX-gesture.x;view.y=gesture.origin.y+e.clientY-gesture.y;applyView();return;}
 const point=position(e);
 if(['connect','reconnect'].includes(gesture.kind)){previewConnection(point);return;}
 const snap=v=>e.altKey?v:Math.round(v/2)*2,oldHead=F.headerHeight(project);
 if(!gesture.started){if(Math.hypot(point.x-gesture.p.x,point.y-gesture.p.y)<1)return;checkpoint();gesture.started=true;}
 const result=F.transformNodes(project,gesture.origin,snap(point.x-gesture.p.x),snap(point.y-gesture.p.y),{kind:gesture.kind,id:gesture.id});
 view.x-=result.shiftX*view.scale;view.y-=(result.shiftY+F.headerHeight(project)-oldHead)*view.scale;
 for(const n of gesture.origin){n.x+=result.shiftX;n.y+=result.shiftY;}gesture.p.x+=result.shiftX;gesture.p.y+=result.shiftY;
 draw();canvasFields();
});
function finishGesture(e,cancel=false){
 if(!gesture)return;const g=gesture;gesture=null;viewport.classList.remove('panning','connecting');board.querySelector('.connection-preview')?.remove();
 if(['connect','reconnect'].includes(g.kind)&&!cancel){
  const under=document.elementFromPoint(e.clientX,e.clientY),target=under?.closest('[data-node]'),port=under?.closest('[data-port]');
  if(target){const n=project.nodes.find(n=>n.id===target.dataset.node),p=position(e),dest=port?{side:port.dataset.port,anchor:.5}:F.closestPort(n,p);
   if(g.kind==='connect')newEdge(g.source,n.id,g.side,dest.side,g.anchor,dest.anchor);
   else {const edge=project.edges.find(e=>e.id===g.id),other=g.end==='source'?edge.target:edge.source;if(other!==n.id){checkpoint();edge[g.end]=n.id;edge[g.end+'Port']=dest.side;edge[g.end+'Anchor']=dest.anchor;save({panel:true});}}
  }else status('Conexão cancelada: solte sobre um componente ou porta.');
 }else if(['move','resize'].includes(g.kind))save({panel:true});
}
viewport.addEventListener('pointerup',e=>finishGesture(e));viewport.addEventListener('pointercancel',e=>finishGesture(e,true));viewport.addEventListener('auxclick',e=>{if(e.button===1)e.preventDefault();});
viewport.addEventListener('wheel',e=>{
 if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();if(gesture)return;
 const rect=viewport.getBoundingClientRect(),cx=e.clientX-rect.left,cy=e.clientY-rect.top,world={x:(cx-view.x)/view.scale,y:(cy-view.y)/view.scale};
 const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?viewport.clientHeight:1),target=Math.max(.05,Math.min(4,(zoomTarget?.scale??view.scale)*Math.exp(-delta*.0015)));
 zoomTarget={scale:target,cx,cy,world};view.fit=false;cancelAnimationFrame(zoomFrame);
 function tick(){if(!zoomTarget)return;const z=zoomTarget,diff=z.scale-view.scale;view.scale=Math.abs(diff)<.0005?z.scale:view.scale+diff*.25;view.x=z.cx-z.world.x*view.scale;view.y=z.cy-z.world.y*view.scale;applyView();if(view.scale!==z.scale)zoomFrame=requestAnimationFrame(tick);else zoomTarget=null;}
 zoomFrame=requestAnimationFrame(tick);
},{passive:false});
function addNode(node){if(project.nodes.length>=500){status('Limite de 500 componentes.');return;}const center=position({clientX:viewport.getBoundingClientRect().left+viewport.clientWidth/2,clientY:viewport.getBoundingClientRect().top+viewport.clientHeight/2});node.x=Math.max(0,center.x-node.w/2);node.y=Math.max(0,center.y-node.h/2);node.id=uid();if(!project.autoGrow){node.w=Math.min(node.w,project.width);node.h=Math.min(node.h,project.height);node.x=Math.min(node.x,project.width-node.w);node.y=Math.min(node.y,project.height-node.h);}const clean=F.normalize({...project,nodes:[...project.nodes,node]}).nodes.at(-1);checkpoint();project.nodes.push(clean);selected={type:'node',id:clean.id};save({panel:true});}
function add(type){addNode(F.makeNode(type));}function addSystem(id){addNode(F.systemNode(id));}
function remove(){if(!selected)return;checkpoint();if(selected.type==='node'){const ids=descendants(selected.id);project.nodes=project.nodes.filter(n=>!ids.has(n.id));project.edges=project.edges.filter(e=>!ids.has(e.source)&&!ids.has(e.target));}else project.edges=project.edges.filter(e=>e.id!==selected.id);selected=null;save({panel:true});}
function field(parent,label,value,onchange,{type='text',options,min,max,step}={}){
 const l=document.createElement('label'),i=document.createElement(options?'select':type==='textarea'?'textarea':'input'),id=uid();l.textContent=label;l.htmlFor=id;i.id=id;
 if(options){for(const [v,t]of options){const o=document.createElement('option');o.value=v;o.textContent=t;i.append(o);}}else if(type!=='textarea')i.type=type;
 if(min!==undefined)i.min=min;if(max!==undefined)i.max=max;if(step!==undefined)i.step=step;i.value=value??'';
 let committing=false;
 i.addEventListener('change',()=>{if(committing)return;const v=type==='number'?Number(i.value):i.value;if(type==='number'&&(!Number.isFinite(v)||(min!==undefined&&v<min)||(max!==undefined&&v>max))){status('Valor fora do intervalo.');i.value=value;return;}const before=F.clone(project);committing=true;try{checkpoint();onchange(v);save();}catch(e){project=before;undoStack.pop();status(e.message);inspect();}finally{committing=false;}});parent.append(l,i);return i;
}
function checkbox(parent,label,checked,onchange){const l=document.createElement('label'),i=document.createElement('input');i.type='checkbox';i.checked=checked;l.className='check-option';l.append(i,document.createTextNode(label));i.onchange=()=>{checkpoint();onchange(i.checked);save();};parent.append(l);return i;}
function heading(parent,text){const h=document.createElement('h3');h.textContent=text;parent.append(h);}
function reportFontWarnings(warnings){if(warnings.length)status(warnings[0]+' · usando fonte local de reserva.');}
function typeFields(panel,item){
 heading(panel,'Tipografia');const t=item.typography??=F.typography(item);
 const family=field(panel,'Fonte (Google Fonts ou local)',t.fontFamily,v=>{const clean=F.normalize({...project});const target=(selected.type==='node'?clean.nodes:clean.edges).find(n=>n.id===item.id);target.typography.fontFamily=v;F.normalize(clean);t.fontFamily=v;FlowFonts.ensure(project).then(reportFontWarnings);});family.setAttribute('list','fontFamilies');
 field(panel,'Tamanho da fonte (px)',t.fontSize,v=>t.fontSize=v,{type:'number',min:6,max:96});
 if(selected.type==='node')field(panel,'Tamanho do subtítulo (px)',t.subtitleSize,v=>t.subtitleSize=v,{type:'number',min:6,max:72});
 const row=document.createElement('div');row.className='format-options';checkbox(row,'Bold',t.bold,v=>t.bold=v);checkbox(row,'Italic',t.italic,v=>t.italic=v);checkbox(row,'Code',t.code,v=>t.code=v);panel.append(row);
 const hint=document.createElement('p');hint.className='hint';hint.textContent='Digite também o nome de outra família do Google Fonts. O primeiro carregamento precisa de internet.';panel.append(hint);
}
function tableEditor(panel,item){
 heading(panel,'Estrutura da tabela');const t=item.table??=F.tablePreset();
 field(panel,'Modelo',t.model,v=>{item.table=F.tablePreset(v);item.h=Math.max(item.h,160);inspect();},{options:[['sql','SQL'],['nosql','NoSQL'],['schema','Schema']]});
 field(panel,'Colunas',t.columns.length,v=>{v=Math.round(v);t.columns=Array.from({length:v},(_,i)=>t.columns[i]??'Coluna '+(i+1));t.rows=t.rows.map(row=>t.columns.map((_,i)=>row[i]??''));inspect();},{type:'number',min:1,max:12});
 field(panel,'Linhas de dados',t.rows.length,v=>{v=Math.round(v);t.rows=Array.from({length:v},(_,i)=>t.columns.map((_,j)=>t.rows[i]?.[j]??''));item.h=Math.max(item.h,36+(v+1)*24);inspect();},{type:'number',min:0,max:40});
 colorField(panel,'Fundo do cabeçalho',t,'headerColor','#f1f5f9');
 const wrap=document.createElement('div');wrap.className='table-editor';const table=document.createElement('table');
 [t.columns,...t.rows].forEach((row,ri)=>{const tr=document.createElement('tr');row.forEach((value,ci)=>{const td=document.createElement('td'),input=document.createElement('input');input.value=value;input.maxLength=300;input.setAttribute('aria-label',`${ri===0?'Cabeçalho':'Linha '+ri}, coluna ${ci+1}`);input.onchange=()=>{checkpoint();if(ri===0)t.columns[ci]=input.value;else t.rows[ri-1][ci]=input.value;save();};td.append(input);tr.append(td);});table.append(tr);});wrap.append(table);panel.append(wrap);
}
function reactiveEditor(panel,item){
 heading(panel,'Reagir ao tráfego');const r=item.reactive;
 checkbox(panel,'Alternar texto',r.text,v=>r.text=v);checkbox(panel,'Alternar cor',r.color,v=>r.color=v);
 field(panel,'Texto ao entrar',r.enterText,v=>r.enterText=v,{type:'textarea'});field(panel,'Texto ao sair',r.exitText,v=>r.exitText=v,{type:'textarea'});
 colorField(panel,'Cor ao entrar',r,'enterColor','#dcfce7');colorField(panel,'Cor ao sair',r,'exitColor','#dbeafe');
 field(panel,'Transição de cor (s)',r.transition,v=>r.transition=v,{type:'number',min:0,max:5,step:.1});field(panel,'Manter estado (s; 0 = até outro evento)',r.hold,v=>r.hold=v,{type:'number',min:0,max:30,step:.1});
 heading(panel,'Filtrar legendas');const help=document.createElement('p');help.className='hint';help.textContent='Nenhuma selecionada = todas. Em eventos simultâneos, entrada tem prioridade.';panel.append(help);
 for(const l of project.legends)checkbox(panel,l.label,r.legends.includes(l.id),v=>{r.legends=v?[...r.legends,l.id]:r.legends.filter(id=>id!==l.id);});
}
function inspect(){
 $('componentExport').disabled=selected?.type!=='node';const panel=$('inspector');panel.replaceChildren();heading(panel,'Seleção');const item=selectedItem();
 if(!item){const p=document.createElement('p');p.className='hint';p.textContent='Selecione um componente ou conexão. Arraste uma porta azul até outro componente para conectar.';panel.append(p);return;}
 field(panel,'Rótulo',item.label,v=>item.label=v,{type:'textarea'});typeFields(panel,item);
 if(selected.type==='node'){
  field(panel,'Forma',item.type,v=>{item.type=v;if(v==='system'&&!item.icon.startsWith('sd:'))item.icon='sd:server';if(v==='table')item.table=F.tablePreset();if(v==='reactive'){item.reactive={};if(item.icon==='none')item.icon='sd:server';}const clean=F.normalize(project).nodes.find(n=>n.id===item.id);Object.assign(item,clean);inspect();},{options:Object.entries(F.TYPES)});
  field(panel,'Subtítulo',item.subtitle,v=>item.subtitle=v);
  if(item.type!=='table')field(panel,'Ícone',item.icon,v=>item.icon=v,{options:[...(item.type==='system'?[]:[['none','Nenhum'],['database','Banco'],['server','Servidor'],['api','API'],['code','Código'],['cube','Objeto'],['bolt','Cache'],['brain','IA']]),...Object.values(F.SYSTEM_DESIGN).map(c=>['sd:'+c.id,c.label])]});
  elementColors(panel,item,true);
  if(item.type==='table')tableEditor(panel,item);if(item.type==='reactive')reactiveEditor(panel,item);
  heading(panel,'Geometria');
  for(const [key,label]of [['x','Posição X'],['y','Posição Y'],['w','Largura'],['h','Altura']]){const size=['w','h'].includes(key);field(panel,label,item[key],v=>{const ids=descendants(item.id),originals=F.clone(project.nodes.filter(n=>ids.has(n.id)));F.transformNodes(project,originals,['x','w'].includes(key)?v-item[key]:0,['y','h'].includes(key)?v-item[key]:0,{kind:size?'resize':'move',id:item.id});inspect();},{type:'number',min:size?24:project.autoGrow?-5000:0,max:5000});}
  const children=descendants(item.id);field(panel,'Grupo pai',item.parent??'',v=>item.parent=v||null,{options:[['','Nenhum'],...project.nodes.filter(n=>['group','swimlane'].includes(n.type)&&!children.has(n.id)).map(n=>[n.id,n.label])]});
 }else{
  elementColors(panel,item,false);field(panel,'Tipo do conector',item.connector,v=>{item.connector=v;if(v==='curve')item.route='curve';inspect();},{options:Object.entries(F.CONNECTORS)});
  field(panel,'Trajeto',item.route,v=>{item.route=v;if(item.connector==='curve'&&v!=='curve')item.connector='out';},{options:[['orthogonal','Ortogonal arredondado'],['curve','Curva Bézier'],['straight','Linha reta']]});
  field(panel,'Espessura',item.lineWidth,v=>item.lineWidth=v,{type:'number',min:1,max:8,step:.5});
  const ports=[['auto','Automático'],['left','Esquerda'],['right','Direita'],['top','Topo'],['bottom','Base']];
  for(const [end,label]of [['source','Origem'],['target','Destino']]){field(panel,label+' · lado',item[end+'Port'],v=>item[end+'Port']=v,{options:ports});field(panel,label+' · posição na borda (%)',item[end+'Anchor']*100,v=>item[end+'Anchor']=v/100,{type:'number',min:0,max:100});}
  field(panel,'Deslocamento do trilho',item.offset,v=>item.offset=v,{type:'number',min:-2000,max:2000});field(panel,'Tempo base do percurso (s)',item.duration,v=>item.duration=v,{type:'number',min:.2,max:120,step:.1});
  heading(panel,'Tráfego na conexão');for(const l of project.legends)checkbox(panel,l.label,item.traffic.includes(l.id),v=>item.traffic=v?[...item.traffic,l.id]:item.traffic.filter(id=>id!==l.id));
 }
}
function legendEditor(){
 const box=$('legendEditor');box.replaceChildren();
 const remSize=F.TRAFFIC_VISUAL.defaultSize;
 for(const l of project.legends){const row=document.createElement('details');row.className='legend-row';const title=document.createElement('summary');title.textContent=l.label;row.append(title);
  field(row,'Nome da legenda',l.label,v=>{l.label=v;title.textContent=v;});colorField(row,'Cor do tráfego',l,'color','#70a0ff');
  field(row,'Símbolo',l.shape,v=>l.shape=v,{options:Object.entries(F.SYMBOLS)});
  field(row,'Efeito visual',l.effect,v=>l.effect=v,{options:Object.entries(F.EFFECTS)});
  field(row,'Sentido',l.direction,v=>l.direction=v,{options:[['forward','Origem → destino'],['reverse','Destino → origem']]});
  field(row,'Velocidade desta legenda (×)',l.speed,v=>l.speed=v,{type:'number',min:.1,max:8,step:.1});
  field(row,'Tamanho do marcador (rem)',l.size/remSize,v=>l.size=v*remSize,{type:'number',min:3/remSize,max:32/remSize,step:1/remSize});
  field(row,'Marcadores simultâneos',l.count,v=>l.count=Math.round(v),{type:'number',min:1,max:8});
  const del=document.createElement('button');del.textContent='Remover legenda';del.className='danger';del.onclick=()=>{checkpoint();project.legends=project.legends.filter(v=>v.id!==l.id);for(const e of project.edges)e.traffic=e.traffic.filter(id=>id!==l.id);for(const n of project.nodes)if(n.reactive)n.reactive.legends=n.reactive.legends.filter(id=>id!==l.id);save({legend:true,panel:true});};row.append(del);box.append(row);
 }
}
const searchKey=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function renderPalette(){
 const mode=$('paletteMode').value,system=mode==='system',palette=$('palette');$('systemFilters').hidden=!system;palette.replaceChildren();palette.classList.toggle('system-palette',system||mode==='custom');
 const query=searchKey($('componentSearch').value.trim()),category=$('componentCategory').value;
 const entries=system?Object.values(F.SYSTEM_DESIGN).filter(c=>(!category||c.category===category)&&searchKey(c.label+' '+c.english).includes(query)):Object.values(F.COMPONENTS).filter(c=>c.category===(mode==='custom'?'custom':'flowchart'));
 $('componentCount').textContent=entries.length+' componentes';
 for(const c of entries){const b=document.createElement('button');b.dataset.shape=system?'system':c.id;if(system)b.dataset.component=c.id;b.title=c.label;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('aria-hidden','true');svg.setAttribute('viewBox',system?'0 0 64 64':'-2 -2 86 46');svg.innerHTML=system?F.systemGlyph(c.id):F.shape({type:c.id,w:82,h:42,color:'#ffffff',borderColor:'#000000'});
  const label=document.createElement('span');label.textContent=c.label;b.append(svg,label);b.onclick=()=>system?addSystem(c.id):add(c.id);palette.append(b);
 }
 if(!entries.length){const p=document.createElement('p');p.className='hint';p.textContent='Nenhum componente encontrado.';palette.append(p);}
}

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

for(const category of new Set(Object.values(F.SYSTEM_DESIGN).map(c=>c.category))){const o=document.createElement('option');o.value=o.textContent=category;$('componentCategory').append(o);}
for(const name of F.FONTS){const o=document.createElement('option');o.value=name;$('fontFamilies').append(o);}
for(const [id,label]of Object.entries(F.CONNECTORS)){const o=document.createElement('option');o.value=id;o.textContent=label;$('connectorType').append(o);}
$('paletteMode').onchange=renderPalette;$('componentSearch').oninput=renderPalette;$('componentCategory').onchange=renderPalette;renderPalette();
for(const [button,factory]of [['studioTemplate',F.studioTemplate],['gallery',F.gallery],['systemTemplate',F.systemTemplate],['systemGallery',F.systemGallery],['featureTemplate',F.featureTemplate],['protocolTemplate',F.protocolTemplate]])$(button).onclick=()=>setProject(factory());
$('blank').onclick=()=>setProject({...F.studioTemplate(),title:'Novo fluxograma',kicker:'ANIMATED FLOW STUDIO',description:'',nodes:[],edges:[]});
$('resetApp').onclick=()=>{if(!confirm('Limpar o projeto salvo neste navegador e restaurar o padrão? Esta ação não pode ser desfeita.'))return;try{localStorage.removeItem(KEY);localStorage.removeItem(OLD);undoStack=[];redoStack=[];setProject(F.featureTemplate());localStorage.removeItem(OLD);status('Cache local limpo e projeto restaurado.');}catch(e){status('Não foi possível limpar o cache: '+e.message);}};
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
$('addLegend').onclick=()=>{if(project.legends.length>=20){status('Limite de 20 legendas.');return;}checkpoint();project.legends.push({id:uid(),label:'Novo tráfego',color:'#ffca76',shape:'square',direction:'forward',effect:'packet',speed:1,size:16,count:1});save({legend:true});};
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
 if(!staticMode&&!component&&(snapshot.nodes.some(n=>n.type==='reactive')||svg.includes('class="packet protocol-packet"')))svg=svg.replace(/<\/svg>\s*$/,()=>'<script><![CDATA['+runtimeScript(snapshot,'document.documentElement').replace(/]]>/g,']]]]><![CDATA[>')+']]></script></svg>');
 if(fonts.warnings.length)status('Exportado com fonte local de reserva: '+fonts.warnings.join('; '));else status('Exportação pronta.');
 return svg;
}
async function exportAction(action){try{await action();}catch(e){status('Falha na exportação: '+e.message);}}
$('componentExport').onclick=()=>exportAction(async()=>{const n=selected?.type==='node'&&selectedItem();if(n)offer('componente.svg',new Blob([await svgExport(true,F.clone(n))],{type:'image/svg+xml;charset=utf-8'}));});
$('svgExport').onclick=()=>exportAction(async()=>offer('fluxograma.svg',new Blob([await svgExport()],{type:'image/svg+xml;charset=utf-8'})));
$('staticSvgExport').onclick=()=>exportAction(async()=>offer('fluxograma-estatico.svg',new Blob([await svgExport(true)],{type:'image/svg+xml;charset=utf-8'})));
$('jsonExport').onclick=()=>offer('fluxograma.json',new Blob([JSON.stringify(project,null,2)],{type:'application/json'}));
$('pngExport').onclick=()=>exportAction(async()=>{
 const svg=await svgExport(true),width=project.width,height=project.height+F.headerHeight(project),factor=PNGExport.scale(width,height);
 const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
 try{const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('Não foi possível renderizar o SVG.'));img.src=url;});const canvas=document.createElement('canvas');canvas.width=Math.round(width*factor);canvas.height=Math.round(height*factor);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('PNG indisponível.');const png=PNGExport.withDpi(await blob.arrayBuffer());offer('fluxograma.png',new Blob([png],{type:'image/png'}));if(factor<PNGExport.DPI/96)status('PNG exportado a 300 dpi; o limite de 16 MP reduziu o tamanho em pixels.');}finally{URL.revokeObjectURL(url);}
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

/* PNG export helpers shared by the editor and Node tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PNGExport = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const DPI = 300;
  const CSS_DPI = 96;
  const MAX_PIXELS = 16_000_000;
  const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
  const CRC_TABLE = Uint32Array.from({ length: 256 }, (_, index) => {
    let value = index;
    for (let bit = 0; bit < 8; bit++) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    return value >>> 0;
  });

  function scale(width, height, dpi = DPI) {
    if (![width, height, dpi].every(Number.isFinite) || width <= 0 || height <= 0 || dpi <= 0) {
      throw new Error('PNG dimensions and DPI must be positive numbers.');
    }
    return Math.min(dpi / CSS_DPI, Math.sqrt(MAX_PIXELS / (width * height)));
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function chunk(type, data) {
    const bytes = new Uint8Array(data.length + 12);
    const view = new DataView(bytes.buffer);
    view.setUint32(0, data.length);
    for (let index = 0; index < 4; index++) bytes[index + 4] = type.charCodeAt(index);
    bytes.set(data, 8);
    view.setUint32(bytes.length - 4, crc32(bytes.subarray(4, bytes.length - 4)));
    return bytes;
  }

  function withDpi(png, dpi = DPI) {
    const source = png instanceof Uint8Array ? png : new Uint8Array(png);
    if (!Number.isFinite(dpi) || dpi <= 0 || PNG_SIGNATURE.some((value, index) => source[index] !== value)) {
      throw new Error('Expected a PNG image and a positive DPI value.');
    }
    const pixelsPerMeter = Math.round(dpi / 0.0254);
    const density = new Uint8Array(9);
    const densityView = new DataView(density.buffer);
    densityView.setUint32(0, pixelsPerMeter);
    densityView.setUint32(4, pixelsPerMeter);
    density[8] = 1;

    const chunks = [source.slice(0, 8)];
    let offset = 8;
    let foundHeader = false;
    let foundEnd = false;
    while (offset + 12 <= source.length) {
      const length = new DataView(source.buffer, source.byteOffset + offset, 4).getUint32(0);
      const end = offset + length + 12;
      if (end > source.length) throw new Error('PNG contains a truncated chunk.');
      const type = String.fromCharCode(...source.subarray(offset + 4, offset + 8));
      if (type === 'IHDR') {
        foundHeader = true;
        chunks.push(source.slice(offset, end), chunk('pHYs', density));
      } else if (type !== 'pHYs') {
        chunks.push(source.slice(offset, end));
      }
      offset = end;
      if (type === 'IEND') {
        foundEnd = true;
        break;
      }
    }
    if (!foundHeader || !foundEnd || offset !== source.length) throw new Error('PNG chunk structure is invalid.');

    const result = new Uint8Array(chunks.reduce((total, part) => total + part.length, 0));
    let cursor = 0;
    for (const part of chunks) {
      result.set(part, cursor);
      cursor += part.length;
    }
    return result;
  }

  return { DPI, MAX_PIXELS, scale, withDpi };
});
