// Initial state constants
const BATTERY_CAPACITY_KWH = 13.5; // Tesla Powerwall 2 style
const MAX_CHARGE_RATE = 5; // kW
const MAX_DISCHARGE_RATE = 5; // kW

/**
 * Generates a mock 24-hour price curve resembling a "duck curve" or typical market behavior.
 * High prices in evening (17:00-21:00), Low in day (10:00-15:00).
 */
export const generateMarketData = () => {
    const data = [];
    const now = new Date();
    now.setMinutes(0, 0, 0); // Start at top of hour

    for (let i = 0; i < 24; i++) {
        const time = new Date(now.getTime() + i * 60 * 60 * 1000);
        const hour = time.getHours();

        // Base price in cents/kWh
        let basePrice = 20;

        // Day dip (Solar peak)
        if (hour >= 9 && hour <= 15) basePrice -= 15;

        // Evening peak (Demand)
        if (hour >= 17 && hour <= 21) basePrice += 25;

        // Random noise
        const noise = (Math.random() - 0.5) * 5;
        let price = Math.max(0, basePrice + noise);

        // Battery Simulation (Mock)
        // Buy Low (Charge), Sell High (Discharge)
        let batteryLevel = 50;
        let action = 'HOLD';
        let zone = 'NEUTRAL'; // BUY, SELL, NEUTRAL

        if (price < 10) {
            zone = 'BUY';
            action = 'CHARGE';
            batteryLevel = Math.min(100, batteryLevel + 15);
        } else if (price > 35) {
            zone = 'SELL';
            action = 'DISCHARGE';
            batteryLevel = Math.max(0, batteryLevel - 15);
        }

        data.push({
            time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            price: parseFloat(price.toFixed(2)),
            batteryLevel,
            action,
            zone
        });
    }
    return data;
};

export const getSystemStats = () => {
    return {
        revenue: 142.50,
        revenueChange: 12.4,
        energyTraded: 420,
        energyTradedChange: 5.2,
        peakPrice: 85.20,
        peakPriceChange: -2.1,
        batteryHealth: 98.2
    };
};

export const getAIRecommendation = (currentPrice) => {
    if (currentPrice > 35) {
        return {
            type: 'SELL',
            confidence: 94,
            condition: 'Volatile',
            message: 'Peak pricing detected. Expected price drop in 45 minutes as solar supply spikes. Sell remaining 40% capacity now.'
        };
    } else if (currentPrice < 10) {
        return {
            type: 'BUY',
            confidence: 89,
            condition: 'Stable',
            message: 'Prices are at daily lows. Recommended to charge battery to full capacity before evening peak.'
        };
    }
    return {
        type: 'HOLD',
        confidence: 75,
        condition: 'Normal',
        message: 'Market is stable. Holding charge for evening peak arbitrage opportunity.'
    };
};
