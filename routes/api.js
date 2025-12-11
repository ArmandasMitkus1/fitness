module.exports = function(router) {

  // GET all exercises
  router.get("/api/exercises", (req, res) => {
    db.query("SELECT id, name, muscle_group, difficulty FROM exercises", (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(rows);
    });
  });

  // GET a single exercise by ID
  router.get("/api/exercises/:id", (req, res) => {
    const id = req.params.id;
    db.query("SELECT id, name, muscle_group, difficulty FROM exercises WHERE id=?", [id], (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!rows.length) return res.status(404).json({ error: "Exercise not found" });
      res.json(rows[0]);
    });
  });

  // GET all workouts
  router.get("/api/workouts", (req, res) => {
    db.query("SELECT id, name, duration_minutes FROM workouts", (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      res.json(rows);
    });
  });

  // GET a single workout by ID
  router.get("/api/workouts/:id", (req, res) => {
    const id = req.params.id;
    db.query("SELECT id, name, duration_minutes FROM workouts WHERE id=?", [id], (err, rows) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (!rows.length) return res.status(404).json({ error: "Workout not found" });
      res.json(rows[0]);
    });
  });

};

