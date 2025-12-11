// routes/auth.js

const express = require('express');
const router = express.Router();
// NOTE: You must also require bcrypt if you are handling POST login/registration
// const bcrypt = require('bcrypt'); 

// GET /login - Renders the login form
router.get('/login', (req, res) => {
    // *** FIX: Initialize the 'error' variable to prevent ReferenceError on first load ***
    res.render('login', { 
        pageTitle: 'User Login',
        error: null // <-- FIX IS HERE
    });
});

// POST /login - Handles form submission and authentication
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const pool = req.app.locals.pool;

    // 1. Basic check for user existence
    const [rows] = await pool.query('SELECT * FROM User WHERE username = ?', [username]);
    const user = rows[0];

    if (user) {
        // 2. Password Check (using bcrypt)
        // const match = await bcrypt.compare(password, user.password_hash);
        
        // --- TEMPORARY FIX: For testing before bcrypt is integrated ---
        // Assuming your 'gold' user password is 'smiths123ABC$'
        const TEMPORARY_PASSWORD = 'smiths123ABC$'; 
        const match = (password === TEMPORARY_PASSWORD); // REPLACE WITH REAL BCRYPT CHECK
        // --- END TEMPORARY FIX ---


        if (match) {
            // Success: Set session variables
            req.session.isLoggedIn = true;
            req.session.userId = user.id; // Store ID for workout logs
            req.session.username = user.username;
            
            return res.redirect('/'); // Redirect to home or logs page
        }
    }

    // Failure: Re-render login with an error message
    res.render('login', { 
        pageTitle: 'User Login',
        error: 'Invalid username or password.' // Pass the error message
    });
});

// GET /logout - Clears session and redirects
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) console.error(err);
        res.redirect('/login');
    });
});

module.exports = router;
