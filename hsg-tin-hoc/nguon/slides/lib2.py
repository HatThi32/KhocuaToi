# -*- coding: utf-8 -*-
import re
exec(open('new4.py',encoding='utf-8').read().split("D={}")[0])   # helpers only
def RES(inner,lab='Kết quả hiển thị'): return '<div class="res"><span class="lab">%s</span>%s</div>'%(lab,inner)
def CODE(s,fs=20): return '<pre class="code" style="font-size:calc(%dpx*var(--z,1))">%s</pre>'%(fs,esc(s))
def KEY(h): return '<div class="key">%s</div>'%h
def WARN(h): return '<div class="warn">%s</div>'%h
def OK(h): return '<div class="ok"><p>%s</p></div>'%h
def LAB(h): return '<div class="lab">%s</div>'%h
QUICK={}
def CR(cls,tag,title,cd,demo,note='',fs=20,pre='',post='',lay='g2'):
    post+=QUICK.get(title,'')
    """code left (+note), result right"""
    return S2(cls,tag,title,pre+CODE(cd,fs)+note,RES(demo)+post,lay)
def TB(cls,tag,title,head,rows,note='',mono=0,lay='g1',extra=''):
    t=T(tr(*head,h=True)+''.join(tr(*r,m=bool(mono)) for r in rows))
    if lay=='g1': return '<section class="s %s"><div class="hd"><span class="k">%s</span><h1>%s</h1></div>\n<div class="bd g1"><div class="col">%s%s%s</div></div></section>'%(cls,tag,title,t,extra,note)
    return S2(cls,tag,title,t,extra+note,lay)
def PT(cls,tag,title,ctitle,items,right='',lay='g2'):
    return S2(cls,tag,title,card(ctitle,ul(items,6)),right,lay)
def mkdeck(fn,title_,secs):
    h=open('head.html',encoding='utf-8').read().replace('<title>Bài giảng Trang web và HTML</title>','<title>%s</title>'%title_)
    t=open('tail.html',encoding='utf-8').read()
    open(fn,'w',encoding='utf-8').write(h+'\n<div id="wrap">\n'+'\n\n'.join(secs)+'\n</div>\n'+t)
    print(fn,len(secs))
SVG0=re.search(r'<svg.*?</svg>',open('deck.html',encoding='utf-8').read(),re.S).group(0)
def SVGCHIPS(chips):
    cols=['#FFD54F','#80DEEA','#A5D6A7','#F48FB1','#CE93D8']
    s='<svg viewBox="0 0 520 420" style="width:100%"><rect x="6" y="6" width="508" height="408" rx="18" fill="#0E1A2E" stroke="#FFD54F" stroke-width="4"/><circle cx="40" cy="40" r="9" fill="#EF5350"/><circle cx="68" cy="40" r="9" fill="#FFCA28"/><circle cx="96" cy="40" r="9" fill="#66BB6A"/><line x1="6" y1="68" x2="514" y2="68" stroke="#ffffff33" stroke-width="2"/>'
    for i,c in enumerate(chips[:5]):
        y=122+i*64
        s+='<text x="36" y="%d" font-size="30" font-weight="800" fill="#ffffff66" font-family="monospace">%d</text><text x="84" y="%d" font-size="34" font-weight="800" fill="%s" font-family="monospace">%s</text>'%(y,i+1,y,cols[i%5],c)
    return s+'</svg>'
def TITLE(tag,h1,sub,chips,svg=None):
    pc=globals().get('c','')
    pc=pc if isinstance(pc,str) and pc[:1]=='p' and pc[1:].isdigit() else ''
    return '<section class="s title-s %s">'%pc+'<div class="hd"><span class="k">%s</span></div>\n<div class="bd g21" style="align-items:center"><div class="col" style="gap:22px"><h1>%s</h1><p style="font-size:28px;line-height:1.5">%s</p><div>%s</div></div>%s</div></section>'%(tag,h1,sub,''.join('<span class="chip">%s</span>'%c for c in chips),svg or SVGCHIPS(chips))
def FLOW(boxes,w=520,col='#4527A0',fs=22):
    """boxes: list of (label, sub). horizontal flow SVG"""
    n=len(boxes);bw=(w-20*(n-1))//n;h=150
    s='<svg viewBox="0 0 %d %d" style="width:100%%">'%(w,h+10)
    for i,(a,b) in enumerate(boxes):
        x=i*(bw+20)
        s+='<rect x="%d" y="5" width="%d" height="%d" rx="12" fill="%s"/>'%(x,bw,h,col)
        s+='<text x="%d" y="62" text-anchor="middle" font-size="%d" font-weight="800" fill="#fff">%s</text>'%(x+bw//2,fs,a)
        s+='<text x="%d" y="100" text-anchor="middle" font-size="%d" fill="#FFE082">%s</text>'%(x+bw//2,fs-3,b)
        if i<n-1: s+='<polygon points="%d,70 %d,80 %d,90" fill="#0B2545"/>'%(x+bw+2,x+bw+18,x+bw+2)
    return s+'</svg>'
def TREE(items,w=520):
    """vertical boxes with labels (list of (label,color))"""
    h=62*len(items)
    s='<svg viewBox="0 0 %d %d" style="width:100%%">'%(w,h)
    for i,(a,c) in enumerate(items):
        s+='<rect x="10" y="%d" width="%d" height="54" rx="10" fill="%s"/><text x="%d" y="%d" text-anchor="middle" font-size="24" font-weight="800" fill="#fff">%s</text>'%(i*62+4,w-20,c,w//2,i*62+38,a)
    return s+'</svg>'
def standard(key,cls,tag,goals_,outline,content,key_,adv_,tap,tapans,hq,ha,per=3):
    """assemble a full deck list"""
    secs=content[:]
    return secs
