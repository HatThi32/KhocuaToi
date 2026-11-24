// Python: màn "Giải từng bước" hiển thị cho câu thuật toán (luyện theo chủ đề -> bài tập Python, trả lời sai)
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'..','..','index.html'));
await p.click('nav >> text=Đề thi thử');await p.fill('input[type=number] >> nth=0','60');await p.click('text=Bắt đầu làm bài');
const n=await p.locator('.qnav button').count();
for(let i=0;i<n;i++){await p.locator('.qnav button').nth(i).click();const o=p.locator('.opt');if(await o.count())await o.nth(0).click()}
await p.locator('.qnav button').last().click();await p.click('button:text-is("Nộp bài")');if(await p.locator('text=Nộp bài luôn').count())await p.click('text=Nộp bài luôn');
await p.click('text=Xem lời giải từng câu');
const t=await p.innerText('main');
console.log('walk:',t.includes('Giải từng bước'),'| mẹo:',t.includes('Mẹo tự lần vết'),'| sau bước:',t.includes('Sau bước này'));
const w=p.locator('.wk').first();if(await w.count()){await w.scrollIntoViewIfNeeded();await p.locator('.wk:has(.st)').first().screenshot({path:'/tmp/walk.png'})}
console.log(errs);await b.close()})();
