// routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Make sure bcrypt is required!

// (Your existing /login and /logout routes go here)

// --- NEW REGISTRATION ROUTES ---

// GET /register - Renders the registration form
router.get('/register', (req, res) => {
    res.render('register', { 
        pageTitle: 'User Registration',
        error: null // Initialize error variable
    });
});

// POST /register - Handles new user creation
router.post('/register', async (req, res) => {
    const { username, email, password, confirm_password } = req.body;
    const pool = req.app.locals.pool;
    
    // 1. Basic Validation (Password match)
    if (password !== confirm_password) {
        return res.render('register', { pageTitle: 'User Registration', error: 'Passwords do not match.' });
    }

    try {
        // 2. Check if user already exists
        const [existingUser] = await pool.query('SELECT id FROM User WHERE username = ? OR email = ?', [username, email]);
        if (existingUser.length > 0) {
            return res.render('register', { pageTitle: 'User Registration', error: 'Username or Email already in use.' });
        }

        // 3. Hash the password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // 4. Insert new user into the database
        const result = await pool.query(
            'INSERT INTO User (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, password_hash]
        );

        // Success: Redirect to login page
        res.redirect('/login?registered=true');

    } catch (error) {
        console.error('Registration error:', error);
        res.render('register', { pageTitle: 'User Registration', error: 'An unexpected error occurred during registration.' });
    }
});

module.exports = router;
