/**
 * Mock Data for Market Performance Analysis
 */

export const getMarketData = () => {
    // Generate 24h price curve with zones
    const priceSeries = [];
    for (let i = 0; i < 24; i++) {
        let price = 30 + Math.sin(i / 3) * 20 + Math.random() * 5;
        let zone = 'NEUTRAL';
        if (price < 20) zone = 'CHARGE'; // Green zone
        if (price > 45) zone = 'DISCHARGE'; // Red zone

        // Format time HH:00
        const time = `${i.toString().padStart(2, '0')}:00`;
        priceSeries.push({
            time,
            price: parseFloat(price.toFixed(2)),
            zone,
            thresholdHigh: 45,
            thresholdLow: 20
        });
    }

    return {
        kpis: {
            currentPrice: { value: 42.50, change: 5.2, trend: 'up' },
            dailyHigh: { value: 68.20, timestamp: '14:30' },
            dailyLow: { value: 12.10, timestamp: '02:15' },
            volatility: { status: 'High', index: 8.2, level: 'warning' }
        },
        priceSeries,
        insights: {
            trend: {
                title: 'Current Trend',
                description: 'Wholesale electricity prices are currently experiencing downward pressure due to high wind generation.'
            },
            strategy: {
                title: 'Strategy Alert',
                action: 'CHARGE',
                description: 'Battery assets are encouraged to charge between 13:00 and 15:00.'
            },
            tip: {
                title: 'AI-Analyst Tip',
                description: 'Volatility is trending 12% higher than average. Tighten stop-loss limits.'
            }
        },
        stats: {
            gridStability: { value: 85, status: 'Stable' },
            renewableMix: { wind: 62, solar: 24, other: 14 },
            estimatedPnL: { value: 12450.00, change: 3.4 }
        }
    };
};
