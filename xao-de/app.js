/* Giao diện: nhập đề, xáo, xem trước, in, xuất Word và bảng đáp án */
(function () {
  'use strict';
  const X = window.XaoDe;
  const { SUBJECTS, SAMPLES } = window.XaoDeSamples;
  const $ = (id) => document.getElementById(id);
  const STORE_KEY = 'xaode.v1';

  // ---------- CSS dùng chung cho tờ đề (xem trước, in, Word) ----------
  const EXAM_CSS = `
    .ex { font-family: "Times New Roman", Times, serif; font-size: 13pt; line-height: 1.4; color: #000; }
    .ex p { margin: 0 0 4pt; }
    .ex table { border-collapse: collapse; width: 100%; }
    .ex td { vertical-align: top; padding: 1pt 4pt 1pt 0; font-size: 13pt; }
    .ex-head td { text-align: center; width: 50%; padding-bottom: 6pt; }
    .ex-head .tag { display: inline-block; border: 1px solid #000; padding: 1pt 8pt; margin-top: 4pt; font-weight: bold; }
    .ex-cand { margin: 6pt 0 10pt; }
    .ex-cand td.code { text-align: right; vertical-align: middle; }
    .ex-cand .codebox { border: 1px solid #000; padding: 3pt 10pt; font-weight: bold; white-space: nowrap; }
    .ex-sec { margin-top: 10pt !important; }
    .ex-group { margin: 6pt 0 4pt; }
    .ex-opt td { width: auto; }
    .ex-tf { margin-left: 14pt !important; }
    .ex-end { text-align: center; font-weight: bold; margin-top: 14pt !important; }
    .ex-note { font-style: italic; font-size: 11pt !important; }
    .ex img { max-width: 100%; }
    .ex-keys th, .ex-keys td { border: 1px solid #000; padding: 2pt 6pt; text-align: center; }
    .ex-keys td.sec { text-align: left; font-weight: bold; }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = EXAM_CSS;
  document.head.appendChild(styleEl);

  // ---------- Định dạng chữ ----------
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function fmt(text, vars) {
    let s = esc(text || '');
    if (vars) Object.keys(vars).forEach((k) => (s = s.split('{' + k + '}').join(vars[k])));
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, src) => {
      if (!/^(https?:|data:image\/|\.{0,2}\/|[\w-]+\.)/i.test(src)) return m;
      return `<img src="${src}" alt="${alt}">`;
    });
    s = s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[^_])__([^_\n]+?)__(?!_)/g, '$1<u>$2</u>');
    return s.replace(/\n/g, '<br>');
  }
  function plainLen(t) {
    return String(t).replace(/\\[a-z]+/gi, 'x').replace(/[${}^_]/g, '').length + (/!\[/.test(t) ? 60 : 0);
  }

  // ---------- Đọc thông tin từ form ----------
  function meta() {
    const sub = SUBJECTS.find((s) => s.id === $('subject').value) || SUBJECTS[0];
    return {
      subject: sub.name,
      dept: $('dept').value.trim(),
      school: $('school').value.trim(),
      examName: $('examName').value.trim(),
      year: $('year').value.trim(),
      time: $('time').value.trim(),
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

  // ---------- Dựng HTML một mã đề ----------
  function sectionTitle(sec) {
    if (!sec.label) return '';
    if (/^PH[ẦA]N\s+[IVX\d]+\.?$/.test(sec.label)) {
      return sec.label.replace(/\.$/, '') + '. ' + X.SECTION_TYPES[sec.type].toUpperCase();
    }
    return sec.label;
  }

  function renderOptionsMcq(q) {
    const L = q.options.map((o, i) => `<b>${String.fromCharCode(65 + i)}.</b> ${fmt(o.text)}`);
    const maxLen = Math.max(0, ...q.options.map((o) => plainLen(o.text)));
    const cols = maxLen <= 18 ? 4 : maxLen <= 42 ? 2 : 1;
    let rows = '';
    for (let i = 0; i < L.length; i += cols) {
      const cells = L.slice(i, i + cols);
      while (cells.length < cols) cells.push('');
      rows += '<tr>' + cells.map((c) => `<td style="width:${100 / cols}%">${c}</td>`).join('') + '</tr>';
    }
    return `<table class="ex-opt">${rows}</table>`;
  }

  function renderQuestion(no, q) {
    let h = `<p class="ex-q"><b>${q.word || 'Câu'} ${no}.</b> ${fmt(q.stem)}</p>`;
    if (q.type === 'mcq' && q.options.length) h += renderOptionsMcq(q);
    if (q.type === 'tf') {
      q.options.forEach((o, i) => {
        h += `<p class="ex-tf">${String.fromCharCode(97 + i)}) ${fmt(o.text)}</p>`;
      });
    }
    return h;
  }

  function renderHeader(m, code, isOriginal) {
    const left = [
      m.dept ? `<div>${esc(m.dept.toUpperCase())}</div>` : '',
      m.school ? `<div><b>${esc(m.school.toUpperCase())}</b></div>` : '',
      `<div class="tag">${isOriginal ? 'ĐỀ GỐC' : 'ĐỀ CHÍNH THỨC'}</div>`,
    ].join('');
    const right = [
      m.examName ? `<div><b>${esc(m.examName.toUpperCase())}</b></div>` : '',
      m.year ? `<div><b>NĂM HỌC ${esc(m.year)}</b></div>` : '',
      `<div><b>Môn: ${esc(m.subject.toUpperCase())}</b></div>`,
      m.time ? `<div><i>Thời gian làm bài: ${esc(m.time)} phút, không kể thời gian phát đề</i></div>` : '',
    ].join('');
    return `<table class="ex-head"><tr><td>${left}</td><td>${right}</td></tr></table>
      <table class="ex-cand"><tr>
        <td>Họ, tên thí sinh: ..........................................................<br>Số báo danh: ...............................................................</td>
        <td class="code"><span class="codebox">${isOriginal ? 'ĐỀ GỐC' : 'Mã đề thi ' + esc(code)}</span></td>
      </tr></table>`;
  }

  function renderVersion(v, m, isOriginal) {
    let h = `<div class="ex">` + renderHeader(m, v.code, isOriginal);
    v.sections.forEach((sec) => {
      const title = sectionTitle(sec);
      if (title || sec.intro) {
        h += `<p class="ex-sec">${title ? `<b>${fmt(title)}.</b> ` : ''}${fmt(sec.intro)}</p>`;
      }
      sec.items.forEach((it) => {
        if (it.kind === 'group') {
          const vars = { 'từ': it.from, 'đến': it.to, 'tu': it.from, 'den': it.to };
          if (it.title) h += `<p class="ex-group"><b>${fmt(it.title, vars)}</b></p>`;
          if (it.passage) h += `<p class="ex-group">${fmt(it.passage, vars)}</p>`;
          it.questions.forEach((x) => (h += renderQuestion(x.no, x.q)));
        } else {
          h += renderQuestion(it.no, it.q);
        }
      });
    });
    h += `<p class="ex-end">------ HẾT ------</p>
      <p class="ex-note">- Thí sinh không được sử dụng tài liệu.<br>- Cán bộ coi thi không giải thích gì thêm.</p></div>`;
    return h;
  }

  // ---------- Bảng đáp án ----------
  function keyRows(versions) {
    // Mọi mã đề có cùng số phần và số câu mỗi phần
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

  function renderKeysTable(versions, cls) {
    const rows = keyRows(versions);
    if (!rows.length) return '<p>Đề không có câu trắc nghiệm nên không có bảng đáp án.</p>';
    let h = `<table class="${cls}"><thead><tr><th>Câu</th>${versions.map((v) => `<th>${esc(v.code)}</th>`).join('')}</tr></thead><tbody>`;
    rows.forEach((r) => {
      if (r.section) h += `<tr><td class="sec" colspan="${versions.length + 1}">${esc(r.section)}</td></tr>`;
      else h += `<tr><td>${r.no}</td>${r.cells.map((c) => `<td title="Câu ${c.orig} ở đề gốc">${esc(c.ans)}</td>`).join('')}</tr>`;
    });
    return h + '</tbody></table>';
  }

  // ---------- Trạng thái ----------
  let state = { parsed: null, versions: [], original: null, meta: null };

  function allForExport() {
    return $('optOriginal').checked && state.original ? [state.original, ...state.versions] : state.versions;
  }

  function parseAndShow() {
    const parsed = X.parseExam($('source').value);
    const c = X.countQuestions(parsed);
    const parts = [];
    if (c.mcq) parts.push(`${c.mcq} nhiều lựa chọn`);
    if (c.tf) parts.push(`${c.tf} đúng/sai`);
    if (c.short) parts.push(`${c.short} trả lời ngắn`);
    if (c.essay) parts.push(`${c.essay} tự luận`);
    $('stats').textContent = c.total ? `Đã nhận ${c.total} câu: ${parts.join(', ')}.` : '';
    const w = $('warnings');
    w.innerHTML = '';
    parsed.warnings.slice(0, 30).forEach((t) => {
      const li = document.createElement('li');
      li.textContent = t;
      w.appendChild(li);
    });
    if (parsed.warnings.length > 30) {
      const li = document.createElement('li');
      li.textContent = `… và ${parsed.warnings.length - 30} cảnh báo khác.`;
      w.appendChild(li);
    }
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
       <div class="key-wrap">${renderKeysTable(state.versions, 'keys')}</div>`;
    save();
    $('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function currentVersion() {
    const v = $('versionSelect').value;
    return v === 'orig' ? state.original : state.versions[parseInt(v, 10)];
  }

  function showPreview() {
    const v = currentVersion();
    if (!v) return;
    $('paper').innerHTML = renderVersion(v, state.meta, v === state.original);
    typeset($('paper'));
  }

  function typeset(el) {
    if (window.MathJax && MathJax.typesetPromise) {
      MathJax.typesetClear && MathJax.typesetClear([el]);
      MathJax.typesetPromise([el]).catch(() => {});
    } else {
      setTimeout(() => window.MathJax && MathJax.typesetPromise && typeset(el), 800);
    }
  }

  // ---------- Xuất file ----------
  function download(name, content, type) {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function safeName(s) {
    return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
      .replace(/[^\w-]+/g, '_').replace(/^_+|_+$/g, '');
  }

  function wordDoc(bodyHtml) {
    return '﻿' + `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>De thi</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>@page WordSection1 { size: 21cm 29.7cm; margin: 1.5cm 1.5cm 1.5cm 2cm; } div.WordSection1 { page: WordSection1; }
body { font-family: "Times New Roman"; font-size: 13pt; } ${EXAM_CSS}</style></head>
<body><div class="WordSection1">${bodyHtml}</div></body></html>`;
  }
  const PAGE_BREAK = '<br clear="all" style="page-break-before:always">';

  const PRINT_BREAK = '<div style="break-before:page;page-break-before:always"></div>';
  function joinVersions(list, sep) {
    return list.map((v) => renderVersion(v, state.meta, v === state.original)).join(sep || PAGE_BREAK);
  }

  function keysDocHtml() {
    const m = state.meta;
    return `<div class="ex"><p style="text-align:center"><b>ĐÁP ÁN ${esc(m.subject.toUpperCase())}${m.examName ? ' – ' + esc(m.examName.toUpperCase()) : ''}</b></p>
      ${renderKeysTable(state.versions, 'ex-keys')}
      <p class="ex-note">Đúng/sai ghi theo thứ tự ý a, b, c, d (Đ = Đúng, S = Sai).</p></div>`;
  }

  function keysCsv() {
    const lines = [['Mã đề', 'Phần', 'Câu', 'Đáp án', 'Câu ở đề gốc']];
    state.versions.forEach((v) => {
      v.sections.forEach((sec) => {
        if (sec.type === 'essay') return;
        X.flatQuestions(sec).forEach((x) =>
          lines.push([v.code, sectionTitle(sec) || X.SECTION_TYPES[sec.type], x.no, X.answerOf(x.q), x.q.origNo])
        );
      });
    });
    return '﻿' + lines.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\r\n');
  }

  function printHtml(bodyHtml) {
    const w = window.open('', '_blank');
    if (!w) {
      alert('Trình duyệt đã chặn cửa sổ in. Hãy cho phép cửa sổ bật lên (pop-up) cho trang này.');
      return;
    }
    const hasMath = /\$|\\\(|\\\[/.test(bodyHtml);
    w.document.open();
    w.document.write(`<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>In đề thi</title>
      <style>@page { size: A4; margin: 1.5cm 1.5cm 1.5cm 2cm; } body { margin: 0; background: #fff; } ${EXAM_CSS}</style>
      ${hasMath ? `<script>window.MathJax = { tex: { inlineMath: [['$','$'],['\\\\(','\\\\)']] },
        startup: { pageReady: () => MathJax.startup.defaultPageReady().then(() => setTimeout(() => window.print(), 300)) } };<\/script>
        <script async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-mml-chtml.js" onerror="window.print()"><\/script>`
        : `<script>window.addEventListener('load', () => setTimeout(() => window.print(), 300));<\/script>`}
      </head><body>${bodyHtml}</body></html>`);
    w.document.close();
  }

  // ---------- Mở file ----------
  function htmlToSourceText(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    // Chữ cái phương án được gạch chân => đáp án đúng
    doc.querySelectorAll('u').forEach((u) => {
      const t = u.textContent;
      if (/^\s*[A-Da-d]\s*[.)]?\s*/.test(t) && (/^\s*[A-Da-d]\s*[.)]?\s*$/.test(t) || /^\s*[A-Da-d]\s*[.)]\s/.test(t))) {
        u.textContent = t.replace(/^(\s*)/, '$1*');
      }
    });
    function walk(node) {
      let s = '';
      node.childNodes.forEach((n) => {
        if (n.nodeType === 3) s += n.nodeValue;
        else if (n.nodeName === 'BR') s += '\n';
        else if (n.nodeName === 'IMG') s += `![](${n.getAttribute('src') || ''})`;
        else s += walk(n);
      });
      return s;
    }
    const lines = [];
    function block(el) {
      if (el.nodeName === 'TABLE') {
        el.querySelectorAll('tr').forEach((tr) => {
          const cells = [...tr.children].map((td) => walk(td).replace(/\s+/g, ' ').trim()).filter(Boolean);
          if (cells.length) lines.push(cells.join('   '));
        });
      } else if (el.nodeName === 'UL' || el.nodeName === 'OL') {
        [...el.children].forEach(block);
      } else {
        const t = walk(el).replace(/[ \t ]+/g, ' ').trim();
        if (t) lines.push(t);
      }
    }
    [...doc.body.children].forEach(block);
    // "*" có thể nằm sau khoảng trắng ở đầu ô
    return lines.join('\n').replace(/(^|\s)\*\s+([A-Da-d][.)])/g, '$1*$2');
  }

  async function openFile(file) {
    const name = file.name.toLowerCase();
    try {
      let text;
      if (name.endsWith('.docx')) {
        if (!window.mammoth) {
          alert('Chưa tải được bộ đọc file Word (cần kết nối mạng). Bạn có thể mở file Word, chọn tất cả rồi dán vào ô đề gốc.');
          return;
        }
        const buf = await file.arrayBuffer();
        const res = await mammoth.convertToHtml({ arrayBuffer: buf }, { styleMap: ['u => u'] });
        text = htmlToSourceText(res.value);
      } else {
        text = await file.text();
      }
      if ($('source').value.trim() && !confirm('Thay nội dung đề gốc hiện tại bằng nội dung file?')) return;
      $('source').value = text;
      parseAndShow();
      save();
    } catch (e) {
      alert('Không đọc được file: ' + e.message);
    }
  }

  // ---------- Lưu tự động ----------
  const FIELDS = ['subject', 'dept', 'school', 'examName', 'year', 'time', 'count', 'startCode', 'codeList', 'seed', 'source'];
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

  let timer;
  $('source').addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => { parseAndShow(); save(); }, 400);
  });
  document.querySelectorAll('.settings input, .settings select').forEach((el) => el.addEventListener('change', save));
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
  $('dlOne').addEventListener('click', () => {
    const v = currentVersion();
    download(`De_${subj()}_${v === state.original ? 'goc' : safeName(v.code)}.doc`,
      wordDoc(renderVersion(v, state.meta, v === state.original)), 'application/msword');
  });
  $('dlAll').addEventListener('click', () => {
    download(`De_${subj()}_${state.versions.length}_ma_de.doc`, wordDoc(joinVersions(allForExport())), 'application/msword');
  });
  $('printAll').addEventListener('click', () => printHtml(joinVersions(state.versions, PRINT_BREAK)));
  $('dlKeysWord').addEventListener('click', () =>
    download(`Dap_an_${subj()}.doc`, wordDoc(keysDocHtml()), 'application/msword'));
  $('dlKeysCsv').addEventListener('click', () =>
    download(`Dap_an_${subj()}.csv`, keysCsv(), 'text/csv;charset=utf-8'));

  document.querySelectorAll('[data-open="guide"]').forEach((b) =>
    b.addEventListener('click', () => {
      const d = $('guide');
      if (d.showModal) d.showModal(); else d.setAttribute('open', '');
    })
  );
})();
