# -*- coding: utf-8 -*-
"""Xuất bộ đề thành tệp PowerPoint (.pptx) để trình chiếu trên lớp.

Chỉ dùng thư viện chuẩn của Python (zipfile + XML viết tay).
Mỗi câu hỏi là một trang chiếu nền tối, chữ to:
  - Trắc nghiệm: bấm vào một phương án -> hiện "✔ ĐÚNG" hoặc "✘ SAI" ngay trên phương án đó.
  - Đúng/Sai: bấm nút Đ hoặc S ở từng ý -> hiện ✔ / ✘.
  - Mọi dạng: bấm nút "💡 ĐÁP ÁN" -> tô viền đáp án đúng và hiện lời giải.
Các hiệu ứng dùng "trigger" (kích hoạt khi bấm vào hình) của PowerPoint nên bấm bao nhiêu lần
cũng không làm chuyển trang; bấm ra ngoài hoặc nhấn phím → để sang câu tiếp.
"""
import io
import math
import random
import re
import zipfile
from xml.sax.saxutils import escape

EMU = 914400
SLIDE_W, SLIDE_H = 13.333, 7.5  # inch (16:9)

FONT = "Segoe UI"
MONO = "Consolas"
C_BG = "0F172A"
C_PANEL = "1E293B"
C_LINE = "334155"
C_TEXT = "F8FAFC"
C_MUTED = "94A3B8"
C_CODE = "A5F3FC"
C_INLINE = "FDE68A"
C_YELLOW = "FDE047"
C_OK = "16A34A"
C_OK_L = "4ADE80"
C_BAD = "DC2626"
OPT_COLORS = ["E11D48", "2563EB", "D97706", "16A34A", "7C3AED", "0891B2"]
LETTERS = "ABCDEFGH"

TYPE_NAMES = {"mcq": "Trắc nghiệm", "tf": "Đúng / Sai", "short": "Trả lời ngắn", "fill": "Điền khuyết",
              "order": "Sắp xếp thứ tự", "match": "Ghép nối", "essay": "Tự luận"}
LEVEL_NAMES = {"NB": "Nhận biết", "TH": "Thông hiểu", "VD": "Vận dụng", "VDC": "Vận dụng cao"}

NS = ('xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
      'xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"')

_BAD_XML = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f]")


def E(v):
    return int(round(v * EMU))


def x(s):
    return escape(_BAD_XML.sub("", str(s)))


# ------------------------------------------------------------------ văn bản
def parse_rich(text, blanks=False):
    """Tách nội dung thành các đoạn: [(kind, [(chunk, is_code)])], kind = 'p' | 'code'.
    Hỗ trợ ```khối mã``` và `mã trong dòng` như trong app."""
    text = str(text or "").replace("\r", "")
    out = []
    counter = [0]

    def blank_sub(s):
        def rep(_):
            counter[0] += 1
            return f" …({counter[0]})… "
        return re.sub(r"_{3,}", rep, s) if blanks else s

    pos = 0
    for m in re.finditer(r"```[\w-]*\n?([\s\S]*?)```", text):
        before = text[pos:m.start()]
        _add_plain(out, blank_sub(before))
        for line in m.group(1).rstrip("\n").split("\n"):
            out.append(("code", [(blank_sub(line) or " ", True)]))
        pos = m.end()
    _add_plain(out, blank_sub(text[pos:]))
    return out


def _add_plain(out, s):
    s = s.strip("\n")
    if not s.strip():
        return
    for line in s.split("\n"):
        parts = re.split(r"`([^`\n]+)`", line)
        runs = [(p, i % 2 == 1) for i, p in enumerate(parts) if p]
        out.append(("p", runs or [(" ", False)]))


def inline_runs(s):
    parts = re.split(r"`([^`\n]+)`", str(s or ""))
    return [(p, i % 2 == 1) for i, p in enumerate(parts) if p] or [(" ", False)]


def est_height(paras, pt, width_in):
    """Ước lượng chiều cao (inch) khi đặt các đoạn vào hộp rộng width_in với cỡ chữ pt."""
    h = 0.0
    for kind, runs in paras:
        n = sum(len(t) for t, _ in runs)
        cw = pt / 72 * (0.6 if kind == "code" else 0.52)
        per_line = max(1, int(width_in / cw))
        lines = max(1, math.ceil(n / per_line)) if kind != "code" else max(1, math.ceil(n / per_line))
        h += lines * pt * (1.18 if kind == "code" else 1.25) / 72 + (0.02 if kind == "code" else 0.06)
    return h


def fit_pt(paras, w, h, mx, mn):
    pt = mx
    while pt > mn and est_height(paras, pt, w) > h:
        pt -= 1
    return pt


# ------------------------------------------------------------------ trang chiếu
class Slide:
    def __init__(self):
        self.shapes = []
        self.nid = 2
        self.triggers = []  # (spid_trigger, [spid_target...])

    def _id(self):
        self.nid += 1
        return self.nid

    def shape(self, x0, y0, w, h, paras=None, fill=None, line=None, line_w=0.0, geom="rect",
              anchor="ctr", ins=(0.15, 0.08, 0.15, 0.08), shadow=False, name="Shape", alpha=None, radius=None,
              fit=True):
        sid = self._id()
        av = f'<a:avLst><a:gd name="adj" fmla="val {radius}"/></a:avLst>' if radius is not None else "<a:avLst/>"
        if fill:
            a = f'<a:alpha val="{alpha}"/>' if alpha is not None else ""
            fx = f'<a:solidFill><a:srgbClr val="{fill}">{a}</a:srgbClr></a:solidFill>'
        else:
            fx = "<a:noFill/>"
        lx = (f'<a:ln w="{int(line_w * 12700)}"><a:solidFill><a:srgbClr val="{line}"/></a:solidFill></a:ln>'
              if line else '<a:ln><a:noFill/></a:ln>')
        sh = ('<a:effectLst><a:outerShdw blurRad="63500" dist="25400" dir="5400000" algn="t" rotWithShape="0">'
              '<a:srgbClr val="000000"><a:alpha val="45000"/></a:srgbClr></a:outerShdw></a:effectLst>') if shadow else ""
        body = "".join(paras or []) or '<a:p><a:endParaRPr lang="vi-VN" dirty="0"/></a:p>'
        l, t, r, b = ins
        self.shapes.append(
            f'<p:sp><p:nvSpPr><p:cNvPr id="{sid}" name="{x(name)} {sid}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>'
            f'<p:spPr><a:xfrm><a:off x="{E(x0)}" y="{E(y0)}"/><a:ext cx="{E(w)}" cy="{E(h)}"/></a:xfrm>'
            f'<a:prstGeom prst="{geom}">{av}</a:prstGeom>{fx}{lx}{sh}</p:spPr>'
            f'<p:txBody><a:bodyPr wrap="square" lIns="{E(l)}" tIns="{E(t)}" rIns="{E(r)}" bIns="{E(b)}" '
            f'anchor="{anchor}" rtlCol="0">{"<a:normAutofit/>" if fit else "<a:noAutofit/>"}</a:bodyPr>'
            f'<a:lstStyle/>{body}</p:txBody></p:sp>')
        return sid

    def trigger(self, src, targets):
        self.triggers.append((src, list(targets)))

    def xml(self, bg=C_BG):
        tree = ("".join(self.shapes))
        timing = self._timing()
        return (f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:sld {NS}><p:cSld>'
                f'<p:bg><p:bgPr><a:solidFill><a:srgbClr val="{bg}"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>'
                '<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>'
                '<p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/>'
                f'<a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>{tree}</p:spTree></p:cSld>'
                '<p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>'
                f'<p:transition spd="med"><p:fade/></p:transition>{timing}</p:sld>')

    def _timing(self):
        if not self.triggers:
            return ""
        cid = [1]

        def nid():
            cid[0] += 1
            return cid[0]

        seqs = []
        built = []
        for src, targets in self.triggers:
            seq_id = nid()
            outer = nid()
            inner = nid()
            effects = []
            for k, t in enumerate(targets):
                e_id, s_id, a_id = nid(), nid(), nid()
                node = "clickEffect" if k == 0 else "withEffect"
                effects.append(
                    f'<p:par><p:cTn id="{e_id}" presetID="10" presetClass="entr" presetSubtype="0" fill="hold" '
                    f'grpId="0" nodeType="{node}"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>'
                    f'<p:set><p:cBhvr><p:cTn id="{s_id}" dur="1" fill="hold"><p:stCondLst><p:cond delay="0"/>'
                    f'</p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="{t}"/></p:tgtEl><p:attrNameLst>'
                    f'<p:attrName>style.visibility</p:attrName></p:attrNameLst></p:cBhvr><p:to>'
                    f'<p:strVal val="visible"/></p:to></p:set>'
                    f'<p:animEffect transition="in" filter="fade"><p:cBhvr><p:cTn id="{a_id}" dur="300"/>'
                    f'<p:tgtEl><p:spTgt spid="{t}"/></p:tgtEl></p:cBhvr></p:animEffect>'
                    f'</p:childTnLst></p:cTn></p:par>')
                built.append(t)
            seqs.append(
                f'<p:seq concurrent="1" nextAc="seek"><p:cTn id="{seq_id}" restart="whenNotActive" fill="hold" '
                f'evtFilter="cancelBubble" nodeType="interactiveSeq"><p:stCondLst><p:cond evt="onClick" delay="0">'
                f'<p:tgtEl><p:spTgt spid="{src}"/></p:tgtEl></p:cond></p:stCondLst><p:endSync evt="end" delay="0">'
                f'<p:rtn val="all"/></p:endSync><p:childTnLst><p:par><p:cTn id="{outer}" fill="hold">'
                f'<p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="{inner}" '
                f'fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst>{"".join(effects)}'
                f'</p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn>'
                f'<p:nextCondLst><p:cond evt="onClick" delay="0"><p:tgtEl><p:spTgt spid="{src}"/></p:tgtEl>'
                f'</p:cond></p:nextCondLst></p:seq>')
        bld = "".join(f'<p:bldP spid="{t}" grpId="0" animBg="1"/>' for t in dict.fromkeys(built))
        return ('<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot">'
                f'<p:childTnLst>{"".join(seqs)}</p:childTnLst></p:cTn></p:par></p:tnLst>'
                f'<p:bldLst>{bld}</p:bldLst></p:timing>')


def para(runs, pt, color=C_TEXT, bold=False, align="l", mono=False, code_color=C_INLINE, space=4):
    """runs: [(text, is_code)]"""
    rs = []
    for t, is_code in runs:
        f = MONO if (mono or is_code) else FONT
        col = code_color if (is_code and not mono) else color
        rs.append(f'<a:r><a:rPr lang="vi-VN" sz="{int(pt * 100)}" b="{1 if bold else 0}" dirty="0">'
                  f'<a:solidFill><a:srgbClr val="{col}"/></a:solidFill><a:latin typeface="{f}"/>'
                  f'<a:cs typeface="{f}"/></a:rPr><a:t>{x(t)}</a:t></a:r>')
    return (f'<a:p><a:pPr algn="{align}"><a:spcBef><a:spcPts val="{int(space * 100)}"/></a:spcBef></a:pPr>'
            f'{"".join(rs)}</a:p>')


def rich_paras(paras, pt, color=C_TEXT, align="l"):
    out = []
    for kind, runs in paras:
        if kind == "code":
            out.append(para(runs, pt * 0.9, C_CODE, mono=True, align="l", space=0))
        else:
            out.append(para(runs, pt, color, align=align))
    return out


def txt(s, pt, color=C_TEXT, bold=False, align="ctr"):
    return para(inline_runs(s), pt, color, bold, align)


# ------------------------------------------------------------------ dựng từng câu
L = 0.45          # lề trái
CW = SLIDE_W - 2 * L  # bề rộng nội dung


def header(sl, i, n, q):
    sl.shape(L, 0.22, 1.75, 0.55, [txt(f"Câu {i}/{n}", 20, bold=True)], fill="2563EB",
             geom="roundRect", radius=30000, shadow=True, name="So cau", fit=False)
    lv = LEVEL_NAMES.get(q.get("level"), q.get("level") or "")
    sl.shape(L + 1.9, 0.22, 5.2, 0.55, [txt(f"{TYPE_NAMES.get(q['type'], '')}  ·  {lv}", 16, C_MUTED, align="l")],
             name="Loai cau", anchor="ctr")
    return sl.shape(SLIDE_W - L - 2.4, 0.2, 2.4, 0.6, [txt("💡  ĐÁP ÁN", 20, "1F2937", bold=True)],
                    fill=C_YELLOW, geom="roundRect", radius=30000, shadow=True, name="Nut dap an", fit=False)


def answer_panel(sl, reveal_paras, top_limit, max_pt=24):
    """Bảng đáp án/lời giải ở cuối trang (ẩn, hiện khi bấm nút ĐÁP ÁN), không lấn lên trên top_limit."""
    w = CW - 0.4
    avail = max(0.9, SLIDE_H - 0.2 - top_limit)
    pt = fit_pt(reveal_paras, w, avail - 0.3, max_pt, 11)
    h = max(0.9, min(est_height(reveal_paras, pt, w) + 0.35, avail))
    y = SLIDE_H - 0.2 - h
    sid = sl.shape(L, y, CW, h, rich_paras(reveal_paras, pt), fill=C_PANEL, line="60A5FA", line_w=2.5,
                   geom="roundRect", radius=8000, anchor="ctr", ins=(0.2, 0.1, 0.2, 0.1), shadow=True, name="Loi giai")
    return sid, y


def expl_paras(q, lead=None):
    ps = []
    if lead:
        ps.extend(lead)
    if q.get("explanation"):
        e = parse_rich(q["explanation"])
        if e:
            e[0] = (e[0][0], [("💡 ", False)] + list(e[0][1]))
        ps.extend(e)
    return ps


def reserve_h(paras_):
    """Chiều cao dự trù cho bảng lời giải để bố cục không bị che."""
    if not paras_:
        return 0.0
    return max(0.9, min(est_height(paras_, 18, CW - 0.3) + 0.3, 2.0))


def question_box(sl, q, y, h, blanks=False, mx=34):
    ps = parse_rich(q["content"], blanks)
    pt = fit_pt(ps, CW - 0.2, h, mx, 14)
    sl.shape(L, y, CW, h, rich_paras(ps, pt), anchor="t", ins=(0.1, 0.02, 0.1, 0.02), name="Cau hoi")


def need_h(q, blanks=False, pt=30):
    return est_height(parse_rich(q["content"], blanks), pt, CW - 0.2)


def slide_mcq(sl, q, btn):
    d = q["data"]
    opts = d["options"]
    ex = expl_paras(q, [("p", [(f"Đáp án đúng: {LETTERS[d['answer']]}", False)])])
    res = reserve_h(ex)
    two_col = max(len(o) for o in opts) <= 48 and len(opts) % 2 == 0
    rows = len(opts) // 2 if two_col else len(opts)
    top = 0.95
    bottom = SLIDE_H - 0.25 - res
    avail = bottom - top
    gap = 0.16
    opt_h_min = 0.75
    qh = min(max(need_h(q, pt=30) + 0.15, 0.9), avail - rows * (opt_h_min + gap))
    question_box(sl, q, top, qh)
    oy = top + qh + 0.15
    oh = min(1.35, (bottom - oy - (rows - 1) * gap) / rows)
    ow = (CW - gap) / 2 if two_col else CW
    cells = [(oy + (k // 2) * (oh + gap), L + (k % 2) * (ow + gap)) if two_col else (oy + k * (oh + gap), L)
             for k in range(len(opts))]
    otexts = [[("p", [(f"{LETTERS[k]}.  ", False)] + inline_runs(o))] for k, o in enumerate(opts)]
    opt_pt = min(fit_pt(t, ow - 2.4, oh - 0.15, 28, 13) for t in otexts)
    marks, ring = [], None
    for k, (yy, xx) in enumerate(cells):
        sid = sl.shape(xx, yy, ow, oh, [para(otexts[k][0][1], opt_pt, bold=False)], fill=OPT_COLORS[k % 6],
                       geom="roundRect", radius=14000, shadow=True, ins=(0.25, 0.05, 2.05, 0.05),
                       name=f"Phuong an {LETTERS[k]}")
        ok = k == d["answer"]
        mk = sl.shape(xx + ow - 1.95, yy + (oh - 0.62) / 2, 1.8, 0.62,
                      [txt("✔ ĐÚNG" if ok else "✘ SAI", 19, "FFFFFF", bold=True)],
                      fill=C_OK if ok else C_BAD, line="FFFFFF", line_w=2.5, geom="roundRect", radius=50000,
                      shadow=True, name="Phan hoi", fit=False)
        sl.trigger(sid, [mk])
        if ok:
            ring = sl.shape(xx - 0.07, yy - 0.07, ow + 0.14, oh + 0.14, None, line=C_YELLOW, line_w=6,
                            geom="roundRect", radius=14000, name="Vien dap an")
    panel, _ = answer_panel(sl, ex, bottom + 0.05)
    sl.trigger(btn, [ring, panel])


def slide_tf(sl, q, btn):
    d = q["data"]
    sts = d["statements"]
    ex = expl_paras(q, [("p", [("Đáp án: " + "   ".join(f"{'abcd'[k]}) {'Đ' if a else 'S'}" for k, a in enumerate(d["answers"])), False)])])
    res = reserve_h(ex)
    top = 0.95
    bottom = SLIDE_H - 0.25 - res
    n = len(sts)
    gap = 0.12
    row_min = 0.62
    qh = min(max(need_h(q, pt=28) + 0.1, 0.6), bottom - top - n * (row_min + gap) - 0.1)
    question_box(sl, q, top, qh, mx=30)
    ry = top + qh + 0.1
    rh = min(1.1, (bottom - ry - (n - 1) * gap) / n)
    sw = CW - 3.0
    stx = [[("p", [(f"{'abcd'[k]})  ", False)] + inline_runs(s))] for k, s in enumerate(sts)]
    st_pt = min(fit_pt(t, sw - 0.3, rh - 0.1, 26, 12) for t in stx)
    show = []
    for k in range(n):
        yy = ry + k * (rh + gap)
        sl.shape(L, yy, sw, rh, [para(stx[k][0][1], st_pt)], fill=C_PANEL, line=C_LINE, line_w=1,
                 geom="roundRect", radius=12000, ins=(0.2, 0.04, 0.2, 0.04), name="Y")
        bx = L + sw + 0.15
        bw = 0.85
        truth = d["answers"][k]
        for j, (lab, col, val) in enumerate((("Đ", C_OK, True), ("S", C_BAD, False))):
            b = sl.shape(bx + j * (bw + 0.1), yy + (rh - 0.62) / 2, bw, 0.62, [txt(lab, 24, "FFFFFF", bold=True)],
                         fill=col, geom="roundRect", radius=25000, shadow=True, name=f"Nut {lab}", fit=False)
            right = val == truth
            mk = sl.shape(bx + 2 * (bw + 0.1), yy + (rh - 0.62) / 2, 0.85, 0.62,
                          [txt("✔" if right else "✘", 26, "FFFFFF", bold=True)], fill=C_OK if right else C_BAD,
                          line="FFFFFF", line_w=2, geom="ellipse", name="Phan hoi", fit=False)
            sl.trigger(b, [mk])
        lab = sl.shape(bx - 0.05, yy + (rh - 0.7) / 2, 2 * bw + 0.2, 0.7,
                       [txt("ĐÚNG" if truth else "SAI", 22, "FFFFFF", bold=True)],
                       fill=C_OK if truth else C_BAD, line=C_YELLOW, line_w=3, geom="roundRect", radius=25000,
                       name="Dap an y", fit=False)
        show.append(lab)
    panel, _ = answer_panel(sl, ex, bottom + 0.05)
    sl.trigger(btn, show + [panel])


def slide_generic(sl, q, btn, body_builder, lead, blanks=False, max_pt=24):
    ex = expl_paras(q, lead)
    res = reserve_h(ex)
    top = 0.95
    bottom = SLIDE_H - 0.25 - res
    extra = body_builder(None, top, bottom)  # chiều cao cần cho phần thân
    qh = max(0.8, bottom - top - extra - 0.1) if extra else bottom - top
    question_box(sl, q, top, qh, blanks=blanks, mx=36 if not extra else 32)
    if extra:
        body_builder(sl, top + qh + 0.1, bottom)
    panel, _ = answer_panel(sl, ex, bottom + 0.05 if extra else top + min(qh, need_h(q, blanks, 30) + 0.2), max_pt)
    sl.trigger(btn, [panel])


def list_builder(items, numbering, two=None):
    """Dựng danh sách mục (sắp xếp) hoặc hai cột (ghép nối)."""
    def build(sl, y, bottom):
        cols = [items] if two is None else [items, two]
        n = max(len(c) for c in cols)
        need = n * 0.62 + (n - 1) * 0.08
        if sl is None:
            return min(need, (bottom - 0.95) * 0.65)
        h_all = bottom - y
        rh = min(0.8, (h_all - (n - 1) * 0.08) / n)
        cw = CW if two is None else (CW - 0.2) / 2
        for ci, col in enumerate(cols):
            labels = numbering[ci]
            tx = [[("p", [(f"{labels[k]}.  ", False)] + ([(it, True)] if two is None and _looks_code(it) else inline_runs(it)))]
                  for k, it in enumerate(col)]
            pt = min(fit_pt(t, cw - 0.4, rh - 0.08, 24, 11) for t in tx)
            for k in range(len(col)):
                sl.shape(L + ci * (cw + 0.2), y + k * (rh + 0.08), cw, rh, [para(tx[k][0][1], pt)], fill=C_PANEL,
                         line=C_LINE, line_w=1, geom="roundRect", radius=12000, ins=(0.2, 0.03, 0.2, 0.03), name="Muc")
        return 0
    return build


def _looks_code(s):
    return bool(re.search(r"[=();:\[\]{}<>]|^\s{2,}|\bprint\b|\bfor\b|\bif\b|SELECT|<\w", s))


def build_question_slide(q, i, n):
    sl = Slide()
    btn = header(sl, i, n, q)
    t = q["type"]
    d = q["data"]
    rng = random.Random(q.get("id", i) * 7919 + 17)
    if t == "mcq":
        slide_mcq(sl, q, btn)
    elif t == "tf":
        slide_tf(sl, q, btn)
    elif t == "short":
        lead = [("p", [("Đáp án: ", False), (d["answer"], False)])]
        if d.get("alternatives"):
            lead.append(("p", [("(Chấp nhận: " + "; ".join(d["alternatives"]) + ")", False)]))
        slide_generic(sl, q, btn, lambda *a: 0, lead, max_pt=30)
    elif t == "fill":
        lead = [("p", [("Đáp án: " + "   ".join(f"({k + 1}) {b.split('|')[0]}" for k, b in enumerate(d["blanks"])), False)])]
        slide_generic(sl, q, btn, lambda *a: 0, lead, blanks=True, max_pt=30)
    elif t == "order":
        items = list(d["items"])
        shuf = items[:]
        for _ in range(6):
            rng.shuffle(shuf)
            if shuf != items:
                break
        seq = " → ".join(LETTERS[shuf.index(it)] for it in items)
        slide_generic(sl, q, btn, list_builder([s.strip() for s in shuf], [LETTERS]),
                      [("p", [("Thứ tự đúng: " + seq, False)])], max_pt=30)
    elif t == "match":
        lefts = [p[0] for p in d["pairs"]]
        rights = [p[1] for p in d["pairs"]]
        sh = rights[:]
        rng.shuffle(sh)
        key = "   ".join(f"{k + 1} – {'abcdefgh'[sh.index(r)]}" for k, r in enumerate(rights))
        slide_generic(sl, q, btn, list_builder(lefts, ["123456789", "abcdefgh"], sh),
                      [("p", [("Ghép đúng: " + key, False)])], max_pt=30)
    else:  # essay
        lead = []
        for label, val in (("Gợi ý chấm", d.get("rubric")), ("Bài mẫu", d.get("sample"))):
            if val:
                lead.append(("p", [(label + ":", False)]))
                lead.extend(parse_rich(val))
        slide_generic(sl, q, btn, lambda *a: 0, lead or [("p", [("(Câu tự luận – giáo viên nhận xét)", False)])])
    return sl


def title_slide(title, subtitle, n):
    sl = Slide()
    sl.shape(0, 0, SLIDE_W, 0.18, None, fill="2563EB", name="Thanh")
    sl.shape(0.8, 1.7, SLIDE_W - 1.6, 1.9, [txt(title, 46 if len(title) < 50 else 36, bold=True)], name="Tieu de")
    sl.shape(0.8, 3.65, SLIDE_W - 1.6, 0.7, [txt(subtitle or f"{n} câu hỏi", 24, C_MUTED)], name="Phu de")
    tips = [("p", [("🖱  Bấm vào phương án (hoặc nút Đ / S) để kiểm tra đúng – sai", False)]),
            ("p", [("💡  Bấm nút ĐÁP ÁN để hiện đáp án đúng và lời giải", False)]),
            ("p", [("⌨  Phím → hoặc bấm ra ngoài để sang câu tiếp theo", False)])]
    sl.shape(2.2, 4.75, SLIDE_W - 4.4, 1.7, rich_paras(tips, 18, C_TEXT), fill=C_PANEL, line=C_LINE, line_w=1,
             geom="roundRect", radius=10000, anchor="ctr", ins=(0.35, 0.1, 0.3, 0.1), name="Huong dan")
    return sl


def end_slide():
    sl = Slide()
    sl.shape(0.8, 2.6, SLIDE_W - 1.6, 1.4, [txt("🏁  Hoàn thành!", 54, C_YELLOW, bold=True)], name="Ket thuc")
    sl.shape(0.8, 4.0, SLIDE_W - 1.6, 0.7, [txt("Cảm ơn các em đã tham gia", 24, C_MUTED)], name="Cam on")
    return sl


# ------------------------------------------------------------------ đóng gói
THEME = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="OnTap"><a:themeElements>
<a:clrScheme name="OnTap"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>
<a:dk2><a:srgbClr val="0F172A"/></a:dk2><a:lt2><a:srgbClr val="E2E8F0"/></a:lt2>
<a:accent1><a:srgbClr val="2563EB"/></a:accent1><a:accent2><a:srgbClr val="E11D48"/></a:accent2>
<a:accent3><a:srgbClr val="D97706"/></a:accent3><a:accent4><a:srgbClr val="16A34A"/></a:accent4>
<a:accent5><a:srgbClr val="7C3AED"/></a:accent5><a:accent6><a:srgbClr val="0891B2"/></a:accent6>
<a:hlink><a:srgbClr val="60A5FA"/></a:hlink><a:folHlink><a:srgbClr val="A78BFA"/></a:folHlink></a:clrScheme>
<a:fontScheme name="OnTap"><a:majorFont><a:latin typeface="{FONT}"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont>
<a:minorFont><a:latin typeface="{FONT}"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme>
<a:fmtScheme name="OnTap"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
<a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst>
<a:lnStyleLst><a:ln w="6350"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
<a:ln w="12700"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>
<a:ln w="19050"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln></a:lnStyleLst>
<a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle>
<a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst>
<a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill>
<a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements>
<a:objectDefaults/><a:extraClrSchemeLst/></a:theme>'''

EMPTY_TREE = ('<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr>'
              '<a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/>'
              '</a:xfrm></p:grpSpPr></p:spTree>')

MASTER = (f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:sldMaster {NS}><p:cSld><p:bg><p:bgRef idx="1001">'
          f'<a:schemeClr val="bg2"/></p:bgRef></p:bg>{EMPTY_TREE}</p:cSld>'
          '<p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" '
          'accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>'
          '<p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>'
          '<p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles></p:sldMaster>')

LAYOUT = (f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:sldLayout {NS} type="blank" preserve="1">'
          f'<p:cSld name="Blank">{EMPTY_TREE}</p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>')

REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"


def rels(items):
    body = "".join(f'<Relationship Id="{i}" Type="{REL}/{t}" Target="{tg}"/>' for i, t, tg in items)
    return ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
            f'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{body}</Relationships>')


def build_pptx(title, questions, subtitle=""):
    """questions: danh sách dict {id, type, level, content, data, explanation}. Trả về bytes của tệp .pptx."""
    slides = [title_slide(title, subtitle, len(questions))]
    for i, q in enumerate(questions, 1):
        slides.append(build_question_slide(q, i, len(questions)))
    slides.append(end_slide())

    buf = io.BytesIO()
    z = zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED)
    n = len(slides)
    ct = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
          '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
          '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
          '<Default Extension="xml" ContentType="application/xml"/>'
          '<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>'
          '<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>'
          '<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>'
          '<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>'
          '<Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/>'
          '<Override PartName="/ppt/viewProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.viewProps+xml"/>'
          '<Override PartName="/ppt/tableStyles.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.tableStyles+xml"/>'
          '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>'
          '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>'
          + "".join(f'<Override PartName="/ppt/slides/slide{k}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'
                    for k in range(1, n + 1)) + '</Types>')
    z.writestr("[Content_Types].xml", ct)
    z.writestr("_rels/.rels", rels([
        ("rId1", "officeDocument", "ppt/presentation.xml"),
        ("rId2", "extended-properties", "docProps/app.xml"),
    ]).replace("</Relationships>",
               '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" '
               'Target="docProps/core.xml"/></Relationships>'))
    z.writestr("docProps/app.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
               '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">'
               f'<Application>On tap Tin hoc</Application><Slides>{n}</Slides></Properties>')
    z.writestr("docProps/core.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
               '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" '
               'xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>' + x(title) + '</dc:title></cp:coreProperties>')
    pres_rels = [("rId1", "slideMaster", "slideMasters/slideMaster1.xml"), ("rId2", "theme", "theme/theme1.xml"),
                 ("rId3", "presProps", "presProps.xml"), ("rId4", "viewProps", "viewProps.xml"),
                 ("rId5", "tableStyles", "tableStyles.xml")]
    pres_rels += [(f"rId{10 + k}", "slide", f"slides/slide{k}.xml") for k in range(1, n + 1)]
    z.writestr("ppt/_rels/presentation.xml.rels", rels(pres_rels))
    sld_ids = "".join(f'<p:sldId id="{255 + k}" r:id="rId{10 + k}"/>' for k in range(1, n + 1))
    z.writestr("ppt/presentation.xml", f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:presentation {NS} saveSubsetFonts="1">'
               '<p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst>'
               f'<p:sldIdLst>{sld_ids}</p:sldIdLst><p:sldSz cx="{E(SLIDE_W)}" cy="{E(SLIDE_H)}"/>'
               '<p:notesSz cx="6858000" cy="9144000"/></p:presentation>')
    z.writestr("ppt/presProps.xml", f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:presentationPr {NS}/>')
    z.writestr("ppt/viewProps.xml", f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<p:viewPr {NS}>'
               '<p:normalViewPr><p:restoredLeft sz="15620"/><p:restoredTop sz="94660"/></p:normalViewPr></p:viewPr>')
    z.writestr("ppt/tableStyles.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
               '<a:tblStyleLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
               'def="{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}"/>')
    z.writestr("ppt/theme/theme1.xml", THEME)
    z.writestr("ppt/slideMasters/slideMaster1.xml", MASTER)
    z.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels",
               rels([("rId1", "slideLayout", "../slideLayouts/slideLayout1.xml"), ("rId2", "theme", "../theme/theme1.xml")]))
    z.writestr("ppt/slideLayouts/slideLayout1.xml", LAYOUT)
    z.writestr("ppt/slideLayouts/_rels/slideLayout1.xml.rels",
               rels([("rId1", "slideMaster", "../slideMasters/slideMaster1.xml")]))
    for k, sl in enumerate(slides, 1):
        z.writestr(f"ppt/slides/slide{k}.xml", sl.xml())
        z.writestr(f"ppt/slides/_rels/slide{k}.xml.rels", rels([("rId1", "slideLayout", "../slideLayouts/slideLayout1.xml")]))
    z.close()
    return buf.getvalue()
