// Run exactly one UI acceptance task: node tests/editor-task.js 4
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
const tasks={
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
(async()=>{
 const task=process.argv[2];assert.ok(tasks[task],'Choose an available task number');
 const browser=await chromium.launch({headless:true,executablePath:process.env.AFS_BROWSER_PATH,args:['--no-sandbox','--disable-gpu']});
 try{const page=await browser.newPage({viewport:{width:1600,height:1050}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+path.resolve(__dirname,'../editor.html'));await tasks[task](page);assert.deepEqual(errors,[]);console.log('PASS UI task '+task);}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
