import React, { useEffect, useState } from 'react';
import TradeTable from './TradeTable';
import SummarySection from './SummarySection';
import { getTradeHistoryData } from '../../lib/mockTradeHistoryData';
import { Calendar, Download } from 'lucide-react';

const TradeHistoryPage = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        const historyData = getTradeHistoryData();
        setData(historyData);
    }, []);

    if (!data) return <div style={{ padding: '2rem' }}>Loading History...</div>;

    return (
        <div>
            {/* Header */}
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <div style={{ width: '6px', height: '6px', backgroundColor: 'var(--primary-green)', borderRadius: '50%' }}></div>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary-green)', letterSpacing: '0.5px' }}>LIVE MARKET ACTIVE</span>
                    </div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>Trade History</h2>
                    <p style={{ color: 'var(--text-muted)' }}>Audit and manage historical energy transactions for battery storage assets across wholesale markets.</p>
                </div>

                {/* <div style={{ display: 'flex', gap: '1rem' }}>
                    <button style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 1.25rem', backgroundColor: '#1f2937',
                        border: '1px solid #374151', borderRadius: '12px', color: '#fff', cursor: 'pointer'
                    }}>
                        <Calendar size={18} />
                        Last 30 Days
                    </button>
                </div> */}
            </header>

            {/* Main Content Layout */}
            <div style={{ display: 'flex', gap: '2rem' }}>
                {/* FilterPanel removed */}

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <TradeTable trades={data.trades} />
                    <SummarySection data={data.summary} />
                </div>
            </div>

            <footer style={{ marginTop: '3rem', borderTop: '1px solid #333', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: '0.8rem' }}>
                <div>ENERGYTRADE PRO V2.4.0</div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <span>DOCUMENTATION</span>
                    <span>COMPLIANCE</span>
                    <span>SUPPORT</span>
                </div>
                <div>© 2023 ENERGYTRADE TECHNOLOGIES INC.</div>
            </footer>
        </div>
    );
};

export default TradeHistoryPage;
