# Star Reward

> Nền tảng giáo dục gamification cho trẻ em (6-12 tuổi) - Hệ thống tặng sao, học tập, khám phá và blog phụ huynh.

**Version:** 2.1.0 | **Port:** 8080 (prod) / 3000 (dev) | **Language:** Vietnamese

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Express.js 4.19, Node.js 16+ |
| Database | MongoDB (Mongoose 8.2) |
| Template | Nunjucks (SSR) |
| Frontend | Bootstrap 5, Chart.js, Quill.js |
| Auth | bcryptjs + express-session + connect-mongo |
| AI | CLIProxy (Gemini / ChatGPT / Claude) |
| Reddit | snoowrap + RapidAPI |
| Security | express-rate-limit, sanitize-html |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                   │
│              Bootstrap 5 + Chart.js + Quill           │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│                 Express.js Server                     │
│                                                       │
│  Routes:                                              │
│  auth │ main │ blog │ admin │ learning │ exam         │
│  explore │ ideas │ notifications │ checkin             │
│  achievements │ shop                                  │
│                                                       │
│  Middleware:                                          │
│  rate-limit │ session(MongoStore) │ sanitize-html     │
│                                                       │
│  Services:                                            │
│  aiService │ redditCrawler │ directRedditCrawler      │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│                    MongoDB                            │
│  Users │ Students │ Rewards │ DailyTasks │ Tasks      │
│  BlogPosts │ RedditPosts │ Notifications              │
│  CheckIns │ Achievements │ StudentAchievements        │
│  ShopItems │ Purchases                                │
│  Subjects │ Chapters │ Lessons │ Exams │ Questions     │
│  ExploreCategories │ ExploreActivities │ Ideas        │
└──────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
starreward/
├── src/
│   ├── app.js                    # Entry point
│   ├── models/                   # Mongoose models (12 files)
│   │   ├── User.js               # Auth (bcrypt, roles)
│   │   ├── Basic.js              # Student, Reward, DailyTask, Task
│   │   ├── Blog.js               # BlogPost + comments
│   │   ├── RedditPost.js         # Reddit content cache
│   │   ├── Learning.js           # Subject, Chapter, Lesson
│   │   ├── Exam.js               # Exam, Question, Schedule, Result
│   │   ├── Explore.js            # Category, Activity, Progress
│   │   ├── Idea.js               # Idea + AI analysis
│   │   ├── Notification.js       # Notifications (NEW)
│   │   ├── CheckIn.js            # Daily check-in + streak (NEW)
│   │   ├── Achievement.js        # Badges + rarity (NEW)
│   │   └── Shop.js               # ShopItem + Purchase (NEW)
│   ├── routes/                   # Express routes (12 files)
│   │   ├── auth.js               # Login/Register + middleware
│   │   ├── main.js               # Home, Student CRUD
│   │   ├── blog.js               # Blog + sanitization
│   │   ├── admin.js              # Admin panel (41KB)
│   │   ├── learning.js           # Learning hub
│   │   ├── exam.js               # Exams
│   │   ├── explore.js            # Activities
│   │   ├── ideas.js              # Ideas + AI
│   │   ├── notifications.js      # Notification API (NEW)
│   │   ├── checkin.js            # Check-in + streak bonus (NEW)
│   │   ├── achievements.js       # Badge system + auto-check (NEW)
│   │   └── shop.js               # Star shop + purchases (NEW)
│   ├── services/
│   │   ├── aiService.js          # CLIProxy AI integration
│   │   ├── redditCrawler.js      # Reddit via snoowrap
│   │   └── directRedditCrawler.js
│   └── utils/
│       └── seed.js               # Auto-seed on first run
│
├── app/
│   ├── static/css/, js/          # Frontend assets
│   └── templates/                # Nunjucks HTML
│       ├── base.html             # Main layout
│       ├── admin/ (13 files)     # Admin panel
│       ├── auth/                 # Login, Register
│       ├── blog/                 # Blog
│       ├── exam/                 # Exams
│       ├── explore/              # Activities
│       ├── ideas/                # Ideas
│       ├── learning/             # Learning
│       ├── notifications/        # Notifications (NEW)
│       ├── checkin/              # Daily check-in (NEW)
│       ├── achievements/         # Badges (NEW)
│       ├── shop/                 # Star shop (NEW)
│       └── errors/               # 404, 500 (NEW)
│
├── docs/
│   ├── TECHNICAL_DOCUMENTATION.md
│   └── FEATURE_DEVELOPMENT_GUIDE.md
├── docker-compose.yml
├── Dockerfile
├── .env
└── package.json
```

---

## Features

### Core
| Feature | Route | Description |
|---------|-------|-------------|
| Star Rewards | `/student/:id` | Thưởng/phạt sao, daily tasks |
| Learning Hub | `/learning` | Toán, Tiếng Anh, Tiếng Việt |
| Exams | `/exam` | Thi trắc nghiệm online |
| Explore | `/explore` | Games, puzzles, crafts, stories |
| Ideas | `/ideas` | Chia sẻ ý tưởng + AI phân tích |
| Blog | `/blog` | Blog phụ huynh + Reddit import |

### Gamification (NEW)
| Feature | Route | Description |
|---------|-------|-------------|
| Daily Check-in | `/checkin/:studentId` | Điểm danh + streak bonus (7d=+5, 14d=+10, 30d=+25 sao) |
| Achievements | `/achievements/:studentId` | 19 huy hiệu, 5 rarity levels, auto-award |
| Star Shop | `/shop/:studentId` | 15 vật phẩm đổi sao (game, kem, công viên...) |
| Notifications | `/notifications/:studentId` | Thông báo tự động khi nhận sao, huy hiệu, mua hàng |

### Admin Panel
| Feature | Route |
|---------|-------|
| Dashboard | `/admin/dashboard` |
| User CRUD | `/admin/users` |
| Blog management | `/admin/blog` |
| Reddit import + AI rewrite | `/admin/reddit-manager` |

---

## Roles & Permissions

| Role | Access |
|------|--------|
| student | Learning, Exams, Explore, Ideas |
| parent | + Blog, child progress |
| teacher | + Create exams, manage students |
| admin | Full access + Admin panel |

**Middleware:** `isAuthenticated`, `isGuest`, `isAdmin`, `isTeacherOrAdmin`

---

## API Endpoints

### Auth (`/auth`)
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/login | Đăng nhập |
| POST | /auth/register | Đăng ký |
| GET | /auth/logout | Đăng xuất |

### Student & Stars (`/`)
| Method | Path | Description |
|--------|------|-------------|
| GET | / | Danh sách học sinh |
| POST | /add_student | Thêm học sinh |
| GET | /student/:id | Chi tiết + daily tasks |
| POST | /add_stars/:id | Thưởng/phạt sao |

### Gamification
| Method | Path | Description |
|--------|------|-------------|
| POST | /checkin/:studentId | Điểm danh |
| GET | /checkin/:studentId | Trang điểm danh + streak |
| GET | /achievements/:studentId | Trang huy hiệu |
| POST | /achievements/check/:studentId | Kiểm tra huy hiệu mới |
| GET | /shop/:studentId | Cửa hàng |
| POST | /shop/:studentId/buy/:itemId | Mua vật phẩm |
| GET | /notifications/api/:studentId | API thông báo (JSON) |

### Blog (`/blog`)
| Method | Path | Description |
|--------|------|-------------|
| GET | /blog | Danh sách (phân trang, lọc) |
| GET | /blog/:slug | Chi tiết bài viết |
| POST | /blog/:slug/like | Like toggle |
| POST | /blog/:slug/comment | Bình luận |

### Admin (`/admin`) - requires `isAdmin`
| Method | Path | Description |
|--------|------|-------------|
| GET | /admin/dashboard | Thống kê |
| GET/POST | /admin/users/* | CRUD users |
| GET/POST | /admin/blog/* | CRUD blog posts |
| POST | /admin/reddit/sync | Sync Reddit posts |
| POST | /admin/reddit/process | AI rewrite |

---

## Database Models

### Core
- **User** - username, email, password (bcrypt), role, lastLogin
- **Student** - name, total_stars, avatar, avatarStyle
- **Reward** - stars, reason, student (ref), is_penalty, task (ref)
- **DailyTask** - name, default_stars, description
- **Task** - student (ref), title, due_date, is_completed

### Content
- **BlogPost** - title, slug, content, author, category (10 types), status, likes, comments
- **RedditPost** - redditId, content, AI-translated fields, status
- **Subject/Chapter/Lesson** - Learning content hierarchy
- **Exam/Question/ExamSchedule** - Testing system
- **ExploreCategory/ExploreActivity** - 8 activity types
- **Idea** - title, content, AI analysis (feasibility, strengths, suggestions)

### Gamification (NEW)
- **Notification** - student, type, title, message, isRead
- **CheckIn** - student, date (unique), starsEarned, streakDay
- **Achievement** - name, icon, type (7 types), requirement, rarity (5 levels), starsBonus
- **StudentAchievement** - student + achievement (unique pair)
- **ShopItem** - name, icon, cost, category (5 types), stock
- **Purchase** - student, item, cost, status

---

## Seed Data (auto on first run)

### Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@starreward.com | admin123 |
| Student | student1@test.com | password123 |
| Parent | parent1@test.com | password123 |
| Teacher | teacher1@test.com | password123 |

### Daily Tasks (7)
Rửa bát (2), Học bài (3), Ngủ đúng giờ (2), Ăn đúng giờ (2), Dọn phòng (2), Đánh răng (1), Tập thể dục (2)

### Achievements (19)
| Type | Achievements |
|------|-------------|
| Star milestone | Ngôi Sao Mới (10), Ngôi Sao Sáng (50), Siêu Sao (100), Vua Sao (500), Huyền Thoại (1000) |
| Check-in streak | Bước Đầu (3d), Chăm Chỉ (7d), Kiên Trì (14d), Bất Khuất (30d) |
| Task completion | Người Mới (5), Xuất Sắc (20), Siêu Nhân (50) |
| Explore/Ideas/Exam | 5 more achievements |

### Shop Items (15)
| Category | Items |
|----------|-------|
| Privilege | 30p game (20), 30p YouTube (25), Nghỉ task (15), Ngủ muộn (10), Chọn bữa ăn (30) |
| Physical | Kem (15), Bánh kẹo (10), Đồ chơi (50), Sách (40) |
| Experience | Công viên (80), Xem phim (60), Picnic (100) |
| Avatar | Siêu nhân (30), Công chúa (30), Robot (45) |

### Content
- 3 Subjects (Toán, Tiếng Anh, Tiếng Việt) with chapters + lessons
- 3 Exams with questions
- 8 Explore Categories + 12 Activities

---

## Security

| Feature | Implementation |
|---------|---------------|
| Password hashing | bcryptjs (10 salt rounds) |
| Session store | connect-mongo (persistent) |
| Rate limiting | 200 req/15min (general), 10 req/15min (auth) |
| Input sanitization | sanitize-html (blog content, comments, ideas) |
| XSS protection | Nunjucks autoescape |
| RBAC | 4 roles, middleware-protected routes |
| Error handling | Global 404 + 500 handlers |
| Static cache | 7-day maxAge in production |
| Cookie | httpOnly, secure (prod), 1-day maxAge |

---

## Development

### Setup
```bash
cd "E:\Developer\Projects\Star Reward\starreward"
npm install
cp .env.example .env    # Edit with your values
```

### Run
```bash
npm run dev             # nodemon, port 3000
npm start               # production, port 8080
```

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| MONGODB_URI | mongodb://localhost:27017/star_reward_app | MongoDB |
| SESSION_SECRET | (required) | Session encryption key |
| RAPIDAPI_KEY | | Reddit API key |
| CLIPROXY_URL | http://localhost:5000 | AI proxy URL |
| CLIPROXY_API_KEY | | AI proxy key |

### Docker
```bash
docker-compose up -d    # MongoDB + Redis + App
```

### Production (PM2)
```bash
npm install -g pm2
pm2 start src/app.js --name star-reward
```

---

## Documentation

| File | Description |
|------|-------------|
| [TECHNICAL_DOCUMENTATION.md](docs/TECHNICAL_DOCUMENTATION.md) | Architecture, schema, API, security audit |
| [FEATURE_DEVELOPMENT_GUIDE.md](docs/FEATURE_DEVELOPMENT_GUIDE.md) | How to add features + roadmap |
| [ADMIN_GUIDE.md](ADMIN_GUIDE.md) | Admin panel operations |
| [AI_CLIPROXY_INTEGRATION.md](AI_CLIPROXY_INTEGRATION.md) | AI service setup |

---

## Changelog

### v2.1.0 (2026-03)
- Notification system (auto-notify on star changes, achievements, purchases)
- Daily check-in + streak bonus (7/14/30 day milestones)
- Achievement/badge system (19 achievements, 5 rarity levels, auto-award)
- Star shop (15 items across 4 categories)
- Security fixes: rate limiting, session store, input sanitization, env vars
- Error pages (404, 500)
- Fixed Dockerfile (python -> node), docker-compose (Flask -> Node)

### v2.0.0 (2026-01)
- Admin panel (user CRUD, blog management)
- Blog system with Reddit import + AI translation
- Rich text editor (Quill.js)
- Role-based access control
- Migrate from SQLite to MongoDB

### v1.0.0
- Star reward system
- Learning modules (3 subjects)
- Exam system
- Explore activities
- Ideas with AI analysis
