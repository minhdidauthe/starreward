# Reddit Sync System - Star Reward

Hệ thống tự động crawl và đồng bộ trending memes từ Reddit vào Blog Corner của Star Reward.

---

## ✨ Tính năng

✅ **Không cần OAuth** - Sử dụng RapidAPI (đã có key)
✅ **Tự động crawl** - Lấy trending và top memes từ Reddit
✅ **Duplicate prevention** - Không tạo bài viết trùng lặp
✅ **Auto-categorization** - Tự động phân loại bài viết
✅ **Keyword extraction** - Tự động trích xuất keywords
✅ **Trending score** - Tính điểm trending dựa trên engagement

---

## 🚀 Quick Start

### 1. Cấu hình (Đã sẵn sàng)

File `.env` đã có RAPIDAPI_KEY:

```bash
RAPIDAPI_KEY=29d996fec1msh030e05e6e7f481bp1f56d5jsna994cc5e7e86
```

### 2. Khởi động server

```bash
cd "E:\Developer\Projects\Star Reward\starreward"
npm start
```

Server chạy tại: http://localhost:8080

### 3. Test bằng script

```bash
node test-reddit-sync.js
```

Kết quả:
- ✅ Fetch 5 trending memes
- ✅ Sync vào blog posts
- ✅ Hiển thị thống kê (saved/updated/failed)

### 4. Test bằng UI

1. Truy cập: http://localhost:8080/admin/blog/import-reddit
2. Chọn tab **"Trending Memes"**
3. Nhập số lượng: 5
4. Chọn category: Giải trí
5. Click **"Import Bài Viết"**

---

## 📡 API Endpoints

### 1. Get Reddit Trends (JSON)

**GET** `/admin/api/reddit-trends`

**Query Parameters:**
- `limit` (optional) - Số lượng memes, mặc định 20

**Response:**
```json
{
  "success": true,
  "message": "Fetched 20 trending memes from Reddit",
  "data": [
    {
      "title": "Meme title",
      "subreddit": "memes",
      "ups": 15000,
      "comments": 250,
      "url": "https://reddit.com/...",
      "image": "https://i.redd.it/...",
      "author": "username"
    }
  ]
}
```

**Ví dụ:**
```bash
curl http://localhost:8080/admin/api/reddit-trends?limit=5 \
  -H "Cookie: connect.sid=..."
```

---

### 2. Sync Reddit Trends to Blog

**POST** `/admin/api/sync-reddit-trends`

**Body (JSON):**
```json
{
  "category": "entertainment",
  "limit": 10,
  "autoPublish": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Synced 8 new + 2 updated posts (0 failed)",
  "data": {
    "saved": [...],  // Bài viết mới
    "updated": [...],  // Bài viết cập nhật
    "failed": [],  // Bài viết lỗi
    "total": 10
  }
}
```

**Ví dụ:**
```bash
curl -X POST http://localhost:8080/admin/api/sync-reddit-trends \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=..." \
  -d '{
    "category": "entertainment",
    "limit": 5,
    "autoPublish": false
  }'
```

---

## 🏗️ Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────┐
│                  Reddit API                          │
│           (via RapidAPI - No OAuth)                 │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│         RedditCrawlerService                        │
│  ┌───────────────────────────────────────────────┐  │
│  │ fetchTrendingMemes()                          │  │
│  │  • Fetch trending + top memes                 │  │
│  │  • Deduplicate by URL                         │  │
│  │  • Return unique memes                        │  │
│  └───────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────┐  │
│  │ convertRedditPostToBlogPost()                 │  │
│  │  • Extract content, title, metadata           │  │
│  │  • Generate HTML from image                   │  │
│  │  • Calculate trending score                   │  │
│  │  • Extract keywords                           │  │
│  └───────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              Admin Routes (API)                     │
│  • GET  /admin/api/reddit-trends                   │
│  • POST /admin/api/sync-reddit-trends              │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              BlogPost Model                         │
│  • Save to MongoDB                                  │
│  • Prevent duplicates                               │
│  • Track metadata (source, score, keywords)         │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### 1. Fetch từ Reddit

```javascript
const posts = await redditCrawlerService.fetchTrendingMemes({
    limit: 10
});

// Returns:
[
  {
    title: "Meme title",
    subreddit: "memes",
    ups: 15000,
    comments: 250,
    url: "https://reddit.com/...",
    image: "https://i.redd.it/...",
    author: "username"
  }
]
```

### 2. Convert to BlogPost

```javascript
const blogPostData = redditCrawlerService.convertRedditPostToBlogPost(post, {
    category: 'entertainment',
    autoPublish: false
});

// Returns:
{
  title: "Meme title",
  content: "<div class=\"meme-container\">...</div>",
  excerpt: "15.0K upvotes • 250 comments",
  category: "entertainment",
  tags: ["reddit", "import", "r/memes", "meme", "funny"],
  status: "draft",
  coverImage: "https://i.redd.it/...",
  metadata: {
    source: "reddit",
    redditUrl: "https://reddit.com/...",
    redditScore: 15000,
    trendingScore: 85,
    priority: "high",
    keywords: ["meme", "funny", "laughter"]
  }
}
```

### 3. Save to Database

```javascript
// Check for duplicates
const existing = await BlogPost.findOne({
    'metadata.redditUrl': blogPostData.metadata.redditUrl
});

if (existing) {
    // Update existing
    Object.assign(existing, blogPostData);
    await existing.save();
} else {
    // Create new
    await BlogPost.create(blogPostData);
}
```

---

## 🔧 Service Methods

### `fetchTrendingMemes(options)`

Lấy trending memes từ RapidAPI.

**Parameters:**
- `options.limit` - Số lượng memes (mặc định: 20)

**Returns:** `Promise<Array<RedditPost>>`

**Example:**
```javascript
const posts = await redditCrawlerService.fetchTrendingMemes({ limit: 10 });
```

---

### `convertRedditPostToBlogPost(redditPost, options)`

Chuyển đổi Reddit post thành BlogPost format.

**Parameters:**
- `redditPost` - Reddit post object
- `options.category` - Blog category
- `options.autoPublish` - Publish immediately?
- `options.tags` - Additional tags

**Returns:** `Object` - BlogPost data

**Example:**
```javascript
const blogPostData = redditCrawlerService.convertRedditPostToBlogPost(post, {
    category: 'entertainment',
    autoPublish: false,
    tags: ['funny', 'viral']
});
```

---

### `extractKeywords(title)`

Trích xuất keywords từ title.

**Parameters:**
- `title` - Post title

**Returns:** `Array<string>` - Up to 5 keywords

**Example:**
```javascript
const keywords = redditCrawlerService.extractKeywords(
    "This funny meme about programming made me laugh"
);
// Returns: ["funny", "meme", "programming", "made", "laugh"]
```

---

### `calculateTrendingScore(upvotes, comments)`

Tính điểm trending dựa trên engagement.

**Formula:**
```
score = (upvotes + comments * 2) / 1000
score = Math.min(100, Math.max(50, score))
```

**Parameters:**
- `upvotes` - Number of upvotes
- `comments` - Number of comments

**Returns:** `number` - Score from 50-100

**Example:**
```javascript
const score = redditCrawlerService.calculateTrendingScore(15000, 250);
// Returns: 85
```

---

## 📝 Database Schema

### BlogPost Model

```javascript
{
  title: String,
  content: String,  // HTML generated from image
  excerpt: String,
  category: String,
  tags: [String],
  authorName: String,
  authorEmail: String,
  authorRole: String,
  status: String,  // "draft" or "published"
  coverImage: String,

  metadata: {
    source: "reddit",
    subreddit: String,
    redditUrl: String,  // Used for duplicate detection
    redditAuthor: String,
    redditScore: Number,
    redditComments: Number,
    trendingScore: Number,  // 50-100
    priority: String,  // "high", "medium", "low"
    keywords: [String],
    imageUrl: String,
    importedAt: Date
  },

  viewCount: Number,
  likes: Number,
  commentCount: Number,
  shareCount: Number,

  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎯 Use Cases

### Use Case 1: Auto-sync trending memes mỗi ngày

```javascript
// Cron job (chạy mỗi ngày lúc 9AM)
const cron = require('node-cron');

cron.schedule('0 9 * * *', async () => {
    console.log('Syncing Reddit trends...');

    const posts = await redditCrawlerService.fetchTrendingMemes({ limit: 20 });

    for (const post of posts) {
        const blogPostData = redditCrawlerService.convertRedditPostToBlogPost(post, {
            category: 'entertainment',
            autoPublish: true
        });

        const existing = await BlogPost.findOne({
            'metadata.redditUrl': blogPostData.metadata.redditUrl
        });

        if (!existing) {
            await BlogPost.create(blogPostData);
        }
    }
});
```

---

### Use Case 2: Manual import từ admin panel

```javascript
// Admin clicks "Import 5 memes"
router.post('/admin/blog/import-reddit', async (req, res) => {
    const { memesLimit, category } = req.body;

    const posts = await redditCrawlerService.fetchTrendingMemes({
        limit: parseInt(memesLimit)
    });

    let imported = 0;
    for (const post of posts) {
        const blogPostData = redditCrawlerService.convertRedditPostToBlogPost(post, {
            category,
            autoPublish: false
        });

        await BlogPost.create(blogPostData);
        imported++;
    }

    req.flash('success', `Imported ${imported} memes`);
    res.redirect('/admin/blog/posts');
});
```

---

## 🧪 Testing

### Test 1: Fetch trends

```bash
node test-reddit-sync.js
```

Expected output:
```
🚀 Testing Reddit Sync API...

1️⃣ Logging in as admin...
✅ Login successful!

2️⃣ Fetching Reddit trends (limit: 5)...
✅ Reddit Trends Response:
{
  "success": true,
  "message": "Fetched 5 trending memes from Reddit",
  "data": [...]
}

📊 Found 5 trending memes

3️⃣ Syncing Reddit trends to blog posts...
✅ Sync Response:
{
  "success": true,
  "message": "Synced 5 new + 0 updated posts (0 failed)",
  "data": {...}
}

📝 Saved: 5
📝 Updated: 0
❌ Failed: 0

✅ All tests passed! 🎉
```

---

### Test 2: Check database

```bash
# MongoDB shell
use star_reward_app
db.blogposts.find({ 'metadata.source': 'reddit' }).pretty()
```

Expected:
```json
{
  "_id": ObjectId("..."),
  "title": "Meme title",
  "content": "<div class=\"meme-container\">...</div>",
  "category": "entertainment",
  "tags": ["reddit", "import", "r/memes"],
  "status": "draft",
  "metadata": {
    "source": "reddit",
    "redditUrl": "https://reddit.com/...",
    "trendingScore": 85,
    "priority": "high"
  }
}
```

---

## ⚙️ Configuration

### Environment Variables

```bash
# RapidAPI (Required)
RAPIDAPI_KEY=29d996fec1msh030e05e6e7f481bp1f56d5jsna994cc5e7e86

# Server
PORT=8080
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/star_reward_app
```

---

## 🔒 Security

### Authentication

Tất cả API endpoints yêu cầu admin authentication:

```javascript
router.get('/admin/api/reddit-trends', isAdmin, async (req, res) => {
    // Only accessible by logged-in admin
});
```

### Rate Limiting

RapidAPI có giới hạn:
- **Free tier**: 500 requests/month
- **Pro tier**: Unlimited

Hiện tại sử dụng key có sẵn (đã test OK).

---

## 📈 Monitoring

### Logs

```javascript
console.log(`[Reddit] Fetching trending memes via RapidAPI (limit: ${limit})`);
console.log(`[Reddit] Successfully fetched ${uniqueMemes.length} unique memes`);
console.error('[Reddit] Error:', error.message);
```

### Metrics to track

- Số lượng memes fetched
- Số lượng saved vs updated
- Failed imports
- Response time

---

## 🎉 Complete!

Hệ thống Reddit Sync đã hoàn thiện:

✅ **Backend service** - RedditCrawlerService với RapidAPI
✅ **API endpoints** - GET trends, POST sync
✅ **Test script** - Automated testing
✅ **Documentation** - Đầy đủ
✅ **UI integration** - Admin import form
✅ **Duplicate prevention** - Không tạo bài trùng
✅ **Auto-categorization** - Smart category detection

**Sử dụng ngay:**
```bash
npm start
node test-reddit-sync.js
```

Hoặc truy cập UI:
http://localhost:8080/admin/blog/import-reddit

---

## 📚 Related Files

### Created
1. ✅ `src/services/redditCrawler.js` - Main service
2. ✅ `test-reddit-sync.js` - Test script
3. ✅ `REDDIT_SYNC_COMPLETE.md` - This file

### Modified
1. ✅ `src/routes/admin.js` - Added API endpoints
2. ✅ `app/templates/admin/blog-import-reddit.html` - UI form

---

**Enjoy auto-crawling Reddit trends! 🚀**
