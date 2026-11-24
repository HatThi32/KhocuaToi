import json,re,sys,subprocess
d=json.load(open('bank.json',encoding='utf-8'))
Q={q['id']:q for q in d['q']}
out={}
# --- selector family: run in real browser
sel=[q for i,q in Q.items() if i.startswith('web-sel-') and not any(q.get('optWhy') or [])]
jobs=[]
for q in sel:
    s=re.search(r'«(.+?)»',q['stem']).group(1)
    jobs.append({'id':q['id'],'sel':s,'html':q['code']})
open('/tmp/sel_jobs.json','w').write(json.dumps(jobs))
js='''const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage();const J=JSON.parse(fs.readFileSync('/tmp/sel_jobs.json'));const R={};
for(const j of J){await p.setContent('<body>'+j.html+'</body>');R[j.id]=await p.evaluate(s=>[...document.querySelectorAll(s)].map(e=>e.tagName.toLowerCase()+(e.className?'.'+e.className.trim().replace(/\\s+/g,'.'):'')+' "'+e.firstChild.textContent.trim()+'"'),j.sel)}
fs.writeFileSync('/tmp/sel_res.json',JSON.stringify(R));await b.close()})()'''
open('/tmp/sel.js','w').write(js)
subprocess.run(['node','/tmp/sel.js'],check=True,cwd='tests' if False else '.')
R=json.load(open('/tmp/sel_res.json'))
MEAN={ 'ul.menu > li.it':'«>» chỉ chọn con TRỰC TIẾP; li.it phải là con của ul.menu',
 'li.it.on':'hai class viết liền nhau (không dấu cách): phần tử phải có CẢ it VÀ on',
 '#m .it':'dấu cách = hậu duệ ở mọi cấp bên trong #m, kể cả p.it',
 'li + li':'«+» chọn li đứng NGAY SAU một li anh em: mọi li trừ li đầu',
 'li:nth-child(odd)':'nth-child đếm vị trí trong cha (1,3,5…) ',
 'p.it, li.on':'dấu phẩy = hợp của hai bộ chọn, đếm phần tử khớp ít nhất một vế',
 '.on:not(li)':':not(li) loại các thẻ li; còn lại phần tử có class on mà không phải li',
 'li:last-child':'chỉ phần tử là con cuối của cha',
 'div p span.lk':'span.lk phải nằm trong p, p nằm trong div (hậu duệ)',
 'a[href]':'chọn thẻ a có thuộc tính href',
 'ul li:nth-of-type(2n)':'nth-of-type đếm theo cùng loại thẻ: vị trí chẵn',
 'li:not(.it)':'li không có class it'}
for j in jobs:
    q=Q[j['id']];m=R[j['id']];n=len(m)
    why='Bộ chọn «%s» — %s. Khớp %d phần tử: %s.'%(j['sel'],MEAN.get(j['sel'],''),n,'; '.join(m) if m else 'không có')
    ow=[('Đúng: ' if i==q['key'] else 'Sai: ')+('khớp đúng %d phần tử (%s).'%(n,'; '.join(m) if m else 'không có') if i==q['key'] else 'số phần tử khớp thực tế là %d, không phải %s.'%(n,o.strip())) for i,o in enumerate(q['options'])]
    out[q['id']]=(why,ow)
# --- specificity family
for i,q in Q.items():
    if i.startswith('web-spec-') and not any(q.get('optWhy') or []):
        rules=[l for l in q['code'].split('\n') if '{' in l]
        info=[]
        for l in rules:
            sel_,col=re.match(r'\s*(.+?)\s*\{\s*color:\s*(\w+)',l).groups()
            ids=len(re.findall(r'#[\w-]+',sel_));cl=len(re.findall(r'\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+',sel_));tg=len(re.findall(r'(?:^|[\s>+~])[a-z][\w-]*',sel_))
            info.append((col,sel_,(ids,cl,tg)))
        win=max(info,key=lambda x:x[2])
        why='So sánh độ đặc hiệu (số id, số class/thuộc tính/giả lớp, số thẻ), từ trái sang phải; thứ tự viết chỉ quyết định khi bằng nhau. '+'; '.join('«%s» → %s màu %s'%(s,t,c) for c,s,t in info)+'. Cao nhất: «%s» nên màu là %s.'%(win[1],win[0])
        ow=[]
        for k,o in enumerate(q['options']):
            if k==q['key']: ow.append('Đúng: quy tắc «%s» có độ đặc hiệu %s cao nhất.'%(win[1],win[2]))
            elif o.startswith('Không xác định'): ow.append('Sai: luôn xác định được. Thứ tự viết sau cùng chỉ dùng khi độ đặc hiệu BẰNG nhau; ở đây các bộ chọn có độ đặc hiệu khác nhau.')
            else:
                m=[x for x in info if x[0]==o.strip()]
                ow.append('Sai: quy tắc cho màu %s có độ đặc hiệu %s, thấp hơn %s của quy tắc thắng.'%(o.strip(),m[0][2] if m else '?',win[2]))
        out[i]=(why,ow)
# --- box model
for i,q in Q.items():
    if i.startswith('web-box-') and not any(q.get('optWhy') or []):
        c=q['code'];w=int(re.search(r'width:\s*(\d+)',c).group(1));p=int(re.search(r'padding:\s*(\d+)',c).group(1));b=int(re.search(r'border:\s*(\d+)',c).group(1));m=int(re.search(r'margin:\s*(\d+)',c).group(1));bs='border-box' in c
        frame=w if bs else w+2*p+2*b;tot=frame+2*m
        why=('border-box: width đã gồm padding và border nên khung = %d, '%w if bs else 'content-box: width chỉ là phần nội dung, khung = %d + 2×%d (padding) + 2×%d (border) = %d, '%(w,p,b,frame))+'cộng 2×%d (margin) → %d px.'%(m,tot)
        cand={w:'chỉ là giá trị width, bỏ qua phần còn lại',w+2*p:'mới cộng padding',w+2*p+2*b:'chưa cộng margin',w+2*m:'chỉ cộng margin vào width',w+m:'chỉ cộng margin một phía',w+2*b+2*p+m:'cộng margin một phía',frame:'chưa cộng margin',w-2*p-2*b:'trừ padding và border khỏi width (đó là cách tính nội dung của border-box, không phải khung)',w+p+b:'chỉ cộng một phía'}
        cand[w]='chỉ là giá trị width, bỏ qua phần còn lại'
        ow=[]
        for k,o in enumerate(q['options']):
            v=int(o.strip())
            ow.append('Đúng: %d px.'%tot if k==q['key'] else 'Sai: %d px — %s.'%(v,cand.get(v,'sai ở bước cộng padding/border/margin')))
        out[i]=(why,ow)
json.dump(out,open('gen/expl_web_auto.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)
print(len(out))
