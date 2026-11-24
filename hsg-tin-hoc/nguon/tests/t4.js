const {chromium}=require('playwright');const fs=require('fs');
const B=JSON.parse(fs.readFileSync('bank.json')).q;const by={};const norm=x=>(x||'').replace(/\s+/g,' ').trim();B.forEach(q=>by[norm(q.stem).slice(0,60)+'|'+norm(q.code).slice(0,50)]=q);
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:900}});
await p.goto('file://'+require('path').resolve(__dirname,'..','..','index.html')+'');
for(const mode of ['all','mcqonly']){
await p.click('nav >> text=Đề thi thử');await p.fill('input[type=number] >> nth=0',mode=='all'?'21':'22');await p.click('text=Bắt đầu làm bài');
const n=await p.locator('.qnav button').count();let mc=0,tf=0,miss=0;
for(let i=0;i<n;i++){await p.locator('.qnav button').nth(i).click();
 const st=norm(await p.locator('.stem').first().innerText()).slice(0,60);const cd=(await p.locator('main pre.code').count())?norm(await p.locator('main pre.code').first().innerText()).slice(0,50):'';const q=by[st+'|'+cd];if(!q){miss++;continue}
 if(q.type==='mcq'){await p.locator('.opt').nth(+q.key).click();mc++}
 else if(mode=='all'){const segs=p.locator('.tfi');for(let k=0;k<q.items.length;k++){await segs.nth(k).locator('button').nth(q.items[k].v?0:1).click()}tf++}}
await p.locator('.qnav button').last().click();await p.click('button:text-is("Nộp bài")');if(await p.locator('text=Nộp bài luôn').count())await p.click('text=Nộp bài luôn');
console.log(mode,'mcq',mc,'tf',tf,'miss',miss,'|',(await p.locator('.score').innerText()),(await p.innerText('main')).match(/Câu trắc nghiệm đúng: \d+\/30/)[0]);
await p.click('text=Làm đề khác')}
await b.close()})();
