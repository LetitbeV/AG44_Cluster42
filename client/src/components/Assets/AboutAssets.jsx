import React from 'react';
import { Database, Zap } from 'lucide-react';

const AboutAssets = () => {
    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Database size={18} color="var(--primary-green)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Asset Information</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <h4 style={{ color: 'var(--primary-green)', marginBottom: '0.5rem' }}>BESS Unit #1</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Type: Lithium-Ion (LFP)</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Capacity: 13.5 kWh</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Max Output: 5 kW</p>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <h4 style={{ color: 'var(--primary-green)', marginBottom: '0.5rem' }}>Solar Array</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Location: Rooftop B</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Peak Power: 6.2 kW</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Azimuth: 180° (South)</p>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <h4 style={{ color: 'var(--primary-green)', marginBottom: '0.5rem' }}>Grid Connection</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Provider: City Power</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tariff: Time-of-Use</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Voltage: 240V / 60Hz</p>
                </div>
            </div>
        </div>
    );
};

export default AboutAssets;
