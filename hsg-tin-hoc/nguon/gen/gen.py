# -*- coding: utf-8 -*-
import json,io,contextlib
from deep3 import D
from figs import F
used=set()
for k,v in D.items():
    for s in v['steps']:
        if s['run'] and s['code']:
            buf=io.StringIO()
            with contextlib.redirect_stdout(buf): exec(s['code'],{})
            s['out']=buf.getvalue().strip()
            print(k,'→',s['out'].replace('\n',' | '))
        if s['fig']:
            assert s['fig'] in F,s['fig'];used.add(s['fig'])
        for kk in ('run','lang','note'):
            if s.get(kk) in (None,False,''):s.pop(kk,None)
        if s['fig'] is None:s.pop('fig')
        if s['code'] is None:s.pop('code')
        if s.get('run'):s.pop('run')
M={}
for k,v in D.items():
    for t in v['tags']:
        assert t not in M or M[t]==k,(t,M.get(t),k)
        M[t]=k
figs={k:F[k] for k in used}
js='const DEEP=%s;\nconst DEEPMAP=%s;\nconst FIGS=%s;'%(json.dumps(D,ensure_ascii=False,separators=(',',':')),json.dumps(M,ensure_ascii=False,separators=(',',':')),json.dumps(figs,ensure_ascii=False,separators=(',',':')))
js=js.replace('</','<\\/')
open('/home/claude/hsgwork/deep.js','w').write(js)
print(len(D),len(M),len(figs),len(js),'unused figs',set(F)-used)
