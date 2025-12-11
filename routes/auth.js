const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

/**
 * GET /login
 * Displays the login form.
 */
router.get('/login', (req, res) => {
    // Check if an error message was passed in the session or query (e.g., from a failed login attempt)
    const errorMessage = req.session.errorMessage;
    req.session.errorMessage = null; // Clear the message after displaying it

    res.render('login', { 
        pageTitle: 'User Login', 
        errorMessage: errorMessage 
    });
});

/**
 * POST /login
 * Processes the login attempt.
 */
router.post('/login', async (req, res) => {
    const pool = req.app.locals.pool;
    const { username, password } = req.body;

    // 1. Basic check for empty fields
    if (!username || !password) {
        req.session.errorMessage = 'Please enter both username and password.';
        return res.redirect('/login');
    }

    try {
        // 2. Find the user by username
        const [users] = await pool.query('SELECT user_id, username, hashed_password FROM User WHERE username = ?', [username]);

        if (users.length === 0) {
            req.session.errorMessage = 'Invalid username or password.';
            return res.redirect('/login');
        }

        const user = users[0];
        
        // 3. Compare the entered password with the stored hash
        // This is a key Additional Technique (Security)
        const match = await bcrypt.compare(password, user.hashed_password);

        if (match) {
            // 4. Success: Create a session
            req.session.isLoggedIn = true;
            req.session.userId = user.user_id;
            req.session.username = user.username;
            
            // Redirect to the secured logs page after successful login
            return res.redirect('/logs'); 
        } else {
            req.session.errorMessage = 'Invalid username or password.';
            return res.redirect('/login');
        }

    } catch (error) {
        console.error('Login error:', error);
        req.session.errorMessage = 'A server error occurred during login. Please try again.';
        return res.redirect('/login');
    }
});

/**
 * GET /logout
 * Destroys the user session.
 */
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            // Handle error, but generally safe to redirect anyway
        }
        // Redirect to the login page after logging out
        res.redirect('/login');
    });
});

module.exports = router;
