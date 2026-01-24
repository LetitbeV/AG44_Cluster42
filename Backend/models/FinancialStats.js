const mongoose = require('mongoose');

const financialStatsSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        date: {
            type: Date,
            required: true,
        },
        revenue: {
            type: Number,
            default: 0,
        },
        cost: {
            type: Number,
            default: 0,
        },
        profit: {
            type: Number,
            default: 0,
        },
        energyTraded: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure unique entry per user per day
financialStatsSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('FinancialStats', financialStatsSchema);
