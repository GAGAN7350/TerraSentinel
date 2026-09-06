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

const STATES = ['All States', 'Sikkim', 'Meghalaya', 'Assam', 'Arunachal Pradesh', 'Manipur', 'Nagaland', 'Mizoram', 'Tripura'];

const RISK_PILLS = [
  { key: 'ALL', label: 'All Zones' },
  { key: 'CRITICAL', label: 'Critical', color: '#fb7185', bg: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.45)' },
  { key: 'HIGH', label: 'High', color: '#fb923c', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.4)' },
  { key: 'MODERATE', label: 'Moderate', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)' },
  { key: 'LOW', label: 'Low', color: '#34d399', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)' },
] as const;

const LAYERS = [
  { id: 'nodes', label: 'Sector Pins' },
  { id: 'heatmap', label: 'Heatmap' },
  { id: 'rainfall', label: 'Monsoon' },
  { id: 'topo', label: 'Topo' },
] as const;

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
    <div
      className="rounded-2xl p-3.5 flex flex-wrap items-center gap-3 z-20"
      style={{
        background: 'rgba(7,11,26,0.92)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(24px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(100,116,139,0.7)' }} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search sector, pass, or district..."
          className="input-field w-full pl-9 text-xs"
        />
      </div>

      {/* State Selector */}
      <div className="flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: '#34d399' }} />
        <select
          value={selectedState}
          onChange={(e) => onStateChange(e.target.value)}
          className="text-xs rounded-xl px-3 py-2 cursor-pointer outline-none"
          style={{
            background: 'rgba(9,15,33,0.9)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#e2e8f0',
          }}
        >
          {STATES.map((st) => (
            <option key={st} value={st} style={{ background: '#09111f' }}>{st}</option>
          ))}
        </select>
      </div>

      {/* Risk Level Filter */}
      <div className="flex items-center gap-1 p-1 rounded-xl"
        style={{ background: 'rgba(9,15,33,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {RISK_PILLS.map((pill) => {
          const active = selectedRisk === pill.key;
          return (
            <button
              key={pill.key}
              onClick={() => onRiskChange(pill.key as any)}
              className="px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all"
              style={active && 'color' in pill ? {
                background: pill.bg,
                border: `1px solid ${pill.border}`,
                color: pill.color,
              } : active ? {
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#e2e8f0',
              } : {
                color: 'rgba(100,116,139,0.7)',
                border: '1px solid transparent',
              }}
            >
              {pill.label}
            </button>
          );
        })}
      </div>

      {/* Layer Switcher */}
      <div className="flex items-center gap-1 p-1 rounded-xl"
        style={{ background: 'rgba(9,15,33,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Layers className="w-3.5 h-3.5 ml-1.5 mr-0.5 shrink-0" style={{ color: '#22d3ee' }} />
        {LAYERS.map((lyr) => (
          <button
            key={lyr.id}
            onClick={() => onLayerChange(lyr.id as any)}
            className="px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all"
            style={activeLayer === lyr.id ? {
              background: 'rgba(6,182,212,0.18)',
              border: '1px solid rgba(6,182,212,0.45)',
              color: '#22d3ee',
            } : {
              color: 'rgba(100,116,139,0.7)',
              border: '1px solid transparent',
            }}
          >
            {lyr.label}
          </button>
        ))}
      </div>

      {/* BBox Select */}
      <button
        onClick={onToggleBboxMode}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl font-mono text-[11px] font-semibold transition-all"
        style={isBboxMode ? {
          background: 'rgba(16,185,129,0.15)',
          border: '1px solid rgba(16,185,129,0.5)',
          color: '#34d399',
          boxShadow: '0 0 16px rgba(16,185,129,0.2)',
        } : {
          background: 'rgba(9,15,33,0.8)',
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(148,163,184,0.8)',
        }}
        title="Bounding Box spatial selection"
      >
        <Crosshair className={`w-3.5 h-3.5 ${isBboxMode ? 'animate-pulse' : ''}`} />
        BBox Select
      </button>

      {/* Counter + Reset */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="font-mono text-[11px] font-semibold px-2.5 py-1 rounded-lg"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}>
          {filteredCount} Sectors
        </span>
        <button
          onClick={onResetFilters}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{
            background: 'rgba(9,15,33,0.8)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(100,116,139,0.7)',
          }}
          title="Reset all filters"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
