# Ôn tập Tin học – Hướng dẫn sử dụng

App ra đề, chấm bài bằng AI, trình chiếu trên lớp và luyện tập ở nhà.
Nội dung theo Tin học THPT, bộ sách Kết nối tri thức, định hướng Tin học ứng dụng (lớp 10, 11, 12).

## 1. Chạy app trên máy tính

- Bấm đúp vào **`Chay app.bat`**. Trình duyệt sẽ mở `http://localhost:8000`.
- Hoặc mở cửa sổ lệnh trong thư mục này và gõ: `python app.py`
- Lần đầu chạy, Windows có thể hỏi có cho Python truy cập mạng không: chọn **Allow** (Cho phép) để học sinh cùng wifi vào được.
- Dữ liệu (câu hỏi, đề, kết quả) nằm trong file `data/app.db`. **Hãy sao lưu file này thường xuyên.**

Chỉ cần cài Python một lần (https://www.python.org/downloads/, nhớ tích ô **Add python.exe to PATH**); app không cần thêm thư viện nào khác.

## 2. Thiết lập lần đầu (giáo viên)

1. Trang chủ → **Giáo viên** → tạo mật khẩu.
2. **⚙️ Cài đặt** → dán **Gemini API key**:
   - Vào https://aistudio.google.com/apikey, đăng nhập Google, bấm *Create API key*, rồi sao chép key.
   - Bấm **Kiểm tra kết nối** để chắc chắn key dùng được.
3. **🗂️ Chương trình** → kiểm tra danh sách bài của từng khối, sửa tên bài nếu khác SGK, và chọn **Mốc kiểm tra** cho từng bài (thuộc giữa kì 1, cuối kì 1, giữa kì 2 hay cuối kì 2). Mốc này quyết định phạm vi khi ra đề hoặc ôn thi giữa kì, cuối kì.

## 3. Ngân hàng câu hỏi

Có 7 dạng câu hỏi:

| Dạng | Cách chấm |
|---|---|
| Trắc nghiệm 4 phương án | Đúng/sai |
| Đúng/Sai 4 ý (kiểu đề tốt nghiệp) | 1 ý đúng được 10%, 2 ý 25%, 3 ý 50%, 4 ý 100% điểm câu |
| Trả lời ngắn | So khớp đáp án, không phân biệt hoa/thường và khoảng trắng |
| Điền khuyết | Chấm từng chỗ trống |
| Sắp xếp thứ tự | Đúng hết được điểm tối đa, sai thứ tự được tối đa một nửa |
| Ghép nối | Chấm từng cặp |
| Tự luận | AI chấm theo hướng dẫn chấm; giáo viên sửa được điểm |

Có 3 cách thêm câu hỏi:

- **✨ AI soạn câu hỏi**: chọn bài và số câu mỗi dạng; AI soạn, thầy cô xem lại rồi lưu.
- **📋 Nhập đề có sẵn**: chọn file Word (.docx) hoặc dán nội dung đề; AI tách thành từng câu hỏi. Nên đưa cả phần đáp án vào.
- **➕ Thêm câu hỏi**: tự soạn. Đoạn code đặt giữa hai dòng ```` ``` ````.

### Bộ câu hỏi soạn sẵn

Thư mục `question_bank` chứa bộ câu hỏi soạn sẵn bám theo SGK Kết nối tri thức (Tin học ứng dụng), mỗi bài 15 câu chính + 5 câu dễ (tổng 20 câu/bài):

| Khối | Số bài | Câu chính | Câu dễ | File câu chính | File câu dễ |
|---|---|---|---|---|---|
| Lớp 10 | 34 | 510 | 170 | `lop10_*.py` | `de_lop10_a.py`, `de_lop10_b.py` |
| Lớp 11 | 31 | 465 | 155 | `lop11_bai01.py` … `lop11_bai31.py` | `de_lop11.py` |
| Lớp 12 | 28 | 420 | 140 | `lop12_bai01.py` … `lop12_bai28.py` | `de_lop12.py` |

Mỗi bài có đủ các dạng, độ khó tăng dần từ Nhận biết → Thông hiểu → Vận dụng → Vận dụng cao. Các file `de_*.py` chứa câu Nhận biết/Thông hiểu dễ, dùng để khởi động bài học hoặc cho học sinh học lực trung bình luyện tập. Các câu có code Python đã được chạy thử, các câu SQL (lớp 11) đã được chạy trên dữ liệu mymusic của SGK để đối chiếu đáp án.

- App tự nạp các câu này vào ngân hàng mỗi khi khởi động. Câu đã có sẽ không bị nạp trùng.
- Muốn sửa một câu, thầy cô có thể sửa ngay trong app, hoặc sửa file `.py` rồi khởi động lại app (đáp án và lời giải được cập nhật theo file).
- Vị trí đáp án đúng trong câu trắc nghiệm được xáo đều A–D khi nạp.

## 4. Bộ đề: kiểm tra, trình chiếu, giao bài

**🎯 Tạo đề theo ma trận**: chọn loại đề (luyện tập cuối bài, ôn chủ đề, giữa kì, cuối kì…), số câu và điểm mỗi dạng. App tự rút câu ngẫu nhiên từ ngân hàng.

**Chiếu nhanh từ Ngân hàng câu hỏi** (không cần tạo bộ đề trước):
- Lọc theo Khối / Chủ đề / Bài / Dạng / Mức độ. Nếu chỉ muốn chiếu vài câu thì tích ô **Chọn** ở từng câu đó.
- Bấm **📺 Trình chiếu** để chiếu ngay, hoặc **📊 PowerPoint** để tải tệp .pptx. Chưa tích câu nào thì app dùng tất cả các câu đang lọc.
- App tự tạo (hoặc cập nhật) một bộ đề tên **"Trình chiếu – <tên bài>"** trong mục *Bộ đề & kiểm tra*, xoá đi khi không cần.

Mỗi bộ đề dùng được theo 4 cách:

1. **Kiểm tra trực tuyến**: bấm **▶ Mở bài kiểm tra** để nhận mã 6 kí tự. Học sinh đăng nhập và nhập mã để làm bài. Bài được chấm ngay khi nộp. Thầy cô xem kết quả, sửa điểm tự luận, cho học sinh làm lại và xuất file CSV (mở được bằng Excel).
2. **📺 Trình chiếu trên lớp**:
   - *Cả lớp trả lời*: chiếu câu hỏi lên bảng, bấm **🎲 Gọi tên** để quay ngẫu nhiên một học sinh trả lời. Khi học sinh chọn đáp án, thầy cô **bấm vào phương án đó**:
     - Đồng hồ **dừng lại**, màn hình báo **🎉 CHÍNH XÁC!** hoặc **❌ CHƯA ĐÚNG! Đáp án đúng là …**.
     - Lời giải hiện **chữ to** ngay bên dưới. Nếu học sinh trả lời sai, khung lời giải tô đỏ kèm dòng "📢 Cả lớp cùng chú ý" để cả lớp rút kinh nghiệm.
     - Nút lớn **Câu tiếp theo ▶** hiện ra để chuyển câu.
     - **Âm thanh**: có tiếng "tách" khi bấm chọn đáp án, nhạc vui khi đúng, tiếng "bùm bụp" khi sai, tiếng quay khi 🎲 gọi tên. Ở chế độ từng học sinh, điện thoại học sinh cũng phát âm thanh. Nút **🔊 / 🔇** trên thanh điều khiển để bật/tắt.
     - Câu *Đúng/Sai*: bấm **Đ** hoặc **S** cho từng ý theo câu trả lời của lớp. Chọn đủ 4 ý là tự hiện kết quả, ý nào sai được tô đỏ.
     - Câu *Trả lời ngắn*: gõ câu trả lời của lớp vào ô rồi bấm **✔ Kiểm tra** (hoặc Enter).
     - Câu *Điền khuyết*: gõ thẳng vào các chỗ trống (1), (2)… trong câu, Enter để sang ô tiếp, rồi **✔ Kiểm tra**.
     - Câu *Sắp xếp*: **kéo thả** các dòng theo thứ tự học sinh đưa ra, hoặc gõ thứ tự vào ô (VD: `C A D B`), rồi bấm **✔ Kiểm tra thứ tự**.
     - Câu *Ghép nối*: chọn chữ cái a, b, c… cho từng ý, rồi **✔ Kiểm tra**.
     - Đúng một phần thì hiện **🟡 ĐÚNG MỘT PHẦN (…%)** và đánh dấu ✔/✘ từng ý. Câu tự luận: bấm **Hiện đáp án** để xem gợi ý.
   - **Danh sách lớp để gọi tên**: vào mục **🎒 Học sinh → ⬆ Tải danh sách lớp** (hoặc bấm **⬆ Tải danh sách lớp** ngay trong hộp Gọi tên).
     - Gõ tên lớp (VD 10A1), rồi chọn file **Excel (.xlsx), Word (.docx), .csv hoặc .txt**, hoặc dán cột họ tên copy từ sổ điểm.
     - App tự tìm cột "Họ và tên", hoặc ghép hai cột "Họ đệm" + "Tên". Số thứ tự, dòng tiêu đề và tên trùng được bỏ đi.
     - Kiểm tra lại danh sách rồi bấm **💾 Lưu**. Mỗi lớp một danh sách, có thể sửa hoặc xoá sau. File Excel đời cũ (.xls) cần lưu lại thành .xlsx trước.
   - *Từng học sinh trả lời*: học sinh dùng điện thoại vào **Vào phòng học** và nhập mã 6 số. Màn hình chiếu thống kê đáp án và bảng xếp hạng (trả lời đúng và nhanh được nhiều điểm hơn).
   - Phím tắt: **→** để bắt đầu, hiện đáp án rồi sang câu tiếp; **←** để quay lại câu trước; nút ⛶ để chiếu toàn màn hình.
3. **📊 PowerPoint**: tải bộ đề thành tệp `.pptx` để chiếu bằng PowerPoint, không cần mở app hay có mạng.
   - Trang đầu là tiêu đề, sau đó mỗi câu một trang: nền tối, chữ to, phương án tô màu A/B/C/D như trong app.
   - Trong chế độ trình chiếu (F5), **bấm vào một phương án** để hiện ✔ ĐÚNG / ✘ SAI ngay trên phương án đó. Với câu Đúng/Sai thì bấm nút **Đ** hoặc **S** ở từng ý.
   - Bấm nút vàng **💡 ĐÁP ÁN** ở góc trên để tô viền đáp án đúng và hiện lời giải. Các dạng khác (trả lời ngắn, điền khuyết, sắp xếp, ghép nối, tự luận) cũng hiện đáp án bằng nút này.
   - Bấm ra ngoài các nút hoặc nhấn phím **→** để sang câu tiếp. Quay lại trang cũ thì mọi thứ trở về như lúc chưa bấm.
   - Có thể sửa tệp trong PowerPoint (thêm hình, đổi màu…) như tệp bình thường. Chỉ cần không xoá các hình phản hồi ✔/✘ là các nút vẫn hoạt động.
4. **In đề**: in đề kèm bảng đáp án.

Đánh dấu **"Giao cho học sinh luyện tập ở nhà"** để bộ đề hiện ở mục *Thầy cô giao* của học sinh.

## 5. Học sinh luyện tập

Học sinh tạo tài khoản bằng **họ tên, lớp (VD: 10A1) và mã PIN 4-6 số**. Nếu học sinh quên PIN, thầy cô đặt lại trong mục 🎒 Học sinh.

Các chế độ luyện tập:

- Luyện tập **cuối mỗi bài** hoặc **cả chủ đề**.
- **Ôn thi giữa kì 1, cuối kì 1, giữa kì 2, cuối kì 2**, theo mốc thầy cô đã đặt.
- **Ôn lại câu làm sai**.
- **✨ Câu hỏi mới do AI tạo**: không giới hạn lượt luyện (có thể tắt trong Cài đặt).
- Sau mỗi câu, học sinh thấy ngay đúng/sai, đáp án và lời giải thích; câu tự luận được AI nhận xét.

Thầy cô xem tiến độ từng em (số câu đã luyện, tỉ lệ đúng, bài yếu nhất) ở mục 🎒 Học sinh.

## 6. Dùng trên lớp và ở nhà

- **Trên lớp (cùng wifi)**: khi chạy app, cửa sổ đen hiện địa chỉ dạng `http://192.168.x.x:8000`. Học sinh mở địa chỉ này trên điện thoại.
- **Ở nhà**: máy tính chạy app phải truy cập được từ Internet. Cách đơn giản là đưa thư mục này lên một dịch vụ chạy Python, ví dụ **PythonAnywhere** (có gói miễn phí):
  1. Tạo tài khoản, tải toàn bộ thư mục `OnTapTin` lên (mục *Files*).
  2. Vào *Web* → *Add a new web app* → *Manual configuration* (Python 3.x).
  3. Mở file *WSGI configuration*, xoá nội dung cũ và ghi:
     ```python
     import sys
     sys.path.insert(0, '/home/TEN_TAI_KHOAN/OnTapTin')
     from app import application
     ```
  4. Bấm *Reload*. Học sinh vào `https://TEN_TAI_KHOAN.pythonanywhere.com`.

  Gói miễn phí của PythonAnywhere chỉ cho kết nối ra một số trang web nhất định. Nếu chức năng AI không chạy ở đó, có thể dùng gói trả phí hoặc dịch vụ khác như Render hay Railway.

## 7. Lưu ý

- AI có thể soạn sai. Luôn kiểm tra đáp án trước khi lưu câu hỏi vào ngân hàng.
- Danh sách bài học đã được đối chiếu với mục lục SGK lớp 10, 11, 12. App tự cập nhật tên bài, chủ đề khi khởi động.
- Gemini API key là thông tin riêng, không chia sẻ cho học sinh.
