# -*- coding: utf-8 -*-
from xml.sax.saxutils import escape as E
def R(x,y,w,h,c='bx',rx=8):return '<rect class="%s" x="%s" y="%s" width="%s" height="%s" rx="%s"/>'%(c,x,y,w,h,rx)
def T(x,y,s,c='t',a='start'):return '<text class="%s" x="%s" y="%s" text-anchor="%s">%s</text>'%(c,x,y,a,E(s))
def TT(x,y,lines,c='t',a='middle',lh=17):return ''.join(T(x,y+i*lh,s,c,a) for i,s in enumerate(lines))
def L(x1,y1,x2,y2,c='ln',arrow=False):return '<line class="%s" x1="%s" y1="%s" x2="%s" y2="%s"%s/>'%(c,x1,y1,x2,y2,' marker-end="url(#ar)"' if arrow else '')
def C(x,y,r,c='bx'):return '<circle class="%s" cx="%s" cy="%s" r="%s"/>'%(c,x,y,r)
def P(d,c='ln',arrow=False):return '<path class="%s" d="%s"%s/>'%(c,d,' marker-end="url(#ar)"' if arrow else '')
def SVG(w,h,body,label=''):
    return ('<svg class="sv" viewBox="0 0 %s %s" role="img" aria-label="%s" xmlns="http://www.w3.org/2000/svg"><defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" class="mk"/></marker></defs>%s</svg>'%(w,h,E(label),body))
