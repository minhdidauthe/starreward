# Star Reward App - Tóm tắt dự án (Version Node.js)

## Mục tiêu dự án
Xây dựng một hệ thống quản lý điểm thưởng (sao) dành cho học sinh, giúp khuyến khích các hoạt động tích cực, quản lý nhiệm vụ hàng ngày và cung cấp các góc học tập, thi cử bổ ích. Hệ thống được chuyển đổi từ phiên bản Python sang Node.js để tối ưu hiệu suất và dễ dàng mở rộng.

## Cấu trúc dự án hiện tại
```
starreward/
├── app/
│   ├── static/            - Tài nguyên tĩnh (CSS, JS, Images)
│   └── templates/         - Giao diện Nunjucks (.html)
├── src/
│   ├── models/            - Định nghĩa Schema MongoDB (Mongoose)
│   ├── routes/            - Xử lý điều hướng Express (main, learning, exam)
│   ├── utils/             - Tiện ích (Seed dữ liệu mẫu)
│   └── app.js             - Điểm khởi đầu của ứng dụng (Entry point)
├── database/              - (Legacy) Dữ liệu SQLite cũ
├── package.json           - Quản lý thư viện Node.js
└── .env                   - Cấu hình môi trường (nếu có)
```

## Các tính năng chính
1. **Quản lý học sinh**
   - Thêm mới học sinh.
   - Xem chi tiết hồ sơ và tổng số sao của từng học sinh.

2. **Hệ thống tặng sao (Rewards)**
   - Tặng sao dựa trên các nhiệm vụ mặc định hoặc lý do tùy chỉnh.
   - Hệ thống trừ sao (Penalty) cho các hành vi cần nhắc nhở.
   - Xem lịch sử nhận sao chi tiết theo ngày.
   - Biểu đồ theo dõi tiến độ (Chart.js).

3. **Quản lý nhiệm vụ (Tasks)**
   - Danh sách nhiệm vụ hàng ngày (Daily Tasks) có sẵn mức sao thưởng.
   - Thêm nhiệm vụ riêng biệt cho từng học sinh với thời hạn (Due date).
   - Đánh dấu hoàn thành và xóa nhiệm vụ.

4. **Góc học tập (Learning Corner)**
   - Cung cấp các tài liệu, bài học bổ trợ cho học sinh.

5. **Góc thi cử (Exam Corner)**
   - Khu vực dành cho các bài kiểm tra và luyện tập thi cử.

6. **Tự động hóa dữ liệu**
   - Seed dữ liệu mẫu (học sinh, nhiệm vụ mặc định) khi khởi động lần đầu.

## Công nghệ sử dụng
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Template Engine**: Nunjucks (Tương thích cú pháp Jinja2)
- **Frontend**: 
  - Bootstrap 5 (UI Framework)
  - Font Awesome 6 (Icons)
  - Chart.js (Biểu đồ)
  - Vanilla JS & jQuery (Xử lý phía client)
- **Tiện ích**: 
  - Moment.js (Xử lý thời gian)
  - Connect-flash (Thông báo nhanh)
  - Express-session (Quản lý phiên làm việc)

## Hướng dẫn chạy dự án trên Local
1. **Yêu cầu**: Đã cài đặt Node.js và MongoDB.
2. **Cài đặt thư viện**:
   ```bash
   npm install
   ```
3. **Chạy ứng dụng**:
   ```bash
   # Chế độ phát triển (tự động restart khi sửa code)
   npm run dev
   
   # Chế độ production
   npm start
   ```
4. **Truy cập**: Mở trình duyệt tại `http://localhost:3000`

## Kế hoạch phát triển tiếp theo
- [ ] Tích hợp AI Agent để gợi ý bài tập cá nhân hóa.
- [ ] Xây dựng hệ thống bảng xếp hạng (Leaderboard) thời gian thực.
- [ ] Thêm tính năng đổi sao lấy quà (Shop quà tặng).
- [ ] Phát triển ứng dụng di động (React Native/Flutter).