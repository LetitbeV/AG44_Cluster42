import React from 'react';
import { Battery, Wallet, TrendingUp } from 'lucide-react';

const SummaryCard = ({ title, value, subtext, icon: Icon, isPositive, color }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
            <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6b7280', letterSpacing: '0.5px', marginBottom: '0.5rem' }}>
                {title.toUpperCase()}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', lineHeight: '1.2' }}>{value}</div>
            <div style={{ fontSize: '0.85rem', color: isPositive ? 'var(--primary-green)' : '#fbbf24', marginTop: '4px' }}>
                {subtext}
            </div>
        </div>
        <div style={{ padding: '8px', backgroundColor: `rgba(255,255,255,0.05)`, borderRadius: '8px' }}>
            <Icon size={20} color={color || 'var(--primary-green)'} />
        </div>
    </div>
);

const SummarySection = ({ data }) => {
    return (
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
            <SummaryCard
                title="Total Charged"
                value={data.totalCharged.value}
                subtext={`+${data.totalCharged.change}% from last week`}
                icon={Battery}
                isPositive={true}
            />
            <SummaryCard
                title="Avg. Buy Price"
                value={data.avgBuyPrice.value}
                subtext={data.avgBuyPrice.subtext}
                icon={Wallet}
                isPositive={false}
                color="#fff"
            />
            <SummaryCard
                title="Net Revenue"
                value={data.netRevenue.value}
                subtext={data.netRevenue.subtext}
                icon={TrendingUp}
                isPositive={true}
            />
        </div>
    );
};

export default SummarySection;
