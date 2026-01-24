const FinancialStats = require('../models/FinancialStats');

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
                date: today,
            };
        }

        res.status(200).json({
            today: todayStats,
            history: stats,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getFinancialStats,
};
