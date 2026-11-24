// Kiểm tra màn hình xem lại bài: câu sai phải có phần phân tích chi tiết
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'..','..','index.html'));
await p.click('nav >> text=Đề thi thử');await p.fill('input[type=number] >> nth=0','3');await p.click('text=Bắt đầu làm bài');
const n=await p.locator('.qnav button').count();
for(let i=0;i<n;i++){await p.locator('.qnav button').nth(i).click();const o=p.locator('.opt');if(await o.count())await o.nth(0).click()}
await p.locator('.qnav button').last().click();await p.click('button:text-is("Nộp bài")');if(await p.locator('text=Nộp bài luôn').count())await p.click('text=Nộp bài luôn');
await p.click('text=Xem lời giải từng câu');
const t=await p.innerText('main');
console.log('có phân tích chi tiết:',t.includes('PHÂN TÍCH CHI TIẾT')||t.includes('Phân tích chi tiết'),'| có vì sao từng phương án:',t.includes('Vì sao từng phương án'),'| nhóm câu sai:',/Các câu cần xem kĩ/.test(t),'| nút luyện:',t.includes('Luyện 5 câu cùng dạng'));
console.log('trace:',t.includes('Theo dõi từng bước'),'| res sql:',t.includes('Kết quả khi chạy thật'));
await p.locator('.ana').nth(2).screenshot({path:'/tmp/review.png'});
console.log(errs);await b.close()})();
