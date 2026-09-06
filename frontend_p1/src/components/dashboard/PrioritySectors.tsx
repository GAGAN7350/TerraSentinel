import React from 'react';
import type { SectorNode } from './DashboardMap';
import { SECTORS } from './DashboardMap';
import { AlertOctagon, MapPin } from 'lucide-react';

interface PrioritySectorsProps {
  selectedSectorId: string;
  onSelectSector: (sector: SectorNode) => void;
}

export const PrioritySectors: React.FC<PrioritySectorsProps> = ({
  selectedSectorId,
  onSelectSector,
}) => {
  const getBadgeStyle = (level: string) => {
    switch (level) {
      case 'CRITICAL': return 'bg-rose-500/15 text-rose-300 border-rose-500/30';
      case 'HIGH': return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'MODERATE': return 'bg-amber-400/10 text-amber-200 border-amber-400/25';
      default: return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/[0.08] shadow-2xl space-y-5">
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <AlertOctagon className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-white text-base">Priority Sector Watch</h3>
            <p className="text-[11px] text-slate-400">High-hazard corridors sorted by ML risk score</p>
          </div>
        </div>

        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-bold">
          LIVE FEED
        </span>
      </div>

      <div className="space-y-3">
        {SECTORS.map((sec) => {
          const isSelected = selectedSectorId === sec.id;
          return (
            <div
              key={sec.id}
              onClick={() => onSelectSector(sec)}
              className={`p-4 rounded-xl border transition duration-300 cursor-pointer space-y-2.5 ${
                isSelected
                  ? 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                  : 'bg-[#0a0f1d]/60 border-white/[0.06] hover:border-white/20 hover:bg-[#0f172a]/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{sec.name}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {sec.district}, {sec.state}
                  </p>
                </div>

                <div className="text-right">
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(sec.riskLevel)}`}>
                    {sec.riskLevel} {sec.riskScore}
                  </span>
                </div>
              </div>

              {/* Progress Risk Bar */}
              <div className="w-full bg-[#11192e] rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    sec.riskScore >= 80 ? 'bg-rose-500' : sec.riskScore >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${sec.riskScore}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-0.5">
                <span>Rain: {sec.rainfall24h} mm</span>
                <span>Slope: {sec.slopeAngle}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
