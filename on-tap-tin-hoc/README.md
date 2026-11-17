# Ôn tập Tin học THPT (KNTT – Tin học ứng dụng)

Ứng dụng web miễn phí dành cho giáo viên Tin học THPT:

- **Ngân hàng câu hỏi soạn sẵn** cho lớp 10, 11, 12 (bộ Kết nối tri thức, định hướng Tin học ứng dụng): khoảng 1 860 câu, mỗi bài 20 câu, đủ 7 dạng (trắc nghiệm, đúng/sai, trả lời ngắn, điền khuyết, sắp xếp, ghép nối, tự luận).
- **AI (Google Gemini) soạn câu hỏi và chấm bài** tự luận.
- **Trình chiếu trên lớp**: bấm chọn đáp án, đồng hồ đếm giờ, âm thanh, quay ngẫu nhiên gọi tên học sinh, giải thích đáp án to rõ.
- **Xuất PowerPoint (.pptx)** có hiệu ứng bấm chọn đáp án.
- **Thi trực tiếp theo nhóm/cá nhân** qua wifi lớp học, **giao bài luyện tập ở nhà**.

## Cài đặt (Windows)

1. **Cài Python** (một lần duy nhất): tải từ https://www.python.org/downloads/ và cài đặt. Ở màn hình đầu tiên, **nhớ tích ô “Add python.exe to PATH”**.
2. **Tải app**: https://github.com/HatThi32/KhocuaToi/archive/main.zip — giải nén, rồi chép thư mục **`on-tap-tin-hoc`** ra chỗ dễ tìm, ví dụ `D:\on-tap-tin-hoc`.
3. **Chạy app**: mở thư mục `on-tap-tin-hoc`, bấm đúp vào **`Chay app.bat`**. Trình duyệt sẽ mở `http://localhost:8000`.

App không cần cài thêm thư viện nào; chỉ dùng Python có sẵn.

Học sinh dùng chung wifi với máy giáo viên có thể vào bằng địa chỉ IP của máy giáo viên (ví dụ `http://192.168.1.10:8000`); địa chỉ này hiện trên trang chủ của app.

## Thiết lập lần đầu

1. Trang chủ → **Giáo viên** → tạo mật khẩu.
2. **⚙️ Cài đặt** → dán **Gemini API key** (lấy miễn phí tại https://aistudio.google.com/apikey). Không có key thì vẫn dùng được ngân hàng câu hỏi, trình chiếu và PowerPoint; chỉ các chức năng AI soạn đề, AI chấm bài là không chạy.

Hướng dẫn chi tiết: xem **[HUONG_DAN.md](HUONG_DAN.md)**.

## Cập nhật phiên bản mới

Tải ZIP mới và chép đè lên thư mục cũ. **Giữ nguyên thư mục `data/`**: đây là nơi lưu câu hỏi, đề, kết quả và khoá API của thầy cô. Câu hỏi mới trong `question_bank/` sẽ được tự nạp khi khởi động lại app.

## Lưu ý

- Mỗi giáo viên chạy app trên máy của mình. Dữ liệu (`data/app.db`) **không** được đưa lên GitHub.
- Câu hỏi do AI soạn có thể sai; hãy kiểm tra trước khi dùng.
- Góp ý, báo lỗi câu hỏi: tạo mục **Issues** trên trang GitHub này.
