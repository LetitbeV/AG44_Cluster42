const FinancialStats = require('../models/FinancialStats');

// @desc    Get financial stats (today and history)
// @route   GET /api/financial
// @access  Private
const { formatLocal } = require('../utils/dateUtils');

// @desc    Get financial stats (today and history)
// @route   GET /api/financial
// @access  Private
const getFinancialStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await FinancialStats.find({ user: req.user.id }).sort({
            date: -1,
        });

        // Find today's stats from the list
        let todayStats = stats.find(
            (stat) => stat.date.getTime() === today.getTime()
        );

        if (!todayStats) {
            todayStats = {
                revenue: 0,
                cost: 0,
                profit: 0,
                energyTraded: 0,
                date: today,
            };
        } else {
            todayStats = todayStats.toObject ? todayStats.toObject() : todayStats;
        }

        // Format today
        todayStats.date = formatLocal(todayStats.date);
        if (todayStats.createdAt) todayStats.createdAt = formatLocal(todayStats.createdAt);
        if (todayStats.updatedAt) todayStats.updatedAt = formatLocal(todayStats.updatedAt);

        // Format history
        const formattedHistory = stats.map(s => {
            const obj = s.toObject();
            obj.date = formatLocal(obj.date);
            obj.createdAt = formatLocal(obj.createdAt);
            obj.updatedAt = formatLocal(obj.updatedAt);
            return obj;
        });

        res.status(200).json({
            today: todayStats,
            history: formattedHistory,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getFinancialStats,
};
