const BatteryState = require('../models/BatteryState');
const Battery = require('../models/Battery');
const Transaction = require('../models/Transaction');
const FinancialStats = require('../models/FinancialStats');

// @desc    Update battery state based on action
// @route   POST /api/state/update
// @access  Private
const { getPriceForDate } = require('../utils/priceUtils');

// @desc    Update battery state based on action
// @route   POST /api/state/update
// @access  Private
const updateState = async (req, res) => {
    const { action, timestamp, quantity } = req.body;

    if (!action || !timestamp || quantity === undefined) {
        return res.status(400).json({ message: 'Please provide action, timestamp, and quantity' });
    }

    try {
        // 1. Get Battery Info for User
        const batteryInfo = await Battery.findOne({ user: req.user.id });
        if (!batteryInfo) {
            return res.status(404).json({ message: 'No battery info found for user' });
        }

        // 2. Get or Create Battery State
        let batteryState = await BatteryState.findOne({ battery: batteryInfo._id });

        if (!batteryState) {
            // Initialize state if not exists
            batteryState = await BatteryState.create({
                battery: batteryInfo._id,
                current_energy_kwh: 0, // Assume empty start
                effective_capacity_kwh: batteryInfo.maxCapacity,
            });
        }



        // 3. Get Price for Timestamp
        const priceData = await getPriceForDate(timestamp);
        const currentPrice = priceData.price;

        // Use the requested timestamp as the trade time, interpreting as Local Time (strip Z)
        const tradeTime = new Date(timestamp.replace('Z', ''));

        if (isNaN(tradeTime.getTime())) {
            return res.status(400).json({ message: 'Invalid timestamp format' });
        }

        // 4. Calculate Energy Change and Validate
        let energyChange = 0;
        let qty = parseFloat(quantity);

        if (action === 'BUY') {
            energyChange = qty;
            batteryState.status = 'CHARGING';
        } else if (action === 'SELL') {

            energyChange = -(qty);
            batteryState.status = 'DISCHARGING';
        } else {
            batteryState.status = 'IDLE';
        }

        // 5. Calculate New Energy
        const newEnergy = batteryState.current_energy_kwh + energyChange;

        // 6. Validation
        // Allow tiny tolerance for floating point errors
        if (newEnergy < 0) {
            return res.status(400).json({
                message: 'Invalid action: Battery would be empty',
                current: batteryState.current_energy_kwh,
                required: Math.abs(energyChange),
                projected: newEnergy
            });
        }

        if (newEnergy > batteryState.effective_capacity_kwh) {
            return res.status(400).json({
                message: 'Invalid action: Battery would overcharge',
                current: batteryState.current_energy_kwh,
                capacity: batteryState.effective_capacity_kwh,
                projected: newEnergy
            });
        }

        // Clamp to 0-max for safety
        const clampedEnergy = Math.max(0, Math.min(newEnergy, batteryState.effective_capacity_kwh));

        // 7. Update State
        batteryState.current_energy_kwh = clampedEnergy;
        batteryState.last_synced_at = tradeTime;

        if (action === 'SELL') {
            batteryState.cycle_count += 1;
        }

        await batteryState.save();

        // 8. Create Transaction Record
        // Units = Quantity Traded with Grid
        const transaction = await Transaction.create({
            user: req.user.id,
            battery: batteryInfo._id,
            type: action,
            units: qty,
            price: currentPrice,
            timestamp: tradeTime
        });

        // 9. Financial Stats Update
        const today = new Date(tradeTime);
        today.setHours(0, 0, 0, 0);

        // Find or create stats for that specific day
        let stats = await FinancialStats.findOne({ user: req.user.id, date: today });

        if (!stats) {
            stats = await FinancialStats.create({
                user: req.user.id,
                date: today
            });
        }

        const transactionValue = qty * currentPrice;

        if (action === 'SELL') {
            stats.revenue += transactionValue;
            stats.profit += transactionValue;
            stats.energyTraded += qty;

            // Mock System Updates
            batteryState.currentPower = -batteryInfo.dischargeRate; // Just keeping rate for 'current status' display
            batteryState.temperature = Math.min(batteryState.temperature + 0.5, 60);
            batteryState.health = Math.max(batteryState.health - 0.001, 0);

        } else if (action === 'BUY') {
            stats.cost += transactionValue;
            stats.profit -= transactionValue;
            stats.energyTraded += qty;

            batteryState.currentPower = batteryInfo.chargeRate;
            batteryState.temperature = Math.min(batteryState.temperature + 0.3, 60);
        }

        await stats.save();
        await batteryState.save();

        const { formatLocal } = require('../utils/dateUtils');

        const batteryStateObj = batteryState.toObject();
        batteryStateObj.last_synced_at = formatLocal(batteryStateObj.last_synced_at);
        batteryStateObj.createdAt = formatLocal(batteryStateObj.createdAt);
        batteryStateObj.updatedAt = formatLocal(batteryStateObj.updatedAt);

        const transactionObj = transaction.toObject();
        transactionObj.timestamp = formatLocal(transactionObj.timestamp);
        transactionObj.createdAt = formatLocal(transactionObj.createdAt);
        transactionObj.updatedAt = formatLocal(transactionObj.updatedAt);

        res.status(200).json({
            batteryState: batteryStateObj,
            transaction: transactionObj
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    updateState
};
