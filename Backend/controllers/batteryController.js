const Battery = require('../models/Battery');

// @desc    Add or Update Battery Info
// @route   POST /api/battery
// @access  Private
const addBatteryInfo = async (req, res) => {
    const {
        maxCapacity,
        chargeRate,
        dischargeRate,
        chargeEfficiency,
        dischargeEfficiency,
    } = req.body;

    if (
        !maxCapacity ||
        !chargeRate ||
        !dischargeRate ||
        !chargeEfficiency ||
        !dischargeEfficiency
    ) {
        return res.status(400).json({ message: 'Please provide all battery details' });
    }

    try {
        // Check if battery info exists for this user
        let battery = await Battery.findOne({ user: req.user.id });

        if (battery) {
            // Update existing
            battery.maxCapacity = maxCapacity;
            battery.chargeRate = chargeRate;
            battery.dischargeRate = dischargeRate;
            battery.chargeEfficiency = chargeEfficiency;
            battery.dischargeEfficiency = dischargeEfficiency;

            const updatedBattery = await battery.save();
            return res.status(200).json(updatedBattery);
        }

        // Create new
        const newBattery = await Battery.create({
            user: req.user.id,
            maxCapacity,
            chargeRate,
            dischargeRate,
            chargeEfficiency,
            dischargeEfficiency,
        });

        res.status(201).json(newBattery);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    addBatteryInfo,
};
