import React from 'react';
import { Zap } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle }) => {
    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 50% 10%, #0d0d0d 0%, #000 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Ambient background glow */}
            <div style={{
                position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
                width: '600px', height: '600px',
                background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)',
                filter: 'blur(100px)', zIndex: 0
            }}></div>

            <div style={{ zIndex: 1, width: '100%', maxWidth: '420px', padding: '1rem' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                        marginBottom: '1rem'
                    }}>
                        <div style={{ padding: '2px 8px', borderRadius: '999px', border: '1px solid rgba(34, 197, 94, 0.3)', backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary-green)', display: 'inline-block', marginRight: '6px' }}></div>
                            <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--primary-green)' }}>GRID ONLINE</span>
                        </div>
                    </div>

                    <div style={{
                        width: '64px', height: '64px',
                        backgroundColor: 'var(--primary-green)',
                        borderRadius: '16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem auto',
                        boxShadow: '0 0 30px var(--primary-green-glow)'
                    }}>
                        <Zap size={32} color="#000" fill="#000" />
                    </div>

                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>{title}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>{subtitle}</p>
                </div>

                {children}

                <footer style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontSize: '0.75rem', color: '#4b5563' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--primary-green)' }}></div>
                            GRID STATUS: SYNCED
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--primary-green)' }}></div>
                            SECURE TLS 1.3
                        </span>
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.7rem', color: '#333' }}>
                        © 2024 ShockMarket Systems Inc.
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AuthLayout;
