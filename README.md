# Health & Fitness Tracker – DWA Final Lab

This is my Dynamic Web Applications final lab project: a **health & fitness tracking app** built with **Node.js, Express, EJS and MySQL**.

Users can register, log in, add workout entries, view their workout history, and see a visual summary of their training using charts.

---

## 1. Features

- **Home page** with navigation to all main features.
- **About page** describing the purpose of the app.
- **User authentication**
  - Register new users.
  - Log in / log out securely using sessions.
- **Workout logging**
  - Add workouts with date, type, duration and notes.
  - Data stored persistently in a MySQL database.
- **Logs & Search**
  - View all workouts for the logged-in user.
  - Data is queried from the `Workout` table.
- **Charts (Advanced Feature)**
  - Data visualisation using Chart.js.
  - Aggregates total workout duration per workout type and displays it as a bar chart.

---

## 2. Technology Stack

- **Backend:** Node.js, Express
- **View engine:** EJS
- **Database:** MySQL (`health` database)
- **ORM/Driver:** `mysql2/promise`
- **Sessions:** `express-session`
- **Password hashing:** `bcrypt`
- **Charts:** Chart.js (via CDN in `charts.ejs`)

---

## 3. Setup and Installation (Local)

### 3.1. Prerequisites

- Node.js (v16+ recommended)
- MySQL server
- Git

### 3.2. Clone the repository

```bash
git clone https://github.com/your-username/10_health_33784157.git
cd 10_health_XXXXXXXX
