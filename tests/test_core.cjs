const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const F=require('../src/flow-core.js');
test('element colors roundtrip and old projects receive neutral defaults',()=>{
 const p=F.studioTemplate(),n=p.nodes.find(n=>n.type==='card'),e=p.edges[0];
 assert.equal(n.borderColor,'#000000');assert.equal(n.iconColor,'#333333');assert.equal(e.strokeColor,'#000000');
 Object.assign(n,{color:'#fff1cc',borderColor:'#912345',textColor:'#164567',subtitleColor:'#765432',iconColor:'#123abc'});
 Object.assign(e,{strokeColor:'#117744',textColor:'#773399'});
 assert.deepEqual(F.normalize(JSON.parse(JSON.stringify(p))),p);
});
test('all shapes render safe border and text colors including internal details',()=>{
 const p=F.gallery();
 for(const n of p.nodes)Object.assign(n,{color:'#fff1cc',borderColor:'#912345',textColor:'#164567',subtitle:'Detail',subtitleColor:'#765432',icon:'server',iconColor:'#123abc'});
 const svg=F.render(p,{static:true});
 for(const n of p.nodes)assert.match(F.componentSVG(n),/fill:#164567/);
 assert.match(svg,/stroke="#912345"[^>]*class="node-detail"/);
 assert.match(svg,/fill="#fff1cc"/);assert.match(svg,/fill:#765432/);assert.match(svg,/stroke="#123abc"/);
 assert.match(F.shape(p.nodes.find(n=>n.type==='text')),/pointer-events="all"/);
 assert.ok(!/NaN|undefined/.test(svg));
});
test('colored edge markers are independent and survive static and animated export',()=>{
 const p=F.studioTemplate();
 Object.assign(p.edges[0],{strokeColor:'#ab1234',textColor:'#1234ab',label:'Color label'});
 p.edges[1].strokeColor='#12ab34';
 for(const staticMode of [false,true]){
  const svg=F.render(p,{static:staticMode});
  assert.match(svg,/<marker id="af-edge-0-arrow"[^]*?stroke="#ab1234"/);
  assert.match(svg,/<marker id="af-edge-1-arrow"[^]*?stroke="#12ab34"/);
  assert.match(svg,/class="rail" style="stroke:#ab1234;stroke-width:1" marker-end="url\(#af-edge-0-arrow\)"/);
  assert.match(svg,/marker-start="url\(#af-edge-0-arrow\)"/);
  assert.match(svg,/class="edge-label" style="[^"]*fill:#1234ab"/);
  assert.match(svg,/fill="#70a0ff"/);
 }
});
test('invalid style colors fall back without injecting markup',()=>{
 const p=F.studioTemplate(),bad='"><script>bad</script>';
 Object.assign(p.nodes[0],{color:bad,borderColor:bad,textColor:bad,subtitleColor:bad,iconColor:bad});
 Object.assign(p.edges[0],{strokeColor:bad,textColor:bad,label:'Edge'});
 assert.ok(!F.render(p).includes('<script>'));
 const clean=F.normalize(p);
 assert.equal(clean.nodes[0].color,'#ffffff');assert.equal(clean.nodes[0].textColor,'#000000');
 assert.equal(clean.nodes[0].iconColor,'#333333');assert.equal(clean.edges[0].strokeColor,'#000000');
});
test('color picker and hex entry commit, validate and checkpoint changes',()=>{
 const vm=require('node:vm'),elements=[];
 const document={createElement:()=>{const el={value:'',listeners:{},setAttribute(){},append(){},addEventListener(event,fn){this.listeners[event]=fn;}};elements.push(el);return el;}};
 let saves=0,checkpoints=0,message='';
 const context={document,uid:()=> 'color-id',checkpoint:()=>checkpoints++,save:()=>saves++,status:s=>message=s};
 vm.createContext(context);
 const source=fs.readFileSync(path.join(__dirname,'../src/editor.js'),'utf8');
 vm.runInContext(source.slice(source.indexOf('function colorField('),source.indexOf('function elementColors(')),context);
 const item={};context.colorField({append(){}},'Texto',item,'textColor','#000000');
 const picker=elements[2],hex=elements[3];
 picker.value='#ff0000';picker.listeners.change();assert.equal(item.textColor,'#ff0000');assert.equal(hex.value,'#ff0000');
 hex.value='00ABCD';hex.listeners.change();assert.equal(item.textColor,'#00abcd');assert.equal(picker.value,'#00abcd');
 hex.value='invalid';hex.listeners.change();assert.equal(item.textColor,'#00abcd');assert.match(message,/inválida/);
 assert.equal(saves,2);assert.equal(checkpoints,2);
});
test('Animated Flow Studio uses square request, circle response and diamond CDC',()=>{const p=F.studioTemplate();assert.deepEqual(p.legends.map(l=>[l.color,l.shape]),[['#70a0ff','square'],['#9ae8c5','circle'],['#bb8ae8','diamond']]);const svg=F.render(p);assert.match(svg,/keyPoints="1;0"/);assert.match(svg,/animateMotion/);assert.match(svg,/Solicitação/);});
test('all 19 shapes render without invalid geometry',()=>{const p=F.gallery(),svg=F.render(p);assert.equal(p.nodes.length,19);assert.ok(!/NaN|undefined/.test(svg));for(const n of p.nodes)assert.match(svg,new RegExp('data-node="'+n.id+'"'));});
test('reject dangling edges, duplicate IDs and parent cycles',()=>{let p=F.studioTemplate();p.edges[0].target='missing';assert.throws(()=>F.normalize(p));p=F.studioTemplate();p.nodes[1].id=p.nodes[0].id;assert.throws(()=>F.normalize(p));p=F.studioTemplate();p.nodes[0].parent=p.nodes[1].id;p.nodes[1].parent=p.nodes[0].id;assert.throws(()=>F.normalize(p));});
test('old version project migrates without losing label and geometry',()=>{const p=F.normalize({title:'v1',nodes:[{id:'a',label:'A',x:20,y:20,color:'#ffffff'},{id:'b',label:'B',x:300,y:20,color:'#ffffff'}],edges:[{id:'e',source:'a',target:'b',duration:2.5}]});assert.equal(p.nodes[0].w,190);assert.equal(p.nodes[0].label,'A');assert.deepEqual(p.edges[0].traffic,['request']);});
test('static export retains legends and removes motion and editor UI',()=>{const svg=F.render(F.studioTemplate(),{static:true});assert.match(svg,/Solicitação/);assert.ok(!/<animate|class="hit"|data-play=/.test(svg));});
test('labels cannot inject SVG or HTML',()=>{const p=F.studioTemplate();p.title='<script>alert(1)</script>';p.nodes[0].label='"/><image href="https://example.com">';const svg=F.render(p);assert.ok(!svg.includes('<script>'));assert.ok(!svg.includes('<image'));assert.match(svg,/&lt;script&gt;/);});
test('orthogonal path reaches node ports with rounded corners',()=>{const p=F.studioTemplate(),e=p.edges[0],r=F.route(p.nodes.find(n=>n.id===e.source),p.nodes.find(n=>n.id===e.target),e);assert.ok(r.d.startsWith('M220 126'));assert.ok(r.d.endsWith('L333 244'));assert.match(r.d,/Q/);});

function canvasFixture(autoGrow=true){return F.normalize({title:'Canvas',width:400,height:300,autoGrow,growthMargin:48,nodes:[{id:'a',label:'A',x:80,y:60,w:100,h:60},{id:'b',label:'B',x:240,y:140,w:100,h:60}],edges:[{id:'e',source:'a',target:'b',traffic:['request','response']}]});}
test('moving past right and bottom grows the background and exported viewBox',()=>{const p=canvasFixture();const o=F.clone([p.nodes[1]]);F.transformNodes(p,o,180,160);assert.equal(p.width,568);assert.equal(p.height,408);const svg=F.render(p,{static:true});assert.ok(svg.includes(`viewBox="0 0 568 ${408+F.headerHeight(p)}"`));assert.equal(p.nodes[1].x,420);});
test('left and top overflow rebase every node and preserve group relationships',()=>{const p=canvasFixture();p.nodes[1].parent='a';const old=F.clone(p.nodes),edgeBefore=F.clone(p.edges[0]);const result=F.transformNodes(p,old,-120,-100);assert.equal(p.nodes[0].x,48);assert.equal(p.nodes[0].y,48);assert.equal(p.width,488);assert.equal(p.height,388);assert.equal(result.shiftX,88);assert.equal(p.nodes[1].x-p.nodes[0].x,old[1].x-old[0].x);assert.equal(p.nodes[1].y-p.nodes[0].y,old[1].y-old[0].y);assert.deepEqual(p.edges[0],edgeBefore);assert.equal(p.nodes[1].parent,'a');});
test('automatic resizing never contracts after moving a node back',()=>{const p=canvasFixture();F.transformNodes(p,F.clone([p.nodes[1]]),180,160);const dimensions=[p.width,p.height];F.transformNodes(p,F.clone([p.nodes[1]]),-180,-160);assert.deepEqual([p.width,p.height],dimensions);});
test('resizing a component grows the page without clipping',()=>{const p=canvasFixture();F.transformNodes(p,F.clone([p.nodes[1]]),250,210,{kind:'resize',id:'b'});assert.equal(p.nodes[1].w,350);assert.equal(p.width,638);assert.equal(p.height,458);});
test('disabled automatic growth constrains movement and resizing',()=>{const p=canvasFixture(false);F.transformNodes(p,F.clone([p.nodes[1]]),300,300);assert.deepEqual([p.width,p.height],[400,300]);assert.equal(p.nodes[1].x+p.nodes[1].w,400);assert.equal(p.nodes[1].y+p.nodes[1].h,300);F.transformNodes(p,F.clone([p.nodes[1]]),300,300,{kind:'resize',id:'b'});assert.equal(p.nodes[1].w,100);assert.equal(p.nodes[1].h,60);});
test('manual sizes protect content and fit command removes trailing whitespace',()=>{const p=canvasFixture();F.resizeCanvas(p,900,800);assert.deepEqual([p.width,p.height],[900,800]);F.resizeCanvas(p,900,800,{fit:true});assert.deepEqual([p.width,p.height],[388,300]);assert.equal(F.resizeCanvas(p,300,300).constrained,true);assert.equal(p.width,340);});
test('growth settings and expanded page roundtrip through JSON',()=>{const p=canvasFixture();p.growthMargin=80;F.transformNodes(p,F.clone([p.nodes[1]]),180,160);const copy=F.normalize(JSON.parse(JSON.stringify(p)));assert.deepEqual(copy,p);copy.autoGrow=false;assert.equal(F.normalize(copy).autoGrow,false);assert.throws(()=>F.normalize({...p,growthMargin:-1}));});
test('canvas size limit constrains gestures without throwing or hiding nodes',()=>{const p=canvasFixture();F.transformNodes(p,F.clone([p.nodes[1]]),10000,10000);assert.deepEqual([p.width,p.height],[5000,5000]);for(const n of p.nodes){assert.ok(n.x>=0&&n.y>=0&&n.x+n.w<=5000&&n.y+n.h<=5000);}F.transformNodes(p,F.clone([p.nodes[0]]),-10000,-10000);assert.equal(p.nodes[0].x,0);assert.equal(p.nodes[0].y,0);});
