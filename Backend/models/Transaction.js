const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        battery: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Battery',
        },
        type: {
            type: String,
            enum: ['BUY', 'SELL'],
            required: true,
        },
        units: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Transaction', transactionSchema);