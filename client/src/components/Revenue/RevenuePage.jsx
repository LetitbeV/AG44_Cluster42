import React, { useEffect, useState } from 'react';
import KPICards from './KPICards';
import RevenueChart from './RevenueChart';
import VolumeChart from './VolumeChart';
import InsightsPanel from './InsightsPanel';
import ExecutionFeed from './ExecutionFeed';
import { getRevenueData } from '../../lib/mockRevenueData';
import { Download, Calendar, Zap } from 'lucide-react';

const RevenuePage = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        // Simulating API call
        const revenueData = getRevenueData();
        setData(revenueData);
    }, []);

    if (!data) return <div style={{ padding: '2rem' }}>Loading Analytics...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>Revenue & Profit Analytics</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Real-time performance tracking for battery storage assets across wholesale markets.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <div className="glass-panel" style={{ display: 'flex', borderRadius: '8px', overflow: 'hidden' }}>
                        {['7 Days', '30 Days', 'Quarter'].map((period, i) => (
                            <button key={period} style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: i === 0 ? '#334155' : 'transparent',
                                color: '#fff',
                                border: 'none',
                                borderRight: i < 2 ? '1px solid #333' : 'none',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}>
                                {period}
                            </button>
                        ))}
                    </div>

                    <button style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        backgroundColor: 'var(--primary-green)',
                        color: '#000',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '0 0 10px var(--primary-green-glow)'
                    }}>
                        <Download size={16} /> Export PDF
                    </button>
                </div>
            </div>

            <KPICards data={data.kpis} />

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <RevenueChart data={data.revenueOverTime} />
                    <VolumeChart data={data.buySellVolumes} />
                </div>

                {/* Right Column */}
                <div>
                    <InsightsPanel data={data.strategicInsights} />
                    <ExecutionFeed data={data.executionFeed} />
                </div>
            </div>

            <footer style={{ marginTop: '3rem', borderTop: '1px solid #333', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ padding: '2px', backgroundColor: '#10b981', borderRadius: '2px' }}><Zap size={12} color="#000" /></div>
                    Wholesale Market Analytics Platform.
                </div>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <span>System Status</span>
                    <span>API Docs</span>
                    <span>Privacy Policy</span>
                </div>
            </footer>
        </div>
    );
};

export default RevenuePage;
