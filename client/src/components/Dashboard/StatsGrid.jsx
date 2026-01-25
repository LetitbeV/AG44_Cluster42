import React from 'react';

const StatCard = ({ label, value, subtext, subtextClass }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: '700' }}>{value}</span>
            <span style={{ fontSize: '0.8rem', color: subtextClass === 'positive' ? 'var(--primary-green)' : '#ef4444' }}>
                {subtext}
            </span>
        </div>
    </div>
);

const StatsGrid = ({ financials, market, system }) => {
    if (!financials || !market || !system) return null;

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
            marginBottom: '1.5rem'
        }}>
            <StatCard
                label="Today's Revenue"
                value={`₹${financials.revenue?.toFixed(2) || '0.00'}`}
                subtext={`${financials.revenueChange > 0 ? '+' : ''}${financials.revenueChange}%`}
                subtextClass={financials.revenueChange >= 0 ? 'positive' : 'negative'}
            />
            <StatCard
                label="Energy Traded"
                value={`${financials.energyTraded?.toFixed(1) || '0'} kWh`}
                subtext={`${financials.energyChange > 0 ? '+' : ''}${financials.energyChange}%`}
                subtextClass={financials.energyChange >= 0 ? 'positive' : 'negative'}
            />
            <StatCard
                label="Peak Market Price"
                value={`₹${market.peakPrice?.toFixed(2) || '0.00'}`}
                subtext={`${market.priceChange > 0 ? '+' : ''}${market.priceChange}%`}
                subtextClass={market.priceChange >= 0 ? 'positive' : 'negative'}
            />
            <StatCard
                label="Battery Health"
                value={`${system.health?.toFixed(1) || '100'}%`}
                subtext="Optimal"
                subtextClass="positive"
            />
        </div>
    );
};

export default StatsGrid;
