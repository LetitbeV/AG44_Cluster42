import React from 'react';

const ImpactMetrics = ({ metrics }) => {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '6rem' }}>
            {metrics.map((metric, index) => (
                <div key={index} className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#9ca3af', letterSpacing: '0.5px' }}>
                        {metric.label.toUpperCase()}
                    </div>

                    <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff', lineHeight: 1 }}>
                        {metric.value.split(" ").map((part, i) => (
                            <span key={i} style={{ color: i === 1 ? 'var(--primary-green)' : 'inherit' }}>{part} </span>
                        ))}
                    </div>

                    <div style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {metric.subtext.includes('+') && <span style={{ color: 'var(--primary-green)' }}>+</span>}
                        {metric.subtext.replace('+', '')}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ImpactMetrics;
