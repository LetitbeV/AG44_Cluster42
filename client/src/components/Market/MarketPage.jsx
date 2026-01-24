import React, { useEffect, useState } from 'react';
import KPIGrid from './KPIGrid';
import PriceActionChart from './PriceActionChart';
import InsightPanel from './InsightPanel';
import BottomStats from './BottomStats';
import { getMarketData } from '../../lib/mockMarketData';
import { Search, Bell, User } from 'lucide-react';

const MarketPage = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        setData(getMarketData());
    }, []);

    if (!data) return <div style={{ padding: '2rem' }}>Loading Market Data...</div>;

    return (
        <div>
            {/* Top Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ flex: 1, marginRight: '2rem', position: 'relative' }}>
                    <Search size={18} color="#6b7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Search markets, assets, or trades..."
                        style={{
                            width: '100%', maxWidth: '400px',
                            backgroundColor: '#111', border: '1px solid #333',
                            borderRadius: '8px', padding: '0.75rem 0.75rem 0.75rem 2.5rem', color: '#fff'
                        }}
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Bell size={20} color="#fff" />
                    </div>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#1f2937', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={20} color="#fff" />
                    </div>
                </div>
            </div>

            {/* Title & Time Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>Market Performance Analysis</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-green)' }}></div>
                        <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Live Market Data • Wholesale Electricity (ERCOT)</span>
                    </div>
                </div>

                <div className="glass-panel" style={{ display: 'flex', borderRadius: '8px', padding: '4px', gap: '4px' }}>
                    {['1H', '4H', '1D', '7D'].map((time, i) => (
                        <button key={time} style={{
                            padding: '0.25rem 1rem',
                            backgroundColor: i === 2 ? 'var(--primary-green)' : 'transparent', // 1D selected
                            color: i === 2 ? '#000' : '#9ca3af',
                            fontWeight: i === 2 ? '700' : '400',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer'
                        }}>{time}</button>
                    ))}
                </div>
            </div>

            <KPIGrid data={data.kpis} />

            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '1.5rem' }}>
                <PriceActionChart data={data.priceSeries} />
                <InsightPanel insights={data.insights} />
            </div>

            <BottomStats stats={data.stats} />

            <footer style={{ marginTop: '3rem', borderTop: '1px solid #333', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: '0.8rem' }}>
                <div>© 2024 EnergyTrade Solutions Inc. All market data delayed by 15 minutes.</div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <span>Privacy Policy</span>
                    <span>API Documentation</span>
                    <span>Support Center</span>
                </div>
            </footer>
        </div>
    );
};

export default MarketPage;
