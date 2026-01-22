# Kế hoạch triển khai Star Reward App (Node.js Version)

Dự án hiện đã hoàn thành giai đoạn chuyển đổi cơ bản từ Python sang Node.js. Kế hoạch tiếp theo tập trung vào việc hoàn thiện tính năng, tối ưu hóa trải nghiệm người dùng và triển khai thực tế.

## Giai đoạn 1: Hoàn thiện Core System (Đã hoàn thành)
- [x] Thiết lập cấu trúc dự án Node.js/Express.
- [x] Chuyển đổi Schema từ SQLite sang MongoDB (Mongoose).
- [x] Implement các route chính: Quản lý học sinh, tặng sao, lịch sử sao.
- [x] Tích hợp Nunjucks template engine và sửa lỗi tương thích thẻ Jinja2.
- [x] Seed dữ liệu mẫu ban đầu.

## Giai đoạn 2: Tối ưu hóa UI/UX & Tính năng (Hiện tại)
- [ ] **Cải thiện Dashboard**:
  - [ ] Thêm biểu đồ tổng quan cho tất cả học sinh tại trang chủ.
  - [ ] Hiển thị thông báo (Toast) khi thực hiện các thao tác thành công.
- [ ] **Quản lý Nhiệm vụ (Tasks)**:
  - [ ] Cho phép chỉnh sửa và gia hạn nhiệm vụ.
  - [ ] Thêm tính năng nhắc nhở nhiệm vụ sắp đến hạn.
- [ ] **Lịch sử & Báo cáo**:
  - [ ] Xuất lịch sử tặng sao ra file Excel/CSV.
  - [ ] Thống kê top nhiệm vụ được hoàn thành nhiều nhất.

## Giai đoạn 3: Tính năng nâng cao (Sắp tới)
- [ ] **Hệ thống Đổi thưởng (Reward Shop)**:
  - [ ] Tạo danh mục các phần quà (ví dụ: 100 sao = 1 món đồ chơi).
  - [ ] Cho phép học sinh "mua" quà bằng số sao đang có.
- [ ] **Gamification**:
  - [ ] Hệ thống cấp độ (Level) dựa trên tổng số sao tích lũy.
  - [ ] Huy hiệu (Badges) cho các thành tích đặc biệt (ví dụ: 7 ngày liên tiếp hoàn thành nhiệm vụ).
- [ ] **Xác thực & Phân quyền**:
  - [ ] Thêm trang Login cho phụ huynh/giáo viên.
  - [ ] Phân quyền: Admin (quản lý tất cả) và User (chỉ xem thông tin).

## Giai đoạn 4: Triển khai & Bảo trì
- [ ] **Deployment**:
  - [ ] Cấu hình PM2 để chạy ứng dụng bền bỉ trên VPS.
  - [ ] Thiết lập Nginx làm Reverse Proxy.
  - [ ] Cấu hình SSL (Certbot) cho tên miền.
- [ ] **Monitoring**:
  - [ ] Sử dụng công cụ log (như Winston hoặc Morgan) để theo dõi lỗi.
  - [ ] Thiết lập backup định kỳ cho MongoDB.

## Tiêu chuẩn lập trình (Coding Standards)
- **Javascript**: Sử dụng ES6+, tuân thủ chuẩn Clean Code.
- **CSS**: Ưu tiên sử dụng các class của Bootstrap 5, hạn chế viết CSS tùy biến quá nhiều.
- **Database**: Luôn sử dụng Mongoose Middleware để xử lý các logic liên quan (ví dụ: cập nhật `total_stars` khi có `Reward` mới).
- **Git**: Commit message rõ ràng, phân chia branch theo tính năng.