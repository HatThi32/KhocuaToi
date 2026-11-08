/*
 * Điền bảng đáp án vào FILE EXCEL MẪU của người dùng (giữ nguyên định dạng của mẫu).
 *
 * Mẫu cần có một hàng tiêu đề, ví dụ:  Đề/Câu | 1 | 2 | … | 40 | 1a | 1b | 1c | 1d | … | 4d
 *   - cột số "1", "2"…            => câu trắc nghiệm nhiều lựa chọn (A/B/C/D)
 *   - cột "1a", "2c"…             => ý của câu đúng/sai (Đ/S)
 *   - cột "TL1", "TLN1", "III.1"… => câu trả lời ngắn
 *   - cột đầu tiên                => mã đề
 * Các hàng dưới tiêu đề: mỗi hàng một mã đề — dữ liệu cũ bị thay bằng dữ liệu mới.
 */
(function (root) {
  'use strict';
  const D = () => root.XaoDeDocx || require('./docx-reader.js');
  const Wd = () => root.XaoDeWord || require('./word.js');

  // ---------- Tiện ích ô ----------
  function colIndex(ref) {
    const m = /^([A-Z]+)/.exec(ref);
    let n = 0;
    for (const ch of m[1]) n = n * 26 + (ch.charCodeAt(0) - 64);
    return n - 1;
  }
  function colName(i) {
    let s = '';
    i++;
    while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); }
    return s;
  }
  const rowOf = (ref) => parseInt(/\d+$/.exec(ref)[0], 10);

  // ---------- Ghi lại XML ----------
  function esc(s, attr) {
    let t = String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    if (attr) t = t.replace(/"/g, '&quot;');
    return t.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '');
  }
  function serialize(n) {
    if (n.text != null) return esc(n.text);
    const attrs = Object.keys(n.attrs || {}).map((k) => ` ${k}="${esc(n.attrs[k], true)}"`).join('');
    if (!n.children || !n.children.length) return `<${n.name}${attrs}/>`;
    return `<${n.name}${attrs}>${n.children.map(serialize).join('')}</${n.name}>`;
  }
  const el = (name, attrs, children) => ({ name, attrs: attrs || {}, children: children || [] });
  const kid = (n, name) => (n.children || []).find((c) => c.name === name);
  const kids = (n, name) => (n.children || []).filter((c) => c.name === name);
  const textOf = (n) => (n.text != null ? n.text : (n.children || []).map(textOf).join(''));

  // ---------- Nhận dạng tiêu đề ----------
  function classify(label) {
    const t = String(label == null ? '' : label).trim();
    let m;
    if ((m = /^(?:câu\s*)?(\d{1,3})$/i.exec(t))) return { kind: 'mcq', no: +m[1] };
    if ((m = /^(?:câu\s*)?(\d{1,2})\s*[.\-_]?\s*([a-d])\)?$/i.exec(t))) return { kind: 'tf', no: +m[1], item: m[2].toLowerCase().charCodeAt(0) - 97 };
    if ((m = /^(?:TLN|TL|SA|III|P3|PIII|Phần\s*III)\s*[.\-_:]?\s*(?:câu\s*)?(\d{1,2})$/i.exec(t))) return { kind: 'short', no: +m[1] };
    return null;
  }

  /** Đọc mẫu: trả về thông tin bố cục để kiểm tra và hiển thị cho người dùng */
  async function inspectTemplate(buf) {
    const z = await D().unzip(buf);
    const names = z.names();
    const wb = D().parseXml(await z.text('xl/workbook.xml'));
    const rels = D().parseXml(await z.text('xl/_rels/workbook.xml.rels'));
    const relMap = new Map();
    const relRoot = kid(rels, 'Relationships');
    kids(relRoot, 'Relationship').forEach((r) => relMap.set(r.attrs.Id, r.attrs.Target));
    const sheets = kids(kid(kid(wb, 'workbook'), 'sheets'), 'sheet').map((s) => {
      const tgt = relMap.get(s.attrs['r:id']) || '';
      return { name: s.attrs.name, path: tgt.startsWith('/') ? tgt.slice(1) : 'xl/' + tgt.replace(/^\.\//, '') };
    });
    let sst = [];
    if (names.includes('xl/sharedStrings.xml')) {
      const sx = D().parseXml(await z.text('xl/sharedStrings.xml'));
      sst = kids(kid(sx, 'sst'), 'si').map((si) => kids(si, 't').concat(...kids(si, 'r').map((r) => kids(r, 't'))).map(textOf).join(''));
    }
    const cellValue = (c) => {
      const v = kid(c, 'v');
      if (c.attrs.t === 's') return v ? sst[+textOf(v)] : '';
      if (c.attrs.t === 'inlineStr') return textOf(kid(c, 'is') || { children: [] });
      return v ? textOf(v) : '';
    };
    // Tìm sheet + hàng tiêu đề có nhiều nhãn câu nhất
    let best = null;
    for (const sh of sheets) {
      if (!names.includes(sh.path)) continue;
      const doc = D().parseXml(await z.text(sh.path));
      const ws = kid(doc, 'worksheet');
      const data = kid(ws, 'sheetData');
      if (!data) continue;
      kids(data, 'row').slice(0, 30).forEach((row) => {
        const cols = [];
        kids(row, 'c').forEach((c) => {
          const k = classify(cellValue(c));
          if (k) cols.push(Object.assign({ col: colIndex(c.attrs.r) }, k));
        });
        if (cols.length >= 3 && (!best || cols.length > best.cols.length)) {
          best = { sheet: sh, row: +row.attrs.r, cols, codeCol: Math.min(...cols.map((c) => c.col)) - 1 };
        }
      });
    }
    if (!best) throw new Error('Không tìm thấy hàng tiêu đề (dạng "Đề/Câu | 1 | 2 | 3 … | 1a | 1b …") trong file mẫu.');
    if (best.codeCol < 0) best.codeCol = 0;
    const count = (k) => best.cols.filter((c) => c.kind === k).length;
    return {
      cellValue, zip: z, names, sst, sheet: best.sheet, headerRow: best.row, cols: best.cols, codeCol: best.codeCol,
      summary: {
        sheet: best.sheet.name, mcq: count('mcq'), tf: count('tf'), tfQuestions: new Set(best.cols.filter((c) => c.kind === 'tf').map((c) => c.no)).size,
        short: count('short'),
      },
    };
  }

  /**
   * Điền dữ liệu vào mẫu.
   * versions: [{ code, mcq: ['A',…], tf: [[true,false,…],…], short: ['12,5',…] }]
   * Trả về { bytes, warnings }
   */
  async function fillTemplate(buf, versions) {
    const T = await inspectTemplate(buf);
    const warnings = [];
    const z = T.zip;
    const sheetDoc = D().parseXml(await z.text(T.sheet.path));
    const ws = kid(sheetDoc, 'worksheet');
    const data = kid(ws, 'sheetData');
    data.children = data.children.filter((c) => c.name === 'row');

    // --- Bố cục cột, thêm cột còn thiếu ở cuối
    const cols = T.cols.slice();
    const has = (k, no, item) => cols.some((c) => c.kind === k && c.no === no && (item == null || c.item === item));
    let nextCol = Math.max(...cols.map((c) => c.col)) + 1;
    const added = [];
    const need = (k, no, item, label) => {
      if (!has(k, no, item)) { cols.push({ col: nextCol, kind: k, no, item, label, added: true }); added.push(label); nextCol++; }
    };
    const maxMcq = Math.max(0, ...versions.map((v) => v.mcq.length));
    const maxTf = Math.max(0, ...versions.map((v) => v.tf.length));
    const maxShort = Math.max(0, ...versions.map((v) => v.short.length));
    for (let i = 1; i <= maxMcq; i++) need('mcq', i, null, String(i));
    for (let i = 1; i <= maxTf; i++) for (let j = 0; j < 4; j++) if (versions.some((v) => v.tf[i - 1] && v.tf[i - 1].length > j)) need('tf', i, j, i + String.fromCharCode(97 + j));
    for (let i = 1; i <= maxShort; i++) need('short', i, null, 'TL' + i);
    if (added.length) warnings.push(`File mẫu thiếu cột cho: ${added.join(', ')} — đã thêm vào cuối hàng tiêu đề. Hãy kiểm tra phần mềm chấm có đọc được không.`);

    // --- Chuỗi dùng chung (sharedStrings) để giữ đúng kiểu dữ liệu như mẫu
    const sst = T.sst.slice();
    const sstIndex = new Map();
    sst.forEach((s, i) => { if (!sstIndex.has(s)) sstIndex.set(s, i); });
    let sstAdded = 0;
    const useSst = T.names.includes('xl/sharedStrings.xml');
    const strCell = (ref, s, text) => {
      if (useSst) {
        if (!sstIndex.has(text)) { sstIndex.set(text, sst.length); sst.push(text); sstAdded++; }
        return el('c', Object.assign({ r: ref }, s != null ? { s } : {}, { t: 's' }), [el('v', {}, [{ text: String(sstIndex.get(text)) }])]);
      }
      return el('c', Object.assign({ r: ref }, s != null ? { s } : {}, { t: 'inlineStr' }), [el('is', {}, [el('t', { 'xml:space': 'preserve' }, [{ text }])])]);
    };

    // --- Kiểu ô: lấy theo hàng dữ liệu đầu tiên của mẫu (hoặc chính ô cũ nếu có)
    const rows = kids(data, 'row');
    const rowByNo = new Map(rows.map((r) => [+r.attrs.r, r]));
    const styleAt = new Map(); // "r,c" -> s
    rows.forEach((r) => kids(r, 'c').forEach((c) => { if (c.attrs.s != null) styleAt.set(rowOf(c.attrs.r) + ',' + colIndex(c.attrs.r), c.attrs.s); }));
    const firstData = T.headerRow + 1;
    const styleFor = (rNo, col, kind) => {
      if (styleAt.has(rNo + ',' + col)) return styleAt.get(rNo + ',' + col);
      if (styleAt.has(firstData + ',' + col)) return styleAt.get(firstData + ',' + col);
      const same = cols.find((c) => c.kind === kind && styleAt.has(firstData + ',' + c.col));
      return same ? styleAt.get(firstData + ',' + same.col) : null;
    };
    const headStyle = styleAt.get(T.headerRow + ',' + T.cols[T.cols.length - 1].col);

    // --- Tiêu đề: thêm ô cho cột mới
    const header = rowByNo.get(T.headerRow);
    cols.filter((c) => c.added).forEach((c) => header.children.push(strCell(colName(c.col) + T.headerRow, headStyle, c.label)));

    // --- Xóa dữ liệu cũ dưới tiêu đề (giữ hàng chỉ có định dạng)
    const hasValue = (c) => kid(c, 'v') || kid(c, 'is') || kid(c, 'f');
    const oldDataRows = rows.filter((r) => +r.attrs.r > T.headerRow && kids(r, 'c').some(hasValue));
    const oldLast = oldDataRows.length ? Math.max(...oldDataRows.map((r) => +r.attrs.r)) : T.headerRow;
    rows.forEach((r) => {
      if (+r.attrs.r <= T.headerRow) return;
      r.children = r.children.filter((c) => c.name !== 'c' || !hasValue(c));
      kids(r, 'c').forEach((c) => { c.children = []; delete c.attrs.t; });
    });

    // --- Ghi từng mã đề
    const tfText = (v) => (v ? 'Đ' : 'S');
    versions.forEach((v, i) => {
      const rNo = T.headerRow + 1 + i;
      let row = rowByNo.get(rNo);
      if (!row) {
        const proto = rowByNo.get(firstData);
        row = el('row', Object.assign({}, proto ? proto.attrs : {}, { r: String(rNo) }));
        data.children.push(row);
        rowByNo.set(rNo, row);
      }
      delete row.attrs.spans;
      const cells = new Map(kids(row, 'c').map((c) => [colIndex(c.attrs.r), c]));
      const put = (col, kind, text) => {
        const ref = colName(col) + rNo;
        const s = styleFor(rNo, col, kind);
        if (text === '') {
          // ô trống: chỉ giữ định dạng nếu mẫu có sẵn ô ở đó (không tự thêm viền)
          const own = styleAt.get(rNo + ',' + col) != null ? styleAt.get(rNo + ',' + col) : styleAt.get(firstData + ',' + col);
          if (own != null) cells.set(col, el('c', { r: ref, s: own })); else cells.delete(col);
          return;
        }
        cells.set(col, strCell(ref, s, text));
      };
      put(T.codeCol, 'code', String(v.code));
      cols.forEach((c) => {
        let val = '';
        if (c.kind === 'mcq') val = v.mcq[c.no - 1] || '';
        else if (c.kind === 'tf') val = v.tf[c.no - 1] && v.tf[c.no - 1][c.item] != null ? tfText(v.tf[c.no - 1][c.item]) : '';
        else if (c.kind === 'short') val = v.short[c.no - 1] || '';
        put(c.col, c.kind, val);
      });
      row.children = row.children.filter((c) => c.name !== 'c').concat([...cells.keys()].sort((a, b) => a - b).map((k) => cells.get(k)));
    });
    // Hàng dữ liệu cũ thừa (mẫu có nhiều mã hơn): xóa hẳn
    const lastNew = T.headerRow + versions.length;
    data.children = data.children.filter((r) => r.name !== 'row' || +r.attrs.r <= lastNew || +r.attrs.r > oldLast || kids(r, 'c').some(hasValue));
    data.children.sort((a, b) => (+a.attrs.r) - (+b.attrs.r));

    // --- Hiện các cột bị ẩn nếu có dữ liệu
    const filled = new Set();
    cols.forEach((c) => {
      if (versions.some((v) => (c.kind === 'mcq' && v.mcq[c.no - 1]) || (c.kind === 'tf' && v.tf[c.no - 1] && v.tf[c.no - 1][c.item] != null) || (c.kind === 'short' && v.short[c.no - 1]))) filled.add(c.col + 1);
    });
    const colsNode = kid(ws, 'cols');
    if (colsNode) {
      kids(colsNode, 'col').forEach((cn) => {
        if (cn.attrs.hidden && /^(1|true)$/.test(cn.attrs.hidden)) {
          for (let k = +cn.attrs.min; k <= +cn.attrs.max; k++) if (filled.has(k)) { delete cn.attrs.hidden; break; }
        }
      });
    }

    // --- Cập nhật vùng dữ liệu
    let maxR = 1, maxC = 0;
    kids(data, 'row').forEach((r) => kids(r, 'c').forEach((c) => { maxR = Math.max(maxR, rowOf(c.attrs.r)); maxC = Math.max(maxC, colIndex(c.attrs.r)); }));
    const dim = kid(ws, 'dimension');
    if (dim) dim.attrs.ref = `A1:${colName(maxC)}${maxR}`;
    kids(data, 'row').forEach((r) => delete r.attrs.spans);

    // --- Đóng gói lại: giữ nguyên mọi tệp khác của mẫu
    const files = [];
    for (const n of T.names) {
      if (n.endsWith('/')) continue;
      if (n === 'xl/calcChain.xml') continue; // tính lại khi mở
      let d = await z.bytes(n);
      if (n === T.sheet.path) d = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + serialize(ws);
      else if (n === 'xl/sharedStrings.xml' && sstAdded) {
        const sx = D().parseXml(await z.text(n));
        const root2 = kid(sx, 'sst');
        sst.slice(T.sst.length).forEach((t) => root2.children.push(el('si', {}, [el('t', { 'xml:space': 'preserve' }, [{ text: t }])])));
        root2.attrs.uniqueCount = String(sst.length);
        delete root2.attrs.count; // thuộc tính tùy chọn, Excel tự tính lại
        d = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + serialize(root2);
      } else if (n === '[Content_Types].xml' || n === 'xl/_rels/workbook.xml.rels') {
        d = (await z.text(n)).replace(/<Override[^>]*calcChain[^>]*\/>/g, '').replace(/<Relationship[^>]*calcChain[^>]*\/>/g, '');
      }
      files.push({ name: n, data: d });
    }
    const bytes = Wd().zip(files);
    await verify(bytes, versions);
    return { bytes, warnings, summary: T.summary };
  }

  // Đọc lại file vừa tạo và so từng ô với đáp án — sai lệch thì báo lỗi, không cho tải
  async function verify(bytes, versions) {
    const T = await inspectTemplate(bytes);
    const ws = kid(D().parseXml(await T.zip.text(T.sheet.path)), 'worksheet');
    const byRow = new Map();
    kids(kid(ws, 'sheetData'), 'row').forEach((r) => {
      const m = new Map();
      kids(r, 'c').forEach((c) => m.set(colIndex(c.attrs.r), String(T.cellValue(c) == null ? '' : T.cellValue(c))));
      byRow.set(+r.attrs.r, m);
    });
    const errs = [];
    versions.forEach((v, i) => {
      const row = byRow.get(T.headerRow + 1 + i) || new Map();
      if ((row.get(T.codeCol) || '') !== String(v.code)) errs.push(`hàng mã đề ${v.code}`);
      T.cols.forEach((c) => {
        let want = '';
        if (c.kind === 'mcq') want = v.mcq[c.no - 1] || '';
        else if (c.kind === 'tf') want = v.tf[c.no - 1] && v.tf[c.no - 1][c.item] != null ? (v.tf[c.no - 1][c.item] ? 'Đ' : 'S') : '';
        else if (c.kind === 'short') want = v.short[c.no - 1] || '';
        if ((row.get(c.col) || '') !== want) errs.push(`mã ${v.code}, cột ${colName(c.col)}`);
      });
    });
    if (errs.length) throw new Error('Kiểm tra lại file Excel thấy sai lệch: ' + errs.slice(0, 5).join('; '));
  }

  const api = { inspectTemplate, fillTemplate, classify };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.XaoDeXlsxTemplate = api;
})(typeof window !== 'undefined' ? window : globalThis);
