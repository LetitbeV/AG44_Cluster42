import React from 'react';
import { Grid, TrendingUp, Leaf, Cpu, GitMerge, ShieldCheck, Zap } from 'lucide-react';

const icons = {
    grid: Grid,
    roi: TrendingUp,
    renewable: Leaf,
    ai: Cpu,
    flexibility: GitMerge,
    regulation: ShieldCheck
};

const MarketAnalysisGrid = ({ insights }) => {
    return (
        <div style={{ marginBottom: '6rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
                <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary-green)', letterSpacing: '1px', marginBottom: '0.5rem' }}>SECTOR INSIGHTS</div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '700' }}>Market Impact Analysis</h2>
                </div>
                <div style={{ maxWidth: '400px', textAlign: 'right', color: '#9ca3af', fontSize: '0.9rem', lineHeight: '1.5' }}>
                    Data-driven perspectives on how battery optimization is reshaping global wholesale electricity markets.
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                {insights.map((item, index) => {
                    const Icon = icons[item.icon] || Zap;
                    return (
                        <div key={index} style={{
                            padding: '2rem',
                            backgroundColor: '#0a0a0a',
                            border: '1px solid #222',
                            borderRadius: '16px',
                            transition: 'all 0.3s',
                            cursor: 'default'
                        }}>
                            <div style={{
                                width: '40px', height: '40px',
                                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                borderRadius: '8px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                marginBottom: '1.5rem'
                            }}>
                                <Icon size={20} color="var(--primary-green)" />
                            </div>

                            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem' }}>{item.title}</h3>

                            <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#9ca3af', marginBottom: '2rem', flex: 1 }}>
                                {item.description}
                            </p>

                            <div style={{ borderTop: '1px solid #222', paddingTop: '1rem' }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary-green)', marginBottom: '0.5rem' }}>
                                    {item.title.includes('ROI') ? 'MARKET DATA:' : item.title.includes('Regulatory') ? 'POLICY:' : item.title.includes('Flexibility') ? 'SCALE:' : item.title.includes('AI') ? 'TECHNOLOGY:' : item.title.includes('Renewable') ? 'IMPACT:' : 'FACT:'}
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#e5e5e5', lineHeight: '1.4' }}>
                                    {item.fact}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MarketAnalysisGrid;
