/* Giao diện: nhập đề, xáo, xem trước, in, xuất Word (.docx) và bảng đáp án */
(function () {
  'use strict';
  const X = window.XaoDe;
  const W = window.XaoDeWord;
  const { SUBJECTS, SAMPLES } = window.XaoDeSamples;
  const $ = (id) => document.getElementById(id);
  const STORE_KEY = 'xaode.v1';
  const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const DEFAULT_NOTES = '- Thí sinh không được sử dụng tài liệu.\n- Cán bộ coi thi không giải thích gì thêm.';
  const DEFAULT_LAYOUT = { fontPt: '12', lineSp: '1.15', mTop: '1.5', mBottom: '1.5', mLeft: '2', mRight: '1.5' };

  // ---------- CSS tờ đề (xem trước và in) — khớp với file Word ----------
  const EXAM_CSS = `
    .ex { font-family: "Times New Roman", Times, serif; font-size: var(--ex-fs, 12pt); line-height: var(--ex-lh, 1.15); color: #000; }
    .ex p { margin: 0; }
    .ex table { border-collapse: collapse; width: 100%; }
    .ex td { vertical-align: top; padding: 0; font-size: inherit; }
    .ex-head td { text-align: center; line-height: 1.2; }
    .ex-head .rule { width: 2.6cm; margin: 2pt auto 5pt; border-top: 1px solid #000; }
    .ex .box { display: inline-block; border: 1px solid #000; padding: 1pt 6pt; font-weight: bold; white-space: nowrap; }
    .ex-cand { margin: 6pt 0 8pt; }
    .ex-cand td.code { text-align: right; vertical-align: middle; }
    .ex-cand .line { display: flex; line-height: 1.6; }
    .ex-cand .dots { flex: 1; border-bottom: 1px dotted #000; margin: 0 12pt 5pt 2pt; }
    .ex-sec { margin-top: 8pt !important; margin-bottom: 2pt !important; text-align: justify; }
    .ex-q { margin-top: 3pt !important; text-align: justify; }
    .ex-group { text-align: justify; }
    .ex-group.t { margin-top: 5pt !important; }
    .ex-opt { margin-left: 0.5cm; width: calc(100% - 0.5cm) !important; table-layout: fixed; }
    .ex-opt td { padding-right: 3pt; }
    .ex-opt .o { display: flex; }
    .ex-opt .o > b { flex: 0 0 var(--ex-lab, 0.67cm); }
    .ex-opt .o > span { flex: 1; min-width: 0; }
    .ex-tf { display: flex; margin-left: 0.5cm !important; text-align: justify; }
    .ex-tf > span:first-child { flex: 0 0 0.6cm; }
    .ex-tf > span:last-child { flex: 1; min-width: 0; }
    .ex .center { text-align: center; }
    .ex-end { text-align: center; font-weight: bold; margin-top: 12pt !important; margin-bottom: 3pt !important; }
    .ex-note { font-style: italic; font-size: calc(var(--ex-fs, 12pt) - 1pt); }
    .ex img { max-width: 100%; vertical-align: middle; }
    .ex table.ex-data { width: auto; min-width: 60%; margin: 3pt auto 4pt; border-collapse: collapse; }
    .ex-data td { border: 1px solid #000; padding: 1pt 5pt; text-align: center; vertical-align: middle; }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = EXAM_CSS;
  document.head.appendChild(styleEl);

  // ---------- Định dạng chữ cho HTML ----------
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fmt(text, vars) {
    let s = esc(text || '');
    if (vars) Object.keys(vars).forEach((k) => (s = s.split('{' + k + '}').join(vars[k])));
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, src) => {
      if (!/^(https?:|data:image\/|\.{0,2}\/|[\w-]+\.)/i.test(src)) return m;
      const z = /^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)cm$/.exec(alt);
      return `<img src="${src}" alt=""${z ? ` style="width:${z[1]}cm;height:auto"` : ''}>`;
    });
    s = s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[^_])__([^_\n]+?)__(?!_)/g, '$1<u>$2</u>');
    return s;
  }
  // Mỗi dòng một đoạn (giống file Word)
  function paras(text, cls, prefix, vars) {
    const all = String(text || '').split('\n').filter((l) => l.trim());
    if (!all.length) all.push('');
    // Bảng số liệu: các dòng "| ô | ô |" liên tiếp
    const lines = [];
    all.forEach((l) => {
      if (W.isTableLine(l)) {
        const last = lines[lines.length - 1];
        if (last && last.rows) last.rows.push(W.splitTableLine(l)); else lines.push({ rows: [W.splitTableLine(l)] });
      } else lines.push(l);
    });
    if (prefix && lines[0].rows) lines.unshift('');
    return lines.map((l, i) => {
      if (l.rows) {
        const n = Math.max(...l.rows.map((r) => r.length));
        return '<table class="ex-data">' + l.rows.map((r) => '<tr>' +
          Array.from({ length: n }, (_, c) => `<td>${fmt(r[c] || '', vars)}</td>`).join('') + '</tr>').join('') + '</table>';
      }
      const t = l.trim();
      const center = /^\$\$[\s\S]*\$\$$/.test(t) || /^!\[[^\]]*\]\([^)]*\)$/.test(t);
      return `<p class="${cls}${center && !(i === 0 && prefix) ? ' center' : ''}">${i === 0 && prefix ? prefix : ''}${fmt(t, vars)}</p>`;
    }).join('');
  }

  // ---------- Đọc thông tin từ form ----------
  function meta() {
    const sub = SUBJECTS.find((s) => s.id === $('subject').value) || SUBJECTS[0];
    return {
      subject: $('subjectLabel').value.trim() || sub.name,
      dept: $('dept').value.trim(),
      school: $('school').value.trim(),
      examName: $('examName').value.trim(),
      year: $('year').value.trim(),
      time: $('time').value.trim(),
      docType: $('docType').value,
      notes: $('notes').value,
    };
  }
  function num(id, def, min, max) {
    const v = parseFloat(String($(id).value).replace(',', '.'));
    return isNaN(v) ? def : Math.min(max, Math.max(min, v));
  }
  function layout() {
    return {
      fontPt: num('fontPt', 12, 10, 16),
      line: num('lineSp', 1.15, 1, 2),
      top: num('mTop', 1.5, 0.5, 5),
      bottom: num('mBottom', 1.5, 0.5, 5),
      left: num('mLeft', 2, 0.5, 5),
      right: num('mRight', 1.5, 0.5, 5),
    };
  }
  function shuffleOpts() {
    return {
      shuffleQuestions: $('optQuestions').checked,
      shuffleOptions: $('optOptions').checked,
      shuffleTf: $('optTf').checked,
      shuffleInGroup: $('optInGroup').checked,
      shuffleEssay: $('optEssay').checked,
    };
  }
  function versionCodes() {
    const list = $('codeList').value.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);
    if (list.length) return [...new Set(list)];
    const n = Math.max(1, Math.min(99, parseInt($('count').value, 10) || 1));
    const start = parseInt($('startCode').value, 10);
    const s0 = isNaN(start) ? 101 : start;
    const width = String(s0).length;
    return Array.from({ length: n }, (_, i) => String(s0 + i).padStart(width, '0'));
  }
  const sectionTitle = (sec) => W.sectionTitle(sec, X.SECTION_TYPES);

  // ---------- Dựng HTML một mã đề (khớp bố cục file Word) ----------
  function renderOptionsMcq(q, L) {
    const avail = 21 - L.left - L.right - 0.5;
    const cols = W.chooseColumns(q.options.map((o) => o.text), avail, L.fontPt, 0);
    let rows = '';
    for (let i = 0; i < q.options.length; i += cols) {
      let cells = '';
      for (let c = 0; c < cols; c++) {
        const k = i + c;
        cells += `<td style="width:${100 / cols}%">` + (k < q.options.length
          ? `<div class="o"><b>${String.fromCharCode(65 + k)}.</b><span>${paras(q.options[k].text, '')}</span></div>` : '') + '</td>';
      }
      rows += `<tr>${cells}</tr>`;
    }
    return `<table class="ex-opt">${rows}</table>`;
  }

  function renderQuestion(no, q, L) {
    const label = q.points ? `<b>${q.word || 'Câu'} ${no}</b> ${esc(q.points)}<b>.</b> ` : `<b>${q.word || 'Câu'} ${no}.</b> `;
    let h = paras(q.stem, 'ex-q', label);
    if (q.type === 'mcq' && q.options.length) h += renderOptionsMcq(q, L);
    if (q.type === 'tf') {
      q.options.forEach((o, i) => {
        h += `<div class="ex-tf"><span>${String.fromCharCode(97 + i)})</span><span>${paras(o.text, '')}</span></div>`;
      });
    }
    return h;
  }

  function renderHeader(m, code, isOriginal) {
    const tag = isOriginal ? 'ĐỀ GỐC' : m.docType;
    const left = [
      m.dept ? `<div>${esc(m.dept.toUpperCase())}</div>` : '',
      m.school ? `<div><b>${esc(m.school.toUpperCase())}</b></div>` : '',
      m.dept || m.school ? '<div class="rule"></div>' : '',
      tag ? `<span class="box">${esc(tag.toUpperCase())}</span>` : '',
    ].join('');
    const right = [
      m.examName ? `<div><b>${esc(m.examName.toUpperCase())}</b></div>` : '',
      m.year ? `<div><b>NĂM HỌC ${esc(m.year)}</b></div>` : '',
      `<div><b>Môn: ${esc(m.subject.toUpperCase())}</b></div>`,
      m.time ? `<div><i>Thời gian làm bài: ${esc(m.time)} phút, không kể thời gian phát đề</i></div>` : '',
    ].join('');
    return `<table class="ex-head"><tr><td style="width:45%">${left}</td><td>${right}</td></tr></table>
      <table class="ex-cand"><tr>
        <td style="width:68%"><div class="line">Họ, tên thí sinh:<span class="dots"></span></div><div class="line">Số báo danh:<span class="dots"></span></div></td>
        <td class="code"><span class="box">${isOriginal ? 'ĐỀ GỐC' : 'Mã đề thi: ' + esc(code)}</span></td>
      </tr></table>`;
  }

  function renderVersion(v, m, isOriginal, L) {
    let h = `<div class="ex" style="--ex-fs:${L.fontPt}pt;--ex-lh:${L.line};--ex-lab:${(L.fontPt * 0.035 + 0.25).toFixed(2)}cm">` +
      renderHeader(m, v.code, isOriginal);
    v.sections.forEach((sec) => {
      const title = sectionTitle(sec);
      if (title || sec.intro) h += paras(sec.intro, 'ex-sec', title ? `<b>${fmt(title.replace(/\.\s*$/, ''))}.</b> ` : '');
      sec.items.forEach((it) => {
        if (it.kind === 'group') {
          const vars = { 'từ': it.from, 'đến': it.to, tu: it.from, den: it.to };
          if (it.title) h += `<p class="ex-group t"><b>${fmt(it.title, vars)}</b></p>`;
          if (it.passage) h += paras(it.passage, 'ex-group', '', vars);
          it.questions.forEach((x) => (h += renderQuestion(x.no, x.q, L)));
        } else {
          h += renderQuestion(it.no, it.q, L);
        }
      });
    });
    h += '<p class="ex-end">------ HẾT ------</p>';
    const notes = String(m.notes || '').split('\n').map((l) => l.trim()).filter(Boolean);
    if (notes.length) h += `<p class="ex-note">${notes.map(esc).join('<br>')}</p>`;
    return h + '</div>';
  }

  // ---------- Bảng đáp án ----------
  function keyRows(versions) {
    const rows = [];
    const ref = versions[0];
    ref.sections.forEach((sec, si) => {
      const qs = X.flatQuestions(sec);
      if (!qs.length || sec.type === 'essay') return;
      rows.push({ section: sectionTitle(sec) || X.SECTION_TYPES[sec.type], type: sec.type });
      qs.forEach((_, qi) => {
        rows.push({
          no: qi + 1,
          cells: versions.map((v) => {
            const x = X.flatQuestions(v.sections[si])[qi];
            return { ans: X.answerOf(x.q), orig: x.q.origNo };
          }),
        });
      });
    });
    return rows;
  }

  // Các cột của bảng đáp án: đề gốc rồi tới từng mã đề
  function keyColumns() {
    return [{ label: 'Đề gốc', version: state.original }].concat(state.versions.map((v) => ({ label: v.code, version: v })));
  }

  function renderKeysTable(cols) {
    const versions = cols.map((c) => c.version);
    const rows = keyRows(versions);
    if (!rows.length) return '<p>Đề không có câu trắc nghiệm nên không có bảng đáp án.</p>';
    let h = `<table class="keys"><thead><tr><th>Câu</th>${cols.map((c) => `<th>${esc(c.label)}</th>`).join('')}</tr></thead><tbody>`;
    rows.forEach((r) => {
      if (r.section) h += `<tr><td class="sec" colspan="${versions.length + 1}">${esc(r.section)}</td></tr>`;
      else h += `<tr><td>${r.no}</td>${r.cells.map((c) => `<td title="Câu ${c.orig} ở đề gốc">${esc(c.ans)}</td>`).join('')}</tr>`;
    });
    return h + '</tbody></table>';
  }

  // ---------- Trạng thái ----------
  let state = { parsed: null, versions: [], original: null, meta: null, layout: null };

  function showIssues(list, ul) {
    ul.innerHTML = '';
    const sorted = list.slice().sort((a, b) => (a.level === b.level ? 0 : a.level === 'error' ? -1 : 1));
    sorted.slice(0, 40).forEach((t) => {
      const li = document.createElement('li');
      li.className = t.level;
      li.textContent = t.msg;
      ul.appendChild(li);
    });
    if (sorted.length > 40) {
      const li = document.createElement('li');
      li.textContent = `… và ${sorted.length - 40} mục khác.`;
      ul.appendChild(li);
    }
  }

  // Lệnh LaTeX không chuyển được sang công thức Word
  function texIssues(parsed) {
    const out = [];
    const bad = new Set();
    const scan = (t) => W.splitInline(String(t || '').replace(/\n/g, ' ')).forEach((tk) => {
      if (tk.t !== 'math') return;
      const r = W.latexToOmml(tk.tex, 24);
      r.unknown.forEach((u) => bad.add(u));
      if (r.error) out.push({ level: 'error', msg: `Công thức "${tk.tex}" bị lỗi cú pháp.` });
    });
    parsed.sections.forEach((s) => {
      scan(s.intro);
      s.units.forEach((u) => {
        if (u.kind === 'group') { scan(u.title); scan(u.passage); }
        X.unitQuestions(u).forEach((q) => { scan(q.stem); q.options.forEach((o) => scan(o.text)); });
      });
    });
    if (bad.size) out.push({ level: 'warn', msg: `Lệnh công thức chưa hỗ trợ, sẽ giữ dạng chữ: ${[...bad].join(', ')}` });
    return out;
  }

  function parseAndShow() {
    const parsed = X.parseExam($('source').value);
    const c = X.countQuestions(parsed);
    const parts = [];
    if (c.mcq) parts.push(`${c.mcq} nhiều lựa chọn`);
    if (c.tf) parts.push(`${c.tf} đúng/sai`);
    if (c.short) parts.push(`${c.short} trả lời ngắn`);
    if (c.essay) parts.push(`${c.essay} tự luận`);
    const issues = X.checkExam(parsed).concat(texIssues(parsed));
    const nErr = issues.filter((i) => i.level === 'error').length;
    $('stats').textContent = c.total
      ? `Đã nhận ${c.total} câu: ${parts.join(', ')}.` +
        (parsed.keyCount ? ` Đã đọc bảng đáp án cuối đề (${parsed.keyCount} mục).` : '') +
        (parsed.preamble.length ? ` Bỏ qua ${parsed.preamble.length} dòng trước câu đầu tiên.` : '') +
        (issues.length ? '' : ' Không phát hiện lỗi.')
      : '';
    $('stats').style.color = nErr ? 'var(--err-ink)' : '';
    showIssues(issues, $('warnings'));
    return parsed;
  }

  function run() {
    const parsed = parseAndShow();
    if (!X.countQuestions(parsed).total) {
      alert('Chưa nhận được câu hỏi nào. Mỗi câu cần bắt đầu bằng "Câu 1.", "Câu 2."… — xem phần Hướng dẫn.');
      return;
    }
    const seed = $('seed').value || newSeed();
    const codes = versionCodes();
    state = {
      parsed,
      meta: meta(),
      layout: layout(),
      versions: X.makeVersions(parsed, codes, seed, shuffleOpts()),
      original: X.makeVersion(parsed, 'Gốc', seed, {
        shuffleQuestions: false, shuffleOptions: false, shuffleTf: false, shuffleInGroup: false, shuffleEssay: false,
      }),
    };
    const sel = $('versionSelect');
    sel.innerHTML = '';
    state.versions.forEach((v, i) => sel.add(new Option(v.code, String(i))));
    sel.add(new Option('Đề gốc', 'orig'));
    $('result').hidden = false;
    showPreview();
    $('keys').innerHTML =
      `<h3>Bảng đáp án ${esc(state.meta.subject)} — ${state.versions.length} mã đề</h3>
       <p class="note">Đúng/sai ghi theo thứ tự ý a, b, c, d (Đ = Đúng, S = Sai). Rê chuột lên đáp án để xem câu tương ứng ở đề gốc.</p>
       <div class="key-wrap">${renderKeysTable(keyColumns())}</div>`;
    save();
    $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Thông tin & trình bày đổi sau khi xáo: cập nhật ngay, không cần xáo lại
  function refreshMeta() {
    if (!state.versions.length) return;
    state.meta = meta();
    state.layout = layout();
    showPreview();
  }

  function currentVersion() {
    const v = $('versionSelect').value;
    return v === 'orig' ? state.original : state.versions[parseInt(v, 10)];
  }

  function showPreview() {
    const v = currentVersion();
    if (!v) return;
    const L = state.layout;
    const paper = $('paper');
    paper.style.padding = `${L.top}cm ${L.right}cm ${L.bottom}cm ${L.left}cm`;
    paper.innerHTML = renderVersion(v, state.meta, v === state.original, L);
    typeset(paper);
  }

  function typeset(el) {
    if (window.MathJax && MathJax.typesetPromise) {
      MathJax.typesetClear && MathJax.typesetClear([el]);
      MathJax.typesetPromise([el]).catch(() => {});
    } else {
      setTimeout(() => window.MathJax && MathJax.typesetPromise && typeset(el), 800);
    }
  }

  // ---------- Kiểm tra trước khi xuất ----------
  function askContinue(issues) {
    return new Promise((resolve) => {
      const d = $('checkDlg');
      const nErr = issues.filter((i) => i.level === 'error').length;
      $('checkTitle').textContent = nErr ? `Đề còn ${nErr} lỗi cần sửa` : 'Lưu ý trước khi xuất';
      $('checkSummary').textContent = nErr
        ? 'Nên sửa các lỗi dưới đây trong ô Đề gốc rồi bấm "Xáo đề" lại trước khi in.'
        : 'Đề không có lỗi, chỉ có một số điểm cần lưu ý:';
      showIssues(issues, $('checkList'));
      const done = (ok) => {
        $('checkGo').onclick = $('checkBack').onclick = d.oncancel = null;
        if (d.open) d.close();
        resolve(ok);
      };
      $('checkGo').onclick = () => done(true);
      $('checkBack').onclick = () => done(false);
      d.oncancel = () => done(false);
      if (d.showModal) d.showModal(); else resolve(confirm(issues.map((i) => i.msg).join('\n') + '\n\nVẫn tải file?'));
    });
  }

  async function preflight() {
    const issues = X.checkExam(state.parsed).concat(texIssues(state.parsed));
    const integrity = X.verifyVersions(state.parsed, state.versions);
    integrity.forEach((m) => issues.push({ level: 'error', msg: 'Lỗi xáo đề: ' + m }));
    const imgs = await loadImages(state.parsed);
    imgs.failed.forEach((src) => issues.push({ level: 'error', msg: `Không đọc được ảnh "${src.length > 70 ? src.slice(0, 70) + '…' : src}" (chỉ hỗ trợ PNG, JPEG, GIF; ảnh trên mạng có thể bị chặn — hãy chèn ảnh từ file Word).` }));
    const nErr = issues.filter((i) => i.level === 'error').length;
    if (integrity.length) {
      alert('Phát hiện sai lệch khi xáo đề — không xuất file để tránh in đề sai:\n' + integrity.join('\n'));
      return null;
    }
    if (nErr && !(await askContinue(issues))) return null;
    return imgs.map;
  }

  // Ảnh: đọc dữ liệu thật để nhúng vào file Word
  const imageCache = new Map();
  async function loadImages(parsed) {
    const map = new Map();
    const failed = [];
    for (const src of W.collectImageSources(parsed)) {
      if (!imageCache.has(src)) {
        let entry = null;
        try {
          let bytes;
          if (/^data:/i.test(src)) bytes = W.dataUriToBytes(src);
          else {
            const res = await fetch(src);
            if (!res.ok) throw new Error(res.status);
            bytes = new Uint8Array(await res.arrayBuffer());
          }
          const info = bytes && W.imageInfo(bytes);
          if (info && info.w > 0 && info.h > 0) entry = { bytes, info };
        } catch (e) { /* ảnh lỗi */ }
        imageCache.set(src, entry);
      }
      const e = imageCache.get(src);
      if (e) map.set(src, e); else failed.push(src);
    }
    return { map, failed };
  }

  // ---------- Xuất file ----------
  function download(name, content, type) {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  }

  function safeName(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^\w-]+/g, '_').replace(/^_+|_+$/g, '');
  }

  function examDocx(list, images) {
    const r = W.buildExamDocx(list, state.meta, state.layout, images, X.SECTION_TYPES);
    if (r.issues.length) console.warn('Xuất Word:', r.issues);
    return r.bytes;
  }
  function keysDocx() {
    const cols = keyColumns();
    return W.buildKeysDocx(keyRows(cols.map((c) => c.version)), cols.map((c) => c.label), state.meta, state.layout);
  }

  // Excel: bảng đáp án của đề gốc + tất cả mã đề, và bảng đối chiếu câu
  function keysXlsx() {
    const cols = keyColumns();
    const map = [];
    state.versions.forEach((v) => {
      v.sections.forEach((sec) => {
        if (sec.type === 'essay') return;
        X.flatQuestions(sec).forEach((x) =>
          map.push([v.code, sectionTitle(sec) || X.SECTION_TYPES[sec.type], x.no, X.answerOf(x.q), x.q.origNo]));
      });
    });
    return window.XaoDeXlsx.buildKeysXlsx(cols, keyRows(cols.map((c) => c.version)), map, state.meta);
  }
  const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

  async function withBusy(btn, fn) {
    if (!state.versions.length) return;
    btn.disabled = true;
    try { await fn(); } catch (e) {
      console.error(e);
      alert('Có lỗi khi tạo file: ' + e.message);
    } finally { btn.disabled = false; }
  }

  function printHtml(list) {
    const w = window.open('', '_blank');
    if (!w) {
      alert('Trình duyệt đã chặn cửa sổ in. Hãy cho phép cửa sổ bật lên (pop-up) cho trang này.');
      return;
    }
    const L = state.layout;
    const single = list.length === 1;
    // Mỗi mã đề một "trang tên riêng" để chân trang ghi đúng mã đề
    const pages = list.map((it, i) => {
      const label = it.isOriginal ? 'Đề gốc' : 'Mã đề thi ' + it.version.code;
      const foot = single ? `"Trang " counter(page) "/" counter(pages) " – ${label}"` : `"${label}"`;
      return `@page v${i} { @bottom-center { content: ${foot}; font: italic ${L.fontPt - 1}pt "Times New Roman", serif; } }
        .v${i} { page: v${i}; }`;
    }).join('\n');
    const body = list.map((it, i) =>
      `<div class="v${i}"${i ? ' style="break-before:page"' : ''}>${renderVersion(it.version, state.meta, it.isOriginal, L)}</div>`).join('');
    const hasMath = /\$|\\\(|\\\[/.test(body);
    w.document.open();
    w.document.write(`<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>In đề thi ${esc(state.meta.subject)}</title>
      <style>@page { size: A4; margin: ${L.top}cm ${L.right}cm ${L.bottom}cm ${L.left}cm; }
        ${pages}
        html, body { margin: 0; background: #fff; }
        .ex-q, .ex-tf, .ex-opt tr, .ex-sec { break-inside: avoid; }
        .ex-q, .ex-sec, .ex-group.t { break-after: avoid; }
        ${EXAM_CSS}</style>
      ${hasMath ? `<script>window.MathJax = { tex: { inlineMath: [['$','$'],['\\\\(','\\\\)']] },
        startup: { pageReady: () => MathJax.startup.defaultPageReady().then(() => setTimeout(() => window.print(), 300)) } };<\/script>
        <script async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-mml-chtml.js" onerror="window.print()"><\/script>`
        : `<script>window.addEventListener('load', () => setTimeout(() => window.print(), 300));<\/script>`}
      </head><body>${body}</body></html>`);
    w.document.close();
  }

  // ---------- Mở file ----------
  function norm(t) {
    return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/\s+/g, ' ').trim();
  }
  // Điền thông tin đầu đề lấy từ file Word
  function applyMeta(m) {
    const filled = [];
    const set = (id, v, name) => { if (v && $(id).value.trim() !== v) { $(id).value = v; filled.push(name); } };
    // File có đầu đề riêng: xóa thông tin cũ của đề trước để không lẫn
    if (m.school || m.examName || m.dept) ['dept', 'school', 'examName', 'year'].forEach((id) => ($(id).value = ''));
    set('dept', m.dept, 'Sở/Phòng');
    set('school', m.school, 'Trường');
    set('examName', m.examName, 'Kỳ thi');
    set('year', m.year, 'Năm học');
    set('time', m.time, 'Thời gian');
    if (m.docType && [...$('docType').options].some((o) => o.value === m.docType)) set('docType', m.docType, 'Loại đề');
    if (m.subjectText) {
      const t = norm(m.subjectText);
      const sub = SUBJECTS.slice().sort((a, b) => b.name.length - a.name.length)
        .find((x) => t.startsWith(norm(x.name)) || t.startsWith(norm(x.name.replace(/\s*\(.*\)$/, ''))));
      if (sub) $('subject').value = sub.id;
      $('subjectLabel').value = sub && norm(sub.name) === t ? '' : m.subjectText.toUpperCase();
      filled.push('Môn');
    }
    return filled;
  }

  async function openFile(file) {
    const name = file.name.toLowerCase();
    try {
      let text;
      let notes = [];
      if (name.endsWith('.docx')) {
        const r = await window.XaoDeDocx.docxToSource(await file.arrayBuffer());
        if ($('source').value.trim() && !isSample($('source').value) && !confirm('Thay nội dung đề gốc hiện tại bằng nội dung file?')) return;
        text = r.text;
        const filled = applyMeta(r.meta);
        if (filled.length) notes.push('Đã tự điền: ' + filled.join(', ') + ' (lấy từ đầu đề trong file).');
        notes = notes.concat(r.warnings);
      } else if (name.endsWith('.doc')) {
        alert('File .doc (Word 97-2003) chưa đọc được. Hãy mở bằng Word và chọn Lưu thành (Save As) định dạng .docx.');
        return;
      } else {
        if ($('source').value.trim() && !isSample($('source').value) && !confirm('Thay nội dung đề gốc hiện tại bằng nội dung file?')) return;
        text = await file.text();
      }
      $('source').value = text;
      const parsed = parseAndShow();
      save();
      const c = X.countQuestions(parsed);
      const errs = X.checkExam(parsed).filter((i) => i.level === 'error').length;
      alert(`Đã mở "${file.name}": ${c.total} câu` + (parsed.keyCount ? ', có đọc bảng đáp án cuối đề' : '') + '.\n' +
        (errs ? `Có ${errs} lỗi cần kiểm tra (xem danh sách màu đỏ dưới ô Đề gốc).\n` : 'Không phát hiện lỗi.\n') +
        (notes.length ? '\n' + notes.join('\n') : ''));
    } catch (e) {
      console.error(e);
      alert('Không đọc được file: ' + e.message);
    }
  }

  // ---------- Lưu tự động ----------
  const FIELDS = ['subject', 'subjectLabel', 'dept', 'school', 'examName', 'year', 'time', 'docType', 'count', 'startCode', 'codeList', 'seed',
    'fontPt', 'lineSp', 'mTop', 'mBottom', 'mLeft', 'mRight', 'notes', 'source'];
  const CHECKS = ['optQuestions', 'optOptions', 'optTf', 'optInGroup', 'optEssay', 'optOriginal'];
  function save() {
    try {
      const data = {};
      FIELDS.forEach((f) => (data[f] = $(f).value));
      CHECKS.forEach((f) => (data[f] = $(f).checked));
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch (e) { /* bỏ qua nếu trình duyệt chặn lưu */ }
  }
  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if (!data) return false;
      FIELDS.forEach((f) => { if (typeof data[f] === 'string') $(f).value = data[f]; });
      CHECKS.forEach((f) => { if (typeof data[f] === 'boolean') $(f).checked = data[f]; });
      return true;
    } catch (e) {
      return false;
    }
  }

  function newSeed() {
    const s = Math.random().toString(36).slice(2, 8).toUpperCase();
    $('seed').value = s;
    return s;
  }

  function isSample(text) {
    return !text.trim() || Object.values(SAMPLES).includes(text);
  }


  // ---------- Khởi tạo ----------
  SUBJECTS.forEach((s) => $('subject').add(new Option(s.name, s.id)));
  if (!load()) {
    $('subject').value = 'toan';
    $('source').value = SAMPLES.toan;
    newSeed();
  }
  if (!$('seed').value) newSeed();
  parseAndShow();

  $('subject').addEventListener('change', () => {
    const sub = SUBJECTS.find((s) => s.id === $('subject').value);
    if (sub) $('time').value = sub.time;
    $('subjectLabel').value = '';
    if (isSample($('source').value)) {
      $('source').value = SAMPLES[sub.id] || SAMPLES.khac;
      parseAndShow();
    }
    save();
  });
  $('loadSample').addEventListener('click', () => {
    if (!isSample($('source').value) && !confirm('Thay đề hiện tại bằng đề mẫu của môn đang chọn?')) return;
    $('source').value = SAMPLES[$('subject').value] || SAMPLES.khac;
    parseAndShow();
    save();
  });
  $('clearText').addEventListener('click', () => {
    if ($('source').value.trim() && !confirm('Xóa toàn bộ đề gốc?')) return;
    $('source').value = '';
    parseAndShow();
    save();
  });
  $('fileInput').addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (f) openFile(f);
    e.target.value = '';
  });
  $('newSeed').addEventListener('click', () => { newSeed(); save(); });
  $('resetLayout').addEventListener('click', () => {
    Object.keys(DEFAULT_LAYOUT).forEach((k) => ($(k).value = DEFAULT_LAYOUT[k]));
    $('notes').value = DEFAULT_NOTES;
    save();
    refreshMeta();
  });

  let timer;
  $('source').addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { parseAndShow(); save(); }, 400);
  });
  const META_IDS = ['subject', 'subjectLabel', 'dept', 'school', 'examName', 'year', 'time', 'docType', 'notes', ...Object.keys(DEFAULT_LAYOUT)];
  document.querySelectorAll('.settings input, .settings select, .settings textarea').forEach((el) =>
    el.addEventListener('change', () => {
      save();
      if (META_IDS.includes(el.id)) refreshMeta();
    }));
  $('source').addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const t = e.target, s = t.selectionStart;
      t.setRangeText('    ', s, t.selectionEnd, 'end');
    }
  });

  $('run').addEventListener('click', run);
  $('versionSelect').addEventListener('change', showPreview);

  document.querySelectorAll('.tab').forEach((b) =>
    b.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((x) => x.classList.toggle('active', x === b));
      $('tab-preview').hidden = b.dataset.tab !== 'preview';
      $('tab-keys').hidden = b.dataset.tab !== 'keys';
    })
  );

  const subj = () => safeName(state.meta.subject);
  const fileOf = (v) => `De_${subj()}_${v === state.original ? 'goc' : 'ma_' + safeName(v.code)}.docx`;
  const exportList = () => ($('optOriginal').checked ? [{ version: state.original, isOriginal: true }] : [])
    .concat(state.versions.map((v) => ({ version: v, isOriginal: false })));

  $('dlOne').addEventListener('click', (e) => withBusy(e.currentTarget, async () => {
    const images = await preflight();
    if (!images) return;
    const v = currentVersion();
    download(fileOf(v), examDocx([{ version: v, isOriginal: v === state.original }], images), DOCX_MIME);
  }));
  $('dlZip').addEventListener('click', (e) => withBusy(e.currentTarget, async () => {
    const images = await preflight();
    if (!images) return;
    const files = exportList().map((it) => ({ name: fileOf(it.version), data: examDocx([it], images) }));
    files.push({ name: `Dap_an_${subj()}.docx`, data: keysDocx() });
    files.push({ name: `Dap_an_${subj()}.xlsx`, data: keysXlsx() });
    download(`De_${subj()}_${state.versions.length}_ma_de.zip`, W.zip(files), 'application/zip');
  }));
  $('dlAll').addEventListener('click', (e) => withBusy(e.currentTarget, async () => {
    const images = await preflight();
    if (!images) return;
    download(`De_${subj()}_gop_${state.versions.length}_ma_de.docx`, examDocx(exportList(), images), DOCX_MIME);
  }));
  $('printOne').addEventListener('click', (e) => withBusy(e.currentTarget, async () => {
    if (!(await preflight())) return;
    const v = currentVersion();
    printHtml([{ version: v, isOriginal: v === state.original }]);
  }));
  $('printAll').addEventListener('click', (e) => withBusy(e.currentTarget, async () => {
    if (!(await preflight())) return;
    printHtml(state.versions.map((v) => ({ version: v, isOriginal: false })));
  }));
  $('dlKeysWord').addEventListener('click', (e) => withBusy(e.currentTarget, async () =>
    download(`Dap_an_${subj()}.docx`, keysDocx(), DOCX_MIME)));
  $('dlKeysXlsx').addEventListener('click', (e) => withBusy(e.currentTarget, async () =>
    download(`Dap_an_${subj()}.xlsx`, keysXlsx(), XLSX_MIME)));

  document.querySelectorAll('[data-open="guide"]').forEach((b) =>
    b.addEventListener('click', () => {
      const d = $('guide');
      if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    })
  );
})();
