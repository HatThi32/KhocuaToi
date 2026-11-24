/* ===== ĐĂNG NHẬP, ĐỒNG BỘ KẾT QUẢ, TRANG GIÁO VIÊN ===== */
const SY={url:'/*SYNCURL*/',user:LS.get('hsg.sy',null),adminOn:false,ap:'',dirty:false,timer:null,busy:false,status:'',tab:'login',err:'',info:'',list:null,sel:null,sort:{k:'t',d:-1},q:'',lop:'all'};
if(!/^https:\/\//.test(SY.url))SY.url='';
(function(){const st=document.createElement('style');st.textContent='.sy-box{max-width:460px;margin:30px auto}.sy-box label{display:block;font-weight:600;margin:12px 0 4px}.sy-box input,.sy-adm input,.sy-adm select,.sy-adm textarea{font:inherit;font-size:17px;width:100%;padding:9px 11px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--fg);box-sizing:border-box}.sy-tabs{display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap}.sy-err{color:var(--bad);font-weight:600;margin-top:10px}.sy-ok{color:var(--ok);font-weight:600;margin-top:10px}.sy-chip{display:flex;align-items:center;gap:8px;font-size:15px;color:var(--muted);flex-wrap:wrap}.sy-adm table{border-collapse:collapse;width:100%;font-size:16px}.sy-adm th,.sy-adm td{border-bottom:1px solid var(--line);padding:8px 10px;text-align:left}.sy-adm th{cursor:pointer;background:var(--surface2);white-space:nowrap}.sy-adm tr.sel td{background:var(--accent-soft)}.sy-adm tbody tr{cursor:pointer}.sy-kpi{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px;margin:12px 0}.sy-kpi div{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:10px 12px}.sy-kpi b{display:block;font-size:26px}.sy-low{color:var(--bad);font-weight:700}.sy-hi{color:var(--ok);font-weight:700}';document.head.append(st)})();
const lsKeep=()=>{try{return localStorage.getItem('hsg.sy')}catch(e){return null}};
function syPost(body,beacon){
 const s=JSON.stringify(body);
 if(beacon&&navigator.sendBeacon){try{if(navigator.sendBeacon(SY.url,new Blob([s],{type:'text/plain;charset=utf-8'})))return Promise.resolve({ok:true,beacon:true})}catch(e){}}
 return fetch(SY.url,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:s,keepalive:!!beacon}).then(r=>r.json())}
/* ---- tóm tắt kết quả để giáo viên thống kê ---- */
function syPct(c,n){return n?Math.round(100*c/n):0}
function sySummary(){
 let n=0,c=0;const topics={};for(const k in STAT.topic){const t=STAT.topic[k];n+=t.n;c+=t.c;topics[k]=[t.n,t.c]}
 const ex=STAT.exams.map(e=>[e.date,e.score,e.total]);
 const pcts=ex.map(e=>e[2]?100*e[1]/e[2]:0);const avg=pcts.length?Math.round(pcts.reduce((a,b)=>a+b,0)/pcts.length):null;
 const weak=Object.keys(STAT.tag).map(k=>[k,STAT.tag[k].n,STAT.tag[k].c]).filter(x=>x[1]>=2).sort((a,b)=>a[2]/a[1]-b[2]/b[1]).slice(0,6);
 return{n,c,ex:ex.length,avg,topics,exams:ex.slice(-12),weak,wrong:STAT.wrong.length,dk:STAT.dk||{},learned:Object.keys(LEARN.tags||{}).length,t:Date.now()}}
function syState(){return{stat:STAT,learn:LEARN,pf:PF}}
function syChip(){const el=document.getElementById('sychip');if(el)el.textContent=SY.status}
function syFlush(beacon){
 if(!SY.url||!SY.user||(!SY.dirty&&!beacon))return;if(SY.busy&&!beacon)return;
 clearTimeout(SY.timer);SY.timer=null;if(!SY.dirty)return;
 SY.busy=true;SY.status='Đang lưu…';syChip();
 const body={a:'save',u:SY.user.u,t:SY.user.t,state:syState(),sum:sySummary()};
 SY.dirty=false;
 syPost(body,beacon).then(r=>{SY.busy=false;if(r&&r.ok){SY.status='✓ Đã lưu '+new Date().toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}else{SY.dirty=true;SY.status='⚠ '+((r&&r.error)||'Chưa lưu được')}syChip()}).catch(()=>{SY.busy=false;SY.dirty=true;SY.status='⚠ Chưa lưu được, sẽ thử lại';syChip()})}
function syMark(ms){if(!SY.user)return;SY.dirty=true;SY.status='Chưa lưu…';syChip();clearTimeout(SY.timer);SY.timer=setTimeout(()=>syFlush(false),ms==null?1500:ms)}
if(SY.url){
 const _save=save;save=function(){_save();syMark(800)};
 const _saveL=saveL;saveL=function(){_saveL();syMark(800)};
 const _go=go;go=function(v){_go(v);syFlush(false)};
 const _cl=closeLesson;closeLesson=function(){_cl();syMark(0)};
 const _ep=endPr;endPr=function(){_ep();syMark(0)};
 window.addEventListener('pagehide',()=>syFlush(true));
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')syFlush(true)});
 setInterval(()=>{if(SY.dirty)syFlush(false)},30000);
}
function syLoadState(s){
 if(s&&s.stat){STAT=s.stat;if(!STAT.exams)STAT.exams=[];if(!STAT.topic)STAT.topic={};if(!STAT.tag)STAT.tag={};if(!STAT.wrong)STAT.wrong=[];LS.set('hsg.stat',STAT);if(s.learn){LEARN=s.learn;if(!LEARN.tags)LEARN={tags:{},log:[]};LS.set('hsg.learn',LEARN)}if(s.pf){PF=s.pf;LS.set('hsg.pf',PF)}}}
function syClearLocal(){STAT={topic:{},tag:{},wrong:[],exams:[]};LEARN={tags:{},log:[]};PF={topics:['web','python'],level:'all',type:'all'};['hsg.stat','hsg.learn','hsg.pf','hsg.sy'].forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});EX=null;PR=null}
function syLogout(){syFlush(true);const u=SY.user;SY.user=null;SY.dirty=false;setTimeout(()=>{syClearLocal();SY.tab='login';SY.err='';draw()},300)}
function syAuth(kind,f){
 SY.err='';SY.info='';SY.busy=true;draw();
 const body=kind==='login'?{a:'login',u:f.u,p:f.p}:{a:'register',u:f.u,p:f.p,name:f.name,lop:f.lop,code:f.code};
 syPost(body).then(r=>{SY.busy=false;
  if(!r||!r.ok){SY.err=(r&&r.error)||'Không kết nối được máy chủ';draw();return}
  SY.f={};SY.user={u:f.u.trim().toLowerCase(),t:r.token,name:r.name,lop:r.lop};LS.set('hsg.sy',SY.user);
  if(r.state)syLoadState(r.state);
  SY.dirty=true;syFlush(false);view='exam';draw()}).catch(()=>{SY.busy=false;SY.err='Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';draw()})}
function syGate(){
 SY.f=SY.f||{};const f=SY.f;const inp=(id,lab,type,ph)=>[h('label',{for:id,text:lab}),h('input',{id,type:type||'text',value:f[id]||'',placeholder:ph||'',autocomplete:id==='sp'||id==='sp2'?(SY.tab==='reg'?'new-password':'current-password'):'off',oninput:e=>{f[id]=e.target.value}})];
 const val=id=>{const e=document.getElementById(id);return e?e.value:(f[id]||'')};
 const tab=(k,t)=>h('button',{type:'button',class:'btn sm'+(SY.tab===k?'':' sec'),text:t,onclick:()=>{SY.tab=k;SY.err='';draw()}});
 let form;
 if(SY.tab==='login')form=[inp('su','Tên đăng nhập'),inp('sp','Mật khẩu','password'),h('div',{style:'margin-top:16px'},h('button',{class:'btn',type:'button',disabled:SY.busy||null,text:SY.busy?'Đang đăng nhập…':'Đăng nhập',onclick:()=>syAuth('login',{u:val('su'),p:val('sp')})}))];
 else if(SY.tab==='reg')form=[inp('sn','Họ và tên'),inp('sl','Lớp','text','Ví dụ: 11A1'),inp('su','Tên đăng nhập (chữ không dấu, số)','text','ví dụ: nguyenvana'),inp('sp','Mật khẩu (tối thiểu 6 ký tự)','password'),inp('sc','Mã đội tuyển (giáo viên cung cấp)'),h('div',{style:'margin-top:16px'},h('button',{class:'btn',type:'button',disabled:SY.busy||null,text:SY.busy?'Đang tạo…':'Tạo tài khoản',onclick:()=>syAuth('reg',{u:val('su'),p:val('sp'),name:val('sn'),lop:val('sl'),code:val('sc')})}))];
 else form=[h('p',{class:'note',text:'Dành cho giáo viên: xem thống kê quá trình học của cả đội tuyển.'}),inp('sa','Mật khẩu giáo viên','password'),h('div',{style:'margin-top:16px'},h('button',{class:'btn',type:'button',disabled:SY.busy||null,text:'Vào trang giáo viên',onclick:()=>{SY.ap=val('sa');SY.err='';SY.busy=true;draw();syAdmin('admin_list').then(r=>{SY.busy=false;if(r&&r.ok){SY.adminOn=true;SY.list=r.list;draw()}else{SY.err=(r&&r.error)||'Không kết nối được';draw()}})}}))];
 form=form.flat();
 return h('div',{class:'sy-box'},h('div',{class:'card'},h('h2',{text:'Luyện HSG Tin học'}),h('p',{class:'lead',text:'Đăng nhập để mọi bài học, đề thi thử và bài luyện của em được lưu lại và giáo viên theo dõi được tiến bộ.'}),h('div',{class:'sy-tabs'},tab('login','Đăng nhập'),tab('reg','Tạo tài khoản'),tab('adm','Giáo viên')),form,SY.err?h('div',{class:'sy-err',role:'alert',text:SY.err}):null))}
function syAdmin(a,extra){return syPost(Object.assign({a,ap:SY.ap},extra||{})).catch(()=>({ok:false,error:'Không kết nối được máy chủ'}))}
/* ---- trang giáo viên ---- */
const dayMs=864e5;
function syAgo(t){if(!t)return'Chưa vào';const d=Date.now()-t;if(d<6e4)return'Vừa xong';if(d<36e5)return Math.floor(d/6e4)+' phút trước';if(d<dayMs)return Math.floor(d/36e5)+' giờ trước';return Math.floor(d/dayMs)+' ngày trước'}
function syRows(){
 let L=(SY.list||[]).map(x=>{const s=x.sum||{};return{u:x.u,name:x.name,lop:x.lop,t:x.t,n:s.n||0,pc:s.n?syPct(s.c,s.n):-1,ex:s.ex||0,avg:s.avg==null?-1:s.avg,sum:s}});
 if(SY.lop!=='all')L=L.filter(x=>x.lop===SY.lop);if(SY.q)L=L.filter(x=>(x.name+x.u).toLowerCase().indexOf(SY.q.toLowerCase())>=0);
 const k=SY.sort.k,d=SY.sort.d;L.sort((a,b)=>(typeof a[k]==='string'?a[k].localeCompare(b[k],'vi'):a[k]-b[k])*d);return L}
function syCsv(L){
 const q=s=>'"'+String(s==null?'':s).replace(/"/g,'""')+'"';
 const head=['Tên đăng nhập','Họ tên','Lớp','Số câu đã làm','% đúng','Số đề thi thử','Điểm đề TB (%)','Hoạt động gần nhất'].concat(Object.keys(TOPIC).map(k=>'% đúng '+TOPIC[k]));
 const rows=L.map(x=>[x.u,x.name,x.lop,x.n,x.pc<0?'':x.pc,x.ex,x.avg<0?'':x.avg,x.t?new Date(x.t).toLocaleString('vi-VN'):''].concat(Object.keys(TOPIC).map(k=>{const t=(x.sum.topics||{})[k];return t?syPct(t[1],t[0]):''})));
 return '\ufeff'+[head].concat(rows).map(r=>r.map(q).join(',')).join('\r\n')}
function syDetail(x){
 const s=x.sum||{};const box=h('div',{class:'card',style:'margin-top:14px'});
 box.append(h('h3',{text:x.name+' ('+x.u+(x.lop?' · lớp '+x.lop:'')+')'}),h('p',{class:'note',text:'Hoạt động gần nhất: '+syAgo(x.t)+(x.t?' · '+new Date(x.t).toLocaleString('vi-VN'):'')}));
 if(!x.sum){box.append(h('p',{text:'Học sinh chưa có dữ liệu luyện tập.'}))}else{
  const tk=Object.keys(s.topics||{});
  box.append(h('h4',{text:'Tỉ lệ đúng theo chủ đề'}),h('div',{class:'bars'},tk.length?tk.map(k=>{const t=s.topics[k],r=syPct(t[1],t[0]);return h('div',{class:'brow'},h('span',{text:TOPIC[k]||k}),h('div',{class:'tr'},h('div',{class:'fl',style:'width:'+r+'%'})),h('span',{text:r+'% ('+t[1]+'/'+t[0]+')'}))}):h('p',{class:'note',text:'Chưa làm câu nào.'})));
  box.append(h('h4',{text:'Điểm các đề thi thử gần đây'}));
  box.append((s.exams&&s.exams.length)?h('div',{class:'tw'},h('table',{class:'t'},h('thead',null,h('tr',null,['Ngày','Điểm','Tối đa','%'].map(c=>h('th',{text:c})))),h('tbody',null,s.exams.slice().reverse().map(e=>h('tr',null,h('td',{text:e[0]}),h('td',{text:String(e[1])}),h('td',{text:String(e[2])}),h('td',{text:e[2]?Math.round(100*e[1]/e[2])+'%':'—'})))))):h('p',{class:'note',text:'Chưa thi thử.'}));
  box.append(h('h4',{text:'Dạng bài yếu nhất'}));
  box.append((s.weak&&s.weak.length)?h('ul',null,s.weak.map(w=>h('li',{text:w[0]+': đúng '+w[2]+'/'+w[1]+' ('+syPct(w[2],w[1])+'%)'}))):h('p',{class:'note',text:'Chưa đủ dữ liệu.'}));
  const dk=Object.keys(s.dk||{});box.append(h('p',{text:'Câu đang trong sổ lỗi: '+(s.wrong||0)+' · Dạng bài đã học: '+(s.learned||0)+(dk.length?' · Đã mở slide: '+dk.map(k=>k+'×'+s.dk[k]).join(', '):'')}))}
 const pw=h('input',{type:'text',placeholder:'Mật khẩu mới (≥ 6 ký tự)',style:'max-width:260px'});
 box.append(h('div',{class:'row',style:'gap:8px;flex-wrap:wrap;margin-top:12px'},pw,h('button',{class:'btn sec sm',type:'button',text:'Đặt lại mật khẩu',onclick:()=>{if(pw.value.length<6){SY.info='Mật khẩu mới tối thiểu 6 ký tự';draw();return}syAdmin('admin_reset',{u:x.u,p:pw.value}).then(r=>{SY.info=r.ok?'Đã đặt lại mật khẩu cho '+x.u:(r.error||'Lỗi');draw()})}}),h('button',{class:'btn sec sm',type:'button',text:SY.del===x.u?'Bấm lần nữa để XOÁ tài khoản':'Xoá tài khoản',onclick:()=>{if(SY.del!==x.u){SY.del=x.u;draw();return}syAdmin('admin_delete',{u:x.u}).then(r=>{SY.del=null;SY.sel=null;syReload()})}})));
 return box}
function syReload(){SY.busy=true;draw();syAdmin('admin_list').then(r=>{SY.busy=false;if(r.ok)SY.list=r.list;else SY.info=r.error;draw()})}
function syTeacher(){
 const L=syRows(),all=SY.list||[];const lops=Array.from(new Set(all.map(x=>x.lop).filter(Boolean))).sort();
 const act=all.filter(x=>x.t&&Date.now()-x.t<7*dayMs).length;
 const withN=L.filter(x=>x.n>0),avgPc=withN.length?Math.round(withN.reduce((a,x)=>a+x.pc,0)/withN.length):0;
 const withE=L.filter(x=>x.avg>=0),avgEx=withE.length?Math.round(withE.reduce((a,x)=>a+x.avg,0)/withE.length):0;
 const th=(k,t)=>h('th',{text:t+(SY.sort.k===k?(SY.sort.d>0?' ▲':' ▼'):''),onclick:()=>{SY.sort=SY.sort.k===k?{k,d:-SY.sort.d}:{k,d:k==='name'||k==='lop'?1:-1};draw()}});
 const lopSel=h('select',{style:'max-width:180px',onchange:e=>{SY.lop=e.target.value;draw()}},h('option',{value:'all',text:'Mọi lớp'}),lops.map(l=>h('option',{value:l,text:'Lớp '+l,selected:SY.lop===l||null})));
 const ta=h('textarea',{rows:4,placeholder:'Mỗi dòng một học sinh: tên đăng nhập, họ tên, lớp, mật khẩu\nvd: nguyenvana, Nguyễn Văn A, 11A1, 123456'});
 return h('div',null,
  h('header',null,h('div',{class:'bar'},h('div',{class:'brand'},'Luyện HSG Tin học',h('small',{text:'Trang giáo viên · thống kê quá trình rèn luyện'})),h('div',{class:'sy-chip'},h('button',{class:'btn sec sm',type:'button',text:'Làm mới',onclick:syReload}),h('button',{class:'btn sec sm',type:'button',text:'Thoát',onclick:()=>{SY.adminOn=false;SY.ap='';SY.list=null;SY.sel=null;draw()}})))),
  h('div',{class:'wrap sy-adm'},h('main',null,
   h('h2',{text:'Thống kê đội tuyển'}),
   SY.info?h('div',{class:'sy-ok',text:SY.info}):null,
   h('div',{class:'sy-kpi'},h('div',null,h('b',{text:String(all.length)}),'học sinh có tài khoản'),h('div',null,h('b',{text:String(act)}),'hoạt động trong 7 ngày'),h('div',null,h('b',{text:avgPc+'%'}),'đúng trung bình (luyện tập)'),h('div',null,h('b',{text:avgEx+'%'}),'điểm đề thi thử trung bình')),
   h('div',{class:'row',style:'gap:8px;flex-wrap:wrap;margin-bottom:10px'},h('input',{type:'search',placeholder:'Tìm theo tên…',style:'max-width:240px',value:SY.q,oninput:e=>{SY.q=e.target.value;clearTimeout(SY.qt);SY.qt=setTimeout(draw,250)}}),lopSel,h('button',{class:'btn sec sm',type:'button',text:'Tải bảng thống kê (CSV)',onclick:()=>{const b=new Blob([syCsv(L)],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='thong-ke-doi-tuyen.csv';document.body.append(a);a.click();a.remove()}})),
   h('div',{class:'tw'},h('table',null,h('thead',null,h('tr',null,th('name','Họ tên'),th('lop','Lớp'),th('n','Số câu'),th('pc','% đúng'),th('ex','Đề thi thử'),th('avg','Điểm đề TB'),th('t','Gần nhất'))),h('tbody',null,L.length?L.map(x=>h('tr',{class:SY.sel===x.u?'sel':'',onclick:()=>{SY.sel=SY.sel===x.u?null:x.u;SY.del=null;draw()}},h('td',{text:x.name}),h('td',{text:x.lop||'—'}),h('td',{text:String(x.n)}),h('td',{class:x.pc>=0&&x.pc<50?'sy-low':x.pc>=75?'sy-hi':'',text:x.pc<0?'—':x.pc+'%'}),h('td',{text:String(x.ex)}),h('td',{class:x.avg>=0&&x.avg<50?'sy-low':x.avg>=75?'sy-hi':'',text:x.avg<0?'—':x.avg+'%'}),h('td',{class:x.t&&Date.now()-x.t>7*dayMs?'sy-low':'',text:syAgo(x.t)}))):h('tr',null,h('td',{colspan:7,text:'Chưa có học sinh nào.'}))))),
   SY.sel?syDetail(L.find(x=>x.u===SY.sel)||all.find(x=>x.u===SY.sel)):null,
   h('div',{class:'card',style:'margin-top:18px'},h('h3',{text:'Thêm nhiều học sinh cùng lúc'}),h('p',{class:'note',text:'Dùng khi muốn tự tạo tài khoản cho các em (các em cũng có thể tự tạo bằng mã đội tuyển).'}),ta,h('div',{style:'margin-top:10px'},h('button',{class:'btn sm',type:'button',text:'Tạo tài khoản',onclick:()=>{const list=ta.value.split('\n').map(s=>s.split(',').map(x=>x.trim())).filter(a=>a[0]).map(a=>({u:a[0],name:a[1],lop:a[2],p:a[3]||'123456'}));if(!list.length)return;syAdmin('admin_add',{list}).then(r=>{SY.info=r.ok?'Đã xử lí '+r.done.length+' tài khoản':(r.error||'Lỗi');syReload()})}}))))))}
/* ---- ghép vào khung ứng dụng ---- */
if(SY.url){
 const _draw=draw;
 draw=function(){
  if(SY.adminOn){app.replaceChildren(syTeacher());return}
  if(!SY.user){app.replaceChildren(h('div',{class:'wrap'},syGate()));return}
  _draw();const bar=document.querySelector('header .bar');
  if(bar)bar.append(h('div',{class:'sy-chip'},h('span',{text:'👤 '+SY.user.name+(SY.user.lop?' · '+SY.user.lop:'')}),h('span',{id:'sychip',text:SY.status}),h('button',{class:'btn sec sm',type:'button',text:'Đăng xuất',onclick:syLogout})))}
}
