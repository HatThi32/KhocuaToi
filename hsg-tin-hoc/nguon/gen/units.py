# -*- coding: utf-8 -*-
import json,io,contextlib,sqlite3
import un_web,un_py,un_db,un_net,un_ai
from un_base import U,ORDER
from figs import F
from un_more import MORE,PRE
from un_ex import EX,CMP
for _k,_d in EX.items():
    for _i,_l in _d.items(): U[_k]['secs'][_i]['ex']=[list(x) for x in _l]
for _k,_d in CMP.items():
    for _i,_c in _d.items(): U[_k]['secs'][_i]['cmp']=dict(t=_c[0],cols=_c[1],rows=_c[2])
for _k,_d in PRE.items():
    for _i,_ps in _d.items(): U[_k]['secs'][_i]['p']=_ps+U[_k]['secs'][_i]['p']
for _k,_m in MORE.items():
    for _i,_ps in enumerate(_m): U[_k]['secs'][_i]['p']=U[_k]['secs'][_i]['p']+_ps
used=set()
TOP=[('web','Thiết kế web (HTML, CSS)','🌐'),('python','Lập trình Python và thuật toán','🐍'),('csdl','Cơ sở dữ liệu và SQL','🗄️'),('mang','Mạng máy tính','🔌'),('ai','Trí tuệ nhân tạo và dữ liệu','🤖'),('nghe','Nghề nghiệp, đạo đức','🧭')]
def runsql(db,q):
    c=sqlite3.connect(':memory:');c.executescript(db);cur=c.execute(q)
    return dict(cols=[d[0] for d in cur.description],rows=[[('NULL' if v is None else v) for v in r] for r in cur.fetchall()])
for k,u in U.items():
    for s in u['secs']:
        if s.get('code') and s.get('run'):
            b=io.StringIO()
            with contextlib.redirect_stdout(b): exec(s['code'],{})
            s['out']=b.getvalue().strip()
        s.pop('run',None)
        if s.get('sql'):
            s['sql']=dict(q=s['sql']['q'],res=runsql(s['sql']['db'],s['sql']['q']))
        if s.get('fig'):
            assert s['fig'] in F,s['fig'];used.add(s['fig'])
out=dict(top=TOP,order=ORDER,u=U)
import deep3
js_figs=json.loads(open('/home/claude/hsgwork/deep.js').read().split('const FIGS=')[1].rstrip(';')) if False else None
open('/home/claude/hsgwork/units.js','w').write(('const UNITS=%s;\nconst UFIGS=%s;'%(json.dumps(out,ensure_ascii=False,separators=(',',':')),json.dumps({k:F[k] for k in used},ensure_ascii=False,separators=(',',':')))).replace('</','<\\/'))
print(len(U),len(used),sum(len(u['secs']) for u in U.values()))
