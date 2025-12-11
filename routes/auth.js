// routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

// Base path for deployment (Goldsmiths proxy)
// Set HEALTH_BASE_PATH='/usr/428/' in your .env
const BASE_PATH = process.env.HEALTH_BASE_PATH || '/usr/428/';

// =========================================================
// 1. LOGIN ROUTES
// =========================================================

// GET /login - render login form
router.get('/login', (req, res) => {
    res.render('login', {
        pageTitle: 'User Login',
        error: null
    });
});

// POST /login - handle auth
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const pool = req.app.locals.pool;

    try {
        // Find user by username
        const [rows] = await pool.query(
            'SELECT * FROM User WHERE username = ?',
            [username]
        );
        const user = rows[0];

        if (user) {
            // Compare password with stored hash
            const match = await bcrypt.compare(password, user.password_hash);

            if (match) {
                // Set session
                req.session.isLoggedIn = true;
                req.session.userId = user.id;
                req.session.username = user.username;

                console.log(`✅ Login successful for ${username}`);
                return res.redirect(`${BASE_PATH}`);
            }
        }

        // If no user or password mismatch
        res.render('login', {
            pageTitle: 'User Login',
            error: 'Invalid username or password.'
        });

    } catch (error) {
        console.error('❌ Login error:', {
            code: error.code,
            message: error.message,
            sqlMessage: error.sqlMessage
        });

        res.render('login', {
            pageTitle: 'User Login',
            error: 'A database error occurred during login.'
        });
    }
});

// =========================================================
// 2. REGISTRATION ROUTES
// =========================================================

// GET /register - render registration form
router.get('/register', (req, res) => {
    res.render('register', {
        pageTitle: 'User Registration',
        error: null
    });
});

// POST /register - create new user
router.post('/register', async (req, res) => {
    const { username, email, password, confirm_password } = req.body;
    const pool = req.app.locals.pool;

    // Simple password confirmation check
    if (password !== confirm_password) {
        return res.render('register', {
            pageTitle: 'User Registration',
            error: 'Passwords do not match.'
        });
    }

    try {
        // Check if username or email already exists
        const [existingUser] = await pool.query(
            'SELECT id FROM User WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser.length > 0) {
            return res.render('register', {
                pageTitle: 'User Registration',
                error: 'Username or Email already in use.'
            });
        }

        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert into DB
        await pool.query(
            'INSERT INTO User (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, password_hash]
        );

        console.log(`✅ New user registered: ${username}`);
        // Redirect through Goldsmiths proxy path
        res.redirect(`${BASE_PATH}login?registered=true`);

    } catch (error) {
        console.error('❌ Registration error:', {
            code: error.code,
            message: error.message,
            sqlMessage: error.sqlMessage
        });

        res.render('register', {
            pageTitle: 'User Registration',
            error: 'An unexpected error occurred during registration.'
        });
    }
});

// =========================================================
// 3. LOGOUT ROUTE
// =========================================================

// GET /logout - destroy session and go to login
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('❌ Logout error:', err);
        }
        res.redirect(`${BASE_PATH}login`);
    });
});

module.exports = router;
