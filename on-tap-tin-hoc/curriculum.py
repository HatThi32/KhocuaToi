# -*- coding: utf-8 -*-
"""Chương trình Tin học THPT - bộ sách Kết nối tri thức, định hướng Tin học ứng dụng (ICT).

Danh sách này chỉ dùng để khởi tạo dữ liệu lần đầu. Sau đó giáo viên có thể
thêm / sửa / xoá bài học ngay trong app (mục "Chương trình").

period: phạm vi kiểm tra mặc định của bài
  hk1a = trước giữa kì 1, hk1b = giữa kì 1 -> cuối kì 1,
  hk2a = trước giữa kì 2, hk2b = giữa kì 2 -> cuối kì 2.
"""

CURRICULUM = {
    10: [
        ("Chủ đề 1", "Máy tính và xã hội tri thức", [
            "Bài 1. Thông tin và xử lí thông tin",
            "Bài 2. Vai trò của thiết bị thông minh và tin học đối với xã hội",
            "Bài 3. Một số kiểu dữ liệu và dữ liệu văn bản",
            "Bài 4. Hệ nhị phân và dữ liệu số nguyên",
            "Bài 5. Dữ liệu lôgic",
            "Bài 6. Dữ liệu âm thanh và hình ảnh",
            "Bài 7. Thực hành sử dụng thiết bị số thông dụng",
        ]),
        ("Chủ đề 2", "Mạng máy tính và Internet", [
            "Bài 8. Mạng máy tính trong cuộc sống hiện đại",
            "Bài 9. An toàn trên không gian mạng",
            "Bài 10. Thực hành khai thác tài nguyên trên Internet",
        ]),
        ("Chủ đề 3", "Đạo đức, pháp luật và văn hoá trong môi trường số", [
            "Bài 11. Ứng xử trên môi trường số. Nghĩa vụ tôn trọng bản quyền",
        ]),
        ("Chủ đề 4", "Ứng dụng tin học", [
            "Bài 12. Phần mềm thiết kế đồ hoạ",
            "Bài 13. Bổ sung các đối tượng đồ hoạ",
            "Bài 14. Làm việc với đối tượng đường và văn bản",
            "Bài 15. Hoàn thiện hình ảnh đồ hoạ",
        ]),
        ("Chủ đề 5", "Giải quyết vấn đề với sự trợ giúp của máy tính", [
            "Bài 16. Ngôn ngữ lập trình bậc cao và Python",
            "Bài 17. Biến và lệnh gán",
            "Bài 18. Các lệnh vào ra đơn giản",
            "Bài 19. Câu lệnh rẽ nhánh if",
            "Bài 20. Câu lệnh lặp for",
            "Bài 21. Câu lệnh lặp while",
            "Bài 22. Kiểu dữ liệu danh sách",
            "Bài 23. Một số lệnh làm việc với dữ liệu danh sách",
            "Bài 24. Xâu kí tự",
            "Bài 25. Một số lệnh làm việc với xâu kí tự",
            "Bài 26. Hàm trong Python",
            "Bài 27. Tham số của hàm",
            "Bài 28. Phạm vi của biến",
            "Bài 29. Nhận biết lỗi chương trình",
            "Bài 30. Kiểm thử và gỡ lỗi chương trình",
            "Bài 31. Thực hành viết chương trình đơn giản",
            "Bài 32. Ôn tập lập trình Python",
        ]),
        ("Chủ đề 6", "Hướng nghiệp với tin học", [
            "Bài 33. Nghề thiết kế đồ hoạ máy tính",
            "Bài 34. Nghề phát triển phần mềm",
        ]),
    ],
    11: [
        ("Chủ đề 1", "Máy tính và xã hội tri thức", [
            "Bài 1. Hệ điều hành",
            "Bài 2. Thực hành sử dụng hệ điều hành",
            "Bài 3. Phần mềm nguồn mở và phần mềm chạy trên Internet",
            "Bài 4. Bên trong máy tính",
            "Bài 5. Kết nối máy tính với các thiết bị số",
        ]),
        ("Chủ đề 2", "Tổ chức lưu trữ, tìm kiếm và trao đổi thông tin", [
            "Bài 6. Lưu trữ và chia sẻ tệp tin trên Internet",
            "Bài 7. Thực hành tìm kiếm thông tin trên Internet",
            "Bài 8. Thực hành nâng cao sử dụng thư điện tử và mạng xã hội",
        ]),
        ("Chủ đề 3", "Đạo đức, pháp luật và văn hoá trong môi trường số", [
            "Bài 9. Giao tiếp an toàn trên Internet",
        ]),
        ("Chủ đề 4", "Giới thiệu các hệ cơ sở dữ liệu", [
            "Bài 10. Lưu trữ dữ liệu và khai thác thông tin phục vụ quản lí",
            "Bài 11. Cơ sở dữ liệu",
            "Bài 12. Hệ quản trị cơ sở dữ liệu và hệ cơ sở dữ liệu",
            "Bài 13. Cơ sở dữ liệu quan hệ",
            "Bài 14. SQL - Ngôn ngữ truy vấn có cấu trúc",
            "Bài 15. Bảo mật và an toàn hệ cơ sở dữ liệu",
        ]),
        ("Chủ đề 5", "Hướng nghiệp với tin học", [
            "Bài 16. Công việc quản trị cơ sở dữ liệu",
        ]),
        ("Chủ đề 6", "Thực hành tạo và khai thác cơ sở dữ liệu", [
            "Bài 17. Quản trị cơ sở dữ liệu trên máy tính",
            "Bài 18. Thực hành xác định cấu trúc bảng và các trường khoá",
            "Bài 19. Thực hành tạo lập cơ sở dữ liệu và các bảng",
            "Bài 20. Thực hành tạo lập các bảng có khoá ngoài",
            "Bài 21. Thực hành cập nhật và truy xuất dữ liệu các bảng",
            "Bài 22. Thực hành cập nhật bảng dữ liệu có tham chiếu",
            "Bài 23. Thực hành truy xuất dữ liệu qua liên kết các bảng",
            "Bài 24. Thực hành sao lưu dữ liệu",
        ]),
        ("Chủ đề 7", "Phần mềm chỉnh sửa ảnh và làm video", [
            "Bài 25. Phần mềm chỉnh sửa ảnh",
            "Bài 26. Công cụ tinh chỉnh màu sắc và công cụ chọn",
            "Bài 27. Công cụ vẽ và một số ứng dụng",
            "Bài 28. Tạo ảnh động",
            "Bài 29. Khám phá phần mềm làm phim",
            "Bài 30. Biên tập phim",
            "Bài 31. Thực hành tạo phim hoạt hình",
        ]),
    ],
    12: [
        ("Chủ đề 1", "Máy tính và xã hội tri thức", [
            "Bài 1. Làm quen với trí tuệ nhân tạo",
            "Bài 2. Trí tuệ nhân tạo trong khoa học và đời sống",
        ]),
        ("Chủ đề 2", "Mạng máy tính và Internet", [
            "Bài 3. Một số thiết bị mạng thông dụng",
            "Bài 4. Giao thức mạng",
            "Bài 5. Thực hành chia sẻ tài nguyên trên mạng",
        ]),
        ("Chủ đề 3", "Đạo đức, pháp luật và văn hoá trong môi trường số", [
            "Bài 6. Giao tiếp và ứng xử trong không gian mạng",
        ]),
        ("Chủ đề 4", "Giải quyết vấn đề với sự trợ giúp của máy tính", [
            "Bài 7. HTML và cấu trúc trang web",
            "Bài 8. Định dạng văn bản",
            "Bài 9. Tạo danh sách, bảng",
            "Bài 10. Tạo liên kết",
            "Bài 11. Chèn tệp tin đa phương tiện và khung nội tuyến vào trang web",
            "Bài 12. Tạo biểu mẫu",
            "Bài 13. Khái niệm, vai trò của CSS",
            "Bài 14. Định dạng văn bản bằng CSS",
            "Bài 15. Tạo màu cho chữ và nền",
            "Bài 16. Định dạng khung",
            "Bài 17. Các mức ưu tiên của bộ chọn",
            "Bài 18. Thực hành tổng hợp thiết kế trang web",
        ]),
        ("Chủ đề 5", "Hướng nghiệp với tin học", [
            "Bài 19. Dịch vụ sửa chữa và bảo trì máy tính",
            "Bài 20. Nhóm nghề quản trị thuộc ngành Công nghệ thông tin",
            "Bài 21. Hội thảo hướng nghiệp",
        ]),
        ("Chủ đề 6", "Máy tính và xã hội tri thức (ICT)", [
            "Bài 22. Thực hành kết nối các thiết bị số",
        ]),
        ("Chủ đề 7", "Ứng dụng tin học (ICT)", [
            "Bài 23. Chuẩn bị xây dựng trang web",
            "Bài 24. Xây dựng phần đầu trang web",
            "Bài 25. Xây dựng phần thân và chân trang web",
            "Bài 26. Liên kết và thanh điều hướng",
            "Bài 27. Biểu mẫu trên trang web",
            "Bài 28. Thực hành tổng hợp",
        ]),
    ],
}

# Tên bài/chủ đề do phiên bản trước tạo sai (đoán khi chưa có SGK). Khi khởi động, app tự đổi sang tên đúng
# nếu thầy cô chưa tự sửa các tên này.
OLD_NAMES = {
    "Bài 26. Công cụ tẩy xoá và sửa ảnh", "Bài 22. Tìm hiểu thiết bị mạng", "Bài 23. Đường truyền mạng và ứng dụng",
    "Bài 24. Sơ bộ về thiết kế mạng", "Bài 25. Làm quen với phần mềm tạo trang web", "Bài 26. Thiết kế và tạo trang web",
    "Bài 27. Thực hành tổng hợp tạo trang web", "Bài 20. Nhóm nghề quản trị thuộc ngành công nghệ thông tin",
    "Phần mềm chỉnh sửa ảnh và làm video (ICT)", "Mạng máy tính và Internet (ICT)",
}


def default_period(index, total):
    """Chia đều bài học vào 4 giai đoạn của năm học (giáo viên chỉnh lại trong app)."""
    q = index / max(total, 1)
    if q < 0.25:
        return "hk1a"
    if q < 0.5:
        return "hk1b"
    if q < 0.75:
        return "hk2a"
    return "hk2b"


# Câu hỏi mẫu để app không trống khi mở lần đầu: (lớp, số bài, câu hỏi)
SAMPLE_QUESTIONS = [
    (10, 4, {"type": "tf", "level": "TH", "content": "Xét số nhị phân 1011₂.",
             "data": {"statements": ["Số này bằng 11 trong hệ thập phân.", "Số này được biểu diễn bằng 4 bit.",
                                     "1011₂ + 1₂ = 1100₂.", "Số này là số chẵn."],
                      "answers": [True, True, True, False]},
             "explanation": "1011₂ = 8 + 0 + 2 + 1 = 11. Cộng thêm 1 được 12 = 1100₂. Bit cuối là 1 nên là số lẻ."}),
    (10, 17, {"type": "mcq", "level": "NB", "content": "Trong Python, câu lệnh nào sau đây gán giá trị 5 cho biến `x`?",
              "data": {"options": ["x == 5", "x = 5", "5 = x", "let x = 5"], "answer": 1},
              "explanation": "Lệnh gán trong Python dùng dấu `=`; `==` là phép so sánh."}),
    (10, 17, {"type": "short", "level": "TH",
              "content": "Sau khi thực hiện đoạn chương trình sau, biến `a` có giá trị bằng bao nhiêu?\n```python\na = 7\nb = 3\na = a // b + a % b\n```",
              "data": {"answer": "3", "alternatives": []},
              "explanation": "7 // 3 = 2 và 7 % 3 = 1 nên a = 2 + 1 = 3."}),
    (10, 19, {"type": "tf", "level": "TH",
              "content": "Cho đoạn chương trình:\n```python\nx = int(input())\nif x % 2 == 0:\n    print('Chẵn')\nelse:\n    print('Lẻ')\n```",
              "data": {"statements": ["Nếu nhập 4, chương trình in ra Chẵn.", "Nếu nhập 7, chương trình in ra Chẵn.",
                                      "Biểu thức x % 2 == 0 có giá trị kiểu bool.",
                                      "Có thể bỏ dấu : sau từ khoá else mà chương trình vẫn chạy đúng."],
                       "answers": [True, False, True, False]},
              "explanation": "4 chia hết cho 2 nên in Chẵn; 7 là số lẻ. Phép so sánh trả về True/False. Thiếu dấu : sẽ gây lỗi cú pháp."}),
    (10, 20, {"type": "order", "level": "VD",
              "content": "Sắp xếp các dòng lệnh sau để được chương trình tính tổng các số từ 1 đến n.",
              "data": {"items": ["n = int(input())", "s = 0", "for i in range(1, n + 1):", "    s = s + i", "print(s)"]},
              "explanation": "Nhập n, khởi tạo tổng s = 0, lặp i từ 1 đến n để cộng dồn, cuối cùng in s."}),
    (10, 20, {"type": "fill", "level": "TH",
              "content": "Lệnh `for i in range(___, 10)` cho i chạy từ 1 đến 9. Lệnh `range(10)` tạo dãy số nguyên từ 0 đến ___.",
              "data": {"blanks": ["1", "9"]},
              "explanation": "range(a, b) sinh các số từ a đến b - 1."}),
    (11, 11, {"type": "essay", "level": "VD",
              "content": "Nêu khái niệm cơ sở dữ liệu và cho một ví dụ về cơ sở dữ liệu được sử dụng trong nhà trường.",
              "data": {"rubric": "- Nêu đúng khái niệm CSDL: tập hợp dữ liệu có liên quan với nhau, được lưu trữ có tổ chức trên thiết bị nhớ, đáp ứng nhu cầu khai thác thông tin của nhiều người dùng (0,6 điểm).\n- Ví dụ hợp lí trong nhà trường, nêu được một vài dữ liệu được lưu (0,4 điểm).",
                       "sample": "Cơ sở dữ liệu là một tập hợp các dữ liệu có liên quan với nhau, được lưu trữ một cách có tổ chức trên các thiết bị nhớ để đáp ứng nhu cầu khai thác thông tin của nhiều người dùng. Ví dụ: CSDL quản lí học sinh lưu họ tên, ngày sinh, lớp, điểm các môn của từng học sinh."},
              "explanation": ""}),
    (11, 14, {"type": "mcq", "level": "NB", "content": "Trong SQL, câu lệnh nào dùng để truy xuất (lấy) dữ liệu từ bảng?",
              "data": {"options": ["INSERT", "UPDATE", "SELECT", "DELETE"], "answer": 2},
              "explanation": "SELECT dùng để truy vấn dữ liệu; INSERT thêm, UPDATE sửa, DELETE xoá."}),
    (11, 14, {"type": "match", "level": "NB", "content": "Ghép mỗi câu lệnh SQL với chức năng tương ứng.",
              "data": {"pairs": [["CREATE TABLE", "Tạo bảng mới"], ["INSERT INTO", "Thêm bản ghi"],
                                 ["UPDATE", "Sửa dữ liệu"], ["DELETE", "Xoá bản ghi"]]},
              "explanation": ""}),
    (12, 7, {"type": "mcq", "level": "NB", "content": "Thẻ HTML nào tạo tiêu đề mục có cỡ chữ lớn nhất?",
             "data": {"options": ["<h6>", "<head>", "<h1>", "<title>"], "answer": 2},
             "explanation": "Các thẻ tiêu đề từ <h1> (lớn nhất) đến <h6> (nhỏ nhất). <title> là tiêu đề của trang trên thanh tab."}),
    (12, 10, {"type": "short", "level": "NB",
              "content": "Thuộc tính nào của thẻ `<a>` dùng để chỉ định địa chỉ đích của liên kết?",
              "data": {"answer": "href", "alternatives": []},
              "explanation": "Ví dụ: <a href=\"https://example.com\">Trang ví dụ</a>."}),
]
