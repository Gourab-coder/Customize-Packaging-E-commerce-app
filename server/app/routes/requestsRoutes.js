const express = require('express');
const {
  createConsultationRequest,
  createQuotationRequest,
  getAllConsultationRequests,
  getAllQuotationRequests
} = require('../controllers/requestController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/consultations', createConsultationRequest);
router.post('/quotations', createQuotationRequest);
router.get('/consultations', protect, authorizeRoles('admin'), getAllConsultationRequests);
router.get('/quotations', protect, authorizeRoles('admin'), getAllQuotationRequests);

module.exports = router;
