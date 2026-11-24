# -*- coding: utf-8 -*-
import subprocess,json,random,ipaddress,math,sys,os,re
sys.path.insert(0,'.')
import hardlib as H
OUT=[]
def cl(): return H.newcl()
def base(id,topic,tags,type_,stem,**k):
    q=dict(id=id,topic=topic,level=3,tags=tags,type=type_,stem=stem,optWhy=[],cl=cl(),v2=True,hard=True,**k); OUT.append(q); return q
def pyrun(code):
    r=subprocess.run([sys.executable,'-c',code],capture_output=True,text=True,timeout=20); assert r.returncode==0,(code,r.stderr); return r.stdout.strip()
def noderun(code):
    r=subprocess.run(['node','-e',code],capture_output=True,text=True,timeout=20); assert r.returncode==0,(code,r.stderr); return r.stdout.strip()
EXTRA={'h-py-01':"[1, 2] [2] [3]",'h-py-05':"[1, 2, 3] [1, 2, 3, 4] [1, 2, 3, 4, 5]",'h-py-06':"-4 2 -3 2 4 (-3, 2)",'h-py-08':"1 13 25",'h-py-09':"70",'h-py-10':"[('i', 4), ('s', 4), ('m', 1), ('p', 2)]",'h-py-11':"['fig', 'kiwi', 'plum', 'pear', 'apple', 'banana']",'h-py-12':"f 0 3",'h-py-13':"[1, 4, 1, 5] [3, 1, 4, 1]",'h-py-14':"4 30",'h-py-15':"xong 3 -1",'h-net-03':"8 mạng, 126 máy",'h-ai-01':"0.90; 0.75; 0.818; 0.70",'h-ai-03':"(1.00; 2.50) và (7.00; 6.00)",'h-ai-05':"(0.60, 0.75) → (0.50, 1.00)"}
def MC(id,topic,tags,stem,good,bads,why,seed=1,code=None,mono=False,src='verified-py'):
    if good in bads:
        print('!! TRÙNG',id,'đúng =',good); bads=[b for b in bads if b!=good]
    if id in EXTRA and EXTRA[id] not in bads and EXTRA[id]!=good: bads=bads+[EXTRA[id]]
    assert len(bads)>=3,(id,len(bads))
    opts=[good]+bads; idx=list(range(len(opts))); random.Random(seed).shuffle(idx)
    kw=dict(options=[opts[i] for i in idx],key=idx.index(0),why=why,src=src)
    if code: kw['code']=code; kw['mono']=True
    return base(id,topic,tags,'mcq',stem,**kw)
def PY(id,tags,stem,code,bads,why,seed=1):
    out=pyrun(code); one=out.replace('\n',' | ')
    return MC(id,'python',tags,stem,one,bads,why+' Kết quả chạy thật: '+one,seed,code)
# ================= PYTHON =================
PY('h-py-01',['ham-pham-vi'],"Đoạn chương trình in ra gì? (chú ý đối số mặc định là đối tượng thay đổi được)",
"def them(x, ds=[]):\n    ds.append(x)\n    return ds\na = them(1)\nb = them(2)\nc = them(3, [])\nprint(a, b, c)",
["[1] [2] [3]","[1, 2] [1, 2] [3]","[1] [1, 2] [3]"],"Danh sách mặc định được tạo MỘT lần khi định nghĩa hàm và dùng chung cho mọi lần gọi không truyền đối số; a và b là cùng một đối tượng.",1)
PY('h-py-02',['ngoai-le','ham-pham-vi'],"Hàm sau trả về giá trị nào?",
"def f():\n    try:\n        return 'try'\n    finally:\n        print('fin', end=' ')\nprint(f())",
["try","fin","try fin"],"Khối finally luôn chạy trước khi hàm thật sự trả về; ở đây nó in 'fin ' rồi hàm trả 'try'.",2)
PY('h-py-03',['ham-pham-vi'],"Danh sách ham gồm các hàm lambda. Kết quả in ra:",
"ham = [lambda: i for i in range(3)]\nprint([f() for f in ham])",
["[0, 1, 2]","[0, 0, 0]","[3, 3, 3]"],"Các lambda đều tham chiếu cùng biến i; khi gọi, i đã dừng ở giá trị cuối là 2 (ràng buộc muộn).",3)
PY('h-py-04',['xau-danh-sach','xau'],"Với s = 'abcdefgh', biểu thức in ra:",
"s = 'abcdefgh'\nprint(s[::-3], s[-2:1:-2], s[2:-2][::2])",
["hed ge ce","heb gec cd","hed gec ce"],"Bước âm duyệt từ phải sang trái; chỉ số đầu nằm bên phải chỉ số cuối.",4)
PY('h-py-05',['xau-danh-sach'],"Sau khi chạy, a, b, c in ra là:",
"a = [1, 2, 3]\nb = a\nb += [4]\nc = a\nc = c + [5]\nprint(a, b, c)",
["[1, 2, 3] [1, 2, 3, 4] [1, 2, 3, 5]","[1, 2, 3, 4] [1, 2, 3, 4] [1, 2, 3, 4, 5]","[1, 2, 3, 4, 5] [1, 2, 3, 4, 5] [1, 2, 3, 4, 5]"],"b += [4] thay đổi TẠI CHỖ đối tượng chung với a; c = c + [5] tạo danh sách mới nên a không đổi thêm.",5)
PY('h-py-06',['tinh-toan','bieu-thuc'],"Kết quả in ra của dòng lệnh sau:",
"print(-7 // 2, -7 % 3, 7 // -2, round(2.5), round(3.5), divmod(-7, 3))",
["-3 -1 -3 3 4 (-2, -1)","-4 2 -4 2 4 (-3, 2)","-4 2 -4 3 4 (-2, 2)"],"// làm tròn xuống (về −∞), % cùng dấu với số chia; round làm tròn chẵn (round half to even).",6)
PY('h-py-07',['xau-danh-sach','mang-2d'],"Đoạn chương trình in ra gì?",
"m = [[0] * 3] * 3\nm[0][0] = 1\nn = [[0] * 3 for _ in range(3)]\nn[0][0] = 1\nprint(m, n)",
["[[1, 0, 0], [0, 0, 0], [0, 0, 0]] [[1, 0, 0], [0, 0, 0], [0, 0, 0]]","[[1, 0, 0], [0, 0, 0], [0, 0, 0]] [[1, 0, 0], [1, 0, 0], [1, 0, 0]]","[[0, 0, 0], [0, 0, 0], [0, 0, 0]] [[1, 0, 0], [0, 0, 0], [0, 0, 0]]"],"Nhân danh sách bằng * chỉ sao chép THAM CHIẾU tới cùng một hàng; viết bằng list comprehension tạo ba hàng độc lập.",7)
PY('h-py-08',['de-quy'],"Hàm fib được gọi bao nhiêu lần (kể cả lần gọi đầu) khi chạy fib(7), và giá trị trả về là gì?",
"dem = 0\ndef fib(n):\n    global dem\n    dem += 1\n    return n if n < 2 else fib(n - 1) + fib(n - 2)\nprint(dem, fib(7), dem)",
["0 13 41","0 13 25","1 13 41"],"Đối số in ra được tính từ trái sang phải: dem (0), rồi gọi fib(7)=13, rồi dem (số lần gọi). Số lời gọi của fib(7) là 41.",8)
PY('h-py-09',['thuat-toan','tinh-toan'],"Đếm số lần dòng lệnh bên trong thực hiện và in tổng:",
"n = 10\ndem = 0\nfor i in range(n):\n    for j in range(i, n):\n        dem += 1\nk = 1\nwhile k < n * n:\n    k *= 2\n    dem += 1\nprint(dem)",
["100","62","55"],"Vòng đôi: n + (n−1) + … + 1 = 55 lần. Vòng while nhân đôi k từ 1 đến ≥ 100 mất 7 lần. Tổng 62.",9)
PY('h-py-10',['xau','xau-danh-sach'],"Kết quả in ra:",
"s = 'mississippi'\nd = {}\nfor ch in s:\n    d[ch] = d.get(ch, 0) + 1\nprint(sorted(d.items(), key=lambda p: (-p[1], p[0])))",
["[('i', 4), ('p', 2), ('s', 4), ('m', 1)]","[('i', 4), ('s', 4), ('p', 2), ('m', 1)]","[('m', 1), ('p', 2), ('i', 4), ('s', 4)]"],"Khoá (-số lần, ký tự) sắp giảm dần theo số lần rồi tăng dần theo ký tự khi đồng hạng.",10)
PY('h-py-11',['thuat-toan','sap-xep'],"Sắp xếp theo độ dài (sorted ổn định). Kết quả:",
"w = ['kiwi', 'fig', 'banana', 'pear', 'plum', 'apple']\nprint(sorted(w, key=len))",
["['fig', 'kiwi', 'pear', 'plum', 'apple', 'banana']","['fig', 'pear', 'kiwi', 'plum', 'apple', 'banana']","['fig', 'apple', 'kiwi', 'pear', 'plum', 'banana']"],"sorted là sắp xếp ổn định: các từ cùng độ dài giữ nguyên thứ tự xuất hiện ban đầu (kiwi, pear, plum).",11)
PY('h-py-12',['bieu-thuc'],"Giá trị in ra (đoản mạch và toán tử logic trả về toán hạng, không phải True/False):",
"def f(x):\n    print('f', x, end=' ')\n    return x\nr = f(0) or f(2) and f(3)\nprint(r)",
["f 0 f 2 f 3 3","f 0 f 2 3","f 0 f 2 f 3 True"],"and ưu tiên hơn or: f(0) or (f(2) and f(3)). 0 sai nên tính vế phải: f(2) đúng nên tính f(3), kết quả là toán hạng cuối 3.",12)
PY('h-py-13',['cau-truc-du-lieu','ctdl'],"Dùng danh sách làm hàng đợi và ngăn xếp. Kết quả in ra:",
"from collections import deque\nq = deque()\nst = []\nfor x in [3, 1, 4, 1, 5]:\n    q.append(x)\n    st.append(x)\nq.popleft()\nst.pop()\nq.append(st.pop())\nprint(list(q), st)",
["[1, 4, 1, 5, 1] [3, 1, 4]","[1, 4, 1, 5, 5] [3, 1, 4, 1]","[1, 4, 1, 5, 1] [3, 1, 4, 1]"],"Hàng đợi lấy ở đầu (FIFO), ngăn xếp lấy ở cuối (LIFO). st.pop() lần đầu bỏ 5; lần hai lấy 1 đưa vào hàng đợi.",13)
PY('h-py-14',['thuat-toan','tim-kiem'],"Tìm kiếm nhị phân: số lần lặp và kết quả (a đã sắp tăng dần):",
"a = list(range(1, 100, 2))\nx = 61\nl, r, dem = 0, len(a) - 1, 0\nwhile l <= r:\n    dem += 1\n    m = (l + r) // 2\n    if a[m] == x:\n        break\n    if a[m] < x:\n        l = m + 1\n    else:\n        r = m - 1\nprint(dem, m)",
["31 30","6 30","3 30"],"Mỗi lần lặp thu hẹp một nửa khoảng; kết quả chạy thật cho biết đúng số lần lặp và chỉ số tìm thấy.",14)
PY('h-py-15',['ngoai-le','loi-chay'],"Chương trình in ra:",
"def chia(a, b):\n    try:\n        return a // b\n    except ZeroDivisionError:\n        return -1\n    else:\n        return 0\n    finally:\n        print('xong', end=' ')\nprint(chia(7, 2), chia(7, 0))",
["xong xong 3 -1","3 -1","xong 3 xong -1"],"finally in ngay khi mỗi lời gọi kết thúc (trước khi print ngoài chạy). Khối else bị bỏ qua vì có return trong try. print ngoài in sau khi cả hai đối số đã tính.",15)
# ================= NET =================
def NETQ(id,tags,stem,good,bads,why,seed=1): return MC(id,'mang',tags,stem,good,bads,why,seed,src='verified-py')
n=ipaddress.ip_interface('172.16.37.200/21'); 
NETQ('h-net-01',['mang-ip'],"Máy có địa chỉ 172.16.37.200/21. Địa chỉ mạng và địa chỉ quảng bá của mạng chứa máy này là:",
 "%s và %s"%(n.network.network_address,n.network.broadcast_address),
 ["172.16.37.192 và 172.16.37.255","172.16.32.0 và 172.16.39.254","172.16.37.0 và 172.16.37.255"],
 "/21: mặt nạ 255.255.248.0, khối 8 trong octet thứ 3 → 32..39. Mạng 172.16.32.0, quảng bá 172.16.39.255.",1)
NETQ('h-net-02',['mang-ip'],"Cần chia mạng 192.168.10.0/24 cho các bộ phận có 100, 50, 25 và 12 máy (mỗi bộ phận một mạng con, dùng VLSM, không lãng phí quá mức). Dãy mặt nạ phù hợp theo thứ tự các bộ phận là:",
 "/25, /26, /27, /28",["/25, /26, /26, /27","/24, /25, /26, /27","/26, /26, /27, /28"],
 "Số host cần: 100→/25 (126), 50→/26 (62), 25→/27 (30), 12→/28 (14). Tổng 128+64+32+16 = 240 ≤ 256 nên vừa trong /24.",2)
a=ipaddress.ip_network('10.0.0.0/22'); NETQ('h-net-03',['mang-ip'],"Từ mạng 10.0.0.0/22 có thể chia được bao nhiêu mạng con /26, và mỗi mạng con dùng được tối đa bao nhiêu địa chỉ máy?",
 "%d mạng, %d máy"%(len(list(a.subnets(new_prefix=26))),64-2),["32 mạng, 64 máy","16 mạng, 62 máy","64 mạng, 30 máy"],
 "/22 có 1024 địa chỉ; /26 có 64 địa chỉ → 16 mạng, mỗi mạng 62 địa chỉ máy (trừ mạng và quảng bá).",3)
t=2000*8/(200*0.8); NETQ('h-net-04',['mang-bang-thong'],"Tải tệp 2 GB (quy ước 1 GB = 1000 MB, 1 byte = 8 bit) qua đường truyền 200 Mb/s nhưng chỉ đạt 80% tốc độ danh định. Thời gian tải là:",
 "%d giây"%t,["10 giây","80 giây","12,5 giây"],"2000 MB × 8 = 16 000 Mb; tốc độ thực = 200 × 0,8 = 160 Mb/s; thời gian = 16 000 ÷ 160 = 100 giây.",4)
NETQ('h-net-05',['tbmang','thietbi'],"Mỗi phòng thực hành có 28 máy, 2 access point, 1 cổng nối lên switch tổng. Có các loại switch 8, 16, 24, 32, 48 cổng. Để mỗi phòng dùng 1 switch và còn ÍT NHẤT 2 cổng dự phòng, loại nhỏ nhất phù hợp là:",
 "Loại 48 cổng",["Loại 32 cổng","Loại 24 cổng","Loại 16 cổng"],"Cần 28 + 2 + 1 = 31 cổng; thêm 2 dự phòng = 33 > 32 nên phải chọn loại 48 cổng.",5)
def same_net(a,b,m): return ipaddress.ip_network(a+'/'+m,strict=False)==ipaddress.ip_network(b+'/'+m,strict=False)
base('h-net-06','mang',['mang-ip'],'tf',"Với mặt nạ mạng con 255.255.255.224 (/27), xét các phát biểu (đã kiểm chứng bằng module ipaddress):",items=[
 dict(t="192.168.5.30 và 192.168.5.33 thuộc cùng một mạng con.",v=same_net('192.168.5.30','192.168.5.33','27'),why="Khối 32: 30 thuộc 0–31, 33 thuộc 32–63 nên khác mạng."),
 dict(t="192.168.5.64 là địa chỉ mạng của một mạng con và không gán cho máy.",v=str(ipaddress.ip_network('192.168.5.64/27').network_address)=='192.168.5.64',why="Đúng: 64 là bội của 32, là địa chỉ đầu khối."),
 dict(t="192.168.5.95 có thể gán cho một máy trong mạng 192.168.5.64/27.",v=ipaddress.ip_address('192.168.5.95') in list(ipaddress.ip_network('192.168.5.64/27').hosts()),why="Sai: 95 là địa chỉ quảng bá (cuối khối 64–95)."),
 dict(t="Mỗi mạng con /27 gán được tối đa 30 địa chỉ máy.",v=len(list(ipaddress.ip_network('192.168.5.0/27').hosts()))==30,why="Đúng: 32 − 2 = 30.")],why='',src='verified-py')
base('h-net-07','mang',['mang-ip'],'tf',"Xét việc phân loại địa chỉ IPv4 (kết quả kiểm chứng bằng chương trình):",items=[
 dict(t="172.31.255.1 là địa chỉ riêng.",v=ipaddress.ip_address('172.31.255.1') in ipaddress.ip_network('172.16.0.0/12'),why="Dải riêng 172.16.0.0–172.31.255.255."),
 dict(t="172.32.0.1 là địa chỉ riêng.",v=ipaddress.ip_address('172.32.0.1') in ipaddress.ip_network('172.16.0.0/12'),why="Sai: nằm ngoài dải /12."),
 dict(t="192.169.1.1 là địa chỉ riêng.",v=ipaddress.ip_address('192.169.1.1') in ipaddress.ip_network('192.168.0.0/16'),why="Sai: dải riêng là 192.168.x.x."),
 dict(t="10.200.3.4 là địa chỉ riêng.",v=ipaddress.ip_address('10.200.3.4') in ipaddress.ip_network('10.0.0.0/8'),why="Đúng: thuộc 10.0.0.0/8.")],why='',src='verified-py')
# ================= AI =================
tp,fp,fn,tn=45,15,5,35
P=tp/(tp+fp);R=tp/(tp+fn);F=2*P*R/(P+R)
MC('h-ai-01','ai',['ml-danhgia'],"Bộ phát hiện bệnh cho ma trận nhầm lẫn: TP = 45, FP = 15, FN = 5, TN = 35. Chọn bộ số (precision; recall; F1; accuracy) đúng:",
 "%.2f; %.2f; %.3f; %.2f"%(P,R,F,(tp+tn)/100),["0.90; 0.75; 0.818; 0.80","0.75; 0.90; 0.818; 0.70","0.75; 0.90; 0.818; 0.80"],
 "Precision = 45/60 = 0,75; recall = 45/50 = 0,90; F1 = 2PR/(P+R) ≈ 0,818; accuracy = 80/100 = 0,80. Kết quả tính bằng chương trình.",1,src='verified-py')
import collections
def knn(train,q,k):
    d=sorted((math.dist(p,q),l) for p,l in train)[:k]; return collections.Counter(l for _,l in d).most_common()
tr=[((8,8),'A'),((4,0),'A'),((8,3),'A'),((2,1),'A'),((3,0),'B'),((5,1),'B'),((1,4),'B'),((0,4),'B')]
res={k:knn(tr,(5,5),k) for k in (1,3,5)}
base('h-ai-02','ai',['ml-knn'],'tf',"Tập huấn luyện k-NN (khoảng cách Euclid): A: (8,8), (4,0), (8,3), (2,1); B: (3,0), (5,1), (1,4), (0,4). Dự đoán nhãn cho điểm mới (5,5). Xét các phát biểu (đã chạy thật):",items=[
 dict(t="Với k = 1, nhãn dự đoán là A.",v=res[1][0][0]=='A',why="Điểm gần nhất là (8,8), khoảng cách √18 ≈ 3,61, thuộc lớp A."),
 dict(t="Với k = 3, nhãn dự đoán là B.",v=res[3][0][0]=='B',why="Ba điểm gần nhất: %s."%str(sorted((round(math.dist(p,(5,5)),3),l) for p,l in tr)[:3])),
 dict(t="Với k = 5, nhãn dự đoán là A.",v=res[5][0][0]=='A',why="Năm điểm gần nhất bỏ phiếu: %s."%dict(collections.Counter(l for _,l in sorted((math.dist(p,(5,5)),l) for p,l in tr)[:5]))),
 dict(t="Kết quả dự đoán của k-NN luôn không đổi khi đổi k.",v=False,why="Sai: k thay đổi có thể đổi nhãn.")],why='',src='verified-py')
def kmeans(pts,c,it):
    for _ in range(it):
        g=[[],[]]
        for p in pts: g[min((0,1),key=lambda j:math.dist(p,c[j]))].append(p)
        c=[(sum(x for x,_ in gg)/len(gg),sum(y for _,y in gg)/len(gg)) for gg in g]
    return c
pts=[(1,1),(1,4),(2,2),(6,5),(7,7),(8,6)]
c1=kmeans(pts,[(1,1),(1,4)],1); c2=kmeans(pts,[(1,1),(1,4)],2)
f=lambda c:' và '.join('(%.2f; %.2f)'%p for p in c)
MC('h-ai-03','ai',['ml-kmeans'],"k-means với k = 2 trên các điểm (1,1), (1,4), (2,2), (6,5), (7,7), (8,6), tâm ban đầu (1,1) và (1,4). Sau HAI vòng lặp (gán rồi cập nhật tâm) hai tâm là:",
 f(c2),[f(c1),"(1.00; 1.00) và (1.00; 4.00)","(1.33; 2.33) và (7.00; 6.00)"],
 "Vòng 1 gán các điểm gần (1,1)/(1,4) rồi cập nhật tâm; vòng 2 gán lại và cập nhật. Kết quả chạy bằng chương trình: %s."%f(c2),3,src='verified-py')
xs=[1,2,3,4,5,6];ys=[2.1,3.9,6.2,7.8,10.1,15.0]
mx=sum(xs)/6;my=sum(ys)/6;w=sum((x-mx)*(y-my) for x,y in zip(xs,ys))/sum((x-mx)**2 for x in xs);b=my-w*mx
res=ys[-1]-(w*6+b)
MC('h-ai-04','ai',['ml-hoiquy'],"Hồi quy tuyến tính y = w·x + b (bình phương tối thiểu) cho x = 1..6, y = 2,1; 3,9; 6,2; 7,8; 10,1; 15,0. Giá trị w (làm tròn 2 chữ số) và phần dư tại x = 6 (y thực − y dự đoán) xấp xỉ là:",
 "w ≈ %.2f; phần dư ≈ %.2f"%(w,res),["w ≈ 2.00; phần dư ≈ 3.00","w ≈ 2.62; phần dư ≈ 0.00","w ≈ 2.20; phần dư ≈ -2.02"],
 "Một điểm ngoại lai ở cuối kéo độ dốc lên %.3f; điểm đó có phần dư dương lớn. Tính bằng chương trình."%w,4,src='verified-py')
sc=[0.95,0.8,0.7,0.6,0.55,0.4,0.3,0.2];lab=[1,1,0,1,0,1,0,0]
def pr(t):
    pr_=[s>=t for s in sc];tp=sum(1 for p,l in zip(pr_,lab) if p and l);fp=sum(1 for p,l in zip(pr_,lab) if p and not l);fn=sum(1 for p,l in zip(pr_,lab) if not p and l)
    return tp,fp,fn
a=pr(0.5);b=pr(0.35)
MC('h-ai-05','ai',['ml-danhgia'],"Mô hình cho điểm số và nhãn thật: điểm 0.95, 0.8, 0.7, 0.6, 0.55, 0.4, 0.3, 0.2 ứng với nhãn 1, 1, 0, 1, 0, 1, 0, 0 (1 = dương). Dự đoán dương khi điểm ≥ ngưỡng. Hạ ngưỡng từ 0.5 xuống 0.35 thì (precision, recall) thay đổi như thế nào?",
 "(%.2f, %.2f) → (%.2f, %.2f)"%(a[0]/(a[0]+a[1]),a[0]/(a[0]+a[2]),b[0]/(b[0]+b[1]),b[0]/(b[0]+b[2])),
 ["(0.60, 0.75) → (0.57, 1.00)","(0.75, 0.60) → (0.57, 1.00)","(0.60, 0.75) → (0.67, 1.00)"],
 "Hạ ngưỡng thì bắt thêm ca dương (recall tăng) nhưng cũng báo nhầm thêm (precision thường giảm). Tính bằng chương trình theo đúng dữ liệu.",5,src='verified-py')
e1=1/math.sqrt(10_000);e2=1/math.sqrt(1_000_000)
MC('h-ai-06','ai',['mo-phong'],"Monte Carlo có sai số tỉ lệ 1/√n. Nếu tăng số lần mô phỏng từ n = 10 000 lên n = 1 000 000 thì sai số giảm khoảng bao nhiêu lần?",
 "%d lần"%round(e1/e2),["100 lần","1000 lần","√10 ≈ 3,2 lần"],"Tỉ số sai số = √(10^6 / 10^4) = √100 = 10.",6,src='verified-py')
# ================= WEB (trình duyệt thật + node) =================
def webcolor(html,css,sel='#t',prop='color'):
    a=json.dumps(dict(html=html,css=css,styles=[[sel,prop]]))
    r=subprocess.run(['node','../slides/webcheck.js',a],capture_output=True,text=True,cwd='.')
    return json.loads(r.stdout)['styles'][0]
def rgb(c): return {'rgb(255, 0, 0)':'đỏ','rgb(0, 0, 255)':'xanh dương','rgb(0, 128, 0)':'xanh lá','rgb(255, 165, 0)':'cam','rgb(128, 0, 128)':'tím','rgb(0, 0, 0)':'đen'}.get(c,c)
def CSSQ(id,stem,html,css,bads,why,seed):
    got=rgb(webcolor(html,css)); assert got not in bads,(id,got)
    opts=[got]+bads; idx=list(range(len(opts))); random.Random(seed).shuffle(idx)
    return base(id,'web',['css-specificity','css-uutien'],'mcq',stem,options=[opts[i] for i in idx],key=idx.index(0),
      code="<style>\n"+css+"\n</style>\n"+html,mono=True,why=why+' Kết quả dựng trong trình duyệt thật: '+got+'.',src='verified-web')
CSSQ('h-web-01',"Phần tử có id=\"t\" được hiển thị với màu chữ nào?",'<div class="a b"><p id="t" class="c">Chữ</p></div>',
 "div p { color: red; }\n.a .c { color: blue; }\np.c { color: green; }\n#t { color: orange; }\n.b p.c { color: purple !important; }",
 ['đỏ','xanh dương','xanh lá','cam'],"Quy tắc có !important thắng mọi quy tắc thường, kể cả #id. Các màu còn lại bị đè.",1)
CSSQ('h-web-02',"Phần tử có id=\"t\" hiển thị màu chữ nào?",'<ul class="x"><li id="t" class="y">Mục</li></ul>',
 "ul li { color: red; }\n.x .y { color: blue; }\nli.y { color: green; }\nul.x li.y { color: orange; }\nli { color: purple; }",
 ['đỏ','xanh dương','xanh lá','tím'],"Độ cụ thể (ID, lớp, thẻ): ul.x li.y = (0,2,2) lớn nhất; các quy tắc kia nhỏ hơn.",2)
CSSQ('h-web-03',"Hai quy tắc cùng độ cụ thể; phần tử có id=\"t\" hiển thị màu chữ nào?",'<p id="t" class="a b">Chữ</p>',
 ".b { color: red; }\n.a { color: blue; }\n.a.b { color: green; }\n.b.a { color: orange; }",
 ['đỏ','xanh dương','xanh lá','tím'],"Độ cụ thể của .a.b và .b.a bằng nhau (0,2,0); khi bằng nhau, quy tắc viết SAU cùng thắng (thứ tự trong CSS, không phải thứ tự trong class).",3)
CSSQ('h-web-04',"Phần tử #t kế thừa hay bị ghi đè? Màu chữ hiển thị của nó là:",'<div class="box"><p id="t">Chữ</p></div>',
 ".box { color: blue; }\ndiv { color: red; }\np { color: green; }\n.box p { }",
 ['đỏ','xanh dương','cam','tím'],"p { color: green } nhắm trực tiếp vào phần tử p nên thắng giá trị kế thừa từ .box hay div (kế thừa luôn thua quy tắc trực tiếp, dù cụ thể thế nào).",4)
def JS(id,stem,code,bads,why,seed):
    out=noderun(code).replace('\n',' | ')
    MC(id,'web',['javascript'],stem,out,bads,why+' Kết quả chạy thật bằng Node.js: '+out,seed,code,src='verified-js')
JS('h-web-05',"Đoạn mã JavaScript in ra gì? (so sánh ép kiểu, toán tử + với chuỗi)","console.log('5' + 3, '5' - 3, 1 + 2 + '3', '3' * '4', null + 1, undefined + 1, [] + [], 1 < 2 < 3, 3 > 2 > 1);",
 ["53 2 33 12 1 NaN  true true","8 2 6 12 1 NaN  true false","53 2 33 12 0 NaN  true false"],"+ nối chuỗi nếu một vế là chuỗi; - và * ép về số; null → 0, undefined → NaN; 3 > 2 > 1 → true > 1 → 1 > 1 → false.",5)
JS('h-web-06',"Kết quả in ra:","let a = [3, 1, 10, 2];\na.sort();\nconsole.log(a.join(','));\nconsole.log([3,1,10,2].sort((x, y) => x - y).join(','));\nconsole.log(typeof NaN, 0.1 + 0.2 === 0.3);",
 ["1,2,3,10 | 1,2,3,10 | number true","1,10,2,3 | 1,2,3,10 | number true","1,10,2,3 | 1,2,3,10 | NaN false"],"sort() mặc định so sánh CHUỖI nên 10 đứng trước 2; typeof NaN là 'number'; 0.1+0.2 ≠ 0.3 do sai số dấu phẩy động.",6)
if __name__=='__main__':
    json.dump(OUT,open('hard_other_out.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
    print(len(OUT))
    for q in OUT:
        if q['type']=='mcq': print(q['id'],'→',q['options'][q['key']])
