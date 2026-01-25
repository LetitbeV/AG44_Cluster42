import React, { useState } from 'react';
import { Target, ArrowRight } from 'lucide-react';

import axios from 'axios';

const ManualTrade = ({ onTrade }) => {
    const [amount, setAmount] = useState(1);
    const [action, setAction] = useState('buy'); // buy or sell
    const [isLoading, setIsLoading] = useState(false);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    const handleExecute = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            // Default amount to 1 if empty or invalid
            const tradeAmount = amount ? Number(amount) : 1;

            const payload = {
                action: action.toUpperCase(),
                timestamp: new Date().toISOString(),
                quantity: isNaN(tradeAmount) ? 1 : tradeAmount
            };

            const response = await axios.post(`${API_URL}/state/update`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            onTrade(response.data); // Pass full response including batteryState
            // Alert removed as requested
        } catch (error) {
            console.error("Trade failed:", error);
            alert(`Trade failed: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Target size={18} color="var(--primary-green)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Manual Trade Control</h3>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Action</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setAction('buy')}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: action === 'buy' ? '#22c55e' : '#1f2937',
                                color: action === 'buy' ? '#000' : '#6b7280',
                                cursor: 'pointer',
                                fontWeight: '800',
                                letterSpacing: '1px',
                                transition: 'all 0.1s',
                                transform: action === 'buy' ? 'translateY(2px)' : 'translateY(0)',
                                boxShadow: action === 'buy' ? '0 0 15px rgba(34, 197, 94, 0.6)' : '0 4px 0 #111',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase'
                            }}
                        >
                            BUY / CHARGE
                        </button>
                        <button
                            onClick={() => setAction('sell')}
                            style={{
                                flex: 1,
                                padding: '1rem',
                                borderRadius: '8px',
                                border: 'none',
                                backgroundColor: action === 'sell' ? '#ef4444' : '#1f2937',
                                color: action === 'sell' ? '#000' : '#6b7280',
                                cursor: 'pointer',
                                fontWeight: '800',
                                letterSpacing: '1px',
                                transition: 'all 0.1s',
                                transform: action === 'sell' ? 'translateY(2px)' : 'translateY(0)',
                                boxShadow: action === 'sell' ? '0 0 15px rgba(239, 68, 68, 0.6)' : '0 4px 0 #111',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase'
                            }}
                        >
                            SELL / DISCHARGE
                        </button>
                    </div>
                </div>

                <div style={{ width: '100px' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Amount (kWh)</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '8px',
                            border: '1px solid #333',
                            backgroundColor: '#0a0a0a',
                            color: '#fff'
                        }}
                    />
                </div>

                <button
                    onClick={handleExecute}
                    disabled={isLoading}
                    style={{
                        padding: '0.6rem 1rem',
                        backgroundColor: isLoading ? '#374151' : 'var(--primary-green)',
                        border: 'none',
                        borderRadius: '8px',
                        color: isLoading ? '#9ca3af' : '#000',
                        fontWeight: '600',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    {isLoading ? 'Executing...' : <>Execute <ArrowRight size={16} /></>}
                </button>
            </div>
        </div>
    );
};

export default ManualTrade;
