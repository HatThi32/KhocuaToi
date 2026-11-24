# -*- coding: utf-8 -*-
def esc(s): return s.replace('&','&amp;').replace('<','&lt;').replace('>','&gt;')
def qrow(n,text,cd=None,ans=False,fs=20):
    c=''
    if cd: c='<pre class="code" style="margin:6px 0 0;font-size:calc(%dpx*var(--z,1))">%s</pre>'%(fs,esc(cd))
    return '<div class="q%s"><div class="n">%s</div><div style="flex:1;min-width:0"><p>%s</p>%s</div></div>'%(' a' if ans else '',n,text,c)
def qslides(cls,tag,title,items,ans=False,per=3,start=1,fs=20):
    out=[];n=start
    chunks=[items[i:i+per] for i in range(0,len(items),per)]
    for ci,ch in enumerate(chunks):
        body=''.join(qrow(n+k,(it[0]),(it[1] if len(it)>1 else None),ans,fs) for k,it in enumerate(ch))
        n+=len(ch)
        out.append('<section class="s %s"><div class="hd"><span class="k">%s</span><h1>%s</h1></div>\n<div class="bd g1" style="gap:10px;align-content:start">%s</div></section>'%(cls,tag,title+(' (%d)'%(ci+1) if len(chunks)>1 else ''),body))
    return out
def card(t,inner): return '<div class="card"><h3>%s</h3>%s</div>'%(t,inner)
def ul(items,gap=4): return '<ul style="gap:%dpx">%s</ul>'%(gap,''.join('<li>%s</li>'%i for i in items))
def S2(cls,tag,title,left,right,lay='g2'):
    return '<section class="s %s"><div class="hd"><span class="k">%s</span><h1>%s</h1></div>\n<div class="bd %s"><div class="col">%s</div><div class="col">%s</div></div></section>'%(cls,tag,title,lay,left,right)
def goals(cls,tag,can,outline):
    return S2(cls,tag,'Mục tiêu và nội dung bài',card('Sau bài học, em có thể',ul(can,6)),card('Nội dung bộ slide',ul(outline,5))+'<div class="key">Học theo thứ tự: <b>kiến thức</b> → <b>trọng tâm</b> → <b>bài tập củng cố</b> → <b>bài khó HSG</b>.</div>')
def T(cd): return '<table>'+cd+'</table>'
def tr(*c,h=False,m=False):
    t='th' if h else 'td'
    return '<tr>'+''.join('<%s%s>%s</%s>'%(t,(' class="m"' if (m and i==0 and not h) else ''),x,t) for i,x in enumerate(c))+'</tr>'
D={}   # deck key -> dict(extra sections)

# ===================== NỀN =====================
c='p0'
D['n']=dict(
 goals=goals(c,'MỞ ĐẦU',['Phân biệt <b>Internet, Web, website</b>.','Phân tích <b>các thành phần của URL</b>.','Mô tả các bước <b>trình duyệt tải một trang web</b>.','Đọc <b>mã trạng thái HTTP</b> (200, 301, 404, 500).','Phân biệt <b>trang tĩnh</b> và <b>trang động</b>.'],['Web, trang web, website','URL và tên miền','Trình duyệt tải trang','Trang tĩnh và động','Trọng tâm và kiến thức nâng cao','Bài tập luyện HSG và đáp án']),
 key=S2(c,'TRỌNG TÂM','Những điều phải nhớ',card('Ghi nhớ',ul(['<b>Internet</b> là hệ thống mạng; <b>Web</b> là dịch vụ chạy trên Internet.','<b>URL</b> = giao thức + tên miền + [cổng] + đường dẫn + [?truy vấn] + [#mảnh].','<b>DNS</b> đổi tên miền thành địa chỉ IP.','Trình duyệt gửi <b>yêu cầu HTTP</b>; máy chủ trả <b>mã trạng thái</b> và nội dung.'],6)),
   T(tr('Mã','Ý nghĩa',h=True)+tr('200','Thành công',m=True)+tr('301','Chuyển hướng vĩnh viễn',m=True)+tr('404','Không tìm thấy tài nguyên',m=True)+tr('500','Lỗi phía máy chủ',m=True))+'<div class="warn">Phần <code>#mảnh</code> <b>không</b> được gửi lên máy chủ; chỉ trình duyệt dùng nó để nhảy tới phần tử có <code>id</code>.</div>'),
 adv=S2(c,'NÂNG CAO','URL đầy đủ và phương thức HTTP',
   '<pre class="code" style="overflow-wrap:anywhere;font-size:calc(20px*var(--z,1))">'+esc('https://tin.edu.vn:8443/lop12/bai.html?id=5&k=a#muc2')+'</pre>'+T(tr('Thành phần','Giá trị',h=True)+tr('Giao thức','https',m=True)+tr('Tên miền','tin.edu.vn',m=True)+tr('Cổng','8443',m=True)+tr('Đường dẫn','/lop12/bai.html',m=True)+tr('Truy vấn','id=5&amp;k=a (2 tham số)',m=True)+tr('Mảnh','muc2',m=True)),
   card('Kiến thức mở rộng',ul(['Cổng mặc định: <b>http 80</b>, <b>https 443</b> (nên không cần viết).','Truy vấn gồm các cặp <b>tên=giá trị</b> ngăn bằng <b>&amp;</b>.','<b>GET</b>: dữ liệu nằm trên URL, ai cũng thấy; <b>POST</b>: dữ liệu gửi trong thân yêu cầu.','<b>HTTPS</b> = HTTP có mã hoá, an toàn hơn khi gửi mật khẩu.'],6))),
 q=[('Tách URL <code>https://tin.edu.vn:8443/lop12/bai.html?id=5&amp;k=a#muc2</code>: giao thức, tên miền, cổng, đường dẫn, truy vấn, mảnh. Truy vấn có mấy tham số?',),
    ('Sắp xếp đúng thứ tự: (a) Trình duyệt hiển thị trang; (b) Gửi yêu cầu HTTP tới máy chủ; (c) DNS đổi tên miền ra địa chỉ IP; (d) Máy chủ trả mã trạng thái và nội dung; (e) Người dùng nhập URL.',),
    ('Đúng hay sai: (a) Web và Internet là một. (b) Phần <code>#muc2</code> được gửi lên máy chủ. (c) Mã 404 cho biết máy chủ không tìm thấy tài nguyên. (d) Trang tĩnh chỉ đổi nội dung khi người quản trị sửa tệp.',),
    ('Trang hiển thị “Xin chào, &lt;tên người đăng nhập&gt;” là tĩnh hay động? Vì sao? Trang giới thiệu cố định của trường thì sao?',),
    ('Gõ <code>http://tin.edu.vn/lop12</code> không nêu cổng thì trình duyệt dùng cổng nào? Với <code>https</code> thì sao?',),
    ('Phân biệt mã <b>301</b> và <b>404</b>: người dùng thấy gì?',)],
 a=[('Giao thức <b>https</b>; tên miền <b>tin.edu.vn</b>; cổng <b>8443</b>; đường dẫn <b>/lop12/bai.html</b>; truy vấn <b>id=5&amp;k=a</b> (<b>2</b> tham số); mảnh <b>muc2</b>.',),
    ('<b>e → c → b → d → a</b>: nhập URL, DNS tìm IP, gửi yêu cầu HTTP, máy chủ phản hồi, hiển thị.',),
    ('(a) <b>Sai</b>: Web là dịch vụ chạy trên Internet. (b) <b>Sai</b>: mảnh chỉ trình duyệt dùng. (c) <b>Đúng</b>. (d) <b>Đúng</b>.',),
    ('<b>Động</b>: nội dung thay đổi theo người dùng, do máy chủ tạo khi có yêu cầu. Trang giới thiệu cố định là <b>tĩnh</b>.',),
    ('Cổng <b>80</b> cho http và <b>443</b> cho https.',),
    ('<b>301</b>: trang đã chuyển vĩnh viễn, trình duyệt tự đi tới địa chỉ mới. <b>404</b>: không tìm thấy, người dùng thấy trang báo lỗi.',)])

# ===================== BÀI 7 =====================
c='p2'
dom='''<body>
  <h1>A</h1>
  <p>B <b>C</b></p>
  <ul><li>D</li><li>E</li></ul>
</body>'''
D['b7']=dict(
 goals=goals(c,'BÀI 7',['Phân biệt <b>thẻ, phần tử, thuộc tính</b>.','Viết <b>cấu trúc HTML5 tối thiểu</b>.','Đọc <b>cây phần tử</b>: cha, con, anh em.','Dùng <b>thực thể</b> &amp;lt; &amp;gt; &amp;amp;.','<b>Đếm phần tử</b>, dự đoán hiển thị.'],['Trang web và ngôn ngữ HTML','Cấu trúc tài liệu, cây phần tử','Soạn thảo và lịch sử HTML','Trọng tâm và nâng cao','Bài tập, bài khó HSG và đáp án']),
 key=S2(c,'TRỌNG TÂM','Những điều phải nhớ',card('Ghi nhớ',ul(['Phần tử = <b>thẻ mở + nội dung + thẻ đóng</b>.','<b>Thẻ rỗng</b> (br, hr, img, meta) không có thẻ đóng.','<code>&lt;!DOCTYPE html&gt;</code> <b>không</b> phải phần tử.','<code>html</code> chứa <code>head</code> và <code>body</code>; <code>title</code> nằm trong <code>head</code>.','Thẻ lồng nhau phải đóng đúng thứ tự: <b>mở sau, đóng trước</b>.'],6)),
   T(tr('Muốn hiển thị','Viết',h=True)+tr('&lt;','&amp;lt;',m=True)+tr('&gt;','&amp;gt;',m=True)+tr('&amp;','&amp;amp;',m=True)+tr('Dấu cách cứng','&amp;nbsp;',m=True))+'<div class="warn">Nhiều dấu cách và xuống dòng trong mã nguồn chỉ hiển thị thành <b>một</b> dấu cách.</div>'),
 adv=S2(c,'NÂNG CAO','Cây DOM và những điều dễ nhầm','<pre class="code" style="font-size:calc(20px*var(--z,1))">'+esc(dom)+'</pre>'+card('Đọc cây',ul(['<code>body</code> có <b>3 con trực tiếp</b>: h1, p, ul.','<b>6 hậu duệ</b>: h1, p, b, ul, li, li.','Hai <code>li</code> là <b>anh em</b>; <code>b</code> là cháu của body.','Chữ (văn bản) <b>không</b> tính là phần tử.'],4)),
   card('Bẫy hay gặp',ul(['Tên thẻ <b>không phân biệt hoa thường</b>, nhưng nên viết thường.','Thiếu <code>DOCTYPE</code>: trình duyệt hiển thị theo chế độ cũ (tương thích).','<code>&lt;meta charset="UTF-8"&gt;</code> để hiển thị đúng tiếng Việt.','Chú thích <code>&lt;!-- --&gt;</code> không hiển thị nhưng vẫn nằm trong mã.','Trình duyệt tự sửa lỗi nhẹ nên mã sai vẫn chạy, nhưng <b>không chuẩn</b>.'],6))),
 q=[('Đếm số <b>phần tử</b> của trang:',"<html><head><title>T</title></head>\n<body><h1>A</h1><p>B <b>C</b></p>\n<ul><li>D</li><li>E</li></ul></body></html>"),
    ('Với mã trên: <code>body</code> có bao nhiêu con trực tiếp, bao nhiêu hậu duệ? Cây có mấy mức (html là mức 1)?',),
    ('Trình duyệt hiển thị gì:',"<p>Xin     chào\n      các   bạn</p>"),
    ('Trình duyệt hiển thị gì: <code>&lt;p&gt;a &amp;lt; b &amp;amp;&amp;amp; c &amp;gt; d&lt;/p&gt;</code>',),
    ('Tìm ít nhất <b>2 lỗi</b>:',"<html><body><title>Trang</title>\n<p>Chào <b>các <i>bạn</b></i></p></body></html>"),
    ('Đúng hay sai: (a) <code>&lt;br&gt;</code> cần thẻ đóng <code>&lt;/br&gt;</code>. (b) <code>&lt;!DOCTYPE html&gt;</code> là một phần tử. (c) Nội dung <code>title</code> hiển thị trong thân trang. (d) Đặt <code>p</code> trực tiếp trong <code>body</code> là hợp lệ.',)],
 a=[('<b>10</b> phần tử: html, head, title, body, h1, p, b, ul, li, li.',),
    ('<b>3</b> con trực tiếp (h1, p, ul); <b>6</b> hậu duệ (h1, p, b, ul, li, li); cây có <b>4 mức</b> (html, body, ul, li).',),
    ('<b>Xin chào các bạn</b> trên <b>một dòng</b>: dấu cách và xuống dòng liên tiếp gộp thành một.',),
    ('<b>a &lt; b &amp;&amp; c &gt; d</b>.',),
    ('(1) <code>title</code> phải nằm trong <code>head</code>, thiếu <code>head</code>. (2) Lồng sai: phải <code>&lt;i&gt;bạn&lt;/i&gt;&lt;/b&gt;</code>. (Thiếu cả DOCTYPE.)',),
    ('(a) <b>Sai</b>: br là thẻ rỗng. (b) <b>Sai</b>. (c) <b>Sai</b>: hiện trên thanh tab. (d) <b>Đúng</b>.',)])

# ===================== BÀI 8 =====================
c='p3'
D['b8']=dict(
 goals=goals(c,'BÀI 8',['Dùng <b>thuộc tính</b> của thẻ.','Dùng <b>h1–h6, p, div, span, br, hr</b>.','Dùng thẻ <b>kiểu chữ</b> (strong, em, sub, sup…).','Đặt <b>màu, phông, cỡ chữ</b> bằng <code>style</code>.','Phân biệt <b>khối</b> và <b>dòng</b>.'],['Thuộc tính thẻ','Tiêu đề, đoạn, khối','Thẻ kiểu chữ (Bảng 8.1)','Phông chữ bằng style','Trọng tâm, nâng cao','Bài tập, bài khó HSG và đáp án']),
 key=S2(c,'TRỌNG TÂM','Những điều phải nhớ',card('Ghi nhớ',ul(['Thuộc tính viết trong <b>thẻ mở</b>: <code>tên="giá trị"</code>.','<code>h1</code> lớn nhất, mỗi trang <b>một h1</b>; chọn mức theo <b>cấu trúc</b>.','<code>p</code> là khối; <b>không</b> chứa h, ul, div. <code>div</code> khối, <code>span</code> dòng.','<code>strong, em</code> có <b>ý nghĩa</b>; <code>b, i</code> chỉ đổi hình thức.'],6)),
   T(tr('Thuộc tính CSS','Tác dụng',h=True)+tr('color','màu chữ',m=True)+tr('font-family','phông chữ',m=True)+tr('font-size','cỡ chữ (px)',m=True)+tr('text-decoration','gạch chân, gạch ngang',m=True))+'<div class="warn">Trong <code>style</code>: dùng <b>:</b> giữa tên và giá trị, dùng <b>;</b> giữa các khai báo. Không dùng <b>=</b> hay <b>,</b>.</div>'),
 adv=S2(c,'NÂNG CAO','Thừa kế và cách ghi giá trị',
   '<pre class="code" style="font-size:calc(19px*var(--z,1))">'+esc('<p style="color:red; font-size:20px">\n  Tin <span style="color:blue">học</span> 12\n</p>')+'</pre><div class="res"><span class="lab">Kết quả hiển thị</span><div style="font-family:Georgia,serif;font-size:26px;color:red">Tin <span style="color:blue">học</span> 12</div></div><div class="key"><code>span</code> đặt màu riêng nhưng <b>thừa kế</b> cỡ chữ 20px của <code>p</code>.</div>',
   card('Cách ghi giá trị',ul(['Màu: <code>red</code>, <code>rgb(255,0,0)</code>, <code>#FF0000</code>.','Cỡ chữ: <b>px</b>, <b>%</b>, <b>em</b> hoặc small, medium, large.','Tên phông có dấu cách đặt trong nháy đơn: <code>font-family:\'Times New Roman\'</code>.','Có thể liệt kê phông dự phòng: <code>Tahoma, Arial, sans-serif</code>.'],6))+'<div class="warn">Thiếu <b>đơn vị</b> (<code>font-size:20</code>) thì khai báo bị bỏ qua.</div>'),
 q=[('Đọc mã: mỗi từ <b>Tin, học, 12</b> có màu gì, cỡ chữ bao nhiêu?',"<p style=\"color:red; font-size:20px\">\n Tin <span style=\"color:blue\">học</span> 12</p>"),
    ('Trang hiển thị bao nhiêu dòng và nội dung từng dòng?',"<p>A</p><p>B<br>C</p>\n<div>D</div><span>E</span><span>F</span>"),
    ('Tìm <b>2 lỗi</b>:',"<p style=\"color=red; font-size:20\">Chào</p>"),
    ('Đúng hay sai: (a) Dùng <code>h1</code> thay <code>h2</code> để chữ lớn hơn là hợp lý. (b) <code>strong</code> nhấn mạnh về ý nghĩa. (c) <code>p</code> có thể chứa <code>h2</code>. (d) <code>style="color:red; font-size:18px"</code> hợp lệ.',),
    ('Viết mã để hiển thị <b>H₂O và x²</b> và nhấn mạnh từ “rất” trong câu “Môn Tin học rất hay”.',),
    ('Phân biệt <code>&lt;p&gt;</code> và <code>&lt;br&gt;</code>. Vì sao ba dòng “+ Nếu delta…” của Hình 8.3 không phải ba đoạn?',)],
 a=[('<b>Tin đỏ, học xanh, 12 đỏ</b>; cả ba cùng <b>20px</b> (span thừa kế cỡ chữ).',),
    ('<b>5 dòng</b>: A / B / C / D / <b>EF</b> (hai span nằm cùng dòng).',),
    ('(1) <code>color=red</code> phải là <code>color:red</code>. (2) <code>font-size:20</code> thiếu đơn vị <code>px</code>.',),
    ('(a) <b>Sai</b>: chọn mức tiêu đề theo cấu trúc, chỉnh cỡ bằng style. (b) <b>Đúng</b>. (c) <b>Sai</b>. (d) <b>Đúng</b>.',),
    ('<code>H&lt;sub&gt;2&lt;/sub&gt;O và x&lt;sup&gt;2&lt;/sup&gt;</code>; <code>Môn Tin học &lt;em&gt;rất&lt;/em&gt; hay</code>.',),
    ('<code>p</code> tạo <b>đoạn</b> có khoảng cách trên, dưới; <code>br</code> chỉ <b>xuống dòng</b> (thẻ rỗng). Ba dòng đó dùng <code>br</code> nên không có khoảng cách.',)])

# ===================== BÀI 9 =====================
c='p7'
tb='''<table border="1">
<tr><th rowspan="2">A</th>
    <th colspan="2">B</th></tr>
<tr><td>1</td><td>2</td></tr>
<tr><td>3</td><td>4</td><td>5</td></tr>
</table>'''
D['b9']=dict(
 goals=goals(c,'BÀI 9',['Tạo <b>danh sách</b> ol, ul, dl, danh sách lồng nhau.','Tạo <b>bảng</b> với table, tr, th, td, caption.','Đặt <b>khung, kích thước</b> cho bảng.','<b>Gộp ô</b> bằng rowspan, colspan.','Đếm ô, đọc kết quả của bảng gộp.'],['Danh sách có thứ tự, không thứ tự','Danh sách mô tả, danh sách lồng','Bảng và định dạng bảng','Thực hành CLB','Trọng tâm, nâng cao, bài khó HSG']),
 key=S2(c,'TRỌNG TÂM','Những điều phải nhớ',card('Ghi nhớ',ul(['<code>ol</code>: có thứ tự (<code>type</code>, <code>start</code>); <code>ul</code>: không thứ tự (<code>list-style-type</code>); <code>dl</code>: <code>dt</code> tên, <code>dd</code> mô tả.','Mỗi mục là <code>li</code>; danh sách con đặt <b>trong li</b>.','Bảng: <code>table</code> &gt; <code>tr</code> &gt; <code>th/td</code>.','<code>caption</code> đặt <b>ngay sau</b> <code>table</code>.','<b>rowspan</b> gộp hàng, <b>colspan</b> gộp cột.'],6)),
   T(tr('type','Kiểu số',h=True)+tr('"1"','1, 2, 3',m=True)+tr('"a" / "A"','a, b / A, B',m=True)+tr('"i" / "I"','i, ii / I, II',m=True))+'<div class="warn"><code>li</code> đặt ngoài <code>ol/ul</code>, hoặc <code>td</code> đặt ngoài <code>tr</code> là <b>sai</b>.</div>'),
 adv=S2(c,'NÂNG CAO','Đếm ô khi gộp',
   '<pre class="code" style="font-size:calc(19px*var(--z,1))">'+esc(tb)+'</pre>'+'<div class="res"><span class="lab">Kết quả hiển thị</span><table class="rt"><tr><th rowspan="2">A</th><th colspan="2">B</th></tr><tr><td>1</td><td>2</td></tr><tr><td>3</td><td>4</td><td>5</td></tr></table></div>',
   card('Quy tắc đếm',ul(['Số cột = tổng <b>colspan</b> trên một hàng đầy đủ (ở đây <b>3</b>).','Ô viết ở một hàng = số cột <b>trừ</b> số ô bị <b>rowspan</b> từ hàng trên chiếm.','Hàng 2 chỉ viết <b>2 td</b> vì A đã chiếm cột 1.','Bảng 3 hàng × 3 cột: <b>7 ô viết</b> (2 th, 5 td).'],6))+'<div class="key">SGK dùng <b>CSS</b> để bố cục trang; bảng chỉ để trình bày dữ liệu dạng hàng, cột.</div>'),
 q=[('Với mã bảng sau, cho biết số hàng, số cột, số thẻ <code>th</code>, số thẻ <code>td</code>:',tb),
    ('Trình duyệt hiển thị danh sách như thế nào:',"<ol type=\"a\" start=\"2\"><li>X</li>\n<li>Y<ul><li>Z</li></ul></li></ol>"),
    ('Bảng 4 hàng × 5 cột: hàng 1 chỉ một <code>th colspan="5"</code>; hàng 2 có 5 <code>th</code>; hàng 3, 4 mỗi hàng 5 <code>td</code>. Tổng số thẻ <code>th</code> và <code>td</code>?',),
    ('Đúng hay sai: (a) <code>li</code> đặt trực tiếp trong <code>div</code>. (b) <code>dt</code> là mô tả, <code>dd</code> là tên mục. (c) <code>th</code> mặc định đậm, căn giữa. (d) <code>caption</code> đặt trước <code>tr</code> đầu tiên.',),
    ('Tìm lỗi:',"<ul><li>A</li><li>B<ul><li>C</li></ul></ul>\n<table><td>1</td></table>"),
    ('Bảng 2 cột: hàng 1 là <code>&lt;th rowspan="3"&gt;A&lt;/th&gt;&lt;th&gt;B&lt;/th&gt;</code>. Hàng 2 và hàng 3 mỗi hàng cần mấy ô? Viết thừa thì sao?',)],
 a=[('<b>3 hàng, 3 cột</b>; <b>2 th</b> (A, B) và <b>5 td</b> (1, 2, 3, 4, 5).',),
    ('<b>b. X</b> / <b>c. Y</b> với mục con <b>• Z</b> thụt vào (danh sách ul lồng trong mục Y).',),
    ('<b>16 thẻ</b>: 1 + 5 th, 10 td.',),
    ('(a) <b>Sai</b>. (b) <b>Sai</b>: dt là tên, dd là mô tả. (c) <b>Đúng</b>. (d) <b>Đúng</b>.',),
    ('(1) Thiếu <code>&lt;/li&gt;</code> đóng mục B sau danh sách con. (2) <code>td</code> phải nằm trong <code>tr</code>.',),
    ('Mỗi hàng cần <b>1 ô</b> (cho cột 2). Viết 2 ô thì ô thừa bị đẩy sang <b>cột 3</b>, bảng lệch.',)])

# ===================== BÀI 10 =====================
c='p4'
tree='''web/
├─ index.html
├─ thong_tin.html
├─ images/
│   └─ sun.png
└─ bai_tap/
    ├─ bai_tap_1.html
    ├─ bai_tap_2.html
    └─ on_tap/
        └─ bai_tap_on_tap.html'''
D['b10']=dict(
 goals=goals(c,'BÀI 10',['Giải thích <b>siêu văn bản, siêu liên kết</b>.','Phân biệt <b>đường dẫn tuyệt đối</b> và <b>tương đối</b>.','Viết liên kết <b>ngoài</b>, <b>trong</b>, <b>cùng trang</b>, <b>ảnh</b>.','Dùng <code>../</code> đúng số mức.','Phát hiện lỗi đường dẫn.'],['Siêu văn bản và thẻ a','Tuyệt đối và tương đối','Các trường hợp liên kết trong','Liên kết cùng trang, liên kết ảnh','Trọng tâm, nâng cao, bài khó HSG']),
 key=S2(c,'TRỌNG TÂM','Những điều phải nhớ',card('Ghi nhớ',ul(['<code>&lt;a href="URL"&gt;nội dung&lt;/a&gt;</code>, giá trị trong <b>nháy kép</b>.','<b>Tuyệt đối</b>: có giao thức, tên miền; dùng cho website khác.','<b>Tương đối</b>: không có giao thức; dùng trong cùng website.','Cùng thư mục: <b>tên tệp</b>. Con: <b>thư_mục/tệp</b>. Lên một mức: <b>../</b>.','Cùng trang: đặt <code>id</code> rồi <code>href="#id"</code>.'],6)),
   T(tr('Từ → Tới','Viết href',h=True)+tr('index → thong_tin','thong_tin.html',m=True)+tr('index → bai_tap_1','bai_tap/bai_tap_1.html',m=True)+tr('bai_tap_1 → index','../index.html',m=True))+'<div class="warn">Dùng <b>/</b> ngăn cấp thư mục, không dùng <b>\\</b>. Quên <code>https://</code> thì thành đường dẫn tương đối.</div>'),
 adv=S2(c,'NÂNG CAO','Các dạng href mở rộng',
   card('Giá trị href',ul(['<code>bai2.html#muc3</code>: tới vị trí <b>trong trang khác</b>.','<code>mailto:a@b.vn</code>: soạn thư. <code>tel:0912345678</code>: gọi.','<code>target="_blank"</code>: mở <b>tab mới</b>.','Số cụm <code>../</code> = số mức cần lùi.'],6)),
   card('Bẫy',ul(['<b>id phân biệt hoa thường</b>: <code>#muc2</code> không nhảy tới <code>id="Muc2"</code>.','Tên tệp trên máy chủ Linux cũng phân biệt hoa thường.','Tên tệp có dấu cách dễ lỗi: dùng <code>_</code> hoặc viết <code>%20</code>.','Thuộc tính của <code>a</code> là <b>href</b>, của <code>img</code> là <b>src</b>.'],6))),
 tree=tree,
 q=[('Từ <code>bai_tap_on_tap.html</code>, viết đường dẫn tới <code>sun.png</code>.',),
    ('Từ <code>bai_tap_on_tap.html</code>, viết đường dẫn tới <code>index.html</code> và tới <code>bai_tap_2.html</code>.',),
    ('Từ <code>index.html</code>, viết liên kết “Ôn tập” tới <code>bai_tap_on_tap.html</code>.',),
    ('Phân loại tuyệt đối / tương đối: (a) <code>images/sun.png</code> (b) <code>https://tin.vn/a.html</code> (c) <code>../index.html</code> (d) <code>www.tin.vn</code>',),
    ('Tìm lỗi mỗi dòng:',"(a) <a src=\"bai1.html\">Bài 1</a>\n(b) <a href=\"#muc2\">…</a> ... <h2 id=\"Muc2\">\n(c) <a href=\"bai_tap\\bai_tap_1.html\">"),
    ('Trang ở <code>web/bai_tap/on_tap/</code> cần mấy cụm <code>../</code> để tới thư mục <code>web</code>?',)],
 a=[('<code>../../images/sun.png</code>: lùi 2 mức (on_tap, bai_tap) rồi vào images.',),
    ('<code>../../index.html</code> và <code>../bai_tap_2.html</code>.',),
    ('<code>&lt;a href="bai_tap/on_tap/bai_tap_on_tap.html"&gt;Ôn tập&lt;/a&gt;</code>',),
    ('(a) <b>tương đối</b>; (b) <b>tuyệt đối</b>; (c) <b>tương đối</b>; (d) <b>tương đối</b> (thiếu giao thức nên trình duyệt coi là tên tệp).',),
    ('(a) dùng <code>src</code> thay vì <code>href</code>. (b) <code>muc2</code> khác <code>Muc2</code> (hoa/thường). (c) dùng <code>\\</code> thay vì <code>/</code>.',),
    ('<b>2</b> cụm: <code>../../</code>.',)])

# ===================== BÀI 11 =====================
c='p5'
D['b11']=dict(
 goals=goals(c,'BÀI 11',['Chèn <b>ảnh</b> với <code>img</code>, dùng <code>alt</code>.','Chèn <b>âm thanh, video</b> với <code>audio, video, source</code>.','Nhúng trang bằng <b>iframe</b>.','Chọn đúng thẻ cho từng nhu cầu.','Phát hiện lỗi thuộc tính, thiếu <code>controls</code>.'],['Ảnh với img','Âm thanh, video','Khung nội tuyến iframe','Trọng tâm, nâng cao','Bài tập Bài 10–11, bài khó HSG']),
 key=S2(c,'TRỌNG TÂM','Những điều phải nhớ',card('Ghi nhớ',ul(['<code>img</code> là thẻ <b>rỗng</b>: <code>src</code>, <code>alt</code>, <code>width</code>, <code>height</code>.','<code>alt</code> hiện khi ảnh lỗi, giúp người khiếm thị.','<code>audio/video</code> cần <code>controls</code> mới có thanh điều khiển.','<code>source</code> khai báo nhiều định dạng; <code>poster</code> chỉ cho video.','<code>iframe src</code> nhúng một trang web vào khung.'],6)),
   T(tr('Thẻ','Dùng để',h=True)+tr('a','chuyển sang trang khác',m=True)+tr('img','hiện ảnh',m=True)+tr('audio, video','phát phương tiện',m=True)+tr('iframe','hiện trang khác trong khung',m=True))+'<div class="warn">Viết nhầm <code>scr</code> thay <code>src</code>: ảnh không hiện, chỉ hiện chữ <b>alt</b>.</div>'),
 adv=S2(c,'NÂNG CAO','Ảnh, phương tiện và khung nhúng',
   card('Ảnh',ul(['Chỉ đặt <b>một</b> trong width/height thì ảnh giữ tỉ lệ.','JPEG: ảnh chụp. PNG: nền trong suốt. SVG: vector. GIF: ảnh động.','Ảnh làm liên kết: <code>&lt;a href="…"&gt;&lt;img …&gt;&lt;/a&gt;</code>.'],6)),
   card('Video, audio, iframe',ul(['<code>autoplay</code> thường bị chặn trừ khi có <code>muted</code>.','Trình duyệt chọn <b>source đầu tiên</b> mà nó chạy được.','Chữ giữa thẻ chỉ hiện khi trình duyệt <b>không hỗ trợ</b>.','Một số trang <b>cấm nhúng</b> nên iframe trống.'],6))),
 q=[('Tìm lỗi mỗi dòng:',"(a) <img src=\"a.png\"></img>\n(b) <img href=\"a.png\">\n(c) <video src=\"v.mp4\"></video>"),
    ('Ảnh a.png bị lỗi tải: trang hiển thị gì?',"<img src=\"a.png\" alt=\"Mặt Trời\" width=\"200\">"),
    ('Đúng hay sai: (a) Thiếu <code>controls</code> thì không hiện thanh điều khiển. (b) Có thể khai báo nhiều <code>source</code>. (c) <code>iframe</code> dùng thuộc tính <code>href</code>. (d) Trang nào cũng nhúng được bằng iframe.',),
    ('Viết mã chèn video <code>bai.mp4</code> (dự phòng <code>bai.webm</code>), rộng 480, có điều khiển, kèm câu báo khi không hỗ trợ.',),
    ('Cho ảnh <code>images/sun.png</code> rộng 100, có chữ thay thế, làm liên kết tới <code>thong_tin.html</code>.',),
    ('Chọn thẻ: (a) phát nhạc nền; (b) hiện bản đồ của trang khác; (c) ảnh bìa trước khi phát.',)],
 a=[('(a) <code>img</code> là thẻ rỗng, không có <code>&lt;/img&gt;</code>. (b) dùng <code>src</code>. (c) thiếu <code>controls</code>.',),
    ('Hiện chữ <b>Mặt Trời</b> (nội dung <code>alt</code>) thay cho ảnh.',),
    ('(a) <b>Đúng</b>. (b) <b>Đúng</b>. (c) <b>Sai</b>: dùng <code>src</code>. (d) <b>Sai</b>: nhiều trang cấm nhúng.',),
    ('<code>&lt;video controls width="480"&gt;&lt;source src="bai.mp4" type="video/mp4"&gt;&lt;source src="bai.webm" type="video/webm"&gt;Trình duyệt không hỗ trợ.&lt;/video&gt;</code>',),
    ('<code>&lt;a href="thong_tin.html"&gt;&lt;img src="images/sun.png" width="100" alt="Mặt Trời"&gt;&lt;/a&gt;</code>',),
    ('(a) <b>audio</b>; (b) <b>iframe</b>; (c) thuộc tính <b>poster</b> của <b>video</b>.',)])

# ===================== TỔNG HỢP =====================
c='p6'
big='''<html><head><title>Lop 12</title></head>
<body>
 <h1>Tin 12</h1>
 <p>Xem <a href="bai2.html">bài 2</a> hay
    <a href="#cuoi">cuối trang</a>.</p>
 <ol type="a"><li>Web</li><li>HTML</li></ol>
 <table border="1"><tr><th colspan="2">Diem</th></tr>
  <tr><td>8</td><td>9</td></tr></table>
 <p id="cuoi">Hết<br>trang</p>
</body></html>'''
D['t']=dict(
 code=big,
 q=[('Trang có bao nhiêu <b>phần tử</b>?',),('<code>body</code> có bao nhiêu <b>con trực tiếp</b>?',),('Danh sách hiển thị thế nào?',),('Bảng có mấy hàng, mấy cột?',),('Nháy “cuối trang” thì xảy ra điều gì?',),('Đoạn cuối hiển thị mấy dòng?',)],
 a=[('<b>19</b> phần tử: html, head, title, body, h1, p, a, a, ol, li, li, table, tr, th, tr, td, td, p, br.',),
    ('<b>5</b> con: h1, p, ol, table, p.',),
    ('<b>a. Web</b> và <b>b. HTML</b> (đánh chữ cái thường).',),
    ('<b>2 hàng, 2 cột</b> (ô th gộp 2 cột).',),
    ('Trang <b>cuộn</b> tới đoạn có <code>id="cuoi"</code>.',),
    ('<b>2 dòng</b>: “Hết” và “trang” (do thẻ br).',)])
