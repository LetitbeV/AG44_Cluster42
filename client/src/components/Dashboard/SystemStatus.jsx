import React from 'react';
import { Battery, Zap, Thermometer, RefreshCw } from 'lucide-react';

const SystemStatus = ({ batteryLevel, action }) => {
    return (
        <div className="glass-panel" style={{ padding: '1.5rem', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>System Status</h3>
                <div style={{ padding: '4px', backgroundColor: 'rgba(34, 197, 94, 0.2)', borderRadius: '4px' }}>
                    <Battery size={16} color="var(--primary-green)" />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>STATE OF CHARGE (SOC)</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1.1 }}>{Math.round(batteryLevel)}%</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>RATE</div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: action === 'DISCHARGE' ? '#ef4444' : 'var(--primary-green)' }}>
                        {action === 'CHARGE' ? '-5.2kW' : action === 'DISCHARGE' ? '5.2kW' : '0kW'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: action === 'DISCHARGE' ? '#ef4444' : 'var(--primary-green)' }}>
                        ({action === 'CHARGE' ? 'Charging' : action === 'DISCHARGE' ? 'Discharging' : 'Standby'})
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{
                width: '100%',
                height: '12px',
                backgroundColor: '#333',
                borderRadius: '6px',
                overflow: 'hidden',
                marginBottom: '1.5rem'
            }}>
                <div style={{
                    width: `${batteryLevel}%`,
                    height: '100%',
                    backgroundColor: 'var(--primary-green)',
                    boxShadow: '0 0 10px var(--primary-green)',
                    transition: 'width 0.5s ease-out'
                }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ backgroundColor: '#1a1a1a', padding: '0.75rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>TEMP</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                        <Thermometer size={16} /> 24.5°C
                    </div>
                </div>
                <div style={{ backgroundColor: '#1a1a1a', padding: '0.75rem', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>CYCLES</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                        <RefreshCw size={16} /> 1,248
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemStatus;
