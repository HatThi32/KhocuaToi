/* ====== Học sinh: đăng nhập, luyện tập ở nhà, làm bài kiểm tra ====== */
function studentShell(inner, me) {
  return `<div class="topbar"><div class="in"><a class="brand" href="#/student/home">💻 Ôn tập Tin học</a><span class="grow"></span>
    ${me ? `<span class="small">👤 <b>${esc(me.name)}</b> · ${esc(me.class_name)}</span><button class="sm" onclick="store.set('sToken',null);go('#/')">Đăng xuất</button>` : ''}</div></div>
    <div class="wrap narrow">${inner}</div>`;
}

/* ---------- Đăng nhập / đăng kí ---------- */
addRoute(/^\/student\/?$/, async () => {
  if (store.get('sToken')) return go('#/student/home');
  let mode = 'login';
  const draw = () => {
    app().innerHTML = studentShell(`<div class="card" style="max-width:440px;margin:30px auto">
      <div class="row" style="margin-bottom:14px"><button class="${mode === 'login' ? 'pri' : ''}" data-m="login">Đăng nhập</button><button class="${mode === 'reg' ? 'pri' : ''}" data-m="reg">Tạo tài khoản mới</button></div>
      <form id="sf">
        <div class="field"><label class="f">Họ và tên</label><input name="name" autocomplete="name" placeholder="Nguyễn Văn An"></div>
        <div class="field"><label class="f">Lớp</label><input name="cls" placeholder="VD: 10A1, 11B2, 12C3" style="text-transform:uppercase"></div>
        <div class="field"><label class="f">Mã PIN (4-6 chữ số)</label><input name="pin" type="password" inputmode="numeric" maxlength="6" autocomplete="${mode === 'reg' ? 'new-password' : 'current-password'}"></div>
        ${mode === 'reg' ? '<p class="small muted">Hãy nhớ mã PIN. Nếu quên, nhờ thầy cô đặt lại.</p>' : ''}
        <button class="pri" style="width:100%;justify-content:center">${mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</button></form>
      <p class="center small"><a href="#/">← Trang chủ</a></p></div>`);
    $$('[data-m]').forEach(b => b.onclick = () => { mode = b.dataset.m; draw(); });
    $('#sf').onsubmit = async e => {
      e.preventDefault();
      const f = e.target;
      try {
        const r = await api(mode === 'login' ? '/api/student/login' : '/api/student/register', { method: 'POST', body: { name: f.name.value, class_name: f.cls.value, pin: f.pin.value } });
        store.set('sToken', r.token);
        store.set('sName', r.student.name);
        const back = sessionStorage.getItem('afterLogin');
        sessionStorage.removeItem('afterLogin');
        go(back || '#/student/home');
      } catch (err) { fail(err); }
    };
  };
  draw();
});

/* ---------- Trang chủ học sinh ---------- */
addRoute(/^\/student\/home$/, async () => {
  if (!store.get('sToken')) return go('#/student');
  const h = await S('/api/practice/home');
  const me = h.student;
  const pct = x => x == null ? '' : Math.round(x * 100) + '%';
  const lessonRow = l => `<div class="lesson-row"><div class="grow"><div>${esc(l.name)}</div>
      <div class="small muted">${l.qcount} câu trong ngân hàng${l.done ? ` · em đã làm ${l.done} lượt · đúng ${pct(l.avg)}` : ''}</div>
      ${l.done ? `<div class="bar" style="margin-top:4px;max-width:240px"><i style="width:${(l.avg || 0) * 100}%;background:${l.avg >= .8 ? 'var(--ok)' : l.avg >= .5 ? 'var(--warn)' : 'var(--bad)'}"></i></div>` : ''}</div>
      <button class="sm pri" data-scope='${JSON.stringify({ type: 'lesson', id: l.id })}' data-title="${esc(l.name)}" ${l.qcount || h.ai_enabled ? '' : 'disabled'}>Luyện tập</button></div>`;
  app().innerHTML = studentShell(`
    <h1>Chào ${esc(me.name.split(' ').pop())}! 👋</h1>
    <p class="muted">Tin học ${me.grade} · đã luyện ${h.total_attempts} câu${h.avg != null ? ` · đúng ${pct(h.avg)}` : ''}</p>
    <div class="card"><h3>📝 Làm bài kiểm tra</h3><form class="row" id="ex"><input name="c" placeholder="Nhập mã bài kiểm tra" style="flex:1;text-transform:uppercase"><button class="pri">Làm bài</button></form></div>
    <div class="card"><h3>🎯 Ôn thi</h3><div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">
      ${Object.entries(SCOPE_PERIODS).map(([k, n]) => `<button class="big" data-scope='${JSON.stringify({ type: 'period', grade: me.grade, period: k })}' data-title="${n}" style="justify-content:center">${n}</button>`).join('')}</div>
      <div class="row" style="margin-top:10px"><button data-wrong ${h.wrong_count ? '' : 'disabled'}>🔁 Ôn lại câu làm sai (${h.wrong_count})</button>
      ${h.ai_enabled ? `<button data-scope='${JSON.stringify({ type: 'grade', grade: me.grade })}' data-title="Tổng hợp cả năm">🎲 Trộn câu cả năm</button>` : ''}</div></div>
    ${h.sets.length ? `<div class="card"><h3>📌 Thầy cô giao</h3>${h.sets.map(s => `<div class="lesson-row"><div class="grow"><b>${esc(s.title)}</b><div class="small muted">${KIND_NAMES[s.kind] || ''} · ${s.count} câu</div></div>
      <button class="sm pri" data-set="${s.id}">Làm</button></div>`).join('')}</div>` : ''}
    <div class="card"><h3>📚 Luyện tập theo bài và chủ đề</h3>
      ${h.topics.map(t => `<details class="topic"><summary>${esc(t.code)}: ${esc(t.name)}</summary>
        <div class="row" style="margin-bottom:6px"><button class="sm" data-scope='${JSON.stringify({ type: 'topic', id: t.id })}' data-title="Ôn tập ${esc(t.code)}: ${esc(t.name)}">📖 Ôn tập cả chủ đề</button></div>
        ${t.lessons.map(lessonRow).join('')}</details>`).join('')}</div>`, me);
  $('#ex').onsubmit = e => { e.preventDefault(); const c = e.target.c.value.trim().toUpperCase(); if (c) go('#/exam/' + c); };
  $$('[data-scope]').forEach(b => b.onclick = () => practiceOptions(JSON.parse(b.dataset.scope), b.dataset.title, h.ai_enabled));
  $$('[data-set]').forEach(b => b.onclick = () => startPractice({ mode: 'set', set_id: +b.dataset.set }));
  const w = $('[data-wrong]');
  if (w) w.onclick = () => startPractice({ mode: 'wrong', scope: { type: 'grade', grade: me.grade }, count: 20 });
});

function practiceOptions(scope, title, aiEnabled) {
  const m = modal(esc(title), `
    <div class="field"><label class="f">Số câu</label><select id="poN"><option>5</option><option selected>10</option><option>20</option><option>30</option></select></div>
    <label class="f">Dạng câu hỏi</label>
    <div class="row" style="margin-bottom:12px">${TYPES.map(t => `<label class="row" style="gap:4px"><input type="checkbox" class="poT" value="${t}" checked> ${TYPE_NAMES[t]}</label>`).join('')}</div>
    <label class="f">Nguồn câu hỏi</label>
    <label class="row"><input type="radio" name="poM" value="bank" checked> Ngân hàng câu hỏi của thầy cô</label>
    ${aiEnabled ? '<label class="row"><input type="radio" name="poM" value="ai"> ✨ Câu hỏi mới do AI tạo (tối đa 10 câu, chờ khoảng 30 giây)</label>' : ''}
    <label class="row"><input type="radio" name="poM" value="wrong"> 🔁 Chỉ những câu em đã làm sai</label>`,
    { buttons: `<button data-c>Huỷ</button><button class="pri" id="poGo">▶ Bắt đầu</button>` });
  m.querySelector('[data-c]').onclick = closeModal;
  $('#poGo').onclick = e => busy(e.target, () => startPractice({
    scope, mode: $('input[name=poM]:checked').value, count: +$('#poN').value, types: $$('.poT').filter(c => c.checked).map(c => c.value),
  }, title), '⏳ Đang chuẩn bị…');
}

let PRACTICE = null;
async function startPractice(body, title) {
  const r = await S('/api/practice/start', { method: 'POST', body });
  PRACTICE = { title: title && body.mode !== 'ai' ? title : r.title, questions: r.questions, i: 0, results: [] };
  closeModal();
  go('#/student/practice');
}

/* ---------- Phiên luyện tập: từng câu, có phản hồi ngay ---------- */
addRoute(/^\/student\/practice$/, async () => {
  if (!PRACTICE) return go('#/student/home');
  const P = PRACTICE;
  const me = await S('/api/student/me').catch(() => null);
  const drawQ = () => {
    if (P.i >= P.questions.length) return summary();
    const q = P.questions[P.i];
    const pct = P.i / P.questions.length * 100;
    app().innerHTML = studentShell(`<div class="row between"><b>${esc(P.title)}</b><span class="badge">Câu ${P.i + 1}/${P.questions.length}</span></div>
      <div class="bar" style="margin:10px 0 14px"><i style="width:${pct}%;background:var(--pri)"></i></div>
      <div class="card">${qBadges(q)}<div id="qa"></div><div id="fb"></div>
        <div class="row end" style="margin-top:14px"><button id="skip">Bỏ qua</button><button class="pri" id="chk">Kiểm tra</button></div></div>`, me);
    const ui = renderAnswer(q, $('#qa'));
    $('#skip').onclick = () => { P.results.push({ q, frac: 0, skipped: true }); P.i++; drawQ(); };
    $('#chk').onclick = e => busy(e.target, async () => {
      if (!ui.done() && !await confirmBox('Em chưa trả lời xong. Vẫn kiểm tra?')) return;
      const ans = ui.get();
      const r = await S('/api/practice/check', { method: 'POST', body: { question_id: q.id, answer: ans } });
      P.results.push({ q, frac: r.frac, pending: r.pending });
      $$('#qa button, #qa input, #qa select, #qa textarea').forEach(x => x.disabled = true);
      $('#fb').innerHTML = reviewHTML(q, r.data, ans, r, r.explanation);
      $('#skip').remove();
      const b = $('#chk');
      b.textContent = P.i + 1 < P.questions.length ? 'Câu tiếp ▶' : 'Xem kết quả 🏁';
      b.disabled = false;
      b.onclick = () => { P.i++; drawQ(); };
      b.focus();
    }, q.type === 'essay' ? '⏳ AI đang chấm…' : 'Đang kiểm tra…');
  };
  const summary = () => {
    const n = P.results.length;
    const score = P.results.reduce((a, r) => a + (r.frac || 0), 0);
    const pct = n ? Math.round(score / n * 100) : 0;
    app().innerHTML = studentShell(`<div class="card center"><h2>🏁 ${esc(P.title)}</h2>
      <div class="scorebig">${pct}%</div><p>${fmtNum(score)} / ${n} câu đúng</p>
      <p>${pct >= 90 ? '🌟 Xuất sắc! Em nắm bài rất chắc.' : pct >= 70 ? '👍 Tốt lắm! Ôn thêm vài câu sai là ổn.' : pct >= 50 ? '💪 Khá! Hãy xem lại lời giải và luyện thêm.' : '📖 Em nên đọc lại bài trong SGK rồi luyện lại nhé.'}</p>
      <div class="row" style="justify-content:center"><a class="btn" href="#/student/home">← Về trang chính</a><button class="pri" id="again">🔁 Luyện lại các câu sai</button></div></div>
      <div class="card"><h3>Chi tiết</h3>${P.results.map((r, i) => `<div class="lesson-row"><span>${r.skipped ? '⏭' : r.pending ? '⏳' : r.frac >= 1 ? '✅' : r.frac > 0 ? '🟡' : '❌'}</span>
        <div class="grow small">Câu ${i + 1}: ${fmtInline(r.q.content.replace(/```[\s\S]*?```/g, '[code]').slice(0, 120))}</div></div>`).join('')}</div>`, me);
    const wrong = P.results.filter(r => r.frac < 1).map(r => r.q);
    $('#again').disabled = !wrong.length;
    $('#again').onclick = () => { PRACTICE = { title: 'Luyện lại câu sai', questions: wrong, i: 0, results: [] }; render(); };
  };
  drawQ();
});

/* ---------- Bài kiểm tra ---------- */
addRoute(/^\/exam\/([A-Za-z0-9]+)$/, async code => {
  code = code.toUpperCase();
  if (!store.get('sToken')) { sessionStorage.setItem('afterLogin', '#/exam/' + code); toast('Em hãy đăng nhập để làm bài'); return go('#/student'); }
  let data;
  try { data = await S('/api/exam/' + code); }
  catch (e) {
    app().innerHTML = studentShell(`<div class="card center"><h2>${esc(e.message)}</h2><a class="btn" href="#/student/home">← Về trang chính</a></div>`);
    return;
  }
  const me = data.student;
  if (data.submission) return showExamResult(data, me);

  const answers = data.saved || {};
  const uis = {};
  let endAt = Date.now() + data.remaining * 1000, saveT = null, submitted = false;
  app().innerHTML = studentShell(`<div class="card"><div class="row between"><div><h2 style="margin:0">${esc(data.set.title)}</h2>
      <div class="small muted">${data.questions.length} câu · ${data.set.duration} phút</div></div><div class="timer" id="et" style="background:var(--pri-soft);color:var(--pri)"></div></div></div>
    ${data.questions.map((q, i) => `<div class="card" id="q${q.id}">${qBadges(q, `<b>Câu ${i + 1}</b><span class="small muted">(${fmtNum(q.points)} điểm)</span>`)}<div class="qa" data-q="${q.id}"></div></div>`).join('')}
    <div class="sticky-foot"><div class="row between"><div class="qnav" id="nav"></div><button class="pri big" id="sub">📤 Nộp bài</button></div></div>`, me);
  const nav = () => {
    $('#nav').innerHTML = data.questions.map((q, i) => `<button class="${uis[q.id].done() ? 'done' : ''}" data-go="${q.id}">${i + 1}</button>`).join('');
    $$('[data-go]').forEach(b => b.onclick = () => $('#q' + b.dataset.go).scrollIntoView({ behavior: 'smooth', block: 'center' }));
  };
  const autosave = () => {
    clearTimeout(saveT);
    saveT = setTimeout(() => S(`/api/exam/${code}/save`, { method: 'POST', body: { answers: collect() } }).catch(() => { }), 1500);
  };
  const collect = () => { const o = {}; data.questions.forEach(q => o[q.id] = uis[q.id].get()); return o; };
  data.questions.forEach(q => { uis[q.id] = renderAnswer(q, $(`.qa[data-q="${q.id}"]`), answers[q.id], () => { nav(); autosave(); }); });
  nav();
  const submit = async (force = false) => {
    if (submitted) return;
    const left = data.questions.filter(q => !uis[q.id].done()).length;
    if (!force && !await confirmBox(left ? `Em còn <b>${left}</b> câu chưa làm. Vẫn nộp bài?` : 'Nộp bài? Sau khi nộp em không sửa được nữa.')) return;
    submitted = true;
    clearInterval(tm);
    const b = $('#sub');
    b.disabled = true;
    b.textContent = '⏳ Đang nộp và chấm bài…';
    try {
      const r = await S(`/api/exam/${code}/submit`, { method: 'POST', body: { answers: collect() } });
      showExamResult({ set: data.set, submission: r }, me);
    } catch (e) { submitted = false; b.disabled = false; b.textContent = '📤 Nộp bài'; fail(e); }
  };
  $('#sub').onclick = () => submit();
  const tick = () => {
    const s = Math.max(0, Math.round((endAt - Date.now()) / 1000));
    $('#et').textContent = `⏱ ${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    $('#et').style.background = s < 60 ? 'var(--bad-soft)' : 'var(--pri-soft)';
    if (s === 0) { toast('Hết giờ! Bài làm được nộp tự động.'); submit(true); }
  };
  const tm = setInterval(tick, 1000);
  tick();
  const warn = e => { if (!submitted) { e.preventDefault(); e.returnValue = ''; } };
  window.addEventListener('beforeunload', warn);
  onLeave(() => { clearInterval(tm); window.removeEventListener('beforeunload', warn); if (!submitted) S(`/api/exam/${code}/save`, { method: 'POST', body: { answers: collect() } }).catch(() => { }); });
});

function showExamResult(data, me) {
  const s = data.submission;
  const ten = s.max_score ? s.score / s.max_score * 10 : 0;
  app().innerHTML = studentShell(`<div class="card center"><h2>${esc(data.set.title)}</h2>
    <p class="muted">Đã nộp lúc ${s.submitted ? new Date(s.submitted * 1000).toLocaleString('vi-VN') : ''}</p>
    <div class="scorebig">${fmtNum(ten)}<span style="font-size:24px" class="muted">/10</span></div>
    <p>${fmtNum(s.score)} / ${fmtNum(s.max_score)} điểm ${s.status === 'pending' ? '<br><span class="badge y">Còn câu tự luận chờ thầy cô chấm – điểm có thể thay đổi</span>' : ''}</p>
    <a class="btn" href="#/student/home">← Về trang chính</a></div>
    ${s.details ? s.details.map((d, i) => `<div class="card">${qBadges(d.question, `<b>Câu ${i + 1}</b>`)}<div class="qtext">${fmt(d.question.content)}</div>
      ${reviewHTML(d.question, d.question.data, d.answer, d.result, d.question.explanation)}</div>`).join('') : '<p class="center muted">Thầy cô chưa cho xem đáp án chi tiết.</p>'}`, me);
}
