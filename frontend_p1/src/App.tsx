import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import {
  DashboardPlaceholder,
  MapPlaceholder,
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
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
          <Route path="/map" element={<MapPlaceholder />} />
          <Route path="/alerts" element={<AlertsPlaceholder />} />
          <Route path="/reports" element={<ReportsPlaceholder />} />
          <Route path="/inventory" element={<InventoryPlaceholder />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
