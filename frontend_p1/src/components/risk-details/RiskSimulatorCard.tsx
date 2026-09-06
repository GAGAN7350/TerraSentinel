import React, { useState } from 'react';
import { Sliders, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { RiskLevel } from '../../types';

interface RiskSimulatorCardProps {
  initialRainfall?: number;
  initialSlope?: number;
  onSimulationChange?: (score: number, level: RiskLevel) => void;
}

export const RiskSimulatorCard: React.FC<RiskSimulatorCardProps> = ({
  initialRainfall = 210,
  initialSlope = 42,
  onSimulationChange,
}) => {
  const [rainfall, setRainfall] = useState<number>(initialRainfall);
  const [slope, setSlope] = useState<number>(initialSlope);
  const [saturation, setSaturation] = useState<number>(88);

  // Real-time Hazard Calculation Formula
  const calculateSimulatedRisk = () => {
    const rainFactor = Math.min((rainfall / 250) * 45, 45);
    const slopeFactor = Math.min((slope / 50) * 35, 35);
    const satFactor = Math.min((saturation / 100) * 20, 20);
    const score = Math.min(Math.round(rainFactor + slopeFactor + satFactor), 100);

    let level: RiskLevel = 'LOW';
    if (score >= 80) level = 'CRITICAL';
    else if (score >= 60) level = 'HIGH';
    else if (score >= 40) level = 'MODERATE';

    if (onSimulationChange) {
      onSimulationChange(score, level);
    }

    return { score, level };
  };

  const { score, level } = calculateSimulatedRisk();

  const handleReset = () => {
    setRainfall(initialRainfall);
    setSlope(initialSlope);
    setSaturation(88);
  };

  const getLevelColor = (lvl: RiskLevel) => {
    switch (lvl) {
      case 'CRITICAL': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'HIGH': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'MODERATE': return 'text-amber-300 bg-amber-400/10 border-amber-400/30';
      case 'LOW': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  return (
    <div className="bg-[#0b1329]/90 border border-[#1e293b] rounded-2xl p-6 shadow-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
            <Sliders className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Interactive Hazard Simulator</h3>
            <p className="text-[11px] text-slate-400">Simulate climate & slope changes to evaluate risk shift</p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="p-2 text-slate-400 hover:text-white bg-[#111c38] rounded-xl border border-[#1e293b] transition"
          title="Reset Simulation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Simulated Output Badge */}
      <div className="bg-[#111c38] border border-[#1e293b] rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-slate-400 block font-semibold uppercase tracking-wider">
            Simulated Risk Index
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-white">{score}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
        </div>

        <div className={`px-4 py-2 rounded-xl border font-bold text-xs flex items-center gap-2 ${getLevelColor(level)}`}>
          {level === 'CRITICAL' || level === 'HIGH' ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <ShieldCheck className="w-4 h-4" />
          )}
          <span>{level} RISK</span>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="space-y-4">
        {/* Slider 1: Rainfall */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Precipitation Rate (24h)</span>
            <span className="font-mono text-cyan-400 font-bold">{rainfall} mm</span>
          </div>
          <input
            type="range"
            min={0}
            max={300}
            value={rainfall}
            onChange={(e) => setRainfall(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
        </div>

        {/* Slider 2: Slope Angle */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Slope Angle Modification</span>
            <span className="font-mono text-amber-400 font-bold">{slope}°</span>
          </div>
          <input
            type="range"
            min={10}
            max={60}
            value={slope}
            onChange={(e) => setSlope(Number(e.target.value))}
            className="w-full accent-amber-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
        </div>

        {/* Slider 3: Soil Moisture */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-slate-300 font-medium">Pore Saturation Level</span>
            <span className="font-mono text-emerald-400 font-bold">{saturation}%</span>
          </div>
          <input
            type="range"
            min={20}
            max={100}
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
            className="w-full accent-emerald-400 bg-slate-800 h-2 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
