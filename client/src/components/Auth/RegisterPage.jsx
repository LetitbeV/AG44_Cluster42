import React, { useState } from 'react';
import { Mail, Lock, User, RefreshCw } from 'lucide-react';
import AuthLayout from './AuthLayout';
import FormInput from './FormInput';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();

    const handleSubmit = async () => {
        await register(name, email, password);
    };

    return (
        <AuthLayout title="Shock Market" subtitle="The future of smart energy trading">
            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem' }}>Create Your Account</h2>

                <FormInput
                    label="Full Name"
                    type="text"
                    placeholder="Alex Rivera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    icon={User}
                />

                <FormInput
                    label="Email Address"
                    type="email"
                    placeholder="alex@energy.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    icon={Mail}
                />

                <FormInput
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    icon={Lock}
                />

                <FormInput
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={() => { }}
                    icon={RefreshCw}
                />

                {/* <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem', marginBottom: '2rem' }}>
                    <input type="checkbox" style={{ accentColor: 'var(--primary-green)', width: '16px', height: '16px', cursor: 'pointer', marginTop: '3px' }} />
                    <span style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: '1.4' }}>
                        I agree to the <span style={{ color: 'var(--primary-green)' }}>Terms of Service</span> and <span style={{ color: 'var(--primary-green)' }}>Privacy Policy</span>.
                    </span>
                </div> */}

                <button
                    onClick={handleSubmit}
                    style={{
                        width: '100%', padding: '1rem',
                        backgroundColor: 'var(--primary-green)', color: '#000',
                        border: 'none', borderRadius: '12px',
                        fontSize: '1rem', fontWeight: '800', cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)'
                    }}
                >
                    Create Account →
                </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Already have an account? </span>
                <Link to="/login" style={{ color: 'var(--primary-green)', fontWeight: '600', textDecoration: 'none' }}>Login here</Link>
            </div>
        </AuthLayout>
    );
};

export default RegisterPage;
