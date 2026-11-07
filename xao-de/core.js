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
  const RE_GROUP_START = /^\s*\[\s*NH[ÓO]M\s*(?::\s*([^\]]*))?\]\s*$/i;
  const RE_GROUP_END = /^\s*\[\s*H[ẾE]T\s+NH[ÓO]M\s*\]\s*$/i;
  const RE_QUESTION = /^\s*(C[âa]u|Question)\s*(\d+)\s*[.:)]?\s*(.*)$/i;
  const RE_MCQ_OPT = /^\s*(\*)?\s*([A-D])\s*[.)]\s*(.*)$/;
  const RE_TF_OPT = /^\s*(\*)?\s*([a-d])\s*[.)]\s*(.*)$/;
  const RE_ANSWER = /^\s*(?:Đ[áa]p\s*[áa]n|ĐA|Answer)\s*[:：]\s*(.*)$/i;
  const RE_LOCK = /\[\s*C[ỐO]\s*Đ[ỊI]NH\s*\]/i;
  // Phương án nhắc tới phương án khác => không nên xáo phương án của câu đó
  const RE_REFERS_OTHER =
    /(^|[\s,(])(cả\s+(A|B|C|D|hai|ba|bốn|3|4)([\s,.;]|$)|tất\s+cả|các\s+(phương\s+)?án\s+trên|đều\s+(đúng|sai)|[A-D]\s+và\s+[A-D]([\s,.;]|$)|all of the above|none of the above|both\s+[A-D]\s+and\s+[A-D]|neither)/i;

  function detectSectionType(label, index) {
    const s = label.toUpperCase();
    if (/ĐÚNG\s*\/?\s*SAI|DUNG\s*SAI|ĐÚNG SAI/.test(s)) return 'tf';
    if (/TRẢ\s*LỜI\s*NGẮN|TRA\s*LOI\s*NGAN/.test(s)) return 'short';
    if (/TỰ\s*LUẬN|TU\s*LUAN/.test(s)) return 'essay';
    if (/NHIỀU\s*LỰA\s*CHỌN|TRẮC\s*NGHIỆM/.test(s)) return 'mcq';
    const m = s.match(/PH[ẦA]N\s+(III|II|IV|I|\d+)/);
    if (m) {
      const n = { I: 1, II: 2, III: 3, IV: 4 }[m[1]] || parseInt(m[1], 10);
      return ['mcq', 'tf', 'short', 'essay'][n - 1] || 'mcq';
    }
    return ['mcq', 'tf', 'short', 'essay'][index] || 'mcq';
  }

  // Tách dòng có nhiều phương án: "A. 1   B. 2   C. 3   D. 4"
  function splitInlineOptions(line, upper) {
    const letters = upper ? '[B-D]' : '[b-d]';
    const re = new RegExp('\\s+(?=\\*?\\s*' + letters + '\\s*[.)]\\s)');
    return line.split(re);
  }

  function parseTfAnswer(text) {
    // "Đ S Đ S" / "ĐSĐS" / "a) Đ, b) S..." / "D S D S"
    const t = text.toUpperCase().replace(/[A-D]\s*[.)]/g, ' ');
    const out = [];
    for (const ch of t) {
      if (ch === 'Đ' || ch === 'D' || ch === 'T') out.push(true);
      else if (ch === 'S' || ch === 'F') out.push(false);
    }
    return out;
  }

  /**
   * Phân tích văn bản đề gốc.
   * Trả về { sections: [...], warnings: [...] }
   * section = { label, type, intro, units: [unit] }
   * unit = { kind: 'q', question } | { kind: 'group', title, passage, questions: [] }
   * question = { origNo, stem, options: [{text, correct}], answer, lock, type }
   */
  function parseExam(text) {
    const lines = String(text || '').replace(/\r\n?/g, '\n').split('\n');
    const sections = [];
    const warnings = [];
    let sec = null;
    let group = null;
    let q = null;
    let lastTarget = null; // nơi nối dòng tiếp theo: {obj, key}

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
      validateQuestion(q);
      q = null;
      lastTarget = null;
    }

    function validateQuestion(qq) {
      const where = `${sec.label || 'Phần'} – Câu ${qq.origNo}`;
      if (qq.type === 'mcq') {
        if (qq.options.length < 2) warnings.push(`${where}: chỉ có ${qq.options.length} phương án.`);
        const nc = qq.options.filter((o) => o.correct).length;
        if (nc === 0) warnings.push(`${where}: chưa đánh dấu đáp án đúng (thêm * trước chữ cái hoặc dòng "Đáp án: B").`);
        if (nc > 1) warnings.push(`${where}: có ${nc} đáp án đúng.`);
      } else if (qq.type === 'tf') {
        if (qq.options.length !== 4) warnings.push(`${where}: câu đúng/sai thường có 4 ý a, b, c, d (đang có ${qq.options.length}).`);
        if (qq.options.length && qq.options.every((o) => o.correct === null))
          warnings.push(`${where}: chưa đánh dấu ý nào là Đúng — tất cả sẽ được coi là Sai.`);
      } else if (qq.type === 'short') {
        if (!qq.answer) warnings.push(`${where}: chưa có "Đáp án: ...".`);
      }
    }

    for (let raw of lines) {
      const line = raw.replace(/\s+$/, '');
      if (!line.trim()) {
        if (lastTarget) lastTarget.obj[lastTarget.key] += '\n';
        continue;
      }

      let m;
      if ((m = line.match(RE_SECTION))) {
        finishQuestion();
        if (group) {
          warnings.push(`Nhóm "${group.title || ''}" chưa có [HẾT NHÓM] — đã tự đóng.`);
          group = null;
        }
        const label = m[1].trim();
        sec = { label: label.toUpperCase(), type: detectSectionType(label, sections.length), intro: m[2] || '', units: [] };
        sections.push(sec);
        lastTarget = { obj: sec, key: 'intro' };
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
        q = { word: /^q/i.test(m[1]) ? 'Question' : 'Câu', origNo: parseInt(m[2], 10), stem: m[3] || '', options: [], answer: '', lock: false, type: sec.type };
        if (group) group.questions.push(q);
        else sec.units.push({ kind: 'q', question: q });
        lastTarget = { obj: q, key: 'stem' };
        continue;
      }
      if (q && (m = line.match(RE_ANSWER))) {
        const ans = m[1].trim();
        if (q.type === 'mcq') {
          const L = ans.toUpperCase().match(/[A-D]/);
          if (L) q.options.forEach((o, i) => (o.correct = String.fromCharCode(65 + i) === L[0]));
        } else if (q.type === 'tf') {
          const vals = parseTfAnswer(ans);
          q.options.forEach((o, i) => {
            if (i < vals.length) o.correct = vals[i];
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
            const k = mark[1].toUpperCase();
            correct = k.startsWith('Đ') || k === 'D' || k === 'T';
            text = text.slice(0, mark.index);
          }
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
      } else {
        const s = ensureSection();
        s.intro += (s.intro ? '\n' : '') + line;
        lastTarget = { obj: s, key: 'intro' };
      }
    }
    finishQuestion();
    if (group) warnings.push(`Nhóm "${group.title || ''}" chưa có [HẾT NHÓM] — đã tự đóng.`);

    // Câu đúng/sai chưa đánh dấu ý nào là đúng => coi là sai
    sections.forEach((s) => {
      s.intro = s.intro.trim();
      s.units.forEach((u) => {
        if (u.kind === 'group') u.passage = u.passage.trim();
        unitQuestions(u).forEach((qq) => {
          if (qq.type === 'tf') qq.options.forEach((o) => { if (o.correct === null) o.correct = false; });
        });
      });
    });

    return { sections: sections.filter((s) => s.units.length || s.intro), warnings };
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
        origNo: q.origNo,
        word: q.word,
        stem: q.stem,
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

  const api = {
    makeRng, shuffle, parseExam, makeVersion, makeVersions, flatQuestions,
    answerOf, countQuestions, unitQuestions, SECTION_TYPES,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.XaoDe = api;
})(typeof window !== 'undefined' ? window : globalThis);
