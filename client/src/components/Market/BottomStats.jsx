import React from 'react';
import { Leaf, Activity, Wallet } from 'lucide-react';

const BottomStats = ({ stats }) => {
    return (
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
            {/* Grid Stability */}
            <div className="glass-panel" style={{ flex: 1, padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Activity size={18} color="var(--primary-green)" />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Grid Stability Index</h4>
                </div>
                {/* Progress Bar */}
                <div style={{ width: '100%', height: '8px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                    <div style={{ width: `${stats.gridStability.value}%`, height: '100%', backgroundColor: 'var(--primary-green)' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Normal Range</span>
                    <span style={{ color: 'var(--primary-green)', fontWeight: '600' }}>{stats.gridStability.value}% Stable</span>
                </div>
            </div>

            {/* Renewable Mix */}
            <div className="glass-panel" style={{ flex: 1, padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <Leaf size={18} color="var(--primary-green)" />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Renewable Mix</h4>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center' }}>
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{stats.renewableMix.wind}%</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wind</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{stats.renewableMix.solar}%</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Solar</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>{stats.renewableMix.other}%</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Other</div>
                    </div>
                </div>
            </div>

            {/* Est Daily P&L */}
            <div className="glass-panel" style={{ flex: 1, padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Wallet size={18} color="var(--primary-green)" />
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '700' }}>Est. Daily P&L</h4>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-green)' }}>
                        +₹{stats.estimatedPnL.value.toLocaleString()}
                    </div>
                    <span style={{
                        fontSize: '0.75rem', fontWeight: '700',
                        backgroundColor: 'rgba(34, 197, 94, 0.2)', color: 'var(--primary-green)',
                        padding: '2px 6px', borderRadius: '4px'
                    }}>
                        +{stats.estimatedPnL.change}%
                    </span>
                </div>
            </div>

        </div>
    );
};

export default BottomStats;
