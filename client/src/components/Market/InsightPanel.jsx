import React from 'react';
import { TrendingUp, Activity, Sparkles, ExternalLink } from 'lucide-react';

const InsightCard = ({ title, description, badge, badgeColor, icon: Icon, isButton }) => (
    <div style={{ backgroundColor: '#151515', padding: '1.25rem', borderRadius: '12px', marginBottom: '1rem', border: '1px solid #222' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {Icon && <Icon size={16} color="var(--primary-green)" />}
            <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>{title}</h4>
            {badge && (
                <span style={{
                    fontSize: '0.65rem', fontWeight: '700',
                    backgroundColor: badgeColor || '#333', color: '#000',
                    padding: '2px 6px', borderRadius: '4px', marginLeft: 'auto'
                }}>
                    {badge}
                </span>
            )}
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            {description}
            {/* Highlighting specific keywords manually based on mock data logic would be here */}
            {description.includes('high wind') && <span style={{ color: '#fff', fontWeight: '600' }}> high wind generation.</span>}
        </p>

        {isButton && (
            <button style={{
                width: '100%', marginTop: '1rem',
                backgroundColor: 'var(--primary-green)', color: '#000',
                border: 'none', padding: '0.75rem', borderRadius: '8px',
                fontWeight: '700', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
            }}>
                View Detailed Report <ExternalLink size={14} />
            </button>
        )}
    </div>
);

const InsightPanel = ({ insights }) => {
    return (
        <div className="glass-panel" style={{ padding: '1.5rem', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Activity size={20} color="var(--primary-green)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', lineHeight: 1 }}>Market<br />Analysis</h3>
            </div>

            <InsightCard
                title="Current Trend"
                description={insights.trend.description}
                badge="CURRENT TREND" badgeColor="var(--primary-green)"
                icon={TrendingUp}
            />

            <InsightCard
                title="Strategy Alert"
                description={insights.strategy.description}
                badge={insights.strategy.action} badgeColor="#fbbf24"
            />

            <InsightCard
                title="AI-Analyst Tip"
                description={`"${insights.tip.description}"`}
                icon={Sparkles}
                isButton={true}
            />
        </div>
    );
};

export default InsightPanel;
