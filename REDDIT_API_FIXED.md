# ✅ Reddit Manager - Fixed & Working

**Date**: 2026-01-24
**Status**: 🟢 All Issues Resolved
**Server**: http://localhost:8080
**PID**: 106284

---

## 🐛 Issues Fixed

### Issue #1: Missing Template Extension
**Error**: "No default engine was specified and no extension was provided"

**Fix**: Added `.html` extension to render call
```javascript
res.render('admin/reddit-manager.html', {...})
```

**File**: [src/routes/admin.js:960](src/routes/admin.js#L960)

---

### Issue #2: Wrong Layout Template
**Error**: "template not found: admin/layout.html"

**Fix**: Changed extends to correct base template
```nunjucks
{% extends "base.html" %}
```

**File**: [app/templates/admin/reddit-manager.html:1](app/templates/admin/reddit-manager.html#L1)

---

### Issue #3: Duplicate Routes ✅ NEW FIX
**Problem**: Routes `/api/reddit-direct` và `/api/sync-reddit-direct` bị duplicate 2 lần trong admin.js (line 854 và line 1132)

**Impact**: Gây conflict, API có thể không hoạt động đúng

**Fix**: Xóa duplicate routes từ line 1131-1234

**File**: [src/routes/admin.js](src/routes/admin.js)

**Lines removed**: 104 dòng duplicate code

---

## ✅ Reddit API Test Results

```bash
🧪 Testing Reddit Direct Crawler API...

Test 1: Fetching 5 posts from r/parenting (hot)
✅ Success: Fetched 3 posts
   Sample: "Privileged child?"

Test 2: Fetching 3 posts from r/education (new)
✅ Success: Fetched 3 posts

Test 3: Fetching 3 posts from r/Teachers (top/week)
✅ Success: Fetched 3 posts

🎉 All tests passed!

📊 Summary:
   r/parenting: 3 posts
   r/education: 3 posts
   r/Teachers: 3 posts
   Total: 9 posts
```

**Test File**: [test-reddit-api.js](test-reddit-api.js)

---

## 🎨 Reddit Manager Card UI

### Access URL:
```
http://localhost:8080/admin/reddit-manager
```

### Features:

#### 1. Fetch Controls
- **Subreddit Selector**: r/parenting, r/education, r/Teachers, r/homeschool, etc.
- **Sort Method**: hot, new, top, rising
- **Limit**: 10, 20, 30, 50 posts
- **AI Model**: Gemini, ChatGPT, Claude

#### 2. Card Grid Layout
- Beautiful cards with images
- Trending score badges
- Reddit metadata (upvotes, comments)
- Click to select

#### 3. AI Rewrite & Publish
- Process with AI
- Preview Vietnamese content
- Edit before publish
- One-click publish

---

## 📡 API Endpoints

### 1. GET `/admin/api/reddit-direct`
Fetch Reddit posts without authentication needed (public JSON API)

**Parameters**:
- `subreddit` - Subreddit name (default: parenting)
- `sort` - hot|new|top|rising (default: hot)
- `limit` - Number of posts (default: 10)
- `timeframe` - For 'top' sort: day|week|month|year|all

**Example**:
```
GET /admin/api/reddit-direct?subreddit=parenting&sort=hot&limit=20
```

**Response**:
```json
{
  "success": true,
  "message": "Fetched 20 posts from r/parenting",
  "data": [
    {
      "id": "abc123",
      "title": "Post title",
      "content": "Post content...",
      "url": "https://reddit.com/...",
      "score": 1500,
      "num_comments": 250,
      "subreddit": "parenting",
      "image": "https://i.redd.it/..."
    }
  ]
}
```

### 2. POST `/admin/api/reddit-ai-rewrite`
Rewrite posts to Vietnamese using AI (CLIProxy or direct AI APIs)

**Body**:
```json
{
  "posts": [...],
  "aiModel": "gemini"
}
```

**Response**:
```json
{
  "success": true,
  "results": [
    {
      "success": true,
      "vietnameseTitle": "Tiêu đề tiếng Việt",
      "vietnameseContent": "<p>Nội dung...</p>",
      "category": "experience",
      "tags": ["reddit", "parenting"]
    }
  ]
}
```

### 3. POST `/admin/api/reddit-publish`
Publish rewritten posts to blog

**Body**:
```json
{
  "posts": [...]
}
```

---

## 🚀 How to Use

### Step 1: Access Reddit Manager
1. Open browser
2. Go to http://localhost:8080
3. Login as admin
4. Navigate to http://localhost:8080/admin/reddit-manager

### Step 2: Fetch Reddit Trends
1. Select subreddit (e.g., r/parenting)
2. Choose sort method (e.g., hot)
3. Set limit (e.g., 20)
4. Click **"Fetch Trends"** button
5. → Cards will appear

### Step 3: Select Posts
1. Click on cards to select
2. Selected cards show blue border
3. Summary shows count

### Step 4: Process with AI (Optional - requires CLIProxy config)
1. Choose AI model
2. Click **"Process with AI"**
3. → Preview modal opens
4. Review Vietnamese content
5. Edit if needed

### Step 5: Publish
1. Click **"Publish All"**
2. → Posts saved to database
3. View at /admin/blog/posts

---

## 🤖 AI Configuration (Optional)

Để sử dụng AI rewrite, config trong `.env`:

```bash
# CLIProxy (Recommended)
CLIPROXY_URL=http://localhost:5000
CLIPROXY_API_KEY=your-api-key

# Or Direct APIs
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

**Note**: Nếu không config AI, vẫn có thể fetch và publish posts với nội dung gốc từ Reddit.

---

## 📁 Files Summary

### Created:
1. ✅ [app/templates/admin/reddit-manager.html](app/templates/admin/reddit-manager.html) - Card UI (600+ lines)
2. ✅ [src/services/aiService.js](src/services/aiService.js) - AI integration (300+ lines)
3. ✅ [src/services/directRedditCrawler.js](src/services/directRedditCrawler.js) - Reddit crawler (370 lines)
4. ✅ [test-reddit-api.js](test-reddit-api.js) - API test script

### Modified:
1. ✅ [src/routes/admin.js](src/routes/admin.js) - Added routes, fixed duplicates, fixed render
2. ✅ [.env.example](.env.example) - Added CLIProxy config

### Documentation:
1. ✅ [REDDIT_CONTENT_MANAGER.md](REDDIT_CONTENT_MANAGER.md) - Full guide
2. ✅ [AI_CLIPROXY_INTEGRATION.md](AI_CLIPROXY_INTEGRATION.md) - AI setup
3. ✅ [REDDIT_MANAGER_FIXED.md](REDDIT_MANAGER_FIXED.md) - Bug fixes
4. ✅ [REDDIT_API_FIXED.md](REDDIT_API_FIXED.md) - This file

---

## ✅ Current Status

**Server**: 🟢 Running on http://localhost:8080
**MongoDB**: 🟢 Connected
**Reddit API**: 🟢 Working (tested with 3 subreddits)
**Card UI**: 🟢 Accessible at /admin/reddit-manager
**AI Service**: 🟡 Ready (needs CLIProxy config)

---

## 🧪 Testing

### Test 1: Reddit Crawler (Backend)
```bash
node test-reddit-api.js
```
Expected: ✅ Fetches posts from 3 subreddits

### Test 2: API Endpoint (Backend)
```bash
curl "http://localhost:8080/admin/api/reddit-direct?subreddit=parenting&limit=5"
```
Expected: 302 redirect (needs admin login) or JSON response if authenticated

### Test 3: UI (Frontend)
1. Login as admin
2. Go to http://localhost:8080/admin/reddit-manager
3. Click "Fetch Trends"
4. Expected: Cards appear with Reddit posts

---

## 🎉 All Issues Resolved!

✅ Template rendering fixed
✅ Layout template fixed
✅ Duplicate routes removed
✅ Reddit API tested and working
✅ Server running stable

**Bây giờ bạn có thể:**
1. Truy cập http://localhost:8080/admin/reddit-manager
2. Fetch Reddit trends từ nhiều subreddits
3. Xem posts dưới dạng cards đẹp mắt
4. Select và publish posts
5. (Optional) Dùng AI để dịch sang tiếng Việt nếu đã config CLIProxy

---

**Tạo**: 2026-01-24
**Server PID**: 106284
**Status**: ✅ Ready to use!
