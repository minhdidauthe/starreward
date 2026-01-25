# 🎨 Reddit Content Manager - Card-based UI

Giao diện quản lý nội dung Reddit dạng Card cho phép admin load trends, chọn content, và sử dụng AI để rewrite sang tiếng Việt trước khi publish.

---

## ✨ Features

✅ **Card-based UI** - Hiển thị Reddit posts dưới dạng cards đẹp mắt
✅ **Multi-select** - Chọn nhiều posts cùng lúc
✅ **AI Rewrite** - Tích hợp AI models (Gemini, ChatGPT, Claude) để dịch sang tiếng Việt
✅ **Preview Before Publish** - Xem trước và chỉnh sửa trước khi publish
✅ **Smart Categorization** - Tự động phân loại category dựa trên subreddit
✅ **Duplicate Detection** - Không tạo bài viết trùng lặp

---

## 🚀 Quick Start

### 1. Truy cập Reddit Manager

```
http://localhost:8080/admin/reddit-manager
```

### 2. Workflow

```
┌─────────────────┐
│ 1. Fetch Trends │ → Select subreddit, sort, limit
└────────┬────────┘
         ↓
┌─────────────────┐
│ 2. View Cards   │ → Browse Reddit posts in card format
└────────┬────────┘
         ↓
┌─────────────────┐
│ 3. Select Posts │ → Click cards to select
└────────┬────────┘
         ↓
┌─────────────────┐
│ 4. AI Rewrite   │ → Choose AI model and process
└────────┬────────┘
         ↓
┌─────────────────┐
│ 5. Preview      │ → Edit Vietnamese title & content
└────────┬────────┘
         ↓
┌─────────────────┐
│ 6. Publish      │ → Publish to blog
└─────────────────┘
```

---

## 📦 Files Created

### 1. UI Template
**app/templates/admin/reddit-manager.html** (600+ dòng)
- Card-based layout
- Fetch controls (subreddit, sort, limit, AI model)
- Selection summary
- AI preview modal
- Loading overlay

### 2. Backend Routes
**src/routes/admin.js** (Updated)
- `GET /admin/reddit-manager` - Render UI
- `POST /admin/api/reddit-ai-rewrite` - AI rewrite endpoint
- `POST /admin/api/reddit-publish` - Publish endpoint

---

## 🎨 UI Components

### Fetch Controls
```html
- Subreddit selector (r/parenting, r/education, r/Teachers, etc.)
- Sort method (hot, new, top, rising)
- Limit (10, 20, 30, 50 posts)
- AI Model selector (Gemini, ChatGPT, Claude)
- Fetch button
```

### Reddit Cards
```
┌──────────────────────┐
│   📷 Image/Icon      │
│   Score Badge        │
├──────────────────────┤
│ Title (truncated)    │
│ r/subreddit          │
│ ↑ 1.5K upvotes       │
│ 💬 250 comments      │
├──────────────────────┤
│ ☐ Select for AI      │
└──────────────────────┘
```

### Features:
- Click card to select/deselect
- Visual feedback (border highlight when selected)
- Trending score badge (high/medium/low)
- Hover effect

### Selection Summary
```
☑ 5 posts selected    [Clear] [Process with AI]
```

### AI Preview Modal
```html
┌──────────────────────────────────────┐
│ AI Rewritten Content Preview    [×] │
├──────────────────────────────────────┤
│                                      │
│ Card 1:                              │
│ - Original: "English title"          │
│ - Vietnamese Title: [editable]       │
│ - Category: [dropdown]               │
│ - Vietnamese Content: [preview]      │
│ - ☑ Publish this post                │
│                                      │
│ Card 2: ...                          │
│                                      │
├──────────────────────────────────────┤
│              [Close] [Publish All]   │
└──────────────────────────────────────┘
```

---

## 🤖 AI Integration

### Current Status: Simulation Mode

Hiện tại đang dùng `simulateAIRewrite()` để demo. Cần tích hợp real AI:

### 1. Gemini 2.0 Flash

```javascript
async function geminiRewrite(post) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
Rewrite this Reddit post to Vietnamese for a parenting/education blog:

Title: ${post.title}
Content: ${post.content || 'No content'}
Subreddit: r/${post.subreddit}

Requirements:
- Translate title to Vietnamese (keep it catchy)
- Translate and adapt content for Vietnamese parents
- Maintain the original meaning
- Make it engaging and readable
- Add relevant insights
- Format in HTML

Return JSON:
{
    "title": "Vietnamese title",
    "content": "<p>HTML content</p>",
    "category": "education|psychology|health|...",
    "tags": ["tag1", "tag2"]
}
    `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
}
```

### 2. ChatGPT 4

```javascript
async function chatgptRewrite(post) {
    const OpenAI = require('openai');
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });

    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            {
                role: 'system',
                content: 'You are a translator specializing in parenting/education content for Vietnamese audiences.'
            },
            {
                role: 'user',
                content: `Rewrite this Reddit post to Vietnamese...`
            }
        ],
        response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content);
}
```

### 3. Claude 3.5 Sonnet

```javascript
async function claudeRewrite(post) {
    const Anthropic = require('@anthropic-ai/sdk');
    const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
    });

    const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [
            {
                role: 'user',
                content: `Rewrite this Reddit post to Vietnamese...`
            }
        ]
    });

    return JSON.parse(message.content[0].text);
}
```

---

## 📡 API Endpoints

### 1. Fetch Reddit Trends

**GET** `/admin/api/reddit-direct`

**Parameters:**
- `subreddit` - Subreddit name (default: parenting)
- `sort` - Sort method (hot, new, top, rising)
- `limit` - Number of posts (default: 10)
- `timeframe` - For 'top' sort (hour, day, week, month, year, all)

**Response:**
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
      "author": "username",
      "image": "https://i.redd.it/..."
    }
  ]
}
```

### 2. AI Rewrite

**POST** `/admin/api/reddit-ai-rewrite`

**Body:**
```json
{
  "posts": [
    {
      "id": "abc123",
      "title": "Original title",
      "content": "Original content...",
      "url": "https://reddit.com/...",
      "score": 1500,
      "num_comments": 250,
      "subreddit": "parenting",
      "image": "https://i.redd.it/..."
    }
  ],
  "aiModel": "gemini"
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "success": true,
      "originalTitle": "Original title",
      "vietnameseTitle": "Tiêu đề tiếng Việt",
      "vietnameseContent": "<p>Nội dung tiếng Việt...</p>",
      "category": "experience",
      "tags": ["reddit", "parenting", "ai-translated"],
      "redditUrl": "https://reddit.com/...",
      "redditScore": 1500,
      "redditComments": 250,
      "subreddit": "parenting",
      "image": "https://i.redd.it/..."
    }
  ]
}
```

### 3. Publish Posts

**POST** `/admin/api/reddit-publish`

**Body:**
```json
{
  "posts": [
    {
      "vietnameseTitle": "Tiêu đề tiếng Việt",
      "vietnameseContent": "<p>Nội dung...</p>",
      "category": "experience",
      "tags": ["reddit", "parenting"],
      "redditUrl": "https://reddit.com/...",
      "redditScore": 1500,
      "redditComments": 250,
      "subreddit": "parenting",
      "image": "https://i.redd.it/..."
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "published": 5,
  "failed": []
}
```

---

## 🎯 Category Mapping

Auto-detect category từ subreddit:

```javascript
const categoryMap = {
    'parenting': 'experience',
    'education': 'education',
    'Teachers': 'education',
    'homeschool': 'education',
    'AskParents': 'communication',
    'learnmath': 'education',
    'EnglishLearning': 'education',
    'psychology': 'psychology',
    'health': 'health'
};
```

Valid categories:
- education (Giáo dục)
- psychology (Tâm lý)
- health (Sức khỏe)
- nutrition (Dinh dưỡng)
- activities (Hoạt động)
- discipline (Kỷ luật)
- communication (Giao tiếp)
- technology (Công nghệ)
- experience (Kinh nghiệm)
- other (Khác)

---

## 🛠️ Installation & Setup

### 1. Install AI SDKs (choose one or all)

```bash
# Gemini
npm install @google/generative-ai

# ChatGPT
npm install openai

# Claude
npm install @anthropic-ai/sdk
```

### 2. Add API Keys to .env

```bash
# Gemini
GEMINI_API_KEY=your-gemini-api-key

# ChatGPT
OPENAI_API_KEY=your-openai-api-key

# Claude
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### 3. Update simulateAIRewrite() function

Thay thế function `simulateAIRewrite()` trong admin.js bằng real AI integration.

---

## 📊 Workflow Example

### Step 1: Fetch
```javascript
// Admin selects
subreddit: "parenting"
sort: "hot"
limit: 20
aiModel: "gemini"

// Click "Fetch Trends"
// → GET /admin/api/reddit-direct?subreddit=parenting&sort=hot&limit=20
// → Returns 20 posts, displayed as cards
```

### Step 2: Select
```javascript
// Admin clicks on 5 cards
selectedPosts = [post1, post2, post3, post4, post5]

// Summary shows: "5 posts selected"
```

### Step 3: Process
```javascript
// Admin clicks "Process with AI"
// → POST /admin/api/reddit-ai-rewrite
{
    posts: selectedPosts,
    aiModel: "gemini"
}

// → Gemini rewrites each post to Vietnamese
// → Modal shows preview with editable fields
```

### Step 4: Edit & Publish
```javascript
// Admin reviews and edits:
// - Vietnamese title
// - Category
// - Content (if needed)

// Unchecks 1 post (doesn't want to publish)
// Clicks "Publish All"
// → POST /admin/api/reddit-publish
{
    posts: [4 selected posts]
}

// → 4 posts published to blog
// → Success message shown
```

---

## 🎨 Styling

### Card States

```css
.reddit-card {
    /* Default */
    border: 2px solid transparent;
}

.reddit-card:hover {
    /* Hover */
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.reddit-card.selected {
    /* Selected */
    border-color: #0d6efd;
    background-color: #f8f9fa;
}
```

### Trending Score Badges

```css
.trending-score.high {
    /* > 1000 upvotes */
    background: #28a745;
}

.trending-score.medium {
    /* 500-1000 upvotes */
    background: #ffc107;
}

.trending-score.low {
    /* < 500 upvotes */
    background: #6c757d;
}
```

---

## 🔧 Customization

### Add more subreddits

Edit `app/templates/admin/reddit-manager.html`:

```html
<select class="form-select" id="subreddit">
    <option value="parenting">r/parenting</option>
    <option value="education">r/education</option>
    <!-- Add more -->
    <option value="YourSubreddit">r/YourSubreddit</option>
</select>
```

### Change AI prompt

Edit `simulateAIRewrite()` or real AI functions to customize translation style.

### Adjust card layout

Modify grid classes in template:
```html
<!-- 4 cards per row -->
<div class="col-md-4 col-lg-3 mb-4">

<!-- 3 cards per row -->
<div class="col-md-6 col-lg-4 mb-4">
```

---

## 🎉 Demo URLs

- **Reddit Manager**: http://localhost:8080/admin/reddit-manager
- **Blog Posts**: http://localhost:8080/admin/blog/posts
- **Dashboard**: http://localhost:8080/admin/dashboard

---

## 🚀 Next Steps

1. ✅ Tích hợp real AI models (Gemini/ChatGPT/Claude)
2. ✅ Add AI prompt customization
3. ✅ Bulk operations (select all, deselect all)
4. ✅ Save drafts before publishing
5. ✅ Schedule publishing
6. ✅ Analytics dashboard

---

## 📝 Notes

- Current implementation uses simulated AI rewrite
- Replace `simulateAIRewrite()` with real AI integration
- Add error handling for AI API failures
- Consider rate limiting for AI APIs
- Monitor AI costs

---

**Created**: 2026-01-24
**Status**: ✅ UI Complete, AI Integration Pending
**Server**: http://localhost:8080

Enjoy the Reddit Content Manager! 🎨
