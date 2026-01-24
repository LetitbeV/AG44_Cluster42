const express = require('express');
const router = express.Router();
const { addBatteryInfo } = require('../controllers/batteryController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, addBatteryInfo);

module.exports = router;
