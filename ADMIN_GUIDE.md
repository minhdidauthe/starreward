# 🛡️ Hướng Dẫn Quản Trị - Admin Panel

## 📋 Mục lục

1. [Giới thiệu](#giới-thiệu)
2. [Đăng nhập Admin](#đăng-nhập-admin)
3. [Tính năng Admin Panel](#tính-năng-admin-panel)
4. [Quản lý người dùng](#quản-lý-người-dùng)
5. [Phân quyền](#phân-quyền)
6. [Bảo mật](#bảo-mật)
7. [FAQ & Troubleshooting](#faq--troubleshooting)

---

## 🎯 Giới thiệu

**Admin Panel** là trang quản trị dành riêng cho quản trị viên hệ thống Star Reward. Tại đây, bạn có thể:

- ✅ Xem thống kê tổng quan về người dùng
- ✅ Quản lý toàn bộ tài khoản (tạo, sửa, xóa)
- ✅ Phân quyền vai trò cho người dùng
- ✅ Đặt lại mật khẩu cho bất kỳ ai
- ✅ Tìm kiếm và lọc người dùng

---

## 🔐 Đăng nhập Admin

### Tài khoản mặc định

Khi chạy ứng dụng lần đầu, hệ thống tự động tạo tài khoản admin:

```
📧 Email: admin@starreward.com
👤 Username: admin
🔑 Password: admin123
```

### Các bước đăng nhập

1. **Truy cập trang đăng nhập**
   ```
   http://localhost:3000/auth/login
   ```

2. **Nhập thông tin**
   - Username: `admin`
   - Password: `admin123`

3. **Nhấn nút "Đăng nhập"**

4. **Kiểm tra menu sidebar**
   - Nếu đăng nhập thành công, bạn sẽ thấy menu **"Admin Panel"** xuất hiện ở cuối sidebar

⚠️ **QUAN TRỌNG**: Vui lòng đổi mật khẩu ngay sau lần đăng nhập đầu tiên để bảo mật!

---

## 🎛️ Tính năng Admin Panel

### 1. 📊 Admin Dashboard

**URL**: `/admin/dashboard`

**Nội dung hiển thị:**

#### Thống kê tổng quan
- 📈 **Tổng người dùng**: Tổng số tài khoản trong hệ thống
- 🎓 **Học sinh**: Số lượng học sinh
- ❤️ **Phụ huynh**: Số lượng phụ huynh
- 📚 **Giáo viên**: Số lượng giáo viên
- 🛡️ **Admin**: Số lượng quản trị viên

#### Quick Actions (Thao tác nhanh)
- Quản lý người dùng
- Tạo người dùng mới
- Xem danh sách học sinh
- Xem danh sách giáo viên

#### Người dùng mới nhất
- Bảng hiển thị 10 người dùng được tạo gần nhất
- Thông tin: Username, Họ tên, Email, Vai trò, Ngày tạo
- Nút thao tác nhanh: Xem, Sửa

---

### 2. 👥 Quản lý người dùng

**URL**: `/admin/users`

#### Tìm kiếm & Lọc

**Tìm kiếm:**
- Gõ vào ô tìm kiếm để tìm theo:
  - Tên đăng nhập (username)
  - Email
  - Họ và tên (fullName)

**Lọc theo vai trò:**
- Tất cả vai trò
- Học sinh
- Phụ huynh
- Giáo viên
- Admin

#### Bảng danh sách

Hiển thị thông tin:
- Username
- Họ tên
- Email
- Vai trò (với badge màu sắc khác nhau)
- Ngày tạo
- Lần đăng nhập cuối

#### Thao tác

Mỗi người dùng có 3 nút:
- 👁️ **Xem**: Chi tiết thông tin
- ✏️ **Sửa**: Chỉnh sửa thông tin
- 🗑️ **Xóa**: Xóa người dùng (có xác nhận)

#### Phân trang

- Hiển thị 20 người dùng mỗi trang
- Điều hướng: Trang trước, Trang sau
- Hiển thị số trang hiện tại

---

### 3. ➕ Tạo người dùng mới

**URL**: `/admin/users/create/new`

#### Form tạo người dùng

**Thông tin bắt buộc (*):**

1. **Tên đăng nhập** (username)
   - Độ dài: 3-30 ký tự
   - Phải duy nhất trong hệ thống
   - Không được trùng với username đã có

2. **Họ và tên** (fullName)
   - Tối đa 100 ký tự
   - Tên đầy đủ của người dùng

3. **Email**
   - Định dạng email hợp lệ
   - Phải duy nhất trong hệ thống
   - Ví dụ: `user@example.com`

4. **Vai trò** (role)
   - Chọn 1 trong 4: Student, Parent, Teacher, Admin

5. **Mật khẩu** (password)
   - Tối thiểu 6 ký tự
   - Nên sử dụng mật khẩu mạnh

6. **Xác nhận mật khẩu**
   - Phải giống với mật khẩu đã nhập

#### Xác thực

Hệ thống sẽ kiểm tra:
- ❌ Username đã tồn tại → Báo lỗi
- ❌ Email đã được sử dụng → Báo lỗi
- ❌ Mật khẩu xác nhận không khớp → Báo lỗi
- ✅ Tất cả hợp lệ → Tạo thành công

---

### 4. ✏️ Chỉnh sửa người dùng

**URL**: `/admin/users/:id/edit`

#### Thông tin có thể chỉnh sửa:

- **Username**: Thay đổi tên đăng nhập
- **Họ và tên**: Cập nhật họ tên
- **Email**: Thay đổi email
- **Vai trò**: Phân quyền lại vai trò

#### Lưu ý:

- ⚠️ Không thể thay đổi mật khẩu tại đây
- 💡 Để đổi mật khẩu, sử dụng tính năng **"Đặt lại mật khẩu"**
- ✅ Username và Email mới phải duy nhất

#### Xác thực:

- Username/Email mới không được trùng với người dùng khác
- Tất cả trường bắt buộc phải được điền

---

### 5. 🔑 Đặt lại mật khẩu

**URL**: `/admin/users/:id/reset-password`

#### Cách sử dụng:

1. Vào trang chi tiết người dùng
2. Nhấn nút **"Đặt lại mật khẩu"**
3. Nhập mật khẩu mới (tối thiểu 6 ký tự)
4. Xác nhận mật khẩu
5. Nhấn **"Đặt lại mật khẩu"**

#### Lưu ý quan trọng:

⚠️ **Cảnh báo**: Người dùng sẽ phải đăng nhập lại với mật khẩu mới ngay lập tức!

#### Khi nào sử dụng:

- Người dùng quên mật khẩu
- Cần reset mật khẩu cho bảo mật
- Tạo mật khẩu tạm thời cho người dùng mới

---

### 6. 👁️ Xem chi tiết người dùng

**URL**: `/admin/users/:id`

#### Thông tin hiển thị:

**Thông tin cá nhân:**
- Avatar (nếu có)
- Họ và tên
- Username
- Email
- Vai trò (với badge màu)

**Thông tin hệ thống:**
- ID người dùng
- Ngày tạo tài khoản
- Lần đăng nhập cuối cùng

**Thao tác nhanh:**
- ✏️ Chỉnh sửa thông tin
- 🔑 Đặt lại mật khẩu
- 🗑️ Xóa người dùng

**Lịch sử hoạt động:**
- (Tính năng đang phát triển)

---

### 7. 🗑️ Xóa người dùng

**URL**: `POST /admin/users/:id/delete`

#### Quy trình xóa:

1. Nhấn nút **"Xóa"** ở danh sách hoặc trang chi tiết
2. Modal xác nhận xuất hiện
3. Đọc cảnh báo: **"Hành động này không thể hoàn tác!"**
4. Nhấn **"Xóa"** để xác nhận hoặc **"Hủy"** để bỏ qua

#### Quy tắc bảo vệ:

- 🚫 Admin **KHÔNG THỂ** xóa chính mình
- ✅ Có thể xóa bất kỳ người dùng nào khác
- ⚠️ Dữ liệu sẽ bị xóa vĩnh viễn, không thể khôi phục

---

## 👑 Phân quyền

### 4 loại vai trò (Roles)

#### 1. 🎓 Student (Học sinh)

**Badge**: Màu xanh lá `success`

**Quyền hạn:**
- Sử dụng các tính năng học tập
- Làm bài kiểm tra, bài tập
- Tham gia hoạt động khám phá
- Xem điểm và tiến độ của mình

**Không có quyền:**
- Quản lý người dùng khác
- Truy cập admin panel
- Tạo bài học mới

---

#### 2. ❤️ Parent (Phụ huynh)

**Badge**: Màu xanh dương `info`

**Quyền hạn:**
- Xem tiến độ học tập của con
- Xem báo cáo và thống kê
- Theo dõi điểm số
- Đọc blog và chia sẻ ý tưởng

**Không có quyền:**
- Sửa điểm hoặc bài làm
- Truy cập admin panel
- Quản lý người dùng

---

#### 3. 📚 Teacher (Giáo viên)

**Badge**: Màu vàng `warning`

**Quyền hạn:**
- Tạo và quản lý bài học
- Tạo đề thi, bài kiểm tra
- Chấm điểm và đánh giá
- Giao bài tập cho học sinh
- Xem tiến độ của tất cả học sinh

**Không có quyền:**
- Quản lý tài khoản người dùng
- Phân quyền
- Cấu hình hệ thống

---

#### 4. 🛡️ Admin (Quản trị viên)

**Badge**: Màu đỏ `danger`

**Quyền hạn:**
- ✅ **TOÀN QUYỀN** quản lý hệ thống
- ✅ Quản lý tất cả người dùng
- ✅ Phân quyền vai trò
- ✅ Đặt lại mật khẩu
- ✅ Xóa và tạo tài khoản
- ✅ Truy cập Admin Panel
- ✅ Cấu hình hệ thống

**Trách nhiệm:**
- Bảo mật hệ thống
- Backup dữ liệu
- Quản lý quyền hạn hợp lý

---

## 🔒 Bảo mật

### 1. Bảo vệ Routes

**Middleware `isAdmin`:**
```javascript
// Kiểm tra người dùng có role = 'admin' không
if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
}
// Nếu không phải admin → Chuyển về trang chủ
```

**Các route được bảo vệ:**
- Tất cả `/admin/*` routes
- Chỉ admin mới truy cập được

### 2. Bảo vệ mật khẩu

- ✅ Mật khẩu được hash bằng **bcrypt** với salt rounds = 10
- ✅ Không lưu mật khẩu dạng plain text
- ✅ Kiểm tra độ mạnh: tối thiểu 6 ký tự

### 3. Xác thực dữ liệu

**Username:**
- 3-30 ký tự
- Duy nhất trong hệ thống
- Trim khoảng trắng

**Email:**
- Định dạng email hợp lệ
- Tự động chuyển lowercase
- Duy nhất trong hệ thống

**Password:**
- Tối thiểu 6 ký tự
- Phải khớp với xác nhận

### 4. Bảo vệ Session

- Session được mã hóa
- Timeout tự động sau thời gian không hoạt động
- Logout xóa session hoàn toàn

### 5. Bảo vệ khỏi tự xóa

```javascript
// Kiểm tra không cho admin xóa chính mình
if (user._id.toString() === req.session.user.id.toString()) {
    req.flash('danger', 'Bạn không thể xóa chính mình!');
    return res.redirect('/admin/users');
}
```

---

## 🧪 Tài khoản Test

Hệ thống tự động tạo các tài khoản mẫu để test:

### Admin
```
Username: admin
Email: admin@starreward.com
Password: admin123
Role: admin
```

### Student
```
Username: student1
Email: student1@test.com
Password: password123
Role: student
Họ tên: Nguyễn Văn A
```

### Parent
```
Username: parent1
Email: parent1@test.com
Password: password123
Role: parent
Họ tên: Trần Thị B
```

### Teacher
```
Username: teacher1
Email: teacher1@test.com
Password: password123
Role: teacher
Họ tên: Lê Văn C
```

---

## ❓ FAQ & Troubleshooting

### Q1: Không thấy menu "Admin Panel"?

**A:** Kiểm tra:
- ✅ Bạn đã đăng nhập chưa?
- ✅ Tài khoản có `role = 'admin'` không?
- ✅ Đăng xuất và đăng nhập lại
- ✅ Clear cache trình duyệt

---

### Q2: Truy cập `/admin/dashboard` bị chuyển về trang chủ?

**A:**
- Bạn không có quyền admin
- Kiểm tra role trong database:
  ```javascript
  db.users.findOne({ username: 'your_username' })
  ```
- Nếu role không phải 'admin', cập nhật:
  ```javascript
  db.users.updateOne(
    { username: 'your_username' },
    { $set: { role: 'admin' } }
  )
  ```

---

### Q3: Không thể tạo user mới?

**A:** Kiểm tra:
- ❌ Username đã tồn tại?
- ❌ Email đã được sử dụng?
- ❌ Mật khẩu có ít nhất 6 ký tự?
- ❌ Mật khẩu xác nhận có khớp?

**Debug:**
- Xem console log trong terminal
- Kiểm tra MongoDB connection
- Xem flash message trên UI

---

### Q4: Lỗi "Cannot delete yourself"

**A:**
- Admin không được phép xóa chính mình
- Đây là tính năng bảo mật
- Tạo admin khác trước khi xóa tài khoản hiện tại

---

### Q5: Quên mật khẩu admin?

**A:** Có 2 cách:

**Cách 1: Reset qua MongoDB**
```javascript
// Kết nối MongoDB shell
mongo

// Chọn database
use star_reward_app

// Hash password mới
const bcrypt = require('bcryptjs');
const newPassword = bcrypt.hashSync('new_password', 10);

// Update admin
db.users.updateOne(
    { username: 'admin' },
    { $set: { password: newPassword } }
)
```

**Cách 2: Xóa và tạo lại**
```javascript
// Xóa admin cũ
db.users.deleteOne({ username: 'admin' })

// Restart server để seed lại admin mặc định
```

---

### Q6: Phân trang không hoạt động?

**A:** Kiểm tra:
- URL có query parameter `?page=X` không?
- Tổng số user có > 20 không?
- JavaScript có lỗi trong console không?

---

### Q7: Tìm kiếm không ra kết quả?

**A:**
- Kiểm tra chính tả
- Tìm kiếm không phân biệt hoa/thường
- Thử tìm với từ khóa ngắn hơn
- Xóa filter vai trò nếu có

---

## 📝 Best Practices

### 1. Bảo mật

✅ **NÊN:**
- Đổi mật khẩu admin mặc định ngay
- Sử dụng mật khẩu mạnh (8+ ký tự, chữ hoa, số, ký tự đặc biệt)
- Không chia sẻ tài khoản admin
- Tạo nhiều admin nếu cần
- Backup database định kỳ
- Logout khi không sử dụng

❌ **KHÔNG NÊN:**
- Dùng mật khẩu yếu như "123456"
- Để tài khoản admin mặc định
- Cho nhiều người dùng chung 1 tài khoản admin
- Phân quyền admin cho người không tin cậy

### 2. Quản lý người dùng

✅ **NÊN:**
- Sử dụng email thật để dễ liên hệ
- Đặt username có ý nghĩa, dễ nhớ
- Phân quyền chính xác theo vai trò
- Kiểm tra kỹ trước khi xóa user
- Ghi chú lý do khi xóa user quan trọng

❌ **KHÔNG NÊN:**
- Xóa user mà không xác nhận
- Phân quyền admin lung tung
- Tạo user trùng lặp không cần thiết
- Để user không hoạt động lâu ngày

### 3. Hiệu suất

✅ **NÊN:**
- Sử dụng tìm kiếm thay vì scroll
- Dùng filter để thu hẹp kết quả
- Phân trang để giảm tải
- Đóng tab không dùng

❌ **KHÔNG NÊN:**
- Load tất cả user cùng lúc
- Mở quá nhiều tab admin
- F5 liên tục

---

## 🔗 API Routes Reference

```javascript
// Dashboard
GET  /admin/dashboard

// User Management
GET  /admin/users                       // Danh sách (có phân trang, tìm kiếm, lọc)
GET  /admin/users/create/new            // Form tạo user
POST /admin/users/create                // Xử lý tạo user
GET  /admin/users/:id                   // Chi tiết user
GET  /admin/users/:id/edit              // Form sửa user
POST /admin/users/:id/edit              // Xử lý sửa user
GET  /admin/users/:id/reset-password    // Form reset password
POST /admin/users/:id/reset-password    // Xử lý reset password
POST /admin/users/:id/delete            // Xóa user
```

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
- 📧 Email: support@starreward.com
- 📝 Tạo issue trên GitHub
- 💬 Liên hệ team phát triển

---

**🌟 Star Reward Team**
**Phiên bản:** 2.0
**Cập nhật:** 2026-01-23
