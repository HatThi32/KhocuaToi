/*
 * Tạo file Word (.docx) chuẩn cho đề thi — không cần thư viện ngoài.
 *  - Khổ A4, lề tùy chỉnh, Times New Roman, giãn dòng tùy chỉnh
 *  - Tiêu đề 2 cột, khung "ĐỀ CHÍNH THỨC", khung "Mã đề thi"
 *  - Phương án A, B, C, D xếp 4 / 2 / 1 cột tự động, thẳng hàng
 *  - Mỗi mã đề là một section riêng, chân trang "Trang x/y – Mã đề thi ..."
 *  - Công thức $...$ (LaTeX) được chuyển thành công thức Word (OMML)
 *  - Giữ câu hỏi không bị tách khỏi các phương án khi sang trang
 */
(function (root) {
  'use strict';

  const CM = 567; // twip trên 1 cm
  const PAGE_W = 11906; // A4
  const PAGE_H = 16838;
  const EMU_PER_TWIP = 635;

  // ======================= Tiện ích XML =======================
  function x(s) {
    return String(s == null ? '' : s)
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
      .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '$1')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ======================= LaTeX → OMML =======================
  const SYM = {
    alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ϵ', varepsilon: 'ε', zeta: 'ζ', eta: 'η',
    theta: 'θ', vartheta: 'ϑ', iota: 'ι', kappa: 'κ', lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', omicron: 'ο',
    pi: 'π', varpi: 'ϖ', rho: 'ρ', varrho: 'ϱ', sigma: 'σ', varsigma: 'ς', tau: 'τ', upsilon: 'υ', phi: 'ϕ',
    varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω', Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ',
    Pi: 'Π', Sigma: 'Σ', Upsilon: 'Υ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',
    infty: '∞', le: '≤', leq: '≤', leqslant: '⩽', ge: '≥', geq: '≥', geqslant: '⩾', ne: '≠', neq: '≠',
    pm: '±', mp: '∓', cdot: '⋅', times: '×', div: '÷', ast: '∗', star: '⋆', circ: '∘', bullet: '∙',
    in: '∈', notin: '∉', ni: '∋', subset: '⊂', subseteq: '⊆', supset: '⊃', supseteq: '⊇', cup: '∪', cap: '∩',
    setminus: '∖', emptyset: '∅', varnothing: '∅', forall: '∀', exists: '∃', nexists: '∄', neg: '¬',
    land: '∧', wedge: '∧', lor: '∨', vee: '∨', to: '→', rightarrow: '→', leftarrow: '←', gets: '←',
    Rightarrow: '⇒', Leftarrow: '⇐', Leftrightarrow: '⇔', leftrightarrow: '↔', iff: '⇔', implies: '⇒',
    longrightarrow: '⟶', Longrightarrow: '⟹', longleftrightarrow: '⟷', Longleftrightarrow: '⟺',
    mapsto: '↦', uparrow: '↑', downarrow: '↓', rightleftharpoons: '⇌', leftrightharpoons: '⇋',
    approx: '≈', simeq: '≃', cong: '≅', equiv: '≡', sim: '∼', propto: '∝', perp: '⊥', parallel: '∥',
    angle: '∠', triangle: '△', square: '□', Box: '□', degree: '°', prime: '′',
    partial: '∂', nabla: '∇', ell: 'ℓ', hbar: 'ℏ', Re: 'ℜ', Im: 'ℑ', aleph: 'ℵ',
    cdots: '⋯', ldots: '…', dots: '…', dotsc: '…', dotsb: '⋯', vdots: '⋮', ddots: '⋱',
    mid: '∣', nmid: '∤', backslash: '\\', vert: '|', Vert: '‖', lbrace: '{', rbrace: '}',
    langle: '⟨', rangle: '⟩', lfloor: '⌊', rfloor: '⌋', lceil: '⌈', rceil: '⌉', lvert: '|', rvert: '|',
    lVert: '‖', rVert: '‖', ll: '≪', gg: '≫', oplus: '⊕', otimes: '⊗', odot: '⊙', therefore: '∴',
    because: '∵', checkmark: '✓', dagger: '†', S: '§', P: '¶', copyright: '©', textdegree: '°',
    nearrow: '↗', searrow: '↘', hookrightarrow: '↪', models: '⊨', vdash: '⊢',
    lt: '<', gt: '>', colon: ':', AA: 'Å', ohm: 'Ω', micro: 'µ', textperthousand: '‰',
  };
  const FUNCS = new Set(['sin', 'cos', 'tan', 'cot', 'tg', 'cotg', 'sec', 'csc', 'arcsin', 'arccos', 'arctan',
    'arccot', 'sinh', 'cosh', 'tanh', 'coth', 'log', 'ln', 'lg', 'exp', 'det', 'gcd', 'deg', 'dim', 'ker', 'arg', 'sgn', 'Pr', 'hom']);
  const LIMFUNCS = new Set(['lim', 'max', 'min', 'sup', 'inf', 'limsup', 'liminf']);
  const NARY = { int: '∫', iint: '∬', iiint: '∭', oint: '∮', oiint: '∯', oiiint: '∰', sum: '∑', prod: '∏', coprod: '∐', bigcup: '⋃', bigcap: '⋂' };
  const ACC = { vec: '⃗', overrightarrow: '⃗', overleftarrow: '⃖', hat: '̂', widehat: '̂',
    tilde: '̃', widetilde: '̃', bar: '̅', dot: '̇', ddot: '̈', check: '̌',
    breve: '̆', acute: '́', grave: '̀' };
  const SPACE = { ',': ' ', ':': ' ', '>': ' ', ';': ' ', ' ': ' ', quad: ' ',
    qquad: '  ', enspace: ' ', thinspace: ' ', '!': '' };
  const IGNORE = new Set(['displaystyle', 'textstyle', 'scriptstyle', 'scriptscriptstyle', 'limits', 'nolimits',
    'nonumber', 'notag', 'mathstrut', 'strut', 'hfill', 'centering', 'small', 'large', 'Large', 'normalsize',
    'rm', 'it', 'bf', 'mathop', 'mathrel', 'mathbin', 'mathord', 'relax', 'allowbreak', 'nobreak', 'hline']);
  const BIGS = new Set(['big', 'Big', 'bigg', 'Bigg', 'bigl', 'bigr', 'Bigl', 'Bigr', 'biggl', 'biggr', 'Biggl', 'Biggr', 'bigm', 'Bigm']);
  const DELIM_CMD = { '{': '{', '}': '}', lbrace: '{', rbrace: '}', langle: '⟨', rangle: '⟩', lvert: '|', rvert: '|',
    vert: '|', '|': '‖', Vert: '‖', lVert: '‖', rVert: '‖', lfloor: '⌊', rfloor: '⌋', lceil: '⌈', rceil: '⌉',
    backslash: '\\', uparrow: '↑', downarrow: '↓' };
  const DOUBLE = { R: 'ℝ', N: 'ℕ', Z: 'ℤ', Q: 'ℚ', C: 'ℂ', P: 'ℙ', H: 'ℍ' };
  const CHAR_MAP = { '-': '−', "'": '′', '*': '∗' };

  function tokenize(src) {
    const ch = Array.from(src);
    const t = [];
    for (let i = 0; i < ch.length; ) {
      const c = ch[i];
      if (c === '\\') {
        let j = i + 1;
        if (j < ch.length && /[a-zA-Z]/.test(ch[j])) {
          while (j < ch.length && /[a-zA-Z]/.test(ch[j])) j++;
          let name = ch.slice(i + 1, j).join('');
          if (ch[j] === '*') j++;
          t.push({ k: 'cmd', v: name, raw: ch.slice(i, j).join('') });
          i = j;
        } else if (j < ch.length) {
          t.push({ k: 'cmd', v: ch[j], raw: '\\' + ch[j] });
          i = j + 1;
        } else i++;
      } else if (/\s/.test(c)) {
        t.push({ k: 'sp', raw: ' ' });
        i++;
      } else {
        t.push({ k: 'ch', v: c, raw: c });
        i++;
      }
    }
    return t;
  }

  function MathConverter(sz) {
    this.sz = sz;
    this.unknown = [];
  }

  MathConverter.prototype.convert = function (tex) {
    this.t = tokenize(tex);
    this.i = 0;
    const items = this.seq(() => false, true);
    return this.xml(items);
  };

  MathConverter.prototype.peek = function (keepSpace) {
    if (!keepSpace) while (this.i < this.t.length && this.t[this.i].k === 'sp') this.i++;
    return this.t[this.i];
  };
  MathConverter.prototype.next = function () {
    const tk = this.peek();
    if (tk) this.i++;
    return tk;
  };
  MathConverter.prototype.isCh = function (tk, c) {
    return tk && tk.k === 'ch' && tk.v === c;
  };
  MathConverter.prototype.isCmd = function (tk, v) {
    return tk && tk.k === 'cmd' && tk.v === v;
  };

  MathConverter.prototype.run = function (text, mode) {
    return { r: true, text, mode: mode || 'math' };
  };

  MathConverter.prototype.runXml = function (text, mode) {
    const sz = `<w:sz w:val="${this.sz}"/><w:szCs w:val="${this.sz}"/>`;
    if (mode === 'text') {
      return `<m:r><m:rPr><m:nor/></m:rPr><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>${sz}</w:rPr><m:t xml:space="preserve">${x(text)}</m:t></m:r>`;
    }
    const sty = mode === 'up' ? '<m:rPr><m:sty m:val="p"/></m:rPr>' : mode === 'bold' ? '<m:rPr><m:sty m:val="b"/></m:rPr>' : '';
    return `<m:r>${sty}<w:rPr><w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math"/>${sz}</w:rPr><m:t xml:space="preserve">${x(text)}</m:t></m:r>`;
  };

  MathConverter.prototype.xml = function (items) {
    let out = '';
    let buf = null;
    const flush = () => {
      if (buf && buf.text) out += this.runXml(buf.text, buf.mode);
      buf = null;
    };
    items.forEach((it) => {
      if (it.r) {
        if (buf && buf.mode === it.mode) buf.text += it.text;
        else {
          flush();
          buf = { text: it.text, mode: it.mode };
        }
      } else {
        flush();
        out += it.x;
      }
    });
    flush();
    return out;
  };

  // Đọc chuỗi các phần tử cho tới khi gặp điều kiện dừng
  MathConverter.prototype.seq = function (stop, top) {
    const items = [];
    for (;;) {
      const tk = this.peek();
      if (!tk) break;
      if (stop(tk)) break;
      if (this.isCh(tk, '}')) {
        if (top) { this.i++; continue; }
        break;
      }
      if (top && (this.isCh(tk, '&') || this.isCmd(tk, '\\'))) { this.i++; items.push(this.run(' ', 'math')); continue; }
      let atom = this.atom(stop);
      if (atom == null) continue;
      // Ghép cặp ngoặc ( ) [ ] { } thành khối ngoặc của Word — cho phép khoảng nửa mở (a; b]
      if (atom.r && atom.mode === 'math' && /^[)\]}]$/.test(atom.text)) {
        let j = items.length - 1;
        while (j >= 0 && !(items[j].r && items[j].mode === 'math' && items[j].open)) j--;
        if (j >= 0) {
          const inner = items.splice(j + 1);
          const op = items.pop();
          atom = { x: this.dXml(op.text, atom.text, this.xml(inner)) };
        }
      } else if (atom.r && atom.mode === 'math' && /^[([{]$/.test(atom.text)) {
        atom.open = true;
      }
      if (atom.nary) {
        const sc = this.scripts();
        const body = this.xml(this.seq(stop, false));
        items.push({ x: this.nary(atom.nary, sc.sub, sc.sup, body) });
        break;
      }
      if (atom.lim) {
        const sc = this.scripts();
        const name = this.runXml(atom.lim, 'up');
        const fName = sc.sub != null ? `<m:limLow><m:e>${name}</m:e><m:lim>${sc.sub}</m:lim></m:limLow>` : name;
        const body = this.xml(this.seq(stop, false));
        items.push({ x: `<m:func><m:fName>${fName}</m:fName><m:e>${body}</m:e></m:func>` });
        break;
      }
      const sc = this.scripts();
      const list = Array.isArray(atom) ? atom : [atom];
      if (sc.sub == null && sc.sup == null) {
        list.forEach((a) => items.push(a));
        continue;
      }
      // Mũ chỉ gắn vào phần tử cuối
      const base = list.pop();
      list.forEach((a) => items.push(a));
      if (sc.sub == null && sc.supText === '∘') {
        items.push(base, this.run('°', 'math'));
        continue;
      }
      const b = this.xml([base]);
      if (!b && this.peek() && !stop(this.peek()) && !this.isCh(this.peek(), '}')) {
        // {}_{92}^{235}U : chỉ số đứng trước ký hiệu phía sau
        let nxt = this.atom(stop);
        if (nxt != null && !nxt.nary && !nxt.lim) {
          const nb = this.xml(Array.isArray(nxt) ? nxt : [nxt]);
          items.push({ x: `<m:sPre><m:sub>${sc.sub || ''}</m:sub><m:sup>${sc.sup || ''}</m:sup><m:e>${nb}</m:e></m:sPre>` });
          continue;
        }
      }
      let xml;
      if (sc.sub != null && sc.sup != null) xml = `<m:sSubSup><m:e>${b}</m:e><m:sub>${sc.sub}</m:sub><m:sup>${sc.sup}</m:sup></m:sSubSup>`;
      else if (sc.sup != null) xml = `<m:sSup><m:e>${b}</m:e><m:sup>${sc.sup}</m:sup></m:sSup>`;
      else xml = `<m:sSub><m:e>${b}</m:e><m:sub>${sc.sub}</m:sub></m:sSub>`;
      items.push({ x: xml });
    }
    // Ngoặc lẻ không có cặp: dùng khối ngoặc một phía (hiển thị đúng trên Word, WPS, LibreOffice)
    for (let k = items.length - 1; k >= 0; k--) {
      const it = items[k];
      if (it.r && it.mode === 'math' && it.open) {
        const inner = items.splice(k + 1);
        items[k] = { x: this.dXml(it.text, '', this.xml(inner)) };
      }
    }
    for (let k = 0; k < items.length; k++) {
      const it = items[k];
      if (it.r && it.mode === 'math' && /^[)\]]$/.test(it.text)) {
        const inner = items.splice(0, k);
        items[0] = { x: this.dXml('', it.text, this.xml(inner)) };
        k = 0;
      }
    }
    return items;
  };

  MathConverter.prototype.scripts = function () {
    const r = { sub: null, sup: null, supText: null };
    for (;;) {
      const tk = this.peek();
      if (this.isCmd(tk, 'limits') || this.isCmd(tk, 'nolimits')) { this.i++; continue; }
      if (this.isCh(tk, "'")) { // x' → x′ (đạo hàm)
        this.i++;
        r.sup = (r.sup || '') + this.runXml('′', 'math');
        continue;
      }
      if (this.isCh(tk, '^') || this.isCh(tk, '_')) {
        this.i++;
        const a = this.arg();
        if (tk.v === '^') { r.sup = (r.sup || '') + a.xml; r.supText = a.text; }
        else r.sub = (r.sub || '') + a.xml;
        continue;
      }
      break;
    }
    return r;
  };

  // Một đối số: {...} hoặc một ký hiệu
  MathConverter.prototype.arg = function () {
    const tk = this.peek();
    if (!tk) return { xml: '', text: '' };
    let items;
    if (this.isCh(tk, '{')) {
      this.i++;
      items = this.seq((t) => this.isCh(t, '}'), false);
      if (this.isCh(this.peek(), '}')) this.i++;
    } else {
      const a = this.atom(() => false);
      items = a == null ? [] : a.nary ? [this.run(a.nary)] : a.lim ? [this.run(a.lim, 'up')] : Array.isArray(a) ? a : [a];
    }
    const text = items.every((it) => it.r) ? items.map((it) => it.text).join('') : null;
    return { xml: this.xml(items), text };
  };

  // Đọc nguyên văn một nhóm {...}
  MathConverter.prototype.rawGroup = function () {
    const tk = this.peek();
    if (!tk) return '';
    if (!this.isCh(tk, '{')) { this.i++; return tk.raw; }
    this.i++;
    let depth = 1, s = '';
    while (this.i < this.t.length) {
      const t = this.t[this.i++];
      if (this.isCh(t, '{')) depth++;
      if (this.isCh(t, '}') && --depth === 0) break;
      s += t.raw;
    }
    return s;
  };

  MathConverter.prototype.rawToText = function (raw) {
    return raw.replace(/\\([a-zA-Z]+)\s?/g, (m, n) => (SYM[n] != null ? SYM[n] : SPACE[n] != null ? SPACE[n] : n))
      .replace(/\\([,;:! ])/g, (m, c) => SPACE[c] || ' ')
      .replace(/\\([{}%$#&_])/g, '$1')
      .replace(/[{}]/g, '');
  };

  MathConverter.prototype.delim = function () {
    const tk = this.next();
    if (!tk) return '';
    if (tk.k === 'ch') return tk.v === '.' ? '' : tk.v;
    if (tk.k === 'cmd') return DELIM_CMD[tk.v] != null ? DELIM_CMD[tk.v] : SYM[tk.v] || '';
    return '';
  };

  MathConverter.prototype.dXml = function (beg, end, inner) {
    // Ngoặc ngược kiểu ]a; b[ : nhiều phần mềm không dựng được khối ngoặc này => ghi dấu ngoặc dạng chữ
    if (/^[)\]}⟩]$/.test(beg) || /^[([{⟨]$/.test(end)) {
      const t = (c) => (c ? `<m:r><m:rPr><m:nor/></m:rPr><w:rPr><w:rFonts w:ascii="Cambria Math" w:hAnsi="Cambria Math"/></w:rPr><m:t>${x(c)}</m:t></m:r>` : '');
      return t(beg) + inner + t(end);
    }
    return `<m:d><m:dPr><m:begChr m:val="${x(beg)}"/><m:endChr m:val="${x(end)}"/></m:dPr><m:e>${inner}</m:e></m:d>`;
  };

  MathConverter.prototype.nary = function (chr, sub, sup, body) {
    if (!'∑∏∐∫∬∭∮∯∰'.includes(chr)) {
      let op = this.runXml(chr, 'math');
      if (sub != null) op = `<m:limLow><m:e>${op}</m:e><m:lim>${sub}</m:lim></m:limLow>`;
      if (sup != null) op = `<m:limUpp><m:e>${op}</m:e><m:lim>${sup}</m:lim></m:limUpp>`;
      return op + body;
    }
    const loc = '∫∬∭∮∯∰'.includes(chr) ? 'subSup' : 'undOvr';
    return `<m:nary><m:naryPr><m:chr m:val="${chr}"/><m:limLoc m:val="${loc}"/>` +
      (sub == null ? '<m:subHide m:val="1"/>' : '') + (sup == null ? '<m:supHide m:val="1"/>' : '') +
      `</m:naryPr><m:sub>${sub || ''}</m:sub><m:sup>${sup || ''}</m:sup><m:e>${body}</m:e></m:nary>`;
  };

  MathConverter.prototype.env = function (name) {
    const n = name.replace(/\*$/, '');
    let spec = '';
    if (n === 'array' || n === 'tabular') spec = this.rawGroup().replace(/[^lcr]/g, '');
    const rows = [];
    let row = [];
    const endTk = (t) => this.isCh(t, '&') || this.isCmd(t, '\\') || this.isCmd(t, 'end') || this.isCmd(t, 'cr');
    for (;;) {
      const cell = this.xml(this.seq(endTk, false));
      const tk = this.peek();
      row.push(cell);
      if (!tk) { rows.push(row); break; }
      this.i++;
      if (tk.k === 'ch' && tk.v === '&') continue;
      if (tk.v === '\\' || tk.v === 'cr') {
        if (this.isCh(this.peek(), '[')) { while (this.peek() && !this.isCh(this.next(), ']')); } // \\[2mm]
        rows.push(row); row = []; continue;
      }
      if (tk.v === 'end') { this.rawGroup(); rows.push(row); break; }
    }
    while (rows.length && rows[rows.length - 1].every((c) => !c)) rows.pop();
    if (!rows.length) return '';
    const ncol = Math.max(...rows.map((r) => r.length));
    const isAlign = /^(aligned|align|alignat|split|eqnarray|gathered|gather)$/.test(n);
    const jcs = [];
    for (let c = 0; c < ncol; c++) {
      let j = 'center';
      if (spec) j = { l: 'left', c: 'center', r: 'right' }[spec[c]] || 'left';
      else if (n === 'cases' || n === 'dcases') j = 'left';
      else if (isAlign) j = ncol === 1 ? 'center' : c % 2 === 0 ? 'right' : 'left';
      jcs.push(j);
    }
    const mcs = jcs.map((j) => `<m:mc><m:mcPr><m:count m:val="1"/><m:mcJc m:val="${j}"/></m:mcPr></m:mc>`).join('');
    const body = rows.map((r) => '<m:mr>' + Array.from({ length: ncol }, (_, c) => (r[c] ? `<m:e>${r[c]}</m:e>` : '<m:e/>')).join('') + '</m:mr>').join('');
    const m = `<m:m><m:mPr><m:baseJc m:val="center"/><m:plcHide m:val="1"/><m:mcs>${mcs}</m:mcs></m:mPr>${body}</m:m>`;
    const wrap = { cases: ['{', ''], dcases: ['{', ''], pmatrix: ['(', ')'], bmatrix: ['[', ']'], Bmatrix: ['{', '}'], vmatrix: ['|', '|'], Vmatrix: ['‖', '‖'] }[n];
    return wrap ? this.dXml(wrap[0], wrap[1], m) : m;
  };

  // Một phần tử (chưa tính mũ/chỉ số)
  MathConverter.prototype.atom = function (stop) {
    const tk = this.next();
    if (!tk) return null;
    if (tk.k === 'ch') {
      if (tk.v === '{') {
        const items = this.seq((t) => this.isCh(t, '}'), false);
        if (this.isCh(this.peek(), '}')) this.i++;
        return { x: this.xml(items) };
      }
      if (tk.v === '^' || tk.v === '_') { this.i--; return { x: '' }; } // mũ không có cơ sở
      if (tk.v === '~') return this.run(' ');
      return this.run(CHAR_MAP[tk.v] || tk.v);
    }
    const v = tk.v;
    if (v === 'frac' || v === 'dfrac' || v === 'tfrac' || v === 'cfrac') {
      const a = this.arg(), b = this.arg();
      return { x: `<m:f><m:num>${a.xml}</m:num><m:den>${b.xml}</m:den></m:f>` };
    }
    if (v === 'binom' || v === 'dbinom' || v === 'tbinom') {
      const a = this.arg(), b = this.arg();
      return { x: this.dXml('(', ')', `<m:f><m:fPr><m:type m:val="noBar"/></m:fPr><m:num>${a.xml}</m:num><m:den>${b.xml}</m:den></m:f>`) };
    }
    if (v === 'sqrt') {
      let deg = null;
      if (this.isCh(this.peek(), '[')) {
        this.i++;
        deg = this.xml(this.seq((t) => this.isCh(t, ']'), false));
        if (this.isCh(this.peek(), ']')) this.i++;
      }
      const e = this.arg();
      return { x: deg ? `<m:rad><m:deg>${deg}</m:deg><m:e>${e.xml}</m:e></m:rad>` : `<m:rad><m:radPr><m:degHide m:val="1"/></m:radPr><m:deg/><m:e>${e.xml}</m:e></m:rad>` };
    }
    if (v === 'left') {
      const beg = this.delim();
      const inner = this.xml(this.seq((t) => this.isCmd(t, 'right'), false));
      let end = '';
      if (this.isCmd(this.peek(), 'right')) { this.i++; end = this.delim(); }
      return { x: this.dXml(beg, end, inner) };
    }
    if (v === 'right' || v === 'middle') { const d = this.delim(); return d ? this.run(d) : null; }
    if (BIGS.has(v)) { const d = this.delim(); return d ? this.run(d) : null; }
    if (ACC[v]) {
      const e = this.arg();
      return { x: `<m:acc><m:accPr><m:chr m:val="${ACC[v]}"/></m:accPr><m:e>${e.xml}</m:e></m:acc>` };
    }
    if (v === 'overline' || v === 'underline') {
      const e = this.arg();
      return { x: `<m:bar><m:barPr><m:pos m:val="${v === 'overline' ? 'top' : 'bot'}"/></m:barPr><m:e>${e.xml}</m:e></m:bar>` };
    }
    if (v === 'overbrace' || v === 'underbrace') return { x: this.arg().xml };
    if (/^(text|textrm|textnormal|textup|mbox|hbox|textit|textbf|textsf|texttt)$/.test(v)) return this.run(this.rawToText(this.rawGroup()), 'text');
    if (v === 'mathrm' || v === 'operatorname' || v === 'mathsf' || v === 'mathtt' || v === 'rm') return this.run(this.rawToText(this.rawGroup()), 'up');
    if (v === 'mathbf' || v === 'boldsymbol' || v === 'bm' || v === 'pmb') return this.run(this.rawToText(this.rawGroup()), 'bold');
    if (v === 'mathit' || v === 'mathcal' || v === 'mathscr' || v === 'mathfrak') return this.run(this.rawToText(this.rawGroup()));
    if (v === 'mathbb' || v === 'Bbb') return this.run(Array.from(this.rawToText(this.rawGroup())).map((c) => DOUBLE[c] || c).join(''));
    if (v === 'begin') return { x: this.env(this.rawGroup().trim()) };
    if (v === 'end') { this.rawGroup(); return null; }
    if (NARY[v]) return { nary: NARY[v] };
    if (LIMFUNCS.has(v)) return { lim: v };
    if (FUNCS.has(v)) return this.run(v, 'up');
    if (v === 'overset' || v === 'stackrel' || v === 'underset') {
      const a = this.arg(), b = this.arg();
      const tag = v === 'underset' ? 'limLow' : 'limUpp';
      return { x: `<m:${tag}><m:e>${b.xml}</m:e><m:lim>${a.xml}</m:lim></m:${tag}>` };
    }
    if (v === 'xrightarrow' || v === 'xleftarrow' || v === 'xRightarrow') {
      let below = '';
      if (this.isCh(this.peek(), '[')) {
        this.i++;
        below = this.xml(this.seq((t) => this.isCh(t, ']'), false));
        if (this.isCh(this.peek(), ']')) this.i++;
      }
      const a = this.arg();
      let arrow = this.runXml(v === 'xleftarrow' ? '⟵' : v === 'xRightarrow' ? '⟹' : '⟶', 'math');
      if (below) arrow = `<m:limLow><m:e>${arrow}</m:e><m:lim>${below}</m:lim></m:limLow>`;
      return { x: a.xml ? `<m:limUpp><m:e>${arrow}</m:e><m:lim>${a.xml}</m:lim></m:limUpp>` : arrow };
    }
    if (v === 'boxed' || v === 'fbox') return { x: `<m:borderBox><m:e>${this.arg().xml}</m:e></m:borderBox>` };
    if (v === 'phantom' || v === 'hphantom' || v === 'vphantom' || v === 'label' || v === 'tag') { this.arg(); return null; }
    if (v === 'pmod') { const a = this.arg(); return { x: this.runXml(' (mod ', 'up') + a.xml + this.runXml(')', 'up') }; }
    if (v === 'bmod' || v === 'mod') return this.run(' mod ', 'up');
    if (v === 'not') {
      const n = this.peek();
      if (this.isCh(n, '=')) { this.i++; return this.run('≠'); }
      if (this.isCmd(n, 'in')) { this.i++; return this.run('∉'); }
      if (this.isCmd(n, 'subset')) { this.i++; return this.run('⊄'); }
      return this.run('̸');
    }
    if (v === 'hspace' || v === 'vspace' || v === 'kern' || v === 'mkern') { this.rawGroup(); return this.run(' '); }
    if (v === 'color' || v === 'textcolor') { this.rawGroup(); return null; }
    if (v === '\\' || v === 'cr' || v === 'newline') return this.run(' ');
    if (SPACE[v] != null) return SPACE[v] ? this.run(SPACE[v]) : null;
    if (IGNORE.has(v)) return null;
    if (v.length === 1 && /[{}%$#&_|]/.test(v)) return this.run(v === '|' ? '‖' : v);
    if (SYM[v]) return this.run(SYM[v]);
    this.unknown.push('\\' + v);
    return this.run(v, 'up');
  };

  /** Chuyển LaTeX sang OMML. Trả về { xml, unknown: [lệnh không hiểu], error } */
  function latexToOmml(tex, sizeHalfPt) {
    const c = new MathConverter(sizeHalfPt || 24);
    try {
      const inner = c.convert(String(tex));
      return { xml: `<m:oMath>${inner}</m:oMath>`, unknown: [...new Set(c.unknown)], error: null };
    } catch (e) {
      return { xml: `<m:oMath>${c.runXml(String(tex), 'text')}</m:oMath>`, unknown: [], error: e.message };
    }
  }

  // ======================= Tách chữ / công thức / ảnh =======================
  const RE_MATH = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\$((?:\\\$|[^$])+?)\$|\\\(([\s\S]+?)\\\)/g;
  const B_ON = '', B_OFF = '', U_ON = '', U_OFF = '';

  /** Tách một dòng thành: {t:'text', s, b, u} | {t:'math', tex, display} | {t:'img', src} */
  function splitInline(line) {
    const out = [];
    let last = 0, m;
    RE_MATH.lastIndex = 0;
    while ((m = RE_MATH.exec(line))) {
      if (m.index > last) pushText(line.slice(last, m.index), out);
      const display = m[1] != null || m[2] != null;
      out.push({ t: 'math', tex: m[1] || m[2] || m[3] || m[4] || '', display });
      last = m.index + m[0].length;
    }
    if (last < line.length) pushText(line.slice(last), out);
    return out;
  }
  function pushText(s, out) {
    s = s.replace(/\\\$/g, '$')
      .replace(/\*\*(.+?)\*\*/g, B_ON + '$1' + B_OFF)
      .replace(/(^|[^_])__([^_\n]+?)__(?!_)/g, '$1' + U_ON + '$2' + U_OFF);
    let b = false, u = false, buf = '';
    const flush = () => { if (buf) out.push({ t: 'text', s: buf, b, u }); buf = ''; };
    const parts = s.split(/(!\[[^\]]*\]\([^)\s]+\))/);
    parts.forEach((p, idx) => {
      if (idx % 2 === 1) {
        flush();
        const im = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(p);
        out.push({ t: 'img', src: im[2], alt: im[1] });
        return;
      }
      for (const c of p) {
        if (c === B_ON || c === B_OFF || c === U_ON || c === U_OFF) {
          flush();
          if (c === B_ON) b = true; else if (c === B_OFF) b = false; else if (c === U_ON) u = true; else u = false;
        } else buf += c;
      }
    });
    flush();
  }

  /** Ước lượng bề rộng (cm) khi in một đoạn chữ */
  function estimateWidthCm(text, fontPt) {
    const charCm = (fontPt || 12) * 0.0185; // trung bình ~0,52 em một ký tự
    let w = 0;
    splitInline(String(text || '').replace(/\n/g, ' ')).forEach((tk) => {
      if (tk.t === 'img') { const z = /^(\d+(?:\.\d+)?)x/.exec(tk.alt || ''); w += z ? +z[1] : 6; }
      else if (tk.t === 'text') w += Array.from(tk.s).length * charCm * (tk.b ? 1.08 : 1);
      else {
        let t = tk.tex;
        for (let k = 0; k < 4; k++) t = t.replace(/\\[dt]?frac\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, (mm, a, b) => (a.length > b.length ? a : b));
        t = t.replace(/\\(left|right|displaystyle|limits|mathrm|text|mathbb|overrightarrow|vec|sqrt)\b/g, '')
          .replace(/\\[a-zA-Z]+/g, 'x').replace(/[{}^_\\]/g, '').replace(/\s+/g, '');
        w += t.length * charCm * 1.1 + 0.1;
      }
    });
    return w;
  }

  /** Chọn số cột (4, 2 hoặc 1) để xếp phương án */
  function chooseColumns(texts, textWidthCm, fontPt, indentCm) {
    const n = texts.length;
    if (!n) return 1;
    const avail = textWidthCm - (indentCm || 0);
    const label = (fontPt || 12) * 0.035 + 0.25; // "A. "
    const cands = n <= 4 ? [n, 2, 1] : [2, 1];
    for (const c of [...new Set(cands)]) {
      if (c < 1) continue;
      const colW = avail / c - label - 0.3;
      if (texts.every((t) => !/\n/.test(t) && estimateWidthCm(t, fontPt) <= colW)) return c;
    }
    return 1;
  }

  function isTableLine(l) {
    const t = String(l).trim();
    return t.length > 2 && t[0] === '|' && t[t.length - 1] === '|' && t.split('|').length >= 3;
  }
  function splitTableLine(l) {
    return String(l).trim().slice(1, -1).split('|').map((c) => c.trim());
  }

  function sectionTitle(sec, types) {
    if (!sec.label) return '';
    if (/^PH[ẦA]N\s+[IVX\d]+\.?$/.test(sec.label)) {
      return sec.label.replace(/\.$/, '') + '. ' + types[sec.type].toUpperCase();
    }
    return sec.label;
  }

  // ======================= Ảnh =======================
  function imageInfo(bytes) {
    const b = bytes;
    if (b.length > 24 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
      const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
      return { ext: 'png', mime: 'image/png', w: dv.getUint32(16), h: dv.getUint32(20) };
    }
    if (b.length > 10 && b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) {
      return { ext: 'gif', mime: 'image/gif', w: b[6] | (b[7] << 8), h: b[8] | (b[9] << 8) };
    }
    if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
      let i = 2;
      while (i + 9 < b.length) {
        if (b[i] !== 0xff) { i++; continue; }
        const mk = b[i + 1];
        const len = (b[i + 2] << 8) | b[i + 3];
        if (mk >= 0xc0 && mk <= 0xcf && mk !== 0xc4 && mk !== 0xc8 && mk !== 0xcc) {
          return { ext: 'jpeg', mime: 'image/jpeg', h: (b[i + 5] << 8) | b[i + 6], w: (b[i + 7] << 8) | b[i + 8] };
        }
        i += 2 + len;
      }
    }
    return null;
  }

  function dataUriToBytes(uri) {
    const m = /^data:[^;,]*(;base64)?,(.*)$/s.exec(uri);
    if (!m) return null;
    if (m[1]) {
      const bin = atob(m[2].replace(/\s+/g, ''));
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    }
    return new TextEncoder().encode(decodeURIComponent(m[2]));
  }

  /** Liệt kê mọi đường dẫn ảnh trong đề đã phân tích */
  function collectImageSources(parsed) {
    const set = new Set();
    const scan = (t) => String(t || '').replace(/!\[[^\]]*\]\(([^)\s]+)\)/g, (m, s) => { set.add(s); return m; });
    parsed.sections.forEach((s) => {
      scan(s.intro);
      s.units.forEach((u) => {
        if (u.kind === 'group') { scan(u.title); scan(u.passage); }
        (u.kind === 'group' ? u.questions : [u.question]).forEach((q) => { scan(q.stem); q.options.forEach((o) => scan(o.text)); });
      });
    });
    return [...set];
  }

  // ======================= ZIP (không nén) =======================
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();
  function crc32(b) {
    let c = 0xffffffff;
    for (let i = 0; i < b.length; i++) c = CRC_TABLE[(c ^ b[i]) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  }
  function zip(files) {
    const enc = new TextEncoder();
    const parts = [];
    const central = [];
    let offset = 0;
    const d = new Date();
    const time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1);
    const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    files.forEach((f) => {
      const name = enc.encode(f.name);
      const data = typeof f.data === 'string' ? enc.encode(f.data) : f.data;
      const crc = crc32(data);
      const lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
      lh.setUint16(8, 0, true); lh.setUint16(10, time, true); lh.setUint16(12, date, true);
      lh.setUint32(14, crc, true); lh.setUint32(18, data.length, true); lh.setUint32(22, data.length, true);
      lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      parts.push(new Uint8Array(lh.buffer), name, data);
      const ch = new DataView(new ArrayBuffer(46));
      ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
      ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true); ch.setUint16(12, time, true); ch.setUint16(14, date, true);
      ch.setUint32(16, crc, true); ch.setUint32(20, data.length, true); ch.setUint32(24, data.length, true);
      ch.setUint16(28, name.length, true); ch.setUint16(30, 0, true); ch.setUint16(32, 0, true);
      ch.setUint16(34, 0, true); ch.setUint16(36, 0, true); ch.setUint32(38, 0, true); ch.setUint32(42, offset, true);
      central.push(new Uint8Array(ch.buffer), name);
      offset += 30 + name.length + data.length;
    });
    const cdSize = central.reduce((a, p) => a + p.length, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
    end.setUint32(12, cdSize, true); end.setUint32(16, offset, true);
    const all = [...parts, ...central, new Uint8Array(end.buffer)];
    const out = new Uint8Array(all.reduce((a, p) => a + p.length, 0));
    let pos = 0;
    all.forEach((p) => { out.set(p, pos); pos += p.length; });
    return out;
  }

  // ======================= Dựng tài liệu =======================
  const NS = 'xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" ' +
    'xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" ' +
    'xmlns:o="urn:schemas-microsoft-com:office:office" ' +
    'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" ' +
    'xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" ' +
    'xmlns:v="urn:schemas-microsoft-com:vml" ' +
    'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" ' +
    'xmlns:w10="urn:schemas-microsoft-com:office:word" ' +
    'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" ' +
    'xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" ' +
    'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" ' +
    'xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"';

  function Builder(layout, images) {
    const L = Object.assign({ fontPt: 12, line: 1.15, top: 1.5, bottom: 1.5, left: 2, right: 1.5 }, layout || {});
    this.L = L;
    this.sz = Math.round(L.fontPt * 2);
    this.mar = {
      top: Math.round(L.top * CM), bottom: Math.round(L.bottom * CM),
      left: Math.round(L.left * CM), right: Math.round(L.right * CM),
    };
    this.textW = PAGE_W - this.mar.left - this.mar.right;
    this.images = images || new Map();
    this.media = []; // {name, data, rid}
    this.mediaBySrc = new Map();
    this.footers = []; // {name, xml, rid}
    this.issues = [];
    this.unknownTex = new Set();
    this.docPrId = 1;
    this.relId = 10;
  }

  // ---- Đoạn văn ----
  Builder.prototype.pPr = function (o) {
    o = o || {};
    let s = '';
    if (o.style) s += `<w:pStyle w:val="${o.style}"/>`;
    if (o.keepNext) s += '<w:keepNext/>';
    if (o.keepLines) s += '<w:keepLines/>';
    if (o.border) s += `<w:pBdr>${o.border}</w:pBdr>`;
    if (o.tabs) s += '<w:tabs>' + o.tabs.map((t) => `<w:tab w:val="${t.val || 'left'}"${t.leader ? ` w:leader="${t.leader}"` : ''} w:pos="${Math.round(t.pos)}"/>`).join('') + '</w:tabs>';
    if (o.before != null || o.after != null || o.line != null) {
      s += `<w:spacing w:before="${o.before || 0}" w:after="${o.after || 0}"` +
        (o.line != null ? ` w:line="${o.line}" w:lineRule="${o.lineRule || 'auto'}"` : '') + '/>';
    }
    if (o.left || o.right || o.hanging || o.firstLine) {
      s += `<w:ind w:left="${Math.round(o.left || 0)}" w:right="${Math.round(o.right || 0)}"` +
        (o.hanging ? ` w:hanging="${Math.round(o.hanging)}"` : '') + (o.firstLine ? ` w:firstLine="${Math.round(o.firstLine)}"` : '') + '/>';
    }
    if (o.jc) s += `<w:jc w:val="${o.jc}"/>`;
    if (o.rPr) s += `<w:rPr>${o.rPr}</w:rPr>`;
    if (o.sectPr) s += o.sectPr;
    return s ? `<w:pPr>${s}</w:pPr>` : '';
  };
  Builder.prototype.p = function (content, o) {
    return `<w:p>${this.pPr(o)}${content || ''}</w:p>`;
  };
  Builder.prototype.rPr = function (o) {
    if (!o) return '';
    let s = '';
    if (o.b) s += '<w:b/><w:bCs/>';
    if (o.i) s += '<w:i/><w:iCs/>';
    if (o.caps) s += '<w:caps/>';
    if (o.sz) s += `<w:sz w:val="${o.sz}"/><w:szCs w:val="${o.sz}"/>`;
    if (o.u) s += '<w:u w:val="single"/>';
    return s ? `<w:rPr>${s}</w:rPr>` : '';
  };
  Builder.prototype.r = function (text, o) {
    const rp = this.rPr(o);
    return String(text).split('\t').map((seg, i) =>
      (i ? `<w:r>${rp}<w:tab/></w:r>` : '') + (seg ? `<w:r>${rp}<w:t xml:space="preserve">${x(seg)}</w:t></w:r>` : '')).join('');
  };
  Builder.prototype.fld = function (instr, cached, o) {
    const rp = this.rPr(o);
    return `<w:r>${rp}<w:fldChar w:fldCharType="begin"/></w:r><w:r>${rp}<w:instrText xml:space="preserve"> ${instr} </w:instrText></w:r>` +
      `<w:r>${rp}<w:fldChar w:fldCharType="separate"/></w:r><w:r>${rp}<w:t>${cached}</w:t></w:r><w:r>${rp}<w:fldChar w:fldCharType="end"/></w:r>`;
  };

  Builder.prototype.math = function (tex, display) {
    const res = latexToOmml(tex, this.sz);
    res.unknown.forEach((u) => this.unknownTex.add(u));
    if (res.error) this.issues.push(`Công thức "${tex}" không chuyển được: ${res.error}`);
    return display ? `<m:oMathPara><m:oMathParaPr><m:jc m:val="center"/></m:oMathParaPr>${res.xml}</m:oMathPara>` : res.xml;
  };

  Builder.prototype.image = function (src, maxW, alt) {
    let entry = this.mediaBySrc.get(src);
    if (!entry) {
      const img = this.images.get(src);
      if (!img || !img.info) {
        this.issues.push(`Không chèn được ảnh: ${src.length > 60 ? src.slice(0, 60) + '…' : src}`);
        return this.r('[Hình ảnh]', { i: true });
      }
      const n = this.media.length + 1;
      entry = { name: `image${n}.${img.info.ext}`, data: img.bytes, rid: 'rIdImg' + n, info: img.info };
      this.media.push(entry);
      this.mediaBySrc.set(src, entry);
    }
    // 96 dpi → twip: 1px = 15 twip
    let wT = entry.info.w * 15, hT = entry.info.h * 15;
    const sz = /^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)cm$/.exec(alt || '');
    if (sz && +sz[1] > 0 && +sz[2] > 0) { wT = +sz[1] * CM; hT = +sz[2] * CM; } // kích thước như trong file Word gốc
    const limit = Math.max(600, maxW || this.textW);
    if (wT > limit) { hT = hT * limit / wT; wT = limit; }
    const cx = Math.round(wT * EMU_PER_TWIP), cy = Math.round(hT * EMU_PER_TWIP);
    const id = this.docPrId++;
    return `<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/>` +
      `<wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${id}" name="Hinh ${id}"/>` +
      '<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr>' +
      '<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic>' +
      `<pic:nvPicPr><pic:cNvPr id="${id}" name="${entry.name}"/><pic:cNvPicPr/></pic:nvPicPr>` +
      `<pic:blipFill><a:blip r:embed="${entry.rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>` +
      `<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>` +
      '</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>';
  };

  /**
   * Chuyển đoạn chữ nhiều dòng thành các đoạn văn Word.
   * prefix: các run đặt trước dòng đầu (VD "Câu 1."). o: thuộc tính đoạn cho mọi dòng.
   * Trả về mảng { content, o } (chưa bọc <w:p>) để người gọi gắn keepNext…
   */
  Builder.prototype.paras = function (text, o, prefix, maxW) {
    const all = String(text || '').split('\n').map((l) => l.replace(/\s+$/, '')).filter((l) => l.trim());
    if (!all.length) all.push('');
    // Gom các dòng bảng liên tiếp thành một bảng
    const items = [];
    all.forEach((l) => {
      if (isTableLine(l)) {
        const last = items[items.length - 1];
        const cells = splitTableLine(l);
        if (last && last.rows) last.rows.push(cells); else items.push({ rows: [cells] });
      } else items.push({ line: l });
    });
    if (prefix && items[0].rows) items.unshift({ line: '' });
    const lines = items;
    return lines.map((it, idx) => {
      if (it.rows) return { table: it.rows, o: {} };
      const line = it.line;
      const toks = splitInline(line.trim());
      const onlyDisplay = toks.length === 1 && toks[0].t === 'math' && toks[0].display && !(idx === 0 && prefix);
      const onlyImg = toks.length > 0 && toks.every((t) => t.t === 'img' || (t.t === 'text' && !t.s.trim())) && !(idx === 0 && prefix);
      let content = idx === 0 && prefix ? prefix : '';
      toks.forEach((t) => {
        if (t.t === 'text') content += this.r(t.s, { b: t.b, u: t.u });
        else if (t.t === 'math') content += this.math(t.tex, onlyDisplay);
        else content += this.image(t.src, maxW, t.alt);
      });
      const po = Object.assign({}, o);
      if (onlyDisplay || onlyImg) { po.jc = 'center'; po.left = 0; po.hanging = 0; }
      if (idx > 0 && po.hanging) { po.left = po.left || 0; } // các dòng sau giữ thụt lề
      return { content, o: po };
    });
  };
  Builder.prototype.emit = function (list, keepAllNext) {
    return list.map((p, i) => {
      const keep = keepAllNext || i < list.length - 1;
      if (p.table) return this.dataTable(p.table, keep);
      return this.p(p.content, Object.assign({}, p.o, keep ? { keepNext: true } : {}));
    }).join('');
  };

  // Bảng số liệu có viền, các cột bằng nhau, chữ căn giữa
  Builder.prototype.dataTable = function (rows, keepNext) {
    const n = Math.max(...rows.map((r) => r.length));
    const total = Math.min(this.textW, Math.max(n * 1.8 * CM, Math.round(this.textW * 0.6)));
    const w = Math.floor(total / n);
    const widths = Array.from({ length: n }, (_, i) => (i === n - 1 ? total - w * (n - 1) : w));
    const trs = rows.map((r) => ({
      cells: Array.from({ length: n }, (_, c) => {
        const ps = this.paras(r[c] || '', { jc: 'center', line: 240 }, '', widths[c] - 120);
        return { vAlign: 'center', xml: ps.map((p) => (p.table ? '' : this.p(p.content, Object.assign({}, p.o, { keepNext: true })))).join('') || '<w:p/>' };
      }),
    }));
    return this.table(trs, widths, { borders: true, jc: 'center', cellMar: 60, cellMarV: 20 }) +
      this.p('', { line: 120, lineRule: 'exact', keepNext: !!keepNext, rPr: '<w:sz w:val="8"/><w:szCs w:val="8"/>' });
  };

  // ---- Bảng ----
  Builder.prototype.table = function (rows, widths, o) {
    o = o || {};
    const total = widths.reduce((a, b) => a + b, 0);
    const nb = '<w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/>';
    const bd = '<w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>';
    const mar = o.cellMar != null ? o.cellMar : 0;
    let s = `<w:tbl><w:tblPr><w:tblW w:w="${total}" w:type="dxa"/>` +
      (o.jc ? `<w:jc w:val="${o.jc}"/>` : '') +
      `<w:tblInd w:w="${o.indent || 0}" w:type="dxa"/>` +
      `<w:tblBorders>${o.borders ? bd : nb}</w:tblBorders><w:tblLayout w:type="fixed"/>` +
      `<w:tblCellMar><w:top w:w="${o.cellMarV || 0}" w:type="dxa"/><w:left w:w="${mar}" w:type="dxa"/><w:bottom w:w="${o.cellMarV || 0}" w:type="dxa"/><w:right w:w="${mar}" w:type="dxa"/></w:tblCellMar>` +
      '<w:tblLook w:val="0000" w:firstRow="0" w:lastRow="0" w:firstColumn="0" w:lastColumn="0" w:noHBand="1" w:noVBand="1"/></w:tblPr>';
    s += '<w:tblGrid>' + widths.map((w) => `<w:gridCol w:w="${w}"/>`).join('') + '</w:tblGrid>';
    rows.forEach((row) => {
      s += '<w:tr><w:trPr><w:cantSplit/>' + (row.header ? '<w:tblHeader/>' : '') + '</w:trPr>';
      let col = 0;
      row.cells.forEach((c) => {
        const span = c.span || 1;
        const w = widths.slice(col, col + span).reduce((a, b) => a + b, 0);
        col += span;
        s += `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>` + (span > 1 ? `<w:gridSpan w:val="${span}"/>` : '') +
          (c.shade ? `<w:shd w:val="clear" w:color="auto" w:fill="${c.shade}"/>` : '') +
          `<w:vAlign w:val="${c.vAlign || 'top'}"/></w:tcPr>${c.xml || '<w:p/>'}</w:tc>`;
      });
      s += '</w:tr>';
    });
    return s + '</w:tbl>';
  };

  // Khung chữ (ĐỀ CHÍNH THỨC, Mã đề thi …) — bảng 1 ô có viền
  Builder.prototype.box = function (runs, textLen, jc) {
    const w = Math.round((textLen * this.L.fontPt * 0.0215 + 0.6) * CM);
    return this.table([{ cells: [{ xml: this.p(runs, { jc: 'center', before: 20, after: 20, line: 240 }), vAlign: 'center' }] }], [w],
      { borders: true, jc: jc || 'center', cellMar: 85, cellMarV: 20 });
  };

  Builder.prototype.spacer = function (pt) {
    // Đoạn rất thấp để ngăn 2 bảng dính vào nhau
    const h = Math.max(2, Math.round((pt || 2) * 2));
    return this.p('', { before: 0, after: 0, line: Math.max(20, h * 10), lineRule: 'exact', rPr: `<w:sz w:val="${h}"/><w:szCs w:val="${h}"/>` });
  };

  // ---- Đầu đề ----
  Builder.prototype.header = function (meta, code, isOriginal) {
    const wL = Math.round(this.textW * 0.45);
    const wR = this.textW - wL;
    const c = { jc: 'center', line: 240 };
    let left = '';
    if (meta.dept) left += this.p(this.r(meta.dept.toUpperCase()), c);
    if (meta.school) left += this.p(this.r(meta.school.toUpperCase(), { b: true }), c);
    if (meta.dept || meta.school) {
      // gạch ngắn dưới tên trường
      const lineW = Math.min(wL * 0.5, 2.6 * CM);
      const side = Math.max(0, (wL - lineW) / 2);
      left += this.p('', { left: side, right: side, line: 120, lineRule: 'exact', after: 80,
        border: '<w:bottom w:val="single" w:sz="6" w:space="1" w:color="000000"/>', rPr: '<w:sz w:val="8"/><w:szCs w:val="8"/>' });
    }
    const tag = isOriginal ? 'ĐỀ GỐC' : meta.docType;
    if (tag) {
      left += this.box(this.r(tag.toUpperCase(), { b: true }), Array.from(tag).length, 'center');
      left += this.spacer(1);
    }
    if (!left) left = '<w:p/>';
    let right = '';
    if (meta.examName) right += this.p(this.r(meta.examName.toUpperCase(), { b: true }), c);
    if (meta.year) right += this.p(this.r('NĂM HỌC ' + meta.year, { b: true }), c);
    right += this.p(this.r('Môn: ', { b: true }) + this.r(meta.subject.toUpperCase(), { b: true }), c);
    if (meta.time) right += this.p(this.r(`Thời gian làm bài: ${meta.time} phút, không kể thời gian phát đề`, { i: true }), c);

    let s = this.table([{ cells: [{ xml: left }, { xml: right }] }], [wL, wR]);
    s += this.spacer(4);
    // Họ tên – SBD – Mã đề
    const wC = Math.round(this.textW * 0.68);
    const wCode = this.textW - wC;
    const dots = { tabs: [{ pos: wC - 300, leader: 'dot' }], line: 360, lineRule: 'auto' };
    const cand = this.p(this.r('Họ, tên thí sinh:\t'), dots) + this.p(this.r('Số báo danh:\t'), dots);
    const codeText = isOriginal ? 'ĐỀ GỐC' : 'Mã đề thi: ' + code;
    const codeBox = this.box(this.r(isOriginal ? 'ĐỀ GỐC' : 'Mã đề thi: ', { b: true }) + (isOriginal ? '' : this.r(String(code), { b: true })),
      Array.from(codeText).length, 'right') + this.spacer(1);
    s += this.table([{ cells: [{ xml: cand }, { xml: codeBox, vAlign: 'center' }] }], [wC, wCode]);
    s += this.spacer(6);
    return s;
  };

  // ---- Câu hỏi ----
  Builder.prototype.question = function (no, q) {
    const fontPt = this.L.fontPt;
    const prefix = q.points
      ? this.r(`${q.word || 'Câu'} ${no}`, { b: true }) + this.r(' ' + q.points) + this.r('.', { b: true }) + this.r(' ')
      : this.r(`${q.word || 'Câu'} ${no}.`, { b: true }) + this.r(' ');
    const stemParas = this.paras(q.stem, { jc: 'both', before: 60 }, prefix);
    stemParas.forEach((p, i) => { if (i > 0) p.o.before = 0; });
    const hasMore = (q.type === 'mcq' || q.type === 'tf') && q.options.length;
    let s = this.emit(stemParas, hasMore);
    if (q.type === 'mcq' && q.options.length) s += this.mcqOptions(q, fontPt);
    if (q.type === 'tf' && q.options.length) {
      const ind = Math.round(0.5 * CM), hang = Math.round(0.6 * CM);
      q.options.forEach((o, i) => {
        const lab = this.r(String.fromCharCode(97 + i) + ')\t');
        const ps = this.paras(o.text, { jc: 'both', left: ind + hang, hanging: hang }, lab, this.textW - ind - hang);
        ps.forEach((p, k) => { if (k > 0) { p.o.hanging = 0; } });
        s += this.emit(ps, i < q.options.length - 1);
      });
    }
    return s;
  };

  Builder.prototype.mcqOptions = function (q, fontPt) {
    const indent = Math.round(0.5 * CM);
    const avail = this.textW - indent;
    const cols = chooseColumns(q.options.map((o) => o.text), avail / CM, fontPt, 0);
    const colW = Math.floor(avail / cols);
    const widths = Array.from({ length: cols }, (_, i) => (i === cols - 1 ? avail - colW * (cols - 1) : colW));
    const hang = Math.round((fontPt * 0.035 + 0.25) * CM);
    const rows = [];
    for (let i = 0; i < q.options.length; i += cols) {
      const isLastRow = i + cols >= q.options.length;
      const cells = [];
      for (let c = 0; c < cols; c++) {
        const k = i + c;
        if (k >= q.options.length) { cells.push({ xml: '<w:p/>' }); continue; }
        const lab = this.r(String.fromCharCode(65 + k) + '.', { b: true }) + this.r('\t');
        const ps = this.paras(q.options[k].text, { left: hang, hanging: hang, right: 60 }, lab, widths[c] - hang - 60);
        ps.forEach((p, j) => { if (j > 0) p.o.hanging = 0; });
        cells.push({ xml: this.emit(ps, !isLastRow) });
      }
      rows.push({ cells });
    }
    return this.table(rows, widths, { indent });
  };

  Builder.prototype.version = function (v, meta, isOriginal, types, sectPr) {
    let s = this.header(meta, v.code, isOriginal);
    v.sections.forEach((sec) => {
      const title = sectionTitle(sec, types);
      if (title || sec.intro) {
        const prefix = title ? this.r(title.replace(/\.\s*$/, '') + '.', { b: true }) + (sec.intro ? this.r(' ') : '') : '';
        const ps = this.paras(sec.intro, { jc: 'both', before: 160, after: 40 }, prefix);
        ps.forEach((p, i) => { if (i > 0) { p.o.before = 0; } });
        s += this.emit(ps, true);
      }
      sec.items.forEach((it) => {
        if (it.kind === 'group') {
          const vars = { 'từ': it.from, 'đến': it.to, tu: it.from, den: it.to };
          const sub = (t) => Object.keys(vars).reduce((a, k) => a.split('{' + k + '}').join(vars[k]), t || '');
          if (it.title) s += this.p(this.r(sub(it.title), { b: true }), { keepNext: true, before: 100, jc: 'both' });
          if (it.passage) s += this.emit(this.paras(sub(it.passage), { jc: 'both', firstLine: 0 }), true);
          it.questions.forEach((q) => (s += this.question(q.no, q.q)));
        } else {
          s += this.question(it.no, it.q);
        }
      });
    });
    const notes = String(meta.notes == null ? '' : meta.notes).split('\n').map((l) => l.trim()).filter(Boolean);
    // Ngắt section gắn vào đoạn cuối cùng để không sinh thêm dòng/trang trống
    s += this.p(this.r('------ HẾT ------', { b: true }),
      { jc: 'center', before: 240, after: notes.length ? 60 : 0, keepNext: notes.length > 0, sectPr: notes.length ? null : sectPr });
    notes.forEach((n, i) => (s += this.p(this.r(n, { i: true, sz: this.sz - 2 }),
      { keepNext: i < notes.length - 1, sectPr: i === notes.length - 1 ? sectPr : null })));
    return s;
  };

  // withTotal: "Trang x/y" (y = tổng số trang của file — đúng trên Word, WPS, LibreOffice).
  // File gộp nhiều mã đề: chỉ ghi "Trang x" (đánh lại từ 1 cho mỗi mã) để không bao giờ sai tổng số trang.
  Builder.prototype.footer = function (label, withTotal) {
    const n = this.footers.length + 1;
    const o = { i: true, sz: this.sz - 2 };
    const content = this.r('Trang ', o) + this.fld('PAGE', '1', o) +
      (withTotal ? this.r('/', o) + this.fld('NUMPAGES', '1', o) : '') +
      (label ? this.r(' – ' + label, o) : '');
    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:ftr ${NS}>${this.p(content, { jc: 'center' })}</w:ftr>`;
    const f = { name: `footer${n}.xml`, xml, rid: 'rIdFtr' + n };
    this.footers.push(f);
    return f;
  };

  Builder.prototype.sectPr = function (footer, o) {
    o = o || {};
    const landscape = o.landscape;
    const w = landscape ? PAGE_H : PAGE_W, h = landscape ? PAGE_W : PAGE_H;
    return '<w:sectPr>' + (footer ? `<w:footerReference w:type="default" r:id="${footer.rid}"/>` : '') +
      '<w:type w:val="nextPage"/>' +
      `<w:pgSz w:w="${w}" w:h="${h}"${landscape ? ' w:orient="landscape"' : ''}/>` +
      `<w:pgMar w:top="${this.mar.top}" w:right="${this.mar.right}" w:bottom="${this.mar.bottom}" w:left="${this.mar.left}" w:header="567" w:footer="${Math.min(454, Math.round(this.mar.bottom * 0.5))}" w:gutter="0"/>` +
      '<w:pgNumType w:start="1"/><w:cols w:space="720"/><w:docGrid w:linePitch="360"/></w:sectPr>';
  };

  Builder.prototype.stylesXml = function () {
    const line = Math.round(240 * this.L.line);
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Times New Roman" w:eastAsia="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/><w:sz w:val="${this.sz}"/><w:szCs w:val="${this.sz}"/><w:lang w:val="vi-VN" w:eastAsia="en-US" w:bidi="ar-SA"/></w:rPr></w:rPrDefault>
<w:pPrDefault><w:pPr><w:widowControl/><w:spacing w:before="0" w:after="0" w:line="${line}" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
<w:style w:type="character" w:default="1" w:styleId="DefaultParagraphFont"><w:name w:val="Default Paragraph Font"/><w:uiPriority w:val="1"/><w:semiHidden/></w:style>
<w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:semiHidden/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>
<w:style w:type="numbering" w:default="1" w:styleId="NoList"><w:name w:val="No List"/><w:semiHidden/></w:style>
</w:styles>`;
  };

  Builder.prototype.package = function (bodyXml, title) {
    const files = [];
    const ct = ['<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
      '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
      '<Default Extension="xml" ContentType="application/xml"/>',
      '<Default Extension="png" ContentType="image/png"/><Default Extension="jpeg" ContentType="image/jpeg"/><Default Extension="gif" ContentType="image/gif"/>',
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>',
      '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>',
      '<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>',
      ...this.footers.map((f) => `<Override PartName="/word/${f.name}" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>`),
      '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>',
      '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>',
      '</Types>'].join('');
    files.push({ name: '[Content_Types].xml', data: ct });
    files.push({ name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>' });
    const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    files.push({ name: 'docProps/core.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${x(title || 'Đề thi')}</dc:title><dc:creator>Xáo Đề THPT</dc:creator><dc:language>vi-VN</dc:language><dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified></cp:coreProperties>` });
    files.push({ name: 'docProps/app.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Application>Xáo Đề THPT</Application></Properties>' });
    const rels = ['<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>',
      '<Relationship Id="rIdSettings" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>',
      ...this.footers.map((f) => `<Relationship Id="${f.rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="${f.name}"/>`),
      ...this.media.map((m) => `<Relationship Id="${m.rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${m.name}"/>`)];
    files.push({ name: 'word/_rels/document.xml.rels', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels.join('')}</Relationships>` });
    files.push({ name: 'word/document.xml', data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document ${NS}><w:body>${bodyXml}</w:body></w:document>` });
    files.push({ name: 'word/styles.xml', data: this.stylesXml() });
    files.push({ name: 'word/settings.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"><w:zoom w:percent="100"/><w:defaultTabStop w:val="720"/><w:characterSpacingControl w:val="doNotCompress"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat><m:mathPr><m:mathFont m:val="Cambria Math"/><m:dispDef/><m:wrapIndent m:val="1440"/><m:intLim m:val="subSup"/><m:naryLim m:val="undOvr"/></m:mathPr><w:themeFontLang w:val="vi-VN"/></w:settings>' });
    this.footers.forEach((f) => files.push({ name: 'word/' + f.name, data: f.xml }));
    this.media.forEach((m) => files.push({ name: 'word/media/' + m.name, data: m.data }));
    return zip(files);
  };

  /**
   * Tạo file .docx chứa một hoặc nhiều mã đề (mỗi mã đề một section, đánh số trang riêng).
   * list: [{ version, isOriginal }]
   */
  function buildExamDocx(list, meta, layout, images, types) {
    const b = new Builder(layout, images);
    let body = '';
    list.forEach((it, i) => {
      const label = it.isOriginal ? 'Đề gốc' : 'Mã đề thi ' + it.version.code;
      const f = b.footer(label, list.length === 1);
      const last = i === list.length - 1;
      body += b.version(it.version, meta, it.isOriginal, types, last ? null : b.sectPr(f));
      if (last) body += b.sectPr(f);
    });
    if (b.unknownTex.size) b.issues.push('Lệnh công thức chưa hỗ trợ (đã giữ dạng chữ): ' + [...b.unknownTex].join(', '));
    return { bytes: b.package(body, `Đề thi ${meta.subject}`), issues: b.issues };
  }

  /** File đáp án: bảng có viền, mỗi bảng tối đa 8 mã đề */
  function buildKeysDocx(rows, codes, meta, layout) {
    const b = new Builder(Object.assign({}, layout, { line: 1 }), null);
    let body = '';
    const c = { jc: 'center' };
    body += b.p(b.r(`ĐÁP ÁN – ${meta.subject.toUpperCase()}`, { b: true, sz: b.sz + 2 }), c);
    const sub = [meta.examName, meta.year ? 'Năm học ' + meta.year : ''].filter(Boolean).join(' – ');
    if (sub) body += b.p(b.r(sub, { b: true }), c);
    if (meta.school) body += b.p(b.r(meta.school), c);
    body += b.spacer(6);
    const per = 8;
    for (let start = 0; start < codes.length; start += per) {
      const cs = codes.slice(start, start + per);
      const first = Math.round(1.6 * CM);
      const colW = Math.floor(Math.min((b.textW - first) / cs.length, 3 * CM));
      const widths = [first, ...cs.map(() => colW)];
      const cell = (t, o) => ({ xml: b.p(b.r(t, o), { jc: 'center', line: 240 }), vAlign: 'center' });
      const trs = [{ header: true, cells: [cell('Câu', { b: true }), ...cs.map((code) => Object.assign(cell(code, { b: true }), { shade: 'E7EEFC' }))] }];
      rows.forEach((r) => {
        if (r.section) trs.push({ cells: [{ span: cs.length + 1, shade: 'F2F2F2', xml: b.p(b.r(r.section, { b: true }), { line: 240 }) }] });
        else trs.push({ cells: [cell(String(r.no)), ...r.cells.slice(start, start + per).map((x2) => cell(x2.ans))] });
      });
      body += b.table(trs, widths, { borders: true, cellMar: 70, cellMarV: 20, jc: 'center' }) + b.spacer(8);
    }
    body += b.p(b.r('Ghi chú: câu đúng/sai ghi theo thứ tự ý a, b, c, d (Đ = Đúng, S = Sai).', { i: true }), {});
    const f = b.footer('Đáp án ' + meta.subject, true);
    body += b.sectPr(f);
    return b.package(body, 'Đáp án ' + meta.subject);
  }

  const api = {
    latexToOmml, splitInline, estimateWidthCm, chooseColumns, sectionTitle, isTableLine, splitTableLine,
    imageInfo, dataUriToBytes, collectImageSources, buildExamDocx, buildKeysDocx, zip, crc32,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.XaoDeWord = api;
})(typeof window !== 'undefined' ? window : globalThis);
