import React from 'react';
import { Zap, Activity } from 'lucide-react';

const TopBar = ({ isManualMode, onToggleMode }) => {
    return (
        <header style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
        }}>
            <div>
                <h2 style={{ fontSize: '2rem', fontWeight: '700' }}>Market Overview</h2>
                <p style={{ color: 'var(--text-muted)' }}>Real-time battery management and wholesale insights</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="grid-synced-indicator">
                    <Activity size={16} />
                    GRID SYNCED
                </div>

                <button
                    onClick={onToggleMode}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1.5rem',
                        backgroundColor: isManualMode ? 'var(--primary-green)' : 'rgba(255,255,255,0.05)',
                        border: isManualMode ? 'none' : '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        color: isManualMode ? '#000' : 'var(--text-primary)',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: isManualMode ? '0 0 20px var(--primary-green-glow)' : 'none'
                    }}
                >
                    <Zap size={18} fill={isManualMode ? "#000" : "none"} />
                    {isManualMode ? 'Manual Override Active' : 'Enable Manual Override'}
                </button>
            </div>
        </header>
    );
};

export default TopBar;
