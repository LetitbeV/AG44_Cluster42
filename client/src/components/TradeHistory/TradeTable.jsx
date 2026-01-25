import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';

const TradeTable = () => {
    const [trades, setTrades] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    useEffect(() => {
        const fetchTrades = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/transactions`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                // Transform data if necessary, or just set it
                // Assuming backend returns array of objects with: timestamp, type, units, price
                const mappedTrades = response.data.map(t => ({
                    id: t._id,
                    date: new Date(t.timestamp).toLocaleString(),
                    action: t.type, // 'BUY' or 'SELL'
                    asset: 'Main Battery', // Placeholder or from t.battery
                    energy: t.units,
                    price: t.price,
                    value: (t.units * t.price).toFixed(2),
                    status: 'Settled'
                }));

                setTrades(mappedTrades.reverse()); // Show newest first
            } catch (error) {
                console.error("Failed to fetch trades", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrades();
    }, []);

    return (
        <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            {/* Top Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Recent Transactions</h3>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Showing {trades.length} results</span>
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
                        {isLoading ? (
                            <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Loading transactions...</td></tr>
                        ) : trades.length === 0 ? (
                            <tr><td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No transactions found</td></tr>
                        ) : (
                            trades.map(trade => (
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
                            ))
                        )}
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
