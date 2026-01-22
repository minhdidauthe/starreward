const express = require('express');
const router = express.Router();
const { Subject, Chapter, Lesson, Material } = require('../models/Learning');

// ============================================
// Learning Home - List all subjects
// ============================================
router.get('/', async (req, res) => {
    try {
        const subjects = await Subject.find({});
        res.render('learning/index.html', { subjects });
    } catch (err) {
        console.error(err);
        res.render('learning/index.html', { subjects: [] });
    }
});

// ============================================
// Subject Detail - List chapters
// ============================================
router.get('/subject/:id', async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            req.flash('danger', 'Không tìm thấy môn học!');
            return res.redirect('/learning');
        }

        const chapters = await Chapter.find({ subject: subject._id }).sort({ order: 1 });

        // Get lesson count for each chapter
        const chaptersWithCount = await Promise.all(chapters.map(async (chapter) => {
            const lessonCount = await Lesson.countDocuments({ chapter: chapter._id });
            return {
                ...chapter.toObject(),
                lessonCount
            };
        }));

        res.render('learning/subject.html', {
            subject,
            chapters: chaptersWithCount
        });
    } catch (err) {
        console.error(err);
        res.redirect('/learning');
    }
});

// ============================================
// Chapter Detail - List lessons
// ============================================
router.get('/chapter/:id', async (req, res) => {
    try {
        const chapter = await Chapter.findById(req.params.id).populate('subject');
        if (!chapter) {
            req.flash('danger', 'Không tìm thấy chương!');
            return res.redirect('/learning');
        }

        const lessons = await Lesson.find({ chapter: chapter._id }).sort({ order: 1 });

        res.render('learning/chapter.html', {
            chapter,
            subject: chapter.subject,
            lessons
        });
    } catch (err) {
        console.error(err);
        res.redirect('/learning');
    }
});

// ============================================
// Lesson Detail - Show lesson content
// ============================================
router.get('/lesson/:id', async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id);
        if (!lesson) {
            req.flash('danger', 'Không tìm thấy bài học!');
            return res.redirect('/learning');
        }

        const chapter = await Chapter.findById(lesson.chapter).populate('subject');
        const materials = await Material.find({ lesson: lesson._id });

        // Get next and previous lessons
        const allLessons = await Lesson.find({ chapter: lesson.chapter }).sort({ order: 1 });
        const currentIndex = allLessons.findIndex(l => l._id.toString() === lesson._id.toString());
        const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
        const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

        res.render('learning/lesson.html', {
            lesson,
            chapter,
            subject: chapter.subject,
            materials,
            prevLesson,
            nextLesson
        });
    } catch (err) {
        console.error(err);
        res.redirect('/learning');
    }
});

// ============================================
// API: Get subjects list (for AJAX)
// ============================================
router.get('/api/subjects', async (req, res) => {
    try {
        const subjects = await Subject.find({});
        res.json(subjects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// API: Get chapters by subject (for AJAX)
// ============================================
router.get('/api/chapters/:subjectId', async (req, res) => {
    try {
        const chapters = await Chapter.find({ subject: req.params.subjectId }).sort({ order: 1 });
        res.json(chapters);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// API: Get lessons by chapter (for AJAX)
// ============================================
router.get('/api/lessons/:chapterId', async (req, res) => {
    try {
        const lessons = await Lesson.find({ chapter: req.params.chapterId }).sort({ order: 1 });
        res.json(lessons);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
