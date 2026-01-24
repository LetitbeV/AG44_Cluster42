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

            <div style={{
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
                    RECOMMENDATION: {recommendation.type}
                </span>
                <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>
                    Confidence: {recommendation.confidence}%
                </span>
            </div>

            <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.9rem', lineHeight: '1.5', color: '#e5e5e5' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Market Condition: </span>
                    <span style={{ color: accentColor, fontWeight: '600' }}>{recommendation.condition}</span>.
                    {' '}{recommendation.message}
                </p>
            </div>

            <button
                onClick={onExecute}
                style={{
                    width: '100%',
                    marginTop: '1.5rem',
                    backgroundColor: 'var(--primary-green)',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#000',
                    boxShadow: '0 0 15px var(--primary-green-glow)'
                }}
            >
                Execute Strategy
            </button>
        </div>
    );
};

export default AIInsights;
