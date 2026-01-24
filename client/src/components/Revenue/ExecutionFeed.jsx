import React from 'react';
import { Zap, ShoppingCart } from 'lucide-react';

const ExecutionFeed = ({ data }) => {
    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem', minHeight: '200px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '700', letterSpacing: '0.5px', color: '#9ca3af' }}>EXECUTION FEED</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary-green)' }}></div>
                    LIVE • 4s ago
                </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data && data.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                backgroundColor: item.type === 'SELL' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(148, 163, 184, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {item.type === 'SELL' ? <Zap size={16} color="var(--primary-green)" /> : <ShoppingCart size={16} color="#94a3b8" />}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.9rem', fontWeight: '700', color: '#e5e5e5' }}>
                                    {item.type}: {item.asset}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                    {item.volume} @ {item.price}
                                </div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: '700', color: item.value.startsWith('+') ? 'var(--primary-green)' : '#e5e5e5' }}>
                                {item.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExecutionFeed;
