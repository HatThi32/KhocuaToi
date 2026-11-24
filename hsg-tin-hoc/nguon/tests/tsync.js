const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:1100,height:800}});
const DB={users:{},kq:{}};const log=[];
await ctx.route('https://script.google.com/**',async route=>{const r=route.request();const q=JSON.parse(r.postData()||'{}');log.push(q.a);let out={ok:false,error:'?'};
 if(q.a==='register'){if(q.code!=='HSG2027')out={ok:false,error:'Mã đội tuyển không đúng'};else if(DB.users[q.u])out={ok:false,error:'Tên đăng nhập đã có'};else{DB.users[q.u]={p:q.p,name:q.name,lop:q.lop};out={ok:true,token:'T'+q.u,name:q.name,lop:q.lop,state:null}}}
 else if(q.a==='login'){const u=DB.users[q.u];out=u&&u.p===q.p?{ok:true,token:'T'+q.u,name:u.name,lop:u.lop,state:DB.kq[q.u]?DB.kq[q.u].state:null}:{ok:false,error:'Sai tên đăng nhập hoặc mật khẩu'}}
 else if(q.a==='save'){DB.kq[q.u]={state:q.state,sum:q.sum,t:Date.now()};out={ok:true}}
 else if(q.a==='admin_list'){out=q.ap==='gv'?{ok:true,list:Object.keys(DB.users).map(u=>({u,name:DB.users[u].name,lop:DB.users[u].lop,t:DB.kq[u]?DB.kq[u].t:0,sum:DB.kq[u]?DB.kq[u].sum:null}))}:{ok:false,error:'Mật khẩu giáo viên không đúng'}}
 await route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(out)})});
const errs=[];const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+require('path').resolve(__dirname,'..','..','index.html')+'');
console.log('gate:',await p.locator('.sy-box').count());
await p.getByRole('button',{name:'Tạo tài khoản'}).first().click();
await p.fill('#sn','Nguyễn Văn A');await p.fill('#sl','11A1');await p.fill('#su','vana');await p.fill('#sp','abcdef');await p.fill('#sc','SAI');
await p.getByRole('button',{name:'Tạo tài khoản'}).last().click();await p.waitForTimeout(300);
console.log('err:',await p.locator('.sy-err').innerText());
await p.fill('#sc','HSG2027');await p.getByRole('button',{name:'Tạo tài khoản'}).last().click();await p.waitForTimeout(500);
console.log('app header chip:',await p.locator('.sy-chip').first().innerText());
// luyện: làm 1 câu
await p.getByRole('button',{name:'Luyện theo chủ đề'}).first().click();
await p.getByRole('button',{name:'Bắt đầu luyện'}).click();await p.waitForTimeout(300);
await p.screenshot({path:'/tmp/s1.png'});
for(let i=0;i<4;i++)await p.getByRole('button',{name:'Đúng',exact:true}).nth(i).click({force:true});await p.getByRole('button',{name:'Kiểm tra',exact:true}).click();await p.waitForTimeout(2500);await p.screenshot({path:'/tmp/s2.png'});
console.log('saved:',JSON.stringify(DB.kq),log.join(','));console.log('LS stat',await p.evaluate(()=>localStorage.getItem('hsg.stat')));
// đóng trang
await p.evaluate(()=>{window.dispatchEvent(new Event('pagehide'))});await p.waitForTimeout(300);
// đăng nhập lại ở trang mới (thiết bị khác)
const p2=await ctx.newPage();p2.on('pageerror',e=>errs.push(e.message));await p2.goto('file://'+require('path').resolve(__dirname,'..','..','index.html')+'');
await p2.evaluate(()=>localStorage.clear());await p2.reload();
await p2.fill('#su','vana');await p2.fill('#sp','abcdef');await p2.getByRole('button',{name:'Đăng nhập'}).last().click();await p2.waitForTimeout(600);
console.log('restored n:',await p2.evaluate(()=>{const s=JSON.parse(localStorage.getItem('hsg.stat')||'{}');return Object.values(s.topic||{}).reduce((a,t)=>a+t.n,0)}));
// giáo viên
const p3=await ctx.newPage();p3.on('pageerror',e=>errs.push(e.message));await p3.goto('file://'+require('path').resolve(__dirname,'..','..','index.html')+'');await p3.evaluate(()=>localStorage.clear());await p3.reload();
await p3.getByRole('button',{name:'Giáo viên'}).click();await p3.fill('#sa','gv');await p3.getByRole('button',{name:'Vào trang giáo viên'}).click();await p3.waitForTimeout(500);
console.log('teacher rows:',await p3.locator('.sy-adm tbody tr').count(),'|',await p3.locator('.sy-adm tbody tr').first().innerText());
await p3.locator('.sy-adm tbody tr').first().click();await p3.waitForTimeout(200);await p3.screenshot({path:'/tmp/s3.png',fullPage:true});
console.log('errs',errs);await b.close()})()
