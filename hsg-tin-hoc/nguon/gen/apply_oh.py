import json,sys,re,importlib
sys.path.insert(0,'gen')
d=json.load(open('bank.json',encoding='utf-8'));Q={q['id']:q for q in d['q']}
n=0
def pref(q,i,t):
    t=re.sub(r'^(Đúng|Sai): ','',t)
    neg=bool(re.search(r'\bSAI\b|KHÔNG (phải|bao gồm|được)|nào sai|nào KHÔNG',q['stem']))
    if neg: return ('Chọn câu này (đúng yêu cầu hỏi): ' if i==q['key'] else 'Không chọn: ')+t
    return ('Đúng: ' if i==q['key'] else 'Sai: ')+t
for m in sys.argv[1:]:
    mod=importlib.import_module(m)
    for id_,rs in mod.W.items():
        q=Q.get(id_)
        if not q: print('missing',id_);continue
        assert len(rs)==len(q['options']),id_
        q['optWhy']=[pref(q,i,t) for i,t in enumerate(rs)]
        w=getattr(mod,'Y',{}).get(id_)
        if w: q['why']=w
        n+=1
# auto web
a=json.load(open('gen/expl_web_auto.json',encoding='utf-8'))
for k,(w,ow) in a.items():
    Q[k]['why']=w;Q[k]['optWhy']=ow;n+=1
json.dump(d,open('bank.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('applied',n)
