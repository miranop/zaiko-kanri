const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./zaiko.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    initializeDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT UNIQUE,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    price REAL DEFAULT 0,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('Error creating products table:', err.message);
    } else {
      console.log('Products table ready.');
    }
  });
}

// API Routes

// Get all products
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY name', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ products: rows });
  });
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ product: row });
  });
});

// Create new product
app.post('/api/products', (req, res) => {
  const { name, sku, description, quantity, min_quantity, price, category } = req.body;
  
  if (!name) {
    res.status(400).json({ error: 'Product name is required' });
    return;
  }

  const sql = `INSERT INTO products (name, sku, description, quantity, min_quantity, price, category)
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const params = [name, sku, description, quantity || 0, min_quantity || 0, price || 0, category];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: 'Product created successfully',
      product: { id: this.lastID, ...req.body }
    });
  });
});

// Update product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, sku, description, quantity, min_quantity, price, category } = req.body;

  const sql = `UPDATE products 
               SET name = ?, sku = ?, description = ?, quantity = ?, 
                   min_quantity = ?, price = ?, category = ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ?`;
  const params = [name, sku, description, quantity, min_quantity, price, category, id];

  db.run(sql, params, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ message: 'Product updated successfully' });
  });
});

// Delete product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM products WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ message: 'Product deleted successfully' });
  });
});

// Update product quantity (stock adjustment)
app.patch('/api/products/:id/quantity', (req, res) => {
  const { id } = req.params;
  const { adjustment } = req.body;

  if (typeof adjustment !== 'number') {
    res.status(400).json({ error: 'Adjustment must be a number' });
    return;
  }

  const sql = `UPDATE products 
               SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP
               WHERE id = ?`;

  db.run(sql, [adjustment, id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ message: 'Quantity updated successfully' });
  });
});

// Get low stock products
app.get('/api/products/alerts/low-stock', (req, res) => {
  db.all('SELECT * FROM products WHERE quantity <= min_quantity ORDER BY quantity', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ products: rows });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});
