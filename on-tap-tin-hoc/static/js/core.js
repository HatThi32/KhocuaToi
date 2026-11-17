/* ====== Tiện ích chung, gọi API, router, hiển thị & nhập câu hỏi ====== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { } },
};
const sleep = ms => new Promise(r => setTimeout(r, ms));

const TYPE_NAMES = { mcq: 'Trắc nghiệm', tf: 'Đúng/Sai', short: 'Trả lời ngắn', fill: 'Điền khuyết', order: 'Sắp xếp', match: 'Ghép nối', essay: 'Tự luận' };
const TYPES = Object.keys(TYPE_NAMES);
const LEVEL_NAMES = { NB: 'Nhận biết', TH: 'Thông hiểu', VD: 'Vận dụng', VDC: 'Vận dụng cao' };
const KIND_NAMES = { bai: 'Luyện tập cuối bài', chude: 'Ôn tập chủ đề', gk1: 'Giữa kì 1', ck1: 'Cuối kì 1', gk2: 'Giữa kì 2', ck2: 'Cuối kì 2', khac: 'Khác' };
const PERIOD_NAMES = { hk1a: 'Đầu HK1 → giữa kì 1', hk1b: 'Giữa kì 1 → cuối kì 1', hk2a: 'Đầu HK2 → giữa kì 2', hk2b: 'Giữa kì 2 → cuối kì 2' };
const SCOPE_PERIODS = { gk1: 'Ôn thi giữa kì 1', ck1: 'Ôn thi cuối kì 1', gk2: 'Ôn thi giữa kì 2', ck2: 'Ôn thi cuối kì 2' };
const LETTERS = 'ABCDEFGH';

/* ---------- API ---------- */
async function api(path, { method = 'GET', body, role } = {}) {
  const headers = {};
  const tok = role === 'student' ? store.get('sToken') : role === 'teacher' ? store.get('tToken') : null;
  if (tok) headers.Authorization = 'Bearer ' + tok;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  let r;
  try {
    r = await fetch(path, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw Object.assign(new Error('Không kết nối được máy chủ'), { status: 0 });
  }
  let data;
  try { data = await r.json(); } catch { data = { error: 'Máy chủ trả về dữ liệu lỗi' }; }
  if (!r.ok) {
    if (r.status === 401 && role === 'teacher' && !path.includes('/login')) { store.set('tToken', null); go('#/teacher'); }
    if (r.status === 401 && role === 'student' && !path.includes('/login')) { store.set('sToken', null); go('#/student'); }
    throw Object.assign(new Error(data.error || 'Lỗi ' + r.status), { status: r.status });
  }
  return data;
}
const T = (p, o = {}) => api(p, { ...o, role: 'teacher' });
const S = (p, o = {}) => api(p, { ...o, role: 'student' });

function toast(msg, err = false) {
  const d = document.createElement('div');
  d.textContent = msg;
  if (err) d.className = 'err';
  $('#toast').appendChild(d);
  setTimeout(() => d.remove(), err ? 5000 : 2800);
}
const fail = e => toast(e.message || String(e), true);

/* chạy hàm async khi bấm nút, khoá nút trong lúc chờ */
async function busy(btn, fn, label = 'Đang xử lý…') {
  const old = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = label;
  try { return await fn(); } catch (e) { fail(e); } finally {
    // nếu hàm đã tự bật lại nút (đổi nhãn/chức năng) thì giữ nguyên
    if (btn.disabled) { btn.disabled = false; btn.innerHTML = old; }
  }
}

/* ---------- Router ---------- */
const ROUTES = [];
let routeCleanup = [];
function addRoute(rx, fn) { ROUTES.push([rx, fn]); }
function onLeave(fn) { routeCleanup.push(fn); }
function go(hash) { if (location.hash === hash) render(); else location.hash = hash; }
function render() {
  routeCleanup.forEach(f => { try { f(); } catch { } });
  routeCleanup = [];
  closeModal();
  const h = location.hash.slice(1) || '/';
  for (const [rx, fn] of ROUTES) {
    const m = h.match(rx);
    if (m) { window.scrollTo(0, 0); Promise.resolve(fn(...m.slice(1))).catch(fail); return; }
  }
  go('#/');
}
function start() { window.addEventListener('hashchange', render); render(); }
const app = () => $('#app');

/* ---------- Modal ---------- */
function modal(title, body, { wide = false, buttons = '' } = {}) {
  closeModal();
  const bg = document.createElement('div');
  bg.className = 'modal-bg';
  bg.id = 'modal';
  bg.innerHTML = `<div class="modal ${wide ? 'wide' : ''}"><div class="mh"><h2>${title}</h2><button class="sm" data-close>✕</button></div>
    <div class="mb">${body}</div>${buttons ? `<div class="mf">${buttons}</div>` : ''}</div>`;
  bg.addEventListener('mousedown', e => { if (e.target === bg) bg.dataset.down = 1; });
  bg.addEventListener('mouseup', e => { if (e.target === bg && bg.dataset.down) closeModal(); delete bg.dataset.down; });
  bg.querySelector('[data-close]').onclick = closeModal;
  document.body.appendChild(bg);
  return bg;
}
function closeModal() { const m = $('#modal'); if (m) m.remove(); }
function confirmBox(msg) {
  return new Promise(res => {
    const m = modal('Xác nhận', `<p>${msg}</p>`, { buttons: '<button data-no>Huỷ</button><button class="pri" data-yes>Đồng ý</button>' });
    m.querySelector('[data-yes]').onclick = () => { closeModal(); res(true); };
    m.querySelector('[data-no]').onclick = () => { closeModal(); res(false); };
  });
}

/* ---------- Định dạng nội dung câu hỏi ---------- */
// ```lang ... ``` -> khối code, `x` -> code, xuống dòng giữ nguyên, ___ -> ô điền (nếu withBlanks)
function fmt(text, withBlanks = false) {
  let s = String(text ?? '');
  const blocks = [];
  s = s.replace(/```[\w-]*\n?([\s\S]*?)```/g, (_, code) => { blocks.push(code.replace(/\n$/, '')); return `\u0000C${blocks.length - 1}\u0000`; });
  let bi = 0;
  if (withBlanks) s = s.replace(/_{3,}/g, () => `\u0000B${bi++}\u0000`);
  s = esc(s).replace(/`([^`\n]+)`/g, '<code>$1</code>').replace(/\n/g, '<br>');
  s = s.replace(/\u0000C(\d+)\u0000/g, (_, i) => {
    let code = esc(blocks[+i]);
    if (withBlanks) code = code.replace(/_{3,}/g, () => `\u0000B${bi++}\u0000`);
    return `<pre><code>${code}</code></pre>`;
  });
  s = s.replace(/\u0000B(\d+)\u0000/g, (_, i) => `<input class="blank" data-blank="${i}" autocomplete="off" spellcheck="false">`);
  return s;
}
const fmtInline = t => esc(t).replace(/`([^`\n]+)`/g, '<code>$1</code>');

function qBadges(q, extra = '') {
  return `<div class="qhead"><span class="badge b">${TYPE_NAMES[q.type]}</span><span class="badge">${LEVEL_NAMES[q.level] || q.level || ''}</span>${extra}</div>`;
}

/* ---------- Ô trả lời cho học sinh ----------
   renderAnswer(q, el, initial, onChange) -> { get() } ; q là câu hỏi đã ẩn đáp án */
function renderAnswer(q, el, initial, onChange = () => { }) {
  const t = q.type;
  if (t === 'mcq') {
    let v = Number.isInteger(initial) ? initial : null;
    el.innerHTML = `<div class="qtext">${fmt(q.content)}</div><div class="opts">${q.options.map((o, i) =>
      `<button class="opt" data-i="${i}"><span class="k">${LETTERS[i]}</span><span>${fmtInline(o)}</span></button>`).join('')}</div>`;
    const paint = () => $$('.opt', el).forEach(b => b.classList.toggle('sel', +b.dataset.i === v));
    $$('.opt', el).forEach(b => b.onclick = () => { v = +b.dataset.i; paint(); onChange(); });
    paint();
    return { get: () => v, done: () => v !== null };
  }
  if (t === 'tf') {
    const v = Array.isArray(initial) ? [...initial] : q.statements.map(() => null);
    el.innerHTML = `<div class="qtext">${fmt(q.content)}</div><table class="tf">${q.statements.map((s, i) =>
      `<tr><td><b>${'abcd'[i] || i + 1})</b> ${fmtInline(s)}</td><td class="ch">
        <button class="tgl sm" data-i="${i}" data-v="1">Đúng</button> <button class="tgl sm" data-i="${i}" data-v="0">Sai</button></td></tr>`).join('')}</table>`;
    const paint = () => $$('.tgl', el).forEach(b => {
      const cur = v[+b.dataset.i];
      b.classList.toggle('on-t', cur === true && b.dataset.v === '1');
      b.classList.toggle('on-f', cur === false && b.dataset.v === '0');
    });
    $$('.tgl', el).forEach(b => b.onclick = () => { v[+b.dataset.i] = b.dataset.v === '1'; paint(); onChange(); });
    paint();
    return { get: () => v, done: () => v.every(x => x !== null) };
  }
  if (t === 'short') {
    el.innerHTML = `<div class="qtext">${fmt(q.content)}</div><div style="margin-top:10px"><input class="ans" placeholder="Nhập câu trả lời ngắn" autocomplete="off" spellcheck="false"></div>`;
    const inp = $('.ans', el);
    inp.value = initial ?? '';
    inp.oninput = onChange;
    return { get: () => inp.value, done: () => inp.value.trim() !== '' };
  }
  if (t === 'fill') {
    el.innerHTML = `<div class="qtext">${fmt(q.content, true)}</div>`;
    const ins = $$('.blank', el);
    ins.forEach((inp, i) => { inp.value = (initial || [])[i] ?? ''; inp.oninput = onChange; });
    return { get: () => ins.map(i => i.value), done: () => ins.every(i => i.value.trim()) };
  }
  if (t === 'order') {
    let v = Array.isArray(initial) && initial.length === q.items.length ? [...initial] : [...q.items];
    let touched = Array.isArray(initial);
    const draw = () => {
      $('.orderlist', el).innerHTML = v.map((it, i) => `<li data-k="${i}"><span class="grip" title="Kéo để đổi chỗ">⠿</span><b>${i + 1}.</b><code>${esc(it)}</code>
        <button class="sm" data-up="${i}" ${i === 0 ? 'disabled' : ''}>▲</button><button class="sm" data-down="${i}" ${i === v.length - 1 ? 'disabled' : ''}>▼</button></li>`).join('');
      $$('[data-up]', el).forEach(b => b.onclick = () => { const i = +b.dataset.up; [v[i - 1], v[i]] = [v[i], v[i - 1]]; touched = true; draw(); onChange(); });
      $$('[data-down]', el).forEach(b => b.onclick = () => { const i = +b.dataset.down; [v[i + 1], v[i]] = [v[i], v[i + 1]]; touched = true; draw(); onChange(); });
    };
    el.innerHTML = `<div class="qtext">${fmt(q.content)}</div><div class="small muted">Kéo thả các dòng (hoặc dùng ▲ ▼) để sắp xếp lại thứ tự.</div><ul class="orderlist"></ul>`;
    draw();
    sortable($('.orderlist', el), order => { v = order.map(k => v[k]); touched = true; draw(); onChange(); });
    return { get: () => touched ? v : null, done: () => touched };
  }
  if (t === 'match') {
    const v = Array.isArray(initial) ? [...initial] : q.lefts.map(() => '');
    el.innerHTML = `<div class="qtext">${fmt(q.content)}</div><table class="match">${q.lefts.map((l, i) =>
      `<tr><td style="width:45%">${fmtInline(l)}</td><td><select data-i="${i}"><option value="">— chọn —</option>${q.rights.map(r =>
        `<option ${v[i] === r ? 'selected' : ''}>${esc(r)}</option>`).join('')}</select></td></tr>`).join('')}</table>`;
    $$('select', el).forEach(s => s.onchange = () => { v[+s.dataset.i] = s.value; onChange(); });
    return { get: () => v, done: () => v.every(x => x) };
  }
  // essay
  el.innerHTML = `<div class="qtext">${fmt(q.content)}</div><textarea class="ans" style="margin-top:10px;min-height:150px" placeholder="Viết câu trả lời của em…"></textarea>`;
  const ta = $('.ans', el);
  ta.value = initial ?? '';
  ta.oninput = onChange;
  return { get: () => ta.value, done: () => ta.value.trim() !== '' };
}

/* ---------- Hiển thị đáp án & nhận xét ----------
   q: câu hỏi; data: đáp án đầy đủ; ans: bài làm; res: {frac, feedback, points, max} */
function reviewHTML(q, data, ans, res, explanation) {
  const frac = res ? res.frac : null;
  const cls = !res || res.pending ? '' : frac >= 1 ? 'ok' : frac > 0 ? 'part' : 'bad';
  const head = !res ? '📖 Đáp án' : res.pending ? '⏳ Chờ chấm' : frac >= 1 ? '✅ Chính xác' : frac > 0 ? `🟡 Đúng một phần (${Math.round(frac * 100)}%)` : '❌ Chưa đúng';
  const pts = res && res.max != null ? ` — <b>${fmtNum(res.points)}/${fmtNum(res.max)} điểm</b>` : '';
  let body = '';
  const t = q.type;
  if (t === 'mcq') {
    body = `<div class="opts">${data.options.map((o, i) => {
      const c = i === data.answer ? 'right' : i === ans ? 'wrong' : '';
      return `<div class="opt ${c}" style="cursor:default"><span class="k">${LETTERS[i]}</span><span>${fmtInline(o)}</span>${i === ans ? '<span class="badge" style="margin-left:auto">Em chọn</span>' : ''}</div>`;
    }).join('')}</div>`;
  } else if (t === 'tf') {
    body = `<table class="tf">${data.statements.map((s, i) => {
      const a = Array.isArray(ans) ? ans[i] : null;
      const ok = a === data.answers[i];
      return `<tr><td><b>${'abcd'[i]})</b> ${fmtInline(s)}</td><td class="ch">Đáp án: <b>${data.answers[i] ? 'Đúng' : 'Sai'}</b><br>
        <span class="${ok ? 'badge g' : 'badge r'}">Em: ${a === true ? 'Đúng' : a === false ? 'Sai' : '—'}</span></td></tr>`;
    }).join('')}</table>`;
  } else if (t === 'short') {
    body = `<div>Em trả lời: <code>${esc(ans ?? '')}</code></div><div>Đáp án: <b>${esc(data.answer)}</b>${data.alternatives?.length ? ` <span class="muted">(chấp nhận: ${esc(data.alternatives.join('; '))})</span>` : ''}</div>`;
  } else if (t === 'fill') {
    body = data.blanks.map((b, i) => `<div>Chỗ trống ${i + 1}: em điền <code>${esc((ans || [])[i] ?? '')}</code> — đáp án <b>${esc(b.split('|').join(' / '))}</b></div>`).join('');
  } else if (t === 'order') {
    body = `<div class="small muted">Thứ tự đúng:</div><ul class="orderlist">${data.items.map((it, i) => {
      const ok = Array.isArray(ans) && ans[i] === it;
      return `<li><b>${i + 1}.</b><code>${esc(it)}</code>${Array.isArray(ans) ? `<span class="badge ${ok ? 'g' : 'r'}">${ok ? '✓' : '✗'}</span>` : ''}</li>`;
    }).join('')}</ul>`;
  } else if (t === 'match') {
    body = `<table class="match">${data.pairs.map((p, i) => {
      const a = (ans || [])[i];
      const ok = a === p[1];
      return `<tr><td>${fmtInline(p[0])}</td><td>→ <b>${fmtInline(p[1])}</b>${ok ? ' <span class="badge g">✓</span>' : a ? ` <span class="badge r">em chọn: ${esc(a)}</span>` : ''}</td></tr>`;
    }).join('')}</table>`;
  } else {
    body = `<div class="small muted">Bài làm:</div><div style="white-space:pre-wrap;background:#fff;padding:8px;border-radius:6px;border:1px solid var(--line)">${esc(ans || '(bỏ trống)')}</div>
      ${data.sample ? `<details style="margin-top:6px"><summary>Đáp án mẫu</summary><div style="white-space:pre-wrap">${esc(data.sample)}</div></details>` : ''}`;
  }
  const fb = res?.feedback ? `<div style="margin-top:6px">💬 ${esc(res.feedback)}</div>` : '';
  const ex = explanation ? `<div class="expl">💡 ${fmt(explanation)}</div>` : '';
  return `<div class="review ${cls}"><div><b>${head}</b>${pts}</div><div style="margin-top:6px">${body}</div>${fb}</div>${ex}`;
}
const fmtNum = n => (n == null ? '–' : (Math.round(n * 100) / 100).toString().replace('.', ','));

/* Xem trước câu hỏi kèm đáp án (dùng cho giáo viên) */
function previewHTML(q) {
  const d = q.data, t = q.type;
  let ans = '';
  if (t === 'mcq') ans = `<div class="opts">${d.options.map((o, i) => `<div class="opt ${i === d.answer ? 'right' : ''}" style="cursor:default;padding:6px 10px"><span class="k">${LETTERS[i]}</span><span>${fmtInline(o)}</span></div>`).join('')}</div>`;
  else if (t === 'tf') ans = `<table class="tf">${d.statements.map((s, i) => `<tr><td><b>${'abcd'[i]})</b> ${fmtInline(s)}</td><td class="ch"><span class="badge ${d.answers[i] ? 'g' : 'r'}">${d.answers[i] ? 'Đúng' : 'Sai'}</span></td></tr>`).join('')}</table>`;
  else if (t === 'short') ans = `<div>Đáp án: <b>${esc(d.answer)}</b>${d.alternatives?.length ? ` <span class="muted">| ${esc(d.alternatives.join(' | '))}</span>` : ''}</div>`;
  else if (t === 'fill') ans = `<div>Đáp án: ${d.blanks.map((b, i) => `<b>(${i + 1})</b> ${esc(b)}`).join(' &nbsp; ')}</div>`;
  else if (t === 'order') ans = `<ol style="margin:6px 0">${d.items.map(i => `<li><code style="white-space:pre">${esc(i)}</code></li>`).join('')}</ol>`;
  else if (t === 'match') ans = `<table class="match">${d.pairs.map(p => `<tr><td>${fmtInline(p[0])}</td><td>→ ${fmtInline(p[1])}</td></tr>`).join('')}</table>`;
  else ans = `${d.rubric ? `<div><b>Hướng dẫn chấm:</b><div style="white-space:pre-wrap">${esc(d.rubric)}</div></div>` : ''}${d.sample ? `<div><b>Đáp án mẫu:</b><div style="white-space:pre-wrap">${esc(d.sample)}</div></div>` : ''}`;
  return `<div class="qtext">${fmt(q.content)}</div><div style="margin-top:6px">${ans}</div>${q.explanation ? `<div class="expl small">💡 ${fmt(q.explanation)}</div>` : ''}`;
}

/* ---------- Danh sách bài học (dùng chung) ---------- */
let CURR = null;
async function curriculum(force = false) {
  if (!CURR || force) CURR = await api('/api/curriculum');
  return CURR;
}
function lessonOptions(curr, selected, grade) {
  return curr.filter(t => !grade || t.grade == grade).map(t =>
    `<optgroup label="Lớp ${t.grade} – ${esc(t.code)}: ${esc(t.name)}">${t.lessons.map(l =>
      `<option value="${l.id}" ${l.id == selected ? 'selected' : ''}>${esc(l.name)}</option>`).join('')}</optgroup>`).join('');
}
function topicOptions(curr, selected, grade) {
  return curr.filter(t => !grade || t.grade == grade).map(t =>
    `<option value="${t.id}" ${t.id == selected ? 'selected' : ''}>Lớp ${t.grade} – ${esc(t.code)}: ${esc(t.name)}</option>`).join('');
}
function findLesson(curr, id) {
  for (const t of curr) for (const l of t.lessons) if (l.id == id) return { ...l, topic: t };
  return null;
}

/* ---------- Trang chủ ---------- */
addRoute(/^\/$/, async () => {
  let st = {};
  try { st = await api('/api/status'); } catch { }
  app().innerHTML = `<div class="wrap narrow">
    <div class="hero"><h1>💻 Ôn tập Tin học</h1>
      <p class="muted">${esc(st.school || 'Ra đề – chấm bài bằng AI – trình chiếu trên lớp – luyện tập ở nhà')}<br>Tin học THPT · Kết nối tri thức · Định hướng Tin học ứng dụng</p></div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">
      <div class="card choice" onclick="go('#/student')"><div class="ic">🎒</div><h2>Học sinh</h2><p class="muted">Luyện tập theo bài, chủ đề, ôn thi giữa kì, cuối kì.</p></div>
      <div class="card choice" onclick="go('#/teacher')"><div class="ic">👩‍🏫</div><h2>Giáo viên</h2><p class="muted">Ngân hàng câu hỏi, ra đề bằng AI, chấm bài, trình chiếu.</p></div>
    </div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr));margin-top:14px">
      <div class="card"><h3>📺 Vào phòng học trực tiếp</h3><p class="small muted">Nhập mã 6 số thầy cô chiếu trên bảng.</p>
        <form class="row" id="fLive"><input class="grow" name="code" inputmode="numeric" placeholder="Mã phòng" style="flex:1;min-width:0"><button class="pri">Vào</button></form></div>
      <div class="card"><h3>📝 Làm bài kiểm tra</h3><p class="small muted">Nhập mã bài kiểm tra thầy cô cung cấp.</p>
        <form class="row" id="fExam"><input name="code" placeholder="Mã bài" style="flex:1;min-width:0;text-transform:uppercase"><button class="pri">Làm bài</button></form></div>
    </div></div>`;
  $('#fLive').onsubmit = e => { e.preventDefault(); const c = e.target.code.value.trim(); if (c) go('#/live/' + c); };
  $('#fExam').onsubmit = e => { e.preventDefault(); const c = e.target.code.value.trim().toUpperCase(); if (c) go('#/exam/' + c); };
});
