const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    date: { type: String, required: true },  // YYYY-MM-DD format for easy querying
    starsEarned: { type: Number, default: 1 },
    streakDay: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now }
});

checkInSchema.index({ student: 1, date: 1 }, { unique: true });

// Streak bonus thresholds
const STREAK_BONUSES = [
    { days: 30, bonus: 25, label: '30 ngày liên tiếp' },
    { days: 14, bonus: 10, label: '14 ngày liên tiếp' },
    { days: 7, bonus: 5, label: '7 ngày liên tiếp' }
];

checkInSchema.statics.STREAK_BONUSES = STREAK_BONUSES;

// Calculate current streak for a student
checkInSchema.statics.getStreak = async function(studentId) {
    const checkIns = await this.find({ student: studentId })
        .sort({ date: -1 })
        .limit(60);

    if (checkIns.length === 0) return { current: 0, longest: 0, total: 0 };

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if today or yesterday was checked in (streak still active)
    const todayStr = formatDate(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDate(yesterday);

    const dates = checkIns.map(c => c.date);
    const streakActive = dates.includes(todayStr) || dates.includes(yesterdayStr);

    if (!streakActive) {
        // Streak broken
        const totalCheckIns = await this.countDocuments({ student: studentId });
        return { current: 0, longest: findLongestStreak(dates), total: totalCheckIns };
    }

    // Count current streak backwards from most recent
    let checkDate = dates.includes(todayStr) ? new Date(today) : new Date(yesterday);
    for (let i = 0; i < 365; i++) {
        const dateStr = formatDate(checkDate);
        if (dates.includes(dateStr)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    const totalCheckIns = await this.countDocuments({ student: studentId });
    return {
        current: currentStreak,
        longest: Math.max(currentStreak, findLongestStreak(dates)),
        total: totalCheckIns,
        checkedInToday: dates.includes(todayStr)
    };
};

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function findLongestStreak(sortedDates) {
    if (sortedDates.length === 0) return 0;
    // Sort ascending
    const dates = [...sortedDates].sort();
    let longest = 1;
    let current = 1;
    for (let i = 1; i < dates.length; i++) {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diff = (curr - prev) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
            current++;
            longest = Math.max(longest, current);
        } else if (diff > 1) {
            current = 1;
        }
    }
    return longest;
}

module.exports = mongoose.model('CheckIn', checkInSchema);
