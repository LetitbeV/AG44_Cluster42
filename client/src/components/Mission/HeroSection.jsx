import React from 'react';

const HeroSection = ({ hero }) => {
    return (
        <div style={{ padding: '0 0 4rem 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
                {/* Placeholder Image (Industrial / Energy theme) */}
                <div style={{
                    height: '400px',
                    backgroundColor: '#1f2937',
                    borderRadius: '24px',
                    backgroundImage: 'linear-gradient(45deg, #111 0%, #222 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #333',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    {/* Abstract grid lines overlay */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        backgroundImage: 'linear-gradient(rgba(34, 197, 94, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 197, 94, 0.05) 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}></div>

                    {/* Mock Industrial Silhouette */}
                    <div style={{ position: 'relative', textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem', filter: 'grayscale(100%) opacity(0.5)' }}>🏭⚡🔋</div>
                        <div style={{ color: '#6b7280', fontSize: '0.9rem', letterSpacing: '2px' }}>ENERGY INFRASTRUCTURE</div>
                    </div>
                </div>

                {/* Text Content */}
                <div>
                    <div style={{
                        fontSize: '0.75rem', fontWeight: '700',
                        color: 'var(--primary-green)', letterSpacing: '1px',
                        marginBottom: '1rem', textTransform: 'uppercase'
                    }}>
                        {hero.subtitle}
                    </div>
                    <h1 style={{
                        fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.1',
                        marginBottom: '2rem', letterSpacing: '-1px'
                    }}>
                        Trading for a <br />
                        <span style={{ color: 'var(--primary-green)' }}>Sustainable Grid.</span>
                    </h1>
                    <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#e5e5e5', marginBottom: '2rem' }}>
                        {hero.description}
                    </p>
                    <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#9ca3af' }}>
                        {hero.secondaryDescription}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
