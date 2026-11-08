# KhocuaToi

## Xáo Đề THPT (`xao-de/`)

Phần mềm xáo đề thi chạy trực tiếp trên trình duyệt, dùng cho **tất cả các môn THPT**
(Toán, Ngữ văn, Tiếng Anh, Vật lí, Hóa học, Sinh học, Lịch sử, Địa lí, GD KT&PL, Tin học, Công nghệ, ngoại ngữ khác…).

**Cách dùng:** mở file `xao-de/index.html` bằng trình duyệt (Chrome, Edge, Firefox…), không cần cài đặt.

Tính năng:
- Hỗ trợ cấu trúc đề thi THPT từ 2025: Phần I (nhiều lựa chọn), Phần II (đúng/sai), Phần III (trả lời ngắn), và tự luận.
- Tạo nhiều mã đề: xáo thứ tự câu hỏi, xáo phương án A–D, xáo ý a–d của câu đúng/sai.
- Nhóm câu (bài đọc, tư liệu) luôn đi liền nhau; tự giữ nguyên phương án kiểu "Cả A và B", "All of the above".
- Mở đề gốc từ file Word (.docx) — chữ cái đáp án được gạch chân sẽ tự nhận là đáp án đúng.
- Công thức LaTeX `$...$`, hình ảnh.
- Xuất **file Word .docx chuẩn**: A4, Times New Roman, lề / cỡ chữ / giãn dòng tùy chỉnh; tiêu đề 2 cột, khung
  "ĐỀ CHÍNH THỨC" và "Mã đề thi"; phương án tự xếp 4 / 2 / 1 cột thẳng hàng; chân trang "Trang x/y – Mã đề thi …";
  câu hỏi không bị tách khỏi phương án khi sang trang; công thức LaTeX chuyển thành công thức Word (Equation).
- Tải tất cả mã đề thành file .zip (mỗi mã một file Word + đáp án), hoặc gộp 1 file; in / lưu PDF.
- Bảng đáp án (Word, Excel) kèm đối chiếu câu với đề gốc.
- Tự kiểm tra lỗi trước khi xuất (thiếu đáp án, phương án trống/trùng, thiếu dấu $, công thức/ảnh lỗi, đánh số câu
  nhảy cóc…) và tự kiểm chứng mỗi mã đề có đủ câu, đáp án đúng vị trí.
- Dùng "hạt giống xáo" để xáo lại ra đúng kết quả cũ. Dữ liệu chỉ lưu trên máy bạn.
