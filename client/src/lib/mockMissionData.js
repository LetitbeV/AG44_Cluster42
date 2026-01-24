/**
 * Mock Data for Mission & Market Impact Page
 */

export const getMissionData = () => {
    return {
        hero: {
            title: "Trading for a Sustainable Grid.",
            subtitle: "Advancing Grid Resilience",
            description: "Our core philosophy transcends simple arbitrage. We believe that battery storage is the heartbeat of the modern grid. By deploying sophisticated AI-driven trading strategies, we provide the essential liquidity and frequency response required to integrate 100% renewable energy sources safely and efficiently.",
            secondaryDescription: "Through real-time asset optimization, we reduce curtailment of wind and solar while enhancing grid resilience during extreme weather events, ensuring that sustainable energy is never wasted."
        },
        impactMetrics: [
            { label: "Storage Capacity", value: "1.2 GWh", subtext: "+ Mission Ready" },
            { label: "Carbon Offset", value: "420 kT", subtext: "CO2 Equivalent / Year" },
            { label: "Response Time", value: "< 200 ms", subtext: "Sub-second Grid Balancing" }
        ],
        marketInsights: [
            {
                icon: "grid",
                title: "Grid Stability Dynamics",
                description: "Traditional spinning reserves are being replaced by BESS (Battery Energy Storage Systems). Our algorithms maintain synthetic inertia, preventing cascading outages during sudden generation drops.",
                fact: "Batteries respond 100x faster than traditional gas peaker plants."
            },
            {
                icon: "roi",
                title: "Battery ROI & Revenue",
                description: "Wholesale price volatility has increased by 40% in high-renewable zones. Strategic cycling and multi-service stacking can accelerate asset payback periods by up to 3.5 years.",
                fact: "Ancillary services revenue now accounts for 65% of total BESS income in ERCOT."
            },
            {
                icon: "renewable",
                title: "Renewable Integration",
                description: "Curtailment costs the global economy billions. Intelligent trading allows for \"energy shifting\" - storing solar peak during noon and discharging at evening peak demand.",
                fact: "Storage reduces the need for transmission upgrades by up to 25%."
            },
            {
                icon: "ai",
                title: "AI & Algorithmic Edge",
                description: "Manual trading is no longer viable in sub-minute markets. Our ML models process 10k+ data points per node to predict price spikes with 94% historical accuracy.",
                fact: "Predictive dispatching reduces battery degradation by 15% annually."
            },
            {
                icon: "flexibility",
                title: "Distributed Flexibility",
                description: "The move from centralized to decentralized power requires virtual power plants (VPPs). We aggregate smaller assets into a formidable market participant.",
                fact: "VPPs can provide up to 20% of peak load capacity by 2030."
            },
            {
                icon: "regulation",
                title: "Regulatory Evolution",
                description: "New FERC orders are leveling the playing field for energy storage. We ensure assets are compliant with evolving ISO rules across all active nodes.",
                fact: "Active participation in 14 ISO/RTO regions globally."
            }
        ],
        cta: {
            title: "Access Pro-Grade Market Insights",
            subtitle: "Ready to optimize your energy storage portfolio with the industry's most advanced trading algorithms?",
            primaryButton: "Explore Dashboard",
            secondaryButton: "Request Technical Audit"
        }
    };
};
