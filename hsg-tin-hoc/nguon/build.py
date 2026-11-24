# -*- coding: utf-8 -*-
"""Ghép app_tpl.html + dữ liệu + mô-đun JS thành ../index.html (một tệp duy nhất).
Chạy:  python3 build.py            (từ thư mục nguon/)
Gắn máy chủ lưu kết quả: tạo tệp sync_url.txt chứa URL Apps Script (https://script.google.com/macros/s/.../exec)."""
import json, os
D = os.path.dirname(os.path.abspath(__file__))
P = lambda f: os.path.join(D, f)
R = lambda f: open(P(f), encoding='utf-8').read()
bank = json.dumps(json.load(open(P('bank.json'), encoding='utf-8')), ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
les = json.dumps(json.load(open(P('lessons.json'), encoding='utf-8')), ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
sync_url = R('sync_url.txt').strip() if os.path.exists(P('sync_url.txt')) else ''
extra = '\n'.join([R('deep.js'), R('units.js'), R('deepui.js'), R('learnui.js'), R('sync.js').replace('/*SYNCURL*/', sync_url)])
out = R('app_tpl.html').replace('/*DATA*/{}', bank).replace('/*LESSONS*/{}', les).replace('/*DEEP*/', extra)
open(os.path.join(D, '..', 'index.html'), 'w', encoding='utf-8').write(out)
print('Đã tạo', os.path.normpath(os.path.join(D, '..', 'index.html')), len(out) // 1024, 'KB', '| máy chủ:', sync_url or '(chưa gắn)')
