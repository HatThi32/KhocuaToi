# -*- coding: utf-8 -*-
N={}
N['n1']='''<section class="s p2"><div class="hd"><span class="k">BÀI 7 · 1</span><h1>Trang web và ngôn ngữ HTML</h1></div>
<div class="bd g2">
<div class="col"><pre class="code" style="font-size:calc(20px*var(--z,1))">&lt;!DOCTYPE html&gt;
&lt;html&gt;
&lt;head&gt;
  &lt;title&gt;Tên trang Web&lt;/title&gt;
&lt;/head&gt;
&lt;body&gt;
  &lt;div&gt;
    &lt;h1&gt;Trang Web và HTML&lt;/h1&gt;
    &lt;p&gt;Đây là dòng đầu tiên&lt;/p&gt;
    &lt;hr&gt; &lt;!-- dòng kẻ ngang --&gt;
    &lt;p&gt;Đây là dòng cuối cùng&lt;/p&gt;
  &lt;/div&gt;
&lt;/body&gt;
&lt;/html&gt;</pre>
<div class="key">SGK Hình 7.1 · Tệp văn bản này là <b>trang nguồn</b> (mã nguồn) của trang web; trình duyệt đọc nó rồi hiển thị.</div></div>
<div class="col"><div class="card"><h3>Hai khái niệm dễ nhầm</h3><ul style="gap:5px"><li><b>Thẻ (tag)</b>: kí tự đánh dấu nằm trong <b>&lt; &gt;</b>, ví dụ <code>&lt;p&gt;</code>, <code>&lt;/p&gt;</code>.</li><li><b>Phần tử (element)</b>: thẻ bắt đầu + nội dung + thẻ kết thúc. Thẻ đơn cùng nội dung của nó cũng là phần tử.</li></ul></div>
<div class="ok"><p><b>Đếm phần tử ở Hình 7.1:</b> html, head, title, body, div, h1, p, hr, p = <b>9</b>.<br>Dòng <code>&lt;!DOCTYPE html&gt;</code> <b>không</b> phải phần tử. Chú thích là phần tử đặc biệt (SGK).</p></div>
<div class="warn">Trang html là tệp văn bản đuôi <code>.html</code> hoặc <code>.htm</code>. Phần mềm hiển thị nó là <b>trình duyệt</b>.</div></div>
</div></section>'''
N['n5']='''<section class="s p2"><div class="hd"><span class="k">BÀI 7 · 3</span><h1>Soạn thảo HTML và lịch sử HTML</h1></div>
<div class="bd g2">
<div class="col"><table><tr><th>Phần mềm</th><th>Đặc điểm</th></tr>
<tr><td><b>Notepad</b></td><td>Có sẵn trên Windows, soạn thảo không định dạng (macOS: TextEdit)</td></tr>
<tr><td><b>Notepad++</b></td><td>Miễn phí, mã nguồn mở; chọn <code>Language → H → HTML</code></td></tr>
<tr><td><b>Sublime Text</b></td><td>Bản cơ bản miễn phí; chọn <code>View → Syntax → HTML</code></td></tr>
<tr><td><b>Trang trực tuyến</b></td><td>Cần máy tính có kết nối Internet</td></tr></table>
<div class="key">Lưu tệp với đuôi <b>.html</b> rồi mở bằng trình duyệt để xem kết quả.</div></div>
<div class="col"><svg viewBox="0 0 560 330"><path d="M40 70 V290" stroke="#0B2545" stroke-width="6"/>
<g font-size="22"><circle cx="40" cy="70" r="14" fill="#F2A900" stroke="#0B2545" stroke-width="3"/><text x="70" y="64" font-weight="800" fill="#00695C">Những năm 1990</text><text x="70" y="92" fill="#0B2545">Tim Berners-Lee (CERN) đề xuất</text>
<circle cx="40" cy="160" r="14" fill="#F2A900" stroke="#0B2545" stroke-width="3"/><text x="70" y="154" font-weight="800" fill="#00695C">Cuối năm 1991</text><text x="70" y="182" fill="#0B2545">Phiên bản đầu tiên “Các thẻ HTML”</text>
<circle cx="40" cy="250" r="14" fill="#C62828" stroke="#0B2545" stroke-width="3"/><text x="70" y="244" font-weight="800" fill="#C62828">Năm 2014</text><text x="70" y="272" fill="#0B2545">HTML5 – phiên bản hiện tại</text></g></svg>
<div class="ok"><p>Ý tưởng ban đầu: một chuẩn chung để <b>thể hiện và chia sẻ văn bản</b> trong CERN. Cụm từ “hypertext” (siêu văn bản) xuất hiện lần đầu trong sơ đồ này.</p></div></div>
</div></section>'''
N['n7']='''<section class="s p3"><div class="hd"><span class="k">BÀI 8 · 1</span><h1>Thuộc tính của thẻ</h1></div>
<div class="bd g2">
<div class="col"><div class="card"><h3>Khái niệm</h3><p>Thuộc tính bổ sung thông tin, làm rõ cách xử lí của thẻ. Mọi phần tử HTML đều <b>có thể</b> có thuộc tính.</p></div>
<div class="card"><h3>Cú pháp</h3><pre class="code" style="font-size:calc(20px*var(--z,1))">&lt;tên_thẻ tt1="giá trị 1" tt2="giá trị 2"&gt;
  Nội dung
&lt;/tên_thẻ&gt;</pre></div>
<ul><li>Thuộc tính nằm trong <b>thẻ bắt đầu</b>, sau tên thẻ; không nằm trong thẻ kết thúc.</li><li>Nhiều thuộc tính ngăn cách bằng <b>dấu cách</b>.</li></ul></div>
<div class="col"><pre class="code">&lt;p style="color: red"&gt;Đoạn chữ đỏ.&lt;/p&gt;
&lt;video controls&gt;&lt;/video&gt;</pre>
<div class="res"><span class="lab">Kết quả hiển thị</span><p style="color:red;font-family:Georgia,serif">Đoạn chữ đỏ.</p></div>
<div class="key"><b>style</b> là thuộc tính dùng thường xuyên nhất: đặt màu, phông chữ, cỡ chữ, kiểu chữ, căn lề, khung… cho đúng phần tử đó.</div>
<div class="warn">Thuộc tính <b>boolean</b> (như <code>controls</code>, <code>autoplay</code>) chỉ cần viết tên, không cần giá trị.</div></div>
</div></section>'''
N['n8']='''<section class="s p3"><div class="hd"><span class="k">BÀI 8 · 2</span><h1>Tiêu đề, đoạn văn, khối: h, p, div, span</h1></div>
<div class="bd g2">
<div class="col"><pre class="code" style="font-size:calc(19px*var(--z,1))">&lt;h1&gt;Tin học 12&lt;/h1&gt;
&lt;h2&gt;Phần chung&lt;/h2&gt;
&lt;h3&gt;Chủ đề 1. Máy tính và xã hội&lt;/h3&gt;
&lt;h4&gt;1. Trí tuệ nhân tạo&lt;/h4&gt;</pre>
<div class="res"><span class="lab">Kết quả hiển thị</span><div style="font-family:Georgia,serif"><div style="font-size:30px;font-weight:700">Tin học 12</div><div style="font-size:24px;font-weight:700">Phần chung</div><div style="font-size:20px;font-weight:700">Chủ đề 1. Máy tính và xã hội</div><div style="font-size:17px;font-weight:700">1. Trí tuệ nhân tạo</div></div></div>
<div class="key"><code>&lt;hx&gt;</code>: x từ 1 đến 6, tầm quan trọng <b>giảm dần</b>. <code>h1</code> dùng cho tiêu đề chính. Công cụ tìm kiếm dùng thẻ này để xác định cấu trúc trang.</div></div>
<div class="col"><table><tr><th>Thẻ</th><th>Tác dụng (SGK)</th></tr>
<tr><td class="m">p</td><td>Đoạn văn: hiển thị <b>trên dòng mới</b>, có khoảng trống nhỏ trước và sau. <b>Không</b> chứa tiêu đề, danh sách, phần tử khối khác.</td></tr>
<tr><td class="m">div</td><td>Khối chứa nội dung bất kì, bắt đầu trên <b>dòng mới</b>.</td></tr>
<tr><td class="m">span</td><td>Giống div nhưng quy mô nhỏ, hiển thị <b>cùng dòng</b>.</td></tr>
<tr><td class="m">br</td><td>Ngắt xuống dòng (thẻ đơn).</td></tr>
<tr><td class="m">hr</td><td>Đường kẻ ngang (thẻ đơn).</td></tr></table>
<div class="warn"><code>div</code>, <code>span</code> không có hình thức riêng, được định dạng bằng thuộc tính <code>style</code>. Gõ Enter trong mã <b>không</b> tạo đoạn mới.</div></div>
</div></section>'''
N['n9']='''<section class="s p3"><div class="hd"><span class="k">BÀI 8 · 3</span><h1>Định dạng phông chữ bằng style</h1></div>
<div class="bd g2">
<div class="col"><table><tr><th>Cần</th><th>Cách viết</th></tr>
<tr><td>Màu chữ</td><td class="m">style="color: red"</td></tr>
<tr><td>Phông chữ</td><td class="m">style="font-family: Tahoma"</td></tr>
<tr><td>Cỡ chữ</td><td class="m">style="font-size: 18px"</td></tr>
<tr><td>Gạch chân</td><td class="m">text-decoration: underline</td></tr></table>
<ul><li>Cỡ chữ: số kèm đơn vị (<b>px, mm, cm</b>…) hoặc <b>small, medium, large</b>.</li><li>Màu: tên tiếng Anh (red, green, blue…) hoặc hệ <b>RGB</b>: <code>rgb(255,6,6)</code>.</li><li>Nhiều định dạng: các cặp <code>tên: giá trị</code> ngăn cách bằng <b>dấu “;”</b>.</li></ul></div>
<div class="col"><pre class="code" style="font-size:calc(20px*var(--z,1))">&lt;p style="color:red; font-family:Tahoma;
   font-size:20px; text-decoration:underline"&gt;
  Môn Tin học rất hay.
&lt;/p&gt;</pre>
<div class="res"><span class="lab">Kết quả hiển thị</span><p style="color:red;font-family:Tahoma,Arial;font-size:22px;text-decoration:underline">Môn Tin học rất hay.</p></div>
<div class="key">HTML5 <b>không</b> hỗ trợ thẻ <code>&lt;big&gt;</code>; SGK khuyên dùng <code>font-size</code> và <code>text-decoration</code> trong <code>style</code> thay cho <code>&lt;big&gt;</code>, <code>&lt;u&gt;</code>.</div></div>
</div></section>'''
N['n10']='''<section class="s p3"><div class="hd"><span class="k">BÀI 8</span><h1>Bài tập củng cố</h1></div>
<div class="bd g1" style="gap:10px">
<div class="q"><div class="n">1</div><p>Viết mã để chữ “Tin học” <b>đậm</b>, màu đỏ, cỡ 20px.</p></div>
<div class="q"><div class="n">2</div><p><code>&lt;p&gt;Môn &lt;em&gt;Tin học&lt;/em&gt; rất hay.&lt;/p&gt;</code> nhấn mạnh vào từ nào? Khác gì với <code>&lt;em&gt;rất&lt;/em&gt;</code>?</p></div>
<div class="q"><div class="n">3</div><p>Phân biệt <code>strong</code> với <code>b</code>; <code>p</code> với <code>div</code>.</p></div>
<div class="q"><div class="n">4</div><p>Mã gồm 5 thẻ <code>p</code> liên tiếp, thẻ <code>p</code> thứ ba có một <code>&lt;br&gt;</code> ở giữa. Hiển thị mấy dòng?</p></div>
<div class="q"><div class="n">5</div><p>Muốn thêm đường kẻ ngang giữa tiêu đề và nội dung, dùng thẻ nào?</p></div>
</div></section>'''
N['n11']='''<section class="s p3"><div class="hd"><span class="k">BÀI 8</span><h1>Đáp án chi tiết</h1></div>
<div class="bd g1" style="gap:10px">
<div class="q a"><div class="n">1</div><p><code>&lt;p style="color:red; font-size:20px"&gt;&lt;strong&gt;Tin học&lt;/strong&gt;&lt;/p&gt;</code></p></div>
<div class="q a"><div class="n">2</div><p>Câu 1 nhấn mạnh <b>“Tin học”</b> (môn nào); câu 2 nhấn mạnh <b>“rất”</b> (mức độ).</p></div>
<div class="q a"><div class="n">3</div><p><b>strong</b>: đậm và nhấn mạnh <b>ngữ nghĩa</b> (khuyến khích dùng); <b>b</b>: chỉ in đậm. <b>p</b>: đoạn văn, không chứa phần tử khối; <b>div</b>: khối chứa nội dung bất kì.</p></div>
<div class="q a"><div class="n">4</div><p>5 đoạn → mỗi đoạn một dòng, riêng đoạn 3 có <code>br</code> thành 2 dòng → <b>6 dòng</b>; giữa các đoạn có khoảng cách.</p></div>
<div class="q a"><div class="n">5</div><p>Thẻ đơn <code>&lt;hr&gt;</code>.</p></div>
</div></section>'''
N['n12']='''<section class="s p3"><div class="hd"><span class="k">BÀI 10 · 2</span><h1>Liên kết trong cùng trang và liên kết ảnh</h1></div>
<div class="bd g2">
<div class="col"><div class="card"><h3>Hai bước (như “cắm cờ”)</h3><ol style="gap:4px"><li>Đặt thuộc tính <b>id</b> tại vị trí đích.</li><li>Tạo liên kết <code>href="#mã_định_danh"</code>.</li></ol></div>
<pre class="code">&lt;table id="Thong_tin"&gt; ... &lt;/table&gt;
&lt;a href="#Thong_tin"&gt;Thông tin chi tiết&lt;/a&gt;</pre>
<div class="key">id phải <b>duy nhất</b> trong cả trang (mã định danh đoạn).</div></div>
<div class="col"><pre class="code">&lt;a href="thong_tin.html"&gt;
  &lt;img src="images/sun.png"&gt;
&lt;/a&gt;</pre>
<div class="res"><span class="lab">Kết quả hiển thị</span><div style="display:flex;gap:12px;align-items:center"><svg viewBox="0 0 80 80" style="width:80px"><circle cx="40" cy="40" r="22" fill="#FFB300"/></svg><span style="font-family:Georgia,serif;font-size:21px">Nháy vào ảnh Mặt Trời → mở <b>thong_tin.html</b></span></div></div>
<div class="warn">Ảnh dùng <b>đường dẫn tương đối</b> để tránh lỗi khi ảnh trên mạng bị đổi. Liên kết còn trỏ được tới <b>ảnh, âm thanh, video, tệp PDF</b>, không chỉ trang HTML.</div></div>
</div></section>'''
