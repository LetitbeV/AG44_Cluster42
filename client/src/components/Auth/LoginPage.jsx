import React, { useState } from 'react';
import { Mail, Lock, ScanLine } from 'lucide-react';
import AuthLayout from './AuthLayout';
import FormInput from './FormInput';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async () => {
        setError('');
        setIsLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout title="Shock Market" subtitle="Smart Energy & Battery Trading">
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>Welcome Back</h2>

                <FormInput
                    label="Email Address"
                    type="email"
                    placeholder="name@energy.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={Mail}
                />

                {error && (
                    <div style={{
                        color: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#9ca3af', letterSpacing: '0.5px' }}>PASSWORD</label>
                        <span style={{ fontSize: '0.8rem', color: '#3b82f6', cursor: 'pointer' }}>Forgot Password?</span>
                    </div>
                    <FormInput
                        label="" // Handled custom label above
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        icon={Lock}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                    <input type="checkbox" style={{ accentColor: 'var(--primary-green)', width: '16px', height: '16px', cursor: 'pointer' }} />
                    <span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>Remember this device</span>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    style={{
                        width: '100%', padding: '1rem',
                        backgroundColor: isLoading ? '#374151' : 'var(--primary-green)',
                        color: isLoading ? '#9ca3af' : '#000',
                        border: 'none', borderRadius: '12px',
                        fontSize: '1rem', fontWeight: '800',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        marginBottom: '2rem',
                        boxShadow: isLoading ? 'none' : '0 0 20px rgba(34, 197, 94, 0.4)',
                        transition: 'all 0.2s ease'
                    }}
                >
                    {isLoading ? 'LoGGIN IN...' : 'LOGIN →'}
                </button>

                <div style={{ borderTop: '1px solid #333', margin: '0 -2rem 1.5rem -2rem' }}></div>

                <div style={{ textAlign: 'center' }}>
                    <button style={{
                        background: 'none', border: 'none', color: '#e5e5e5',
                        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                        fontSize: '0.9rem', cursor: 'pointer', opacity: 0.8
                    }}>
                        <ScanLine size={20} /> Login with Face ID
                    </button>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Don't have an account? </span>
                <Link to="/register" style={{ color: 'var(--primary-green)', fontWeight: '600', textDecoration: 'none' }}>Create Account</Link>
            </div>
        </AuthLayout>
    );
};

export default LoginPage;
