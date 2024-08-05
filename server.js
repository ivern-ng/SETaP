const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// MySQL connection
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '7iha!Bm62.6v',
  database: 'restaurant_db',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware to handle database errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Routes
app.get('/menu', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching menu' });
  }
});

app.get('/cart', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT c.id, m.name, m.price, c.quantity FROM cart c JOIN menu m ON c.menu_id = m.id');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching cart' });
  }
});

app.post('/cart', async (req, res) => {
  const { id, quantity } = req.body;
  try {
    const [item] = await pool.query('SELECT * FROM menu WHERE id = ?', [id]);
    if (item.length > 0) {
      await pool.query('INSERT INTO cart (menu_id, quantity) VALUES (?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?', [id, quantity, quantity]);
      const [updatedCart] = await pool.query('SELECT c.id, m.name, m.price, c.quantity FROM cart c JOIN menu m ON c.menu_id = m.id');
      res.json(updatedCart);
    } else {
      res.status(404).json({error: 'Item not found'});
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error adding item to cart' });
  }
});

app.delete('/cart/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await pool.query('DELETE FROM cart WHERE menu_id = ?', [id]);
    const [updatedCart] = await pool.query('SELECT c.id, m.name, m.price, c.quantity FROM cart c JOIN menu m ON c.menu_id = m.id');
    res.json({ message: 'Item removed from cart', updatedCart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error removing item from cart' });
  }
});

app.post('/checkout', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT SUM(m.price * c.quantity) as total FROM cart c JOIN menu m ON c.menu_id = m.id');
    const total = result[0].total || 0;
    await pool.query('DELETE FROM cart');
    res.json({message: 'Checkout successful', total});
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error during checkout' });
  }
});
// New route to add a menu item
app.post('/menu', async (req, res) => {
  const { name, price } = req.body;
  try {
    const [result] = await pool.query('INSERT INTO menu (name, price) VALUES (?, ?)', [name, price]);
    res.json({ id: result.insertId, name, price });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error adding menu item' });
  }
});

// New route to remove a menu item
app.delete('/menu/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await pool.query('DELETE FROM menu WHERE id = ?', [id]);
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting menu item' });
  }
});

// New route to update a menu item
app.put('/menu/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, price } = req.body;
  try {
    await pool.query('UPDATE menu SET name = ?, price = ? WHERE id = ?', [name, price, id]);
    res.json({ message: 'Menu item updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error updating menu item' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});