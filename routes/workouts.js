// routes/workouts.js

const express = require('express');
const router = express.Router();

// ===============================================
// Middleware to protect logged-in routes
// ===============================================
function requireLogin(req, res, next) {
  if (!req.session || !req.session.isLoggedIn) {
    const base = process.env.HEALTH_BASE_PATH || '/usr/428/';
    return res.redirect(`${base}login`);
  }
  next();
}

// ===============================================
// 1. ADD WORKOUT ROUTES
// ===============================================

// GET /add-workout - Render add workout form
router.get('/add-workout', requireLogin, (req, res) => {
  res.render('add_workout', {
    pageTitle: 'Add Workout',
    error: null,
    success: null,
  });
});

// POST /add-workout - Handle form submission
router.post('/add-workout', requireLogin, async (req, res) => {
  const { workout_date, type, duration_minutes, notes } = req.body;
  const pool = req.app.locals.pool;

  try {
    await pool.query(
      `INSERT INTO Workout (user_id, workout_date, type, duration_minutes, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [req.session.userId, workout_date, type, duration_minutes, notes]
    );

    res.render('add_workout', {
      pageTitle: 'Add Workout',
      error: null,
      success: 'Workout added successfully!',
    });
  } catch (error) {
    console.error('❌ Error adding workout:', error);
    res.render('add_workout', {
      pageTitle: 'Add Workout',
      error: 'Failed to save workout. Please try again.',
      success: null,
    });
  }
});

// ===============================================
// 2. LOGS ROUTE - VIEW ALL WORKOUTS
// ===============================================

// GET /logs - Show workouts for the logged-in user
router.get('/logs', requireLogin, async (req, res) => {
  const pool = req.app.locals.pool;

  try {
    const [rows] = await pool.query(
      `SELECT workout_date, type, duration_minutes, notes
       FROM Workout
       WHERE user_id = ?
       ORDER BY workout_date DESC`,
      [req.session.userId]
    );

    res.render('logs', {
      pageTitle: 'Workout Logs',
      username: req.session.username,
      workouts: rows,
      error: null,
    });
  } catch (error) {
    console.error('❌ Error loading logs:', error);
    res.render('logs', {
      pageTitle: 'Workout Logs',
      username: req.session.username,
      workouts: [],
      error: 'Could not load workout logs.',
    });
  }
});

// ===============================================
// 3. CHARTS ROUTE - DATA VISUALISATION
// ===============================================

// GET /charts - Display summary chart of workouts
router.get('/charts', requireLogin, async (req, res) => {
  const pool = req.app.locals.pool;

  try {
    // Aggregate total workout duration per type
    const [rows] = await pool.query(
      `SELECT type, SUM(duration_minutes) AS total_duration
       FROM Workout
       WHERE user_id = ?
       GROUP BY type
       ORDER BY total_duration DESC`,
      [req.session.userId]
    );

    res.render('charts', {
      pageTitle: 'Workout Charts',
      username: req.session.username,
      chartData: rows,
    });
  } catch (error) {
    console.error('❌ Error loading chart data:', error);
    res.render('charts', {
      pageTitle: 'Workout Charts',
      username: req.session.username,
      chartData: [],
    });
  }
});

module.exports = router;
