import React from 'react';
import { Wallet, TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MarketKPICard = ({ title, value, subtext, icon: Icon, isPositive, isWarning, timestamp }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{title}</span>
            <div style={{ padding: '8px', backgroundColor: isWarning ? 'rgba(251, 191, 36, 0.1)' : 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <Icon size={18} color={isWarning ? '#fbbf24' : 'var(--primary-green)'} />
            </div>
        </div>

        <div style={{ marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: '800', color: isWarning ? '#fbbf24' : '#fff' }}>{value}</span>
            <span style={{ fontSize: '1rem', color: '#6b7280', marginLeft: '4px' }}>{title.includes('Price') || title.includes('High') || title.includes('Low') ? '/MWh' : ''}</span>
        </div>

        {subtext && (
            <div style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: isPositive ? 'var(--primary-green)' : (isWarning ? '#fbbf24' : '#9ca3af'),
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
            }}>
                {isPositive && <ArrowUpRight size={14} />}
                {subtext}
            </div>
        )}

        {timestamp && (
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Recorded at {timestamp}</div>
        )}
        {isWarning && (
            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Index: 8.2 (Std Dev)</div>
        )}
    </div>
);

const KPIGrid = ({ data }) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <MarketKPICard
                title="Current Price"
                value={`₹${data.currentPrice.value}`}
                subtext={`+${data.currentPrice.change}%`}
                icon={Wallet}
                isPositive={true}
            />
            <MarketKPICard
                title="Daily High"
                value={`₹${data.dailyHigh.value}`}
                timestamp={data.dailyHigh.timestamp}
                icon={TrendingUp}
            />
            <MarketKPICard
                title="Daily Low"
                value={`₹${data.dailyLow.value}`}
                timestamp={data.dailyLow.timestamp}
                icon={TrendingDown}
            />
            <MarketKPICard
                title="Volatility"
                value={data.volatility.status}
                icon={AlertTriangle}
                isWarning={true}
            />
        </div>
    );
};

export default KPIGrid;
