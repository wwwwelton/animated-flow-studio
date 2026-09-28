/* Pure SVG renderer and project schema. No DOM or network dependency. */
const TYPES={...Object.fromEntries(Object.entries(COMPONENTS).map(([id,c])=>[id,c.label])),system:'System Design'};
const LEGENDS=[{id:'request',label:'Solicitação',color:'#70a0ff',shape:'square',direction:'forward'},{id:'response',label:'Resposta',color:'#9ae8c5',shape:'circle',direction:'reverse'},{id:'cdc',label:'Alterações (CDC)',color:'#bb8ae8',shape:'diamond',direction:'forward'}];
const EFFECTS={packet:'Marcador',pulse:'Pulso',glow:'Brilho',trail:'Rastro',comet:'Cometa',dashed:'Fluxo tracejado',rest:'REST · solicitação/resposta',graphql:'GraphQL · seleção de dados',grpc:'gRPC · quadro tipado',websocket:'WebSocket · duas vias',webhook:'Webhook · notificação',sse:'SSE · fluxo contínuo',mqtt:'MQTT · publish/subscribe'};
const SYMBOLS={square:'Quadrado',circle:'Círculo',diamond:'Losango',triangle:'Triângulo',arrow:'Seta',star:'Estrela'};
const TRAFFIC_VISUAL={baseSize:8,protocolStrokeWidth:1.1,peakOpacity:.86,fadeIn:.06,fadeOut:.94};
const EFFECT_BEHAVIOR={
 rest:{paired:true,reverseDelay:.55},graphql:{paired:false},grpc:{paired:false},
 websocket:{paired:true,reverseDelay:.7},webhook:{paired:false,cycle:2},sse:{paired:false},mqtt:{paired:false}
};
const PROTOCOL_GLYPHS={
 rest:'<rect x="-4" y="-3" width="4" height="6" rx="1"/><path d="M0 0H4m-1.5-1.5L4 0 2.5 1.5"/>',
 graphql:'<path d="M-2-3H-3.5V3H-2M2-3H3.5V3H2M-1-1H1M-1 1H1"/>',
 grpc:'<rect x="-3.5" y="-3" width="7" height="6" rx="1.2"/><circle cx="-1.5" r=".6" fill="currentColor" stroke="none"/><path d="M-.2 0H2"/>',
 websocket:'<path d="M-4-1H2m-1.4-1.4L2-1 .6.4M4 1H-2m1.4-1.4L-2 1-.6 2.4"/>',
 webhook:'<circle cx="-2" r="1.5" fill="currentColor" stroke="none"/><path d="M-.2 0H4m-1.5-1.5L4 0 2.5 1.5"/>',
 sse:'<circle cx="-3" r=".6" fill="currentColor" stroke="none"/><circle cx="-1" r=".6" fill="currentColor" stroke="none"/><circle cx="1" r=".6" fill="currentColor" stroke="none"/><path d="M2 0H4m-1.5-1.5L4 0 2.5 1.5"/>',
 mqtt:'<path d="M0-3.5L3.5 0 0 3.5-3.5 0Z"/><circle r=".7" fill="currentColor" stroke="none"/>'
};
const CONNECTORS={out:'Seta saída',in:'Seta entrada',curve:'Seta em curva',both:'Seta bidirecional',line:'Linha',dashed:'Linha tracejada',dotted:'Linha pontilhada',double:'Linha dupla'};
const FONTS=['Arial','Georgia','Verdana','Courier New','Inter','Roboto','Open Sans','Lato','Montserrat','Poppins','Nunito','Ubuntu','Merriweather','Playfair Display','Roboto Mono','JetBrains Mono','Fira Code','Source Code Pro'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const color=(s,fallback='#ffffff')=>typeof s==='string'&&/^#[0-9a-f]{6}$/i.test(s)?s:fallback;
const clone=x=>JSON.parse(JSON.stringify(x));
const owns=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const enumValue=(value,object,fallback)=>owns(object,value)?value:fallback;
function number(value,fallback,min,max,name){value=value??fallback;if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max)throw Error(name+' fora do intervalo '+min+'–'+max);return value;}
function fontName(value){const name=String(value??'Arial').trim();if(!/^[\p{L}\p{N} _-]{1,80}$/u.test(name))throw Error('Nome de fonte inválido.');return name;}
function typography(n){const t=n.typography??{};return {fontFamily:fontName(t.fontFamily??n.fontFamily),fontSize:number(t.fontSize??n.fontSize,14,6,96,'Fonte'),subtitleSize:number(t.subtitleSize,10,6,72,'Subtítulo'),bold:t.bold===true,italic:t.italic===true,code:t.code===true};}
function tablePreset(model='sql'){
 const models={sql:{columns:['Coluna','Tipo','Chave'],rows:[['id','UUID','PK'],['user_id','UUID','FK'],['created_at','TIMESTAMP','']]},nosql:{columns:['Campo','Valor'],rows:[['_id','ObjectId'],['name','"Cliente"'],['tags','["vip", "ativo"]']]},schema:{columns:['Campo','Tipo','Obrigatório'],rows:[['id','string','Sim'],['email','string','Sim'],['active','boolean','Não']]}};
 return {model,headerColor:'#f1f5f9',...clone(models[model]??models.sql)};
}
function normalizeTable(value){
 const t=value??tablePreset();
 if(!Array.isArray(t.columns)||t.columns.length<1||t.columns.length>12||!Array.isArray(t.rows)||t.rows.length>40)throw Error('Tabela: 1–12 colunas e 0–40 linhas.');
 if(t.rows.some(r=>!Array.isArray(r)))throw Error('Linhas da tabela devem ser arrays.');
 return {model:['sql','nosql','schema'].includes(t.model)?t.model:'sql',headerColor:color(t.headerColor,'#f1f5f9'),columns:t.columns.map(s=>String(s).slice(0,100)),rows:t.rows.map(r=>t.columns.map((_,i)=>String(r[i]??'').slice(0,300)))};
}
function normalize(input){
 if(!input||typeof input!=='object'||!Array.isArray(input.nodes)||!Array.isArray(input.edges))throw Error('Projeto inválido: nodes e edges são obrigatórios.');
 if(input.nodes.length>500||input.edges.length>1000)throw Error('Limite: 500 blocos e 1000 conexões.');
 const p={version:3,systemLayout:'compact-left-v2',title:String(input.title??'Fluxograma').slice(0,200),kicker:String(input.kicker??'FIGURA 01 · ARQUITETURA').slice(0,150),description:String(input.description??'').slice(0,600),width:number(input.width,1278,300,5000,'Largura'),height:number(input.height,633,300,5000,'Altura'),autoGrow:input.autoGrow!==false,growthMargin:number(input.growthMargin,48,0,500,'Margem'),showLegend:input.showLegend!==false,grid:input.grid!==false,trafficSpeed:number(input.trafficSpeed,1,.1,8,'Velocidade global'),legends:[],nodes:[],edges:[]};
 const legends=input.legends??LEGENDS;
 if(!Array.isArray(legends)||legends.length>20)throw Error('Máximo de 20 legendas.');
 const ids=new Set(),lids=new Set(),eids=new Set();
 for(const l of legends){
  if(!l||typeof l.id!=='string'||!l.id||l.id.length>100||lids.has(l.id))throw Error('ID de legenda inválido ou duplicado.');lids.add(l.id);
  p.legends.push({id:l.id,label:String(l.label??'Tráfego').slice(0,80),color:color(l.color),shape:enumValue(l.shape,SYMBOLS,'square'),direction:l.direction==='reverse'?'reverse':'forward',effect:enumValue(l.effect,EFFECTS,'packet'),speed:number(l.speed,1,.1,8,'Velocidade da legenda'),size:number(l.size,8,3,32,'Tamanho do marcador'),count:Math.round(number(l.count,1,1,8,'Quantidade de marcadores'))});
 }
 for(const n of input.nodes){
  if(!n||typeof n.id!=='string'||!n.id||ids.has(n.id)||n.id.length>100)throw Error('ID de bloco inválido ou duplicado.');ids.add(n.id);
  const type=n.type??'card';if(!owns(TYPES,type))throw Error('Forma desconhecida: '+type);
  const a={id:n.id,type,label:String(n.label??'').slice(0,300),subtitle:String(n.subtitle??'').slice(0,300),x:number(n.x,0,-5000,5000,'X'),y:number(n.y,0,-5000,5000,'Y'),w:number(n.w??n.width,190,24,5000,'Largura do bloco'),h:number(n.h??n.height,n.subtitle?62:46,24,5000,'Altura do bloco'),color:color(n.color),borderColor:color(n.borderColor,'#000000'),textColor:color(n.textColor,'#000000'),subtitleColor:color(n.subtitleColor,'#000000'),iconColor:color(n.iconColor,'#333333'),icon:String(n.icon??'none'),parent:n.parent??null,typography:typography(n)};
  if((type==='system'||a.icon.startsWith('sd:'))&&!owns(SYSTEM_DESIGN,a.icon.replace(/^sd:/,'')))throw Error('Símbolo de System Design desconhecido.');
  if(type==='table')a.table=normalizeTable(n.table);
  if(type==='reactive'){
   const r=n.reactive??{};if(r.legends!==undefined&&(!Array.isArray(r.legends)||r.legends.some(id=>!lids.has(id))))throw Error('Filtro de legenda reativa inválido.');
   a.reactive={text:r.text!==false,color:r.color!==false,enterText:String(r.enterText??'Recebendo').slice(0,300),exitText:String(r.exitText??'Enviando').slice(0,300),enterColor:color(r.enterColor,'#dcfce7'),exitColor:color(r.exitColor,'#dbeafe'),transition:number(r.transition,.3,0,5,'Transição'),hold:number(r.hold,1.5,0,30,'Duração do estado'),legends:r.legends??[]};
  }
  // Earlier default tiles migrate once; current custom dimensions/colors survive.
  if(!input.systemLayout&&type==='system'){if(a.w===180&&a.h===140){a.w=190;a.h=62;a.y+=39;}if(a.borderColor==='#cbd5e1')a.borderColor='#000000';}
  p.nodes.push(a);
 }
 for(const n of p.nodes){if(n.parent&&!ids.has(n.parent))throw Error('Grupo pai ausente.');let parent=n.parent,seen=new Set([n.id]);while(parent){if(seen.has(parent))throw Error('Ciclo de grupos.');seen.add(parent);parent=p.nodes.find(v=>v.id===parent)?.parent;}}
 for(const [i,e]of input.edges.entries()){
  if(!e||!ids.has(e.source)||!ids.has(e.target)||e.source===e.target)throw Error('Conexão precisa de dois blocos distintos existentes.');
  const id=e.id??'edge'+i;if(typeof id!=='string'||id.length>100||eids.has(id))throw Error('ID de conexão inválido ou duplicado.');eids.add(id);
  const traffic=e.traffic??[e.color===LEGENDS[1].color?'response':'request'];if(!Array.isArray(traffic)||traffic.some(id=>!lids.has(id)))throw Error('Legenda da conexão não existe.');
  const sourcePort=e.sourcePort??'auto',targetPort=e.targetPort??'auto';if(![sourcePort,targetPort].every(v=>['auto','left','right','top','bottom'].includes(v)))throw Error('Porta inválida.');
  const a={id,source:e.source,target:e.target,label:String(e.label??'').slice(0,150),traffic:[...new Set(traffic)],strokeColor:color(e.strokeColor,'#000000'),textColor:color(e.textColor,'#000000'),duration:number(e.duration,8,.2,120,'Duração'),route:['orthogonal','curve','straight'].includes(e.route)?e.route:'orthogonal',sourcePort,targetPort,sourceAnchor:number(e.sourceAnchor,.5,0,1,'Âncora de saída'),targetAnchor:number(e.targetAnchor,.5,0,1,'Âncora de entrada'),offset:number(e.offset,0,-2000,2000,'Deslocamento'),connector:enumValue(e.connector,CONNECTORS,traffic.some(id=>p.legends.find(l=>l.id===id)?.direction==='reverse')?'both':'out'),lineWidth:number(e.lineWidth,1,1,8,'Espessura'),typography:typography(e)};
  if(a.connector==='curve')a.route='curve';p.edges.push(a);
 }
 growCanvas(p);return p;
}
function lines(text,max){let out=[];for(const part of String(text??'').split('\n')){let line='';for(let word of part.split(/\s+/)){if(line.length+word.length+1>max&&line){out.push(line);line='';}while(word.length>max){if(line){out.push(line);line='';}out.push(word.slice(0,max));word=word.slice(max);}line+=(line?' ':'')+word;}out.push(line);}return out;}
function textStyle(n,subtitle=false){const t=typography(n),family=t.code&&!/(Mono|Code|Courier|Consolas|Inconsolata)/i.test(t.fontFamily)?'Courier New':t.fontFamily;return `font-family:'${esc(family)}',${t.code?'monospace':'Arial,sans-serif'};font-size:${subtitle?t.subtitleSize:t.fontSize}px;font-weight:${t.bold?700:400};font-style:${t.italic?'italic':'normal'};fill:${color(subtitle?n.subtitleColor:n.textColor,'#000000')}`;}
function wrapText(text,width,size){return lines(text,Math.max(2,Math.floor(width/(size*.6))));}
function textBlock(n,text,x,y,width,height,{subtitle=false,anchor='start',limit=20}={}){
 const t=typography(n),size=subtitle?t.subtitleSize:t.fontSize,lineHeight=size*1.22;
 const wrapped=wrapText(text,width,size).slice(0,limit),total=wrapped.length*lineHeight,scale=Math.min(1,height/Math.max(total,1));
 const xText=anchor==='middle'?width/2:0;
 return `<g transform="translate(${x} ${y+(height-total*scale)/2})"><g transform="scale(${scale})">${wrapped.map((s,i)=>`<text x="${xText}" y="${size+i*lineHeight}" text-anchor="${anchor}" style="${textStyle(n,subtitle)}">${esc(s)}</text>`).join('')}</g></g>`;
}
function systemGlyph(id,x=0,y=0,size=64,stroke='#333333'){
 const entry=owns(SYSTEM_DESIGN,id)?SYSTEM_DESIGN[id]:null;if(!entry)return '';
 return `<g class="icon" transform="translate(${x} ${y}) scale(${size/64})" style="color:${color(stroke,'#333333')}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${entry.svg}</g>`;
}
function shape(n){
 const definition=COMPONENTS[n.type==='system'?'card':n.type];if(!definition)return '';
 const body=definition.svg.replaceAll('{{fill}}',color(n.color)).replaceAll('{{stroke}}',color(n.borderColor,'#000000'));
 return `<svg width="${n.w}" height="${n.h}" viewBox="0 0 100 100" preserveAspectRatio="none" overflow="visible">${body}</svg>`;
}
function nodeLabels(n,label=n.label){
 const t=typography(n),protocol=COMPONENTS[n.type]?.renderer==='protocol';
 const compact=['card','system','reactive'].includes(n.type)||protocol,hasIcon=protocol||(n.icon!=='none'&&compact);
 if(compact&&(n.w<140||n.h<46)){const w=Math.max(140,n.w),h=Math.max(46,n.h),s=Math.min(n.w/w,n.h/h);return `<g transform="translate(${(n.w-w*s)/2} ${(n.h-h*s)/2}) scale(${s})">${nodeLabels({...n,w,h},label)}</g>`;}
 const grouped=['group','swimlane'].includes(n.type);
 const pad=grouped?12:hasIcon?50:Math.max(12,n.w*(COMPONENTS[n.type]?.textInset??.07));
 const right=compact?12:pad,width=Math.max(12,n.w-pad-right);
 const areaY=grouped?6:6,areaH=grouped?Math.min(n.h-12,t.fontSize*1.8):n.h-12;
 const titleLines=wrapText(label,width,t.fontSize),subLines=n.subtitle?wrapText(n.subtitle,width,t.subtitleSize):[];
 const titleH=titleLines.length*t.fontSize*1.22,subH=subLines.length*t.subtitleSize*1.22,total=titleH+subH;
 const scale=Math.min(1,areaH/Math.max(1,total)),anchor=compact?'start':'middle',textX=compact?0:width/2;
 let content=titleLines.map((v,i)=>`<text class="node-title" x="${textX}" y="${t.fontSize+i*t.fontSize*1.22}" text-anchor="${anchor}" style="${textStyle(n)}">${esc(v)}</text>`).join('');
 content+=subLines.map((v,i)=>`<text class="node-subtitle" x="${textX}" y="${titleH+t.subtitleSize+i*t.subtitleSize*1.22}" text-anchor="${anchor}" style="${textStyle(n,true)}">${esc(v)}</text>`).join('');
 const cx=anchor==='middle'?width/2:0;
 let result=`<g class="node-copy" transform="translate(${pad+cx} ${areaY+(areaH-total*scale)/2}) scale(${scale}) translate(${-cx} 0)">${content}</g>`;
 if(hasIcon)result+=protocol?systemGlyph(n.type,12,(n.h-28)/2,28,n.iconColor):n.icon.startsWith('sd:')?systemGlyph(n.icon.slice(3),12,(n.h-28)/2,28,n.iconColor):icon(n.icon,14,(n.h-20)/2,n.iconColor);
 return result;
}
function tableBody(n){
 const t=n.table??tablePreset(),font=typography(n),titleH=Math.max(30,font.fontSize*1.6),rowH=(n.h-titleH)/(t.rows.length+1),colW=n.w/t.columns.length;
 if(rowH<12){const h=titleH+(t.rows.length+1)*12,s=n.h/h;return `<g transform="scale(1 ${s})">${tableBody({...n,h})}</g>`;}
 let body=`<rect x="0" y="${titleH}" width="${n.w}" height="${rowH}" fill="${t.headerColor}"/>`;
 body+=textBlock({...n,typography:{...font,bold:true}},n.label,10,2,n.w-20,titleH-4);
 for(let i=0;i<=t.rows.length;i++){const y=titleH+i*rowH;body+=`<line x1="0" y1="${y}" x2="${n.w}" y2="${y}" stroke="${n.borderColor}"/>`;}
 for(let i=1;i<t.columns.length;i++)body+=`<line x1="${i*colW}" y1="${titleH}" x2="${i*colW}" y2="${n.h}" stroke="${n.borderColor}"/>`;
 [t.columns,...t.rows].forEach((row,ri)=>row.forEach((value,ci)=>{body+=textBlock({...n,typography:{...font,bold:ri===0||font.bold}},value,ci*colW+7,titleH+ri*rowH+3,colW-14,Math.max(1,rowH-6));}));
 return body;
}
function node(n,selected=false,{interactive=false,state=null}={}){
 let current=state?{...n,label:state.label,color:state.color}:n,body=shape(current);
 if(n.type==='table')body+=tableBody(n);else body+=nodeLabels(current);
 if(selected)body+=`<rect x="-4" y="-4" width="${n.w+8}" height="${n.h+8}" rx="5" class="selection"/><rect data-resize="${esc(n.id)}" x="${n.w-5}" y="${n.h-5}" width="10" height="10" class="resize"/>`;
 if(interactive)body+=['left','right','top','bottom'].map(side=>{const [x,y]=port({...n,x:0,y:0},side,.5);return `<circle class="port" data-port="${side}" data-owner="${esc(n.id)}" cx="${x}" cy="${y}" r="5"/>`;}).join('');
 return `<g class="node${selected?' selected':''}" data-node="${esc(n.id)}" transform="translate(${n.x} ${n.y})">${body}</g>`;
}
function port(n,side,anchor=.5){return side==='left'?[n.x,n.y+n.h*anchor]:side==='right'?[n.x+n.w,n.y+n.h*anchor]:side==='top'?[n.x+n.w*anchor,n.y]:[n.x+n.w*anchor,n.y+n.h];}
function closestPort(n,point){
 const x=Math.max(0,Math.min(1,(point.x-n.x)/n.w)),y=Math.max(0,Math.min(1,(point.y-n.y)/n.h));
 const options=[['left',Math.abs(point.x-n.x),y],['right',Math.abs(point.x-n.x-n.w),y],['top',Math.abs(point.y-n.y),x],['bottom',Math.abs(point.y-n.y-n.h),x]].sort((a,b)=>a[1]-b[1]);
 return {side:options[0][0],anchor:Math.max(.05,Math.min(.95,options[0][2]))};
}
function rounded(points,r=8){const q=[];for(const p of points)if(!q.length||p[0]!==q.at(-1)[0]||p[1]!==q.at(-1)[1])q.push(p);if(q.length<2)return '';let d=`M${q[0][0]} ${q[0][1]}`;for(let i=1;i<q.length-1;i++){const a=q[i-1],b=q[i],c=q[i+1],ab=Math.hypot(b[0]-a[0],b[1]-a[1]),bc=Math.hypot(c[0]-b[0],c[1]-b[1]),t=Math.min(r,ab/2,bc/2),u=[b[0]+(a[0]-b[0])*t/ab,b[1]+(a[1]-b[1])*t/ab],v=[b[0]+(c[0]-b[0])*t/bc,b[1]+(c[1]-b[1])*t/bc];d+=`L${u[0]} ${u[1]}Q${b[0]} ${b[1]} ${v[0]} ${v[1]}`;}return d+`L${q.at(-1)[0]} ${q.at(-1)[1]}`;}
function route(a,b,e){
 const dx=b.x+b.w/2-a.x-a.w/2,dy=b.y+b.h/2-a.y-a.h/2,horizontal=Math.abs(dx)>=Math.abs(dy);
 const sp=!e.sourcePort||e.sourcePort==='auto'?(horizontal?(dx>=0?'right':'left'):(dy>=0?'bottom':'top')):e.sourcePort,tp=!e.targetPort||e.targetPort==='auto'?(horizontal?(dx>=0?'left':'right'):(dy>=0?'top':'bottom')):e.targetPort;
 const s=port(a,sp,e.sourceAnchor??.5),t=port(b,tp,e.targetAnchor??.5),sh=['left','right'].includes(sp),th=['left','right'].includes(tp),offset=e.offset??0;
 let points;if(sh&&th){const mid=(s[0]+t[0])/2+offset;points=[s,[mid,s[1]],[mid,t[1]],t];}else if(!sh&&!th){const mid=(s[1]+t[1])/2+offset;points=[s,[s[0],mid],[t[0],mid],t];}else points=sh?[s,[t[0],s[1]],t]:[s,[s[0],t[1]],t];
 const vectors={left:[-1,0],right:[1,0],top:[0,-1],bottom:[0,1]},distance=Math.max(40,Math.hypot(...[t[0]-s[0],t[1]-s[1]])*.4)+Math.abs(offset);
 const c1=[s[0]+vectors[sp][0]*distance,s[1]+vectors[sp][1]*distance],c2=[t[0]+vectors[tp][0]*distance,t[1]+vectors[tp][1]*distance];
 const d=e.route==='straight'?`M${s[0]} ${s[1]}L${t[0]} ${t[1]}`:e.route==='curve'?`M${s[0]} ${s[1]}C${c1} ${c2} ${t}`:rounded(points);
 return {d,x:(s[0]+t[0])/2,y:(s[1]+t[1])/2-12,start:s,end:t};
}
function symbol(kind,x,y,size,fill){
 const r=size/2,a=`fill="${color(fill)}" stroke="#000000" stroke-width=".6"`;
 if(kind==='circle')return `<circle cx="${x}" cy="${y}" r="${r}" ${a}/>`;
 if(kind==='diamond')return `<path d="M${x} ${y-r}L${x+r} ${y}L${x} ${y+r}L${x-r} ${y}Z" ${a}/>`;
 if(kind==='triangle')return `<path d="M${x+r} ${y}L${x-r} ${y-r}L${x-r} ${y+r}Z" ${a}/>`;
 if(kind==='arrow')return `<path d="M${x-r} ${y-r/2}H${x}V${y-r}L${x+r} ${y}L${x} ${y+r}V${y+r/2}H${x-r}Z" ${a}/>`;
 if(kind==='star'){const points=Array.from({length:10},(_,i)=>{const angle=-Math.PI/2+i*Math.PI/5,radius=i%2?r*.45:r;return `${x+Math.cos(angle)*radius},${y+Math.sin(angle)*radius}`;});return `<polygon points="${points.join(' ')}" ${a}/>`;}
 return `<rect x="${x-r}" y="${y-r}" width="${size}" height="${size}" rx="2" ${a}/>`;
}
function streams(p){
 const result=[];
 p.edges.forEach((e,i)=>e.traffic.forEach((id,j)=>{
  const l=p.legends.find(l=>l.id===id);if(!l)return;
  const duration=e.duration/((p.trafficSpeed??1)*(l.speed??1));
  for(let k=0;k<(l.count??1);k++)result.push({edge:e,index:i,legend:l,duration,delay:(i*.18+j*.22)/((p.trafficSpeed??1)*(l.speed??1))+k*duration/(l.count??1),key:`${i}-${j}-${k}`,source:l.direction==='reverse'?e.target:e.source,target:l.direction==='reverse'?e.source:e.target});
 }));return result;
}
function reactiveStates(p,time,streamList=null){
 const result=Object.create(null),events=Object.create(null);
 for(const n of p.nodes)if(n.type==='reactive')result[n.id]={label:n.label,color:n.color,event:'idle',legend:null};
 const lookup=new Map(p.nodes.filter(n=>n.type==='reactive').map(n=>[n.id,n]));
 for(const stream of streamList??streams(p))for(const [id,event,first]of [[stream.source,'exit',stream.delay],[stream.target,'enter',stream.delay+stream.duration]]){
  const n=lookup.get(id);if(!n||time+1e-7<first)continue;const r=n.reactive;
  if(r.legends.length&&!r.legends.includes(stream.legend.id))continue;
  const at=first+Math.floor((time-first+1e-7)/stream.duration)*stream.duration;
  if(!events[id]||at>events[id].at+1e-6||(Math.abs(at-events[id].at)<1e-6&&event==='enter'))events[id]={at,event,legend:stream.legend.id};
 }
 for(const [id,e]of Object.entries(events)){const n=lookup.get(id),r=n.reactive;if(r.hold>0&&time-e.at>=r.hold)continue;result[id]={label:r.text?(e.event==='enter'?r.enterText:r.exitText):n.label,color:r.color?(e.event==='enter'?r.enterColor:r.exitColor):n.color,event:e.event,legend:e.legend};}
 return result;
}
function legendLayout(p){let x=32,y=0,rows=1;const items=[];for(const l of p.legends){const w=l.label.length*7+45;if(x+w>p.width-32&&x>32){x=32;y+=32;rows++;}items.push({l,x,y});x+=w;}return {items,rows:p.legends.length?rows:0};}
function headerHeight(p){return 130+(p.description?Math.max(0,lines(p.description,Math.floor((p.width-64)/7)).length-1)*18:0)+(p.showLegend?legendLayout(p).rows*32:0);}
const svgStyle=`text{font-family:Arial,sans-serif;fill:#000}.kicker{font-family:monospace;font-size:10px;font-weight:600}.figure-title{font-size:21px;font-weight:700}.description{font-size:13px}.legend-label{font-size:13px}.edge-label{paint-order:stroke;stroke:white;stroke-width:4px;stroke-linejoin:round}.rail{fill:none;stroke:black;stroke-width:1;stroke-linecap:round;stroke-linejoin:round}.node-shape{stroke-linejoin:round}.selection{fill:none;stroke:#1675df;stroke-width:1.5;stroke-dasharray:4 3;pointer-events:none}.hit{stroke:transparent;stroke-width:16;fill:none;cursor:pointer}.node{cursor:move}.node text,.icon,.packet{pointer-events:none}.resize{fill:white;stroke:#1675df;cursor:nwse-resize}.port{fill:white;stroke:#2563eb;stroke-width:1.5;opacity:0;cursor:crosshair}.node:hover>.port,.node.selected>.port,.connecting .port{opacity:1}.diagram-controls{cursor:pointer}@media(prefers-reduced-motion:reduce){.packet{display:none}}`;
function protocolGlyph(legend){
 const drawing=PROTOCOL_GLYPHS[legend.effect];if(!drawing)return '';
 const scale=legend.size/TRAFFIC_VISUAL.baseSize,stroke=color(legend.color);
 return `<g transform="scale(${scale})" fill="none" stroke="${stroke}" stroke-width="${TRAFFIC_VISUAL.protocolStrokeWidth}" stroke-linecap="round" stroke-linejoin="round" style="color:${stroke}">${drawing}</g>`;
}
function trafficGlyph(legend){
 return PROTOCOL_GLYPHS[legend.effect]?protocolGlyph(legend):symbol(legend.shape,0,0,legend.size,legend.color);
}
function motionPacket(stream,prefix){
 const {legend:l,duration,delay,index,key}=stream,pid=`${prefix}-edge-${index}`;
 const behavior=EFFECT_BEHAVIOR[l.effect]??{paired:false,reverseDelay:0},cycle=duration*(behavior.cycle??1),visible=duration/cycle;
 const motion=(lag=0,reverse=l.direction==='reverse')=>`<animateMotion dur="${duration}s" begin="${delay+lag}s" calcMode="linear" repeatCount="indefinite" rotate="auto" ${reverse?'keyPoints="1;0" keyTimes="0;1"':''}><mpath href="#${pid}"/></animateMotion>`;
 let body=trafficGlyph(l);
 if(l.effect==='glow')body=`<circle r="${l.size}" fill="${l.color}" opacity=".2"/><circle r="${l.size*.7}" fill="${l.color}" opacity=".2"/>`+body;
 if(l.effect==='pulse')body=`<g>${body}<animateTransform attributeName="transform" type="scale" values=".96;1;.96" dur="${duration/4}s" begin="${delay}s" repeatCount="indefinite"/></g>`;
 if(l.effect==='dashed')body=`<rect x="${-l.size}" y="-2" width="${l.size*2}" height="4" rx="2" fill="${l.color}"/>`;
 if(l.effect==='comet'){const tail=(l.direction==='reverse'?1:-1)*l.size*3;body=`<path class="comet-tail" d="M 0 ${-l.size*.4} Q ${tail*.45} 0 ${tail} 0 Q ${tail*.45} 0 0 ${l.size*.4} Z" fill="${l.color}" opacity=".45"/>`+body;}
 const fade=behavior.cycle>1?`0;${TRAFFIC_VISUAL.peakOpacity};${TRAFFIC_VISUAL.peakOpacity};0;0`:`0;${TRAFFIC_VISUAL.peakOpacity};${TRAFFIC_VISUAL.peakOpacity};0`;
 const fadeTimes=behavior.cycle>1?`0;${TRAFFIC_VISUAL.fadeIn*visible};${TRAFFIC_VISUAL.fadeOut*visible};${visible};1`:`0;${TRAFFIC_VISUAL.fadeIn};${TRAFFIC_VISUAL.fadeOut};1`;
 let ghosts='';if(l.effect==='trail')for(let i=4;i>=1;i--)ghosts+=`<g class="packet" opacity="0">${symbol(l.shape,0,0,l.size*(1-i*.13),l.color)}${motion(i*duration*.013)}<animate attributeName="opacity" values="0;${(.4-i*.06).toFixed(2)};${(.4-i*.06).toFixed(2)};0" keyTimes="${fadeTimes}" begin="${delay+i*duration*.013}s" dur="${duration}s" repeatCount="indefinite"/></g>`;
 const packet=(content,reverse=false,lag=0,streamKey=key)=>`<g class="packet" data-stream="${streamKey}" opacity="0">${content}${motion(lag,reverse)}<animate attributeName="opacity" values="${fade}" keyTimes="${fadeTimes}" dur="${cycle}s" begin="${delay+lag}s" repeatCount="indefinite"/></g>`;
 return ghosts+packet(body,l.direction==='reverse')+(behavior.paired?packet(body,l.direction!=='reverse',behavior.reverseDelay,`${key}-return`):'');
}
function render(p,options={}){
 const head=headerHeight(p),height=p.height+head,prefix=options.prefix??'af',sel=options.selected,staticMode=options.static===true;
 let defs=`<defs><pattern id="${prefix}-grid" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".45" fill="#e2e2e2"/></pattern>`;
 let body=`<rect width="${p.width}" height="${height}" fill="white"/><text x="32" y="44" class="kicker">${esc(p.kicker.toUpperCase())}</text><text x="32" y="86" class="figure-title">${esc(p.title)}</text>`;
 body+=lines(p.description,Math.max(8,Math.floor((p.width-64)/7))).map((s,i)=>`<text x="32" y="${115+i*18}" class="description">${esc(s)}</text>`).join('');
 if(p.showLegend){const layout=legendLayout(p);for(const {l,x,y}of layout.items){const ly=head-layout.rows*32+15+y;body+=symbol(l.shape,x+7,ly,14,l.color)+`<text x="${x+22}" y="${ly+4}" class="legend-label">${esc(l.label)}</text>`;}}
 if(options.controls)body+=`<g class="diagram-controls" data-play="true"><rect x="${p.width-113}" y="63" width="81" height="34" rx="9" fill="white" stroke="black"/><text x="${p.width-72}" y="84" text-anchor="middle" font-size="11">${options.paused?'▶ Reproduzir':'Ⅱ Pausar'}</text></g>`;
 body+=`<g transform="translate(0 ${head})" id="${prefix}-board"><rect width="${p.width}" height="${p.height}" fill="${p.grid?'url(#'+prefix+'-grid)':'white'}"/>`;
 const groups=p.nodes.filter(n=>['group','swimlane'].includes(n.type));
 for(const n of groups)body+=node(n,sel?.type==='node'&&sel.id===n.id,{interactive:options.interactive});
 const lookup=new Map(p.nodes.map(n=>[n.id,n]));
 for(const [i,e]of p.edges.entries()){
  const a=lookup.get(e.source),b=lookup.get(e.target);if(!a||!b)continue;
  const path=route(a,b,e),pid=`${prefix}-edge-${i}`,stroke=color(e.strokeColor,'#000000'),kind=e.connector??'out';
  defs+=`<marker id="${pid}-arrow" viewBox="0 0 8 8" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M1 1L7 4L1 7" fill="none" stroke="${stroke}" stroke-width="1.1"/></marker>`;
  const markers=(['out','curve','both'].includes(kind)?` marker-end="url(#${pid}-arrow)"`:'')+(['in','both'].includes(kind)?` marker-start="url(#${pid}-arrow)"`:'');
  const dash=kind==='dashed'?' stroke-dasharray="8 5"':kind==='dotted'?' stroke-dasharray="1 5"':'';
  const width=e.lineWidth??1;
  if(kind==='double')body+=`<path d="${path.d}" fill="none" stroke="${stroke}" stroke-width="${width*2+3}" stroke-linejoin="round"/>`;
  body+=`<path d="${path.d}" id="${pid}" class="rail" style="stroke:${kind==='double'?'#ffffff':stroke};stroke-width:${kind==='double'?3:width}"${markers}${dash}/>`;
  if(sel?.type==='edge'&&sel.id===e.id)body+=`<path d="${path.d}" class="selection"/>`;
  if(options.interactive)body+=`<path d="${path.d}" class="hit" data-edge="${esc(e.id)}"/>`;
  if(e.label)body+=`<text x="${path.x}" y="${path.y}" class="edge-label" style="${textStyle(e)}" text-anchor="middle">${esc(e.label)}</text>`;
 }
 const states=reactiveStates(p,options.time??0);
 for(const n of p.nodes.filter(n=>!groups.includes(n)))body+=node(n,sel?.type==='node'&&sel.id===n.id,{interactive:options.interactive,state:states[n.id]});
 if(!staticMode)for(const s of streams(p))body+=motionPacket(s,prefix);
 defs+='</defs>';body+='</g>';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${p.width} ${height}" width="${p.width}" height="${height}" role="img" aria-label="${esc(p.title)}"><title>${esc(p.title)}</title><style>${svgStyle}</style>${defs}${body}</svg>`;
}
function systemNode(id,overrides={}){if(!owns(SYSTEM_DESIGN,id))throw Error('Símbolo desconhecido: '+id);return {id:'sd-'+id,type:'system',icon:'sd:'+id,label:SYSTEM_DESIGN[id].label,subtitle:'',x:40,y:40,w:190,h:62,color:'#ffffff',borderColor:'#000000',textColor:'#000000',subtitleColor:'#000000',iconColor:'#333333',parent:null,...overrides};}
function makeNode(type,overrides={}){
 const c=COMPONENTS[type];if(!c)throw Error('Componente desconhecido.');
 const defaultIcon=type==='reactive'?'sd:server':c.renderer==='protocol'?`sd:${type}`:'none';
 return {id:type,type,label:c.label,subtitle:'',x:40,y:40,w:c.width,h:c.height,color:'#ffffff',icon:defaultIcon,...(type==='table'?{table:tablePreset()}:{}),...overrides};
}
function componentSVG(n){return `<svg xmlns="http://www.w3.org/2000/svg" width="${n.w+2}" height="${n.h+2}" viewBox="-1 -1 ${n.w+2} ${n.h+2}" role="img" aria-label="${esc(n.label)}"><title>${esc(n.label)}</title><style>${svgStyle}</style>${node({...n,x:0,y:0})}</svg>`;}
function systemGallery(){const nodes=Object.keys(SYSTEM_DESIGN).map((id,i)=>systemNode(id,{x:40+i%5*220,y:30+Math.floor(i/5)*90}));return normalize({title:'Componentes de System Design',kicker:'ANIMATED FLOW STUDIO · CATÁLOGO',description:'81 símbolos vetoriais originais, incluindo sete protocolos de API.',width:1160,height:1580,nodes,edges:[]});}
function systemTemplate(){
 const nodes=[systemNode('client',{id:'client',x:40,y:70}),systemNode('api-gateway',{id:'gateway',x:300,y:70}),systemNode('load-balancer',{id:'lb',x:560,y:70}),systemNode('server',{id:'service',x:820,y:70,label:'Serviço de pedidos'}),systemNode('cache',{id:'cache',x:1080,y:40}),systemNode('sql-database',{id:'db',x:1080,y:260}),systemNode('message-queue',{id:'queue',x:560,y:340}),systemNode('consumer',{id:'worker',x:820,y:340}),systemNode('object-storage',{id:'storage',x:1080,y:480})];
 const links=[['client','gateway','HTTPS'],['gateway','lb','API'],['lb','service','Roteamento'],['service','cache','Consulta'],['service','db','Persistência'],['service','queue','Evento'],['queue','worker','Consumo'],['worker','storage','Artefato']];
 return normalize({title:'Arquitetura de pedidos',kicker:'SYSTEM DESIGN · EXEMPLO EDITÁVEL',width:1340,height:670,nodes,edges:links.map(([source,target,label],i)=>({id:'sd-edge-'+i,source,target,label,traffic:i<5?['request','response']:['cdc'],duration:6}))});
}
function featureTemplate(){
 const nodes=[systemNode('client',{id:'client',x:40,y:160}),makeNode('reactive',{id:'status',x:365,y:160,label:'Aguardando tráfego',reactive:{enterText:'Pedido recebido',exitText:'Resposta enviada',enterColor:'#dcfce7',exitColor:'#dbeafe',hold:2}}),makeNode('table',{id:'sql',label:'orders · SQL',x:690,y:45,table:tablePreset('sql')}),makeNode('table',{id:'nosql',label:'events · NoSQL',x:690,y:325,table:tablePreset('nosql')}),makeNode('table',{id:'schema',label:'Contrato · Schema',x:40,y:325,table:tablePreset('schema')})];
 const legends=[{...LEGENDS[0],effect:'comet',size:10,speed:1},{...LEGENDS[1],effect:'pulse',speed:.8},{...LEGENDS[2],effect:'glow',shape:'star'}];
 return normalize({title:'Tabelas, eventos e componente reativo',kicker:'ANIMATED FLOW STUDIO 3',description:'Arraste as portas azuis para conectar. Ctrl + roda aplica zoom; arraste o fundo para navegar.',width:1100,height:600,nodes,legends,edges:[{id:'a',source:'client',target:'status',traffic:['request','response'],duration:4,connector:'both'},{id:'b',source:'status',target:'sql',traffic:['request'],duration:5,connector:'curve'},{id:'c',source:'status',target:'nosql',traffic:['cdc'],duration:6,connector:'dashed'},{id:'d',source:'schema',target:'status',traffic:['request'],duration:8,connector:'dotted'}]});
}
function protocolTemplate(){
 const specs=[
  {id:'rest',type:'api-rest',title:'REST',effect:'rest',color:'#2563eb',shape:'square',speed:1,count:1,icon:'api',source:'Web e mobile',sourceNote:'Cliente HTTP.',target:'Recursos HTTP',targetNote:'Users · products · orders.',note:'CRUD com métodos HTTP e recursos.',link:'Métodos HTTP'},
  {id:'graphql',type:'api-graphql',title:'GraphQL',effect:'graphql',color:'#c026d3',shape:'diamond',speed:1,count:1,icon:'database',source:'Aplicações clientes',sourceNote:'Pede apenas os campos necessários.',target:'API de dados',targetNote:'Resolvers e fontes de dados.',note:'Consulta campos sob demanda.',link:'Consulta tipada'},
  {id:'grpc',type:'api-grpc',title:'gRPC',effect:'grpc',color:'#0f766e',shape:'square',speed:1.05,count:1,icon:'server',source:'Serviço interno A',sourceNote:'Chama com contrato Protobuf.',target:'Microsserviço B',targetNote:'Atende chamadas RPC tipadas.',note:'RPC tipada de baixa latência.',link:'RPC · Protobuf'},
  {id:'websocket',type:'api-websocket',title:'WebSockets',effect:'websocket',color:'#ea580c',shape:'arrow',speed:.95,count:1,icon:'network',source:'Chat / multiplayer',sourceNote:'Mantém o canal aberto.',target:'Serviço em tempo real',targetNote:'Envia e recebe eventos.',note:'Conexão persistente, duas vias.',link:'Canal aberto'},
  {id:'webhook',type:'api-webhook',title:'Webhooks',effect:'webhook',color:'#dc2626',shape:'star',speed:.8,count:1,icon:'network',source:'Provedor de eventos',sourceNote:'Publica um evento.',target:'Agente de IA',targetNote:'Recebe um callback HTTP.',note:'Notificação enviada ao endpoint.',link:'POST de evento'},
  {id:'sse',type:'api-sse',title:'SSE',effect:'sse',color:'#0284c7',shape:'circle',speed:.95,count:1,icon:'server',source:'Servidor de eventos',sourceNote:'Envia eventos via HTTP.',target:'Feed / agente',targetNote:'Recebe o fluxo contínuo.',note:'Stream unidirecional do servidor.',link:'HTTP · stream'},
  {id:'mqtt',type:'api-mqtt',title:'MQTT',effect:'mqtt',color:'#65a30d',shape:'triangle',speed:.95,count:1,icon:'network',source:'Sensores IoT',sourceNote:'Publica em tópicos.',target:'Assinantes',targetNote:'Consome tópicos inscritos.',note:'Pub/sub leve para redes instáveis.',link:'Tópico pub/sub'}
 ];
 const nodes=[],edges=[],legends=[];
 for(const [i,s] of specs.entries()){
  const y=36+i*142;
  nodes.push(makeNode('card',{id:`${s.id}-source`,label:s.source,subtitle:s.sourceNote,x:42,y:y+15,w:224,h:74,color:'#ffffff',icon:s.icon}));
  const frame={x:493,y:y+15,w:224,h:74},size=COMPONENTS[s.type];
  nodes.push(makeNode(s.type,{id:`${s.id}-protocol`,label:s.title,subtitle:s.note,x:frame.x+(frame.w-size.width)/2,y:frame.y+(frame.h-size.height)/2,color:'#ffffff'}));
  nodes.push(makeNode('card',{id:`${s.id}-target`,label:s.target,subtitle:s.targetNote,x:1110,y:y+15,w:224,h:74,color:'#ffffff',icon:s.icon}));
  legends.push({id:s.id,label:s.title+' · '+s.link,color:s.color,shape:s.shape,direction:'forward',effect:s.effect,speed:s.speed,size:8,count:s.count});
  const source=`${s.id}-source`,target=`${s.id}-target`;
  const connector=s.id==='websocket'?'both':'out';
  edges.push({id:`${s.id}-request`,source,target:`${s.id}-protocol`,traffic:[s.id],duration:5+i%3,connector});
  edges.push({id:`${s.id}-delivery`,source:`${s.id}-protocol`,target,traffic:[s.id],duration:5+i%3,connector});
 }
 return normalize({title:'7 protocolos de API',kicker:'GUIA VISUAL · API E TEMPO REAL',description:'REST, GraphQL, gRPC, WebSockets, Webhooks, SSE e MQTT: compare o papel de cada protocolo e veja o tráfego animado em ação.',width:1380,height:1035,nodes,edges,legends,trafficSpeed:1,grid:false});
}
