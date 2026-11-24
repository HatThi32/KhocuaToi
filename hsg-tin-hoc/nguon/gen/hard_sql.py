# -*- coding: utf-8 -*-
from hardlib import *
S6=['S6'];G=['S10','S3']
# ---------- thuexe ----------
OPEN('h-sql-01','thuexe',S6,"Liệt kê mã và tên những khách CHƯA TỪNG thuê xe điện (kể cả khách chưa thuê lần nào). Sắp xếp theo mã khách.",
"SELECT k.MaKT, k.TenKT\nFROM KhachThue k\nWHERE NOT EXISTS (SELECT 1 FROM LuotThue l INNER JOIN PhuongTien p ON l.MaPT = p.MaPT\n                  WHERE l.MaKT = k.MaKT AND p.LoaiPT = 'Xe điện')\nORDER BY k.MaKT;",
"Phủ định “chưa từng” phải dùng NOT EXISTS (hoặc NOT IN) trên TOÀN BỘ lượt thuê của khách, không thể viết WHERE LoaiPT <> 'Xe điện' vì cách đó vẫn giữ khách đã thuê xe điện nếu họ có thêm lượt thuê xe khác.",
alts=["SELECT MaKT, TenKT FROM KhachThue WHERE MaKT NOT IN (SELECT l.MaKT FROM LuotThue l INNER JOIN PhuongTien p ON l.MaPT = p.MaPT WHERE p.LoaiPT = 'Xe điện') ORDER BY MaKT;"],ordered=True)
MCQ('h-sql-02','thuexe',S6,"Cho biết mã khách đã thuê ÍT NHẤT HAI LOẠI phương tiện khác nhau. Truy vấn nào đúng?",
"SELECT l.MaKT\nFROM LuotThue l INNER JOIN PhuongTien p ON l.MaPT = p.MaPT\nGROUP BY l.MaKT\nHAVING COUNT(DISTINCT p.LoaiPT) >= 2;",
["SELECT l.MaKT\nFROM LuotThue l INNER JOIN PhuongTien p ON l.MaPT = p.MaPT\nGROUP BY l.MaKT\nHAVING COUNT(p.LoaiPT) >= 2;",
 "SELECT l.MaKT\nFROM LuotThue l INNER JOIN PhuongTien p ON l.MaPT = p.MaPT\nWHERE COUNT(DISTINCT p.LoaiPT) >= 2\nGROUP BY l.MaKT;",
 "SELECT DISTINCT l.MaKT\nFROM LuotThue l INNER JOIN PhuongTien p ON l.MaPT = p.MaPT\nWHERE p.LoaiPT = 'Xe điện' AND p.LoaiPT = 'Xe đạp';"],
"Đếm số LOẠI khác nhau phải dùng COUNT(DISTINCT LoaiPT) trong HAVING. COUNT(LoaiPT) đếm số lượt nên khách thuê 2 lần cùng loại cũng lọt.",
["Đúng: DISTINCT đếm loại, HAVING lọc nhóm.","Sai: COUNT không DISTINCT đếm lượt thuê, khách thuê hai lần xe điện cũng được chọn.","Sai: không được đặt hàm tổng hợp trong WHERE (lỗi).","Sai: một dòng không thể đồng thời có hai loại xe; điều kiện không bao giờ đúng."])
OPEN('h-sql-03','thuexe',G,"Liệt kê MỌI khách (kể cả khách chưa thuê lần nào) cùng tổng số giờ đã thuê (cột TongGio, bằng 0 nếu chưa thuê). Sắp xếp giảm dần theo TongGio rồi theo mã khách.",
"SELECT k.MaKT, k.TenKT, COALESCE(SUM(l.SoGio), 0) AS TongGio\nFROM KhachThue k LEFT JOIN LuotThue l ON k.MaKT = l.MaKT\nGROUP BY k.MaKT, k.TenKT\nORDER BY TongGio DESC, k.MaKT;",
"LEFT JOIN giữ khách chưa thuê (cột của LuotThue là NULL); SUM của nhóm toàn NULL là NULL nên phải đổi thành 0 bằng COALESCE (hoặc IFNULL).",
ordered=True)
PRED('h-sql-04','thuexe',G,"Dự đoán kết quả truy vấn sau (chú ý khách Khoa chưa thuê lần nào):",
"SELECT k.TenKT, COUNT(l.MaLuot) AS a, COUNT(*) AS b\nFROM KhachThue k LEFT JOIN LuotThue l ON k.MaKT = l.MaKT\nWHERE k.TenKT IN ('Khoa', 'Hà')\nGROUP BY k.TenKT\nORDER BY k.TenKT;",
["Hà,1,1; Khoa,0,0","Hà,1,1; Khoa,1,1","Hà,1,1; Khoa,0,1 (thứ tự đổi chỗ: Khoa trước)","Chỉ có dòng Hà,1,1 vì Khoa không có lượt thuê"],
"COUNT(cột) bỏ qua NULL còn COUNT(*) đếm mọi dòng của nhóm, kể cả dòng được tạo bởi LEFT JOIN.",seed=3)
OPEN('h-sql-05','thuexe',S6,"Liệt kê mã khách có TỔNG số giờ thuê lớn hơn mức trung bình tổng số giờ của các khách đã thuê. Sắp xếp theo mã khách.",
"SELECT MaKT\nFROM LuotThue\nGROUP BY MaKT\nHAVING SUM(SoGio) > (SELECT AVG(t.Tong)\n                     FROM (SELECT SUM(SoGio) AS Tong FROM LuotThue GROUP BY MaKT) t)\nORDER BY MaKT;",
"Cần hai tầng gom nhóm: tầng trong tính tổng giờ mỗi khách, tầng ngoài lấy trung bình của các tổng đó. Không thể viết AVG(SUM(SoGio)).",ordered=True)
OPEN('h-sql-06','thuexe',S6,"Cho biết mã khách đã thuê CẢ HAI xe điện P01 và P02 (khách phải có đủ cả hai phương tiện). Sắp xếp theo mã khách.",
"SELECT MaKT\nFROM LuotThue\nWHERE MaPT IN ('P01', 'P02')\nGROUP BY MaKT\nHAVING COUNT(DISTINCT MaPT) = 2\nORDER BY MaKT;",
"Bài toán “có đủ tất cả”: lọc các phương tiện cần có, đếm số phương tiện khác nhau rồi so với số lượng yêu cầu.",
alts=["SELECT MaKT FROM KhachThue k WHERE EXISTS (SELECT 1 FROM LuotThue WHERE MaKT = k.MaKT AND MaPT = 'P01') AND EXISTS (SELECT 1 FROM LuotThue WHERE MaKT = k.MaKT AND MaPT = 'P02') ORDER BY MaKT;"],ordered=True)
OPEN('h-sql-07','thuexe',G,"Phân loại lượt thuê theo số giờ: 'Dài' nếu SoGio >= 5, 'Vừa' nếu từ 3 đến 4, 'Ngắn' còn lại. Cho biết mỗi loại (cột PhanLoai) có bao nhiêu lượt (cột SoLuot), sắp xếp theo PhanLoai.",
"SELECT CASE WHEN SoGio >= 5 THEN 'Dài' WHEN SoGio >= 3 THEN 'Vừa' ELSE 'Ngắn' END AS PhanLoai,\n       COUNT(*) AS SoLuot\nFROM LuotThue\nGROUP BY CASE WHEN SoGio >= 5 THEN 'Dài' WHEN SoGio >= 3 THEN 'Vừa' ELSE 'Ngắn' END\nORDER BY PhanLoai;",
"CASE WHEN được kiểm tra từ trên xuống và dừng ở nhánh đúng đầu tiên, nên thứ tự các điều kiện quyết định kết quả.",ordered=True)
OPEN('h-sql-08','thuexe',S6,"Liệt kê các cặp khách (TenKT1, TenKT2 với MaKT1 < MaKT2) đã từng thuê cùng một phương tiện. Mỗi cặp một lần, sắp xếp theo tên thứ nhất rồi tên thứ hai.",
"SELECT DISTINCT a.TenKT AS TenKT1, b.TenKT AS TenKT2\nFROM (SELECT DISTINCT l.MaKT, k.TenKT, l.MaPT FROM LuotThue l INNER JOIN KhachThue k ON l.MaKT = k.MaKT) a\n  INNER JOIN (SELECT DISTINCT l.MaKT, k.TenKT, l.MaPT FROM LuotThue l INNER JOIN KhachThue k ON l.MaKT = k.MaKT) b\n  ON a.MaPT = b.MaPT AND a.MaKT < b.MaKT\nORDER BY TenKT1, TenKT2;",
"Tự kết nối bảng: điều kiện MaKT1 < MaKT2 loại bỏ cặp (A,A) và cặp đảo (B,A); DISTINCT loại cặp lặp do thuê nhiều lần.",ordered=True)
# ---------- quanly_diem ----------
OPEN('h-sql-09','quanly_diem',S6,"Liệt kê mã học sinh có điểm Tin năm học '2024-2025' CAO HƠN điểm Tin trung bình của năm học đó, kèm điểm (cột Diem). Sắp xếp giảm dần theo điểm, rồi theo mã.",
"SELECT MaHS, Diem\nFROM KetQua\nWHERE MaMon = 'TIN' AND NamHoc = '2024-2025'\n  AND Diem > (SELECT AVG(Diem) FROM KetQua WHERE MaMon = 'TIN' AND NamHoc = '2024-2025')\nORDER BY Diem DESC, MaHS;",
"Truy vấn con tính trung bình phải có CÙNG phạm vi (môn, năm) với truy vấn ngoài; nếu bỏ điều kiện, trung bình sẽ lẫn các môn và năm khác.",ordered=True)
OPEN('h-sql-10','quanly_diem',S6,"Với mỗi lớp, cho biết tên học sinh có điểm Tin cao nhất lớp trong năm học '2024-2025' (cột Lop, TenHS, Diem). Nếu đồng hạng, liệt kê tất cả. Sắp xếp theo lớp.",
"SELECT h.Lop, h.TenHS, k.Diem\nFROM HocSinh h INNER JOIN KetQua k ON h.MaHS = k.MaHS\nWHERE k.MaMon = 'TIN' AND k.NamHoc = '2024-2025'\n  AND k.Diem = (SELECT MAX(k2.Diem)\n                FROM HocSinh h2 INNER JOIN KetQua k2 ON h2.MaHS = k2.MaHS\n                WHERE h2.Lop = h.Lop AND k2.MaMon = 'TIN' AND k2.NamHoc = '2024-2025')\nORDER BY h.Lop;",
"Truy vấn con TƯƠNG QUAN: mỗi dòng ngoài (một lớp) được đem so với MAX tính riêng cho lớp đó (h2.Lop = h.Lop). Dùng = nên đồng hạng đều được giữ.",ordered=True)
OPEN('h-sql-11','quanly_diem',S6,"Liệt kê tên học sinh CHƯA CÓ điểm nào trong bảng KetQua.",
"SELECT h.TenHS\nFROM HocSinh h LEFT JOIN KetQua k ON h.MaHS = k.MaHS\nWHERE k.MaKQ IS NULL;",
"LEFT JOIN rồi lọc IS NULL trên khoá của bảng phải để tìm các dòng không có bản ghi tương ứng. Không dùng = NULL.",
alts=["SELECT TenHS FROM HocSinh WHERE MaHS NOT IN (SELECT MaHS FROM KetQua);","SELECT TenHS FROM HocSinh h WHERE NOT EXISTS (SELECT 1 FROM KetQua k WHERE k.MaHS = h.MaHS);"])
OPEN('h-sql-12','quanly_diem',S6,"Liệt kê mã học sinh CÓ điểm Tin năm '2024-2025' nhưng KHÔNG có điểm Toán năm '2024-2025'. Sắp xếp theo mã.",
"SELECT DISTINCT t.MaHS\nFROM KetQua t\nWHERE t.MaMon = 'TIN' AND t.NamHoc = '2024-2025'\n  AND NOT EXISTS (SELECT 1 FROM KetQua x WHERE x.MaHS = t.MaHS AND x.MaMon = 'TOA' AND x.NamHoc = '2024-2025')\nORDER BY t.MaHS;",
"Hiệu của hai tập: có Tin, và không tồn tại dòng Toán cùng học sinh, cùng năm. Nhớ lặp lại điều kiện năm học trong NOT EXISTS.",
alts=["SELECT MaHS FROM KetQua WHERE MaMon = 'TIN' AND NamHoc = '2024-2025' AND MaHS NOT IN (SELECT MaHS FROM KetQua WHERE MaMon = 'TOA' AND NamHoc = '2024-2025') ORDER BY MaHS;"],ordered=True)
OPEN('h-sql-13','quanly_diem',S6,"Liệt kê tên học sinh có điểm Tin năm '2024-2025' CAO HƠN điểm Tin năm '2023-2024' của chính học sinh đó, kèm hai điểm (cột Moi, Cu). Sắp xếp theo tên.",
"SELECT h.TenHS, a.Diem AS Moi, b.Diem AS Cu\nFROM KetQua a INNER JOIN KetQua b ON a.MaHS = b.MaHS AND a.MaMon = b.MaMon\n  INNER JOIN HocSinh h ON h.MaHS = a.MaHS\nWHERE a.MaMon = 'TIN' AND a.NamHoc = '2024-2025' AND b.NamHoc = '2023-2024' AND a.Diem > b.Diem\nORDER BY h.TenHS;",
"Tự kết nối KetQua với chính nó: một bản đóng vai năm mới, một bản đóng vai năm cũ, nối theo MaHS và MaMon.",ordered=True)
MCQ('h-sql-14','quanly_diem',G,"Cho biết các lớp có ít nhất 2 học sinh có điểm Tin năm '2024-2025', kèm điểm trung bình (cột TB). Truy vấn nào đúng?",
"SELECT h.Lop, AVG(k.Diem) AS TB\nFROM HocSinh h INNER JOIN KetQua k ON h.MaHS = k.MaHS\nWHERE k.MaMon = 'TIN' AND k.NamHoc = '2024-2025'\nGROUP BY h.Lop\nHAVING COUNT(DISTINCT h.MaHS) >= 2;",
["SELECT h.Lop, AVG(k.Diem) AS TB\nFROM HocSinh h INNER JOIN KetQua k ON h.MaHS = k.MaHS\nGROUP BY h.Lop\nHAVING COUNT(DISTINCT h.MaHS) >= 2;",
 "SELECT h.Lop, AVG(k.Diem) AS TB\nFROM HocSinh h INNER JOIN KetQua k ON h.MaHS = k.MaHS\nWHERE k.MaMon = 'TIN' AND k.NamHoc = '2024-2025' AND COUNT(*) >= 2\nGROUP BY h.Lop;",
 "SELECT h.Lop, AVG(k.Diem) AS TB\nFROM HocSinh h INNER JOIN KetQua k ON h.MaHS = k.MaHS\nWHERE k.MaMon = 'TIN' AND k.NamHoc = '2024-2025'\nGROUP BY h.Lop\nHAVING AVG(k.Diem) >= 8;"],
"WHERE lọc dòng (môn, năm) TRƯỚC khi gom nhóm; HAVING lọc nhóm SAU khi gom. Điều kiện trên hàm tổng hợp phải ở HAVING.",
["Đúng.","Sai: thiếu điều kiện môn và năm nên trộn cả điểm Toán và năm khác.","Sai: hàm tổng hợp COUNT không được dùng trong WHERE.","Sai: HAVING so trung bình điểm với 8 thay vì đếm số học sinh."])
OPEN('h-sql-15','quanly_diem',S6,"Tìm mã học sinh có điểm Tin năm '2024-2025' cao THỨ HAI (điểm lớn nhất trong những điểm nhỏ hơn điểm cao nhất).",
"SELECT MaHS, Diem\nFROM KetQua\nWHERE MaMon = 'TIN' AND NamHoc = '2024-2025'\n  AND Diem = (SELECT MAX(Diem) FROM KetQua\n              WHERE MaMon = 'TIN' AND NamHoc = '2024-2025'\n                AND Diem < (SELECT MAX(Diem) FROM KetQua WHERE MaMon = 'TIN' AND NamHoc = '2024-2025'));",
"Truy vấn con lồng hai tầng: tầng trong lấy MAX, tầng giữa lấy MAX của các điểm nhỏ hơn MAX đó.")
TF('h-sql-16','quanly_diem',['S6','S3'],"Xét các phát biểu về CSDL quanly_diem (kết quả đã kiểm chứng bằng cách chạy thật):",[
 ("SELECT COUNT(*) FROM HocSinh h LEFT JOIN KetQua k ON h.MaHS = k.MaHS; trả về đúng 10 vì có 10 học sinh.",lambda: rows('quanly_diem',"SELECT COUNT(*) FROM HocSinh h LEFT JOIN KetQua k ON h.MaHS = k.MaHS")==[['10']],"Sai: một học sinh có nhiều điểm xuất hiện nhiều dòng; kết quả thực là %s."%rows('quanly_diem',"SELECT COUNT(*) FROM HocSinh h LEFT JOIN KetQua k ON h.MaHS = k.MaHS")[0][0]),
 ("SELECT COUNT(DISTINCT h.MaHS) FROM HocSinh h INNER JOIN KetQua k ON h.MaHS = k.MaHS; cho số học sinh có ít nhất một điểm.",lambda: rows('quanly_diem',"SELECT COUNT(DISTINCT h.MaHS) FROM HocSinh h INNER JOIN KetQua k ON h.MaHS = k.MaHS")==[['9']],"Đúng: có 9 học sinh có điểm (HS006 không có)."),
 ("SELECT TenHS FROM HocSinh WHERE MaHS NOT IN (SELECT MaHS FROM KetQua); trả về đúng một học sinh.",lambda: len(rows('quanly_diem',"SELECT TenHS FROM HocSinh WHERE MaHS NOT IN (SELECT MaHS FROM KetQua)"))==1,"Đúng: chỉ Hạnh chưa có điểm."),
 ("Điểm Tin trung bình năm 2024-2025 (7,9375) bằng điểm Tin trung bình của tất cả các năm.",lambda: rows('quanly_diem',"SELECT AVG(Diem) FROM KetQua WHERE MaMon='TIN'")==[['7.9375']],"Sai: tính cả năm 2023-2024 thì trung bình thay đổi.")])
# ---------- thuvien ----------
MCQ('h-sql-17','thuvien',G,"Cho biết mã độc giả đã mượn từ 3 cuốn sách KHÁC NHAU trở lên. Truy vấn nào đúng?",
"SELECT MaDG\nFROM MuonSach\nGROUP BY MaDG\nHAVING COUNT(DISTINCT MaSach) >= 3;",
["SELECT MaDG\nFROM MuonSach\nGROUP BY MaDG\nHAVING COUNT(*) >= 3;","SELECT MaDG\nFROM MuonSach\nGROUP BY MaDG, MaSach\nHAVING COUNT(*) >= 3;","SELECT DISTINCT MaDG\nFROM MuonSach\nWHERE COUNT(MaSach) >= 3;"],
"“Khác nhau” → COUNT(DISTINCT). COUNT(*) đếm lượt mượn nên độc giả mượn một cuốn ba lần cũng bị chọn nhầm.",
["Đúng.","Sai: đếm lượt, D004 mượn S002 ba lần bị chọn nhầm.","Sai: nhóm theo (MaDG, MaSach) đếm số lần mượn từng cuốn, không phải số cuốn khác nhau.","Sai: hàm tổng hợp không dùng trong WHERE."])
OPEN('h-sql-18','thuvien',S6,"Liệt kê mã sách được mượn bởi CẢ độc giả D001 LẪN độc giả D002. Sắp xếp theo mã sách.",
"SELECT MaSach FROM MuonSach WHERE MaDG = 'D001'\nINTERSECT\nSELECT MaSach FROM MuonSach WHERE MaDG = 'D002'\nORDER BY MaSach;",
"Giao của hai tập kết quả. Nếu không có INTERSECT (MySQL cũ) dùng IN hoặc EXISTS. Viết WHERE MaDG='D001' AND MaDG='D002' luôn rỗng.",
alts=["SELECT DISTINCT MaSach FROM MuonSach WHERE MaDG = 'D001' AND MaSach IN (SELECT MaSach FROM MuonSach WHERE MaDG = 'D002') ORDER BY MaSach;","SELECT MaSach FROM MuonSach WHERE MaDG IN ('D001','D002') GROUP BY MaSach HAVING COUNT(DISTINCT MaDG) = 2 ORDER BY MaSach;"],ordered=True)
OPEN('h-sql-19','thuvien',S6,"Liệt kê tên độc giả đã mượn sách thể loại 'Tin học' NHƯNG chưa từng mượn sách thể loại 'Văn học'. Mỗi độc giả một lần, sắp xếp theo tên.",
"SELECT DISTINCT d.TenDG\nFROM DocGia d INNER JOIN MuonSach m ON d.MaDG = m.MaDG INNER JOIN Sach s ON m.MaSach = s.MaSach\nWHERE s.TheLoai = 'Tin học'\n  AND NOT EXISTS (SELECT 1 FROM MuonSach m2 INNER JOIN Sach s2 ON m2.MaSach = s2.MaSach\n                  WHERE m2.MaDG = d.MaDG AND s2.TheLoai = 'Văn học')\nORDER BY d.TenDG;",
"Kết hợp điều kiện khẳng định (có Tin học) với phủ định (không tồn tại Văn học) của cùng một độc giả.",ordered=True)
OPEN('h-sql-20','thuvien',S6,"Cho biết tên sách được mượn NHIỀU LẦN NHẤT (nếu đồng hạng liệt kê tất cả) kèm số lần (cột SoLan).",
"SELECT s.TenSach, COUNT(*) AS SoLan\nFROM Sach s INNER JOIN MuonSach m ON s.MaSach = m.MaSach\nGROUP BY s.MaSach, s.TenSach\nHAVING COUNT(*) = (SELECT MAX(c.SoLan)\n                   FROM (SELECT COUNT(*) AS SoLan FROM MuonSach GROUP BY MaSach) c);",
"HAVING so sánh với giá trị lớn nhất tính từ bảng tạm giữ được mọi sách đồng hạng; ORDER BY ... LIMIT 1 chỉ lấy một sách.")
OPEN('h-sql-21','thuvien',S6,"Cho biết tên độc giả CHƯA mượn cuốn sách nào. Hãy viết bằng LEFT JOIN.",
"SELECT d.TenDG\nFROM DocGia d LEFT JOIN MuonSach m ON d.MaDG = m.MaDG\nWHERE m.MaMuon IS NULL;",
"Dòng không có tương ứng sẽ có mọi cột bảng phải là NULL; kiểm tra bằng IS NULL trên cột khoá.")
OPEN('h-sql-22','thuvien',G,"Với mỗi thể loại sách, cho biết số độc giả KHÁC NHAU đã mượn (cột SoDG) và tổng số ngày mượn (cột TongNgay). Sắp xếp giảm dần theo SoDG rồi theo thể loại.",
"SELECT s.TheLoai, COUNT(DISTINCT m.MaDG) AS SoDG, SUM(m.SoNgay) AS TongNgay\nFROM Sach s INNER JOIN MuonSach m ON s.MaSach = m.MaSach\nGROUP BY s.TheLoai\nORDER BY SoDG DESC, s.TheLoai;",
"Hai hàm tổng hợp khác bản chất trong cùng một nhóm: DISTINCT chỉ áp cho COUNT, SUM vẫn cộng mọi lượt.",ordered=True)
OPEN('h-sql-23','thuvien',S6,"Liệt kê mã lượt mượn có số ngày mượn LỚN HƠN số ngày mượn trung bình của CHÍNH cuốn sách đó. Sắp xếp theo mã lượt mượn.",
"SELECT m.MaMuon\nFROM MuonSach m\nWHERE m.SoNgay > (SELECT AVG(m2.SoNgay) FROM MuonSach m2 WHERE m2.MaSach = m.MaSach)\nORDER BY m.MaMuon;",
"Truy vấn con tương quan: với mỗi dòng ngoài, truy vấn trong tính trung bình riêng cho sách của dòng đó.",ordered=True)
PRED('h-sql-24','thuvien',['S6'],"Dự đoán kết quả của truy vấn sau:",
"SELECT TenDG\nFROM DocGia\nWHERE MaDG NOT IN (SELECT MaDG FROM MuonSach WHERE SoNgay > 10);",
["Lan; Mai; Nhân; Phúc; Quân; Thảo","Lan; Nhân; Phúc; Quân; Thảo","(không có dòng nào)","Mai; Nhân"],
"Truy vấn con chỉ chọn các lượt mượn có SoNgay > 10 (lượt 4: 14 ngày của D002; lượt 6: 12 ngày của D003; lượt 2 của D001 đúng 10 ngày nên KHÔNG tính). NOT IN loại D002 và D003.",seed=5)
TF('h-sql-25','thuvien',['S6','S3'],"Xét các phát biểu về CSDL thuvien (đã kiểm chứng bằng cách chạy thật):",[
 ("SELECT COUNT(*) FROM MuonSach; và SELECT COUNT(DISTINCT MaDG) FROM MuonSach; cho cùng một kết quả.",lambda: rows('thuvien',"SELECT COUNT(*) FROM MuonSach")==rows('thuvien',"SELECT COUNT(DISTINCT MaDG) FROM MuonSach"),"Sai: 13 lượt mượn nhưng chỉ 5 độc giả."),
 ("Độc giả Thảo (D006) không xuất hiện khi nối trong DocGia INNER JOIN MuonSach.",lambda: ('Thảo' not in [r[0] for r in rows('thuvien',"SELECT d.TenDG FROM DocGia d INNER JOIN MuonSach m ON d.MaDG=m.MaDG")]),"Đúng: Thảo chưa mượn nên INNER JOIN loại ra; LEFT JOIN thì giữ."),
 ("SELECT MaDG FROM MuonSach GROUP BY MaDG HAVING COUNT(DISTINCT MaSach) = 1; trả về đúng hai độc giả.",lambda: len(rows('thuvien',"SELECT MaDG FROM MuonSach GROUP BY MaDG HAVING COUNT(DISTINCT MaSach) = 1"))==2,"Đúng: D004 chỉ mượn S002 (ba lần) và D005 chỉ mượn S003."),
 ("SELECT AVG(SoNgay) FROM MuonSach; cho giá trị lớn hơn 6.",lambda: float(rows('thuvien',"SELECT AVG(SoNgay) FROM MuonSach")[0][0])>6,"Đúng: trung bình = 85/13 ≈ 6,5385.")])
# ---------- mymusic ----------
OPEN('h-sql-26','mymusic_hsg',S6,"Liệt kê tên ca sĩ đã thể hiện bản nhạc của ÍT NHẤT 3 nhạc sĩ khác nhau.",
"SELECT c.tenCasi\nFROM casi c INNER JOIN banthuam t ON c.idCasi = t.idCasi INNER JOIN bannhac b ON t.idBannhac = b.idBannhac\nGROUP BY c.idCasi, c.tenCasi\nHAVING COUNT(DISTINCT b.idNhacsi) >= 3;",
"Phải nối ba bảng ca sĩ – bản thu âm – bản nhạc rồi đếm số nhạc sĩ KHÁC NHAU của mỗi ca sĩ.")
OPEN('h-sql-27','mymusic_hsg',S6,"Cho biết tên bản nhạc được NHIỀU ca sĩ thu âm nhất (đồng hạng thì liệt kê tất cả) kèm số ca sĩ (cột SoCaSi). Sắp xếp theo tên bản nhạc.",
"SELECT b.tenBannhac, COUNT(DISTINCT t.idCasi) AS SoCaSi\nFROM bannhac b INNER JOIN banthuam t ON b.idBannhac = t.idBannhac\nGROUP BY b.idBannhac, b.tenBannhac\nHAVING COUNT(DISTINCT t.idCasi) = (SELECT MAX(x.n) FROM (SELECT COUNT(DISTINCT idCasi) AS n FROM banthuam GROUP BY idBannhac) x)\nORDER BY b.tenBannhac;",
"Hai bản nhạc đồng hạng đều có 2 ca sĩ; so sánh với MAX bằng HAVING giữ cả hai.",ordered=True)
OPEN('h-sql-28','mymusic_hsg',S6,"Liệt kê các cặp ca sĩ (ten1, ten2 với idCasi1 < idCasi2) cùng thu âm MỘT bản nhạc. Sắp xếp theo ten1 rồi ten2.",
"SELECT DISTINCT c1.tenCasi AS ten1, c2.tenCasi AS ten2\nFROM banthuam a INNER JOIN banthuam b ON a.idBannhac = b.idBannhac AND a.idCasi < b.idCasi\n  INNER JOIN casi c1 ON c1.idCasi = a.idCasi INNER JOIN casi c2 ON c2.idCasi = b.idCasi\nORDER BY ten1, ten2;",
"Tự kết nối bảng banthuam với chính nó theo bản nhạc; điều kiện idCasi nhỏ hơn loại cặp trùng và cặp đảo.",ordered=True)
OPEN('h-sql-29','mymusic_hsg',S6,"Liệt kê tên nhạc sĩ mà TẤT CẢ bản nhạc của họ đều được ít nhất 2 ca sĩ khác nhau thu âm. Sắp xếp theo tên.",
"SELECT n.tenNhacsi\nFROM nhacsi n\nWHERE NOT EXISTS (SELECT 1 FROM bannhac b\n                  WHERE b.idNhacsi = n.idNhacsi\n                    AND (SELECT COUNT(DISTINCT t.idCasi) FROM banthuam t WHERE t.idBannhac = b.idBannhac) < 2)\nORDER BY n.tenNhacsi;",
"Mẫu “với mọi”: không tồn tại bản nhạc của nhạc sĩ mà số ca sĩ thu âm nhỏ hơn 2. Khi đảo điều kiện “với mọi” thành “không tồn tại phản ví dụ”, nhớ đảo cả phép so sánh (≥ 2 thành < 2).",ordered=True)
MCQ('h-sql-30','mymusic_hsg',S6,"Tìm tên nhạc sĩ CHƯA có bản nhạc nào do ca sĩ 'Quốc Hương' thể hiện. Truy vấn nào đúng?",
"SELECT n.tenNhacsi\nFROM nhacsi n\nWHERE n.idNhacsi NOT IN (SELECT b.idNhacsi\n                         FROM bannhac b INNER JOIN banthuam t ON b.idBannhac = t.idBannhac\n                              INNER JOIN casi c ON c.idCasi = t.idCasi\n                         WHERE c.tenCasi = 'Quốc Hương');",
["SELECT DISTINCT n.tenNhacsi\nFROM nhacsi n INNER JOIN bannhac b ON n.idNhacsi = b.idNhacsi\n  INNER JOIN banthuam t ON b.idBannhac = t.idBannhac INNER JOIN casi c ON c.idCasi = t.idCasi\nWHERE c.tenCasi <> 'Quốc Hương';",
 "SELECT n.tenNhacsi\nFROM nhacsi n INNER JOIN bannhac b ON n.idNhacsi = b.idNhacsi\n  INNER JOIN banthuam t ON b.idBannhac = t.idBannhac INNER JOIN casi c ON c.idCasi = t.idCasi\nWHERE c.tenCasi = 'Quốc Hương' AND n.idNhacsi IS NULL;",
 "SELECT n.tenNhacsi\nFROM nhacsi n\nWHERE n.idNhacsi IN (SELECT b.idNhacsi FROM bannhac b INNER JOIN banthuam t ON b.idBannhac = t.idBannhac INNER JOIN casi c ON c.idCasi = t.idCasi WHERE c.tenCasi = 'Quốc Hương');"],
"Phủ định “chưa có” phải loại các nhạc sĩ nằm trong tập đã có (NOT IN tập con). Điều kiện <> trên dòng nối vẫn giữ nhạc sĩ khác có bản thu của ca sĩ khác.",
["Đúng.","Sai: lọc <> chỉ bỏ dòng của Quốc Hương, nhạc sĩ có cả bản thu của ca sĩ khác vẫn xuất hiện.","Sai: IS NULL trên khoá của INNER JOIN không bao giờ đúng, kết quả rỗng.","Sai: đây là danh sách nhạc sĩ ĐÃ có, ngược yêu cầu."])
if __name__=='__main__':
    save('hard_sql_out.json'); print(len(OUT),'câu SQL khó')
    for q in OUT:
        if q['type']=='open': print(q['id'],q['answer']['rows'][:4])
