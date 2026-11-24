# -*- coding: utf-8 -*-
def e(s): return s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
def code(s,fs=None):
    st=' style="font-size:calc(%dpx*var(--z,1))"'%fs if fs else ''
    return '<pre class="code"%s>%s</pre>'%(st,e(s))
def sec(cls,tag,title,body,layout='g2'):
    return '<section class="s %s"><div class="hd"><span class="k">%s</span><h1>%s</h1></div>\n<div class="bd %s">\n%s\n</div></section>'%(cls,tag,title,layout,body)
def res(inner,lab='Kết quả hiển thị'):
    return '<div class="res"><span class="lab">%s</span>%s</div>'%(lab,inner)
N2={}

# ---------- BÀI 8 ----------
rows=[('Chữ đậm','strong ; b','<strong>là câu</strong>','<span style="font-weight:700">là câu</span>'),
('Chữ nghiêng','em ; i','<em>là câu</em>','<span style="font-style:italic">là câu</span>'),
('Gạch chân','u','<u>là câu</u>','<span style="text-decoration:underline">là câu</span>'),
('Đánh dấu','mark','<mark>là câu</mark>','<span style="background:#FFEB3B">là câu</span>'),
('Giảm cỡ chữ','small','<small>là câu</small>','<span style="font-size:15px">là câu</span>'),
('Chỉ số trên','sup','x<sup>2</sup>','x<sup>2</sup>'),
('Chỉ số dưới','sub','H<sub>2</sub>O','H<sub>2</sub>O'),
('Đánh dấu xoá','del','<del>là câu</del>','<del>là câu</del>')]
t='<table><tr><th>Kiểu chữ</th><th>Thẻ</th><th>Mã HTML</th><th>Kết quả</th></tr>'
for a,b,c,d in rows:
    t+='<tr><td>%s</td><td class="m">%s</td><td class="m">%s</td><td style="font-family:Georgia,serif;font-size:24px">Đây %s chuẩn</td></tr>'%(a,b,e(c),d) if a not in('Chỉ số trên','Chỉ số dưới') else '<tr><td>%s</td><td class="m">%s</td><td class="m">%s</td><td style="font-family:Georgia,serif;font-size:24px">%s</td></tr>'%(a,b,e(c),d)
t+='</table>'
N2['b81']=sec('p3','BÀI 8 · 3','Bảng 8.1: các thẻ định dạng kiểu chữ','<div class="col">'+t+'''<div class="ok"><p><b>strong, em</b> mang <b>ý nghĩa nhấn mạnh</b> (đậm, nghiêng) nên được <b>khuyến khích</b>; <b>b, i</b> chỉ đổi hình thức. SGK lưu ý HTML5 không hỗ trợ <code>big</code>, <code>u</code>: nên dùng <code>font-size</code>, <code>text-decoration</code> trong <code>style</code>.</p></div></div>''','g1')

N2['b82']=sec('p3','BÀI 8 · THỰC HÀNH','Thực hành: Hình 8.3 phương trình bậc hai','''<div class="col">'''+code('''<h1>Biện luận số nghiệm của phương trình bậc 2</h1>
<h2><span style="color:red">Bài toán:</span> Xác định số nghiệm
 của phương trình ax<sup>2</sup> + bx + c = 0 (a != 0)</h2>
<h2>Cách làm:</h2>
<p>B<sub>1</sub>: Xác định hệ số a, b và c</p>
<p>B<sub>2</sub>: Tính delta = b<sup>2</sup> - 4ac</p>
<p>B<sub>3</sub>: Kết luận<br>
+ Nếu delta &lt; 0: Phương trình vô nghiệm<br>
+ Nếu delta = 0: Có nghiệm duy nhất<br>
+ Nếu delta &gt; 0: Có hai nghiệm phân biệt</p>''',18)+'''</div>
<div class="col">'''+res('''<div style="font-family:Georgia,serif"><div style="font-size:27px;font-weight:700">Biện luận số nghiệm của phương trình bậc 2</div><div style="font-size:22px;font-weight:700;margin:4px 0"><span style="color:red">Bài toán:</span> Xác định số nghiệm của phương trình ax<sup>2</sup> + bx + c = 0 (a != 0)</div><div style="font-size:22px;font-weight:700">Cách làm:</div><div style="font-size:20px">B<sub>1</sub>: Xác định hệ số a, b và c<br>B<sub>2</sub>: Tính delta = b<sup>2</sup> - 4ac<br>B<sub>3</sub>: Kết luận<br>+ Nếu delta &lt; 0: vô nghiệm<br>+ Nếu delta = 0: nghiệm duy nhất<br>+ Nếu delta &gt; 0: hai nghiệm phân biệt</div></div>''')+'''
<div class="key">Phân tích (SGK): <b>3 dòng đầu là tiêu đề</b> (h1, h2, h2); <b>3 đoạn</b> là 3 bước. Ba dòng <b>+ Nếu…</b> chỉ <b>xuống dòng bằng br</b>, không có khoảng cách trước và sau nên <b>không phải đoạn riêng</b>.</div></div>''')

# ---------- BÀI 9 ----------
N2['l1']=sec('p7','BÀI 9 · 1','Danh sách có thứ tự và không có thứ tự','''<div class="col"><div class="lab">&lt;ol&gt; : danh sách có thứ tự</div>'''+code('''<ol type="i" start="3">
  <li>Nếu <b>delta</b> &lt; 0: ...</li>
  <li>Nếu <b>delta</b> = 0: ...</li>
  <li>Nếu <b>delta</b> &gt; 0: ...</li>
</ol>''',19)+res('<ol type="i" start="3"><li>Nếu <b style="color:#000">delta</b> &lt; 0: ...</li><li>Nếu <b style="color:#000">delta</b> = 0: ...</li><li>Nếu <b style="color:#000">delta</b> &gt; 0: ...</li></ol>')+'''<table><tr><th>type</th><td class="m">"1"</td><td class="m">"a"</td><td class="m">"A"</td><td class="m">"i"</td><td class="m">"I"</td></tr><tr><th>Đánh số</th><td>1, 2</td><td>a, b</td><td>A, B</td><td>i, ii</td><td>I, II</td></tr></table></div>
<div class="col"><div class="lab">&lt;ul&gt; : danh sách không thứ tự</div>'''+code('''<ul style="list-style-type: square">
  <li>Nếu delta &lt; 0: ...</li>
  <li>Nếu delta = 0: ...</li>
  <li>Nếu delta &gt; 0: ...</li>
</ul>''',19)+res('<ul style="list-style-type:square"><li>Nếu delta &lt; 0: ...</li><li>Nếu delta = 0: ...</li><li>Nếu delta &gt; 0: ...</li></ul>')+'''<table><tr><th>list-style-type</th><th>Kí tự đầu dòng</th></tr><tr><td class="m">disc / circle</td><td>chấm tròn đặc ● / tròn rỗng ○</td></tr><tr><td class="m">square / none</td><td>hình vuông ■ / không có kí tự</td></tr></table>
<div class="key"><b>start</b> là số bắt đầu đánh. Mỗi mục là một thẻ <code>li</code>.</div></div>''')

N2['l2']=sec('p7','BÀI 9 · 1','Danh sách mô tả và danh sách lồng nhau','''<div class="col"><div class="lab">&lt;dl&gt; : danh sách mô tả</div>'''+code('''<dl>
  <dt>Kem</dt>
  <dd>Món ăn ngọt, dạng đông lạnh.</dd>
  <dt>Trà sữa</dt>
  <dd>Đồ uống làm từ trà và sữa.</dd>
</dl>''',19)+res('<dl><dt>Kem</dt><dd>Món ăn ngọt, dạng đông lạnh.</dd><dt>Trà sữa</dt><dd>Đồ uống làm từ trà và sữa.</dd></dl>')+'''<table><tr><th>Thẻ</th><th>Vai trò</th></tr><tr><td class="m">dl</td><td>bao toàn bộ danh sách</td></tr><tr><td class="m">dt</td><td>tên mục (thuật ngữ, nhãn)</td></tr><tr><td class="m">dd</td><td>mô tả của mục đó</td></tr></table></div>
<div class="col"><div class="lab">Danh sách lồng nhau</div>'''+code('''<ol>
  <li>Thể thao
    <ol type="a">
      <li>Bóng đá</li>
      <li>Bơi</li>
    </ol>
  </li>
  <li>Nghệ thuật</li>
</ol>''',19)+res('<ol><li>Thể thao<ol type="a"><li>Bóng đá</li><li>Bơi</li></ol></li><li>Nghệ thuật</li></ol>')+'''<div class="key">Danh sách con đặt <b>bên trong thẻ li</b> của mục cha (trước thẻ <code>&lt;/li&gt;</code>), không đặt trực tiếp trong ol/ul. Mức 1 đánh 1, 2, 3; mức 2 dùng <code>type="a"</code>.</div></div>''')

N2['tb1']=sec('p7','BÀI 9 · 2','Bảng: table, tr, th, td, caption','''<div class="col"><table><tr><th>Thẻ</th><th>Tạo ra</th></tr>
<tr><td class="m">table</td><td>cả bảng</td></tr>
<tr><td class="m">tr</td><td>một <b>hàng</b></td></tr>
<tr><td class="m">th</td><td>ô <b>tiêu đề</b> (đậm, giữa ô)</td></tr>
<tr><td class="m">td</td><td>ô <b>dữ liệu</b></td></tr>
<tr><td class="m">caption</td><td>tiêu đề bảng (ngay sau table, trước tr đầu)</td></tr></table>
<div class="key">Bảng được xây từ các <b>hàng</b>; mỗi hàng chứa các ô. Không có thẻ tạo “cột”: số cột là số ô của hàng.</div>
<div class="warn">Thứ tự đọc mã: <b>từ trên xuống, từ trái sang phải</b>. Thẻ <code>td</code>, <code>th</code> phải nằm trong <code>tr</code>.</div></div>
<div class="col">'''+code('''<table border="1">
  <caption>Hoá đơn</caption>
  <tr><th>Món</th><th>Giá</th><th>SL</th><th>Tiền</th></tr>
  <tr><td>Thịt xiên</td><td>10K</td>
      <td>3</td><td>30</td></tr>
  <tr><td>Cá viên</td><td>5K</td>
      <td>6</td><td>30</td></tr>
</table>''',18)+res('<table class="rt"><caption style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#000">Hoá đơn</caption><tr><th>Món</th><th>Giá</th><th>SL</th><th>Tiền</th></tr><tr><td>Thịt xiên</td><td>10K</td><td>3</td><td>30</td></tr><tr><td>Cá viên</td><td>5K</td><td>6</td><td>30</td></tr></table>')+'''</div>''')

N2['tb2']=sec('p7','BÀI 9 · 2','Định dạng bảng: khung, kích thước, gộp ô','''<div class="col"><table><tr><th>Việc cần làm</th><th>Cách viết</th></tr>
<tr><td>Tiêu đề bảng</td><td class="m">&lt;caption&gt;</td></tr>
<tr><td>Khung viền</td><td class="m">style="border: 1px solid black"</td></tr>
<tr><td>Kích thước</td><td class="m">style="width:80%; height:400px"</td></tr>
<tr><td>Gộp nhiều <b>hàng</b></td><td class="m">rowspan="n"</td></tr>
<tr><td>Gộp nhiều <b>cột</b></td><td class="m">colspan="n"</td></tr></table>
<div class="card"><h3>Quy tắc border và kích thước</h3><ul style="gap:3px"><li><code>border</code>: <b>độ dày</b> + <b>kiểu</b> (solid, dotted, double, none) + <b>màu</b> (có thể bỏ).</li><li>Nên dùng <b>%</b>, tránh <b>px</b> vì màn hình khác nhau.</li></ul></div>
<div class="warn">Gộp hàng bằng rowspan: ở các hàng sau phải <b>bỏ</b> thẻ th/td tại vị trí bị gộp.</div></div>
<div class="col"><div class="lab">SGK Hình 9.6: gộp hàng và cột</div>'''+code('''<table border="1">
  <tr>
    <th rowspan="2">Họ và tên</th>
    <th colspan="3">Điểm thi</th>
  </tr>
  <tr>
    <th>Toán</th><th>Vật lí</th>
    <th>Hoá học</th>
  </tr>
</table>''',18)+res('<table class="rt"><tr><th rowspan="2">Họ và tên</th><th colspan="3">Điểm thi</th></tr><tr><th>Toán</th><th>Vật lí</th><th>Hoá học</th></tr></table>')+'''<div class="key">Lưới 2 hàng × 4 cột. Hàng 2 chỉ viết <b>3 ô</b> vì ô “Họ và tên” đã chiếm cột 1.</div></div>''')

N2['tb3']=sec('p7','BÀI 9 · 3','Thực hành 1: danh sách câu lạc bộ','''<div class="col"><div class="lab">Phân tích và mã HTML</div>'''+code('''<h2>Danh sách Câu lạc bộ</h2>
<ul>
  <li>THỂ THAO
    <ol>
      <li>Bóng đá</li>
      <li>Bóng chuyền</li>
      <li>Bơi</li>
      <li>Võ thuật
        <ol type="a">
          <li>Karatedo</li>
          <li>Taekwondo</li>
        </ol>
      </li>
    </ol>
  </li>
  <li>NGHỆ THUẬT ... (làm tương tự)</li>
</ul>''',17)+'''</div><div class="col">'''+res('<div style="font-family:Georgia,serif;font-size:25px;font-weight:700">Danh sách Câu lạc bộ</div><ul><li>THỂ THAO<ol><li>Bóng đá</li><li>Bóng chuyền</li><li>Bơi</li><li>Võ thuật<ol type="a"><li>Karatedo</li><li>Taekwondo</li></ol></li></ol></li><li>NGHỆ THUẬT …</li></ul>')+'''<div class="ok"><p><b>Các bước (SGK):</b> 1) tách thành phần: một tiêu đề và một danh sách lồng nhau; 2) tiêu đề dùng <code>h2</code>; 3) danh sách ngoài là <code>ul</code>; 4) mục THỂ THAO chứa <code>ol</code>, mục thứ tư của <code>ol</code> chứa <code>ol type="a"</code>.</p></div></div>''')

hdr='<th rowspan="2">Bộ môn</th><th rowspan="2">GV phụ trách</th><th colspan="5">Ngày</th>'
N2['tb4']=sec('p7','BÀI 9 · 3','Thực hành 2: bảng lịch hoạt động','''<div class="col"><div class="lab">Bảng 7 hàng × 7 cột, có caption</div>'''+code('''<table border="1">
 <caption>Lịch hoạt động CLB Thể thao</caption>
 <tr>
  <th rowspan="2">Bộ môn</th>
  <th rowspan="2">GV phụ trách</th>
  <th colspan="5">Ngày</th>
 </tr>
 <tr><th>Thứ 2</th> ... <th>Thứ 6</th></tr>
 <tr><td>Bóng đá</td><td>Thầy Hùng</td>
     <td>x</td><td></td><td>x</td>
     <td></td><td>x</td></tr>
 ... (còn 4 hàng nữa)
</table>''',17)+'''</div><div class="col">'''+res('<table class="rt"><caption style="font-family:Georgia,serif;font-size:19px;font-weight:700;color:#000">Lịch hoạt động CLB Thể thao</caption><tr><th rowspan="2">Bộ môn</th><th rowspan="2">GV phụ trách</th><th colspan="5">Ngày</th></tr><tr><th>Thứ 2</th><th>Thứ 3</th><th>Thứ 4</th><th>Thứ 5</th><th>Thứ 6</th></tr><tr><td>Bóng đá</td><td>Thầy Hùng</td><td>x</td><td></td><td>x</td><td></td><td>x</td></tr><tr><td>Bóng chuyền</td><td>Cô Lan</td><td></td><td>x</td><td></td><td>x</td><td></td></tr><tr><td>Karatedo</td><td>Thầy Hoàng</td><td>x</td><td></td><td></td><td>x</td><td></td></tr><tr><td>Taekwondo</td><td>Thầy Đức</td><td></td><td>x</td><td></td><td></td><td>x</td></tr><tr><td>Vovinam</td><td>Thầy Thắng</td><td>x</td><td>x</td><td></td><td></td><td></td></tr></table>')+'''<div class="key">Hàng 1: <b>2 + 1 ô gộp</b> (rowspan 2, rowspan 2, colspan 5); hàng 2 chỉ có <b>5 ô</b> Thứ 2 đến Thứ 6; mỗi hàng dữ liệu có <b>7 ô</b>.</div></div>''')

N2['b9t']=sec('p7','BÀI 9 · TẬP','Bài tập củng cố','''<div class="q"><div class="n">1</div><p>Viết mã tạo danh sách có thứ tự đánh số <b>a, b, c</b> nhưng bắt đầu từ <b>c</b> với 3 mục tuỳ ý.</p></div>
<div class="q"><div class="n">2</div><p>Chọn <code>ul</code>, <code>ol</code> hay <code>dl</code> cho: (a) các bước giải bài toán; (b) bảng thuật ngữ kèm giải nghĩa; (c) danh sách đồ dùng cần mang.</p></div>
<div class="q"><div class="n">3</div><p>Bảng có 3 hàng: hàng 1 một ô <code>th colspan="3"</code>; hàng 2 và 3 mỗi hàng 3 ô <code>td</code>. Có mấy cột? Mã có bao nhiêu thẻ <code>th</code>, <code>td</code>?</p></div>
<div class="q"><div class="n">4</div><p>Hàng 1: <code>&lt;th rowspan="2"&gt;A&lt;/th&gt;&lt;th&gt;B&lt;/th&gt;&lt;th&gt;C&lt;/th&gt;</code>. Hàng 2 cần viết mấy ô? Nếu viết 3 ô thì điều gì xảy ra?</p></div>
<div class="q"><div class="n">5</div><p>Sửa lỗi: <code>&lt;ul&gt;&lt;li&gt;A&lt;/li&gt;&lt;ol&gt;&lt;li&gt;a1&lt;/li&gt;&lt;/ol&gt;&lt;/ul&gt;</code> để a1 là mục con của A.</p></div>''','g1" style="gap:10px')

N2['b9a']=sec('p7','BÀI 9 · ĐÁP ÁN','Đáp án chi tiết','''<div class="q a"><div class="n">1</div><p><code>&lt;ol type="a" start="3"&gt;</code> rồi 3 thẻ <code>li</code>: hiển thị <b>c, d, e</b>.</p></div>
<div class="q a"><div class="n">2</div><p>(a) <b>ol</b> (có thứ tự); (b) <b>dl</b> với dt là thuật ngữ, dd là giải nghĩa; (c) <b>ul</b> (không cần thứ tự).</p></div>
<div class="q a"><div class="n">3</div><p><b>3 cột</b> (ô gộp chiếm 3 cột). Có <b>1 th</b> và <b>6 td</b> = 7 ô được viết, nhưng lưới có 3 × 3 = 9 ô.</p></div>
<div class="q a"><div class="n">4</div><p>Chỉ cần <b>2 ô</b> (cho cột 2 và 3). Viết 3 ô thì ô thừa bị đẩy sang <b>cột thứ 4</b>, bảng bị lệch và dư một cột.</p></div>
<div class="q a"><div class="n">5</div><p>Đặt <code>ol</code> <b>bên trong li</b> của A: <code>&lt;li&gt;A&lt;ol&gt;&lt;li&gt;a1&lt;/li&gt;&lt;/ol&gt;&lt;/li&gt;</code>.</p></div>''','g1" style="gap:10px')

# ---------- BÀI 10 ----------
N2['k0']=sec('p4','BÀI 10 · 1','Siêu văn bản, siêu liên kết và thẻ a','''<div class="col"><div class="card"><h3>Khái niệm (SGK)</h3><ul style="gap:5px"><li><b>Siêu văn bản</b> (hypertext): văn bản chứa chữ, ảnh, âm thanh… và các <b>siêu liên kết</b> tới siêu văn bản khác.</li><li><b>Siêu liên kết</b> (liên kết): tham chiếu tới siêu văn bản khác; nháy chuột để truy cập, <b>không cần đọc tuần tự</b>.</li></ul></div>
<table><tr><th>Tệp</th><th>Siêu văn bản?</th></tr><tr><td class="m">.html</td><td>Có</td></tr><tr><td class="m">.docx (Word)</td><td>Có thể</td></tr><tr><td class="m">.txt (Notepad)</td><td>Không</td></tr></table></div>
<div class="col"><div class="lab">Cấu trúc chung của thẻ a</div>'''+code('<a href="URL">Nội dung hiển thị</a>',22)+'''<div class="ok"><p><code>href</code> cung cấp <b>địa chỉ đích</b> (URL); giá trị <b>đặt trong cặp dấu nháy kép</b>. Đích thường là trang HTML, nhưng cũng có thể là <b>ảnh, âm thanh, video</b>.</p></div>'''+res('<span style="font-family:Georgia,serif;font-size:23px;color:#1565C0;text-decoration:underline">Nội dung hiển thị</span> <span style="font-size:19px">(văn bản có liên kết thường gạch chân, màu xanh)</span>')+'''<div class="key">Có <b>hai loại URL</b>: đường dẫn <b>tuyệt đối</b> và đường dẫn <b>tương đối</b>.</div></div>''')

N2['k1']=sec('p4','BÀI 10 · 1','Đường dẫn tuyệt đối và tương đối','''<div class="col"><table><tr><th></th><th>Tuyệt đối</th><th>Tương đối</th></tr>
<tr><td><b>Giao thức, tên miền</b></td><td>Có đầy đủ</td><td>Không có</td></tr>
<tr><td><b>Dùng khi</b></td><td>liên kết tới website <b>khác</b> (liên kết ngoài)</td><td>liên kết tới tài liệu <b>cùng website</b> (liên kết trong)</td></tr>
<tr><td><b>Ví dụ</b></td><td class="m">https://www.nxbgd.vn/</td><td class="m">BT/bai_tap_1.html</td></tr>
<tr><td><b>Đặc điểm</b></td><td>chính xác, nhưng dài</td><td>ngắn; đổi vị trí cả website vẫn đúng</td></tr></table>
<div class="key">Đường dẫn <b>không có giao thức</b> ở đầu: trình duyệt tìm trên <b>máy chủ hiện tại</b>.</div></div>
<div class="col"><div class="card"><h3>SGK: phân loại các đường dẫn</h3><ul style="gap:5px"><li><code>html/cach tao lien ket.html</code> → <b>tương đối</b>.</li><li><code>http://google.com</code> → <b>tuyệt đối</b> (có giao thức http).</li><li><code>mail.google.com/mail/u/0/#inbox/…</code> → <b>tương đối</b> (không có giao thức ở đầu, dù trông giống tên miền).</li></ul></div>
<div class="warn">Viết <code>href="www.google.com"</code> (thiếu <code>https://</code>) là <b>sai</b>: trình duyệt tìm tệp tên “www.google.com” trong website hiện tại và báo lỗi không tìm thấy.</div></div>''')

N2['k2']=sec('p4','BÀI 10 · 2','Liên kết ngoài: tới trang web khác','''<div class="col"><div class="card"><h3>Liên kết ngoài</h3><p>Liên kết từ một trang web tới trang web khác trên Internet. Dùng thẻ <code>a</code> với <b>đường dẫn tuyệt đối</b> trong <code>href</code>.</p></div>'''+code('''<p>
  <a href="https://hanhtrangso.nxbgd.vn/
sach-dien-tu?book_active=9">
    Sách điện tử Kết nối tri thức
    với cuộc sống
  </a>
</p>''',19)+'''</div><div class="col">'''+res('<span style="font-family:Georgia,serif;font-size:23px;color:#1565C0;text-decoration:underline">Sách điện tử Kết nối tri thức với cuộc sống</span>')+'''<div class="ok"><p><b>Khi nháy chuột</b> vào liên kết, trình duyệt gọi tới trang web Sách điện tử và hiển thị nội dung trang đó.</p></div>
<table><tr><th>Mở rộng</th><th>Cách viết</th></tr><tr><td>Mở ở tab mới</td><td class="m">target="_blank"</td></tr><tr><td>Gửi thư</td><td class="m">href="mailto:a@b.vn"</td></tr></table></div>''')

N2['k3']=sec('p4','BÀI 10 · 2','Liên kết trong website: các trường hợp','''<div class="card"><h3>1 · Cùng thư mục</h3><p>Chỉ cần tên tệp. Từ <b>index.html</b> tới <b>thong_tin.html</b>:</p><pre class="code" style="margin-top:6px">&lt;a href="thong_tin.html"&gt;Giới thiệu&lt;/a&gt;</pre></div>
<div class="card"><h3>2 · Thư mục con, một cấp</h3><p>Tên thư mục, dấu <b>/</b>, tên tệp. Từ <b>index.html</b> tới <b>bai_tap_1.html</b>:</p><pre class="code" style="margin-top:6px">&lt;a href="bai_tap/bai_tap_1.html"&gt;Bài 1&lt;/a&gt;</pre></div>
<div class="card"><h3>3 · Thư mục con, hai cấp trở lên</h3><p>Liệt kê lần lượt từ trên xuống, ngăn bằng <b>/</b>:</p><pre class="code" style="margin-top:6px;font-size:calc(19px*var(--z,1))">&lt;a href="bai_tap/on_tap/bai_tap_on_tap.html"&gt;Ôn tập&lt;/a&gt;</pre></div>
<div class="card"><h3>4 · Lên thư mục mẹ: ../</h3><p>Mỗi <b>../</b> lùi một mức. Từ <b>bai_tap_1.html</b> về <b>index.html</b>:</p><pre class="code" style="margin-top:6px">&lt;a href="../index.html"&gt;Trang chủ&lt;/a&gt;</pre><p style="margin-top:6px">Từ <b>bai_tap_on_tap.html</b> về index: <code>../../index.html</code></p></div>''','g2" style="grid-template-rows:1fr 1fr')

N2['k4']=sec('p4','BÀI 10 · 3','Thực hành: liên kết cùng trang và sang trang khác','''<div class="col"><div class="lab">Nhiệm vụ 1 · liên kết cùng trang</div>'''+code('''<table id="CLBTT" border="1">
  <caption>Lịch hoạt động các CLB
    Thể thao</caption>
  ...
</table>
...
<a href="#CLBTT">Theo dõi lịch hoạt
động các CLB Thể thao</a>''',18)+'''<div class="ok"><p><b>Hai bước:</b> đặt <code>id</code> duy nhất cho bảng, rồi viết <code>href="#CLBTT"</code>. Nháy vào liên kết, trang cuộn tới bảng.</p></div></div>
<div class="col"><div class="lab">Nhiệm vụ 2 · sang trang khác và danh sách liên kết</div>'''+code('''<ul>
  <li><a href="bai_tap_1.html">Bài tập 1</a></li>
  <li><a href="bai_tap_2.html">Bài tập 2</a></li>
  <li><a href="bai_tap_on_tap.html">Ôn tập</a></li>
</ul>''',18)+res('<ul><li style="color:#1565C0;text-decoration:underline">Bài tập 1</li><li style="color:#1565C0;text-decoration:underline">Bài tập 2</li><li style="color:#1565C0;text-decoration:underline">Ôn tập</li></ul>')+'''<div class="key">Từ <b>thong_tin.html</b> quay về trang chủ cùng thư mục: <code>&lt;a href="CLB.html"&gt;Về trang chủ&lt;/a&gt;</code></div></div>''')
