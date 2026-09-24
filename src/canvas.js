const CANVAS_LIMIT = 5000;
const DEFAULT_MARGIN = 48;
function contentBounds(nodes) {
  if (!nodes.length) return {left:0,top:0,right:0,bottom:0};
  return {
    left:Math.min(...nodes.map(n=>n.x)), top:Math.min(...nodes.map(n=>n.y)),
    right:Math.max(...nodes.map(n=>n.x+n.w)), bottom:Math.max(...nodes.map(n=>n.y+n.h))
  };
}
// Grow monotonically. Left/top overflow translates every node, preserving links
// and relative group coordinates. Padding yields to the canvas size limit.
function growCanvas(p) {
  const before={width:p.width,height:p.height};
  if (p.autoGrow===false || !p.nodes.length) return {shiftX:0,shiftY:0,changed:false};
  const b=contentBounds(p.nodes),margin=p.growthMargin??DEFAULT_MARGIN;
  function axis(size,lo,hi) {
    const base=Math.max(size,hi), minimumShift=Math.max(0,-lo);
    if (base+minimumShift>CANVAS_LIMIT) throw Error('O conteúdo ultrapassa o limite de 5000 px.');
    const shift=lo<0?Math.min(minimumShift+margin,CANVAS_LIMIT-base):0;
    const extent=Math.max(size+shift,hi>size?hi+shift+margin:0);
    return {shift,size:Math.min(CANVAS_LIMIT,Math.ceil(extent))};
  }
  const x=axis(p.width,b.left,b.right),y=axis(p.height,b.top,b.bottom);
  for(const n of p.nodes){n.x+=x.shift;n.y+=y.shift;}
  p.width=x.size;p.height=y.size;
  return {shiftX:x.shift,shiftY:y.shift,changed:p.width!==before.width||p.height!==before.height};
}
function resizeCanvas(p,width,height,{fit=false}={}) {
  if (![width,height].every(n=>Number.isFinite(n)&&n>=300&&n<=CANVAS_LIMIT))
    throw Error('Dimensões devem estar entre 300 e 5000 px.');
  const b=contentBounds(p.nodes),margin=p.growthMargin??DEFAULT_MARGIN;
  if (b.left<0||b.top<0||b.right>CANVAS_LIMIT||b.bottom>CANVAS_LIMIT)
    throw Error('Há componentes fora dos limites. Ative o crescimento automático.');
  const minW=Math.min(CANVAS_LIMIT,Math.ceil(b.right+(fit?margin:0)));
  const minH=Math.min(CANVAS_LIMIT,Math.ceil(b.bottom+(fit?margin:0)));
  p.width=Math.max(300,fit?minW:Math.max(width,minW));
  p.height=Math.max(300,fit?minH:Math.max(height,minH));
  return {constrained:!fit&&(p.width!==width||p.height!==height)};
}
// Shared with editor gestures and property edits so both honor identical bounds.
function transformNodes(p,originals,dx,dy,{kind='move',id=originals[0]?.id}={}) {
  if (![dx,dy].every(Number.isFinite)) throw Error('Deslocamento inválido.');
  const auto=p.autoGrow!==false, limitX=auto?CANVAS_LIMIT:p.width,limitY=auto?CANVAS_LIMIT:p.height;
  if(kind==='resize') {
    const o=originals.find(n=>n.id===id),n=p.nodes.find(n=>n.id===id);
    if(!o||!n)throw Error('Componente não encontrado.');
    n.w=Math.max(24,Math.min(limitX-n.x,o.w+dx));
    n.h=Math.max(24,Math.min(limitY-n.y,o.h+dy));
  } else {
    const b=contentBounds(originals);
    dx=Math.max(-b.left-(auto?CANVAS_LIMIT-p.width:0),Math.min(limitX-b.right,dx));
    dy=Math.max(-b.top-(auto?CANVAS_LIMIT-p.height:0),Math.min(limitY-b.bottom,dy));
    const lookup=new Map(p.nodes.map(n=>[n.id,n]));
    for(const o of originals){const n=lookup.get(o.id);if(n){n.x=o.x+dx;n.y=o.y+dy;}}
  }
  return growCanvas(p);
}

