const mongoose = require('mongoose');

// Comment Schema for Blog
const blogCommentSchema = new mongoose.Schema({
    authorName: { type: String, required: true, maxlength: 100 },
    authorEmail: { type: String, maxlength: 100 },
    content: { type: String, required: true, maxlength: 1000 },
    isParent: { type: Boolean, default: true }, // true = phụ huynh, false = giáo viên/khác
    createdAt: { type: Date, default: Date.now }
});

// Blog Post Schema
const blogPostSchema = new mongoose.Schema({
    // Content
    title: { type: String, required: true, maxlength: 200 },
    slug: { type: String, unique: true },
    excerpt: { type: String, maxlength: 500 },
    content: { type: String, required: true },

    // Author
    authorName: { type: String, required: true, maxlength: 100 },
    authorEmail: { type: String, maxlength: 100 },
    authorRole: {
        type: String,
        enum: ['parent', 'teacher', 'expert', 'admin'],
        default: 'parent'
    },
    authorAvatar: { type: String },

    // Categorization
    category: {
        type: String,
        enum: [
            'education',      // Giáo dục
            'psychology',     // Tâm lý
            'health',         // Sức khỏe
            'nutrition',      // Dinh dưỡng
            'activities',     // Hoạt động
            'discipline',     // Kỷ luật
            'communication',  // Giao tiếp
            'technology',     // Công nghệ
            'experience',     // Kinh nghiệm
            'other'           // Khác
        ],
        default: 'experience'
    },
    tags: [{ type: String, maxlength: 30 }],

    // Age range relevance
    ageRange: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 18 }
    },

    // Media
    coverImage: { type: String },

    // Engagement
    likes: { type: Number, default: 0 },
    likedBy: [{ type: String }], // Store session IDs or emails
    comments: [blogCommentSchema],
    commentCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },

    // Bookmarks
    bookmarkedBy: [{ type: String }],
    bookmarkCount: { type: Number, default: 0 },

    // Status
    status: {
        type: String,
        enum: ['draft', 'pending', 'published', 'featured', 'archived'],
        default: 'published'
    },
    isFeatured: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },

    // SEO
    metaTitle: { type: String, maxlength: 100 },
    metaDescription: { type: String, maxlength: 200 },

    // Reading
    readingTime: { type: Number, default: 5 }, // minutes

    // Timestamps
    publishedAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Indexes
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ category: 1, status: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ publishedAt: -1 });
blogPostSchema.index({ viewCount: -1 });
blogPostSchema.index({ likes: -1 });

// Pre-save middleware
blogPostSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    this.commentCount = this.comments.length;
    this.bookmarkCount = this.bookmarkedBy.length;
    this.likes = this.likedBy.length;

    // Generate slug if not exists
    if (!this.slug) {
        this.slug = this.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
    }

    // Calculate reading time (words / 200 words per minute)
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.max(1, Math.ceil(wordCount / 200));

    // Set published date
    if (this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }

    next();
});

// Category Labels (Vietnamese)
const categoryLabels = {
    education: 'Giáo dục',
    psychology: 'Tâm lý trẻ',
    health: 'Sức khỏe',
    nutrition: 'Dinh dưỡng',
    activities: 'Hoạt động',
    discipline: 'Kỷ luật tích cực',
    communication: 'Giao tiếp',
    technology: 'Công nghệ & Trẻ em',
    experience: 'Kinh nghiệm',
    other: 'Khác'
};

// Category Icons
const categoryIcons = {
    education: 'fa-graduation-cap',
    psychology: 'fa-brain',
    health: 'fa-heartbeat',
    nutrition: 'fa-apple-alt',
    activities: 'fa-running',
    discipline: 'fa-balance-scale',
    communication: 'fa-comments',
    technology: 'fa-laptop',
    experience: 'fa-book-reader',
    other: 'fa-folder'
};

// Category Colors
const categoryColors = {
    education: 'primary',
    psychology: 'info',
    health: 'danger',
    nutrition: 'success',
    activities: 'warning',
    discipline: 'secondary',
    communication: 'primary',
    technology: 'info',
    experience: 'success',
    other: 'secondary'
};

// Author Role Labels
const roleLabels = {
    parent: 'Phụ huynh',
    teacher: 'Giáo viên',
    expert: 'Chuyên gia',
    admin: 'Quản trị viên'
};

module.exports = {
    BlogPost: mongoose.model('BlogPost', blogPostSchema),
    categoryLabels,
    categoryIcons,
    categoryColors,
    roleLabels
};
