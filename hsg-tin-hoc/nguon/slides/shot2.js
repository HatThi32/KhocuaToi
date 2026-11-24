const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:772}});
await p.goto('file://'+__dirname+'/'+process.argv[2]+'');await p.waitForTimeout(800);
const n=await p.locator('.s').count();const bad=[];
for(let k=0;k<n;k++){await p.evaluate(k=>window.__show(k),k);await p.waitForTimeout(80);
 const r=await p.evaluate(()=>{const s=document.querySelector('.s.on');const bd=s.querySelector('.bd');const over=s.scrollHeight>s.clientHeight+1||bd.scrollHeight>bd.clientHeight+2;
  let small=0;s.querySelectorAll('*').forEach(e=>{if(e.children.length===0&&e.textContent.trim()){const fs=parseFloat(getComputedStyle(e).fontSize);if(fs<19.5)small++}});
  // svg text sizes
  let svgSmall=0;s.querySelectorAll('svg text,svg tspan').forEach(e=>{const t=e.getBoundingClientRect();const fs=parseFloat(getComputedStyle(e).fontSize);const sc=e.ownerSVGElement.getBoundingClientRect().width/e.ownerSVGElement.viewBox.baseVal.width;if(fs*sc<19)svgSmall++});
  return {over,sh:s.scrollHeight,ch:s.clientHeight,bsh:bd.scrollHeight,bch:bd.clientHeight,small,svgSmall}});
 if(r.over||r.small||r.svgSmall)bad.push([k+1,r]);
 await p.screenshot({path:`/tmp/${process.argv[3]}_${String(k+1).padStart(2,'0')}.png`})}
console.log(JSON.stringify(bad));await b.close()})()
