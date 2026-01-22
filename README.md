# 🌟 Star Reward - Hệ Thống Tặng Sao Giáo Dục

> Nền tảng quản lý điểm thưởng và nội dung giáo dục dành cho trẻ em và phụ huynh

[![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v4.4+-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cài đặt](#-cài-đặt)
- [Cấu hình](#-cấu-hình)
- [Sử dụng](#-sử-dụng)
- [Admin Panel](#-admin-panel)
- [Reddit Integration](#-reddit-integration)
- [API Documentation](#-api-documentation)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Giới thiệu

**Star Reward** là một hệ thống giáo dục toàn diện giúp phụ huynh và giáo viên:

- ⭐ Quản lý hệ thống tặng sao động viên cho trẻ
- 📚 Cung cấp nội dung học tập (Toán, Tiếng Anh, Khoa học)
- 🎮 Hoạt động khám phá và trò chơi giáo dục
- 💡 Chia sẻ ý tưởng và kinh nghiệm nuôi dạy con
- 📝 Blog giáo dục với nội dung từ Reddit
- 🎯 Thi cử và đánh giá trực tuyến

---

## ✨ Tính năng

### 🎓 Cho Học sinh

- **Hệ thống tặng sao**: Nhận sao khi hoàn thành nhiệm vụ hàng ngày
- **Bảng xếp hạng**: Theo dõi tiến độ và so sánh với bạn bè
- **Học tập tương tác**: Bài học Toán, Tiếng Anh, STEM
- **Hoạt động khám phá**: Game giáo dục, thí nghiệm khoa học
- **Thi cử trực tuyến**: Kiểm tra kiến thức định kỳ

### 👨‍👩‍👧 Cho Phụ huynh

- **Theo dõi tiến độ**: Xem điểm số và hoạt động của con
- **Giao nhiệm vụ**: Tạo task và reward tùy chỉnh
- **Blog giáo dục**: Đọc bài viết về nuôi dạy con
- **Chia sẻ kinh nghiệm**: Đóng góp ý tưởng và tips

### 👨‍🏫 Cho Giáo viên

- **Quản lý lớp học**: Theo dõi nhiều học sinh
- **Tạo bài học**: Soạn nội dung và đề thi
- **Đánh giá**: Chấm điểm và phản hồi
- **Báo cáo**: Thống kê tiến độ học tập

### 🛡️ Admin Panel

- **Quản lý người dùng**: CRUD users, phân quyền
- **Quản lý blog**: Tạo/sửa/xóa bài viết
- **Import Reddit**: Tự động crawl nội dung từ Reddit
- **Thống kê**: Dashboard tổng quan hệ thống
- **Cấu hình**: Settings và customization

---

## 🔧 Công nghệ sử dụng

### Backend
- **Node.js** v16+ - Runtime
- **Express.js** v4.18+ - Web framework
- **MongoDB** v4.4+ - Database
- **Mongoose** - ODM
- **Nunjucks** - Template engine

### Frontend
- **Bootstrap 5** - UI framework
- **Chart.js** - Biểu đồ và thống kê
- **Quill.js** - Rich text editor
- **Bootstrap Icons** - Icon library

### Tools & Services
- **bcryptjs** - Password hashing
- **express-session** - Session management
- **connect-flash** - Flash messages
- **axios** - HTTP client
- **moment** - Date formatting

---

## 📦 Cài đặt

### Yêu cầu hệ thống

- Node.js v16 hoặc mới hơn
- MongoDB v4.4 hoặc mới hơn
- npm hoặc yarn
- Git

### Các bước cài đặt

1. **Clone repository**

```bash
git clone https://github.com/yourusername/star-reward.git
cd star-reward
```

2. **Cài đặt dependencies**

```bash
npm install
```

3. **Cấu hình môi trường**

```bash
cp .env.example .env
```

Chỉnh sửa file `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/star_reward_app
SESSION_SECRET=your-secret-key
BLOG_CORNER_API_URL=http://localhost:30001/api/blog-corner
```

4. **Khởi động MongoDB**

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

5. **Chạy ứng dụng**

```bash
# Development mode
npm start

# Production mode
npm run prod
```

6. **Truy cập ứng dụng**

Mở trình duyệt và truy cập: `http://localhost:3000`

---

## ⚙️ Cấu hình

### Database

MongoDB sẽ tự động tạo database `star_reward_app` khi chạy lần đầu.

Seed data mặc định bao gồm:
- Admin user (username: `admin`, password: `admin123`)
- Sample users (student1, parent1, teacher1)
- Daily tasks (Rửa bát, Học bài, Ngủ đúng giờ...)
- Learning content (Subjects, Chapters, Lessons)
- Exam templates

### Environment Variables

| Variable | Mô tả | Mặc định |
|----------|-------|----------|
| `PORT` | Cổng server | 3000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/star_reward_app |
| `SESSION_SECRET` | Secret key cho sessions | your-secret-key |
| `BLOG_CORNER_API_URL` | URL của Reddit crawler API | http://localhost:30001 |
| `NODE_ENV` | Môi trường (development/production) | development |

---

## 🚀 Sử dụng

### Đăng nhập

#### Tài khoản Admin
```
Username: admin
Password: admin123
Email: admin@starreward.com
```

#### Tài khoản Test
```
Student: student1 / password123
Parent: parent1 / password123
Teacher: teacher1 / password123
```

**⚠️ QUAN TRỌNG:** Đổi mật khẩu admin ngay sau lần đăng nhập đầu tiên!

### Tạo học sinh mới

1. Truy cập trang chủ: `http://localhost:3000`
2. Click "Thêm học sinh"
3. Nhập tên học sinh
4. Click "Thêm"

### Tặng sao cho học sinh

1. Click vào tên học sinh
2. Chọn nhiệm vụ từ danh sách hoặc nhập tùy chỉnh
3. Nhập số sao
4. Click "Tặng sao"

### Tạo nhiệm vụ

1. Vào trang học sinh
2. Click "Thêm công việc"
3. Nhập tên, mô tả, deadline
4. Click "Lưu"

---

## 🛡️ Admin Panel

### Truy cập Admin Panel

1. Đăng nhập với tài khoản admin
2. Menu "Admin Panel" sẽ xuất hiện ở sidebar
3. Click để vào trang quản trị

### Quản lý người dùng

**URL:** `/admin/users`

**Tính năng:**
- ✅ Xem danh sách tất cả users (phân trang)
- ✅ Tìm kiếm theo tên, email, username
- ✅ Lọc theo vai trò (student/parent/teacher/admin)
- ✅ Tạo user mới
- ✅ Chỉnh sửa thông tin user
- ✅ Đặt lại mật khẩu
- ✅ Xóa user (có xác nhận)

**Vai trò (Roles):**
- `student` - Học sinh
- `parent` - Phụ huynh
- `teacher` - Giáo viên
- `admin` - Quản trị viên

### Quản lý Blog

**URL:** `/admin/blog`

**Tính năng:**
- ✅ Dashboard với thống kê
- ✅ Danh sách bài viết (search, filter, pagination)
- ✅ Tạo bài viết với Rich Text Editor
- ✅ Chỉnh sửa và xóa bài viết
- ✅ Import từ Reddit
- ✅ Quản lý categories và tags
- ✅ Featured & Pinned posts
- ✅ Draft/Published/Archived status

**Categories:**
- Education (Giáo dục)
- Psychology (Tâm lý trẻ)
- Health (Sức khỏe)
- Nutrition (Dinh dưỡng)
- Activities (Hoạt động)
- Discipline (Kỷ luật)
- Communication (Giao tiếp)
- Technology (Công nghệ)
- Experience (Kinh nghiệm)
- Other (Khác)

---

## 🔗 Reddit Integration

Star Reward tích hợp với hệ thống crawler Reddit để tự động import nội dung giáo dục.

### Cấu hình

1. **Chạy Blog Corner API**

Hệ thống Reddit crawler của bạn tại:
```
F:\HOC TAP\JAY\Order-Management-System\dashboard-v2
```

Đảm bảo API đang chạy ở port 30001:
```bash
cd "F:\HOC TAP\JAY\Order-Management-System\dashboard-v2"
npm run dev
```

2. **Cấu hình URL trong .env**

```env
BLOG_CORNER_API_URL=http://localhost:30001/api/blog-corner
```

### Import từ Reddit

**Phương thức 1: Import single post**

1. Vào `/admin/blog/import-reddit`
2. Chọn "URL Post"
3. Nhập Reddit URL: `https://www.reddit.com/r/parenting/comments/abc123/...`
4. Chọn category
5. Click "Import"

**Phương thức 2: Import từ Subreddit**

1. Vào `/admin/blog/import-reddit`
2. Chọn "Subreddit"
3. Nhập tên subreddit: `parenting`
4. Chọn sort (hot/new/top)
5. Chọn số lượng posts (1-50)
6. Click "Import"

**Subreddits đề xuất:**

- r/parenting - Nuôi dạy con
- r/education - Giáo dục
- r/Teachers - Giáo viên
- r/homeschool - Giáo dục tại nhà
- r/ScienceTeachers - Khoa học
- r/EnglishLearning - Tiếng Anh
- r/learnmath - Toán học

### Reddit Crawler Service

Service tại: `src/services/redditCrawler.js`

**Methods:**
- `fetchRedditTrends()` - Lấy trends từ blog-corner API
- `fetchRedditPostByUrl()` - Lấy single post by URL
- `fetchSubredditPosts()` - Lấy multiple posts từ subreddit
- `convertRedditPostToBlogPost()` - Convert format
- `syncRedditToBlog()` - Đồng bộ hàng loạt

---

## 📚 API Documentation

### Authentication APIs

#### POST `/auth/login`
Đăng nhập

**Body:**
```json
{
  "email": "admin@starreward.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "username": "admin",
    "role": "admin"
  }
}
```

#### POST `/auth/register`
Đăng ký tài khoản mới

#### GET `/auth/logout`
Đăng xuất

### Blog APIs

#### GET `/blog`
Lấy danh sách blog posts

**Query params:**
- `page` - Số trang (default: 1)
- `category` - Lọc theo category
- `search` - Tìm kiếm
- `sort` - Sắp xếp (newest/popular/liked)

#### GET `/blog/:slug`
Xem chi tiết bài viết

#### POST `/blog/:slug/like`
Like bài viết

#### POST `/blog/:slug/comment`
Thêm comment

### Admin APIs

#### GET `/admin/dashboard`
Admin dashboard

#### GET `/admin/users`
Danh sách users (admin only)

#### POST `/admin/users/create`
Tạo user mới (admin only)

#### GET `/admin/blog/posts`
Danh sách blog posts (admin only)

#### POST `/admin/blog/import-reddit`
Import từ Reddit (admin only)

**Body:**
```json
{
  "importMethod": "url|subreddit",
  "redditUrl": "https://reddit.com/...",
  "subreddit": "parenting",
  "category": "education",
  "autoPublish": "on"
}
```

---

## 📁 Cấu trúc dự án

```
star-reward/
├── app/
│   ├── static/
│   │   ├── css/
│   │   │   ├── custom.css
│   │   │   └── avatars.css
│   │   └── js/
│   │       └── avatars.js
│   └── templates/
│       ├── admin/
│       │   ├── dashboard.html
│       │   ├── users.html
│       │   ├── blog-dashboard.html
│       │   ├── blog-posts.html
│       │   ├── blog-create.html
│       │   ├── blog-edit.html
│       │   └── blog-import-reddit.html
│       ├── auth/
│       │   ├── login.html
│       │   └── register.html
│       ├── blog/
│       │   ├── index.html
│       │   ├── detail.html
│       │   └── create.html
│       ├── explore/
│       ├── learning/
│       ├── exam/
│       ├── ideas/
│       ├── base.html
│       ├── dashboard.html
│       └── student.html
├── src/
│   ├── models/
│   │   ├── Basic.js
│   │   ├── User.js
│   │   ├── Blog.js
│   │   ├── Learning.js
│   │   ├── Exam.js
│   │   ├── Explore.js
│   │   └── Idea.js
│   ├── routes/
│   │   ├── main.js
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── blog.js
│   │   ├── learning.js
│   │   ├── exam.js
│   │   ├── explore.js
│   │   └── ideas.js
│   ├── services/
│   │   └── redditCrawler.js
│   ├── utils/
│   │   └── seed.js
│   └── app.js
├── database/
│   └── stars.db
├── .env.example
├── .gitignore
├── package.json
├── ADMIN_GUIDE.md
└── README.md
```

---

## 🎨 Screenshots

### Trang chủ
![Home](docs/screenshots/home.png)

### Student Dashboard
![Student](docs/screenshots/student.png)

### Admin Panel
![Admin](docs/screenshots/admin.png)

### Blog Management
![Blog](docs/screenshots/blog.png)

---

## 🔐 Bảo mật

### Best Practices

1. **Passwords:**
   - Tất cả mật khẩu được hash bằng bcrypt (10 salt rounds)
   - Không lưu plain text passwords
   - Yêu cầu tối thiểu 6 ký tự

2. **Sessions:**
   - Session-based authentication
   - Secure session secret
   - Auto timeout sau thời gian không hoạt động

3. **Authorization:**
   - Role-based access control (RBAC)
   - Middleware `isAdmin`, `isAuthenticated`, `isTeacherOrAdmin`
   - Route protection

4. **Input Validation:**
   - Server-side validation
   - XSS protection
   - SQL injection prevention (NoSQL)

5. **HTTPS:**
   - Sử dụng HTTPS trong production
   - Secure cookies

---

## 🧪 Testing

### Chạy tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/test_api.js

# Run with coverage
npm run test:coverage
```

### Test files

- `tests/test_api.js` - API endpoints
- `tests/test_reward.js` - Reward system
- `tests/test_task.js` - Task management

---

## 🚢 Deployment

### Heroku

```bash
# Login to Heroku
heroku login

# Create app
heroku create star-reward-app

# Add MongoDB addon
heroku addons:create mongolab

# Set environment variables
heroku config:set SESSION_SECRET=your-secret-key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Open app
heroku open
```

### Docker

```bash
# Build image
docker build -t star-reward .

# Run container
docker run -p 3000:3000 \
  -e MONGODB_URI=mongodb://mongo:27017/star_reward \
  star-reward
```

### PM2 (Production)

```bash
# Install PM2
npm install -g pm2

# Start app
pm2 start src/app.js --name star-reward

# Auto restart on reboot
pm2 startup
pm2 save

# Monitor
pm2 monit
```

---

## 🤝 Contributing

Chúng tôi hoan nghênh mọi đóng góp!

### Quy trình

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Sử dụng ES6+ syntax
- Indentation: 4 spaces
- Naming: camelCase cho variables, PascalCase cho classes
- Comment bằng tiếng Việt hoặc tiếng Anh

---

## 📝 Changelog

### Version 2.0.0 (2026-01-23)

#### Added
- ✨ Admin Panel với quản lý users
- 📝 Blog Management System
- 🔗 Reddit Integration với crawler
- 🎨 Rich Text Editor (Quill.js)
- 📊 Dashboard với thống kê
- 🔐 Role-based access control
- 🌐 Multi-category blog system

#### Changed
- 🔄 Migrate từ SQLite sang MongoDB
- 💅 UI/UX improvements với Bootstrap 5
- ⚡ Performance optimization

#### Fixed
- 🐛 Bug fixes trong reward system
- 🔧 Session management improvements

### Version 1.0.0

- ⭐ Basic reward system
- 📚 Learning modules
- 🎯 Exam system
- 👥 Multi-user support

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Developer**: Star Reward Team
- **Contributors**: [Contributors List](https://github.com/yourusername/star-reward/graphs/contributors)

---

## 📞 Support

### Liên hệ

- 📧 Email: support@starreward.com
- 🌐 Website: https://starreward.com
- 💬 Discord: https://discord.gg/starreward

### Báo lỗi

Tạo issue tại: https://github.com/yourusername/star-reward/issues

### Documentation

- [Admin Guide](ADMIN_GUIDE.md) - Hướng dẫn quản trị
- [API Docs](docs/API.md) - API documentation
- [User Guide](docs/USER_GUIDE.md) - Hướng dẫn người dùng

---

## 🙏 Acknowledgments

- [Bootstrap](https://getbootstrap.com/) - UI Framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Express.js](https://expressjs.com/) - Web Framework
- [Quill.js](https://quilljs.com/) - Rich Text Editor
- [Chart.js](https://www.chartjs.org/) - Charts
- Reddit community - Content source

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/star-reward&type=Date)](https://star-history.com/#yourusername/star-reward&Date)

---

<div align="center">

Made with ❤️ by Star Reward Team

**[⬆ Back to Top](#-star-reward---hệ-thống-tặng-sao-giáo-dục)**

</div>
