// Optional: requires Playwright and Chromium. Run after python3 build.py.
const fs=require('node:fs'),path=require('node:path'),{chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),F=require('../src/flow-core.js'),dir=path.join(root,'examples');
const code=fs.readFileSync(path.join(root,'src/flow-core.js'),'utf8')+'\n'+fs.readFileSync(path.join(root,'src/traffic-runtime.js'),'utf8');
const projects={
 'animated-flow-studio':F.studioTemplate(),componentes:F.gallery(),
 'system-design':F.systemTemplate(),'system-design-catalog':F.systemGallery(),
 cores:F.normalize(JSON.parse(fs.readFileSync(path.join(dir,'cores.json'),'utf8'))),
 'v3-features':F.featureTemplate(),'api-7-protocols':F.protocolTemplate(),
};
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:process.env.AFS_BROWSER_PATH,args:['--no-sandbox','--disable-gpu']});
 try{
 const page=await browser.newPage({viewport:{width:1600,height:1050}});
 for(const [name,p]of Object.entries(projects)){
  const script=code+'\nFlowTraffic.mount(document.querySelector("svg"),'+JSON.stringify(p).replace(/</g,'\\u003c')+',FlowCore);';
  let svg=F.render(p);
  if(p.nodes.some(n=>n.type==='reactive'))svg=svg.replace(/<\/svg>\s*$/,()=>'<script><![CDATA['+script.replace(/]]>/g,']]]]><![CDATA[>')+']]></script></svg>');
  fs.writeFileSync(path.join(dir,name+'.json'),JSON.stringify(p,null,2)+'\n');fs.writeFileSync(path.join(dir,name+'.svg'),svg);
  await page.setContent('<style>body{margin:0}svg{display:block}</style>'+F.render(p,{static:true,time:2.1}));
  await page.locator('svg').first().screenshot({path:path.join(dir,name+'.png')});
  if(name==='v3-features'||name==='api-7-protocols'){
   const title=name==='api-7-protocols'?'7 protocolos de API · Animated Flow Studio':'Animated Flow Studio 3';
   fs.writeFileSync(path.join(dir,name+'.html'),'<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>body{font-family:Arial;margin:24px;background:#eee}svg{max-width:100%;height:auto;display:block;margin:auto}button{padding:8px;margin-bottom:12px}</style><button id="play">Pausar / reproduzir</button>'+F.render(p)+'<script>'+script.replace(/<\/script/gi,'<\\/script')+'\ndocument.getElementById("play").onclick=()=>{const s=document.querySelector("svg");s.animationsPaused()?s.unpauseAnimations():s.pauseAnimations();};if(matchMedia("(prefers-reduced-motion: reduce)").matches)document.querySelector("svg").pauseAnimations();</script></html>');
  }
 }
 await page.goto('file://'+root+'/editor.html');await page.screenshot({path:path.join(dir,'editor-preview.png')});
 console.log('Generated',Object.keys(projects).length,'example projects and editor preview');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
