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

        // Fetch Price Data
        const fetchPriceData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/prices');
                if (response.data && response.data.prices) {
                    const prices = response.data.prices;
                    setMarketData(prices);

                    // Calculate Peak Price from actual_price
                    const maxPrice = Math.max(...prices.map(p => p.actual_price || 0));

                    setDashboardData(prev => {
                        if (!prev) return null; // Wait for initial dashboard load
                        return {
                            ...prev,
                            market: {
                                ...prev.market,
                                peakPrice: maxPrice
                            }
                        };
                    });
                }
            } catch (error) {
                console.error("Failed to fetch price data", error);
            }
        };

        // Fetch Recommendations
        const fetchRecommendations = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/recommendations');
                if (response.data) {
                    setRecommendation(response.data);
                }
            } catch (error) {
                console.error("Failed to fetch recommendations", error);
            }
        };

        fetchPriceData();
        fetchRecommendations();
    }, []);

    const handleManualTrade = (data) => {
        // data contains { batteryState, transaction }
        if (data && data.batteryState && data.transaction) {
            const b = data.batteryState;
            const t = data.transaction;

            // Calculate SOC 
            const newSoc = (b.current_energy_kwh / b.effective_capacity_kwh) * 100;

            setDashboardData(prev => {
                const currentRevenue = prev.financials?.revenue || 0;
                const additionalRevenue = t.action === 'SELL' ? (t.units * t.price) : 0;

                const currentEnergy = prev.financials?.energyTraded || 0; // Corrected: Energy is in financials
                const currentPeak = prev.market?.peakPrice || 0;

                return {
                    ...prev,
                    financials: {
                        ...prev.financials,
                        revenue: currentRevenue + additionalRevenue,
                        energyTraded: currentEnergy + t.units
                    },
                    market: {
                        ...prev.market,
                        peakPrice: Math.max(currentPeak, t.price)
                    },
                    system: {
                        ...prev.system,
                        soc: newSoc,
                        rate: b.currentPower,
                        status: b.status,
                        temp: b.temperature,
                        cycles: b.cycle_count,
                        health: b.health
                    }
                };
            });
            console.log("Updated full dashboard state from trade:", data);
        } else {
            fetchDashboardData();
        }
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
                <MainChart data={marketData} recommendations={recommendation} />

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
