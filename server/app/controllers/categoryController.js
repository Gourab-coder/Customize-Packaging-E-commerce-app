const { pool } = require('../config/db');

const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, description FROM categories ORDER BY id DESC');
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, description FROM categories WHERE id = ? LIMIT 1', [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json(rows[0]);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch category', error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const [result] = await pool.query('INSERT INTO categories (name, description) VALUES (?, ?)', [name.trim(), description || null]);

    return res.status(201).json({
      message: 'Category created successfully',
      category: {
        id: result.insertId,
        name: name.trim(),
        description: description || null
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const [result] = await pool.query('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name.trim(), description || null, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json({ message: 'Category updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update category', error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
