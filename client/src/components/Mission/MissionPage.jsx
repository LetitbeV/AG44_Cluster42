import React, { useEffect, useState } from 'react';
import HeroSection from './HeroSection';
import ImpactMetrics from './ImpactMetrics';
import MarketAnalysisGrid from './MarketAnalysisGrid';
import CTASection from './CTASection';
import { getMissionData } from '../../lib/mockMissionData';

const MissionPage = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
        setData(getMissionData());
    }, []);

    if (!data) return <div style={{ padding: '2rem' }}>Loading Insights...</div>;

    return (
        <div>
            {/* Top Status Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '1px solid #222', paddingBottom: '1.5rem' }}>
                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>Mission & Market Impact</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '999px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--primary-green)' }}></div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--primary-green)' }}>LIVE INSIGHTS</span>
                </div>
            </div>

            <HeroSection hero={data.hero} />
            <ImpactMetrics metrics={data.impactMetrics} />
            <MarketAnalysisGrid insights={data.marketInsights} />
            <CTASection cta={data.cta} />

            <footer style={{ marginTop: '6rem', borderTop: '1px solid #222', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', color: '#6b7280', fontSize: '0.8rem' }}>
                <div>© 2024 EnergyTrade Solutions Inc.</div>
                <div style={{ display: 'flex', gap: '2rem' }}>
                    <span>PRIVACY POLICY</span>
                    <span>TERMS OF SERVICE</span>
                    <span>SECURITY PROTOCOLS</span>
                </div>
            </footer>
        </div>
    );
};

export default MissionPage;
