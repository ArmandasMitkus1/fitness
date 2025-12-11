// index.js

// Load environment variables from .env file
require('dotenv').config();

// 1. Setup Express
const express = require('express');
const app = express();
const PORT = 8000; 

// REQUIRED: Session Middleware
const session = require('express-session'); // Assuming you ran npm install for this
app.use(session({
    secret: 'A_STRONG_SECRET_KEY_FOR_SESSIONS', // CHANGE THIS!
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if deployed with HTTPS
}));

// ... (rest of index.js middleware setup: EJS, static, urlencoded)

// ... (rest of database connection setup)

// 5. Basic Routes Setup (Require authentication for secure routes)
const router = express.Router();
const authRoutes = require('./routes/auth'); // NEW AUTH ROUTES
const workoutRoutes = require('./routes/workouts'); 

// Attach the routers to the app
app.use('/', router);
app.use('/', authRoutes); // Use the new authentication routes
app.use('/', workoutRoutes); 

// ... (Start the server)
