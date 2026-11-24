/* Liên kết bài giảng Canva theo mã bài */
const base='https://hatthi32.github.io/KhocuaToi/hsg-tin-hoc/bai/';const DECK={a1:[['AI 1: Khái niệm, ứng dụng, đạo đức',base+'a1.html']],a2:[['AI 2: Học máy cơ bản',base+'a2.html']],a3:[['AI 3: Đánh giá mô hình, quá khớp',base+'a3.html']],a4:[['AI 4: Khoa học dữ liệu và mô phỏng',base+'a4.html']],n1:[['Nghề 1: Nghề nghiệp trong ngành CNTT',base+'n1.html']],n2:[['Nghề 2: Đạo đức, pháp luật, bản quyền',base+'n2.html']],m1:[['Mạng 1: Thiết bị và cấu trúc mạng',base+'m1.html']],m2:[['Mạng 2: Giao thức và dịch vụ mạng',base+'m2.html']],m3:[['Mạng 3: Địa chỉ IP và mạng con',base+'m3.html']],m4:[['Mạng 4: Chia sẻ tài nguyên và an toàn mạng',base+'m4.html']],c1:[['CSDL 1: Cơ sở dữ liệu và hệ quản trị CSDL',base+'c1.html']],c2:[['CSDL 2: Khoá, ràng buộc, kiểu dữ liệu',base+'c2.html']],c3:[['CSDL 3: SQL truy vấn và nhóm',base+'c3.html']],c4:[['CSDL 4: SQL liên kết bảng và truy vấn con',base+'c4.html']],c5:[['CSDL 5: An toàn và phân quyền CSDL',base+'c5.html']],p1:[['Python 1A: Chương trình, biến và kiểu dữ liệu',base+'p1a.html'],['Python 1B: Toán tử và biểu thức',base+'p1b.html'],['Python 1C: Nhập xuất và giải bài toán đơn giản',base+'p1c.html']],p2:[['Python 2A: Cấu trúc rẽ nhánh',base+'p2a.html'],['Python 2B: Vòng lặp for và range',base+'p2b.html']],p3:[['Python 3: Xâu, danh sách, ma trận',base+'p3.html']],p4:[['Python 4: Hàm, phạm vi biến, ngoại lệ, kiểm thử',base+'p4.html']],p5:[['Python 5: Độ phức tạp thuật toán',base+'p5.html']],p6:[['Python 6: Tìm kiếm và sắp xếp',base+'p6.html']],p7:[['Python 7: Đệ quy và chia để trị',base+'p7.html']],p8:[['Python 8: Ngăn xếp và hàng đợi',base+'p8.html']],w2:[['Bài 9: Danh sách và bảng',base+'w1-b9.html'],['Bài 12: Tạo biểu mẫu',base+'w2-b12.html']],w3:[['Bài 13: Khái niệm, vai trò của CSS',base+'w3-b13.html'],['Bài 14: Định dạng văn bản bằng CSS',base+'w3-b14.html'],['Bài 15: Màu chữ, màu nền, bộ chọn tổ hợp',base+'w4-b15.html']],w4:[['Bài 17: Các mức ưu tiên của bộ chọn',base+'w5-b17.html']],w5:[['Bài 16: Định dạng khung, class, id',base+'w5-b16.html']],w6:[['Bài 18: Thực hành tổng hợp thiết kế web',base+'w6-b18.html']],w1:[['Toàn bộ bài (54 slide)','https://hatthi32.github.io/KhocuaToi/hsg-tin-hoc/bai/w1.html'],['Nền: Web, URL, trình duyệt','https://hatthi32.github.io/KhocuaToi/hsg-tin-hoc/bai/w1-nen.html'],['Bài 7: Trang web và HTML','https://hatthi32.github.io/KhocuaToi/hsg-tin-hoc/bai/w1-b7.html'],['Bài 8: Định dạng văn bản','https://hatthi32.github.io/KhocuaToi/hsg-tin-hoc/bai/w1-b8.html'],['Bài 9: Danh sách và bảng','https://hatthi32.github.io/KhocuaToi/hsg-tin-hoc/bai/w1-b9.html'],['Bài 10: Tạo liên kết','https://hatthi32.github.io/KhocuaToi/hsg-tin-hoc/bai/w1-b10.html'],['Bài 11: Ảnh, âm thanh, video, iframe','https://hatthi32.github.io/KhocuaToi/hsg-tin-hoc/bai/w1-b11.html'],['Ôn tập HSG Bài 7–11','https://hatthi32.github.io/KhocuaToi/hsg-tin-hoc/bai/w1-hsg.html']]};
const CANVA={w2:'https://canva.link/qd54uhmu0ugxy0j',w3:'https://canva.link/2zohrw3mep9m7sb',w4:'https://canva.link/64oj985vrmyxzei',w5:'https://canva.link/s0mrvywbw2cq1y8',w6:'https://canva.link/3fmb0kdzaoai8pu',p2:'https://canva.link/hvcwl669b1f7c29',p3:'https://canva.link/5utkig0m1ztbfq6',p4:'https://canva.link/nk49u4e9bqre93k',p5:'https://canva.link/cmwscx2ff1ma4qp',p6:'https://canva.link/4ruykvgu288j3zs',p7:'https://canva.link/xsdmpml41beal8x',p8:'https://canva.link/ozqwus2rxgicwuz',c1:'https://canva.link/i8qdqy7y1j2607j',c2:'https://canva.link/7lbqco5m3qqc2ga',c3:'https://canva.link/q126u86t1vp4mx8',c4:'https://canva.link/0padvb34g9n0rag',c5:'https://canva.link/o40nlaje6m0awxd',m1:'https://canva.link/lhvxv8lnk2telhy',m2:'https://canva.link/o4iloisjgch7g76',m4:'https://canva.link/afnfp848qfla2py',a1:'https://canva.link/88kle9pg3ejfnms',a3:'https://canva.link/g40vmxw4xdah11q',a4:'https://canva.link/0p599ve7qr7prj0',n1:'https://canva.link/d9fmcl2damutxfe',n2:'https://canva.link/yigl7xguu7muz9n',p1:'https://canva.link/h0xftjrxhzdo365',m3:'https://canva.link/rxsonk5w08h3n8i',a2:'https://canva.link/9g0jxr8q9kyj45p'};
/* ---------- HỌC THEO CHỦ ĐỀ ---------- */
let UNI=null;
function LU(){if(!LEARN.u)LEARN.u={};return LEARN.u}
function uState(id){const x=LU()[id];if(!x)return{k:'new',t:'Chưa học'};if(x.level==='good')return{k:'good',t:'Đã nắm'};if(x.level==='mid')return{k:'mid',t:'Hiểu một phần'};if(x.level==='weak')return{k:'weak',t:'Cần học lại'};return{k:'new',t:'Đang học'}}
function openUnit(id){UNI={id,page:0,quiz:null,saved:false,chk:(LU()[id]&&LU()[id].chk)||[]};draw();window.scrollTo(0,0)}
function closeUnit(){UNI=null;draw();window.scrollTo(0,0)}
function unitPages(id){const u=UNITS.u[id],p=[{k:'intro'}];u.secs.forEach(s=>p.push({k:'sec',s}));p.push({k:'quiz'},{k:'done'});return p}
function unitQuiz(id){const tags=UNITS.u[id].tags;let pool=Q.filter(q=>q.type==='mcq'&&!q.ext&&q.tags.some(t=>tags.indexOf(t)>=0));
 pool=shuffle(pool,Math.random);const out=[],cl={};
 for(const lv of [1,2,3,2,3]){const q=pool.find(x=>!cl[x.cl]&&out.indexOf(x)<0&&x.level===lv);if(q){cl[q.cl]=1;out.push(q)}}
 for(const q of pool){if(out.length>=5)break;if(cl[q.cl]||out.indexOf(q)>=0)continue;cl[q.cl]=1;out.push(q)}
 return out.sort((a,b)=>a.level-b.level)}
function liveEl(o){const d=h('div',{class:'live'});const r=d.attachShadow?d.attachShadow({mode:'open'}):null;
 if(r)r.innerHTML='<style>:host{display:block;padding:10px;font:16px system-ui,sans-serif;color:#222;background:#fff;border-radius:8px}'+o.css+'</style>'+o.body;else d.innerHTML=o.body;return d}
function resTable(r){const t=h('table',{class:'rt'});t.append(h('thead',null,h('tr',null,r.cols.map(c=>h('th',{text:c})))));t.append(h('tbody',null,r.rows.map(x=>h('tr',null,x.map(v=>h('td',{text:String(v)}))))));return h('div',{class:'tscroll'},t)}
function vLearn(){
 const root=h('div',{class:'lv'});const all=UNITS.order;const done=all.filter(i=>uState(i).k==='good').length;
 root.append(h('h2',{text:'Học theo chủ đề'}),h('p',{class:'note',text:'Mỗi bài có mục tiêu, lý thuyết ngắn gọn, ví dụ có kết quả chạy thật, sơ đồ và bài kiểm tra cuối bài. Đã nắm '+done+'/'+all.length+' bài.'}));
 UNITS.top.forEach(([k,name,ic])=>{const ids=all.filter(i=>UNITS.u[i].topic===k);const dn=ids.filter(i=>uState(i).k==='good').length;
  const card=h('div',{class:'card'},h('div',{class:'row',style:'justify-content:space-between;gap:8px'},h('h3',{text:ic+' '+name}),h('span',{class:'note',text:dn+'/'+ids.length+' bài'})),h('div',{class:'lvbar','aria-hidden':'true',style:'margin:6px 0 8px'},ids.map(i=>h('i',{class:uState(i).k==='good'?'d':''}))));
  ids.forEach((i,n)=>{const u=UNITS.u[i],st=uState(i),col={good:'ok',mid:'warn',weak:'bad',new:'muted'}[st.k];const L=LU()[i];
   card.append(h('div',{class:'lrow'},h('div',{style:'min-width:0'},h('b',{text:u.t}),h('div',{class:'note',text:u.min+' phút · '+u.secs.length+' phần'+(L&&L.quiz&&L.quiz.length?' · kiểm tra gần nhất '+L.quiz[L.quiz.length-1].c+'/'+L.quiz[L.quiz.length-1].n:'')})),
    h('div',{class:'row',style:'gap:8px'},h('span',{class:'chip',style:'color:var(--'+col+')',text:st.t}),h('button',{class:'btn'+(L?' sec':'')+' sm',type:'button',text:L?'Học lại':'Học',onclick:()=>openUnit(i)}))))});
  root.append(card)});
 return root}
function vUnit(){
 const id=UNI.id,u=UNITS.u[id],pages=unitPages(id),pg=pages[UNI.page];
 const root=h('div',{class:'lv'});
 root.append(h('div',{class:'row',style:'justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px'},h('button',{class:'btn sec sm',type:'button',text:'‹ Danh sách bài học',onclick:closeUnit}),h('span',{class:'note',text:'Bước '+(UNI.page+1)+'/'+pages.length})));
 root.append(h('div',{class:'lvbar','aria-hidden':'true'},pages.map((p,i)=>h('i',{class:i<UNI.page?'d':i===UNI.page?'c':''}))));
 root.append(h('h2',{text:u.t,style:'margin:10px 0 12px'}));
 const card=h('div',{class:'card'});
 if(pg.k==='intro'){
  if(DECK[id]){card.append(h('p',{class:'lab',text:'📽 Bài giảng chuyên sâu (slide) theo từng bài SGK'}));DECK[id].forEach(d=>card.append(h('a',{class:'btn'+(d[1].endsWith('w1.html')?' sec':''),href:d[1],onclick:()=>{STAT.dk=STAT.dk||{};STAT.dk[id]=(STAT.dk[id]||0)+1;save()},target:'_blank',rel:'noopener',style:'display:inline-block;margin:0 8px 8px 0;text-decoration:none',text:d[0]})))}
  if(CANVA[id])card.append(h('a',{class:'btn',href:CANVA[id],target:'_blank',rel:'noopener',style:'display:inline-block;margin-bottom:10px;text-decoration:none',text:'🎨 Bản Canva (tóm tắt)'}));
  card.append(h('p',{class:'lab',text:'Mục tiêu bài học ('+u.min+' phút)'}),h('ul',{style:'margin:0 0 10px;padding-left:20px'},u.goals.map(g=>h('li',{text:g}))),
   h('p',{class:'lab',text:'Nội dung'}),h('ol',{style:'margin:0 0 8px;padding-left:20px'},u.secs.map(s=>h('li',{text:s.h})),h('li',{text:'Kiểm tra cuối bài (5 câu)'})))}
 else if(pg.k==='sec'){const s=pg.s;
  card.append(h('h3',{text:s.h,style:'margin-bottom:8px'}));
  if(s.hard)card.append(h('p',{class:'lab',style:'color:var(--warn)',text:'Kiến thức khó, đọc kĩ'}));
  s.p.forEach(t=>card.append(h('p',{text:t})));
  if(s.key)card.append(h('div',{class:'tip'},h('b',{text:'Cần nhớ: '}),s.key));
  if(s.fig)card.append(figEl(s.fig),h('p',{class:'fighint',text:'↔ Vuốt ngang để xem hết sơ đồ'}));
  if(s.code){card.append(h('pre',{class:'code',text:s.code}));if(s.out!=null)card.append(h('p',{class:'note',text:'Kết quả khi chạy:'}),h('pre',{class:'code out',text:s.out}))}
  if(s.sql){card.append(h('pre',{class:'code',text:s.sql.q}),h('p',{class:'note',text:'Kết quả khi chạy trên bảng KhachHang, DonHang (ví dụ):'}),resTable(s.sql.res))}
  if(s.cmp)card.append(h('p',{class:'lab',text:s.cmp.t}),resTable({cols:s.cmp.cols,rows:s.cmp.rows}));
  if(s.html){card.append(h('p',{class:'note',text:'Ví dụ trực quan:'}),h('pre',{class:'code',text:(s.html.css?'<style>\n'+s.html.css.replace(/\}/g,'}\n').trim()+'\n</style>\n':'')+s.html.body}),h('p',{class:'note',text:'Kết quả hiển thị:'}),liveEl(s.html))}
  if(s.ex&&s.ex.length){const bx=h('div',{class:'exbox'},h('p',{class:'lab',text:'Bài tập nhanh'}));s.ex.forEach((e,i)=>bx.append(h('div',{class:'exq'},h('p',{text:(i+1)+'. '+e[0]}),h('details',null,h('summary',{text:'Xem đáp án'}),h('p',{class:'exa',text:e[1]})))));card.append(bx)}}
 else if(pg.k==='quiz'){
  if(!UNI.quiz){UNI.quiz={qs:unitQuiz(id),i:0,st:{},counted:{},ok:0,n:0}}
  const Z=UNI.quiz;
  if(!Z.qs.length)card.append(h('p',{text:'Bài này chưa có câu kiểm tra riêng. Hãy làm đề thi thử để kiểm chứng.'}));
  else{const q=Z.qs[Z.i];const st=Z.st[q.id]=Z.st[q.id]||{};
   card.append(h('p',{class:'lab',text:'Kiểm tra cuối bài: câu '+(Z.i+1)+'/'+Z.qs.length}),renderQ(q,st,{n:Z.i+1,reveal:st.reveal,onChange:draw}));
   const row=h('div',{class:'row',style:'margin-top:8px'});
   if(!st.reveal)row.append(h('button',{class:'btn',type:'button',disabled:st.sel==null,text:'Kiểm tra',onclick:()=>{st.reveal=true;const ok=mcqOk(q,st);if(!Z.counted[q.id]){Z.counted[q.id]=1;Z.n++;if(ok)Z.ok++;QUIZMODE=true;try{record(q,ok)}finally{QUIZMODE=false}}draw()}}));
   else row.append(h('button',{class:'btn',type:'button',text:Z.i<Z.qs.length-1?'Câu tiếp':'Xem kết quả',onclick:()=>{if(Z.i<Z.qs.length-1)Z.i++;else UNI.page++;draw();window.scrollTo(0,0)}}));
   card.append(row)}}
 else{
  const Z=UNI.quiz||{ok:0,n:0};const lv=levelOf(Z.ok,Z.n);
  if(!UNI.saved){UNI.saved=true;const L=LU()[id]=LU()[id]||{times:0,quiz:[]};L.times++;if(Z.n){L.quiz.push({d:Date.now(),c:Z.ok,n:Z.n});L.level=lv.k}else L.level=L.level||'mid';L.last=Date.now();saveL()}
  card.append(h('p',{class:'lab',text:'Kết quả kiểm tra'}),h('div',{class:'score',text:Z.n?Z.ok+'/'+Z.n:'—'}),h('span',{class:'chip',style:'color:var(--'+(lv.k==='good'?'ok':lv.k==='mid'?'warn':'bad')+')',text:Z.n?lv.t:'Chưa có câu kiểm tra'}),
   h('p',{class:'lab',style:'margin-top:12px',text:'Tự đánh giá mục tiêu'}));
  u.goals.forEach((g,i)=>{const id2='ck'+i;card.append(h('label',{class:'ck'},h('input',{type:'checkbox',checked:!!UNI.chk[i],onchange:e=>{UNI.chk[i]=e.target.checked;LU()[id].chk=UNI.chk.slice();saveL()}}),' '+g))});
  card.append(h('p',{style:'margin-top:10px',text:lv.k==='good'?'Bạn đã nắm bài này. Sang bài tiếp theo hoặc làm đề thi thử.':lv.k==='mid'?'Đọc lại phần "Kiến thức khó" rồi kiểm tra lại.':'Hãy học lại chậm từng phần, chú ý sơ đồ và kết quả chạy.'}));
  const acts=h('div',{class:'row',style:'gap:8px;flex-wrap:wrap;margin-top:8px'});
  const ord=UNITS.order,nx=ord[ord.indexOf(id)+1];
  if(nx)acts.append(h('button',{class:'btn',type:'button',text:'Bài tiếp: '+UNITS.u[nx].t,onclick:()=>openUnit(nx)}));
  acts.append(h('button',{class:'btn sec',type:'button',text:'Học lại',onclick:()=>openUnit(id)}),h('button',{class:'btn sec',type:'button',text:'Về danh sách',onclick:closeUnit}));
  card.append(acts)}
 root.append(card);
 if(pg.k!=='done'&&pg.k!=='quiz'||(pg.k==='quiz'&&UNI.quiz&&!UNI.quiz.qs.length)){
  const nav=h('div',{class:'row',style:'justify-content:space-between;gap:8px'});
  nav.append(h('button',{class:'btn sec',type:'button',disabled:UNI.page===0,text:'‹ Trước',onclick:()=>{UNI.page--;draw();window.scrollTo(0,0)}}),h('button',{class:'btn',type:'button',text:pages[UNI.page+1]&&pages[UNI.page+1].k==='quiz'?'Làm bài kiểm tra ›':'Tiếp ›',onclick:()=>{UNI.page++;draw();window.scrollTo(0,0)}}));
  root.append(nav)}
 return root}
