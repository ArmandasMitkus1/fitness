const { check, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = function(router, appData) {

  // Login protection middleware
  const redirectLogin = (req, res, next) => {
    if (!req.session?.userId) return res.redirect("/login");
    next();
  };

  // Sanitize data helper
  const sanitizeData = (req, data) => ({
    id: data.id,
    name: req.sanitize(data.name),
    value: data.value
  });

  //-----------------------------------------------------
  // STATIC PAGES
  //-----------------------------------------------------
  router.get('/', (req, res) => res.render('index', appData));
  router.get('/about', (req, res) => res.render('about', appData));

  //-----------------------------------------------------
  // REGISTER
  //-----------------------------------------------------
  router.get('/register', (req, res) => res.render('register', appData));

  router.post('/registered', [
      check('email').isEmail(),
      check('username').isLength({ min: 5, max: 20 }),
      check('password').isLength({ min: 8 })
    ],
    (req, res) => {
      if (!validationResult(req).isEmpty()) return res.render('register', appData);

      const first = req.sanitize(req.body.first);
      const last = req.sanitize(req.body.last);
      const email = req.sanitize(req.body.email);
      const username = req.sanitize(req.body.username);
      const password = req.body.password;

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

  //-----------------------------------------------------
  // LOGIN
  //-----------------------------------------------------
  router.get('/login', (req, res) => res.render('login', appData));

  router.post('/loggedin', (req, res) => {
    const { username, password } = req.body;
    db.query("SELECT * FROM users WHERE username=?", [username], (err, rows) => {
      if (!rows?.length) return res.send("Invalid login");

      bcrypt.compare(password, rows[0].hashedPassword, (err2, match) => {
        if (!match) return res.send("Invalid login");

        req.session.userId = rows[0].username;
        res.redirect("/dashboard");
      });
    });
  });

  //-----------------------------------------------------
  // DASHBOARD (protected)
  //-----------------------------------------------------
  router.get('/dashboard', redirectLogin, (req, res) => {
    db.query("SELECT username, first_name, last_name, email FROM users", (err, rows) => {
      if (err) return res.send("Error fetching users");

      const safeUsers = rows.map(u => ({
        username: req.sanitize(u.username),
        first_name: req.sanitize(u.first_name),
        last_name: req.sanitize(u.last_name),
        email: req.sanitize(u.email)
      }));

      res.render("dashboard", { users: safeUsers, appName: appData.appName, basePath: appData.basePath });
    });
  });

  //-----------------------------------------------------
  // LOGOUT
  //-----------------------------------------------------
  router.get('/logout', redirectLogin, (req, res) => {
    req.session.destroy(() => res.redirect("/login"));
  });
};

