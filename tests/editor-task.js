// Run all tasks in order, or select one: node tests/editor-task.js [4..11|--all|--help]
const assert=require('node:assert/strict'),path=require('node:path');
const tasks={
 11:async page=>{
  await page.selectOption('#paletteMode','custom');assert.equal(await page.locator('#palette [data-shape="reactive"]').count(),1);
  await page.evaluate(()=>setProject({nodes:[F.systemNode('client',{id:'a',x:30,y:40}),F.makeNode('reactive',{id:'b',x:330,y:40,label:'Idle',reactive:{enterText:'In',exitText:'Out',hold:.5,transition:0}}),F.systemNode('server',{id:'c',x:650,y:40})],edges:[{id:'ab',source:'a',target:'b',duration:2,traffic:['request']},{id:'bc',source:'b',target:'c',duration:4,traffic:['request']}]}));
  await page.locator('[data-node="b"]').click();await page.evaluate(()=>{paused=true;draw();board.querySelector('svg').setCurrentTime(2.1);});
  await page.waitForFunction(()=>document.querySelector('[data-node="b"]').textContent.includes('In'));
  const color=()=>page.locator('[data-node="b"] .node-shape').first().evaluate(el=>getComputedStyle(el).fill);
  assert.equal(await color(),'rgb(220, 252, 231)');
  await page.getByLabel('Alternar texto',{exact:true}).uncheck();await page.waitForFunction(()=>document.querySelector('[data-node="b"]').textContent.includes('Idle'));assert.equal(await color(),'rgb(220, 252, 231)');
  await page.getByLabel('Alternar cor',{exact:true}).uncheck();await page.waitForFunction(()=>getComputedStyle(document.querySelector('[data-node="b"] .node-shape')).fill==='rgb(255, 255, 255)');
  await page.getByLabel('Alternar texto',{exact:true}).check();await page.waitForFunction(()=>document.querySelector('[data-node="b"]').textContent.includes('In'));assert.equal(await color(),'rgb(255, 255, 255)');
  const transition=page.getByLabel('Transição de cor (s)',{exact:true});await transition.fill('.8');await transition.dispatchEvent('change');await page.getByLabel('Alternar cor',{exact:true}).check();
  assert.equal(await page.locator('[data-node="b"] .node-shape').first().evaluate(el=>el.style.transitionDuration),'0.8s');
 },
 10:async page=>{
  await page.evaluate(()=>setProject({width:1050,height:500,nodes:[F.systemNode('client',{id:'a',x:50,y:60}),F.systemNode('server',{id:'b',x:730,y:60}),F.systemNode('cache',{id:'c',x:390,y:310})],edges:[]}));
  async function drag(from,to){const a=await from.boundingBox(),b=await to.boundingBox();await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:12});await page.mouse.up();}
  const port=(id,side)=>page.locator(`[data-node="${id}"] [data-port="${side}"]`);
  for(const [a,side,b,dest]of [['a','right','b','left'],['a','bottom','c','top'],['c','right','b','bottom'],['a','right','b','left']])await drag(port(a,side),port(b,dest));
  assert.equal(await page.evaluate(()=>project.edges.length),4);
  assert.equal(await page.evaluate(()=>project.edges.filter(e=>e.target==='b').length),3);
  await drag(page.locator('[data-reconnect][data-end="target"]'),port('c','left'));assert.equal(await page.evaluate(()=>project.edges.at(-1).target),'c');
  await page.click('#undo');assert.equal(await page.evaluate(()=>project.edges.at(-1).target),'b');await page.click('#redo');assert.equal(await page.evaluate(()=>project.edges.at(-1).target),'c');
  await page.evaluate(()=>{selected={type:'edge',id:project.edges.at(-1).id};draw();inspect();});
  await drag(page.locator('[data-reconnect][data-end="source"]'),port('b','right'));assert.equal(await page.evaluate(()=>project.edges.at(-1).source),'b');
  await drag(port('a','right'),port('a','bottom'));assert.equal(await page.evaluate(()=>project.edges.length),4);
 },
 9:async page=>{
  const original=await page.evaluate(()=>JSON.stringify(project.nodes));
  for(const mode of ['background','middle','space','button']){
   await page.selectOption('#zoom','fit');const vp=await page.locator('#viewport').boundingBox();
   const start=mode==='background'?{x:vp.x+10,y:vp.y+10}:await page.locator('[data-node="client"]').boundingBox();
   const x=start.x+4,y=start.y+4;const before=await page.evaluate(()=>({...view}));
   if(mode==='space')await page.keyboard.down('Space');if(mode==='button')await page.click('#panMode');
   await page.mouse.move(x,y);await page.mouse.down({button:mode==='middle'?'middle':'left'});await page.mouse.move(x+65,y+40,{steps:8});await page.mouse.up({button:mode==='middle'?'middle':'left'});
   if(mode==='space')await page.keyboard.up('Space');if(mode==='button')await page.click('#panMode');
   assert.ok(Math.abs(await page.evaluate(()=>view.x)-before.x-65)<2,mode);assert.equal(await page.evaluate(()=>JSON.stringify(project.nodes)),original,mode);
  }
 },
 8:async page=>{
  const vp=await page.locator('#viewport').boundingBox(),cx=vp.width*.43,cy=vp.height*.41;
  const before=await page.evaluate(()=>({...view}));await page.mouse.move(vp.x+cx,vp.y+cy);await page.keyboard.down('Control');await page.mouse.wheel(0,-260);await page.keyboard.up('Control');await page.waitForFunction(()=>zoomTarget===null);
  const after=await page.evaluate(()=>({...view}));assert.ok(after.scale>before.scale);
  assert.ok(Math.abs((cx-before.x)/before.scale-(cx-after.x)/after.scale)<2);assert.ok(Math.abs((cy-before.y)/before.scale-(cy-after.y)/after.scale)<2);
  await page.mouse.wheel(0,100);assert.equal(await page.evaluate(()=>view.scale),after.scale);
  await page.keyboard.down('Control');await page.mouse.wheel(0,50000);await page.keyboard.up('Control');await page.waitForFunction(()=>zoomTarget===null);assert.equal(await page.evaluate(()=>view.scale),.05);
 },
 7:async page=>{
  await page.evaluate(()=>{selected={type:'edge',id:project.edges[0].id};draw();inspect();});
  for(const id of ['out','in','curve','both','line','dashed','dotted','double']){await page.getByLabel('Tipo do conector',{exact:true}).selectOption(id);assert.equal(await page.evaluate(()=>project.edges[0].connector),id);}
  await page.reload();assert.equal(await page.evaluate(()=>project.edges[0].connector),'double');
 },
 6:async page=>{
  await page.locator('[data-node="sql"]').click();
  for(const model of ['nosql','schema','sql']){await page.getByLabel('Modelo',{exact:true}).selectOption(model);assert.equal(await page.evaluate(()=>project.nodes.find(n=>n.id==='sql').table.model),model);}
  for(const [label,value]of [['Colunas','4'],['Linhas de dados','5'],['Linha 5, coluna 4','nullable']]){const el=page.getByLabel(label,{exact:true});await el.fill(value);await el.dispatchEvent('change');}
  assert.deepEqual(await page.evaluate(()=>{const t=project.nodes.find(n=>n.id==='sql').table;return [t.columns.length,t.rows.length,t.rows[4][3]];}),[4,5,'nullable']);
  const rows=page.getByLabel('Linhas de dados',{exact:true});await rows.fill('0');await rows.dispatchEvent('change');assert.equal(await page.evaluate(()=>project.nodes.find(n=>n.id==='sql').table.rows.length),0);
  await page.click('#undo');assert.equal(await page.evaluate(()=>project.nodes.find(n=>n.id==='sql').table.rows[4][3]),'nullable');
 },
 5:async page=>{
  const centered=()=>page.evaluate(()=>{const v=viewport.getBoundingClientRect(),b=board.getBoundingClientRect();return Math.abs(v.x+v.width/2-b.x-b.width/2)<2&&Math.abs(v.y+v.height/2-b.y-b.height/2)<2;});
  assert.ok(await centered());await page.setViewportSize({width:1280,height:800});await page.waitForTimeout(100);assert.ok(await centered());
  await page.selectOption('#zoom','1');await page.click('#centerCanvas');assert.ok(await centered());
  await page.selectOption('#zoom','fit');assert.ok(await centered());
 },
 4:async page=>{
  await page.locator('#legendEditor summary').first().click();const legend=page.locator('#legendEditor details').first();
  const speed=legend.getByLabel('Velocidade desta legenda (×)',{exact:true});await speed.fill('2');await speed.dispatchEvent('change');
  await page.locator('#trafficSpeed').fill('3');await page.locator('#trafficSpeed').dispatchEvent('change');
  const duration=await page.locator('[data-stream]').first().locator('animateMotion').getAttribute('dur');assert.equal(duration,(4/6)+'s');
  await page.click('#toggleTraffic');assert.ok(await page.evaluate(()=>board.querySelector('svg').animationsPaused()));
  await page.click('#restartTraffic');assert.ok(await page.evaluate(()=>currentTime()<.2));
 },
};
const usage=`Uso: node tests/editor-task.js [4|5|6|7|8|9|10|11|--all|--help]
Sem argumento ou com --all: executa todas as tarefas em sequência.
Com um número: executa somente a tarefa escolhida.
`;
async function main(args){
 if(args.length===1&&['--help','-h'].includes(args[0])){console.log(usage);return;}
 if(args.length>1||(args.length===1&&args[0]!=='--all'&&!Object.hasOwn(tasks,args[0]))){console.error('Tarefa inválida.\n'+usage);process.exitCode=2;return;}
 const selected=args.length===0||args[0]==='--all'?Object.keys(tasks).sort((a,b)=>Number(a)-Number(b)):[args[0]];
 const {chromium}=require('playwright');
 const browser=await chromium.launch({headless:true,executablePath:process.env.AFS_BROWSER_PATH||undefined,args:['--no-sandbox','--disable-gpu']});
 try{
  for(const task of selected){
   const context=await browser.newContext({viewport:{width:1600,height:1050}});
   try{
    const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(require('node:url').pathToFileURL(path.resolve(__dirname,'../editor.html')).href);
    await tasks[task](page);assert.deepEqual(errors,[]);console.log('PASS UI task '+task);
   }finally{await context.close();}
  }
 }finally{await browser.close();}
}
main(process.argv.slice(2)).catch(e=>{console.error(e);process.exitCode=1;});
