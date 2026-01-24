const mongoose = require('mongoose');

const batteryStateSchema = mongoose.Schema(
    {
        battery: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Battery',
        },
        current_energy_kwh: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            enum: ['IDLE', 'CHARGING', 'DISCHARGING'],
            default: 'IDLE',
        },
        cycle_count: {
            type: Number,
            default: 0,
        },
        effective_capacity_kwh: {
            type: Number,
            required: true,
        },
        health: {
            type: Number,
            default: 100,
        },
        temperature: {
            type: Number,
            default: 25,
        },
        currentPower: {
            type: Number,
            default: 0,
        },
        last_synced_at: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('BatteryState', batteryStateSchema);
