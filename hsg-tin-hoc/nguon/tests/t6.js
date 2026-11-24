const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
await p.goto('file://'+require('path').resolve(__dirname,'..','..','index.html')+'');
await p.getByRole('button',{name:'Học theo chủ đề'}).first().click();
await p.screenshot({path:'/tmp/l0.png'});
const n=await p.locator('button:text-is("Học")').count();console.log('units',n);
// go through every unit
for(let i=0;i<n;i++){
 await p.getByRole('button',{name:'Học theo chủ đề'}).first().click();
 await p.locator('button:text-is("Học")').nth(0).click().catch(async()=>{await p.locator('.lrow button').nth(i).click()});
 await p.locator('.lrow').count();
 // advance pages till quiz
 for(let k=0;k<12;k++){const nx=p.getByRole('button',{name:/^(Tiếp ›|Làm bài kiểm tra ›)$/});if(await nx.count()===0)break;
   if(i===0&&k===2)await p.screenshot({path:'/tmp/l2.png'});await nx.first().click()}
 for(let q=0;q<5;q++){const o=p.locator('.opt, label.opt, [role=radio]').first();if(await o.count()===0)break;await o.click();await p.getByRole('button',{name:'Kiểm tra',exact:true}).click();const c=p.getByRole('button',{name:/Câu tiếp|Xem kết quả/});await c.click()}
 await p.getByRole('button',{name:'Về danh sách'}).click();
}
console.log('errs',errs.slice(0,5));
const ow=await p.evaluate(()=>document.documentElement.scrollWidth);console.log('scrollW',ow);
await p.screenshot({path:'/tmp/l9.png'});await b.close()})()
