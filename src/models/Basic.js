const mongoose = require('mongoose');

const dailyTaskSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 100 },
    default_stars: { type: Number, required: true },
    description: { type: String, maxlength: 200 }
});

const studentSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 100 },
    total_stars: { type: Number, default: 0 }
}, { strict: false });

const rewardSchema = new mongoose.Schema({
    stars: { type: Number, required: true },
    reason: { type: String, required: true, maxlength: 200 },
    date: { type: Date, default: Date.now },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    is_penalty: { type: Boolean, default: false },
    task: { type: mongoose.Schema.Types.ObjectId, ref: 'DailyTask' }
});

const taskSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 200 },
    due_date: { type: Date, required: true },
    is_completed: { type: Boolean, default: false }
});

module.exports = {
    DailyTask: mongoose.model('DailyTask', dailyTaskSchema),
    Student: mongoose.model('Student', studentSchema),
    Reward: mongoose.model('Reward', rewardSchema),
    Task: mongoose.model('Task', taskSchema)
};
