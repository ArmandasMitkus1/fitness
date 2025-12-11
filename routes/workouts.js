// routes/workouts.js
const express = require('express');
const router = express.Router();

// Middleware to protect pages
function requireLogin(req, res, next) {
  if (!req.session.isLoggedIn) {
    const base = process.env.HEALTH_BASE_PATH || '/usr/428/';
    return res.redirect(`${base}login`);
  }
  next();
}

// =========================================================
// 1. ADD WORKOUT
// =========================================================

// GET /add_workout - render form
router.get('/add_workout', requireLogin, (req, res) => {
  res.render('add_workout', {
    pageTitle: 'Add Workout',
    error: null,
    success: null
  });
});

// POST /add_workout - handle form submission
router.post('/add_workout', requireLogin, async (req, res) => {
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
      success: 'Workout added successfully!'
    });
  } catch (error) {
    console.error('Error adding workout:', error);
    res.render('add_workout', {
      pageTitle: 'Add Workout',
      error: 'Failed to save workout. Please try again.',
      success: null
    });
  }
});

// =========================================================
// 2. VIEW WORKOUT LOGS
// =========================================================

// GET /logs - list workouts for current user
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
      workouts: rows
    });
  } catch (error) {
    console.error('Error loading logs:', error);
    res.render('logs', {
      pageTitle: 'Workout Logs',
      workouts: [],
      error: 'Could not load workout logs.'
    });
  }
});

module.exports = router;
