# -*- coding: utf-8 -*-
from deep2 import D,lesson,S
lesson('trace','Đọc mã: bảng theo dõi biến',['tinh-toan','vong-lap','bieu-thuc','kiem-thu','sua-loi','nhan-dinh','loi-chay','thuat-toan-nc'],
 'Bạn hay "đoán" kết quả thay vì chạy từng bước, nên lệch một đơn vị hoặc quên giá trị cuối của biến lặp.',
 [S('Lập bảng theo dõi',['Mỗi dòng của bảng là một lần lặp, mỗi cột là một biến. Điền từng bước, không bỏ bước nào. Đây là cách duy nhất chắc chắn với bài đọc mã.'],None,'s = 0\nfor i in range(10, 0, -3):\n    s += i\nprint(s, i)',True,'py'),
  S('Lần lượt từng lần lặp',['range(10, 0, -3) cho i = 10, 7, 4, 1 (dừng trước 0). Bảng: i=10 → s=10; i=7 → s=17; i=4 → s=21; i=1 → s=22. Sau vòng for, i giữ giá trị cuối là 1.'],None),
  S('Các điểm hay sai',['range(a, b) không gồm b. Phép // làm tròn xuống (−7 // 2 = −4); % cùng dấu với số chia (−7 % 3 = 2). round(2.5) = 2 vì Python làm tròn về số chẵn khi hoà. ** kết hợp từ phải sang trái: 2 ** 3 ** 2 = 512.'],None,'print(-7 // 2, -7 % 3, round(2.5), round(3.5), 2 ** 3 ** 2, 10 / 5)',True,'py'),
  S('Chọn bộ dữ liệu thử tốt',['Thử giá trị ở BIÊN (đúng ngưỡng, sát ngưỡng hai phía), trường hợp đặc biệt (rỗng, một phần tử, trùng, 0, số âm). Kiểm thử chỉ phát hiện lỗi, không chứng minh chương trình đúng.'],None)],
 [['Đoán kết quả không cần chạy từng bước.','Luôn lập bảng theo dõi.'],['range(1, 5) gồm cả 5.','Dừng trước 5.'],['Thử nhiều giá trị "ở giữa" là đủ.','Cần thử giá trị biên.']],
 'Ghi từng bước ra giấy; sai một đơn vị thường nằm ở biên của range hoặc điều kiện.')
# ================= MẠNG =================
lesson('ip','Địa chỉ IP, mặt nạ mạng con, băng thông',['mang-ip','mang-bang-thong'],
 'Bạn hay quên trừ 2 địa chỉ đặc biệt, hoặc không biết một máy thuộc mạng con nào.',
 [S('Mặt nạ /k chia địa chỉ làm hai phần',['/26 nghĩa là 26 bit đầu là phần MẠNG, 32 − 26 = 6 bit cuối là phần MÁY. Cùng mạng con ⇔ phần mạng giống nhau.'],'ipmask'),
  S('Tính từng bước',['Số địa chỉ trong mạng con = 2⁶ = 64; số máy dùng được = 64 − 2 = 62 (trừ địa chỉ mạng và địa chỉ quảng bá).','Với /26 các khối là 0–63, 64–127, 128–191, 192–255 ở byte cuối. 192.168.10.77 thuộc khối 64–127 → địa chỉ mạng .64, quảng bá .127.'],None,'import ipaddress\nn = ipaddress.ip_interface("192.168.10.77/26")\nprint(n.network, n.network.broadcast_address, n.network.num_addresses - 2)',True,'py'),
  S('Băng thông và thời gian truyền',['Thời gian = dung lượng / băng thông, nhưng phải đổi cùng đơn vị: 1 byte = 8 bit. Tải 600 MB qua 100 Mbps: 600 × 8 / 100 = 48 giây.'],None),
  S('Dải địa chỉ riêng',['10.0.0.0/8, 172.16.0.0 – 172.31.255.255, 192.168.0.0/16. Chú ý 172.32.x.x KHÔNG phải địa chỉ riêng.'],None)],
 [['Số máy dùng được = 2^(32−k).','Phải trừ 2.'],['Quên đổi byte ra bit.','Nhân 8.'],['172.32.0.1 là địa chỉ riêng.','Dải riêng chỉ đến 172.31.']],
 'Gặp /k, hãy tính kích thước khối = 2^(32−k) rồi chia byte cuối thành các khối.')
lesson('netdev','Thiết bị mạng và giao thức',['tbmang','thietbi','giaothuc'],
 'Bạn hay nhầm hub – switch – router, và nhầm các giao thức thư (SMTP, POP3, IMAP).',
 [S('Hub, switch, router khác nhau ở chỗ nào?',['Hub: nhận tín hiệu rồi phát ra MỌI cổng (dễ xung đột). Switch: học địa chỉ MAC và chỉ chuyển tới ĐÚNG cổng chứa máy đích. Router: nối các mạng với nhau, chọn đường đi cho gói tin theo địa chỉ IP.'],'netdev'),
  S('Các thiết bị còn lại',['Modem: biến đổi tín hiệu số ↔ tín hiệu của đường truyền (cáp, quang). Repeater: khuếch đại tín hiệu yếu. Access point (AP): phát sóng Wi-Fi cho thiết bị không dây.'],None),
  S('Giao thức hay gặp',['SMTP gửi thư; POP3/IMAP nhận thư. DNS đổi tên miền ↔ địa chỉ IP. HTTP truyền trang web. ICMP dùng cho lệnh ping. TCP bảo đảm truyền tin cậy; IP đánh địa chỉ và dẫn đường.','Thứ tự mở một trang web: DNS (tìm IP) → kết nối TCP → gửi yêu cầu HTTP.'],None)],
 [['Router chỉ khuếch đại tín hiệu.','Đó là repeater; router định tuyến.'],['HTTP dùng để nhận thư.','POP3/IMAP nhận thư; HTTP truyền trang web.'],['Ping dùng DNS.','Ping dùng ICMP.']],
 'Nhớ: Hub = loa phát thanh, Switch = đưa thư đúng nhà, Router = bưu điện nối các thành phố.')
# ================= AI / ML =================
lesson('confusion','Học máy: ma trận nhầm lẫn, precision, recall',['ml-danhgia','khdl-thongke','khdl-lamsach'],
 'Bạn hay nhầm FP với FN, và dùng accuracy khi dữ liệu mất cân bằng.',
 [S('Bốn ô của ma trận nhầm lẫn',['Chọn một lớp làm "lớp dương" (ví dụ thư rác). TP: đúng là rác, báo rác. FN: rác thật nhưng bị bỏ sót. FP: thư thường bị báo nhầm là rác. TN: thư thường, báo thường.'],'confusion'),
  S('Ba độ đo',['Precision = TP/(TP+FP): trong số mô hình báo "rác", có bao nhiêu đúng. Recall = TP/(TP+FN): trong số rác thật, bắt được bao nhiêu. Accuracy = (TP+TN)/tổng.'],None,'TP, FP, FN, TN = 24, 6, 16, 54\nprint(TP / (TP + FP), TP / (TP + FN), (TP + TN) / 100)',True,'py'),
  S('Khi nào dùng độ đo nào?',['Dữ liệu mất cân bằng (99% là lớp thường): mô hình luôn đoán "thường" vẫn có accuracy 99% nhưng vô dụng. Khi đó cần xem precision và recall.','F1 là trung bình điều hoà của precision và recall.'],None),
  S('Thống kê nhanh',['Ngoại lai kéo trung bình lệch nhiều; trung vị và yếu vị ổn định hơn. Chuẩn hoá min–max: (x − min)/(max − min) đưa dữ liệu về [0; 1].'],None)],
 [['Nhầm FP và FN.','FP: báo nhầm là dương; FN: bỏ sót dương.'],['Accuracy cao nghĩa là mô hình tốt.','Không đúng khi dữ liệu mất cân bằng.']],
 'Câu hỏi nhớ: Precision nhìn vào CÁC CA BÁO DƯƠNG; Recall nhìn vào CÁC CA DƯƠNG THẬT.')
lesson('overfit','Học máy: quá khớp, tập kiểm thử, rò rỉ dữ liệu',['ml-khainiem','ml','ml-knn','ml-hoiquy','ml-kmeans','mo-phong'],
 'Bạn hay nhầm quá khớp với dưới khớp, và không phân biệt học có giám sát với không giám sát.',
 [S('Quá khớp nhìn qua đồ thị',['Mô hình càng phức tạp thì sai số trên tập huấn luyện càng giảm. Nhưng sai số trên tập kiểm thử giảm rồi LẠI TĂNG: mô hình học thuộc cả nhiễu của dữ liệu huấn luyện → quá khớp.'],'overfit'),
  S('Cách nhận biết và khắc phục',['Dấu hiệu: tốt (ví dụ 99%) trên tập huấn luyện, kém (ví dụ 70%) trên tập kiểm thử. Khắc phục: thêm dữ liệu, đơn giản hoá mô hình, kiểm định chéo.','Dưới khớp thì ngược lại: kém ở cả hai tập vì mô hình quá đơn giản.'],None),
  S('Rò rỉ dữ liệu',['Không dùng thông tin của tập kiểm thử khi huấn luyện, chọn tham số hay chuẩn hoá. Nếu không, điểm kiểm thử đẹp nhưng không phản ánh dữ liệu thật.'],None),
  S('Phân loại các bài toán',['Có giám sát: dữ liệu có nhãn (phân loại, hồi quy). Không giám sát: không có nhãn (phân cụm k-means). Hồi quy dự đoán giá trị số liên tục; phân loại dự đoán nhãn rời rạc. k-NN dự đoán theo nhãn đa số của k láng giềng gần nhất; k = 1 dễ quá khớp.'],None)],
 [['Huấn luyện 99%, kiểm thử 70% là dưới khớp.','Đó là quá khớp.'],['k-means cần dữ liệu có nhãn.','Phân cụm không cần nhãn.']],
 'Quá khớp = "học vẹt": giỏi bài đã học, kém bài mới.')
