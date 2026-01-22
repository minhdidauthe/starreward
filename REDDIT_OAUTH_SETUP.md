# Reddit OAuth Setup - Star Reward

Hướng dẫn cài đặt Reddit OAuth để crawl bài viết từ bất kỳ subreddit nào.

---

## ⚡ Quick Start (3 bước)

### Bước 1: Tạo Reddit App

1. Đăng nhập Reddit tại: https://www.reddit.com/prefs/apps
2. Click **"create another app..."** (hoặc "are you a developer? create an app...")
3. Điền thông tin:
   - **name**: `StarReward` (hoặc tên bất kỳ)
   - **App type**: Chọn **"script"** ✅
   - **description**: `Educational content aggregator for Star Reward`
   - **about url**: (để trống)
   - **redirect uri**: `http://localhost:8080`
4. Click **"create app"**

Bạn sẽ nhận được:
- **Client ID**: 14 ký tự (hiển thị ngay dưới tên app)
- **Secret**: 27 ký tự (dòng "secret")

📝 **Lưu ý**: Đây là thông tin nhạy cảm, không share cho ai!

---

### Bước 2: Lấy Refresh Token (Cách đơn giản nhất)

**🎯 Khuyên dùng: Sử dụng Online Tool**

1. Mở: https://not-an-aardvark.github.io/reddit-oauth-helper/
2. Nhập:
   - **Client ID**: (14 ký tự từ bước 1)
   - **Client Secret**: (27 ký tự từ bước 1)
3. Select scopes:
   - ✅ `read` - Đọc bài viết
   - ✅ `identity` - Xác thực danh tính
4. Click **"Generate tokens"**
5. Đăng nhập Reddit và click **"Allow"**
6. Copy **Refresh Token** (dài ~50-100 ký tự)

**Lưu ý**: Refresh token không bao giờ hết hạn trừ khi bạn thu hồi quyền truy cập.

---

### Bước 3: Thêm vào .env

Mở file `.env` trong thư mục Star Reward và cập nhật:

```bash
# Reddit OAuth API (Optional - for direct Reddit integration)
# Create app at: https://www.reddit.com/prefs/apps
REDDIT_CLIENT_ID=abc123XYZ45678
REDDIT_CLIENT_SECRET=def456ABC789xyz012345UVWXYZ
REDDIT_REFRESH_TOKEN=123456789-AbCdEfGhIjKlMnOpQrStUvWxYz
REDDIT_USER_AGENT=StarReward/1.0
```

**Thay thế** các giá trị example bằng thông tin thực tế của bạn!

---

## 🔄 Khởi động lại Server

```bash
# Dừng server hiện tại (Ctrl+C hoặc kill process)
# Sau đó khởi động lại:
npm start
```

Kiểm tra log, bạn sẽ thấy:
```
✅ Reddit OAuth client initialized
Server running at http://localhost:8080
```

---

## ✅ Test Reddit Crawler

1. Truy cập: http://localhost:8080/admin/blog/import-reddit
2. Chọn tab **"Subreddit"**
3. Nhập subreddit: `parenting` (hoặc `education`, `teachers`, v.v.)
4. Chọn sort: `hot` hoặc `top`
5. Nhập số lượng: `5` (để test)
6. Click **"Import Bài Viết"**

Nếu thành công, bạn sẽ thấy:
- ✅ "Đã import 5 bài viết thành công!"
- Các bài viết xuất hiện trong `/admin/blog/posts`

---

## 🎓 Subreddits Gợi Ý

### Giáo Dục Tổng Quát
- `r/education` - Giáo dục tổng quát
- `r/Teachers` - Dành cho giáo viên
- `r/teaching` - Phương pháp giảng dạy
- `r/homeschool` - Giáo dục tại nhà

### Nuôi Dạy Con
- `r/parenting` - Nuôi dạy con cái
- `r/Parenting101` - Tips cho phụ huynh mới
- `r/AskParents` - Hỏi đáp về nuôi dạy con

### Môn Học Cụ Thể
- `r/learnmath` - Học toán
- `r/EnglishLearning` - Học tiếng Anh
- `r/ScienceTeachers` - Giáo viên khoa học
- `r/matheducation` - Giáo dục toán học

### STEM & Khoa Học
- `r/AskScience` - Hỏi đáp khoa học
- `r/explainlikeimfive` - Giải thích đơn giản
- `r/science` - Khoa học tổng quát

---

## 🔧 Troubleshooting

### Lỗi: "OAuth credentials not configured"
**Giải pháp**: Kiểm tra file `.env` có đầy đủ 3 biến:
- `REDDIT_CLIENT_ID`
- `REDDIT_CLIENT_SECRET`
- `REDDIT_REFRESH_TOKEN`

### Lỗi: "Invalid refresh token"
**Giải pháp**:
1. Refresh token có thể bị thu hồi
2. Tạo lại token tại: https://not-an-aardvark.github.io/reddit-oauth-helper/

### Lỗi: "Rate limit exceeded"
**Giải pháp**: Reddit giới hạn 60 requests/phút. Đợi 1 phút rồi thử lại.

### Lỗi: "Subreddit is private"
**Giải pháp**: Một số subreddit là private. Thử subreddit public khác.

---

## 📊 So Sánh 3 Phương Thức Import

| Phương thức | Ưu điểm | Nhược điểm | Cần OAuth? |
|-------------|---------|------------|-----------|
| **Trending Memes** | Nhanh, không cần OAuth | Chỉ có memes | ❌ Không |
| **URL Post** | Import chính xác 1 bài | Phải tìm URL thủ công | ✅ Có |
| **Subreddit** | Import hàng loạt, linh hoạt | Cần setup OAuth | ✅ Có |

---

## 🔒 Bảo Mật

### Không bao giờ:
- ❌ Commit file `.env` lên Git
- ❌ Share Client Secret hoặc Refresh Token
- ❌ Đăng credentials lên mạng xã hội

### Nên làm:
- ✅ Dùng `.env` cho credentials (đã có trong `.gitignore`)
- ✅ Định kỳ rotate refresh token (3-6 tháng)
- ✅ Thu hồi access nếu nghi ngờ bị lộ: https://www.reddit.com/prefs/apps

---

## 📖 Tài Liệu Tham Khảo

- Reddit OAuth Documentation: https://github.com/reddit-archive/reddit/wiki/OAuth2
- Snoowrap (thư viện Node.js): https://github.com/not-an-aardvark/snoowrap
- Reddit API Rules: https://github.com/reddit-archive/reddit/wiki/API

---

## ✨ Tính Năng Nâng Cao

Sau khi setup OAuth thành công, bạn có thể:

1. **Crawl từ bất kỳ subreddit nào** (không giới hạn memes)
2. **Lọc theo timeframe**: hour, day, week, month, year
3. **Sort linh hoạt**: hot, new, top, rising
4. **Import hàng loạt**: Lên đến 50 posts mỗi lần
5. **Auto-tagging**: Tự động tag theo subreddit và keywords

---

## 🎉 Hoàn Tất!

Sau khi setup xong, hệ thống Star Reward có thể:
- ✅ Crawl trending memes (không cần OAuth)
- ✅ Import từ bất kỳ subreddit nào (cần OAuth)
- ✅ Quản lý nội dung giáo dục chất lượng cao
- ✅ Tự động phân loại và tag bài viết

**Chúc bạn sử dụng hiệu quả!** 🚀
