const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),F=require('../src/flow-core.js');
const simple=()=>F.normalize({nodes:[F.systemNode('client',{id:'a',x:30,y:40}),F.makeNode('reactive',{id:'b',x:330,y:40,label:'Idle',reactive:{enterText:'In',exitText:'Out',hold:.5}}),F.systemNode('server',{id:'c',x:650,y:40})],edges:[{id:'ab',source:'a',target:'b',duration:2,traffic:['request']},{id:'bc',source:'b',target:'c',duration:4,traffic:['request']}]});
test('all v3 settings survive JSON and invalid ranges are rejected',()=>{
 const p=F.featureTemplate();p.nodes[0].typography={fontFamily:'Roboto Mono',fontSize:21,subtitleSize:12,bold:true,italic:true,code:true};p.trafficSpeed=2;p.legends[0].count=4;p.legends[0].speed=3;
 assert.deepEqual(F.normalize(JSON.parse(JSON.stringify(p))),p);
 for(const update of [{trafficSpeed:0},{trafficSpeed:Infinity}])assert.throws(()=>F.normalize({...p,...update}));
 p.nodes[0].typography.fontFamily='Arial; fill:red';assert.throws(()=>F.normalize(p));
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
test('API traffic uses small glyphs, soft fades and protocol-specific direction',()=>{
 const p=F.protocolTemplate(),legendMap=Object.fromEntries(p.legends.map(l=>[l.id,l]));
 assert.deepEqual(Object.values(legendMap).map(l=>[l.size,l.count]),Array.from({length:7},()=>[8,1]));
 const demoSizes=F.featureTemplate().legends.filter(l=>['pulse','glow'].includes(l.effect)).map(l=>l.size);
 assert.ok(Object.values(legendMap).every(l=>demoSizes.includes(l.size)));
 assert.deepEqual(['rest','graphql','grpc','websocket','webhook','sse','mqtt'].map(id=>legendMap[id].speed),[1,1,1.05,.95,.8,.95,.95]);
 for(const n of p.nodes.filter(n=>n.type.startsWith('api-'))){assert.equal(n.color,'#ffffff');assert.equal(n.borderColor,'#000000');assert.equal(n.iconColor,'#333333');}
 const rest=p.edges.filter(e=>e.id.startsWith('rest-')),websocket=p.edges.filter(e=>e.id.startsWith('websocket-'));
 assert.ok(rest.every(e=>e.connector==='out'));assert.ok(websocket.every(e=>e.connector==='both'));
 const sse=F.streams(p).filter(s=>s.legend.id==='sse');assert.equal(sse.length,2);
 assert.deepEqual(sse.map(s=>[s.source,s.target]),[['sse-source','sse-protocol'],['sse-protocol','sse-target']]);
 assert.equal(F.streams(p).find(s=>s.legend.id==='webhook').duration,7.5);
 const svg=F.render(p);assert.match(svg,/values="0;0\.86;0\.86;0" keyTimes="0;0\.06;0\.94;1"/);
 assert.match(svg,/data-stream="0-0-0-return"[^]*?begin="0\.55s"[^]*?keyPoints="1;0"/);
 assert.match(svg,/data-stream="6-0-0-return"[^]*?begin="[0-9.]+s"[^]*?keyPoints="1;0"/);
 assert.match(svg,/data-stream="8-0-0"[^]*?values="0;0\.86;0\.86;0;0" keyTimes="0;0\.03;0\.47;0\.5;1" dur="15s"/);
 assert.equal((svg.match(/data-stream="[^"]+-return"/g)||[]).length,4);
 assert.doesNotMatch(svg,/r="8" fill="#[0-9a-f]{6}" fill-opacity/);
});
test('API protocol cards use canonical System Design glyphs at a preserved 28px scale',()=>{
 const p=F.protocolTemplate(),types=['api-rest','api-graphql','api-grpc','api-websocket','api-webhook','api-sse','api-mqtt'];
 const diagram=F.render(p,{static:true});
 for(const [index,id] of types.entries()){
  const n=p.nodes.find(node=>node.id===id.replace('api-','')+'-protocol'),source=path.join(__dirname,'../src/components/custom',id+'.svg');
  assert.ok(n,`${id} node exists`);assert.equal(n.icon,'sd:'+id);assert.deepEqual([n.x,n.y,n.w,n.h],[493,51+index*142,224,74]);
  const template=fs.readFileSync(source,'utf8'),component=F.COMPONENTS[id].svg;
  assert.match(template,/viewBox="0 0 100 100"/);assert.equal((template.match(/<rect\b/g)||[]).length,1);
  assert.doesNotMatch(template,/<(?:path|circle|ellipse|polygon|polyline|line)\b/);
  assert.equal((component.match(/<rect\b/g)||[]).length,1);assert.doesNotMatch(component,/<(?:path|circle|ellipse|polygon|polyline|line)\b/);
  const glyph=F.systemGlyph(id,12,23,28,n.iconColor);
  assert.match(glyph,/transform="translate\(12 23\) scale\(0\.4375\)"/);
  assert.equal((glyph.match(/scale\(0\.4375\)/g)||[]).length,1);
  assert.ok(glyph.includes(F.SYSTEM_DESIGN[id].svg),`${id} uses the canonical catalog geometry`);
  assert.ok(F.nodeLabels(F.systemNode(id,{id:`catalog-${id}`,w:224,h:74})).includes(glyph),`${id} matches the System Design node renderer`);
  const exported=F.componentSVG(n);
  assert.ok(exported.includes(glyph),`${id} component SVG export includes the catalog glyph`);
  assert.ok(diagram.includes(glyph),`${id} diagram export includes the catalog glyph`);
  assert.match(exported,/width="226" height="76" viewBox="-1 -1 226 76"/);
  assert.ok(exported.includes('translate(72 '),`${id} text starts at x=72`);
 }
 const legacy=F.clone(p);for(const n of legacy.nodes.filter(node=>types.includes(node.type)))n.icon='sd:server';
 const legacySvg=F.render(F.normalize(legacy),{static:true});
 for(const id of types)assert.ok(legacySvg.includes(F.systemGlyph(id,12,23,28,'#333333')),`${id} keeps its canonical glyph when legacy icon metadata differs`);
});
test('SVG catalog separates custom from flowchart and compiled templates are safe',()=>{
 assert.equal(F.COMPONENTS.reactive.category,'custom');assert.equal(F.COMPONENTS.table.category,'flowchart');
 for(const c of Object.values(F.COMPONENTS)){assert.ok(!/<script|<image|onload=|href=/.test(c.svg));assert.ok(c.file.endsWith('.svg'));}
});

test('comet has a tapered tail while trail uses spaced markers',()=>{
 const p=simple();p.legends[0].effect='comet';const comet=F.render(p);assert.match(comet,/comet-tail/);
 p.legends[0].effect='trail';const trail=F.render(p);assert.ok(!trail.includes('comet-tail'));assert.ok((trail.match(/animateMotion /g)||[]).length>(comet.match(/animateMotion /g)||[]).length);
});
