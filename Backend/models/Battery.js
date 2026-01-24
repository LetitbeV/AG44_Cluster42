const mongoose = require('mongoose');

const batterySchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        maxCapacity: {
            type: Number,
            required: [true, 'Please add max capacity'],
        },
        chargeRate: {
            type: Number,
            required: [true, 'Please add charge rate'],
        },
        dischargeRate: {
            type: Number,
            required: [true, 'Please add discharge rate'],
        },
        chargeEfficiency: {
            type: Number,
            required: [true, 'Please add charge efficiency'],
        },
        dischargeEfficiency: {
            type: Number,
            required: [true, 'Please add discharge efficiency'],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Battery', batterySchema);
