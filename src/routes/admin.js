const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { BlogPost, categoryLabels, categoryIcons, categoryColors } = require('../models/Blog');
const { isAdmin } = require('./auth');
const redditCrawlerService = require('../services/redditCrawler');

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

// ============================================
// BLOG MANAGEMENT
// ============================================

// Blog Dashboard
router.get('/blog', isAdmin, async (req, res) => {
    try {
        const totalPosts = await BlogPost.countDocuments();
        const publishedPosts = await BlogPost.countDocuments({ status: 'published' });
        const draftPosts = await BlogPost.countDocuments({ status: 'draft' });
        const featuredPosts = await BlogPost.countDocuments({ isFeatured: true });

        // Get category distribution
        const categoryStats = await BlogPost.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Get recent posts
        const recentPosts = await BlogPost.find()
            .sort({ createdAt: -1 })
            .limit(10);

        // Get top posts by views
        const topPosts = await BlogPost.find({ status: 'published' })
            .sort({ viewCount: -1 })
            .limit(5);

        res.render('admin/blog-dashboard.html', {
            stats: {
                totalPosts,
                publishedPosts,
                draftPosts,
                featuredPosts
            },
            categoryStats,
            recentPosts,
            topPosts,
            categoryLabels
        });
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect('/admin/dashboard');
    }
});

// Blog Posts List
router.get('/blog/posts', isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const categoryFilter = req.query.category || '';
        const statusFilter = req.query.status || '';

        // Build query
        let query = {};
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { authorName: { $regex: search, $options: 'i' } }
            ];
        }
        if (categoryFilter) {
            query.category = categoryFilter;
        }
        if (statusFilter) {
            query.status = statusFilter;
        }

        const totalPosts = await BlogPost.countDocuments(query);
        const totalPages = Math.ceil(totalPosts / limit);

        const posts = await BlogPost.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.render('admin/blog-posts.html', {
            posts,
            currentPage: page,
            totalPages,
            totalPosts,
            search,
            categoryFilter,
            statusFilter,
            categoryLabels,
            categoryIcons,
            categoryColors
        });
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect('/admin/blog');
    }
});

// Create Blog Post Form
router.get('/blog/create', isAdmin, (req, res) => {
    res.render('admin/blog-create.html', {
        categoryLabels,
        categoryIcons,
        categoryColors
    });
});

// Create Blog Post
router.post('/blog/create', isAdmin, async (req, res) => {
    try {
        const {
            title,
            content,
            excerpt,
            category,
            tags,
            coverImage,
            status,
            isFeatured,
            isPinned,
            ageMin,
            ageMax
        } = req.body;

        if (!title || !content) {
            req.flash('danger', 'Vui lòng điền đầy đủ tiêu đề và nội dung!');
            return res.redirect('/admin/blog/create');
        }

        // Auto generate excerpt if not provided
        const finalExcerpt = excerpt || content
            .replace(/<[^>]+>/g, '')
            .substring(0, 300) + '...';

        const post = new BlogPost({
            title,
            content,
            excerpt: finalExcerpt,
            category: category || 'experience',
            tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [],
            coverImage,
            status: status || 'draft',
            isFeatured: isFeatured === 'on',
            isPinned: isPinned === 'on',
            authorName: req.session.user.fullName,
            authorEmail: req.session.user.email,
            authorRole: 'admin',
            ageRange: {
                min: parseInt(ageMin) || 0,
                max: parseInt(ageMax) || 18
            }
        });

        await post.save();

        req.flash('success', 'Tạo bài viết thành công!');
        res.redirect(`/admin/blog/posts/${post._id}/edit`);
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect('/admin/blog/create');
    }
});

// Edit Blog Post Form
router.get('/blog/posts/:id/edit', isAdmin, async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) {
            req.flash('danger', 'Không tìm thấy bài viết!');
            return res.redirect('/admin/blog/posts');
        }

        res.render('admin/blog-edit.html', {
            post,
            categoryLabels,
            categoryIcons,
            categoryColors
        });
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect('/admin/blog/posts');
    }
});

// Update Blog Post
router.post('/blog/posts/:id/edit', isAdmin, async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) {
            req.flash('danger', 'Không tìm thấy bài viết!');
            return res.redirect('/admin/blog/posts');
        }

        const {
            title,
            content,
            excerpt,
            category,
            tags,
            coverImage,
            status,
            isFeatured,
            isPinned,
            ageMin,
            ageMax
        } = req.body;

        // Update fields
        post.title = title;
        post.content = content;
        post.excerpt = excerpt || content.replace(/<[^>]+>/g, '').substring(0, 300) + '...';
        post.category = category;
        post.tags = tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [];
        post.coverImage = coverImage;
        post.status = status;
        post.isFeatured = isFeatured === 'on';
        post.isPinned = isPinned === 'on';
        post.ageRange = {
            min: parseInt(ageMin) || 0,
            max: parseInt(ageMax) || 18
        };

        await post.save();

        req.flash('success', 'Cập nhật bài viết thành công!');
        res.redirect(`/admin/blog/posts/${post._id}/edit`);
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect(`/admin/blog/posts/${req.params.id}/edit`);
    }
});

// Delete Blog Post
router.post('/blog/posts/:id/delete', isAdmin, async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) {
            req.flash('danger', 'Không tìm thấy bài viết!');
            return res.redirect('/admin/blog/posts');
        }

        await BlogPost.findByIdAndDelete(req.params.id);

        req.flash('success', 'Xóa bài viết thành công!');
        res.redirect('/admin/blog/posts');
    } catch (err) {
        console.error(err);
        req.flash('danger', 'Đã có lỗi xảy ra!');
        res.redirect('/admin/blog/posts');
    }
});

// Import from Reddit (Form)
router.get('/blog/import-reddit', isAdmin, (req, res) => {
    res.render('admin/blog-import-reddit.html', {
        categoryLabels
    });
});

// Import from Reddit (Process)
router.post('/blog/import-reddit', isAdmin, async (req, res) => {
    try {
        const {
            redditUrl,
            subreddit,
            sortBy,
            limitPosts,
            category,
            tags,
            autoPublish,
            importMethod
        } = req.body;

        let importResults = {
            success: 0,
            failed: 0,
            posts: []
        };

        // Import by URL
        if (importMethod === 'url' && redditUrl) {
            try {
                const redditPost = await redditCrawlerService.fetchRedditPostByUrl(redditUrl);

                const blogPostData = redditCrawlerService.convertRedditPostToBlogPost(redditPost, {
                    category: category || 'experience',
                    tags: tags ? tags.split(',').map(t => t.trim()) : [],
                    autoPublish: autoPublish === 'on',
                    authorName: req.session.user.fullName,
                    authorEmail: req.session.user.email
                });

                const newPost = await BlogPost.create(blogPostData);
                importResults.success++;
                importResults.posts.push(newPost);

                req.flash('success', `Đã import thành công bài viết: ${newPost.title}`);
                return res.redirect(`/admin/blog/posts/${newPost._id}/edit`);

            } catch (error) {
                console.error('Error importing from URL:', error);
                req.flash('danger', `Lỗi khi import từ URL: ${error.message}`);
                return res.redirect('/admin/blog/import-reddit');
            }
        }

        // Import from Subreddit
        if (importMethod === 'subreddit' && subreddit) {
            try {
                const limit = parseInt(limitPosts) || 10;
                const posts = await redditCrawlerService.fetchSubredditPosts(subreddit, {
                    sort: sortBy || 'hot',
                    limit: Math.min(limit, 50) // Max 50
                });

                for (const post of posts) {
                    try {
                        const blogPostData = redditCrawlerService.convertRedditPostToBlogPost(post, {
                            category: category || 'experience',
                            tags: tags ? tags.split(',').map(t => t.trim()) : [],
                            autoPublish: autoPublish === 'on',
                            authorName: req.session.user.fullName,
                            authorEmail: req.session.user.email
                        });

                        const newPost = await BlogPost.create(blogPostData);
                        importResults.success++;
                        importResults.posts.push(newPost);

                    } catch (error) {
                        console.error(`Error importing post: ${post.title}`, error);
                        importResults.failed++;
                    }
                }

                if (importResults.success > 0) {
                    req.flash('success', `Đã import thành công ${importResults.success}/${posts.length} bài viết từ r/${subreddit}`);
                } else {
                    req.flash('warning', 'Không import được bài viết nào');
                }

                return res.redirect('/admin/blog/posts');

            } catch (error) {
                console.error('Error importing from subreddit:', error);
                req.flash('danger', `Lỗi khi import từ subreddit: ${error.message}`);
                return res.redirect('/admin/blog/import-reddit');
            }
        }

        // No valid import method
        req.flash('warning', 'Vui lòng chọn phương thức import và nhập đầy đủ thông tin');
        res.redirect('/admin/blog/import-reddit');

    } catch (err) {
        console.error('Import error:', err);
        req.flash('danger', `Đã có lỗi xảy ra: ${err.message}`);
        res.redirect('/admin/blog/import-reddit');
    }
});

// Sync Reddit Trends (New feature)
router.post('/blog/sync-reddit-trends', isAdmin, async (req, res) => {
    try {
        const { category, limit, autoPublish } = req.body;

        const syncResults = await redditCrawlerService.syncRedditToBlog({
            category: category || 'experience',
            limit: parseInt(limit) || 10,
            autoPublish: autoPublish === 'on'
        });

        // Create blog posts from sync results
        let created = 0;
        for (const item of syncResults.success) {
            try {
                await BlogPost.create(item.data);
                created++;
            } catch (error) {
                console.error('Error creating post:', error);
            }
        }

        req.flash('success', `Đã đồng bộ ${created} bài viết từ Reddit trends`);
        res.redirect('/admin/blog/posts');

    } catch (err) {
        console.error('Sync error:', err);
        req.flash('danger', 'Lỗi khi đồng bộ Reddit trends');
        res.redirect('/admin/blog');
    }
});

module.exports = router;
