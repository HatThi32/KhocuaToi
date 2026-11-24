import json,subprocess,sys
d=json.loads(subprocess.check_output(['node','-e',"const fs=require('fs');eval(fs.readFileSync('units.js','utf8')+';console.log(JSON.stringify(UNITS))')"]))
PAL={'w1':'xanh navy đậm #0B2545 và vàng hổ phách #F2A900, nền kem sáng','w2':'xanh lá rừng #14532D và cam #F97316, nền trắng ngà','w3':'tím đậm #3B0764 và hồng san hô #F43F5E, nền trắng lavender nhạt','w4':'xanh ngọc #0F766E và vàng #FACC15, nền trắng',
'w5':'đỏ rượu #7F1D1D và xanh lam #0369A1, nền kem','w6':'xám than #1F2937 và xanh lục #16A34A, nền trắng','p1':'xanh dương #1D4ED8 và vàng #FBBF24, nền trắng','p2':'cam đất #9A3412 và xanh teal #0D9488, nền kem',
'p3':'xanh rêu #3F6212 và tím #7E22CE, nền trắng ngà','p4':'đỏ #B91C1C và xanh navy #1E3A8A, nền trắng','p5':'indigo #312E81 và cam #EA580C, nền trắng','p6':'xanh lục #065F46 và hồng #DB2777, nền trắng',
'p7':'nâu #78350F và xanh da trời #0284C7, nền kem','p8':'xanh ngọc #115E59 và vàng #EAB308, nền trắng','c1':'xanh biển #075985 và cam #F59E0B, nền trắng','c2':'tím #581C87 và xanh lá #15803D, nền trắng',
'c3':'đỏ #9F1239 và xanh teal #0E7490, nền trắng','c4':'xanh navy #172554 và vàng #EAB308, nền trắng','c5':'xám #374151 và đỏ #DC2626, nền trắng','m1':'xanh dương #1E40AF và cam #F97316, nền trắng',
'm2':'xanh lục #166534 và tím #6D28D9, nền trắng','m3':'teal #134E4A và hồng #E11D48, nền trắng','m4':'đỏ #991B1B và xanh đen #0F172A, nền trắng','a1':'tím #4C1D95 và vàng #F59E0B, nền trắng',
'a2':'xanh #0C4A6E và cam #EA580C, nền trắng','a3':'xanh lục #14532D và đỏ #BE123C, nền trắng','a4':'indigo #3730A3 và xanh lá #16A34A, nền trắng','n1':'nâu đỏ #7C2D12 và xanh #0369A1, nền kem','n2':'xanh đen #0F172A và vàng #FBBF24, nền trắng'}
RULES=("QUY TẮC ĐỊNH DẠNG BẮT BUỘC: toàn bộ tiếng Việt có dấu chuẩn. Phối màu: %s; mỗi slide chữ đậm trên nền sáng hoặc chữ sáng trên nền tối, độ tương phản cao. Tiêu đề slide VIẾT HOA, in đậm, cỡ chữ từ 44pt trở lên, font không chân đậm rõ (ví dụ Montserrat hoặc Be Vietnam Pro). "
"Nội dung chính tối thiểu 22pt, KHÔNG có chữ nào nhỏ hơn 18pt kể cả chú thích và nhãn. Mỗi slide lấp đầy khung hình, bố trí cân đối 2 cột hoặc 3 khối, không để trống thưa thớt. Từ khoá quan trọng in đậm và màu đỏ; lỗi thường gặp trong khung màu cam. "
"Code đặt trong khung nền tối, font monospace, chữ sáng, kèm khung KẾT QUẢ CHẠY riêng. Mọi hình sơ đồ phải có nhãn chữ hoặc số đầy đủ trong từng ô, không có ô trống, không có hình trang trí thừa. Chuẩn kiến thức theo SGK Tin học THPT, văn phong khoa học, không ví von đời thường. "
"Mỗi mục kiến thức có các slide: KHÁI NIỆM, ĐẶC ĐIỂM / TÍNH CHẤT, VÍ DỤ (kèm kết quả), PHÂN BIỆT / SO SÁNH (nếu có bảng), rồi slide BÀI TẬP NHANH. Slide đáp án để ngay sau bài tập.")
def brief(k):
    u=d['u'][k];L=["Bộ slide bài giảng Tin học THPT (KNTT) cho học sinh ôn thi HSG, bài: %s. %s"%(u['t'],RULES%PAL[k]),
    "SLIDE 1 - TIÊU ĐỀ: %s."%u['t'].upper(),"SLIDE 2 - MỤC TIÊU: "+" ; ".join(u['goals'])]
    n=3
    for s in u['secs']:
        L.append("=== MỤC: %s ==="%s['h'].upper())
        ps=s['p'];half=(len(ps)+1)//2
        L.append("SLIDE %d - %s (khái niệm, đặc điểm): "%(n,s['h'])+" ".join(ps[:half]));n+=1
        if len(ps)>half: L.append("SLIDE %d - %s (tính chất, ví dụ, lưu ý): "%(n,s['h'])+" ".join(ps[half:]));n+=1
        if s.get('key'): L.append("SLIDE %d - CẦN NHỚ (khung đỏ nổi bật): %s"%(n,s['key']));n+=1
        if s.get('code'): L.append("SLIDE %d - VÍ DỤ CODE (khung tối) và KẾT QUẢ: %s ⏎ KẾT QUẢ: %s"%(n,s['code'],s.get('out','')));n+=1
        if s.get('fig'): L.append("SLIDE %d - SƠ ĐỒ MINH HOẠ vẽ bằng các khối có nhãn đầy đủ, minh hoạ nội dung mục này."%n);n+=1
        if s.get('cmp'):
            c=s['cmp'];L.append("SLIDE %d - %s: bảng so sánh cột %s; hàng: %s"%(n,c['t'].upper(),' | '.join(c['cols']),' ; '.join(' | '.join(r) for r in c['rows'])));n+=1
        if s.get('ex'):
            L.append("SLIDE %d - BÀI TẬP NHANH: "%n+" ".join("(%d) %s"%(i+1,e[0]) for i,e in enumerate(s['ex'])));n+=1
            L.append("SLIDE %d - ĐÁP ÁN: "%n+" ".join("(%d) %s"%(i+1,e[1]) for i,e in enumerate(s['ex'])));n+=1
    L.append("SLIDE %d - TỔNG KẾT: những điều cần nhớ, 5 gạch đầu dòng ngắn, rút từ mục tiêu bài học."%n)
    return "\n".join(L)
if __name__=='__main__':
    out={k:brief(k) for k in d['order']}
    json.dump(out,open('cv/briefs3.json','w'),ensure_ascii=False)
    for k in sys.argv[1:]: print(k,len(out[k]))
