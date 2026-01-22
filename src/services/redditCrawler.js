/**
 * Reddit Crawler Integration Service
 * Connects Star Reward with existing blog-corner API system
 */

const axios = require('axios');

// Blog Corner API Configuration
const BLOG_CORNER_API_URL = process.env.BLOG_CORNER_API_URL || 'http://localhost:30001/api/blog-corner';

class RedditCrawlerService {
    constructor() {
        this.apiUrl = BLOG_CORNER_API_URL;
    }

    /**
     * Fetch trends from Reddit via blog-corner API
     * @param {Object} params - Query parameters
     * @returns {Promise<Array>} Array of trends
     */
    async fetchRedditTrends(params = {}) {
        try {
            const queryParams = new URLSearchParams();

            if (params.category) queryParams.append('category', params.category);
            if (params.status) queryParams.append('status', params.status);
            if (params.limit) queryParams.append('limit', params.limit.toString());

            const url = `${this.apiUrl}/trends${queryParams.toString() ? `?${queryParams}` : ''}`;

            const response = await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            // Filter Reddit sources only
            const redditTrends = response.data.filter(trend =>
                trend.source && trend.source.toLowerCase().includes('reddit')
            );

            return redditTrends;
        } catch (error) {
            console.error('Error fetching Reddit trends:', error.message);
            throw new Error('Failed to fetch Reddit trends from blog-corner API');
        }
    }

    /**
     * Fetch single Reddit post by URL
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

            // Create a trend with Reddit URL
            const trendData = {
                title: `Reddit Post from r/${subreddit}`,
                category: 'education',
                source: `Reddit - r/${subreddit}`,
                description: `Imported from ${redditUrl}`,
                metadata: {
                    redditUrl,
                    subreddit,
                    postId,
                    importedAt: new Date()
                },
                status: 'new',
                priority: 'medium'
            };

            // For now, return mock data structure
            // In production, you would call actual Reddit API or scraper
            return {
                title: `Post from r/${subreddit}`,
                subreddit,
                postId,
                url: redditUrl,
                content: 'Content will be fetched from Reddit API',
                author: 'reddit_user',
                created_utc: Date.now() / 1000,
                score: 0,
                num_comments: 0
            };
        } catch (error) {
            console.error('Error fetching Reddit post:', error.message);
            throw error;
        }
    }

    /**
     * Fetch multiple posts from a subreddit
     * @param {string} subreddit - Subreddit name
     * @param {Object} options - Fetch options
     * @returns {Promise<Array>} Array of Reddit posts
     */
    async fetchSubredditPosts(subreddit, options = {}) {
        try {
            const {
                sort = 'hot',  // hot, new, top
                limit = 10,
                timeframe = 'day' // hour, day, week, month, year, all
            } = options;

            // Mock response structure
            // In production, integrate with Reddit API or your existing scraper
            const mockPosts = [];

            for (let i = 0; i < Math.min(limit, 5); i++) {
                mockPosts.push({
                    title: `Sample post ${i + 1} from r/${subreddit}`,
                    subreddit,
                    content: `This is sample content from r/${subreddit}. In production, this will contain actual Reddit post content.`,
                    author: `user_${i}`,
                    url: `https://reddit.com/r/${subreddit}/comments/abc${i}/`,
                    created_utc: Date.now() / 1000 - (i * 3600),
                    score: Math.floor(Math.random() * 1000),
                    num_comments: Math.floor(Math.random() * 100),
                    selftext: `Detailed content for post ${i + 1}...`
                });
            }

            return mockPosts;
        } catch (error) {
            console.error('Error fetching subreddit posts:', error.message);
            throw error;
        }
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

        // Generate excerpt
        const excerpt = content.length > 300
            ? content.substring(0, 300) + '...'
            : content;

        // Combine tags
        const allTags = [
            'reddit',
            'import',
            `r/${redditPost.subreddit}`,
            ...tags
        ];

        // Convert Reddit markdown to HTML (basic conversion)
        const htmlContent = this.convertMarkdownToHtml(content);

        return {
            title,
            content: htmlContent,
            excerpt,
            category,
            tags: allTags,
            authorName: `${authorName} (via u/${redditPost.author})`,
            authorEmail,
            authorRole: 'admin',
            status: autoPublish ? 'published' : 'draft',
            coverImage: null, // Reddit posts usually don't have cover images in selftext
            ageRange: {
                min: 0,
                max: 18
            },
            metadata: {
                source: 'reddit',
                subreddit: redditPost.subreddit,
                redditUrl: redditPost.url,
                redditAuthor: redditPost.author,
                redditScore: redditPost.score,
                redditComments: redditPost.num_comments,
                importedAt: new Date()
            }
        };
    }

    /**
     * Basic Markdown to HTML converter
     * @param {string} markdown - Markdown text
     * @returns {string} HTML text
     */
    convertMarkdownToHtml(markdown) {
        if (!markdown) return '';

        let html = markdown;

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold
        html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

        // Italic
        html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>');

        // Line breaks
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');

        // Wrap in paragraphs
        html = `<p>${html}</p>`;

        return html;
    }

    /**
     * Sync Reddit trends to blog posts
     * @param {Object} params - Sync parameters
     * @returns {Promise<Object>} Sync results
     */
    async syncRedditToBlog(params = {}) {
        try {
            const {
                subreddit,
                category = 'experience',
                limit = 10,
                autoPublish = false
            } = params;

            let posts;

            if (subreddit) {
                // Fetch from specific subreddit
                posts = await this.fetchSubredditPosts(subreddit, { limit });
            } else {
                // Fetch from blog-corner trends
                const trends = await this.fetchRedditTrends({ limit });
                posts = trends; // Trends are already in a compatible format
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
                        post,
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
