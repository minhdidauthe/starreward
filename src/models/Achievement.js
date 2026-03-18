const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 300 },
    icon: { type: String, required: true },
    color: { type: String, default: '#fbbf24' },
    type: {
        type: String,
        enum: ['star_milestone', 'task_streak', 'checkin_streak', 'explore_count', 'idea_count', 'exam_score', 'special'],
        required: true
    },
    requirement: { type: Number, required: true },
    starsBonus: { type: Number, default: 0 },
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        default: 'common'
    },
    order: { type: Number, default: 0 }
});

const studentAchievementSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    achievement: { type: mongoose.Schema.Types.ObjectId, ref: 'Achievement', required: true },
    earnedAt: { type: Date, default: Date.now }
});

studentAchievementSchema.index({ student: 1, achievement: 1 }, { unique: true });

// Rarity colors
const rarityColors = {
    common: '#9ca3af',
    uncommon: '#22c55e',
    rare: '#3b82f6',
    epic: '#a855f7',
    legendary: '#f59e0b'
};

const rarityLabels = {
    common: 'Phổ thông',
    uncommon: 'Không phổ biến',
    rare: 'Hiếm',
    epic: 'Sử thi',
    legendary: 'Huyền thoại'
};

module.exports = {
    Achievement: mongoose.model('Achievement', achievementSchema),
    StudentAchievement: mongoose.model('StudentAchievement', studentAchievementSchema),
    rarityColors,
    rarityLabels
};
