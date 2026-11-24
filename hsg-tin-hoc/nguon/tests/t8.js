const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:900}});
await p.goto('file://'+require('path').resolve(__dirname,'..','..','index.html')+'');
await p.getByRole('button',{name:'Học theo chủ đề'}).first().click();
await p.locator('.lrow button').nth(17).click(); // c1? 
for(let k=0;k<1;k++)await p.getByRole('button',{name:/^Tiếp ›$/}).first().click();
await p.locator('summary').first().click();
await p.screenshot({path:'/tmp/s_ex.png',fullPage:true});await b.close()})()
