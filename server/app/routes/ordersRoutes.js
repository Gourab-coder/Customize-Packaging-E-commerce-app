const express = require('express');
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/', protect, authorizeRoles('admin'), getAllOrders);
router.patch('/:id/status', protect, authorizeRoles('admin'), updateOrderStatus);

module.exports = router;
