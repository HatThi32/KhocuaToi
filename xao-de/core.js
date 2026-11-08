/*
 * Lõi xử lý: đọc (phân tích) đề gốc và xáo đề.
 * Không phụ thuộc giao diện — dùng được cả trên trình duyệt lẫn Node.js (để kiểm thử).
 */
(function (root) {
  'use strict';

  // ---------- Bộ sinh số ngẫu nhiên có hạt giống (để xáo lại ra đúng kết quả cũ) ----------
  function hashString(str) {
    let h = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }

  function makeRng(seedStr) {
    let a = hashString(String(seedStr));
    return function () {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rng) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---------- Phân tích đề gốc ----------
  const SECTION_TYPES = {
    mcq: 'Trắc nghiệm nhiều lựa chọn',
    tf: 'Trắc nghiệm đúng/sai',
    short: 'Trả lời ngắn',
    essay: 'Tự luận',
  };

  const RE_SECTION = /^\s*\[\s*(PH[ẦA]N\s+[^\]]*|T[ỰU]\s*LU[ẬA]N[^\]]*|TR[ẮA]C\s*NGHI[ỆE]M[^\]]*)\]\s*(.*)$/i;
  // "PHẦN I. CÂU TRẮC NGHIỆM ... (3.0 điểm) Thí sinh trả lời ..." (không có ngoặc vuông)
  const RE_SECTION_PLAIN = /^\s*(PH[ẦẤÂAẢ]N\s+(?:III|II|IV|I|\d+))\b\s*([.:\-–]?)\s*(.*)$/i;
  const RE_GROUP_START = /^\s*\[\s*NH[ÓO]M\s*(?::\s*([^\]]*))?\]\s*$/i;
  const RE_GROUP_END = /^\s*\[\s*H[ẾE]T\s+NH[ÓO]M\s*\]\s*$/i;
  const RE_QUESTION = /^\s*(C[âaấầẩẫậ]u|Question)\s*(\d+)\s*(\([^)]{0,40}\))?\s*[.:)]?\s*(.*)$/i;
  const RE_MCQ_OPT = /^\s*(\*)?\s*([A-D])\s*[.)]\s*(.*)$/;
  const RE_TF_OPT = /^\s*(\*)?\s*([a-d])\s*[.)]\s*(.*)$/;
  const RE_ANSWER = /^\s*(?:Đ[áa]p\s*[áa]n|ĐA|Answer)\s*[:：]\s*(.*)$/i;
  const RE_LOCK = /\[\s*C[ỐO]\s*Đ[ỊI]NH\s*\]/i;
  // Dòng "HẾT" kết thúc đề; tiêu đề phần đáp án
  const RE_END = /^\s*[-–—_=.*\s]*H[ẾE]T\s*[-–—_=.*\s]*$/i;
  const RE_KEY_HEAD = /^\s*\[?\s*(?:(?:BẢNG|PHẦN)\s+)?(?:ĐÁP\s*ÁN|HƯỚNG\s+DẪN\s+CHẤM|DAP\s*AN)(?!\s*[:：])(?:\s|\]|$)/i;
  // Phương án nhắc tới phương án khác => không nên xáo phương án của câu đó
  const RE_REFERS_OTHER =
    /(^|[\s,(])(cả\s+(A|B|C|D|hai|ba|bốn|3|4)([\s,.;]|$)|tất\s+cả|các\s+(phương\s+)?án\s+trên|đều\s+(đúng|sai)|[A-D]\s+và\s+[A-D]([\s,.;]|$)|all of the above|none of the above|both\s+[A-D]\s+and\s+[A-D]|neither)/i;
  const ROMAN = { I: 1, II: 2, III: 3, IV: 4 };

  function detectSectionType(label, index) {
    const s = label.toUpperCase();
    if (/ĐÚNG\s*\/?\s*SAI|DUNG\s*SAI|ĐÚNG SAI/.test(s)) return 'tf';
    if (/TRẢ\s*LỜI\s*NGẮN|TRA\s*LOI\s*NGAN/.test(s)) return 'short';
    if (/TỰ\s*LUẬN|TU\s*LUAN/.test(s)) return 'essay';
    if (/NHIỀU\s*LỰA\s*CHỌN|TRẮC\s*NGHIỆM/.test(s)) return 'mcq';
    const m = s.match(/PH[ẦẤÂAẢ]N\s+(III|II|IV|I|\d+)/);
    if (m) {
      const n = ROMAN[m[1]] || parseInt(m[1], 10);
      return ['mcq', 'tf', 'short', 'essay'][n - 1] || 'mcq';
    }
    return ['mcq', 'tf', 'short', 'essay'][index] || 'mcq';
  }

  // Số thứ tự của một phần: "PHẦN II ..." -> 2
  function sectionNumber(label) {
    const m = String(label || '').toUpperCase().match(/PH[ẦẤÂAẢ]N\s+(III|II|IV|I|\d+)/);
    return m ? ROMAN[m[1]] || parseInt(m[1], 10) : null;
  }

  // Tiêu đề phần viết hoa, giữ nguyên phần trong ngoặc: "(3,0 điểm)"
  function upperLabel(t) {
    return String(t).split(/(\([^)]*\))/).map((p, i) => (i % 2 ? p : p.toUpperCase())).join('');
  }

  // Tách "PHẦN I. CÂU TRẮC NGHIỆM (3.0 điểm) Thí sinh trả lời..." thành tiêu đề + lời dẫn
  function splitPlainSection(head, rest) {
    const words = rest.split(/(\s+)/);
    let label = head, i = 0;
    for (; i < words.length; i++) {
      const w = words[i];
      if (!w.trim()) { label += w; continue; }
      if (w.startsWith('(')) {
        // nhóm trong ngoặc ngay sau tiêu đề, ví dụ (3.0 điểm)
        let grp = '';
        while (i < words.length) { grp += words[i]; if (words[i].includes(')')) break; i++; }
        label += grp; i++;
        break;
      }
      if (/[a-zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/.test(w)) break;
      label += w;
    }
    return { label: label.trim().replace(/[.:]\s*$/, ''), intro: words.slice(i).join('').trim() };
  }

  // Tách dòng có nhiều phương án: "A. 1   B. 2   C. 3   D. 4"
  function splitInlineOptions(line, upper) {
    const letters = upper ? '[B-D]' : '[b-d]';
    const re = new RegExp('\\s+(?=\\*?\\s*' + letters + '\\s*[.)]\\s)');
    return line.split(re);
  }

  function parseTfAnswer(text) {
    // "Đ S Đ S" / "ĐSĐS" / "a) Đúng, b) Sai..." / "D S D S"
    const t = text.toUpperCase().replace(/[A-D]\s*[.)]/g, ' ').replace(/ĐÚNG|DUNG|TRUE/g, 'Đ').replace(/SAI|FALSE/g, 'S');
    const out = [];
    for (const ch of t) {
      if (ch === 'Đ' || ch === 'D' || ch === 'T') out.push(true);
      else if (ch === 'S' || ch === 'F') out.push(false);
    }
    return out;
  }

  // ---------- Đọc bảng đáp án (sau dòng HẾT hoặc tiêu đề ĐÁP ÁN) ----------
  const RE_TF_VAL = /^(Đ|S|Đúng|Sai|D|Dung|T|F|True|False)$/i;
  function tfVal(v) {
    const k = v.toUpperCase();
    return k.startsWith('Đ') || k === 'D' || k === 'DUNG' || k === 'T' || k === 'TRUE';
  }
  function qNo(c) {
    const m = String(c).trim().match(/^(?:câu|question|c)?\s*(\d{1,3})\s*[.:)]?$/i);
    return m ? parseInt(m[1], 10) : null;
  }
  function isTfSeq(v) {
    const t = v.replace(/[\s,;\-–/]+/g, '').toUpperCase();
    return /^[ĐDS]{2,4}$/.test(t) || /^((ĐÚNG|SAI)){2,4}$/.test(t);
  }

  /** Trả về [{ secNo, no, kind: 'mcq'|'tf'|'tfItem'|'value', value, item }] */
  function parseAnswerKey(lines) {
    const out = [];
    let ctx = null; // số phần đang đọc (PHẦN I => 1)
    let cur = null; // câu đang có lời giải
    let grid = [];
    const push = (no, raw, item) => {
      const v = String(raw).trim().replace(/^\*/, '');
      if (!v) return;
      if (item != null) return out.push({ secNo: ctx, no, kind: 'tfItem', item, value: tfVal(v) });
      if (/^[A-Da-d]\.?$/.test(v)) out.push({ secNo: ctx, no, kind: 'mcq', value: v[0].toUpperCase() });
      else if (isTfSeq(v)) out.push({ secNo: ctx, no, kind: 'tf', value: parseTfAnswer(v) });
      else if (RE_TF_VAL.test(v)) out.push({ secNo: ctx, no, kind: 'tfOne', value: tfVal(v) });
      else if (v.length <= 12 && !/\s{2,}/.test(v)) out.push({ secNo: ctx, no, kind: 'value', value: v });
    };
    function flushGrid() {
      const rows = grid.filter((r) => r.some((c) => c));
      grid = [];
      if (!rows.length) return;
      let header = null; // {col -> câu}
      let lastNo = null;
      rows.forEach((r) => {
        const nums = r.map(qNo);
        const numCount = nums.slice(1).filter((n) => n != null).length;
        // Hàng tiêu đề số câu: "Câu | 1 | 2 | 3 ..." hoặc "Lệnh/Ý | Câu 1 | Câu 2 ..."
        if (numCount >= 2 && r.slice(1).every((c, i) => !c || nums[i + 1] != null)) {
          header = nums;
          return;
        }
        const first = r[0].trim();
        if (header) {
          const item = /^([a-d])\s*\)?$/.exec(first) || /^([a-dA-D])\s*\)$/.exec(first);
          r.forEach((c, i) => {
            if (i === 0 || header[i] == null) return;
            push(header[i], c, item ? item[1].toLowerCase().charCodeAt(0) - 97 : null);
          });
          return;
        }
        // Dạng dọc: "1 | A" , "1 | A | 2 | C ...", "1 | a) | Đúng", "  | b) | Sai", "Câu 1 | Đ | S | Đ | S"
        let no = nums[0];
        if (no == null && !first && lastNo != null) no = lastNo;
        if (no == null) return;
        lastNo = no;
        const rest = r.slice(1).map((c) => c.trim());
        const item = rest.length >= 2 ? /^([a-d])\s*\)?$/.exec(rest[0]) || /^([a-dA-D])\s*\)$/.exec(rest[0]) : null;
        if (item) return push(no, rest[1], item[1].toLowerCase().charCodeAt(0) - 97);
        if (rest.length >= 2 && rest.every((c) => RE_TF_VAL.test(c))) return push(no, rest.join(' '));
        // các cặp (câu, đáp án)
        for (let i = 0; i < r.length - 1; i += 2) {
          const n = qNo(r[i]);
          if (n != null) push(n, r[i + 1]);
        }
      });
    }
    let wsCols = 0; // số cột của bảng dạng "khoảng trắng" (bảng trong PDF thành dòng chữ)
    lines.forEach((raw) => {
      const line = raw.trim();
      // Bảng mất đường kẻ: "Câu 1 2 3 … 12" / "Lệnh/Ý Câu 1 Câu 2" rồi các dòng "Đáp án A C D …", "a) Đúng Sai …"
      const tokens = line.split(/\s+/).filter(Boolean);
      const numHead = line.match(/^(.*?)((?:(?:c[âaấầ]u\s*)?\d{1,3}\s+){1,}(?:c[âaấầ]u\s*)?\d{1,3})\s*$/i);
      if (numHead && !/[A-DĐS]\s*$/i.test(numHead[1] || '') && (!numHead[1] || /^(c[âaấầ]u|câu hỏi|lệnh|ý|đề|stt|tt|[^\d]{0,20})/i.test(numHead[1].trim()))) {
        const nums = numHead[2].match(/(?:c[âaấầ]u\s*)?\d{1,3}/gi);
        if (nums.length >= 2 && (numHead[1] || /c[âaấầ]u/i.test(numHead[2]) || nums.length >= 3)) {
          flushGrid();
          grid.push([numHead[1].trim() || 'Câu', ...nums]);
          wsCols = nums.length;
          return;
        }
      }
      if (wsCols) {
        const vals = tokens.slice(-wsCols);
        const head = tokens.slice(0, tokens.length - wsCols).join(' ');
        if (tokens.length >= wsCols + 1 && head && vals.every((v) => /^(\*?[A-Da-d]\.?|Đ|S|Đúng|Sai|D|T|F|-?\d+(?:[,.]\d+)?)$/i.test(v))) {
          grid.push([head, ...vals]);
          return;
        }
        wsCols = 0;
      }
      // Hàng bảng: "| a | b |" hoặc "Câu | 1 | 2" với các ô ngắn (không nhầm với |x − 1| trong lời giải)
      const cellsRaw = line.split('|');
      if (cellsRaw.length >= 3 && ((/^\|/.test(line) && /\|$/.test(line)) || cellsRaw.every((c) => c.trim().length <= 14))) {
        grid.push(line.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim()));
        return;
      }
      flushGrid();
      if (!line) return;
      const sm = line.match(/^\[?\s*PH[ẦẤÂAẢ]N\s+(III|II|IV|I|\d+)\b/i);
      if (sm) { ctx = ROMAN[sm[1].toUpperCase()] || parseInt(sm[1], 10); cur = null; return; }
      const cm = line.match(/^(?:c[âaấầ]u|question)\s*(\d{1,3})\b/i);
      if (cm) cur = parseInt(cm[1], 10);
      // Lời giải: "... Chọn A.", "Đáp án đúng là B", "a) Đúng.", "Đáp số: 3,5."
      if (cur != null && solutionAnswer(line, cur)) return;
      // "Câu 1: Đ S Đ S" / "1. a) Đúng b) Sai ..."
      const tm = line.match(/^(?:câu\s*)?(\d{1,3})\s*[.:)\-–]\s*(.+)$/i);
      if (tm && /^[\s,;.\-–a-dĐđSs()]*$/.test(tm[2].replace(/đúng|sai/gi, 'Đ')) && parseTfAnswer(tm[2]).length >= 2) {
        out.push({ secNo: ctx, no: parseInt(tm[1], 10), kind: 'tf', value: parseTfAnswer(tm[2]) });
        return;
      }
      // "1.A 2.C 3-D", "Câu 1: B"
      const pairs = [...line.matchAll(/(?:^|[\s,;])(?:câu\s*)?(\d{1,3})\s*[.:)\-–]?\s*([A-D])(?=$|[\s,;.])/gi)];
      const leftover = line.replace(/(?:^|[\s,;])(?:câu\s*)?(\d{1,3})\s*[.:)\-–]?\s*([A-D])(?=$|[\s,;.])/gi, '').replace(/[\s,;.]/g, '');
      if (pairs.length && leftover.length <= 3) {
        pairs.forEach((p) => out.push({ secNo: ctx, no: parseInt(p[1], 10), kind: 'mcq', value: p[2].toUpperCase() }));
        return;
      }
      // "Câu 1: 12,5" (trả lời ngắn)
      const vm = line.match(/^câu\s*(\d{1,3})\s*[.:)\-–]\s*(\S{1,12})$/i);
      if (vm) out.push({ secNo: ctx, no: parseInt(vm[1], 10), kind: 'value', value: vm[2] });
    });
    flushGrid();
    return out;

    function solutionAnswer(line, no) {
      let found = false;
      const mc = [...line.matchAll(/(?:^|[\s.,;:⇒→(])(?:chọn|đáp\s*án(?:\s*đúng)?(?:\s*là)?|phương\s*án\s*đúng(?:\s*là)?)\s*(?:đáp\s*án|phương\s*án|câu)?\s*[:：]?\s*([A-D])(?=$|[\s.,;)!])/gi)];
      if (mc.length) { out.push({ secNo: ctx, no, kind: 'mcq', value: mc[mc.length - 1][1].toUpperCase() }); found = true; }
      const ti = line.match(/^\(?([a-d])\)\s*(Đúng|Sai|Đ|S)(?=$|[\s.,;:!(])/);
      if (ti) { out.push({ secNo: ctx, no, kind: 'tfItem', item: ti[1].charCodeAt(0) - 97, value: tfVal(ti[2]) }); found = true; }
      const sv = line.match(/(?:đáp\s*số|kết\s*quả|trả\s*lời|đáp\s*án)\s*[:：]\s*(-?[\d]+(?:[,.]\d+)?)\s*\.?\s*$/i);
      if (sv) { out.push({ secNo: ctx, no, kind: 'value', value: sv[1] }); found = true; }
      return found;
    }
  }

  /**
   * Phân tích văn bản đề gốc.
   * Trả về { sections, warnings, errors, preamble, keyCount }
   * section = { label, type, intro, units: [unit] }
   * unit = { kind: 'q', question } | { kind: 'group', title, passage, questions: [] }
   * question = { id, origNo, stem, points, options: [{text, correct}], answer, lock, type, marks }
   */
  function parseExam(text) {
    const lines = String(text || '').replace(/\r\n?/g, '\n').replace(/[\f\v\u2028\u2029]/g, '\n').split('\n');
    const sections = [];
    const warnings = [];
    const errors = [];
    const preamble = [];
    const keyLines = [];
    let inKey = false;
    let sec = null;
    let group = null;
    let q = null;
    let lastTarget = null; // nơi nối dòng tiếp theo: {obj, key}
    let nextId = 0;

    function ensureSection() {
      if (!sec) {
        sec = { label: '', type: 'mcq', intro: '', units: [] };
        sections.push(sec);
      }
      return sec;
    }

    function finishQuestion() {
      if (!q) return;
      q.stem = q.stem.trim();
      q.options.forEach((o) => (o.text = o.text.trim()));
      if (RE_LOCK.test(q.stem)) {
        q.lock = true;
        q.stem = q.stem.replace(RE_LOCK, '').trim();
      }
      if (q.type === 'mcq' && q.options.some((o) => RE_REFERS_OTHER.test(o.text))) q.lock = true;
      q = null;
      lastTarget = null;
    }

    function openSection(label, intro) {
      finishQuestion();
      if (group) {
        warnings.push(`Nhóm "${group.title || ''}" chưa có [HẾT NHÓM] — đã tự đóng.`);
        group = null;
      }
      sec = { label: upperLabel(label), type: detectSectionType(label, sections.length), intro: intro || '', units: [] };
      sections.push(sec);
      lastTarget = { obj: sec, key: 'intro' };
    }

    const RE_PAGE = /^\s*(?:(?:mã\s*đề(?:\s*thi)?\s*:?\s*\S+)\s*[-–]?\s*)?trang\s*\d+\s*(?:\/\s*\d+)?\s*(?:[-–]\s*mã\s*đề(?:\s*thi)?\s*:?\s*\S+)?\s*$/i;
    for (const raw of lines) {
      const line = raw.replace(/\s+$/, '');
      if (RE_PAGE.test(line)) continue; // số trang / mã đề ở chân trang
      if (inKey) { keyLines.push(line); continue; }
      if (!line.trim()) {
        if (lastTarget) lastTarget.obj[lastTarget.key] += '\n';
        continue;
      }

      let m;
      if (RE_END.test(line) || (sections.length && RE_KEY_HEAD.test(line))) {
        finishQuestion();
        group = null;
        inKey = true;
        continue;
      }
      if ((m = line.match(RE_SECTION))) {
        openSection(m[1].trim(), m[2]);
        continue;
      }
      if ((m = line.match(RE_SECTION_PLAIN))) {
        const sp = splitPlainSection(m[1] + (m[2] ? m[2] + ' ' : ' '), m[3]);
        openSection(sp.label, sp.intro);
        continue;
      }
      if ((m = line.match(RE_GROUP_START))) {
        finishQuestion();
        ensureSection();
        group = { kind: 'group', title: (m[1] || '').trim(), passage: '', questions: [] };
        sec.units.push(group);
        lastTarget = { obj: group, key: 'passage' };
        continue;
      }
      if (RE_GROUP_END.test(line)) {
        finishQuestion();
        if (!group) warnings.push('Có [HẾT NHÓM] nhưng không có [NHÓM] mở đầu.');
        group = null;
        lastTarget = null;
        continue;
      }
      if ((m = line.match(RE_QUESTION))) {
        finishQuestion();
        ensureSection();
        q = {
          id: ++nextId, word: /^q/i.test(m[1]) ? 'Question' : 'Câu', origNo: parseInt(m[2], 10),
          points: (m[3] || '').trim(), stem: m[4] || '', options: [], answer: '', lock: false, type: sec.type, marks: false,
        };
        if (group) group.questions.push(q);
        else sec.units.push({ kind: 'q', question: q });
        lastTarget = { obj: q, key: 'stem' };
        continue;
      }
      if (q && (m = line.match(RE_ANSWER))) {
        const ans = m[1].trim();
        if (q.type === 'mcq') {
          const L = ans.toUpperCase().match(/[A-D]/);
          if (L) { q.options.forEach((o, i) => (o.correct = String.fromCharCode(65 + i) === L[0])); q.marks = true; }
        } else if (q.type === 'tf') {
          const vals = parseTfAnswer(ans);
          q.options.forEach((o, i) => {
            if (i < vals.length) { o.correct = vals[i]; q.marks = true; }
          });
        } else {
          q.answer = ans;
        }
        lastTarget = null;
        continue;
      }
      if (q && q.type === 'mcq' && RE_MCQ_OPT.test(line)) {
        for (const part of splitInlineOptions(line, true)) {
          const om = part.match(RE_MCQ_OPT);
          if (!om) continue;
          const opt = { text: om[3], correct: !!om[1] };
          if (om[1]) q.marks = true;
          q.options.push(opt);
          lastTarget = { obj: opt, key: 'text' };
        }
        continue;
      }
      if (q && q.type === 'tf' && RE_TF_OPT.test(line)) {
        for (const part of splitInlineOptions(line, false)) {
          const om = part.match(RE_TF_OPT);
          if (!om) continue;
          let text = om[3];
          let correct = om[1] ? true : null;
          const mark = text.match(/\s*\(\s*(Đ|S|Đúng|Sai|D|T|F)\s*\)\s*$/i);
          if (mark) {
            correct = tfVal(mark[1]);
            text = text.slice(0, mark.index);
          }
          if (correct !== null) q.marks = true;
          const opt = { text, correct };
          q.options.push(opt);
          lastTarget = { obj: opt, key: 'text' };
        }
        continue;
      }

      // Dòng thường: nối vào chỗ đang viết
      if (lastTarget) {
        const cur = lastTarget.obj[lastTarget.key];
        lastTarget.obj[lastTarget.key] = cur && !cur.endsWith('\n') ? cur + '\n' + line : cur + line;
      } else if (!sections.length) {
        // Phần đầu đề (tên trường, họ tên thí sinh…) trước phần/câu đầu tiên: không đưa vào đề
        preamble.push(line.trim());
      } else {
        const s = ensureSection();
        s.intro += (s.intro ? '\n' : '') + line;
        lastTarget = { obj: s, key: 'intro' };
      }
    }
    finishQuestion();
    if (group) warnings.push(`Nhóm "${group.title || ''}" chưa có [HẾT NHÓM] — đã tự đóng.`);

    const kept = sections.filter((s) => s.units.length || s.intro);
    kept.forEach((s, si) => {
      s.intro = s.intro.trim();
      s.units.forEach((u) => {
        if (u.kind === 'group') u.passage = u.passage.trim();
        unitQuestions(u).forEach((qq) => (qq.sectionIndex = si));
      });
    });

    // Áp dụng bảng đáp án ở cuối đề
    const key = parseAnswerKey(keyLines);
    applyKey(kept, key, warnings, errors);

    // Kiểm tra từng câu (sau khi đã có đáp án từ mọi nguồn)
    kept.forEach((s) => s.units.forEach((u) => unitQuestions(u).forEach((qq) => {
      const where = `${s.label || 'Phần'} – Câu ${qq.origNo}`;
      if (qq.type === 'mcq') {
        if (qq.options.length < 2) warnings.push(`${where}: chỉ có ${qq.options.length} phương án.`);
        const nc = qq.options.filter((o) => o.correct).length;
        if (nc === 0) warnings.push(`${where}: chưa đánh dấu đáp án đúng (thêm * trước chữ cái, gạch chân chữ cái, dòng "Đáp án: B" hoặc bảng đáp án cuối đề).`);
        if (nc > 1) warnings.push(`${where}: có ${nc} đáp án đúng.`);
      } else if (qq.type === 'tf') {
        if (qq.options.length !== 4) warnings.push(`${where}: câu đúng/sai thường có 4 ý a, b, c, d (đang có ${qq.options.length}).`);
        if (qq.options.length && qq.options.every((o) => o.correct === null))
          warnings.push(`${where}: chưa có đáp án Đúng/Sai cho các ý.`);
        qq.options.forEach((o) => { if (o.correct === null) o.correct = false; });
      } else if (qq.type === 'short') {
        if (!qq.answer) warnings.push(`${where}: chưa có "Đáp án: ...".`);
      }
    })));

    return { sections: kept, warnings, errors, preamble, keyCount: key.length };
  }

  function applyKey(sections, key, warnings, errors) {
    if (!key.length) return;
    const findSec = (entry) => {
      if (entry.secNo != null) {
        const byLabel = sections.find((s) => sectionNumber(s.label) === entry.secNo);
        return byLabel || sections[entry.secNo - 1] || null;
      }
      const want = entry.kind === 'mcq' ? ['mcq'] : entry.kind === 'value' ? ['short'] : ['tf'];
      return sections.find((s) => want.includes(s.type) && s.units.some((u) => unitQuestions(u).some((q) => q.origNo === entry.no))) || null;
    };
    const fromKey = new Map(); // q -> giá trị từ bảng
    key.forEach((e) => {
      const s = findSec(e);
      if (!s || s.type === 'essay') return;
      const name = s.label || 'Phần ' + SECTION_TYPES[s.type].toLowerCase();
      let q = null;
      s.units.forEach((u) => unitQuestions(u).forEach((x) => { if (x.origNo === e.no) q = x; }));
      if (!q) { warnings.push(`Bảng đáp án có Câu ${e.no} (${name}) nhưng trong đề không có câu này.`); return; }
      const where = `${name} – Câu ${e.no}`;
      if (!fromKey.has(q)) fromKey.set(q, { mcq: null, tf: [] });
      const rec = fromKey.get(q);
      if (q.type === 'mcq' && e.kind === 'mcq') rec.mcq = e.value;
      else if (q.type === 'tf' && e.kind === 'tf') e.value.forEach((v, i) => (rec.tf[i] = v));
      else if (q.type === 'tf' && e.kind === 'tfItem') rec.tf[e.item] = e.value;
      else if (q.type === 'short' && (e.kind === 'value' || e.kind === 'mcq')) rec.short = String(e.value);
      else warnings.push(`${where}: đáp án "${Array.isArray(e.value) ? e.value.map((v) => (v ? 'Đ' : 'S')).join('') : e.value}" trong bảng không khớp loại câu hỏi.`);
    });
    fromKey.forEach((rec, q) => {
      const s = sections[q.sectionIndex];
      const where = `${s.label || 'Phần'} – Câu ${q.origNo}`;
      if (q.type === 'mcq' && rec.mcq) {
        const idx = rec.mcq.charCodeAt(0) - 65;
        if (idx >= q.options.length) { errors.push(`${where}: bảng đáp án ghi ${rec.mcq} nhưng câu chỉ có ${q.options.length} phương án.`); return; }
        const marked = q.options.findIndex((o) => o.correct);
        if (q.marks && marked >= 0 && marked !== idx)
          errors.push(`${where}: bảng đáp án ghi ${rec.mcq} nhưng trong đề lại đánh dấu ${String.fromCharCode(65 + marked)} — hãy kiểm tra lại.`);
        q.options.forEach((o, i) => (o.correct = i === idx));
      }
      if (q.type === 'tf' && rec.tf.length) {
        rec.tf.forEach((v, i) => {
          if (v === undefined || i >= q.options.length) return;
          const o = q.options[i];
          if (q.marks && o.correct !== null && o.correct !== v)
            errors.push(`${where}: ý ${String.fromCharCode(97 + i)}) bảng đáp án ghi ${v ? 'Đúng' : 'Sai'} nhưng trong đề đánh dấu ${o.correct ? 'Đúng' : 'Sai'}.`);
          o.correct = v;
        });
        if (rec.tf.length > q.options.length) errors.push(`${where}: bảng đáp án có ${rec.tf.length} ý nhưng câu chỉ có ${q.options.length} ý.`);
      }
      if (q.type === 'short' && rec.short) {
        if (q.answer && q.answer.replace(/\s/g, '') !== rec.short.replace(/\s/g, ''))
          errors.push(`${where}: bảng đáp án ghi "${rec.short}" nhưng trong đề ghi "${q.answer}".`);
        q.answer = rec.short;
      }
    });
  }

  function unitQuestions(u) {
    return u.kind === 'group' ? u.questions : [u.question];
  }

  function countQuestions(parsed) {
    const res = { total: 0, mcq: 0, tf: 0, short: 0, essay: 0 };
    parsed.sections.forEach((s) =>
      s.units.forEach((u) =>
        unitQuestions(u).forEach((q) => {
          res.total++;
          res[q.type]++;
        })
      )
    );
    return res;
  }

  // ---------- Xáo đề ----------
  /**
   * options: {
   *   shuffleQuestions, shuffleOptions, shuffleTf, shuffleInGroup, keepEssay
   * }
   * Trả về version = { code, sections: [{label,type,intro, items:[...]}] }
   * item = { kind:'q', no, q } | { kind:'group', title, passage, from, to, questions:[{no,q}] }
   * q (đã xáo) = { origNo, stem, options:[{text, correct, origIndex}], answer, type }
   */
  function makeVersion(parsed, code, seed, opts) {
    const rng = makeRng(seed + '|' + code);
    const o = Object.assign(
      { shuffleQuestions: true, shuffleOptions: true, shuffleTf: true, shuffleInGroup: false, shuffleEssay: false },
      opts || {}
    );

    function shuffledQuestion(q) {
      let idx = q.options.map((_, i) => i);
      const allow =
        !q.lock && ((q.type === 'mcq' && o.shuffleOptions) || (q.type === 'tf' && o.shuffleTf));
      if (allow) idx = shuffle(idx, rng);
      return {
        id: q.id,
        origNo: q.origNo,
        word: q.word,
        stem: q.stem,
        points: q.points,
        type: q.type,
        answer: q.answer,
        options: idx.map((i) => ({ text: q.options[i].text, correct: q.options[i].correct, origIndex: i })),
      };
    }

    const sections = parsed.sections.map((s) => {
      let units = s.units.slice();
      const canShuffle = o.shuffleQuestions && (s.type !== 'essay' || o.shuffleEssay);
      if (canShuffle) units = shuffle(units, rng);
      let no = 0;
      const items = units.map((u) => {
        if (u.kind === 'group') {
          let qs = u.questions.slice();
          if (canShuffle && o.shuffleInGroup) qs = shuffle(qs, rng);
          const from = no + 1;
          const questions = qs.map((q) => ({ no: ++no, q: shuffledQuestion(q) }));
          return { kind: 'group', title: u.title, passage: u.passage, from, to: no, questions };
        }
        return { kind: 'q', no: ++no, q: shuffledQuestion(u.question) };
      });
      return { label: s.label, type: s.type, intro: s.intro, items };
    });
    return { code: String(code), sections };
  }

  function makeVersions(parsed, codes, seed, opts) {
    return codes.map((c) => makeVersion(parsed, c, seed, opts));
  }

  // Danh sách câu (đã đánh số) trong một mã đề, theo từng phần
  function flatQuestions(section) {
    const out = [];
    section.items.forEach((it) => {
      if (it.kind === 'group') it.questions.forEach((x) => out.push(x));
      else out.push({ no: it.no, q: it.q });
    });
    return out;
  }

  function answerOf(q) {
    if (q.type === 'mcq') {
      const i = q.options.findIndex((o) => o.correct);
      return i >= 0 ? String.fromCharCode(65 + i) : '?';
    }
    if (q.type === 'tf') return q.options.map((o) => (o.correct ? 'Đ' : 'S')).join('');
    if (q.type === 'short') return q.answer || '?';
    return '';
  }

  // ---------- Kiểm tra đề trước khi xuất ----------
  function norm(t) {
    return String(t || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }
  function countDollar(t) {
    return (String(t || '').replace(/\\\$/g, '').match(/\$/g) || []).length;
  }

  /** Trả về danh sách { level: 'error' | 'warn', msg } */
  function checkExam(parsed) {
    const out = [];
    const err = (msg) => out.push({ level: 'error', msg });
    const warn = (msg) => out.push({ level: 'warn', msg });
    (parsed.errors || []).forEach((e) => out.push({ level: 'error', msg: e }));
    parsed.warnings.forEach((w) => {
      const isErr = /chưa đánh dấu đáp án|đáp án đúng\.|chỉ có \d+ phương án|chưa có "Đáp án|chưa có đáp án Đúng\/Sai/.test(w);
      out.push({ level: isErr ? 'error' : 'warn', msg: w });
    });
    parsed.sections.forEach((s) => {
      const name = s.label || 'Phần ' + SECTION_TYPES[s.type].toLowerCase();
      if (countDollar(s.intro) % 2) err(`${name} – lời dẫn: thiếu dấu $ đóng/mở công thức.`);
      const nums = [];
      s.units.forEach((u) => {
        if (u.kind === 'group' && countDollar(u.passage) % 2) err(`${name} – nhóm "${u.title || ''}": thiếu dấu $ đóng/mở công thức.`);
        if (u.kind === 'group' && !u.questions.length) warn(`${name} – nhóm "${u.title || ''}" không có câu hỏi nào.`);
        unitQuestions(u).forEach((q) => {
          const where = `${name} – Câu ${q.origNo}`;
          nums.push(q.origNo);
          if (!q.stem.trim() && !q.options.length) err(`${where}: câu hỏi trống.`);
          else if (!q.stem.trim()) warn(`${where}: chưa có nội dung câu hỏi.`);
          if (countDollar(q.stem) % 2) err(`${where}: thiếu dấu $ đóng/mở công thức trong câu hỏi.`);
          q.options.forEach((o, i) => {
            const lab = q.type === 'tf' ? String.fromCharCode(97 + i) + ')' : String.fromCharCode(65 + i) + '.';
            if (!o.text.trim()) err(`${where}: phương án ${lab} để trống.`);
            if (countDollar(o.text) % 2) err(`${where}: thiếu dấu $ đóng/mở công thức ở phương án ${lab}`);
          });
          // Chữ copy từ PDF: ký hiệu toán in nghiêng Unicode (𝑥, 𝑦…) => số mũ, phân số thường đã bị mất
          const all = [q.stem, ...q.options.map((o) => o.text)].join('\n');
          if (/[\u{1D400}-\u{1D7FF}]/u.test(all) || /[=+\-−]\s{6,}\S|[=+\-−]\s{6,}$/m.test(all.replace(/\$[^$]*\$/g, ''))) {
            err(`${where}: công thức có vẻ được copy từ PDF nên đã mất số mũ/phân số (ví dụ x³ thành 𝑥). Hãy gõ lại công thức dạng $...$ hoặc dùng file Word gốc.`);
          }
          if (q.type === 'mcq' && q.options.length && q.options.length !== 4)
            warn(`${where}: có ${q.options.length} phương án (đề chuẩn có 4 phương án A, B, C, D).`);
          if (q.type === 'mcq' || q.type === 'tf') {
            const seen = new Map();
            q.options.forEach((o, i) => {
              const k = norm(o.text);
              if (!k) return;
              if (seen.has(k)) err(`${where}: hai phương án giống hệt nhau (${seen.get(k) + 1} và ${i + 1}).`);
              else seen.set(k, i);
            });
          }
          if (q.type === 'short' && q.answer) {
            const a = q.answer.replace(/\s+/g, '');
            if (a.length > 4) warn(`${where}: đáp án "${q.answer}" dài hơn 4 ký tự (phiếu trả lời ngắn chỉ có 4 ô).`);
            if (/\./.test(a) && !/^\d{1,3}(\.\d{3})+$/.test(a)) warn(`${where}: đáp án "${q.answer}" dùng dấu chấm — đề thi Việt Nam dùng dấu phẩy thập phân.`);
          }
        });
      });
      // Số thứ tự câu ở đề gốc bị lặp/thiếu — thường do gõ nhầm làm mất câu
      const seen = new Set();
      nums.forEach((n) => { if (seen.has(n)) warn(`${name}: số "Câu ${n}" bị lặp lại trong đề gốc — kiểm tra xem có thiếu câu nào không.`); seen.add(n); });
      const sorted = [...seen].sort((a, b) => a - b);
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i] - sorted[i - 1] > 1) warn(`${name}: đề gốc nhảy từ Câu ${sorted[i - 1]} sang Câu ${sorted[i]} — có thể bị sót câu.`);
      }
    });
    return out;
  }

  /** Tự kiểm chứng: mỗi mã đề có đủ mọi câu đúng 1 lần, đáp án đi theo phương án. */
  function verifyVersions(parsed, versions) {
    const errors = [];
    const orig = new Map();
    parsed.sections.forEach((s) => s.units.forEach((u) => unitQuestions(u).forEach((q) => orig.set(q.id, q))));
    versions.forEach((v) => {
      const seen = new Set();
      v.sections.forEach((sec, si) => {
        flatQuestions(sec).forEach((x, i) => {
          const q = x.q;
          const o = orig.get(q.id);
          if (x.no !== i + 1) errors.push(`Mã ${v.code}: đánh số câu sai ở phần ${si + 1}.`);
          if (!o) return errors.push(`Mã ${v.code}: câu lạ không có trong đề gốc.`);
          if (seen.has(q.id)) errors.push(`Mã ${v.code}: câu ${o.origNo} xuất hiện 2 lần.`);
          seen.add(q.id);
          if (o.sectionIndex !== si) errors.push(`Mã ${v.code}: câu ${o.origNo} bị chuyển sang phần khác.`);
          if (q.options.length !== o.options.length) errors.push(`Mã ${v.code}: câu ${o.origNo} bị mất phương án.`);
          const used = new Set();
          q.options.forEach((op) => {
            const src = o.options[op.origIndex];
            if (!src || used.has(op.origIndex) || src.text !== op.text || src.correct !== op.correct)
              errors.push(`Mã ${v.code}: câu ${o.origNo} sai lệch phương án/đáp án.`);
            used.add(op.origIndex);
          });
        });
      });
      if (seen.size !== orig.size) errors.push(`Mã ${v.code}: có ${seen.size}/${orig.size} câu.`);
    });
    return [...new Set(errors)];
  }

  const api = {
    makeRng, shuffle, parseExam, makeVersion, makeVersions, flatQuestions,
    answerOf, countQuestions, unitQuestions, SECTION_TYPES, checkExam, verifyVersions, parseAnswerKey, sectionNumber, upperLabel,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.XaoDe = api;
})(typeof window !== 'undefined' ? window : globalThis);
