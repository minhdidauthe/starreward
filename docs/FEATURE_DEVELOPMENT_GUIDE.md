# Star Reward - Feature Development Guide

> Hướng dẫn phát triển tính năng mới cho dự án Star Reward

---

## Mục lục
1. [Quy trình phát triển tính năng mới](#1-quy-trình-phát-triển-tính-năng-mới)
2. [Tính năng nên phát triển tiếp](#2-tính-năng-nên-phát-triển-tiếp)
3. [Template code mẫu](#3-template-code-mẫu)
4. [Hướng dẫn fix Technical Debt](#4-hướng-dẫn-fix-technical-debt)

---

## 1. Quy trình phát triển tính năng mới

### Step 1: Tạo Model (nếu cần)

File: `src/models/NewFeature.js`

```javascript
const mongoose = require('mongoose');

const newFeatureSchema = new mongoose.Schema({
    title: { type: String, required: true, maxlength: 200 },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: {
        type: String,
        enum: ['active', 'inactive', 'archived'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('NewFeature', newFeatureSchema);
```

### Step 2: Tạo Route

File: `src/routes/newFeature.js`

```javascript
const express = require('express');
const router = express.Router();
const NewFeature = require('../models/NewFeature');
const { isAuthenticated, isAdmin } = require('./auth');

// List
router.get('/', async (req, res) => {
    try {
        const items = await NewFeature.find({ status: 'active' })
            .sort({ createdAt: -1 })
            .limit(20);
        res.render('new-feature/index.html', { items });
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect('/');
    }
});

// Create
router.get('/create', isAuthenticated, (req, res) => {
    res.render('new-feature/create.html');
});

router.post('/create', isAuthenticated, async (req, res) => {
    try {
        const { title, description } = req.body;
        const item = new NewFeature({
            title,
            description,
            createdBy: req.session.user.id
        });
        await item.save();
        req.flash('success', 'Tạo thành công!');
        res.redirect('/new-feature');
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect('/new-feature/create');
    }
});

module.exports = router;
```

### Step 3: Đăng ký Route trong `app.js`

```javascript
// Trong src/app.js, thêm:
const newFeatureRoutes = require('./routes/newFeature');
app.use('/new-feature', newFeatureRoutes);
```

### Step 4: Tạo Template

File: `app/templates/new-feature/index.html`

```html
{% extends "base.html" %}

{% block title %}New Feature - Star Reward{% endblock %}

{% block content %}
<div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <h2><i class="bi bi-star"></i> New Feature</h2>
        {% if user %}
        <a href="/new-feature/create" class="btn btn-primary">
            <i class="bi bi-plus-lg"></i> Tạo mới
        </a>
        {% endif %}
    </div>

    <div class="row">
        {% for item in items %}
        <div class="col-md-4 mb-3">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">{{ item.title }}</h5>
                    <p class="card-text">{{ item.description | truncate(100) }}</p>
                </div>
                <div class="card-footer text-muted">
                    {{ item.createdAt | date('DD/MM/YYYY') }}
                </div>
            </div>
        </div>
        {% endfor %}
    </div>
</div>
{% endblock %}
```

### Step 5: Thêm vào Navigation

Trong `app/templates/base.html`, thêm link vào sidebar/navbar:

```html
<li class="nav-item">
    <a class="nav-link" href="/new-feature">
        <i class="bi bi-star"></i> New Feature
    </a>
</li>
```

### Step 6: Thêm Seed Data (nếu cần)

Trong `src/utils/seed.js`, thêm function seed cho feature mới.

---

## 2. Tính năng nên phát triển tiếp

### Priority 1: Cải thiện hệ thống hiện tại

#### 2.1 Notification System (Thông báo)
**Mô tả:** Hệ thống thông báo real-time cho user

**Model cần tạo:** `src/models/Notification.js`
```javascript
const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
        type: String,
        enum: ['star_earned', 'task_assigned', 'exam_result', 'comment', 'system'],
        required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String },           // URL redirect khi click
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
```

**Routes cần thêm:**
- `GET /api/notifications` - Lấy thông báo (JSON API)
- `POST /api/notifications/:id/read` - Đánh dấu đã đọc
- `POST /api/notifications/read-all` - Đọc tất cả

**Frontend:** Badge đếm thông báo trên navbar, dropdown list

---

#### 2.2 Student Progress Dashboard
**Mô tả:** Dashboard chi tiết theo dõi tiến độ học sinh

**Cần thêm:**
- Biểu đồ sao theo tuần/tháng (Chart.js đã có)
- Thống kê hoàn thành task
- Kết quả thi theo thời gian
- So sánh với trung bình (nếu có nhiều học sinh)

**Route:** `GET /student/:id/progress`

**Template:** `app/templates/student/progress.html`

---

#### 2.3 Parent-Student Linking
**Mô tả:** Liên kết tài khoản phụ huynh với học sinh

**Model mới:** Thêm fields vào User
```javascript
// Thêm vào User schema:
children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],  // for parents
parentUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },     // for students
```

**Chức năng:**
- Parent dashboard: xem tất cả con
- Parent có thể thưởng/phạt sao
- Nhận thông báo khi con hoàn thành task

---

### Priority 2: Tính năng mới hấp dẫn

#### 2.4 Achievement / Badge System (Huy hiệu)
**Mô tả:** Hệ thống huy hiệu khuyến khích học sinh

**Model:**
```javascript
const achievementSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    icon: { type: String },             // emoji hoặc icon class
    type: {
        type: String,
        enum: ['star_milestone', 'task_streak', 'exam_score', 'explore_count', 'idea_count'],
    },
    requirement: { type: Number },       // Ví dụ: 100 stars, 7 day streak
    starsBonus: { type: Number, default: 0 }
});

const userAchievementSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    achievement: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' },
    earnedAt: { type: Date, default: Date.now }
});
```

**Ví dụ achievements:**
- "Ngôi Sao Mới" - Đạt 10 sao đầu tiên
- "Siêu Sao" - Đạt 100 sao
- "Chăm Chỉ" - Hoàn thành task 7 ngày liên tiếp
- "Nhà Khám Phá" - Hoàn thành 10 activities
- "Nhà Phát Minh" - Tạo 5 ý tưởng

---

#### 2.5 Leaderboard (Bảng Xếp Hạng)
**Mô tả:** Bảng xếp hạng theo sao, tasks, exams

**Route:** `GET /leaderboard`

**Logic:**
```javascript
// Top students by stars
const topByStars = await Student.find()
    .sort({ total_stars: -1 })
    .limit(10);

// Top by tasks completed (this week)
const topByTasks = await Task.aggregate([
    { $match: { is_completed: true, /* this week filter */ } },
    { $group: { _id: '$student', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
]);

// Top exam scores
const topByExams = await ExamSchedule.aggregate([
    { $match: { is_completed: true } },
    { $group: { _id: '$student', avgScore: { $avg: '$score' } } },
    { $sort: { avgScore: -1 } },
    { $limit: 10 }
]);
```

---

#### 2.6 Homework / Assignment System (Bài tập)
**Mô tả:** Hệ thống giao và nộp bài tập

**Models:**
```javascript
const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },  // teacher
    dueDate: { type: Date, required: true },
    starsReward: { type: Number, default: 3 },
    attachments: [{ name: String, url: String }],
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
});

const submissionSchema = new mongoose.Schema({
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    content: { type: String },
    attachments: [{ name: String, url: String }],
    submittedAt: { type: Date, default: Date.now },
    grade: { type: Number },           // điểm 0-10
    feedback: { type: String },        // nhận xét từ teacher
    starsEarned: { type: Number, default: 0 }
});
```

---

#### 2.7 Daily Check-in & Streak
**Mô tả:** Điểm danh hàng ngày + streak bonus

**Model:**
```javascript
const checkInSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    date: { type: Date, required: true },
    starsEarned: { type: Number, default: 1 }
});

// Thêm vào Student schema:
// currentStreak: Number (default 0)
// longestStreak: Number (default 0)
// lastCheckIn: Date
```

**Logic:** Streak bonus:
- 1-6 ngày: 1 sao/ngày
- 7 ngày liên tiếp: +5 sao bonus
- 14 ngày: +10 sao bonus
- 30 ngày: +25 sao bonus

---

#### 2.8 Star Shop (Cửa hàng đổi sao)
**Mô tả:** Học sinh đổi sao lấy phần thưởng

**Model:**
```javascript
const shopItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    cost: { type: Number, required: true },           // số sao cần
    category: {
        type: String,
        enum: ['privilege', 'avatar', 'theme', 'physical', 'experience']
    },
    stock: { type: Number, default: -1 },              // -1 = unlimited
    isActive: { type: Boolean, default: true }
});

const purchaseSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'ShopItem' },
    cost: { type: Number },
    purchasedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'delivered', 'cancelled'], default: 'pending' }
});
```

**Ví dụ items:**
- 🎮 "30 phút chơi game" - 20 sao
- 🍦 "Được ăn kem" - 15 sao
- 🎨 "Avatar đặc biệt" - 50 sao
- 📱 "30 phút xem YouTube" - 25 sao
- 🏖️ "Được nghỉ 1 task" - 10 sao

---

### Priority 3: Nâng cao

#### 2.9 AI Tutor (Gia sư AI)
**Mô tả:** Chatbot AI hỗ trợ học tập

**Implementation:**
- Sử dụng CLIProxy (đã có sẵn `aiService.js`)
- Chat interface trong trang Learning
- AI trả lời câu hỏi theo môn học
- Gợi ý bài học phù hợp

**Model:**
```javascript
const chatSessionSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    messages: [{
        role: { type: String, enum: ['user', 'assistant'] },
        content: { type: String },
        createdAt: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});
```

**Route:**
- `GET /learning/ai-tutor` - Chat interface
- `POST /api/ai-tutor/chat` - Send message to AI

---

#### 2.10 Parent Report (Báo cáo cho phụ huynh)
**Mô tả:** Báo cáo tuần/tháng gửi cho phụ huynh

**Chức năng:**
- Tổng kết sao tuần/tháng
- Tasks hoàn thành vs chưa
- Kết quả thi
- So sánh với tuần trước
- Render HTML → gửi email (future)

---

#### 2.11 File Upload System
**Mô tả:** Upload ảnh/file cho blog, assignments, avatars

**Implementation:**
- Dùng `multer` middleware cho Express
- Lưu local trước (`/uploads/`)
- Migrate sang Cloudinary sau (config đã có sẵn trong .env)

```javascript
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },  // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|pdf/;
        const ext = allowed.test(path.extname(file.originalname).toLowerCase());
        const mime = allowed.test(file.mimetype);
        if (ext && mime) cb(null, true);
        else cb(new Error('File type not allowed'));
    }
});
```

---

#### 2.12 WebSocket Real-time Updates
**Mô tả:** Cập nhật real-time cho notifications, leaderboard

**Implementation:**
```javascript
// Install: npm install socket.io
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    socket.join(`user_${userId}`);

    socket.on('disconnect', () => {
        socket.leave(`user_${userId}`);
    });
});

// Emit notification
function sendNotification(userId, notification) {
    io.to(`user_${userId}`).emit('notification', notification);
}
```

---

## 3. Template code mẫu

### 3.1 Thêm API endpoint trả JSON

```javascript
// Trong route file:
router.get('/api/data', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            Model.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Model.countDocuments({})
        ]);

        res.json({
            success: true,
            data: items,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
```

### 3.2 Middleware pattern

```javascript
// Middleware kiểm tra ownership
const isOwner = (model) => async (req, res, next) => {
    try {
        const item = await model.findById(req.params.id);
        if (!item) {
            req.flash('danger', 'Không tìm thấy!');
            return res.redirect('back');
        }
        if (item.createdBy.toString() !== req.session.user.id &&
            req.session.user.role !== 'admin') {
            req.flash('danger', 'Bạn không có quyền!');
            return res.redirect('back');
        }
        req.item = item;
        next();
    } catch (err) {
        next(err);
    }
};

// Usage:
router.post('/:id/delete', isAuthenticated, isOwner(NewFeature), async (req, res) => {
    await req.item.deleteOne();
    req.flash('success', 'Đã xóa!');
    res.redirect('/new-feature');
});
```

### 3.3 Admin CRUD template

```javascript
// Admin routes cho feature mới (thêm vào src/routes/admin.js hoặc tách file riêng)

// List with pagination + search
router.get('/admin/new-feature', isAdmin, async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const search = req.query.search || '';

    const filter = search
        ? { title: { $regex: search, $options: 'i' } }
        : {};

    const [items, total] = await Promise.all([
        NewFeature.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate('createdBy', 'fullName'),
        NewFeature.countDocuments(filter)
    ]);

    res.render('admin/new-feature.html', {
        items,
        pagination: {
            page,
            pages: Math.ceil(total / limit),
            total
        },
        search
    });
});
```

---

## 4. Hướng dẫn fix Technical Debt

### Fix 1: Hardcoded secrets trong app.js

**File:** `src/app.js`

```javascript
// TRƯỚC (dòng 16):
mongoose.connect('mongodb://localhost:27017/star_reward_app')

// SAU:
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/star_reward_app')

// TRƯỚC (dòng 28):
secret: 'secret_key',

// SAU:
secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
```

---

### Fix 2: Thêm Error Handling Middleware

**Thêm cuối `src/app.js` (trước `app.listen`):**

```javascript
// 404 Handler
app.use((req, res) => {
    res.status(404).render('errors/404.html', { user: req.session?.user });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('[Error]', err.stack);
    res.status(500).render('errors/500.html', {
        user: req.session?.user,
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
    });
});
```

---

### Fix 3: Thêm Rate Limiting

```bash
npm install express-rate-limit
```

```javascript
// Trong src/app.js:
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,    // 15 minutes
    max: 100,                      // 100 requests per window
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau!'
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,                        // 5 login attempts per 15 min
    message: 'Quá nhiều lần đăng nhập thất bại!'
});

app.use('/api', limiter);
app.use('/auth/login', authLimiter);
```

---

### Fix 4: Session Store cho Production

```bash
npm install connect-mongo
```

```javascript
const MongoStore = require('connect-mongo');

app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,       // Changed to false
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/star_reward_app',
        ttl: 24 * 60 * 60           // 1 day
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000  // 1 day
    }
}));
```

---

### Fix 5: CSRF Protection

```bash
npm install csurf
```

```javascript
const csrf = require('csurf');
const csrfProtection = csrf();

// Sau session middleware:
app.use(csrfProtection);

// Truyền token vào tất cả templates:
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});
```

Trong templates, thêm hidden field:
```html
<form method="POST" action="/...">
    <input type="hidden" name="_csrf" value="{{ csrfToken }}">
    <!-- form fields -->
</form>
```

---

### Fix 6: Fix Dockerfile

```dockerfile
# TRƯỚC: FROM python:3.11-slim
# SAU:
FROM node:18-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

ENV NODE_ENV=production

CMD ["node", "src/app.js"]
```

---

### Fix 7: Fix docker-compose.yml

```yaml
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - mongodb
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://admin:password@mongodb:27017/star_reward_app?authSource=admin
      - SESSION_SECRET=your-production-secret-here
      - PORT=8080
    networks:
      - app_network
```

---

### Fix 8: Tách admin.js thành modules

```
src/routes/admin/
├── index.js           # Router chính, mount sub-routers
├── dashboard.js       # GET /admin/dashboard
├── users.js           # /admin/users/*
├── blog.js            # /admin/blog/*
└── reddit.js          # /admin/reddit/*
```

```javascript
// src/routes/admin/index.js
const express = require('express');
const router = express.Router();
const { isAdmin } = require('../auth');

// Apply isAdmin to all admin routes
router.use(isAdmin);

router.use('/', require('./dashboard'));
router.use('/users', require('./users'));
router.use('/blog', require('./blog'));
router.use('/reddit', require('./reddit'));

module.exports = router;
```

---

### Fix 9: Thêm input sanitization

```bash
npm install sanitize-html
```

```javascript
const sanitizeHtml = require('sanitize-html');

// Helper function
function sanitize(html) {
    return sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'img']),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ['src', 'alt', 'class'],
            a: ['href', 'target', 'rel']
        }
    });
}

// Usage trong blog/ideas routes:
const content = sanitize(req.body.content);
```

---

## 5. Recommended Development Roadmap

### Phase 1 (1-2 tuần): Fix Technical Debt
- [ ] Fix hardcoded secrets
- [ ] Thêm error handling middleware
- [ ] Fix Dockerfile & docker-compose
- [ ] Thêm session store (connect-mongo)
- [ ] Thêm rate limiting
- [ ] Thêm CSRF protection
- [ ] Thêm input sanitization

### Phase 2 (2-3 tuần): Core Features
- [ ] Notification System
- [ ] Parent-Student Linking
- [ ] Student Progress Dashboard
- [ ] Daily Check-in & Streak

### Phase 3 (2-3 tuần): Engagement Features
- [ ] Achievement / Badge System
- [ ] Leaderboard
- [ ] Star Shop
- [ ] File Upload System

### Phase 4 (3-4 tuần): Advanced Features
- [ ] Homework / Assignment System
- [ ] AI Tutor Chat
- [ ] Parent Report
- [ ] WebSocket Real-time Updates

---

## 6. Testing Guide

### Setup
```bash
npm install --save-dev jest supertest
```

### package.json
```json
{
  "scripts": {
    "test": "jest --forceExit --detectOpenHandles",
    "test:watch": "jest --watch"
  }
}
```

### Example test: `tests/auth.test.js`
```javascript
const request = require('supertest');
// Cần extract app creation thành function để test

describe('Auth Routes', () => {
    test('GET /auth/login returns 200', async () => {
        const res = await request(app).get('/auth/login');
        expect(res.statusCode).toBe(200);
    });

    test('POST /auth/login with invalid credentials', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'invalid@test.com', password: 'wrong' });
        expect(res.statusCode).toBe(302);  // redirect back
    });
});
```

---

## 7. Environment Setup Checklist

### Development
```bash
# 1. Install dependencies
npm install

# 2. Start MongoDB
mongod --dbpath ./database

# 3. Copy env
cp .env.example .env
# Edit .env with your values

# 4. Start dev server
npm run dev
# → http://localhost:3000 (or PORT in .env)

# 5. Default login
# Admin: admin@starreward.com / admin123
```

### Production
```bash
# 1. Set NODE_ENV
export NODE_ENV=production

# 2. Use PM2
npm install -g pm2
pm2 start src/app.js --name star-reward

# 3. Nginx reverse proxy
# server { proxy_pass http://localhost:8080; }
```
