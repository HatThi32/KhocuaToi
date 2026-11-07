/* Danh sách môn thi THPT và đề mẫu cho từng môn */
(function (root) {
  'use strict';

  const SUBJECTS = [
    { id: 'toan', name: 'Toán', time: 90 },
    { id: 'van', name: 'Ngữ văn', time: 120 },
    { id: 'anh', name: 'Tiếng Anh', time: 50 },
    { id: 'ly', name: 'Vật lí', time: 50 },
    { id: 'hoa', name: 'Hóa học', time: 50 },
    { id: 'sinh', name: 'Sinh học', time: 50 },
    { id: 'su', name: 'Lịch sử', time: 50 },
    { id: 'dia', name: 'Địa lí', time: 50 },
    { id: 'ktpl', name: 'Giáo dục kinh tế và pháp luật', time: 50 },
    { id: 'tin', name: 'Tin học', time: 50 },
    { id: 'cncn', name: 'Công nghệ (Công nghiệp)', time: 50 },
    { id: 'cnnn', name: 'Công nghệ (Nông nghiệp)', time: 50 },
    { id: 'phap', name: 'Tiếng Pháp', time: 50 },
    { id: 'nga', name: 'Tiếng Nga', time: 50 },
    { id: 'trung', name: 'Tiếng Trung', time: 50 },
    { id: 'nhat', name: 'Tiếng Nhật', time: 50 },
    { id: 'han', name: 'Tiếng Hàn', time: 50 },
    { id: 'duc', name: 'Tiếng Đức', time: 50 },
    { id: 'khac', name: 'Môn khác', time: 45 },
  ];

  const S = {};

  S.toan = `[PHẦN I. Câu trắc nghiệm nhiều phương án lựa chọn] Thí sinh trả lời từ câu 1 đến câu 4. Mỗi câu hỏi thí sinh chỉ chọn một phương án.
Câu 1. Nguyên hàm của hàm số $f(x) = 2x$ là
*A. $x^2 + C$
B. $2x^2 + C$
C. $2 + C$
D. $\\dfrac{x^2}{2} + C$
Câu 2. Tập nghiệm của bất phương trình $2^x > 8$ là
A. $(-\\infty; 3)$   *B. $(3; +\\infty)$   C. $[3; +\\infty)$   D. $(-\\infty; 3]$
Câu 3. Trong không gian $Oxyz$, mặt phẳng $(P): x + 2y - z + 1 = 0$ có một vectơ pháp tuyến là
A. $(1; 2; 1)$   B. $(2; 1; -1)$   *C. $(1; 2; -1)$   D. $(-1; 2; 1)$
Câu 4. Cho cấp số cộng $(u_n)$ có $u_1 = 2$ và công sai $d = 3$. Giá trị của $u_3$ là
A. $5$
B. $11$
C. $6$
D. $8$
Đáp án: D

[PHẦN II. Câu trắc nghiệm đúng sai] Thí sinh trả lời từ câu 1 đến câu 2. Trong mỗi ý a), b), c), d) ở mỗi câu, thí sinh chọn đúng hoặc sai.
Câu 1. Cho hàm số $y = x^3 - 3x + 1$.
a) Hàm số đồng biến trên khoảng $(1; +\\infty)$. (Đ)
b) Hàm số đạt cực đại tại $x = 1$. (S)
c) Giá trị cực tiểu của hàm số bằng $-1$. (Đ)
d) Đồ thị hàm số cắt trục hoành tại đúng hai điểm. (S)
Câu 2. Một hộp có 5 viên bi đỏ và 3 viên bi xanh. Lấy ngẫu nhiên 2 viên bi.
a) Số cách lấy 2 viên bi là $28$.
b) Xác suất lấy được 2 viên bi đỏ là $\\dfrac{5}{14}$.
c) Xác suất lấy được 2 viên bi cùng màu là $\\dfrac{1}{2}$.
d) Xác suất lấy được ít nhất 1 viên bi xanh là $\\dfrac{9}{14}$.
Đáp án: Đ Đ S Đ

[PHẦN III. Câu trắc nghiệm trả lời ngắn] Thí sinh trả lời từ câu 1 đến câu 2.
Câu 1. Tính giá trị của tích phân $\\displaystyle\\int_0^2 (2x+1)\\,dx$.
Đáp án: 6
Câu 2. Có bao nhiêu số tự nhiên có 3 chữ số khác nhau được lập từ các chữ số 1, 2, 3, 4, 5?
Đáp án: 60`;

  S.van = `[TỰ LUẬN] Môn Ngữ văn là đề tự luận nên phần mềm giữ nguyên thứ tự câu; bạn vẫn có thể dùng để tạo nhiều mã đề, in và xuất Word.
[NHÓM: I. ĐỌC HIỂU (4,0 điểm)]
Đọc văn bản sau:
(Dán văn bản đọc hiểu vào đây...)
Thực hiện các yêu cầu:
Câu 1. Xác định phương thức biểu đạt chính của văn bản.
Câu 2. Chỉ ra hai hình ảnh thể hiện vẻ đẹp của thiên nhiên trong văn bản.
Câu 3. Nêu tác dụng của biện pháp tu từ được sử dụng trong đoạn thơ.
Câu 4. Thông điệp nào trong văn bản có ý nghĩa nhất với anh/chị? Vì sao?
[HẾT NHÓM]
[NHÓM: II. VIẾT (6,0 điểm)]
Câu 5. (2,0 điểm) Viết đoạn văn nghị luận (khoảng 200 chữ) trình bày suy nghĩ của anh/chị về ý nghĩa của lòng biết ơn.
Câu 6. (4,0 điểm) Viết bài văn nghị luận (khoảng 600 chữ) phân tích đoạn thơ trong phần Đọc hiểu.
[HẾT NHÓM]`;

  S.anh = `[PHẦN I] Mark the letter A, B, C or D to indicate the correct answer to each of the following questions.
Question 1. She ______ to school by bus every day.
A. go   *B. goes   C. going   D. gone
Question 2. If I ______ you, I would accept the offer.
A. am   B. was   *C. were   D. be
Question 3. The book ______ by millions of people so far.
*A. has been read   B. was read   C. is reading   D. has read
[NHÓM: Reading]
Read the following passage and mark the letter A, B, C or D to indicate the correct answer to each of the questions from {từ} to {đến}.
Plastic pollution has become one of the most pressing environmental issues. Every year, millions of tonnes of plastic end up in the oceans, harming marine life and entering the food chain.
Question 4. What is the passage mainly about?
*A. Plastic pollution   B. Marine tourism   C. Food production   D. Ocean currents
Question 5. The word "pressing" in the passage is closest in meaning to ______.
A. heavy   *B. urgent   C. pleasant   D. ordinary
Question 6. Which of the following is NOT mentioned in the passage?
A. Plastic harms marine life.
B. Plastic enters the food chain.
*C. Plastic is easy to recycle.
D. Plastic ends up in the oceans.
[HẾT NHÓM]`;

  S.ly = `[PHẦN I]
Câu 1. Đơn vị của cường độ dòng điện trong hệ SI là
*A. ampe (A)   B. vôn (V)   C. ôm (Ω)   D. oát (W)
Câu 2. Quá trình chuyển từ thể lỏng sang thể khí ở bề mặt chất lỏng gọi là
A. sự nóng chảy   B. sự đông đặc   *C. sự bay hơi   D. sự ngưng tụ
Câu 3. Hạt nhân nguyên tử được cấu tạo từ
A. electron và proton
*B. proton và neutron
C. electron và neutron
D. electron, proton và neutron
[PHẦN II]
Câu 1. Một lượng khí lí tưởng được giữ ở nhiệt độ không đổi.
*a) Khi thể tích giảm thì áp suất tăng.
b) Áp suất tỉ lệ thuận với thể tích.
*c) Tích $pV$ không đổi.
d) Đây là quá trình đẳng áp.
[PHẦN III]
Câu 1. Một vật có khối lượng 2 kg chuyển động với tốc độ 3 m/s. Động năng của vật bằng bao nhiêu jun?
Đáp án: 9`;

  S.hoa = `[PHẦN I]
Câu 1. Chất nào sau đây là chất điện li mạnh?
A. $CH_3COOH$   *B. $NaCl$   C. $C_2H_5OH$   D. $H_2O$
Câu 2. Kim loại nào sau đây dẫn điện tốt nhất?
A. Cu   B. Al   *C. Ag   D. Fe
Câu 3. Công thức của glucose là
*A. $C_6H_{12}O_6$   B. $C_{12}H_{22}O_{11}$   C. $(C_6H_{10}O_5)_n$   D. $C_2H_5OH$
[PHẦN II]
Câu 1. Về tính chất của sắt (Fe):
a) Sắt tác dụng với dung dịch HCl tạo muối sắt(II). (Đ)
b) Sắt bị thụ động trong $HNO_3$ đặc, nguội. (Đ)
c) Sắt là kim loại nhẹ hơn nhôm. (S)
d) Gang là hợp kim của sắt với carbon, chứa trên 2% carbon. (Đ)
[PHẦN III]
Câu 1. Số nguyên tử hydrogen trong một phân tử ethanol là bao nhiêu?
Đáp án: 6`;

  S.sinh = `[PHẦN I]
Câu 1. Đơn phân cấu tạo nên phân tử DNA là
*A. nucleotide   B. amino acid   C. glucose   D. acid béo
Câu 2. Quá trình quang hợp ở thực vật diễn ra chủ yếu ở bào quan nào?
A. Ti thể   *B. Lục lạp   C. Ribosome   D. Không bào
Câu 3. Cơ thể có kiểu gene AaBb giảm phân bình thường tạo ra bao nhiêu loại giao tử?
A. 2   *B. 4   C. 6   D. 8
[PHẦN II]
Câu 1. Về hệ tuần hoàn ở người:
*a) Tim người có 4 ngăn.
b) Máu trong động mạch phổi giàu $O_2$.
*c) Vòng tuần hoàn nhỏ đưa máu qua phổi.
d) Tĩnh mạch luôn dẫn máu đỏ thẫm.
[PHẦN III]
Câu 1. Một tế bào lưỡng bội của người có bao nhiêu nhiễm sắc thể?
Đáp án: 46`;

  S.su = `[PHẦN I]
Câu 1. Cách mạng tháng Tám ở Việt Nam thành công vào năm nào?
A. 1930   *B. 1945   C. 1954   D. 1975
Câu 2. Chiến dịch nào đã kết thúc thắng lợi cuộc kháng chiến chống thực dân Pháp (1945 – 1954)?
A. Việt Bắc thu – đông 1947
B. Biên giới thu – đông 1950
*C. Điện Biên Phủ 1954
D. Hồ Chí Minh 1975
Câu 3. Tổ chức ASEAN được thành lập năm
A. 1945   *B. 1967   C. 1976   D. 1995
Câu 4. Việt Nam gia nhập Liên hợp quốc vào năm
A. 1975   B. 1976   *C. 1977   D. 1995
[PHẦN II]
Câu 1. Đọc đoạn tư liệu sau: "Không có gì quý hơn độc lập, tự do" (Hồ Chí Minh).
a) Câu nói khẳng định giá trị của độc lập, tự do đối với dân tộc. (Đ)
b) Câu nói được nêu ra trong thời kì kháng chiến chống Mỹ. (Đ)
c) Câu nói chỉ có giá trị trong thời chiến. (S)
d) Câu nói là nguồn cổ vũ tinh thần đấu tranh của nhân dân Việt Nam. (Đ)`;

  S.dia = `[PHẦN I]
Câu 1. Nước ta nằm trong vùng khí hậu
*A. nhiệt đới ẩm gió mùa   B. ôn đới hải dương   C. cận nhiệt khô   D. xích đạo
Câu 2. Đồng bằng có diện tích lớn nhất nước ta là
A. đồng bằng sông Hồng   *B. đồng bằng sông Cửu Long   C. đồng bằng Thanh Hóa   D. đồng bằng Nghệ An
Câu 3. Vùng nào sau đây có nhiều tỉnh giáp biển nhất?
A. Tây Nguyên   *B. Duyên hải Nam Trung Bộ   C. Trung du và miền núi Bắc Bộ   D. Đông Nam Bộ
[PHẦN II]
Câu 1. Cho thông tin: Ngành du lịch nước ta phát triển mạnh trong những năm gần đây.
*a) Tài nguyên du lịch của nước ta phong phú.
*b) Cơ sở hạ tầng du lịch ngày càng được cải thiện.
c) Du lịch chỉ phát triển ở các tỉnh miền Bắc.
*d) Du lịch góp phần tạo việc làm cho người lao động.
[PHẦN III]
Câu 1. Năm 2023, dân số nước ta khoảng 100,3 triệu người, diện tích khoảng 331,3 nghìn km². Tính mật độ dân số (người/km², làm tròn đến hàng đơn vị).
Đáp án: 303`;

  S.ktpl = `[PHẦN I]
Câu 1. Công dân bình đẳng trước pháp luật có nghĩa là mọi công dân
*A. đều có quyền và nghĩa vụ như nhau, không bị phân biệt đối xử
B. đều có quyền như nhau nhưng nghĩa vụ khác nhau
C. đều được hưởng quyền lợi như nhau
D. đều có địa vị xã hội như nhau
Câu 2. Thuế là khoản nộp ngân sách nhà nước
A. tự nguyện   *B. bắt buộc   C. không hoàn trả có điều kiện   D. tùy theo khả năng
Câu 3. Hành vi nào sau đây thể hiện công dân thực hiện quyền bầu cử?
A. Nhờ người khác bỏ phiếu hộ
*B. Trực tiếp đi bỏ phiếu bầu đại biểu
C. Từ chối tham gia bầu cử
D. Xem phiếu bầu của người khác
[PHẦN II]
Câu 1. Anh A kinh doanh cửa hàng tạp hóa và kê khai thuế đầy đủ.
a) Anh A thực hiện đúng nghĩa vụ nộp thuế. (Đ)
b) Kinh doanh nhỏ thì không phải đăng kí kinh doanh. (S)
c) Anh A có quyền tự do kinh doanh theo quy định pháp luật. (Đ)
d) Anh A được bán hàng hết hạn sử dụng nếu giảm giá. (S)`;

  S.tin = `[PHẦN I]
Câu 1. Đơn vị đo dung lượng thông tin nhỏ nhất là
*A. bit   B. byte   C. KB   D. MB
Câu 2. Trong Python, câu lệnh nào in ra màn hình?
A. input()   *B. print()   C. len()   D. range()
Câu 3. Giao thức nào được dùng để truyền tải trang web?
A. FTP   B. SMTP   *C. HTTP   D. POP3
[PHẦN II]
Câu 1. Về mạng máy tính:
*a) Địa chỉ IP dùng để định danh thiết bị trên mạng.
b) Mạng LAN có phạm vi toàn cầu.
*c) Router dùng để kết nối các mạng với nhau.
d) Wi-Fi là mạng có dây.
[PHẦN III]
Câu 1. Số nhị phân 1011 ứng với số thập phân nào?
Đáp án: 11`;

  S.cncn = `[PHẦN I]
Câu 1. Đơn vị đo điện trở là
A. vôn   B. ampe   *C. ôm   D. oát
Câu 2. Linh kiện nào cho dòng điện đi qua theo một chiều?
A. Điện trở   B. Tụ điện   *C. Diode   D. Cuộn cảm
Câu 3. Động cơ đốt trong 4 kì có mấy hành trình của pít-tông trong một chu trình?
A. 2   *B. 4   C. 6   D. 8
[PHẦN II]
Câu 1. Về an toàn điện:
*a) Cần ngắt nguồn điện trước khi sửa chữa.
b) Có thể dùng tay ướt chạm vào ổ cắm.
*c) Dùng dụng cụ cách điện khi làm việc với điện.
*d) Thiết bị điện cần được nối đất khi cần thiết.`;

  S.cnnn = `[PHẦN I]
Câu 1. Biện pháp nào giúp cải tạo đất chua?
*A. Bón vôi   B. Bón phân đạm   C. Tưới nhiều nước   D. Đốt rơm rạ
Câu 2. Vaccine dùng trong chăn nuôi có tác dụng
A. chữa bệnh   *B. phòng bệnh   C. tăng trọng nhanh   D. kích thích sinh sản
Câu 3. Trồng cây trong dung dịch dinh dưỡng không dùng đất gọi là
A. trồng cây trong nhà kính   *B. thủy canh   C. luân canh   D. xen canh
[PHẦN II]
Câu 1. Về nuôi trồng thủy sản:
*a) Cần đảm bảo chất lượng nước ao nuôi.
b) Thả càng nhiều con giống thì năng suất càng cao.
*c) Cần cho ăn đúng lượng, đúng giờ.
*d) Cần theo dõi sức khỏe vật nuôi thường xuyên.`;

  const LANG = `[PHẦN I] Mark the letter A, B, C or D to indicate the correct answer.
Câu 1. (Câu hỏi 1...)
*A. (Đáp án đúng)
B. (Phương án nhiễu)
C. (Phương án nhiễu)
D. (Phương án nhiễu)
Câu 2. (Câu hỏi 2...)
A. ...   B. ...   *C. ...   D. ...
[NHÓM: Đọc hiểu]
(Dán đoạn văn đọc hiểu vào đây) — trả lời các câu từ {từ} đến {đến}.
Câu 3. (Câu hỏi về đoạn văn...)
A. ...   *B. ...   C. ...   D. ...
Câu 4. (Câu hỏi về đoạn văn...)
A. ...   B. ...   C. ...   *D. ...
[HẾT NHÓM]`;
  ['phap', 'nga', 'trung', 'nhat', 'han', 'duc'].forEach((k) => (S[k] = LANG));

  S.khac = `[PHẦN I]
Câu 1. (Nội dung câu hỏi)
*A. (Đáp án đúng — đánh dấu * ở trước)
B. (Phương án nhiễu)
C. (Phương án nhiễu)
D. Cả A và B đều đúng
Câu 2. (Nội dung câu hỏi)
A. ...   B. ...   C. ...   D. ...
Đáp án: C
[PHẦN II]
Câu 1. (Nội dung câu hỏi đúng/sai)
a) (Ý thứ nhất) (Đ)
b) (Ý thứ hai) (S)
c) (Ý thứ ba) (Đ)
d) (Ý thứ tư) (S)
[PHẦN III]
Câu 1. (Nội dung câu trả lời ngắn)
Đáp án: 2,5`;

  const api = { SUBJECTS, SAMPLES: S };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.XaoDeSamples = api;
})(typeof window !== 'undefined' ? window : globalThis);
