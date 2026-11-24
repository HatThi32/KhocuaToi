const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:900}});
await p.goto('file://'+require('path').resolve(__dirname,'..','..','index.html')+'');
await p.click('text=Bắt đầu làm bài');await p.locator('.qnav button').last().click();await p.click('button:text-is("Nộp bài")');await p.click('text=Nộp bài luôn');
console.log((await p.innerText('main')).split('\n').slice(0,8).join(' | '));await b.close()})();
