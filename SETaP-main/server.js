const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const QRCode = require('qrcode');
const app = express();
const port = 3000;
const ip = '192.168.1.140';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

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

app.get('/menu', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM menu');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching menu' });
  }
});

app.get('/generate-qr/:tableNumber', async (req, res) => {
  const tableNumber = req.params.tableNumber;
  const url = `http://${ip}:${port}?table=${tableNumber}`;
  
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(url);
    res.send(`<img src="${qrCodeDataUrl}" alt="QR Code for Table ${tableNumber}">`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating QR code');
  }
});

app.post('/cart', async (req, res) => {
  console.log('Received cart request:', req.body);
  const { id, quantity, tableNumber } = req.body;
  const safeTableNumber = tableNumber || 'default';
  console.log('Using table number:', safeTableNumber);

  try {
    const [item] = await pool.query('SELECT * FROM menu WHERE id = ?', [id]);
    if (item.length > 0) {
      await pool.query(
        'INSERT INTO cart (menu_id, quantity, table_number) VALUES (?, ?, ?) ' +
        'ON DUPLICATE KEY UPDATE quantity = quantity + ?', 
        [id, quantity, safeTableNumber, quantity]
      );
      const [updatedCart] = await pool.query(
        'SELECT c.id, m.name, m.price, c.quantity ' +
        'FROM cart c JOIN menu m ON c.menu_id = m.id ' +
        'WHERE c.table_number = ?', 
        [safeTableNumber]
      );
      res.json(updatedCart);
    } else {
      res.status(404).json({error: 'Item not found'});
    }
  } catch (error) {
    console.error('Error in cart operation:', error);
    res.status(500).json({ error: 'Error adding item to cart' });
  }
});

app.get('/cart', async (req, res) => {
  const tableNumber = req.query.table || 'default';
  try {
    const [rows] = await pool.query('SELECT c.id, m.name, m.price, c.quantity FROM cart c JOIN menu m ON c.menu_id = m.id WHERE c.table_number = ?', [tableNumber]);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching cart' });
  }
});

app.delete('/cart/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const tableNumber = req.query.table || 'default';
    try {
        await pool.query('DELETE FROM cart WHERE menu_id = ? AND table_number = ?', [id, tableNumber]);
        const [updatedCart] = await pool.query(
            'SELECT c.id, m.name, m.price, c.quantity FROM cart c ' +
            'JOIN menu m ON c.menu_id = m.id WHERE c.table_number = ?', 
            [tableNumber]
        );
        res.json({ message: 'Item removed from cart', updatedCart });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ error: 'Error removing item from cart' });
    }
});

app.post('/checkout', async (req, res) => {
  const { tableNumber } = req.body;
  
  try {
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Get all items in the cart for this table
      const [cartItems] = await connection.query(
        'SELECT c.menu_id, c.quantity, m.price FROM cart c JOIN menu m ON c.menu_id = m.id WHERE c.table_number = ?',
        [tableNumber]
      );

      // Calculate total
      let total = 0;
      for (const item of cartItems) {
        total += item.price * item.quantity;
      }

      // Create an order
      const [orderResult] = await connection.query(
        'INSERT INTO orders (table_number, total) VALUES (?, ?)',
        [tableNumber, total]
      );
      const orderId = orderResult.insertId;

      // Add order items
      for (const item of cartItems) {
        await connection.query(
          'INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES (?, ?, ?, ?)',
          [orderId, item.menu_id, item.quantity, item.price]
        );
      }

      // Clear the cart for this table
      await connection.query('DELETE FROM cart WHERE table_number = ?', [tableNumber]);

      // Commit the transaction
      await connection.commit();

      res.json({ success: true, total: total, orderId: orderId });
    } catch (error) {
      // If there's an error, rollback the transaction
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'An error occurred during checkout' });
  }
});

app.get('/api/orders', async (req, res) => {
    try {
        const [orders] = await pool.query(`
            SELECT o.id, o.table_number, o.total, o.order_date, 
                   GROUP_CONCAT(CONCAT(oi.quantity, 'x ', m.name) SEPARATOR ', ') as items
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            JOIN menu m ON oi.menu_id = m.id
            GROUP BY o.id
            ORDER BY o.order_date DESC
        `);
        const formattedOrders = orders.map(order => ({
            ...order,
            total: parseFloat(order.total)
        }));
        console.log('Formatted orders:', JSON.stringify(formattedOrders));
        res.json(formattedOrders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Error fetching orders: ' + error.message });
    }
});

app.listen(port, ip, () => {
  console.log(`Server running at http://${ip}:${port}`);
});
