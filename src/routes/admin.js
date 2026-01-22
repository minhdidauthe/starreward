const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { isAdmin } = require('./auth');

// ============================================
// Admin Dashboard
// ============================================
router.get('/dashboard', isAdmin, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalParents = await User.countDocuments({ role: 'parent' });
        const totalTeachers = await User.countDocuments({ role: 'teacher' });
        const totalAdmins = await User.countDocuments({ role: 'admin' });

        // Get recent users (last 10)
        const recentUsers = await User.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select('-password');

        res.render('admin/dashboard.html', {
            stats: {
                totalUsers,
                totalStudents,
                totalParents,
                totalTeachers,
                totalAdmins
            },
            recentUsers
        });
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect('/');
    }
});

// ============================================
// User Management - List Users
// ============================================
router.get('/users', isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const roleFilter = req.query.role || '';

        // Build query
        let query = {};
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { fullName: { $regex: search, $options: 'i' } }
            ];
        }
        if (roleFilter) {
            query.role = roleFilter;
        }

        const totalUsers = await User.countDocuments(query);
        const totalPages = Math.ceil(totalUsers / limit);

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.render('admin/users.html', {
            users,
            currentPage: page,
            totalPages,
            totalUsers,
            search,
            roleFilter
        });
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect('/admin/dashboard');
    }
});

// ============================================
// User Management - View User Detail
// ============================================
router.get('/users/:id', isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            req.flash('danger', 'Không tìm thấy người dùng!');
            return res.redirect('/admin/users');
        }

        res.render('admin/user-detail.html', { user });
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect('/admin/users');
    }
});

// ============================================
// User Management - Edit User Form
// ============================================
router.get('/users/:id/edit', isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            req.flash('danger', 'Không tìm thấy người dùng!');
            return res.redirect('/admin/users');
        }

        res.render('admin/user-edit.html', { user });
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect('/admin/users');
    }
});

// ============================================
// User Management - Update User
// ============================================
router.post('/users/:id/edit', isAdmin, async (req, res) => {
    try {
        const { fullName, email, role, username } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            req.flash('danger', 'Không tìm thấy người dùng!');
            return res.redirect('/admin/users');
        }

        // Check if email is already used by another user
        if (email !== user.email) {
            const existingEmail = await User.findOne({
                email: email.toLowerCase(),
                _id: { $ne: req.params.id }
            });
            if (existingEmail) {
                req.flash('danger', 'Email đã được sử dụng!');
                return res.redirect(`/admin/users/${req.params.id}/edit`);
            }
        }

        // Check if username is already used by another user
        if (username !== user.username) {
            const existingUsername = await User.findOne({
                username,
                _id: { $ne: req.params.id }
            });
            if (existingUsername) {
                req.flash('danger', 'Tên đăng nhập đã tồn tại!');
                return res.redirect(`/admin/users/${req.params.id}/edit`);
            }
        }

        // Update user
        user.fullName = fullName;
        user.email = email.toLowerCase();
        user.role = role;
        user.username = username;

        await user.save();

        req.flash('success', 'Cập nhật thông tin người dùng thành công!');
        res.redirect(`/admin/users/${req.params.id}`);
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect(`/admin/users/${req.params.id}/edit`);
    }
});

// ============================================
// User Management - Delete User
// ============================================
router.post('/users/:id/delete', isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            req.flash('danger', 'Không tìm thấy người dùng!');
            return res.redirect('/admin/users');
        }

        // Prevent admin from deleting themselves
        if (user._id.toString() === req.session.user.id.toString()) {
            req.flash('danger', 'Bạn không thể xóa chính mình!');
            return res.redirect('/admin/users');
        }

        await User.findByIdAndDelete(req.params.id);

        req.flash('success', 'Xóa người dùng thành công!');
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect('/admin/users');
    }
});

// ============================================
// User Management - Create User Form
// ============================================
router.get('/users/create/new', isAdmin, (req, res) => {
    res.render('admin/user-create.html');
});

// ============================================
// User Management - Create User
// ============================================
router.post('/users/create', isAdmin, async (req, res) => {
    try {
        const { username, email, password, confirmPassword, fullName, role } = req.body;

        // Validate password match
        if (password !== confirmPassword) {
            req.flash('danger', 'Mật khẩu xác nhận không khớp!');
            return res.redirect('/admin/users/create/new');
        }

        // Check if username exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            req.flash('danger', 'Tên đăng nhập đã tồn tại!');
            return res.redirect('/admin/users/create/new');
        }

        // Check if email exists
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            req.flash('danger', 'Email đã được sử dụng!');
            return res.redirect('/admin/users/create/new');
        }

        // Create new user
        const user = new User({
            username,
            email: email.toLowerCase(),
            password,
            fullName,
            role: role || 'student'
        });

        await user.save();

        req.flash('success', 'Tạo người dùng mới thành công!');
        res.redirect('/admin/users');
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect('/admin/users/create/new');
    }
});

// ============================================
// User Management - Reset Password Form
// ============================================
router.get('/users/:id/reset-password', isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            req.flash('danger', 'Không tìm thấy người dùng!');
            return res.redirect('/admin/users');
        }

        res.render('admin/user-reset-password.html', { user });
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect('/admin/users');
    }
});

// ============================================
// User Management - Reset Password
// ============================================
router.post('/users/:id/reset-password', isAdmin, async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            req.flash('danger', 'Không tìm thấy người dùng!');
            return res.redirect('/admin/users');
        }

        // Validate password match
        if (newPassword !== confirmPassword) {
            req.flash('danger', 'Mật khẩu xác nhận không khớp!');
            return res.redirect(`/admin/users/${req.params.id}/reset-password`);
        }

        // Validate password length
        if (newPassword.length < 6) {
            req.flash('danger', 'Mật khẩu phải có ít nhất 6 ký tự!');
            return res.redirect(`/admin/users/${req.params.id}/reset-password`);
        }

        // Update password
        user.password = newPassword;
        await user.save();

        req.flash('success', 'Đặt lại mật khẩu thành công!');
        res.redirect(`/admin/users/${req.params.id}`);
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect(`/admin/users/${req.params.id}/reset-password`);
    }
});

module.exports = router;
