# -*- coding: utf-8 -*-
# Sinh "Giải từng bước" bằng cách CHẠY THẬT chương trình và diễn giải mỗi bước (điều kiện, giá trị, gọi/trả về hàm).
import ast,sys,json,io,subprocess,re
TR=r'''
import sys,ast,json,io,re
src=open(sys.argv[1],encoding='utf-8').read(); L=src.split('\n')
G={'__name__':'__main__'}
class W(io.StringIO): pass
out=W(); so=sys.stdout; sys.stdout=out
ev=[]; depth=[0]
def R(v,n=40):
    if v is None and False: return ''
    try: r=repr(v)
    except Exception: r='?'
    return r if len(r)<=n else r[:n-1]+'…'
def user_vars(f):
    d={}
    for k,v in f.f_locals.items():
        if k.startswith('__') or callable(v) and not isinstance(v,type): continue
        d[k]=R(v)
    return d
def cond_text(line,f):
    s=line.strip()
    m=re.match(r'(if|elif|while)\s+(.*):\s*$',s)
    if not m: return None
    try: t=ast.parse(m.group(2),mode='eval').body
    except Exception: return None
    env=dict(G); env.update(f.f_locals)
    WLN={'len','abs','int','str','min','max','sum','round','float','ord','chr','bool','isinstance','range'}
    WLM={'lower','upper','isdigit','isalpha','isalnum','startswith','endswith','count','get','strip','isspace'}
    def pure(n):
        for x in ast.walk(n):
            if isinstance(x,(ast.Call,)):
                fn=x.func
                if not((isinstance(fn,ast.Name) and fn.id in WLN) or (isinstance(fn,ast.Attribute) and fn.attr in WLM)): return False
            if isinstance(x,(ast.NamedExpr,ast.Await,ast.Yield,ast.Lambda,ast.ListComp,ast.GeneratorExp,ast.SetComp,ast.DictComp)): return False
        return True
    NOV=object()
    def val(n):
        if not pure(n): return NOV
        try: return eval(compile(ast.Expression(n),'<c>','eval'),env)
        except Exception: return NOV
    parts=[]
    def walk(n):
        if isinstance(n,ast.BoolOp):
            for v in n.values: walk(v)
        elif isinstance(n,ast.UnaryOp) and isinstance(n.op,ast.Not): walk(n.operand)
        elif isinstance(n,ast.Compare):
            l=n.left; txt=ast.unparse(l)+' = '+R(val(l),30)
            for op,c in zip(n.ops,n.comparators):
                o={ast.Gt:'>',ast.Lt:'<',ast.GtE:'≥',ast.LtE:'≤',ast.Eq:'==',ast.NotEq:'≠',ast.In:'in',ast.NotIn:'not in',ast.Is:'is',ast.IsNot:'is not'}.get(type(op),'?')
                if isinstance(c,ast.Constant) or ast.unparse(c).lstrip('-').isdigit(): txt+=' '+o+' '+ast.unparse(c)
                else: txt+=' '+o+' '+ast.unparse(c)+' = '+R(val(c),30)
                l=c
            parts.append(txt.replace(' = '+R(NOV,30),' (có gọi hàm)'))
        else:
            vv=val(n); parts.append(ast.unparse(n)+(' (có gọi hàm)' if vv is NOV else ' = '+R(vv,30)))
    walk(t)
    return m.group(1),m.group(2),'; '.join(parts),None
pend=None
def tr(frame,e,arg):
    global pend
    if frame.f_code.co_filename!='<prog>': return None
    if e=='call':
        nm=frame.f_code.co_name
        if nm!='<module>':
            args=', '.join('%s=%s'%(k,R(frame.f_locals[k],24)) for k in frame.f_code.co_varnames[:frame.f_code.co_argcount] if k in frame.f_locals)
            ev.append(('call',depth[0],nm,args,frame.f_lineno))
            depth[0]+=1
        return tr
    if e=='return':
        nm=frame.f_code.co_name
        if nm!='<module>':
            depth[0]-=1; ev.append(('ret',depth[0],nm,R(arg,40),frame.f_lineno,len(out.getvalue())))
        return tr
    if e=='line':
        if len(ev)>1500: raise RuntimeError('chạy quá nhiều bước: chương trình lặp không dừng')
        ln=frame.f_lineno; line=L[ln-1]
        ev.append(('line',depth[0],ln,line.strip(),user_vars(frame),cond_text(line,frame),len(out.getvalue())))
    return tr
err=None
sys.settrace(tr)
try: exec(compile(src,'<prog>','exec'),G)
except BaseException as e: err=(type(e).__name__,str(e))
sys.settrace(None); sys.stdout=so
print(json.dumps({'ev':ev[:1500],'out':out.getvalue(),'err':err,'n':len(ev)},ensure_ascii=False))
'''
open('/tmp/_walk.py','w').write(TR)
def run(code):
    open('/tmp/_wp.py','w',encoding='utf-8').write(code)
    try:
        r=subprocess.run([sys.executable,'/tmp/_walk.py','/tmp/_wp.py'],capture_output=True,text=True,timeout=20,stdin=subprocess.DEVNULL)
        return json.loads(r.stdout) if r.returncode==0 and r.stdout.strip() else None
    except Exception: return None
def sh(s,n): s=str(s); return s if len(s)<=n else s[:n-1]+'…'
def narrate(code,cap=70):
    d=run(code)
    if not d: return None
    ev=d['ev']; steps=[]
    # trạng thái SAU mỗi dòng = trạng thái ở sự kiện line kế tiếp cùng độ sâu
    lines=[(i,e) for i,e in enumerate(ev) if e[0]=='line']
    prevvars={}  # theo độ sâu
    lastout=0
    # tính biến đổi
    n=len(ev)
    TOT=len(d['out'])
    def after_vars(i):
        depth=ev[i][1]
        for j in range(i+1,n):
            if ev[j][0]=='line' and ev[j][1]==depth: return ev[j][4],ev[j][6]
            if ev[j][0]=='ret' and ev[j][1]==depth-1: return None,ev[j][5] if len(ev[j])>5 else None
        return None,TOT
    def outslice(a,b):
        return d['out'][a:b].strip().replace('\n',' ⏎ ')
    def retval(i):
        dep=ev[i][1]
        for j in range(i+1,n):
            if ev[j][0]=='ret' and ev[j][1]==dep-1: return ev[j][3]
            if ev[j][0]=='line' and ev[j][1]<=dep: return None
        return None
    seen={}
    for i,e in enumerate(ev):
        if e[0]=='call':
            steps.append((e[1],'Gọi hàm','%s(%s)'%(e[2],e[3]),'',None))
        elif e[0]=='ret':
            steps.append((e[1],'Hàm trả về','%s ⇒ %s'%(e[2],e[3]),'',None))
        else:
            _,dep,ln,line,vars_,cond,outlen=e
            nv,no=after_vars(i)
            ch=''
            if nv is not None:
                key=(dep,)
                before=vars_
                diff=['%s = %s'%(k,v) for k,v in nv.items() if before.get(k)!=v]
                ch=', '.join(diff[:4])
            expl=''
            if cond:
                kw,c,parts,_r=cond
                res=False
                for j in range(i+1,n):
                    if ev[j][0]=='line' and ev[j][1]==dep: res=(ev[j][2]==ln+1); break
                    if ev[j][0]=='ret' and ev[j][1]==dep-1: break
                expl=('Kiểm tra điều kiện: %s → %s'%(parts,'ĐÚNG, chạy thân' if res else 'SAI, bỏ qua/thoát')) if kw!='while' else ('Điều kiện while: %s → %s'%(parts,'ĐÚNG, vào thân vòng lặp' if res else 'SAI, thoát vòng lặp'))
            elif line.startswith('for '):
                expl='Vòng lặp for' + (': %s'%ch if ch else ': hết phần tử, thoát vòng lặp')
                ch=''
            elif line.startswith('def '):
                expl='Định nghĩa hàm (chưa chạy thân hàm)'
            elif line.startswith('return'):
                rv=retval(i); expl='Trả về '+rv if rv else 'Trả về'
            elif no is not None and no>outlen:
                expl='In ra màn hình: «%s»'%sh(outslice(outlen,no),60)
            else:
                expl=''
            steps.append((dep,line,expl,ch,ln))
    # lược vòng lặp: mỗi dòng chỉ hiện đầy đủ 3 lần đầu mỗi lần gọi hàm; phần lặp giữa chỉ giữ 3 bước cuối để thấy lúc thoát vòng
    cnt={};vis=[]
    LIM=1000 if len(steps)<=130 else 3
    for st in steps:
        dep,code,expl,ch,ln=st
        if ln is None:
            if code=='Gọi hàm':
                for k in [k for k in cnt if k[0]>dep]: del cnt[k]
            vis.append(True);continue
        k=(dep,ln);cnt[k]=cnt.get(k,0)+1;vis.append(cnt[k]<=LIM)
    out=[];i=0;N=len(steps)
    while i<N:
        if vis[i]: out.append(steps[i]);i+=1;continue
        j=i
        while j<N and not vis[j]: j+=1
        rn=steps[i:j]
        keep=rn[-4:] if len(rn)>6 else rn
        hid=len(rn)-len(keep)
        if hid>0: out.append((rn[0][0],'…','(lược bớt %d bước lặp lại tương tự — các lần lặp sau diễn ra giống hệt, chỉ khác giá trị biến)'%hid,'',None))
        out.extend(keep);i=j
    steps=out
    tot=len(steps)
    if tot>cap:
        head=steps[:cap-12];tail=steps[-10:]
        steps=head+[(0,'…','(%d bước ở giữa được lược bớt)'%(tot-len(head)-len(tail)),'',None)]+tail
    return dict(steps=[list(s[:4]) for s in steps],out=d['out'].strip(),err=d['err'],n=d['n'])
if __name__=='__main__':
    b={q['id']:q for q in json.load(open('../bank.json',encoding='utf-8'))['q']}
    for i in sys.argv[1:]:
        r=narrate(b[i]['code']);print('##',i,r['out'][:80],r['err'])
        for s in r['steps']: print('  '*s[0],s[1],'|',s[2],'|',s[3])
