import React, { useState } from 'react';
import { Battery, Zap } from 'lucide-react';

const BatterySetupModal = ({ onComplete }) => {
    const [capacity, setCapacity] = useState('');
    const [chargeRate, setChargeRate] = useState('');
    const [chargeEff, setChargeEff] = useState('');
    const [dischargeRate, setDischargeRate] = useState('');
    const [dischargeEff, setDischargeEff] = useState('');

    const handleComplete = () => {
        onComplete({
            capacity,
            chargeRate,
            chargeEff,
            dischargeRate,
            dischargeEff
        });
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                width: '100%', maxWidth: '450px',
                backgroundColor: '#0a0a0a', border: '1px solid #333', borderRadius: '24px',
                padding: '2rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '48px', height: '48px',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem auto'
                    }}>
                        <Battery size={24} color="var(--primary-green)" />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Set Up Your Asset</h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        Configure your battery parameters to allow our AI to optimize your energy trading.
                    </p>
                </div>

                {/* Capacity */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
                        TOTAL BATTERY CAPACITY
                    </label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="number"
                            value={capacity}
                            onChange={(e) => setCapacity(e.target.value)}
                            placeholder="e.g. 13.5"
                            style={{
                                width: '100%', backgroundColor: '#151515', border: '1px solid #333', borderRadius: '12px',
                                padding: '1rem', color: '#fff', fontSize: '1rem', outline: 'none'
                            }}
                        />
                        <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>kWh</span>
                    </div>
                </div>

                {/* Grid for Rates & Efficiency */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    {/* Charging Rate */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', marginBottom: '0.5rem' }}>
                            CHARGING RATE
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="number"
                                value={chargeRate}
                                onChange={(e) => setChargeRate(e.target.value)}
                                placeholder="5.0"
                                style={{
                                    width: '100%', backgroundColor: '#151515', border: '1px solid #333', borderRadius: '12px',
                                    padding: '1rem', color: '#fff', fontSize: '1rem', outline: 'none'
                                }}
                            />
                            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>kW</span>
                        </div>
                    </div>
                    {/* Charging Efficiency */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', marginBottom: '0.5rem' }}>
                            CHG EFFICIENCY
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="number"
                                value={chargeEff}
                                onChange={(e) => setChargeEff(e.target.value)}
                                placeholder="95"
                                style={{
                                    width: '100%', backgroundColor: '#151515', border: '1px solid #333', borderRadius: '12px',
                                    padding: '1rem', color: '#fff', fontSize: '1rem', outline: 'none'
                                }}
                            />
                            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>%</span>
                        </div>
                    </div>

                    {/* Discharging Rate */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', marginBottom: '0.5rem' }}>
                            DISCHARGE RATE
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="number"
                                value={dischargeRate}
                                onChange={(e) => setDischargeRate(e.target.value)}
                                placeholder="5.0"
                                style={{
                                    width: '100%', backgroundColor: '#151515', border: '1px solid #333', borderRadius: '12px',
                                    padding: '1rem', color: '#fff', fontSize: '1rem', outline: 'none'
                                }}
                            />
                            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>kW</span>
                        </div>
                    </div>
                    {/* Discharging Efficiency */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#6b7280', marginBottom: '0.5rem' }}>
                            DIS EFFICIENCY
                        </label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="number"
                                value={dischargeEff}
                                onChange={(e) => setDischargeEff(e.target.value)}
                                placeholder="95"
                                style={{
                                    width: '100%', backgroundColor: '#151515', border: '1px solid #333', borderRadius: '12px',
                                    padding: '1rem', color: '#fff', fontSize: '1rem', outline: 'none'
                                }}
                            />
                            <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}>%</span>
                        </div>
                    </div>
                </div>


                <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', gap: '0.75rem' }}>
                    <Zap size={20} color="var(--primary-green)" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: '0.8rem', color: '#d1d5db', lineHeight: '1.4' }}>
                        Accurate technical specs allow our AI to calculate precise charge/discharge windows and minimize degradation.
                    </p>
                </div>

                <button
                    onClick={handleComplete}
                    style={{
                        width: '100%', padding: '1rem',
                        backgroundColor: 'var(--primary-green)', color: '#000',
                        border: 'none', borderRadius: '12px',
                        fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
                        marginBottom: '1rem'
                    }}
                >
                    Complete Setup
                </button>
                <button
                    onClick={() => onComplete(null)}
                    style={{
                        width: '100%', padding: '0.5rem',
                        backgroundColor: 'transparent', color: '#6b7280',
                        border: 'none', fontSize: '0.9rem', cursor: 'pointer'
                    }}
                >
                    Maybe later
                </button>

            </div>
        </div>
    );
};

export default BatterySetupModal;
