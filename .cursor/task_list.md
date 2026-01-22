# Task List - Star Reward App (Node.js Version)

Danh sách các công việc cần thực hiện để hoàn thiện và phát triển ứng dụng Star Reward.

## Nhóm 1: Hoàn thiện Giao diện & Trải nghiệm (UI/UX)
- [ ] **Task 1.1: Cải thiện trang chủ (Index)**
  - [ ] Thêm widget tóm tắt: Tổng số học sinh, Tổng số sao đã tặng trong tháng.
  - [ ] Thêm thanh tìm kiếm học sinh nhanh.
- [ ] **Task 1.2: Hệ thống thông báo (Feedback)**
  - [ ] Tích hợp thư viện Toast (như Toastr hoặc SweetAlert2) để hiển thị thông báo khi tặng sao thành công.
  - [ ] Thêm xác nhận (Confirmation) trước khi xóa học sinh hoặc nhiệm vụ.
- [ ] **Task 1.3: Tối ưu hóa Mobile**
  - [ ] Kiểm tra và sửa lỗi hiển thị bảng lịch sử sao trên màn hình nhỏ.
  - [ ] Chuyển đổi Sidebar thành Offcanvas menu trên Mobile.

## Nhóm 2: Mở rộng Tính năng (Features)
- [ ] **Task 2.1: Quản lý Nhiệm vụ nâng cao**
  - [ ] Cho phép gán một nhiệm vụ cho nhiều học sinh cùng lúc.
  - [ ] Thêm trạng thái "Đang thực hiện" và "Đã quá hạn" cho nhiệm vụ.
- [ ] **Task 2.2: Hệ thống Đổi quà (Rewards Shop)**
  - [ ] Tạo Collection `Gift` trong MongoDB.
  - [ ] Xây dựng giao diện danh sách quà tặng và nút "Đổi quà".
  - [ ] Logic trừ sao khi đổi quà thành công.
- [ ] **Task 2.3: Báo cáo & Thống kê**
  - [ ] Thêm biểu đồ tròn (Pie Chart) phân tích lý do tặng sao (ví dụ: 40% vì học tập, 30% vì việc nhà).
  - [ ] Tính năng xuất báo cáo tuần của từng học sinh ra file PDF.

## Nhóm 3: Kỹ thuật & Bảo mật (Technical)
- [ ] **Task 3.1: Xác thực người dùng (Auth)**
  - [ ] Implement trang Login/Register cho phụ huynh.
  - [ ] Bảo vệ các route bằng Middleware kiểm tra Session.
- [ ] **Task 3.2: Tối ưu Database**
  - [ ] Thêm Index cho trường `date` trong collection `Reward` để tăng tốc độ load lịch sử.
  - [ ] Viết script tự động dọn dẹp (Cleanup) các nhiệm vụ đã hoàn thành quá lâu.
- [ ] **Task 3.3: Logging & Error Handling**
  - [ ] Tích hợp `winston` để ghi log lỗi vào file.
  - [ ] Xây dựng trang lỗi 404 và 500 tùy chỉnh.

## Nhóm 4: Triển khai (Deployment)
- [ ] **Task 4.1: Cấu hình Production**
  - [ ] Thiết lập biến môi trường (.env) cho PORT và MONGODB_URI.
  - [ ] Tạo file `ecosystem.config.js` cho PM2.
- [ ] **Task 4.2: CI/CD**
  - [ ] Thiết lập GitHub Actions để tự động kiểm tra lỗi (lint) khi push code.
- [ ] **Task 4.3: Backup**
  - [ ] Viết script tự động backup MongoDB hàng ngày lên Google Drive hoặc S3.

---
*Ghi chú: Đánh dấu [x] khi hoàn thành một đầu việc.*