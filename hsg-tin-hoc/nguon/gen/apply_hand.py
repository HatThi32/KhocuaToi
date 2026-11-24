import json,sys
sys.path.insert(0,'gen')
from expl_hand import H
p='bank.json'
d=json.load(open(p,encoding='utf-8'))
n=0
for q in d['q']:
    if q['id'] in H:
        w,ow=H[q['id']]
        q['why']=w; q['optWhy']=ow; n+=1
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('applied',n)
