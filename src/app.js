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
app.use('/static', express.static(path.join(__dirname, '../app/static'))); // Serve static files at /static
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
        'exam.index': '/exam/',
        'explore.index': '/explore/',
        'ideas.index': '/ideas/'
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

// Add date filter for templates
const moment = require('moment');
env.addFilter('date', function(date, format) {
    return moment(date).format(format || 'DD/MM/YYYY');
});

// Add truncate filter
env.addFilter('truncate', function(str, length) {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length) + '...';
});

// Add global function get_flashed_messages and user session
app.use((req, res, next) => {
    res.locals.request = req; // Make request available in templates

    // Make user available in all templates
    env.addGlobal('user', req.session ? req.session.user : null);

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
const authRoutes = require('./routes/auth');
const exploreRoutes = require('./routes/explore');
const ideasRoutes = require('./routes/ideas');
const blogRoutes = require('./routes/blog');

// Dashboard route
app.get('/dashboard', (req, res) => {
    res.render('dashboard.html', { user: req.session ? req.session.user : null });
});

// Demo Toast route
app.get('/demo-toast', (req, res) => {
    res.render('demo-toast.html', { user: req.session ? req.session.user : null });
});

app.use('/', mainRoutes);
app.use('/learning', learningRoutes);
app.use('/exam', examRoutes);
app.use('/auth', authRoutes);
app.use('/explore', exploreRoutes);
app.use('/ideas', ideasRoutes);
app.use('/blog', blogRoutes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
