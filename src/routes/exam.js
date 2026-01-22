const express = require('express');
const router = express.Router();
const { Exam, Question, ExamSchedule, ExamResult } = require('../models/Exam');
const { Subject } = require('../models/Learning');

// ============================================
// Exam Home - List all available exams
// ============================================
router.get('/', async (req, res) => {
    try {
        const exams = await Exam.find({}).populate('subject');

        // Get question count for each exam
        const examsWithCount = await Promise.all(exams.map(async (exam) => {
            const questionCount = await Question.countDocuments({ exam: exam._id });
            return {
                ...exam.toObject(),
                questionCount
            };
        }));

        res.render('exam/index.html', { exams: examsWithCount });
    } catch (err) {
        console.error(err);
        res.render('exam/index.html', { exams: [] });
    }
});

// ============================================
// Exam Detail - Show exam info before starting
// ============================================
router.get('/detail/:id', async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id).populate('subject');
        if (!exam) {
            req.flash('danger', 'Không tìm thấy đề thi!');
            return res.redirect('/exam');
        }

        const questionCount = await Question.countDocuments({ exam: exam._id });

        res.render('exam/detail.html', {
            exam,
            questionCount
        });
    } catch (err) {
        console.error(err);
        res.redirect('/exam');
    }
});

// ============================================
// Start Exam - Begin a new exam session
// ============================================
router.get('/start/:id', async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id).populate('subject');
        if (!exam) {
            req.flash('danger', 'Không tìm thấy đề thi!');
            return res.redirect('/exam');
        }

        const questions = await Question.find({ exam: exam._id });

        res.render('exam/take.html', {
            exam,
            questions
        });
    } catch (err) {
        console.error(err);
        res.redirect('/exam');
    }
});

// ============================================
// Submit Exam - Process exam answers
// ============================================
router.post('/submit/:id', async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).json({ error: 'Không tìm thấy đề thi' });
        }

        const questions = await Question.find({ exam: exam._id });
        const answers = req.body.answers || {};

        let correctCount = 0;
        let totalPoints = 0;
        let earnedPoints = 0;

        const results = questions.map(q => {
            totalPoints += q.points;
            const userAnswer = answers[q._id.toString()];
            const isCorrect = userAnswer === q.correct_answer;

            if (isCorrect) {
                correctCount++;
                earnedPoints += q.points;
            }

            return {
                questionId: q._id,
                content: q.content,
                options: q.options,
                userAnswer,
                correctAnswer: q.correct_answer,
                isCorrect,
                points: q.points
            };
        });

        const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

        res.render('exam/result.html', {
            exam,
            results,
            correctCount,
            totalQuestions: questions.length,
            score,
            earnedPoints,
            totalPoints
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// API: Get all exams
// ============================================
router.get('/api/exams', async (req, res) => {
    try {
        const exams = await Exam.find({}).populate('subject');
        res.json(exams);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ============================================
// API: Get questions by exam
// ============================================
router.get('/api/questions/:examId', async (req, res) => {
    try {
        const questions = await Question.find({ exam: req.params.examId });
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
