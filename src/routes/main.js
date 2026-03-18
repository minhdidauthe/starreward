const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Student, DailyTask, Reward, Task } = require('../models/Basic');
const Notification = require('../models/Notification');
const moment = require('moment');

// Lazy-load achievement checker to avoid circular deps
let _checkAchievements = null;
function getAchievementChecker() {
    if (!_checkAchievements) {
        _checkAchievements = require('./achievements').checkAndAwardAchievements;
    }
    return _checkAchievements;
}

// Helper for reward level
const getRewardLevel = (stars) => {
    if (stars >= 50) return "🏆 Xuất sắc!";
    if (stars >= 30) return "🥇 Giỏi!";
    if (stars >= 20) return "🥈 Khá!";
    if (stars >= 10) return "🥉 Cố gắng!";
    return "💪 Hãy cố gắng hơn nhé!";
};

// Middleware to add global variables to templates
router.use((req, res, next) => {
    res.locals.get_reward_level = getRewardLevel;
    next();
});

router.get('/', async (req, res) => {
    try {
        const students = await Student.find({});
        res.render('index.html', { students });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

router.post('/add_student', async (req, res) => {
    try {
        const { name } = req.body;
        if (name) {
            await Student.create({ name });
            req.flash('success', `Đã thêm học sinh ${name}!`);
        }
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

router.get('/student/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        const dailyTasks = await DailyTask.find({});

        const startOfDay = moment().startOf('day').toDate();
        const endOfDay = moment().endOf('day').toDate();

        const rewards = await Reward.find({
            student: student._id,
            date: { $gte: startOfDay, $lte: endOfDay },
            task: { $ne: null }
        });

        // Convert to array of strings for Nunjucks 'in' operator compatibility
        const completedTasks = rewards.map(r => r.task.toString());

        res.render('student.html', {
            student,
            daily_tasks: dailyTasks,
            completed_tasks: completedTasks
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

router.post('/add_stars/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        let stars = parseInt(req.body.stars) || 0;
        let reason = req.body.reason || '';
        const isPenalty = req.body.is_penalty === 'on'; // Checkbox sends 'on'
        const taskId = req.body.task_id;

        let taskObj = null;
        if (taskId) {
            taskObj = await DailyTask.findById(taskId);
            if (taskObj) {
                stars = taskObj.default_stars;
                reason = taskObj.name;
            }
        }

        if (stars > 0 && reason) {
            let message = '';
            if (isPenalty) {
                stars = -stars;
                message = `Đã trừ ${Math.abs(stars)} sao vì ${reason}!`;
            } else {
                message = `Đã thêm ${stars} sao cho ${reason}!`;
            }

            await Reward.create({
                stars,
                reason,
                student: student._id,
                is_penalty: isPenalty,
                task: taskId || null
            });

            await Student.updateOne({ _id: student._id }, { $inc: { total_stars: stars } });

            // Notify
            await Notification.notify(
                student._id,
                isPenalty ? 'star_lost' : 'star_earned',
                isPenalty ? `Trừ ${Math.abs(stars)} sao` : `Nhận ${stars} sao`,
                reason,
                { link: `/student/${student._id}` }
            );

            // Check achievements (async, don't block)
            const updatedStudent = await Student.findById(student._id);
            getAchievementChecker()(updatedStudent).catch(e => console.error('Achievement check error:', e));

            req.flash(isPenalty ? 'warning' : 'success', message);
        }
        res.redirect(`/student/${student._id}`);
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
});

// APIs for AJAX calls
router.get('/get_tasks/:id', async (req, res) => {
    try {
        const tasks = await Task.find({ student: req.params.id }).sort({ due_date: 1 });
        const tasksFormatted = tasks.map(t => ({
            id: t._id,
            title: t.title,
            description: t.description,
            due_date: moment(t.due_date).format('YYYY-MM-DDTHH:mm'),
            is_completed: t.is_completed
        }));
        res.json(tasksFormatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/get_star_history/:id', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const page = parseInt(req.query.page) || 1;
        const perPage = 10;
        const isChart = req.query.is_chart === 'true';

        const startDate = moment().subtract(days, 'days').toDate();
        const rewards = await Reward.find({
            student: req.params.id,
            date: { $gte: startDate }
        }).sort({ date: 1 });

        const dailySummary = {};
        rewards.forEach(r => {
            const dateStr = moment(r.date).format('DD/MM/YYYY');
            if (!dailySummary[dateStr]) {
                dailySummary[dateStr] = { stars: 0, reasons: [] };
            }
            dailySummary[dateStr].stars += r.stars;
            dailySummary[dateStr].reasons.push(r.reason);
        });

        const summaryList = Object.keys(dailySummary).map(date => ({
            date,
            stars: dailySummary[date].stars,
            reasons: dailySummary[date].reasons
        })).sort((a, b) => moment(a.date, 'DD/MM/YYYY') - moment(b.date, 'DD/MM/YYYY'));

        if (isChart) {
            return res.json({
                daily_summary: summaryList,
                pagination: { current_page: 1, total_pages: 1, total_items: summaryList.length }
            });
        }

        const startIdx = (page - 1) * perPage;
        const paginated = summaryList.slice(startIdx, startIdx + perPage);

        res.json({
            daily_summary: paginated,
            pagination: {
                current_page: page,
                total_pages: Math.ceil(summaryList.length / perPage),
                total_items: summaryList.length
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Task Page
router.get('/add_task/:student_id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.student_id);
        res.render('add_task.html', { student });
    } catch (err) {
        res.redirect('/');
    }
});

router.post('/add_task/:student_id', async (req, res) => {
    try {
        const { title, description, due_date } = req.body;
        await Task.create({
            student: req.params.student_id,
            title,
            description,
            due_date: new Date(due_date)
        });
        req.flash('success', 'Đã thêm công việc mới!');
        res.redirect(`/student/${req.params.student_id}`);
    } catch (err) {
        console.error(err);
        res.redirect('back');
    }
});

// ============================================
// Reward History API
// ============================================
router.get('/get_reward_history/:id', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = 10;

        const total = await Reward.countDocuments({ student: req.params.id });
        const rewards = await Reward.find({ student: req.params.id })
            .sort({ date: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage);

        const rewardsFormatted = rewards.map(r => ({
            id: r._id,
            stars: r.stars,
            reason: r.reason,
            date: moment(r.date).format('DD/MM/YYYY HH:mm'),
            is_penalty: r.is_penalty
        }));

        res.json({
            rewards: rewardsFormatted,
            pagination: {
                current_page: page,
                total_pages: Math.ceil(total / perPage),
                total_items: total
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// Edit Reward
// ============================================
router.post('/edit_reward/:id', async (req, res) => {
    try {
        const reward = await Reward.findById(req.params.id);
        if (!reward) {
            req.flash('danger', 'Không tìm thấy ghi nhận sao!');
            return res.redirect('back');
        }

        const oldStars = reward.stars;
        let newStars = parseInt(req.body.stars) || 0;
        const isPenalty = req.body.is_penalty === 'true' || req.body.is_penalty === 'on';
        const reason = req.body.reason;

        if (isPenalty) {
            newStars = -Math.abs(newStars);
        }

        // Update reward
        reward.stars = newStars;
        reward.reason = reason;
        reward.is_penalty = isPenalty;
        await reward.save();

        // Update student's total stars (difference)
        const starsDiff = newStars - oldStars;
        await Student.updateOne(
            { _id: reward.student },
            { $inc: { total_stars: starsDiff } }
        );

        req.flash('success', 'Đã cập nhật ghi nhận sao!');
        res.redirect(`/student/${reward.student}`);
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Có lỗi xảy ra!');
        res.redirect('back');
    }
});

// ============================================
// Delete Reward
// ============================================
router.post('/delete_reward/:id', async (req, res) => {
    try {
        const reward = await Reward.findById(req.params.id);
        if (!reward) {
            req.flash('danger', 'Không tìm thấy ghi nhận sao!');
            return res.redirect('back');
        }

        const studentId = reward.student;
        const stars = reward.stars;

        // Remove reward
        await Reward.deleteOne({ _id: req.params.id });

        // Update student's total stars
        await Student.updateOne(
            { _id: studentId },
            { $inc: { total_stars: -stars } }
        );

        req.flash('success', 'Đã xóa ghi nhận sao!');
        res.redirect(`/student/${studentId}`);
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Có lỗi xảy ra!');
        res.redirect('back');
    }
});

// ============================================
// Complete Task
// ============================================
router.post('/complete_task/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            req.flash('danger', 'Không tìm thấy công việc!');
            return res.redirect('back');
        }

        task.is_completed = true;
        await task.save();

        req.flash('success', `Đã hoàn thành công việc "${task.title}"!`);
        res.redirect(`/student/${task.student}`);
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Có lỗi xảy ra!');
        res.redirect('back');
    }
});

// ============================================
// Delete Task
// ============================================
router.post('/delete_task/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            req.flash('danger', 'Không tìm thấy công việc!');
            return res.redirect('back');
        }

        const studentId = task.student;
        await Task.deleteOne({ _id: req.params.id });

        req.flash('success', 'Đã xóa công việc!');
        res.redirect(`/student/${studentId}`);
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Có lỗi xảy ra!');
        res.redirect('back');
    }
});

// ============================================
// Add Test Data (for demo purposes)
// ============================================
router.get('/add_test_data/:student_id', async (req, res) => {
    try {
        const studentId = req.params.student_id;
        const reasons = [
            'Học bài chăm chỉ',
            'Hoàn thành bài tập',
            'Giúp đỡ bạn bè',
            'Rửa bát',
            'Dọn phòng',
            'Đi ngủ đúng giờ',
            'Tập thể dục',
            'Đọc sách',
            'Vẽ tranh đẹp',
            'Ngoan ngoãn'
        ];

        // Generate test data for last 30 days
        for (let i = 0; i < 30; i++) {
            const date = moment().subtract(i, 'days').toDate();
            const numRewards = Math.floor(Math.random() * 3) + 1; // 1-3 rewards per day

            for (let j = 0; j < numRewards; j++) {
                const stars = Math.floor(Math.random() * 5) + 1; // 1-5 stars
                const reason = reasons[Math.floor(Math.random() * reasons.length)];
                const isPenalty = Math.random() < 0.1; // 10% chance of penalty

                await Reward.create({
                    stars: isPenalty ? -stars : stars,
                    reason: isPenalty ? `Vi phạm: ${reason}` : reason,
                    student: studentId,
                    is_penalty: isPenalty,
                    date: date
                });
            }
        }

        // Recalculate total stars
        const totalStars = await Reward.aggregate([
            { $match: { student: new mongoose.Types.ObjectId(studentId) } },
            { $group: { _id: null, total: { $sum: '$stars' } } }
        ]);

        const newTotal = totalStars[0]?.total || 0;
        await Student.updateOne({ _id: studentId }, { total_stars: newTotal });

        req.flash('success', 'Đã tạo dữ liệu test cho 30 ngày!');
        res.redirect(`/student/${studentId}`);
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Có lỗi khi tạo dữ liệu test!');
        res.redirect('back');
    }
});

// ============================================
// Clear Test Data
// ============================================
router.get('/clear_test_data/:student_id', async (req, res) => {
    try {
        const studentId = req.params.student_id;

        // Delete all rewards for this student
        await Reward.deleteMany({ student: studentId });

        // Reset total stars
        await Student.updateOne({ _id: studentId }, { total_stars: 0 });

        req.flash('success', 'Đã xóa tất cả dữ liệu!');
        res.redirect(`/student/${studentId}`);
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Có lỗi khi xóa dữ liệu!');
        res.redirect('back');
    }
});

// ============================================
// Update Student Avatar
// ============================================
router.post('/api/student/:id/avatar', async (req, res) => {
    try {
        const { avatar } = req.body;
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy học sinh' });
        }

        student.avatar = avatar;
        await student.save();

        res.json({ success: true, avatar: student.avatar });
    } catch (err) {
        console.error('Error updating avatar:', err);
        res.status(500).json({ success: false, error: 'Không thể cập nhật avatar' });
    }
});

module.exports = router;
