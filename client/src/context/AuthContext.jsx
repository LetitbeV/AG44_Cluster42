import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Mock State initialized from storage or defaults
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('sm_auth') === 'true';
    });

    // Default to true for demo purposes if not set, but let's strictly follow flow: start logged out.
    // Actually, to show the flow, we should start as false.

    const [isFirstLogin, setIsFirstLogin] = useState(false);
    const [user, setUser] = useState({ name: '', email: '' });
    const [batteryConfig, setBatteryConfig] = useState(null);

    const login = async (email, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                setIsAuthenticated(true);
                setIsFirstLogin(true); // Always force first login flow for this demo request
                setUser({ name: 'Alex Rivera', email });
                localStorage.setItem('sm_auth', 'true');
                resolve();
            }, 800); // Fake delay
        });
    };

    const register = async (name, email, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                setIsAuthenticated(true);
                setIsFirstLogin(true);
                setUser({ name, email });
                localStorage.setItem('sm_auth', 'true');
                resolve();
            }, 1000);
        });
    };

    const logout = () => {
        setIsAuthenticated(false);
        setIsFirstLogin(false);
        setUser(null);
        localStorage.removeItem('sm_auth');
    };

    const completeOnboarding = (config) => {
        setBatteryConfig(config);
        setIsFirstLogin(false);
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isFirstLogin,
            user,
            batteryConfig,
            login,
            register,
            logout,
            completeOnboarding
        }}>
            {children}
        </AuthContext.Provider>
    );
};
