import React from 'react';
import { Search, RefreshCw, Crosshair, Layers, MapPin } from 'lucide-react';
import type { RiskLevel } from '../../types';

interface MapFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedState: string;
  onStateChange: (state: string) => void;
  selectedRisk: RiskLevel | 'ALL';
  onRiskChange: (risk: RiskLevel | 'ALL') => void;
  activeLayer: 'heatmap' | 'nodes' | 'rainfall' | 'topo';
  onLayerChange: (layer: 'heatmap' | 'nodes' | 'rainfall' | 'topo') => void;
  isBboxMode: boolean;
  onToggleBboxMode: () => void;
  onResetFilters: () => void;
  filteredCount: number;
}

const STATES = ['All States', 'Sikkim', 'Meghalaya', 'Assam', 'Uttarakhand', 'Himachal Pradesh', 'Arunachal Pradesh'];

export const MapFilterBar: React.FC<MapFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedState,
  onStateChange,
  selectedRisk,
  onRiskChange,
  activeLayer,
  onLayerChange,
  isBboxMode,
  onToggleBboxMode,
  onResetFilters,
  filteredCount,
}) => {
  return (
    <div className="bg-[#0b1329]/90 backdrop-blur-md border border-[#1e293b] rounded-2xl p-4 shadow-2xl flex flex-wrap items-center gap-4 text-sm text-slate-200 z-20">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search sector, pass, or district..."
          className="w-full bg-[#111c38] border border-[#1e293b] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
        />
      </div>

      {/* State Selector */}
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-emerald-400" />
        <select
          value={selectedState}
          onChange={(e) => onStateChange(e.target.value)}
          className="bg-[#111c38] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
        >
          {STATES.map((st) => (
            <option key={st} value={st} className="bg-[#0b1329]">
              {st}
            </option>
          ))}
        </select>
      </div>

      {/* Risk Filter Buttons */}
      <div className="flex items-center gap-1.5 bg-[#111c38] p-1 rounded-xl border border-[#1e293b]">
        {(['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'] as const).map((lvl) => {
          const isActive = selectedRisk === lvl;
          const colorMap: Record<string, string> = {
            ALL: isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-slate-200',
            CRITICAL: isActive ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50' : 'text-rose-400 hover:bg-rose-500/10',
            HIGH: isActive ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50' : 'text-amber-400 hover:bg-amber-500/10',
            MODERATE: isActive ? 'bg-amber-400/20 text-amber-200 border border-amber-400/40' : 'text-amber-300 hover:bg-amber-400/10',
            LOW: isActive ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' : 'text-emerald-400 hover:bg-emerald-500/10',
          };

          return (
            <button
              key={lvl}
              onClick={() => onRiskChange(lvl)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition ${colorMap[lvl]}`}
            >
              {lvl}
            </button>
          );
        })}
      </div>

      {/* Layer Mode Switcher */}
      <div className="flex items-center gap-1 bg-[#111c38] p-1 rounded-xl border border-[#1e293b]">
        <Layers className="w-3.5 h-3.5 text-cyan-400 ml-1.5" />
        {[
          { id: 'nodes', label: 'Sector Pins' },
          { id: 'heatmap', label: 'Heatmap' },
          { id: 'rainfall', label: 'Monsoon Radar' },
          { id: 'topo', label: 'Topo Elevation' },
        ].map((lyr) => (
          <button
            key={lyr.id}
            onClick={() => onLayerChange(lyr.id as any)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition ${
              activeLayer === lyr.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lyr.label}
          </button>
        ))}
      </div>

      {/* Spatial Query Tools */}
      <button
        onClick={onToggleBboxMode}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs transition ${
          isBboxMode
            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10'
            : 'bg-[#111c38] border-[#1e293b] text-slate-300 hover:border-slate-600'
        }`}
        title="Bounding Box spatial selection mode"
      >
        <Crosshair className={`w-3.5 h-3.5 ${isBboxMode ? 'text-emerald-400 animate-spin' : ''}`} />
        <span>BBox Select</span>
      </button>

      {/* Sector Counter & Reset */}
      <div className="flex items-center gap-3 ml-auto">
        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
          {filteredCount} Sectors Monitored
        </span>

        <button
          onClick={onResetFilters}
          className="p-2 bg-[#111c38] hover:bg-[#1a274c] border border-[#1e293b] text-slate-400 hover:text-white rounded-xl transition"
          title="Reset Filters"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
