function colorField(parent,label,item,key,fallback){
 const row=document.createElement('div'),title=document.createElement('label'),picker=document.createElement('input'),hex=document.createElement('input');
 row.className='element-color';title.textContent=label;picker.type='color';picker.id=uid();title.htmlFor=picker.id;
 picker.value=item[key]??fallback;hex.value=picker.value;hex.maxLength=7;hex.spellcheck=false;
 hex.setAttribute('aria-label',label+' em hexadecimal');hex.placeholder='#000000';
 const commit=value=>{
  const next=value.trim().replace(/^#?/,'#');
  if(!/^#[0-9a-f]{6}$/i.test(next)){hex.value=picker.value;status('Cor inválida. Use # e seis dígitos hexadecimais.');return;}
  if(next.toLowerCase()===(item[key]??fallback).toLowerCase()){picker.value=next;hex.value=next.toLowerCase();return;}
  checkpoint();item[key]=next.toLowerCase();picker.value=item[key];hex.value=item[key];save();
 };
 picker.addEventListener('change',()=>commit(picker.value));hex.addEventListener('change',()=>commit(hex.value));
 row.append(picker,hex);parent.append(title,row);
}
function elementColors(parent,item,isNode){
 const section=document.createElement('section'),heading=document.createElement('h3');
 section.className='element-colors';heading.textContent='Cores';section.append(heading);
 const fields=isNode
  ? [...(item.type==='text'?[]:[['Preenchimento','color','#ffffff'],['Borda','borderColor','#000000']]),
     ['Texto','textColor','#000000'],
     ...(['text','group','swimlane'].includes(item.type)?[]:[['Subtítulo','subtitleColor','#000000'],['Ícone','iconColor','#333333']])]
  : [['Linha e setas','strokeColor','#000000'],['Rótulo','textColor','#000000']];
 for(const [label,key,fallback]of fields)colorField(section,label,item,key,fallback);
 parent.append(section);
}
