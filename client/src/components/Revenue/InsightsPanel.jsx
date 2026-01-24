import React from 'react';
import { Lightbulb, Calendar } from 'lucide-react';

const InsightsPanel = ({ data }) => {
    if (!data) return null;

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', height: '100%', minHeight: '300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Lightbulb size={20} color="var(--primary-green)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Strategic Insights</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Best Selling Window */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary-green)', letterSpacing: '0.5px' }}>BEST SELLING WINDOW</span>
                        <span style={{ fontSize: '0.7rem', padding: '2px 8px', backgroundColor: 'var(--primary-green)', color: '#000', borderRadius: '4px', fontWeight: '700' }}>ACTIVE</span>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                        {data.bestSellingWindow.period}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        {data.bestSellingWindow.description}
                    </p>
                </div>

                {/* Most Profitable Period */}
                <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', letterSpacing: '0.5px' }}>MOST PROFITABLE PERIOD</span>
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                        {data.mostProfitablePeriod.day}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        {data.mostProfitablePeriod.description}
                    </p>
                </div>

                {/* Volatility Forecast Placeholder */}
                <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', letterSpacing: '0.5px' }}>VOLATILITY FORECAST</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '4px' }}>
                        <span>Next 24h</span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: i < 4 ? 'var(--primary-green)' : '#333' }}></div>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                        <span>Weekend</span>
                        <div style={{ display: 'flex', gap: '2px' }}>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: i < 2 ? 'var(--primary-green)' : '#333' }}></div>
                            ))}
                        </div>
                    </div>

                    <button style={{
                        width: '100%',
                        marginTop: '1.5rem',
                        padding: '0.75rem',
                        backgroundColor: '#1e293b',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                    }}>
                        View Full Strategy Report
                    </button>
                </div>

            </div>
        </div>
    );
};

export default InsightsPanel;
