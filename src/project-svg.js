/* Keep a portable project copy inside full-diagram SVG exports. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ProjectSVG=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const SVG_NAMESPACE='http://www.w3.org/2000/svg';
const METADATA_ID='animated-flow-project';
const FORMAT='af-json-v1';

function embed(svg,project){
 const start=svg.indexOf('>');
 if(!svg.startsWith('<svg ')||start<0)throw Error('Exportação SVG inválida.');
 const metadata=`<metadata id="${METADATA_ID}" data-format="${FORMAT}">${encodeURIComponent(JSON.stringify(project))}</metadata>`;
 return svg.slice(0,start+1)+metadata+svg.slice(start+1);
}

function extract(source){
 const document=new DOMParser().parseFromString(source,'image/svg+xml');
 const svg=document.documentElement;
 if(svg.localName!=='svg'||svg.namespaceURI!==SVG_NAMESPACE||document.querySelector('parsererror'))throw Error('SVG inválido.');
 const metadata=[...svg.children].find(element=>element.localName==='metadata'&&element.id===METADATA_ID);
 if(!metadata||metadata.getAttribute('data-format')!==FORMAT)throw Error('SVG sem projeto editável do Animated Flow Studio.');
 try{return JSON.parse(decodeURIComponent(metadata.textContent));}
 catch{throw Error('Dados do projeto no SVG inválidos.');}
}

return {embed,extract};
});
