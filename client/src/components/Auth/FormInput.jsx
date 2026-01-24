import React from 'react';

const FormInput = ({ label, type, placeholder, value, onChange, icon: Icon }) => {
    return (
        <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#9ca3af', marginBottom: '0.5rem', letterSpacing: '0.5px' }}>
                {label.toUpperCase()}
            </label>
            <div style={{ position: 'relative' }}>
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    style={{
                        width: '100%',
                        backgroundColor: '#0a0a0a',
                        border: '1px solid #333',
                        borderRadius: '12px',
                        padding: '1rem',
                        paddingLeft: Icon ? '3rem' : '1rem',
                        color: '#fff',
                        fontSize: '1rem',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--primary-green)'}
                    onBlur={(e) => e.target.style.borderColor = '#333'}
                />
                {Icon && (
                    <Icon size={20} color="#6b7280" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                )}
            </div>
        </div>
    );
};

export default FormInput;
