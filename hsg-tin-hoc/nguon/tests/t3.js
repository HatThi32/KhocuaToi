const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'..','..','index.html')+'');
await p.click('nav >> text=Đề thi thử');await p.fill('input[type=number] >> nth=0','3');await p.click('text=Bắt đầu làm bài');
const n=await p.locator('.qnav button').count();
for(let i=0;i<n;i++){await p.locator('.qnav button').nth(i).click();const o=p.locator('.opt');if(await o.count())await o.nth(0).click()}
await p.locator('.qnav button').last().click();await p.click('button:text-is("Nộp bài")');if(await p.locator('text=Nộp bài luôn').count())await p.click('text=Nộp bài luôn');
await p.locator('text=Học ngay').first().click();
for(let k=0;k<12;k++){if(await p.locator('button:text-is("Kiểm tra")').count()||await p.locator('.opt').count())break;const nx=p.locator('button:text-is("Tiếp ›"), button:text-is("Làm bài kiểm tra ›")');if(!(await nx.count()))break;await nx.first().click()}
for(let q=0;q<4;q++){if(!(await p.locator('.opt').count()))break;await p.locator('.opt').nth(0).click();await p.click('button:text-is("Kiểm tra")');await p.locator('button:text-is("Câu tiếp"), button:text-is("Xem kết quả")').first().click()}
console.log((await p.innerText('main')).slice(0,300));await p.click('text=Luyện thêm 5 câu');console.log('practice:',(await p.innerText('main')).includes('Luyện tập: câu 1'));
await p.click('text=Dừng luyện tập');console.log('back to exam result:',(await p.innerText('main')).includes('Học lại ngay phần bạn đang hổng'));
await p.screenshot({path:'s_desktop.png'});
console.log(errs);await b.close()})();
