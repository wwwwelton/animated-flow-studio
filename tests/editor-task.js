// Run exactly one UI acceptance task: node tests/editor-task.js 4
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
const tasks={
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
