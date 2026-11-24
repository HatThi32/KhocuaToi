# -*- coding: utf-8 -*-
D={}
def lesson(id,t,tags,intro,steps,traps,tip,minutes=5):
    D[id]=dict(t=t,tags=tags,intro=intro,steps=steps,traps=traps,tip=tip,min=minutes)
S=lambda h,p,fig=None,code=None,run=False,lang=None,note=None:dict(h=h,p=p,fig=fig,code=code,run=run,lang=lang,note=note)
# ================= WEB =================
lesson('css_uutien','CSS: ai thắng khi nhiều quy tắc cùng chọn một phần tử?',['css-uutien','css-specificity','css-ke-thua','css'],
 'Bạn hay nhầm vì cứ nghĩ "quy tắc viết sau luôn thắng" hoặc "nhiều lớp thì thắng một id". Thực ra trình duyệt xét theo một thang bậc cố định, và chỉ khi hai quy tắc ngang nhau mới nhìn đến thứ tự viết.',
 [S('Thang bậc ưu tiên',['Trình duyệt xét từ trên xuống. Gặp tầng nào phân được thắng bại thì dừng, không xét tầng sau.','Tầng 3 (trọng số bộ chọn) là nơi hay xảy ra nhầm lẫn nhất nên ta học kĩ ở bước sau.'],'css_uutien'),
  S('Tính trọng số: cộng dồn từng phần',['Mỗi id (#) được 100, mỗi lớp (.), lớp giả (:hover), thuộc tính ([type]) được 10, mỗi tên thẻ và phần tử giả (::first-line) được 1. Các ký hiệu *, >, +, ~ không có điểm.','Tính xong thì so sánh con số: lớn hơn thì thắng. Con số này CỘNG DỒN nên 11 lớp = 110 vẫn lớn hơn 1 id = 100.'],'css_trongso'),
  S('Ví dụ từng bước',['Cho HTML: <p id="b" class="a">Xin chào</p> và CSS: p {color:blue} .a {color:green} #b {color:red}.','Trọng số: p = 1, .a = 10, #b = 100 → #b thắng, chữ đỏ. Dù viết .a sau cùng, nó vẫn chỉ có 10 điểm.','Nếu thêm .a {color:black !important} thì chữ đen: !important đứng tầng 1, thắng mọi trọng số.'],None,'p {color:blue}\n.a {color:green}\n#b {color:red}\n/* <p id="b" class="a"> → chữ màu đỏ */',False,'css'),
  S('Bằng nhau thì sao?',['Khi hai trọng số bằng nhau (ví dụ .box p = 11 và p.note = 11) thì quy tắc viết SAU thắng.','Thuộc tính style="…" trong thẻ luôn thắng quy tắc dùng bộ chọn (trừ !important). Kế thừa (như color từ thẻ cha) là yếu nhất: quy tắc nhắm trực tiếp vào phần tử luôn thắng giá trị kế thừa.'],None)],
 [['Quy tắc viết sau luôn thắng.','Chỉ thắng khi cùng trọng số (và cùng tầng ưu tiên).'],['Nhiều lớp đánh bại được id.','Cộng dồn: 11 lớp = 110 > 100, nhưng 9 lớp = 90 < 100. Hãy tính ra số.'],['Quên cộng tên thẻ trong bộ chọn con cháu (ul li a = 3).','Mỗi tên thẻ được 1 điểm.']],
 'Mẹo nhớ "1-10-100": thẻ – lớp – id. Gặp bài so sánh, hãy viết ra tổng điểm của từng bộ chọn trước khi trả lời.')
lesson('css_box','CSS: mô hình hộp (margin – border – padding – content)',['css-box'],
 'Bạn hay nhầm vì khó hình dung phần nào nằm trong, phần nào nằm ngoài viền, và vì sao lề dọc "biến mất" một phần.',
 [S('Bốn lớp của một hộp',['Mỗi phần tử là một chiếc hộp gồm 4 lớp, từ trong ra ngoài: content (nội dung) → padding (đệm) → border (viền) → margin (lề).','Padding nằm TRONG viền và có màu nền của phần tử; margin nằm NGOÀI viền và trong suốt.'],'css_box'),
  S('Tính bề rộng',['Mặc định (content-box): width chỉ là bề rộng nội dung. Bề rộng chiếm chỗ = width + 2×padding + 2×border.','Ví dụ width 300px, padding 20px, border 5px → 300 + 40 + 10 = 350px (margin tính thêm bên ngoài).','Với box-sizing: border-box thì width đã gồm cả padding và border: nội dung chỉ còn 300 − 40 − 10 = 250px.'],None),
  S('Lề dọc liền kề thì gộp',['Hai khối nằm trên dưới nhau, margin-bottom 40px của khối trên và margin-top 25px của khối dưới KHÔNG cộng thành 65px. Chúng gộp lại và lấy số lớn hơn: khoảng cách là 40px.','Lề ngang (trái/phải) không gộp.'],None),
  S('Viết tắt padding và margin',['4 giá trị: trên – phải – dưới – trái (theo chiều kim đồng hồ). 2 giá trị: trên/dưới rồi trái/phải. 1 giá trị: cả bốn phía.','margin: 0 auto trên khối có width cố định sẽ căn khối ra giữa theo chiều ngang.'],None,'padding: 5px 10px 15px 20px; /* trên phải dưới trái */\nmargin: 10px 20px;           /* trên-dưới 10, trái-phải 20 */',False,'css')],
 [['Margin nằm trong viền.','Margin ở NGOÀI viền; trong viền là padding.'],['Lề dọc liền kề cộng dồn.','Gộp lại, lấy giá trị lớn hơn.'],['width là tổng bề rộng của hộp.','Chỉ đúng khi box-sizing: border-box.']],
 'Nhớ thứ tự bằng câu: "Nội – Đệm – Viền – Lề" (từ trong ra). Gặp bài tính kích thước, hãy vẽ nhanh bốn lớp rồi cộng từng lớp.')
lesson('css_selector','CSS: bộ chọn – chọn đúng phần tử',['css-selector','css-pseudo'],
 'Bạn hay nhầm giữa dấu cách (con cháu) với dấu > (con trực tiếp), hay giữa ".a .b" và ".a.b".',
 [S('Đọc bộ chọn từ phải sang trái',['Bộ chọn "div.box p" nghĩa là: phần tử p NẰM TRONG (ở mọi cấp) một div có lớp box. Phần tử được chọn luôn là phần tử đứng cuối cùng.'],'css_tree'),
  S('Bảng các quan hệ',['A B : B là con cháu của A (mọi cấp). A > B : B là con TRỰC TIẾP của A. A + B : B đứng liền ngay sau A. A ~ B : mọi B cùng cấp đứng sau A. A, B : chọn cả A lẫn B.','.a.b (viết liền): CÙNG MỘT phần tử có cả hai lớp a và b. .a .b (có dấu cách): phần tử lớp b nằm trong phần tử lớp a.'],None),
  S('Lớp giả và phần tử giả',['Lớp giả viết MỘT dấu hai chấm: a:hover (đang trỏ chuột), li:first-child (là con đầu của cha), a:link (liên kết chưa thăm).','Phần tử giả viết HAI dấu hai chấm: p::first-line (dòng đầu), p::first-letter (chữ cái đầu).'],None),
  S('Thử với ví dụ',['Cho <div><p>1</p><span><p>2</p></span></div>. Bộ chọn div > p chỉ chọn đoạn 1 (đoạn 2 là cháu). Bộ chọn div p chọn cả hai đoạn.'],None,'div > p { color: red; }   /* chỉ đoạn 1 */\ndiv p   { color: blue; }  /* cả đoạn 1 và 2 */',False,'css')],
 [['div p và div > p giống nhau.','Dấu cách: mọi cấp; dấu >: chỉ con trực tiếp.'],['.a .b và .a.b giống nhau.','Có dấu cách là hai phần tử khác nhau; viết liền là một phần tử.'],['p:first-line (một dấu :).','Phần tử giả cần hai dấu: p::first-line.']],
 'Quy tắc đọc: luôn đọc từ phải sang trái để biết phần tử nào bị chọn.')
lesson('css_flex','CSS: Flexbox, định vị và đơn vị',['css-khung'],
 'Bạn hay nhầm justify-content với align-items, và nhầm các kiểu position.',
 [S('Hai trục của Flexbox',['Trục chính là hướng các mục xếp hàng: với flex-direction: row là ngang, với column là dọc. Trục phụ vuông góc với trục chính.','justify-content căn theo trục CHÍNH; align-items căn theo trục PHỤ. Đổi flex-direction thì hai trục đổi vai trò.'],'css_flex'),
  S('Các kiểu position',['relative: dịch so với vị trí gốc của chính nó. absolute: định vị theo tổ tiên gần nhất có position khác static (không có thì theo trang). fixed: gắn với khung nhìn, đứng yên khi cuộn.'],None),
  S('Đơn vị tương đối',['em tính theo cỡ chữ của phần tử cha (cha 20px, con 1.5em → 30px). rem tính theo cỡ chữ gốc của html (html 16px, 2rem → 32px). % tính theo kích thước phần tử cha.'],None),
  S('Thiết kế đáp ứng',['@media (max-width: 600px) {…} chỉ áp dụng khi khung nhìn rộng không quá 600px. flex-wrap: wrap cho các mục xuống dòng khi hết chỗ.'],None,'.menu { display:flex; justify-content:space-between; flex-wrap:wrap; }\n@media (max-width:600px) { .menu { flex-direction:column; } }',False,'css')],
 [['align-items luôn căn theo chiều dọc.','Theo trục PHỤ: với column thì là chiều ngang.'],['absolute luôn theo thẻ body.','Theo tổ tiên gần nhất có position khác static.'],['em tính theo cỡ chữ gốc.','em theo cha, rem theo gốc.']],
 'Trước khi chọn justify hay align, hãy hỏi: "trục chính của mình đang hướng nào?"')
lesson('html_table','HTML: bảng có ô gộp (colspan, rowspan)',['html-bang'],
 'Bạn hay đếm sai số thẻ td vì quên rằng ô gộp chiếm chỗ ở các hàng, cột khác.',
 [S('Vẽ lưới trước',['Một bảng là lưới gồm các hàng và cột. Trước khi viết mã hãy vẽ lưới ra giấy, rồi tô các ô gộp.','colspan="2" gộp hai ô nằm cạnh nhau trong một hàng; rowspan="2" gộp hai ô xếp trên dưới nhau trong một cột.'],'html_bang'),
  S('Đếm thẻ td từng hàng',['Mỗi thẻ tr là một hàng của mã nguồn. Số thẻ td/th cần viết trong hàng = số cột của lưới − số ô đã bị ô gộp ở hàng trên chiếm chỗ.','Trong hình: hàng 3 có 2 thẻ (một thẻ là ô rowspan="2"); hàng 4 chỉ cần 1 thẻ td vì cột 1 của nó đã bị ô rowspan ở hàng 3 chiếm chỗ.'],None),
  S('Các thẻ liên quan',['table › tr (hàng) › td (ô dữ liệu) hoặc th (ô tiêu đề). caption là tiêu đề của bảng, đặt ngay sau thẻ table. Danh sách: ul (không thứ tự), ol (có thứ tự), li là từng mục.'],None,'<table>\n  <caption>Điểm</caption>\n  <tr><th colspan="2">Điểm</th></tr>\n  <tr><td>Toán</td><td>9</td></tr>\n</table>',False,'html')],
 [['Số td mỗi hàng luôn bằng số cột.','Ô gộp chiếm chỗ nên có hàng ít thẻ hơn.'],['rowspan gộp các ô nằm ngang.','rowspan gộp theo chiều DỌC; colspan gộp theo chiều ngang.']],
 'Muốn không sai: vẽ lưới, gạch các ô bị chiếm rồi mới đếm.')
lesson('html_form','HTML: biểu mẫu (form)',['html-bieumau','forms','html-lienket'],
 'Bạn hay nhầm id với name, và nhầm khi nào dữ liệu được gửi đi.',
 [S('label – input: liên kết bằng for và id',['Thuộc tính for của label phải TRÙNG id của ô nhập. Khi đó nháy vào chữ nhãn thì con trỏ vào ô nhập, rất tiện cho người dùng.'],'forms'),
  S('Nhóm radio và name',['Các nút radio cần CÙNG name thì mới thành một nhóm chỉ chọn được một. Giá trị gửi lên máy chủ dựa vào name và value, không dựa vào id.'],None),
  S('Ba thuộc tính dễ nhầm',['required: bắt buộc nhập trước khi gửi. readonly: không sửa được nhưng VẪN được gửi. disabled: không sửa được và KHÔNG được gửi đi.'],None),
  S('Liên kết trong trang',['<a href="#muc2"> nhảy tới phần tử có id="muc2" trong cùng trang. target="_blank" mở liên kết ở tab mới. Liên kết ra website khác dùng đường dẫn tuyệt đối (https://…).'],None,'<a href="#muc2">Tới mục 2</a>\n<h2 id="muc2">Mục 2</h2>',False,'html')],
 [['Dữ liệu gửi đi theo id.','Theo name.'],['disabled và readonly giống nhau.','disabled không gửi giá trị; readonly vẫn gửi.'],['Hai radio khác name vẫn chỉ chọn được một.','Chỉ cùng name mới thành nhóm.']],
 'Nhớ: id để CSS/JS/label tìm phần tử; name để gửi dữ liệu.')
