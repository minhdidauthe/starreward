const express = require('express');
const router = express.Router();
const CheckIn = require('../models/CheckIn');
const { Student, Reward } = require('../models/Basic');
const Notification = require('../models/Notification');
const moment = require('moment');

// Check-in page for a student
router.get('/:studentId', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        if (!student) {
            req.flash('danger', 'Không tìm thấy học sinh');
            return res.redirect('/');
        }

        const streak = await CheckIn.getStreak(student._id);

        // Get check-in history for calendar (last 60 days)
        const sixtyDaysAgo = moment().subtract(60, 'days').format('YYYY-MM-DD');
        const checkIns = await CheckIn.find({
            student: student._id,
            date: { $gte: sixtyDaysAgo }
        }).sort({ date: -1 });

        // Next streak bonus
        const bonuses = CheckIn.STREAK_BONUSES;
        let nextBonus = null;
        for (let i = bonuses.length - 1; i >= 0; i--) {
            if (streak.current < bonuses[i].days) {
                nextBonus = {
                    ...bonuses[i],
                    remaining: bonuses[i].days - streak.current
                };
            }
        }

        res.render('checkin/index.html', {
            student,
            streak,
            checkIns,
            nextBonus,
            streakBonuses: bonuses,
            today: moment().format('YYYY-MM-DD')
        });
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect('/');
    }
});

// Perform check-in
router.post('/:studentId', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        if (!student) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy học sinh' });
        }

        const today = moment().format('YYYY-MM-DD');

        // Check if already checked in today
        const existing = await CheckIn.findOne({ student: student._id, date: today });
        if (existing) {
            return res.status(400).json({ success: false, error: 'Hôm nay đã điểm danh rồi!' });
        }

        // Get streak info before check-in
        const streakBefore = await CheckIn.getStreak(student._id);
        const newStreakDay = (streakBefore.checkedInToday ? streakBefore.current : streakBefore.current + 1);

        // Base star for daily check-in
        let starsEarned = 1;
        let bonusMessage = '';

        // Check for streak bonuses
        const bonuses = CheckIn.STREAK_BONUSES;
        for (const bonus of bonuses) {
            if (newStreakDay === bonus.days) {
                starsEarned += bonus.bonus;
                bonusMessage = `🎉 ${bonus.label}! +${bonus.bonus} sao bonus!`;
                break;
            }
        }

        // Create check-in record
        await CheckIn.create({
            student: student._id,
            date: today,
            starsEarned,
            streakDay: newStreakDay
        });

        // Award stars
        await Reward.create({
            stars: starsEarned,
            reason: starsEarned > 1
                ? `Điểm danh ngày ${newStreakDay} (bonus streak)`
                : `Điểm danh hàng ngày`,
            student: student._id,
            is_penalty: false
        });
        await Student.updateOne({ _id: student._id }, { $inc: { total_stars: starsEarned } });

        // Create notification
        await Notification.notify(
            student._id,
            'checkin',
            `Điểm danh thành công!`,
            bonusMessage || `+${starsEarned} sao. Streak: ${newStreakDay} ngày`,
            { link: `/checkin/${student._id}` }
        );

        const streakAfter = await CheckIn.getStreak(student._id);

        res.json({
            success: true,
            starsEarned,
            streak: streakAfter,
            bonusMessage
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Đã có lỗi xảy ra!' });
    }
});

module.exports = router;
