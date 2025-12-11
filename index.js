// index.js

// ===============================================
// 1. Load Environment Variables
// ===============================================
require('dotenv').config();
const path = require('path');

// ===============================================
// 2. Express Setup
// ===============================================
const express = require('express');
const app = express();
const PORT = 8000; // local testing port

// ===============================================
// 3. View Engine (EJS) Setup
// ===============================================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===============================================
// 4. Middleware
// ===============================================

// Serve static files (CSS, JS, images) from 'public'
app.use(express.static('public'));

// Parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ===============================================
// 5. Session Management
// ===============================================
const session = require('express-session');
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'A_STRONG_FALLBACK_SECRET_KEY',
    resave: false,
    saveUninitialized: false,
  })
);

// ===============================================
// 6. Database Connection
// ===============================================
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.HEALTH_HOST,
  user: process.env.HEALTH_USER,
  password: process.env.HEALTH_PASSWORD,
  database: process.env.HEALTH_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test DB connection on startup
pool
  .getConnection()
  .then((conn) => {
    console.log('✅ Database connection successful');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });

// Make pool accessible everywhere
app.locals.pool = pool;

// ===============================================
// 7. Global Variables Middleware
// ===============================================
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;
  res.locals.username = req.session.username;
  next();
});

// ===============================================
// 8. Routes Setup
// ===============================================
const router = express.Router();
const authRoutes = require('./routes/auth');
const workoutRoutes = require('./routes/workouts');

// Core pages
router.get('/', (req, res) => {
  res.render('index', { pageTitle: 'Home Page' });
});

router.get('/about', (req, res) => {
  res.render('about', { pageTitle: 'About Page' });
});

// Attach routers
app.use('/', router);
app.use('/', authRoutes);
app.use('/', workoutRoutes);

// ===============================================
// 9. Optional: DB Test Route
// ===============================================
router.get('/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.send('DB OK, 1 + 1 = ' + rows[0].result);
  } catch (err) {
    res.status(500).send('DB error: ' + err.message);
  }
});

// ===============================================
// 10. Start Server
// ===============================================
app.listen(PORT, () => {
  console.log(`🚀 Server running locally on http://localhost:${PORT}`);
  console.log(
    `🌍 Goldsmiths URL: ${process.env.HEALTH_BASE_PATH || '/usr/428/'}`
  );
});
