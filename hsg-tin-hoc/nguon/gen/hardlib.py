# -*- coding: utf-8 -*-
# Thư viện sinh câu hỏi khó: mọi đáp án lấy bằng cách CHẠY THẬT (sqlite3 / python).
import json,sqlite3,random,re
BANK=json.load(open('../bank.json',encoding='utf-8'))
def mkdb(name):
    con=sqlite3.connect(':memory:')
    for t in BANK['dbs'][name]:
        cols=t['cols']
        con.execute('CREATE TABLE %s(%s)'%(t['name'],','.join(cols)))
        con.executemany('INSERT INTO %s VALUES (%s)'%(t['name'],','.join('?'*len(cols))),
            [[ (float(v) if re.fullmatch(r'-?\d+\.\d+',v) and c=='Diem' else (int(v) if re.fullmatch(r'\d+',v) and not v.startswith('0') and c not in('SDT',) else v)) for v,c in zip(r,cols)] for r in t['rows']])
    con.create_function('YEAR',1,lambda s:int(str(s)[:4]) if s else None)
    con.create_function('MONTH',1,lambda s:int(str(s)[5:7]) if s else None)
    return con
DB={k:mkdb(k) for k in BANK['dbs']}
def fmt(v):
    if v is None: return 'NULL'
    if isinstance(v,float):
        s=('%.4f'%v) if abs(v-round(v,2))>1e-9 else '%.2f'%v
        return s
    return str(v)
def run(db,sql):
    cur=DB[db].execute(sql); cols=[d[0] for d in cur.description]
    return cols,[[fmt(x) for x in r] for r in cur.fetchall()]
def rows(db,sql): return run(db,sql)[1]
def same(db,a,b,ordered=False):
    try: ra=rows(db,a); rb=rows(db,b)
    except Exception: return False
    return ra==rb if ordered else sorted(ra)==sorted(rb)
CL=[2000]
def newcl():
    CL[0]+=1; return CL[0]
OUT=[]
def OPEN(id,db,tags,stem,ref,why,alts=(),ordered=False,code=None):
    cols,r=run(db,ref)
    for a in alts: assert same(db,ref,a,ordered),('alt khác ref',id,a)
    q=dict(id=id,topic='csdl',level=3,tags=tags,db=db,why=why,src='verified-sql',type='open',stem=stem,
           answer=dict(cols=cols,rows=r[:12],more=max(0,len(r)-12)),ref=ref,alts=list(alts),ordered=ordered,optWhy=[],cl=newcl(),v2=True,hard=True)
    if code: q['code']=code
    OUT.append(q); return q
def MCQ(id,db,tags,stem,good,bads,why,optwhy,ordered=False,seed=1):
    """good: SQL đúng; bads: danh sách SQL sai (kết quả phải khác hoặc lỗi)."""
    for b in bads:
        assert not same(db,good,b,ordered),('bad trùng kết quả',id,b)
    opts=[good]+list(bads); ow=[optwhy[0]]+list(optwhy[1:])
    idx=list(range(len(opts))); random.Random(seed).shuffle(idx)
    q=dict(id=id,topic='csdl',level=3,tags=tags,db=db,why=why,src='verified-sql',type='mcq',stem=stem,codeOpts=True,
           options=[opts[i] for i in idx],key=idx.index(0),optWhy=[ow[i] for i in idx],cl=newcl(),v2=True,hard=True)
    OUT.append(q); return q
def PRED(id,db,tags,stem,code,distract,why,seed=1,ordered=True):
    """Dự đoán kết quả: đáp án đúng lấy từ chạy thật; distract: các mô tả sai (chuỗi)."""
    cols,r=run(db,code)
    good='; '.join(','.join(x) for x in r) if r else '(không có dòng nào)'
    assert good not in distract,(id,good)
    opts=[good]+list(distract)
    idx=list(range(len(opts))); random.Random(seed).shuffle(idx)
    q=dict(id=id,topic='csdl',level=3,tags=tags,db=db,why=why+' Kết quả chạy thật: '+good+'.',src='verified-sql',type='mcq',stem=stem,code=code,
           options=[opts[i] for i in idx],key=idx.index(0),optWhy=[],cl=newcl(),v2=True,hard=True)
    OUT.append(q); return q
def TF(id,db,tags,stem,items,why=''):
    """items: (nội dung, hàm kiểm tra trả True/False bằng cách chạy thật, giải thích)"""
    its=[dict(t=t,v=bool(f()),why=w) for t,f,w in items]
    q=dict(id=id,topic='csdl',level=3,tags=tags,db=db,why=why,src='verified-sql',type='tf',stem=stem,items=its,optWhy=[],cl=newcl(),v2=True,hard=True)
    OUT.append(q); return q
def save(path='hard_out.json'):
    json.dump(OUT,open(path,'w',encoding='utf-8'),ensure_ascii=False,indent=1)
