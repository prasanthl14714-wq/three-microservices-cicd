
const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "appuser",
  password: process.env.DB_PASSWORD || "apppassword",
  database: process.env.DB_NAME || "product_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ service: "Product Service", status: "healthy" });
  } catch (error) {
    res.status(503).json({
      service: "Product Service",
      status: "unhealthy",
      error: "Database connection failed",
    });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, price, stock, created_at FROM products ORDER BY id"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, price, stock, created_at FROM products WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

app.post("/api/products", async (req, res) => {
  const { name, price, stock } = req.body;

  if (
    !name ||
    price === undefined ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0 ||
    !Number.isInteger(Number(stock)) ||
    Number(stock) < 0
  ) {
    return res.status(400).json({
      error: "Valid name, non-negative price, and non-negative integer stock are required",
    });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO products (name, price, stock) VALUES (?, ?, ?)",
      [name, price, stock]
    );

    res.status(201).json({
      id: result.insertId,
      name,
      price,
      stock,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Product Service running on port ${PORT}`);
});
