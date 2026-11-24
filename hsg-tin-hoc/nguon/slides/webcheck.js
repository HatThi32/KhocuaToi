// Dùng: node webcheck.js '<json>'  json={html,css,counts:[sel...],styles:[[sel,prop]...]}
const {chromium}=require('playwright');
(async()=>{const a=JSON.parse(process.argv[2]);const b=await chromium.launch();const p=await b.newPage();
await p.setContent('<!doctype html><html><head><style>'+(a.css||'')+'</style></head><body>'+a.html+'</body></html>');
const r=await p.evaluate(a=>({counts:(a.counts||[]).map(s=>document.querySelectorAll(s).length),
 styles:(a.styles||[]).map(([s,pr])=>{const e=document.querySelector(s);return e?getComputedStyle(e)[pr]:null}),
 rects:(a.rects||[]).map(s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return [r.width,r.height]})}),a);
console.log(JSON.stringify(r));await b.close()})()
