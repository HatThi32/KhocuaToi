import figs
css='''<style>:root{--bg:#fff;--fg:#16212c;--muted:#566574;--line:#cbd5df;--accent:#0b6e8a;--accent-soft:#d5ecf3;--ok:#16794a;--ok-soft:#d7f0e1;--bad:#b3261e;--bad-soft:#f8dedb;--warn:#8a5a00;--warn-soft:#fbeccb;--surface2:#e4eaf1}
body{margin:0;background:var(--bg);font-family:sans-serif;color:var(--fg)}
.sv{width:100%;max-width:640px;height:auto;display:block;margin:6px 0}
.sv .t,.sv .tb,.sv .tm,.sv .ts,.sv .tw,.sv .tr{fill:var(--fg);font:13px system-ui,sans-serif}.sv .tb{font-weight:700}.sv .tm{font-family:ui-monospace,Consolas,monospace;font-size:12.5px}.sv .ts{fill:var(--muted);font-size:12px}.sv .tw{fill:var(--warn);font-weight:700}.sv .tr{fill:var(--bad);font-weight:700}
.sv .bx{fill:var(--surface2);stroke:var(--line)}.sv .ba{fill:var(--accent-soft);stroke:var(--accent)}.sv .bo{fill:var(--ok-soft);stroke:var(--ok)}.sv .bb{fill:var(--bad-soft);stroke:var(--bad)}.sv .bw{fill:var(--warn-soft);stroke:var(--warn)}
.sv .ln{stroke:var(--muted);stroke-width:1.5;fill:none}.sv .lg0{stroke:var(--line);stroke-width:1;stroke-dasharray:3 3;fill:none}.sv .lg1{stroke:var(--accent);stroke-width:2.5;fill:none}.sv .lg2{stroke:var(--bad);stroke-width:2.5;fill:none}.sv .lg3{stroke:var(--warn);stroke-width:2.5;fill:none}.sv .mk{fill:var(--muted)}</style>'''
open('/home/claude/hsgwork/gen/preview.html','w').write('<meta charset=utf-8>'+css+''.join('<h4>%s</h4>%s'%(k,v) for k,v in figs.F.items()))
