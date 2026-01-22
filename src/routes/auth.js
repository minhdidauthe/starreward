const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    req.flash('warning', 'Vui lòng đăng nhập để tiếp tục!');
    res.redirect('/auth/login');
};

// Middleware to check if user is NOT logged in
const isGuest = (req, res, next) => {
    if (req.session && req.session.user) {
        return res.redirect('/');
    }
    next();
};

// ============================================
// Login Page
// ============================================
router.get('/login', isGuest, (req, res) => {
    res.render('auth/login.html');
});

// ============================================
// Login Process
// ============================================
router.post('/login', isGuest, async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            req.flash('danger', 'Email hoặc mật khẩu không đúng!');
            return res.redirect('/auth/login');
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            req.flash('danger', 'Email hoặc mật khẩu không đúng!');
            return res.redirect('/auth/login');
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Set session
        req.session.user = {
            id: user._id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            avatar: user.avatar
        };

        req.flash('success', `Chào mừng ${user.fullName} quay trở lại!`);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect('/auth/login');
    }
});

// ============================================
// Register Page
// ============================================
router.get('/register', isGuest, (req, res) => {
    res.render('auth/register.html');
});

// ============================================
// Register Process
// ============================================
router.post('/register', isGuest, async (req, res) => {
    try {
        const { username, email, password, confirmPassword, fullName, role } = req.body;

        // Validate password match
        if (password !== confirmPassword) {
            req.flash('danger', 'Mật khẩu xác nhận không khớp!');
            return res.redirect('/auth/register');
        }

        // Check if username exists
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            req.flash('danger', 'Tên đăng nhập đã tồn tại!');
            return res.redirect('/auth/register');
        }

        // Check if email exists
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            req.flash('danger', 'Email đã được sử dụng!');
            return res.redirect('/auth/register');
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

        req.flash('success', 'Đăng ký thành công! Vui lòng đăng nhập.');
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra khi đăng ký!');
        res.redirect('/auth/register');
    }
});

// ============================================
// Logout
// ============================================
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.redirect('/auth/login');
    });
});

// Export middleware for use in other routes
module.exports = router;
module.exports.isAuthenticated = isAuthenticated;
module.exports.isGuest = isGuest;
