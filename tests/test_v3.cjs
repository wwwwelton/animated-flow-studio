const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),F=require('../src/flow-core.js');
const simple=()=>F.normalize({nodes:[F.systemNode('client',{id:'a',x:30,y:40}),F.makeNode('reactive',{id:'b',x:330,y:40,label:'Idle',reactive:{enterText:'In',exitText:'Out',hold:.5}}),F.systemNode('server',{id:'c',x:650,y:40})],edges:[{id:'ab',source:'a',target:'b',duration:2,traffic:['request']},{id:'bc',source:'b',target:'c',duration:4,traffic:['request']}]});
test('all v3 settings survive JSON and invalid ranges are rejected',()=>{
 const p=F.featureTemplate();p.nodes[0].typography={fontFamily:'Roboto Mono',fontSize:21,subtitleSize:12,bold:true,italic:true,code:true};p.trafficSpeed=2;p.legends[0].count=4;p.legends[0].speed=3;
 assert.deepEqual(F.normalize(JSON.parse(JSON.stringify(p))),p);
 for(const update of [{trafficSpeed:0},{trafficSpeed:Infinity}])assert.throws(()=>F.normalize({...p,...update}));
 p.nodes[0].typography.fontFamily='Arial; fill:red';assert.throws(()=>F.normalize(p));
});
test('new traffic markers default to 10 diagram pixels and retain explicit sizes',()=>{
 const p=F.normalize({nodes:[F.systemNode('client',{id:'client'})],edges:[],legends:[{id:'default'},{id:'custom',size:8}]});
 assert.deepEqual(p.legends.map(legend=>legend.size),[10,8]);
 assert.ok(F.protocolTemplate().legends.every(legend=>legend.size===10));
});
test('global speed and per-legend speed change actual travel durations',()=>{
 const p=simple();p.trafficSpeed=2;p.legends[0].speed=4;p.legends[0].count=3;
 const streams=F.streams(p);assert.equal(streams.length,6);assert.equal(streams[0].duration,.25);assert.equal(streams[1].delay,1/12);
 assert.match(F.render(p),/animateMotion dur="0.25s"/);
});
test('reactive state follows enter, exit, timeout, filters and independent toggles',()=>{
 const p=simple(),n=p.nodes[1];
 assert.equal(F.reactiveStates(p,0).b.label,'Idle');
 assert.equal(F.reactiveStates(p,.2).b.label,'Out');
 assert.equal(F.reactiveStates(p,2.1).b.label,'In');
 assert.equal(F.reactiveStates(p,3).b.label,'Idle');
 assert.equal(F.reactiveStates(p,4.3).b.label,'Out');
 n.reactive.text=false;assert.equal(F.reactiveStates(p,2.1).b.label,'Idle');assert.equal(F.reactiveStates(p,2.1).b.color,n.reactive.enterColor);
 n.reactive.color=false;assert.equal(F.reactiveStates(p,2.1).b.color,n.color);
 n.reactive.legends=['response'];assert.equal(F.reactiveStates(p,2.1).b.event,'idle');
});
test('reverse traffic exchanges source and destination event roles',()=>{
 const p=simple();p.edges=p.edges.slice(0,1);p.edges[0].traffic=['response'];
 const streams=F.streams(p);assert.equal(streams[0].source,'b');assert.equal(streams[0].target,'a');
 assert.equal(F.reactiveStates(p,.1).b.event,'exit');
});
test('simultaneous incoming events have priority over outgoing events',()=>{
 const p=simple();p.edges[1].duration=2;p.edges[1].traffic=['request'];
 const list=F.streams(p);list[1].delay=0;
 assert.equal(F.reactiveStates(p,2,list).b.event,'enter');
});
test('tables retain editable cells, variable dimensions and Unicode',()=>{
 const p=F.featureTemplate(),n=p.nodes.find(n=>n.type==='table');n.table.columns=['ID','Descrição','Tipo','Índice'];n.table.rows=[['1','São Paulo','string','✓'],['2','<script>','json','']];
 const clean=F.normalize(p);assert.deepEqual(clean.nodes.find(v=>v.id===n.id)?.table,n.table);
 const svg=F.render(clean,{static:true});assert.match(svg,/São/);assert.match(svg,/Paulo/);assert.ok(!svg.includes('<script>'));
 n.table.columns=[];assert.throws(()=>F.normalize(p));
});
test('eight connector presets render independently of traffic directions',()=>{
 for(const connector of Object.keys(F.CONNECTORS)){const p=simple();p.edges=p.edges.slice(0,1);p.edges[0].connector=connector;if(connector==='curve')p.edges[0].route='curve';const svg=F.render(p,{static:true});
  assert.equal(/marker-end="/.test(svg),['out','curve','both'].includes(connector));assert.equal(/marker-start="/.test(svg),['in','both'].includes(connector));
  if(connector==='dashed')assert.match(svg,/stroke-dasharray="8 5"/);if(connector==='dotted')assert.match(svg,/stroke-dasharray="1 5"/);if(connector==='double')assert.match(svg,/stroke-width="5"/);
 }
});
test('many-to-many permits shared ports and repeated node pairs with distinct edges',()=>{
 const p=simple();p.edges.push({...p.edges[0],id:'ab2',offset:25},{...p.edges[0],id:'cb',source:'c'});assert.equal(F.normalize(p).edges.length,4);
 const r=F.route(p.nodes[0],p.nodes[1],{...p.edges[0],sourcePort:'right',sourceAnchor:.2,targetPort:'left',targetAnchor:.8});assert.deepEqual(r.start,[220,52.4]);assert.deepEqual(r.end,[330,89.6]);
});
test('all marker shapes and effects remain valid standalone SVG geometry',()=>{
 const p=simple();for(const effect of Object.keys(F.EFFECTS))for(const shape of Object.keys(F.SYMBOLS)){p.legends[0].effect=effect;p.legends[0].shape=shape;const svg=F.render(p);assert.ok(!/NaN|undefined/.test(svg));assert.match(svg,/animateMotion/);}
});
test('API protocol glyphs can be selected as symbols and appear in the traffic legend',()=>{
 const protocols=['rest','graphql','grpc','websocket','webhook','sse','mqtt'];
 assert.deepEqual(Object.keys(F.SYMBOLS).slice(-protocols.length),protocols);
 const p=F.normalize({
  title:'Protocol glyph',width:600,height:300,
  legends:[{id:'api',label:'Novo tráfego',color:'#c026d3',shape:'graphql',effect:'packet'}],
  nodes:[F.systemNode('client',{id:'source',x:30,y:90}),F.systemNode('server',{id:'target',x:350,y:90})],
  edges:[{id:'link',source:'source',target:'target',traffic:['api']}]
 });
 assert.deepEqual(F.normalize(JSON.parse(JSON.stringify(p))),p);

 const staticSvg=F.render(p,{static:true}),markerStart=staticSvg.indexOf('class="legend-marker"'),markerEnd=staticSvg.indexOf('<text',markerStart),marker=staticSvg.slice(markerStart,markerEnd);
 assert.match(marker,/scale\(2\.25\)/);assert.ok(marker.includes('M0-3.5L3.5 0 0 3.5'));
 assert.match(marker,/stroke="#c026d3"/);
 const animatedSvg=F.render(p);
 assert.match(animatedSvg,/data-stream="0-0-0"[^]*?scale\(1\.25\)[^]*?M0-3\.5L3\.5 0/);
});
test('API traffic uses small glyphs, soft fades and protocol-specific direction',()=>{
 const p=F.protocolTemplate(),legendMap=Object.fromEntries(p.legends.map(l=>[l.id,l]));
 assert.deepEqual(Object.values(legendMap).map(l=>[l.size,l.count]),Array.from({length:7},()=>[10,1]));
 const demoSizes=F.featureTemplate().legends.filter(l=>['pulse','glow'].includes(l.effect)).map(l=>l.size);
 assert.ok(Object.values(legendMap).every(l=>demoSizes.includes(l.size)));
 assert.deepEqual(['rest','graphql','grpc','websocket','webhook','sse','mqtt'].map(id=>legendMap[id].speed),[1,1,1.08,.95,.8,.95,.95]);
 assert.ok(legendMap.grpc.speed>legendMap.rest.speed);
 for(const n of p.nodes.filter(n=>n.type.startsWith('api-'))){assert.equal(n.color,'#ffffff');assert.equal(n.borderColor,'#000000');assert.equal(n.iconColor,'#333333');}
 const rest=p.edges.filter(e=>e.id.startsWith('rest-')),websocket=p.edges.filter(e=>e.id.startsWith('websocket-'));
 assert.ok(rest.every(e=>e.connector==='out'));assert.ok(websocket.every(e=>e.connector==='both'));
 const sse=F.streams(p).filter(s=>s.legend.id==='sse');assert.equal(sse.length,2);
 assert.deepEqual(sse.map(s=>[s.source,s.target]),[['sse-source','sse-protocol'],['sse-protocol','sse-target']]);
 assert.equal(F.streams(p).find(s=>s.legend.id==='webhook').duration,7.5);
 const svg=F.render(p);assert.match(svg,/values="0;0\.86;0\.86;0" keyTimes="0;0\.06;0\.94;1"/);
 assert.match(svg,/data-stream="0-0-0-return"[^]*?begin="0\.55s"[^]*?keyPoints="1;0"/);
 assert.match(svg,/data-stream="2-0-0-return"[^]*?begin="[0-9.]+s"[^]*?keyPoints="1;0"/);
 assert.match(svg,/data-stream="4-0-0-return"[^]*?begin="[0-9.]+s"[^]*?keyPoints="1;0"/);
 assert.match(svg,/data-stream="6-0-0-return"[^]*?begin="[0-9.]+s"[^]*?keyPoints="1;0"/);
 assert.match(svg,/data-stream="8-0-0"[^]*?values="0;0\.86;0\.86;0;0" keyTimes="0;0\.03;0\.47;0\.5;1" dur="15s"/);
 assert.equal((svg.match(/data-stream="[^"]+-return"/g)||[]).length,8);
 assert.doesNotMatch(svg,/r="8" fill="#[0-9a-f]{6}" fill-opacity/);
});
test('API traffic uses reference glyphs and protocol-specific visual motion',()=>{
 const p=F.protocolTemplate(),svg=F.render(p),streams=F.streams(p);
 assert.match(svg,/@media\(prefers-reduced-motion:reduce\)\{\.packet\{display:none\}\}/);
 assert.match(svg,/<animateMotion dur="[0-9.]+s"[^>]*calcMode="linear"/);
 const legendMap=Object.fromEntries(p.legends.map(legend=>[legend.id,legend]));
 assert.deepEqual(Object.entries(legendMap).map(([id,legend])=>[id,legend.shape]),[
  ['rest','rest'],['graphql','graphql'],['grpc','grpc'],['websocket','websocket'],
  ['webhook','webhook'],['sse','sse'],['mqtt','mqtt']
 ]);
 assert.match(svg,/data-stream="0-0-0"[^]*?<circle cx="-3" r="\.75"[^]*?<path d="M-1\.5 0H3/); // REST request.
 assert.match(svg,/data-stream="0-0-0-return"[^]*?scale\(-1 1\)/); // REST response.
 assert.match(svg,/data-stream="2-0-0"[^]*?M0-3\.5L3\.5 0 0 3\.5-3\.5 0Z/); // GraphQL diamond.
 assert.match(svg,/data-stream="4-0-0"[^]*?<circle cx="-3" r="\.45"[^]*?<circle cx="3" r="\.45"/); // gRPC bead train.
 assert.match(svg,/data-stream="6-0-0"[^]*?<circle r="\.85"[^]*?M-2\.5-1\.7L-3\.5 0/); // WebSocket packet.
 assert.match(svg,/stroke-dasharray="6 4"/); // Persistent WebSocket channel.
 assert.match(svg,/data-stream="8-0-0"[^]*?dur="15s"/); // Sparse webhook event.
 assert.match(svg,/data-stream="10-0-0"[^]*?<circle cx="-3" r="\.55"[^]*?M1\.4 0H3\.5/); // SSE stream packet.
 assert.match(svg,/data-stream="12-0-0"[^]*?<circle r="\.9" fill="currentColor"/); // MQTT particle.
 const mqttRequest=streams.find(stream=>stream.legend.id==='mqtt'&&stream.edge.id==='mqtt-request');
 const mqttDelivery=streams.find(stream=>stream.legend.id==='mqtt'&&stream.edge.id==='mqtt-delivery');
 assert.equal(mqttDelivery.delay-mqttRequest.delay,mqttRequest.duration+.18/.95+.35);
 const fanoutProject=F.normalize(JSON.parse(JSON.stringify(p)));
 fanoutProject.nodes.push(F.systemNode('server',{id:'mqtt-subscriber-2',x:1110,y:1080}));
 fanoutProject.edges.push({id:'mqtt-fanout',source:'mqtt-protocol',target:'mqtt-subscriber-2',traffic:['mqtt'],duration:5});
 const fanout=F.streams(fanoutProject).filter(stream=>stream.source==='mqtt-protocol');
 assert.deepEqual(fanout.map(stream=>stream.target),['mqtt-target','mqtt-subscriber-2']);
 assert.ok(fanout[1].delay>fanout[0].delay);
 assert.deepEqual(streams.filter(stream=>stream.legend.id==='sse').map(stream=>[stream.source,stream.target]),[
  ['sse-source','sse-protocol'],['sse-protocol','sse-target']
 ]);
 assert.equal(streams.filter(stream=>stream.legend.id==='sse'&&stream.key.includes('return')).length,0); // SSE stays one-way.
 for(const edgeIndex of [6,7])assert.match(svg,new RegExp(`data-stream="${edgeIndex}-0-0-return"`));
});
test('API traffic legends use their protocol glyphs at the standard marker scale',()=>{
 const p=F.protocolTemplate(),expected=[
  ['rest','REST','#2563eb','rest','M-3 0H3','→'],['graphql','GraphQL','#c026d3','graphql','M0-3.5L3.5 0','◇'],
  ['grpc','gRPC','#0f766e','grpc','M-3 0H-.5','⇉'],['websocket','WebSockets','#ea580c','websocket','M-3 0H3','↔'],
  ['webhook','Webhooks','#dc2626','webhook','M-3 2C-3-2','↪'],['sse','SSE','#0284c7','sse','M-3-1H2','⇒'],
  ['mqtt','MQTT','#65a30d','mqtt','<circle r="3.2"','◉']
 ];
 assert.deepEqual(p.legends.map(({id,label,color,shape})=>[id,label,color,shape]),expected.map(([id,label,color,shape])=>[id,label,color,shape]));
 assert.ok(p.legends.every(legend=>legend.size===10));

 const svg=F.render(p,{static:true}),legendSvg=svg.slice(0,svg.indexOf('<g transform="translate(0 '));
 assert.equal((legendSvg.match(/class="legend-label"/g)||[]).length,7);
 for(const [id,label,color,,glyph,symbol] of expected){
  const start=legendSvg.indexOf(`data-legend="${id}"`),end=legendSvg.indexOf('</g>',start),marker=legendSvg.slice(start,end);
  assert.match(marker,/scale\(2\.25\)/);
  assert.match(marker,/stroke-width="1\.1"/);
  assert.ok(marker.includes(`stroke="${color}"`),`${label} marker uses its protocol color`);
  assert.ok(marker.includes(glyph),`${label} draws ${symbol}`);
 }
 for(const [,label] of expected)assert.ok(legendSvg.includes(`class="legend-label">${label}</text>`));
 assert.equal(F.headerHeight(p),162);
});
test('API protocol components use System Design card dimensions, layout and canonical glyphs',()=>{
 const p=F.protocolTemplate(),types=['api-rest','api-graphql','api-grpc','api-websocket','api-webhook','api-sse','api-mqtt'];
 const diagram=F.render(p,{static:true});
 assert.equal(p.edges.length,14);
 for(const [index,id] of types.entries()){
  const n=p.nodes.find(node=>node.id===id.replace('api-','')+'-protocol'),source=path.join(__dirname,'../src/components/custom',id+'.svg');
  assert.ok(n,`${id} node exists`);assert.equal(n.icon,'sd:'+id);assert.deepEqual([n.x,n.y,n.w,n.h],[510,57+index*142,190,62]);
  assert.deepEqual([n.x+n.w/2,n.y+n.h/2],[605,88+index*142]);
  const paletteNode=F.makeNode(id);assert.deepEqual([paletteNode.w,paletteNode.h,paletteNode.icon],[190,62,'sd:'+id]);
  const template=fs.readFileSync(source,'utf8'),component=F.COMPONENTS[id].svg;
  assert.match(template,/viewBox="0 0 100 100" width="190" height="62" preserveAspectRatio="none"/);
  assert.equal(component,F.COMPONENTS.card.svg);assert.equal((template.match(/<rect\b/g)||[]).length,1);
  assert.doesNotMatch(template,/<(?:path|circle|ellipse|polygon|polyline|line)\b/);
  const glyph=F.systemGlyph(id,12,17,28,n.iconColor);
  assert.match(glyph,/transform="translate\(12 17\) scale\(0\.4375\)"/);
  assert.equal((glyph.match(/scale\(0\.4375\)/g)||[]).length,1);
  assert.ok(glyph.includes(F.SYSTEM_DESIGN[id].svg),`${id} uses the canonical catalog geometry`);
  assert.ok(F.nodeLabels(F.systemNode(id,{id:`catalog-${id}`})).includes(glyph),`${id} matches the System Design node renderer`);
  const labels=F.nodeLabels(n),textLines=[...labels.matchAll(/<text\b[^>]*>/g)].map(([tag])=>tag);
  assert.ok(textLines.length>1);for(const line of textLines)assert.match(line,/x="0"[^>]*text-anchor="start"/);
  assert.ok(labels.includes('translate(50 '),`${id} text starts in the System Design text column`);
  const exported=F.componentSVG(n);
  assert.ok(exported.includes(glyph),`${id} component SVG export includes the catalog glyph`);
  assert.ok(exported.includes(labels)&&diagram.includes(labels),`${id} keeps System Design layout in component and diagram exports`);
  assert.match(exported,/width="192" height="64" viewBox="-1 -1 192 64"/);
 }
 const wider=F.makeNode('api-rest',{id:'wide-protocol',w:300,h:74,label:'REST',subtitle:'Wide card'}),wideLabels=F.nodeLabels(wider);
 assert.match(wideLabels,/translate\(50 /);assert.match(wideLabels,/text-anchor="start"/);assert.match(wideLabels,/translate\(12 23\) scale\(0\.4375\)/);
 const source=p.nodes.find(n=>n.id==='rest-source');assert.deepEqual([source.w,source.h],[224,74]);assert.match(F.nodeLabels(source),/text-anchor="start"/);
 const legacy=F.clone(p);for(const n of legacy.nodes.filter(node=>types.includes(node.type)))n.icon='sd:server';
 const legacySvg=F.render(F.normalize(legacy),{static:true});
 for(const id of types)assert.ok(legacySvg.includes(F.systemGlyph(id,12,17,28,'#333333')),`${id} keeps its canonical glyph when legacy icon metadata differs`);
});
test('SVG catalog separates custom from flowchart and compiled templates are safe',()=>{
 assert.equal(F.COMPONENTS.reactive.category,'custom');assert.equal(F.COMPONENTS.table.category,'flowchart');
 for(const c of Object.values(F.COMPONENTS)){assert.ok(!/<script|<image|onload=|href=/.test(c.svg));assert.ok(c.file.endsWith('.svg'));}
});

test('comet has a tapered tail while trail uses spaced markers',()=>{
 const p=simple();p.legends[0].effect='comet';const comet=F.render(p);assert.match(comet,/comet-tail/);
 p.legends[0].effect='trail';const trail=F.render(p);assert.ok(!trail.includes('comet-tail'));assert.ok((trail.match(/animateMotion /g)||[]).length>(comet.match(/animateMotion /g)||[]).length);
});
