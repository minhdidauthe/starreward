const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Student, DailyTask, Reward, Task } = require('../models/Basic');
const moment = require('moment');

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

        const completedTasks = new Set(rewards.map(r => r.task.toString()));

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

// Other actions (complete, delete task, etc.) can be added similarly

module.exports = router;
