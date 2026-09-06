import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { RiskMapPage } from './pages/RiskMapPage';
import { RiskDetailsPage } from './pages/RiskDetailsPage';
import {
  AlertsPlaceholder,
  ReportsPlaceholder,
  InventoryPlaceholder,
} from './pages/Placeholders';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/map" element={<RiskMapPage />} />
          <Route path="/risk-map" element={<RiskMapPage />} />
          <Route path="/risk-details" element={<RiskDetailsPage />} />
          <Route path="/alerts" element={<AlertsPlaceholder />} />
          <Route path="/reports" element={<ReportsPlaceholder />} />
          <Route path="/inventory" element={<InventoryPlaceholder />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
