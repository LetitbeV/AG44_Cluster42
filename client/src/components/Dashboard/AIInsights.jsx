import React from 'react';
import { Sparkles } from 'lucide-react';

const AIInsights = ({ recommendation, onExecute }) => {
    if (!recommendation) return null;

    const isBuy = recommendation.type === 'BUY';
    const isSell = recommendation.type === 'SELL';

    const accentColor = isSell ? '#ef4444' : isBuy ? 'var(--primary-green)' : '#fbbf24';

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Sparkles size={18} color="var(--primary-green)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>AI Market Insights</h3>
            </div>

            {/* <div style={{
                backgroundColor: accentColor,
                color: '#000',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
            }}>
                <span style={{ fontWeight: '800', fontSize: '0.9rem' }}>
                    RECOMMENDATION: {recommendation.type || 'HOLD'}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>
                    Confidence: {recommendation.confidence || 85}%
                </span>
            </div> */}

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#e5e5e5' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Market Condition: </span>
                    <span style={{ color: accentColor, fontWeight: '600' }}>{recommendation.condition || 'Volatile'}</span>.
                    {' '}{recommendation.message || 'Market is changing rapidly.'}
                </p> */}

                {recommendation.best_buy_time && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '6px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Best Buy Time</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary-green)' }}>{recommendation.best_buy_time}</span>
                    </div>
                )}

                {recommendation.best_sell_time && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>Best Sell Time</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#ef4444' }}>{recommendation.best_sell_time}</span>
                    </div>
                )}
            </div>

            {/* Button removed as requested */}
        </div>
    );
};

export default AIInsights;
