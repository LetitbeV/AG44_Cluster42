import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

const PriceActionChart = ({ data }) => {
    // Helper to find zones for ReferenceArea
    const zones = [];
    let currentZone = null;

    data.forEach((point, index) => {
        if (point.zone !== 'NEUTRAL') {
            if (!currentZone || currentZone.type !== point.zone) {
                if (currentZone) zones.push(currentZone); // Close prev
                currentZone = { type: point.zone, start: point.time, end: point.time };
            } else {
                currentZone.end = point.time; // Extend
            }
        } else {
            if (currentZone) {
                zones.push(currentZone);
                currentZone = null;
            }
        }
    });
    if (currentZone) zones.push(currentZone);


    return (
        <div className="glass-panel" style={{ padding: '1.5rem', height: '100%', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Electricity Price Action (Buy/Sell Zones)</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Overlaying battery storage profitability windows</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '2px solid var(--primary-green)' }}></div>
                        Charge Zone
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '2px solid #ef4444' }}></div>
                        Discharge Zone
                    </div>
                </div>
            </div>

            <div style={{ flex: 1, width: '100%', minHeight: '300px', minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} interval={3} />
                        <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} unit="$" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ fontSize: '12px' }}
                        />

                        {/* Background Zones */}
                        {zones.map((zone, i) => (
                            <ReferenceArea
                                key={i}
                                x1={zone.start}
                                x2={zone.end}
                                fill={zone.type === 'CHARGE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}
                            />
                        ))}

                        {/* Explicit Labels for Zones (Mockup style) */}
                        <ReferenceArea x1="05:00" x2="08:00" y1={35} y2={40} fill="transparent" label={{ value: "OPTIMAL CHARGE", fill: "#fff", fontSize: 10, fontWeight: "bold", position: 'inside', backgroundColor: 'var(--primary-green)', padding: 4 }} />
                        <ReferenceArea x1="18:00" x2="20:00" y1={48} y2={52} fill="transparent" label={{ value: "PROFIT PEAK", fill: "#fff", fontSize: 10, fontWeight: "bold", position: 'inside', backgroundColor: '#ef4444' }} />


                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="var(--primary-green)"
                            strokeWidth={3}
                            fill="url(#colorPrice)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default PriceActionChart;
