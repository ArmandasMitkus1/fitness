//-----------------------------------------------------
// IMPORTS
//-----------------------------------------------------
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql2');
const expressSanitizer = require('express-sanitizer');
require('dotenv').config();

//-----------------------------------------------------
// INITIALISE SERVER
//-----------------------------------------------------
const app = express();
const port = 8000;

//-----------------------------------------------------
// DATABASE
//-----------------------------------------------------
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
global.db = db;

//-----------------------------------------------------
// SHOP SETTINGS
//-----------------------------------------------------
const appData = {
  appName: "Fitness Tracker",
  basePath: ""
};

//-----------------------------------------------------
// MIDDLEWARE
//-----------------------------------------------------
app.use(session({
  secret: "randomsecretkey",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }
}));
app.use(expressSanitizer());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

//-----------------------------------------------------
// VIEW ENGINE
//-----------------------------------------------------
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

//-----------------------------------------------------
// ROUTES
//-----------------------------------------------------
const router = require("express").Router();

// Core routes
require("./routes/main")(router, appData);

// API routes
require("./routes/api")(router);

app.use("/", router);

//-----------------------------------------------------
// START SERVER
//-----------------------------------------------------
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}/`);
});
