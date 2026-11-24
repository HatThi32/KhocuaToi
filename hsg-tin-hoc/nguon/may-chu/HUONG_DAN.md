# Bật tài khoản học sinh cho "Luyện HSG Tin" (làm một lần, khoảng 5 phút)

1. Vào Google Drive > Mới > Google Trang tính, đặt tên "HSG – Kết quả đội tuyển".
2. Trong trang tính: Tiện ích mở rộng > Apps Script. Xoá mã mẫu, dán toàn bộ file Code.gs, bấm Lưu.
3. Chọn hàm setup ở thanh trên, bấm Chạy, cấp quyền khi Google hỏi (chỉ cần một lần).
4. Bên trái chọn Cài đặt dự án (hình bánh răng) > Thuộc tính tập lệnh > sửa:
   - ADMIN_PASS = mật khẩu tài khoản giáo viên của bạn (đổi khỏi DOI-MAT-KHAU-NAY)
   - JOIN_CODE  = mã đội tuyển để học sinh tự tạo tài khoản (ví dụ HSG2027)
5. Triển khai > Tuỳ chọn triển khai mới > loại "Ứng dụng web":
   Thực thi với tư cách: Tôi. Ai có quyền truy cập: Bất kỳ ai. Bấm Triển khai.
6. Copy "URL ứng dụng web" (dạng https://script.google.com/macros/s/.../exec) và gửi lại cho mình.
   Mình gắn URL vào app và xuất bản; từ đó app yêu cầu đăng nhập.

Sử dụng:
- Học sinh: Tạo tài khoản (họ tên, lớp, tên đăng nhập, mật khẩu, mã đội tuyển), sau đó đăng nhập ở thiết bị nào cũng thấy dữ liệu của mình.
- Giáo viên: tab "Giáo viên" ở màn hình đăng nhập, nhập ADMIN_PASS để xem thống kê, tải CSV, đặt lại mật khẩu, tạo tài khoản hàng loạt.
- Dữ liệu nằm trong Google Trang tính của bạn (sheet HocSinh, KetQua).
