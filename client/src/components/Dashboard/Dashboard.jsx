import React, { useEffect, useState } from 'react';
import StatsGrid from './StatsGrid';
import MainChart from './MainChart';
import SystemStatus from './SystemStatus';
import AIInsights from './AIInsights';
import ManualTrade from '../Controls/ManualTrade';
import AboutAssets from '../Assets/AboutAssets';
import { generateMarketData, getAIRecommendation } from '../../lib/simulation';

const Dashboard = ({ isManualMode }) => {
    const [marketData, setMarketData] = useState([]);
    const [currentStatus, setCurrentStatus] = useState({
        batteryLevel: 75,
        action: 'DISCHARGE'
    });
    const [recommendation, setRecommendation] = useState(null);

    useEffect(() => {
        // Initialize Simulation Data
        const data = generateMarketData();
        setMarketData(data);

        // Set initial Recommendation based on current mocked "now" price
        const currentPrice = data[12].price; // Mocking mid-day
        setRecommendation(getAIRecommendation(currentPrice));

    }, []);

    const handleManualTrade = ({ action, amount }) => {
        console.log(`Manual override: ${action} ${amount}kWh`);
        // In a real app, this would dispatch to backend
    };

    return (
        <div>
            <StatsGrid />

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
                        <SystemStatus batteryLevel={currentStatus.batteryLevel} action={currentStatus.action} />
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
