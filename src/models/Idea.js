const mongoose = require('mongoose');

// AI Analysis Result Schema
const aiAnalysisSchema = new mongoose.Schema({
    feasibility: {
        score: { type: Number, min: 0, max: 100, default: 0 },
        level: { type: String, enum: ['very_low', 'low', 'medium', 'high', 'very_high'], default: 'medium' },
        summary: { type: String }
    },
    strengths: [{ type: String }],
    challenges: [{ type: String }],
    suggestions: [{ type: String }],
    resources: [{ type: String }],
    estimatedEffort: { type: String, enum: ['easy', 'medium', 'hard', 'expert'], default: 'medium' },
    categories: [{ type: String }],
    keywords: [{ type: String }],
    encouragement: { type: String },
    analyzedAt: { type: Date, default: Date.now }
}, { _id: false });

// Comment Schema
const commentSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    authorName: { type: String },
    content: { type: String, required: true, maxlength: 500 },
    createdAt: { type: Date, default: Date.now }
});

// Idea Schema
const ideaSchema = new mongoose.Schema({
    title: { type: String, required: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 5000 },
    summary: { type: String, maxlength: 300 },

    // Author
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    studentName: { type: String },

    // Categorization
    category: {
        type: String,
        enum: ['invention', 'app', 'game', 'story', 'art', 'science', 'social', 'environment', 'education', 'other'],
        default: 'other'
    },
    tags: [{ type: String, maxlength: 30 }],

    // AI Analysis
    aiAnalysis: aiAnalysisSchema,
    isAnalyzed: { type: Boolean, default: false },

    // Engagement
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    likeCount: { type: Number, default: 0 },
    comments: [commentSchema],
    commentCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },

    // Status
    status: {
        type: String,
        enum: ['draft', 'published', 'featured', 'archived'],
        default: 'published'
    },
    isFeatured: { type: Boolean, default: false },

    // Rewards
    starsEarned: { type: Number, default: 0 },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes
ideaSchema.index({ student: 1, createdAt: -1 });
ideaSchema.index({ category: 1, status: 1 });
ideaSchema.index({ tags: 1 });
ideaSchema.index({ likeCount: -1 });
ideaSchema.index({ 'aiAnalysis.feasibility.score': -1 });

// Pre-save middleware
ideaSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    this.likeCount = this.likes.length;
    this.commentCount = this.comments.length;
    next();
});

// Category Labels (Vietnamese)
const categoryLabels = {
    invention: 'Phát minh',
    app: 'Ứng dụng',
    game: 'Trò chơi',
    story: 'Câu chuyện',
    art: 'Nghệ thuật',
    science: 'Khoa học',
    social: 'Xã hội',
    environment: 'Môi trường',
    education: 'Giáo dục',
    other: 'Khác'
};

// Category Icons
const categoryIcons = {
    invention: 'fa-lightbulb',
    app: 'fa-mobile-alt',
    game: 'fa-gamepad',
    story: 'fa-book',
    art: 'fa-palette',
    science: 'fa-flask',
    social: 'fa-users',
    environment: 'fa-leaf',
    education: 'fa-graduation-cap',
    other: 'fa-star'
};

// Category Colors
const categoryColors = {
    invention: 'warning',
    app: 'primary',
    game: 'danger',
    story: 'info',
    art: 'secondary',
    science: 'success',
    social: 'primary',
    environment: 'success',
    education: 'info',
    other: 'secondary'
};

module.exports = {
    Idea: mongoose.model('Idea', ideaSchema),
    categoryLabels,
    categoryIcons,
    categoryColors
};
