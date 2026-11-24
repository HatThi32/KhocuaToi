const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:850}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'..','..','index.html')+'');
async function doExam(seed){await p.click('nav >> text=Đề thi thử');await p.fill('input[type=number] >> nth=0',String(seed));await p.click('text=Bắt đầu làm bài');
 const n=await p.locator('.qnav button').count();
 for(let i=0;i<n;i++){await p.locator('.qnav button').nth(i).click();const o=p.locator('.opt');if(await o.count())await o.nth(0).click()}
 await p.locator('.qnav button').last().click();await p.click('button:text-is("Nộp bài")');if(await p.locator('text=Nộp bài luôn').count())await p.click('text=Nộp bài luôn');}
await doExam(5);
let t=await p.innerText('main');console.log('learn card',t.includes('Học lại ngay phần bạn đang hổng'));
await p.screenshot({path:'s_result.png',fullPage:false});
await p.locator('text=Học ngay').first().click();
let pages=0;
for(let k=0;k<12;k++){
  const hasQuiz=await p.locator('.lab:has-text("Kiểm tra hiểu bài")').count();
  if(k==1||k==2)await p.screenshot({path:'s_les'+k+'.png'});
  if(hasQuiz)break;
  const nxt=p.locator('button:text-is("Tiếp ›"), button:text-is("Làm bài kiểm tra ›")');
  if(await nxt.count()===0)break;await nxt.first().click();pages++}
console.log('pages before quiz',pages);
for(let q=0;q<4;q++){if(!(await p.locator('.opt').count()))break;await p.locator('.opt').nth(0).click();await p.click('button:text-is("Kiểm tra")');
 const nx=p.locator('button:text-is("Câu tiếp"), button:text-is("Xem kết quả")');await nx.first().click()}
t=await p.innerText('main');console.log('done page:',t.includes('Mức hiểu bài'),(t.match(/\d\/\d/)||[])[0]);
await p.screenshot({path:'s_done.png'});
await p.click('text=Về kết quả');t=await p.innerText('main');console.log('back to result:',t.includes('Học lại ngay'),t.includes('đã học 1 lần'));
await p.click('text=Làm đề khác');
await doExam(6);t=await p.innerText('main');console.log('progress card:',t.includes('Tiến bộ sau khi học lại'));
await p.click('nav >> text=Ôn tập theo lỗi sai');t=await p.innerText('main');console.log('review has deep btn:',t.includes('Học bài chi tiết'));
await p.locator('text=Học bài chi tiết').first().click();console.log('lesson from review:',(await p.innerText('main')).includes('Vì sao bạn hay sai'));
console.log('overflow',await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),errs);await b.close()})();
