import React from 'react';
import type { RiskSector } from '../../types';
import {
  X,
  AlertTriangle,
  CloudRain,
  Mountain,
  Layers,
  Download,
  TrendingUp,
  MapPin,
} from 'lucide-react';

interface SectorDetailsDrawerProps {
  sector: RiskSector | null;
  onClose: () => void;
  onIssueAlert?: (sector: RiskSector) => void;
}

export const SectorDetailsDrawer: React.FC<SectorDetailsDrawerProps> = ({
  sector,
  onClose,
  onIssueAlert,
}) => {
  if (!sector) return null;

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'HIGH': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'MODERATE': return 'text-amber-300 bg-amber-400/10 border-amber-400/30';
      case 'LOW': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0b1329]/95 backdrop-blur-xl border-l border-[#1e293b] shadow-2xl z-30 flex flex-col transition-all duration-300 transform translate-x-0">
      {/* Drawer Header */}
      <div className="p-6 border-b border-[#1e293b] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <Mountain className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-white text-lg">{sector.name}</h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRiskColor(sector.riskLevel)}`}>
                {sector.riskLevel}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              {sector.district}, {sector.state} • {sector.latitude.toFixed(4)}°N, {sector.longitude.toFixed(4)}°E
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-[#111c38] transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Risk Assessment Score gauge box */}
        <div className="bg-[#111c38] border border-[#1e293b] rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Landslide Hazard Index
            </span>
            <span className="text-xs text-slate-400">Updated 5m ago</span>
          </div>

          <div className="flex items-center gap-6">
            {/* Score Ring */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={sector.riskScore >= 80 ? 'text-rose-500' : sector.riskScore >= 60 ? 'text-amber-500' : 'text-emerald-500'}
                  strokeDasharray={`${sector.riskScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-black text-white">{sector.riskScore}</span>
                <span className="text-[10px] text-slate-400 block -mt-1">/ 100</span>
              </div>
            </div>

            {/* Quick Status Message */}
            <div className="flex-1 space-y-2">
              <div className="text-xs text-slate-300 leading-relaxed">
                {sector.riskScore >= 80 ? (
                  <span className="text-rose-400 font-semibold">Critical hazard conditions. High probability of mass slope failure driven by intense pore-water pressure.</span>
                ) : sector.riskScore >= 60 ? (
                  <span className="text-amber-400 font-semibold">Elevated hazard risk. Saturated soil layer requires active monitoring.</span>
                ) : (
                  <span className="text-emerald-400 font-semibold">Stable slope conditions under current rainfall thresholds.</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                <span>Risk score increased +14% over 12h</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Geomorphology Parameters */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Mountain className="w-3.5 h-3.5 text-emerald-400" />
            Geomorphology & Terrain Structure
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#111c38] border border-[#1e293b] p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Slope Angle</span>
              <span className="text-sm font-bold text-white mt-1 block">{sector.slopeAngle}°</span>
            </div>
            <div className="bg-[#111c38] border border-[#1e293b] p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Elevation</span>
              <span className="text-sm font-bold text-white mt-1 block">2,410 m MSL</span>
            </div>
            <div className="bg-[#111c38] border border-[#1e293b] p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Aspect Direction</span>
              <span className="text-sm font-bold text-white mt-1 block">South-East (135°)</span>
            </div>
            <div className="bg-[#111c38] border border-[#1e293b] p-3.5 rounded-xl">
              <span className="text-[11px] text-slate-400 block">Curvature</span>
              <span className="text-sm font-bold text-white mt-1 block">Concave (-0.42)</span>
            </div>
          </div>
        </div>

        {/* Section: Hydro-Meteorology */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
            Hydro-Meteorological Telemetry
          </h3>
          <div className="bg-[#111c38] border border-[#1e293b] p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">24-Hour Precipitation</span>
              <span className="font-bold text-cyan-400">{sector.rainfall24h} mm</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5">
              <div
                className="bg-cyan-500 h-1.5 rounded-full"
                style={{ width: `${Math.min((sector.rainfall24h / 250) * 100, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">72-Hour Antecedent Rain</span>
              <span className="font-bold text-white">340.8 mm</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Soil Moisture Saturation</span>
              <span className="font-bold text-amber-400">88.4%</span>
            </div>
          </div>
        </div>

        {/* Section: Geology & Soil */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            Geology & Subsurface Properties
          </h3>
          <div className="bg-[#111c38] border border-[#1e293b] p-4 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Lithology Type:</span>
              <span className="text-slate-200 font-medium">{sector.lithology}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Soil Thickness:</span>
              <span className="text-slate-200 font-medium">1.8 - 2.4 meters</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Permeability Index:</span>
              <span className="text-slate-200 font-medium">Moderate to Low</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Action Bar */}
      <div className="p-5 border-t border-[#1e293b] bg-[#080e1e] flex items-center gap-3">
        <button
          onClick={() => onIssueAlert?.(sector)}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 transition"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Issue Warning Alert</span>
        </button>

        <button
          className="p-3 bg-[#111c38] hover:bg-[#1a274c] border border-[#1e293b] text-slate-300 rounded-xl transition"
          title="Download GIS Dataset (GeoJSON)"
        >
          <Download className="w-4.5 h-4.5" />
        </button>
      </div>
    </div>
  );
};
