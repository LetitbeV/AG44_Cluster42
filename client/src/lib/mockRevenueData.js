/**
 * Mock Data for Revenue & Profit Analytics
 * Structured to mimic a future API response.
 */

export const getRevenueData = () => {
    return {
        kpis: {
            totalRevenue: { value: 428500, change: 12.4, trend: 'up' },
            totalProfit: { value: 124200, change: 8.2, trend: 'up' },
            avgBuyPrice: { value: 42.50, change: -2.1, trend: 'down' }, // down is good for buy price? Context matters, but usually red/green handled in UI
            avgSellPrice: { value: 68.10, change: 4.5, trend: 'up' }
        },
        revenueOverTime: [
            { time: '00:00', dayAhead: 20, intraday: 15 },
            { time: '04:00', dayAhead: 30, intraday: 25 },
            { time: '08:00', dayAhead: 120, intraday: 100 },
            { time: '12:00', dayAhead: 150, intraday: 140 },
            { time: '16:00', dayAhead: 110, intraday: 130 },
            { time: '19:00', dayAhead: 200, intraday: 185 }, // peak
            { time: '23:59', dayAhead: 50, intraday: 45 }
        ],
        buySellVolumes: [
            { day: 'Mon', buy: 400, sell: 550 },
            { day: 'Tue', buy: 300, sell: 700 },
            { day: 'Wed', buy: 550, sell: 600 },
            { day: 'Thu', buy: 500, sell: 450 },
            { day: 'Fri', buy: 250, sell: 800 },
            { day: 'Sat', buy: 150, sell: 300 },
            { day: 'Sun', buy: 100, sell: 200 },
        ],
        strategicInsights: {
            bestSellingWindow: {
                period: '17:00 - 19:00',
                status: 'ACTIVE',
                description: 'Peak demand period has yielded 42% higher margins this week.'
            },
            mostProfitablePeriod: {
                day: 'Tue, Oct 24th',
                description: 'High volatility in the Intraday market resulted in a $12,400 daily record.'
            }
        },
        executionFeed: [
            { id: 1, type: 'SELL', asset: 'ESS_04', volume: '12.4 MWh', price: '$72.10', value: '+$894.04', status: 'LIVE', timestamp: '4s ago' },
            { id: 2, type: 'BUY', asset: 'ESS_01', volume: '5.0 MWh', price: '$38.50', value: '-$192.50', status: 'COMPLETE', timestamp: '2m ago' },
            { id: 3, type: 'SELL', asset: 'ESS_02', volume: '8.1 MWh', price: '$68.40', value: '+$554.00', status: 'COMPLETE', timestamp: '15m ago' }
        ]
    };
};
