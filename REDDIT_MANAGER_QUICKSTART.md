# 🎯 Reddit Content Manager - Quick Start Guide

## ✅ Đã Sửa Xong!

**Server**: 🟢 Đang chạy tại http://localhost:8080
**PID**: 106284
**Status**: Tất cả lỗi đã được fix

---

## 🐛 Các Lỗi Đã Fix

### 1. Template Rendering Error ✅
- **Lỗi**: "No default engine was specified"
- **Fix**: Thêm `.html` extension vào render call

### 2. Layout Template Error ✅
- **Lỗi**: "template not found: admin/layout.html"
- **Fix**: Đổi extends thành `base.html`

### 3. Duplicate Routes ✅
- **Vấn đề**: Routes `/api/reddit-direct` bị duplicate 2 lần
- **Fix**: Xóa 104 dòng code duplicate (line 1131-1234)

### 4. Reddit API ✅
- **Test**: Đã test thành công với 3 subreddits
- **Kết quả**: Fetch được 9 posts (r/parenting, r/education, r/Teachers)

---

## 🚀 Cách Sử Dụng

### Bước 1: Truy Cập Reddit Manager
```
http://localhost:8080/admin/reddit-manager
```

### Bước 2: Fetch Reddit Trends
1. Chọn **Subreddit** (vd: r/parenting)
2. Chọn **Sort Method** (vd: hot)
3. Chọn **Limit** (vd: 20 posts)
4. Click nút **"Fetch Trends"**
5. → Các cards sẽ hiện ra

### Bước 3: Chọn Posts
- Click vào cards để chọn
- Cards được chọn có border màu xanh
- Phía dưới hiển thị số lượng đã chọn

### Bước 4: Process với AI (Tùy chọn)
- Chọn **AI Model** (Gemini/ChatGPT/Claude)
- Click **"Process with AI"**
- → Preview modal hiện ra
- Review và edit nội dung tiếng Việt
- Chọn category phù hợp

**Lưu ý**: Cần config CLIProxy trong `.env` để dùng AI

### Bước 5: Publish
- Click **"Publish All"**
- → Posts được lưu vào database
- Xem tại `/admin/blog/posts`

---

## 🤖 Cấu Hình AI (Tùy Chọn)

Nếu muốn dùng AI để dịch sang tiếng Việt, thêm vào `.env`:

```bash
# Sử dụng CLIProxy (Khuyến nghị)
CLIPROXY_URL=http://localhost:5000
CLIPROXY_API_KEY=your-cliproxy-api-key

# HOẶC dùng API trực tiếp
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
```

**Chi tiết**: Xem [AI_CLIPROXY_INTEGRATION.md](AI_CLIPROXY_INTEGRATION.md)

---

## 📊 Test Kết Quả

### Reddit API Test
```bash
node test-reddit-api.js
```

**Kết quả**:
```
✅ r/parenting: 3 posts
✅ r/education: 3 posts
✅ r/Teachers: 3 posts
Total: 9 posts fetched successfully
```

---

## 🎨 Giao Diện

### Card Layout
```
┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
│ 📷 1.5K │ │ 📷 2.3K │ │ 📷 850  │ │ 📷 3.1K │
│─────────│ │─────────│ │─────────│ │─────────│
│ Title   │ │ Title   │ │ Title   │ │ Title   │
│ r/sub   │ │ r/sub   │ │ r/sub   │ │ r/sub   │
│ ☑ Select│ │ ☐ Select│ │ ☑ Select│ │ ☐ Select│
└─────────┘ └─────────┘ └─────────┘ └─────────┘
```

### Features
- ✅ Card-based UI đẹp mắt
- ✅ Multi-select với visual feedback
- ✅ Trending score badges
- ✅ Preview modal
- ✅ Edit trước khi publish
- ✅ AI integration (nếu config)

---

## 📡 API Endpoints

### GET `/admin/api/reddit-direct`
Fetch posts từ Reddit

**Query Parameters**:
- `subreddit` - Tên subreddit (default: parenting)
- `sort` - hot|new|top|rising (default: hot)
- `limit` - Số lượng posts (default: 10)
- `timeframe` - Cho sort='top': day|week|month|year

**Ví dụ**:
```
/admin/api/reddit-direct?subreddit=parenting&sort=hot&limit=20
```

### POST `/admin/api/reddit-ai-rewrite`
Dịch posts sang tiếng Việt bằng AI

**Body**:
```json
{
  "posts": [...],
  "aiModel": "gemini"
}
```

### POST `/admin/api/reddit-publish`
Publish posts lên blog

**Body**:
```json
{
  "posts": [...]
}
```

---

## 📁 Các File Quan Trọng

### Backend Services
- [src/services/directRedditCrawler.js](src/services/directRedditCrawler.js) - Reddit crawler
- [src/services/aiService.js](src/services/aiService.js) - AI integration
- [src/routes/admin.js](src/routes/admin.js) - API routes

### Frontend
- [app/templates/admin/reddit-manager.html](app/templates/admin/reddit-manager.html) - Card UI

### Documentation
- [REDDIT_CONTENT_MANAGER.md](REDDIT_CONTENT_MANAGER.md) - Full guide
- [AI_CLIPROXY_INTEGRATION.md](AI_CLIPROXY_INTEGRATION.md) - AI setup
- [REDDIT_API_FIXED.md](REDDIT_API_FIXED.md) - Bug fixes

### Tests
- [test-reddit-api.js](test-reddit-api.js) - API test script

---

## ✅ Checklist

- [x] Server đang chạy
- [x] MongoDB connected
- [x] Reddit API working
- [x] Card UI accessible
- [x] Template errors fixed
- [x] Duplicate routes removed
- [x] API endpoints tested
- [ ] CLIProxy configured (optional - for AI)

---

## 🎉 Sẵn Sàng Sử Dụng!

Mọi thứ đã hoạt động! Bạn có thể:

1. ✅ **Fetch Reddit trends** từ nhiều subreddits
2. ✅ **Xem posts dạng cards** với layout đẹp mắt
3. ✅ **Select và publish** posts lên blog
4. 🟡 **Dùng AI dịch** sang tiếng Việt (cần config CLIProxy)

**URL**: http://localhost:8080/admin/reddit-manager

---

**Tạo**: 2026-01-24
**Trạng thái**: ✅ Hoàn tất và sẵn sàng
