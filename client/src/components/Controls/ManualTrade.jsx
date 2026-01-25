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
            alert(`Manual Trade Executed: ${action.toUpperCase()} ${amount} kWh`);
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setAction('buy')}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: action === 'buy' ? '1px solid var(--primary-green)' : '1px solid #333',
                                backgroundColor: action === 'buy' ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                                color: action === 'buy' ? 'var(--primary-green)' : '#fff',
                                cursor: 'pointer'
                            }}
                        >
                            Buy / Charge
                        </button>
                        <button
                            onClick={() => setAction('sell')}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                borderRadius: '8px',
                                border: action === 'sell' ? '1px solid #ef4444' : '1px solid #333',
                                backgroundColor: action === 'sell' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                color: action === 'sell' ? '#ef4444' : '#fff',
                                cursor: 'pointer'
                            }}
                        >
                            Sell / Discharge
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
