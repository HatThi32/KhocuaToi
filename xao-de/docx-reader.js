/*
 * Đọc file Word (.docx) thành văn bản đề gốc — không cần thư viện ngoài, chạy được khi không có mạng.
 *  - Nhận đáp án: chữ cái A/B/C/D (hoặc a/b/c/d) được GẠCH CHÂN => đánh dấu *
 *  - Bảng sau dòng HẾT / ĐÁP ÁN => dòng "| ô | ô |" để bộ đọc bảng đáp án xử lý
 *  - Bảng phương án (A. | B. | C. | D.) => một dòng
 *  - Bảng số liệu trong câu hỏi => dòng "| ô | ô |" (in lại thành bảng)
 *  - Chữ đậm => **...**, chỉ số trên/dưới => ký tự ₂ ² hoặc công thức
 *  - Công thức Equation (OMML) => LaTeX $...$; hình PNG/JPEG/GIF => ![](data:...)
 *  - Thông tin đầu đề (Sở, Trường, Kỳ thi, Năm học, Môn, Thời gian) => điền sẵn
 */
(function (root) {
  'use strict';

  // ======================= Giải nén ZIP =======================
  async function inflateRaw(bytes) {
    if (typeof DecompressionStream === 'undefined') throw new Error('Trình duyệt quá cũ, không giải nén được file .docx. Hãy dùng Chrome/Edge mới.');
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  async function unzip(buf) {
    const b = new Uint8Array(buf);
    const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
    let eocd = -1;
    for (let i = b.length - 22; i >= Math.max(0, b.length - 65557); i--) {
      if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
    }
    if (eocd < 0) throw new Error('File không phải định dạng .docx hợp lệ.');
    const count = dv.getUint16(eocd + 10, true);
    let p = dv.getUint32(eocd + 16, true);
    const files = new Map();
    const dec = new TextDecoder();
    for (let k = 0; k < count; k++) {
      if (dv.getUint32(p, true) !== 0x02014b50) break;
      const method = dv.getUint16(p + 10, true);
      const csize = dv.getUint32(p + 20, true);
      const nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true);
      const off = dv.getUint32(p + 42, true);
      const name = dec.decode(b.subarray(p + 46, p + 46 + nlen));
      const lnlen = dv.getUint16(off + 26, true), lxlen = dv.getUint16(off + 28, true);
      const start = off + 30 + lnlen + lxlen;
      files.set(name, { method, data: b.subarray(start, start + csize) });
      p += 46 + nlen + xlen + clen;
    }
    return {
      has: (n) => files.has(n),
      async bytes(n) {
        const f = files.get(n);
        if (!f) return null;
        if (f.method === 0) return f.data;
        if (f.method === 8) return inflateRaw(f.data);
        throw new Error('Kiểu nén không hỗ trợ: ' + f.method);
      },
      async text(n) {
        const by = await this.bytes(n);
        return by ? dec.decode(by) : null;
      },
    };
  }

  // ======================= Bộ phân tích XML tối giản =======================
  const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  function decodeEnt(s) {
    return s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e) => {
      if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
      return ENT[e] != null ? ENT[e] : m;
    });
  }
  function parseXml(xml) {
    const rootNode = { name: '#root', attrs: {}, children: [] };
    const stack = [rootNode];
    const re = /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!\[CDATA\[([\s\S]*?)\]\]>|<!DOCTYPE[^>]*>|<(\/?)([\w:.-]+)((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>|([^<]+)/g;
    let m;
    while ((m = re.exec(xml))) {
      const top = stack[stack.length - 1];
      if (m[1] != null) { top.children.push({ text: m[1] }); continue; }
      if (m[6] != null) { top.children.push({ text: decodeEnt(m[6]) }); continue; }
      if (!m[3]) continue;
      if (m[2] === '/') { if (stack.length > 1) stack.pop(); continue; }
      const attrs = {};
      m[4].replace(/([\w:.-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g, (a, k, v1, v2) => { attrs[k] = decodeEnt(v1 != null ? v1 : v2); return ''; });
      const node = { name: m[3], attrs, children: [] };
      top.children.push(node);
      if (!m[5]) stack.push(node);
    }
    return rootNode;
  }
  const kids = (n, name) => (n && n.children ? n.children.filter((c) => c.name === name) : []);
  const kid = (n, name) => (n && n.children ? n.children.find((c) => c.name === name) : null);
  function find(n, name) {
    if (!n || !n.children) return null;
    for (const c of n.children) {
      if (c.name === name) return c;
      const r = find(c, name);
      if (r) return r;
    }
    return null;
  }
  function textOf(n) {
    if (!n) return '';
    if (n.text != null) return n.text;
    return (n.children || []).map(textOf).join('');
  }

  // ======================= OMML → LaTeX =======================
  const NARY_TEX = { '∫': '\\int', '∬': '\\iint', '∭': '\\iiint', '∮': '\\oint', '∑': '\\sum', '∏': '\\prod', '⋃': '\\bigcup', '⋂': '\\bigcap' };
  const ACC_TEX = { '⃗': '\\overrightarrow', '→': '\\overrightarrow', '̂': '\\widehat', '^': '\\widehat', '̃': '\\widetilde',
    '̅': '\\overline', '¯': '\\overline', '̇': '\\dot', '̈': '\\ddot', '̌': '\\check', '⃖': '\\overleftarrow' };
  const TEX_ESC = { '{': '\\{', '}': '\\}', '%': '\\%', '#': '\\#', '&': '\\&', '$': '\\$', '\\': '\\backslash ' };

  function ommlVal(pr, name, def) {
    const n = kid(pr, name);
    if (!n) return def;
    const v = n.attrs['m:val'];
    return v == null ? def : v;
  }
  function omml(node) {
    if (!node || !node.children) return '';
    return node.children.map(ommlNode).join('');
  }
  function arg(n, name) { return omml(kid(n, name)); }
  function ommlNode(n) {
    if (n.text != null) return '';
    switch (n.name) {
      case 'm:r': {
        const t = kids(n, 'm:t').map(textOf).join('');
        const nor = find(kid(n, 'm:rPr'), 'm:nor');
        const esc = Array.from(t).map((c) => TEX_ESC[c] || c).join('');
        if (nor || /[à-ỹÀ-Ỹđ]/i.test(t.replace(/[a-z]/gi, '')) || /\s\S+\s/.test(t)) return t.trim() ? `\\text{${t.replace(/[{}]/g, '')}}` : ' ';
        return esc;
      }
      case 'm:f': {
        const noBar = ommlVal(kid(n, 'm:fPr'), 'm:type') === 'noBar';
        return noBar ? `\\binom{${arg(n, 'm:num')}}{${arg(n, 'm:den')}}` : `\\dfrac{${arg(n, 'm:num')}}{${arg(n, 'm:den')}}`;
      }
      case 'm:sSup': return `{${arg(n, 'm:e')}}^{${arg(n, 'm:sup')}}`;
      case 'm:sSub': return `{${arg(n, 'm:e')}}_{${arg(n, 'm:sub')}}`;
      case 'm:sSubSup': return `{${arg(n, 'm:e')}}_{${arg(n, 'm:sub')}}^{${arg(n, 'm:sup')}}`;
      case 'm:sPre': return `{}_{${arg(n, 'm:sub')}}^{${arg(n, 'm:sup')}}{${arg(n, 'm:e')}}`;
      case 'm:rad': {
        const hide = ommlVal(kid(n, 'm:radPr'), 'm:degHide', '0');
        const deg = arg(n, 'm:deg');
        return hide === '1' || hide === 'on' || !deg ? `\\sqrt{${arg(n, 'm:e')}}` : `\\sqrt[${deg}]{${arg(n, 'm:e')}}`;
      }
      case 'm:d': {
        const pr = kid(n, 'm:dPr');
        const fix = (c) => (c === '' ? '.' : c === '{' ? '\\{' : c === '}' ? '\\}' : c === '⟨' ? '\\langle' : c === '⟩' ? '\\rangle' : c === '‖' ? '\\|' : c);
        const beg = fix(ommlVal(pr, 'm:begChr', '('));
        const end = fix(ommlVal(pr, 'm:endChr', ')'));
        const sep = ommlVal(pr, 'm:sepChr', '|');
        return `\\left${beg} ${kids(n, 'm:e').map(omml).join(sep)} \\right${end}`;
      }
      case 'm:nary': {
        const pr = kid(n, 'm:naryPr');
        const chr = ommlVal(pr, 'm:chr', '∫');
        const subH = ommlVal(pr, 'm:subHide', '0') === '1', supH = ommlVal(pr, 'm:supHide', '0') === '1';
        const sub = arg(n, 'm:sub'), sup = arg(n, 'm:sup');
        return `${NARY_TEX[chr] || chr}${!subH && sub ? `_{${sub}}` : ''}${!supH && sup ? `^{${sup}}` : ''} ${arg(n, 'm:e')}`;
      }
      case 'm:func': {
        const name = omml(kid(n, 'm:fName')).trim();
        const fn = /^(sin|cos|tan|cot|log|ln|lg|exp)$/.test(name) ? '\\' + name : name;
        return `${fn} ${arg(n, 'm:e')}`;
      }
      case 'm:limLow': {
        const e = arg(n, 'm:e').trim();
        return /^(lim|max|min)$/.test(e) ? `\\${e}_{${arg(n, 'm:lim')}}` : `\\underset{${arg(n, 'm:lim')}}{${e}}`;
      }
      case 'm:limUpp': return `\\overset{${arg(n, 'm:lim')}}{${arg(n, 'm:e')}}`;
      case 'm:acc': {
        const chr = ommlVal(kid(n, 'm:accPr'), 'm:chr', '̂');
        return `${ACC_TEX[chr] || '\\widehat'}{${arg(n, 'm:e')}}`;
      }
      case 'm:bar': return ommlVal(kid(n, 'm:barPr'), 'm:pos', 'bot') === 'top' ? `\\overline{${arg(n, 'm:e')}}` : `\\underline{${arg(n, 'm:e')}}`;
      case 'm:groupChr': case 'm:box': case 'm:phant': return arg(n, 'm:e');
      case 'm:borderBox': return `\\boxed{${arg(n, 'm:e')}}`;
      case 'm:eqArr': return `\\begin{array}{l} ${kids(n, 'm:e').map(omml).join(' \\\\ ')} \\end{array}`;
      case 'm:m': return `\\begin{matrix} ${kids(n, 'm:mr').map((r) => kids(r, 'm:e').map(omml).join(' & ')).join(' \\\\ ')} \\end{matrix}`;
      case 'w:r': return kids(n, 'w:t').map(textOf).join('');
      default:
        if (/Pr$/.test(n.name)) return '';
        return omml(n);
    }
  }

  // Ký tự font Symbol (w:sym) thường gặp trong đề
  const SYMBOL = { 0x20: ' ', 0x2b: '+', 0x2d: '−', 0x3d: '=', 0x3c: '<', 0x3e: '>', 0xa3: '≤', 0xb3: '≥', 0xb9: '≠', 0xb1: '±', 0xb4: '×',
    0xb8: '÷', 0xae: '→', 0xac: '←', 0xde: '⇒', 0xdb: '⇔', 0xdc: '⇐', 0xa5: '∞', 0xce: '∈', 0xcf: '∉', 0xc7: '∩', 0xc8: '∪',
    0xcc: '⊂', 0xcd: '⊆', 0xc6: '∅', 0xd6: '√', 0xb0: '°', 0xbb: '≈', 0xba: '≡', 0x5e: '⊥', 0xd0: '∠', 0x44: 'Δ', 0x61: 'α',
    0x62: 'β', 0x67: 'γ', 0x64: 'δ', 0x65: 'ε', 0x6c: 'λ', 0x6d: 'μ', 0x70: 'π', 0x72: 'ρ', 0x73: 'σ', 0x6a: 'φ', 0x77: 'ω',
    0x57: 'Ω', 0x71: 'θ', 0x51: 'Θ', 0x53: 'Σ', 0x50: 'Π', 0x46: 'Φ', 0xa2: '′', 0xd7: '⋅', 0xbc: '…', 0xa7: '♣', 0xe0: '◊', 0x7c: '|' };
  const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', '−': '⁻', 'n': 'ⁿ' };
  const SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋', '−': '₋' };

  // ======================= Đọc tài liệu =======================
  function boolProp(rPr, name) {
    const n = kid(rPr, name);
    if (!n) return false;
    const v = n.attrs['w:val'];
    return v == null || !/^(0|false|off|none)$/i.test(v);
  }

  async function readDocx(buf) {
    const zip = await unzip(buf);
    const docXml = await zip.text('word/document.xml');
    if (!docXml) throw new Error('Không tìm thấy nội dung trong file .docx.');
    const warnings = [];
    const rels = new Map();
    const relXml = await zip.text('word/_rels/document.xml.rels');
    if (relXml) {
      kids(parseXml(relXml).children.find((c) => c.name === 'Relationships'), 'Relationship')
        .forEach((r) => rels.set(r.attrs.Id, r.attrs.Target));
    }
    const imgCache = new Map();
    async function image(rid, extent) {
      const target = rels.get(rid);
      if (!target) return null;
      const path = target.startsWith('/') ? target.slice(1) : 'word/' + target.replace(/^\.\//, '');
      if (!imgCache.has(path)) {
        const by = await zip.bytes(path);
        const W = root.XaoDeWord;
        const info = by && W && W.imageInfo(by);
        let uri = null;
        if (info) {
          let bin = '';
          for (let i = 0; i < by.length; i += 0x8000) bin += String.fromCharCode.apply(null, by.subarray(i, i + 0x8000));
          uri = `data:${info.mime};base64,${btoa(bin)}`;
        }
        imgCache.set(path, uri);
      }
      const uri = imgCache.get(path);
      if (!uri) {
        warnings.push(`Có hình ảnh định dạng ${(path.split('.').pop() || '').toUpperCase()} (thường là công thức MathType hoặc hình vẽ cũ) không đọc được — hãy chèn lại dưới dạng ảnh PNG/JPEG hoặc gõ công thức dạng $...$.`);
        return '[HÌNH ẢNH KHÔNG ĐỌC ĐƯỢC]';
      }
      const size = extent ? `${(extent.cx / 360000).toFixed(2)}x${(extent.cy / 360000).toFixed(2)}cm` : '';
      return `![${size}](${uri})`;
    }

    // Mỗi đoạn: mảng ký tự kèm định dạng {c, u, b}
    async function paragraph(p) {
      const chars = [];
      const add = (s, f) => { for (const c of Array.from(s)) chars.push({ c, u: f.u, b: f.b }); };
      async function walk(n, inherited) {
        for (const c of n.children || []) {
          if (c.text != null) continue;
          switch (c.name) {
            case 'w:r': await run(c); break;
            case 'm:oMathPara': add(' $$' + kids(c, 'm:oMath').map((m) => omml(m)).join(' ').trim() + '$$ ', {}); break;
            case 'm:oMath': add('$' + omml(c).trim() + '$', {}); break;
            case 'w:hyperlink': case 'w:ins': case 'w:smartTag': case 'w:sdt': case 'w:sdtContent': case 'w:fldSimple':
            case 'w:customXml': case 'w:moveTo': await walk(c); break;
            default: break; // w:del, w:pPr, w:bookmark…
          }
        }
      }
      async function run(r) {
        const rPr = kid(r, 'w:rPr');
        const uNode = kid(rPr, 'w:u');
        const f = {
          u: !!uNode && !/^none$/i.test(uNode.attrs['w:val'] || 'single'),
          b: boolProp(rPr, 'w:b'),
        };
        const va = kid(rPr, 'w:vertAlign');
        const vert = va ? va.attrs['w:val'] : '';
        for (const c of r.children || []) {
          if (c.text != null) continue;
          if (c.name === 'w:t') {
            let t = textOf(c);
            if (vert === 'superscript' || vert === 'subscript') {
              const map = vert === 'superscript' ? SUP : SUB;
              t = Array.from(t).every((ch) => map[ch]) ? Array.from(t).map((ch) => map[ch]).join('')
                : `$${vert === 'superscript' ? '^' : '_'}{\\text{${t}}}$`;
            }
            add(t, f);
          } else if (c.name === 'w:tab' || c.name === 'w:ptab') add('\t', f);
          else if (c.name === 'w:br' || c.name === 'w:cr') add(c.attrs['w:type'] === 'page' ? '\n' : '\n', f);
          else if (c.name === 'w:noBreakHyphen') add('-', f);
          else if (c.name === 'w:sym') {
            const code = parseInt(c.attrs['w:char'] || '0', 16) & 0xff;
            add(SYMBOL[code] || '', f);
            if (!SYMBOL[code]) warnings.push(`Có ký hiệu đặc biệt (font ${c.attrs['w:font'] || 'Symbol'}, mã ${c.attrs['w:char']}) không đọc được.`);
          } else if (c.name === 'w:drawing') {
            const blip = find(c, 'a:blip');
            const ext = find(c, 'wp:extent');
            const s = blip && (await image(blip.attrs['r:embed'], ext && { cx: +ext.attrs.cx, cy: +ext.attrs.cy }));
            if (s) add(s, {});
          } else if (c.name === 'w:object' || c.name === 'w:pict') {
            const im = find(c, 'v:imagedata');
            const s = im && (await image(im.attrs['r:id']));
            if (s) add(s, {});
          } else if (c.name === 'mc:AlternateContent') {
            const fb = kid(c, 'mc:Fallback') || kid(c, 'mc:Choice');
            if (fb) await run({ children: [{ name: 'w:rPr', children: rPr ? rPr.children : [] }, ...fb.children] });
          }
        }
      }
      await walk(p);
      return chars;
    }

    // Đánh dấu * trước chữ cái phương án được gạch chân; chuyển chữ đậm thành **...**
    function finishLine(chars) {
      const s = chars.map((x) => x.c).join('');
      const marks = new Set();
      const re = /(^|[\s\t])([A-Da-d])(\s*[.)])/g;
      let m;
      while ((m = re.exec(s))) {
        const at = m.index + m[1].length;
        const after = at + 1 + m[3].length;
        let k = after;
        while (k < chars.length && /\s/.test(chars[k].c)) k++;
        const letterU = chars[at].u || (m[3].trim() && chars[at + m[3].length] && chars[at + m[3].length].u);
        const textU = k < chars.length && chars[k].u && chars[Math.min(chars.length - 1, k + 3)].u;
        if ((letterU || textU) && !(at > 0 && s[at - 1] === '*')) marks.add(at);
      }
      // Đoạn đậm: bỏ qua nếu chỉ là nhãn (Câu 1:, A., PHẦN …) hoặc đậm cả dòng
      const bolds = [];
      for (let i = 0; i < chars.length; ) {
        if (!chars[i].b || /\s/.test(chars[i].c)) { i++; continue; }
        let j = i;
        while (j < chars.length && chars[j].c !== '\n' && (chars[j].b || (/[ \u00a0]/.test(chars[j].c) && j + 1 < chars.length && chars[j + 1].b))) j++;
        let e = j;
        while (e > i && /\s/.test(chars[e - 1].c)) e--;
        bolds.push([i, e]);
        i = j;
      }
      const keepBold = (a, b) => {
        const t = s.slice(a, b).trim();
        const ls = s.lastIndexOf('\n', a - 1) + 1;
        let le = s.indexOf('\n', b);
        if (le < 0) le = s.length;
        const atStart = s.slice(ls, a).trim() === '';
        if (!t || t.length >= s.slice(ls, le).trim().length - 1) return false; // đậm cả dòng
        if (atStart && /^(câu|question)\s*\d+/i.test(t)) return false;
        if (/^\*?[A-Da-d]\s*[.)]\s*$/.test(t)) return false;
        if (atStart && /^PH[ẦA]N\s/i.test(t)) return false;
        if (/[$!|]/.test(t)) return false;
        return true;
      };
      let out = '';
      const open = new Set(), close = new Set();
      bolds.forEach(([a, b]) => { if (keepBold(a, b)) { open.add(a); close.add(b); } });
      for (let i = 0; i <= chars.length; i++) {
        if (close.has(i)) out += '**';
        if (i === chars.length) break;
        if (open.has(i)) out += '**';
        if (marks.has(i)) out += '*';
        out += chars[i].c;
      }
      return out;
    }

    const blocks = [];
    async function body(n) {
      for (const c of n.children || []) {
        if (c.name === 'w:p') {
          const text = finishLine(await paragraph(c));
          blocks.push({ type: 'p', text });
        } else if (c.name === 'w:tbl') {
          const rows = [];
          for (const tr of kids(c, 'w:tr')) {
            const cells = [];
            for (const tc of kids(tr, 'w:tc')) {
              const ps = [];
              const collect = async (node) => {
                for (const x of node.children || []) {
                  if (x.name === 'w:p') ps.push(finishLine(await paragraph(x)));
                  else if (x.name === 'w:tbl' || x.name === 'w:tr' || x.name === 'w:tc' || x.name === 'w:sdt' || x.name === 'w:sdtContent') await collect(x);
                }
              };
              await collect(tc);
              const vm = find(kid(tc, 'w:tcPr'), 'w:vMerge');
              const merged = vm && vm.attrs['w:val'] !== 'restart';
              const span = +((find(kid(tc, 'w:tcPr'), 'w:gridSpan') || { attrs: {} }).attrs['w:val'] || 1);
              cells.push({ paras: merged ? [] : ps.map((t) => t.trim()).filter(Boolean) });
              for (let k = 1; k < span; k++) cells.push({ paras: [] });
            }
            rows.push(cells);
          }
          blocks.push({ type: 'table', rows });
        } else if (c.name === 'w:sdt' || c.name === 'w:sdtContent' || c.name === 'w:customXml') {
          await body(c);
        }
      }
    }
    const docRoot = parseXml(docXml);
    await body(find(docRoot, 'w:body'));
    return { blocks, warnings: [...new Set(warnings)] };
  }

  // ======================= Chuyển khối thành văn bản đề gốc =======================
  const RE_START = /^\s*(\[\s*(PH[ẦA]N|T[ỰU]\s*LU[ẬA]N|TR[ẮA]C|NH[ÓO]M)|PH[ẦA]N\s+(III|II|IV|I|\d+)\b|(C[âa]u|Question)\s*\d+)/i;
  const RE_STOP = /^\s*([-–—_=.*\s]*H[ẾE]T\s*[-–—_=.*\s]*|\[?\s*((BẢNG|PHẦN)\s+)?(ĐÁP\s*ÁN|HƯỚNG\s+DẪN\s+CHẤM)(?!\s*[:：]).*)$/i;
  const RE_HEADER_LINE = /^\s*(SỞ|BỘ|PHÒNG)\s|^\s*TRƯỜNG\b|^\s*TỔ(\s|$)|^\s*(ĐỀ\s+)?(KIỂM\s+TRA|THI|KỲ\s+THI|KÌ\s+THI)\b|NĂM\s+HỌC|^\s*MÔN\b|THỜI\s+GIAN|HỌ\s*(VÀ|,)?\s*TÊN|SỐ\s+BÁO\s+DANH|^\s*LỚP\s*:|MÃ\s+ĐỀ|ĐỀ\s+(CHÍNH\s+THỨC|THI\s+THỬ|MINH\s+HỌA)|^\s*\(\s*ĐỀ\s+(THI|KIỂM TRA)?\s*CÓ|^[\s.…_-]*$/i;

  function cellText(c) { return c.paras.join(' ').replace(/\|/g, '/').replace(/\s+/g, ' ').trim(); }

  function blocksToSource(blocks) {
    const out = [];
    const header = [];
    let started = false, inKey = false;
    const pushLine = (line) => {
      if (!started && !inKey) {
        if (RE_START.test(line)) started = true;
        else {
          if (!line.trim()) return;
          header.push(line.trim());
          if (RE_HEADER_LINE.test(line)) return; // dòng tiêu đề đề thi: chỉ lấy thông tin
        }
      } else if (!inKey && RE_STOP.test(line)) {
        inKey = true;
      }
      out.push(line);
    };
    blocks.forEach((b) => {
      if (b.type === 'p') {
        b.text.split('\n').forEach((l) => pushLine(l.replace(/\s+$/, '')));
        return;
      }
      const rows = b.rows.filter((r) => r.some((c) => c.paras.length));
      if (!rows.length) return;
      if (!started && !inKey) {
        // Bảng tiêu đề đề thi: mỗi ô, mỗi đoạn một dòng
        rows.forEach((r) => r.forEach((c) => c.paras.forEach((t) => t.split('\n').forEach(pushLine))));
        return;
      }
      if (inKey) {
        rows.forEach((r) => out.push('| ' + r.map(cellText).join(' | ') + ' |'));
        return;
      }
      const isOpt = (t) => /^\*?\s*[A-Da-d]\s*[.)]/.test(t);
      const optionTable = rows.every((r) => r.filter((c) => c.paras.length).every((c) => isOpt(c.paras[0])));
      if (optionTable) {
        rows.forEach((r) => out.push(r.map((c) => c.paras.join(' ')).filter(Boolean).join('   ')));
      } else {
        // Bảng số liệu nằm trong câu hỏi
        rows.forEach((r) => out.push('| ' + r.map(cellText).join(' | ') + ' |'));
      }
    });
    // gộp dòng trống liên tiếp
    const text = out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
    return { text, header };
  }

  // Lấy thông tin đầu đề: Sở, Trường, Kỳ thi, Năm học, Môn, Thời gian
  function extractMeta(lines) {
    const meta = {};
    lines.forEach((raw) => {
      const l = raw.replace(/\s+/g, ' ').trim();
      let m;
      if (!meta.dept && /^(SỞ|BỘ|PHÒNG)\s/i.test(l)) meta.dept = l;
      else if (!meta.school && /^TRƯỜNG\b/i.test(l)) meta.school = l.replace(/[\s.…]+$/, (t) => (/…|\.{2,}/.test(t) ? ' ' + t.trim() : '')).trim();
      if ((m = l.match(/NĂM\s+HỌC\s*:?\s*(\d{4})\s*[-–—]\s*(\d{4})/i))) meta.year = `${m[1]} – ${m[2]}`;
      if ((m = l.match(/^(?:ĐỀ\s+)?((?:KIỂM\s+TRA|KỲ\s+THI|KÌ\s+THI|THI)\b.*?)(?:\s*[-–—,]\s*NĂM\s+HỌC.*|\s+MÔN\b.*)?$/i)) && !meta.examName) {
        const t = m[1].replace(/\s*[-–—,]\s*$/, '').trim();
        if (t.length > 4 && !/THỜI\s+GIAN/i.test(t)) meta.examName = t;
      }
      if ((m = l.match(/\bMÔN(?:\s+THI)?\s*:?\s*([^,;(]+?)(?:\s*[-–—(;,]|\s+THỜI\s+GIAN|$)/i)) && !meta.subjectText) meta.subjectText = m[1].trim();
      if ((m = l.match(/THỜI\s+GIAN(?:\s+LÀM\s+BÀI)?\s*:?\s*(\d{1,3})\s*PHÚT/i))) meta.time = m[1];
      if (/ĐỀ\s+(CHÍNH\s+THỨC|THI\s+THỬ|MINH\s+HỌA|KIỂM\s+TRA)\s*$/i.test(l) && !meta.docType) meta.docType = l.match(/ĐỀ\s+(CHÍNH\s+THỨC|THI\s+THỬ|MINH\s+HỌA|KIỂM\s+TRA)/i)[0].toUpperCase();
    });
    return meta;
  }

  async function docxToSource(buf) {
    const { blocks, warnings } = await readDocx(buf);
    const { text, header } = blocksToSource(blocks);
    return { text, meta: extractMeta(header), warnings };
  }

  const api = { unzip, parseXml, readDocx, blocksToSource, extractMeta, docxToSource, ommlToLatex: omml };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.XaoDeDocx = api;
})(typeof window !== 'undefined' ? window : globalThis);
