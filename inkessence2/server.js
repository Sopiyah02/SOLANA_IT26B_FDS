const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); 

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'inkessence',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
}).promise();


app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Login request:', req.body);
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Missing username or password' });
    }
    const [results] = await pool.query(
      'SELECT * FROM user WHERE username = ? AND password = ?',
      [username, password]
    );

    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.json({ success: false, message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/supplies', async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM supplies');
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/api/supplies-with-user', async (req, res) => {
  try {
    const query = `
      SELECT 
        user.username,
        supplies.supply_id,
        supplies.name,
        supplies.quantity
      FROM supplies
      INNER JOIN user ON supplies.user_id = user.user_id
    `;
    const [results] = await pool.query(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/api/supplies', async (req, res) => {
  try {
    const { name, quantity, user_id } = req.body;
    if (!name || !quantity || quantity <= 0 || !user_id) {
      return res.status(400).json({ success: false, message: 'Invalid name, quantity, or user_id' });
    }
    const [results] = await pool.query(
      'INSERT INTO supplies (name, quantity, user_id) VALUES (?, ?, ?)',
      [name, quantity, user_id]
    );
    res.json({ success: true, insertId: results.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.delete('/api/supplies/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [results] = await pool.query('DELETE FROM supplies WHERE supply_id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
