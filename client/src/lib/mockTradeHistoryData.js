/**
 * Mock Data for Trade History & Audit Page
 */

export const getTradeHistoryData = () => {
    return {
        filters: {
            assets: [
                { id: 'bess-01', label: 'BESS-01 Alpha', checked: true },
                { id: 'bess-02', label: 'BESS-02 Beta', checked: true },
                { id: 'grid-tie', label: 'Grid-Tie Delta', checked: false },
            ]
        },
        summary: {
            totalCharged: { value: '12.5 MWh', change: 14, trend: 'up' },
            avgBuyPrice: { value: '$0.114 / kWh', subtext: '+2.1% volatility', trend: 'down' }, // 'down' for red color on subtext if needed, or custom handling
            netRevenue: { value: '$3,421.08', subtext: 'Target Reached', trend: 'up' }
        },
        trades: [
            { id: 1, date: 'Oct 24, 14:20:01', action: 'BUY', asset: 'BESS-01-A', energy: 450.50, price: 0.124, value: 55.86, status: 'Settled' },
            { id: 2, date: 'Oct 24, 14:15:32', action: 'SELL', asset: 'BESS-02-B', energy: 1200.00, price: 0.182, value: 218.40, status: 'Settled' },
            { id: 3, date: 'Oct 24, 13:58:10', action: 'BUY', asset: 'BESS-01-A', energy: 820.00, price: 0.115, value: 94.30, status: 'Pending' },
            { id: 4, date: 'Oct 24, 13:42:15', action: 'SELL', asset: 'Grid-Tie-D', energy: 350.25, price: 0.195, value: 68.30, status: 'Settled' },
            { id: 5, date: 'Oct 23, 16:30:00', action: 'SELL', asset: 'BESS-01-A', energy: 500.00, price: 0.210, value: 105.00, status: 'Settled' },
            { id: 6, date: 'Oct 23, 09:15:00', action: 'BUY', asset: 'BESS-02-B', energy: 1000.00, price: 0.095, value: 95.00, status: 'Settled' },
            { id: 7, date: 'Oct 22, 21:00:00', action: 'BUY', asset: 'BESS-01-A', energy: 200.00, price: 0.105, value: 21.00, status: 'Settled' },
            { id: 8, date: 'Oct 22, 18:45:00', action: 'SELL', asset: 'Grid-Tie-D', energy: 600.00, price: 0.198, value: 118.80, status: 'Settled' },
        ]
    };
};
