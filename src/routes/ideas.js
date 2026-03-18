const express = require('express');
const router = express.Router();
const sanitizeHtml = require('sanitize-html');
const { Idea, categoryLabels, categoryIcons, categoryColors } = require('../models/Idea');
const { Student, Reward } = require('../models/Basic');

// Strip all HTML tags for plain text fields
const stripHtml = (text) => sanitizeHtml(text, { allowedTags: [], allowedAttributes: {} });

// Helper to pass category data to templates
const getCategoryData = () => ({
    categoryLabels,
    categoryIcons,
    categoryColors
});

// ============================================
// AI Analysis Function (Simulated)
// In production, replace with actual AI API call
// ============================================
const analyzeIdea = async (idea) => {
    // Simulated AI analysis based on content
    const content = idea.content.toLowerCase();
    const title = idea.title.toLowerCase();

    // Keywords analysis
    const techKeywords = ['app', 'ứng dụng', 'robot', 'ai', 'máy', 'điện thoại', 'game', 'website'];
    const envKeywords = ['môi trường', 'rác', 'cây', 'nước', 'không khí', 'tái chế', 'xanh'];
    const socialKeywords = ['giúp đỡ', 'cộng đồng', 'người', 'trẻ em', 'người già', 'từ thiện'];
    const scienceKeywords = ['khoa học', 'thí nghiệm', 'nghiên cứu', 'phát minh', 'năng lượng'];
    const artKeywords = ['nghệ thuật', 'vẽ', 'nhạc', 'múa', 'phim', 'sáng tạo'];

    let feasibilityScore = 50;
    const strengths = [];
    const challenges = [];
    const suggestions = [];
    const resources = [];
    const keywords = [];
    const categories = [];

    // Analyze content length and detail
    if (content.length > 500) {
        feasibilityScore += 10;
        strengths.push('Ý tưởng được mô tả chi tiết và rõ ràng');
    }
    if (content.length > 1000) {
        feasibilityScore += 5;
        strengths.push('Nội dung phong phú, có chiều sâu');
    }

    // Check for specific keywords
    techKeywords.forEach(kw => {
        if (content.includes(kw) || title.includes(kw)) {
            keywords.push(kw);
            categories.push('technology');
            feasibilityScore += 3;
        }
    });

    envKeywords.forEach(kw => {
        if (content.includes(kw) || title.includes(kw)) {
            keywords.push(kw);
            categories.push('environment');
            feasibilityScore += 5;
            strengths.push('Ý tưởng có ý nghĩa về môi trường');
        }
    });

    socialKeywords.forEach(kw => {
        if (content.includes(kw) || title.includes(kw)) {
            keywords.push(kw);
            categories.push('social');
            feasibilityScore += 5;
            strengths.push('Ý tưởng mang tính nhân văn cao');
        }
    });

    scienceKeywords.forEach(kw => {
        if (content.includes(kw) || title.includes(kw)) {
            keywords.push(kw);
            categories.push('science');
            feasibilityScore += 4;
        }
    });

    artKeywords.forEach(kw => {
        if (content.includes(kw) || title.includes(kw)) {
            keywords.push(kw);
            categories.push('art');
            feasibilityScore += 3;
        }
    });

    // Add some randomness for variety
    feasibilityScore += Math.floor(Math.random() * 15);
    feasibilityScore = Math.min(95, Math.max(30, feasibilityScore));

    // Determine level
    let level = 'medium';
    if (feasibilityScore >= 80) level = 'very_high';
    else if (feasibilityScore >= 65) level = 'high';
    else if (feasibilityScore >= 45) level = 'medium';
    else if (feasibilityScore >= 30) level = 'low';
    else level = 'very_low';

    // Generate strengths if not enough
    if (strengths.length === 0) {
        strengths.push('Ý tưởng độc đáo và sáng tạo');
    }
    if (strengths.length < 2) {
        strengths.push('Có tiềm năng phát triển');
    }

    // Generate challenges
    challenges.push('Cần nghiên cứu thêm về tính khả thi');
    if (feasibilityScore < 60) {
        challenges.push('Có thể cần sự hỗ trợ từ người lớn');
    }
    if (categories.includes('technology')) {
        challenges.push('Đòi hỏi kiến thức về công nghệ');
    }

    // Generate suggestions
    suggestions.push('Tìm hiểu thêm các dự án tương tự để học hỏi');
    suggestions.push('Chia nhỏ ý tưởng thành các bước nhỏ hơn');
    if (feasibilityScore >= 70) {
        suggestions.push('Có thể bắt đầu thực hiện ngay với một phiên bản đơn giản');
    }

    // Generate resources
    resources.push('Sách và tài liệu tham khảo');
    resources.push('Hỏi ý kiến thầy cô và phụ huynh');
    if (categories.includes('technology')) {
        resources.push('Các khóa học lập trình online miễn phí');
    }
    if (categories.includes('science')) {
        resources.push('Phòng thí nghiệm khoa học tại trường');
    }

    // Determine effort
    let estimatedEffort = 'medium';
    if (feasibilityScore >= 75) estimatedEffort = 'easy';
    else if (feasibilityScore >= 50) estimatedEffort = 'medium';
    else if (feasibilityScore >= 35) estimatedEffort = 'hard';
    else estimatedEffort = 'expert';

    // Generate encouragement
    const encouragements = [
        'Tuyệt vời! Em có một ý tưởng rất sáng tạo. Hãy tiếp tục phát triển nhé!',
        'Ý tưởng của em rất đáng khích lệ! Mỗi phát minh vĩ đại đều bắt đầu từ một ý tưởng nhỏ.',
        'Em có tư duy độc đáo! Hãy kiên trì và không ngừng học hỏi.',
        'Rất ấn tượng với sự sáng tạo của em! Thế giới cần những người dám nghĩ khác biệt.',
        'Ý tưởng này cho thấy em là một người có tâm hồn đẹp và trí tuệ sáng tạo!'
    ];

    return {
        feasibility: {
            score: feasibilityScore,
            level,
            summary: `Ý tưởng có tính khả thi ${feasibilityScore >= 70 ? 'cao' : feasibilityScore >= 50 ? 'trung bình' : 'cần cải thiện'}. ${strengths[0]}.`
        },
        strengths: [...new Set(strengths)],
        challenges: [...new Set(challenges)],
        suggestions: [...new Set(suggestions)],
        resources: [...new Set(resources)],
        estimatedEffort,
        categories: [...new Set(categories)],
        keywords: [...new Set(keywords)],
        encouragement: encouragements[Math.floor(Math.random() * encouragements.length)],
        analyzedAt: new Date()
    };
};

// ============================================
// ROUTES
// ============================================

// Main ideas page - list all ideas
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 12;
        const skip = (page - 1) * limit;
        const category = req.query.category;
        const sort = req.query.sort || 'newest';
        const studentId = req.query.studentId;

        // Build query
        const query = { status: { $in: ['published', 'featured'] } };
        if (category && category !== 'all') {
            query.category = category;
        }
        if (studentId) {
            query.student = studentId;
        }

        // Build sort
        let sortObj = { createdAt: -1 };
        if (sort === 'popular') sortObj = { likeCount: -1, createdAt: -1 };
        if (sort === 'feasibility') sortObj = { 'aiAnalysis.feasibility.score': -1, createdAt: -1 };

        // Get ideas
        const ideas = await Idea.find(query)
            .populate('student', 'name avatar')
            .sort(sortObj)
            .skip(skip)
            .limit(limit);

        const total = await Idea.countDocuments(query);
        const totalPages = Math.ceil(total / limit);

        // Get featured ideas
        const featuredIdeas = await Idea.find({ status: 'featured' })
            .populate('student', 'name avatar')
            .sort({ likeCount: -1 })
            .limit(3);

        // Get all students for filter
        const students = await Student.find({}).sort({ name: 1 });

        // Get category stats
        const categoryStats = await Idea.aggregate([
            { $match: { status: { $in: ['published', 'featured'] } } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        res.render('ideas/index.html', {
            ideas,
            featuredIdeas,
            students,
            categoryStats,
            currentCategory: category || 'all',
            currentSort: sort,
            currentStudentId: studentId,
            pagination: {
                page,
                totalPages,
                total,
                hasNext: page < totalPages,
                hasPrev: page > 1
            },
            ...getCategoryData()
        });
    } catch (error) {
        console.error('Error loading ideas:', error);
        req.flash('danger', 'Không thể tải danh sách ý tưởng');
        res.redirect('/');
    }
});

// Create idea page
router.get('/create', async (req, res) => {
    try {
        const studentId = req.query.studentId;
        const students = await Student.find({}).sort({ name: 1 });

        let selectedStudent = null;
        if (studentId) {
            selectedStudent = await Student.findById(studentId);
        }

        res.render('ideas/create.html', {
            students,
            selectedStudent,
            ...getCategoryData()
        });
    } catch (error) {
        console.error('Error loading create page:', error);
        res.redirect('/ideas');
    }
});

// Create idea - POST
router.post('/create', async (req, res) => {
    try {
        const { title, content, category, tags, studentId } = req.body;

        if (!studentId) {
            req.flash('danger', 'Vui lòng chọn học sinh');
            return res.redirect('/ideas/create');
        }

        const student = await Student.findById(studentId);
        if (!student) {
            req.flash('danger', 'Không tìm thấy học sinh');
            return res.redirect('/ideas/create');
        }

        // Sanitize input
        const cleanTitle = stripHtml(title);
        const cleanContent = stripHtml(content);

        // Create idea
        const idea = await Idea.create({
            title: cleanTitle,
            content: cleanContent,
            summary: cleanContent.substring(0, 200) + (cleanContent.length > 200 ? '...' : ''),
            category: category || 'other',
            tags: tags ? tags.split(',').map(t => t.trim()).filter(t => t) : [],
            student: student._id,
            studentName: student.name,
            status: 'published'
        });

        // Reward stars for creating idea
        const starsEarned = 5;
        await Reward.create({
            stars: starsEarned,
            reason: `Đăng ý tưởng: ${title.substring(0, 50)}`,
            student: student._id,
            is_penalty: false
        });
        await Student.updateOne({ _id: student._id }, { $inc: { total_stars: starsEarned } });
        idea.starsEarned = starsEarned;
        await idea.save();

        req.flash('success', `Đã đăng ý tưởng thành công! +${starsEarned} sao`);
        res.redirect(`/ideas/${idea._id}`);
    } catch (error) {
        console.error('Error creating idea:', error);
        req.flash('danger', 'Không thể đăng ý tưởng');
        res.redirect('/ideas/create');
    }
});

// View idea detail
router.get('/:id', async (req, res) => {
    try {
        const idea = await Idea.findById(req.params.id)
            .populate('student', 'name avatar total_stars')
            .populate('comments.author', 'name avatar');

        if (!idea) {
            req.flash('danger', 'Không tìm thấy ý tưởng');
            return res.redirect('/ideas');
        }

        // Increment view count
        await Idea.updateOne({ _id: idea._id }, { $inc: { viewCount: 1 } });

        // Get related ideas
        const relatedIdeas = await Idea.find({
            _id: { $ne: idea._id },
            category: idea.category,
            status: { $in: ['published', 'featured'] }
        })
            .populate('student', 'name avatar')
            .limit(4);

        // Get all students for commenting
        const students = await Student.find({}).sort({ name: 1 });

        res.render('ideas/detail.html', {
            idea,
            relatedIdeas,
            students,
            ...getCategoryData()
        });
    } catch (error) {
        console.error('Error loading idea:', error);
        res.redirect('/ideas');
    }
});

// Analyze idea with AI
router.post('/:id/analyze', async (req, res) => {
    try {
        const idea = await Idea.findById(req.params.id);
        if (!idea) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy ý tưởng' });
        }

        // Perform AI analysis
        const analysis = await analyzeIdea(idea);

        // Update idea with analysis
        idea.aiAnalysis = analysis;
        idea.isAnalyzed = true;
        await idea.save();

        // Award bonus stars for getting analysis
        if (!idea.starsEarned || idea.starsEarned < 10) {
            const bonusStars = 3;
            await Reward.create({
                stars: bonusStars,
                reason: `AI phân tích ý tưởng: ${idea.title.substring(0, 30)}`,
                student: idea.student,
                is_penalty: false
            });
            await Student.updateOne({ _id: idea.student }, { $inc: { total_stars: bonusStars } });
            idea.starsEarned = (idea.starsEarned || 0) + bonusStars;
            await idea.save();
        }

        res.json({ success: true, analysis, starsEarned: 3 });
    } catch (error) {
        console.error('Error analyzing idea:', error);
        res.status(500).json({ success: false, error: 'Không thể phân tích ý tưởng' });
    }
});

// Like idea
router.post('/:id/like', async (req, res) => {
    try {
        const { studentId } = req.body;
        const idea = await Idea.findById(req.params.id);

        if (!idea) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy ý tưởng' });
        }

        const alreadyLiked = idea.likes.includes(studentId);

        if (alreadyLiked) {
            // Unlike
            idea.likes.pull(studentId);
        } else {
            // Like
            idea.likes.push(studentId);
        }

        await idea.save();

        res.json({
            success: true,
            liked: !alreadyLiked,
            likeCount: idea.likes.length
        });
    } catch (error) {
        console.error('Error liking idea:', error);
        res.status(500).json({ success: false, error: 'Không thể thích ý tưởng' });
    }
});

// Add comment
router.post('/:id/comment', async (req, res) => {
    try {
        const { studentId, content } = req.body;
        const idea = await Idea.findById(req.params.id);

        if (!idea) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy ý tưởng' });
        }

        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy học sinh' });
        }

        idea.comments.push({
            author: student._id,
            authorName: student.name,
            content: stripHtml(content)
        });

        await idea.save();

        // Award star for commenting
        await Reward.create({
            stars: 1,
            reason: `Bình luận ý tưởng: ${idea.title.substring(0, 30)}`,
            student: student._id,
            is_penalty: false
        });
        await Student.updateOne({ _id: student._id }, { $inc: { total_stars: 1 } });

        res.json({
            success: true,
            comment: idea.comments[idea.comments.length - 1],
            starsEarned: 1
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, error: 'Không thể thêm bình luận' });
    }
});

// Get ideas by student (API)
router.get('/api/student/:studentId', async (req, res) => {
    try {
        const ideas = await Idea.find({
            student: req.params.studentId,
            status: { $in: ['published', 'featured', 'draft'] }
        })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({ success: true, ideas });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch ideas' });
    }
});

// Delete idea
router.post('/:id/delete', async (req, res) => {
    try {
        const idea = await Idea.findById(req.params.id);
        if (!idea) {
            req.flash('danger', 'Không tìm thấy ý tưởng');
            return res.redirect('/ideas');
        }

        await Idea.deleteOne({ _id: req.params.id });
        req.flash('success', 'Đã xóa ý tưởng');
        res.redirect('/ideas');
    } catch (error) {
        console.error('Error deleting idea:', error);
        req.flash('danger', 'Không thể xóa ý tưởng');
        res.redirect('/ideas');
    }
});

module.exports = router;
