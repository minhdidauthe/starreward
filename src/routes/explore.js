const express = require('express');
const router = express.Router();
const { ExploreCategory, ExploreActivity, ActivityProgress } = require('../models/Explore');
const { Student, Reward } = require('../models/Basic');

// Main explore page
router.get('/', async (req, res) => {
    try {
        const categories = await ExploreCategory.find({ isActive: true }).sort({ order: 1 });
        const featuredActivities = await ExploreActivity.find({ isFeatured: true, isActive: true })
            .populate('category')
            .limit(6);
        const newActivities = await ExploreActivity.find({ isNewActivity: true, isActive: true })
            .populate('category')
            .limit(4);
        const popularActivities = await ExploreActivity.find({ isActive: true })
            .populate('category')
            .sort({ playCount: -1 })
            .limit(6);

        res.render('explore/index.html', {
            categories,
            featuredActivities,
            newActivities,
            popularActivities,
            user: req.session ? req.session.user : null
        });
    } catch (error) {
        console.error('Error loading explore page:', error);
        res.render('explore/index.html', {
            categories: [],
            featuredActivities: [],
            newActivities: [],
            popularActivities: [],
            user: req.session ? req.session.user : null
        });
    }
});

// Category page
router.get('/category/:slug', async (req, res) => {
    try {
        const category = await ExploreCategory.findOne({ slug: req.params.slug, isActive: true });
        if (!category) {
            return res.redirect('/explore');
        }

        const activities = await ExploreActivity.find({ category: category._id, isActive: true })
            .sort({ order: 1 });

        res.render('explore/category.html', {
            category,
            activities,
            user: req.session ? req.session.user : null
        });
    } catch (error) {
        console.error('Error loading category:', error);
        res.redirect('/explore');
    }
});

// Activity detail page
router.get('/activity/:id', async (req, res) => {
    try {
        const activity = await ExploreActivity.findById(req.params.id)
            .populate('category');

        if (!activity || !activity.isActive) {
            return res.redirect('/explore');
        }

        // Get related activities from same category
        const relatedActivities = await ExploreActivity.find({
            category: activity.category._id,
            _id: { $ne: activity._id },
            isActive: true
        }).limit(4);

        // Get all students for selection
        const students = await Student.find({}).sort({ name: 1 });

        // Increment play count
        await ExploreActivity.findByIdAndUpdate(req.params.id, { $inc: { playCount: 1 } });

        res.render('explore/activity.html', {
            activity,
            relatedActivities,
            students,
            user: req.session ? req.session.user : null
        });
    } catch (error) {
        console.error('Error loading activity:', error);
        res.redirect('/explore');
    }
});

// Play activity page
router.get('/play/:id', async (req, res) => {
    try {
        const activity = await ExploreActivity.findById(req.params.id)
            .populate('category');

        if (!activity || !activity.isActive) {
            return res.redirect('/explore');
        }

        // Get all students for selection
        const students = await Student.find({}).sort({ name: 1 });

        // Get studentId from query param if provided
        const selectedStudentId = req.query.studentId || null;

        res.render('explore/play.html', {
            activity,
            students,
            selectedStudentId,
            user: req.session ? req.session.user : null
        });
    } catch (error) {
        console.error('Error loading activity:', error);
        res.redirect('/explore');
    }
});

// API endpoints
router.get('/api/categories', async (req, res) => {
    try {
        const categories = await ExploreCategory.find({ isActive: true }).sort({ order: 1 });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

router.get('/api/activities', async (req, res) => {
    try {
        const { category, type, difficulty, limit = 20 } = req.query;
        const filter = { isActive: true };

        if (category) filter.category = category;
        if (type) filter.type = type;
        if (difficulty) filter.difficulty = difficulty;

        const activities = await ExploreActivity.find(filter)
            .populate('category')
            .sort({ order: 1 })
            .limit(parseInt(limit));

        res.json(activities);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

router.get('/api/activity/:id', async (req, res) => {
    try {
        const activity = await ExploreActivity.findById(req.params.id)
            .populate('category');
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }
        res.json(activity);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

// Complete activity (earn stars)
router.post('/api/complete/:id', async (req, res) => {
    try {
        const activity = await ExploreActivity.findById(req.params.id);
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        const { score, timeSpent, studentId } = req.body;
        const starsEarned = activity.starsReward;

        // If studentId provided, add stars to student's reward
        if (studentId) {
            const student = await Student.findById(studentId);
            if (student) {
                // Create reward record
                await Reward.create({
                    stars: starsEarned,
                    reason: `Hoàn thành game: ${activity.title} (Điểm: ${score || 0})`,
                    student: student._id,
                    is_penalty: false
                });

                // Update student's total stars
                await Student.updateOne(
                    { _id: student._id },
                    { $inc: { total_stars: starsEarned } }
                );
            }
        }

        // Save activity progress
        if (req.session && req.session.user) {
            await ActivityProgress.findOneAndUpdate(
                { user: req.session.user._id, activity: activity._id },
                {
                    $set: { completedAt: new Date(), score, starsEarned, timeSpent },
                    $inc: { attempts: 1 }
                },
                { upsert: true, new: true }
            );
        }

        res.json({
            success: true,
            starsEarned,
            message: `Chúc mừng! Bạn đã nhận được ${starsEarned} sao!`
        });
    } catch (error) {
        console.error('Error completing activity:', error);
        res.status(500).json({ error: 'Failed to complete activity' });
    }
});

// Rate activity
router.post('/api/rate/:id', async (req, res) => {
    try {
        const { rating } = req.body;
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const activity = await ExploreActivity.findById(req.params.id);
        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        // Calculate new average rating
        const newRatingCount = activity.ratingCount + 1;
        const newRating = ((activity.rating * activity.ratingCount) + rating) / newRatingCount;

        await ExploreActivity.findByIdAndUpdate(req.params.id, {
            rating: newRating,
            ratingCount: newRatingCount
        });

        res.json({ success: true, newRating, ratingCount: newRatingCount });
    } catch (error) {
        res.status(500).json({ error: 'Failed to rate activity' });
    }
});

module.exports = router;
