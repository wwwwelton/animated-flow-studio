const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../src/traffic-runtime.js'),'utf8');

function runtime(pathElement,{reverse=false,rotate=false,reduced=false,event=false,size=16,comet=false}={}){
 const attributes=new Map(),tailAttributes=new Map(),listeners=new Map();
 const token={dataset:{path:'rail',edgeId:'webhook-link',size:String(size),start:'0',duration:'2',cycle:'4',event:String(event),reverse:String(reverse),rotate:String(rotate)},setAttribute(name,value){attributes.set(name,value);},querySelector(selector){return comet&&selector==='.comet-tail'?{setAttribute(name,value){tailAttributes.set(name,value);}}:null;}};
 const media={matches:reduced,addEventListener(){},removeEventListener(){}};
 const document={visibilityState:'visible',addEventListener(name,callback){listeners.set(name,callback);},removeEventListener(name){listeners.delete(name);}};
 let time=1,nextFrame;
 const svg={isConnected:true,querySelectorAll(selector){return selector==='.protocol-packet'?[token]:[];},querySelector(){return pathElement;},getCurrentTime(){return time;},addEventListener(name,callback){listeners.set(name,callback);},removeEventListener(name){listeners.delete(name);},dispatchEvent(event){listeners.get(event.type)?.(event);}};
 const context={document,matchMedia:()=>media,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}},requestAnimationFrame(callback){nextFrame=callback;return 1;},cancelAnimationFrame(){}};
 vm.runInNewContext(source,context);
 const stop=context.FlowTraffic.mount(svg,{nodes:[]},{});
 return {attributes,tailAttributes,media,document,stop,trigger:context.FlowTraffic.trigger.bind(null,svg),step(value){time=value;nextFrame();},listeners};
}

test('tokens use path arc length, respect endpoint padding and reverse on the same rail',()=>{
 const pathElement={getTotalLength:()=>100,getPointAtLength(distance){return {x:distance,y:distance*distance/100};}};
 const forward=runtime(pathElement),reverse=runtime(pathElement,{reverse:true});
 assert.equal(forward.attributes.get('transform'),'translate(48 23.04)');
 assert.equal(reverse.attributes.get('transform'),'translate(48 23.04)');
 forward.step(0);
 reverse.step(0);
 assert.equal(forward.attributes.get('transform'),'translate(12 1.44)');
 assert.equal(reverse.attributes.get('transform'),'translate(84 70.56)');
 forward.step(2.5);
 assert.equal(forward.attributes.get('opacity'),'0');
 forward.stop();reverse.stop();
});

test('larger tokens receive more clearance from cards and arrowheads',()=>{
 const pathElement={getTotalLength:()=>100,getPointAtLength(distance){return {x:distance,y:0};}};
 const flow=runtime(pathElement,{size:32});
 flow.step(0);
 assert.equal(flow.attributes.get('transform'),'translate(20 0)');
 flow.step(1.999);
 assert.ok(Number(flow.attributes.get('transform').match(/translate\(([^ ]+)/)[1])<=76);
 flow.stop();
});

test('API tokens share the request fade from zero to 0.86 and back to zero',()=>{
 const pathElement={getTotalLength:()=>100,getPointAtLength(distance){return {x:distance,y:0};}};
 const flow=runtime(pathElement);
 flow.step(0);assert.equal(flow.attributes.get('opacity'),'0');
 flow.step(.06);assert.ok(Math.abs(Number(flow.attributes.get('opacity'))-.43)<1e-8);
 flow.step(.12);assert.equal(flow.attributes.get('opacity'),'0.86');
 flow.step(1);assert.equal(flow.attributes.get('opacity'),'0.86');
 flow.step(1.94);assert.ok(Math.abs(Number(flow.attributes.get('opacity'))-.43)<1e-8);
 flow.step(2);assert.equal(flow.attributes.get('opacity'),'0');
 flow.stop();
});

test('SSE follows the tangent and reduced motion keeps a still protocol marker',()=>{
 const pathElement={getTotalLength:()=>100,getPointAtLength(distance){return {x:distance,y:distance};}};
 const flow=runtime(pathElement,{rotate:true,reduced:true});
 assert.match(flow.attributes.get('transform'),/^translate\(48 48\) rotate\(45\)/);
 assert.equal(flow.attributes.get('opacity'),'.5');
 assert.equal(flow.listeners.has('visibilitychange'),true);
 flow.stop();
 assert.equal(flow.listeners.has('visibilitychange'),false);
});

test('API comet tail follows a curved path without rotating the protocol symbol',()=>{
 const pathElement={getTotalLength:()=>100,getPointAtLength(distance){return {x:distance,y:distance};}};
 const forward=runtime(pathElement,{comet:true}),reverse=runtime(pathElement,{comet:true,reverse:true});
 assert.equal(forward.attributes.get('transform'),'translate(62 62)');
 assert.equal(forward.tailAttributes.get('transform'),'rotate(45) scale(0.75)');
 assert.equal(reverse.attributes.get('transform'),'translate(34 34)');
 assert.equal(reverse.tailAttributes.get('transform'),'rotate(225) scale(0.75)');
 forward.step(0);reverse.step(0);
 assert.equal(forward.attributes.get('transform'),'translate(40 40)');
 assert.equal(reverse.attributes.get('transform'),'translate(56 56)');
 forward.stop();reverse.stop();
});

test('Webhook repeats on the same rail and its event restarts the loop',()=>{
 const pathElement={getTotalLength:()=>100,getPointAtLength(distance){return {x:distance,y:0};}};
 const flow=runtime(pathElement,{event:true});
 flow.step(2.5);
 assert.equal(flow.attributes.get('opacity'),'0');
 flow.step(4);
 assert.equal(flow.attributes.get('transform'),'translate(12 0)');
 assert.equal(flow.attributes.get('opacity'),'0');
 flow.step(4.5);
 assert.equal(flow.attributes.get('transform'),'translate(30 0)');
 assert.equal(flow.attributes.get('opacity'),'0.86');
 flow.trigger('another-link');
 assert.equal(flow.attributes.get('transform'),'translate(30 0)');
 flow.trigger('webhook-link');
 assert.equal(flow.attributes.get('transform'),'translate(12 0)');
 assert.equal(flow.attributes.get('opacity'),'0');
 flow.step(5.5);
 assert.equal(flow.attributes.get('opacity'),'0.86');
 flow.stop();
});

test('a rerender after moving a card uses the replacement connector geometry',()=>{
 const straight={getTotalLength:()=>100,getPointAtLength(distance){return {x:distance,y:0};}};
 const curve={getTotalLength:()=>150,getPointAtLength(distance){return {x:distance,y:distance/2};}};
 const first=runtime(straight);
 assert.equal(first.attributes.get('transform'),'translate(48 0)');
 first.stop();
 const moved=runtime(curve);
 assert.equal(moved.attributes.get('transform'),'translate(73 36.5)');
 moved.stop();
});
