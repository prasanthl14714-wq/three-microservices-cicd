
const express = require("express");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "appuser",
  password: process.env.DB_PASSWORD || "apppassword",
  database: process.env.DB_NAME || "order_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ service: "Order Service", status: "healthy" });
  } catch (error) {
    res.status(503).json({
      service: "Order Service",
      status: "unhealthy",
      error: "Database connection failed",
    });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, user_id, product_id, quantity, status, created_at FROM orders ORDER BY id"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.get("/api/orders/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, user_id, product_id, quantity, status, created_at FROM orders WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

app.post("/api/orders", async (req, res) => {
  const { user_id, product_id, quantity } = req.body;

  if (
    !Number.isInteger(Number(user_id)) ||
    Number(user_id) <= 0 ||
    !Number.isInteger(Number(product_id)) ||
    Number(product_id) <= 0 ||
    !Number.isInteger(Number(quantity)) ||
    Number(quantity) <= 0
  ) {
    return res.status(400).json({
      error: "Valid positive user_id, product_id, and quantity are required",
    });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO orders (user_id, product_id, quantity) VALUES (?, ?, ?)",
      [Number(user_id), Number(product_id), Number(quantity)]
    );

    res.status(201).json({
      id: result.insertId,
      user_id: Number(user_id),
      product_id: Number(product_id),
      quantity: Number(quantity),
      status: "PLACED",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Order Service running on port ${PORT}`);
});
