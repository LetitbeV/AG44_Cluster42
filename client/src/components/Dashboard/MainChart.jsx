import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

const MainChart = ({ data, recommendations }) => {
    // Helper to format "HH:MM" to "YYYY-MM-DD HH:MM:00" matching data timestamp
    const formatRefTime = (timeStr) => {
        if (!recommendations || !recommendations.forecast_date) return null;
        return `${recommendations.forecast_date} ${timeStr}:00`;
    };

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', height: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Electricity Market Price vs. Battery Level</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Automated trades based on AI forecasting</p>
                </div>

                {/* Legend / Status indicators */}
                {/* <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary-green)' }}></div>
                        OPTIMAL BUY ZONE
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                        OPTIMAL SELL ZONE
                    </div>
                </div> */}
            </div>

            <div style={{ flex: 1, width: '100%', minHeight: '300px', minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="timestamp"
                            stroke="#6b7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            interval={7} // Show every 8th data point (2 hours if 15m intervals)
                            tickFormatter={(str) => {
                                const date = new Date(str);
                                return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
                            }}
                        />
                        <YAxis
                            label={{ value: 'Price ($/MWh)', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 10 }}
                            stroke="#6b7280"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px' }}
                            itemStyle={{ fontSize: '12px' }}
                            labelStyle={{ fontSize: '12px', color: '#9ca3af', marginBottom: '5px' }}
                            labelFormatter={(label) => new Date(label).toLocaleString()}
                        />

                        {recommendations && recommendations.buy_windows && recommendations.buy_windows.map((window, i) => (
                            <ReferenceArea
                                key={`buy-${i}`}
                                x1={formatRefTime(window.start_time)}
                                x2={formatRefTime(window.end_time)}
                                yAxisId="left"
                                fill="var(--primary-green)"
                                fillOpacity={0.3}
                            />
                        ))}

                        {recommendations && recommendations.sell_windows && recommendations.sell_windows.map((window, i) => (
                            <ReferenceArea
                                key={`sell-${i}`}
                                x1={formatRefTime(window.start_time)}
                                x2={formatRefTime(window.end_time)}
                                yAxisId="left"
                                fill="#ef4444"
                                fillOpacity={0.3}
                            />
                        ))}

                        <Area
                            type="monotone"
                            dataKey="actual_price"
                            stroke="var(--primary-green)"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorActual)"
                            name="Actual Price"
                        />
                        <Area
                            type="monotone"
                            dataKey="predicted_price"
                            stroke="#3b82f6" // Blue for prediction
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorPredicted)"
                            name="Predicted Price"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MainChart;
