# Dự án: Luyện HSG Tin học (THPT, SGK Kết nối tri thức)

Ứng dụng web một tệp (`../index.html`) cho đội tuyển HSG Tin: đề thi thử, ôn theo chủ đề, sổ lỗi, ngân hàng 655 câu, 29 bài học kèm bộ slide, tài khoản học sinh và trang thống kê giáo viên.
Chủ dự án là giáo viên Tin học (Việt Nam): **mọi nội dung và giao diện bằng tiếng Việt**, ngôn ngữ học thuật kiểu SGK.

## Cấu trúc
- `app_tpl.html`: khung app (CSS, bộ chấm, đề thi thử, luyện tập, sổ lỗi). Có 3 chỗ giữ chỗ: `/*DATA*/{}`, `/*LESSONS*/{}`, `/*DEEP*/`.
- `bank.json`: ngân hàng câu hỏi. `lessons.json`: bài ôn theo dạng lỗi. `deep.js`, `units.js`: nội dung 29 bài học (`UNITS`, `UFIGS`).
- `deepui.js`: giao diện bài học. `learnui.js`: mục "Học theo chủ đề", bảng `DECK` (liên kết tới slide `../bai/*.html`) và `CANVA`.
- `sync.js`: đăng nhập, đồng bộ kết quả, trang giáo viên (chỉ hoạt động khi có `sync_url.txt`). Máy chủ: `may-chu/Code.gs` (Google Apps Script), hướng dẫn cài trong `may-chu/HUONG_DAN.md`.
- `slides/`: các bộ slide: mỗi bộ là một `d_*.py` dùng thư viện `lib2.py`, `lib3.py` (chạy mã Python thật), `lib4.py` (chạy SQL thật bằng sqlite3). Kết quả: `../bai/*.html`.
- `tests/`: kiểm thử Playwright (`node tests/t6.js` duyệt cả 29 bài; `tsync.js` thử đăng nhập/đồng bộ với máy chủ giả).
- `gen/`: các script sinh nội dung ban đầu (lịch sử; đường dẫn tuyệt đối cũ, thường không cần chạy lại).

## Lệnh thường dùng (chạy trong `nguon/`)
- Dựng app: `python3 build.py` → ghi `../index.html`. Gắn máy chủ: đặt URL vào `sync_url.txt` rồi dựng lại.
- Dựng slide: `sh slides/build_slides.sh` hoặc `sh slides/build_slides.sh d_c4.py`; kiểm tra tràn chữ: `cd slides && node shot2.js c4.html c4`.
- Kiểm thử: `npm i playwright` (nếu chưa có) rồi `node tests/t6.js` (kết quả đúng: `units 29`, `errs []`).
- Kiểm cú pháp JS sau khi dựng: tách thẻ `<script>` của `index.html` rồi `node --check`.

## Quy ước bắt buộc
- Không dùng `alert/confirm/prompt`; đưa dữ liệu vào DOM bằng `textContent` (hàm `h()`), không nối chuỗi HTML từ dữ liệu người dùng.
- Mọi chỗ trong slide có kết quả Python/SQL phải lấy bằng cách **chạy thật** (`RUN`, `SQL1`, `SQLRUN`), không tự gõ.
- Slide 1280×720, chữ ≥ 18px, tiêu đề IN HOA, ý chính **đậm đỏ**, mã trong khung tối kèm kết quả, không để slide thưa; mỗi bài ≥ 20 slide (hiện 25–34).
- Sau khi sửa slide hoặc app: dựng lại, chạy `t6.js`, rồi commit cả `index.html` và `bai/*.html`.
- Trang giáo viên và máy chủ: mật khẩu GV và mã đội tuyển nằm trong Script properties của Apps Script, **không** đưa vào repo.

## Triển khai
GitHub Pages: `https://hatthi32.github.io/KhocuaToi/hsg-tin-hoc/`. Bản trên claude.ai (artifact) chỉ là `index.html` một tệp; slide ở Pages.

## CHUẨN BÀI GIẢNG MỚI (đang viết lại từng đợt; Python 1A/1B/1C là bản mẫu)
Phản hồi của giáo viên: slide cũ quá ngắn, học sinh không tự học được. Mọi bài phải **dạy đủ những gì đề và câu hỏi hỏi**.
- Dùng `slides/lib5.py` (P, STEPS, MEM, SELF, NUMLINE, ERR) + `lib3/lib2`. Xem `slides/d_p1a.py`, `d_p1b.py`, `d_p1c.py`.
- Mỗi khái niệm: (1) vì sao cần/ví dụ đời thường → (2) giải thích bằng lời, từng bước → (3) bảng theo dõi hoặc sơ đồ → (4) ví dụ chạy thật → (5) lỗi thường gặp → (6) câu tự kiểm tra có đáp án giải thích từng bước.
- **Phủ nội dung**: trước khi viết bài, liệt kê câu hỏi trong `bank.json` thuộc bài đó (theo `topic`, `tags`, từ khoá) và bảo đảm mỗi khái niệm các câu đó kiểm tra đều có slide dạy (kể cả mục NÂNG CAO kiểu HSG: số âm với // và %, round chẵn, ** phải sang trái, đoản mạch...).
- Mỗi bài có thể gồm nhiều bộ (1A, 1B, 1C...), mỗi bộ 30–45 slide; nối vào `DECK` trong `learnui.js`.
- Làm theo từng đợt nhỏ, gửi giáo viên duyệt trước khi sang bài kế tiếp.
