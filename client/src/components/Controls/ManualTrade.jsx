import React, { useState } from 'react';
import { Target, ArrowRight } from 'lucide-react';

const ManualTrade = ({ onTrade }) => {
    const [amount, setAmount] = useState(1);
    const [action, setAction] = useState('buy'); // buy or sell

    const handleExecute = () => {
        onTrade({ action, amount });
        alert(`Manual Trade Executed: ${action.toUpperCase()} ${amount} kWh`);
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
                    style={{
                        padding: '0.6rem 1rem',
                        backgroundColor: 'var(--primary-green)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#000',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    Execute <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default ManualTrade;
