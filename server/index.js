const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');


const app = express();
app.use(express.json());
dotenv.config();

// app.use(cors());
app.use(cors({
  origin: "*",  // ✅ your frontend URL
  credentials: true,  // ✅ if you’re using cookies or tokens
}));


app.get('/', (req, res) => {
  res.send('welcome to the server');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// http://localhost:3000/
