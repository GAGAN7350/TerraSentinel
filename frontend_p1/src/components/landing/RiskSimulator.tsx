import React, { useState } from 'react';
import { Sliders, AlertTriangle, ShieldCheck, TrendingUp, Info } from 'lucide-react';
import type { RiskLevel } from '../../types';

interface SimulatorLocation {
  name: string;
  state: string;
  slope: number;
  baseRainfall: number;
  historyCount: number;
}

const LOCATIONS: SimulatorLocation[] = [
  { name: 'Shillong Bypass Sector', state: 'Meghalaya', slope: 38.5, baseRainfall: 180, historyCount: 6 },
  { name: 'West Siang Corridor', state: 'Arunachal Pradesh', slope: 35.0, baseRainfall: 140, historyCount: 4 },
  { name: 'Silchar Basin Slopes', state: 'Assam', slope: 22.1, baseRainfall: 65, historyCount: 2 },
  { name: 'Gangtok Highway Basin', state: 'Sikkim', slope: 41.2, baseRainfall: 195, historyCount: 8 },
];

export const RiskSimulator: React.FC = () => {
  const [selectedLoc, setSelectedLoc] = useState<SimulatorLocation>(LOCATIONS[0]);
  const [rainfall, setRainfall] = useState<number>(selectedLoc.baseRainfall);

  // Dynamic Risk Formula Simulation matching Phase 2 schema contract
  const calculateRisk = () => {
    const rainFactor = (rainfall / 250) * 55;
    const slopeFactor = (selectedLoc.slope / 45) * 35;
    const historyFactor = (selectedLoc.historyCount / 10) * 10;
    const totalScore = Math.min(99, Math.max(12, Math.round(rainFactor + slopeFactor + historyFactor)));

    let level: RiskLevel = 'LOW';
    if (totalScore >= 80) level = 'CRITICAL';
    else if (totalScore >= 65) level = 'HIGH';
    else if (totalScore >= 40) level = 'MODERATE';

    const confidence = Math.round(75 + (totalScore / 100) * 18);

    return { totalScore, level, confidence };
  };

  const { totalScore, level, confidence } = calculateRisk();

  const getLevelColor = (lvl: RiskLevel) => {
    switch (lvl) {
      case 'CRITICAL': return { bg: 'bg-red-500/10', border: 'border-red-500/40', text: 'text-red-400', badge: 'bg-red-500' };
      case 'HIGH': return { bg: 'bg-orange-500/10', border: 'border-orange-500/40', text: 'text-orange-400', badge: 'bg-orange-500' };
      case 'MODERATE': return { bg: 'bg-amber-500/10', border: 'border-amber-500/40', text: 'text-amber-400', badge: 'bg-amber-500' };
      default: return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/40', text: 'text-emerald-400', badge: 'bg-emerald-500' };
    }
  };

  const style = getLevelColor(level);

  return (
    <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 flex items-center justify-center">
            <Sliders className="w-4 h-4 text-teal-400" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-white text-lg">Interactive Risk Calculator</h3>
            <p className="text-xs text-gray-400">Simulate ML hazard scoring based on environmental parameters</p>
          </div>
        </div>
        <span className="text-[11px] font-mono uppercase px-2.5 py-1 rounded bg-white/5 border border-white/10 text-gray-300">
          ML Schema v1.4
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Location Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Select Sector / Location
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => {
                    setSelectedLoc(loc);
                    setRainfall(loc.baseRainfall);
                  }}
                  className={`px-3.5 py-2.5 rounded-xl border text-left transition-all ${
                    selectedLoc.name === loc.name
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900/60 border-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">{loc.name}</div>
                  <div className="text-[11px] text-gray-400">{loc.state} • {loc.slope}° Slope</div>
                </button>
              ))}
            </div>
          </div>

          {/* Rainfall Slider */}
          <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-gray-300">
                24h Precipitation Intensity
              </label>
              <span className="text-sm font-mono font-bold text-cyan-400">
                {rainfall} mm / 24h
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="280"
              value={rainfall}
              onChange={(e) => setRainfall(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-1.5 font-mono">
              <span>10mm (Light)</span>
              <span>120mm (Monsoon Heavy)</span>
              <span>280mm (Extreme Peak)</span>
            </div>
          </div>

          {/* Contributing Parameters List */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="text-[10px] uppercase text-gray-400 mb-1">Slope Angle</div>
              <div className="text-sm font-bold text-gray-200">{selectedLoc.slope}°</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="text-[10px] uppercase text-gray-400 mb-1">Soil Saturation</div>
              <div className="text-sm font-bold text-gray-200">
                {Math.min(98, Math.round((rainfall / 220) * 100))}%
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="text-[10px] uppercase text-gray-400 mb-1">GSI Records</div>
              <div className="text-sm font-bold text-gray-200">{selectedLoc.historyCount} slides</div>
            </div>
          </div>
        </div>

        {/* Dynamic Risk Output Panel */}
        <div className={`lg:col-span-5 p-6 rounded-2xl border flex flex-col justify-between ${style.bg} ${style.border}`}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Calculated Risk Score
              </span>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${style.badge} text-gray-950`}>
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{level}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-6xl font-extrabold font-heading ${style.text}`}>
                {totalScore}
              </span>
              <span className="text-xl text-gray-400 font-semibold">/ 100</span>
            </div>

            <div className="w-full bg-gray-950/60 rounded-full h-2.5 mb-6 overflow-hidden border border-white/10">
              <div
                className={`h-full transition-all duration-500 ${style.badge}`}
                style={{ width: `${totalScore}%` }}
              />
            </div>

            {/* Explainability Factors */}
            <div className="space-y-2 mb-6">
              <div className="text-xs font-semibold text-gray-300 flex items-center gap-1.5 mb-2">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                <span>Primary Risk Contributors</span>
              </div>
              <div className="text-xs text-gray-300 bg-black/40 p-2.5 rounded-lg border border-white/5 flex justify-between">
                <span>Rainfall Intensity</span>
                <span className="font-semibold text-cyan-400">
                  {rainfall > 150 ? 'Critical Contribution' : 'Moderate Contribution'}
                </span>
              </div>
              <div className="text-xs text-gray-300 bg-black/40 p-2.5 rounded-lg border border-white/5 flex justify-between">
                <span>Terrain Gradient</span>
                <span className="font-semibold text-emerald-400">{selectedLoc.slope}° Inclination</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Model Confidence: <strong className="text-white">{confidence}%</strong></span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{rainfall > 120 ? 'Increasing' : 'Stable'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
