# -*- coding: utf-8 -*-
import re
exec(open('new.py',encoding='utf-8').read())
exec(open('new2.py',encoding='utf-8').read())
exec(open('new3.py',encoding='utf-8').read())
N.update(N2)
src=''.join(open(f,encoding='utf-8').read() for f in ['s1.html','s2.html','s3.html','s4.html'])
S=re.findall(r'<section class="s.*?</section>',src,flags=re.S)
assert len(S)==26,len(S)
def retag(sec,tag,cls):
    sec=re.sub(r'<span class="k">.*?</span>','<span class="k">%s</span>'%tag,sec,count=1)
    sec=re.sub(r'^<section class="s[^"]*"','<section class="s %s"'%cls,sec)
    return sec.replace('class="s "','class="s"')
# slide 1 & 2
S[0]=S[0].replace('<span class="chip">1 · Web, URL, HTTP</span><span class="chip">2 · Cấu trúc HTML</span><span class="chip">3 · Liên kết, media</span><span class="chip">4 · Dạng bài khó</span>','<span class="chip">Bài 7 · HTML</span><span class="chip">Bài 8 · Định dạng</span><span class="chip">Bài 9 · Danh sách, bảng</span><span class="chip">Bài 10 · Liên kết</span><span class="chip">Bài 11 · Media</span><span class="chip">Dạng bài HSG</span>')
S[0]=S[0].replace('Bài giảng chuyên sâu cho học sinh ôn thi HSG: từ khái niệm đến dạng bài khó. Bám SGK Tin học 12 (định hướng Khoa học máy tính bài 7–12, Tin học ứng dụng bài 23–28).','Bài giảng chuyên sâu cho học sinh ôn thi HSG, sắp xếp theo đúng mạch SGK Tin học 12 KNTT (định hướng Khoa học máy tính): Bài 7, 8, 9, 10, 11 và các dạng bài khó.')
goals='''<section class="s"><div class="hd"><span class="k">MỞ ĐẦU</span><h1>Mục tiêu và mạch bài học</h1></div>
<div class="bd g2">
<div class="col"><div class="card"><h3>Sau bài học, em có thể</h3><ul>
<li>Giải thích <b>quy trình tải</b> một trang web (URL, DNS, HTTP).</li>
<li>Viết đúng tài liệu <b>HTML5</b>, đọc <b>cây phần tử</b>, đếm phần tử.</li>
<li>Dùng thẻ và thuộc tính <b>định dạng văn bản, phông chữ</b>.</li>
<li>Tạo <b>danh sách</b> (ol, ul, dl) và <b>bảng</b> (gộp ô).</li>
<li>Viết <b>đường dẫn tương đối</b> và các kiểu <b>liên kết</b>.</li>
<li>Nhúng <b>ảnh, âm thanh, video, iframe</b>.</li>
<li><b>Tìm lỗi</b> và <b>dự đoán kết quả</b> hiển thị của mã HTML.</li></ul></div>
<div class="key">Mỗi slide có nhãn bài (ví dụ <b>BÀI 8 · 2</b> = Bài 8, mục 2 của SGK) để học theo đúng sách.</div></div>
<svg viewBox="0 0 540 480"><g font-weight="800" font-size="24" fill="#fff" text-anchor="middle"><rect x="20" y="4" width="500" height="58" rx="12" fill="#546E7A"/><text x="270" y="41">NỀN · Web, URL, HTTP</text><rect x="20" y="72" width="500" height="58" rx="12" fill="#00695C"/><text x="270" y="109">BÀI 7 · HTML và cấu trúc trang</text><rect x="20" y="140" width="500" height="58" rx="12" fill="#4527A0"/><text x="270" y="177">BÀI 8 · Định dạng văn bản</text><rect x="20" y="208" width="500" height="58" rx="12" fill="#1565C0"/><text x="270" y="245">BÀI 9 · Danh sách và bảng</text><rect x="20" y="276" width="500" height="58" rx="12" fill="#AD1457"/><text x="270" y="313">BÀI 10 · Tạo liên kết</text><rect x="20" y="344" width="500" height="58" rx="12" fill="#BF360C"/><text x="270" y="381">BÀI 11 · Ảnh, âm thanh, video</text><rect x="20" y="412" width="500" height="58" rx="12" fill="#B71C1C"/><text x="270" y="449">DẠNG BÀI KHÓ HSG</text></g></svg>
</div></section>'''
S[1]=goals
# slide 10 (idx 9) add rows
S[9]=S[9].replace('<tr><td class="m">pre, code</td><td>Giữ nguyên xuống dòng, mã nguồn</td></tr>','<tr><td class="m">pre, code</td><td>Giữ nguyên xuống dòng, mã nguồn</td></tr>\n<tr><td class="m">u, del</td><td>Gạch chân, đánh dấu xoá (SGK Bảng 8.1)</td></tr>').replace('Thẻ định dạng văn bản','Thẻ định dạng kiểu chữ')
# slide 17 paths (idx 16) rewrite by SGK tree
S[16]='''<section class="s"><div class="hd"><span class="k">BÀI 10 · 2</span><h1>Liên kết trong website: đường dẫn tương đối</h1></div>
<div class="bd g2">
<div class="col"><div class="lab">Cấu trúc website (SGK Hình 10.1)</div>
<pre class="code">web/
├─ index.html
├─ thong_tin.html
├─ images/
│   └─ sun.png
└─ bai_tap/
    ├─ bai_tap_1.html
    ├─ bai_tap_2.html
    └─ on_tap/
        └─ bai_tap_on_tap.html</pre>
<div class="ok"><p><b>Tuyệt đối</b>: có giao thức + tên miền, dùng cho website khác. <b>Tương đối</b>: không có giao thức, tên miền, chỉ cần tên đường dẫn, dùng trong cùng website.</p></div></div>
<div class="col"><table><tr><th>Từ tệp</th><th>Tới</th><th>Viết href</th></tr>
<tr><td class="m">index.html</td><td class="m">thong_tin.html</td><td class="m">thong_tin.html</td></tr>
<tr><td class="m">index.html</td><td class="m">bai_tap_1.html</td><td class="m">bai_tap/bai_tap_1.html</td></tr>
<tr><td class="m">index.html</td><td class="m">bai_tap_on_tap</td><td class="m">bai_tap/on_tap/bai_tap_on_tap.html</td></tr>
<tr><td class="m">bai_tap_1.html</td><td class="m">index.html</td><td class="m">../index.html</td></tr>
<tr><td class="m">bai_tap_1.html</td><td class="m">sun.png</td><td class="m">../images/sun.png</td></tr></table>
<div class="key"><code>../</code> = trở lại thư mục trên <b>một mức</b>; số cụm <code>../</code> bằng số mức quay lại. Mỗi cấp thư mục ngăn cách bởi <b>dấu /</b>.</div>
<div class="warn">Không dùng <code>C:\\anh\\a.png</code> hay dấu <code>\\</code>. Tên tệp có thể phân biệt hoa/thường.</div></div>
</div></section>'''
order=[('S',0,None,None),('S',1,None,None),
 ('S',2,'NỀN','p0'),('S',3,'NỀN','p0'),('S',4,'NỀN','p0'),('S',5,'NỀN','p0'),
 ('S',6,'BÀI 7 · 1','p2'),('N','n1',None,'p2'),('S',10,'BÀI 7 · 1','p2'),
 ('S',7,'BÀI 7 · 2','p2'),('S',8,'BÀI 7 · 2','p2'),('N','n5',None,'p2'),
 ('S',13,'BÀI 7 · TẬP','p2'),('S',14,'BÀI 7 · ĐÁP ÁN','p2'),
 ('N','n7',None,'p3'),('N','n8',None,'p3'),('S',11,'BÀI 8 · 2','p3'),('S',9,'BÀI 8 · 3','p3'),('N','b81',None,'p3'),('N','n9',None,'p3'),('S',12,'MỞ RỘNG HTML5','p3'),('N','b82',None,'p3'),('N','b82b',None,'p3'),
 ('N','n10',None,'p3'),('N','n11',None,'p3'),
 ('N','l1a',None,'p7'),('N','l1b',None,'p7'),('N','l2a',None,'p7'),('N','l2b',None,'p7'),('N','tb1',None,'p7'),('N','tb2a',None,'p7'),('N','tb2b',None,'p7'),('N','tb3',None,'p7'),('N','tb4',None,'p7'),('N','b9t',None,'p7'),('N','b9a',None,'p7'),
 ('N','k0',None,'p4'),('N','k1',None,'p4'),('S',15,'BÀI 10 · 2','p4'),('N','k2',None,'p4'),('S',16,None,'p4'),('N','k3',None,'p4'),('N','n12',None,'p4'),('N','k4',None,'p4'),('N','k5',None,'p4'),
 ('S',17,'BÀI 11 · 1','p5'),('S',18,'BÀI 11 · 2','p5'),('S',19,'BÀI 11 · 3','p5'),('S',20,'BÀI 10–11 · TẬP','p5'),('S',21,'BÀI 10–11 · ĐÁP ÁN','p5'),
 ('S',22,'HSG · ĐÚNG/SAI','p6'),('S',23,'HSG · TÌM LỖI','p6'),('S',24,'HSG · ĐỌC MÃ','p6'),('S',25,'TỔNG KẾT','p6')]
out=[]
for kind,ref,tag,cls in order:
    sec=S[ref] if kind=='S' else N[ref]
    if cls: 
        sec=re.sub(r'^<section class="s[^"]*"','<section class="s %s"'%cls,sec)
    if tag: sec=re.sub(r'<span class="k">.*?</span>','<span class="k">%s</span>'%tag,sec,count=1)
    out.append(sec)
open('body.html','w',encoding='utf-8').write('\n\n'.join(out))
print(len(out))
