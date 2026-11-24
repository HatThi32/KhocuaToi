const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:400,height:850}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'..','..','index.html')+'');
const tags=['css-uutien','css-box','S4','de-quy','mang-ip','ml-danhgia','sql-join','tim-kiem'];
const stat={topic:{},tag:{},wrong:[],exams:[],hh:{}};tags.forEach(t=>{stat.tag[t]={n:5,c:1};stat.hh[t]=[0,0,1,0,0]});
await p.evaluate(s=>{localStorage.setItem('hsg.stat',JSON.stringify(s))},stat);await p.reload();
await p.click('nav >> text=Ôn tập theo lỗi sai');
const n=await p.locator('text=Học bài chi tiết').count();console.log('cards',n);
let shot=0;
for(let i=0;i<n;i++){
  await p.locator('text=Học bài chi tiết').nth(i).click();
  const title=await p.locator('.lv h2').innerText();
  // step through; screenshot first page with svg
  for(let k=0;k<10;k++){
    if(await p.locator('.figbox').count()){await p.locator('.card').first().screenshot({path:'fig_'+i+'.png'});break}
    const nxt=p.locator('button:text-is("Tiếp ›")');if(!(await nxt.count()))break;await nxt.click()}
  console.log(i,title);
  await p.click('text=Về ôn tập');}
console.log('overflow',await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),errs);await b.close()})();
