# Mã nguồn: Luyện HSG Tin học

Mở thư mục này bằng Claude Code (`claude` trong thư mục `hsg-tin-hoc/nguon`) — Claude đọc `CLAUDE.md` và biết cách dựng, kiểm thử, sửa slide.

Bắt đầu nhanh:
```
python3 build.py                       # tạo ../index.html
npm i playwright && npx playwright install chromium
node tests/t6.js                       # kiểm thử 29 bài
sh slides/build_slides.sh d_c4.py      # dựng lại một bộ slide
```
Gợi ý yêu cầu cho Claude Code: "thêm 10 câu SQL JOIN vào ngân hàng", "sửa slide m3 cho bài mạng con", "gắn máy chủ lưu kết quả với URL …".
