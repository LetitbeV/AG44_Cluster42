// @desc    Get prices
// @route   GET /api/prices
// @access  Public
const { getAllPrices } = require('../utils/priceUtils');

// @desc    Get prices
// @route   GET /api/prices
// @access  Public
const getPrices = async (req, res) => {
    try {
        const prices = await getAllPrices();

        // Transform to standard format if needed, or return raw.
        // Returning raw as user might want the prediction data too.
        res.status(200).json(prices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching prices' });
    }
};

module.exports = {
    getPrices
};
