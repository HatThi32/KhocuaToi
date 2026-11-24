# -*- coding: utf-8 -*-
# Thư viện cho kiểu bài giảng MỚI: giảng giải đầy đủ, từng bước, có bảng theo dõi.
exec(open('lib3.py',encoding='utf-8').read())
def P(*t,fs=None):
    st=' style="margin:0 0 8px%s"'%(';font-size:calc(%dpx*var(--z,1))'%fs if fs else '')
    return ''.join('<p%s>%s</p>'%(st,x) for x in t)
def STEPS(items,gap=6):
    return '<ol style="gap:%dpx">%s</ol>'%(gap,''.join('<li>%s</li>'%i for i in items))
def MEM(pairs,h=150,fs=26):
    """Hộp nhớ: pairs=[(tên,giá trị)] — minh hoạ biến như chiếc hộp có nhãn."""
    n=len(pairs);w=520;bw=min(150,(w-20)//n-14);x0=(w-(bw*n+14*(n-1)))//2;out=''
    for i,(nm,v) in enumerate(pairs):
        x=x0+i*(bw+14)
        out+='<text x="%d" y="30" text-anchor="middle" font-size="%d" font-weight="800" fill="#D84315" font-family="sans-serif">%s</text><rect x="%d" y="44" width="%d" height="%d" rx="10" fill="#FFF8E1" stroke="#0B2545" stroke-width="4"/><text x="%d" y="%d" text-anchor="middle" font-size="%d" font-weight="800" fill="#0B2545" font-family="monospace">%s</text>'%(x+bw//2,fs,esc(nm),x,bw,h-60,x+bw//2,44+(h-60)//2+10,fs,esc(str(v)))
    return '<svg viewBox="0 0 %d %d" style="width:100%%">%s</svg>'%(w,h,out)
def SELF(c,tag,title,q,code,ans,fs=22):
    """Tự kiểm tra: đề bên trái, đáp án giải thích từng bước bên phải."""
    return S2(c,tag,title,card('Câu hỏi',P(q)+(CODE(code,fs) if code else '')),card('Đáp án và giải thích từng bước',ans))
def NUMLINE(lo,hi,marks,w=520,h=130):
    """Trục số, marks=[(giá_trị,nhãn,màu)]."""
    sx=lambda v:20+(v-lo)*(w-40)/(hi-lo);o='<line x1="20" y1="70" x2="%d" y2="70" stroke="#0B2545" stroke-width="4"/>'%(w-20)
    for v in range(lo,hi+1):
        o+='<line x1="%d" y1="62" x2="%d" y2="78" stroke="#0B2545" stroke-width="3"/><text x="%d" y="104" text-anchor="middle" font-size="22" font-weight="800" font-family="monospace" fill="#0B2545">%d</text>'%(sx(v),sx(v),sx(v),v)
    for v,l,col in marks:
        o+='<circle cx="%.1f" cy="70" r="9" fill="%s" stroke="#0B2545" stroke-width="2"/><text x="%.1f" y="42" text-anchor="middle" font-size="21" font-weight="800" font-family="sans-serif" fill="%s">%s</text>'%(sx(v),col,sx(v),col,esc(l))
    return '<svg viewBox="0 0 %d %d" style="width:100%%">%s</svg>'%(w,h,o)
def ERR(code):
    """Chạy đoạn lỗi, chỉ lấy dòng lỗi cuối (loại lỗi: thông điệp)."""
    o=RUN(code).strip().split('\n');return o[-1]
