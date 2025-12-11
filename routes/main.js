const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = function(router) {

  // Login protection
  const redirectLogin = (req, res, next) => {
    if (!req.session?.userId) return res.redirect("/login");
    next();
  };

  // Home
  router.get("/", (req, res) => {
    res.render("index", { shopName: "Fitness Tracker", basePath: "" });
  });

  // Register
  router.get("/register", (req, res) => {
    res.render("register", { shopName: "Fitness Tracker", basePath: "" });
  });

  router.post("/registered", [
      check('email').isEmail(),
      check('username').isLength({ min: 5, max: 20 }),
      check('password').isLength({ min: 8 })
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.render('register', { shopName: "Fitness Tracker", basePath: "" });

      const { first, last, email, username, password } = req.body;

      bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) return res.send("Error hashing password");

        const sql = `INSERT INTO users (username, first_name, last_name, email, hashedPassword)
                     VALUES (?, ?, ?, ?, ?)`;
        db.query(sql, [username, first, last, email, hash], (err2) => {
          if (err2) return res.send("Error saving user: " + err2);

          res.send(`<h1>Registration Successful</h1>
                    <p>Welcome ${first} ${last}</p>
                    <a href="/login">Login</a>`);
        });
      });
    });

  // Login
  router.get("/login", (req, res) => {
    res.render("login", { shopName: "Fitness Tracker", basePath: "" });
  });

  router.post("/loggedin", (req, res) => {
    const { username, password } = req.body;
    db.query("SELECT * FROM users WHERE username=?", [username], (err, rows) => {
      if (!rows?.length) return res.send("Invalid login");

      bcrypt.compare(password, rows[0].hashedPassword, (err2, match) => {
        if (!match) return res.send("Invalid login");

        req.session.userId = rows[0].id;
        res.redirect("/dashboard");
      });
    });
  });

  // Dashboard (protected)
  router.get("/dashboard", redirectLogin, (req, res) => {
    res.render("dashboard", { shopName: "Fitness Tracker", basePath: "" });
  });

  // Logout
  router.get("/logout", redirectLogin, (req, res) => {
    req.session.destroy(() => res.redirect("/login"));
  });

};
