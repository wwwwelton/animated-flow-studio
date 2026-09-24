/* Google Fonts CSS2. Fonts are embedded into exports when a download succeeds. */
(function(root){
 'use strict';
 const local=new Set(['Arial','Georgia','Verdana','Courier New']),cache=new Map();
 const timeout=()=>AbortSignal.timeout(12000);
 async function fetchFont(family){
  const base='https://fonts.googleapis.com/css2?family='+encodeURIComponent(family);
  let response=await fetch(base+':ital,wght@0,400;0,700;1,400;1,700&display=swap',{signal:timeout()});
  if(!response.ok)response=await fetch(base+'&display=swap',{signal:timeout()});
  if(!response.ok)throw Error('Fonte indisponível: '+family);
  const css=await response.text();
  const style=document.createElement('style');style.textContent=css;document.head.append(style);
  await document.fonts.load(`14px "${family}"`);
  return css;
 }
 function families(project){return [...new Set([...project.nodes,...project.edges].map(n=>n.typography?.code&&!/(Mono|Code|Courier|Consolas|Inconsolata)/i.test(n.typography?.fontFamily??'Arial')?'Courier New':n.typography?.fontFamily??'Arial'))].filter(f=>!local.has(f));}
 function load(family){if(local.has(family))return Promise.resolve('');if(!cache.has(family))cache.set(family,fetchFont(family).catch(e=>{cache.delete(family);throw e;}));return cache.get(family);}
 async function ensure(project){const rs=await Promise.allSettled(families(project).map(load));return rs.filter(r=>r.status==='rejected').map(r=>r.reason.message);}
 function asDataURL(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(blob);});}
 async function embed(project){
  const css=[],warnings=[];
  for(const family of families(project))try{
   let text=await load(family);const urls=[...new Set(Array.from(text.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g),m=>m[1]))];
   for(const url of urls){const response=await fetch(url,{signal:timeout()});if(!response.ok)throw Error('Não foi possível incorporar '+family);text=text.replaceAll(url,await asDataURL(await response.blob()));}
   css.push(text);
  }catch(e){warnings.push(e.message);}
  return {css:css.join('\n'),warnings};
 }
 root.FlowFonts={ensure,embed,load,families};
})(typeof globalThis!=='undefined'?globalThis:this);
