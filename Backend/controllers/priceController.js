// @desc    Get prices
// @route   GET /api/prices
// @access  Public
const { getPriceForDate } = require('../utils/priceUtils');

// @desc    Get prices
// @route   GET /api/prices
// @access  Public
const getPrices = (req, res) => {
    // Generate prices for the next 24 hours in 15-minute intervals (or hourly if preferred, but user mentioned 15min)
    // Stick to hourly for the 'overview' but sampled correctly, or upgrade to 15-min array.
    // User mentioned "data ... in intervals of 15min". Let's return 15-min intervals for the next 24h.

    const prices = [];
    const now = new Date();

    // Align start to current 15-min interval
    const minutes = now.getMinutes();
    const roundedMinutes = Math.floor(minutes / 15) * 15;
    now.setMinutes(roundedMinutes, 0, 0);

    // 24 hours * 4 intervals/hour = 96 points
    for (let i = 0; i < 96; i++) {
        const time = new Date(now);
        time.setMinutes(now.getMinutes() + (i * 15));

        const priceData = getPriceForDate(time);
        prices.push(priceData);
    }

    res.status(200).json(prices);
};

module.exports = {
    getPrices
};
