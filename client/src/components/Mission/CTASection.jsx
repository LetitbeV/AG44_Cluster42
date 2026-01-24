import React from 'react';

const CTASection = ({ cta }) => {
    return (
        <div className="glass-panel" style={{
            padding: '5rem',
            textAlign: 'center',
            background: 'linear-gradient(180deg, rgba(13,13,13,0) 0%, rgba(34, 197, 94, 0.05) 100%)',
            border: '1px solid #222'
        }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem' }}>{cta.title}</h2>
            <p style={{ fontSize: '1.1rem', color: '#9ca3af', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
                {cta.subtitle}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
                <button style={{
                    padding: '1rem 2rem',
                    backgroundColor: 'var(--primary-green)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)'
                }}>
                    {cta.primaryButton}
                </button>

                <button style={{
                    padding: '1rem 2rem',
                    backgroundColor: 'transparent',
                    color: '#fff',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                }}>
                    {cta.secondaryButton}
                </button>
            </div>
        </div>
    );
};

export default CTASection;
