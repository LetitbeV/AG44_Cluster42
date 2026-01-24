const Transaction = require('../models/Transaction');

// @desc    Get all transactions for logged in user
// @route   GET /api/transactions
// @access  Private
const { formatLocal } = require('../utils/dateUtils');

const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id }).sort({
            createdAt: -1,
        });

        const formattedTransactions = transactions.map(t => {
            const obj = t.toObject();
            obj.timestamp = formatLocal(obj.timestamp);
            obj.createdAt = formatLocal(obj.createdAt);
            obj.updatedAt = formatLocal(obj.updatedAt);
            return obj;
        });

        res.status(200).json(formattedTransactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getTransactions,
};
