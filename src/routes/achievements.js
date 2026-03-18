const express = require('express');
const router = express.Router();
const { Achievement, StudentAchievement, rarityColors, rarityLabels } = require('../models/Achievement');
const { Student, Reward } = require('../models/Basic');
const CheckIn = require('../models/CheckIn');
const Notification = require('../models/Notification');

// Achievements page for a student
router.get('/:studentId', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        if (!student) {
            req.flash('danger', 'Không tìm thấy học sinh');
            return res.redirect('/');
        }

        const allAchievements = await Achievement.find({}).sort({ order: 1 });
        const earned = await StudentAchievement.find({ student: student._id })
            .populate('achievement');
        const earnedIds = earned.map(e => e.achievement._id.toString());

        // Group by type
        const grouped = {};
        allAchievements.forEach(ach => {
            if (!grouped[ach.type]) grouped[ach.type] = [];
            grouped[ach.type].push({
                ...ach.toObject(),
                earned: earnedIds.includes(ach._id.toString()),
                earnedAt: earned.find(e => e.achievement._id.toString() === ach._id.toString())?.earnedAt
            });
        });

        const typeLabels = {
            star_milestone: 'Cột mốc Sao',
            checkin_streak: 'Streak Điểm danh',
            task_streak: 'Hoàn thành Task',
            explore_count: 'Khám phá',
            idea_count: 'Ý tưởng',
            exam_score: 'Thi cử',
            special: 'Đặc biệt'
        };

        res.render('achievements/index.html', {
            student,
            grouped,
            typeLabels,
            rarityColors,
            rarityLabels,
            earnedCount: earned.length,
            totalCount: allAchievements.length
        });
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect('/');
    }
});

// Check and award achievements (called after star changes, check-ins, etc.)
router.post('/check/:studentId', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        if (!student) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy' });
        }

        const newAchievements = await checkAndAwardAchievements(student);

        res.json({ success: true, newAchievements });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Core logic: check all achievements for a student
async function checkAndAwardAchievements(student) {
    const allAchievements = await Achievement.find({});
    const earned = await StudentAchievement.find({ student: student._id });
    const earnedIds = new Set(earned.map(e => e.achievement.toString()));

    const newlyEarned = [];

    for (const ach of allAchievements) {
        if (earnedIds.has(ach._id.toString())) continue;

        let qualified = false;

        switch (ach.type) {
            case 'star_milestone':
                qualified = student.total_stars >= ach.requirement;
                break;

            case 'checkin_streak': {
                const streak = await CheckIn.getStreak(student._id);
                qualified = streak.current >= ach.requirement;
                break;
            }

            case 'task_streak': {
                const { Task } = require('../models/Basic');
                const completedCount = await Task.countDocuments({
                    student: student._id,
                    is_completed: true
                });
                qualified = completedCount >= ach.requirement;
                break;
            }

            case 'explore_count': {
                try {
                    const { ActivityProgress } = require('../models/Explore');
                    const exploreCount = await ActivityProgress.countDocuments({ user: student._id });
                    qualified = exploreCount >= ach.requirement;
                } catch (e) { /* model may not exist */ }
                break;
            }

            case 'idea_count': {
                try {
                    const { Idea } = require('../models/Idea');
                    const ideaCount = await Idea.countDocuments({
                        student: student._id,
                        status: { $in: ['published', 'featured'] }
                    });
                    qualified = ideaCount >= ach.requirement;
                } catch (e) { /* model may not exist */ }
                break;
            }

            case 'exam_score': {
                try {
                    const { ExamSchedule } = require('../models/Exam');
                    const topScore = await ExamSchedule.findOne({
                        student: student._id,
                        is_completed: true
                    }).sort({ score: -1 });
                    qualified = topScore && topScore.score >= ach.requirement;
                } catch (e) { /* model may not exist */ }
                break;
            }
        }

        if (qualified) {
            await StudentAchievement.create({
                student: student._id,
                achievement: ach._id
            });

            // Award bonus stars
            if (ach.starsBonus > 0) {
                await Reward.create({
                    stars: ach.starsBonus,
                    reason: `Huy hiệu: ${ach.name}`,
                    student: student._id,
                    is_penalty: false
                });
                await Student.updateOne({ _id: student._id }, { $inc: { total_stars: ach.starsBonus } });
            }

            // Notify
            await Notification.notify(
                student._id,
                'achievement',
                `Đạt huy hiệu: ${ach.name}!`,
                `${ach.description}${ach.starsBonus ? ` +${ach.starsBonus} sao bonus!` : ''}`,
                { link: `/achievements/${student._id}` }
            );

            newlyEarned.push(ach);
        }
    }

    return newlyEarned;
}

module.exports = router;
module.exports.checkAndAwardAchievements = checkAndAwardAchievements;
