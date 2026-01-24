import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, CheckSquare, Square } from 'lucide-react';

const CalendarUI = () => {
    // Hardcoded visual representation of the calendar from the mockup
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const dates = [
        28, 29, 30, 1, 2, 3, 4,
        5, 6, 7, 8, 9, 10, 11,
        12, 13, 14, 15, 16, 17
    ];

    // Quick visual hack for selected range (mockup shows 5-10 selected)
    const isSelected = (d) => d >= 5 && d <= 10;

    return (
        <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Select Date Range</span>
                <span style={{ color: 'var(--primary-green)', fontSize: '0.8rem', cursor: 'pointer' }}>Reset</span>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid #333' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '0 0.5rem' }}>
                    <ChevronLeft size={16} color="#9ca3af" cursor="pointer" />
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', letterSpacing: '1px' }}>OCTOBER 2023</span>
                    <ChevronRight size={16} color="#9ca3af" cursor="pointer" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', gap: '5px' }}>
                    {days.map(d => (
                        <div key={d} style={{ fontSize: '0.7rem', color: '#6b7280', marginBottom: '5px' }}>{d}</div>
                    ))}
                    {dates.map((d, i) => (
                        <div key={i} style={{
                            fontSize: '0.8rem',
                            padding: '6px',
                            borderRadius: '50%',
                            color: isSelected(d) ? '#000' : (i < 3 ? '#4b5563' : '#e5e5e5'),
                            backgroundColor: isSelected(d) ? 'var(--primary-green)' : 'transparent',
                            cursor: 'pointer'
                        }}>
                            {d}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const FilterPanel = ({ assets }) => {
    return (
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
            <CalendarUI />

            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
                <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Asset Filter</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {assets.map(asset => (
                        <div key={asset.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                            {asset.checked ?
                                <div style={{ backgroundColor: 'var(--primary-green)', borderRadius: '4px', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <CheckSquare size={14} color="#000" />
                                </div>
                                : <Square size={18} color="#6b7280" />
                            }
                            <span style={{ fontSize: '0.9rem', color: asset.checked ? '#fff' : '#9ca3af' }}>{asset.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;
