/**
 * Direct Reddit JSON Crawler
 * No OAuth, No RapidAPI - Just simple HTTP requests to Reddit's public JSON API
 */

const axios = require('axios');

class DirectRedditCrawler {
    constructor() {
        this.userAgent = 'StarReward/1.0 (Educational Platform)';
    }

    /**
     * Fetch posts from any subreddit using public JSON API
     * @param {string} subreddit - Subreddit name (e.g., "parenting", "education")
     * @param {Object} options - Options
     * @returns {Promise<Array>} Array of posts
     */
    async fetchSubredditPosts(subreddit, options = {}) {
        const {
            sort = 'hot',  // hot, new, top, rising
            limit = 25,
            timeframe = 'day'  // hour, day, week, month, year, all (for 'top' sort)
        } = options;

        try {
            console.log(`[Reddit Direct] Fetching r/${subreddit} (${sort}, limit: ${limit})`);

            // Build URL
            let url = `https://www.reddit.com/r/${subreddit}/${sort}.json?limit=${limit}`;
            if (sort === 'top') {
                url += `&t=${timeframe}`;
            }

            // Fetch with proper headers
            const response = await axios.get(url, {
                headers: {
                    'User-Agent': this.userAgent
                },
                timeout: 15000
            });

            if (!response.data || !response.data.data || !response.data.data.children) {
                throw new Error('Invalid response from Reddit');
            }

            // Extract posts
            const posts = response.data.data.children
                .map(child => child.data)
                .filter(post => !post.stickied)  // Remove stickied posts
                .map(post => this.normalizePost(post));

            console.log(`[Reddit Direct] Successfully fetched ${posts.length} posts from r/${subreddit}`);

            return posts;

        } catch (error) {
            console.error(`[Reddit Direct] Error fetching r/${subreddit}:`, error.message);

            if (error.response) {
                if (error.response.status === 403) {
                    throw new Error('Subreddit is private or restricted');
                } else if (error.response.status === 404) {
                    throw new Error('Subreddit not found');
                } else if (error.response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later');
                }
            }

            throw new Error(`Failed to fetch from r/${subreddit}: ${error.message}`);
        }
    }

    /**
     * Fetch single post by URL
     * @param {string} redditUrl - Reddit post URL
     * @returns {Promise<Object>} Post object
     */
    async fetchPostByUrl(redditUrl) {
        try {
            // Convert URL to JSON endpoint
            let jsonUrl = redditUrl.replace(/\/$/, '') + '.json';

            console.log(`[Reddit Direct] Fetching post: ${jsonUrl}`);

            const response = await axios.get(jsonUrl, {
                headers: {
                    'User-Agent': this.userAgent
                },
                timeout: 15000
            });

            if (!response.data || !response.data[0] || !response.data[0].data) {
                throw new Error('Invalid response from Reddit');
            }

            const postData = response.data[0].data.children[0].data;
            const post = this.normalizePost(postData);

            console.log(`[Reddit Direct] Successfully fetched post: ${post.title}`);

            return post;

        } catch (error) {
            console.error(`[Reddit Direct] Error fetching post:`, error.message);
            throw new Error(`Failed to fetch Reddit post: ${error.message}`);
        }
    }

    /**
     * Normalize Reddit post data to consistent format
     * @param {Object} post - Raw Reddit post data
     * @returns {Object} Normalized post
     */
    normalizePost(post) {
        return {
            id: post.id,
            title: post.title,
            subreddit: post.subreddit,
            author: post.author,
            selftext: post.selftext || '',
            url: `https://reddit.com${post.permalink}`,
            score: post.score || post.ups || 0,
            num_comments: post.num_comments || 0,
            created_utc: post.created_utc,
            thumbnail: post.thumbnail && post.thumbnail.startsWith('http') ? post.thumbnail : null,
            is_self: post.is_self,
            image: this.extractImageUrl(post),
            content: post.selftext || ''
        };
    }

    /**
     * Extract image URL from Reddit post
     * @param {Object} post - Reddit post data
     * @returns {string|null} Image URL
     */
    extractImageUrl(post) {
        // Priority order for image extraction

        // 1. Direct image upload (i.redd.it)
        if (post.url && post.url.includes('i.redd.it')) {
            return post.url;
        }

        // 2. Preview images
        if (post.preview && post.preview.images && post.preview.images[0]) {
            const source = post.preview.images[0].source;
            if (source && source.url) {
                // Decode HTML entities in URL
                return source.url.replace(/&amp;/g, '&');
            }
        }

        // 3. Media metadata (galleries)
        if (post.media_metadata) {
            const firstMedia = Object.values(post.media_metadata)[0];
            if (firstMedia && firstMedia.s && firstMedia.s.u) {
                return firstMedia.s.u.replace(/&amp;/g, '&');
            }
        }

        // 4. Thumbnail (fallback)
        if (post.thumbnail && post.thumbnail.startsWith('http')) {
            return post.thumbnail;
        }

        return null;
    }

    /**
     * Convert Reddit post to BlogPost format
     * (Same as redditCrawler.js for consistency)
     */
    convertToBlogPost(redditPost, options = {}) {
        const {
            category = 'experience',
            tags = [],
            autoPublish = false,
            authorName = 'Star Reward Admin',
            authorEmail = 'admin@starreward.com'
        } = options;

        const content = redditPost.selftext || redditPost.content || '';
        const title = redditPost.title || 'Untitled Reddit Post';
        const upvotes = redditPost.score || 0;
        const comments = redditPost.num_comments || 0;

        // Generate HTML content
        let htmlContent;
        if (!content && redditPost.image) {
            // Image-only post
            htmlContent = `
                <div class="reddit-post-container text-center">
                    <img src="${redditPost.image}" alt="${title}" class="img-fluid rounded" style="max-width: 100%;">
                    <p class="mt-3 text-muted">
                        <i class="bi bi-arrow-up-circle"></i> ${upvotes.toLocaleString()} upvotes •
                        <i class="bi bi-chat"></i> ${comments} comments •
                        <i class="bi bi-reddit"></i> r/${redditPost.subreddit}
                    </p>
                </div>
            `;
        } else {
            // Convert markdown to HTML
            htmlContent = this.markdownToHtml(content);
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
            content: htmlContent || '<p>Nội dung sẽ được cập nhật sau.</p>',
            excerpt,
            category,
            tags: [...new Set(allTags)],
            authorName: `${authorName} (via u/${redditPost.author})`,
            authorEmail,
            authorRole: 'admin',
            status: autoPublish ? 'published' : 'draft',
            coverImage: redditPost.thumbnail || redditPost.image || null,
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
     * Extract keywords from title
     */
    extractKeywords(title) {
        if (!title) return [];

        const stopWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'this', 'that', 'these', 'those'
        ]);

        const words = title
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word =>
                word.length > 3 &&
                !stopWords.has(word) &&
                !/^\d+$/.test(word)
            );

        return [...new Set(words)].slice(0, 5);
    }

    /**
     * Calculate trending score
     */
    calculateTrendingScore(upvotes, comments) {
        const rawScore = (upvotes + comments * 2) / 1000;
        return Math.max(50, Math.min(100, Math.round(rawScore)));
    }

    /**
     * Determine priority
     */
    determinePriority(upvotes) {
        if (upvotes > 10000) return 'high';
        if (upvotes > 5000) return 'medium';
        return 'low';
    }

    /**
     * Simple Markdown to HTML converter
     */
    markdownToHtml(markdown) {
        if (!markdown) return '';

        let html = markdown;

        // Escape HTML
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

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

        // Line breaks
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n/g, '<br>');

        // Wrap in paragraphs
        html = `<p>${html}</p>`;
        html = html.replace(/<p><\/p>/g, '');

        return html;
    }
}

module.exports = new DirectRedditCrawler();
