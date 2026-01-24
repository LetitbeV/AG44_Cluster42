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

const StatsGrid = () => {
    // Using static data from simulation/mockup for now
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1.5rem',
            marginBottom: '1.5rem'
        }}>
            <StatCard
                label="Today's Revenue"
                value="$142.50"
                subtext="+12.4%"
                subtextClass="positive"
            />
            <StatCard
                label="Energy Traded"
                value="420 kWh"
                subtext="+5.2%"
                subtextClass="positive"
            />
            <StatCard
                label="Peak Market Price"
                value="$85.20"
                subtext="-2.1%"
                subtextClass="negative"
            />
            <StatCard
                label="Battery Health"
                value="98.2%"
                subtext="Optimal"
                subtextClass="positive"
            />
        </div>
    );
};

export default StatsGrid;
