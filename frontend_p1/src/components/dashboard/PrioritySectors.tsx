import React from 'react';
import { SECTORS, type SectorNode } from './DashboardMap';
import { AlertCircle, ChevronRight, MapPin } from 'lucide-react';

interface PrioritySectorsProps {
  onSelectSector: (sec: SectorNode) => void;
  selectedSectorId?: string;
}

export const PrioritySectors: React.FC<PrioritySectorsProps> = ({ onSelectSector, selectedSectorId }) => {
  return (
    <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <h3 className="font-heading font-bold text-white text-sm">High-Risk Priority Sectors</h3>
        </div>
        <span className="text-[10px] font-mono text-gray-400">Sorted by ML Risk</span>
      </div>

      <div className="space-y-2.5">
        {SECTORS.map((sec) => {
          const active = sec.id === selectedSectorId;
          return (
            <div
              key={sec.id}
              onClick={() => onSelectSector(sec)}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                active
                  ? 'bg-cyan-500/15 border-cyan-400 shadow-md shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-white/5 hover:border-white/20'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-xs font-bold text-white">{sec.name}</span>
                </div>
                <div className="text-[11px] text-gray-400">
                  {sec.district}, {sec.state} • Slope {sec.slope}°
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className={`text-xs font-mono font-extrabold ${
                    sec.riskLevel === 'CRITICAL' ? 'text-red-400' : sec.riskLevel === 'HIGH' ? 'text-orange-400' : 'text-amber-400'
                  }`}>
                    {sec.riskScore} / 100
                  </div>
                  <div className="text-[10px] text-gray-400 font-semibold">{sec.riskLevel}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
