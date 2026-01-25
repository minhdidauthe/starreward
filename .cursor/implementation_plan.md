# Kế hoạch triển khai Star Reward App (Node.js Version)

Dự án đã hoàn thành chuyển đổi sang Node.js và đang tập trung phát triển mạnh mẽ các tính năng về Content Management và AI Integration.

## Giai đoạn 1: Core System & Migration (Đã hoàn thành)
- [x] Thiết lập cấu trúc dự án Node.js/Express.
- [x] Chuyển đổi Database sang MongoDB (Mongoose).
- [x] Hệ thống Authentication & Authorization (Admin, Teacher, Parent, Student).
- [x] Các tính năng cơ bản: Dashboard, Quản lý học sinh, Tặng sao.

## Giai đoạn 2: Content System & AI Integration (Đã hoàn thành)
- [x] **Blog System**:
  - [x] CRUD bài viết, quản lý danh mục, thẻ (tags).
  - [x] Tích hợp CKEditor/Rich Text Editor.
- [x] **Reddit Content Manager**:
  - [x] Crawler lấy dữ liệu từ Reddit (Direct API & RapidAPI).
  - [x] Giao diện quản lý (Card view, Multi-select).
  - [x] Tích hợp AI (CLIProxy) để viết lại nội dung.
  - [x] Flow: Fetch -> AI Rewrite -> Edit -> Publish.
  - [x] Cấu hình AI dynamic ngay trên giao diện Admin.
- [x] **UI/UX Improvements**:
  - [x] Sidebar Navigation (Admin/User separation).
  - [x] Toast Notifications system.

## Giai đoạn 3: Gamification & Engagement (Tiếp theo)
- [ ] **Hệ thống Đổi thưởng (Reward Shop)**:
  - [ ] Tạo danh mục quà tặng.
  - [ ] Cơ chế đổi sao lấy quà.
  - [ ] Lịch sử đổi quà.
- [ ] **Gamification**:
  - [ ] Hệ thống Level/Rank dựa trên tổng sao.
  - [ ] Huy hiệu (Badges) thành tích.
  - [ ] Leaderboard (Bảng xếp hạng).

## Giai đoạn 4: Public Facing & Optimization
- [ ] **Public Blog Interface**:
  - [ ] Trang chủ Blog cho phụ huynh/học sinh.
  - [ ] Trang chi tiết bài viết, comment, like.
- [ ] **Analytics & Reporting**:
  - [ ] Thống kê hoạt động học tập.
  - [ ] Báo cáo xu hướng content.
- [ ] **Deployment**:
  - [ ] Docker hóa ứng dụng.
  - [ ] CI/CD Pipeline.
  - [ ] Monitoring & Logging.

## Tiêu chuẩn kỹ thuật
- **Backend**: Node.js, Express, MongoDB.
- **Frontend**: Nunjucks, Bootstrap 5, Vanilla JS.
- **AI**: Integration via CLIProxy (Gemini, ChatGPT, Claude).
- **Code Quality**: Clean Code, Modular Architecture.