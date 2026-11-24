const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:900}});
await p.goto('file://'+require('path').resolve(__dirname,'..','..','index.html')+'');
const shot=async(idx,pages,name)=>{await p.getByRole('button',{name:'Học theo chủ đề'}).first().click();await p.locator('.lrow button').nth(idx).click();
 for(let k=0;k<pages;k++)await p.getByRole('button',{name:/^(Tiếp ›|Làm bài kiểm tra ›)$/}).first().click();await p.screenshot({path:name,fullPage:true})};
await shot(2,3,'/tmp/s_w3.png');await shot(16,3,'/tmp/s_c3.png');await shot(4,1,'/tmp/s_w5.png');await b.close()})()
