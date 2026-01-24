import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatsGrid from './StatsGrid';
import MainChart from './MainChart';
import SystemStatus from './SystemStatus';
import AIInsights from './AIInsights';
import ManualTrade from '../Controls/ManualTrade';
import AboutAssets from '../Assets/AboutAssets';
import { generateMarketData, getAIRecommendation } from '../../lib/simulation';

const Dashboard = ({ isManualMode }) => {
    const [marketData, setMarketData] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [recommendation, setRecommendation] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDashboardData(response.data);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        }
    };

    useEffect(() => {
        // Initialize Simulation Data
        const data = generateMarketData();
        setMarketData(data);

        // Set initial Recommendation based on current mocked "now" price
        const currentPrice = data[12].price;
        setRecommendation(getAIRecommendation(currentPrice));

        fetchDashboardData();
    }, []);

    const handleManualTrade = ({ action, amount }) => {
        console.log(`Manual override: ${action} ${amount}kWh`);
        // Refresh dashboard data to see updated SOC, etc.
        fetchDashboardData();
    };

    if (!dashboardData) return <div style={{ padding: '2rem' }}>Loading Dashboard...</div>;

    return (
        <div>
            <StatsGrid
                financials={dashboardData.financials}
                market={dashboardData.market}
                system={dashboardData.system}
            />

            <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '1.5rem',
                minHeight: '400px',
                marginBottom: '1.5rem'
            }}>
                <MainChart data={marketData} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <SystemStatus system={dashboardData.system} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <AIInsights recommendation={recommendation} onExecute={() => alert('Strategy Executed!')} />
                    </div>
                </div>
            </div>

            {isManualMode && (
                <ManualTrade onTrade={handleManualTrade} />
            )}

            <AboutAssets />
        </div>
    );
};

export default Dashboard;
