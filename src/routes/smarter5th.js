const express = require('express');
const router = express.Router();
const { Student, Reward } = require('../models/Basic');

// Main game page
router.get('/', async (req, res) => {
    try {
        const students = await Student.find({}).sort({ name: 1 });
        res.render('smarter5th/index.html', {
            students,
            user: req.session ? req.session.user : null
        });
    } catch (error) {
        console.error('Error loading Smarter Than 5th Grader:', error);
        res.render('smarter5th/index.html', {
            students: [],
            user: req.session ? req.session.user : null
        });
    }
});

// Play game page
router.get('/play', async (req, res) => {
    try {
        const students = await Student.find({}).sort({ name: 1 });
        const selectedStudentId = req.query.studentId || null;

        res.render('smarter5th/play.html', {
            students,
            selectedStudentId,
            user: req.session ? req.session.user : null
        });
    } catch (error) {
        console.error('Error loading game:', error);
        res.redirect('/smarter5th');
    }
});

// API: Complete game & award stars
router.post('/api/complete', async (req, res) => {
    try {
        const { score, prizeMoney, questionsAnswered, studentId } = req.body;

        // Calculate stars based on prize money
        let starsEarned = 0;
        if (prizeMoney >= 1000000) starsEarned = 50;
        else if (prizeMoney >= 300000) starsEarned = 30;
        else if (prizeMoney >= 100000) starsEarned = 20;
        else if (prizeMoney >= 25000) starsEarned = 10;
        else if (prizeMoney >= 5000) starsEarned = 5;
        else if (prizeMoney >= 1000) starsEarned = 2;
        else starsEarned = 1;

        // Award stars to student
        if (studentId) {
            const student = await Student.findById(studentId);
            if (student) {
                await Reward.create({
                    stars: starsEarned,
                    reason: `Are You Smarter Than a 5th Grader? - $${prizeMoney.toLocaleString()} (${questionsAnswered}/11 questions)`,
                    student: student._id,
                    is_penalty: false
                });

                await Student.updateOne(
                    { _id: student._id },
                    { $inc: { total_stars: starsEarned } }
                );
            }
        }

        res.json({
            success: true,
            starsEarned,
            message: `Congratulations! You earned ${starsEarned} stars!`
        });
    } catch (error) {
        console.error('Error completing game:', error);
        res.status(500).json({ error: 'Failed to complete game' });
    }
});

module.exports = router;
