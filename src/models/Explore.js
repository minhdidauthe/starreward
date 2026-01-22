const mongoose = require('mongoose');

// Category Schema - for grouping activities
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    icon: { type: String, default: 'fa-compass' },
    color: { type: String, default: 'primary' }, // primary, success, warning, danger, info
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
});

// Activity Schema - individual activities/games
const activitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'ExploreCategory' },
    type: {
        type: String,
        enum: ['game', 'story', 'video', 'quiz', 'craft', 'music', 'puzzle', 'experiment'],
        default: 'game'
    },
    thumbnail: { type: String },
    icon: { type: String, default: 'fa-gamepad' },
    color: { type: String, default: 'primary' },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'easy'
    },
    ageRange: {
        min: { type: Number, default: 6 },
        max: { type: Number, default: 12 }
    },
    duration: { type: Number, default: 10 }, // in minutes
    starsReward: { type: Number, default: 5 },
    content: { type: mongoose.Schema.Types.Mixed }, // Flexible content storage
    instructions: { type: String },
    materials: [{ type: String }], // For craft activities
    playCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isNewActivity: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

// User Activity Progress
const activityProgressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    activity: { type: mongoose.Schema.Types.ObjectId, ref: 'ExploreActivity' },
    completedAt: { type: Date },
    score: { type: Number, default: 0 },
    starsEarned: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 }, // in seconds
    attempts: { type: Number, default: 0 }
});

const ExploreCategory = mongoose.model('ExploreCategory', categorySchema);
const ExploreActivity = mongoose.model('ExploreActivity', activitySchema);
const ActivityProgress = mongoose.model('ActivityProgress', activityProgressSchema);

module.exports = { ExploreCategory, ExploreActivity, ActivityProgress };
