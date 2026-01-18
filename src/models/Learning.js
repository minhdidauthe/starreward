const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true, maxlength: 100 },
    description: { type: String, maxlength: 255 },
    icon: { type: String, default: 'fa-book', maxlength: 50 }
});

const chapterSchema = new mongoose.Schema({
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    title: { type: String, required: true, maxlength: 150 },
    order: { type: Number, default: 0 }
});

const lessonSchema = new mongoose.Schema({
    chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
    title: { type: String, required: true, maxlength: 150 },
    content: { type: String }, // Markdown or HTML
    video_url: { type: String, maxlength: 255 }
});

const materialSchema = new mongoose.Schema({
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    title: { type: String, required: true, maxlength: 150 },
    file_path: { type: String, required: true, maxlength: 255 },
    file_type: { type: String, maxlength: 20 }
});

const learningPathSchema = new mongoose.Schema({
    title: { type: String, required: true, maxlength: 150 },
    description: { type: String, maxlength: 255 },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' } // Optional
});

module.exports = {
    Subject: mongoose.model('Subject', subjectSchema),
    Chapter: mongoose.model('Chapter', chapterSchema),
    Lesson: mongoose.model('Lesson', lessonSchema),
    Material: mongoose.model('Material', materialSchema),
    LearningPath: mongoose.model('LearningPath', learningPathSchema)
};
