/*
 * Nhập đề thi từ file PDF.
 * Chữ trong PDF không giữ được công thức (mất số mũ, phân số…), nên phần mềm:
 *   1. đọc vị trí các dòng chữ để tìm PHẦN, "Câu n.", nhãn A. B. C. D. / a) b) c) d), dòng HẾT, chân trang;
 *   2. dựng trang thành ảnh và CẮT riêng phần câu hỏi, từng phương án — giữ nguyên công thức, hình vẽ;
 *   3. ghi lại vị trí nhãn cũ trên ảnh để khi xáo đề vẽ đè nhãn mới (Câu 5., C. …);
 *   4. lấy đáp án từ phần chữ sau dòng HẾT (lời giải "Chọn A", bảng đáp án…) và từ chữ cái
 *      phương án được tô đỏ / gạch chân / in đậm khác biệt trên trang.
 * Dùng pdf.js (Mozilla, Apache 2.0) đóng gói sẵn trong vendor/pdfjs — chạy được khi không có mạng.
 */
(function (root) {
  'use strict';

  let loading = null;
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Không tải được ' + src));
      document.head.appendChild(s);
    });
  }
  // Nạp pdf.js khi cần. Nạp worker như script thường để chạy được cả khi mở file index.html trực tiếp.
  function loadPdfJs(base) {
    if (root.pdfjsLib) return Promise.resolve(root.pdfjsLib);
    if (!loading) {
      const b = base || 'vendor/pdfjs/';
      loading = loadScript(b + 'pdf.worker.min.js').then(() => loadScript(b + 'pdf.min.js')).then(() => {
        root.pdfjsLib.GlobalWorkerOptions.workerSrc = b + 'pdf.worker.min.js';
        return root.pdfjsLib;
      });
    }
    return loading;
  }

  // Các mẫu chạy trên chuỗi đã bỏ dấu (r.plain) để chịu được PDF lỗi font tiếng Việt
  const RE_SECTION = /^\s*\[?\s*PHAN\s+(III|II|IV|I|\d+)\b/i;
  const RE_QLABEL = /^\s*(Cau|Question)\s*(\d+)\s*[.:)]?/i;
  const RE_OPT = /^\s*\*?\s*([A-D])\s*[.)]/;
  const RE_TF = /^\s*([a-d])\s*\)/;
  const RE_END = /^\s*[-–—_=.*\s]*HET\s*[-–—_=.*\s]*$/i;
  const RE_KEYHEAD = /^\s*(?:(?:BANG|PHAN)\s+)?(?:DAP\s*AN|HUONG\s+DAN\s+(?:CHAM|GIAI)|LOI\s+GIAI)/i;
  const RE_PAGE = /^\s*(?:(?:ma\s*de(?:\s*thi)?\s*:?\s*\S+)\s*[-–]?\s*)?trang\s*\d+\s*(?:\/\s*\d+)?\s*(?:[-–]\s*ma\s*de(?:\s*thi)?\s*:?\s*\S+)?\s*$/i;

  /** Gom các đoạn chữ thành dòng theo đường chân chữ */
  function groupRows(items) {
    const sorted = items.slice().sort((a, b) => a.base - b.base || a.x - b.x);
    const rows = [];
    sorted.forEach((it) => {
      const r = rows.find((row) => Math.abs(row.base - it.base) <= Math.max(1.2, 0.25 * Math.min(row.size, it.size)));
      if (r) { r.items.push(it); r.top = Math.min(r.top, it.top); r.bottom = Math.max(r.bottom, it.bottom); r.size = Math.max(r.size, it.size); }
      else rows.push({ base: it.base, top: it.top, bottom: it.bottom, size: it.size, items: [it] });
    });
    rows.forEach((r) => {
      r.items.sort((a, b) => a.x - b.x);
      r.left = r.items[0].x;
      r.right = Math.max(...r.items.map((i) => i.x + i.w));
      // từng ký tự kèm toạ độ x (chia đều bề rộng đoạn chữ)
      const chars = [];
      let lastEnd = -1e9;
      r.items.forEach((it) => {
        const cs = Array.from(clean(it.str));
        if (!cs.length) return;
        if (chars.length && it.x - lastEnd > 0.18 * it.size && chars[chars.length - 1].c !== ' ') chars.push({ c: ' ', x: lastEnd, w: Math.max(0, it.x - lastEnd), it });
        const cw = it.w / cs.length;
        cs.forEach((c, i) => chars.push({ c, x: it.x + i * cw, w: cw, it }));
        lastEnd = Math.max(lastEnd, it.x + it.w);
      });
      // gộp khoảng trắng, bỏ khoảng trắng đầu
      r.chars = chars.filter((ch, i) => !(ch.c === ' ' && (i === 0 || chars[i - 1].c === ' ')));
      r.text = r.chars.map((ch) => ch.c).join('').normalize('NFC').trim();
      r.plain = r.chars.map((ch) => plainChar(ch.c)).join('');
    });
    return rows.sort((a, b) => a.base - b.base);
  }

  // Bỏ ký tự điều khiển (PDF lỗi font hay sinh ra), gom khoảng trắng lạ
  function clean(s) {
    return String(s).replace(/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\ufeff]/g, '').replace(/[\u00a0\u2000-\u200a\u3000\t]/g, ' ');
  }
  // Ký tự "không dấu" (giữ nguyên độ dài để tra ngược vị trí): Câu → Cau, PHẦN → PHAN, Đ → D
  function plainChar(c) {
    if (c === 'đ') return 'd';
    if (c === 'Đ') return 'D';
    const d = c.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return d.length === 1 ? d : /[\u0300-\u036f]/.test(c) ? ' ' : c.length === 1 ? c : '?';
  }
  // Sửa các từ khóa bị lỗi dấu do font: Câu, Phần, Đáp án, Đúng, Sai
  function fixWords(r) {
    const words = { cau: 'Câu', phan: 'Phần', dap: 'Đáp', an: 'án', dung: 'Đúng', sai: 'Sai', chon: 'Chọn', so: 'số' };
    let out = '';
    const re = /[A-Za-z]+|[^A-Za-z]+/g;
    let m;
    while ((m = re.exec(r.plain))) {
      const raw = r.chars.slice(m.index, m.index + m[0].length).map((c) => c.c).join('');
      const w = words[m[0].toLowerCase()];
      if (w && /[A-Za-z]/.test(m[0]) && m[0].length > 1 && raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').length === m[0].length) {
        out += m[0] === m[0].toUpperCase() ? w.toUpperCase() : (m[0][0] === m[0][0].toUpperCase() ? w : w.toLowerCase());
      } else out += raw;
    }
    return out.normalize('NFC').replace(/\s+/g, ' ').trim();
  }
  // Hộp nhãn tại vị trí [i, j) trong chuỗi ký tự của dòng
  function boxAt(r, i, j) {
    const a = r.chars[i], b = r.chars[Math.max(i, j - 1)];
    const it = a.it;
    return { x: a.x, w: Math.max(2, b.x + b.w - a.x), top: r.top, bottom: r.bottom, base: r.base, size: it.size, bold: it.bold };
  }

  /** Đọc file PDF => { text: văn bản đề gốc (câu hỏi là ảnh cắt), meta, warnings } */
  async function pdfToSource(buf, opts) {
    opts = opts || {};
    const pdfjs = await loadPdfJs(opts.base);
    const SCALE = opts.scale || 2.5; // ~180 dpi
    const doc = await pdfjs.getDocument({ data: new Uint8Array(buf), isEvalSupported: false }).promise;
    const warnings = [];
    const pages = [];
    for (let n = 1; n <= doc.numPages; n++) {
      if (opts.onProgress) opts.onProgress(`Đang đọc trang ${n}/${doc.numPages}…`);
      const page = await doc.getPage(n);
      const vp1 = page.getViewport({ scale: 1 });
      const vp = page.getViewport({ scale: SCALE });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(vp.width);
      canvas.height = Math.ceil(vp.height);
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: ctx, viewport: vp }).promise;
      const tc = await page.getTextContent();
      const fontName = (id) => { try { const f = page.commonObjs.get(id); return (f && (f.name || f.loadedName)) || ''; } catch (e) { return ''; } };
      const items = [];
      tc.items.forEach((it) => {
        if (!it.str || !it.str.trim()) return;
        const [x, base] = vp1.convertToViewportPoint(it.transform[4], it.transform[5]);
        const size = it.height || Math.hypot(it.transform[2], it.transform[3]) || 10;
        items.push({ x, base, w: it.width, size, top: base - size * 0.9, bottom: base + size * 0.25, str: it.str, bold: /bold|black|heavy|semibold|,B\b/i.test(fontName(it.fontName)) });
      });
      pages.push({ n, w: vp1.width, h: vp1.height, canvas, ctx, rows: groupRows(items) });
    }

    // Lề trái/phải chung của nội dung
    const bodyRows = pages.flatMap((p) => p.rows.filter((r) => !RE_PAGE.test(r.plain)));
    if (!bodyRows.length) throw new Error('File PDF không có lớp chữ (có thể là bản scan/ảnh chụp) — chưa đọc được. Hãy dùng file Word hoặc PDF xuất từ Word.');
    const left = Math.max(0, Math.min(...bodyRows.map((r) => r.left)) - 4);
    const right = Math.min(pages[0].w, Math.max(...bodyRows.map((r) => Math.min(r.right, pages[0].w))) + 4);
    // Vùng nội dung từng trang (bỏ đầu/chân trang)
    pages.forEach((p) => {
      const foot = p.rows.filter((r) => RE_PAGE.test(r.plain));
      const footTop = foot.filter((r) => r.base > p.h / 2).map((r) => r.top);
      const headBottom = foot.filter((r) => r.base <= p.h / 2).map((r) => r.bottom);
      p.contentTop = headBottom.length ? Math.max(...headBottom) + 2 : 6;
      p.contentBottom = footTop.length ? Math.min(...footTop) - 3 : p.h - 6;
      p.rows = p.rows.filter((r) => !RE_PAGE.test(r.plain) && r.base > p.contentTop && r.top < p.contentBottom);
    });

    // ---------- Đọc cấu trúc ----------
    const all = [];
    pages.forEach((p) => p.rows.forEach((r, i) => all.push(Object.assign(r, { page: p, idx: i }))));
    const header = [];
    const keyLines = [];
    const out = []; // các "khối" theo thứ tự
    let phase = 'head';
    let curQ = null;
    let secType = 'mcq';
    const sectionType = (t) => {
      const s = t.toUpperCase();
      if (/DUNG\s*\/?\s*SAI/.test(s)) return 'tf';
      if (/TRA\s*LOI\s*NGAN/.test(s)) return 'short';
      if (/TU\s*LUAN/.test(s)) return 'essay';
      if (/TRAC\s*NGHIEM|NHIEU\s*(PHUONG\s*AN|LUA\s*CHON)/.test(s)) return 'mcq';
      const m = s.match(/PHAN\s+(III|II|IV|I|\d+)/);
      const k = m ? { I: 1, II: 2, III: 3, IV: 4 }[m[1]] || +m[1] : 1;
      return ['mcq', 'tf', 'short', 'essay'][k - 1] || 'mcq';
    };
    const labelItems = (r, re) => r.items.filter((it) => re.test(it.str) && it.str.trim().length <= 3 || (re.test(it.str) && it === r.items[0]));
    for (const r of all) {
      const t = r.text, pl = r.plain;
      if (!r.chars.length) continue;
      if (phase === 'key') { keyLines.push(fixWords(r)); continue; }
      if (phase !== 'head' && (RE_END.test(pl) || RE_KEYHEAD.test(pl))) {
        out.push({ kind: 'end', row: r });
        phase = 'key';
        if (!RE_END.test(pl)) keyLines.push(fixWords(r));
        curQ = null;
        continue;
      }
      if (RE_SECTION.test(pl)) {
        phase = 'body';
        secType = sectionType(pl);
        const sm = RE_SECTION.exec(pl);
        const rest = r.chars.slice(sm[0].length).map((ch) => ch.c).join('').normalize('NFC');
        out.push({ kind: 'section', row: r, text: ('PHẦN ' + sm[1].toUpperCase() + rest).replace(/\s+/g, ' ').trim() });
        curQ = null;
        continue;
      }
      const qm = RE_QLABEL.exec(pl);
      if (qm && r.left < left + 40) {
        phase = 'body';
        curQ = { kind: 'q', row: r, type: secType, opts: [], word: /^q/i.test(qm[1]) ? 'Question' : 'Câu', no: qm[2] };
        // hộp nhãn "Câu 1." trên ảnh
        const i0 = qm[0].search(/\S/);
        const i1 = qm[0].replace(/\s+$/, '').length;
        curQ.label = Object.assign(boxAt(r, i0, i1), { text: qm[0].trim() });
        out.push(curQ);
        continue;
      }
      if (phase === 'head') {
        let cur = '';
        r.items.forEach((it, k) => {
          const prev = r.items[k - 1];
          if (prev && it.x - (prev.x + prev.w) > 2.5 * it.size) { header.push(cur.trim()); cur = ''; }
          cur += (cur && !/\s$/.test(cur) ? ' ' : '') + clean(it.str);
        });
        if (cur.trim()) header.push(cur.replace(/\s+/g, ' ').trim());
        continue;
      }
      if (curQ && (curQ.type === 'mcq') && RE_OPT.test(pl)) {
        // mọi nhãn A. B. C. D. trên dòng (đứng đầu dòng hoặc sau khoảng trắng), chữ cái tăng dần
        const re = /(^|\s|[0-9₀-₉²³)\]])([A-D])\s*[.)](?=\s|$)/g;
        let m, last = -1;
        const have = new Set(curQ.opts.map((o) => o.letter));
        while ((m = re.exec(pl))) {
          const L = m[2];
          const code = L.charCodeAt(0);
          if (code <= last || have.has(L)) continue;
          if (m[1] && !/\s/.test(m[1]) && last < 0) continue; // nhãn đầu tiên phải đứng đầu dòng hoặc sau khoảng trắng
          const i0 = m.index + m[1].length;
          const i1 = m.index + m[0].length;
          const box = boxAt(r, i0, i1);
          curQ.opts.push({ letter: L, row: r, x: box.x, label: Object.assign(box, { text: L + '.', lw: boxAt(r, i0, i0 + 1).w }) });
          last = code;
          have.add(L);
        }
        continue;
      }
      if (curQ && curQ.type === 'tf' && RE_TF.test(pl)) {
        const m = RE_TF.exec(pl);
        const i0 = m[0].search(/\S/);
        const box = boxAt(r, i0, m[0].length);
        curQ.opts.push({ letter: m[1], row: r, x: box.x, label: Object.assign(box, { text: m[1] + ')' }) });
        continue;
      }
      if (!curQ) {
        const k = all.indexOf(r);
        const nxt = all[k + 1];
        const raised = nxt && nxt.page === r.page && nxt.base - r.base < 0.95 * nxt.size;
        if (!raised && /[A-Za-zÀ-ỹ]{2,}/.test(t)) out.push({ kind: 'text', row: r, text: t });
      }
    }

    // ---------- Ranh giới cắt ----------
    // Đỉnh vùng của một dòng: lùi lên trên để lấy cả phần nhô cao (số mũ, tử số) thuộc dòng đó
    const pos = new Map(all.map((r, i) => [r, i]));
    // Tìm khoảng trắng ngang (cả bề rộng nội dung) ngay phía trên dòng r trên ảnh trang:
    // giữ trọn số mũ, tử số… của dòng r và không cắt vào hình/bảng của phần phía trên.
    function whiteRow(p, ypx) {
      if (ypx < 0) return true;
      const x0 = Math.round(left * SCALE), w = Math.max(1, Math.round((right - left) * SCALE));
      const d = p.ctx.getImageData(x0, ypx, w, 1).data;
      for (let i = 0; i < d.length; i += 4) if (d[i] < 215 || d[i + 1] < 215 || d[i + 2] < 215) return false;
      return true;
    }
    const topCache = new Map();
    function regionTop(r) {
      if (topCache.has(r)) return topCache.get(r);
      const p = r.page;
      const start = Math.round((r.base - 0.55 * r.size) * SCALE);
      const limit = Math.max(Math.round(p.contentTop * SCALE), Math.round((r.base - 1.9 * r.size) * SCALE));
      let found = null;
      for (let y = start; y > limit; y--) {
        if (whiteRow(p, y) && whiteRow(p, y - 1)) { found = y; break; }
      }
      const t = found != null ? Math.max(p.contentTop, found / SCALE - 0.6) : textTop(r);
      topCache.set(r, t);
      return t;
    }
    function textTop(r) {
      const i = pos.get(r);
      let top = r.top;
      for (let k = i - 1; k >= 0; k--) {
        const q = all[k];
        if (q.page !== r.page) break;
        if (q.base > r.base - 0.95 * r.size && q.base < r.base && !RE_QLABEL.test(q.plain) && !RE_OPT.test(q.plain)) top = Math.min(top, q.top);
        else {
          top = Math.max(q.bottom + 0.5, Math.min(top - 0.25 * r.size, (q.bottom + top) / 2));
          return top;
        }
      }
      return Math.max(r.page.contentTop, top - 0.35 * r.size);
    }
    const marks = out.filter((b) => b.kind !== 'text');
    // danh sách các mốc cấu trúc theo thứ tự đọc để tìm "mốc kế tiếp"
    const stops = [];
    marks.forEach((b) => {
      stops.push({ row: b.row });
      if (b.kind === 'q') {
        const seen = new Set();
        b.opts.forEach((o) => { if (!seen.has(o.row)) { seen.add(o.row); stops.push({ row: o.row }); } });
      }
    });
    stops.sort((a, b) => pos.get(a.row) - pos.get(b.row));
    const nextStop = (row) => {
      const i = pos.get(row);
      const s = stops.find((x) => pos.get(x.row) > i);
      return s ? s.row : null;
    };
    // Cắt từ (dòng a, y0) tới mốc b (có thể qua nhiều trang) => danh sách đoạn {page, y0, y1}
    function span(rowA, y0, rowB) {
      const segs = [];
      let p = rowA.page;
      let start = y0;
      const endPage = rowB ? rowB.page : pages[pages.length - 1];
      const endY = rowB ? regionTop(rowB) : endPage.contentBottom;
      while (p) {
        if (p === endPage) { segs.push({ page: p, y0: start, y1: endY }); break; }
        // phần cuối trang: tới dòng cuối có nội dung (kể cả hình) trên trang
        segs.push({ page: p, y0: start, y1: p.contentBottom });
        p = pages[pages.indexOf(p) + 1];
        if (!p) break;
        start = p.contentTop + 1;
      }
      return segs.filter((s) => s.y1 - s.y0 > 2);
    }

    // ---------- Cắt ảnh ----------
    const S = SCALE;
    function crop(page, x0, y0, x1, y1) {
      const c = document.createElement('canvas');
      const W = Math.max(1, Math.round((x1 - x0) * S)), H = Math.max(1, Math.round((y1 - y0) * S));
      c.width = W; c.height = H;
      const g = c.getContext('2d', { willReadFrequently: true });
      g.fillStyle = '#fff';
      g.fillRect(0, 0, W, H);
      g.drawImage(page.canvas, Math.round(x0 * S), Math.round(y0 * S), W, H, 0, 0, W, H);
      return { canvas: c, x0, y0 };
    }
    // Cắt bỏ khoảng trắng thừa (phải, trên, dưới) — giữ mép trái để nhãn đúng vị trí
    function trim(cr, keepLeft) {
      const c = cr.canvas, g = c.getContext('2d', { willReadFrequently: true });
      const { width: W, height: H } = c;
      const d = g.getImageData(0, 0, W, H).data;
      const ink = (x, y) => { const i = (y * W + x) * 4; return d[i] < 200 || d[i + 1] < 200 || d[i + 2] < 200; };
      let top = 0, bottom = H - 1, rightX = W - 1, leftX = 0;
      const rowHas = (y) => { for (let x = 0; x < W; x += 1) if (ink(x, y)) return true; return false; };
      const colHas = (x) => { for (let y = top; y <= bottom; y += 1) if (ink(x, y)) return true; return false; };
      while (top < bottom && !rowHas(top)) top++;
      while (bottom > top && !rowHas(bottom)) bottom--;
      while (rightX > 0 && !colHas(rightX)) rightX--;
      if (!keepLeft) while (leftX < rightX && !colHas(leftX)) leftX++;
      const pad = Math.round(1.5 * S);
      top = Math.max(0, top - pad); bottom = Math.min(H - 1, bottom + pad);
      rightX = Math.min(W - 1, rightX + pad); leftX = Math.max(0, leftX - pad);
      if (bottom <= top || rightX <= leftX) return null; // vùng trắng
      if ((rightX - leftX) < 9 * S && (bottom - top) < 9 * S && !keepLeft) return null; // đốm nhỏ, không phải nội dung
      const n = document.createElement('canvas');
      n.width = rightX - leftX + 1; n.height = bottom - top + 1;
      n.getContext('2d').drawImage(c, leftX, top, n.width, n.height, 0, 0, n.width, n.height);
      return { canvas: n, x0: cr.x0 + leftX / S, y0: cr.y0 + top / S };
    }
    const cm = (pt) => (pt / 72 * 2.54).toFixed(2);
    // ảnh => cú pháp ![WxHcm|loại|nhãn](data)
    function imgMarkup(cr, kind, label) {
      let alt = `${cm(cr.canvas.width / S)}x${cm(cr.canvas.height / S)}cm`;
      if (kind && label) {
        const r = (v) => Math.round(v);
        alt += `|${kind}|${r((label.x - cr.x0) * S)},${r((label.top - cr.y0) * S)},${r(label.w * S)},${r((label.bottom - label.top) * S)},${r((label.base - cr.y0) * S)},${r(label.size * S)},${label.bold ? 1 : 0}`;
      }
      return `![${alt}](${cr.canvas.toDataURL('image/png')})`;
    }

    // Nhận dấu đáp án trên trang: chữ cái tô đỏ/xanh, gạch chân, in đậm khác biệt
    function labelMark(o) {
      const p = o.row.page, L = o.label;
      // chỉ đo trên chính chữ cái (dấu "." sau chữ cái thường không được gạch chân/tô màu)
      const x0 = Math.round(L.x * S), w = Math.max(2, Math.round((L.lw || L.w) * S));
      const y0 = Math.round(L.top * S), h = Math.max(2, Math.round((L.bottom - L.top) * S));
      const d = p.ctx.getImageData(x0, y0, w, h + Math.round(0.35 * L.size * S)).data;
      let dark = 0, color = 0;
      for (let i = 0; i < w * h * 4; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        if (r < 200 || g < 200 || b < 200) { dark++; if (Math.max(r, g, b) - Math.min(r, g, b) > 90) color++; }
      }
      // gạch chân: một hàng gần như kín mực ngay dưới chân chữ
      const baseY = Math.round((L.base - L.top) * S);
      let under = false;
      for (let y = baseY + 1; y < h + Math.round(0.35 * L.size * S); y++) {
        let run = 0;
        for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; if (d[i] < 140 && d[i + 1] < 140 && d[i + 2] < 140 || (Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]) > 90)) run++; }
        if (run > 0.75 * w) { under = true; break; }
      }
      return { color: dark > 0 && color / dark > 0.3, under, bold: L.bold };
    }

    // ---------- Sinh văn bản đề gốc ----------
    const lines = [];
    let answered = 0;
    for (let bi = 0; bi < out.length; bi++) {
      const b = out[bi];
      if (b.kind === 'section') { lines.push(b.text); continue; }
      if (b.kind === 'text') { lines.push(b.text); continue; }
      if (b.kind === 'end') { lines.push('------ HẾT ------'); continue; }
      // Câu hỏi
      const firstOpt = b.opts.length ? b.opts[0].row : null;
      const stemEnd = firstOpt || nextStop(b.row);
      const segs = span(b.row, regionTop(b.row), stemEnd);
      let first = true;
      segs.forEach((sg) => {
        const t = trim(crop(sg.page, left, sg.y0, right, sg.y1), true);
        if (!t) return;
        if (first) { lines.push(`${b.word} ${b.no}. ${imgMarkup(t, 'q', b.label)}`); first = false; }
        else lines.push(imgMarkup(t));
      });
      if (first) lines.push(`${b.word} ${b.no}. (không cắt được nội dung câu này)`);
      // Phương án / ý đúng sai: sắp theo chữ cái (đề có thể xếp phương án theo cột dọc)
      b.opts.sort((o1, o2) => o1.letter.toLowerCase().localeCompare(o2.letter.toLowerCase()));
      const marksInfo = b.type === 'mcq' ? b.opts.map(labelMark) : [];
      const pick = (f) => { const idx = marksInfo.map((m, i) => (m[f] ? i : -1)).filter((i) => i >= 0); return idx.length === 1 ? idx[0] : -1; };
      let correct = pick('color');
      if (correct < 0) correct = pick('under');
      if (correct < 0 && marksInfo.length >= 3) correct = pick('bold');
      if (correct >= 0) answered++;
      b.opts.forEach((o, k) => {
        const sameRow = b.opts.filter((x) => x.row === o.row).sort((a, c) => a.x - c.x);
        const nextInRow = sameRow.find((x) => x.x > o.x + 1);
        const x1 = nextInRow ? nextInRow.x - 2 : right;
        const endRow = nextStop(o.row);
        const sgs = span(o.row, regionTop(o.row), endRow);
        const parts = [];
        const alone = sameRow.length === 1; // phương án chiếm trọn dòng: dòng xuống có thể bắt đầu sát lề trái
        sgs.forEach((sg, j) => {
          const fromX = j === 0 && !alone ? o.x - 1 : left;
          const t = trim(crop(sg.page, fromX, sg.y0, j === 0 ? x1 : right, sg.y1), j === 0 && !alone);
          if (t) parts.push(j === 0 ? imgMarkup(t, 'o', Object.assign({}, o.label, { x: o.label.x })) : imgMarkup(t));
        });
        const L = b.type === 'tf' ? `${o.letter})` : `${o.letter}.`;
        lines.push(`${k === correct ? '*' : ''}${L} ${parts.join(' ') || '(trống)'}`);
      });
    }
    keyLines.forEach((t) => lines.push(t));

    // Thông tin đầu đề
    const meta = {};
    header.forEach((l) => {
      let m;
      if (!meta.dept && /^(SỞ|BỘ|PHÒNG)\s/i.test(l)) meta.dept = l;
      if (!meta.school && /^TRƯỜNG\b/i.test(l)) meta.school = l;
      if ((m = l.match(/NĂM\s+HỌC\s*:?\s*(\d{4})\s*[-–—]\s*(\d{4})/i))) meta.year = `${m[1]} – ${m[2]}`;
      if (!meta.examName && (m = l.match(/^(?:ĐỀ\s+)?((?:KIỂM\s+TRA|KỲ\s+THI|KÌ\s+THI|THI)\b.*?)(?:\s*[-–—]\s*NĂM\s+HỌC.*)?$/i))) meta.examName = m[1].replace(/[\s,-]+$/, '');
      if (!meta.subjectText && (m = l.match(/\bMÔN(?:\s+THI)?\s*:?\s*([^,;(]+?)(?:\s*[-–—(;,]|\s+THỜI\s+GIAN|$)/i))) meta.subjectText = m[1].trim();
      if ((m = l.match(/THỜI\s+GIAN(?:\s+LÀM\s+BÀI)?\s*:?\s*(\d{1,3})\s*PHÚT/i))) meta.time = m[1];
      if (/ĐỀ\s+CHÍNH\s+THỨC/i.test(l)) meta.docType = 'ĐỀ CHÍNH THỨC';
    });
    const nq = out.filter((b) => b.kind === 'q').length;
    warnings.push(`Đã cắt ${nq} câu hỏi từ PDF thành hình ảnh (giữ nguyên công thức, hình vẽ). Hãy xem lại phần Xem đề trước khi in.`);
    if (answered) warnings.push(`Nhận được ${answered} đáp án từ chữ cái được tô màu/gạch chân/in đậm trên trang.`);
    return { text: lines.join('\n'), meta, warnings };
  }

  // ---------- Vẽ nhãn mới lên ảnh câu hỏi / phương án ----------
  const bakeCache = new Map();
  function loadImg(src) {
    return new Promise((resolve, reject) => { const im = new Image(); im.onload = () => resolve(im); im.onerror = reject; im.src = src; });
  }
  /** alt "WxHcm|q|x,y,w,h,base,size,bold" + nhãn mới => ảnh mới (data URI) với nhãn đã thay */
  async function bakeLabel(src, alt, text, forceBold) {
    const key = text + '|' + forceBold + '|' + alt + '|' + src.length + src.slice(-40);
    if (bakeCache.has(key)) return bakeCache.get(key);
    const m = /\|(q|o)\|(-?\d+),(-?\d+),(\d+),(\d+),(-?\d+),(\d+),(\d)/.exec(alt);
    if (!m) return src;
    const [, , lx, ly, lw, lh, bl, fs, bold0] = m.map((v, i) => (i > 1 ? +v : v));
    const bold = forceBold == null ? bold0 : forceBold ? 1 : 0;
    const im = await loadImg(src);
    const c = document.createElement('canvas');
    c.width = im.naturalWidth; c.height = im.naturalHeight;
    const g = c.getContext('2d');
    g.drawImage(im, 0, 0);
    g.fillStyle = '#fff';
    g.fillRect(Math.max(0, lx - 2), Math.max(0, ly - 2), lw + 4, Math.min(c.height, lh + Math.round(fs * 0.45)));
    g.fillStyle = '#000';
    g.textBaseline = 'alphabetic';
    g.font = `${bold ? 'bold ' : ''}${fs}px "Times New Roman", "Liberation Serif", Times, serif`;
    const w = g.measureText(text).width;
    const room = lw + fs * 0.3;
    g.save();
    if (w > room) { g.translate(lx, 0); g.scale(room / w, 1); g.fillText(text, 0, bl); }
    else g.fillText(text, lx, bl);
    g.restore();
    const out = c.toDataURL('image/png');
    bakeCache.set(key, out);
    return out;
  }

  const api = { loadPdfJs, pdfToSource, bakeLabel, groupRows };
  root.XaoDePdf = api;
})(typeof window !== 'undefined' ? window : globalThis);
