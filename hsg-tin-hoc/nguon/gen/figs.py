# -*- coding: utf-8 -*-
from svg import *
F={}
# 1. CSS: thang ưu tiên + trọng số
b=''
b+=T(320,24,'Ai thắng khi nhiều quy tắc cùng chọn một phần tử?','tb','middle')
steps=[('1','!important','thắng tất cả','bb'),('2','style="…" trong thẻ','nội tuyến','bw'),('3','Trọng số bộ chọn','id 100 · lớp 10 · thẻ 1','ba'),('4','Cùng trọng số','quy tắc viết SAU thắng','bo'),('5','Kế thừa / mặc định','yếu nhất','bx')]
for i,(n,a,c,k) in enumerate(steps):
    y=40+i*44
    b+=R(60+i*10,y,500-i*20,36,k)+T(76+i*10,y+23,n+'. '+a,'tb')+T(550-i*10,y+23,c,'ts','end')
b+=T(320,270,'Đi từ trên xuống: gặp tầng nào phân thắng bại thì dừng.','ts','middle')
F['css_uutien']=SVG(640,284,b,'Thang ưu tiên CSS')
# 2. trọng số ví dụ
b=T(320,22,'Cộng trọng số từng phần của bộ chọn','tb','middle')
rows=[('p em','1 + 1','= 2'),('.test #p11','10 + 100','= 110'),('p em .a .b','1 + 1 + 10 + 10','= 22'),('p em #x','1 + 1 + 100','= 102')]
for i,(s,w,r) in enumerate(rows):
    y=40+i*44
    b+=R(40,y,200,34,'bx')+T(140,y+22,s,'tm','middle')+T(260,y+22,w,'t')+R(470,y,130,34,'ba' if i!=1 else 'bo')+T(535,y+22,r,'tb','middle')
b+=T(320,236,'Bộ chọn có tổng lớn hơn thì thắng. 11 lớp (110) vẫn lớn hơn 1 id (100).','ts','middle')
F['css_trongso']=SVG(640,250,b,'Cách tính trọng số')
# 3. mô hình hộp
b=T(320,20,'Mô hình hộp: từ trong ra ngoài','tb','middle')
b+=R(80,34,480,250,'bw',4)+T(96,54,'margin (lề – ngoài viền, trong suốt)','ts')
b+=R(120,64,400,200,'bb',4)+T(136,84,'border (viền)','ts')
b+=R(150,94,340,140,'ba',4)+T(166,114,'padding (đệm)','ts')
b+=R(200,124,240,80,'bo',4)+TT(320,160,['content','(nội dung)'],'tb')
b+=T(320,302,'Bề rộng chiếm = content + 2×padding + 2×border (content-box)','ts','middle')
b+=T(320,322,'Ví dụ: 300 + 2×20 + 2×5 = 350px; lề dọc liền kề thì gộp lấy số lớn.','ts','middle')
F['css_box']=SVG(640,336,b,'Mô hình hộp CSS')
# 4. selector tree
b=T(320,20,'Cây phần tử: bộ chọn nào "với tới" phần tử nào?','tb','middle')
def node(x,y,s,c='bx'):return R(x-34,y-14,68,28,c,6)+T(x,y+5,s,'tm','middle')
b+=L(320,56,160,100)+L(320,56,480,100)+L(160,128,100,172)+L(160,128,220,172)+L(480,128,480,172)
b+=node(320,42,'div.box','ba')+node(160,114,'p','bo')+node(480,114,'span')+node(100,186,'em')+node(220,186,'a')+node(480,186,'p')
b+=TT(160,224,['div.box > p','(con trực tiếp)'],'ts')+TT(320,224,['div.box p','(mọi cấp con cháu)','→ cả 2 thẻ p'],'ts')+TT(480,224,['p ở sâu hơn:','chỉ khớp "div.box p"'],'ts')
F['css_tree']=SVG(640,270,b,'Cây phần tử và bộ chọn')
# 5. flex
b=T(320,20,'Flexbox: trục chính và trục phụ','tb','middle')
b+=R(40,36,260,150,'bx')+T(170,54,'flex-direction: row','ts','middle')
for i in range(3):b+=R(70+i*70,80,56,50,'ba' if i!=1 else 'bo')+T(98+i*70,110,str(i+1),'tb','middle')
b+=L(60,160,290,160,'ln',True)+T(175,178,'trục chính (ngang) → justify-content','ts','middle')
b+=R(340,36,260,150,'bx')+T(470,54,'flex-direction: column','ts','middle')
for i in range(3):b+=R(470,64+i*38,60,30,'ba' if i!=1 else 'bo')+T(500,84+i*38,str(i+1),'tb','middle')
b+=L(362,64,362,176,'ln',True)+T(372,120,'trục chính','ts')+T(372,136,'(dọc)','ts')+T(530,178,'trục phụ (ngang)','ts','end')
b+=T(320,212,'row: chính = ngang, phụ = dọc · column: chính = dọc, phụ = ngang','tm','middle')
b+=T(320,234,'justify-content căn theo trục CHÍNH; align-items căn theo trục PHỤ.','ts','middle')
F['css_flex']=SVG(640,248,b,'Trục chính và trục phụ của Flexbox')
# 6. bảng colspan rowspan
b=T(320,20,'Vẽ lưới trước, rồi mới đếm thẻ td','tb','middle')
cells=[(40,36,2,1,'th colspan="2"','bo'),(40,76,1,1,'td','bx'),(140,76,1,1,'td','bx'),(40,116,1,2,'td rowspan="2"','ba'),(140,116,1,1,'td','bx'),(140,156,1,1,'td','bx')]
for x,y,cs,rs,s,k in cells:
    w=96*cs+(4 if cs>1 else 0);h=36*rs+(4 if rs>1 else 0)
    b+=R(x,y,w,h,k,4)+(TT(x+w/2,y+h/2-3,s.split(' ',1),'tm','middle',15) if ' ' in s and 'span' in s and cs==1 else T(x+w/2,y+h/2+5,s,'tm','middle'))
b+=T(260,60,'← hàng 1: 1 thẻ (ô gộp 2 cột)','ts')+T(260,100,'← hàng 2: 2 thẻ','ts')+T(260,140,'← hàng 3: 2 thẻ (có ô rowspan)','ts')+T(260,176,'← hàng 4: chỉ 1 thẻ td!','tw')+T(260,200,'cột 1 của hàng 4 đã bị ô rowspan chiếm','ts')
F['html_bang']=SVG(640,214,b,'Bảng có ô gộp')
# 7. WHERE vs HAVING pipeline
b=T(320,20,'Thứ tự SQL thực sự xử lí một truy vấn','tb','middle')
st=[('FROM / JOIN','lấy bảng','bx'),('WHERE','lọc DÒNG','bo'),('GROUP BY','gom nhóm','ba'),('HAVING','lọc NHÓM','bw'),('SELECT','chọn cột','bx'),('ORDER BY','sắp xếp','bx')]
for i,(a,c,k) in enumerate(st):
    x=14+i*104
    b+=R(x,44,94,64,k,6)+T(x+47,70,a,'tb','middle')+T(x+47,92,c,'ts','middle')
    if i<5:b+=L(x+94,76,x+104,76,'ln',True)
b+=R(40,136,250,66,'bo')+TT(165,160,['WHERE: dùng trước khi nhóm','cột thường: Lop = "12A1"'],'tm')
b+=R(350,136,250,66,'bw')+TT(475,160,['HAVING: dùng sau khi nhóm','hàm tổng hợp: COUNT(*) > 2'],'tm')
b+=T(320,228,'Hàm tổng hợp (COUNT, SUM, AVG…) chưa tồn tại lúc WHERE chạy → phải dùng HAVING.','ts','middle')
F['sql_pipeline']=SVG(640,242,b,'Thứ tự xử lí truy vấn SQL')
# 8. group demo
b=T(320,20,'GROUP BY gom nhiều dòng thành một dòng cho mỗi nhóm','tb','middle')
rows=[('An','12A1'),('Bình','12A1'),('Chi','12A2'),('Dũng','12A1'),('Em','12A2')]
b+=R(30,34,200,28,'ba')+T(60,53,'Ten','tb')+T(160,53,'Lop','tb')
for i,(n,l) in enumerate(rows):
    y=66+i*28;k='bo' if l=='12A1' else 'bw'
    b+=R(30,y,200,26,k,4)+T(60,y+18,n,'tm')+T(160,y+18,l,'tm')
b+=L(240,130,330,130,'ln',True)+T(285,120,'GROUP BY Lop','ts','middle')
b+=R(340,66,130,26,'ba')+T(352,84,'Lop','tb')+T(460,84,'COUNT(*)','tb','end')
b+=R(340,96,130,26,'bo',4)+T(352,114,'12A1','tm')+T(460,114,'3','tb','end')
b+=R(340,126,130,26,'bw',4)+T(352,144,'12A2','tm')+T(460,144,'2','tb','end')
b+=L(478,110,520,110,'ln',True)+R(530,90,90,40,'bo')+TT(575,106,['HAVING','COUNT(*)>2'],'ts')+T(575,150,'→ chỉ 12A1','tb','middle')
F['sql_group']=SVG(640,220,b,'GROUP BY và HAVING')
# 9. join
b=T(320,20,'LEFT JOIN: giữ mọi dòng bảng bên trái','tb','middle')
b+=R(30,36,150,24,'ba')+T(105,53,'Sach','tb','middle')
for i,(s,k) in enumerate([('S1 Toán','bo'),('S2 Tin','bo'),('S3 Văn','bb')]):
    b+=R(30,64+i*28,150,26,k,4)+T(40,82+i*28,s,'tm')
b+=R(250,36,150,24,'ba')+T(325,53,'MuonSach','tb','middle')
for i,(s) in enumerate(['S1 – An','S2 – Bình']):
    b+=R(250,64+i*28,150,26,'bo',4)+T(260,82+i*28,s,'tm')
b+=L(180,77,250,77,'ln')+L(180,105,250,91,'ln')
b+=T(460,52,'Kết quả LEFT JOIN','tb')
res=[('S1 Toán','An','bo'),('S2 Tin','Bình','bo'),('S3 Văn','NULL','bb')]
for i,(a,c,k) in enumerate(res):
    b+=R(440,60+i*28,180,26,k,4)+T(450,78+i*28,a,'tm')+T(610,78+i*28,c,'tb','end')
b+=R(30,160,590,50,'bb')+TT(325,182,['"Sách chưa ai mượn": lọc dòng có NULL → WHERE MuonSach.MaSach IS NULL','(dùng IS NULL, không viết = NULL)'],'tm')
F['sql_join']=SVG(640,224,b,'LEFT JOIN và IS NULL')
# 10. khóa
b=T(320,20,'Khoá chính và khoá ngoài nối hai bảng','tb','middle')
b+=R(30,36,230,28,'ba')+T(145,55,'HocSinh','tb','middle')
for i,(a,c) in enumerate([('MaHS 🔑','khoá chính'),('TenHS',''),('MaLop','khoá ngoài')]):
    b+=R(30,66+i*30,230,28,'bo' if i==0 else ('bw' if i==2 else 'bx'),4)+T(42,85+i*30,a,'tm')+T(250,85+i*30,c,'ts','end')
b+=R(380,36,230,28,'ba')+T(495,55,'Lop','tb','middle')
for i,(a,c) in enumerate([('MaLop 🔑','khoá chính'),('TenLop','')]):
    b+=R(380,66+i*30,230,28,'bo' if i==0 else 'bx',4)+T(392,85+i*30,a,'tm')+T(600,85+i*30,c,'ts','end')
b+=P('M260,155 C320,155 320,96 380,96','ln',True)
b+=R(30,176,580,44,'bx')+TT(320,196,['Khoá ngoài MaLop chỉ được nhận giá trị ĐÃ CÓ ở khoá chính của bảng Lop.','Không thể thêm học sinh vào lớp chưa tồn tại.'],'tm')
F['csdl_khoa']=SVG(640,234,b,'Khoá chính và khoá ngoài')
# 11. độ phức tạp
b=T(320,20,'Số phép tính khi n tăng','tb','middle')
b+=L(60,200,610,200)+L(60,200,60,34)+T(335,220,'n (kích thước dữ liệu)','ts','middle')
b+=P('M60,196 L600,190','ln')+P('M60,196 C200,190 330,180 600,160','lg1')+P('M60,196 C200,190 300,120 400,36','lg2')+P('M60,196 C160,150 260,90 330,36','lg3')
b+=T(600,184,'log n','ts','end')+T(604,152,'n','ts','end')+T(414,50,'n²','tw')+T(320,50,'2ⁿ','tr')
b+=R(440,60,170,66,'bx')+TT(525,80,['n = 100','log n ≈ 7 · n = 100','n² = 10 000'],'ts',lh=16)
F['complexity']=SVG(640,232,b,'Đường tăng của các độ phức tạp')
# 12. đếm vòng lặp
b=T(320,20,'n = 8: vòng trong chạy bao nhiêu lần ứng với từng i?','tb','middle')
for i in range(1,8):
    x=30+(i-1)*84;cnt=7//i
    b+=R(x,36,76,28,'ba')+T(x+38,55,'i = %d'%i,'tb','middle')
    b+=R(x,68,76,28,'bo')+T(x+38,87,'%d lần'%cnt,'tm','middle')
    b+=T(x+38,114,'j = '+','.join(str(i*k) for k in range(1,cnt+1)) if cnt<=3 else 'j = 1…7','ts','middle')
b+=T(320,146,'Tổng = 7 + 3 + 2 + 1 + 1 + 1 + 1 = 16 lần','tb','middle')
b+=T(320,168,'≈ n(1 + ½ + ⅓ + …) ≈ n·ln n → O(n log n), không phải O(n²).','tm','middle')
F['loops']=SVG(640,184,b,'Đếm số lần lặp theo từng i')
# 13. tìm kiếm nhị phân
b=T(320,20,'Tìm 23 trong dãy đã sắp xếp: mỗi lần bỏ một nửa','tb','middle')
arr=[2,5,8,12,16,23,38,56,72,91,95,99,104,110,120]
def row(y,lo,hi,mid,found=False):
    s=''
    for i,v in enumerate(arr):
        x=22+i*40
        k='bx'
        if lo<=i<=hi:k='ba'
        if i==mid:k='bo' if found else 'bw'
        s+=R(x,y,36,28,k,4)+T(x+18,y+19,str(v),'ts','middle')
    return s
b+=row(36,0,14,7)+T(22,84,'Lần 1: l=0, r=14, m=7 → a[7]=56 > 23 → bỏ nửa phải','ts')
b+=row(94,0,6,3)+T(22,142,'Lần 2: l=0, r=6, m=3 → a[3]=12 < 23 → bỏ nửa trái','ts')
b+=row(152,4,6,5,True)+T(22,200,'Lần 3: l=4, r=6, m=5 → a[5]=23 ✔ tìm thấy sau 3 lần','tm')
b+=R(22,212,596,30,'bx')+T(320,232,'n = 15 → tối đa ⌊log₂15⌋+1 = 4 lần; n = 100 000 chỉ cần 17 lần. Điều kiện: dãy phải sắp xếp.','ts','middle')
F['bsearch']=SVG(640,252,b,'Tìm kiếm nhị phân')
# 14. sắp xếp chọn
b=T(320,20,'Sắp xếp chọn: mỗi lượt đưa số nhỏ nhất của phần còn lại về đầu','tb','middle')
def arrrow(y,vals,sorted_n,mark=None,lab=''):
    s=T(20,y+19,lab,'ts')
    for i,v in enumerate(vals):
        k='bo' if i<sorted_n else ('bw' if i==mark else 'bx')
        s+=R(150+i*58,y,52,28,k,4)+T(176+i*58,y+19,str(v),'tb','middle')
    return s
b+=arrrow(36,[29,10,14,37,13],0,1,'Ban đầu')+T(480,56,'nhỏ nhất = 10','ts')
b+=arrrow(80,[10,29,14,37,13],1,4,'Sau lượt 1')+T(480,100,'đổi 29 ↔ 10','ts')
b+=arrrow(124,[10,13,14,37,29],2,2,'Sau lượt 2')+T(480,144,'đổi 29 ↔ 13','ts')
b+=arrrow(168,[10,13,14,29,37],5,None,'Kết thúc')
b+=R(20,208,600,44,'bx')+TT(320,228,['Chọn: luôn n(n−1)/2 phép so sánh, tối đa n−1 lần đổi chỗ.','Chèn: dịch phần tử lớn sang phải rồi chèn vào; mảng đã sắp xếp thì chỉ O(n).'],'ts')
F['ssort']=SVG(640,266,b,'Sắp xếp chọn từng lượt')
# 15. đệ quy cây gọi fib(4)
b=T(320,20,'Cây lời gọi của f(4) với f(n)=f(n−1)+f(n−2), f(0)=f(1)=1','tb','middle')
def fn(x,y,s,k='bx'):return R(x-27,y-13,54,26,k,6)+T(x,y+5,s,'tm','middle')
edges=[(320,50,200,100),(320,50,440,100),(200,100,130,150),(200,100,270,150),(440,100,380,150),(440,100,500,150),(130,150,100,200),(130,150,160,200)]
for e in edges:b+=L(*e)
b+=fn(320,50,'f(4)','ba')+fn(200,100,'f(3)')+fn(440,100,'f(2)')+fn(130,150,'f(2)')+fn(270,150,'f(1)','bo')+fn(380,150,'f(1)','bo')+fn(500,150,'f(0)','bo')+fn(100,200,'f(1)','bo')+fn(160,200,'f(0)','bo')
b+=T(630,52,'9 lời gọi','tb','end')+T(630,70,'f(2) bị tính lặp','ts','end')+T(630,86,'2 lần!','ts','end')
b+=R(20,222,600,44,'bx')+TT(320,242,['Mỗi lời gọi sinh 2 lời gọi con → số lời gọi tăng ≈ gấp đôi: O(2ⁿ).','Điều kiện dừng (lá màu xanh) là thứ giúp đệ quy kết thúc.'],'ts')
F['recursion']=SVG(640,280,b,'Cây lời gọi đệ quy')
# 16. IP mask
b=T(320,20,'192.168.10.77/26 → 26 bit đầu là phần MẠNG, 6 bit sau là phần MÁY','tb','middle')
bits='11000000.10101000.00001010.01001101'
x=20
for i,ch in enumerate(bits):
    if ch=='.':x+=6;continue
    k='ba' if (sum(1 for c in bits[:i] if c!='.'))<26 else 'bo'
    b+=R(x,40,16,26,k,3)+T(x+8,58,ch,'tm','middle');x+=18
b+=T(20,86,'Phần mạng (26 bit)','ts')+T(480,86,'Phần máy (6 bit)','ts')
b+=R(20,100,600,100,'bx')+TT(320,122,['Địa chỉ mạng: đặt 6 bit máy = 0 → 192.168.10.64','Quảng bá: 6 bit máy = 1 → 192.168.10.127','Số máy dùng được = 2⁶ − 2 = 62','Cùng mạng con ⇔ phần mạng giống nhau'],'tm',lh=22)
F['ipmask']=SVG(640,214,b,'Địa chỉ IP và mặt nạ')
# 17. thiết bị mạng
b=T(320,20,'Hub – Switch – Router khác nhau ở chỗ gửi dữ liệu đi đâu','tb','middle')
def pc(x,y,s,k='bx'):return R(x-24,y-14,48,28,k,5)+T(x,y+5,s,'tm','middle')
b+=R(70,44,90,34,'bw')+T(115,66,'HUB','tb','middle')
for i,(x,k) in enumerate([(40,'bo'),(100,'bx'),(160,'bx')]):
    b+=L(115,78,x+10,112)+pc(x+10,126,'ABC'[i],k)
b+=T(115,162,'phát cho MỌI cổng','ts','middle')
b+=R(260,44,90,34,'ba')+T(305,66,'SWITCH','tb','middle')
for i,(x,k) in enumerate([(240,'bo'),(300,'bx'),(360,'bx')]):
    b+=L(305,78,x+10,112,'ln' if i==0 else 'lg0')+pc(x+10,126,'ABC'[i],k)
b+=T(305,162,'chỉ gửi đúng cổng đích','ts','middle')
b+=R(470,44,90,34,'bo')+T(515,66,'ROUTER','tb','middle')+L(515,78,440,112)+L(515,78,590,112)
b+=R(395,100,90,28,'bx')+T(440,119,'mạng 1','tm','middle')+R(545,100,90,28,'bx')+T(590,119,'mạng 2','tm','middle')
b+=T(515,162,'nối các mạng, chọn đường theo IP','ts','middle')
b+=R(20,184,600,40,'bx')+T(320,209,'Modem: đổi tín hiệu số ↔ tín hiệu đường truyền · Repeater: khuếch đại · AP: phát Wi-Fi','ts','middle')
F['netdev']=SVG(640,236,b,'Hub, switch, router')
# 18. ma trận nhầm lẫn
b=T(320,20,'Ma trận nhầm lẫn (lớp cần tìm = "thư rác")','tb','middle')
b+=T(330,50,'Mô hình báo: RÁC','tb','middle')+T(500,50,'Mô hình báo: THƯỜNG','tb','middle')
b+=T(110,100,'Thực tế: RÁC','tb','middle')+T(110,162,'Thực tế: THƯỜNG','tb','middle')
b+=R(250,60,160,56,'bo')+TT(330,84,['TP = 24','đúng là rác, báo rác'],'tm')+R(420,60,160,56,'bb')+TT(500,84,['FN = 16','rác bị bỏ sót'],'tm')
b+=R(250,124,160,56,'bw')+TT(330,148,['FP = 6','thường, báo nhầm là rác'],'tm')+R(420,124,160,56,'bx')+TT(500,148,['TN = 54','đúng là thường'],'tm')
b+=R(20,196,600,60,'bx')+TT(320,214,['Precision = TP/(TP+FP) = 24/30 = 0,8   (trong số báo rác, đúng bao nhiêu)','Recall = TP/(TP+FN) = 24/40 = 0,6   (trong số rác thật, bắt được bao nhiêu)','Accuracy = (TP+TN)/100 = 0,78'],'ts',lh=17)
F['confusion']=SVG(640,270,b,'Ma trận nhầm lẫn')
# 19. quá khớp
b=T(320,20,'Sai số theo độ phức tạp của mô hình','tb','middle')
b+=L(60,200,610,200)+L(60,200,60,34)+T(335,222,'độ phức tạp của mô hình →','ts','middle')+T(20,40,'sai số','ts')
b+=P('M60,60 C200,150 350,185 600,192','lg1')+P('M60,70 C200,140 330,150 600,70','lg2')
b+=T(520,170,'tập huấn luyện (giảm mãi)','ts','middle')+T(500,58,'tập kiểm thử (tăng lại)','tw','middle')
b+=L(330,40,330,200,'ln')+T(330,34,'điểm tốt','ts','middle')
b+=T(170,190,'DƯỚI KHỚP','ts','middle')+T(520,130,'QUÁ KHỚP','tr','middle')
F['overfit']=SVG(640,236,b,'Quá khớp')
# 20. ngăn xếp / hàng đợi
b=T(320,20,'Ngăn xếp (LIFO) và hàng đợi (FIFO)','tb','middle')
for i,v in enumerate(['3','2','1']):
    b+=R(60,50+i*36,80,30,'ba' if i==0 else 'bx',4)+T(100,70+i*36,v,'tb','middle')
b+=L(100,40,100,48,'ln',True)+T(160,66,'← đỉnh: push / pop ở đây','ts')+T(100,168,'ngăn xếp: vào sau – ra trước','ts','middle')
for i,v in enumerate(['1','2','3']):
    b+=R(340+i*70,60,64,34,'ba' if i==0 else 'bx',4)+T(372+i*70,82,v,'tb','middle')
b+=T(372,50,'ra (popleft)','ts','middle')+T(552,50,'vào (append)','ts','middle')+L(560,77,590,77,'ln',True)+L(334,77,310,77,'ln',True)
b+=T(430,120,'hàng đợi: vào trước – ra trước','ts','middle')
b+=R(20,184,600,34,'bx')+T(320,206,'Kiểm tra ngoặc cân bằng dùng ngăn xếp · list.pop(0) chậm O(n), dùng deque.popleft() O(1).','ts','middle')
F['stackqueue']=SVG(640,232,b,'Ngăn xếp và hàng đợi')
# 21. ma trận & chéo
b=T(320,20,'Ma trận 4×4 (chỉ số từ 0)','tb','middle')
for i in range(4):
    for j in range(4):
        k='bo' if i==j else ('bw' if i+j==3 else 'bx')
        b+=R(60+j*56,36+i*40,52,36,k,4)+T(86+j*56,59+i*40,'a[%d][%d]'%(i,j),'ts','middle')
b+=T(310,70,'chéo chính: i = j','tm')+T(310,110,'chéo phụ: i + j = n − 1','tm')
b+=R(300,140,320,56,'bb')+TT(460,160,['[[0]*3]*3: 3 hàng là CÙNG một danh sách!','[[0]*3 for _ in range(3)]: 3 hàng riêng'],'ts')
F['matrix']=SVG(640,212,b,'Ma trận và đường chéo')
# 22. phạm vi biến
b=T(320,20,'Phạm vi biến: trong ngoài','tb','middle')
b+=R(30,34,580,170,'ba')+T(46,54,'Toàn cục: x = 7','tb')
b+=R(60,70,240,120,'bo')+TT(180,92,['def g():','x = 3  ← biến CỤC BỘ mới','(x toàn cục vẫn là 7)'],'tm')
b+=R(330,70,260,120,'bw')+TT(460,92,['def h():','global x','x = x + 1  ← sửa x toàn cục','(thiếu global → UnboundLocalError)'],'tm')
F['scope']=SVG(640,218,b,'Phạm vi biến')
# 23. cắt lát
b=T(320,20,'s = "TinHoc11": chỉ số dương trên, chỉ số âm dưới','tb','middle')
s='TinHoc11'
for i,ch in enumerate(s):
    b+=R(60+i*62,50,56,40,'ba' if i in (1,3,5,7) else 'bx',4)+T(88+i*62,77,ch,'tb','middle')+T(88+i*62,44,str(i),'ts','middle')+T(88+i*62,106,str(i-8),'ts','middle')
b+=R(40,124,560,70,'bx')+TT(320,144,['s[a:b] lấy từ a đến TRƯỚC b · s[a:b:c] bước c · s[::-1] đảo ngược','s[1::2] → chỉ số 1, 3, 5, 7 (ô màu xanh) → "iHc1"; s[1:-1:2] bỏ chỉ số 7 → "iHc"'],'ts',lh=22)
F['slice']=SVG(640,208,b,'Cắt lát xâu')
# 24. biểu mẫu label
b=T(320,18,'Liên kết label – input và nhóm radio','tb','middle')
b+=R(30,60,260,34,'bo')+T(42,82,'<label for="u">Tên</label>','tm')+R(340,60,270,34,'bo')+T(352,82,'<input id="u" name="user">','tm')
b+=P('M160,60 C160,38 475,38 475,60','ln',True)+T(318,34,'for = id','ts','middle')
b+=R(20,112,285,34,'ba')+T(30,134,'<input type="radio" name="g" value="n">','ts')+R(325,112,285,34,'ba')+T(335,134,'<input type="radio" name="g" value="f">','ts')
b+=T(320,172,'Cùng name="g" → chỉ chọn được MỘT. Dữ liệu gửi đi dùng name, không dùng id.','tm','middle')
b+=T(320,196,'disabled: không gửi · readonly: vẫn gửi nhưng không sửa được.','ts','middle')
F['forms']=SVG(640,210,b,'Biểu mẫu HTML')
# ===== thêm cho bài học theo chủ đề =====
def _node(x,y,s,k='bx',w=76):return R(x-w/2,y-14,w,28,k,6)+T(x,y+5,s,'tm','middle')
b=T(320,20,'Cấu trúc một tài liệu HTML','tb','middle')
for e in [(320,56,160,100),(320,56,480,100),(160,128,80,172),(160,128,160,172),(160,128,240,172),(480,128,400,172),(480,128,480,172),(480,128,560,172)]:b+=L(*e)
b+=_node(320,42,'<html>','ba')+_node(160,114,'<head>','bw')+_node(480,114,'<body>','bo')
b+=_node(80,186,'<title>','bx',70)+_node(160,186,'<meta>','bx',70)+_node(240,186,'<link>','bx',70)+_node(400,186,'<h1> <p>','bx',80)+_node(480,186,'<img> <a>','bx',80)+_node(560,186,'<table>','bx',72)
b+=TT(160,222,['head: thông tin về trang','(tiêu đề tab, CSS, mã hoá)'],'ts')+TT(480,222,['body: nội dung hiển thị','trong cửa sổ trình duyệt'],'ts')
F['html_struct']=SVG(640,250,b,'Cấu trúc tài liệu HTML')
b=T(320,20,'Điều gì xảy ra khi gõ một địa chỉ web?','tb','middle')
b+=R(20,50,110,50,'ba')+TT(75,72,['Trình duyệt','(máy em)'],'tb')+R(250,34,130,40,'bw')+TT(315,52,['Máy chủ DNS','tên miền → IP'],'ts')+R(500,50,120,50,'bo')+TT(560,72,['Máy chủ web','(có địa chỉ IP)'],'tb')
b+=L(130,62,250,52,'ln',True)+T(190,46,'① hỏi IP','ts','middle')+L(250,68,130,80,'ln',True)+T(190,86,'② trả IP','ts','middle')
b+=L(130,88,500,88,'ln',True)+T(315,116,'③ gửi yêu cầu HTTP tới IP (qua kết nối TCP)','ts','middle')+L(500,100,130,100,'lg1',True)+T(315,134,'④ trả về HTML, CSS, ảnh…','ts','middle')
b+=R(20,152,600,56,'bx')+TT(320,172,['⑤ Trình duyệt đọc HTML dựng cây phần tử, áp CSS, rồi vẽ trang.','Tải thêm ảnh, CSS, video bằng các yêu cầu HTTP khác.'],'ts')
F['web_flow']=SVG(640,222,b,'Luồng truy cập web')
b=T(320,20,'range(2, 12, 3): từ 2, bước 3, dừng TRƯỚC 12','tb','middle')
b+=L(30,80,610,80,'ln',True)
for v in range(0,13):
    x=40+v*44;k=v in (2,5,8,11)
    b+=L(x,74,x,86)+T(x,102,str(v),'tb' if k else 'ts','middle')
    if k:b+=C(x,80,9,'bo')
b+=T(40+12*44,62,'12 (không lấy)','ts','middle')+C(40+12*44,80,9,'bb')
b+=R(20,124,600,50,'bx')+TT(320,144,['range(2,12,3) → 2, 5, 8, 11   ·   range(5) → 0..4   ·   range(10,0,-3) → 10, 7, 4, 1','Số phần tử = ⌈(dừng − đầu)/bước⌉. Bước âm thì mốc dừng phải nhỏ hơn mốc đầu.'],'ts')
F['range_line']=SVG(640,190,b,'Dãy số của range')
b=T(320,20,'Mô hình TCP/IP gồm 4 tầng','tb','middle')
ls=[('Ứng dụng','HTTP · SMTP · DNS · FTP','ba'),('Giao vận','TCP (tin cậy) · UDP','bo'),('Internet','IP: địa chỉ và dẫn đường · ICMP','bw'),('Truy cập mạng','Ethernet · Wi-Fi · cáp quang','bx')]
for i,(a,c,k) in enumerate(ls):
    y=40+i*52;b+=R(60,y,520,44,k)+T(80,y+27,a,'tb')+T(560,y+27,c,'ts','end')
b+=L(40,40,40,236,'ln',True)+T(36,150,'↓','ts','end')
b+=T(320,262,'Dữ liệu đi xuống các tầng ở máy gửi, đi lên các tầng ở máy nhận.','ts','middle')
F['layers']=SVG(640,276,b,'Mô hình TCP/IP')
b=T(320,20,'Hai cấu trúc mạng phổ biến','tb','middle')
b+=R(70,60,110,34,'bw')+T(125,82,'SWITCH','tb','middle')
for i,(x,y) in enumerate([(40,150),(110,170),(180,170),(250,150)]):
    b+=L(125,94,x+20,y-14)+_node(x+20,y,'PC'+str(i+1),'bx',56)
b+=T(145,206,'Hình sao: nút trung tâm','ts','middle')+T(145,222,'một máy hỏng không kéo theo máy khác','ts','middle')
b+=L(360,100,600,100,'ln')+T(480,50,'Đường trục (bus)','tb','middle')
for i,x in enumerate([390,450,510,570]):
    b+=L(x,100,x,140)+_node(x,154,'PC'+str(i+1),'bx',50)
b+=T(480,206,'Bus: dùng chung một đường truyền','ts','middle')+T(480,222,'đứt trục là cả mạng ngừng','ts','middle')
F['topo']=SVG(640,236,b,'Cấu trúc mạng hình sao và bus')
b=T(320,20,'Trí tuệ nhân tạo ⊃ Học máy ⊃ Học sâu','tb','middle')
b+=R(30,40,260,170,'ba',14)+T(160,60,'Trí tuệ nhân tạo (AI)','tb','middle')+R(60,76,200,120,'bo',14)+T(160,96,'Học máy (ML)','tb','middle')+R(90,112,140,70,'bw',14)+TT(160,142,['Học sâu','(mạng nơ-ron)'],'tm')
b+=T(340,56,'Quy trình học máy','tb')
st=[('Dữ liệu','thu thập, làm sạch'),('Huấn luyện','mô hình học từ dữ liệu'),('Đánh giá','trên tập kiểm thử'),('Dự đoán','dữ liệu mới')]
for i,(a,c) in enumerate(st):
    y=68+i*36;b+=R(340,y,270,30,'bx')+T(352,y+20,a,'tb')+T(600,y+20,c,'ts','end')
F['ai_ml']=SVG(640,226,b,'AI, ML, DL và quy trình học máy')
b=T(320,20,'Chia dữ liệu: huấn luyện và kiểm thử','tb','middle')
b+=R(30,44,420,44,'ba')+T(240,72,'Tập huấn luyện (≈ 80%): mô hình học từ đây','tb','middle')+R(450,44,160,44,'bw')+T(530,72,'Kiểm thử (≈ 20%)','tb','middle')
b+=L(530,88,530,118,'ln',True)+T(530,136,'chỉ để đánh giá cuối cùng','ts','middle')+L(240,88,240,118,'ln',True)+T(240,136,'dùng để học, chọn tham số','ts','middle')
b+=R(30,160,580,44,'bb')+T(320,187,'Rò rỉ dữ liệu: mô hình "nhìn trộm" tập kiểm thử → điểm đẹp nhưng vô nghĩa.','ts','middle')
F['ml_split']=SVG(640,218,b,'Tập huấn luyện và kiểm thử')
b=T(320,20,'k-NN: nhãn của điểm mới theo đa số k láng giềng gần nhất','tb','middle')
b+=C(330,120,62,'bw')
pts=[(300,100,'bo'),(340,90,'bo'),(360,140,'bb'),(290,150,'bo'),(150,80,'bo'),(180,170,'bo'),(500,100,'bb'),(520,160,'bb'),(470,60,'bb'),(430,170,'bb')]
for x,y,k in pts:b+=C(x,y,7,k)
b+=C(330,120,8,'ba')+T(330,114,'?','tb','middle')
b+=R(20,196,600,60,'bx')+TT(320,216,['k = 4 (vòng vàng): 3 điểm xanh lá, 1 điểm đỏ → nhãn dự đoán là xanh lá.','k = 1 dễ bị một điểm nhiễu quyết định (quá khớp); k bằng cả tập: luôn ra lớp đa số.','Xanh lá = lớp A · đỏ = lớp B'],'ts',lh=17)
F['knn']=SVG(640,270,b,'k-NN')
b=T(320,20,'Các nhóm nghề trong ngành CNTT','tb','middle')
gs=[('Phần mềm','phân tích · lập trình · kiểm thử','ba'),('Web & giao diện','front-end · back-end · UI/UX','bo'),('Dữ liệu & AI','CSDL · dữ liệu · học máy','bw'),('Hạ tầng','mạng · hệ thống · sửa chữa','bx'),('An toàn thông tin','bảo mật · giám sát · ứng cứu','bb'),('Đa phương tiện','đồ hoạ · âm thanh · video','bx')]
for i,(a,c,k) in enumerate(gs):
    x=20+(i%3)*200;y=40+(i//3)*84
    b+=R(x,y,190,72,k)+T(x+95,y+30,a,'tb','middle')+T(x+95,y+52,c,'ts','middle')
b+=T(320,226,'Nghề nào cũng cần: tự học liên tục, làm việc nhóm, đạo đức nghề nghiệp.','ts','middle')
F['career']=SVG(640,240,b,'Nhóm nghề CNTT')
b=T(320,20,'Chia để trị: chia nhỏ, giải riêng, ghép lại','tb','middle')
b+=R(220,36,200,30,'ba')+T(320,56,'[8, 3, 5, 1, 9, 2]','tm','middle')
b+=L(280,66,170,100)+L(360,66,470,100)+R(70,100,200,30,'bx')+T(170,120,'[8, 3, 5]','tm','middle')+R(370,100,200,30,'bx')+T(470,120,'[1, 9, 2]','tm','middle')
b+=L(170,130,170,150,'ln',True)+L(470,130,470,150,'ln',True)+R(70,150,200,30,'bo')+T(170,170,'[3, 5, 8]  (đã giải)','tm','middle')+R(370,150,200,30,'bo')+T(470,170,'[1, 2, 9]  (đã giải)','tm','middle')
b+=L(170,180,290,206,'ln',True)+L(470,180,350,206,'ln',True)+R(220,206,200,30,'bo')+T(320,226,'[1, 2, 3, 5, 8, 9]','tm','middle')
b+=T(320,262,'Mỗi lần chia đôi: log₂n tầng; mỗi tầng ghép mất O(n) → sắp xếp trộn O(n log n).','ts','middle')
F['divide']=SVG(640,276,b,'Chia để trị')
