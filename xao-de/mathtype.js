/*
 * Đọc công thức MathType / Microsoft Equation 3.0 nhúng trong file Word (.docx)
 * và chuyển thành LaTeX — không cần thư viện ngoài.
 *
 *  1. File OLE (word/embeddings/oleObjectN.bin) là định dạng Compound File Binary (CFB):
 *     lấy luồng dữ liệu "Equation Native".
 *  2. "Equation Native" = 28 byte tiêu đề + dữ liệu MTEF (phiên bản 3: Equation 3.0, phiên bản 5: MathType 5+).
 *  3. Giải mã các bản ghi MTEF (LINE, CHAR, TMPL, PILE, MATRIX…) thành cây, rồi sinh LaTeX.
 *
 * Tham khảo đặc tả MTEF của Design Science và gem Ruby "mathtype" (MIT).
 */
(function (root) {
  'use strict';

  // ======================= Compound File Binary =======================
  function readCFB(bytes) {
    const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    const sig = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];
    if (b.length < 512 || sig.some((v, i) => b[i] !== v)) throw new Error('Không phải file OLE');
    const u16 = (o) => dv.getUint16(o, true);
    const u32 = (o) => dv.getUint32(o, true);
    const secSize = 1 << u16(0x1e);
    const miniSize = 1 << u16(0x20);
    const firstDir = u32(0x30);
    const cutoff = u32(0x38);
    const firstMiniFat = u32(0x3c);
    const firstDifat = u32(0x44);
    const nDifat = u32(0x48);
    const END = 0xfffffffe, FREE = 0xffffffff;
    const secOff = (s) => (s + 1) * secSize;
    // Danh sách sector chứa FAT
    const fatSecs = [];
    for (let i = 0; i < 109; i++) { const s = u32(0x4c + i * 4); if (s !== FREE && s !== END) fatSecs.push(s); }
    let d = firstDifat, guard = 0;
    while (d !== END && d !== FREE && guard++ < nDifat + 4 && secOff(d) + secSize <= b.length) {
      for (let i = 0; i < secSize / 4 - 1; i++) { const s = u32(secOff(d) + i * 4); if (s !== FREE && s !== END) fatSecs.push(s); }
      d = u32(secOff(d) + secSize - 4);
    }
    const fat = [];
    fatSecs.forEach((s) => { for (let i = 0; i < secSize / 4; i++) if (secOff(s) + i * 4 + 4 <= b.length) fat.push(u32(secOff(s) + i * 4)); });
    const chain = (start, table) => {
      const out = [];
      let s = start, g = 0;
      while (s !== END && s !== FREE && s < table.length + 1 && g++ < 1e6) { out.push(s); s = table[s]; if (s === undefined) break; }
      return out;
    };
    const readChain = (start) => {
      const secs = chain(start, fat);
      const out = new Uint8Array(secs.length * secSize);
      secs.forEach((s, i) => out.set(b.subarray(secOff(s), Math.min(b.length, secOff(s) + secSize)), i * secSize));
      return out;
    };
    const dir = readChain(firstDir);
    const ddv = new DataView(dir.buffer);
    const entries = [];
    for (let o = 0; o + 128 <= dir.length; o += 128) {
      const nlen = ddv.getUint16(o + 0x40, true);
      let name = '';
      for (let i = 0; i < Math.max(0, nlen - 2); i += 2) name += String.fromCharCode(ddv.getUint16(o + i, true));
      entries.push({ name, type: dir[o + 0x42], start: ddv.getUint32(o + 0x74, true), size: ddv.getUint32(o + 0x78, true) });
    }
    const rootE = entries[0];
    const miniStream = rootE ? readChain(rootE.start) : new Uint8Array(0);
    const miniFatBytes = firstMiniFat !== END && firstMiniFat !== FREE ? readChain(firstMiniFat) : new Uint8Array(0);
    const mdv = new DataView(miniFatBytes.buffer);
    const miniFat = [];
    for (let i = 0; i + 4 <= miniFatBytes.length; i += 4) miniFat.push(mdv.getUint32(i, true));
    const streams = new Map();
    entries.forEach((e) => {
      if (e.type !== 2) return;
      let data;
      if (e.size < cutoff) {
        const secs = chain(e.start, miniFat);
        data = new Uint8Array(secs.length * miniSize);
        secs.forEach((s, i) => data.set(miniStream.subarray(s * miniSize, s * miniSize + miniSize), i * miniSize));
      } else data = readChain(e.start);
      streams.set(e.name, data.subarray(0, e.size));
    });
    return streams;
  }

  // ======================= Giải mã MTEF =======================
  function Reader(b, p) { this.b = b; this.p = p || 0; }
  Reader.prototype.u8 = function () { if (this.p >= this.b.length) throw new Error('Hết dữ liệu MTEF'); return this.b[this.p++]; };
  Reader.prototype.u16 = function () { const lo = this.u8(); return lo | (this.u8() << 8); };
  Reader.prototype.str = function () { let s = ''; let c; while ((c = this.u8()) !== 0) s += String.fromCharCode(c); return s; };
  Reader.prototype.nudge = function () { const dx = this.u8(), dy = this.u8(); if (dx === 128 && dy === 128) { this.u16(); this.u16(); } };
  Reader.prototype.ruler = function () { const n = this.u8(); for (let i = 0; i < n; i++) { this.u8(); this.u16(); } };

  // Phiên bản 5 (MathType 5, 6, 7…)
  function readV5(r) {
    const type = r.u8();
    let o;
    switch (type) {
      case 0: return { t: 'end' };
      case 1: {
        o = r.u8();
        if (o & 0x08) r.nudge();
        if (o & 0x04) r.u16();
        if (o & 0x02) r.ruler();
        return { t: 'line', items: o & 0x01 ? [] : list(r, readV5) };
      }
      case 2: {
        o = r.u8();
        if (o & 0x08) r.nudge();
        const tf = (r.u8() << 24 >> 24) + 128;
        let code = 0;
        if (!(o & 0x20)) code = r.u16();
        if (o & 0x04) { const c8 = r.u8(); if (o & 0x20) code = c8; }
        else if (o & 0x10) { const c16 = r.u16(); if (o & 0x20) code = c16; }
        const emb = o & 0x01 ? list(r, readV5) : [];
        return { t: 'char', code, tf, emb, func: !!(o & 0x02) };
      }
      case 3: {
        o = r.u8();
        if (o & 0x08) r.nudge();
        const sel = r.u8();
        let v = r.u8();
        if (v & 0x80) v = (v & 0x7f) | (r.u8() << 8);
        r.u8(); // tùy chọn riêng của khuôn
        return { t: 'tmpl', sel, v, subs: list(r, readV5) };
      }
      case 4: {
        o = r.u8();
        if (o & 0x08) r.nudge();
        const halign = r.u8(); r.u8();
        if (o & 0x02) r.ruler();
        return { t: 'pile', halign, lines: list(r, readV5) };
      }
      case 5: {
        o = r.u8();
        if (o & 0x08) r.nudge();
        r.u8(); const hj = r.u8(); r.u8();
        const rows = r.u8(), cols = r.u8();
        r.p += Math.ceil(((rows + 1) * 2) / 8) + Math.ceil(((cols + 1) * 2) / 8);
        return { t: 'matrix', rows, cols, hj, cells: list(r, readV5) };
      }
      case 6: { o = r.u8(); if (o & 0x08) r.nudge(); return { t: 'embell', e: r.u8() }; }
      case 7: r.ruler(); return { t: 'skip' };
      case 8: r.u8(); r.u8(); return { t: 'skip' };
      case 9: size(r); return { t: 'skip' };
      case 10: case 11: case 12: case 13: case 14: return { t: 'skip' };
      case 15: r.u8(); return { t: 'skip' };
      case 16: { o = r.u8(); const n = o & 0x01 ? 4 : 3; for (let i = 0; i < n; i++) r.u16(); if (o & 0x04) r.str(); return { t: 'skip' }; }
      case 17: r.u8(); r.str(); return { t: 'skip' };
      case 18: eqnPrefs(r); return { t: 'skip' };
      case 19: r.str(); return { t: 'skip' };
      default:
        if (type >= 100) { const n = r.u8(); r.p += n; return { t: "skip" }; }
        throw new Error('Bản ghi MTEF lạ: ' + type);
    }
  }
  function size(r) {
    const s = r.u8();
    if (s === 101) r.u16(); else if (s === 100) { r.u8(); r.u16(); } else r.u8();
  }
  function eqnPrefs(r) {
    r.u8();
    const nib = () => {
      // đọc các mục dạng nửa byte, kết thúc bằng 0xF
      const count = r.u8();
      let half = null;
      const next = () => { if (half != null) { const h = half; half = null; return h; } const by = r.u8(); half = by & 0x0f; return by >> 4; };
      for (let i = 0; i < count; i++) { next(); while (next() !== 0x0f); }
    };
    nib(); nib();
    const ns = r.u8();
    for (let i = 0; i < ns; i++) { if (r.u8() !== 0) r.u8(); }
  }

  // Phiên bản 3 (Microsoft Equation 3.0, MathType 3/4): thẻ = loại (4 bit thấp) + tùy chọn (4 bit cao)
  const V3_SEL = {
    0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 9, 9: 9, 10: 9, 11: 9, 12: 9, 13: 10, 14: 11, 16: 12, 17: 13,
    18: 14, 19: 14, 20: 14, 21: 15, 22: 15, 23: 15, 24: 15, 25: 15, 26: 15, 27: 24, 28: 24, 29: 16, 30: 16, 31: 17, 32: 17,
    33: 18, 34: 18, 35: 19, 36: 19, 37: 20, 38: 20, 39: 23, 40: 26, 41: 11, 42: 21, 43: 22, 45: 30, 46: 31, 47: 31, 48: 37,
  };
  function readV3(r) {
    const tag = r.u8();
    const type = tag & 0x0f, o = tag >> 4;
    switch (type) {
      case 0: return { t: 'end' };
      case 1:
        if (o & 0x08) r.nudge();
        if (o & 0x04) r.u16();
        if (o & 0x02) r.ruler();
        return { t: 'line', items: o & 0x01 ? [] : list(r, readV3) };
      case 2: {
        if (o & 0x08) r.nudge();
        const tf = (r.u8() << 24 >> 24) + 128;
        const code = r.u16();
        const emb = o & 0x02 ? list(r, readV3) : [];
        return { t: 'char', code, tf, emb };
      }
      case 3: {
        if (o & 0x08) r.nudge();
        const s3 = r.u8(), v3 = r.u8();
        r.u8();
        const subs = list(r, readV3);
        if (s3 === 15 || s3 === 44) return { t: 'tmpl', sel: [28, 27, 29][v3] || 28, v: 0, subs, v3: true };
        let sel = V3_SEL[s3];
        let v = v3;
        if (s3 === 41) v = 0x02; // phân số dạng a/b
        if (s3 >= 21 && s3 <= 26) v = (s3 - 20 > 3 ? 4 : s3 - 20); // tích phân đơn/kép/ba/đường
        if (sel == null) sel = -1;
        return { t: 'tmpl', sel, v, subs, v3: true, s3 };
      }
      case 4: {
        if (o & 0x08) r.nudge();
        const halign = r.u8(); r.u8();
        if (o & 0x02) r.ruler();
        return { t: 'pile', halign, lines: list(r, readV3) };
      }
      case 5: {
        if (o & 0x08) r.nudge();
        r.u8(); const hj = r.u8(); r.u8();
        const rows = r.u8(), cols = r.u8();
        r.p += Math.ceil(((rows + 1) * 2) / 8) + Math.ceil(((cols + 1) * 2) / 8);
        return { t: 'matrix', rows, cols, hj, cells: list(r, readV3) };
      }
      case 6: if (o & 0x08) r.nudge(); return { t: 'embell', e: r.u8() };
      case 7: r.ruler(); return { t: 'skip' };
      case 8: r.u8(); r.u8(); r.str(); return { t: 'skip' };
      case 9: size(r); return { t: 'skip' };
      default: return { t: 'skip' }; // 10–14: cỡ chữ
    }
  }
  function list(r, fn) {
    const out = [];
    for (let g = 0; g < 100000; g++) {
      const rec = fn(r);
      if (rec.t === 'end') return out;
      if (rec.t !== 'skip') out.push(rec);
      if (r.p >= r.b.length) return out;
    }
    return out;
  }

  /** Trả về cây công thức từ dữ liệu "Equation Native" */
  function parseEquationNative(native) {
    const hdr = native[0] | (native[1] << 8);
    const m = native.subarray(hdr > 0 && hdr < 64 ? hdr : 28);
    const ver = m[0];
    let r;
    if (ver >= 4) {
      r = new Reader(m, 5);
      r.str(); // application key
      r.u8(); // equation options
      return { ver, items: list(r, readV5) };
    }
    r = new Reader(m, 5);
    return { ver, items: list(r, readV3) };
  }

  // ======================= Sinh LaTeX =======================
  const FUNC_NAMES = new Set(['sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'arcsin', 'arccos', 'arctan', 'sinh', 'cosh', 'tanh', 'coth',
    'log', 'ln', 'lg', 'exp', 'lim', 'max', 'min', 'sup', 'inf', 'det', 'gcd', 'deg', 'dim', 'ker', 'arg']);
  const DELIM = { '(': '(', ')': ')', '[': '[', ']': ']', '{': '\\{', '}': '\\}', '|': '|', '‖': '\\|', '‖': '\\|',
    '⟨': '\\langle', '⟩': '\\rangle', '〈': '\\langle', '〉': '\\rangle', '〈': '\\langle', '〉': '\\rangle',
    '⌊': '\\lfloor', '⌋': '\\rfloor', '⌈': '\\lceil', '⌉': '\\rceil', '〚': '[', '〛': ']', '⟦': '[', '⟧': ']' };
  const DEFAULT_FENCE = { 0: ['\\langle', '\\rangle'], 1: ['(', ')'], 2: ['\\{', '\\}'], 3: ['[', ']'], 4: ['|', '|'], 5: ['\\|', '\\|'],
    6: ['\\lfloor', '\\rfloor'], 7: ['\\lceil', '\\rceil'], 8: ['[', ']'] };
  const BIGOP = { 16: '\\sum', 17: '\\prod', 18: '\\coprod', 19: '\\bigcup', 20: '\\bigcap' };
  const OPCHAR = { '∯': '\\oiint', '∰': '\\oiiint', '∲': '\\oint', '∳': '\\oint', '∑': '\\sum', '∏': '\\prod', '∐': '\\coprod', '⋃': '\\bigcup', '⋂': '\\bigcap', '∫': '\\int', '∬': '\\iint', '∭': '\\iiint', '∮': '\\oint', '∪': '\\bigcup', '∩': '\\bigcap' };
  const ESC = { '{': '\\{', '}': '\\}', '%': '\\%', '#': '\\#', '&': '\\&', $: '\\$', '\\': '\\backslash ', '_': '\\_', '^': '\\hat{}', '~': '\\sim ' };

  function charText(c) {
    let code = c.code;
    if (code >= 0xef00 && code <= 0xef1f) return { sp: true }; // khoảng trắng của MathType
    if (code >= 0x2000 && code <= 0x200b) return { sp: true };
    if (code >= 0xe000 && code <= 0xf8ff) {
      const PUA = { 0xeb00: '', 0xeb01: '', 0xeb02: '', 0xeb05: '', 0xeb06: '', 0xeb08: '…', 0xeb09: '⋯', 0xeb19: '≠', 0xec01: '→', 0xf0e0: '' };
      return { s: PUA[code] != null ? PUA[code] : '' };
    }
    if (code === 0) return { s: '' };
    return { s: String.fromCodePoint(code) };
  }

  function Gen() { this.unknown = 0; }

  // Sinh LaTeX cho một dãy phần tử (nội dung của một LINE)
  Gen.prototype.seq = function (items) {
    const out = []; // các "nguyên tử" LaTeX
    let word = null; // gom chữ dạng hàm (sin, lim…) hoặc chữ thường văn bản
    const flush = () => {
      if (!word) return;
      if (word.kind === 'func') {
        const w = word.s;
        out.push(FUNC_NAMES.has(w) ? '\\' + w : `\\mathrm{${w}}`);
      } else out.push(`\\text{${word.s.replace(/[{}\\]/g, '')}}`);
      word = null;
    };
    items.forEach((it) => {
      if (it.t === 'char') {
        const ct = charText(it);
        const ch = ct.s || '';
        const isLetter = /^[A-Za-z]$/.test(ch);
        // kiểu chữ: 1 văn bản, 2 hàm, 3 biến, 7 vectơ, 8 số…
        if (it.tf === 2 && isLetter && !it.emb.length) {
          if (word && word.kind === 'func') word.s += ch; else { flush(); word = { kind: 'func', s: ch }; }
          return;
        }
        if (it.tf === 1 && (ct.sp || ch) && (/[\p{L}\p{N}\s.,:;!?'"-]/u.test(ch) || ct.sp)) {
          const add = ct.sp ? ' ' : ch;
          if (word && word.kind === 'text') word.s += add; else { flush(); if (add.trim()) word = { kind: 'text', s: add }; }
          return;
        }
        flush();
        if (ct.sp) { out.push('\\,'); return; }
        let a = ESC[ch] || ch;
        if (ch === '−') a = '-';
        if (it.tf === 7 && isLetter) a = `\\mathbf{${ch}}`;
        a = this.embell(a, it.emb);
        if (a) out.push(a);
        return;
      }
      flush();
      if (it.t === 'tmpl') {
        const sel = it.sel;
        if (sel === 27 || sel === 28 || sel === 29) {
          const subs = it.subs.filter((s) => s.t === 'line' || s.t === 'pile');
          const vals = subs.map((x) => this.slot(x));
          const filled = vals.filter((x) => x);
          let sub = '', sup = '';
          if (sel === 27) sub = filled[0] || '';
          else if (sel === 28) sup = filled[filled.length - 1] || '';
          else { sub = vals[0] || ''; sup = vals[1] || ''; }
          if (!it.v3 && (it.v & 0x1)) { // chỉ số đứng trước ký hiệu phía sau
            out.push(`{}${sub ? `_{${sub}}` : ''}${sup ? `^{${sup}}` : ''}`);
            return;
          }
          let base = out.length ? out.pop() : '{}';
          // "(a+b)" gõ bằng phím rồi thêm mũ: gộp cả cặp ngoặc làm cơ sở của số mũ
          const CLOSE = { ')': '(', ']': '[', '\\}': '\\{', '|': '|' };
          if (CLOSE[base]) {
            let k = out.length - 1;
            while (k >= 0 && out[k] !== CLOSE[base]) k--;
            if (k >= 0) {
              const inner = out.splice(k + 1).join(' ');
              out.pop();
              const L = CLOSE[base], R = base;
              base = `\\left${L} ${inner} \\right${R}`;
            }
          }
          out.push(`{${base}}${sub ? `_{${sub}}` : ''}${sup ? `^{${sup}}` : ''}`);
          return;
        }
        out.push(this.tmpl(it));
        return;
      }
      if (it.t === 'line') { const s = this.seq(it.items); if (s) out.push(`{${s}}`); return; }
      if (it.t === 'pile') { out.push(this.pile(it)); return; }
      if (it.t === 'matrix') { out.push(this.matrix(it)); return; }
    });
    flush();
    // nối, chèn khoảng trắng sau lệnh \abc nếu ký tự tiếp theo là chữ
    let s = '';
    out.forEach((a) => {
      if (/\\[A-Za-z]+$/.test(s) && /^[\p{L}0-9]/u.test(a)) s += ' ';
      s += a;
    });
    return s;
  };

  Gen.prototype.embell = function (a, emb) {
    emb.forEach((e) => {
      const k = e.e;
      if (k === 2) a = `\\dot{${a}}`;
      else if (k === 3) a = `\\ddot{${a}}`;
      else if (k === 5) a = `${a}'`;
      else if (k === 6) a = `${a}''`;
      else if (k === 18) a = `${a}'''`;
      else if (k === 8) a = `\\tilde{${a}}`;
      else if (k === 9) a = `\\hat{${a}}`;
      else if (k === 10) a = `\\not ${a}`;
      else if (k === 11 || k === 14) a = `\\overrightarrow{${a}}`;
      else if (k === 12 || k === 15) a = `\\overleftarrow{${a}}`;
      else if (k === 13) a = `\\overrightarrow{${a}}`;
      else if (k === 17) a = `\\overline{${a}}`;
      else if (k === 29) a = `\\underline{${a}}`;
      else if (k === 19) a = `\\widehat{${a}}`;
    });
    return a;
  };

  Gen.prototype.slot = function (s) {
    if (!s) return '';
    if (s.t === 'line') return this.seq(s.items);
    if (s.t === 'pile') return this.pile(s);
    if (s.t === 'char') return this.seq([s]);
    return this.seq([s]);
  };

  Gen.prototype.pile = function (p) {
    const lines = p.lines.filter((l) => l.t === 'line' || l.t === 'pile').map((l) => this.slot(l));
    if (lines.length === 1) return lines[0];
    const al = { 1: 'l', 2: 'c', 3: 'r', 4: 'l', 5: 'r' }[p.halign] || 'l';
    return `\\begin{array}{${al}} ${lines.join(' \\\\ ')} \\end{array}`;
  };

  Gen.prototype.matrix = function (m) {
    const cells = m.cells.filter((c) => c.t === 'line' || c.t === 'pile').map((c) => this.slot(c));
    const rows = [];
    for (let i = 0; i < m.rows; i++) rows.push(cells.slice(i * m.cols, i * m.cols + m.cols).join(' & '));
    const al = { 1: 'l', 2: 'c', 3: 'r' }[m.hj] || 'c';
    return `\\begin{array}{${al.repeat(Math.max(1, m.cols))}} ${rows.join(' \\\\ ')} \\end{array}`;
  };

  Gen.prototype.tmpl = function (t) {
    const sel = t.sel, v = t.v;
    const slots = t.subs.filter((s) => s.t === 'line' || s.t === 'pile');
    const chars = t.subs.filter((s) => s.t === 'char').map((c) => charText(c).s || '');
    const S = (i) => this.slot(slots[i]);
    // Ngoặc (0–8) và khoảng (9)
    if (sel >= 0 && sel <= 9) {
      let L, R;
      const dl = (c) => (c == null ? null : DELIM[c] || (c ? c : null));
      if (sel === 9 || chars.length) {
        if (sel === 9 || chars.length >= 2) { L = dl(chars[0]); R = dl(chars[1]); }
        else if (v & 1 && !(v & 2)) { L = dl(chars[0]); R = '.'; }
        else if (v & 2 && !(v & 1)) { L = '.'; R = dl(chars[0]); }
        else { L = dl(chars[0]); R = DEFAULT_FENCE[sel] ? DEFAULT_FENCE[sel][1] : '.'; }
      }
      const def = DEFAULT_FENCE[sel] || ['(', ')'];
      if (L == null) L = t.v3 || (v & 1) || !(v & 3) ? def[0] : '.';
      if (R == null) R = t.v3 || (v & 2) || !(v & 3) ? def[1] : '.';
      if (!t.v3 && sel <= 8 && (v & 3)) { if (!(v & 1)) L = '.'; if (!(v & 2)) R = '.'; }
      return `\\left${L} ${S(0)} \\right${R}`;
    }
    if (sel === 10) { const idx = S(1); return idx ? `\\sqrt[${idx}]{${S(0)}}` : `\\sqrt{${S(0)}}`; }
    if (sel === 11) {
      if (v & 0x02) return `{${S(0)}}/{${S(1)}}`;
      return `\\dfrac{${S(0)}}{${S(1)}}`;
    }
    if (sel === 12) return `\\underline{${S(0)}}`;
    if (sel === 13) return `\\overline{${S(0)}}`;
    if (sel === 14) {
      const top = S(0), bot = S(1);
      const arrow = v & 0x10 && !(v & 0x20) ? '\\xleftarrow' : '\\xrightarrow';
      return `${arrow}${bot ? `[${bot}]` : ''}{${top}}`;
    }
    if (sel >= 15 && sel <= 22) {
      let op;
      // ký hiệu toán tử: ký tự riêng, hoặc nằm trong ô thứ 4 (toán tử tùy chọn)
      let oc = chars.find((c) => c);
      if (!oc && slots[3]) oc = slots[3].t === 'line' ? slots[3].items.filter((x) => x.t === 'char').map((x) => charText(x).s || '').join('') : '';
      const n = v & 0x3, loop = v & 0xc;
      if (sel === 15 && n) {
        op = loop ? ['\\oint', '\\oint', '\\oiint', '\\oiiint'][n] : ['\\int', '\\int', '\\iint', '\\iiint'][n];
      } else if (oc && OPCHAR[oc]) op = OPCHAR[oc];
      else if (oc) op = `\\mathop{${oc}}`;
      else op = BIGOP[sel] || '\\int';
      const lo = S(1), up = S(2);
      return `${op}${lo ? `_{${lo}}` : ''}${up ? `^{${up}}` : ''} ${S(0)}`;
    }
    if (sel === 23) {
      const main = S(0).replace(/^\\mathrm\{(.*)\}$/, '$1').replace(/^\\/, '');
      const lo = S(1), up = S(2);
      if (/^(lim|max|min|sup|inf)$/.test(main)) return `\\${main}${lo ? `_{${lo}}` : ''}${up ? `^{${up}}` : ''}`;
      return `\\underset{${lo}}{${S(0)}}`;
    }
    if (sel === 24 || sel === 25) return `${S(0)}`;
    if (sel === 26) return `${S(1) ? S(1) + ' ' : ''}${S(0)}`;
    if (sel === 30) return `\\langle ${S(0)} | ${S(1)} \\rangle`;
    if (sel === 31) return (v & 0x1) && !(v & 0x2) ? `\\overleftarrow{${S(0)}}` : `\\overrightarrow{${S(0)}}`;
    if (sel === 32) return `\\widetilde{${S(0)}}`;
    if (sel === 33) return `\\widehat{${S(0)}}`;
    if (sel === 34) return `\\widehat{${S(0)}}`;
    if (sel === 37) return `\\boxed{${S(0)}}`;
    this.unknown++;
    return slots.map((s) => this.slot(s)).join(' ');
  };

  /** Dữ liệu file OLE nhúng (oleObjectN.bin) => { latex, display } hoặc null nếu không phải công thức */
  function oleToLatex(bytes) {
    const streams = readCFB(bytes);
    const native = streams.get('Equation Native');
    if (!native) return null;
    const tree = parseEquationNative(native);
    const g = new Gen();
    const parts = tree.items.map((it) => (it.t === 'line' ? g.seq(it.items) : g.slot(it))).filter((s) => s !== '');
    let latex = parts.length > 1 ? `\\begin{array}{l} ${parts.join(' \\\\ ')} \\end{array}` : parts[0] || '';
    latex = latex.replace(/\s+/g, ' ').trim();
    return { latex, version: tree.ver, unknown: g.unknown };
  }

  const api = { readCFB, parseEquationNative, oleToLatex };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.XaoDeMathType = api;
})(typeof window !== 'undefined' ? window : globalThis);
