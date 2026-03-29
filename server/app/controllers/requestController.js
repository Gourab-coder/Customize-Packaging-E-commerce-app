const { pool } = require('../config/db');

const normalizeText = (value) => (typeof value === 'string' ? value.trim() : '');

const createConsultationRequest = async (req, res) => {
  try {
    const name = normalizeText(req.body.name);
    const contactNumber = normalizeText(req.body.contactNumber);
    const callTime = normalizeText(req.body.callTime);
    const productType = normalizeText(req.body.productType);
    const productDetails = normalizeText(req.body.productDetails);

    if (!name || !contactNumber || !callTime || !productType || !productDetails) {
      return res.status(400).json({ message: 'All consultation fields are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO consultation_requests
        (name, contact_number, preferred_call_time, product_type, product_details)
       VALUES (?, ?, ?, ?, ?)`,
      [name, contactNumber, callTime, productType, productDetails]
    );

    return res.status(201).json({
      message: 'Consultation request submitted successfully',
      id: result.insertId
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to submit consultation request',
      error: error.message
    });
  }
};

const createQuotationRequest = async (req, res) => {
  try {
    const name = normalizeText(req.body.name);
    const whatsappNumber = normalizeText(req.body.whatsappNumber);
    const driveLink = normalizeText(req.body.driveLink);
    const productType = normalizeText(req.body.productType);
    const productDescription = normalizeText(req.body.productDescription);

    if (!name || !whatsappNumber || !driveLink || !productType || !productDescription) {
      return res.status(400).json({ message: 'All quotation fields are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO quotation_requests
        (name, whatsapp_number, drive_link, product_type, product_description)
       VALUES (?, ?, ?, ?, ?)`,
      [name, whatsappNumber, driveLink, productType, productDescription]
    );

    return res.status(201).json({
      message: 'Quotation request submitted successfully',
      id: result.insertId
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to submit quotation request',
      error: error.message
    });
  }
};

const getAllConsultationRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, contact_number, preferred_call_time, product_type, product_details, created_at
       FROM consultation_requests
       ORDER BY id DESC`
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch consultation requests',
      error: error.message
    });
  }
};

const getAllQuotationRequests = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, whatsapp_number, drive_link, product_type, product_description, created_at
       FROM quotation_requests
       ORDER BY id DESC`
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch quotation requests',
      error: error.message
    });
  }
};

module.exports = {
  createConsultationRequest,
  createQuotationRequest,
  getAllConsultationRequests,
  getAllQuotationRequests
};
