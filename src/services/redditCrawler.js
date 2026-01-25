/**
 * Reddit Crawler Service for Star Reward
 * Integrated crawler similar to Order Management System
 * Supports both RapidAPI and OAuth methods
 */

const axios = require('axios');
const snoowrap = require('snoowrap');

// Configuration
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || '29d996fec1msh030e05e6e7f481bp1f56d5jsna994cc5e7e86';
const RAPIDAPI_HOST = 'reddit-meme.p.rapidapi.com';

// OAuth Configuration (optional)
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDDIT_REFRESH_TOKEN = process.env.REDDIT_REFRESH_TOKEN;
const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT || 'StarReward/1.0';

// Stop words for keyword extraction
const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
    'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it',
    'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their'
]);

class RedditCrawlerService {
    constructor() {
        // Initialize OAuth client (optional)
        this.redditClient = null;
        this.initializeOAuthClient();
    }

    /**
     * Initialize snoowrap OAuth client if credentials are available
     */
    initializeOAuthClient() {
        if (REDDIT_CLIENT_ID && REDDIT_CLIENT_SECRET && REDDIT_REFRESH_TOKEN) {
            try {
                this.redditClient = new snoowrap({
                    userAgent: REDDIT_USER_AGENT,
                    clientId: REDDIT_CLIENT_ID,
                    clientSecret: REDDIT_CLIENT_SECRET,
                    refreshToken: REDDIT_REFRESH_TOKEN
                });
                console.log('✅ Reddit OAuth client initialized');
            } catch (error) {
                console.error('⚠️ Failed to initialize Reddit OAuth client:', error.message);
            }
        } else {
            console.log('ℹ️ Reddit OAuth not configured, using RapidAPI only');
        }
    }

    /**
     * Fetch trending memes from RapidAPI
     * @param {Object} options - Fetch options
     * @returns {Promise<Array>} Array of Reddit posts
     */
    async fetchTrendingMemes(options = {}) {
        const { limit = 20 } = options;

        try {
            console.log(`[Reddit] Fetching trending memes via RapidAPI (limit: ${limit})`);

            const [trendingResponse, topResponse] = await Promise.all([
                axios.get(`https://${RAPIDAPI_HOST}/memes/trending`, {
                    headers: {
                        'x-rapidapi-host': RAPIDAPI_HOST,
                        'x-rapidapi-key': RAPIDAPI_KEY
                    },
                    timeout: 15000
                }),
                axios.get(`https://${RAPIDAPI_HOST}/memes/top`, {
                    headers: {
                        'x-rapidapi-host': RAPIDAPI_HOST,
                        'x-rapidapi-key': RAPIDAPI_KEY
                    },
                    timeout: 15000
                })
            ]);

            // Combine results from both endpoints
            const trending = trendingResponse.data || [];
            const top = topResponse.data || [];
            const allMemes = [...trending, ...top];

            // Remove duplicates by URL
            const uniqueMemesMap = new Map();
            for (const meme of allMemes) {
                if (meme.url && !uniqueMemesMap.has(meme.url)) {
                    uniqueMemesMap.set(meme.url, meme);
                }
            }

            const uniqueMemes = Array.from(uniqueMemesMap.values());

            console.log(`[Reddit] Successfully fetched ${uniqueMemes.length} unique memes`);

            return uniqueMemes.slice(0, limit);
        } catch (error) {
            console.error('[Reddit] Error fetching trending memes:', error.message);
            if (error.response) {
                console.error('[Reddit] API Error:', {
                    status: error.response.status,
                    data: error.response.data
                });
            }
            throw new Error(`Failed to fetch Reddit memes from RapidAPI: ${error.message}`);
        }
    }

    /**
     * Fetch posts from subreddit using OAuth
     * @param {string} subreddit - Subreddit name
     * @param {Object} options - Fetch options
     * @returns {Promise<Array>} Array of Reddit posts
     */
    async fetchSubredditPostsOAuth(subreddit, options = {}) {
        if (!this.redditClient) {
            throw new Error('Reddit OAuth client not initialized. Please configure OAuth credentials.');
        }

        const {
            sort = 'hot',  // hot, new, top, rising
            limit = 10,
            timeframe = 'day' // hour, day, week, month, year, all
        } = options;

        try {
            let posts;
            const sub = this.redditClient.getSubreddit(subreddit);

            // Fetch based on sort type
            switch (sort) {
                case 'hot':
                    posts = await sub.getHot({ limit, time: timeframe });
                    break;
                case 'new':
                    posts = await sub.getNew({ limit });
                    break;
                case 'top':
                    posts = await sub.getTop({ limit, time: timeframe });
                    break;
                case 'rising':
                    posts = await sub.getRising({ limit });
                    break;
                default:
                    posts = await sub.getHot({ limit });
            }

            // Convert snoowrap posts to plain objects
            const plainPosts = [];
            for (const post of posts) {
                plainPosts.push({
                    id: post.id,
                    title: post.title,
                    subreddit: post.subreddit.display_name,
                    author: post.author.name,
                    selftext: post.selftext,
                    url: `https://reddit.com${post.permalink}`,
                    score: post.score,
                    num_comments: post.num_comments,
                    created_utc: post.created_utc,
                    thumbnail: post.thumbnail,
                    is_self: post.is_self
                });
            }

            return plainPosts;
        } catch (error) {
            console.error(`Error fetching r/${subreddit} via OAuth:`, error.message);
            throw error;
        }
    }

    /**
     * Fetch single Reddit post by URL using OAuth
     * @param {string} redditUrl - Reddit post URL
     * @returns {Promise<Object>} Reddit post data
     */
    async fetchRedditPostByUrl(redditUrl) {
        try {
            // Extract subreddit and post ID from URL
            const urlPattern = /reddit\.com\/r\/([^\/]+)\/comments\/([^\/]+)/;
            const match = redditUrl.match(urlPattern);

            if (!match) {
                throw new Error('Invalid Reddit URL format');
            }

            const [, subreddit, postId] = match;

            // Try OAuth method first
            if (this.redditClient) {
                try {
                    const submission = await this.redditClient.getSubmission(postId);
                    return {
                        id: submission.id,
                        title: submission.title,
                        subreddit: submission.subreddit.display_name,
                        author: submission.author.name,
                        selftext: submission.selftext,
                        url: `https://reddit.com${submission.permalink}`,
                        score: submission.score,
                        num_comments: submission.num_comments,
                        created_utc: submission.created_utc,
                        thumbnail: submission.thumbnail,
                        is_self: submission.is_self
                    };
                } catch (oauthError) {
                    console.warn('OAuth fetch failed, using fallback method');
                }
            }

            // Fallback: Return basic structure
            return {
                id: postId,
                title: `Post from r/${subreddit}`,
                subreddit,
                author: 'unknown',
                selftext: '',
                url: redditUrl,
                score: 0,
                num_comments: 0,
                created_utc: Date.now() / 1000,
                thumbnail: '',
                is_self: true
            };
        } catch (error) {
            console.error('Error fetching Reddit post by URL:', error.message);
            throw error;
        }
    }

    /**
     * Fetch posts from subreddit (auto-select method)
     * @param {string} subreddit - Subreddit name
     * @param {Object} options - Fetch options
     * @returns {Promise<Array>} Array of Reddit posts
     */
    async fetchSubredditPosts(subreddit, options = {}) {
        // Try OAuth first if available
        if (this.redditClient) {
            try {
                return await this.fetchSubredditPostsOAuth(subreddit, options);
            } catch (error) {
                console.warn('OAuth method failed, no fallback for subreddit posts');
                throw error;
            }
        }

        // For meme-related subreddits, use RapidAPI
        const memeSubreddits = ['memes', 'dankmemes', 'me_irl', 'wholesomememes'];
        if (memeSubreddits.includes(subreddit.toLowerCase())) {
            const memes = await this.fetchTrendingMemes(options);
            return memes.filter(m => m.subreddit?.toLowerCase() === subreddit.toLowerCase());
        }

        throw new Error('Reddit OAuth not configured and subreddit not supported by RapidAPI');
    }

    /**
     * Extract keywords from title
     * @param {string} title - Post title
     * @returns {Array<string>} Array of keywords
     */
    extractKeywords(title) {
        if (!title) return [];

        // Split into words and clean
        const words = title
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word =>
                word.length > 3 &&
                !STOP_WORDS.has(word) &&
                !/^\d+$/.test(word) // Filter out pure numbers
            );

        // Return up to 5 unique keywords
        return [...new Set(words)].slice(0, 5);
    }

    /**
     * Calculate trending score
     * @param {number} upvotes - Number of upvotes
     * @param {number} comments - Number of comments
     * @returns {number} Trending score (50-100)
     */
    calculateTrendingScore(upvotes, comments) {
        const rawScore = (upvotes + comments * 2) / 1000;
        return Math.max(50, Math.min(100, Math.round(rawScore)));
    }

    /**
     * Determine priority based on engagement
     * @param {number} upvotes - Number of upvotes
     * @returns {string} Priority level
     */
    determinePriority(upvotes) {
        if (upvotes > 10000) return 'high';
        if (upvotes > 5000) return 'medium';
        return 'low';
    }

    /**
     * Convert Reddit post to BlogPost format
     * @param {Object} redditPost - Reddit post data
     * @param {Object} options - Conversion options
     * @returns {Object} BlogPost data
     */
    convertRedditPostToBlogPost(redditPost, options = {}) {
        const {
            category = 'experience',
            tags = [],
            autoPublish = false,
            authorName = 'Star Reward Admin',
            authorEmail = 'admin@starreward.com'
        } = options;

        // Extract content
        const content = redditPost.selftext || redditPost.content || '';
        const title = redditPost.title || 'Untitled Reddit Post';
        const upvotes = redditPost.score || redditPost.ups || 0;
        const comments = redditPost.num_comments || 0;

        // For memes without selftext, create content from metadata
        let htmlContent;
        if (!content && redditPost.image) {
            // Meme with image but no text
            htmlContent = `
                <div class="meme-container text-center">
                    <img src="${redditPost.image}" alt="${title}" class="img-fluid rounded" style="max-width: 100%;">
                    <p class="mt-3 text-muted">
                        <i class="bi bi-arrow-up-circle"></i> ${upvotes.toLocaleString()} upvotes •
                        <i class="bi bi-chat"></i> ${comments} comments •
                        <i class="bi bi-reddit"></i> r/${redditPost.subreddit}
                    </p>
                </div>
            `;
        } else {
            // Convert Reddit markdown to HTML
            htmlContent = this.convertMarkdownToHtml(content);
        }

        // Generate excerpt
        const excerpt = content.length > 300
            ? content.substring(0, 300) + '...'
            : content || `${upvotes.toLocaleString()} upvotes • ${comments} comments`;

        // Extract keywords
        const keywords = this.extractKeywords(title);

        // Combine tags
        const allTags = [
            'reddit',
            'import',
            `r/${redditPost.subreddit}`,
            ...keywords,
            ...tags
        ];

        // Calculate metrics
        const trendingScore = this.calculateTrendingScore(upvotes, comments);
        const priority = this.determinePriority(upvotes);

        return {
            title,
            content: htmlContent || '<p>Nội dung sẽ được cập nhật sau.</p>', // Fallback content
            excerpt,
            category,
            tags: [...new Set(allTags)], // Remove duplicates
            authorName: `${authorName} (via u/${redditPost.author})`,
            authorEmail,
            authorRole: 'admin',
            status: autoPublish ? 'published' : 'draft',
            coverImage: redditPost.thumbnail && redditPost.thumbnail.startsWith('http')
                ? redditPost.thumbnail
                : redditPost.image || null,
            ageRange: {
                min: 0,
                max: 18
            },
            metadata: {
                source: 'reddit',
                subreddit: redditPost.subreddit,
                redditUrl: redditPost.url,
                redditAuthor: redditPost.author,
                redditScore: upvotes,
                redditComments: comments,
                trendingScore,
                priority,
                keywords,
                imageUrl: redditPost.image,
                importedAt: new Date()
            }
        };
    }

    /**
     * Convert Markdown to HTML
     * @param {string} markdown - Markdown text
     * @returns {string} HTML text
     */
    convertMarkdownToHtml(markdown) {
        if (!markdown) return '';

        let html = markdown;

        // Escape HTML entities
        html = html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Headers
        html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        html = html.replace(/_(.*?)_/g, '<em>$1</em>');

        // Strikethrough
        html = html.replace(/~~(.*?)~~/g, '<del>$1</del>');

        // Code blocks
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

        // Lists
        html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
        html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

        // Line breaks and paragraphs
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');

        // Wrap in paragraphs
        html = `<p>${html}</p>`;

        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>\s*<\/p>/g, '');

        return html;
    }

    /**
     * Sync Reddit posts to blog
     * @param {Object} params - Sync parameters
     * @returns {Promise<Object>} Sync results
     */
    async syncRedditToBlog(params = {}) {
        try {
            const {
                subreddit,
                category = 'experience',
                limit = 10,
                autoPublish = false,
                sort = 'hot',
                useMemes = false
            } = params;

            let posts;

            if (useMemes) {
                // Fetch trending memes from RapidAPI
                posts = await this.fetchTrendingMemes({ limit });
            } else if (subreddit) {
                // Fetch from specific subreddit
                posts = await this.fetchSubredditPosts(subreddit, { limit, sort });
            } else {
                throw new Error('Either subreddit or useMemes must be specified');
            }

            const results = {
                success: [],
                failed: [],
                total: posts.length
            };

            for (const post of posts) {
                try {
                    const blogPostData = this.convertRedditPostToBlogPost(post, {
                        category,
                        autoPublish
                    });

                    results.success.push({
                        title: blogPostData.title,
                        data: blogPostData
                    });
                } catch (error) {
                    results.failed.push({
                        post: post.title || post.url,
                        error: error.message
                    });
                }
            }

            return results;
        } catch (error) {
            console.error('Error syncing Reddit to blog:', error.message);
            throw error;
        }
    }
}

// Export singleton instance
module.exports = new RedditCrawlerService();
