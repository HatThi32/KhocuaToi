# -*- coding: utf-8 -*-
# Dạng câu: điền câu lệnh hoàn chỉnh, ý nghĩa câu lệnh dài, ghép yêu cầu–truy vấn, sắp xếp mệnh đề, tìm và sửa lỗi.
from hardlib import *
import hardlib as H
S6=['S6'];G=['S10','S3']
def _mcq(id,db,tags,stem,opts,ow,why,code=None,seed=1,codeopts=False):
    idx=list(range(len(opts))); random.Random(seed).shuffle(idx)
    q=dict(id=id,topic='csdl',level=3,tags=tags,db=db,why=why,src='verified-sql',type='mcq',stem=stem,options=[opts[i] for i in idx],key=idx.index(0),optWhy=[ow[i] for i in idx],cl=newcl(),v2=True,hard=True)
    if code: q['code']=code; q['mono']=True
    if codeopts: q['codeOpts']=True
    OUT.append(q); return q
def FILL(id,db,tags,stem,template,good,bads,expected_sql,why,seed=1):
    """template chứa ⟦1⟧ ⟦2⟧…; good/bads là tuple mảnh điền. Mọi tổ hợp được CHẠY THẬT."""
    def build(fr):
        s=template
        for i,x in enumerate(fr,1): s=s.replace('⟦%d⟧'%i,x)
        return s
    assert same(db,build(good),expected_sql),('good sai',id)
    for b in bads: assert not same(db,build(b),expected_sql),('bad đúng',id,b)
    disp=template
    for i in range(1,len(good)+1): disp=disp.replace('⟦%d⟧'%i,'(%d) ______'%i)
    fm=lambda fr:'; '.join('(%d) %s'%(i,x) for i,x in enumerate(fr,1))
    ow=['Điền đúng: chạy ra kết quả yêu cầu.']+['Sai: '+( 'câu lệnh báo lỗi cú pháp' if not _ok(db,build(b)) else 'chạy được nhưng kết quả khác yêu cầu')+'.' for b in bads]
    return _mcq(id,db,tags,stem,[fm(good)]+[fm(b) for b in bads],ow,why,code=disp,seed=seed)
def _ok(db,s):
    try: rows(db,s); return True
    except Exception: return False
def MEANQ(id,db,tags,stem,long_sql,good,bads,why,seed=1):
    """good=(văn bản, SQL tương đương); bads=[(văn bản, SQL khác)]."""
    assert same(db,long_sql,good[1]),('good không tương đương',id)
    for t,s in bads: assert not same(db,long_sql,s),('bad tương đương',id,t)
    r=rows(db,long_sql)
    res='; '.join(','.join(x) for x in r[:6]) or '(không có dòng)'
    return _mcq(id,db,tags,stem,[good[0]]+[b[0] for b in bads],['Đúng: kết quả chạy thật của câu lệnh là '+res+'.']+['Sai: nếu hiểu như vậy thì kết quả sẽ khác kết quả thật.']*len(bads),why+' Kết quả chạy thật: '+res+'.',code=long_sql,seed=seed)
def MATCH(id,db,tags,stem,reqs,queries,why,seed=1):
    """reqs: [(mô tả yêu cầu, SQL độc lập diễn đạt yêu cầu)], queries: danh sách SQL (cùng số lượng, cùng thứ tự với reqs: query i là đáp án của yêu cầu i)."""
    n=len(reqs)
    for i in range(n):
        assert same(db,reqs[i][1],queries[i]),('yêu cầu–truy vấn không khớp',id,i)
        for j in range(n):
            if i!=j: assert not same(db,queries[i],queries[j]),('hai truy vấn trùng kết quả',id,i,j)
    perm=list(range(n)); random.Random(seed).shuffle(perm)  # perm[k]= chỉ số truy vấn hiển thị ở vị trí Q(k+1)
    shown=[queries[p] for p in perm]
    code='\n\n'.join('-- Q%d\n%s'%(k+1,s) for k,s in enumerate(shown))
    letters='abcdefg'
    def mapping(order): return ', '.join('(%s)-Q%d'%(letters[r],order.index(r)+1) for r in range(n))
    good=mapping(perm)
    allp=[list(p) for p in __import__('itertools').permutations(range(n))]
    bads=[mapping(p) for p in allp if p!=perm]
    random.Random(seed+1).shuffle(bads)
    st=stem+'\n'+'\n'.join('(%s) %s'%(letters[i],reqs[i][0]) for i in range(n))
    return _mcq(id,db,tags,st,[good]+bads[:3],['Đúng: đã chạy từng truy vấn để đối chiếu.']+['Sai: có ít nhất một cặp yêu cầu – truy vấn bị ghép nhầm.']*3,why,code=code,seed=seed)
def ORDERQ(id,db,tags,stem,parts,good_order,bad_orders,expected_sql,why,seed=1):
    """parts: dict số→mệnh đề. Ghép theo thứ tự và CHẠY THẬT."""
    mk0=lambda o:' '.join(parts[i] for i in o)+';'
    assert same(db,mk0(good_order),expected_sql),('thứ tự đúng sai',id)
    for b in bad_orders: assert not same(db,mk0(b),expected_sql),('thứ tự sai lại đúng',id,b)
    lab=list(parts); random.Random(seed+7).shuffle(lab); rl=dict(zip(sorted(parts),lab))   # nhãn mới
    parts2={rl[i]:parts[i] for i in parts}; good_order=[rl[i] for i in good_order]; bad_orders=[[rl[i] for i in b] for b in bad_orders]; parts=parts2
    mk=lambda o:' '.join(parts[i] for i in o)+';'
    assert same(db,mk(good_order),expected_sql),('thứ tự đúng sai',id)
    for b in bad_orders: assert not same(db,mk(b),expected_sql),('thứ tự sai lại đúng',id,b)
    code='\n'.join('(%d) %s'%(i,parts[i]) for i in sorted(parts))
    fmt=lambda o:' → '.join(str(i) for i in o)
    return _mcq(id,db,tags,stem,[fmt(good_order)]+[fmt(b) for b in bad_orders],['Đúng: ghép lại chạy ra kết quả yêu cầu.']+['Sai: '+('báo lỗi cú pháp' if not _ok(db,mk(b)) else 'chạy nhưng kết quả khác yêu cầu')+'.' for b in bad_orders],why,code=code,seed=seed)
def FIXQ(id,db,tags,stem,buggy,intended,good,bads,why,seed=1):
    """good=(văn bản, SQL đã sửa), bads=[(văn bản, SQL sau khi sửa kiểu đó)]."""
    ok=_ok(db,buggy)
    assert (not ok) or not same(db,buggy,intended),('câu lỗi lại đúng',id)
    assert same(db,good[1],intended),('sửa đúng chưa ra yêu cầu',id)
    for t,s in bads: assert not same(db,s,intended),('sửa sai lại đúng',id,t)
    sym='Báo lỗi khi chạy' if not ok else 'Chạy được nhưng kết quả: '+('; '.join(','.join(x) for x in rows(db,buggy)[:6]) or '(rỗng)')
    return _mcq(id,db,tags,stem,[good[0]]+[b[0] for b in bads],['Đúng: sau khi sửa chạy ra kết quả yêu cầu.']+['Sai: sửa như vậy vẫn không ra kết quả yêu cầu.']*len(bads),why+' Câu lệnh gốc: '+sym+'.',code=buggy,seed=seed)
# ======================= ĐIỀN CÂU LỆNH =======================
FILL('h-sql-31','thuvien',S6,"Điền vào chỗ trống để câu lệnh liệt kê MỌI độc giả (kể cả người chưa mượn) đã mượn ÍT HƠN 2 cuốn sách khác nhau (kể cả 0 cuốn):",
"SELECT d.TenDG, COUNT(DISTINCT m.MaSach) AS SoSach\nFROM DocGia d ⟦1⟧ MuonSach m ON d.MaDG = m.MaDG\nGROUP BY d.MaDG, d.TenDG\n⟦2⟧ COUNT(DISTINCT m.MaSach) < 2\nORDER BY d.TenDG;",
("LEFT JOIN","HAVING"),[("INNER JOIN","HAVING"),("LEFT JOIN","WHERE"),("RIGHT JOIN","HAVING")],
"SELECT d.TenDG, COUNT(DISTINCT m.MaSach) AS SoSach FROM DocGia d LEFT JOIN MuonSach m ON d.MaDG = m.MaDG GROUP BY d.MaDG, d.TenDG HAVING COUNT(DISTINCT m.MaSach) < 2 ORDER BY d.TenDG;",
"Muốn giữ cả độc giả chưa mượn phải dùng LEFT JOIN từ bảng DocGia; điều kiện trên hàm tổng hợp đặt ở HAVING (WHERE chạy trước khi gom nhóm).",1)
FILL('h-sql-32','quanly_diem',S6,"Điền vào hai chỗ trống để câu lệnh cho tên học sinh có điểm Tin cao nhất TRONG LỚP của mình (năm '2024-2025'):",
"SELECT h.Lop, h.TenHS, k.Diem\nFROM HocSinh h INNER JOIN KetQua k ON h.MaHS = k.MaHS\nWHERE k.MaMon = 'TIN' AND k.NamHoc = '2024-2025'\n  AND k.Diem = (SELECT ⟦1⟧(k2.Diem)\n                FROM HocSinh h2 INNER JOIN KetQua k2 ON h2.MaHS = k2.MaHS\n                WHERE ⟦2⟧ AND k2.MaMon = 'TIN' AND k2.NamHoc = '2024-2025')\nORDER BY h.Lop;",
("MAX","h2.Lop = h.Lop"),[("MIN","h2.Lop = h.Lop"),("MAX","h2.MaHS = h.MaHS"),("AVG","h2.Lop = h.Lop"),("MAX","h2.Lop = 'Lop'")],
"SELECT h.Lop, h.TenHS, k.Diem FROM HocSinh h INNER JOIN KetQua k ON h.MaHS = k.MaHS WHERE k.MaMon = 'TIN' AND k.NamHoc = '2024-2025' AND k.Diem = (SELECT MAX(k2.Diem) FROM HocSinh h2 INNER JOIN KetQua k2 ON h2.MaHS = k2.MaHS WHERE h2.Lop = h.Lop AND k2.MaMon = 'TIN' AND k2.NamHoc = '2024-2025') ORDER BY h.Lop;",
"Hàm MAX tìm điểm lớn nhất; điều kiện h2.Lop = h.Lop làm truy vấn con TƯƠNG QUAN với từng dòng của truy vấn ngoài (so sánh trong cùng lớp).",2)
FILL('h-sql-33','thuexe',G,"Điền vào hai chỗ trống để câu lệnh cho mọi khách và tổng giờ thuê (0 nếu chưa thuê), sắp xếp giảm dần theo tổng giờ rồi theo tên:",
"SELECT k.TenKT, ⟦1⟧(SUM(l.SoGio), 0) AS Tong\nFROM KhachThue k ⟦2⟧ LuotThue l ON k.MaKT = l.MaKT\nGROUP BY k.MaKT, k.TenKT\nORDER BY Tong DESC, k.TenKT;",
("COALESCE","LEFT JOIN"),[("COALESCE","INNER JOIN"),("COUNT","LEFT JOIN"),("SUM","LEFT JOIN")],
"SELECT k.TenKT, COALESCE(SUM(l.SoGio), 0) AS Tong FROM KhachThue k LEFT JOIN LuotThue l ON k.MaKT = l.MaKT GROUP BY k.MaKT, k.TenKT ORDER BY Tong DESC, k.TenKT;",
"LEFT JOIN giữ khách chưa thuê; COALESCE(x, 0) thay giá trị NULL bằng 0.",3)
FILL('h-sql-34','thuexe',S6,"Điền vào hai chỗ trống để câu lệnh liệt kê khách CHƯA CÓ lượt thuê nào kéo dài từ 5 giờ trở lên:",
"SELECT k.TenKT\nFROM KhachThue k\nWHERE ⟦1⟧ (SELECT 1 FROM LuotThue l\n                  WHERE ⟦2⟧ AND l.SoGio >= 5)\nORDER BY k.TenKT;",
("NOT EXISTS","l.MaKT = k.MaKT"),[("EXISTS","l.MaKT = k.MaKT"),("NOT EXISTS","l.MaKT = l.MaKT"),("NOT EXISTS","k.MaKT = 'K001'")],
"SELECT k.TenKT FROM KhachThue k WHERE NOT EXISTS (SELECT 1 FROM LuotThue l WHERE l.MaKT = k.MaKT AND l.SoGio >= 5) ORDER BY k.TenKT;",
"NOT EXISTS + điều kiện liên kết l.MaKT = k.MaKT: với từng khách, không tồn tại lượt thuê ≥ 5 giờ của chính khách đó.",4)
FILL('h-sql-35','mymusic_hsg',S6,"Điền vào hai chỗ trống để câu lệnh cho tên các ca sĩ đã thể hiện bản nhạc của ÍT NHẤT 3 nhạc sĩ khác nhau:",
"SELECT c.tenCasi\nFROM casi c INNER JOIN banthuam t ON c.idCasi = t.idCasi\n  INNER JOIN bannhac b ON t.idBannhac = b.idBannhac\nGROUP BY c.idCasi, c.tenCasi\n⟦1⟧ COUNT(⟦2⟧ b.idNhacsi) >= 3;",
("HAVING","DISTINCT"),[("WHERE","DISTINCT"),("HAVING","DISTINCT t.idCasi,"),("WHERE","")],
"SELECT c.tenCasi FROM casi c INNER JOIN banthuam t ON c.idCasi = t.idCasi INNER JOIN bannhac b ON t.idBannhac = b.idBannhac GROUP BY c.idCasi, c.tenCasi HAVING COUNT(DISTINCT b.idNhacsi) >= 3;",
"“Khác nhau” → DISTINCT; điều kiện trên hàm tổng hợp → HAVING.",5)
FILL('h-sql-36','thuvien',G,"Điền vào hai chỗ trống để câu lệnh cho thể loại sách và số lượt mượn năm 2026, chỉ lấy thể loại có từ 3 lượt trở lên, sắp xếp giảm dần theo số lượt:",
"SELECT s.TheLoai, COUNT(*) AS SoLuot\nFROM Sach s INNER JOIN MuonSach m ON s.MaSach = m.MaSach\n⟦1⟧ YEAR(m.NgayMuon) = 2026\nGROUP BY s.TheLoai\n⟦2⟧ COUNT(*) >= 3\nORDER BY SoLuot DESC;",
("WHERE","HAVING"),[("HAVING","WHERE"),("WHERE","WHERE"),("HAVING","HAVING")],
"SELECT s.TheLoai, COUNT(*) AS SoLuot FROM Sach s INNER JOIN MuonSach m ON s.MaSach = m.MaSach WHERE YEAR(m.NgayMuon) = 2026 GROUP BY s.TheLoai HAVING COUNT(*) >= 3 ORDER BY SoLuot DESC;",
"Thứ tự thực hiện: FROM/JOIN → WHERE (lọc dòng) → GROUP BY → HAVING (lọc nhóm) → ORDER BY.",6)
# ======================= Ý NGHĨA CÂU LỆNH DÀI =======================
MEANQ('h-sql-37','thuvien',S6,"Câu lệnh sau có ý nghĩa nào?",
"SELECT d.TenDG\nFROM DocGia d\nWHERE d.MaDG IN (SELECT m.MaDG\n                  FROM MuonSach m INNER JOIN Sach s ON m.MaSach = s.MaSach\n                  WHERE s.TheLoai = 'Tin học'\n                  GROUP BY m.MaDG\n                  HAVING COUNT(DISTINCT m.MaSach) = (SELECT COUNT(*) FROM Sach WHERE TheLoai = 'Tin học'));",
("Tên các độc giả đã mượn đủ TẤT CẢ các cuốn sách thể loại Tin học.",
 "SELECT d.TenDG FROM DocGia d WHERE NOT EXISTS (SELECT 1 FROM Sach s WHERE s.TheLoai='Tin học' AND NOT EXISTS (SELECT 1 FROM MuonSach m WHERE m.MaDG=d.MaDG AND m.MaSach=s.MaSach))"),
[("Tên các độc giả đã mượn ít nhất một cuốn sách thể loại Tin học.","SELECT DISTINCT d.TenDG FROM DocGia d INNER JOIN MuonSach m ON d.MaDG=m.MaDG INNER JOIN Sach s ON s.MaSach=m.MaSach WHERE s.TheLoai='Tin học'"),
 ("Tên các độc giả đã mượn ít nhất 2 cuốn sách Tin học khác nhau.","SELECT d.TenDG FROM DocGia d INNER JOIN MuonSach m ON d.MaDG=m.MaDG INNER JOIN Sach s ON s.MaSach=m.MaSach WHERE s.TheLoai='Tin học' GROUP BY d.MaDG,d.TenDG HAVING COUNT(DISTINCT m.MaSach)>=2"),
 ("Tên các độc giả chỉ mượn toàn sách Tin học và không mượn thể loại nào khác.","SELECT d.TenDG FROM DocGia d WHERE EXISTS (SELECT 1 FROM MuonSach m WHERE m.MaDG=d.MaDG) AND NOT EXISTS (SELECT 1 FROM MuonSach m INNER JOIN Sach s ON s.MaSach=m.MaSach WHERE m.MaDG=d.MaDG AND s.TheLoai<>'Tin học')")],
"Truy vấn con đếm số cuốn Tin học KHÁC NHAU mà mỗi độc giả mượn, rồi so với tổng số cuốn Tin học: bằng nhau nghĩa là đã mượn đủ (bài toán “với mọi”).",1)
MEANQ('h-sql-38','quanly_diem',S6,"Câu lệnh sau tìm ra điều gì?",
"SELECT h.Lop, COUNT(*) AS n\nFROM HocSinh h\nWHERE EXISTS (SELECT 1 FROM KetQua k WHERE k.MaHS = h.MaHS)\n  AND NOT EXISTS (SELECT 1 FROM KetQua k WHERE k.MaHS = h.MaHS AND k.Diem < 7)\nGROUP BY h.Lop;",
("Với mỗi lớp, số học sinh ĐÃ CÓ điểm và MỌI điểm đều từ 7 trở lên.",
 "SELECT h.Lop, COUNT(*) FROM HocSinh h WHERE (SELECT COUNT(*) FROM KetQua k WHERE k.MaHS=h.MaHS)>0 AND (SELECT MIN(Diem) FROM KetQua k WHERE k.MaHS=h.MaHS)>=7 GROUP BY h.Lop"),
[("Với mỗi lớp, số học sinh có ít nhất một điểm từ 7 trở lên.","SELECT h.Lop, COUNT(DISTINCT h.MaHS) FROM HocSinh h INNER JOIN KetQua k ON h.MaHS=k.MaHS WHERE k.Diem>=7 GROUP BY h.Lop"),
 ("Với mỗi lớp, số học sinh chưa có điểm hoặc có mọi điểm từ 7 trở lên.","SELECT h.Lop, COUNT(*) FROM HocSinh h WHERE NOT EXISTS (SELECT 1 FROM KetQua k WHERE k.MaHS=h.MaHS AND k.Diem<7) GROUP BY h.Lop"),
 ("Với mỗi lớp, số lượt điểm từ 7 trở lên.","SELECT h.Lop, COUNT(*) FROM HocSinh h INNER JOIN KetQua k ON h.MaHS=k.MaHS WHERE k.Diem>=7 GROUP BY h.Lop")],
"EXISTS bảo đảm có điểm; NOT EXISTS (điểm < 7) bảo đảm KHÔNG có điểm thấp, tức mọi điểm ≥ 7. Nếu bỏ EXISTS thì học sinh chưa có điểm cũng lọt vào.",2)
MEANQ('h-sql-39','thuvien',['S10','S3'],"Câu lệnh sau cho biết điều gì?",
"SELECT MaDG, MaSach, COUNT(*) AS SoLan\nFROM MuonSach\nGROUP BY MaDG, MaSach\nHAVING COUNT(*) >= 2;",
("Các cặp (độc giả, sách) mà độc giả đó đã mượn CÙNG MỘT cuốn sách từ 2 lần trở lên.",
 "SELECT m1.MaDG, m1.MaSach, (SELECT COUNT(*) FROM MuonSach m3 WHERE m3.MaDG=m1.MaDG AND m3.MaSach=m1.MaSach) FROM MuonSach m1 WHERE (SELECT COUNT(*) FROM MuonSach m2 WHERE m2.MaDG=m1.MaDG AND m2.MaSach=m1.MaSach)>=2 GROUP BY m1.MaDG, m1.MaSach"),
[("Các độc giả đã mượn từ 2 cuốn sách khác nhau trở lên.","SELECT MaDG, '', COUNT(DISTINCT MaSach) FROM MuonSach GROUP BY MaDG HAVING COUNT(DISTINCT MaSach)>=2"),
 ("Các cuốn sách có từ 2 độc giả khác nhau mượn trở lên.","SELECT '', MaSach, COUNT(DISTINCT MaDG) FROM MuonSach GROUP BY MaSach HAVING COUNT(DISTINCT MaDG)>=2"),
 ("Các độc giả mượn tối đa 2 lần.","SELECT MaDG, '', COUNT(*) FROM MuonSach GROUP BY MaDG HAVING COUNT(*)<=2")],
"GROUP BY hai cột tạo nhóm theo từng cặp (độc giả, sách); COUNT(*) của nhóm là số lần độc giả đó mượn cuốn sách đó.",3)
base_items=None
TF('h-sql-40','thuexe',['S6','S3'],"Cho câu lệnh sau trên CSDL thuexe:\nSELECT p.LoaiPT, COUNT(DISTINCT l.MaKT) AS SoKhach, SUM(l.SoGio) AS TongGio\nFROM LuotThue l INNER JOIN PhuongTien p ON l.MaPT = p.MaPT\nWHERE l.NgayThue >= '2026-01-01'\nGROUP BY p.LoaiPT\nHAVING SUM(l.SoGio) > 5\nORDER BY TongGio DESC;\nXét các phát biểu (kiểm chứng bằng cách chạy thật):",[
 ("Lượt thuê ngày 20/12/2025 không được tính vào kết quả.",lambda: rows('thuexe',"SELECT SUM(l.SoGio) FROM LuotThue l WHERE l.NgayThue >= '2026-01-01'")[0][0]!=rows('thuexe',"SELECT SUM(SoGio) FROM LuotThue")[0][0],"Đúng: WHERE lọc dòng trước khi gom nhóm, lượt 7 (2025-12-20) bị loại."),
 ("Mọi nhóm loại phương tiện xuất hiện trong kết quả đều có TongGio lớn hơn 5.",lambda: all(float(r[2])>5 for r in rows('thuexe',"SELECT p.LoaiPT, COUNT(DISTINCT l.MaKT), SUM(l.SoGio) FROM LuotThue l INNER JOIN PhuongTien p ON l.MaPT=p.MaPT WHERE l.NgayThue>='2026-01-01' GROUP BY p.LoaiPT HAVING SUM(l.SoGio)>5")),"Đúng: HAVING lọc các nhóm theo tổng giờ."),
 ("Cột SoKhach của mỗi dòng luôn bằng số lượt thuê của loại phương tiện đó.",lambda: all(a==b for a,b in zip(rows('thuexe',"SELECT COUNT(DISTINCT l.MaKT) FROM LuotThue l INNER JOIN PhuongTien p ON l.MaPT=p.MaPT WHERE l.NgayThue>='2026-01-01' GROUP BY p.LoaiPT ORDER BY p.LoaiPT"),rows('thuexe',"SELECT COUNT(*) FROM LuotThue l INNER JOIN PhuongTien p ON l.MaPT=p.MaPT WHERE l.NgayThue>='2026-01-01' GROUP BY p.LoaiPT ORDER BY p.LoaiPT"))),"Sai: DISTINCT đếm số khách khác nhau, không phải số lượt (khách thuê nhiều lần chỉ tính một)."),
 ("Kết quả được sắp xếp TĂNG dần theo TongGio.",lambda: (lambda v:len(v)>1 and v==sorted(v))([float(r[0]) for r in rows('thuexe',"SELECT SUM(l.SoGio) AS T FROM LuotThue l INNER JOIN PhuongTien p ON l.MaPT=p.MaPT WHERE l.NgayThue>='2026-01-01' GROUP BY p.LoaiPT HAVING SUM(l.SoGio)>5 ORDER BY T DESC")]),"Sai: DESC là sắp xếp GIẢM dần.")])
# ======================= GHÉP YÊU CẦU – TRUY VẤN =======================
MATCH('h-sql-41','thuexe',S6,"Ghép đúng mỗi yêu cầu với truy vấn thực hiện đúng yêu cầu đó (mỗi truy vấn dùng một lần):",
[("Khách đã thuê ÍT NHẤT MỘT xe điện.","SELECT DISTINCT k.MaKT FROM KhachThue k WHERE k.MaKT IN (SELECT l.MaKT FROM LuotThue l WHERE l.MaPT IN (SELECT MaPT FROM PhuongTien WHERE LoaiPT='Xe điện'))"),
 ("Khách CHƯA TỪNG thuê xe điện.","SELECT k.MaKT FROM KhachThue k WHERE NOT EXISTS (SELECT 1 FROM LuotThue l WHERE l.MaKT=k.MaKT AND l.MaPT IN (SELECT MaPT FROM PhuongTien WHERE LoaiPT='Xe điện'))"),
 ("Khách CHỈ thuê toàn xe điện (mọi lượt thuê đều là xe điện, và có thuê).","SELECT k.MaKT FROM KhachThue k WHERE EXISTS (SELECT 1 FROM LuotThue l WHERE l.MaKT=k.MaKT) AND NOT EXISTS (SELECT 1 FROM LuotThue l WHERE l.MaKT=k.MaKT AND l.MaPT NOT IN (SELECT MaPT FROM PhuongTien WHERE LoaiPT='Xe điện'))")],
["SELECT DISTINCT l.MaKT\nFROM LuotThue l INNER JOIN PhuongTien p ON l.MaPT = p.MaPT\nWHERE p.LoaiPT = 'Xe điện';",
 "SELECT MaKT FROM KhachThue\nWHERE MaKT NOT IN (SELECT l.MaKT FROM LuotThue l\n                   INNER JOIN PhuongTien p ON l.MaPT = p.MaPT\n                   WHERE p.LoaiPT = 'Xe điện');",
 "SELECT l.MaKT\nFROM LuotThue l INNER JOIN PhuongTien p ON l.MaPT = p.MaPT\nGROUP BY l.MaKT\nHAVING COUNT(*) = SUM(CASE WHEN p.LoaiPT = 'Xe điện' THEN 1 ELSE 0 END);"],
"“Ít nhất một” → WHERE trực tiếp; “chưa từng” → NOT IN/NOT EXISTS; “chỉ toàn” → so số lượt tổng với số lượt thoả điều kiện trong HAVING.",2)
MATCH('h-sql-42','thuvien',S6,"Ghép đúng mỗi yêu cầu với truy vấn thực hiện đúng yêu cầu đó (mỗi truy vấn dùng một lần):",
[("Độc giả CHƯA mượn sách nào.","SELECT d.MaDG FROM DocGia d WHERE (SELECT COUNT(*) FROM MuonSach m WHERE m.MaDG=d.MaDG)=0"),
 ("Độc giả đã mượn sách từ 2 THỂ LOẠI khác nhau trở lên.","SELECT d.MaDG FROM DocGia d WHERE (SELECT COUNT(DISTINCT s.TheLoai) FROM MuonSach m INNER JOIN Sach s ON s.MaSach=m.MaSach WHERE m.MaDG=d.MaDG)>=2"),
 ("Độc giả mượn sách đúng MỘT cuốn khác nhau (nhưng có thể nhiều lần).","SELECT d.MaDG FROM DocGia d WHERE (SELECT COUNT(DISTINCT m.MaSach) FROM MuonSach m WHERE m.MaDG=d.MaDG)=1")],
["SELECT d.MaDG\nFROM DocGia d LEFT JOIN MuonSach m ON d.MaDG = m.MaDG\nWHERE m.MaMuon IS NULL;",
 "SELECT m.MaDG\nFROM MuonSach m INNER JOIN Sach s ON m.MaSach = s.MaSach\nGROUP BY m.MaDG\nHAVING COUNT(DISTINCT s.TheLoai) >= 2;",
 "SELECT MaDG\nFROM MuonSach\nGROUP BY MaDG\nHAVING COUNT(DISTINCT MaSach) = 1;"],
"Mỗi yêu cầu có một “chữ ký” riêng: IS NULL sau LEFT JOIN (chưa có); COUNT(DISTINCT thể loại) ≥ 2; COUNT(DISTINCT sách) = 1.",8)
MATCH('h-sql-43','quanly_diem',S6,"Ghép đúng mỗi yêu cầu với truy vấn thực hiện đúng yêu cầu đó (mỗi truy vấn dùng một lần):",
[("Học sinh có điểm Tin '2024-2025' cao hơn điểm Tin '2023-2024' của chính mình.","SELECT a.MaHS FROM KetQua a WHERE a.MaMon='TIN' AND a.NamHoc='2024-2025' AND a.Diem > (SELECT b.Diem FROM KetQua b WHERE b.MaHS=a.MaHS AND b.MaMon='TIN' AND b.NamHoc='2023-2024')"),
 ("Học sinh có điểm Tin '2024-2025' cao hơn điểm Tin trung bình cả năm đó.","SELECT MaHS FROM KetQua WHERE MaMon='TIN' AND NamHoc='2024-2025' AND Diem > (SELECT AVG(Diem) FROM KetQua WHERE MaMon='TIN' AND NamHoc='2024-2025')"),
 ("Học sinh có điểm Tin '2024-2025' nhưng không có điểm Toán '2024-2025'.","SELECT DISTINCT MaHS FROM KetQua t WHERE MaMon='TIN' AND NamHoc='2024-2025' AND MaHS NOT IN (SELECT MaHS FROM KetQua WHERE MaMon='TOA' AND NamHoc='2024-2025')")],
["SELECT a.MaHS\nFROM KetQua a INNER JOIN KetQua b ON a.MaHS = b.MaHS AND a.MaMon = b.MaMon\nWHERE a.MaMon = 'TIN' AND a.NamHoc = '2024-2025' AND b.NamHoc = '2023-2024'\n  AND a.Diem > b.Diem;",
 "SELECT MaHS FROM KetQua\nWHERE MaMon = 'TIN' AND NamHoc = '2024-2025'\n  AND Diem > (SELECT AVG(Diem) FROM KetQua\n              WHERE MaMon = 'TIN' AND NamHoc = '2024-2025');",
 "SELECT t.MaHS FROM KetQua t\nWHERE t.MaMon = 'TIN' AND t.NamHoc = '2024-2025'\n  AND NOT EXISTS (SELECT 1 FROM KetQua x\n                  WHERE x.MaHS = t.MaHS AND x.MaMon = 'TOA' AND x.NamHoc = '2024-2025');"],
"Ba mẫu: tự kết nối (so sánh hai dòng của cùng một bảng), truy vấn con cho giá trị trung bình, NOT EXISTS cho phần “không có”.",11)
# ======================= SẮP XẾP MỆNH ĐỀ =======================
ORDERQ('h-sql-44','thuvien',G,"Các mệnh đề sau xáo trộn thứ tự. Thứ tự nào ghép thành câu lệnh ĐÚNG (chạy được và cho đúng yêu cầu: thể loại có từ 3 lượt mượn trở lên, sắp xếp giảm dần theo số lượt)?",
{1:"SELECT s.TheLoai, COUNT(*) AS SoLuot",2:"FROM Sach s INNER JOIN MuonSach m ON s.MaSach = m.MaSach",3:"WHERE m.SoNgay >= 3",4:"GROUP BY s.TheLoai",5:"HAVING COUNT(*) >= 3",6:"ORDER BY SoLuot DESC"},
[1,2,3,4,5,6],[[1,2,4,3,5,6],[1,2,3,4,6,5],[1,2,3,5,4,6]],
"SELECT s.TheLoai, COUNT(*) AS SoLuot FROM Sach s INNER JOIN MuonSach m ON s.MaSach = m.MaSach WHERE m.SoNgay >= 3 GROUP BY s.TheLoai HAVING COUNT(*) >= 3 ORDER BY SoLuot DESC;",
"Thứ tự viết: SELECT → FROM (JOIN) → WHERE → GROUP BY → HAVING → ORDER BY. Đảo vị trí bất kì đều gây lỗi cú pháp.",1)
ORDERQ('h-sql-45','quanly_diem',S6,"Ghép các mệnh đề sau thành câu lệnh đúng cho yêu cầu “mã học sinh có điểm Tin '2024-2025' cao nhất”. Thứ tự nào đúng?",
{1:"SELECT MaHS",2:"FROM KetQua",3:"WHERE MaMon = 'TIN' AND NamHoc = '2024-2025'",4:"AND Diem = (SELECT MAX(Diem) FROM KetQua",5:"WHERE MaMon = 'TIN' AND NamHoc = '2024-2025')"},
[1,2,3,4,5],[[1,2,4,3,5],[1,3,2,4,5],[2,1,3,4,5]],
"SELECT MaHS FROM KetQua WHERE MaMon = 'TIN' AND NamHoc = '2024-2025' AND Diem = (SELECT MAX(Diem) FROM KetQua WHERE MaMon = 'TIN' AND NamHoc = '2024-2025');",
"Truy vấn con nằm trong ngoặc, đặt SAU điều kiện của truy vấn ngoài và phải lặp lại phạm vi (môn, năm).",2)
# ======================= TÌM VÀ SỬA LỖI =======================
FIXQ('h-sql-46','thuvien',G,"Câu lệnh sau định liệt kê độc giả đã mượn từ 3 lượt trở lên nhưng báo lỗi. Cách sửa nào đúng?",
"SELECT d.TenDG, COUNT(*) AS SoLuot\nFROM DocGia d INNER JOIN MuonSach m ON d.MaDG = m.MaDG\nWHERE COUNT(*) >= 3\nGROUP BY d.MaDG, d.TenDG;",
"SELECT d.TenDG, COUNT(*) AS SoLuot FROM DocGia d INNER JOIN MuonSach m ON d.MaDG = m.MaDG GROUP BY d.MaDG, d.TenDG HAVING COUNT(*) >= 3;",
("Bỏ WHERE COUNT(*) >= 3 và thêm HAVING COUNT(*) >= 3 sau GROUP BY.","SELECT d.TenDG, COUNT(*) AS SoLuot FROM DocGia d INNER JOIN MuonSach m ON d.MaDG = m.MaDG GROUP BY d.MaDG, d.TenDG HAVING COUNT(*) >= 3;"),
[("Đổi INNER JOIN thành LEFT JOIN.","SELECT d.TenDG, COUNT(*) AS SoLuot FROM DocGia d LEFT JOIN MuonSach m ON d.MaDG = m.MaDG WHERE COUNT(*) >= 3 GROUP BY d.MaDG, d.TenDG;"),
 ("Đổi COUNT(*) thành COUNT(d.TenDG) trong WHERE.","SELECT d.TenDG, COUNT(*) AS SoLuot FROM DocGia d INNER JOIN MuonSach m ON d.MaDG = m.MaDG WHERE COUNT(d.TenDG) >= 3 GROUP BY d.MaDG, d.TenDG;"),
 ("Thêm DISTINCT vào SELECT.","SELECT DISTINCT d.TenDG, COUNT(*) AS SoLuot FROM DocGia d INNER JOIN MuonSach m ON d.MaDG = m.MaDG WHERE COUNT(*) >= 3 GROUP BY d.MaDG, d.TenDG;")],
"Hàm tổng hợp không được đứng trong WHERE (WHERE chạy trước khi nhóm); điều kiện trên nhóm phải đặt ở HAVING.",1)
FIXQ('h-sql-47','thuexe',S6,"Câu lệnh sau định liệt kê MỌI khách kèm số lượt thuê từ 3 giờ trở lên (0 nếu không có), nhưng khách Khoa và Hà bị mất. Nguyên nhân và cách sửa đúng là:",
"SELECT k.TenKT, COUNT(l.MaLuot) AS SoLuot\nFROM KhachThue k LEFT JOIN LuotThue l ON k.MaKT = l.MaKT\nWHERE l.SoGio >= 3\nGROUP BY k.MaKT, k.TenKT\nORDER BY k.TenKT;",
"SELECT k.TenKT, COUNT(l.MaLuot) AS SoLuot FROM KhachThue k LEFT JOIN LuotThue l ON k.MaKT = l.MaKT AND l.SoGio >= 3 GROUP BY k.MaKT, k.TenKT ORDER BY k.TenKT;",
("Điều kiện l.SoGio >= 3 trong WHERE loại các dòng NULL của LEFT JOIN; phải chuyển điều kiện đó vào mệnh đề ON.","SELECT k.TenKT, COUNT(l.MaLuot) AS SoLuot FROM KhachThue k LEFT JOIN LuotThue l ON k.MaKT = l.MaKT AND l.SoGio >= 3 GROUP BY k.MaKT, k.TenKT ORDER BY k.TenKT;"),
[("Đổi LEFT JOIN thành INNER JOIN.","SELECT k.TenKT, COUNT(l.MaLuot) AS SoLuot FROM KhachThue k INNER JOIN LuotThue l ON k.MaKT = l.MaKT WHERE l.SoGio >= 3 GROUP BY k.MaKT, k.TenKT ORDER BY k.TenKT;"),
 ("Đổi COUNT(l.MaLuot) thành COUNT(*).","SELECT k.TenKT, COUNT(*) AS SoLuot FROM KhachThue k LEFT JOIN LuotThue l ON k.MaKT = l.MaKT WHERE l.SoGio >= 3 GROUP BY k.MaKT, k.TenKT ORDER BY k.TenKT;"),
 ("Chuyển điều kiện sang HAVING l.SoGio >= 3.","SELECT k.TenKT, COUNT(l.MaLuot) AS SoLuot FROM KhachThue k LEFT JOIN LuotThue l ON k.MaKT = l.MaKT GROUP BY k.MaKT, k.TenKT HAVING l.SoGio >= 3 ORDER BY k.TenKT;")],
"Điều kiện trong WHERE áp lên kết quả SAU khi nối nên xoá các dòng NULL; điều kiện trong ON chỉ quyết định dòng nào được ghép, vẫn giữ các dòng bên trái chưa ghép được.",2)
if __name__=='__main__':
    H.save('hard_sql2_out.json'); print(len(OUT))
    for q in OUT:
        if q['type']=='mcq': print(q['id'],'→',q['options'][q['key']][:90].replace('\n',' '))
        else: print(q['id'],[i['v'] for i in q['items']])
