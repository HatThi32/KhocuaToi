# -*- coding: utf-8 -*-
import re,io,contextlib
with contextlib.redirect_stdout(io.StringIO()):
    exec(open('assemble.py',encoding='utf-8').read())
exec(open('new4.py',encoding='utf-8').read())
ALL=out[:]
svg=re.search(r'<svg.*?</svg>',ALL[0],re.S).group(0)
def title(tag,h1,sub,chips):
    return '<section class="s title-s"><div class="hd"><span class="k">%s</span></div>\n<div class="bd g21" style="align-items:center"><div class="col" style="gap:22px"><h1>%s</h1><p style="font-size:28px;line-height:1.5">%s</p><div>%s</div></div>%s</div></section>'%(tag,h1,sub,''.join('<span class="chip">%s</span>'%c for c in chips),svg)
def b10q(items,start=1):
    rows=''.join(qrow(start+k,it[0]) for k,it in enumerate(items))
    left='<div class="lab">SGK Hình 10.1 · cấu trúc website</div><pre class="code" style="font-size:calc(21px*var(--z,1))">%s</pre><div class="key">Mọi câu hỏi dùng cây thư mục này.</div>'%esc(tree)
    return '<section class="s p4"><div class="hd"><span class="k">BÀI 10 · HSG</span><h1>Bài tập luyện HSG (1)</h1></div>\n<div class="bd g12"><div class="col">%s</div><div class="col" style="gap:10px">%s</div></div></section>'%(left,rows)
def qa(key,cls,tag,per=3,fs=20):
    d=D[key];secs=[]
    if key=='b10':
        secs.append(b10q(d['q'][:3]))
        secs+=qslides(cls,tag,'Bài tập luyện HSG',d['q'][3:],per=3,start=4,fs=fs)
        for i,s in enumerate(secs[1:],2): secs[i-1+0]=secs[i-1]
    else:
        secs+=qslides(cls,tag,'Bài tập luyện HSG',d['q'],per=per,fs=fs)
    ans=qslides(cls,tag.replace('HSG','HSG · ĐÁP ÁN') if 'HSG' in tag else tag+' · ĐÁP ÁN','Đáp án chi tiết',d['a'],ans=True,per=per,fs=fs)
    return secs,ans
def retag_q(secs,cls,tag,title_):
    return secs
def write(fn,title_,secs):
    h=open('head.html',encoding='utf-8').read().replace('<title>Bài giảng Trang web và HTML</title>','<title>%s</title>'%title_)
    t=open('tail.html',encoding='utf-8').read()
    open(fn,'w',encoding='utf-8').write(h+'\n<div id="wrap">\n'+'\n\n'.join(secs)+'\n</div>\n'+t)
    print(fn,len(secs))
decks={
 'w1-nen':('Web, URL và trình duyệt',title('TIN HỌC 12 · NỀN','WEB, URL<br>VÀ TRÌNH DUYỆT','Kiến thức nền trước khi học HTML: Web, website, URL, DNS, HTTP, trang tĩnh và động.',['Web','URL','HTTP','Tĩnh / động']),'n','p0','NỀN · HSG',ALL[2:6],[]),
 'w1-b7':('Bài 7 · Trang web và HTML',title('TIN HỌC 12 · BÀI 7','BÀI 7<br>TRANG WEB VÀ HTML','Thẻ, phần tử, thuộc tính, cấu trúc HTML5 tối thiểu, cây phần tử.',['Thẻ, phần tử','Cấu trúc','Cây DOM','Đếm, đọc mã']),'b7','p2','BÀI 7 · HSG',ALL[6:12],ALL[12:14]),
 'w1-b8':('Bài 8 · Định dạng văn bản',title('TIN HỌC 12 · BÀI 8','BÀI 8<br>ĐỊNH DẠNG VĂN BẢN','Thuộc tính, tiêu đề, đoạn, khối, kiểu chữ và phông chữ bằng style.',['Tiêu đề, đoạn','Kiểu chữ','style','Khối / dòng']),'b8','p3','BÀI 8 · HSG',ALL[14:23],ALL[23:25]),
 'w1-b9':('Bài 9 · Danh sách và bảng',title('TIN HỌC 12 · BÀI 9','BÀI 9<br>DANH SÁCH VÀ BẢNG','Danh sách ol, ul, dl, danh sách lồng nhau; bảng và gộp ô.',['ol, ul, dl','Bảng','rowspan','colspan']),'b9','p7','BÀI 9 · HSG',ALL[25:34],ALL[34:36]),
 'w1-b10':('Bài 10 · Tạo liên kết',title('TIN HỌC 12 · BÀI 10','BÀI 10<br>TẠO LIÊN KẾT','Siêu liên kết, đường dẫn tuyệt đối và tương đối, liên kết trong cùng trang, liên kết ảnh.',['Thẻ a','Tuyệt đối','Tương đối','../']),'b10','p4','BÀI 10 · HSG',ALL[36:45],[]),
 'w1-b11':('Bài 11 · Ảnh, âm thanh, video, iframe',title('TIN HỌC 12 · BÀI 11','BÀI 11<br>ẢNH, ÂM THANH, VIDEO','Chèn ảnh, âm thanh, video và nhúng trang bằng iframe.',['img','audio, video','iframe']),'b11','p5','BÀI 11 · HSG',ALL[45:48],ALL[48:50]),
}
for fn,(tt,ti,key,cls,tag,content,tap) in decks.items():
    d=D[key]
    secs=[ti]
    if 'goals' in d: secs.append(d['goals'])
    secs+=content+[d['key'],d['adv']]+tap
    q,a=qa(key,cls,tag)
    secs+=q+a
    write(fn+'.html',tt,secs)
# tong hop
q=['<section class="s p6"><div class="hd"><span class="k">ÔN TẬP · HSG</span><h1>Đọc mã tổng hợp</h1></div>\n<div class="bd g1">'+qrow('★','Đọc kĩ mã trang rồi trả lời 6 câu hỏi ở các slide sau:',D['t']['code'],False,20)+'</div></section>']+qslides('p6','ÔN TẬP · HSG','Câu hỏi về trang trên',D['t']['q'],per=3)
a=qslides('p6','ÔN TẬP · ĐÁP ÁN','Đáp án chi tiết',D['t']['a'],ans=True,per=3)
secs=[title('TIN HỌC 12 · ÔN TẬP','ÔN TẬP<br>BÀI 7 – 11 (HSG)','Các dạng bài khó kiểu đề học sinh giỏi: đúng/sai, tìm lỗi, đọc mã dự đoán kết quả.',['Đúng / sai','Tìm lỗi','Đọc mã','Tổng hợp'])]+ALL[50:53]+q+a+[ALL[53]]
write('w1-hsg.html','Ôn tập HSG Bài 7–11',secs)
