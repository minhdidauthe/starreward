/**
 * AI Service using CLIProxy
 * Supports Gemini, ChatGPT, Claude via proxy
 */

const axios = require('axios');

class AIService {
    constructor() {
        // CLIProxy configuration (OpenAI-compatible endpoint)
        this.proxyUrl = process.env.CLIPROXY_URL || 'http://127.0.0.1:8317';
        this.proxyApiKey = process.env.CLIPROXY_API_KEY || '';
    }

    /**
     * Rewrite Reddit post to Vietnamese using AI
     * @param {Object} post - Reddit post data
     * @param {string} model - AI model (gemini|chatgpt|claude)
     * @returns {Promise<Object>} Rewritten content
     */
    async rewritePost(post, model = 'gemini', options = {}) {
        try {
            const prompt = this.buildPrompt(post);

            const proxyUrl = options.proxyUrl || this.proxyUrl;
            const proxyApiKey = options.proxyApiKey || this.proxyApiKey;
            const targetModel = options.proxyModel || this.getModelName(model);

            // Call CLIProxy (OpenAI-compatible /v1/chat/completions)
            const response = await axios.post(`${proxyUrl}/v1/chat/completions`, {
                model: targetModel,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a professional translator specializing in parenting and education content for Vietnamese audiences. Translate Reddit posts to Vietnamese, maintaining the original meaning while making it culturally appropriate and engaging. Always respond with valid JSON only, no markdown.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${proxyApiKey}`,
                    'Content-Type': 'application/json'
                },
                timeout: 120000 // 120 seconds
            });

            // Parse response (OpenAI format)
            const result = this.parseResponse(response.data, post);
            return result;

        } catch (error) {
            console.error(`[AI Service] Error with ${model}:`, error.message);
            if (error.response) {
                console.error(`[AI Service] Response status: ${error.response.status}, data:`, JSON.stringify(error.response.data).substring(0, 500));
            }
            throw new Error(`AI rewrite failed: ${error.message}`);
        }
    }

    /**
     * Map UI model selection to actual model name
     */
    getModelName(model) {
        const modelMap = {
            'gemini': 'gemini-3-flash-preview',
            'gemini-pro': 'gemini-3-pro-preview',
            'chatgpt': 'gemini-3-flash-preview',
            'claude': 'claude-sonnet-4-6'
        };
        return modelMap[model] || model;
    }

    /**
     * Build prompt for AI
     */
    buildPrompt(post) {
        return `
Translate this Reddit post to Vietnamese for a parenting/education blog:

**Original Title:** ${post.title}

**Subreddit:** r/${post.subreddit}

**Content:** ${post.content || 'No text content, only image/title'}

**Upvotes:** ${post.score} | **Comments:** ${post.num_comments}

**Instructions:**
1. Translate the title to Vietnamese (keep it catchy and SEO-friendly)
2. Translate and adapt the content for Vietnamese parents/educators
3. Add relevant insights and context
4. Maintain the original tone and meaning
5. Format the content in HTML (use <p>, <h3>, <ul>, <ol> tags)
6. Suggest appropriate category based on content
7. Extract relevant Vietnamese keywords for tags

**Response Format (JSON):**
{
    "vietnameseTitle": "Tiêu đề tiếng Việt",
    "vietnameseContent": "<p>Nội dung HTML tiếng Việt...</p>",
    "category": "education|psychology|health|nutrition|activities|discipline|communication|technology|experience|other",
    "tags": ["tag1", "tag2", "tag3"],
    "summary": "Brief summary in Vietnamese (1-2 sentences)"
}

**Note:** If the post contains only an image URL, create engaging Vietnamese content describing what parents/educators can learn from it.
`;
    }

    /**
     * Parse AI response
     */
    parseResponse(responseData, originalPost) {
        try {
            // Different response formats from different proxies
            let parsed;
            let content = '';

            if (typeof responseData === 'string') {
                content = responseData;
            } else if (responseData.choices && responseData.choices[0]) {
                // OpenAI format (CLIProxy returns this)
                content = responseData.choices[0].message.content;
            } else if (responseData.content && responseData.content[0]) {
                // Claude format
                content = responseData.content[0].text;
            } else if (responseData.candidates && responseData.candidates[0]) {
                // Gemini format
                content = responseData.candidates[0].content.parts[0].text;
            } else {
                // Assume it's already parsed JSON
                parsed = responseData;
            }

            if (!parsed && content) {
                // Clean up: remove markdown code blocks if present
                const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
                const jsonStr = jsonMatch ? jsonMatch[1] : content;
                parsed = JSON.parse(jsonStr.trim());
            }

            // Validate and format
            return {
                vietnameseTitle: parsed.vietnameseTitle || `[Dịch] ${originalPost.title}`,
                vietnameseContent: parsed.vietnameseContent || this.generateFallbackContent(originalPost),
                category: this.validateCategory(parsed.category),
                tags: parsed.tags || ['reddit', originalPost.subreddit],
                summary: parsed.summary || ''
            };

        } catch (error) {
            console.error('[AI Service] Error parsing response:', error);

            // Fallback: return basic translation
            return {
                vietnameseTitle: `[Dịch tự động] ${originalPost.title}`,
                vietnameseContent: this.generateFallbackContent(originalPost),
                category: this.guessCategoryFromSubreddit(originalPost.subreddit),
                tags: ['reddit', originalPost.subreddit, 'auto-translated'],
                summary: ''
            };
        }
    }

    /**
     * Generate fallback content if AI fails
     */
    generateFallbackContent(post) {
        let content = `<h2>${post.title}</h2>\n\n`;

        if (post.content) {
            content += `<p>${post.content}</p>\n\n`;
        }

        if (post.image) {
            content += `<div class="text-center mb-4">
                <img src="${post.image}" class="img-fluid rounded" alt="${post.title}">
            </div>\n\n`;
        }

        content += `<div class="alert alert-info">
            <strong>Nguồn:</strong> Reddit - r/${post.subreddit}<br>
            <strong>Điểm:</strong> ${post.score.toLocaleString()} upvotes • ${post.num_comments} bình luận<br>
            <strong>Link gốc:</strong> <a href="${post.url}" target="_blank" rel="noopener">${post.url}</a>
        </div>`;

        return content;
    }

    /**
     * Validate category
     */
    validateCategory(category) {
        const validCategories = [
            'education', 'psychology', 'health', 'nutrition',
            'activities', 'discipline', 'communication',
            'technology', 'experience', 'other'
        ];

        if (validCategories.includes(category)) {
            return category;
        }

        return 'other';
    }

    /**
     * Guess category from subreddit name
     */
    guessCategoryFromSubreddit(subreddit) {
        const categoryMap = {
            'parenting': 'experience',
            'Parenting101': 'experience',
            'AskParents': 'communication',
            'education': 'education',
            'Teachers': 'education',
            'teaching': 'education',
            'homeschool': 'education',
            'ScienceTeachers': 'education',
            'matheducation': 'education',
            'learnmath': 'education',
            'EnglishLearning': 'education',
            'languagelearning': 'education',
            'psychology': 'psychology',
            'Parenting_Psychology': 'psychology',
            'health': 'health',
            'HealthyFood': 'nutrition',
            'nutrition': 'nutrition',
            'kidsactivities': 'activities',
            'daddit': 'experience',
            'Mommit': 'experience'
        };

        return categoryMap[subreddit] || 'other';
    }

    /**
     * Batch rewrite multiple posts
     */
    async rewriteBatch(posts, model = 'gemini', options = {}, onProgress = null) {
        const results = [];
        let processed = 0;

        for (const post of posts) {
            try {
                const result = await this.rewritePost(post, model, options);

                results.push({
                    success: true,
                    originalTitle: post.title,
                    vietnameseTitle: result.vietnameseTitle,
                    vietnameseContent: result.vietnameseContent,
                    category: result.category,
                    tags: result.tags,
                    summary: result.summary,
                    redditUrl: post.url,
                    redditScore: post.score,
                    redditComments: post.num_comments,
                    subreddit: post.subreddit,
                    image: post.image
                });

                processed++;
                if (onProgress) {
                    onProgress(processed, posts.length);
                }

                // Delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                results.push({
                    success: false,
                    originalTitle: post.title,
                    error: error.message
                });

                processed++;
                if (onProgress) {
                    onProgress(processed, posts.length);
                }
            }
        }

        return results;
    }
}

module.exports = new AIService();
