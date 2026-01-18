const express = require('express');
const mongoose = require('mongoose');
const nunjucks = require('nunjucks');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database Connection
mongoose.connect('mongodb://localhost:27017/star_reward_app')
    .then(() => {
        console.log('MongoDB Connected');
        require('./utils/seed')(); // Run seed
    })
    .catch(err => console.error('MongoDB Connection Error:', err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../app/static'))); // Serve static files
app.use(session({
    secret: 'secret_key',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

// Helper function to mock Flask's url_for
const urlFor = (endpoint, kwargs) => {
    if (endpoint === 'static') {
        return `/static/${kwargs.filename}`;
    }
    // Mapping Flask endpoints to Express Routes
    const mapping = {
        'main.index': '/',
        'main.add_student': '/add_student',
        'main.student': `/student/${kwargs ? kwargs.student_id : ''}`,
        'main.add_stars': `/add_stars/${kwargs ? kwargs.student_id : ''}`,
        'main.add_task': `/add_task/${kwargs ? kwargs.student_id : ''}`,
        'main.add_test_data': `/add_test_data/${kwargs ? kwargs.student_id : ''}`,
        'main.clear_test_data': `/clear_test_data/${kwargs ? kwargs.student_id : ''}`,
        'learning.index': '/learning/',
        'exam.index': '/exam/'
    };
    return mapping[endpoint] || '#';
};

// Nunjucks Configuration
const env = nunjucks.configure(path.join(__dirname, '../app/templates'), {
    autoescape: true,
    express: app,
    noCache: true
});

// Add global function url_for
env.addGlobal('url_for', urlFor);
// Add global function get_flashed_messages
app.use((req, res, next) => {
    res.locals.request = req; // Make request available in templates
    env.addGlobal('get_flashed_messages', (kwargs) => {
        const messages = req.flash();
        const result = [];
        if (kwargs && kwargs.with_categories) {
            for (const [category, msgs] of Object.entries(messages)) {
                msgs.forEach(m => result.push([category, m]));
            }
        } else {
            for (const msgs of Object.values(messages)) {
                msgs.forEach(m => result.push(m));
            }
        }
        return result;
    });
    next();
});

// Routes
const mainRoutes = require('./routes/main');
const learningRoutes = require('./routes/learning');
const examRoutes = require('./routes/exam');

app.use('/', mainRoutes);
app.use('/learning', learningRoutes);
app.use('/exam', examRoutes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
