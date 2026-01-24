import React from 'react';
import { Search, SlidersHorizontal, CheckCircle, Clock } from 'lucide-react';

const TradeTable = ({ trades }) => {
    return (
        <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            {/* Top Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', backgroundColor: '#000', borderRadius: '8px', padding: '4px' }}>
                    {['All Actions', 'Buy', 'Sell'].map((tab, i) => (
                        <button key={tab} style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: i === 0 ? '#1f2937' : 'transparent',
                            color: i === 0 ? '#fff' : '#9ca3af',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                        }}>{tab}</button>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} color="#6b7280" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search trades..."
                            style={{
                                backgroundColor: '#0a0a0a',
                                border: '1px solid #333',
                                padding: '0.6rem 0.6rem 0.6rem 2.2rem',
                                borderRadius: '8px',
                                color: '#fff',
                                width: '200px'
                            }}
                        />
                    </div>
                    <SlidersHorizontal size={18} color="#6b7280" style={{ cursor: 'pointer' }} />
                    <span style={{ fontSize: '0.8rem', color: '#6b7280', borderLeft: '1px solid #333', paddingLeft: '1rem' }}>Showing {trades.length} results</span>
                </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #333', color: '#6b7280', fontSize: '0.75rem', letterSpacing: '1px' }}>
                            <th style={{ padding: '1rem', fontWeight: '700' }}>DATE/TIME</th>
                            <th style={{ padding: '1rem', fontWeight: '700' }}>ACTION</th>
                            <th style={{ padding: '1rem', fontWeight: '700' }}>ASSET ID</th>
                            <th style={{ padding: '1rem', fontWeight: '700' }}>ENERGY (KWH)</th>
                            <th style={{ padding: '1rem', fontWeight: '700' }}>PRICE/KWH</th>
                            <th style={{ padding: '1rem', fontWeight: '700' }}>TOTAL VALUE</th>
                            <th style={{ padding: '1rem', fontWeight: '700' }}>STATUS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trades.map(trade => (
                            <tr key={trade.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }} className="hover:bg-white/5">
                                <td style={{ padding: '1rem', color: '#e5e5e5' }}>
                                    <div style={{ fontWeight: '600' }}>{trade.date.split(',')[0]}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{trade.date.split(',')[1]}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        padding: '4px 10px',
                                        borderRadius: '9999px',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        backgroundColor: trade.action === 'BUY' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                        color: trade.action === 'BUY' ? 'var(--primary-green)' : '#ef4444',
                                        border: trade.action === 'BUY' ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
                                    }}>
                                        {trade.action}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', color: '#9ca3af' }}>{trade.asset}</td>
                                <td style={{ padding: '1rem', fontWeight: '600' }}>{trade.energy.toLocaleString()}</td>
                                <td style={{ padding: '1rem' }}>${trade.price}</td>
                                <td style={{ padding: '1rem', fontWeight: '700' }}>${trade.value}</td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: trade.status === 'Settled' ? 'var(--primary-green)' : '#fbbf24' }}>
                                        {trade.status === 'Settled' ? <CheckCircle size={14} /> : <Clock size={14} />}
                                        {trade.status}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls (Mock) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: '#6b7280', marginRight: '1rem' }}>Page 1 of 12</span>
                <button style={{ padding: '0.5rem 1rem', background: '#333', border: 'none', borderRadius: '6px', color: '#9ca3af', cursor: 'pointer' }}>Previous</button>
                <button style={{ padding: '0.5rem 1rem', background: '#333', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}>Next</button>
            </div>
        </div>
    );
};

export default TradeTable;
