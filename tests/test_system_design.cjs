const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const F=require('../src/flow-core.js');
test('legacy default system nodes become compact once, preserving custom nodes and links',()=>{
 const p=F.systemTemplate();delete p.systemLayout;
 Object.assign(p.nodes[0],{w:180,h:140,borderColor:'#cbd5e1'});
 Object.assign(p.nodes[1],{w:260,h:90,borderColor:'#123456'});
 const y=p.nodes[0].y,edges=JSON.stringify(p.edges),updated=F.normalize(p);
 assert.equal(updated.nodes[0].w,190);assert.equal(updated.nodes[0].h,62);
 assert.equal(updated.nodes[0].y,y+39);assert.equal(updated.nodes[0].borderColor,'#000000');
 assert.equal(updated.nodes[1].w,260);assert.equal(updated.nodes[1].h,90);
 assert.equal(updated.nodes[1].borderColor,'#123456');assert.equal(JSON.stringify(updated.edges),edges);
 assert.deepEqual(F.normalize(updated),updated);
});
test('81 unique symbols cover every numbered PDF term including deduplicated availability',()=>{
 const entries=Object.values(F.SYSTEM_DESIGN);assert.equal(entries.length,81);
 assert.deepEqual(entries.flatMap(c=>c.sourceTerms).sort((a,b)=>a-b),Array.from({length:75},(_,i)=>i+1));
 assert.equal(new Set(entries.map(c=>c.svg)).size,81);
});
test('new nodes, colors, parent and animated links survive JSON roundtrip',()=>{
 const p=F.systemTemplate();Object.assign(p.nodes[0],{iconColor:'#ef1234',color:'#eafafa',textColor:'#123456'});
 const loaded=F.normalize(JSON.parse(JSON.stringify(p)));assert.deepEqual(loaded,p);
 const svg=F.render(loaded);assert.match(svg,/color:#ef1234/);assert.match(svg,/fill:#123456/);assert.match(svg,/animateMotion/);
 assert.ok(!/NaN|undefined|<image|<script/.test(svg));
});
test('unknown and inherited symbol identifiers are rejected',()=>{
 for(const icon of ['sd:missing','sd:__proto__','sd:constructor'])assert.throws(()=>F.normalize({nodes:[{...F.systemNode('server'),icon}],edges:[]}));
});
test('component SVG is standalone, origin aligned, escaped, and includes custom colors',()=>{
 const n=F.systemNode('server',{x:999,y:222,label:'<img onerror="x">',iconColor:'#abcdef'});
 const svg=F.componentSVG(n);assert.match(svg,/xmlns="http:\/\/www.w3.org\/2000\/svg"/);
 assert.match(svg,/transform="translate\(0 0\)"/);assert.ok(!svg.includes('translate(999'));
 assert.ok(!svg.includes('<img'));assert.match(svg,/color:#abcdef/);
});
test('gallery keeps all symbols within canvas and standalone files contain no raster',()=>{
 const p=F.systemGallery();assert.equal(p.nodes.length,81);const b=F.contentBounds(p.nodes);assert.ok(b.right<=p.width&&b.bottom<=p.height);
 for(const c of Object.values(F.SYSTEM_DESIGN)){
  const svg=fs.readFileSync(__dirname+'/../assets/system-design/'+c.id+'.svg','utf8');
  assert.ok(!/<image|data:|<script/.test(svg));assert.match(svg,/viewBox="0 0 64 64"/);
 }
});
test('classic card nodes can use the new symbols as inline icons',()=>{
 const n={...F.systemNode('cache'),type:'card',w:230,h:70};const svg=F.render(F.normalize({nodes:[n],edges:[]}));
 assert.match(svg,/scale\(0.4375\)/);assert.match(svg,/Cache/);
});
