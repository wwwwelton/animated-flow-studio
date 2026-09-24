const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.AFS_BROWSER_PATH,args:['--no-sandbox','--disable-gpu']});
 try{
 const page=await browser.newPage({viewport:{width:1600,height:1050}});await page.goto(require('node:url').pathToFileURL(path.resolve(__dirname,'../editor.html')).href);
 const requests=await require('./font-fixture')(page);
 await page.locator('[data-node="client"]').click();
 for(const [label,value]of [['Fonte (Google Fonts ou local)','Inter'],['Tamanho da fonte (px)','21']]){const input=page.getByLabel(label,{exact:true});await input.fill(value);await input.dispatchEvent('change');}
 await page.getByLabel('Bold',{exact:true}).check();await page.getByLabel('Italic',{exact:true}).check();
 await page.waitForFunction(()=>document.fonts.check('14px Inter'));
 assert.ok(requests()>0);
 const result=await page.evaluate(async()=>{
  const typo=project.nodes[0].typography;const result=[];
  for(const type of Object.keys(F.TYPES)){
   const props={id:'test',label:'Texto',typography:typo};const n=type==='system'?F.systemNode('client',props):F.makeNode(type,props);
   const p=F.normalize({nodes:[n],edges:[]});const svg=F.render(p,{static:true});result.push(svg.includes("font-family:'Inter'")&&svg.includes('font-size:21px')&&svg.includes('font-weight:700')&&svg.includes('font-style:italic'));
  }
  const fonts=await FlowFonts.embed(project);return {valid:result.every(Boolean),css:fonts.css,warnings:fonts.warnings};
 });assert.ok(result.valid);assert.match(result.css,/data:font\/ttf;base64,/);assert.deepEqual(result.warnings,[]);
 await page.getByLabel('Code',{exact:true}).check();assert.match(await page.locator('[data-node="client"] .node-title').first().getAttribute('style'),/Courier New/);
 const mono=await page.evaluate(()=>F.textStyle({typography:{fontFamily:'Roboto Mono',code:true}}));assert.match(mono,/Roboto Mono/);
 await page.route('https://fonts.googleapis.com/**',route=>route.abort());
 const warnings=await page.evaluate(()=>FlowFonts.ensure({nodes:[{typography:{fontFamily:'Missing Font'}}],edges:[]}));assert.equal(warnings.length,1);
 console.log('PASS typography controls, all component types, Google CSS/font fixture, embedded bytes, code font and offline fallback');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
