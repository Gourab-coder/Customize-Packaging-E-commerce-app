const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ? LIMIT 1', [normalizedEmail]);

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const allowAdminSignup = String(process.env.ALLOW_ADMIN_SIGNUP).toLowerCase() === 'true';
    const userRole = allowAdminSignup && role === 'admin' ? 'admin' : 'customer';

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), normalizedEmail, hashedPassword, userRole]
    );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: normalizedEmail,
      role: userRole
    };

    return res.status(201).json({
      message: 'User registered successfully',
      token: generateToken(user),
      user
    });
  } catch (error) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const [users] = await pool.query(
      'SELECT id, name, email, password, role, created_at FROM users WHERE email = ? LIMIT 1',
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    return res.json({
      message: 'Login successful',
      token: generateToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user: users[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load user profile', error: error.message });
  }
};

module.exports = {
  register,
  login,
  getMe
};
