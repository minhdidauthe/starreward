const express = require('express');
const router = express.Router();
const { BlogPost, categoryLabels, categoryIcons, categoryColors, roleLabels } = require('../models/Blog');

// Helper to pass category data to templates
const getBlogData = () => ({
    categoryLabels,
    categoryIcons,
    categoryColors,
    roleLabels
});

// ============================================
// ROUTES
// ============================================

// Main blog page - list all posts
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const skip = (page - 1) * limit;
        const category = req.query.category;
        const sort = req.query.sort || 'newest';
        const search = req.query.search;

        // Build query
        const query = { status: { $in: ['published', 'featured'] } };
        if (category && category !== 'all') {
            query.category = category;
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        // Build sort
        let sortObj = { publishedAt: -1 };
        if (sort === 'popular') sortObj = { viewCount: -1, publishedAt: -1 };
        if (sort === 'liked') sortObj = { likes: -1, publishedAt: -1 };
        if (sort === 'discussed') sortObj = { commentCount: -1, publishedAt: -1 };

        // Get posts
        const posts = await BlogPost.find(query)
            .sort(sortObj)
            .skip(skip)
            .limit(limit);

        const total = await BlogPost.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        // Get featured posts
        const featuredPosts = await BlogPost.find({ isFeatured: true, status: 'published' })
            .sort({ publishedAt: -1 })
            .limit(3);

        // Get pinned post
        const pinnedPost = await BlogPost.findOne({ isPinned: true, status: 'published' });

        // Get category stats
        const categoryStats = await BlogPost.aggregate([
            { $match: { status: { $in: ['published', 'featured'] } } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        // Get popular tags
        const popularTags = await BlogPost.aggregate([
            { $match: { status: { $in: ['published', 'featured'] } } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 15 }
        ]);

        res.render('blog/index.html', {
            posts,
            featuredPosts,
            pinnedPost,
            categoryStats,
            popularTags,
            currentCategory: category || 'all',
            currentSort: sort,
            searchQuery: search || '',
            pagination: {
                page,
                totalPages,
                total,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            ...getBlogData()
        });
    } catch (error) {
        console.error('Error loading blog:', error);
        req.flash('danger', 'Không thể tải bài viết');
        res.redirect('/');
    }
});

// Create post page
router.get('/write', async (req, res) => {
    try {
        res.render('blog/create.html', {
            ...getBlogData()
        });
    } catch (error) {
        console.error('Error loading create page:', error);
        res.redirect('/blog');
    }
});

// Create post - POST
router.post('/write', async (req, res) => {
    try {
        const {
            title,
            content,
            category,
            tags,
            authorName,
            authorEmail,
            authorRole,
            ageMin,
            ageMax,
            coverImage
        } = req.body;

        if (!authorName || !title || !content) {
            req.flash('danger', 'Vui lòng điền đầy đủ thông tin');
            return res.redirect('/blog/write');
        }

        // Create excerpt
        const excerpt = content
            .replace(/<[^>]+>/g, '')
            .substring(0, 300) + (content.length > 300 ? '...' : '');

        // Create post
        const post = await BlogPost.create({
            title,
            content,
            excerpt,
            category: category || 'experience',
            tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [],
            authorName,
            authorEmail,
            authorRole: authorRole || 'parent',
            ageRange: {
                min: parseInt(ageMin) || 0,
                max: parseInt(ageMax) || 18
            },
            coverImage,
            status: 'published'
        });

        req.flash('success', 'Bài viết đã được đăng thành công!');
        res.redirect(`/blog/${post.slug}`);
    } catch (error) {
        console.error('Error creating post:', error);
        req.flash('danger', 'Không thể đăng bài viết');
        res.redirect('/blog/write');
    }
});

// View post detail
router.get('/:slug', async (req, res) => {
    try {
        const post = await BlogPost.findOne({ slug: req.params.slug });

        if (!post || !['published', 'featured'].includes(post.status)) {
            req.flash('danger', 'Không tìm thấy bài viết');
            return res.redirect('/blog');
        }

        // Increment view count
        await BlogPost.updateOne({ _id: post._id }, { $inc: { viewCount: 1 } });

        // Get related posts
        const relatedPosts = await BlogPost.find({
            _id: { $ne: post._id },
            category: post.category,
            status: { $in: ['published', 'featured'] }
        })
            .sort({ publishedAt: -1 })
            .limit(4);

        // Get recent posts
        const recentPosts = await BlogPost.find({
            _id: { $ne: post._id },
            status: { $in: ['published', 'featured'] }
        })
            .sort({ publishedAt: -1 })
            .limit(5);

        // Check if user liked/bookmarked (using session ID)
        const sessionId = req.sessionID;
        const isLiked = post.likedBy.includes(sessionId);
        const isBookmarked = post.bookmarkedBy.includes(sessionId);

        res.render('blog/detail.html', {
            post,
            relatedPosts,
            recentPosts,
            isLiked,
            isBookmarked,
            ...getBlogData()
        });
    } catch (error) {
        console.error('Error loading post:', error);
        res.redirect('/blog');
    }
});

// Like post
router.post('/:slug/like', async (req, res) => {
    try {
        const post = await BlogPost.findOne({ slug: req.params.slug });
        if (!post) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy bài viết' });
        }

        const sessionId = req.sessionID;
        const alreadyLiked = post.likedBy.includes(sessionId);

        if (alreadyLiked) {
            post.likedBy.pull(sessionId);
        } else {
            post.likedBy.push(sessionId);
        }

        await post.save();

        res.json({
            success: true,
            liked: !alreadyLiked,
            likes: post.likedBy.length
        });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ success: false, error: 'Không thể thực hiện' });
    }
});

// Bookmark post
router.post('/:slug/bookmark', async (req, res) => {
    try {
        const post = await BlogPost.findOne({ slug: req.params.slug });
        if (!post) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy bài viết' });
        }

        const sessionId = req.sessionID;
        const alreadyBookmarked = post.bookmarkedBy.includes(sessionId);

        if (alreadyBookmarked) {
            post.bookmarkedBy.pull(sessionId);
        } else {
            post.bookmarkedBy.push(sessionId);
        }

        await post.save();

        res.json({
            success: true,
            bookmarked: !alreadyBookmarked,
            bookmarks: post.bookmarkedBy.length
        });
    } catch (error) {
        console.error('Error bookmarking post:', error);
        res.status(500).json({ success: false, error: 'Không thể thực hiện' });
    }
});

// Add comment
router.post('/:slug/comment', async (req, res) => {
    try {
        const { authorName, authorEmail, content, isParent } = req.body;
        const post = await BlogPost.findOne({ slug: req.params.slug });

        if (!post) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy bài viết' });
        }

        if (!authorName || !content) {
            return res.status(400).json({ success: false, error: 'Vui lòng điền đầy đủ thông tin' });
        }

        post.comments.push({
            authorName,
            authorEmail,
            content,
            isParent: isParent !== 'false'
        });

        await post.save();

        res.json({
            success: true,
            comment: post.comments[post.comments.length - 1],
            commentCount: post.comments.length
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, error: 'Không thể thêm bình luận' });
    }
});

// Share count increment
router.post('/:slug/share', async (req, res) => {
    try {
        await BlogPost.updateOne(
            { slug: req.params.slug },
            { $inc: { shareCount: 1 } }
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// Category page
router.get('/category/:category', async (req, res) => {
    res.redirect(`/blog?category=${req.params.category}`);
});

// Tag page
router.get('/tag/:tag', async (req, res) => {
    res.redirect(`/blog?search=${req.params.tag}`);
});

// API: Get posts
router.get('/api/posts', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const posts = await BlogPost.find({ status: { $in: ['published', 'featured'] } })
            .sort({ publishedAt: -1 })
            .limit(limit)
            .select('title slug excerpt category authorName publishedAt viewCount likes');

        res.json({ success: true, posts });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch posts' });
    }
});

// Delete post (for admin)
router.post('/:slug/delete', async (req, res) => {
    try {
        await BlogPost.deleteOne({ slug: req.params.slug });
        req.flash('success', 'Đã xóa bài viết');
        res.redirect('/blog');
    } catch (error) {
        req.flash('danger', 'Không thể xóa bài viết');
        res.redirect('/blog');
    }
});

module.exports = router;
