/* Reactive state follows the same SVG clock as animateMotion (pause/seek/export). */
(function(root){
 'use strict';
 function mount(svg,project,core){
  if(!project.nodes.some(n=>n.type==='reactive'))return ()=>{};
  const streamList=core.streams(project);
  let frame=0,stopped=false,previous=Object.create(null);
  const elements=new Map(Array.from(svg.querySelectorAll('[data-node]')).map(el=>[el.getAttribute('data-node'),el]));
  function update(){
   if(stopped||!svg.isConnected)return;
   const states=core.reactiveStates(project,svg.getCurrentTime(),streamList);
   for(const n of project.nodes){
    if(n.type!=='reactive')continue;const el=elements.get(n.id),state=states[n.id];if(!el||!state)continue;
    const key=state.event+'\0'+state.label+'\0'+state.color;if(previous[n.id]===key)continue;previous[n.id]=key;
    for(const shape of el.querySelectorAll('.node-shape')){shape.style.transition=`fill ${n.reactive.transition}s ease`;shape.style.fill=state.color;}
    const old=el.querySelector('.reactive-copy');if(old)old.remove();
    else {el.querySelectorAll('.node-copy,.icon').forEach(node=>node.remove());}
    const copy=document.createElementNS('http://www.w3.org/2000/svg','g');copy.setAttribute('class','reactive-copy');copy.setAttribute('pointer-events','none');copy.innerHTML=core.nodeLabels(n,state.label);el.append(copy);
    el.setAttribute('data-event',state.event);
   }
   frame=requestAnimationFrame(update);
  }
  update();return ()=>{stopped=true;cancelAnimationFrame(frame);};
 }
 root.FlowTraffic={mount};
})(typeof globalThis!=='undefined'?globalThis:this);
