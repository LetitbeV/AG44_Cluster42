const express = require('express');
const router = express.Router();
const { updateState } = require('../controllers/batteryStateController');
const { protect } = require('../middleware/authMiddleware');

router.post('/update', protect, updateState);

module.exports = router;
