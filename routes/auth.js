// routes/auth.js

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); 
// NOTE: bcrypt must be successfully installed on your VM

// =========================================================
// 1. LOGIN ROUTES
// =========================================================

// GET /login - Renders the login form
router.get('/login', (req, res) => {
    res.render('login', { 
        pageTitle: 'User Login',
        error: null 
    });
});

// POST /login - Handles form submission and authentication
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const pool = req.app.locals.pool;

    try {
        // 1. Check for user existence
        const [rows] = await pool.query('SELECT * FROM User WHERE username = ?', [username]);
        const user = rows[0];

        if (user) {
            // 2. Password Check (using bcrypt)
            // *** ONLY ONE DECLARATION OF 'match' HERE ***
            const match = await bcrypt.compare(password, user.password_hash);
            
            if (match) {
                // Success: Set session variables
                req.session.isLoggedIn = true;
                req.session.userId = user.id;
                req.session.username = user.username;
                
                return res.redirect('/'); 
            }
        }

        // Failure: Re-render login with an error message
        res.render('login', { 
            pageTitle: 'User Login',
            error: 'Invalid username or password.'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.render('login', { 
            pageTitle: 'User Login',
            error: 'A database error occurred during login.' 
        });
    }
});


// =========================================================
// 2. REGISTRATION ROUTES (SECURE)
// =========================================================

// GET /register - Renders the registration form
router.get('/register', (req, res) => {
    res.render('register', { 
        pageTitle: 'User Registration',
        error: null 
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
        await pool.query(
            'INSERT INTO User (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, password_hash]
        );

        // Success: Redirect to login page
        res.redirect('/login?registered=true');

    } catch (error) {
        // If this runs, it means the database query failed OR bcrypt failed.
        console.error('Registration error:', error);
        res.render('register', { pageTitle: 'User Registration', error: 'An unexpected error occurred during registration.' });
    }
});

// =========================================================
// 3. LOGOUT ROUTE
// =========================================================

// GET /logout - Clears session and redirects
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) console.error(err);
        res.redirect('/login');
    });
});

module.exports = router;
