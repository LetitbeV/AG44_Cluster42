const express = require('express');
const router = express.Router();
const { getFinancialStats } = require('../controllers/financialController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getFinancialStats);

module.exports = router;
