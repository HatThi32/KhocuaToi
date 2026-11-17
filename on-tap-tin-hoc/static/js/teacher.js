/* ====== Giao diện giáo viên ====== */
function teacherShell(active, inner) {
  const tabs = [['bank', '📚 Ngân hàng câu hỏi'], ['sets', '📝 Bộ đề & kiểm tra'], ['students', '🎒 Học sinh'], ['curriculum', '🗂️ Chương trình'], ['settings', '⚙️ Cài đặt']];
  return `<div class="topbar"><div class="in"><a class="brand" href="#/">💻 Ôn tập Tin học</a>
    ${tabs.map(([k, n]) => `<a class="tab ${k === active ? 'on' : ''}" href="#/teacher/${k}">${n}</a>`).join('')}
    <span class="grow"></span><button class="sm" onclick="store.set('tToken',null);go('#/')">Đăng xuất</button></div></div>
    <div class="wrap">${inner}</div>`;
}
const needTeacher = () => { if (!store.get('tToken')) { go('#/teacher'); return false; } return true; };

/* ---------- Đăng nhập ---------- */
addRoute(/^\/teacher\/?$/, async () => {
  if (store.get('tToken')) return go('#/teacher/bank');
  const st = await api('/api/status');
  const setup = st.setup_needed;
  app().innerHTML = `<div class="wrap" style="max-width:420px"><div class="card" style="margin-top:40px">
    <h2>👩‍🏫 ${setup ? 'Tạo mật khẩu giáo viên' : 'Đăng nhập giáo viên'}</h2>
    ${setup ? '<p class="muted small">Lần đầu sử dụng: đặt mật khẩu để bảo vệ ngân hàng câu hỏi và kết quả.</p>' : ''}
    <form id="f"><div class="field"><label class="f">Mật khẩu</label><input type="password" name="pw" autofocus></div>
    ${setup ? '<div class="field"><label class="f">Nhập lại mật khẩu</label><input type="password" name="pw2"></div>' : ''}
    <button class="pri" style="width:100%;justify-content:center">${setup ? 'Tạo mật khẩu' : 'Đăng nhập'}</button></form>
    <p class="center small"><a href="#/">← Trang chủ</a></p></div></div>`;
  $('#f').onsubmit = async e => {
    e.preventDefault();
    const f = e.target;
    if (setup && f.pw.value !== f.pw2.value) return toast('Hai mật khẩu không khớp', true);
    try {
      const r = await api(setup ? '/api/teacher/setup' : '/api/teacher/login', { method: 'POST', body: { password: f.pw.value } });
      store.set('tToken', r.token);
      go('#/teacher/bank');
    } catch (err) { fail(err); }
  };
});

/* ---------- Soạn / sửa câu hỏi ---------- */
async function editQuestion(q, defaults = {}, onSaved = () => { }) {
  const curr = await curriculum();
  q = q ? JSON.parse(JSON.stringify(q)) : { type: defaults.type || 'mcq', level: 'NB', content: '', data: {}, explanation: '', lesson_id: defaults.lesson_id };
  const m = modal(q.id ? 'Sửa câu hỏi' : 'Thêm câu hỏi', `
    <div class="fields">
      <div><label class="f">Bài học</label><select id="eL"><option value="">— chọn bài —</option>${lessonOptions(curr, q.lesson_id)}</select></div>
      <div><label class="f">Dạng câu hỏi</label><select id="eT">${TYPES.map(t => `<option value="${t}" ${t === q.type ? 'selected' : ''}>${TYPE_NAMES[t]}</option>`).join('')}</select></div>
      <div><label class="f">Mức độ</label><select id="eV">${Object.entries(LEVEL_NAMES).map(([k, n]) => `<option value="${k}" ${k === q.level ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
    </div>
    <div class="field" style="margin-top:12px"><label class="f">Nội dung câu hỏi <span class="muted small">(đoạn code đặt giữa hai dòng \`\`\` ; mã ngắn đặt giữa dấu \` )</span></label>
      <textarea id="eC" style="min-height:110px;font-family:Consolas,monospace">${esc(q.content)}</textarea></div>
    <div id="eS"></div>
    <div class="field"><label class="f">Lời giải thích (hiện cho học sinh sau khi trả lời)</label><textarea id="eE" style="min-height:60px">${esc(q.explanation)}</textarea></div>`,
    { wide: true, buttons: `<button data-close2>Huỷ</button><button class="pri" id="eSave">💾 Lưu câu hỏi</button>` });
  const specific = () => {
    const t = $('#eT').value, d = q.type === t ? q.data : {};
    let h = '';
    if (t === 'mcq') {
      const o = d.options || ['', '', '', ''];
      h = `<label class="f">Các phương án (chọn ô tròn ở phương án đúng)</label>${[0, 1, 2, 3].map(i => `<div class="row" style="margin-bottom:6px;flex-wrap:nowrap">
        <input type="radio" name="eAns" value="${i}" ${d.answer === i ? 'checked' : ''}><b>${LETTERS[i]}</b><input class="eO" value="${esc(o[i] || '')}"></div>`).join('')}`;
    } else if (t === 'tf') {
      const s = d.statements || ['', '', '', ''], a = d.answers || [true, true, false, false];
      h = `<label class="f">4 ý a, b, c, d và đáp án</label>${[0, 1, 2, 3].map(i => `<div class="row" style="margin-bottom:6px;flex-wrap:nowrap">
        <b>${'abcd'[i]})</b><input class="eSt" value="${esc(s[i] || '')}"><select class="eSa inline"><option value="1" ${a[i] ? 'selected' : ''}>Đúng</option><option value="0" ${!a[i] ? 'selected' : ''}>Sai</option></select></div>`).join('')}`;
    } else if (t === 'short') {
      h = `<div class="fields"><div><label class="f">Đáp án</label><input id="eA" value="${esc(d.answer || '')}"></div>
        <div><label class="f">Cách viết khác được chấp nhận (ngăn cách bằng |)</label><input id="eAlt" value="${esc((d.alternatives || []).join(' | '))}"></div></div>
        <p class="small muted">Khi chấm, không phân biệt chữ hoa/thường và khoảng trắng.</p>`;
    } else if (t === 'fill') {
      h = `<p class="small muted">Trong nội dung, mỗi chỗ trống ghi bằng <code>___</code> (3 dấu gạch dưới).</p>
        <label class="f">Đáp án từng chỗ trống – mỗi dòng một chỗ trống (nhiều đáp án đúng thì ngăn cách bằng |)</label><textarea id="eB">${esc((d.blanks || []).join('\n'))}</textarea>`;
    } else if (t === 'order') {
      h = `<label class="f">Các bước / dòng lệnh theo ĐÚNG thứ tự – mỗi dòng một mục (app sẽ tự xáo trộn khi hỏi)</label>
        <textarea id="eI" style="font-family:Consolas,monospace;min-height:120px">${esc((d.items || []).join('\n'))}</textarea>`;
    } else if (t === 'match') {
      h = `<label class="f">Các cặp ghép – mỗi dòng: <code>vế trái => vế phải</code></label>
        <textarea id="eP" style="min-height:110px">${esc((d.pairs || []).map(p => p[0] + ' => ' + p[1]).join('\n'))}</textarea>`;
    } else {
      h = `<div class="field"><label class="f">Hướng dẫn chấm / thang điểm (AI dựa vào đây để chấm)</label><textarea id="eR" style="min-height:90px">${esc(d.rubric || '')}</textarea></div>
        <div class="field"><label class="f">Đáp án mẫu</label><textarea id="eM">${esc(d.sample || '')}</textarea></div>`;
    }
    $('#eS').innerHTML = `<div class="field">${h}</div>`;
  };
  specific();
  $('#eT').onchange = specific;
  m.querySelector('[data-close2]').onclick = closeModal;
  $('#eSave').onclick = e => busy(e.target, async () => {
    const t = $('#eT').value;
    const body = { type: t, level: $('#eV').value, content: $('#eC').value, explanation: $('#eE').value, lesson_id: +$('#eL').value || null };
    const lines = id => $(id).value.split('\n').filter(x => x.trim());
    if (t === 'mcq') { body.options = $$('.eO').map(i => i.value.trim()); const r = $('input[name=eAns]:checked'); body.answer = r ? +r.value : -1; }
    if (t === 'tf') { body.statements = $$('.eSt').map(i => i.value.trim()); body.answers = $$('.eSa').map(s => s.value === '1'); }
    if (t === 'short') { body.answer = $('#eA').value; body.alternatives = $('#eAlt').value.split('|').map(s => s.trim()).filter(Boolean); }
    if (t === 'fill') body.blanks = lines('#eB').map(s => s.trim());
    if (t === 'order') body.items = lines('#eI');
    if (t === 'match') body.pairs = lines('#eP').map(l => l.split('=>').map(s => s.trim()));
    if (t === 'essay') { body.rubric = $('#eR').value; body.sample = $('#eM').value; }
    if (!body.lesson_id) throw new Error('Hãy chọn bài học');
    if (t === 'mcq' && body.answer < 0) throw new Error('Hãy chọn phương án đúng');
    if (t === 'fill' && (body.content.match(/_{3,}/g) || []).length !== body.blanks.length) throw new Error('Số chỗ trống ___ trong nội dung phải bằng số dòng đáp án');
    if (q.id) await T('/api/questions/' + q.id, { method: 'PUT', body });
    else await T('/api/questions', { method: 'POST', body });
    toast('Đã lưu câu hỏi');
    closeModal();
    CURR = null;
    onSaved();
  }, 'Đang lưu…');
}

/* ---------- Xem trước & lưu câu hỏi do AI tạo ---------- */
function aiPreview(questions, lessonId, onSaved) {
  const m = modal(`✨ AI đã soạn ${questions.length} câu – kiểm tra trước khi lưu`, `
    <p class="small muted">Bỏ chọn những câu chưa đạt. Sau khi lưu, thầy cô có thể sửa từng câu trong ngân hàng.</p>
    ${questions.map((q, i) => `<div class="qcard"><label class="row" style="margin-bottom:6px"><input type="checkbox" class="aiChk" data-i="${i}" checked> <b>Câu ${i + 1}</b>
      <span class="badge b">${TYPE_NAMES[q.type]}</span><span class="badge">${LEVEL_NAMES[q.level]}</span></label>${previewHTML(q)}</div>`).join('')}`,
    { wide: true, buttons: `<button data-c>Huỷ</button><button class="pri" id="aiSave">💾 Lưu các câu đã chọn vào ngân hàng</button>` });
  m.querySelector('[data-c]').onclick = closeModal;
  $('#aiSave').onclick = e => busy(e.target, async () => {
    const pick = $$('.aiChk').filter(c => c.checked).map(c => questions[+c.dataset.i]);
    if (!pick.length) throw new Error('Chưa chọn câu nào');
    await T('/api/questions/bulk', { method: 'POST', body: { lesson_id: lessonId, questions: pick.map(q => ({ ...q, source: 'AI' })) } });
    toast(`Đã lưu ${pick.length} câu hỏi`);
    closeModal();
    CURR = null;
    onSaved && onSaved();
  });
}

async function aiGenerateDialog(lessonId, onSaved) {
  const curr = await curriculum();
  const def = { mcq: 4, tf: 2, short: 2, fill: 0, order: 0, match: 0, essay: 0 };
  const m = modal('✨ AI soạn câu hỏi mới', `
    <div class="field"><label class="f">Bài học</label><select id="gL"><option value="">— chọn bài —</option>${lessonOptions(curr, lessonId)}</select></div>
    <label class="f">Số câu mỗi dạng</label>
    <div class="fields">${TYPES.map(t => `<div><span class="small">${TYPE_NAMES[t]}</span><input type="number" min="0" max="15" class="gN" data-t="${t}" value="${def[t]}"></div>`).join('')}</div>
    <div class="fields" style="margin-top:12px"><div><label class="f">Mức độ</label><select id="gV"><option value="mixed">Trộn theo tỉ lệ 4-3-2-1</option>
      ${Object.entries(LEVEL_NAMES).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select></div></div>
    <div class="field" style="margin-top:12px"><label class="f">Yêu cầu thêm (không bắt buộc)</label>
      <textarea id="gNote" placeholder="VD: tập trung vào vòng lặp lồng nhau; có tình huống thực tế; đoạn code dùng hàm len()…"></textarea></div>
    <p class="small muted">AI có thể sai – thầy cô nên kiểm tra đáp án trước khi lưu.</p>`,
    { buttons: `<button data-c>Huỷ</button><button class="pri" id="gGo">✨ Soạn câu hỏi</button>` });
  m.querySelector('[data-c]').onclick = closeModal;
  $('#gGo').onclick = e => busy(e.target, async () => {
    const lid = +$('#gL').value;
    if (!lid) throw new Error('Hãy chọn bài học');
    const counts = {};
    $$('.gN').forEach(i => counts[i.dataset.t] = +i.value || 0);
    const r = await T('/api/ai/generate', { method: 'POST', body: { lesson_id: lid, counts, level: $('#gV').value, note: $('#gNote').value } });
    aiPreview(r.questions, lid, onSaved);
  }, '⏳ AI đang soạn (khoảng 20-60 giây)…');
}

async function aiParseDialog(lessonId, onSaved) {
  const curr = await curriculum();
  const m = modal('📋 Nhập đề có sẵn (AI tách câu hỏi)', `
    <div class="field"><label class="f">Đưa vào bài học</label><select id="pL"><option value="">— chọn bài —</option>${lessonOptions(curr, lessonId)}</select></div>
    <div class="field"><label class="f">Chọn file Word (.docx) hoặc dán nội dung đề vào ô bên dưới</label>
      <input type="file" id="pF" accept=".docx"></div>
    <div class="field"><textarea id="pT" style="min-height:260px" placeholder="Câu 1. ...\nA. ...\nB. ...\n\nĐáp án: 1-A, 2-C ..."></textarea></div>
    <p class="small muted">Nếu đề có phần đáp án, hãy dán cả phần đáp án để AI dùng đúng đáp án của thầy cô. Hình ảnh và công thức trong file Word sẽ không được lấy.</p>`,
    { wide: true, buttons: `<button data-c>Huỷ</button><button class="pri" id="pGo">✨ Tách câu hỏi</button>` });
  m.querySelector('[data-c]').onclick = closeModal;
  $('#pF').onchange = async e => {
    const f = e.target.files[0];
    if (!f) return;
    const b64 = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result.split(',')[1]); r.readAsDataURL(f); });
    try { const r = await T('/api/docx-text', { method: 'POST', body: { data: b64 } }); $('#pT').value = r.text; toast('Đã đọc nội dung file'); } catch (err) { fail(err); }
  };
  $('#pGo').onclick = e => busy(e.target, async () => {
    const lid = +$('#pL').value;
    if (!lid) throw new Error('Hãy chọn bài học');
    const r = await T('/api/ai/parse', { method: 'POST', body: { lesson_id: lid, text: $('#pT').value } });
    aiPreview(r.questions, lid, onSaved);
  }, '⏳ AI đang đọc đề…');
}

/* ---------- Ngân hàng câu hỏi ---------- */
const bankF = { grade: '', topic_id: '', lesson_id: '', type: '', level: '', q: '' };
const bankSel = new Set();
const BANK_PTS = { mcq: 0.25, tf: 1, short: 0.5, fill: 0.5, order: 0.5, match: 0.5, essay: 1 };

/* Trình chiếu / xuất PowerPoint thẳng từ ngân hàng: tạo một bộ đề "Trình chiếu – …" rồi dùng chức năng sẵn có */
async function bankShow(list, how, btn, curr) {
  const picked = bankSel.size ? list.filter(q => bankSel.has(q.id)) : list;
  if (!picked.length) return toast('Chưa có câu hỏi để trình chiếu', true);
  if (!bankSel.size && picked.length > 40 && !await confirmBox(`Sẽ chiếu cả <b>${picked.length}</b> câu đang lọc. Tiếp tục?<br><span class="small muted">Mẹo: lọc theo Bài, hoặc tích ô <b>Chọn</b> ở từng câu để chiếu ít câu hơn.</span>`)) return;
  const lesson = curr.flatMap(t => t.lessons).find(l => l.id == bankF.lesson_id);
  const topic = curr.find(t => t.id == bankF.topic_id);
  const scope = lesson ? lesson.name : topic ? topic.name : bankF.grade ? 'Tin học ' + bankF.grade : 'Ngân hàng câu hỏi';
  const title = `Trình chiếu – ${scope}`;
  const body = { title, kind: lesson ? 'bai' : 'khac', grade: bankF.grade || topic?.grade || null,
    items: picked.map(q => ({ qid: q.id, points: BANK_PTS[q.type] || 0.5 })) };
  const r = await busy(btn, async () => {
    // dùng lại bộ "Trình chiếu – …" cùng tên (chưa có bài nộp) để danh sách bộ đề không bị đầy
    const old = (await T('/api/sets')).find(x => x.title === title && !x.submissions);
    if (old) { await T('/api/sets/' + old.id, { method: 'PUT', body }); return { id: old.id }; }
    return T('/api/sets', { method: 'POST', body });
  }, 'Đang chuẩn bị…');
  if (!r) return;
  if (how === 'pptx') await downloadPptx(r.id, btn);
  else presentDialog(r.id);
}
addRoute(/^\/teacher\/bank$/, async () => {
  if (!needTeacher()) return;
  const curr = await curriculum(true);
  const draw = async () => {
    const topics = curr.filter(t => !bankF.grade || t.grade == bankF.grade);
    const lessons = topics.filter(t => !bankF.topic_id || t.id == bankF.topic_id).flatMap(t => t.lessons);
    app().innerHTML = teacherShell('bank', `
      <div class="row between"><h1>📚 Ngân hàng câu hỏi</h1>
        <div class="row"><button onclick="editQuestion(null,{lesson_id:bankF.lesson_id},()=>render())">➕ Thêm câu hỏi</button>
        <button onclick="aiParseDialog(bankF.lesson_id,()=>render())">📋 Nhập đề có sẵn</button>
        <button class="pri" onclick="aiGenerateDialog(bankF.lesson_id,()=>render())">✨ AI soạn câu hỏi</button></div></div>
      <div class="card"><div class="fields">
        <div><label class="f">Khối</label><select id="fG"><option value="">Tất cả</option>${[10, 11, 12].map(g => `<option ${bankF.grade == g ? 'selected' : ''}>${g}</option>`).join('')}</select></div>
        <div><label class="f">Chủ đề</label><select id="fT"><option value="">Tất cả</option>${topicOptions(topics, bankF.topic_id)}</select></div>
        <div><label class="f">Bài</label><select id="fL"><option value="">Tất cả</option>${lessons.map(l => `<option value="${l.id}" ${l.id == bankF.lesson_id ? 'selected' : ''}>${esc(l.name)} (${l.qcount})</option>`).join('')}</select></div>
        <div><label class="f">Dạng</label><select id="fY"><option value="">Tất cả</option>${TYPES.map(t => `<option value="${t}" ${bankF.type === t ? 'selected' : ''}>${TYPE_NAMES[t]}</option>`).join('')}</select></div>
        <div><label class="f">Mức độ</label><select id="fV"><option value="">Tất cả</option>${Object.entries(LEVEL_NAMES).map(([k, n]) => `<option value="${k}" ${bankF.level === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
        <div><label class="f">Tìm</label><input id="fQ" value="${esc(bankF.q)}" placeholder="từ khoá…"></div>
      </div></div>
      <div class="row between" style="margin-top:14px"><span class="muted" id="qcount">Đang tải…</span>
        <div class="row"><span class="small muted" id="selInfo"></span>
        <button id="bShow" title="Chiếu các câu đã chọn (hoặc tất cả câu đang lọc) lên bảng">📺 Trình chiếu</button>
        <button id="bPptx" title="Tải các câu đã chọn (hoặc tất cả câu đang lọc) thành tệp PowerPoint có nút bấm chọn đáp án">📊 PowerPoint</button></div></div>
      <div id="qlist" style="margin-top:8px"></div>`);
    $('#fG').onchange = e => { bankF.grade = e.target.value; bankF.topic_id = ''; bankF.lesson_id = ''; draw(); };
    $('#fT').onchange = e => { bankF.topic_id = e.target.value; bankF.lesson_id = ''; draw(); };
    $('#fL').onchange = e => { bankF.lesson_id = e.target.value; draw(); };
    $('#fY').onchange = e => { bankF.type = e.target.value; draw(); };
    $('#fV').onchange = e => { bankF.level = e.target.value; draw(); };
    $('#fQ').onchange = e => { bankF.q = e.target.value; draw(); };
    const qs = new URLSearchParams(Object.entries(bankF).filter(([, v]) => v));
    const list = await T('/api/questions?' + qs);
    const byType = TYPES.map(t => [t, list.filter(q => q.type === t).length]).filter(x => x[1]);
    $('#qcount').innerHTML = `${list.length} câu hỏi ${byType.length ? '· ' + byType.map(([t, n]) => `${TYPE_NAMES[t]}: ${n}`).join(' · ') : ''}`;
    const selInfo = () => {
      const n = list.filter(q => bankSel.has(q.id)).length;
      $('#selInfo').innerHTML = n ? `Đã chọn <b>${n}</b> câu · <a href="javascript:void 0" id="selClr">bỏ chọn</a>` : 'Chưa chọn câu nào → dùng tất cả câu đang lọc';
      if ($('#selClr')) $('#selClr').onclick = () => { bankSel.clear(); $$('[data-sel]').forEach(c => c.checked = false); selInfo(); };
    };
    $('#bShow').onclick = e => bankShow(list, 'live', e.currentTarget, curr);
    $('#bPptx').onclick = e => bankShow(list, 'pptx', e.currentTarget, curr);
    $('#qlist').innerHTML =
      (list.length ? list.map(q => `<div class="qcard">${qBadges(q, `<span class="badge">${esc(q.lesson_name || '')}</span>${q.source ? `<span class="small muted">· ${esc(q.source)}</span>` : ''}
        <span class="grow"></span><label class="row small" style="gap:4px;cursor:pointer"><input type="checkbox" data-sel="${q.id}" ${bankSel.has(q.id) ? 'checked' : ''} style="width:auto"> Chọn</label>
        <button class="sm" data-edit="${q.id}">✏️ Sửa</button><button class="sm danger" data-del="${q.id}">🗑</button>`)}${previewHTML(q)}</div>`).join('')
        : '<div class="card center muted">Chưa có câu hỏi. Bấm <b>✨ AI soạn câu hỏi</b> để bắt đầu nhanh.</div>');
    $$('[data-sel]').forEach(c => c.onchange = () => { c.checked ? bankSel.add(+c.dataset.sel) : bankSel.delete(+c.dataset.sel); selInfo(); });
    selInfo();
    $$('[data-edit]').forEach(b => b.onclick = () => editQuestion(list.find(q => q.id == b.dataset.edit), {}, draw));
    $$('[data-del]').forEach(b => b.onclick = async () => {
      if (!await confirmBox('Xoá câu hỏi này khỏi ngân hàng?')) return;
      try { await T('/api/questions/' + b.dataset.del, { method: 'DELETE' }); }
      catch (e) {
        if (e.status !== 409 || !await confirmBox(esc(e.message) + '<br>Vẫn xoá khỏi ngân hàng? (bộ đề cũ vẫn giữ câu này)')) return e.status === 409 ? null : fail(e);
        await T('/api/questions/' + b.dataset.del + '?force=1', { method: 'DELETE' });
      }
      toast('Đã xoá'); draw();
    });
  };
  await draw();
});

/* ---------- Bộ đề ---------- */
addRoute(/^\/teacher\/sets$/, async () => {
  if (!needTeacher()) return;
  const sets = await T('/api/sets');
  app().innerHTML = teacherShell('sets', `
    <div class="row between"><h1>📝 Bộ đề & kiểm tra</h1>
      <div class="row"><button onclick="newEmptySet()">➕ Bộ đề trống</button><button class="pri" onclick="matrixDialog()">🎯 Tạo đề theo ma trận</button></div></div>
    <p class="muted">Mỗi bộ đề có thể dùng để: <b>kiểm tra</b> (học sinh làm bằng mã, chấm tự động), <b>trình chiếu</b> trên lớp, hoặc <b>giao luyện tập</b> ở nhà.</p>
    <div class="card scroll-x">${sets.length ? `<table class="list"><tr><th>Bộ đề</th><th>Loại</th><th>Số câu</th><th>Kiểm tra</th><th>Luyện tập</th><th></th></tr>
      ${sets.map(s => `<tr><td><a href="#/teacher/set/${s.id}"><b>${esc(s.title)}</b></a><div class="small muted">${s.grade ? 'Lớp ' + s.grade + ' · ' : ''}${fmtNum(s.max_score)} điểm · ${s.duration} phút</div></td>
        <td><span class="badge">${KIND_NAMES[s.kind] || ''}</span></td><td>${s.count}</td>
        <td>${s.exam_open ? `<span class="badge g">Đang mở · ${esc(s.exam_code)}</span>` : '<span class="badge">Đóng</span>'}<div class="small muted">${s.submissions} bài nộp</div></td>
        <td>${s.practice ? '<span class="badge b">Đã giao</span>' : '–'}</td>
        <td class="row end"><a class="btn sm" href="#/teacher/set/${s.id}">Mở</a><button class="sm" onclick="presentDialog(${s.id})">📺 Trình chiếu</button><button class="sm" onclick="downloadPptx(${s.id}, this)" title="Tải bản trình chiếu PowerPoint">📊 PPTX</button></td></tr>`).join('')}</table>`
      : '<p class="center muted">Chưa có bộ đề nào. Bấm <b>🎯 Tạo đề theo ma trận</b> để app tự chọn câu từ ngân hàng.</p>'}</div>`);
});

async function newEmptySet() {
  const r = await T('/api/sets', { method: 'POST', body: { title: 'Bộ đề mới', kind: 'khac', duration: 45 } });
  go('#/teacher/set/' + r.id);
}

async function matrixDialog() {
  const curr = await curriculum(true);
  const defs = { mcq: [12, 0.25], tf: [2, 1], short: [4, 0.5], fill: [0, 0.5], order: [0, 0.5], match: [0, 0.5], essay: [0, 1] };
  const m = modal('🎯 Tạo đề theo ma trận', `
    <div class="fields">
      <div><label class="f">Loại đề</label><select id="mK">${Object.entries(KIND_NAMES).map(([k, n]) => `<option value="${k}">${n}</option>`).join('')}</select></div>
      <div><label class="f">Khối</label><select id="mG">${[10, 11, 12].map(g => `<option>${g}</option>`).join('')}</select></div>
      <div><label class="f">Thời gian (phút)</label><input id="mD" type="number" value="45"></div>
    </div>
    <div class="field" style="margin-top:12px" id="mScope"></div>
    <div class="field"><label class="f">Tên bộ đề</label><input id="mTitle"></div>
    <label class="f">Ma trận: số câu và điểm mỗi câu</label>
    <table class="list"><tr><th>Dạng</th><th>Số câu</th><th>Điểm/câu</th><th>Có trong phạm vi</th></tr>
      ${TYPES.map(t => `<tr><td>${TYPE_NAMES[t]}</td><td><input type="number" min="0" class="mN" data-t="${t}" value="${defs[t][0]}" style="width:80px"></td>
        <td><input type="number" step="0.05" min="0" class="mP" data-t="${t}" value="${defs[t][1]}" style="width:90px"></td><td class="mAv" data-t="${t}">…</td></tr>`).join('')}
      <tr><td><b>Tổng</b></td><td id="mTotN"></td><td id="mTotP"></td><td></td></tr></table>
    <p class="small muted">Gợi ý theo cấu trúc đề tốt nghiệp: Phần I trắc nghiệm (0,25đ/câu), Phần II đúng/sai (1đ/câu, chấm theo số ý đúng), trả lời ngắn (0,5đ/câu).</p>`,
    { wide: true, buttons: `<button data-c>Huỷ</button><button class="pri" id="mGo">Tạo đề</button>` });
  m.querySelector('[data-c]').onclick = closeModal;
  const scope = () => {
    const k = $('#mK').value, g = +$('#mG').value;
    if (k === 'bai') return { type: 'lesson', id: +($('#mS')?.value || 0) };
    if (k === 'chude') return { type: 'topic', id: +($('#mS')?.value || 0) };
    if (['gk1', 'ck1', 'gk2', 'ck2'].includes(k)) return { type: 'period', grade: g, period: k };
    return { type: 'grade', grade: g };
  };
  const counts = {};
  const refresh = async () => {
    const lids = await T('/api/scope-stats', { method: 'POST', body: { scope: scope() } }).catch(() => null);
    $$('.mAv').forEach(td => td.textContent = lids ? (lids.counts[td.dataset.t] || 0) + ' câu' : '–');
    Object.assign(counts, lids?.counts || {});
    const k = $('#mK').value, g = $('#mG').value;
    const name = k === 'bai' || k === 'chude' ? ($('#mS')?.selectedOptions[0]?.textContent || '').replace(/\s*\(.*\)$/, '') : '';
    $('#mTitle').value = `${KIND_NAMES[k]} – Tin học ${g}${name ? ' – ' + name : ''}`;
    if (lids) $('#mScopeInfo').textContent = `Phạm vi gồm ${lids.lessons} bài học.`;
  };
  const drawScope = () => {
    const k = $('#mK').value, g = +$('#mG').value;
    let h = '';
    if (k === 'bai') h = `<label class="f">Bài học</label><select id="mS">${lessonOptions(curr, null, g)}</select>`;
    else if (k === 'chude') h = `<label class="f">Chủ đề</label><select id="mS">${topicOptions(curr, null, g)}</select>`;
    else if (k === 'khac') h = `<label class="f">Phạm vi</label><div>Toàn bộ chương trình lớp ${g}</div>`;
    else h = `<label class="f">Phạm vi</label><div>Các bài được gắn mốc "${['gk1', 'gk2'].includes(k) ? PERIOD_NAMES[k === 'gk1' ? 'hk1a' : 'hk2a'] : 'cả học kì ' + k.slice(-1)}" (chỉnh trong mục 🗂️ Chương trình)</div>`;
    $('#mScope').innerHTML = h + '<div class="small muted" id="mScopeInfo"></div>';
    if ($('#mS')) $('#mS').onchange = refresh;
    refresh();
  };
  const totals = () => {
    let n = 0, p = 0;
    $$('.mN').forEach(i => { const pts = +$(`.mP[data-t=${i.dataset.t}]`).value || 0; n += +i.value || 0; p += (+i.value || 0) * pts; });
    $('#mTotN').textContent = n + ' câu';
    $('#mTotP').textContent = fmtNum(p) + ' điểm';
  };
  $$('.mN,.mP').forEach(i => i.oninput = totals);
  $('#mK').onchange = drawScope;
  $('#mG').onchange = drawScope;
  drawScope();
  totals();
  $('#mGo').onclick = e => busy(e.target, async () => {
    const c = {}, p = {};
    $$('.mN').forEach(i => c[i.dataset.t] = +i.value || 0);
    $$('.mP').forEach(i => p[i.dataset.t] = +i.value || 0);
    const r = await T('/api/sets/auto', { method: 'POST', body: { title: $('#mTitle').value, kind: $('#mK').value, grade: +$('#mG').value, duration: +$('#mD').value, scope: scope(), counts: c, points: p } });
    closeModal();
    if (r.warnings?.length) toast('Thiếu câu: ' + r.warnings.join('; '), true);
    else toast('Đã tạo đề');
    go('#/teacher/set/' + r.id);
  });
}

/* ---------- Chi tiết bộ đề ---------- */
addRoute(/^\/teacher\/set\/(\d+)$/, async id => {
  if (!needTeacher()) return;
  let s = await T('/api/sets/' + id);
  let items = s.questions.map(q => ({ ...q }));
  let dirty = false;
  const draw = () => {
    const total = items.reduce((a, q) => a + (+q.points || 0), 0);
    app().innerHTML = teacherShell('sets', `
      <div class="row between"><div><a href="#/teacher/sets" class="small">← Bộ đề</a><h1>${esc(s.title)}</h1></div>
        <div class="row"><button onclick="printSet(${s.id})">🖨️ In đề</button><button onclick="presentDialog(${s.id})">📺 Trình chiếu</button>
        <button onclick="downloadPptx(${s.id}, this)" title="Tải bản trình chiếu PowerPoint: bấm phương án để kiểm tra đúng/sai, bấm ĐÁP ÁN để xem lời giải">📊 PowerPoint</button>
        <button class="danger" id="sDel">🗑 Xoá bộ đề</button></div></div>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(300px,1fr))">
        <div class="card"><h3>Thông tin</h3>
          <div class="field"><label class="f">Tên</label><input id="sT" value="${esc(s.title)}"></div>
          <div class="fields"><div><label class="f">Loại</label><select id="sK">${Object.entries(KIND_NAMES).map(([k, n]) => `<option value="${k}" ${s.kind === k ? 'selected' : ''}>${n}</option>`).join('')}</select></div>
          <div><label class="f">Khối</label><select id="sG"><option value="">–</option>${[10, 11, 12].map(g => `<option ${s.grade == g ? 'selected' : ''}>${g}</option>`).join('')}</select></div>
          <div><label class="f">Thời gian (phút)</label><input id="sD" type="number" value="${s.duration}"></div></div>
          <div style="margin-top:10px" class="stack">
            <label class="row"><input type="checkbox" id="sP" ${s.practice ? 'checked' : ''}> Giao cho học sinh luyện tập ở nhà</label>
            <label class="row"><input type="checkbox" id="sA" ${s.show_answers ? 'checked' : ''}> Cho học sinh xem đáp án sau khi nộp bài kiểm tra</label>
            <label class="row"><input type="checkbox" id="sS" ${s.shuffle ? 'checked' : ''}> Đảo thứ tự câu hỏi khi kiểm tra</label></div>
          <div class="row end" style="margin-top:12px"><button class="pri" id="sSave">💾 Lưu thông tin</button></div></div>
        <div class="card"><h3>Kiểm tra trực tuyến</h3>
          ${s.exam_open ? `<p>Đang mở. Học sinh vào trang chủ → <b>Làm bài kiểm tra</b> và nhập mã:</p>
            <div class="center" style="font-size:44px;font-weight:800;letter-spacing:6px;color:var(--pri)">${esc(s.exam_code)}</div>
            <p class="center small muted">Hoặc mở: <code>${esc(location.origin)}/#/exam/${esc(s.exam_code)}</code></p>
            <div class="row end"><button class="danger" id="sClose">⏹ Đóng bài kiểm tra</button></div>`
        : `<p class="muted">Chưa mở. Khi mở, app tạo một mã để học sinh vào làm bài; bài làm được chấm ngay khi nộp (tự luận chấm bằng AI).</p>
            <div class="row end"><button class="ok" id="sOpen">▶ Mở bài kiểm tra</button></div>`}
          <div class="row" style="margin-top:8px"><a class="btn" href="#/teacher/results/${s.id}">📊 Xem kết quả</a></div></div>
      </div>
      <div class="card" style="margin-top:14px"><div class="row between"><h3>Câu hỏi (${items.length} câu · ${fmtNum(total)} điểm)</h3>
        <div class="row"><button id="sAdd">➕ Thêm câu từ ngân hàng</button><button class="pri" id="sSaveQ" ${dirty ? '' : 'disabled'}>💾 Lưu danh sách câu</button></div></div>
        ${items.map((q, i) => `<div class="qcard">${qBadges(q, `<span class="badge">${esc(q.lesson_name || '')}</span><span class="grow"></span>
          <b>Câu ${i + 1}</b> · <input type="number" step="0.05" min="0" class="pts inline" data-i="${i}" value="${q.points}" style="width:80px"> điểm
          <button class="sm" data-mv="${i}" data-d="-1" ${i ? '' : 'disabled'}>▲</button><button class="sm" data-mv="${i}" data-d="1" ${i < items.length - 1 ? '' : 'disabled'}>▼</button>
          <button class="sm" data-ed="${i}">✏️</button><button class="sm danger" data-rm="${i}">✕</button>`)}${previewHTML(q)}</div>`).join('') || '<p class="muted">Chưa có câu hỏi.</p>'}
      </div>`);
    const changed = () => { dirty = true; $('#sSaveQ').disabled = false; };
    $$('.pts').forEach(i => i.oninput = () => { items[+i.dataset.i].points = +i.value || 0; changed(); });
    $$('[data-mv]').forEach(b => b.onclick = () => { const i = +b.dataset.mv, j = i + +b.dataset.d;[items[i], items[j]] = [items[j], items[i]]; dirty = true; draw(); });
    $$('[data-rm]').forEach(b => b.onclick = () => { items.splice(+b.dataset.rm, 1); dirty = true; draw(); });
    $$('[data-ed]').forEach(b => b.onclick = () => editQuestion(items[+b.dataset.ed], {}, async () => { await saveItems(); }));
    $('#sAdd').onclick = () => pickQuestions(items.map(q => q.id), s.grade, picked => { items.push(...picked); dirty = true; draw(); });
    const saveItems = async () => {
      await T('/api/sets/' + id, { method: 'PUT', body: { items: items.map(q => ({ qid: q.id, points: q.points })) } });
      s = await T('/api/sets/' + id);
      items = s.questions.map(q => ({ ...q }));
      dirty = false;
      draw();
    };
    $('#sSaveQ').onclick = e => busy(e.target, async () => { await saveItems(); toast('Đã lưu'); });
    $('#sSave').onclick = e => busy(e.target, async () => {
      await T('/api/sets/' + id, { method: 'PUT', body: { title: $('#sT').value, kind: $('#sK').value, grade: +$('#sG').value || null, duration: +$('#sD').value, practice: $('#sP').checked, show_answers: $('#sA').checked, shuffle: $('#sS').checked } });
      Object.assign(s, { title: $('#sT').value, kind: $('#sK').value, grade: +$('#sG').value || null, duration: +$('#sD').value, practice: $('#sP').checked, show_answers: $('#sA').checked, shuffle: $('#sS').checked });
      toast('Đã lưu'); draw();
    });
    if ($('#sOpen')) $('#sOpen').onclick = e => busy(e.target, async () => {
      if (dirty) await saveItems();
      const r = await T(`/api/sets/${id}/exam`, { method: 'POST', body: { open: true } });
      s.exam_open = 1; s.exam_code = r.code; draw();
    });
    if ($('#sClose')) $('#sClose').onclick = e => busy(e.target, async () => {
      await T(`/api/sets/${id}/exam`, { method: 'POST', body: { open: false } });
      s.exam_open = 0; draw();
    });
    $('#sDel').onclick = async () => {
      if (!await confirmBox('Xoá bộ đề này và toàn bộ bài làm của học sinh? (Câu hỏi trong ngân hàng vẫn giữ nguyên)')) return;
      await T('/api/sets/' + id, { method: 'DELETE' }); go('#/teacher/sets');
    };
  };
  draw();
});

async function pickQuestions(exclude, grade, onPick) {
  const curr = await curriculum();
  const m = modal('Thêm câu từ ngân hàng', `<div class="fields">
      <div><label class="f">Bài</label><select id="kL"><option value="">Tất cả${grade ? ' lớp ' + grade : ''}</option>${lessonOptions(curr, null, grade)}</select></div>
      <div><label class="f">Dạng</label><select id="kY"><option value="">Tất cả</option>${TYPES.map(t => `<option value="${t}">${TYPE_NAMES[t]}</option>`).join('')}</select></div></div>
    <div id="kList" style="margin-top:12px"></div>`, { wide: true, buttons: `<button data-c>Huỷ</button><button class="pri" id="kGo">Thêm câu đã chọn</button>` });
  m.querySelector('[data-c]').onclick = closeModal;
  let list = [];
  const load = async () => {
    const p = new URLSearchParams();
    if ($('#kL').value) p.set('lesson_id', $('#kL').value); else if (grade) p.set('grade', grade);
    if ($('#kY').value) p.set('type', $('#kY').value);
    list = (await T('/api/questions?' + p)).filter(q => !exclude.includes(q.id));
    $('#kList').innerHTML = list.length ? list.map((q, i) => `<div class="qcard"><label class="row"><input type="checkbox" class="kC" data-i="${i}"> ${qBadges(q, `<span class="badge">${esc(q.lesson_name)}</span>`)}</label>
      <div class="qtext small">${fmt(q.content)}</div></div>`).join('') : '<p class="muted">Không còn câu phù hợp.</p>';
  };
  $('#kL').onchange = load; $('#kY').onchange = load;
  await load();
  $('#kGo').onclick = () => {
    const picked = $$('.kC').filter(c => c.checked).map(c => ({ ...list[+c.dataset.i], points: { mcq: .25, tf: 1, short: .5, essay: 1 }[list[+c.dataset.i].type] || .5 }));
    closeModal(); onPick(picked);
  };
}

/* Tải bộ đề dạng PowerPoint (.pptx) có nút bấm chọn đáp án & hiện lời giải */
function downloadPptx(id, btn) {
  return busy(btn, async () => {
    const r = await fetch(`/api/sets/${id}/pptx`, { headers: { Authorization: 'Bearer ' + store.get('tToken') } });
    if (!r.ok) { let m = 'Không tạo được tệp PowerPoint'; try { m = (await r.json()).error || m; } catch { } throw new Error(m); }
    const cd = r.headers.get('Content-Disposition') || '';
    const m = cd.match(/filename\*=UTF-8''([^;]+)/);
    const name = m ? decodeURIComponent(m[1]) : 'bo-de.pptx';
    const url = URL.createObjectURL(await r.blob());
    const a = Object.assign(document.createElement('a'), { href: url, download: name });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast('Đã tải ' + name);
  }, 'Đang tạo…');
}

async function printSet(id) {
  const s = await T('/api/sets/' + id);
  const w = window.open('', '_blank');
  if (!w) return toast('Trình duyệt chặn cửa sổ mới', true);
  const body = s.questions.map((q, i) => {
    let a = '';
    if (q.type === 'mcq') a = `<div class="o">${q.data.options.map((o, j) => `<span>${LETTERS[j]}. ${fmtInline(o)}</span>`).join('')}</div>`;
    if (q.type === 'tf') a = q.data.statements.map((x, j) => `<div>${'abcd'[j]}) ${fmtInline(x)}</div>`).join('');
    if (q.type === 'order') a = `<div>${q.data.items.map((x, j) => `<div>(${j + 1}) <code>${esc(x.trim())}</code></div>`).sort(() => Math.random() - .5).join('')}</div>`;
    if (q.type === 'match') { const r = q.data.pairs.map(p => p[1]).sort(() => Math.random() - .5); a = `<table>${q.data.pairs.map((p, j) => `<tr><td>${j + 1}. ${fmtInline(p[0])}</td><td>${'abcdefgh'[j]}. ${fmtInline(r[j])}</td></tr>`).join('')}</table>`; }
    return `<div class="q"><b>Câu ${i + 1}</b> <i>(${fmtNum(q.points)} điểm)</i>. ${fmt(q.content).replace(/<input[^>]*>/g, '……………')}${a}</div>`;
  }).join('');
  const key = s.questions.map((q, i) => {
    const d = q.data;
    const v = q.type === 'mcq' ? LETTERS[d.answer] : q.type === 'tf' ? d.answers.map((x, j) => 'abcd'[j] + (x ? 'Đ' : 'S')).join(' ') : q.type === 'short' ? esc(d.answer)
      : q.type === 'fill' ? d.blanks.map(esc).join('; ') : q.type === 'order' ? '(xem thứ tự đúng trong app)' : q.type === 'match' ? d.pairs.map(p => esc(p[0]) + '–' + esc(p[1])).join('; ') : esc(d.sample || d.rubric || '');
    return `<tr><td>${i + 1}</td><td>${v}</td></tr>`;
  }).join('');
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(s.title)}</title><style>
    body{font-family:"Times New Roman",serif;font-size:13pt;max-width:800px;margin:20px auto;line-height:1.4}
    .q{margin:10px 0;break-inside:avoid}.o{display:grid;grid-template-columns:1fr 1fr;gap:2px 20px;margin-left:16px}
    pre{background:#f3f3f3;padding:6px 10px;font-size:11pt}table{border-collapse:collapse}td{padding:2px 10px;border:1px solid #999}
    h1{text-align:center;font-size:16pt}.pb{page-break-before:always}</style></head><body>
    <h1>${esc(s.title)}</h1><p style="text-align:center">Thời gian làm bài: ${s.duration} phút</p>
    <p>Họ và tên: ……………………………………… Lớp: ……………</p>${body}
    <div class="pb"></div><h1>ĐÁP ÁN – ${esc(s.title)}</h1><table><tr><th>Câu</th><th>Đáp án</th></tr>${key}</table>
    <script>window.onload=()=>window.print()<\/script></body></html>`);
  w.document.close();
}

/* ---------- Kết quả kiểm tra ---------- */
addRoute(/^\/teacher\/results\/(\d+)$/, async id => {
  if (!needTeacher()) return;
  const s = await T('/api/sets/' + id);
  const draw = async () => {
    const subs = await T(`/api/sets/${id}/submissions`);
    const done = subs.filter(x => x.status !== 'doing');
    const avg = done.length ? done.reduce((a, x) => a + (x.score || 0), 0) / done.length : null;
    const maxS = s.questions.reduce((a, q) => a + q.points, 0);
    app().innerHTML = teacherShell('sets', `<a class="small" href="#/teacher/set/${id}">← ${esc(s.title)}</a>
      <div class="row between"><h1>📊 Kết quả: ${esc(s.title)}</h1><div class="row">
        <button id="rRef">🔄 Làm mới</button><button id="rCsv">⬇️ Xuất Excel (CSV)</button></div></div>
      <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(160px,1fr))">
        <div class="card center"><div class="muted small">Đã nộp</div><div style="font-size:28px;font-weight:800">${done.length}</div></div>
        <div class="card center"><div class="muted small">Đang làm</div><div style="font-size:28px;font-weight:800">${subs.length - done.length}</div></div>
        <div class="card center"><div class="muted small">Điểm trung bình</div><div style="font-size:28px;font-weight:800">${avg == null ? '–' : fmtNum(avg / maxS * 10)}<span class="small muted">/10</span></div></div>
        <div class="card center"><div class="muted small">Chờ chấm tự luận</div><div style="font-size:28px;font-weight:800">${subs.filter(x => x.status === 'pending').length}</div></div>
      </div>
      <div class="card scroll-x" style="margin-top:14px">${subs.length ? `<table class="list"><tr><th>Lớp</th><th>Họ tên</th><th>Trạng thái</th><th>Điểm</th><th>Thang 10</th><th>Nộp lúc</th><th></th></tr>
        ${subs.map(x => `<tr><td>${esc(x.class_name)}</td><td>${esc(x.name)}</td>
          <td>${{ doing: '<span class="badge y">Đang làm</span>', grading: '<span class="badge y">Đang chấm</span>', pending: '<span class="badge r">Chờ chấm</span>', graded: '<span class="badge g">Đã chấm</span>' }[x.status]}</td>
          <td>${x.status === 'doing' ? '' : fmtNum(x.score) + '/' + fmtNum(x.max_score)}</td><td><b>${x.status === 'doing' || !x.max_score ? '' : fmtNum(x.score / x.max_score * 10)}</b></td>
          <td class="small">${x.submitted ? new Date(x.submitted * 1000).toLocaleString('vi-VN') : ''}</td>
          <td class="row end">${x.status !== 'doing' ? `<button class="sm" data-v="${x.id}">Xem / sửa điểm</button>` : ''}<button class="sm danger" data-r="${x.id}" title="Xoá bài làm để học sinh làm lại">↺ Cho làm lại</button></td></tr>`).join('')}</table>`
        : '<p class="center muted">Chưa có học sinh nào làm bài.</p>'}</div>`);
    $('#rRef').onclick = draw;
    $('#rCsv').onclick = () => {
      const rows = [['Lớp', 'Họ tên', 'Điểm', 'Tối đa', 'Thang 10', 'Trạng thái', 'Nộp lúc']].concat(done.map(x =>
        [x.class_name, x.name, x.score, x.max_score, x.max_score ? Math.round(x.score / x.max_score * 100) / 10 : '', x.status === 'graded' ? 'Đã chấm' : 'Chờ chấm', x.submitted ? new Date(x.submitted * 1000).toLocaleString('vi-VN') : '']));
      const csv = '﻿' + rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      a.download = s.title.replace(/[\\/:*?"<>|]/g, '_') + '.csv';
      a.click();
    };
    $$('[data-v]').forEach(b => b.onclick = () => submissionDialog(+b.dataset.v, draw));
    $$('[data-r]').forEach(b => b.onclick = async () => {
      if (!await confirmBox('Xoá bài làm này để học sinh làm lại từ đầu?')) return;
      await T('/api/submissions/' + b.dataset.r, { method: 'DELETE' }); draw();
    });
  };
  await draw();
});

async function submissionDialog(subId, onChange) {
  const sub = await T('/api/submissions/' + subId);
  const m = modal(`${esc(sub.student.name)} – ${esc(sub.student.class_name)}: ${fmtNum(sub.score)}/${fmtNum(sub.max_score)} điểm`,
    (sub.details || []).map((d, i) => `<div class="qcard">${qBadges(d.question, `<b>Câu ${i + 1}</b>`)}<div class="qtext">${fmt(d.question.content)}</div>
      ${reviewHTML(d.question, d.question.data, d.answer, d.result, d.question.explanation)}
      <div class="row" style="margin-top:8px"><span class="small">Sửa điểm:</span><input type="number" step="0.05" min="0" max="${d.result?.max}" class="ov inline" style="width:90px"
        data-q="${d.question.id}" value="${d.result?.override ?? ''}" placeholder="${fmtNum(d.result?.points)}"> / ${fmtNum(d.result?.max)}
        ${d.question.type === 'essay' ? `<input class="fbk grow" data-q="${d.question.id}" placeholder="Nhận xét cho học sinh" value="${esc(d.result?.feedback || '')}" style="flex:1">` : ''}</div></div>`).join(''),
    { wide: true, buttons: `<button id="sbRe">🤖 Chấm lại tự luận bằng AI</button><button data-c>Đóng</button><button class="pri" id="sbSave">💾 Lưu điểm</button>` });
  m.querySelector('[data-c]').onclick = closeModal;
  $('#sbRe').onclick = e => busy(e.target, async () => { await T(`/api/submissions/${subId}/regrade`, { method: 'POST', body: {} }); toast('Đã chấm lại'); onChange(); submissionDialog(subId, onChange); }, '⏳ Đang chấm…');
  $('#sbSave').onclick = e => busy(e.target, async () => {
    const overrides = {}, feedback = {};
    $$('.ov').forEach(i => overrides[i.dataset.q] = i.value === '' ? null : +i.value);
    $$('.fbk').forEach(i => feedback[i.dataset.q] = i.value);
    await T('/api/submissions/' + subId, { method: 'PUT', body: { overrides, feedback } });
    toast('Đã lưu điểm'); closeModal(); onChange();
  });
}

/* ---------- Học sinh ---------- */
addRoute(/^\/teacher\/students$/, async () => {
  if (!needTeacher()) return;
  const [list, rosters] = await Promise.all([T('/api/students'), T('/api/rosters')]);
  const classes = [...new Set(list.map(s => s.class_name))];
  app().innerHTML = teacherShell('students', `<div class="row between"><h1>🎒 Học sinh</h1><button class="pri" id="rsUp">⬆ Tải danh sách lớp</button></div>
    <div class="card" style="margin-bottom:14px"><h3>📋 Danh sách lớp (dùng để 🎲 gọi tên ngẫu nhiên khi trình chiếu)</h3>
      ${rosters.length ? `<table class="list"><tr><th>Lớp</th><th>Số học sinh</th><th>Một vài tên</th><th></th></tr>${rosters.map(r => `<tr><td><b>${esc(r.class_name)}</b></td><td>${r.names.length}</td>
        <td class="small muted">${esc(r.names.slice(0, 4).join(', '))}${r.names.length > 4 ? '…' : ''}</td>
        <td class="row end"><button class="sm" data-re="${esc(r.class_name)}">✏️ Sửa</button><button class="sm danger" data-rx="${esc(r.class_name)}">🗑</button></td></tr>`).join('')}</table>`
        : '<p class="muted">Chưa có danh sách lớp. Bấm <b>⬆ Tải danh sách lớp</b> để chọn file Excel/Word hoặc dán danh sách họ tên.</p>'}</div>
    <p class="muted">Học sinh tự tạo tài khoản ở trang <b>Học sinh</b> (họ tên + lớp + mã PIN). Thầy cô theo dõi tiến độ luyện tập và đặt lại PIN khi học sinh quên.</p>
    ${classes.length ? classes.map(c => `<div class="card scroll-x"><h3>Lớp ${esc(c)} (${list.filter(s => s.class_name === c).length})</h3>
      <table class="list"><tr><th>Họ tên</th><th>Số câu đã luyện</th><th>Tỉ lệ đúng</th><th>Lần luyện gần nhất</th><th>Bài KT</th><th></th></tr>
      ${list.filter(s => s.class_name === c).map(s => `<tr><td>${esc(s.name)}</td><td>${s.attempts}</td>
        <td>${s.avg_score == null ? '–' : `<div class="row" style="flex-wrap:nowrap"><div class="bar" style="width:80px"><i style="width:${s.avg_score * 100}%"></i></div>${Math.round(s.avg_score * 100)}%</div>`}</td>
        <td class="small">${s.last_practice ? new Date(s.last_practice * 1000).toLocaleString('vi-VN') : '–'}</td><td>${s.exams}</td>
        <td class="row end"><button class="sm" data-d="${s.id}">Chi tiết</button><button class="sm" data-p="${s.id}">Đặt lại PIN</button><button class="sm danger" data-x="${s.id}">🗑</button></td></tr>`).join('')}</table></div>`).join('')
      : '<div class="card center muted">Chưa có học sinh nào đăng kí.</div>'}`);
  $('#rsUp').onclick = () => rosterDialog(null, render);
  $$('[data-re]').forEach(b => b.onclick = () => rosterDialog(rosters.find(r => r.class_name === b.dataset.re), render));
  $$('[data-rx]').forEach(b => b.onclick = async () => {
    if (!await confirmBox(`Xoá danh sách lớp <b>${esc(b.dataset.rx)}</b>? (không ảnh hưởng tài khoản học sinh)`)) return;
    await T('/api/rosters/delete', { method: 'POST', body: { class_name: b.dataset.rx } }); render();
  });
  $$('[data-d]').forEach(b => b.onclick = async () => {
    const d = await T('/api/students/' + b.dataset.d);
    modal(`${esc(d.name)} – ${esc(d.class_name)}`, `<h3>Luyện tập theo bài (yếu nhất ở trên)</h3>
      ${d.lessons.length ? `<table class="list"><tr><th>Bài</th><th>Số câu</th><th>Tỉ lệ đúng</th></tr>${d.lessons.map(l => `<tr><td>${esc(l.name)}</td><td>${l.n}</td><td>${Math.round(l.avg * 100)}%</td></tr>`).join('')}</table>` : '<p class="muted">Chưa luyện tập.</p>'}
      <h3 style="margin-top:14px">Bài kiểm tra</h3>${d.exams.length ? `<table class="list">${d.exams.map(x => `<tr><td>${esc(x.title)}</td><td>${fmtNum(x.score)}/${fmtNum(x.max_score)}</td></tr>`).join('')}</table>` : '<p class="muted">Chưa làm bài kiểm tra.</p>'}`);
  });
  $$('[data-p]').forEach(b => b.onclick = async () => {
    const pin = prompt('Nhập mã PIN mới (4-6 chữ số):');
    if (!pin) return;
    try { await T(`/api/students/${b.dataset.p}/pin`, { method: 'POST', body: { pin } }); toast('Đã đặt lại PIN'); } catch (e) { fail(e); }
  });
  $$('[data-x]').forEach(b => b.onclick = async () => {
    if (!await confirmBox('Xoá học sinh này cùng toàn bộ lịch sử luyện tập và bài kiểm tra?')) return;
    await T('/api/students/' + b.dataset.x, { method: 'DELETE' }); render();
  });
});

/* ---------- Danh sách lớp (để gọi tên ngẫu nhiên khi trình chiếu) ---------- */
const NAME_RX = /^[\p{L}][\p{L}\s.'’-]*$/u;
const looksName = v => { v = String(v || '').trim(); return NAME_RX.test(v) && v.split(/\s+/).length >= 2 && v.length <= 60; };

/* Từ các hàng của bảng tính/văn bản, tìm cột họ tên và lấy danh sách tên */
function namesFromRows(rows) {
  const norm = v => String(v || '').trim().toLowerCase();
  let hi = -1, full = -1, ho = -1, ten = -1;
  for (let r = 0; r < Math.min(rows.length, 8) && hi < 0; r++) {
    rows[r].forEach((c, j) => {
      const v = norm(c);
      if (/^(họ (và )?tên( học sinh)?|họ tên|tên học sinh|học sinh|full ?name)$/.test(v)) { full = j; hi = r; }
      else if (/^họ( và tên)? ?(đệm|lót)$|^họ$/.test(v)) { ho = j; hi = r; }
      else if (/^tên$/.test(v)) { ten = j; hi = r; }
    });
  }
  const body = rows.slice(hi + 1);
  let get;
  if (full >= 0) get = r => r[full];
  else if (ho >= 0 && ten >= 0) get = r => `${r[ho] || ''} ${r[ten] || ''}`;
  else {
    // không có tiêu đề: chọn cột có nhiều ô "giống họ tên" nhất
    const n = Math.max(...rows.map(r => r.length));
    let best = 0, bestN = -1;
    for (let j = 0; j < n; j++) {
      const k = rows.filter(r => looksName(r[j])).length;
      if (k > bestN) { best = j; bestN = k; }
    }
    // trường hợp họ và tên ở hai cột liền nhau (họ đệm | tên): cột sau toàn là một từ
    const oneWord = v => /^[\p{L}]+$/u.test(String(v || '').trim()) && !/^(nam|nữ|nu|nư)$/i.test(String(v).trim());
    const named = rows.filter(r => looksName(r[best]) || oneWord(r[best]));
    const split = named.filter(r => oneWord(r[best + 1])).length;
    const avgWords = named.reduce((a, r) => a + String(r[best] || '').trim().split(/\s+/).length, 0) / (named.length || 1);
    get = named.length && split >= named.length * 0.7 && avgWords <= 2.5
      ? r => `${r[best] || ''} ${r[best + 1] || ''}` : r => r[best];
  }
  return body.map(r => String(get(r) || '').replace(/\s+/g, ' ').trim()).filter(looksName);
}

/* Làm sạch danh sách dán vào: bỏ số thứ tự, dòng tiêu đề, dòng không có chữ */
function cleanNames(text) {
  return String(text || '').split('\n')
    .map(x => x.split('\t').map(c => c.replace(/^\s*\d+[\.\)\-\s]+/, '').trim()).find(c => /^\p{L}/u.test(c)) || '')
    .map(x => x.replace(/\s+/g, ' ').trim())
    .filter(x => /\p{L}/u.test(x) && !/^(stt|tt|số tt|họ( và)? tên.*|họ|tên|học sinh|danh sách.*|lớp\b.*|ghi chú)$/i.test(x));
}

function rosterDialog(cur = null, onDone = () => { }) {
  const m = modal(cur ? `✏️ Sửa danh sách lớp ${esc(cur.class_name)}` : '⬆ Tải danh sách lớp', `
    <div class="fields" style="grid-template-columns:1fr 2fr">
      <div><label class="f">Tên lớp</label><input id="rsC" value="${esc(cur?.class_name || '')}" placeholder="VD: 10A1" maxlength="40"></div>
      <div><label class="f">Chọn file danh sách (Excel .xlsx, Word .docx, .csv, .txt)</label>
        <input type="file" id="rsF" accept=".xlsx,.docx,.csv,.txt,.xls"></div>
    </div>
    <div class="field" style="margin-top:10px"><label class="f">Danh sách học sinh – mỗi dòng một tên <span class="muted" id="rsN"></span></label>
      <textarea id="rsT" style="min-height:260px" placeholder="Nguyễn Văn An&#10;Trần Thị Bình&#10;…">${esc((cur?.names || []).join('\n'))}</textarea>
      <div class="small muted">Có thể dán thẳng cột "Họ và tên" copy từ Excel / sổ điểm điện tử. App tự bỏ dòng tiêu đề, số thứ tự và tên trùng.</div></div>`,
    { buttons: `<button data-c>Huỷ</button><button class="pri" id="rsS">💾 Lưu danh sách</button>` });
  m.querySelector('[data-c]').onclick = closeModal;
  const count = () => {
    const n = cleanNames($('#rsT').value).length;
    $('#rsN').textContent = n ? `(${n} học sinh)` : '';
  };
  $('#rsT').oninput = count; count();
  $('#rsF').onchange = async e => {
    const f = e.target.files[0];
    if (!f) return;
    if (!$('#rsC').value.trim()) {
      const g = f.name.match(/(1[0-2])\s*([A-Za-zĐđ]+\s*\d*)/);
      if (g) $('#rsC').value = (g[1] + g[2]).replace(/\s+/g, '').toUpperCase();
    }
    try {
      const b64 = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(f); });
      const { rows } = await T('/api/file-rows', { method: 'POST', body: { filename: f.name, data: b64 } });
      const names = namesFromRows(rows);
      if (!names.length) return toast('Không tìm thấy cột họ tên trong file. Hãy dán danh sách vào ô bên dưới.', true);
      $('#rsT').value = names.join('\n'); count();
      toast(`Đã đọc ${names.length} học sinh từ ${f.name}`);
    } catch (err) { fail(err); }
  };
  $('#rsS').onclick = e => busy(e.target, async () => {
    const lines = cleanNames($('#rsT').value);
    const r = await T('/api/rosters', { method: 'PUT', body: { class_name: $('#rsC').value, names: lines, old_name: cur?.class_name } });
    closeModal(); toast(`Đã lưu lớp ${r.class_name}: ${r.count} học sinh`); onDone(r);
  });
}

/* ---------- Chương trình (bài học & mốc kiểm tra) ---------- */
let currGrade = 10;
addRoute(/^\/teacher\/curriculum$/, async () => {
  if (!needTeacher()) return;
  const curr = await curriculum(true);
  const topics = curr.filter(t => t.grade == currGrade);
  app().innerHTML = teacherShell('curriculum', `<div class="row between"><h1>🗂️ Chương trình</h1>
    <div class="row">${[10, 11, 12].map(g => `<button class="${g == currGrade ? 'pri' : ''}" data-g="${g}">Lớp ${g}</button>`).join('')}</div></div>
    <p class="muted">Danh sách bài theo SGK Kết nối tri thức (định hướng Tin học ứng dụng) – thầy cô kiểm tra lại, sửa tên, thêm bớt bài cho đúng với kế hoạch dạy học.
    Cột <b>Mốc kiểm tra</b> quyết định bài thuộc phạm vi ôn thi giữa kì / cuối kì nào.</p>
    ${topics.map(t => `<div class="card"><h3>${esc(t.code)}: ${esc(t.name)}</h3>
      <table class="list"><tr><th>Bài</th><th style="width:230px">Mốc kiểm tra</th><th style="width:80px">Số câu</th><th style="width:50px"></th></tr>
      ${t.lessons.map(l => `<tr><td><input class="lN" data-id="${l.id}" value="${esc(l.name)}"></td>
        <td><select class="lP" data-id="${l.id}">${Object.entries(PERIOD_NAMES).map(([k, n]) => `<option value="${k}" ${l.period === k ? 'selected' : ''}>${n}</option>`).join('')}</select></td>
        <td>${l.qcount}</td><td><button class="sm danger" data-del="${l.id}">✕</button></td></tr>`).join('')}</table>
      <form class="row lAdd" data-t="${t.id}" style="margin-top:8px"><input name="n" placeholder="Thêm bài mới, VD: Bài 35. …" style="flex:1"><button>➕ Thêm bài</button></form></div>`).join('')}
    <form class="card row" id="tAdd"><input name="n" placeholder="Thêm chủ đề mới cho lớp ${currGrade}" style="flex:1"><button>➕ Thêm chủ đề</button></form>`);
  $$('[data-g]').forEach(b => b.onclick = () => { currGrade = +b.dataset.g; render(); });
  $$('.lN').forEach(i => i.onchange = () => T('/api/lessons/' + i.dataset.id, { method: 'PUT', body: { name: i.value } }).then(() => toast('Đã đổi tên')).catch(fail));
  $$('.lP').forEach(i => i.onchange = () => T('/api/lessons/' + i.dataset.id, { method: 'PUT', body: { period: i.value } }).then(() => toast('Đã lưu')).catch(fail));
  $$('[data-del]').forEach(b => b.onclick = async () => {
    if (!await confirmBox('Xoá bài học này?')) return;
    try { await T('/api/lessons/' + b.dataset.del, { method: 'DELETE' }); CURR = null; render(); } catch (e) { fail(e); }
  });
  $$('.lAdd').forEach(f => f.onsubmit = async e => {
    e.preventDefault();
    try { await T('/api/lessons', { method: 'POST', body: { topic_id: +f.dataset.t, name: f.n.value } }); CURR = null; render(); } catch (err) { fail(err); }
  });
  $('#tAdd').onsubmit = async e => {
    e.preventDefault();
    try { await T('/api/topics', { method: 'POST', body: { grade: currGrade, name: e.target.n.value } }); CURR = null; render(); } catch (err) { fail(err); }
  };
});

/* ---------- Cài đặt ---------- */
addRoute(/^\/teacher\/settings$/, async () => {
  if (!needTeacher()) return;
  const st = await T('/api/settings');
  app().innerHTML = teacherShell('settings', `<h1>⚙️ Cài đặt</h1>
    <div class="card"><h3>🤖 Trí tuệ nhân tạo (Google Gemini)</h3>
      <p class="small muted">Dùng để soạn câu hỏi, tách câu hỏi từ đề có sẵn, chấm tự luận và tạo câu hỏi luyện tập mới.
      Lấy API key miễn phí tại <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">aistudio.google.com/apikey</a> (đăng nhập tài khoản Google → Create API key).</p>
      <div class="field"><label class="f">Gemini API key ${st.gemini_key_set ? `<span class="badge g">Đã lưu ${esc(st.gemini_key_hint)}</span>` : st.env_key ? '<span class="badge g">Lấy từ biến môi trường</span>' : '<span class="badge r">Chưa có</span>'}</label>
        <input id="kKey" type="password" placeholder="${st.gemini_key_set ? 'Để trống nếu không đổi' : 'Dán API key vào đây'}" autocomplete="off"></div>
      <div class="fields"><div><label class="f">Model</label><input id="kModel" value="${esc(st.gemini_model)}"><div class="small muted">Mặc định: gemini-2.5-flash</div></div></div>
      <label class="row" style="margin-top:10px"><input type="checkbox" id="kStu" ${st.student_ai ? 'checked' : ''}> Cho học sinh dùng AI khi luyện tập (chấm tự luận, tạo câu hỏi mới)</label>
      <div class="row end" style="margin-top:12px">${st.gemini_key_set ? '<button class="danger" id="kDel">Xoá key</button>' : ''}<button id="kTest">🔌 Kiểm tra kết nối</button><button class="pri" id="kSave">💾 Lưu</button></div></div>
    <div class="card"><h3>🏫 Thông tin</h3><div class="field"><label class="f">Tên trường / lớp (hiện ở trang chủ)</label><input id="kSchool" value="${esc(st.school)}"></div>
      <div class="row end"><button class="pri" id="kSave2">💾 Lưu</button></div></div>
    <div class="card"><h3>🔑 Đổi mật khẩu giáo viên</h3><div class="fields"><div><label class="f">Mật khẩu cũ</label><input type="password" id="pOld"></div>
      <div><label class="f">Mật khẩu mới</label><input type="password" id="pNew"></div></div><div class="row end" style="margin-top:10px"><button id="pGo">Đổi mật khẩu</button></div></div>`);
  $('#kSave').onclick = e => busy(e.target, async () => {
    const body = { gemini_model: $('#kModel').value, student_ai: $('#kStu').checked };
    if ($('#kKey').value.trim()) body.gemini_key = $('#kKey').value.trim();
    await T('/api/settings', { method: 'PUT', body }); toast('Đã lưu'); render();
  });
  if ($('#kDel')) $('#kDel').onclick = async () => { if (await confirmBox('Xoá Gemini API key?')) { await T('/api/settings', { method: 'PUT', body: { gemini_key: '' } }); render(); } };
  $('#kSave2').onclick = e => busy(e.target, async () => { await T('/api/settings', { method: 'PUT', body: { school: $('#kSchool').value } }); toast('Đã lưu'); });
  $('#kTest').onclick = e => busy(e.target, async () => { const r = await T('/api/settings/test-ai', { method: 'POST', body: {} }); toast('✅ Kết nối Gemini thành công: ' + r.message); }, '⏳ Đang thử…');
  $('#pGo').onclick = e => busy(e.target, async () => {
    const r = await T('/api/teacher/password', { method: 'POST', body: { old: $('#pOld').value, new: $('#pNew').value } });
    store.set('tToken', r.token); toast('Đã đổi mật khẩu'); $('#pOld').value = $('#pNew').value = '';
  });
});
