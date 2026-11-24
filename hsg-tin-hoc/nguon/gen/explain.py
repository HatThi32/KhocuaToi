# -*- coding: utf-8 -*-
# Sinh phần giải thích CHẠY THẬT cho ngân hàng: optWhy từng phương án, bảng theo dõi từng bước (trace), kết quả SQL đúng (res).
import json,subprocess,sys,re,os
sys.path.insert(0,'.')
import hardlib as H
B=json.load(open('../bank.json',encoding='utf-8'))
TRACER=r'''
import sys,json
src=open(sys.argv[1],encoding='utf-8').read()
lines=src.split('\n')
rows=[];prev={}
def snap(f):
    d={}
    for k,v in f.f_locals.items():
        if k.startswith('__') or callable(v) and not isinstance(v,type) and k not in ('<lambda>',): 
            if callable(v): continue
        if k.startswith('__'): continue
        try: r=repr(v)
        except Exception: r='?'
        d[k]=r if len(r)<=44 else r[:41]+'...'
    return d
def tr(frame,ev,arg):
    if frame.f_code.co_filename!='<prog>': return tr if frame.f_code.co_filename=='<prog>' else None
    if ev=='line':
        fid=id(frame); s=snap(frame); p=prev.get(fid,{})
        # biến thay đổi sau dòng TRƯỚC đã chạy được ghi ở dòng kế tiếp: lưu trạng thái hiện tại cho dòng sắp chạy
        ch={k:v for k,v in s.items() if p.get(k)!=v}
        if len(rows)<400: rows.append([frame.f_lineno,ch,frame.f_code.co_name])
        prev[fid]=s
    return tr
sys.settrace(tr)
import io
out=io.StringIO(); so=sys.stdout; sys.stdout=out
try:
    exec(compile(src,'<prog>','exec'),{'__name__':'__main__'})
except Exception as e:
    pass
sys.settrace(None); sys.stdout=so
# trạng thái sau dòng k xuất hiện ở sự kiện kế tiếp: gom lại
res=[]
for i in range(len(rows)):
    ln,ch,fn=rows[i]
    nxt=rows[i+1][1] if i+1<len(rows) and rows[i+1][2]==fn else {}
    res.append([ln,lines[ln-1].strip(),fn,nxt])
print(json.dumps({'out':out.getvalue(),'steps':res},ensure_ascii=False))
'''
open('/tmp/_tracer.py','w').write(TRACER)
def pytrace(code):
    p='/tmp/_prog.py'; open(p,'w',encoding='utf-8').write(code)
    try:
        r=subprocess.run([sys.executable,'/tmp/_tracer.py',p],capture_output=True,text=True,timeout=15,stdin=subprocess.DEVNULL)
        return json.loads(r.stdout) if r.returncode==0 and r.stdout.strip() else None
    except Exception: return None
def short(s,n=60): s=str(s).replace('\n',' ⏎ '); return s if len(s)<=n else s[:n-1]+'…'
def norm(s): return re.sub(r'\s+','',s)
stat=dict(py=0,trace=0,sql=0,js=0,skipped=0)
for q in B['q']:
    if q.get('type')!='mcq': continue
    ow=list(q.get('optWhy') or [])
    if len(ow)<len(q['options']): ow=ow+['']*(len(q['options'])-len(ow))
    if any(ow): continue
    src=q.get('src','')
    code=q.get('code')
    if src=='verified-py' and code and q['topic'] in('python','ai','mang'):
        if 'input(' in code: continue
        t=pytrace(code)
        if not t: stat['skipped']+=1; continue
        actual=t['out'].strip(); one=actual.replace('\n',' | ')
        ok=q['options'][q['key']]
        good=norm(ok) in(norm(one),norm(actual)) or norm(one)==norm(ok) or norm(actual)==norm(ok)
        if not good: stat['skipped']+=1; continue
        stat['py']+=1
        for i,o in enumerate(q['options']):
            ow[i]=('Đúng: chạy thật chương trình cho đúng kết quả này.' if i==q['key'] else 'Sai: chạy thật chương trình in ra «%s», không phải «%s».'%(short(one,90),short(o,60)))
        q['optWhy']=ow
        steps=t['steps']
        if 1<=len(steps)<=300 and len(code.split('\n'))<=30:
            rows=[]
            for ln,txt,fn,ch in steps[:26]:
                rows.append([ln,txt,', '.join('%s = %s'%(k,v) for k,v in list(ch.items())[:4])])
            q['trace']=dict(rows=rows,more=max(0,len(steps)-26),out=short(one,120))
            stat['trace']+=1
    elif src=='verified-sql' and q.get('db') and q.get('codeOpts'):
        db=q['db']
        try: exp=H.run(db,q['options'][q['key']])
        except Exception: stat['skipped']+=1; continue
        q['res']=dict(cols=exp[0],rows=exp[1][:8],more=max(0,len(exp[1])-8))
        for i,o in enumerate(q['options']):
            if i==q['key']: ow[i]='Đúng: chạy thật cho đúng kết quả yêu cầu (bảng kết quả ở trên).'; continue
            try:
                c,r=H.run(db,o)
                if H.same(db,q['options'][q['key']],o): ow[i]='Cho cùng kết quả với đáp án đúng trên dữ liệu mẫu nhưng viết kém tổng quát.'
                else: ow[i]='Sai: chạy thật trả về %d dòng%s, không phải %d dòng yêu cầu.'%(len(r),(' (cột: '+', '.join(c)+'; dòng đầu: '+short(', '.join(r[0]),50)+')') if r else '',len(exp[1]))
            except Exception as e:
                ow[i]='Sai: câu lệnh báo lỗi khi chạy (%s) — thường do sai thứ tự mệnh đề hoặc dùng hàm tổng hợp trong WHERE.'%short(str(e),60)
        q['optWhy']=ow; stat['sql']+=1
    elif src=='verified-sql' and q.get('db') and code and not q.get('codeOpts'):
        try: exp=H.run(q['db'],code)
        except Exception: stat['skipped']+=1; continue
        actual='; '.join(','.join(x) for x in exp[1]) if exp[1] else '(không có dòng nào)'
        q['res']=dict(cols=exp[0],rows=exp[1][:8],more=max(0,len(exp[1])-8))
        for i,o in enumerate(q['options']):
            ow[i]='Đúng: chạy thật câu lệnh cho kết quả này.' if i==q['key'] else 'Sai: chạy thật câu lệnh cho «%s», không phải «%s».'%(short(actual,90),short(o,60))
        q['optWhy']=ow; stat['sql']+=1
    elif src=='verified-js' and code:
        try:
            r=subprocess.run(['node','-e',code],capture_output=True,text=True,timeout=15); actual=r.stdout.strip().replace('\n',' | ')
        except Exception: continue
        if not actual: continue
        for i,o in enumerate(q['options']):
            ow[i]='Đúng: chạy thật bằng Node.js cho đúng kết quả này.' if i==q['key'] else 'Sai: chạy thật bằng Node.js in ra «%s», không phải «%s».'%(short(actual,90),short(o,60))
        q['optWhy']=ow; stat['js']+=1
json.dump(B,open('../bank.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
print(stat)
