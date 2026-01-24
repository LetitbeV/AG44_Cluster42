import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar'
import TopBar from './components/Layout/TopBar'
import Dashboard from './components/Dashboard/Dashboard'
import RevenuePage from './components/Revenue/RevenuePage'
import TradeHistoryPage from './components/TradeHistory/TradeHistoryPage'
import MarketPage from './components/Market/MarketPage'
import MissionPage from './components/Mission/MissionPage'
import LoginPage from './components/Auth/LoginPage'
import RegisterPage from './components/Auth/RegisterPage'
import BatterySetupModal from './components/Auth/BatterySetupModal'
import { AuthProvider, useAuth } from './context/AuthContext'
import './index.css'

const AppContent = () => {
  const { isAuthenticated, isFirstLogin, completeOnboarding } = useAuth();
  const [isManualMode, setIsManualMode] = useState(false);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      {isFirstLogin && <BatterySetupModal onComplete={completeOnboarding} />}
      <Sidebar />
      <main className="main-content">
        <TopBar isManualMode={isManualMode} onToggleMode={() => setIsManualMode(!isManualMode)} />
        <div style={{ marginTop: '2rem' }}>
          <Routes>
            <Route path="/" element={<Dashboard isManualMode={isManualMode} />} />
            <Route path="/revenue" element={<RevenuePage />} />
            <Route path="/history" element={<TradeHistoryPage />} />
            <Route path="/market" element={<MarketPage />} />
            <Route path="/mission" element={<MissionPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
