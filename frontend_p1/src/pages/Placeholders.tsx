import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar';
import { Map, Bell, AlertTriangle, Database, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DashboardPlaceholder: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#07090E] text-gray-100 font-sans">
      <Navbar />
      <div className="pt-28 pb-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h1 className="font-heading font-extrabold text-3xl text-white">Officer Operations Command</h1>
            <p className="text-xs text-gray-400">Operational Dashboard — North-East India Sector</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Authenticated: {user?.full_name || 'Field Officer'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div
            onClick={() => navigate('/map')}
            className="glass-card p-6 rounded-2xl cursor-pointer hover:border-emerald-500/40 transition-all space-y-3"
          >
            <Map className="w-8 h-8 text-cyan-400" />
            <h3 className="font-bold text-white text-lg">Interactive Risk Map</h3>
            <p className="text-xs text-gray-400">GIS elevation contours, PostGIS landslides, and rainfall intensity layers.</p>
          </div>

          <div
            onClick={() => navigate('/alerts')}
            className="glass-card p-6 rounded-2xl cursor-pointer hover:border-amber-500/40 transition-all space-y-3"
          >
            <Bell className="w-8 h-8 text-amber-400" />
            <h3 className="font-bold text-white text-lg">Active Hazard Alerts</h3>
            <p className="text-xs text-gray-400">Manage critical, high, and moderate warnings across regional sectors.</p>
          </div>

          <div
            onClick={() => navigate('/reports')}
            className="glass-card p-6 rounded-2xl cursor-pointer hover:border-orange-500/40 transition-all space-y-3"
          >
            <AlertTriangle className="w-8 h-8 text-orange-400" />
            <h3 className="font-bold text-white text-lg">Field Officer Reports</h3>
            <p className="text-xs text-gray-400">Submit ground-truth observations on cracks, slope movement, and road blockages.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MapPlaceholder: React.FC = () => (
  <div className="min-h-screen bg-[#07090E] text-gray-100">
    <Navbar />
    <div className="pt-28 px-8 max-w-7xl mx-auto text-center space-y-4">
      <Map className="w-12 h-12 text-cyan-400 mx-auto" />
      <h1 className="text-3xl font-bold font-heading text-white">Stage F4 — Risk Map Preview</h1>
      <p className="text-gray-400 text-sm max-w-md mx-auto">
        PostGIS interactive spatial map with heatmaps, location selection, and contributing factor explainability.
      </p>
    </div>
  </div>
);

export const AlertsPlaceholder: React.FC = () => (
  <div className="min-h-screen bg-[#07090E] text-gray-100">
    <Navbar />
    <div className="pt-28 px-8 max-w-7xl mx-auto text-center space-y-4">
      <Bell className="w-12 h-12 text-amber-400 mx-auto" />
      <h1 className="text-3xl font-bold font-heading text-white">Stage F6 — Alerts Console</h1>
      <p className="text-gray-400 text-sm max-w-md mx-auto">
        Regional early warnings filtered by severity (CRITICAL, HIGH, WARNING, INFO).
      </p>
    </div>
  </div>
);

export const ReportsPlaceholder: React.FC = () => (
  <div className="min-h-screen bg-[#07090E] text-gray-100">
    <Navbar />
    <div className="pt-28 px-8 max-w-7xl mx-auto text-center space-y-4">
      <AlertTriangle className="w-12 h-12 text-orange-400 mx-auto" />
      <h1 className="text-3xl font-bold font-heading text-white">Stage F7 — Field Reports Workflow</h1>
      <p className="text-gray-400 text-sm max-w-md mx-auto">
        Field officer mobile workflow for ground observations and tension crack logging.
      </p>
    </div>
  </div>
);

export const InventoryPlaceholder: React.FC = () => (
  <div className="min-h-screen bg-[#07090E] text-gray-100">
    <Navbar />
    <div className="pt-28 px-8 max-w-7xl mx-auto text-center space-y-4">
      <Database className="w-12 h-12 text-emerald-400 mx-auto" />
      <h1 className="text-3xl font-bold font-heading text-white">Stage F8 — Landslide Inventory</h1>
      <p className="text-gray-400 text-sm max-w-md mx-auto">
        Searchable GSI Bhusanket and NRSC historical inventory database.
      </p>
    </div>
  </div>
);
