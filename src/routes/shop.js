const express = require('express');
const router = express.Router();
const { ShopItem, Purchase, categoryLabels, categoryIcons } = require('../models/Shop');
const { Student, Reward } = require('../models/Basic');
const Notification = require('../models/Notification');

// Shop page
router.get('/:studentId', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        if (!student) {
            req.flash('danger', 'Không tìm thấy học sinh');
            return res.redirect('/');
        }

        const category = req.query.category;
        const query = { isActive: true };
        if (category && category !== 'all') {
            query.category = category;
        }

        const items = await ShopItem.find(query).sort({ order: 1, cost: 1 });

        // Get recent purchases
        const recentPurchases = await Purchase.find({ student: student._id })
            .sort({ purchasedAt: -1 })
            .limit(10);

        // Category counts
        const categoryCounts = await ShopItem.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        res.render('shop/index.html', {
            student,
            items,
            recentPurchases,
            categoryCounts,
            currentCategory: category || 'all',
            categoryLabels,
            categoryIcons
        });
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect('/');
    }
});

// Purchase item
router.post('/:studentId/buy/:itemId', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        if (!student) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy học sinh' });
        }

        const item = await ShopItem.findById(req.params.itemId);
        if (!item || !item.isActive) {
            return res.status(404).json({ success: false, error: 'Vật phẩm không tồn tại' });
        }

        // Check stock
        if (item.stock !== -1 && item.stock <= 0) {
            return res.status(400).json({ success: false, error: 'Vật phẩm đã hết hàng' });
        }

        // Check balance
        if (student.total_stars < item.cost) {
            return res.status(400).json({
                success: false,
                error: `Không đủ sao! Cần ${item.cost} sao, hiện có ${student.total_stars} sao`
            });
        }

        // Deduct stars
        await Reward.create({
            stars: -item.cost,
            reason: `Mua: ${item.name}`,
            student: student._id,
            is_penalty: true
        });
        await Student.updateOne({ _id: student._id }, { $inc: { total_stars: -item.cost } });

        // Decrease stock
        if (item.stock !== -1) {
            await ShopItem.updateOne({ _id: item._id }, { $inc: { stock: -1 } });
        }

        // Create purchase record
        const purchase = await Purchase.create({
            student: student._id,
            item: item._id,
            itemName: item.name,
            cost: item.cost
        });

        // Notify
        await Notification.notify(
            student._id,
            'shop_purchase',
            `Đã mua: ${item.name}`,
            `Đã trừ ${item.cost} sao. Số dư: ${student.total_stars - item.cost} sao`,
            { link: `/shop/${student._id}` }
        );

        const updatedStudent = await Student.findById(student._id);

        res.json({
            success: true,
            purchase,
            remainingStars: updatedStudent.total_stars
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Đã có lỗi xảy ra!' });
    }
});

// Purchase history
router.get('/:studentId/history', async (req, res) => {
    try {
        const student = await Student.findById(req.params.studentId);
        if (!student) {
            req.flash('danger', 'Không tìm thấy học sinh');
            return res.redirect('/');
        }

        const purchases = await Purchase.find({ student: student._id })
            .populate('item')
            .sort({ purchasedAt: -1 });

        res.render('shop/history.html', {
            student,
            purchases,
            categoryLabels
        });
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect('/');
    }
});

module.exports = router;
