require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection — Railway injects DATABASE_URL automatically
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// Create table if it doesn't exist (runs on startup)
async function initDB() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      completed BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Database initialised ✓');
}

// ─── ROUTES ────────────────────────────────────────────────────────────────

// GET / — list all tasks
app.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks ORDER BY created_at DESC'
    );
    res.render('index', { tasks: result.rows, error: null });
  } catch (err) {
    console.error('GET / error:', err.message);
    res.render('index', { tasks: [], error: 'Could not load tasks.' });
  }
});

// POST /tasks — create a new task
app.post('/tasks', async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) return res.redirect('/');
  try {
    await pool.query('INSERT INTO tasks (title) VALUES ($1)', [title.trim()]);
    res.redirect('/');
  } catch (err) {
    console.error('POST /tasks error:', err.message);
    res.redirect('/');
  }
});

// POST /tasks/:id/toggle — mark complete / incomplete
app.post('/tasks/:id/toggle', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      'UPDATE tasks SET completed = NOT completed WHERE id = $1',
      [id]
    );
    res.redirect('/');
  } catch (err) {
    console.error('TOGGLE error:', err.message);
    res.redirect('/');
  }
});

// POST /tasks/:id/delete — delete a task
app.post('/tasks/:id/delete', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.redirect('/');
  } catch (err) {
    console.error('DELETE error:', err.message);
    res.redirect('/');
  }
});

// Health-check endpoint (useful for Railway monitoring)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── START ──────────────────────────────────────────────────────────────────
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`TaskRail running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialise database:', err.message);
    process.exit(1);
  });
