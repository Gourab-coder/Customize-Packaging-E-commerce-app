const { pool } = require('../config/db');

const groupOrderRows = (rows) => {
  const orderMap = new Map();

  rows.forEach((row) => {
    if (!orderMap.has(row.order_id)) {
      orderMap.set(row.order_id, {
        id: row.order_id,
        user_id: row.user_id,
        customer_name: row.customer_name,
        customer_email: row.customer_email,
        total: row.total,
        status: row.status,
        created_at: row.created_at,
        items: []
      });
    }

    if (row.order_item_id) {
      orderMap.get(row.order_id).items.push({
        id: row.order_item_id,
        product_id: row.product_id,
        product_name: row.product_name,
        quantity: row.quantity,
        price: row.price
      });
    }
  });

  return Array.from(orderMap.values());
};

const createOrder = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order items are required' });
    }

    const normalizedItems = items
      .map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity)
      }))
      .filter((item) => item.product_id > 0 && item.quantity > 0);

    if (normalizedItems.length === 0) {
      return res.status(400).json({ message: 'Invalid items payload' });
    }

    await connection.beginTransaction();

    const uniqueProductIds = [...new Set(normalizedItems.map((item) => item.product_id))];
    const [productRows] = await connection.query(
      'SELECT id, name, price, stock FROM products WHERE id IN (?) FOR UPDATE',
      [uniqueProductIds]
    );

    if (productRows.length !== uniqueProductIds.length) {
      await connection.rollback();
      return res.status(404).json({ message: 'Some products were not found' });
    }

    const productMap = productRows.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});

    let total = 0;
    for (const item of normalizedItems) {
      const product = productMap[item.product_id];

      if (product.stock < item.quantity) {
        await connection.rollback();
        return res.status(400).json({
          message: `Not enough stock for product: ${product.name}`
        });
      }

      total += Number(product.price) * item.quantity;
    }

    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)',
      [req.user.id, total.toFixed(2), 'pending']
    );

    const orderValues = normalizedItems.map((item) => {
      const product = productMap[item.product_id];
      return [orderResult.insertId, item.product_id, item.quantity, product.price];
    });
    await connection.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?', [orderValues]);

    for (const item of normalizedItems) {
      await connection.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    await connection.commit();

    return res.status(201).json({
      message: 'Order placed successfully',
      order_id: orderResult.insertId,
      total: Number(total.toFixed(2))
    });
  } catch (error) {
    await connection.rollback();
    return res.status(500).json({ message: 'Failed to create order', error: error.message });
  } finally {
    connection.release();
  }
};

const getMyOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.id AS order_id, o.user_id, u.name AS customer_name, u.email AS customer_email,
              o.total, o.status, o.created_at,
              oi.id AS order_item_id, oi.product_id, p.name AS product_name, oi.quantity, oi.price
       FROM orders o
       JOIN users u ON u.id = o.user_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.user_id = ?
       ORDER BY o.id DESC, oi.id ASC`,
      [req.user.id]
    );

    return res.json(groupOrderRows(rows));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch your orders', error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT o.id AS order_id, o.user_id, u.name AS customer_name, u.email AS customer_email,
              o.total, o.status, o.created_at,
              oi.id AS order_item_id, oi.product_id, p.name AS product_name, oi.quantity, oi.price
       FROM orders o
       JOIN users u ON u.id = o.user_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       ORDER BY o.id DESC, oi.id ASC`
    );

    return res.json(groupOrderRows(rows));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `status must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
};
