# -*- coding: utf-8 -*-
U={}
ORDER=[]
def unit(id,topic,t,minutes,goals,secs,tags,summary=''):
    U[id]=dict(topic=topic,t=t,min=minutes,goals=goals,secs=secs,tags=tags,sum=summary);ORDER.append(id)
def sec(h,p,key=None,hard=False,fig=None,code=None,run=False,lang=None,sql=None,html=None,table=None):
    d=dict(h=h,p=p)
    if key:d['key']=key
    if hard:d['hard']=True
    if fig:d['fig']=fig
    if code:d['code']=code;d['run']=run;d['lang']=lang
    if sql:d['sql']=sql
    if html:d['html']=html
    if table:d['table']=table
    return d
