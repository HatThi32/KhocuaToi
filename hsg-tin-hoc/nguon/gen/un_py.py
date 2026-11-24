# -*- coding: utf-8 -*-
from un_base import *
unit('p1','python','Biểu thức, kiểu dữ liệu, nhập xuất',8,
 ['Tính đúng giá trị biểu thức có //, %, **, and/or/not.','Phân biệt kiểu int, float, str, bool và ép kiểu.','Biết input() luôn trả về xâu.'],
 [sec('Phép toán và thứ tự ưu tiên',['/ cho số thực, // chia nguyên (làm tròn xuống), % lấy dư, ** luỹ thừa. Thứ tự: ** › *, /, //, % › +, - › so sánh › not › and › or.','Với số âm, // làm tròn về phía âm vô cùng: -7 // 2 = -4, và -7 % 2 = 1 (dư luôn cùng dấu với số chia).'],key='a == (a//b)*b + a%b luôn đúng.',hard=True,code='print(17//5, 17%5, 2**3**2, -7//2, -7%2)\nprint(7/2, 7//2, 3 + 4*2 ** 2)\nprint(not True or True, 1<2<3)',run=True,lang='python'),
  sec('Kiểu dữ liệu và ép kiểu',['input() luôn trả về xâu (str), nên "5" + "3" là "53", không phải 8. Muốn tính phải ép: int(), float().','int(3.9) = 3 (cắt phần thập phân, không làm tròn); round(2.5) = 2 (làm tròn về số chẵn gần nhất).'],code='a="5"; b="3"\nprint(a+b, int(a)+int(b))\nprint(int(3.9), round(2.5), round(3.5), type(7/7))',run=True,lang='python')],
 ['bieu-thuc','tinh-toan'])
unit('p2','python','Rẽ nhánh và vòng lặp',9,
 ['Đếm đúng số lần lặp của for range và while.','Dùng break, continue; hiểu vòng lặp lồng nhau.','Theo dõi (trace) chương trình bằng bảng giá trị biến.'],
 [sec('range và số lần lặp',['range(a, b, s) sinh a, a+s, … và DỪNG TRƯỚC b. Số phần tử = ceil((b−a)/s) khi s>0. range(5) là 0..4.'],key='Đếm lặp: lấy (b − a) chia bước, làm tròn LÊN.',fig='range_line',code='print(list(range(2,11,3)))\nprint(len(range(1,20,4)))\nprint(list(range(5,0,-2)))',run=True,lang='python'),
  sec('break, continue, vòng lặp lồng nhau',['break thoát hẳn vòng lặp gần nhất; continue bỏ phần còn lại của lượt hiện tại. Vòng lặp lồng: vòng trong chạy trọn vẹn mỗi lần vòng ngoài chạy một lượt, nên số lần = tích.'],code='dem=0\nfor i in range(1,5):\n    for j in range(i):\n        dem+=1\nprint(dem)\nfor x in range(1,10):\n    if x%2==0: continue\n    if x>6: break\n    print(x, end=" ")',run=True,lang='python'),
  sec('Kĩ thuật trace',['Kẻ bảng, mỗi cột một biến, mỗi dòng một lượt lặp, cập nhật từng bước. Đừng nhẩm cả đoạn: nhầm lẫn thường xảy ra khi bỏ qua bước giữa.'],code='s=0; n=5\nwhile n>0:\n    s+=n; n-=2\nprint(s,n)',run=True,lang='python',key='Kết quả trên là 9 và -1: n lần lượt 5, 3, 1 rồi -1 thì dừng.')],
 ['vong-lap','thuat-toan','tinh-toan'])
unit('p3','python','Xâu, danh sách và ma trận',10,
 ['Dùng đúng chỉ số âm, cắt lát [a:b:s].','Biết xâu bất biến, danh sách khả biến.','Duyệt, tính tổng đường chéo của ma trận.'],
 [sec('Chỉ số và cắt lát',['Chỉ số bắt đầu từ 0; chỉ số âm đếm từ cuối (-1 là phần tử cuối). s[a:b:k] lấy từ a tới TRƯỚC b, bước k; bỏ trống thì lấy hết.'],fig='slice',code='s="Hat Tin 12"\nprint(s[0], s[-1], s[1:4], s[::-1], s[::2])\nprint(s.upper(), s.split(), len(s))',run=True,lang='python'),
  sec('Khả biến và bất biến',['Xâu (str) không đổi được từng kí tự: s[0]="X" gây lỗi. Danh sách (list) sửa được. Hai tên cùng trỏ một list thì sửa qua tên này, tên kia cũng đổi; muốn bản sao dùng a.copy() hoặc a[:].'],hard=True,code='a=[1,2,3]; b=a; c=a[:]\nb.append(4)\nprint(a, b, c)\nprint(a is b, a is c)',run=True,lang='python'),
  sec('Ma trận (danh sách của danh sách)',['m[i][j]: hàng i, cột j. Đường chéo chính: i == j; đường chéo phụ: i + j == n−1.'],fig='matrix',code='m=[[1,2,3],[4,5,6],[7,8,9]]\nprint(sum(m[i][i] for i in range(3)))\nprint(sum(m[i][2-i] for i in range(3)))\nprint([r[1] for r in m])',run=True,lang='python')],
 ['xau-danh-sach','xau','mang-2d'])
unit('p4','python','Hàm, phạm vi biến, ngoại lệ, kiểm thử',9,
 ['Phân biệt biến cục bộ và toàn cục.','Biết các lỗi cú pháp, lỗi chạy, lỗi logic.','Xử lí ngoại lệ bằng try/except và viết ca kiểm thử.'],
 [sec('Hàm và phạm vi biến',['Biến gán trong hàm là cục bộ, mất khi hàm kết thúc. Muốn sửa biến toàn cục phải khai báo global. Đối số kiểu list truyền vào hàm có thể bị sửa tại chỗ.'],hard=True,fig='scope',code='x=10\ndef f():\n    x=5\n    return x\ndef g(l):\n    l.append(1)\nL=[]\nprint(f(), x); g(L); print(L)',run=True,lang='python'),
  sec('Các loại lỗi và ngoại lệ',['Lỗi cú pháp: chương trình không chạy được. Lỗi chạy (ZeroDivisionError, ValueError, IndexError…): đang chạy thì dừng. Lỗi logic: chạy được nhưng kết quả sai.'],code='try:\n    n=int("abc")\nexcept ValueError:\n    n=0\nfinally:\n    print("xong")\nprint(n)',run=True,lang='python'),
  sec('Kiểm thử',['Chọn ca kiểm thử gồm: ca thông thường, ca biên (giá trị nhỏ/lớn nhất, rỗng), ca bất thường. Kiểm thử chỉ chứng minh có lỗi, không chứng minh hết lỗi.'])],
 ['ham-pham-vi','ngoai-le','loi-chay','kiem-thu','sua-loi'])
unit('p5','python','Độ phức tạp thuật toán',9,
 ['Xác định đúng O(1), O(log n), O(n), O(n²).','So sánh được tốc độ tăng.','Đếm số bước của vòng lặp.'],
 [sec('Độ phức tạp là gì?',['Là cách đo thời gian (hoặc bộ nhớ) tăng thế nào khi kích thước đầu vào n tăng, bỏ qua hằng số. n lớn thì bậc cao nhất quyết định.'],fig='complexity',key='O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ).'),
  sec('Cách nhận biết',['Một vòng lặp n lần: O(n). Hai vòng lồng nhau cùng chạy n: O(n²). Mỗi lần giảm một nửa hoặc nhân đôi biến: O(log n).'],hard=True,code='def a(n):\n    c=0\n    while n>1:\n        n//=2; c+=1\n    return c\nprint(a(8), a(1000))\ndef b(n):\n    c=0\n    for i in range(n):\n        for j in range(i,n): c+=1\n    return c\nprint(b(10))',run=True,lang='python')],
 ['do-phuc-tap'])
unit('p6','python','Tìm kiếm và sắp xếp',10,
 ['Thực hiện tay tìm tuần tự, tìm nhị phân.','Mô phỏng sắp xếp chọn, nổi bọt, chèn.','Nêu điều kiện dùng tìm nhị phân.'],
 [sec('Tìm kiếm nhị phân',['Chỉ dùng được khi dãy ĐÃ sắp xếp. Mỗi bước so sánh phần tử giữa, bỏ một nửa. Tối đa ⌊log₂n⌋+1 lần so sánh.'],fig='bsearch',code='a=[2,5,8,12,16,23,38,56,72,91]\nlo,hi,c=0,len(a)-1,0\nwhile lo<=hi:\n    m=(lo+hi)//2; c+=1\n    if a[m]==23: break\n    elif a[m]<23: lo=m+1\n    else: hi=m-1\nprint(m,c)',run=True,lang='python'),
  sec('Sắp xếp chọn',['Mỗi lượt chọn phần tử nhỏ nhất của phần chưa sắp rồi đổi chỗ vào đầu. Sau i lượt, i phần tử đầu đã ở đúng chỗ.'],fig='ssort',code='a=[5,2,9,1,7]\nfor i in range(len(a)-1):\n    k=i\n    for j in range(i+1,len(a)):\n        if a[j]<a[k]: k=j\n    a[i],a[k]=a[k],a[i]\n    print(a)',run=True,lang='python'),
  sec('Nổi bọt và chèn',['Nổi bọt: so sánh cặp kề nhau, đổi chỗ nếu ngược thứ tự; sau mỗi lượt phần tử lớn nhất nổi về cuối. Chèn: lấy từng phần tử chèn vào đúng chỗ trong phần đã sắp. Cả ba đều O(n²).'])],
 ['tim-kiem','sap-xep'])
unit('p7','python','Đệ quy và chia để trị',10,
 ['Xác định trường hợp cơ sở và bước đệ quy.','Vẽ cây gọi hàm, đếm số lần gọi.','Hiểu tư tưởng chia để trị.'],
 [sec('Đệ quy',['Hàm tự gọi chính nó với bài toán nhỏ hơn. Luôn cần trường hợp cơ sở để dừng, thiếu thì lỗi tràn ngăn xếp (RecursionError).'],fig='recursion',hard=True,code='def gt(n):\n    return 1 if n<=1 else n*gt(n-1)\ncnt=0\ndef fib(n):\n    global cnt; cnt+=1\n    return n if n<2 else fib(n-1)+fib(n-2)\nprint(gt(5), fib(5), cnt)',run=True,lang='python'),
  sec('Chia để trị',['Chia bài toán thành các phần nhỏ độc lập, giải từng phần, rồi ghép kết quả (ví dụ tìm nhị phân, sắp xếp trộn).'],fig='divide')],
 ['de-quy','thuat-toan-nc'])
unit('p8','python','Ngăn xếp và hàng đợi',6,
 ['Phân biệt LIFO và FIFO.','Dự đoán thứ tự lấy ra.'],
 [sec('Ngăn xếp và hàng đợi',['Ngăn xếp (stack) LIFO: vào sau ra trước, thao tác ở một đầu (append/pop). Hàng đợi (queue) FIFO: vào trước ra trước (thêm cuối, lấy đầu).'],fig='stackqueue',code='s=[]; q=[]\nfor x in [1,2,3]:\n    s.append(x); q.append(x)\nprint(s.pop(), s.pop(), q.pop(0), q.pop(0))',run=True,lang='python')],
 ['cau-truc-du-lieu','ctdl'])
