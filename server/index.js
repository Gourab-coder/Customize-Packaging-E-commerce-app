// require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB } = require('./app/config/db');
const authRoutes = require('./app/routes/authRoutes');
const categoriesRoutes = require('./app/routes/categoriesRoutes');
const productsRoutes = require('./app/routes/productsRoutes');
const ordersRoutes = require('./app/routes/ordersRoutes');
const requestsRoutes = require('./app/routes/requestsRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const rawOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];
const corsOptions = {
  origin: rawOrigins.length > 0 ? rawOrigins : '*',
  credentials: rawOrigins.length > 0
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Packaging backend is running' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/requests', requestsRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  });
