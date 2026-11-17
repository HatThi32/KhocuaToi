/* ====== Trình chiếu trên lớp (giáo viên) & tham gia trực tiếp (học sinh) ====== */
async function presentDialog(setId) {
  const m = modal('📺 Trình chiếu bộ đề', `
    <div class="grid" style="grid-template-columns:1fr 1fr">
      <label class="card choice"><input type="radio" name="pm" value="group" checked> <b>👥 Cả lớp trả lời</b>
        <p class="small muted">Chiếu câu hỏi lên bảng, học sinh trả lời miệng / giơ tay / bảng con. Có nút gọi tên ngẫu nhiên.</p></label>
      <label class="card choice"><input type="radio" name="pm" value="individual"> <b>📱 Từng học sinh trả lời</b>
        <p class="small muted">Học sinh dùng điện thoại vào mã phòng, trả lời trực tiếp; xem thống kê và bảng xếp hạng.</p></label>
    </div>
    <div class="field" style="margin-top:12px"><label class="f">Thời gian mỗi câu (giây)</label><input type="number" id="pmT" value="30" min="5" style="max-width:140px"></div>`,
    { buttons: `<button data-c>Huỷ</button><button class="pri" id="pmGo">▶ Bắt đầu trình chiếu</button>` });
  m.querySelector('[data-c]').onclick = closeModal;
  $('#pmGo').onclick = e => busy(e.target, async () => {
    const r = await T('/api/live', { method: 'POST', body: { set_id: setId, mode: $('input[name=pm]:checked').value, time_limit: +$('#pmT').value } });
    closeModal();
    go('#/present/' + r.code);
  });
}

/* ====== Âm thanh trình chiếu (tạo trực tiếp bằng Web Audio, không cần file) ====== */
const SFX = {
  ctx: null,
  on() { return store.get('sound') !== 'off'; },
  toggle() { store.set('sound', this.on() ? 'off' : 'on'); return this.on(); },
  ac() {
    if (!this.on()) return null;
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    if (!this.ctx) this.ctx = new C();
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  },
  tone(f, t0, dur, type = 'sine', vol = 0.25, f2 = null) {
    const a = this.ac(); if (!a) return;
    const t = a.currentTime + t0, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination); o.start(t); o.stop(t + dur + 0.05);
  },
  click() { this.tone(880, 0, 0.09, 'triangle', 0.22, 1320); },
  tick() { this.tone(1200, 0, 0.04, 'square', 0.06); },
  ok() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.08 + i * 0.11, i === 3 ? 0.5 : 0.18, 'triangle', 0.3)); this.tone(1568, 0.55, 0.35, 'sine', 0.12); },
  bad() { this.tone(330, 0.05, 0.28, 'sawtooth', 0.16, 220); this.tone(220, 0.36, 0.5, 'sawtooth', 0.16, 130); },
  fanfare() { [[392, 0], [523, 0.12], [659, 0.24], [784, 0.36], [659, 0.5], [784, 0.62]].forEach(([f, t], i) => this.tone(f, t, i === 5 ? 0.6 : 0.14, 'triangle', 0.28)); },
};

/* Hiển thị câu hỏi cỡ lớn trên máy chiếu.
   pick: lựa chọn của lớp mà giáo viên đã bấm (mcq: chỉ số; tf: {i: true/false}; order: mảng các mục) */
function presentQuestionHTML(q, reveal, st, pick, canPick) {
  const d = q.data || {};
  const t = q.type;
  let ok = null, verdict = '';
  let h = `<div class="qtext">${fmt(q.content).replace(/_{3,}/g, '______')}</div>`;
  const res = pick && typeof pick === 'object' && 'frac' in pick ? pick : null;   // kết quả chấm câu tự nhập
  if (res && reveal) {
    ok = res.frac >= 1;
    verdict = ok ? '🎉 CHÍNH XÁC!' : res.frac > 0 ? `🟡 ĐÚNG MỘT PHẦN (${Math.round(res.frac * 100)}%)` : '❌ CHƯA ĐÚNG!';
  }
  const same = (a, b) => String(a ?? '').trim().toLowerCase().replace(/\s+/g, ' ') === String(b ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  if (t === 'fill') h = `<div class="qtext">${fmt(q.content, true).replace(/<input[^>]*data-blank="(\d+)"[^>]*>/g, (_, i) => {
    if (reveal) {
      const mine = res && Array.isArray(res.ans) ? res.ans[+i] : null;
      const good = mine != null && d.blanks[+i].split('|').some(x => same(x, mine));
      return `${mine != null && !good ? `<s class="bad-ans">${esc(mine || '…')}</s> ` : ''}<span style="color:#fde047;border-bottom:3px solid #fde047;padding:0 6px">${esc(d.blanks[+i].split('|')[0])}</span>${mine != null ? (good ? ' ✔' : ' ✘') : ''}`;
    }
    return canPick ? `<input class="pblank" data-b="${i}" placeholder="(${+i + 1})" autocomplete="off" spellcheck="false">`
      : `<span style="display:inline-block;min-width:120px;border-bottom:3px solid #94a3b8">&nbsp;(${+i + 1})&nbsp;</span>`;
  })}</div>`;
  if (t === 'fill' && !reveal && canPick) h += `<div class="row center-row"><span class="phint">⌨ Gõ câu trả lời của lớp vào các chỗ trống rồi bấm kiểm tra</span><button class="pri big" id="pChk">✔ Kiểm tra</button></div>`;
  if (t === 'mcq') {
    const picked = Number.isInteger(pick) ? pick : null;
    if (reveal && picked !== null) {
      ok = picked === d.answer;
      verdict = ok ? '🎉 CHÍNH XÁC!' : `❌ CHƯA ĐÚNG! Đáp án đúng là <b>${LETTERS[d.answer]}</b>`;
    }
    h += `<div class="popts">${q.options.map((o, i) => {
      let cls = '', mark = '';
      if (reveal) {
        if (i === d.answer) { cls = 'win' + (i === picked ? ' right' : ''); mark = i === picked ? '✔ ĐÚNG' : (picked !== null ? '✔ Đáp án đúng' : ''); }
        else if (i === picked) { cls = 'wrong chosen'; mark = '✘ SAI'; }
        else cls = 'dim';
      } else if (canPick) cls = 'pick';
      const cnt = st && st.options && reveal ? `<span class="cnt">${st.options[i]}</span>` : '';
      return `<div class="popt p${'abcd'[i % 4]} ${cls}" data-i="${i}"><span class="k">${LETTERS[i]}</span><span>${fmtInline(o)}</span>${cnt}<span class="mark">${mark}</span></div>`;
    }).join('')}</div>`;
    if (!reveal && canPick) h += `<div class="phint">👆 Bấm vào phương án học sinh chọn để kiểm tra</div>`;
  } else if (t === 'tf') {
    const pk = pick && typeof pick === 'object' ? pick : {};
    const n = Object.keys(pk).length;
    if (reveal && n) {
      const wrong = q.statements.filter((_, i) => i in pk && pk[i] !== !!d.answers[i]).length;
      ok = wrong === 0;
      verdict = ok ? '🎉 CHÍNH XÁC CẢ ' + n + ' Ý!' : `❌ CÓ ${wrong} Ý CHƯA ĐÚNG – xem lại các ý đánh dấu ✘`;
    }
    h += `<table class="ptf">${q.statements.map((s, i) => {
      const mine = i in pk ? (pk[i] ? 'Đ' : 'S') : null;
      const right = mine !== null && pk[i] === !!d.answers[i];
      let cell;
      if (reveal) cell = `<td class="ans" style="color:${d.answers[i] ? '#4ade80' : '#f87171'}">${d.answers[i] ? 'ĐÚNG' : 'SAI'}</td>
        ${mine !== null ? `<td class="small" style="white-space:nowrap;color:${right ? '#4ade80' : '#f87171'}">Lớp chọn ${mine} ${right ? '✔' : '✘'}</td>` : ''}`;
      else cell = canPick ? `<td class="ans" style="white-space:nowrap;width:auto"><button class="tfb t" data-s="${i}" data-v="1">Đ</button> <button class="tfb f" data-s="${i}" data-v="0">S</button> <span class="mark"></span></td>`
        : '<td class="ans muted">Đ / S</td>';
      return `<tr class="${reveal && mine !== null && !right ? 'bad' : ''}"><td><b>${'abcd'[i]})</b> ${fmtInline(s)}</td>${cell}
      ${reveal && st && st.true_counts ? `<td class="small muted" style="white-space:nowrap">Đ: ${st.true_counts[i]} · S: ${st.false_counts[i]}</td>` : ''}</tr>`;
    }).join('')}</table>`;
    if (!reveal && canPick) h += `<div class="phint">👆 Bấm <b>Đ</b> hoặc <b>S</b> theo câu trả lời của lớp cho từng ý – chọn đủ ${q.statements.length} ý sẽ tự hiện kết quả</div>`;
  } else if (t === 'short' && !reveal && canPick) {
    h += `<div class="row center-row"><input id="pAns" class="pinput" placeholder="Gõ câu trả lời của lớp…" autocomplete="off" spellcheck="false">
      <button class="pri big" id="pChk">✔ Kiểm tra</button></div>`;
  } else if (t === 'short' && reveal) {
    if (res) h += `<div style="font-size:clamp(22px,2.6vw,36px)">Lớp trả lời: <b style="color:${ok ? '#4ade80' : '#f87171'}">${esc(res.ans) || '…'}</b> ${ok ? '✔' : '✘'}</div>`;
    h += `<div style="font-size:clamp(26px,3vw,42px)">Đáp án: <b style="color:#fde047">${esc(d.answer)}</b></div>`;
  } else if (t === 'order') {
    if (!reveal) {
      h += `<ul class="porder">${q.items.map((it, k) => `<li data-k="${k}"><span class="grip">⠿</span><b>${String.fromCharCode(65 + k)}.</b><span class="t">${esc(it)}</span></li>`).join('')}</ul>`;
      if (canPick) h += `<div class="row center-row"><span class="phint">✋ Kéo thả các dòng theo thứ tự lớp đưa ra – hoặc gõ thứ tự:</span>
        <input id="pOrd" class="pinput" style="max-width:260px" placeholder="Gõ chữ cái, cách nhau dấu cách" autocomplete="off">
        <button class="pri big" id="chkOrder">✔ Kiểm tra thứ tự</button></div>`;
    } else {
      if (res && Array.isArray(res.ans)) {
        if (!ok) verdict = '❌ CHƯA ĐÚNG THỨ TỰ – so sánh với thứ tự đúng bên phải';
        h += `<div class="popts" style="grid-template-columns:1fr 1fr;align-items:start"><div><div class="muted">Lớp sắp xếp:</div>${res.ans.map((it, i) =>
          `<div class="ochip ${it === d.items[i] ? 'okk' : 'nok'}"><b>${i + 1}.</b> ${esc(it)} <span>${it === d.items[i] ? '✔' : '✘'}</span></div>`).join('')}</div>
          <div><div class="muted">Thứ tự đúng:</div>${d.items.map((it, i) => `<div class="ochip okk"><b>${i + 1}.</b> ${esc(it)}</div>`).join('')}</div></div>`;
      } else {
        h += `<div><div class="muted">Thứ tự đúng:</div>${d.items.map((it, i) => `<div class="ochip okk"><b>${i + 1}.</b> ${esc(it)}</div>`).join('')}</div>`;
      }
    }
  } else if (t === 'match') {
    const L = 'abcdefgh';
    if (reveal) {
      h += `<table class="ptf">${d.pairs.map((p, i) => {
        const mine = res && Array.isArray(res.ans) ? res.ans[i] : null;
        const good = mine === p[1];
        return `<tr class="${mine != null && !good ? 'bad' : ''}"><td>${i + 1}. ${fmtInline(p[0])}</td><td style="color:#fde047">→ ${fmtInline(p[1])}</td>
          ${mine != null ? `<td class="small" style="white-space:nowrap;color:${good ? '#4ade80' : '#f87171'}">${good ? '✔ Lớp ghép đúng' : '✘ Lớp ghép: ' + (mine ? fmtInline(mine) : '—')}</td>` : ''}</tr>`;
      }).join('')}</table>`;
    } else {
      h += `<div class="popts" style="grid-template-columns:1fr 1fr;align-items:start"><div>${q.lefts.map((l, i) => `<div class="mrow"><span class="chip" style="display:block;border-radius:10px;flex:1">${i + 1}. ${fmtInline(l)}</span>
          ${canPick ? `<select class="psel" data-m="${i}"><option value="">?</option>${q.rights.map((_, j) => `<option value="${j}">${L[j]}</option>`).join('')}</select>` : ''}</div>`).join('')}</div>
         <div>${q.rights.map((r, i) => `<div class="chip" style="display:block;border-radius:10px">${L[i]}. ${fmtInline(r)}</div>`).join('')}</div></div>`;
      if (canPick) h += `<div class="row center-row"><span class="phint">👉 Chọn chữ cái ghép với từng ý theo câu trả lời của lớp</span><button class="pri big" id="pChk">✔ Kiểm tra</button></div>`;
    }
  } else if (t === 'essay' && reveal && d.sample) {
    h += `<div class="expl big"><b>Gợi ý trả lời:</b><div style="white-space:pre-wrap">${esc(d.sample)}</div></div>`;
  }
  if (reveal && st && st.texts && st.texts.length) {
    h += `<div><div class="muted">Câu trả lời của học sinh:</div>${st.texts.map(x => `<span class="chip">${esc(x)}</span>`).join('')}</div>`;
  }
  if (verdict) h += `<div class="verdict ${ok ? 'ok' : res && res.frac > 0 ? 'part' : 'bad'}">${verdict}</div>`;
  if (reveal && q.explanation) h += `<div class="expl big ${ok === false ? 'bad' : ''}">${ok === false ? '<div class="eh">📢 Cả lớp cùng chú ý – vì sao?</div>' : ''}💡 ${fmt(q.explanation)}</div>`;
  return h;
}

/* Kéo thả để sắp xếp các <li data-k> trong một danh sách (chuột và màn hình cảm ứng) */
function sortable(list, done = () => { }) {
  list.addEventListener('pointerdown', e => {
    const li = e.target.closest('li');
    if (!li || !list.contains(li) || e.target.closest('button') || e.button > 0) return;
    e.preventDefault();
    const y0 = e.clientY;
    let moved = false;
    try { li.setPointerCapture(e.pointerId); } catch { }
    const pid = e.pointerId;
    const move = ev => {
      if (ev.pointerId !== pid) return;
      if (!moved && Math.abs(ev.clientY - y0) < 4) return;
      moved = true;
      li.classList.add('dragging');
      const after = [...list.children].filter(x => x !== li)
        .find(x => { const r = x.getBoundingClientRect(); return ev.clientY < r.top + r.height / 2; });
      if (after) { if (li.nextElementSibling !== after) list.insertBefore(li, after); }
      else if (list.lastElementChild !== li) list.appendChild(li);
    };
    const up = ev => {
      if (ev && ev.type === 'pointerup' && Math.abs(ev.clientY - y0) >= 4) move(ev);  // tính cả vị trí lúc thả tay
      if (ev && ev.pointerId !== pid) return;
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      li.classList.remove('dragging');
      if (moved) done([...list.children].map(x => +x.dataset.k));
    };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
  });
  list.addEventListener('dragstart', e => e.preventDefault());
}

addRoute(/^\/present\/(\d+)$/, async code => {
  if (!needTeacher()) return;
  let key = '', st = null, timer = null, stopped = false, autoRevealed = -1;
  const picks = {};   // lựa chọn của lớp theo từng câu (chế độ cả lớp)
  const joinUrl = `${location.origin}/#/live/${code}`;
  const ctl = action => T(`/api/live/${code}/control`, { method: 'POST', body: { action } }).then(poll).catch(fail);
  app().innerHTML = `<div class="present"><div class="pbar" id="pbar"></div><div class="stage" id="stage"></div></div>`;

  const bar = () => {
    const s = st;
    const inQ = s.state === 'question' || s.state === 'reveal';
    $('#pbar').innerHTML = `<b style="font-size:18px">${esc(s.title)}</b>
      <span class="muted">${s.mode === 'individual' ? '📱 Mã phòng <b style="color:#fde047">' + code + '</b>' : '👥 Cả lớp'}</span>
      ${inQ ? `<span class="badge" style="font-size:15px">Câu ${s.idx + 1}/${s.total}</span>` : ''}
      <span class="grow"></span>
      ${inQ ? `<span class="timer" id="tmr"></span>` : ''}
      ${s.mode === 'individual' && inQ ? `<span id="ansCount" class="muted"></span>` : ''}
      ${s.state === 'lobby' ? `<button class="pri" data-a="start">▶ Bắt đầu</button>` : ''}
      ${inQ ? `<button data-a="prev" ${s.idx ? '' : 'disabled'}>◀</button>` : ''}
      ${s.state === 'question' ? `<button class="ok" data-a="reveal">👁 Hiện đáp án</button>` : ''}
      ${s.state === 'reveal' ? `<button class="pri" data-a="next">${s.idx + 1 < s.total ? 'Câu tiếp ▶' : 'Kết thúc 🏁'}</button>` : ''}
      ${s.state === 'question' ? `<button data-a="next" title="Bỏ qua">⏭</button>` : ''}
      <button id="pick">🎲 Gọi tên</button><button id="snd" title="Bật/tắt âm thanh">${SFX.on() ? '🔊' : '🔇'}</button><button id="fs">⛶</button>
      ${s.state !== 'ended' ? `<button data-a="end" title="Kết thúc">✕</button>` : `<button onclick="history.back()">↩ Quay lại</button>`}`;
    $$('#pbar [data-a]').forEach(b => b.onclick = async () => {
      if (b.dataset.a === 'end' && !await confirmBox('Kết thúc phiên trình chiếu?')) return;
      ctl(b.dataset.a);
    });
    $('#fs').onclick = () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => { });
    $('#pick').onclick = randomPicker;
    $('#snd').onclick = () => { $('#snd').textContent = SFX.toggle() ? '🔊' : '🔇'; SFX.click(); };
  };

  const stage = () => {
    const s = st;
    let h = '';
    if (s.state === 'lobby') {
      h = s.mode === 'individual'
        ? `<div class="center"><div class="muted" style="font-size:24px">Mở trình duyệt, vào <b style="color:#f8fafc">${esc(location.host)}</b> → <b>Vào phòng học</b> và nhập mã</div>
            <div class="bigcode">${code}</div><div class="muted">hoặc mở: ${esc(joinUrl)}</div>
            <div style="margin-top:20px;font-size:22px">👥 <b id="pc">${s.players}</b> học sinh đã vào</div><div id="names" style="margin-top:10px"></div></div>`
        : `<div class="center" style="margin-top:8vh"><div style="font-size:48px;font-weight:800">${esc(s.title)}</div>
            <div class="muted" style="font-size:24px;margin-top:10px">${s.total} câu hỏi · cả lớp cùng trả lời</div>
            <div class="muted" style="margin-top:30px">Bấm <b>▶ Bắt đầu</b> hoặc phím → để chiếu câu đầu tiên</div></div>`;
    } else if (s.state === 'ended') {
      h = `<div class="center"><div style="font-size:48px;font-weight:800">🏁 Hoàn thành!</div>
        ${s.leaderboard?.length ? `<h2 style="margin-top:20px">🏆 Bảng xếp hạng</h2><table class="lb">${s.leaderboard.map((p, i) =>
          `<tr><td>${['🥇', '🥈', '🥉'][i] || i + 1}</td><td>${esc(p.name)}</td><td style="text-align:right;font-weight:800">${p.score}</td></tr>`).join('')}</table>` : ''}</div>`;
    } else if (s.question) {
      const reveal = s.state === 'reveal';
      const group = s.mode !== 'individual';
      if (!reveal) delete picks[s.idx];
      h = `<div class="row">${qBadges(s.question)}</div>${presentQuestionHTML(s.question, reveal, group ? null : s.stats, picks[s.idx], group && !!s.question.data)}`;
      if (reveal) h += `<div class="center" style="margin-top:6px"><button class="pri big nextbig" data-a="next">${s.idx + 1 < s.total ? 'Câu tiếp theo ▶' : 'Kết thúc 🏁'}</button></div>`;
      if (reveal && s.leaderboard?.length) h += `<details style="margin-top:10px"><summary class="muted">🏆 Bảng xếp hạng tạm thời</summary><table class="lb">${s.leaderboard.slice(0, 5).map((p, i) =>
        `<tr><td>${i + 1}</td><td>${esc(p.name)}</td><td style="text-align:right">${p.score}</td></tr>`).join('')}</table></details>`;
    }
    $('#stage').innerHTML = h;
    $$('#stage [data-a]').forEach(b => b.onclick = () => ctl(b.dataset.a));
    const vd = $('#stage .verdict');
    if (vd && s.state === 'reveal') setTimeout(() => vd.classList.contains('ok') ? SFX.ok() : SFX.bad(), 120);
    // Giáo viên bấm đáp án của lớp -> dừng giờ, hiện kết quả, lời giải và nút câu tiếp
    const q = s.question, d = q && q.data;
    if (s.state === 'question' && d && s.mode !== 'individual') {
      const done = v => { picks[s.idx] = v; SFX.click(); ctl('reveal'); };
      $$('#stage .popt.pick').forEach(el => el.onclick = () => done(+el.dataset.i));
      const tfp = {};
      $$('#stage .tfb').forEach(b => b.onclick = () => {
        const i = +b.dataset.s, v = b.dataset.v === '1';
        tfp[i] = v;
        SFX.click();
        const right = v === !!d.answers[i];
        const m = b.parentElement.querySelector('.mark');
        m.textContent = right ? '✔' : '✘';
        m.style.color = right ? '#4ade80' : '#f87171';
        $$(`#stage .tfb[data-s="${i}"]`).forEach(x => x.classList.toggle('on', x === b));
        if (Object.keys(tfp).length === q.statements.length) setTimeout(() => done({ ...tfp }), 600);
      });
      // các dạng tự nhập: gửi lên máy chủ chấm rồi hiện kết quả
      const check = async (ans, btn) => {
        btn.disabled = true;
        try { const r = await T('/api/check', { method: 'POST', body: { question_id: q.id, answer: ans } }); done({ ans, frac: r.frac ?? 0 }); }
        catch (e) { btn.disabled = false; fail(e); }
      };
      if (q.type === 'short') {
        const inp = $('#pAns'); inp.focus();
        $('#pChk').onclick = e => { if (!inp.value.trim()) return toast('Hãy gõ câu trả lời của lớp', true); check(inp.value.trim(), e.currentTarget); };
        inp.onkeydown = e => { if (e.key === 'Enter') $('#pChk').click(); };
      }
      if (q.type === 'fill') {
        const ins = $$('#stage .pblank'); if (ins[0]) ins[0].focus();
        ins.forEach((x, i) => x.onkeydown = e => { if (e.key === 'Enter') (ins[i + 1] ? ins[i + 1].focus() : $('#pChk').click()); });
        $('#pChk').onclick = e => check(ins.map(x => x.value.trim()), e.currentTarget);
      }
      if (q.type === 'match') {
        $('#pChk').onclick = e => {
          const ans = $$('#stage .psel').map(x => x.value === '' ? '' : q.rights[+x.value]);
          if (ans.every(x => !x)) return toast('Hãy chọn chữ cái cho các ý', true);
          check(ans, e.currentTarget);
        };
      }
      const ol = $('#stage .porder');
      if (ol) {
        sortable(ol, () => { $('#pOrd').value = $$('#stage .porder li').map(li => String.fromCharCode(65 + +li.dataset.k)).join(' '); });
        $('#pOrd').onkeydown = e => { if (e.key === 'Enter') $('#chkOrder').click(); };
        $('#chkOrder').onclick = e => {
          let order = $$('#stage .porder li').map(li => +li.dataset.k);
          const typed = $('#pOrd').value.toUpperCase().match(/[A-H]/g);
          if (typed && typed.length) {
            const ks = typed.map(c => c.charCodeAt(0) - 65);
            if (ks.length !== q.items.length || new Set(ks).size !== ks.length || ks.some(k => k >= q.items.length))
              return toast(`Thứ tự phải gồm đủ ${q.items.length} chữ cái khác nhau, VD: ${q.items.map((_, k) => String.fromCharCode(65 + k)).join(' ')}`, true);
            order = ks;
          }
          check(order.map(k => q.items[k]), e.currentTarget);
        };
      }
    }
  };

  const tick = () => {
    if (!st || !(st.state === 'question' || st.state === 'reveal')) return;
    const el = $('#tmr');
    if (!el) return;
    if (st.state === 'reveal') { el.textContent = '⏸'; el.classList.remove('low'); return; }
    const left = Math.max(0, Math.ceil(st.time_limit - st.elapsed - (Date.now() / 1000 - st._at)));
    el.textContent = left;
    el.classList.toggle('low', left <= 5);
    // chế độ cá nhân: hết giờ hoặc tất cả đã trả lời thì tự hiện đáp án
    if (st.mode === 'individual' && autoRevealed !== st.idx && (left === 0 || (st.players > 0 && st.answered >= st.players))) {
      autoRevealed = st.idx;
      ctl('reveal');
    }
  };

  async function poll() {
    if (stopped) return;
    try {
      const s = await T('/api/live/' + code);
      s._at = Date.now() / 1000;
      st = s;
      const k = `${s.state}|${s.idx}`;
      if (k !== key) { key = k; bar(); stage(); }
      if (s.state === 'lobby' && $('#names')) {
        $('#pc').textContent = s.players;
        $('#names').innerHTML = (s.player_names || []).map(n => `<span class="chip">${esc(n)}</span>`).join('');
      }
      if ($('#ansCount')) $('#ansCount').innerHTML = `✋ ${s.answered ?? 0}/${s.players}`;
      if (s.mode === 'individual' && s.state === 'reveal' && s.stats && $('.popt .cnt') == null && s.question?.type === 'mcq') stage();
      tick();
    } catch (e) { if (e.status === 404) { stopped = true; fail(e); } }
  }
  const keys = e => {
    if (!st || $('#modal') || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '')) return;
    if (e.key === 'ArrowRight') ctl(st.state === 'lobby' ? 'start' : st.state === 'question' ? 'reveal' : 'next');
    if (e.key === 'ArrowLeft' && st.idx > 0) ctl('prev');
  };
  document.addEventListener('keydown', keys);
  await poll();
  timer = setInterval(poll, 1000);
  const tickT = setInterval(tick, 250);
  onLeave(() => { stopped = true; clearInterval(timer); clearInterval(tickT); document.removeEventListener('keydown', keys); });
});

/* Gọi tên ngẫu nhiên */
async function randomPicker() {
  let classes = {};
  try { classes = await T('/api/classes'); } catch { }
  const names = Object.keys(classes);
  const m = modal('🎲 Gọi tên ngẫu nhiên', `
    <div class="field"><label class="f">Lớp</label><div class="row" style="flex-wrap:nowrap"><select id="rcC">${names.map(c => `<option value="${esc(c)}" ${store.get('pickClass') === c ? 'selected' : ''}>${esc(c)} (${classes[c].length} HS)</option>`).join('')}<option value="__">Tự nhập danh sách…</option></select>
      <button id="rcUp" title="Tải danh sách lớp từ file Excel/Word hoặc dán họ tên" style="white-space:nowrap">⬆ Tải danh sách lớp</button></div></div>
    <div class="field" id="rcBox" style="display:${names.length ? 'none' : 'block'}"><label class="f">Danh sách (mỗi dòng một tên)</label><textarea id="rcList">${esc(store.get('pickList') || '')}</textarea></div>
    <label class="row"><input type="checkbox" id="rcNo" checked> Không gọi lại người đã được gọi</label>
    <div class="picked" id="rcOut" style="color:var(--pri)">?</div>`,
    { buttons: `<button data-c>Đóng</button><button class="pri" id="rcGo">🎲 Quay</button>` });
  m.querySelector('[data-c]').onclick = closeModal;
  $('#rcUp').onclick = () => { closeModal(); rosterDialog(null, r => { store.set('pickClass', r.class_name); randomPicker(); }); };
  if (!names.length) $('#rcC').value = '__';
  $('#rcC').onchange = () => $('#rcBox').style.display = $('#rcC').value === '__' ? 'block' : 'none';
  window._picked = window._picked || new Set();
  $('#rcGo').onclick = async () => {
    if ($('#rcC').value !== '__') store.set('pickClass', $('#rcC').value);
    let pool = $('#rcC').value === '__' ? $('#rcList').value.split('\n').map(s => s.trim()).filter(Boolean) : classes[$('#rcC').value] || [];
    if ($('#rcC').value === '__') store.set('pickList', $('#rcList').value);
    if ($('#rcNo').checked) { const left = pool.filter(n => !window._picked.has(n)); if (!left.length) window._picked.clear(); else pool = left; }
    if (!pool.length) return toast('Danh sách trống', true);
    const out = $('#rcOut');
    for (let i = 0; i < 18; i++) { out.textContent = pool[Math.floor(Math.random() * pool.length)]; SFX.tick(); await sleep(50 + i * 12); }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    out.textContent = '🎉 ' + pick;
    SFX.fanfare();
    window._picked.add(pick);
  };
}

/* ---------- Học sinh tham gia phòng ---------- */
addRoute(/^\/live\/(\d+)$/, async code => {
  const pkey = 'p_' + code;
  let ptoken = store.get(pkey);
  let key = '', stopped = false, ui = null, myAnswers = {};
  const wrap = inner => `<div class="topbar"><div class="in"><a class="brand" href="#/">💻 Ôn tập Tin học</a><span class="grow"></span><span class="badge">Phòng ${code}</span></div></div><div class="wrap narrow">${inner}</div>`;

  let first;
  try { first = await api('/api/live/' + code + (ptoken ? '?ptoken=' + encodeURIComponent(ptoken) : '')); }
  catch (e) { app().innerHTML = wrap(`<div class="card center"><h2>Không tìm thấy phòng ${esc(code)}</h2><p class="muted">Kiểm tra lại mã trên bảng.</p><a class="btn" href="#/">← Trang chủ</a></div>`); return; }
  if (first.mode !== 'individual') {
    app().innerHTML = wrap(`<div class="card center"><h2>👥 ${esc(first.title)}</h2><p>Phòng này trả lời tập thể – em hãy nhìn lên màn hình và trả lời theo hướng dẫn của thầy cô.</p></div>`);
    return;
  }
  if (!ptoken || !first.me) {
    app().innerHTML = wrap(`<div class="card" style="margin-top:30px"><h2>📺 ${esc(first.title)}</h2>
      <form id="jf"><div class="field"><label class="f">Tên của em (hiện trên bảng xếp hạng)</label><input name="n" maxlength="40" value="${esc(store.get('sName') || '')}" autofocus></div>
      <button class="pri big" style="width:100%;justify-content:center">Vào phòng</button></form></div>`);
    await new Promise(res => {
      $('#jf').onsubmit = async e => {
        e.preventDefault();
        try {
          const r = await api(`/api/live/${code}/join`, { method: 'POST', body: { name: e.target.n.value } });
          ptoken = r.ptoken; store.set(pkey, ptoken); store.set('sName', e.target.n.value.trim()); res();
        } catch (err) { fail(err); }
      };
    });
  }

  const draw = s => {
    const me = s.me || {};
    let h = `<div class="row between" style="margin-bottom:10px"><b>👤 ${esc(me.name || '')}</b><span class="badge b">⭐ ${me.score ?? 0} điểm · hạng ${me.rank ?? '–'}</span></div>`;
    if (s.state === 'lobby') h += `<div class="card center"><h2>✅ Đã vào phòng!</h2><p class="muted">Chờ thầy cô bắt đầu…</p><div style="font-size:40px">⏳</div></div>`;
    else if (s.state === 'ended') {
      h += `<div class="card center"><h2>🏁 Kết thúc</h2><div class="scorebig">${me.score ?? 0}</div><p>Em xếp hạng <b>${me.rank ?? '–'}</b></p></div>`;
      if (s.leaderboard?.length) h += `<div class="card"><h3>🏆 Bảng xếp hạng</h3><table class="list">${s.leaderboard.map((p, i) => `<tr><td>${i + 1}</td><td>${esc(p.name)}</td><td style="text-align:right"><b>${p.score}</b></td></tr>`).join('')}</table></div>`;
    } else if (s.state === 'question' && !me.answered) {
      h += `<div class="card"><div class="row between"><span class="badge">Câu ${s.idx + 1}/${s.total}</span><span class="badge" id="lt"></span></div>
        <div class="timerbar" style="margin:8px 0"><i id="tb" style="width:100%"></i></div><div id="qa"></div>
        <button class="pri big" id="send" style="width:100%;justify-content:center;margin-top:14px">📨 Gửi câu trả lời</button></div>`;
    } else if (s.state === 'question') {
      h += `<div class="card center"><h2>📨 Đã gửi!</h2><p class="muted">Chờ thầy cô công bố đáp án…</p></div>`;
    } else if (s.state === 'reveal') {
      const f = me.frac;
      h += `<div class="card center" style="background:${f >= 1 ? 'var(--ok-soft)' : f > 0 ? 'var(--warn-soft)' : 'var(--bad-soft)'}">
        <h2>${me.answered ? (f >= 1 ? '🎉 Chính xác!' : f > 0 ? '🟡 Đúng một phần' : '😕 Chưa đúng') : '⌛ Em chưa trả lời câu này'}</h2>
        ${me.answered ? `<div style="font-size:28px;font-weight:800">+${me.points ?? 0}</div>` : ''}</div>
        ${s.question ? `<div class="card">${qBadges(s.question)}<div class="qtext">${fmt(s.question.content)}</div>${reviewHTML(s.question, s.question.data, myAnswers[s.idx], me.answered && myAnswers[s.idx] !== undefined ? { frac: me.frac ?? 0 } : null, s.question.explanation)}</div>` : ''}`;
    }
    app().innerHTML = wrap(h);
    if (s.state === 'reveal' && me.answered) setTimeout(() => (me.frac ?? 0) >= 1 ? SFX.ok() : SFX.bad(), 100);
    if (s.state === 'question' && !me.answered && s.question) {
      const q = s.question;
      if (q.type === 'mcq') {
        // nút màu lớn kiểu trò chơi, chạm là gửi luôn
        $('#qa').innerHTML = `<div class="qtext">${fmt(q.content)}</div><div class="mopts" style="margin-top:12px">${q.options.map((o, i) =>
          `<button class="mopt p${'abcd'[i]}" data-i="${i}"><span>${LETTERS[i]}. ${fmtInline(o)}</span></button>`).join('')}</div>`;
        $('#send').style.display = 'none';
        $$('.mopt').forEach(b => b.onclick = () => send(+b.dataset.i));
      } else {
        ui = renderAnswer(q, $('#qa'));
        $('#send').onclick = () => send(ui.get());
      }
    }
  };
  const send = async ans => {
    try {
      SFX.click();
      await api(`/api/live/${code}/answer`, { method: 'POST', body: { ptoken, idx: cur.idx, answer: ans } });
      myAnswers[cur.idx] = ans;
      key = ''; poll();
    } catch (e) { fail(e); }
  };
  let cur = null;
  async function poll() {
    if (stopped) return;
    try {
      const s = await api(`/api/live/${code}?ptoken=${encodeURIComponent(ptoken)}`);
      s._at = Date.now() / 1000;
      cur = s;
      const k = `${s.state}|${s.idx}|${s.me?.answered}`;
      if (k !== key) { key = k; draw(s); }
      if (s.state === 'question' && $('#tb')) {
        const left = Math.max(0, s.time_limit - s.elapsed);
        $('#tb').style.width = (left / s.time_limit * 100) + '%';
        $('#lt').textContent = '⏱ ' + Math.ceil(left) + 's';
      }
    } catch (e) { if (e.status === 404) stopped = true; }
  }
  await poll();
  const t = setInterval(poll, 1500);
  onLeave(() => { stopped = true; clearInterval(t); });
});
