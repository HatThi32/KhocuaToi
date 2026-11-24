# -*- coding: utf-8 -*-
from un_base import *
unit('a1','ai','Trí tuệ nhân tạo: khái niệm, ứng dụng, đạo đức',9,
 ['Nêu đặc trưng của AI.','Phân biệt AI hẹp, AI tổng quát, AI tạo sinh.','Nêu rủi ro và nguyên tắc đạo đức.'],
 [sec('AI là gì?',['AI là khả năng của máy tính thực hiện công việc cần trí tuệ con người: học, suy luận, nhận biết, ra quyết định. Khác chương trình tự động hoá ở chỗ: AI học từ dữ liệu, còn tự động hoá chỉ làm theo quy tắc cố định.'],fig='ai_ml',key='AI hẹp: giỏi một việc (nhận dạng khuôn mặt). AI tổng quát: giải mọi việc như người (chưa có).'),
  sec('AI tạo sinh và cảnh báo',['AI tạo sinh tạo ra văn bản, ảnh, âm thanh mới từ mô hình đã học. Rủi ro: thông tin sai, thiên kiến dữ liệu, thông tin giả (deepfake), vi phạm bản quyền và riêng tư. Cần kiểm chứng nguồn và minh bạch khi dùng.'])],
 ['ai-khainiem','ai-dactrung','ai-loai','ai-tao-sinh','ai-ungdung','ai-canhbao','ai-sinh'])
unit('a2','ai','Học máy cơ bản',10,
 ['Phân biệt có giám sát, không giám sát.','Mô tả k-NN, hồi quy, phân cụm.'],
 [sec('Các kiểu học',['Có giám sát: dữ liệu có nhãn (phân loại, hồi quy). Không giám sát: không nhãn (phân cụm, ví dụ k-means).'],key='Hồi quy dự đoán SỐ; phân loại dự đoán NHÃN.',fig='ai_ml'),
  sec('k-NN',['Lấy k điểm gần điểm cần đoán nhất, nhãn phổ biến nhất trong k điểm đó là kết quả.'],fig='knn',hard=True)],
 ['ml','ml-khainiem','ml-knn','ml-hoiquy','ml-kmeans'])
unit('a3','ai','Đánh giá mô hình, quá khớp',8,
 ['Chia dữ liệu huấn luyện/kiểm tra.','Nhận biết quá khớp.','Đọc độ chính xác.'],
 [sec('Chia dữ liệu',['Huấn luyện dùng để mô hình học; kiểm tra (không dùng khi học) để đánh giá khách quan.'],fig='ml_split'),
  sec('Quá khớp',['Mô hình quá khớp: rất tốt trên dữ liệu huấn luyện nhưng kém trên dữ liệu mới.'],fig='overfit',hard=True,code='tp,tn,fp,fn=40,45,5,10\nprint((tp+tn)/(tp+tn+fp+fn))',run=True,lang='python')],
 ['ml-danhgia'])
unit('a4','ai','Khoa học dữ liệu và mô phỏng',8,
 ['Nêu các bước làm sạch dữ liệu.','Hiểu tương quan không phải nhân quả.','Nêu mục đích mô phỏng.'],
 [sec('Dữ liệu',['Làm sạch: xử lí giá trị thiếu, trùng, sai; chuẩn hoá về cùng thang đo. Tương quan chỉ cho biết hai đại lượng cùng biến đổi, chưa chứng tỏ cái này gây ra cái kia.']),
  sec('Mô phỏng',['Dùng mô hình máy tính tái hiện hệ thống thật để thử nghiệm khi thực nghiệm thật tốn kém, nguy hiểm hoặc không thể.'])],
 ['khdl','khdl-thongke','khdl-lamsach','mo-phong'])
unit('n1','nghe','Nghề nghiệp trong ngành CNTT',6,
 ['Kể được nhóm nghề CNTT.','Biết năng lực cần có.'],
 [sec('Nhóm nghề',['Lập trình viên, kĩ sư dữ liệu/khoa học dữ liệu, quản trị mạng, an toàn thông tin, kiểm thử, thiết kế web/đồ hoạ…'],fig='career')],
 ['nghe'])
unit('n2','nghe','Đạo đức, pháp luật, bản quyền',7,
 ['Nhận diện hành vi vi phạm.','Ứng xử có trách nhiệm trên mạng.'],
 [sec('Quy tắc',['Tôn trọng bản quyền, bảo vệ dữ liệu cá nhân, không phát tán thông tin sai, không xâm nhập trái phép, ghi nguồn khi trích dẫn.'],key='Có thể "tải về được" nhưng chưa chắc "được phép dùng".')],
 ['dao-duc','daoduc'])
