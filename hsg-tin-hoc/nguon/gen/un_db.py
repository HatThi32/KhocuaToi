# -*- coding: utf-8 -*-
from un_base import *
DBX="""CREATE TABLE KhachHang(MaKH INTEGER PRIMARY KEY,Ten TEXT,ThanhPho TEXT);
CREATE TABLE DonHang(MaDH INTEGER PRIMARY KEY,MaKH INTEGER REFERENCES KhachHang(MaKH),SoTien INTEGER);
INSERT INTO KhachHang VALUES(1,'An','Huế'),(2,'Bình','Đà Nẵng'),(3,'Chi','Huế'),(4,'Dũng','Quảng Nam');
INSERT INTO DonHang VALUES(1,1,50),(2,1,30),(3,2,70),(4,3,20),(5,3,40),(6,3,10),(7,9,99);"""
unit('c1','csdl','Cơ sở dữ liệu và hệ quản trị',7,
 ['Phân biệt CSDL, hệ QTCSDL và ứng dụng.','Nêu chức năng của hệ QTCSDL.','Biết lợi ích so với lưu tệp rời rạc.'],
 [sec('Khái niệm',['CSDL là tập dữ liệu có cấu trúc, lưu trữ lâu dài, chia sẻ cho nhiều người dùng. Hệ QTCSDL là phần mềm tạo, cập nhật, truy vấn và bảo vệ CSDL. Hai thứ khác nhau: CSDL là dữ liệu, hệ QTCSDL là phần mềm.'],key='Hệ QTCSDL: tạo cấu trúc, cập nhật dữ liệu, truy vấn, kiểm soát truy cập, sao lưu/khôi phục.'),
  sec('Lợi ích',['Giảm dư thừa và mâu thuẫn dữ liệu, dùng chung, nhất quán nhờ ràng buộc, bảo mật nhờ phân quyền, khôi phục khi có sự cố.'])],
 ['csdl-khainiem'])
unit('c2','csdl','Khoá, ràng buộc và kiểu dữ liệu',8,
 ['Phân biệt khoá chính và khoá ngoài.','Hiểu ràng buộc toàn vẹn tham chiếu.','Chọn kiểu dữ liệu phù hợp.'],
 [sec('Khoá chính và khoá ngoài',['Khoá chính: duy nhất, không rỗng, định danh từng dòng. Khoá ngoài: cột trỏ tới khoá chính bảng khác; giá trị phải tồn tại ở bảng được tham chiếu (hoặc rỗng).'],fig='csdl_khoa',hard=True,key='Không thể thêm đơn hàng cho khách chưa có, và không xoá khách khi còn đơn tham chiếu (nếu không có CASCADE).'),
  sec('Kiểu dữ liệu',['INTEGER cho số nguyên, REAL/DECIMAL cho số thực, VARCHAR/TEXT cho văn bản, DATE cho ngày. Số điện thoại hay mã có số 0 đầu nên lưu dạng văn bản.'])],
 ['csdl-khoa','csdl-kieu','sql-rangbuoc','S8','S9'])
unit('c3','csdl','SQL: truy vấn và nhóm',11,
 ['Viết đúng thứ tự mệnh đề SELECT.','Phân biệt WHERE và HAVING.','Đọc kết quả GROUP BY.'],
 [sec('Thứ tự thực hiện',['Viết: SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY. Thực hiện: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. Vì vậy WHERE không dùng được hàm tổng hợp; phải dùng HAVING.'],fig='sql_pipeline',key='WHERE lọc DÒNG trước khi nhóm; HAVING lọc NHÓM sau khi nhóm.',hard=True),
  sec('Hàm tổng hợp',['COUNT(*) đếm mọi dòng; COUNT(cột) bỏ qua NULL; COUNT(DISTINCT cột) chỉ đếm giá trị khác nhau; SUM, AVG, MIN, MAX.'],sql=dict(db=DBX,q='SELECT COUNT(*), COUNT(DISTINCT MaKH), SUM(SoTien), MAX(SoTien) FROM DonHang;')),
  sec('GROUP BY và HAVING',['Mỗi nhóm cho ra một dòng. Cột trong SELECT hoặc nằm trong GROUP BY, hoặc nằm trong hàm tổng hợp.'],fig='sql_group',sql=dict(db=DBX,q='SELECT MaKH, COUNT(*) AS SoDon, SUM(SoTien) AS Tong\nFROM DonHang\nGROUP BY MaKH\nHAVING COUNT(*) >= 2\nORDER BY Tong DESC;'))],
 ['sql-group','sql-aggregate','sql-co-ban','S1','S2','S3','S4','S5','S7','S10'])
unit('c4','csdl','SQL: liên kết bảng và truy vấn con',11,
 ['Phân biệt INNER JOIN và LEFT JOIN.','Viết truy vấn con trong WHERE.','Dự đoán số dòng kết quả.'],
 [sec('JOIN',['INNER JOIN chỉ giữ cặp dòng khớp điều kiện. LEFT JOIN giữ mọi dòng bảng trái, dòng không khớp có NULL ở cột bảng phải. Dòng đơn hàng mồ côi (MaKH=9) không xuất hiện ở cả hai.'],fig='sql_join',hard=True,sql=dict(db=DBX,q='SELECT K.Ten, D.MaDH, D.SoTien\nFROM KhachHang K LEFT JOIN DonHang D ON K.MaKH = D.MaKH\nORDER BY K.MaKH, D.MaDH;')),
  sec('Truy vấn con',['Truy vấn trong ngoặc, chạy trước, trả về giá trị hoặc tập giá trị cho truy vấn ngoài. Dùng = với một giá trị, IN với nhiều giá trị.'],sql=dict(db=DBX,q='SELECT Ten FROM KhachHang\nWHERE MaKH IN (SELECT MaKH FROM DonHang WHERE SoTien > 40);'))],
 ['sql-join','sql-subquery','S6'])
unit('c5','csdl','An toàn và phân quyền CSDL',6,
 ['Nêu các biện pháp bảo vệ CSDL.','Dùng GRANT, REVOKE.'],
 [sec('Bảo mật',['Gồm xác thực người dùng, phân quyền, mã hoá, sao lưu định kì, ghi nhật kí truy cập. GRANT cấp quyền, REVOKE thu hồi quyền.'],code='GRANT SELECT, INSERT ON KhachHang TO nhanvien;\nREVOKE INSERT ON KhachHang FROM nhanvien;',lang='sql',key='Nguyên tắc đặc quyền tối thiểu: chỉ cấp quyền cần thiết.')],
 ['csdl-baomat','sql-quyen'])
