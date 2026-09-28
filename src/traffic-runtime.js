/* Protocol tokens and reactive state follow the same SVG clock (pause/seek/export). */
(function(root){
 'use strict';
 const START_PADDING=4,END_PADDING=8;
 function placeToken(token,path,length,progress,reverse,rotate,size){
  const radius=size/2;
  const start=Math.min((path.hasAttribute?.('marker-start')?END_PADDING:START_PADDING)+radius,length/2);
  const end=Math.max(start,length-Math.min(END_PADDING+radius,length/2));
  const distance=reverse?end-(end-start)*progress:start+(end-start)*progress;
  const point=path.getPointAtLength(distance);
  let angle=0;
  if(rotate){
   const before=path.getPointAtLength(Math.max(0,distance-1)),after=path.getPointAtLength(Math.min(length,distance+1));
   angle=Math.atan2(after.y-before.y,after.x-before.x)*180/Math.PI+(reverse?180:0);
  }
  token.setAttribute('transform',`translate(${point.x} ${point.y})${rotate?` rotate(${angle})`:''}`);
 }
 function mount(svg,project,core){
  const reactiveNodes=project.nodes.filter(n=>n.type==='reactive');
  const streamList=reactiveNodes.length?core.streams(project):[];
  const tokens=Array.from(svg.querySelectorAll('.protocol-packet')).map(token=>{
   const path=svg.querySelector(`[id="${token.dataset.path}"]`);
   return path?{token,path,length:path.getTotalLength(),size:Number(token.dataset.size)||16,peakOpacity:token.dataset.peakOpacity||'.86',start:Number(token.dataset.start),duration:Number(token.dataset.duration),cycle:Number(token.dataset.cycle),event:token.dataset.event==='true',edgeId:token.dataset.edgeId,reverse:token.dataset.reverse==='true',rotate:token.dataset.rotate==='true'}:null;
  }).filter(Boolean);
  if(!reactiveNodes.length&&!tokens.length)return ()=>{};
  let frame=0,stopped=false,previous=Object.create(null),lastTokenTime=-1;
  const elements=new Map(Array.from(svg.querySelectorAll('[data-node]')).map(el=>[el.getAttribute('data-node'),el]));
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function updateTokens(time){
   if(time===lastTokenTime&&!reduced.matches)return;
   lastTokenTime=time;
   for(const item of tokens){
    if(reduced.matches){placeToken(item.token,item.path,item.length,.5,item.reverse,item.rotate,item.size);item.token.setAttribute('opacity','.5');item.visible=undefined;continue;}
    const elapsed=((time-item.start)%item.cycle+item.cycle)%item.cycle;
    const visible=time>=item.start&&elapsed<item.duration;
    if(item.visible!==visible){item.token.setAttribute('opacity',visible?item.peakOpacity:'0');item.visible=visible;}
    if(visible)placeToken(item.token,item.path,item.length,elapsed/item.duration,item.reverse,item.rotate,item.size);
   }
  }
  function update(){
   if(stopped||!svg.isConnected)return;
   if(document.visibilityState==='hidden')return;
   const time=svg.getCurrentTime();updateTokens(time);
   const states=reactiveNodes.length?core.reactiveStates(project,time,streamList):{};
   for(const n of reactiveNodes){
    const el=elements.get(n.id),state=states[n.id];if(!el||!state)continue;
    const key=state.event+'\0'+state.label+'\0'+state.color;if(previous[n.id]===key)continue;previous[n.id]=key;
    for(const shape of el.querySelectorAll('.node-shape')){shape.style.transition=`fill ${n.reactive.transition}s ease`;shape.style.fill=state.color;}
    const old=el.querySelector('.reactive-copy');if(old)old.remove();
    else {el.querySelectorAll('.node-copy,.icon').forEach(node=>node.remove());}
    const copy=document.createElementNS('http://www.w3.org/2000/svg','g');copy.setAttribute('class','reactive-copy');copy.setAttribute('pointer-events','none');copy.innerHTML=core.nodeLabels(n,state.label);el.append(copy);
    el.setAttribute('data-event',state.event);
   }
   if(!reduced.matches)frame=requestAnimationFrame(update);
  }
  function resume(){if(stopped)return;lastTokenTime=-1;cancelAnimationFrame(frame);update();}
  function trigger(event){for(const item of tokens)if(item.event&&(!event.detail?.edgeId||event.detail.edgeId===item.edgeId))item.start=svg.getCurrentTime();resume();}
  document.addEventListener('visibilitychange',resume);reduced.addEventListener('change',resume);
  svg.addEventListener('flow-traffic-event',trigger);
  update();return ()=>{stopped=true;cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',resume);reduced.removeEventListener('change',resume);svg.removeEventListener('flow-traffic-event',trigger);};
 }
 /** Restart the Webhook loop on one edge, or on every Webhook edge. */
 function trigger(svg,edgeId){svg.dispatchEvent(new CustomEvent('flow-traffic-event',{detail:{edgeId}}));}
 root.FlowTraffic={mount,trigger};
})(typeof globalThis!=='undefined'?globalThis:this);
