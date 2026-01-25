# 🤖 AI Integration via CLIProxy

Tích hợp AI models (Gemini, ChatGPT, Claude) vào Reddit Content Manager thông qua CLIProxy.

---

## 🎯 CLIProxy là gì?

CLIProxy là một unified API proxy cho phép gọi nhiều AI models khác nhau thông qua một endpoint duy nhất. Thay vì phải integrate từng API riêng lẻ, bạn chỉ cần config CLIProxy một lần.

### Ưu điểm:

✅ **Unified Interface** - Một API cho tất cả models
✅ **Cost Management** - Quản lý chi phí tập trung
✅ **Rate Limiting** - Tự động rate limiting
✅ **Logging** - Track usage và costs
✅ **Failover** - Tự động chuyển sang model khác nếu lỗi
✅ **Caching** - Cache responses để tiết kiệm costs

---

## 🚀 Setup CLIProxy

### Option 1: Sử dụng CLIProxy có sẵn

Nếu bạn đã có CLIProxy server đang chạy:

```bash
# .env
CLIPROXY_URL=http://localhost:5000
CLIPROXY_API_KEY=your-api-key-here
```

### Option 2: Chạy CLIProxy locally

```bash
# Clone CLIProxy (example)
git clone https://github.com/your-org/cliproxy
cd cliproxy

# Install
npm install

# Configure
cp .env.example .env
# Edit .env with your AI API keys

# Run
npm start
```

### Option 3: Sử dụng AI APIs trực tiếp (không qua proxy)

Update `aiService.js` để gọi trực tiếp:

```javascript
// Thay vì gọi qua proxy
await axios.post(`${this.proxyUrl}/api/chat`, {...})

// Gọi trực tiếp
await axios.post('https://api.openai.com/v1/chat/completions', {...})
```

---

## 📦 Files Created

### 1. AI Service
**src/services/aiService.js** (300+ lines)

Features:
- `rewritePost(post, model)` - Rewrite single post
- `rewriteBatch(posts, model, onProgress)` - Batch processing
- `buildPrompt(post)` - Generate AI prompt
- `parseResponse(data, post)` - Parse AI response
- Fallback handling
- Category detection
- Progress tracking

### 2. Updated Routes
**src/routes/admin.js**
- Import aiService
- Replace `simulateAIRewrite()` with real AI calls
- Progress logging

### 3. Environment Config
**.env.example**
- CLIPROXY_URL
- CLIPROXY_API_KEY
- Direct AI API keys (alternatives)

---

## 🔧 Configuration

### .env Setup

```bash
# Option 1: Using CLIProxy (Recommended)
CLIPROXY_URL=http://localhost:5000
CLIPROXY_API_KEY=sk-cliproxy-abc123xyz

# Option 2: Direct APIs
GEMINI_API_KEY=AIza...
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
```

### CLIProxy API Format

```javascript
POST http://localhost:5000/api/chat

Headers:
{
  "Authorization": "Bearer your-api-key",
  "Content-Type": "application/json"
}

Body:
{
  "model": "gemini",  // or "chatgpt", "claude"
  "messages": [
    {
      "role": "system",
      "content": "You are a translator..."
    },
    {
      "role": "user",
      "content": "Translate this..."
    }
  ],
  "temperature": 0.7,
  "response_format": "json"
}

Response:
{
  "choices": [{
    "message": {
      "content": "{...json response...}"
    }
  }]
}
```

---

## 💡 How It Works

### 1. User selects posts và AI model

```javascript
// User clicks "Process with AI"
selectedPosts = [post1, post2, post3]
aiModel = "gemini"  // or "chatgpt", "claude"
```

### 2. Frontend gửi request

```javascript
POST /admin/api/reddit-ai-rewrite

{
  "posts": [...],
  "aiModel": "gemini"
}
```

### 3. Backend calls AI Service

```javascript
// admin.js
const results = await aiService.rewriteBatch(posts, aiModel);
```

### 4. AI Service gọi CLIProxy

```javascript
// aiService.js
for (const post of posts) {
  const response = await axios.post(`${CLIPROXY_URL}/api/chat`, {
    model: aiModel,
    messages: [
      { role: 'system', content: '...' },
      { role: 'user', content: buildPrompt(post) }
    ]
  });

  const result = parseResponse(response.data);
  results.push(result);
}
```

### 5. Return kết quả về frontend

```javascript
{
  "success": true,
  "results": [
    {
      "success": true,
      "originalTitle": "English title",
      "vietnameseTitle": "Tiêu đề tiếng Việt",
      "vietnameseContent": "<p>Nội dung...</p>",
      "category": "education",
      "tags": ["tag1", "tag2"]
    }
  ]
}
```

---

## 🎨 AI Prompt Template

```
Translate this Reddit post to Vietnamese for a parenting/education blog:

**Original Title:** {post.title}
**Subreddit:** r/{post.subreddit}
**Content:** {post.content}
**Upvotes:** {post.score} | **Comments:** {post.num_comments}

**Instructions:**
1. Translate the title to Vietnamese (keep it catchy and SEO-friendly)
2. Translate and adapt the content for Vietnamese parents/educators
3. Add relevant insights and context
4. Maintain the original tone and meaning
5. Format the content in HTML
6. Suggest appropriate category
7. Extract relevant Vietnamese keywords

**Response Format (JSON):**
{
    "vietnameseTitle": "Tiêu đề tiếng Việt",
    "vietnameseContent": "<p>HTML content</p>",
    "category": "education|psychology|...",
    "tags": ["tag1", "tag2"],
    "summary": "Brief summary"
}
```

---

## 🔄 Response Parsing

AIService supports multiple response formats:

### 1. OpenAI Format
```json
{
  "choices": [{
    "message": {
      "content": "{...json...}"
    }
  }]
}
```

### 2. Claude Format
```json
{
  "content": [{
    "text": "{...json...}"
  }]
}
```

### 3. Gemini Format
```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "{...json...}"
      }]
    }
  }]
}
```

### 4. Direct JSON
```json
{
  "vietnameseTitle": "...",
  "vietnameseContent": "...",
  ...
}
```

---

## 🛡️ Error Handling

### 1. API Errors

```javascript
try {
  const result = await aiService.rewritePost(post, model);
} catch (error) {
  // Falls back to basic translation
  result = {
    vietnameseTitle: `[Dịch tự động] ${post.title}`,
    vietnameseContent: generateFallbackContent(post),
    category: guessCategoryFromSubreddit(post.subreddit)
  };
}
```

### 2. Invalid JSON Response

```javascript
try {
  parsed = JSON.parse(response);
} catch (error) {
  // Extract JSON from markdown code block
  const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch) {
    parsed = JSON.parse(jsonMatch[1]);
  }
}
```

### 3. Network Timeout

```javascript
await axios.post(url, data, {
  timeout: 60000  // 60 seconds
});
```

---

## 📊 Progress Tracking

```javascript
await aiService.rewriteBatch(posts, model, (current, total) => {
  console.log(`Progress: ${current}/${total}`);
  // Update UI progress bar
});
```

---

## 💰 Cost Estimation

### Gemini 2.0 Flash
- **Input**: $0.075 / 1M tokens
- **Output**: $0.30 / 1M tokens
- **Estimate**: ~$0.001 per post

### ChatGPT 4
- **Input**: $2.50 / 1M tokens
- **Output**: $10.00 / 1M tokens
- **Estimate**: ~$0.02 per post

### Claude 3.5 Sonnet
- **Input**: $3.00 / 1M tokens
- **Output**: $15.00 / 1M tokens
- **Estimate**: ~$0.025 per post

**Recommended**: Gemini 2.0 Flash (fastest + cheapest)

---

## 🎯 Testing

### 1. Test với 1 post

```javascript
const post = {
  title: "How to handle tantrums?",
  content: "My 3-year-old has tantrums every day...",
  score: 500,
  num_comments: 50,
  subreddit: "parenting",
  url: "https://reddit.com/..."
};

const result = await aiService.rewritePost(post, 'gemini');
console.log(result.vietnameseTitle);
console.log(result.vietnameseContent);
```

### 2. Test batch

```javascript
const results = await aiService.rewriteBatch(posts, 'gemini', (current, total) => {
  console.log(`${current}/${total}`);
});

console.log(`Success: ${results.filter(r => r.success).length}`);
console.log(`Failed: ${results.filter(r => !r.success).length}`);
```

---

## 🔧 Customization

### Change prompt template

Edit `buildPrompt()` in `aiService.js`:

```javascript
buildPrompt(post) {
  return `
Your custom prompt here...

Post: ${post.title}
...
  `;
}
```

### Add new AI model

```javascript
// aiService.js
async rewritePost(post, model) {
  if (model === 'your-custom-model') {
    return await this.callCustomModel(post);
  }

  // Default to CLIProxy
  return await this.callProxy(post, model);
}
```

---

## 📝 Example Usage

### In Reddit Manager UI

1. User selects 5 posts
2. Chooses "Gemini" model
3. Clicks "Process with AI"
4. Backend:
   ```javascript
   POST /admin/api/reddit-ai-rewrite
   {
     posts: [5 posts],
     aiModel: "gemini"
   }
   ```
5. aiService processes each post via CLIProxy
6. Returns Vietnamese translated content
7. User reviews in modal
8. User edits if needed
9. Clicks "Publish All"
10. Posts saved to database

---

## ✅ Checklist

- [ ] CLIProxy running (or direct API configured)
- [ ] .env configured with CLIPROXY_URL and CLIPROXY_API_KEY
- [ ] aiService.js created
- [ ] admin.js updated to use aiService
- [ ] Test with 1 post
- [ ] Test batch processing
- [ ] Monitor costs
- [ ] Review translated content quality

---

## 🎉 Done!

AI Integration hoàn tất! Bây giờ Reddit Content Manager có thể:

✅ Fetch Reddit posts
✅ Rewrite to Vietnamese with AI
✅ Preview & Edit
✅ Publish to blog

**Next**: Configure your CLIProxy or direct AI API keys và test!

---

**Created**: 2026-01-24
**Files**: aiService.js, admin.js (updated), .env.example (updated)
**Status**: ✅ Ready to use with CLIProxy or direct APIs
