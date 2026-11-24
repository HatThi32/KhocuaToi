# -*- coding: utf-8 -*-
# --- split dense slides ---
N2['b82']=sec('p3','BÀI 8 · THỰC HÀNH','Thực hành: Hình 8.3 (mã và kết quả)','''<div class="col">'''+code('''<h1>Biện luận số nghiệm của
 phương trình bậc 2</h1>
<h2><span style="color:red">Bài toán:</span>
 ax<sup>2</sup> + bx + c = 0</h2>
<h2>Cách làm:</h2>
<p>B<sub>1</sub>: Xác định a, b, c</p>
<p>B<sub>2</sub>: Tính delta = b<sup>2</sup> - 4ac</p>
<p>B<sub>3</sub>: Kết luận<br>
+ Nếu delta &lt; 0: vô nghiệm<br>
+ Nếu delta = 0: nghiệm kép</p>''',20)+'''</div><div class="col">'''+res('''<div style="font-family:Georgia,serif"><div style="font-size:28px;font-weight:700">Biện luận số nghiệm của phương trình bậc 2</div><div style="font-size:24px;font-weight:700;margin:6px 0"><span style="color:red">Bài toán:</span> ax<sup>2</sup> + bx + c = 0</div><div style="font-size:24px;font-weight:700">Cách làm:</div><div style="font-size:22px;margin-top:6px">B<sub>1</sub>: Xác định a, b, c<br>B<sub>2</sub>: Tính delta = b<sup>2</sup> - 4ac<br>B<sub>3</sub>: Kết luận<br>+ Nếu delta &lt; 0: vô nghiệm<br>+ Nếu delta = 0: nghiệm kép</div></div>''')+'''</div>''')
N2['b82b']=sec('p3','BÀI 8 · THỰC HÀNH','Phân tích đề để chọn thẻ','''<div class="col"><table><tr><th>Thành phần</th><th>Thẻ</th></tr><tr><td>Dòng 1 (tiêu đề cao nhất)</td><td class="m">h1</td></tr><tr><td>Dòng 2, 3 (tiêu đề thấp hơn)</td><td class="m">h2</td></tr><tr><td>Ba bước làm</td><td class="m">3 thẻ p</td></tr><tr><td>Số mũ, chỉ số dưới</td><td class="m">sup, sub</td></tr><tr><td>Đổi màu một cụm chữ</td><td class="m">span + style</td></tr><tr><td>Xuống dòng trong đoạn</td><td class="m">br</td></tr></table></div>
<div class="col"><div class="key">Ba dòng bắt đầu bằng <b>“+ Nếu…”</b> chỉ <b>xuống dòng</b>, không có khoảng cách trước và sau, nên <b>không phải đoạn riêng</b>: chúng nằm trong đoạn B<sub>3</sub>, ngăn bằng thẻ <code>br</code>.</div>
<div class="ok"><p><b>Quy trình:</b> (1) xác định thành phần văn bản; (2) chọn thẻ tiêu đề cho các dòng đầu; (3) mỗi đoạn một thẻ <code>p</code>; (4) bổ sung <code>sup</code>, <code>sub</code>, <code>strong</code>, <code>br</code> khi cần.</p></div></div>''')

N2['l1a']=sec('p7','BÀI 9 · 1','Danh sách có thứ tự: thẻ ol','''<div class="col">'''+code('''<ol type="i" start="3">
  <li>Nếu <b>delta</b> &lt; 0: ...</li>
  <li>Nếu <b>delta</b> = 0: ...</li>
  <li>Nếu <b>delta</b> &gt; 0: ...</li>
</ol>''',20)+res('<ol type="i" start="3"><li>Nếu <b style="color:#000">delta</b> &lt; 0: ...</li><li>Nếu <b style="color:#000">delta</b> = 0: ...</li><li>Nếu <b style="color:#000">delta</b> &gt; 0: ...</li></ol>')+'''<div class="key"><code>start</code> là <b>số bắt đầu</b> đánh (ở đây 3, kiểu i nên hiện iii).</div></div>
<div class="col"><table><tr><th>type</th><th>Kiểu đánh</th></tr><tr><td class="m">"1"</td><td>1, 2, 3 (mặc định)</td></tr><tr><td class="m">"a"</td><td>a, b, c</td></tr><tr><td class="m">"A"</td><td>A, B, C</td></tr><tr><td class="m">"i"</td><td>i, ii, iii</td></tr><tr><td class="m">"I"</td><td>I, II, III</td></tr></table><div class="warn"><code>ol</code> và <code>ul</code> chỉ chứa các thẻ <code>li</code>; mỗi mục là một <code>li</code>.</div></div>''')
N2['l1b']=sec('p7','BÀI 9 · 1','Danh sách không có thứ tự: thẻ ul','''<div class="col">'''+code('''<ul style="list-style-type: square">
  <li>Nếu delta &lt; 0: ...</li>
  <li>Nếu delta = 0: ...</li>
  <li>Nếu delta &gt; 0: ...</li>
</ul>''',20)+res('<ul style="list-style-type:square"><li>Nếu delta &lt; 0: ...</li><li>Nếu delta = 0: ...</li><li>Nếu delta &gt; 0: ...</li></ul>')+'''</div>
<div class="col"><table><tr><th>list-style-type</th><th>Kí tự đầu dòng</th></tr><tr><td class="m">disc</td><td>chấm tròn đặc ●</td></tr><tr><td class="m">circle</td><td>vòng tròn rỗng ○</td></tr><tr><td class="m">square</td><td>hình vuông ■</td></tr><tr><td class="m">none</td><td>không có kí tự</td></tr></table><div class="key">Kí tự đầu dòng đặt bằng <b>list-style-type</b> trong thuộc tính <b>style</b> của thẻ ul.</div></div>''')

N2['l2a']=sec('p7','BÀI 9 · 1','Danh sách mô tả: dl, dt, dd','''<div class="col">'''+code('''<dl>
  <dt>Kem</dt>
  <dd>Món ăn ngọt, dạng
      đông lạnh.</dd>
  <dt>Trà sữa</dt>
  <dd>Đồ uống làm từ trà
      và sữa.</dd>
</dl>''',20)+'''</div><div class="col">'''+res('<dl><dt>Kem</dt><dd>Món ăn ngọt, dạng đông lạnh.</dd><dt>Trà sữa</dt><dd>Đồ uống làm từ trà và sữa.</dd></dl>')+'''<table><tr><th>Thẻ</th><th>Vai trò</th></tr><tr><td class="m">dl</td><td>bao toàn bộ danh sách</td></tr><tr><td class="m">dt</td><td>tên mục (thuật ngữ, nhãn)</td></tr><tr><td class="m">dd</td><td>mô tả của mục đó</td></tr></table></div>''')
N2['l2b']=sec('p7','BÀI 9 · 1','Danh sách lồng nhau','''<div class="col">'''+code('''<ol>
  <li>Thể thao
    <ol type="a">
      <li>Bóng đá</li>
      <li>Bơi</li>
    </ol>
  </li>
  <li>Nghệ thuật</li>
</ol>''',20)+'''</div><div class="col">'''+res('<ol><li>Thể thao<ol type="a"><li>Bóng đá</li><li>Bơi</li></ol></li><li>Nghệ thuật</li></ol>')+'''<div class="key">Danh sách con đặt <b>bên trong thẻ li</b> của mục cha (trước <code>&lt;/li&gt;</code>). Mức 1 đánh 1, 2, 3; mức 2 dùng <code>type="a"</code> để đánh a, b, c.</div></div>''')

N2['tb2a']=sec('p7','BÀI 9 · 2','Định dạng bảng: tiêu đề, khung, kích thước','''<div class="col"><table><tr><th>Việc cần làm</th><th>Cách viết</th></tr>
<tr><td>Tiêu đề bảng</td><td class="m">&lt;caption&gt;</td></tr>
<tr><td>Khung viền</td><td class="m">border: 1px solid black</td></tr>
<tr><td>Chiều rộng, cao</td><td class="m">width:80%; height:400px</td></tr></table>
<div class="warn">Nên dùng <b>%</b> cho kích thước, tránh <b>px</b>: thiết bị hiển thị có số điểm ảnh khác nhau nên bảng có thể không hiển thị như mong đợi.</div></div>
<div class="col"><div class="card"><h3>Thuộc tính border</h3><p>Ba phần, cách nhau bằng dấu cách:</p><p><code>độ dày</code> · <code>kiểu viền</code> · <code>màu</code></p><ul style="gap:3px"><li>Kiểu: <b>solid, dotted, double, none</b>.</li><li>Màu mặc định là đen, có thể bỏ qua.</li></ul></div>'''+code('''<table style="width:80%;
  border:1px solid blue">''',20)+'''</div>''')
N2['tb2b']=sec('p7','BÀI 9 · 2','Gộp ô: rowspan và colspan','''<div class="col">'''+code('''<table border="1">
 <tr>
  <th rowspan="2">Họ và tên</th>
  <th colspan="3">Điểm thi</th>
 </tr>
 <tr>
  <th>Toán</th><th>Vật lí</th>
  <th>Hoá học</th>
 </tr>
</table>''',19)+'''</div><div class="col">'''+res('<table class="rt"><tr><th rowspan="2">Họ và tên</th><th colspan="3">Điểm thi</th></tr><tr><th>Toán</th><th>Vật lí</th><th>Hoá học</th></tr></table>')+'''<div class="key"><b>rowspan</b> gộp các hàng, <b>colspan</b> gộp các cột. Lưới 2 hàng × 4 cột; hàng 2 chỉ viết <b>3 ô</b> vì ô “Họ và tên” đã chiếm cột 1.</div></div>''')

N2['tb4']=sec('p7','BÀI 9 · 3','Thực hành 2: bảng lịch hoạt động','''<div class="col"><div class="lab">Hai hàng đầu (gộp ô)</div>'''+code('''<table border="1">
 <caption>Lịch hoạt động
   CLB Thể thao</caption>
 <tr>
  <th rowspan="2">Bộ môn</th>
  <th rowspan="2">GV phụ trách</th>
  <th colspan="5">Ngày</th>
 </tr>
 <tr><th>Thứ 2</th> ...
     <th>Thứ 6</th></tr>''',19)+'''<div class="key">Hàng 1: 3 ô (<b>rowspan 2, rowspan 2, colspan 5</b>); hàng 2: <b>5 ô</b>; mỗi hàng dữ liệu: <b>7 ô td</b>. Bảng có 7 hàng, 7 cột.</div></div><div class="col">'''+res('<table class="rt"><caption style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#000">Lịch hoạt động CLB Thể thao</caption><tr><th rowspan="2">Bộ môn</th><th rowspan="2">GV phụ trách</th><th colspan="5">Ngày</th></tr><tr><th>Thứ 2</th><th>Thứ 3</th><th>Thứ 4</th><th>Thứ 5</th><th>Thứ 6</th></tr><tr><td>Bóng đá</td><td>Thầy Hùng</td><td>x</td><td></td><td>x</td><td></td><td>x</td></tr><tr><td>Bóng chuyền</td><td>Cô Lan</td><td></td><td>x</td><td></td><td>x</td><td></td></tr><tr><td>Karatedo</td><td>Thầy Hoàng</td><td>x</td><td></td><td></td><td>x</td><td></td></tr><tr><td>Taekwondo</td><td>Thầy Đức</td><td></td><td>x</td><td></td><td></td><td>x</td></tr><tr><td>Vovinam</td><td>Thầy Thắng</td><td>x</td><td>x</td><td></td><td></td><td></td></tr></table>')+'''</div>''')

N2['k4']=sec('p4','BÀI 10 · 3','Thực hành 1: liên kết trong cùng trang','''<div class="col">'''+code('''<table id="CLBTT" border="1">
  <caption>Lịch hoạt động
    các CLB Thể thao</caption>
  ...
</table>
...
<a href="#CLBTT">Theo dõi lịch
  hoạt động các CLB Thể thao</a>''',20)+'''</div><div class="col"><div class="ok"><p><b>Hai bước:</b></p><ol style="gap:4px"><li>Đặt thuộc tính <code>id="CLBTT"</code> (duy nhất) cho bảng đích.</li><li>Viết liên kết <code>href="#CLBTT"</code> ở nơi cần nhấn.</li></ol></div><div class="key">Nháy vào liên kết, trang <b>cuộn tới bảng</b> có id tương ứng. Giá trị href phải có dấu <b>#</b> ở đầu.</div></div>''')
N2['k5']=sec('p4','BÀI 10 · 3','Thực hành 2: liên kết sang trang khác','''<div class="col"><div class="lab">Trang chủ CLB.html</div>'''+code('''<ul>
  <li><a href="thong_tin.html">
    Thông tin các CLB</a></li>
  <li><a href="bai_tap_1.html">
    Bài tập 1</a></li>
</ul>''',20)+res('<ul><li style="color:#1565C0;text-decoration:underline">Thông tin các CLB</li><li style="color:#1565C0;text-decoration:underline">Bài tập 1</li></ul>')+'''</div><div class="col"><div class="lab">Trang thong_tin.html (quay về)</div>'''+code('<a href="CLB.html">Về trang chủ</a>',20)+'''<div class="ok"><p>Hai tệp <b>cùng thư mục</b> nên chỉ cần tên tệp. Nếu ở thư mục con thì thêm <code>../</code> để lùi một mức.</p></div></div>''')

# ---- fixes round 2 ----
N2['k1']=sec('p4','BÀI 10 · 1','Đường dẫn tuyệt đối và tương đối','''<div class="col"><table><tr><th></th><th>Tuyệt đối</th><th>Tương đối</th></tr>
<tr><td><b>Giao thức, tên miền</b></td><td>Có đầy đủ</td><td>Không có</td></tr>
<tr><td><b>Dùng khi</b></td><td>liên kết tới website <b>khác</b> (liên kết ngoài)</td><td>liên kết tới tài liệu <b>cùng website</b> (liên kết trong)</td></tr>
<tr><td><b>Ví dụ</b></td><td class="m">https://www.nxbgd.vn/</td><td class="m">BT/bai_tap_1.html</td></tr>
<tr><td><b>Đặc điểm</b></td><td>chính xác nhưng dài</td><td>ngắn; chuyển cả website sang nơi khác vẫn đúng</td></tr></table>
<div style="display:grid;grid-template-columns:1.1fr 1fr;gap:16px"><div class="card"><h3>SGK: phân loại đường dẫn</h3><ul style="gap:4px"><li><code>html/cach tao lien ket.html</code>: <b>tương đối</b>.</li><li><code>http://google.com</code>: <b>tuyệt đối</b>.</li><li><code>mail.google.com/mail/u/0/#inbox/…</code>: <b>tương đối</b> (không có giao thức ở đầu).</li></ul></div>
<div class="warn">Viết <code>href="www.google.com"</code> (thiếu <code>https://</code>) là <b>sai</b>: trình duyệt tìm tệp tên “www.google.com” trong website hiện tại và báo lỗi.</div></div></div>''','g1')
N2['k2']=sec('p4','BÀI 10 · 2','Liên kết ngoài: tới trang web khác','''<div class="col"><div class="card"><h3>Liên kết ngoài</h3><p>Liên kết từ một trang web tới trang web khác trên Internet. Dùng thẻ <code>a</code> với <b>đường dẫn tuyệt đối</b> trong <code>href</code>.</p></div>'''+code('''<p>
 <a href="https://hanhtrangso.nxbgd.vn
 /sach-dien-tu?book_active=9">
  Sách điện tử Kết nối tri thức
  với cuộc sống
 </a>
</p>''',19)+'''</div><div class="col">'''+res('<span style="font-family:Georgia,serif;font-size:25px;color:#1565C0;text-decoration:underline">Sách điện tử Kết nối tri thức với cuộc sống</span>')+'''<div class="ok"><p><b>Khi nháy chuột</b> vào liên kết, trình duyệt gọi tới trang web Sách điện tử và hiển thị nội dung trang đó.</p></div>
<table><tr><th>Mở rộng</th><th>Cách viết</th></tr><tr><td>Mở ở tab mới</td><td class="m">target="_blank"</td></tr><tr><td>Gửi thư</td><td class="m">href="mailto:a@b.vn"</td></tr></table></div>''')
N2['k3']=N2['k3'].replace('<pre class="code" style="margin-top:6px;font-size:calc(19px*var(--z,1))">&lt;a href="bai_tap/on_tap/bai_tap_on_tap.html"&gt;Ôn tập&lt;/a&gt;</pre>','<pre class="code" style="margin-top:6px;font-size:calc(18px*var(--z,1))">&lt;a href="bai_tap/on_tap/\nbai_tap_on_tap.html"&gt;Ôn tập&lt;/a&gt;</pre>')
N2['k4']=N2['k4'].replace('''<div class="key">Nháy vào liên kết''','''<div class="warn">Giá trị <code>id</code> phải <b>duy nhất</b> trong cả trang (mã định danh đoạn); hai phần tử trùng id làm liên kết nhảy sai chỗ.</div><div class="key">Nháy vào liên kết''')
N2['l2a']=N2['l2a'].replace('</table></div>','</table><div class="key">Mặc định <code>dd</code> được <b>thụt vào</b> so với <code>dt</code>.</div></div>')
N2['tb2b']=N2['tb2b'].replace('</div></div>','</div><div class="ok"><p><b>Cách đếm:</b> số ô cần viết ở một hàng = số cột của bảng − số ô bị gộp từ hàng trên xuống.</p></div></div>',1) if False else N2['tb2b']
N2['tb2b']=N2['tb2b'].rstrip()[:-len('</div></section>')].rstrip()[:-len('</div>')]+'''</div><div class="ok"><p><b>Cách đếm:</b> số ô cần viết ở một hàng = số cột của bảng − số ô bị gộp từ các hàng trên xuống cột đó.</p></div></div></section>'''
