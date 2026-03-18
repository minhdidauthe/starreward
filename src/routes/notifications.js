const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

// Get notifications for a student (JSON API)
router.get('/api/:studentId', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const notifications = await Notification.find({ student: req.params.studentId })
            .sort({ createdAt: -1 })
            .limit(limit);

        const unreadCount = await Notification.countDocuments({
            student: req.params.studentId,
            isRead: false
        });

        res.json({ success: true, notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Mark one as read
router.post('/api/:id/read', async (req, res) => {
    try {
        await Notification.updateOne({ _id: req.params.id }, { isRead: true });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Mark all as read for a student
router.post('/api/:studentId/read-all', async (req, res) => {
    try {
        await Notification.updateMany(
            { student: req.params.studentId, isRead: false },
            { isRead: true }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Notifications page
router.get('/:studentId', async (req, res) => {
    try {
        const { Student } = require('../models/Basic');
        const student = await Student.findById(req.params.studentId);
        if (!student) {
            req.flash('danger', 'Không tìm thấy học sinh');
            return res.redirect('/');
        }

        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            Notification.find({ student: req.params.studentId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Notification.countDocuments({ student: req.params.studentId })
        ]);

        // Mark displayed as read
        const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
        if (unreadIds.length > 0) {
            await Notification.updateMany({ _id: { $in: unreadIds } }, { isRead: true });
        }

        res.render('notifications/index.html', {
            student,
            notifications,
            pagination: {
                page,
                totalPages: Math.ceil(total / limit),
                total
            }
        });
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect('/');
    }
});

module.exports = router;
