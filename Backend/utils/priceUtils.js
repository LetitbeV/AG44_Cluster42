const axios = require('axios');

// Cache configuration
let priceCache = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes (or 15 min since intervals are 15 min)

// Helper to fetch prices from external API
const fetchPrices = async () => {
    const now = Date.now();
    if (priceCache && (now - lastFetchTime < CACHE_DURATION)) {
        return priceCache;
    }

    try {
        const response = await axios.get('http://localhost:5000/api/prices');
        // External API returns: { count: 96, forecast_date: "...", prices: [ { timestamp, actual_price, predicted_price } ] }

        if (response.data && response.data.prices) {
            priceCache = response.data.prices;
            lastFetchTime = now;
            return priceCache;
        } else {
            throw new Error('Invalid price data format');
        }
    } catch (error) {
        console.error('Error fetching prices:', error.message);
        // Fallback: If cache exists (even old), use it. Or throw.
        if (priceCache) return priceCache;
        throw error;
    }
};

const getPriceForDate = async (dateStringOrDate) => {
    // Force "Local" interpretation of the input string by removing 'Z' (UTC marker) if present
    let inputString = dateStringOrDate;
    if (typeof dateStringOrDate === 'string') {
        inputString = dateStringOrDate.replace('Z', '');
    }
    const targetDate = new Date(inputString);

    // Normalize target to nearest 15-minute interval (similar to external API timestamps)
    // External API format: "YYYY-MM-DD HH:mm:ss"
    // We need to match timestamps.
    const minutes = targetDate.getMinutes();
    const roundedMinutes = Math.floor(minutes / 15) * 15;
    targetDate.setMinutes(roundedMinutes, 0, 0);

    const prices = await fetchPrices();

    // Find matching price
    // We compare timestamps. The external API uses local strings "YYYY-MM-DD HH:mm:ss".
    // We need to be careful with Timezones. Assuming API returns local time string.
    // Let's try to match by converting our targetDate to the same string format if possible, 
    // OR parse the API timestamp strings into Date objects.

    const targetTime = targetDate.getTime();

    // Find best match
    const match = prices.find(p => {
        // Parse API timestamp "2026-01-24 00:00:00"
        // Note: Date.parse("2026-01-24 00:00:00") might assume UTC or Local depending on browser/node.
        // It's safer to treat it consistently.
        const pDate = new Date(p.timestamp);
        return Math.abs(pDate.getTime() - targetTime) < 1000; // Within 1 second
    });

    if (match) {
        return {
            timestamp: targetDate,
            price: match.actual_price // User requested "actual_price"
        };
    }

    // Fallback if exact match not found (e.g. date out of range): 
    // Return nearest or throw. For now, let's return the first one or a default if empty.
    if (prices.length > 0) {
        // Find nearest
        let nearest = prices[0];
        let minDiff = Math.abs(new Date(nearest.timestamp).getTime() - targetTime);

        for (const p of prices) {
            const diff = Math.abs(new Date(p.timestamp).getTime() - targetTime);
            if (diff < minDiff) {
                minDiff = diff;
                nearest = p;
            }
        }
        return {
            timestamp: new Date(nearest.timestamp),
            price: nearest.actual_price
        };
    }

    // Ultimate fallback if API empty
    return {
        timestamp: targetDate,
        price: 30 // Safe default
    };
};

// Export raw fetch for priceController to list all
const getAllPrices = async () => {
    return await fetchPrices();
};

module.exports = {
    getPriceForDate,
    getAllPrices
};
