'use strict';
const $=id=>document.getElementById(id);
const number=value=>value.toLocaleString('en-US');
let data=null,boxes=[];
let activeBox=0;
function element(tag,text,className){const node=document.createElement(tag);node.textContent=text;if(className)node.className=className;return node;}
function renderRows(){
 const query=$('filter').value.toLowerCase();
 const rows=data.functions.filter(f=>(f.name+' '+f.source+' '+f.rva).toLowerCase().includes(query));
 $('function-rows').replaceChildren(...rows.map(f=>{
  const row=document.createElement('tr');
  for(const value of [f.name,f.rva,number(f.bytes),f.source])row.append(element('td',value));
  row.tabIndex=0;row.addEventListener('focus',()=>select(f));row.addEventListener('click',()=>select(f));return row;
 }));
 if(!rows.length){const row=document.createElement('tr'),cell=element('td','No matching functions. Try another name or source file.');cell.colSpan=4;row.append(cell);$('function-rows').append(row);}
}
function select(f){$('selection').textContent=f.name+' · '+f.rva+' · '+number(f.bytes)+' exact matching bytes · '+f.source;}
function partition(rows,x,y,w,h,result){
 if(rows.length===1){result.push({...rows[0],x,y,w,h});return;}
 const sum=rows.reduce((s,f)=>s+f.bytes,0);let left=0,index=0;
 while(index<rows.length-1&&left<sum/2){left+=rows[index].bytes;index++;}
 const ratio=left/sum;
 if(w>=h){partition(rows.slice(0,index),x,y,w*ratio,h,result);partition(rows.slice(index),x+w*ratio,y,w*(1-ratio),h,result);}
 else{partition(rows.slice(0,index),x,y,w,h*ratio,result);partition(rows.slice(index),x,y+h*ratio,w,h*(1-ratio),result);}
}
function setup(canvas,height){
 const width=canvas.parentElement.clientWidth,ratio=devicePixelRatio||1;
 canvas.width=width*ratio;canvas.height=height*ratio;canvas.style.height=height+'px';
 const ctx=canvas.getContext('2d');ctx.scale(ratio,ratio);return {ctx,width};
}
function draw(){
 if(!data)return;
 const {ctx,width}=setup($('scope'),65),fraction=data.matchingFunctionBytes/data.executableBytes;
 ctx.fillStyle='#253d48';ctx.fillRect(0,0,width,65);ctx.fillStyle='#b3dda1';ctx.fillRect(0,0,width*fraction,65);
 ctx.strokeStyle='#e9b574';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,65);ctx.stroke();
 ctx.fillStyle='#d6e1e0';ctx.font='12px monospace';ctx.fillText(number(data.executableBytes-data.matchingFunctionBytes)+' executable bytes remaining',18,38);
 const map=setup($('functions'),Math.max(280,Math.min(430,width*.46)));
 boxes=[];partition([...data.functions].sort((a,b)=>b.bytes-a.bytes||a.name.localeCompare(b.name)),0,0,map.width,$('functions').clientHeight,boxes);
 for(let i=0;i<boxes.length;i++){
  const b=boxes[i];map.ctx.fillStyle=['#416e76','#4c8085','#557f69','#36616d','#668c70'][i%5];map.ctx.fillRect(b.x+1,b.y+1,Math.max(0,b.w-2),Math.max(0,b.h-2));
  if(b.w>85&&b.h>26){map.ctx.save();map.ctx.beginPath();map.ctx.rect(b.x+4,b.y+2,b.w-8,b.h-4);map.ctx.clip();map.ctx.fillStyle='#edf3eb';map.ctx.font='10px monospace';map.ctx.fillText(b.name,b.x+6,b.y+15);map.ctx.fillText(b.bytes+' B',b.x+6,b.y+28);map.ctx.restore();}
 }
}
$('functions').tabIndex=0;
$('functions').setAttribute('aria-describedby','selection');
$('functions').addEventListener('focus',()=>{if(boxes[activeBox])select(boxes[activeBox]);});
$('functions').addEventListener('click',event=>{const rect=event.currentTarget.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;const index=boxes.findIndex(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h);if(index>=0){activeBox=index;select(boxes[index]);event.currentTarget.focus();}});
$('functions').addEventListener('pointermove',event=>{const rect=event.currentTarget.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top;const box=boxes.find(b=>x>=b.x&&x<b.x+b.w&&y>=b.y&&y<b.y+b.h);if(box){event.currentTarget.title=box.name+' · '+box.bytes+' B · '+box.source;select(box);}});
$('functions').addEventListener('pointerleave',()=>{$('functions').removeAttribute('title');});
$('functions').addEventListener('keydown',event=>{if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(event.key)&&boxes.length){activeBox=event.key==='Home'?0:event.key==='End'?boxes.length-1:(activeBox+(['ArrowRight','ArrowDown'].includes(event.key)?1:-1)+boxes.length)%boxes.length;select(boxes[activeBox]);event.preventDefault();}else if(event.key==='Enter'){$('filter').focus();event.preventDefault();}});
$('filter').addEventListener('input',()=>{if(data)renderRows();});
addEventListener('resize',draw);
fetch('rebuild.json',{cache:'no-cache'}).then(response=>{if(!response.ok)throw Error('snapshot unavailable');return response.json();}).then(value=>{
 if(value.data!=='NON-LIVE DATA'||value.wholeBinaryRebuilt!==false||!Array.isArray(value.functions)||value.functions.length!==value.functionCount||
  value.functions.reduce((s,f)=>s+f.bytes,0)!==value.matchingFunctionBytes||value.matchingFunctionBytes>value.executableBytes)throw Error('snapshot inconsistent');
 data=value;
 const metrics=[[(100*data.matchingFunctionBytes/data.executableBytes).toFixed(6)+'%','EXACT EXECUTABLE MATCH'],[number(data.matchingFunctionBytes)+' / '+number(data.executableBytes),'MATCHED / SCOPE BYTES'],[number(data.functionCount),'VERIFIED MATCHING FUNCTIONS'],['0','COMPLETE SHIPPED BINARIES REBUILT']];
 $('metrics').replaceChildren(...metrics.map(([value,label])=>{const box=document.createElement('div');box.append(element('strong',value),element('span',label));return box;}));$('metrics').hidden=false;
 $('graph-status').textContent='Proof verified '+data.proofVerifiedUtc+' · Pinned binary SHA-256 '+data.binarySha256;
 renderRows();draw();
}).catch(()=>{$('graph-status').textContent='The published graph could not load, so matching figures are unavailable here. No complete shipped binary rebuild has been verified. Refresh to retry.';});
