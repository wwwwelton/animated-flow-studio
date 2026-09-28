/* Optional real-browser smoke: npm install --no-save playwright; node tests/editor-browser.js
 * AFS_BROWSER_PATH may select an already installed Chromium executable.
 */
const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const root=path.resolve(__dirname,'..'),out=fs.mkdtempSync(path.join(os.tmpdir(),'afs-browser-test-'));
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.AFS_BROWSER_PATH?{executablePath:process.env.AFS_BROWSER_PATH}:{}),args:['--no-sandbox','--disable-gpu']});
 try{
 const page=await browser.newPage({viewport:{width:1600,height:1050}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(require('node:url').pathToFileURL(path.join(root,'editor.html')).href);
 assert.equal(await page.locator('[data-node]').count(),5);
 const centered=await page.evaluate(()=>{const v=viewport.getBoundingClientRect(),b=board.getBoundingClientRect();return Math.abs(v.x+v.width/2-b.x-b.width/2)<2&&Math.abs(v.y+v.height/2-b.y-b.height/2)<2;});assert.ok(centered);
 console.log('PASS load and centered canvas');
 assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).fontSize),'16px');
 // Custom library is distinct and inserts a reactive block.
 await page.selectOption('#paletteMode','custom');assert.equal(await page.locator('#palette [data-shape="reactive"]').count(),1);
 await page.click('#palette [data-shape="reactive"]');assert.equal(await page.evaluate(()=>project.nodes.at(-1).type),'reactive');
 await page.click('#undo');assert.equal(await page.locator('[data-node]').count(),5);
 // Native table editing, row/column count and content.
 await page.locator('[data-node="sql"]').click();
 await page.getByLabel('Modelo',{exact:true}).selectOption('schema');
 await page.getByLabel('Colunas',{exact:true}).fill('4');await page.getByLabel('Colunas',{exact:true}).dispatchEvent('change');
 await page.getByLabel('Linhas de dados',{exact:true}).fill('5');await page.getByLabel('Linhas de dados',{exact:true}).dispatchEvent('change');
 await page.getByLabel('Linha 5, coluna 4',{exact:true}).fill('nullable');await page.getByLabel('Linha 5, coluna 4',{exact:true}).dispatchEvent('change');
 assert.deepEqual(await page.evaluate(()=>{const t=project.nodes.find(n=>n.id==='sql').table;return [t.model,t.columns.length,t.rows.length,t.rows[4][3]];}),['schema',4,5,'nullable']);
 console.log('PASS custom library and editable table presets/cells');
 // Typography on regular, system, table and custom uses the same schema.
 await page.locator('[data-node="client"]').click();
 await page.getByLabel('Fonte (Google Fonts ou local)',{exact:true}).fill('Georgia');await page.getByLabel('Fonte (Google Fonts ou local)',{exact:true}).dispatchEvent('change');
 await page.getByLabel('Tamanho da fonte (px)',{exact:true}).fill('21');await page.getByLabel('Tamanho da fonte (px)',{exact:true}).dispatchEvent('change');
 await page.getByLabel('Bold',{exact:true}).check();await page.getByLabel('Italic',{exact:true}).check();await page.getByLabel('Code',{exact:true}).check();
 assert.deepEqual(await page.evaluate(()=>project.nodes[0].typography),{fontFamily:'Georgia',fontSize:21,subtitleSize:10,bold:true,italic:true,code:true});
 const textStyle=await page.locator('[data-node="client"] .node-title').first().getAttribute('style');assert.ok(textStyle.includes('font-weight:700')&&textStyle.includes('font-style:italic')&&textStyle.includes('Courier New'));
 // Controlled network fixture tests Google Fonts loading, separately from live connectivity.
 const fontRequests=await require('./font-fixture')(page);
 await page.getByLabel('Code',{exact:true}).uncheck();await page.getByLabel('Fonte (Google Fonts ou local)',{exact:true}).fill('Inter');await page.getByLabel('Fonte (Google Fonts ou local)',{exact:true}).dispatchEvent('change');await page.waitForFunction(()=>document.fonts.check('14px Inter'));assert.ok(fontRequests()>0);
 console.log('PASS font size, bold, italic, code and Google Fonts request (fixture)');
 // Native legend controls, actual animation speed and packet count.
 await page.locator('#legendEditor summary').first().click();const legend=page.locator('#legendEditor details').first();
 await legend.getByLabel('Efeito visual',{exact:true}).selectOption('trail');await legend.getByLabel('Símbolo',{exact:true}).selectOption('arrow');
 await legend.getByLabel('Velocidade desta legenda (×)',{exact:true}).fill('2');await legend.getByLabel('Velocidade desta legenda (×)',{exact:true}).dispatchEvent('change');
 await legend.getByLabel('Marcadores simultâneos',{exact:true}).fill('3');await legend.getByLabel('Marcadores simultâneos',{exact:true}).dispatchEvent('change');
 await page.locator('#trafficSpeed').fill('3');await page.locator('#trafficSpeed').dispatchEvent('change');
 assert.equal(await page.evaluate(()=>F.streams(project)[0].duration),4/6);assert.equal(await page.evaluate(()=>F.streams(project).filter(s=>s.index===0&&s.legend.id==='request').length),3);
 console.log('PASS traffic effects, symbols, speed and count');
 await page.click('#addLegend');const apiLegend=page.locator('#legendEditor details').last();await apiLegend.locator('summary').click();assert.equal(await apiLegend.getByLabel('Tamanho do marcador (rem)',{exact:true}).inputValue(),'1');const symbol=apiLegend.getByLabel('Símbolo',{exact:true});
 const apiSymbols=await symbol.locator('option').evaluateAll(options=>options.slice(-7).map(option=>option.value));
 assert.deepEqual(apiSymbols,['rest','graphql','grpc','websocket','webhook','sse','mqtt']);
 await symbol.selectOption('graphql');const apiLegendId=await page.evaluate(()=>project.legends.at(-1).id);
 assert.equal(await apiLegend.getByLabel('Tamanho do marcador (rem)',{exact:true}).isEnabled(),true);
 assert.ok((await page.locator(`#board svg .legend-marker[data-legend="${apiLegendId}"]`).innerHTML()).includes('M8 0L16 8 8 16 0 8Z'));
 assert.equal(await page.evaluate(()=>F.normalize(JSON.parse(JSON.stringify(project))).legends.at(-1).shape),'graphql');
 console.log('PASS API protocol glyph symbols render in the top legend and survive roundtrip');

 const measured=await page.evaluate(()=>{
  const result={};
  for(const size of [10,25]){
   const sample=F.protocolTemplate();for(const item of sample.legends)item.size=size;
   sample.legends.push({...sample.legends[0],id:'reference-size',label:'Resposta',shape:'circle',effect:'packet'});
   const holder=document.createElement('div');holder.style.cssText='position:absolute;left:-5000px;top:0';holder.innerHTML=F.render(sample,{static:true});document.body.append(holder);
   const reference=holder.querySelector('[data-legend="reference-size"] circle').getBoundingClientRect().width;
   result[size]=Object.fromEntries(sample.legends.slice(0,7).map(item=>{
    const shape=holder.querySelector(`[data-legend="${item.id}"] .flow-token`).firstElementChild,box=shape.getBoundingClientRect();
    return [item.id,Math.max(box.width,box.height)/reference];
   }));holder.remove();
  }
  return result;
 });
 for(const sizes of Object.values(measured))for(const ratio of Object.values(sizes))assert.ok(ratio>=.85&&ratio<=1.1,`proportional marker size: ${ratio}`);

 const savedProject=await page.evaluate(()=>F.clone(project));
 await page.evaluate(()=>{setProject(F.protocolTemplate());paused=true;draw();const svg=board.querySelector('svg');svg.pauseAnimations();svg.setCurrentTime(1);});
 await page.waitForFunction(()=>document.querySelector('[data-stream="0-0-0"]')?.getAttribute('transform'));
 const tokenState=await page.evaluate(()=>{
  const svg=board.querySelector('svg'),token=svg.querySelector('[data-stream="0-0-0"]'),path=svg.querySelector('#af-edge-0');
  const point=path.getPointAtLength(12+(path.getTotalLength()-28)*(1/5));
  return {transform:token.getAttribute('transform'),point:{x:point.x,y:point.y},size:[...svg.querySelectorAll('.protocol-packet .flow-token')].every(el=>el.getAttribute('width')==='16'&&el.getAttribute('height')==='16'&&el.getAttribute('viewBox')==='0 0 16 16'),hit:getComputedStyle(token).pointerEvents};
 });
 const tokenX=Number(tokenState.transform.match(/translate\(([^ ]+)/)[1]);
 assert.ok(Math.abs(tokenX-tokenState.point.x)<1);assert.equal(tokenState.size,true);assert.equal(tokenState.hit,'none');
 const apiTiming=await page.evaluate(()=>{
  const svg=board.querySelector('svg'),packet=key=>svg.querySelector(`[data-stream="${key}"]`);
  const timing=key=>{const token=packet(key);return {start:Number(token.dataset.start),duration:Number(token.dataset.duration),cycle:Number(token.dataset.cycle)};};
  return {webhookIn:timing('8-0-0'),webhookOut:timing('9-0-0'),restIn:timing('0-0-0'),restOut:timing('1-0-0'),restResponseOut:timing('1-0-0-return'),restResponseIn:timing('0-0-0-return'),websocketIn:timing('6-0-0'),websocketReverse:timing('6-0-0-return')};
 });
 assert.ok(apiTiming.webhookOut.start>=apiTiming.webhookIn.start+apiTiming.webhookIn.duration);
 assert.ok(apiTiming.restOut.start>=apiTiming.restIn.start+apiTiming.restIn.duration);
 assert.ok(apiTiming.restResponseOut.start>=apiTiming.restOut.start+apiTiming.restOut.duration);
 assert.ok(apiTiming.restResponseIn.start>=apiTiming.restResponseOut.start+apiTiming.restResponseOut.duration);
 await page.evaluate(time=>board.querySelector('svg').setCurrentTime(time),apiTiming.webhookOut.start-.1);
 await page.waitForFunction(()=>document.querySelector('[data-stream="9-0-0"]')?.getAttribute('opacity')==='0');
 await page.evaluate(time=>board.querySelector('svg').setCurrentTime(time),apiTiming.webhookOut.start+.1);
 await page.waitForFunction(()=>document.querySelector('[data-stream="9-0-0"]')?.getAttribute('opacity')==='0.86');
 await page.evaluate(time=>board.querySelector('svg').setCurrentTime(time),apiTiming.webhookIn.start+apiTiming.webhookIn.cycle+.1);
 await page.waitForFunction(()=>document.querySelector('[data-stream="8-0-0"]')?.getAttribute('opacity')==='0.86');
 await page.evaluate(()=>{const svg=board.querySelector('svg');svg.setCurrentTime(30);FlowTraffic.trigger(svg);});
 await page.waitForFunction(()=>document.querySelector('[data-stream="8-0-0"]')?.getAttribute('opacity')==='0.86'&&document.querySelector('[data-stream="9-0-0"]')?.getAttribute('opacity')==='0');
 await page.evaluate(time=>board.querySelector('svg').setCurrentTime(time),30+apiTiming.webhookIn.duration+.45);
 await page.waitForFunction(()=>document.querySelector('[data-stream="9-0-0"]')?.getAttribute('opacity')==='0.86');
 await page.evaluate(time=>board.querySelector('svg').setCurrentTime(time),apiTiming.websocketReverse.start+.1);
 await page.waitForFunction(()=>document.querySelector('[data-stream="6-0-0"]')?.getAttribute('opacity')==='0.86'&&document.querySelector('[data-stream="6-0-0-return"]')?.getAttribute('opacity')==='0.86');
 await page.evaluate(()=>{project.nodes.find(n=>n.id==='rest-protocol').y+=40;draw();board.querySelector('svg').setCurrentTime(1);});
 await page.waitForFunction(previous=>document.querySelector('[data-stream="0-0-0"]')?.getAttribute('transform')!==previous,tokenState.transform);
 assert.notEqual(await page.locator('[data-stream="0-0-0"]').getAttribute('transform'),tokenState.transform);
 await page.evaluate(()=>{project.edges[0].route='curve';draw();board.querySelector('svg').setCurrentTime(1);});
 await page.waitForFunction(()=>document.querySelector('#af-edge-0')?.getAttribute('d')?.includes('C'));
 assert.match(await page.locator('#af-edge-0').getAttribute('d'),/C/);
 assert.equal(await page.locator('[data-stream="6-0-0"]').getAttribute('data-path'),await page.locator('[data-stream="6-0-0-return"]').getAttribute('data-path'));
 assert.equal(await page.locator('[data-stream="6-0-0-return"]').getAttribute('data-reverse'),'true');
 const sse=await page.locator('[data-stream="10-0-0"]');
 await page.evaluate(()=>{const token=document.querySelector('[data-stream="10-0-0"]');board.querySelector('svg').setCurrentTime(Number(token.dataset.start)+.5);});
 await page.waitForFunction(()=>document.querySelector('[data-stream="10-0-0"]')?.getAttribute('transform')?.includes('rotate('));
 assert.match(await sse.getAttribute('transform'),/rotate\(/);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('[data-stream="0-0-0"]')).display!=='none');
 await page.waitForFunction(()=>document.querySelector('[data-stream="0-0-0"]')?.getAttribute('opacity')==='.5');
 assert.equal(await page.locator('[data-stream="0-0-0"]').getAttribute('opacity'),'.5');
 await page.emulateMedia({reducedMotion:'no-preference'});
 for(const [index,id]of ['rest','graphql','grpc','websocket','webhook','sse','mqtt'].entries()){
  const row=page.locator('#legendEditor details').nth(index);await row.locator('summary').click();
  const size=8+index*4,input=row.getByLabel('Tamanho do marcador (rem)',{exact:true});
  assert.equal(await input.isEnabled(),true);await input.fill(String(size/16));await input.dispatchEvent('change');
  assert.equal(await page.evaluate(id=>project.legends.find(legend=>legend.id===id).size,id),size);
  assert.equal(await page.locator(`#board [data-legend="${id}"] .flow-token`).getAttribute('width'),String(size));
  assert.equal(await page.locator(`#board [data-edge-id="${id}-request"] .flow-token`).first().getAttribute('width'),String(size));
 }
 const protocolDownload=page.waitForEvent('download');await page.click('#svgExport');
 const protocolFile=path.join(out,'protocol-tokens.svg');await (await protocolDownload).saveAs(protocolFile);
 const protocolPage=await browser.newPage();await protocolPage.goto(require('node:url').pathToFileURL(protocolFile).href);
 await protocolPage.waitForFunction(()=>document.querySelector('[data-stream="0-0-0"]')?.getAttribute('transform'));
 assert.equal(await protocolPage.locator('parsererror').count(),0);
 assert.equal(await protocolPage.locator('[data-edge-id="mqtt-request"] .flow-token').first().getAttribute('width'),'32');
 await protocolPage.close();
 const jsonDownload=page.waitForEvent('download');await page.click('#jsonExport');
 const protocolJson=path.join(out,'protocol-tokens.json');await (await jsonDownload).saveAs(protocolJson);
 assert.deepEqual(JSON.parse(fs.readFileSync(protocolJson,'utf8')).legends.map(legend=>legend.size),[8,12,16,20,24,28,32]);
 const htmlDownload=page.waitForEvent('download');await page.click('#htmlExport');
 const protocolHtml=path.join(out,'protocol-tokens.html');await (await htmlDownload).saveAs(protocolHtml);
 const htmlPage=await browser.newPage();await htmlPage.goto(require('node:url').pathToFileURL(protocolHtml).href);
 assert.equal(await htmlPage.locator('[data-edge-id="mqtt-request"] .flow-token').first().getAttribute('width'),'32');
 await htmlPage.close();
 await page.evaluate(saved=>setProject(saved),savedProject);
 console.log('PASS protocol tokens follow moved and edited paths, both directions, SSE rotation and reduced motion');

 // Real mouse zoom keeps the point under the cursor; pan does not move nodes.
 await page.locator('#viewport').scrollIntoViewIfNeeded();const vp=await page.locator('#viewport').boundingBox();
 const before=await page.evaluate(()=>({...view}));await page.mouse.move(vp.x+vp.width*.45,vp.y+vp.height*.4);await page.keyboard.down('Control');await page.mouse.wheel(0,-260);await page.keyboard.up('Control');await page.waitForFunction(()=>zoomTarget===null);
 const after=await page.evaluate(()=>({...view}));assert.ok(after.scale>before.scale);
 const nodeBefore=await page.evaluate(()=>project.nodes[0].x);await page.mouse.move(vp.x+10,vp.y+10);await page.mouse.down();await page.mouse.move(vp.x+95,vp.y+65,{steps:8});await page.mouse.up();assert.equal(await page.evaluate(()=>project.nodes[0].x),nodeBefore);assert.ok(Math.abs(await page.evaluate(()=>view.x)-after.x)>40);
 await page.click('#centerCanvas');await page.selectOption('#zoom','fit');
 console.log('PASS smooth Ctrl+wheel, background pan and toolbar center/zoom');
 // Seed a clean graph, then create many-to-many edges using native pointer gestures.
 await page.evaluate(()=>setProject({title:'Connections',width:1050,height:500,nodes:[F.systemNode('client',{id:'a',x:50,y:60}),F.systemNode('server',{id:'b',x:730,y:60}),F.systemNode('cache',{id:'c',x:390,y:310})],edges:[]}));
 async function dragPort(source,side,target,dest){const from=page.locator(`[data-node="${source}"] [data-port="${side}"]`),to=page.locator(`[data-node="${target}"] [data-port="${dest}"]`);const a=await from.boundingBox(),b=await to.boundingBox();await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:12});await page.mouse.up();}
 await dragPort('a','right','b','left');await dragPort('a','bottom','c','top');await dragPort('c','right','b','bottom');await dragPort('a','right','b','left');
 assert.equal(await page.evaluate(()=>project.edges.length),4);assert.equal(await page.evaluate(()=>project.edges.filter(e=>e.source==='a').length),3);
 const handle=await page.locator('[data-reconnect][data-end="target"]').boundingBox(),dest=await page.locator('[data-node="c"] [data-port="left"]').boundingBox();await page.mouse.move(handle.x+handle.width/2,handle.y+handle.height/2);await page.mouse.down();await page.mouse.move(dest.x+dest.width/2,dest.y+dest.height/2,{steps:12});await page.mouse.up();assert.equal(await page.evaluate(()=>project.edges.at(-1).target),'c');
 await page.click('#undo');assert.equal(await page.evaluate(()=>project.edges.at(-1).target),'b');await page.click('#redo');assert.equal(await page.evaluate(()=>project.edges.at(-1).target),'c');
 console.log('PASS port drag, fan-out/fan-in, repeated edges, reconnect, undo/redo');
 // All connector styles through the inspector.
 await page.evaluate(()=>{selected={type:'edge',id:project.edges[0].id};draw();inspect();});
 for(const id of ['out','in','curve','both','line','dashed','dotted','double']){await page.getByLabel('Tipo do conector',{exact:true}).selectOption(id);assert.equal(await page.evaluate(()=>project.edges[0].connector),id);}
 console.log('PASS eight connector styles');
 // Reactive text/color are driven by arrivals/departures at the paused SVG clock.
 await page.evaluate(()=>setProject({title:'Reactive export',width:1100,height:400,nodes:[F.systemNode('client',{id:'a',x:40,y:70}),F.makeNode('reactive',{id:'b',x:380,y:70,label:'Idle',reactive:{enterText:'In',exitText:'Out',hold:.5,transition:0}}),F.systemNode('server',{id:'c',x:730,y:70})],edges:[{id:'ab',source:'a',target:'b',duration:2,traffic:['request']},{id:'bc',source:'b',target:'c',duration:4,traffic:['request']}]}));
 await page.evaluate(()=>{paused=true;draw();board.querySelector('svg').setCurrentTime(2.1);});await page.waitForFunction(()=>document.querySelector('[data-node="b"]').textContent.includes('In'));assert.equal(await page.locator('[data-node="b"]').getAttribute('data-event'),'enter');
 const pausedClock=await page.evaluate(()=>currentTime());await page.waitForTimeout(100);assert.ok(Math.abs(await page.evaluate(()=>currentTime())-pausedClock)<.01);
 await page.evaluate(()=>board.querySelector('svg').setCurrentTime(4.3));await page.waitForFunction(()=>document.querySelector('[data-node="b"]').textContent.includes('Out'));
 await page.evaluate(()=>board.querySelector('svg').setCurrentTime(3));await page.waitForFunction(()=>document.querySelector('[data-node="b"]').textContent.includes('Idle'));
 console.log('PASS synchronized enter/exit/idle and pause');
 async function download(button,name){const event=page.waitForEvent('download');await page.click('#'+button);const d=await event;const file=path.join(out,name);await d.saveAs(file);return file;}
 const json=await download('jsonExport','diagram.json'),svg=await download('svgExport','diagram.svg'),html=await download('htmlExport','diagram.html'),png=await download('pngExport','diagram.png');
 const pngBytes=fs.readFileSync(png);assert.equal(pngBytes.subarray(1,4).toString(),'PNG');const densityOffset=pngBytes.indexOf(Buffer.from('pHYs'));assert.ok(densityOffset>0);assert.equal(pngBytes.readUInt32BE(densityOffset+4),11811);assert.equal(pngBytes.readUInt32BE(densityOffset+8),11811);
 await page.setInputFiles('#import',json);assert.equal(await page.evaluate(()=>project.nodes[1].reactive.enterText),'In');
 await page.reload();assert.equal(await page.evaluate(()=>project.nodes[1].reactive.exitText),'Out');
 const exported=await browser.newPage();exported.on('pageerror',e=>errors.push(e.message));await exported.goto(require('node:url').pathToFileURL(html).href);assert.equal(await exported.locator('[data-node]').count(),3);await exported.evaluate(()=>{const s=document.querySelector('svg');s.pauseAnimations();s.setCurrentTime(2.1);});await exported.waitForFunction(()=>document.querySelector('[data-node="b"]').textContent.includes('In'));
 await exported.goto(require('node:url').pathToFileURL(svg).href);assert.equal(await exported.locator('parsererror').count(),0);await exported.evaluate(()=>{document.documentElement.pauseAnimations();document.documentElement.setCurrentTime(2.1);});await exported.waitForFunction(()=>document.querySelector('[data-node="b"]').textContent.includes('In'));
 assert.deepEqual(errors,[]);console.log('PASS JSON roundtrip/persistence, PNG 300 dpi, animated standalone SVG and HTML export; no browser errors');
 await page.evaluate(()=>setProject(F.featureTemplate()));await page.screenshot({path:path.join(out,'editor.png')});
 console.log('Browser artifacts:',out);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
