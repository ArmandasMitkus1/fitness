// index.js

// Load environment variables from .env file
require('dotenv').config();

// Require the path module for reliable directory joining
const path = require('path'); 

// 1. Setup Express
const express = require('express');
const app = express();
const PORT = 8000; // Required port

// 2. Setup EJS as the view engine
app.set('view engine', 'ejs');
// Use an absolute path to ensure EJS correctly finds the 'views' folder
app.set('views', path.join(__dirname, 'views')); 

// 3. Middleware
// To serve static files (CSS/JS/images) from the 'public' folder
app.use(express.static('public')); 

// To parse incoming request bodies (using express built-in body parsing)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// REQUIRED: Session Middleware (for authentication)
const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET || 'A_STRONG_FALLBACK_SECRET_KEY',
    resave: false,
    saveUninitialized: false,
    // Note: secure: false is appropriate for the non-HTTPS VM deployment
}));

// 4. Database Connection Pool Setup (using the environment variables)
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: process.env.HEALTH_HOST,
    user: process.env.HEALTH_USER,
    password: process.env.HEALTH_PASSWORD,
    database: process.env.HEALTH_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Make the pool accessible to all routes
app.locals.pool = pool;

// 5. Authentication and Authorization Check (Global Middleware)
app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn; 
    res.locals.username = req.session.username;
    next();
});

// 6. Basic Routes Setup
const router = express.Router(); 
const authRoutes = require('./routes/auth'); 
const workoutRoutes = require('./routes/workouts'); 

// Core Compulsory Pages (Home and About)
router.get('/', (req, res) => {
    res.render('index', { pageTitle: 'Home Page' });
});

router.get('/about', (req, res) => {
    res.render('about', { pageTitle: 'About Page' });
});


// Attach the routers to the app
app.use('/', router);
app.use('/', authRoutes);
app.use('/', workoutRoutes);

// 7. Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Deployed URL Base: ${process.env.HEALTH_BASE_PATH}`);
});
