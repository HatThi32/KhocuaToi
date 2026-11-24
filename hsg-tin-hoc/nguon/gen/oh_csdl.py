W={
'csdl-sql-rangbuoc-15':["INSERT idNhacsi=99 vi phạm khoá ngoài (không có ở bảng cha); DELETE nhạc sĩ còn bản nhạc cũng bị từ chối.","Khoá ngoài được hệ QTCSDL kiểm tra tự động.","Thao tác (1) không thành công vì 99 không tồn tại.","Thao tác (2) không tự xoá các bản nhạc liên quan, trừ khi khai báo ON DELETE CASCADE."],
'csdl-sql-rangbuoc-16':["Không có WHERE: tăng SoGio ở mọi dòng.","Không chỉ dòng lớn nhất.","UPDATE không bắt buộc WHERE.","Không chỉ dòng đầu."],
'csdl-sql-quyen-17':["SET và DROP không phải lệnh phân quyền.","Đúng lệnh nhưng GRANT ALL cấp quá quyền và REVOKE SELECT thu mất quyền đọc.","GRANT SELECT cho đọc; REVOKE CREATE, ALTER … FROM thu quyền.","REVOKE SELECT làm mất quyền đọc, GRANT CREATE, ALTER cấp thêm quyền, ngược yêu cầu."],
'csdl-csdl-khainiem-18':["Bảng tính không phải hệ QTCSDL.","Hệ QTCSDL: lưu trữ, cập nhật, truy xuất, kiểm soát quyền, sao lưu, API.","Cáp, thiết bị kết nối là mạng.","Chỉ lưu trữ là thiếu nhiều chức năng."],
'csdl-csdl-khainiem-19':["Kiểm soát giao dịch bảo đảm nhất quán khi nhiều người truy cập đồng thời.","API không giải quyết tranh chấp.","Sao lưu không giải quyết truy cập đồng thời.","Kiểm soát quyền không giải quyết xung đột sửa/xoá."],
'csdl-csdl-baomat-20':["Cả hai không phân chia phần cứng/phần mềm.","Bảo mật ngăn truy cập trái phép; an toàn dữ liệu giúp khôi phục khi sự cố.","Đảo ngược nghĩa.","Hai khái niệm khác nhau."],
'csdl-csdl-baomat-21':["Chỉ INSERT cho mọi người khiến không xem được.","ALL cho mọi người là quá quyền.","Nguyên tắc quyền tối thiểu: khách SELECT; nhóm thêm SELECT+INSERT; quản lí thêm UPDATE, DELETE.","Dùng chung một tài khoản mất kiểm soát."],
'csdl-csdl-khainiem-22':["CSDL phân tán lưu ở nhiều máy, nhiều nơi nhưng truy cập thống nhất.","Một máy duy nhất là CSDL tập trung.","Vẫn có khoá chính.","Phân tán cần mạng, không phải khi không có Internet."],
'csdl-csdl-khoa-23':["Không bắt buộc mỗi bảng có đúng một khoá ngoài.","Khoá chính xác định duy nhất bản ghi; khoá ngoài tham chiếu khoá chính bảng khác.","Việc xác định duy nhất là của khoá chính.","Khoá chính không được trùng và không rỗng."],
'csdl-csdl-khoa-24':["MaKT do hệ thống cấp, duy nhất, ổn định.","SDT có thể thay đổi nên không ổn định.","Tên có thể trùng.","Cặp (tên, SDT) vẫn không đảm bảo ổn định."],
'csdl-csdl-kieu-25':["DATE là kiểu ngày tháng.","Mã vạch là định danh không tính toán, có thể đầu 0 nên dùng CHAR/VARCHAR.","FLOAT không phù hợp.","INT làm mất số 0 đầu và có thể tràn."],
}
