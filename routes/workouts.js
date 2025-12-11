const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator'); // For validation
const { trim, escape } = require('express-sanitizer'); // For sanitization (Additional Technique)

// --- 1. Middleware to Restrict Access (Basic/Additional Technique) ---
function isAuthenticated(req, res, next) {
    if (req.session.isLoggedIn) {
        // Pass the user's ID from the session to the request object for easy access
        req.userId = req.session.userId; 
        next(); 
    } else {
        // Not logged in, redirect to login page with an optional error message
        req.session.errorMessage = 'Please log in to access this page.';
        res.redirect('/login');
    }
}

// --- 2. Validation and Sanitization Middleware (Additional Technique) ---
const validateWorkout = [
    // Sanitize user input before validation (Security)
    body('workout_type').trim().escape(),
    
    // Validate required fields
    body('workout_type').notEmpty().withMessage('Workout type is required.'),
    body('duration_minutes').isInt({ gt: 0 }).withMessage('Duration must be a positive number in minutes.'),
    body('calories_burned').isInt({ min: 0 }).withMessage('Calories must be 0 or greater.'),
    body('workout_date').isISO8601().toDate().withMessage('Invalid date format.'),
];


// --- 3. GET Add Workout Form (Secured) ---
router.get('/add-workout', isAuthenticated, (req, res) => {
    res.render('add_workout', { 
        pageTitle: 'Add New Workout', 
        errors: [], 
        formData: {} 
    });
});


// --- 4. POST Add Workout Form Submission (Compulsory Feature) ---
router.post('/add-workout', isAuthenticated, validateWorkout, async (req, res) => {
    const pool = req.app.locals.pool;
    const errors = validationResult(req); 
    const user_id = req.userId; // Retrieved from the session in the isAuthenticated middleware
    const { workout_type, duration_minutes, calories_burned, workout_date } = req.body;

    if (!errors.isEmpty()) {
        // If validation fails, re-render the form with errors and previous input
        return res.render('add_workout', { 
            pageTitle: 'Add Workout', 
            errors: errors.array(), 
            formData: req.body 
        });
    }

    try {
        const sql = `
            INSERT INTO Workout (user_id, workout_type, duration_minutes, calories_burned, workout_date) 
            VALUES (?, ?, ?, ?, ?)
        `;
        await pool.query(sql, [user_id, workout_type, duration_minutes, calories_burned, workout_date]);
        
        // Redirect to the logs page with a success message
        res.redirect('/logs?success=true'); 
    } catch (error) {
        console.error('Database insertion error:', error);
        res.status(500).render('error', { message: 'Failed to record workout due to a server error.' });
    }
});


// --- 5. GET View/Search Logs (Compulsory Feature) ---
router.get('/logs', isAuthenticated, async (req, res) => {
    const pool = req.app.locals.pool;
    const user_id = req.userId; 
    
    // Get query parameters for filtering/searching
    const searchTerm = req.query.search || '';
    const startDate = req.query.start_date || '';
    const endDate = req.query.end_date || '';
    const success = req.query.success === 'true'; // For success flash message
    
    let query = `
        SELECT * FROM Workout 
        WHERE user_id = ?
    `;
    let params = [user_id];
    
    // Implement search based on workout_type
    if (searchTerm) {
        query += ` AND workout_type LIKE ?`;
        params.push(`%${searchTerm}%`);
    }
    
    // Implement date range filtering
    if (startDate) {
        query += ` AND workout_date >= ?`;
        params.push(startDate);
    }
    if (endDate) {
        query += ` AND workout_date <= ?`;
        params.push(endDate);
    }

    query += ` ORDER BY workout_date DESC;`;

    try {
        // 5a. Fetch workout logs (data display)
        const [logs] = await pool.query(query, params);

        // 5b. Fetch summary/aggregation data (Additional Technique)
        const [summary] = await pool.query(`
            SELECT 
                COUNT(workout_id) AS total_workouts,
                SUM(duration_minutes) AS total_duration,
                SUM(calories_burned) AS total_calories
            FROM Workout 
            WHERE user_id = ?`, [user_id]);

        res.render('logs', { 
            pageTitle: 'Workout Logs & Search',
            logs: logs,
            summary: summary[0],
            searchTerm: searchTerm,
            startDate: startDate,
            endDate: endDate,
            success: success
        });
    } catch (error) {
        console.error('Error fetching workout logs:', error);
        res.status(500).render('error', { message: 'Could not load workout logs.' });
    }
});


// --- 6. Advanced Technique: GET Chart Data API ---
router.get('/api/chart-data', isAuthenticated, async (req, res) => {
    const pool = req.app.locals.pool;
    const user_id = req.userId;

    const query = `
        SELECT workout_type, SUM(calories_burned) AS total_calories 
        FROM Workout 
        WHERE user_id = ?
        GROUP BY workout_type
        ORDER BY total_calories DESC
    `;

    try {
        const [data] = await pool.query(query, [user_id]);
        // Return data as JSON for the client-side JavaScript to consume
        res.json(data);
    } catch (error) {
        console.error('Error fetching chart data:', error);
        res.status(500).json({ error: 'Failed to fetch chart data' });
    }
});


// --- 7. GET Chart View (Secured) ---
router.get('/charts', isAuthenticated, (req, res) => {
    res.render('chart', { pageTitle: 'Data Visualization' });
});


module.exports = router;
