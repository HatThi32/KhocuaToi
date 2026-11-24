# -*- coding: utf-8 -*-
exec(open('lib2.py',encoding='utf-8').read())
import subprocess,sys,textwrap
def RUN(code,inp=''):
    if inp: code='import builtins as _b\n_i=_b.input\ndef input(p=""):\n    v=_i(p)\n    print(v)\n    return v\n'+code
    r=subprocess.run([sys.executable,'-I','-c',code],input=inp,capture_output=True,text=True,timeout=10)
    return (r.stdout+r.stderr).rstrip('\n')
def OUT(txt,fs=24):
    return '<pre style="font-family:JetBrains Mono,Consolas,monospace;font-size:%dpx;line-height:1.45;margin:0;white-space:pre-wrap;color:#0B2545;font-weight:600">%s</pre>'%(fs,esc(txt))
def PYR(c,tag,title,code,note='',fs=24,inp='',ofs=28,show=None,lab='Kết quả chạy'):
    o=RUN(code,inp) if show is None else show
    pre=''
    return S2(c,tag,title,CODE(code,fs)+note,RES(OUT(o,ofs),lab))
def END(c,B,tt,tt_tab,tt_warn,nc1,nc2,tap,tapa,hq,ha,hper=3):
    S=[]
    S.append(S2(c,'TRỌNG TÂM','Những điều phải nhớ',card('Ghi nhớ',ul(tt,6)),T(tr('Cần…','Dùng',h=True)+''.join(tr(a,b,m=True) for a,b in tt_tab))+WARN(tt_warn)))
    S.append(S2(c,'NÂNG CAO','Điều dễ nhầm và mở rộng',card('Bẫy thường gặp',ul(nc1,6)),card('Mở rộng',ul(nc2,6))))
    S+=qslides(c,B+' · TẬP','Bài tập củng cố',tap,per=5)+qslides(c,B+' · ĐÁP ÁN','Đáp án chi tiết',tapa,ans=True,per=5)
    S+=qslides(c,B+' · HSG','Bài tập luyện HSG',hq,per=hper,fs=19)+qslides(c,B+' · HSG · ĐÁP ÁN','Đáp án chi tiết',ha,ans=True,per=hper,fs=19)
    return S
def AUTOANS(codes):
    """for HSG items given as code: return answer text from running"""
    return [RUN(x) for x in codes]
