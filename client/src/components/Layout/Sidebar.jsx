import React from 'react';
import { LayoutDashboard, History, Zap, BarChart, Settings, LogOut, User, IndianRupee } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: History, label: 'Trade History', path: '/history' },
        { icon: Zap, label: 'Mission & Insights', path: '/mission' },
        { icon: IndianRupee, label: 'Revenue', path: '/revenue' },
        { icon: BarChart, label: 'Market Analysis', path: '/market' },
    ];

    const handleLogout = () => {
        // Clear Local Storage
        localStorage.clear();
        sessionStorage.clear();

        // Clear Cookies
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });

        // Redirect to Login
        window.location.href = '/login';
    };

    return (
        <aside style={{
            width: '260px',
            height: '100vh',
            padding: '2rem',
            backgroundColor: '#0d0d0d',
            borderRight: '1px solid var(--glass-border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
        }}>
            <div>
                {/* Logo area */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: 'var(--primary-green)',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 15px var(--primary-green-glow)'
                    }}>
                        <Zap size={24} color="#000" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.2rem', fontWeight: '800', lineHeight: 1 }}>EnergyTrade</h1>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>SYSTEM ONLINE</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {navItems.map((item, index) => {
                        const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
                        return (
                            <Link key={index} to={item.path} style={{ textDecoration: 'none' }}>
                                <button style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    padding: '1rem',
                                    backgroundColor: isActive ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                                    color: isActive ? 'var(--primary-green)' : 'var(--text-muted)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'left',
                                    fontWeight: isActive ? '600' : '500'
                                }}>
                                    <item.icon size={20} />
                                    {item.label}
                                </button>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* User Profile */}
            <div className="glass-panel" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={20} color="#fff" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>Cluster42</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Prosumer Plan</div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                    }}>
                    <LogOut size={16} /> Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
