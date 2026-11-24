# -*- coding: utf-8 -*-
exec(open('lib3.py',encoding='utf-8').read())
import sqlite3
def SQLRUN(setup,q):
    con=sqlite3.connect(':memory:')
    try:
        con.executescript(setup)
        cur=con.execute(q)
        cols=[d[0] for d in cur.description] if cur.description else []
        rows=cur.fetchall()
    except Exception as e:
        return 'LỖI: '+str(e)
    if not cols: return '(đã thực hiện)'
    w=[max(len(str(c)),*(len(str(r[i])) for r in rows)) if rows else len(str(c)) for i,c in enumerate(cols)]
    f=lambda r:' | '.join(str(v).ljust(w[i]) for i,v in enumerate(r))
    out=[f(cols),'-+-'.join('-'*x for x in w)]+[f(r) for r in rows]
    return '\n'.join(out)
SETUP="""
CREATE TABLE hocsinh(mahs TEXT PRIMARY KEY, hoten TEXT, lop TEXT, gioitinh TEXT, diemtb REAL);
INSERT INTO hocsinh VALUES('HS01','An','12A','Nam',8.5),('HS02','Binh','12A','Nam',7.0),('HS03','Chi','12B','Nu',9.0),('HS04','Dung','12B','Nu',6.5),('HS05','Em','12A','Nu',8.0),('HS06','Ha','12C','Nu',7.5);
CREATE TABLE lop(malop TEXT PRIMARY KEY, tenlop TEXT, gvcn TEXT);
INSERT INTO lop VALUES('12A','Toan - Tin','Co Lan'),('12B','Ly - Hoa','Thay Minh'),('12C','Van - Su','Co Hoa'),('12D','Anh','Thay Nam');
"""
def SQ(c,tag,title,q,note='',fs=22,setup=None,ofs=22,lab='Kết quả truy vấn'):
    o=SQLRUN(setup or SETUP,q)
    return S2(c,tag,title,CODE(q,fs)+note,RES(OUT(o,ofs),lab))
def SQL1(q,setup=None):
    con=sqlite3.connect(':memory:')
    con.executescript(setup or SETUP)
    rows=con.execute(q).fetchall()
    return '; '.join(', '.join(str(v) for v in r) for r in rows)
