import json,sys
top=sys.argv[1];a=int(sys.argv[2]);b_=int(sys.argv[3])
b=json.load(open('bank.json',encoding='utf-8'))['q']
need=[q for q in b if q['type']=='mcq' and not any(q.get('optWhy') or []) and q['topic']==top]
for q in need[a:b_]:
    print('##',q['id'],'|',q['stem'].replace('\n',' ')[:200])
    if q.get('code'): print('  CODE:',q['code'].replace('\n',' ⏎ ')[:260])
    for i,o in enumerate(q['options']): print(' ',' ABCDEFGH'[i+1]+('*' if i==q['key'] else ' '),o.replace('\n',' ')[:120])
    print('  why:',(q.get('why') or '')[:140])
