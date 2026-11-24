/* ---------- BÀI HỌC CHI TIẾT SAU KẾT QUẢ ---------- */
let LSN=null,QUIZMODE=false;
function LG(){if(!LEARN.g)LEARN.g={};return LEARN.g}
function gidOf(t){return DEEPMAP[t]||t}
function gtags(g){return DEEP[g]?DEEP[g].tags:[g]}
function gname(g){return DEEP[g]?DEEP[g].t:tagName(g)}
function hasLesson(g){return !!DEEP[g]||gtags(g).some(t=>LESSONS[t])||!!LESSONS[g]}
function noteAfter(q,ok){if(QUIZMODE)return;const seen={};q.tags.forEach(t=>{const g=gidOf(t);if(seen[g])return;seen[g]=1;const L=LG()[g];if(L&&L.base){L.after=L.after||[];L.after.push(ok?1:0);if(L.after.length>40)L.after.shift()}});saveL()}
function examGroups(){const m={};EX.qs.forEach(q=>{const ok=q.type==='mcq'?mcqOk(q,EX.st[q.id]):tfCount(q,EX.st[q.id])>=3;new Set(q.tags.map(gidOf)).forEach(g=>{const x=m[g]=m[g]||{g,n:0,w:0};x.n++;if(!ok)x.w++})});return Object.values(m).filter(x=>x.w>0&&hasLesson(x.g)).sort((a,b)=>b.w-a.w||(b.w/b.n)-(a.w/a.n))}
function groupAcc(g){let n=0,c=0;gtags(g).forEach(t=>{const s=tagStat(t);if(s.n){n+=s.n;c+=s.c}});return n?Math.round(100*c/n):null}
function drillGroup(g){const tg=gtags(g);const own=Q.filter(q=>q.tags.some(t=>tg.indexOf(t)>=0)&&!q.ext&&q.type!=='open');const w=own.filter(q=>STAT.wrong.indexOf(q.id)>=0);const r=own.filter(q=>STAT.wrong.indexOf(q.id)<0).sort((a,b)=>a.level-b.level);return shuffle(w,Math.random).concat(shuffle(r.slice(0,12),Math.random)).slice(0,5).map(q=>q.id)}
function openLesson(g,from,ex){LSN={g,from:from||'review',page:0,quiz:null,saved:false,ex:ex||null};draw();window.scrollTo(0,0)}
function closeLesson(){LSN=null;draw();window.scrollTo(0,0)}
function levelOf(c,n){const r=n?c/n:0;return r>=.75?{k:'good',t:'Đã hiểu'}:r>=.5?{k:'mid',t:'Hiểu một phần'}:{k:'weak',t:'Chưa vững'}}
function figEl(k){const d=h('div',{class:'figbox'});d.innerHTML=FIGS[k]||(typeof UFIGS!=='undefined'&&UFIGS[k])||'';return d}
function lessonPages(g){const D=DEEP[g],p=[];if(D){p.push({k:'intro'});D.steps.forEach(s=>p.push({k:'step',s}));p.push({k:'traps'})}else p.push({k:'compact'});p.push({k:'quiz'});p.push({k:'done'});return p}
function quizPick(g){const tags=gtags(g);const exIds=new Set(((LSN&&LSN.ex?LSN.ex.qs:EX&&EX.qs)||[]).map(q=>q.id));
 let pool=Q.filter(q=>q.type==='mcq'&&!q.ext&&q.tags.some(t=>tags.indexOf(t)>=0));
 const fresh=pool.filter(q=>!exIds.has(q.id));if(fresh.length>=3)pool=fresh;
 pool=shuffle(pool,Math.random).sort((a,b)=>a.level-b.level);
 const out=[],cl={};for(const q of pool){if(cl[q.cl])continue;cl[q.cl]=1;out.push(q);if(out.length>=4)break}
 return out}
function exWrongOf(g){if(!EX||!EX.done)return[];return EX.qs.filter(q=>q.type==='mcq'&&!mcqOk(q,EX.st[q.id])&&q.tags.some(t=>gidOf(t)===g)).slice(0,2)}
function vLesson(){
 const g=LSN.g,D=DEEP[g],pages=lessonPages(g),pg=pages[LSN.page],last=pages.length-1;
 const root=h('div',{class:'lv'});
 root.append(h('div',{class:'row',style:'justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px'},
  h('button',{class:'btn sec sm',type:'button',text:LSN.from==='exam'?'‹ Về kết quả đề thi':'‹ Về ôn tập',onclick:closeLesson}),
  h('span',{class:'note',text:'Bước '+(LSN.page+1)+'/'+pages.length})));
 root.append(h('div',{class:'lvbar','aria-hidden':'true'},pages.map((p,i)=>h('i',{class:i<LSN.page?'d':i===LSN.page?'c':''}))));
 root.append(h('h2',{text:gname(g),style:'margin:10px 0 12px'}));
 const card=h('div',{class:'card'});
 if(pg.k==='intro'){
  card.append(h('p',{class:'lab',text:'Vì sao bạn hay sai ở phần này?'}),h('p',{text:D.intro}),
   h('p',{class:'lab',text:'Trong bài này ('+D.min+' phút)'}),h('ol',{style:'margin:0 0 8px;padding-left:20px'},D.steps.map(s=>h('li',{text:s.h})),h('li',{text:'Sai lầm thường gặp và mẹo nhớ'}),h('li',{text:'Kiểm tra hiểu bài ngay (4 câu)'})));
  const wr=exWrongOf(g);if(wr.length){card.append(h('p',{class:'lab',text:'Câu bạn vừa làm sai ở phần này'}));wr.forEach(q=>card.append(h('div',{class:'wrongq'},h('div',{text:(q.stem||'').slice(0,220)+((q.stem||'').length>220?'…':'')}),h('div',{class:'note',text:'Đáp án đúng: '+(q.options?q.options[q.key]:'')}),q.why?h('div',{class:'note',text:'Vì sao: '+q.why.slice(0,260)}):null)))}}
 else if(pg.k==='step'){
  const s=pg.s;card.append(h('h3',{text:s.h,style:'margin-bottom:8px'}));
  s.p.forEach(t=>card.append(h('p',{text:t})));
  if(s.fig)card.append(figEl(s.fig),h('p',{class:'fighint',text:'↔ Vuốt ngang để xem hết sơ đồ'}));
  if(s.code){card.append(h('pre',{class:'code',text:s.code}));if(s.out!=null)card.append(h('p',{class:'note',text:'Kết quả khi chạy: '+s.out}))}}
 else if(pg.k==='traps'){
  card.append(h('h3',{text:'Sai lầm thường gặp',style:'margin-bottom:8px'}));
  D.traps.forEach(([w,r])=>card.append(h('div',{class:'trap'},h('div',{class:'tw'},h('b',{text:'✗ Hay nghĩ: '}),w),h('div',{class:'tr2'},h('b',{text:'✓ Thực ra: '}),r))));
  card.append(h('div',{class:'tip'},h('b',{text:'Mẹo nhớ: '}),D.tip))}
 else if(pg.k==='compact'){card.append(h('p',{class:'note',text:'Chủ đề này dùng bài tóm tắt.'}),lessonBody(g))}
 else if(pg.k==='quiz'){
  if(!LSN.quiz){const qs=quizPick(g);LSN.quiz={qs,i:0,st:{},counted:{},ok:0,n:0}}
  const Z=LSN.quiz;
  if(!Z.qs.length){card.append(h('p',{text:'Chủ đề này chưa có câu kiểm tra riêng. Hãy làm đề thi tiếp theo để kiểm chứng.'}))}
  else{const q=Z.qs[Z.i];const st=Z.st[q.id]=Z.st[q.id]||{};
   card.append(h('p',{class:'lab',text:'Kiểm tra hiểu bài: câu '+(Z.i+1)+'/'+Z.qs.length}),renderQ(q,st,{n:Z.i+1,reveal:st.reveal,onChange:draw}));
   const row=h('div',{class:'row',style:'margin-top:8px'});
   if(!st.reveal)row.append(h('button',{class:'btn',type:'button',disabled:st.sel==null,text:'Kiểm tra',onclick:()=>{st.reveal=true;const ok=mcqOk(q,st);if(!Z.counted[q.id]){Z.counted[q.id]=1;Z.n++;if(ok)Z.ok++;QUIZMODE=true;try{record(q,ok)}finally{QUIZMODE=false}}draw()}}));
   else row.append(h('button',{class:'btn',type:'button',text:Z.i<Z.qs.length-1?'Câu tiếp':'Xem kết quả',onclick:()=>{if(Z.i<Z.qs.length-1)Z.i++;else LSN.page++;draw();window.scrollTo(0,0)}}));
   card.append(row)}}
 else if(pg.k==='done'){
  const Z=LSN.quiz||{ok:0,n:0};const lv=levelOf(Z.ok,Z.n);
  if(!LSN.saved){LSN.saved=true;const L=LG()[g]=LG()[g]||{};
   if(!L.base){let acc=null;if(LSN.from==='exam'&&LSN.ex){const x=LSN.ex.groups.find(y=>y.g===g);if(x)acc=Math.round(100*(x.n-x.w)/x.n)}if(acc==null)acc=groupAcc(g);L.base={acc:acc==null?0:acc,d:Date.now()};L.after=[]}
   L.times=(L.times||0)+1;L.quiz=L.quiz||[];if(Z.n){L.quiz.push({d:Date.now(),c:Z.ok,n:Z.n});L.level=lv.k}L.last=Date.now();
   LEARN.log.unshift({g,rate:lv.k==='good'?3:lv.k==='mid'?2:1,d:Date.now(),acc:L.base.acc,quiz:Z.n?Z.ok+'/'+Z.n:null});LEARN.log=LEARN.log.slice(0,40);saveL()}
  card.append(h('p',{class:'lab',text:'Mức hiểu bài của bạn'}),h('div',{class:'score',text:Z.n?Z.ok+'/'+Z.n:'—'}),h('span',{class:'chip',style:'color:var(--'+(lv.k==='good'?'ok':lv.k==='mid'?'warn':'bad')+')',text:Z.n?lv.t:'Chưa có câu kiểm tra'}));
  const L=LG()[g];if(L&&L.quiz&&L.quiz.length>1)card.append(h('p',{class:'note',text:'Các lần kiểm tra trước: '+L.quiz.slice(0,-1).map(x=>x.c+'/'+x.n).join(', ')}));
  card.append(h('p',{style:'margin-top:10px',text:lv.k==='good'?'Bạn đã nắm được phần này. Hãy làm đề thi tiếp theo để xem điểm có tiến bộ không.':lv.k==='mid'?'Bạn hiểu được một phần. Đọc lại bước còn mơ hồ và phần "Sai lầm thường gặp", rồi làm lại kiểm tra.':'Phần này còn chưa vững. Hãy học lại chậm từng bước, chú ý sơ đồ và ví dụ, rồi kiểm tra lại.'}));
  const acts=h('div',{class:'row',style:'gap:8px;flex-wrap:wrap;margin-top:8px'});
  acts.append(h('button',{class:'btn sec sm',type:'button',text:'Xem lại bài học',onclick:()=>{LSN.page=0;LSN.quiz=null;LSN.saved=false;draw();window.scrollTo(0,0)}}));
  if(lv.k!=='good')acts.append(h('button',{class:'btn sec sm',type:'button',text:'Kiểm tra lại',onclick:()=>{LSN.quiz=null;LSN.saved=false;LSN.page=lessonPages(g).length-2;draw();window.scrollTo(0,0)}}));
  const ids=drillGroup(g);if(ids.length)acts.append(h('button',{class:'btn sec sm',type:'button',text:'Luyện thêm 5 câu',onclick:()=>{const back=LSN.from==='exam'?'exam':'review';LSN=null;startPractice(ids,back);view='prac';LS.set('hsg.view','prac');draw();window.scrollTo(0,0)}}));
  card.append(acts);
  if(LSN.from==='exam'&&LSN.ex){const nx=LSN.ex.groups.filter(x=>x.g!==g&&!(LG()[x.g]&&LG()[x.g].times))[0];
   const nav=h('div',{class:'row',style:'gap:8px;flex-wrap:wrap;margin-top:12px;padding-top:12px;border-top:1px solid var(--line)'});
   if(nx)nav.append(h('button',{class:'btn',type:'button',text:'Học tiếp: '+gname(nx.g),onclick:()=>openLesson(nx.g,'exam',LSN.ex)}));
   nav.append(h('button',{class:nx?'btn sec':'btn',type:'button',text:'Về kết quả',onclick:closeLesson}),h('button',{class:'btn sec',type:'button',text:'Thi đề khác ngay',onclick:()=>{EX=null;LSN=null;view='exam';LS.set('hsg.view','exam');draw();window.scrollTo(0,0)}}));card.append(nav)}
  else card.append(h('div',{class:'row',style:'margin-top:12px'},h('button',{class:'btn',type:'button',text:'Về ôn tập',onclick:closeLesson})))}
 root.append(card);
 if(pg.k!=='done'&&!(pg.k==='quiz'&&LSN.quiz&&LSN.quiz.qs.length&&LSN.page===last-1&&false)){
  const nav=h('div',{class:'row',style:'justify-content:space-between;gap:8px'});
  nav.append(h('button',{class:'btn sec',type:'button',disabled:LSN.page===0,text:'‹ Trước',onclick:()=>{LSN.page--;draw();window.scrollTo(0,0)}}));
  if(pg.k==='quiz'){if(!LSN.quiz||!LSN.quiz.qs.length)nav.append(h('button',{class:'btn',type:'button',text:'Hoàn tất',onclick:()=>{LSN.page++;draw()}}))}
  else nav.append(h('button',{class:'btn',type:'button',text:pages[LSN.page+1].k==='quiz'?'Làm bài kiểm tra ›':'Tiếp ›',onclick:()=>{LSN.page++;draw();window.scrollTo(0,0)}}));
  root.append(nav)}
 return root}
/* thẻ trên trang kết quả */
function learnCard(){
 const gs=examGroups();EX._groups=gs;
 if(!gs.length)return h('div',{class:'card'},h('h3',{text:'Không có phần kiến thức nào bị hổng'}),h('p',{class:'note',text:'Bạn không sai câu nào có bài học đi kèm. Hãy thi đề tiếp theo để kiểm chứng.'}));
 const top=gs.slice(0,6);const card=h('div',{class:'card learn'});
 card.append(h('h3',{text:'Học lại ngay phần bạn đang hổng'}),h('p',{class:'note',style:'margin:4px 0 10px',text:'Mỗi bài học có sơ đồ, ví dụ từng bước, sai lầm thường gặp và 4 câu kiểm tra hiểu bài. Học xong có thể thi đề khác để xem tiến bộ.'}));
 top.forEach((x,i)=>{const L=LG()[x.g]||{};const lastQ=L.quiz&&L.quiz.length?L.quiz[L.quiz.length-1]:null;
  card.append(h('div',{class:'lrow'},h('div',{style:'min-width:0'},h('b',{text:(i+1)+'. '+gname(x.g)}),h('div',{class:'note',text:'Sai '+x.w+'/'+x.n+' câu trong đề này'+(L.times?' · đã học '+L.times+' lần'+(lastQ?', kiểm tra '+lastQ.c+'/'+lastQ.n:''):' · chưa học')})),
   h('button',{class:'btn'+(L.times?' sec':'')+' sm',type:'button',text:L.times?'Học lại':'Học ngay',onclick:()=>openLesson(x.g,'exam',{qs:EX.qs,groups:gs})})))});
 return card}
function progressCard(){
 const items=Object.keys(LG()).map(g=>({g,L:LG()[g]})).filter(x=>x.L.base&&x.L.after&&x.L.after.length>=2);
 if(!items.length)return null;
 const card=h('div',{class:'card'},h('h3',{text:'Tiến bộ sau khi học lại'}),h('p',{class:'note',style:'margin:4px 0 10px',text:'So tỉ lệ đúng trước khi học với các câu bạn làm sau khi học.'}));
 items.forEach(({g,L})=>{const a=L.after,now=Math.round(100*a.reduce((s,v)=>s+v,0)/a.length),d=now-L.base.acc;
  card.append(h('div',{class:'lrow'},h('div',{style:'min-width:0'},h('b',{text:gname(g)}),h('div',{class:'note',text:'Trước: '+L.base.acc+'% → Sau: '+now+'% ('+a.length+' câu)'})),
   h('span',{class:'chip',style:'color:var(--'+(d>5?'ok':d<-5?'bad':'warn')+')',text:d>5?'▲ Tiến bộ':d<-5?'▼ Giảm':'≈ Giữ nguyên'})))});
 return card}
