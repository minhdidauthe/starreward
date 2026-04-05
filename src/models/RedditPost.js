const mongoose = require('mongoose');

/**
 * RedditPost Model - Cache Reddit posts for filtering and reuse
 */
const redditPostSchema = new mongoose.Schema({
    // Reddit Post Info
    redditId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    title: {
        type: String,
        required: true
    },

    content: {
        type: String,
        default: ''
    },

    url: {
        type: String,
        required: true
    },

    subreddit: {
        type: String,
        required: true,
        index: true
    },

    author: {
        type: String,
        default: 'unknown'
    },

    // Reddit Stats
    score: {
        type: Number,
        default: 0,
        index: true
    },

    numComments: {
        type: Number,
        default: 0
    },

    // Media
    image: {
        type: String,
        default: null
    },

    thumbnail: {
        type: String,
        default: null
    },

    // Reddit Timestamps
    redditCreatedAt: {
        type: Date,
        index: true
    },

    // Fetch metadata
    fetchedAt: {
        type: Date,
        default: Date.now,
        index: true
    },

    fetchParams: {
        sort: String,
        timeframe: String
    },

    // Processing status
    status: {
        type: String,
        enum: ['fetched', 'processing', 'published', 'rejected'],
        default: 'fetched',
        index: true
    },

    // Link to published BlogPost if published
    publishedPostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlogPost',
        default: null
    },

    publishedAt: {
        type: Date,
        default: null
    },

    // AI processing metadata
    aiProcessed: {
        type: Boolean,
        default: false
    },

    aiModel: {
        type: String,
        default: null
    },

    vietnameseTitle: {
        type: String,
        default: null
    },

    vietnameseContent: {
        type: String,
        default: null
    },

    suggestedCategory: {
        type: String,
        default: null
    },

    suggestedTags: [{
        type: String
    }]
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Indexes for efficient queries
redditPostSchema.index({ subreddit: 1, fetchedAt: -1 });
redditPostSchema.index({ status: 1, fetchedAt: -1 });
redditPostSchema.index({ score: -1, fetchedAt: -1 });
redditPostSchema.index({ redditCreatedAt: -1 });

// Static method to save fetched posts
redditPostSchema.statics.saveFetchedPosts = async function(posts, fetchParams = {}) {
    const results = {
        saved: 0,
        updated: 0,
        skipped: 0,
        errors: []
    };

    for (const post of posts) {
        try {
            const existing = await this.findOne({ redditId: post.id });

            if (existing) {
                // Update score and comment count if changed
                existing.score = post.score;
                existing.numComments = post.num_comments;
                existing.fetchedAt = new Date();
                await existing.save();
                results.updated++;
            } else {
                // Create new
                await this.create({
                    redditId: post.id,
                    title: post.title,
                    content: post.content || '',
                    url: post.url,
                    subreddit: post.subreddit,
                    author: post.author || 'unknown',
                    score: post.score,
                    numComments: post.num_comments,
                    image: post.image || null,
                    thumbnail: post.thumbnail || null,
                    redditCreatedAt: post.created ? new Date(post.created * 1000) : new Date(),
                    fetchParams: fetchParams
                });
                results.saved++;
            }
        } catch (error) {
            results.errors.push({
                postId: post.id,
                error: error.message
            });
        }
    }

    return results;
};

// Instance method to convert to API format
redditPostSchema.methods.toAPIFormat = function() {
    return {
        id: this.redditId,
        title: this.title,
        content: this.content,
        url: this.url,
        subreddit: this.subreddit,
        author: this.author,
        score: this.score,
        num_comments: this.numComments,
        image: this.image,
        thumbnail: this.thumbnail,
        created: this.redditCreatedAt ? Math.floor(this.redditCreatedAt.getTime() / 1000) : null,
        fetchedAt: this.fetchedAt,
        status: this.status,
        aiProcessed: this.aiProcessed,
        aiModel: this.aiModel,
        vietnameseTitle: this.vietnameseTitle,
        vietnameseContent: this.vietnameseContent,
        suggestedCategory: this.suggestedCategory,
        suggestedTags: this.suggestedTags,
        publishedAt: this.publishedAt
    };
};

const RedditPost = mongoose.model('RedditPost', redditPostSchema);

module.exports = RedditPost;
