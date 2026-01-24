const express = require('express');
const router = express.Router();
const { getPrices } = require('../controllers/priceController');

router.get('/', getPrices);

module.exports = router;
