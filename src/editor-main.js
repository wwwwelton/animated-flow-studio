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
 if(e.button!==0&&e.button!==1)return;
 viewport.classList.add('pointer-focused');viewport.focus({preventScroll:true});stopZoom();
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
viewport.addEventListener('blur',()=>viewport.classList.remove('pointer-focused'));
viewport.addEventListener('wheel',e=>{
 if(!e.ctrlKey&&!e.metaKey)return;e.preventDefault();if(gesture)return;
 const rect=viewport.getBoundingClientRect(),cx=e.clientX-rect.left,cy=e.clientY-rect.top,world={x:(cx-view.x)/view.scale,y:(cy-view.y)/view.scale};
 const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?viewport.clientHeight:1),target=Math.max(.05,Math.min(4,(zoomTarget?.scale??view.scale)*Math.exp(-delta*.0015)));
 zoomTarget={scale:target,cx,cy,world};view.fit=false;cancelAnimationFrame(zoomFrame);
 function tick(){if(!zoomTarget)return;const z=zoomTarget,diff=z.scale-view.scale;view.scale=Math.abs(diff)<.0005?z.scale:view.scale+diff*.25;view.x=z.cx-z.world.x*view.scale;view.y=z.cy-z.world.y*view.scale;applyView();if(view.scale!==z.scale)zoomFrame=requestAnimationFrame(tick);else zoomTarget=null;}
 zoomFrame=requestAnimationFrame(tick);
},{passive:false});
function openNodePosition(node,center){
 const maxX=Math.max(0,project.width-node.w),maxY=Math.max(0,project.height-node.h);
 const baseX=Math.min(maxX,Math.max(0,center.x-node.w/2)),baseY=Math.min(maxY,Math.max(0,center.y-node.h/2));
 const current=selected?.type==='node'?selectedItem():null,candidates=[];
 if(current)candidates.push([current.x+current.w+20,current.y],[current.x,current.y+current.h+20]);
 for(let ring=0;ring<=6;ring++)for(let dy=-ring;dy<=ring;dy++)for(let dx=-ring;dx<=ring;dx++){
  if(Math.max(Math.abs(dx),Math.abs(dy))===ring)candidates.push([baseX+dx*(node.w+16),baseY+dy*(node.h+16)]);
 }
 for(const [x,y] of candidates){
  if(x<0||y<0||x>maxX||y>maxY)continue;
  if(project.nodes.some(other=>x<other.x+other.w+12&&x+node.w+12>other.x&&y<other.y+other.h+12&&y+node.h+12>other.y))continue;
  return {x,y};
 }
 return {x:baseX,y:baseY};
}
function addNode(node){
 if(project.nodes.length>=500){status('Limite de 500 componentes.');return;}
 const rect=viewport.getBoundingClientRect();
 const center=position({clientX:rect.left+rect.width/2,clientY:rect.top+rect.height/2});
 if(!project.autoGrow){node.w=Math.min(node.w,project.width);node.h=Math.min(node.h,project.height);}
 Object.assign(node,openNodePosition(node,center),{id:uid()});
 const clean=F.normalize({...project,nodes:[...project.nodes,node]}).nodes.at(-1);
 checkpoint();project.nodes.push(clean);selected={type:'node',id:clean.id};save({panel:true});
}
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
  field(row,F.PROTOCOL_FLOW_STYLES[l.effect]?'Protocolo / comportamento':'Efeito visual',l.effect,v=>{l.effect=v;legendEditor();$('legendEditor').children[project.legends.indexOf(l)].open=true;},{options:Object.entries(F.EFFECTS)});
  if(F.PROTOCOL_FLOW_STYLES[l.effect])field(row,'Aparência da partícula',l.visualEffect??'packet',v=>l.visualEffect=v,{options:Object.entries(F.VISUAL_EFFECTS)});
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
