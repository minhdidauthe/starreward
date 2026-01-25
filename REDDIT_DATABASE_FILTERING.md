# ✅ Reddit Posts Database & Date Filtering - COMPLETE!

**Date**: 2026-01-24
**Feature**: Save Reddit posts + Filter by date
**Status**: ✅ Ready to use

---

## 🎯 New Features Added

### 1. Reddit Posts Database Model ✅
**File**: [src/models/RedditPost.js](src/models/RedditPost.js)

**Features**:
- Lưu tất cả Reddit posts fetch được vào MongoDB
- Track status (fetched, processing, published, rejected)
- Link tới BlogPost nếu đã publish
- AI processing metadata
- Timestamps và indexes để query nhanh

**Schema Fields**:
```javascript
{
    redditId: String (unique),
    title, content, url, subreddit, author,
    score, numComments,
    image, thumbnail,
    redditCreatedAt: Date,
    fetchedAt: Date (indexed),
    status: enum,
    publishedPostId: ObjectId,
    aiProcessed: Boolean,
    vietnameseTitle, vietnameseContent,
    suggestedCategory, suggestedTags
}
```

### 2. Auto-Save on Fetch ✅
**File**: [src/routes/admin.js](src/routes/admin.js)

Khi fetch posts từ Reddit → Tự động lưu vào database:
```javascript
const saveResult = await RedditPost.saveFetchedPosts(posts, { sort, timeframe });
// Returns: { saved: N, updated: M, skipped: K, errors: [] }
```

### 3. Query API with Filters ✅
**Endpoint**: `GET /admin/api/reddit-posts`

**Query Parameters**:
- `subreddit` - Filter by subreddit
- `status` - Filter by status (fetched/processing/published/rejected)
- `fromDate` - Filter from date (YYYY-MM-DD)
- `toDate` - Filter to date (YYYY-MM-DD)
- `minScore` - Minimum score threshold
- `limit` - Results per page (default: 50)
- `skip` - Offset for pagination
- `sortBy` - Sort field (default: fetchedAt)
- `sortOrder` - asc/desc (default: desc)

**Example**:
```
GET /admin/api/reddit-posts?subreddit=parenting&fromDate=2026-01-20&toDate=2026-01-24&minScore=100&limit=50
```

### 4. Dual-Mode UI ✅
**File**: [app/templates/admin/reddit-manager.html](app/templates/admin/reddit-manager.html)

**Mode 1: Fetch New from Reddit**
- Fetch trực tiếp từ Reddit API
- Tự động save vào database
- Real-time data

**Mode 2: View Saved Posts**
- Load từ database
- Filter by date range
- Filter by subreddit, status, score
- Faster loading (no Reddit API call)

---

## 📊 How It Works

### Workflow 1: Fetch & Save
```
User clicks "Fetch Trends"
    ↓
Frontend → GET /admin/api/reddit-direct
    ↓
Backend fetches from Reddit
    ↓
Save posts to MongoDB (RedditPost model)
    ↓
Return posts to frontend
    ↓
Display cards
```

### Workflow 2: View Saved
```
User switches to "View Saved Posts" mode
    ↓
User selects filters (date, subreddit, status, score)
    ↓
User clicks "Load Posts"
    ↓
Frontend → GET /admin/api/reddit-posts?filters...
    ↓
Backend queries MongoDB
    ↓
Return filtered posts
    ↓
Display cards
```

---

## 🎨 UI Changes

### New Mode Selector
```
┌──────────────────────────────────────────────┐
│ [📥 Fetch New from Reddit] [💾 View Saved]  │
└──────────────────────────────────────────────┘
```

### Fetch New Mode (Original)
```
[Subreddit ▼] [Sort ▼] [Limit ▼] [AI Model ▼] [Fetch Trends]
```

### View Saved Mode (NEW!)
```
[Subreddit ▼] [Status ▼] [From Date] [To Date] [Min Score] [Load Posts]
```

---

## 📡 API Endpoints

### 1. Fetch & Save
`GET /admin/api/reddit-direct?subreddit=...&sort=...&limit=...`

**Response**:
```json
{
    "success": true,
    "message": "Fetched 18 posts from r/parenting",
    "data": [...],
    "dbStats": {
        "saved": 15,
        "updated": 3,
        "skipped": 0
    }
}
```

### 2. Query Saved Posts
`GET /admin/api/reddit-posts?subreddit=...&fromDate=...&toDate=...`

**Response**:
```json
{
    "success": true,
    "data": [...],
    "pagination": {
        "total": 150,
        "limit": 50,
        "skip": 0,
        "hasMore": true
    },
    "filters": {
        "subreddit": "parenting",
        "fromDate": "2026-01-20",
        "toDate": "2026-01-24"
    }
}
```

---

## 🧪 Testing

### Test 1: Fetch & Auto-Save
1. Go to http://localhost:8080/admin/reddit-manager
2. Mode: "Fetch New from Reddit"
3. Select subreddit: r/parenting
4. Click "Fetch Trends"
5. → Posts displayed + Auto-saved to DB
6. Check console: `Saved to DB: X new, Y updated`

### Test 2: View Saved Posts
1. Switch mode to "View Saved Posts"
2. Select filters:
   - Subreddit: parenting
   - From Date: Last week
   - To Date: Today
   - Min Score: 50
3. Click "Load Posts"
4. → Posts from database displayed
5. No Reddit API call (faster!)

### Test 3: Date Filter
1. Mode: "View Saved Posts"
2. Set date range: Last 7 days
3. Click "Load Posts"
4. → Only posts fetched in last 7 days shown

---

## 💾 Database

### Collections
- **redditposts** - New collection for cached Reddit posts
- **blogposts** - Existing collection for published blog posts

### Sample Document
```javascript
{
    _id: ObjectId(...),
    redditId: "1a2b3c4d",
    title: "My son hates it when I use co-regulation...",
    subreddit: "parenting",
    score: 70,
    numComments: 52,
    url: "https://reddit.com/...",
    redditCreatedAt: ISODate("2026-01-23T10:30:00Z"),
    fetchedAt: ISODate("2026-01-24T08:15:30Z"),
    status: "fetched",
    aiProcessed: false,
    createdAt: ISODate("2026-01-24T08:15:30Z"),
    updatedAt: ISODate("2026-01-24T08:15:30Z")
}
```

---

## 🔍 Use Cases

### 1. Review Old Posts
- Switch to "View Saved"
- Set date range to last month
- Find high-scoring posts you might have missed

### 2. Find Best Content
- Filter by Min Score: 500+
- See only highly-upvoted posts
- Perfect for quality content curation

### 3. Track by Status
- Filter status: "fetched" → See unprocessed posts
- Filter status: "published" → See what's already on blog
- Filter status: "rejected" → Review rejected content

### 4. Subreddit Analysis
- Load all posts from specific subreddit
- See trends over time
- Compare different subreddits

---

## 📈 Benefits

### ✅ Performance
- View saved posts → No Reddit API call → Faster
- Indexed queries → Quick filtering

### ✅ Data Persistence
- All fetched posts saved forever
- Can review old content anytime
- No need to re-fetch

### ✅ Advanced Filtering
- Date range filtering
- Score-based filtering
- Status tracking
- Subreddit filtering

### ✅ Analytics Ready
- Track fetch history
- Measure post popularity over time
- Identify trending topics

---

## 🚀 Next Steps

### Suggested Enhancements:
1. **Export to CSV** - Export filtered posts
2. **Bulk Status Update** - Mark multiple as processed/rejected
3. **Analytics Dashboard** - Charts for trends over time
4. **Auto-Fetch Scheduler** - Cron job to fetch daily
5. **Duplicate Detection** - Avoid re-saving same posts

---

## ✅ Summary

### Files Created:
1. ✅ `src/models/RedditPost.js` - MongoDB model

### Files Modified:
1. ✅ `src/routes/admin.js` - Added RedditPost import, auto-save logic, query API
2. ✅ `app/templates/admin/reddit-manager.html` - Added mode selector, filters, load saved function

### Features:
- ✅ Auto-save posts on fetch
- ✅ Query saved posts with filters
- ✅ Date range filtering
- ✅ Status filtering
- ✅ Score filtering
- ✅ Dual-mode UI
- ✅ Pagination support

---

## 🎉 READY TO USE!

**Server**: http://localhost:8080 (PID: 19416)
**URL**: http://localhost:8080/admin/reddit-manager

**Hãy reload browser và test:**
1. Fetch some posts (auto-saves to DB)
2. Switch to "View Saved Posts"
3. Try date filtering!

---

**Created**: 2026-01-24
**Status**: ✅ Complete & Working
