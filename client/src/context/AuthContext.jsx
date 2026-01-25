import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });

            // Assuming backend returns user data and token
            const { user, token } = response.data;

            setIsAuthenticated(true);
            setIsFirstLogin(false); // Login implies returning user, usually
            setUser(user || { email }); // Fallback if user object isn't full
            localStorage.setItem('sm_auth', 'true');
            if (token) localStorage.setItem('token', token);
            return response.data;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, {
                name,
                email,
                password
            });

            // Assuming backend returns user data and token
            const { user, token } = response.data;

            setIsAuthenticated(true);
            setIsFirstLogin(true);
            setUser(user || { name, email });
            localStorage.setItem('sm_auth', 'true');
            if (token) localStorage.setItem('token', token);
            return response.data;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setIsFirstLogin(false);
        setUser(null);
        localStorage.removeItem('sm_auth');
        localStorage.removeItem('token');
    };

    const completeOnboarding = (config) => {
        setBatteryConfig(config);
        setIsFirstLogin(false);
    };

    const setupBattery = async (config) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_URL}/battery`, config, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setBatteryConfig(config);
            setIsFirstLogin(false);
            return response.data;
        } catch (error) {
            console.error('Battery setup failed:', error);
            throw error;
        }
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
            completeOnboarding,
            setupBattery
        }}>
            {children}
        </AuthContext.Provider>
    );
};
