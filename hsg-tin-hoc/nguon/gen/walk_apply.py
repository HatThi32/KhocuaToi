import json,sys
sys.path.insert(0,'.')
import walk as W
d=json.load(open('../bank.json',encoding='utf-8'))
ok=0;skip=[]
for q in d['q']:
    if q['topic'] not in('python','ai') or not q.get('code') or q.get('codeOpts') or q.get('db'): continue
    if q['topic']=='ai' and q.get('src')!='verified-py': continue
    code=q['code']
    if 'input(' in code: skip.append((q['id'],'input'));continue
    r=W.narrate(code)
    if not r: skip.append((q['id'],'fail'));continue
    real=[s for s in r['steps'] if not s[1].startswith('def ') and s[1]!='…']
    if len(real)<2 and not r['steps'] or all(s[1].startswith('def ') for s in r['steps']): skip.append((q['id'],'defonly'));continue
    q['walk']=dict(steps=r['steps'],out=r['out'][:200],err=r['err'])
    ok+=1
json.dump(d,open('../bank.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
print(ok,skip)
