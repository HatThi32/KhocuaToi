# -*- coding: utf-8 -*-
from un_base import *
unit('m1','mang','Thiết bị và cấu trúc mạng',8,
 ['Phân biệt switch, router, modem, access point.','Nhận biết các kiểu kết nối (topo) mạng.','Nêu vai trò từng tầng.'],
 [sec('Thiết bị mạng',['Switch nối các máy trong cùng mạng LAN. Router nối các mạng khác nhau và chọn đường đi. Modem chuyển đổi tín hiệu để ra Internet (ISP). Access point phát Wi-Fi.'],fig='netdev',key='Trong nhà: modem/router → switch/AP → thiết bị.'),
  sec('Cấu trúc mạng',['Hình sao (có thiết bị trung tâm, hỏng một máy không ảnh hưởng, hỏng trung tâm thì cả mạng ngừng), đường thẳng, vòng.'],fig='topo'),
  sec('Mô hình phân tầng',['Mạng dùng nhiều tầng, mỗi tầng một việc và giao tiếp với tầng kề, giúp thay đổi một tầng không ảnh hưởng tầng khác.'],fig='layers')],
 ['tbmang','thietbi'])
unit('m2','mang','Giao thức và dịch vụ',7,
 ['Gắn đúng giao thức với dịch vụ.','Giải thích DNS, HTTP, HTTPS.'],
 [sec('Giao thức',['HTTP/HTTPS truyền trang web (HTTPS mã hoá), DNS đổi tên miền ra IP, SMTP/IMAP/POP3 cho thư điện tử, FTP truyền tệp, TCP đảm bảo đủ và đúng thứ tự, IP đánh địa chỉ và chuyển gói.'],key='DNS chuyển tên miền thành địa chỉ IP; HTTP/HTTPS truyền trang web; SMTP, POP3, IMAP dùng cho thư điện tử.',fig='web_flow')],
 ['giaothuc','net'])
unit('m3','mang','Địa chỉ IP và mạng con',10,
 ['Tách phần mạng và phần máy.','Tính số máy dùng được trong mạng con.','Cùng mạng hay không.'],
 [sec('IP và mặt nạ',['Địa chỉ IPv4 gồm 4 số 0–255 (32 bit). Mặt nạ /24 nghĩa là 24 bit đầu là phần mạng, còn 8 bit là phần máy. Số máy dùng được = 2^(bit máy) − 2 (trừ địa chỉ mạng và địa chỉ quảng bá).'],fig='ipmask',hard=True,code='bit_may=32-26\nprint(2**bit_may-2)\nprint(2**8-2)',run=True,lang='python',key='Hai máy cùng mạng khi phần mạng của chúng giống nhau.')],
 ['mang-ip','mang-bang-thong'])
unit('m4','mang','Chia sẻ tài nguyên và an toàn mạng',7,
 ['Biết cách chia sẻ tệp, máy in.','Nêu các mối đe doạ và biện pháp.'],
 [sec('Chia sẻ',['Trong LAN có thể chia sẻ thư mục, máy in theo quyền (chỉ đọc, đọc/ghi). Chỉ chia sẻ tối thiểu.']),
  sec('An toàn',['Mật khẩu mạnh, cập nhật phần mềm, tường lửa, diệt virus, cảnh giác lừa đảo (phishing), không dùng chung mật khẩu.'],key='Tường lửa kiểm soát dữ liệu vào/ra mạng theo quy tắc.')],
 ['chiase','an-toan','khmt12'])
