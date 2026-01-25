import React from 'react';
import { Wallet, TrendingUp, ShoppingCart, Tag } from 'lucide-react';

const KPICard = ({ title, value, change, icon: Icon, isPositive }) => (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{title}</span>
            <div style={{ padding: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <Icon size={18} color="var(--primary-green)" />
            </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '1.8rem', fontWeight: '800' }}>{value}</span>
            <span style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: isPositive ? 'var(--primary-green)' : '#ef4444'
            }}>
                {change > 0 ? '+' : ''}{change}%
            </span>
        </div>

        {/* Progress bar visual */}
        <div style={{ width: '100%', height: '4px', backgroundColor: '#333', marginTop: '1rem', borderRadius: '2px' }}>
            <div style={{ width: '60%', height: '100%', backgroundColor: isPositive ? 'var(--primary-green)' : '#ef4444', borderRadius: '2px' }}></div>
        </div>
    </div>
);

const KPICards = ({ data }) => {
    if (!data) return null;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            <KPICard
                title="Total Revenue"
                value={`₹${data.totalRevenue.value.toLocaleString()}`}
                change={data.totalRevenue.change}
                icon={Wallet}
                isPositive={data.totalRevenue.trend === 'up'}
            />
            <KPICard
                title="Total Profit"
                value={`+₹${data.totalProfit.value.toLocaleString()}`}
                change={data.totalProfit.change}
                icon={TrendingUp}
                isPositive={data.totalProfit.trend === 'up'}
            />
            <KPICard
                title="Avg Buy Price"
                value={`₹${data.avgBuyPrice.value}/MWh`}
                change={data.avgBuyPrice.change}
                icon={ShoppingCart}
                isPositive={true} // Context specific
            />
            <KPICard
                title="Avg Sell Price"
                value={`₹${data.avgSellPrice.value}/MWh`}
                change={data.avgSellPrice.change}
                icon={Tag}
                isPositive={data.avgSellPrice.trend === 'up'}
            />
        </div>
    );
};

export default KPICards;
