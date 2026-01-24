const FinancialStats = require('../models/FinancialStats');
const BatteryState = require('../models/BatteryState');

// @desc    Get dashboard aggregated data
// @route   GET /api/dashboard
// @access  Private
const getDashboardData = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Get Financials (Today + History for % change)
        const statsHistory = await FinancialStats.find({ user: req.user.id }).sort({ date: -1 });

        // Use the most recent stats available (Simulation-friendly)
        // If no stats at all, defaults to 0
        let currentStats = statsHistory.length > 0 ? statsHistory[0] : null;

        if (!currentStats) {
            currentStats = { revenue: 0, cost: 0, profit: 0, energyTraded: 0, date: today };
        }

        // Previous Stats (The record immediately before the current one)
        let previousStats = statsHistory.length > 1 ? statsHistory[1] : null;
        if (!previousStats) previousStats = { revenue: 0, energyTraded: 0 };

        // Calculate % change
        const calculateChange = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
        };

        const revenueChange = calculateChange(currentStats.revenue, previousStats.revenue);
        const energyChange = calculateChange(currentStats.energyTraded, previousStats.energyTraded);

        // 2. Get Battery State (Health, Power, Temp)
        // Assuming single battery for dashboard for now.
        let batteryState = await BatteryState.findOne({}).populate('battery');
        // Note: In real app, filter by user/battery. The updateState ensures creating one linked to battery.
        // However, batteryState schema has 'battery' ref, which has 'user'. 
        // Ideally we query by finding battery for user first. 
        // For now assuming 1 battery per user logic from updateState.
        // We can't query BatteryState by user directly unless we add user field or aggregate.
        // Let's implement robust finding:
        // This requires looking up the Battery first.
        // (Skipping for brevity, assuming the user's battery state is accessible via updateState logic, 
        // but here we need to READ it). 
        // Since we didn't add User to BatteryState, we iterate or change query plan.
        // Better: Find batteries for user, then find states for those batteries.

        // Import Battery model dynamically or assume we need it
        const Battery = require('../models/Battery');
        const userBattery = await Battery.findOne({ user: req.user.id });

        let currentData = {
            soc: 0,
            rate: 0,
            health: 100,
            cycles: 0,
            temp: 25,
            status: 'IDLE'
        };

        if (userBattery) {
            const state = await BatteryState.findOne({ battery: userBattery._id });
            if (state) {
                currentData = {
                    soc: (state.current_energy_kwh / state.effective_capacity_kwh) * 100,
                    rate: state.currentPower,
                    health: state.health,
                    cycles: state.cycle_count,
                    temp: state.temperature,
                    status: state.status
                };
            }
        }

        // 3. Peak Market Price (Mock)
        const peakPrice = 85.20; // Hardcoded or fetch max from priceController logic
        const peakPriceChange = -2.1;

        const { formatLocal } = require('../utils/dateUtils');

        res.status(200).json({
            financials: {
                date: formatLocal(currentStats.date), // Useful for debugging
                revenue: currentStats.revenue,
                revenueChange: revenueChange.toFixed(1),
                energyTraded: currentStats.energyTraded,
                energyChange: energyChange.toFixed(1)
            },
            market: {
                peakPrice: peakPrice,
                priceChange: peakPriceChange
            },
            system: {
                ...currentData
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getDashboardData,
};