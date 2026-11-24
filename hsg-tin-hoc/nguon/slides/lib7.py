# -*- coding: utf-8 -*-
# Bài giảng SQL chạy trên các CSDL thật của ngân hàng câu hỏi (thuexe, quanly_diem, mymusic_hsg, thuvien).
exec(open('lib5.py',encoding='utf-8').read())
exec(open('lib4.py',encoding='utf-8').read())
import json as _j, re as _re, unicodedata as _ud
_BK=_j.load(open('../bank.json',encoding='utf-8'))['dbs']
_TYPES={'thuexe':{'SoGio':'INT','MaLuot':'INT'},'quanly_diem':{'Diem':'REAL','MaKQ':'INT'},'mymusic_hsg':{},'thuvien':{'SoNgay':'INT','NamXB':'INT','MaMuon':'INT'}}
def DBSETUP(name):
    out=[]
    for t in _BK[name]:
        ty=_TYPES.get(name,{})
        cols=', '.join('%s %s'%(c_,ty.get(c_,'TEXT') if not c_.startswith('id') else 'INT') for c_ in t['cols'])
        out.append('CREATE TABLE %s(%s);'%(t['name'],cols))
        for r in t['rows']:
            r=[_ud.normalize('NFC',x) for x in r]
            vals=[]
            for c_,v in zip(t['cols'],r):
                k=ty.get(c_,'INT' if c_.startswith('id') else 'TEXT')
                vals.append(v if k in('INT','REAL') else "'"+v.replace("'","''")+"'")
            out.append('INSERT INTO %s VALUES(%s);'%(t['name'],','.join(vals)))
    return '\n'.join(out)
def TBL(db,name,ofs=20,lab=None,limit=None):
    q='SELECT * FROM %s'%name+(' LIMIT %d'%limit if limit else '')
    return RES(OUT(SQLRUN(DBSETUP(db),q),ofs),lab or 'Bảng %s'%name.upper())
def SQD(c,tag,title,db,q,note='',fs=22,ofs=22,lab='Kết quả truy vấn',desc=None):
    o=SQLRUN(DBSETUP(db),q)
    left=(desc or '')+CODE(q,fs)+note
    return S2(c,tag,title,left,RES(OUT(o,ofs),lab))
def RESQ(db,q,ofs=22): return SQLRUN(DBSETUP(db),q)

def PRETTY(q):
    if '\n' in q: return q
    q=_re.sub(r'\s+(FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|(?:INNER |LEFT |CROSS )?JOIN)\s',lambda m:'\n'+m.group(1)+' ',q)
    return q
