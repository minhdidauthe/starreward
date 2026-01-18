const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    title: { type: String, required: true, maxlength: 150 },
    description: { type: String, maxlength: 255 },
    duration_minutes: { type: Number, default: 45 },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }
});

const questionSchema = new mongoose.Schema({
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    content: { type: String, required: true },
    question_type: { type: String, default: 'multiple_choice', maxlength: 20 },
    points: { type: Number, default: 1.0 },
    options: [String], // Array of strings
    correct_answer: { type: String, maxlength: 255 }
});

const examScheduleSchema = new mongoose.Schema({
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    start_time: { type: Date, required: true },
    end_time: { type: Date },
    is_completed: { type: Boolean, default: false },
    score: { type: Number }
});

const examResultSchema = new mongoose.Schema({
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamSchedule', required: true },
    answers: { type: Map, of: String }, // Dictionary of answers
    evaluated_at: { type: Date, default: Date.now }
});

module.exports = {
    Exam: mongoose.model('Exam', examSchema),
    Question: mongoose.model('Question', questionSchema),
    ExamSchedule: mongoose.model('ExamSchedule', examScheduleSchema),
    ExamResult: mongoose.model('ExamResult', examResultSchema)
};
