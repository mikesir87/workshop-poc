const express = require('express');
const exphbs = require('express-handlebars');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:secret@localhost:5432/postgres'
});

app.engine('hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// List todos
app.get('/', async (req, res) => {
  const { rows: todos } = await pool.query('SELECT * FROM todos ORDER BY id');
  res.render('index', { todos });
});

// Add todo
app.post('/add', async (req, res) => {
  const { todo } = req.body;
  if (todo && todo.trim() !== '') {
    await pool.query('INSERT INTO todos (text) VALUES ($1)', [todo]);
  }
  res.redirect('/');
});

// Mark as complete
app.post('/complete/:id', async (req, res) => {
  await pool.query('UPDATE todos SET completed = TRUE WHERE id = $1', [req.params.id]);
  res.redirect('/');
});

// Remove todo
app.post('/remove/:id', async (req, res) => {
  await pool.query('DELETE FROM todos WHERE id = $1', [req.params.id]);
  res.redirect('/');
});

app.listen(3000, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});