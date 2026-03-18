# Star Reward - Technical Documentation

> **Version:** 1.0.0
> **Last Updated:** 2026-03-04
> **Stack:** Express.js + MongoDB + Nunjucks
> **Port:** 8080 (production) / 3000 (default)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                   │
│              Bootstrap 5 + Chart.js + Quill           │
└────────────────────────┬────────────────────────────┘
                         │ HTTP
┌────────────────────────▼────────────────────────────┐
│                 Express.js Server                     │
│  ┌───────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Nunjucks  │  │ Session  │  │   Flash Messages │  │
│  │ Templates │  │ Manager  │  │   (connect-flash)│  │
│  └───────────┘  └──────────┘  └──────────────────┘  │
│                                                       │
│  ┌─────────────────── Routes ──────────────────────┐ │
│  │ auth │ main │ blog │ admin │ learning │ exam    │ │
│  │      │      │      │       │ explore  │ ideas   │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─────────── Services ──────────┐  ┌── Utils ────┐ │
│  │ aiService  │ redditCrawler    │  │   seed.js   │ │
│  │            │ directRedditCrawl│  │             │ │
│  └────────────────────────────────┘  └─────────────┘ │
└────────────────────────┬────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────▼────────────────────────────┐
│                    MongoDB                            │
│  Users │ Students │ Rewards │ Tasks │ DailyTasks     │
│  BlogPosts │ RedditPosts │ Subjects │ Chapters       │
│  Lessons │ Exams │ Questions │ ExamSchedules          │
│  ExploreCategories │ ExploreActivities │ Ideas        │
└──────────────────────────────────────────────────────┘
         │                              │
┌────────▼──────┐              ┌───────▼────────┐
│  CLIProxy AI  │              │   Reddit API   │
│ Gemini/GPT/   │              │ snoowrap/      │
│ Claude        │              │ RapidAPI       │
└───────────────┘              └────────────────┘
```

---

## 2. Directory Structure

```
starreward/
├── src/                          # Source code chính
│   ├── app.js                    # Entry point - Express server setup
│   ├── models/                   # Mongoose models
│   │   ├── Basic.js              # Student, Reward, DailyTask, Task
│   │   ├── User.js               # User authentication model
│   │   ├── Blog.js               # Blog posts + comments
│   │   ├── RedditPost.js         # Reddit content cache
│   │   ├── Learning.js           # Subject, Chapter, Lesson, Material, LearningPath
│   │   ├── Exam.js               # Exam, Question, ExamSchedule, ExamResult
│   │   ├── Explore.js            # ExploreCategory, ExploreActivity, ActivityProgress
│   │   └── Idea.js               # Idea + AI analysis schema
│   ├── routes/                   # Express route handlers
│   │   ├── auth.js               # Login/Register/Logout + middleware exports
│   │   ├── main.js               # Home, Student CRUD, Dashboard (15KB)
│   │   ├── blog.js               # Blog CRUD, like/bookmark/comment
│   │   ├── admin.js              # Admin panel - users, blog, reddit (41KB)
│   │   ├── learning.js           # Learning hub routes
│   │   ├── exam.js               # Exam taking/submission
│   │   ├── explore.js            # Explore activities
│   │   └── ideas.js              # Ideas CRUD + AI analysis (17KB)
│   ├── services/                 # Business logic services
│   │   ├── aiService.js          # CLIProxy AI integration (280 lines)
│   │   ├── redditCrawler.js      # Reddit via snoowrap (580 lines)
│   │   └── directRedditCrawler.js # Reddit direct OAuth (360 lines)
│   └── utils/
│       └── seed.js               # Auto-seed data on first run (930 lines)
│
├── app/                          # Frontend assets
│   ├── static/
│   │   ├── css/
│   │   │   ├── custom.css        # Custom styles
│   │   │   └── avatars.css       # Avatar system styles
│   │   └── js/
│   │       └── avatars.js        # Avatar selection logic
│   └── templates/                # Nunjucks HTML templates
│       ├── base.html             # Main layout (navbar, sidebar, footer)
│       ├── admin/                # 13 admin templates
│       ├── auth/                 # Login, Register
│       ├── blog/                 # Blog list, detail, create
│       ├── exam/                 # Exam list, detail, take, result
│       ├── explore/              # Explore hub, category, activity, play
│       ├── ideas/                # Ideas list, create, detail
│       └── learning/             # Learning hub, subject, chapter, lesson
│
├── config/                       # Configuration files
├── docker/                       # Docker build contexts
│   ├── mongodb/                  # MongoDB Dockerfile
│   └── redis/                    # Redis Dockerfile
├── legacy_python/                # Old Python/Flask implementation
├── legacy_app_mongo/             # Old Mongoose version
├── tests/                        # Test files
├── scripts/                      # Utility scripts
├── docs/                         # Documentation
│
├── .env                          # Environment variables
├── docker-compose.yml            # Docker orchestration
├── Dockerfile                    # App container (NOTE: uses python base)
├── package.json                  # Node.js dependencies
└── package-lock.json
```

---

## 3. Database Models

### 3.1 User (`src/models/User.js`)

| Field       | Type     | Constraints                     |
|-------------|----------|---------------------------------|
| username    | String   | unique, 3-30 chars, required    |
| email       | String   | unique, lowercase, required     |
| password    | String   | hashed bcrypt, min 6 chars      |
| fullName    | String   | max 100 chars, required         |
| avatar      | String   | nullable                        |
| role        | String   | enum: student/parent/teacher/admin |
| createdAt   | Date     | auto                            |
| lastLogin   | Date     | nullable                        |

**Methods:**
- `pre('save')` → Hash password with bcryptjs (salt rounds: 10)
- `comparePassword(candidate)` → bcrypt compare

### 3.2 Student / Reward System (`src/models/Basic.js`)

**Student:**
| Field       | Type     | Default    |
|-------------|----------|------------|
| name        | String   | required   |
| total_stars | Number   | 0          |
| avatar      | String   | null       |
| avatarStyle | String   | 'anime' (anime/ghibli/custom) |

**Reward:**
| Field      | Type       | Description         |
|------------|------------|---------------------|
| stars      | Number     | required            |
| reason     | String     | max 200 chars       |
| date       | Date       | auto                |
| student    | ObjectId   | ref Student         |
| is_penalty | Boolean    | false = reward      |
| task       | ObjectId   | ref DailyTask       |

**DailyTask:**
| Field         | Type   |
|---------------|--------|
| name          | String |
| default_stars | Number |
| description   | String |

**Task:**
| Field        | Type      |
|--------------|-----------|
| student      | ObjectId  |
| title        | String    |
| description  | String    |
| due_date     | Date      |
| is_completed | Boolean   |

### 3.3 Blog (`src/models/Blog.js`)

| Field          | Type     | Notes                                |
|----------------|----------|--------------------------------------|
| title          | String   | required                             |
| slug           | String   | unique, auto-generated               |
| excerpt        | String   | max 300 chars                        |
| content        | String   | HTML, required                       |
| author         | Object   | {name, email, role, avatar}          |
| category       | String   | 10 categories (education, psychology...) |
| tags           | [String] | array                                |
| ageRange       | Object   | {min, max}                           |
| coverImage     | String   | URL                                  |
| likes/comments/bookmarks | [ObjectId]/[Object]/[ObjectId] | engagement |
| status         | String   | draft/pending/published/featured/archived |
| seo            | Object   | {metaTitle, metaDescription, keywords} |
| readingTime    | Number   | auto-calculated                      |

### 3.4 Reddit Post (`src/models/RedditPost.js`)

| Field              | Type    | Notes                  |
|--------------------|---------|------------------------|
| redditId           | String  | unique                 |
| title/content/url  | String  | original Reddit data   |
| subreddit/author   | String  |                        |
| score/numComments  | Number  |                        |
| status             | String  | fetched/processing/published/rejected |
| aiProcessed        | Boolean |                        |
| vietnameseTitle    | String  | AI-translated          |
| vietnameseContent  | String  | AI-translated          |
| suggestedCategory  | String  |                        |
| suggestedTags      | [String]|                        |

### 3.5 Learning (`src/models/Learning.js`)

- **Subject:** name, description, icon
- **Chapter:** subject (ref), title, order
- **Lesson:** chapter (ref), title, content (markdown/HTML), video_url
- **Material:** lesson (ref), title, file_path, file_type
- **LearningPath:** title, description, student (optional ref)

### 3.6 Exam (`src/models/Exam.js`)

- **Exam:** title, description, duration_minutes, subject (ref)
- **Question:** exam (ref), content, question_type, points, options[], correct_answer
- **ExamSchedule:** exam, student, start_time, end_time, is_completed, score
- **ExamResult:** schedule (ref), answers (Map), evaluated_at

### 3.7 Explore (`src/models/Explore.js`)

- **ExploreCategory:** name, slug, description, icon, color, order, isActive
- **ExploreActivity:** title, slug, type (game/story/video/quiz/craft/music/puzzle/experiment), difficulty, ageRange, starsReward, content, instructions, materials
- **ActivityProgress:** user, activity, score, starsEarned, timeSpent, attempts

### 3.8 Idea (`src/models/Idea.js`)

- **Idea:** title, content, summary, student, category (10 types), tags
- **AI Analysis (embedded):** feasibility (score/level/summary), strengths, challenges, suggestions, resources
- **Engagement:** likes, comments, viewCount

---

## 4. API Routes

### 4.1 Authentication (`/auth`)

| Method | Path              | Middleware  | Description            |
|--------|-------------------|-------------|------------------------|
| GET    | /auth/login       | isGuest     | Trang đăng nhập        |
| POST   | /auth/login       | isGuest     | Xử lý đăng nhập        |
| GET    | /auth/register    | isGuest     | Trang đăng ký          |
| POST   | /auth/register    | isGuest     | Xử lý đăng ký          |
| GET    | /auth/logout      | -           | Đăng xuất (destroy session) |

### 4.2 Main (`/`)

| Method | Path                    | Description                |
|--------|-------------------------|----------------------------|
| GET    | /                       | Trang chủ / danh sách học sinh |
| POST   | /add_student            | Thêm học sinh              |
| GET    | /student/:id            | Chi tiết học sinh          |
| POST   | /add_stars/:id          | Thưởng/phạt sao            |
| POST   | /add_task/:id           | Tạo task cho học sinh      |
| GET    | /dashboard              | Dashboard người dùng       |

### 4.3 Blog (`/blog`)

| Method | Path                    | Description                |
|--------|-------------------------|----------------------------|
| GET    | /blog                   | Danh sách bài viết (phân trang, lọc) |
| GET    | /blog/write             | Trang viết bài             |
| POST   | /blog/write             | Tạo bài viết               |
| GET    | /blog/:slug             | Chi tiết bài viết          |
| POST   | /blog/:slug/like        | Like/unlike                |
| POST   | /blog/:slug/bookmark    | Bookmark toggle            |
| POST   | /blog/:slug/comment     | Thêm bình luận             |
| POST   | /blog/:slug/share       | Tăng lượt share            |
| POST   | /blog/:slug/delete      | Xóa bài viết               |
| GET    | /blog/api/posts         | API JSON endpoint          |

### 4.4 Admin (`/admin`)

| Method | Path                              | Description                  |
|--------|-----------------------------------|------------------------------|
| GET    | /admin/dashboard                  | Dashboard thống kê           |
| GET    | /admin/users                      | Quản lý users (phân trang)   |
| GET    | /admin/users/:id                  | Chi tiết user                |
| POST   | /admin/users/:id/edit             | Cập nhật user                |
| POST   | /admin/users/:id/delete           | Xóa user                    |
| POST   | /admin/users/create               | Tạo user mới                 |
| POST   | /admin/users/:id/reset-password   | Reset mật khẩu              |
| GET    | /admin/blog                       | Blog dashboard               |
| GET    | /admin/blog/posts                 | Danh sách blog posts         |
| POST   | /admin/blog/create                | Tạo blog post                |
| POST   | /admin/blog/:id/edit              | Sửa blog post                |
| POST   | /admin/blog/:id/delete            | Xóa blog post                |
| GET    | /admin/blog/import-reddit         | Import từ Reddit             |
| POST   | /admin/blog/import-reddit         | Xử lý import Reddit          |
| GET    | /admin/reddit-manager             | Quản lý Reddit content       |
| POST   | /admin/reddit/sync                | Sync Reddit posts            |
| POST   | /admin/reddit/process             | AI rewrite Reddit posts      |

### 4.5 Learning (`/learning`)

| Method | Path                              | Description            |
|--------|------------------------------------|------------------------|
| GET    | /learning                          | Hub môn học            |
| GET    | /learning/:subject_id              | Chương của môn học     |
| GET    | /learning/:chapter_id/lessons      | Bài học trong chương   |
| GET    | /learning/lesson/:id               | Xem bài học            |

### 4.6 Exam (`/exam`)

| Method | Path                | Description        |
|--------|---------------------|--------------------|
| GET    | /exam               | Danh sách bài thi  |
| GET    | /exam/:id           | Chi tiết bài thi   |
| POST   | /exam/:id/take      | Bắt đầu làm bài   |
| POST   | /exam/:id/submit    | Nộp bài            |
| GET    | /exam/:id/result    | Xem kết quả        |

### 4.7 Explore (`/explore`)

| Method | Path                          | Description          |
|--------|-------------------------------|----------------------|
| GET    | /explore                      | Hub khám phá         |
| GET    | /explore/:category            | Activities theo loại |
| GET    | /explore/activity/:id         | Chi tiết activity    |
| POST   | /explore/activity/:id/play    | Chơi/tham gia        |

### 4.8 Ideas (`/ideas`)

| Method | Path                      | Description          |
|--------|---------------------------|----------------------|
| GET    | /ideas                    | Danh sách ý tưởng   |
| GET    | /ideas/create             | Trang tạo ý tưởng   |
| POST   | /ideas/create             | Tạo ý tưởng         |
| GET    | /ideas/:id                | Chi tiết ý tưởng    |
| POST   | /ideas/:id/like           | Like ý tưởng        |
| POST   | /ideas/:id/comment        | Bình luận            |
| POST   | /ideas/:id/ai-analyze     | AI phân tích         |

---

## 5. Authentication & Authorization

### Session-based Auth Flow

```
[Login Form] → POST /auth/login
  → Tìm user bằng email
  → bcrypt.compare(password)
  → Lưu vào req.session.user = { id, username, email, fullName, role, avatar }
  → Redirect to /

[Register] → POST /auth/register
  → Validate: password match, unique username, unique email
  → bcrypt.hash(password, 10)
  → Save User → Redirect to /auth/login

[Logout] → GET /auth/logout
  → req.session.destroy()
  → Redirect to /auth/login
```

### Middleware (exported from `src/routes/auth.js`)

| Middleware         | Logic                                           |
|--------------------|-------------------------------------------------|
| `isAuthenticated`  | `req.session.user` tồn tại → next()            |
| `isGuest`          | `req.session.user` KHÔNG tồn tại → next()      |
| `isAdmin`          | `req.session.user.role === 'admin'` → next()   |
| `isTeacherOrAdmin` | role === 'admin' \|\| role === 'teacher'        |

### Usage trong routes:
```javascript
const { isAuthenticated, isAdmin } = require('./auth');
router.get('/admin/dashboard', isAdmin, (req, res) => { ... });
```

---

## 6. External Services

### 6.1 AI Service (CLIProxy)

**File:** `src/services/aiService.js`

**Config:**
```
CLIPROXY_URL=http://localhost:5000
CLIPROXY_API_KEY=<key>
```

**Supported models:** gemini, chatgpt, claude

**API Call:**
```
POST ${CLIPROXY_URL}/api/chat
Headers: { Authorization: Bearer <key> }
Body: { model, messages[], temperature, response_format }
```

**Chức năng:**
1. `rewritePost(post, model, options)` → Dịch Reddit post sang tiếng Việt
2. `rewriteBatch(posts, model, options, onProgress)` → Dịch hàng loạt (delay 1s/post)
3. `parseResponse()` → Xử lý response từ OpenAI/Claude/Gemini format
4. `generateFallbackContent()` → Nội dung fallback khi AI fail

### 6.2 Reddit Crawler

**File:** `src/services/redditCrawler.js` (snoowrap) + `directRedditCrawler.js` (direct OAuth)

**Config:**
```
RAPIDAPI_KEY=<key>                    # RapidAPI fallback
REDDIT_CLIENT_ID=<id>                 # Direct OAuth
REDDIT_CLIENT_SECRET=<secret>
REDDIT_REFRESH_TOKEN=<token>
REDDIT_USER_AGENT=StarReward/1.0
```

**Chức năng:**
1. Fetch posts từ subreddits (education, parenting, etc.)
2. Cache vào MongoDB (RedditPost model)
3. Filter theo score/comments
4. AI rewrite sang tiếng Việt → publish thành BlogPost

---

## 7. Seed Data (Auto-generated)

**File:** `src/utils/seed.js` - Chạy tự động khi khởi động lần đầu

### Default Accounts

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@starreward.com   | admin123    |
| Student | student1@test.com      | password123 |
| Parent  | parent1@test.com       | password123 |
| Teacher | teacher1@test.com      | password123 |

### Default Daily Tasks

| Task          | Stars |
|---------------|-------|
| Rửa bát       | 2     |
| Học bài        | 3     |
| Ngủ đúng giờ   | 2     |
| Ăn đúng giờ    | 2     |
| Dọn phòng      | 2     |
| Đánh răng      | 1     |
| Tập thể dục    | 2     |

### Seed Content
- 3 Subjects: Toán Học, Tiếng Anh, Tiếng Việt (với chapters + lessons)
- 3 Exams với câu hỏi mẫu
- 8 Explore Categories + 12 Activities
- Avatar styles: anime, ghibli, custom

---

## 8. Security

### Đã implement:
- Password hashing: bcryptjs (10 salt rounds)
- Session-based auth: express-session
- RBAC: 4 roles (student/parent/teacher/admin)
- Nunjucks autoescape: XSS protection
- Admin self-delete protection

### Cần cải thiện:
1. **Session secret hardcoded** trong `app.js` (dòng 28): `secret: 'secret_key'` → Nên dùng `process.env.SESSION_SECRET`
2. **MongoDB connection string hardcoded** (dòng 16) → Nên dùng `process.env.MONGODB_URI`
3. **Không có CSRF protection** → Cần thêm `csurf` middleware
4. **Không có rate limiting** → Cần thêm `express-rate-limit`
5. **Không có input sanitization** cho HTML content (blog, ideas)
6. **Session store**: Đang dùng memory store (default) → Nên dùng `connect-mongo` cho production
7. **Dockerfile sai base image**: Đang dùng `python:3.11-slim` cho Node.js app
8. **Docker-compose**: Vẫn reference FLASK_ENV → Cần update thành NODE_ENV
9. **API key exposed trong .env** (RAPIDAPI_KEY) → Cần đưa vào .gitignore nếu chưa

---

## 9. Known Issues & Technical Debt

### Critical
1. **Hardcoded secrets** trong `app.js` (session secret, MongoDB URI)
2. **Dockerfile không đúng** - dùng Python image cho Node.js app
3. **Docker-compose outdated** - reference Flask variables

### Medium
4. **Thiếu error handling global** - không có error middleware
5. **Thiếu validation** - nhiều routes không validate input đầy đủ
6. **Blog content không sanitize** - có thể bị XSS qua content HTML
7. **Admin route quá lớn** (`admin.js` = 41KB) - cần tách nhỏ
8. **Ideas route lớn** (`ideas.js` = 17KB)
9. **Seed file lớn** (`seed.js` = 930 lines) - khó maintain

### Low
10. **Không có test** - `npm test` chỉ echo error
11. **Thiếu logging** - chỉ console.log/console.error
12. **Không có API documentation** (Swagger/OpenAPI)
13. **Static files** không có cache headers / CDN
14. **Moment.js** deprecated → nên migrate sang `dayjs`

---

## 10. Deployment

### Development
```bash
cd "E:\Developer\Projects\Star Reward\starreward"
npm install
npm run dev    # nodemon auto-reload, port 3000
```

### Production (Docker)
```bash
docker-compose up -d    # MongoDB + Redis + App
# NOTE: Cần fix Dockerfile (đổi base image sang node:18-slim)
```

### Production (Manual)
```bash
npm start    # node src/app.js
# Cần: MongoDB running, .env configured
```

### Required Services
- **MongoDB** 4.x+: `mongodb://localhost:27017/star_reward_app`
- **Redis** (optional): chỉ dùng trong Docker, app chưa dùng trực tiếp
- **CLIProxy** (optional): cho AI features: `http://localhost:5000`
