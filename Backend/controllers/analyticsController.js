const FinancialStats = require('../models/FinancialStats');
const Transaction = require('../models/Transaction');

// @desc    Get analytics data (revenue, profit, charts)
// @route   GET /api/analytics
// @access  Private
const getAnalyticsData = async (req, res) => {
    try {
        const { range = '7d' } = req.query;
        let days = 7;
        if (range === '30d') days = 30;
        if (range === 'quarter') days = 90;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        // 1. Aggregated Totals (Revenue, Profit)
        const stats = await FinancialStats.find({
            user: req.user.id,
            date: { $gte: startDate }
        }).sort({ date: 1 });

        const totalRevenue = stats.reduce((acc, curr) => acc + curr.revenue, 0);
        const totalProfit = stats.reduce((acc, curr) => acc + curr.profit, 0);

        // 2. Average Prices (Weighted Average from Transactions)
        // We need transactions to calculate average buy/sell prices
        const transactions = await Transaction.find({
            user: req.user.id,
            timestamp: { $gte: startDate }
        });

        const calculateWeightedAvg = (type) => {
            const filtered = transactions.filter(t => t.type === type && t.price);
            if (filtered.length === 0) return 0;

            const totalValue = filtered.reduce((acc, t) => acc + (t.units * t.price), 0);
            const totalUnits = filtered.reduce((acc, t) => acc + t.units, 0);

            return totalUnits > 0 ? (totalValue / totalUnits) : 0;
        };

        const avgBuyPrice = calculateWeightedAvg('BUY');
        const avgSellPrice = calculateWeightedAvg('SELL');

        // 3. Chart Data (Time Series)
        // Map stats to chart format. If days are missing in stats, they won't appear (can be padded if needed)
        // Determining volumes requires aggregating transactions per day OR adding volumes to FinancialStats
        // We added 'energyTraded' to FinancialStats, but didn't split by Buy/Sell.
        // For accurate Buy vs Sell Volumes chart, we might need to aggregate transactions manually or add fields.
        // Let's aggregate transactions for volumes to be precise.

        const chartData = stats.map(stat => {
            // Find transactions for this day to split volumes
            const dayStart = new Date(stat.date);
            const dayEnd = new Date(stat.date);
            dayEnd.setHours(23, 59, 59, 999);

            const dayTrans = transactions.filter(t => t.timestamp >= dayStart && t.timestamp <= dayEnd);
            const buyVolume = dayTrans.filter(t => t.type === 'BUY').reduce((acc, t) => acc + t.units, 0);
            const sellVolume = dayTrans.filter(t => t.type === 'SELL').reduce((acc, t) => acc + t.units, 0);

            return {
                date: stat.date,
                revenue: stat.revenue,
                profit: stat.profit,
                buyVolume,
                sellVolume
            };
        });

        // 4. Insights (Most Profitable Date)
        // stats is already sorted by date asc. Find max profit.
        // Create a copy to sort by profit
        const sortedByProfit = [...stats].sort((a, b) => b.profit - a.profit);
        const mostProfitable = sortedByProfit.length > 0 ? sortedByProfit[0] : null;

        res.status(200).json({
            totals: {
                revenue: totalRevenue,
                profit: totalProfit,
                avgBuyPrice: avgBuyPrice.toFixed(2),
                avgSellPrice: avgSellPrice.toFixed(2)
            },
            chartData,
            insights: {
                mostProfitableDate: mostProfitable ? mostProfitable.date : null,
                mostProfitableAmount: mostProfitable ? mostProfitable.profit : 0,
                bestSellingWindow: "17:00 - 19:00" // Hardcoded/Mock for now as we don't track hourly resolution in stats
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getAnalyticsData
};
