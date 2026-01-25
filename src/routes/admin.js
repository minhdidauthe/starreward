const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { BlogPost, categoryLabels, categoryIcons, categoryColors } = require('../models/Blog');
const RedditPost = require('../models/RedditPost');
const { isAdmin } = require('./auth');
const redditCrawlerService = require('../services/redditCrawler');
const directRedditCrawler = require('../services/directRedditCrawler');
const aiService = require('../services/aiService');

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
            memesLimit,
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

        // Import Trending Memes
        if (importMethod === 'memes') {
            try {
                const limit = parseInt(memesLimit) || 20;
                const memes = await redditCrawlerService.fetchTrendingMemes({
                    limit: Math.min(limit, 50) // Max 50
                });

                for (const meme of memes) {
                    try {
                        const blogPostData = redditCrawlerService.convertRedditPostToBlogPost(meme, {
                            category: category || 'experience',
                            tags: tags ? tags.split(',').map(t => t.trim()) : [],
                            autoPublish: autoPublish === 'on',
                            authorName: req.session.user.fullName,
                            authorEmail: req.session.user.email
                        });

                        await BlogPost.create(blogPostData);
                        importResults.success++;
                    } catch (error) {
                        console.error('Error creating post from meme:', error);
                        importResults.failed++;
                    }
                }

                req.flash('success', `Đã import ${importResults.success} memes thành công! ${importResults.failed > 0 ? `(${importResults.failed} thất bại)` : ''}`);
                return res.redirect('/admin/blog/posts');

            } catch (error) {
                console.error('Error importing memes:', error);
                req.flash('danger', `Lỗi khi import memes: ${error.message}`);
                return res.redirect('/admin/blog/import-reddit');
            }
        }

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
            autoPublish: autoPublish === 'on',
            useMemes: true  // Use RapidAPI memes method (no OAuth needed)
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

// API: Get Reddit Trends (JSON response)
router.get('/api/reddit-trends', isAdmin, async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        // Fetch trending memes from RapidAPI
        const posts = await redditCrawlerService.fetchTrendingMemes({
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            message: `Fetched ${posts.length} trending memes from Reddit`,
            data: posts
        });

    } catch (error) {
        console.error('Error fetching Reddit trends:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API: Sync Reddit Trends to Blog (JSON response)
router.post('/api/sync-reddit-trends', isAdmin, async (req, res) => {
    try {
        const { category, limit, autoPublish } = req.body;

        // Fetch trending memes
        const posts = await redditCrawlerService.fetchTrendingMemes({
            limit: parseInt(limit) || 10
        });

        // Convert to blog posts and save
        const saved = [];
        const updated = [];
        const failed = [];

        for (const post of posts) {
            try {
                const blogPostData = redditCrawlerService.convertRedditPostToBlogPost(post, {
                    category: category || 'experience',
                    autoPublish: autoPublish === true
                });

                // Check if post already exists (by Reddit URL)
                const existing = await BlogPost.findOne({
                    'metadata.redditUrl': blogPostData.metadata.redditUrl
                });

                if (existing) {
                    // Update existing post
                    Object.assign(existing, blogPostData);
                    existing.updatedAt = new Date();
                    await existing.save();
                    updated.push(existing);
                } else {
                    // Create new post
                    const newPost = await BlogPost.create(blogPostData);
                    saved.push(newPost);
                }

            } catch (error) {
                console.error(`Error processing post: ${post.title}`, error);
                failed.push({
                    title: post.title,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Synced ${saved.length} new + ${updated.length} updated posts (${failed.length} failed)`,
            data: {
                saved,
                updated,
                failed,
                total: posts.length
            }
        });

    } catch (error) {
        console.error('Error syncing Reddit trends:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API: Direct Reddit Crawl (No OAuth, No RapidAPI)
router.get('/api/reddit-direct', isAdmin, async (req, res) => {
    try {
        const { subreddit = 'parenting', sort = 'hot', limit = 10, timeframe = 'day' } = req.query;

        console.log(`[Reddit API] Request received: subreddit=${subreddit}, sort=${sort}, limit=${limit}`);

        // Fetch posts directly from Reddit JSON API
        const posts = await directRedditCrawler.fetchSubredditPosts(subreddit, {
            sort,
            limit: parseInt(limit),
            timeframe
        });

        console.log(`[Reddit API] Fetched ${posts.length} posts from r/${subreddit}`);

        // Save posts to database
        const saveResult = await RedditPost.saveFetchedPosts(posts, { sort, timeframe });
        console.log(`[Reddit API] Saved to DB: ${saveResult.saved} new, ${saveResult.updated} updated`);

        res.json({
            success: true,
            message: `Fetched ${posts.length} posts from r/${subreddit}`,
            data: posts,
            dbStats: {
                saved: saveResult.saved,
                updated: saveResult.updated,
                skipped: saveResult.skipped
            }
        });

    } catch (error) {
        console.error('[Reddit API] Error fetching from Reddit directly:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API: Direct Reddit Sync to Blog
router.post('/api/sync-reddit-direct', isAdmin, async (req, res) => {
    try {
        const {
            subreddit = 'parenting',
            category,
            sort = 'hot',
            limit = 10,
            timeframe = 'day',
            autoPublish = false
        } = req.body;

        // Fetch posts directly
        const posts = await directRedditCrawler.fetchSubredditPosts(subreddit, {
            sort,
            limit: parseInt(limit),
            timeframe
        });

        // Convert and save
        const saved = [];
        const updated = [];
        const failed = [];

        for (const post of posts) {
            try {
                const blogPostData = directRedditCrawler.convertToBlogPost(post, {
                    category: category || 'experience',
                    autoPublish: autoPublish === true
                });

                // Check for duplicates
                const existing = await BlogPost.findOne({
                    'metadata.redditUrl': blogPostData.metadata.redditUrl
                });

                if (existing) {
                    Object.assign(existing, blogPostData);
                    existing.updatedAt = new Date();
                    await existing.save();
                    updated.push(existing);
                } else {
                    const newPost = await BlogPost.create(blogPostData);
                    saved.push(newPost);
                }

            } catch (error) {
                console.error(`Error processing post: ${post.title}`, error);
                failed.push({
                    title: post.title,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Synced ${saved.length} new + ${updated.length} updated from r/${subreddit} (${failed.length} failed)`,
            data: {
                saved,
                updated,
                failed,
                total: posts.length,
                subreddit,
                sort,
                timeframe
            }
        });

    } catch (error) {
        console.error('Error syncing from Reddit directly:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API: Query Reddit posts from database with filters
router.get('/api/reddit-posts', isAdmin, async (req, res) => {
    try {
        const {
            subreddit,
            status,
            fromDate,
            toDate,
            minScore,
            limit = 50,
            skip = 0,
            sortBy = 'fetchedAt',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        const query = {};

        if (subreddit) {
            query.subreddit = subreddit;
        }

        if (status) {
            query.status = status;
        }

        if (fromDate || toDate) {
            query.fetchedAt = {};
            if (fromDate) {
                query.fetchedAt.$gte = new Date(fromDate);
            }
            if (toDate) {
                query.fetchedAt.$lte = new Date(toDate);
            }
        }

        if (minScore) {
            query.score = { $gte: parseInt(minScore) };
        }

        // Build sort
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query
        const posts = await RedditPost.find(query)
            .sort(sort)
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        // Get total count for pagination
        const total = await RedditPost.countDocuments(query);

        // Convert to API format
        const data = posts.map(post => post.toAPIFormat());

        console.log(`[Reddit DB] Query returned ${data.length} posts (total: ${total})`);

        res.json({
            success: true,
            data: data,
            pagination: {
                total: total,
                limit: parseInt(limit),
                skip: parseInt(skip),
                hasMore: total > (parseInt(skip) + data.length)
            },
            filters: {
                subreddit,
                status,
                fromDate,
                toDate,
                minScore
            }
        });

    } catch (error) {
        console.error('[Reddit DB] Error querying posts:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Reddit Content Manager UI
router.get('/reddit-manager', isAdmin, async (req, res) => {
    res.render('admin/reddit-manager.html', {
        user: req.session.user,
        currentPage: 'reddit-manager'
    });
});

// AI Rewrite Reddit Posts (using CLIProxy or direct AI APIs)
router.post('/api/reddit-ai-rewrite', isAdmin, async (req, res) => {
    try {
        const { posts, aiModel, proxyUrl, proxyApiKey } = req.body;

        if (!posts || posts.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No posts provided'
            });
        }

        console.log(`[AI Rewrite] Processing ${posts.length} posts with ${aiModel}`);

        // Use real AI service via CLIProxy
        const options = { proxyUrl, proxyApiKey };
        const results = await aiService.rewriteBatch(posts, aiModel, options, (current, total) => {
            console.log(`[AI Rewrite] Progress: ${current}/${total}`);
        });

        console.log(`[AI Rewrite] Completed: ${results.filter(r => r.success).length} success, ${results.filter(r => !r.success).length} failed`);

        res.json({
            success: true,
            results
        });

    } catch (error) {
        console.error('Error in AI rewrite:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Publish AI-rewritten posts
router.post('/api/reddit-publish', isAdmin, async (req, res) => {
    try {
        const { posts } = req.body;

        if (!posts || posts.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No posts provided'
            });
        }

        let published = 0;
        const failed = [];

        for (const post of posts) {
            try {
                // Create blog post
                const blogPostData = {
                    title: post.vietnameseTitle,
                    content: post.vietnameseContent,
                    excerpt: post.vietnameseContent.substring(0, 300).replace(/<[^>]*>/g, ''),
                    category: post.category,
                    tags: post.tags || ['reddit', 'import', `r/${post.subreddit}`],
                    authorName: `${req.session.user.fullName} (via Reddit)`,
                    authorEmail: req.session.user.email,
                    authorRole: 'admin',
                    status: 'published',  // Auto-publish
                    coverImage: post.image || null,
                    metadata: {
                        source: 'reddit',
                        subreddit: post.subreddit,
                        redditUrl: post.redditUrl,
                        redditScore: post.redditScore,
                        redditComments: post.redditComments,
                        aiRewritten: true,
                        importedAt: new Date()
                    }
                };

                // Check for duplicates
                const existing = await BlogPost.findOne({
                    'metadata.redditUrl': post.redditUrl
                });

                if (!existing) {
                    await BlogPost.create(blogPostData);
                    published++;
                } else {
                    failed.push({
                        title: post.vietnameseTitle,
                        error: 'Post already exists'
                    });
                }

            } catch (error) {
                failed.push({
                    title: post.vietnameseTitle,
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            published,
            failed
        });

    } catch (error) {
        console.error('Error publishing posts:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Simulate AI rewrite (temporary - will be replaced with real AI)
async function simulateAIRewrite(post, aiModel) {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Basic translation simulation
    const title = `[AI Translated] ${post.title}`;

    // Detect category from subreddit
    const categoryMap = {
        'parenting': 'experience',
        'education': 'education',
        'Teachers': 'education',
        'homeschool': 'education',
        'AskParents': 'communication',
        'learnmath': 'education',
        'EnglishLearning': 'education',
        'psychology': 'psychology',
        'health': 'health'
    };

    const category = categoryMap[post.subreddit.toLowerCase()] || 'other';

    // Generate Vietnamese content
    let content = `<h2>${post.title}</h2>\n\n`;

    if (post.content) {
        content += `<p>${post.content}</p>\n\n`;
    }

    if (post.image) {
        content += `<div class="text-center mb-4">
            <img src="${post.image}" class="img-fluid rounded" alt="${post.title}">
        </div>\n\n`;
    }

    content += `<div class="alert alert-info">
        <strong>Nguồn:</strong> Reddit - r/${post.subreddit}<br>
        <strong>Điểm:</strong> ${post.score.toLocaleString()} upvotes • ${post.num_comments} bình luận<br>
        <strong>Link gốc:</strong> <a href="${post.url}" target="_blank">${post.url}</a>
    </div>`;

    content += `\n<p><em>⚠️ Lưu ý: Đây là bản dịch tự động từ AI model ${aiModel.toUpperCase()}. Vui lòng kiểm tra và chỉnh sửa trước khi xuất bản.</em></p>`;

    return {
        title,
        content,
        category,
        tags: ['reddit', post.subreddit, 'ai-translated', aiModel]
    };
}

module.exports = router;
