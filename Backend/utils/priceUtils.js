// Deterministic price generator based on 15-minute intervals
// Use a seed-based approach so the same timestamp always yields the same price

const getPriceForDate = (dateStringOrDate) => {
    const date = new Date(dateStringOrDate);

    // Normalize to nearest 15-minute interval
    // Round down minutes to 0, 15, 30, 45
    const minutes = date.getMinutes();
    const roundedMinutes = Math.floor(minutes / 15) * 15;

    const intervalDate = new Date(date);
    intervalDate.setMinutes(roundedMinutes, 0, 0); // Seconds and MS to 0

    // Create a seed from the interval timestamp
    const timestampv = intervalDate.getTime();

    // Simple deterministic pseudo-random generator function
    // Using sine function to simulate somewhat realistic oscillating prices around a mean
    // Time is in ms, so divide by a larger number to make the wave slower/faster
    // A day has 96 intervals of 15 mins.

    // Factors:
    // 1. Daily Cycle (Sine wave period 24h)
    // 2. Random noise (based on hash of timestamp)

    const hours = intervalDate.getHours() + (roundedMinutes / 60);

    // Base price curve: Peak at 19:00 (19), Low at 04:00 (4)
    // Shift sine wave: Peak of sin(x) is at pi/2. 
    // We want peak at 19h. 2pi * (19/24) ...
    // Let's just use a simple combined function

    // Base: 30
    // Daily swing: +/- 15
    // Peak at 18:00 (0.75 of day)
    const dailySwing = Math.sin(((hours - 6) / 24) * 2 * Math.PI) * 15;

    // Noise: +/- 5
    // Simple hash
    const seed = (timestampv / 100000) % 10000;
    const noise = (Math.sin(seed) * 5);

    let price = 30 + dailySwing + noise;

    // Clamp limits
    if (price < 5) price = 5;
    if (price > 100) price = 100;

    return {
        timestamp: intervalDate,
        price: parseFloat(price.toFixed(2))
    };
};

module.exports = {
    getPriceForDate
};
