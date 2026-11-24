# -*- coding: utf-8 -*-
# Thư viện cho bài giảng Web: hiển thị mã HTML/CSS cùng kết quả dựng thật trong khung trình duyệt.
import json,subprocess,html as _h
exec(open('lib5.py',encoding='utf-8').read())
BASE='body{font:20px/1.4 "Be Vietnam Pro",Arial,sans-serif;margin:10px 14px;color:#111}'
def WCHECK(html,css='',counts=(),styles=(),rects=()):
    a={'html':html,'css':css,'counts':list(counts),'styles':[list(s) for s in styles],'rects':list(rects)}
    r=subprocess.run(['node','webcheck.js',json.dumps(a)],capture_output=True,text=True,cwd='.')
    return json.loads(r.stdout)
def BROWSER(body,css='',h=220,url='',lab=None):
    """Khung trình duyệt chứa iframe dựng đúng mã (cô lập CSS)."""
    doc='<!doctype html><meta charset=utf-8><style>'+BASE+css+'</style>'+body
    u=url or 'trang-mau.html'
    box='<div class="bwin"><div class="tab"><span>%s</span></div><iframe sandbox srcdoc="%s" style="width:100%%;height:%dpx;border:0;display:block;background:#fff"></iframe></div>'%(_h.escape(u),_h.escape(doc,quote=True),h)
    return RES(box,lab) if lab else box
def HI(body,css,sel,h=220,url='trang-mau.html'):
    """Dựng trang và tô nổi bật các phần tử mà bộ chọn sel chọn được."""
    return BROWSER(body,css+'\n%s{outline:4px solid #E53935 !important;outline-offset:2px;background-color:#FFE0B2 !important}'%sel,h,url)
def DEMO(body,css=''):  # mã nguồn đầy đủ (để hiển thị trong CODE)
    return (('<style>\n'+css+'\n</style>\n') if css else '')+body
