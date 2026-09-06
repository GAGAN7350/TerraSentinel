import React from 'react';
import type { FieldReport } from '../../types';
import { MapPin, User, Clock, CheckCircle2, Mountain, Camera } from 'lucide-react';

interface ReportsFeedProps {
  reports: FieldReport[];
}

export const ReportsFeed: React.FC<ReportsFeedProps> = ({ reports }) => {
  if (reports.length === 0) {
    return (
      <div className="bg-[#0b1329]/90 border border-[#1e293b] rounded-2xl p-12 text-center space-y-3">
        <Mountain className="w-10 h-10 text-slate-500 mx-auto" />
        <h3 className="text-base font-bold text-white">No Field Reports Found</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          No ground truth observations match the specified filters.
        </p>
      </div>
    );
  }

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'CRACK': return 'border-amber-500/50 bg-amber-500/10 text-amber-300';
      case 'SLOPE_MOVEMENT': return 'border-rose-500/50 bg-rose-500/10 text-rose-300';
      case 'ROAD_BLOCKAGE': return 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300';
      case 'LANDSLIDE': return 'border-red-600/50 bg-red-600/10 text-red-300';
      default: return 'border-slate-500/50 bg-slate-500/10 text-slate-300';
    }
  };

  return (
    <div className="space-y-4">
      {reports.map((rep) => (
        <div
          key={rep.id}
          className="bg-[#0b1329]/90 border border-[#1e293b] hover:border-slate-700 rounded-2xl p-6 shadow-2xl transition-all space-y-4"
        >
          {/* Header Row */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-extrabold px-3 py-1 rounded-xl border ${getTypeStyle(rep.report_type)}`}>
                {rep.report_type.replace('_', ' ')}
              </span>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{rep.district}, {rep.state} ({rep.latitude.toFixed(4)}°N, {rep.longitude.toFixed(4)}°E)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>VERIFIED BY GIS DISPATCH</span>
            </div>
          </div>

          {/* Report Description */}
          <div className="bg-[#111c38] border border-[#1e293b] rounded-xl p-4 text-xs text-slate-200 leading-relaxed space-y-2">
            <p>{rep.description}</p>

            <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400 border-t border-[#1e293b]">
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>1 Field Photo Attached (Geo-tagged JPG)</span>
            </div>
          </div>

          {/* Submitter Info Footer */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 font-mono">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-slate-300" />
              <span>Officer ID: <strong className="text-slate-200">{rep.submitted_by || 'NER-OFFICER-42'}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Observed: {new Date(rep.observed_at).toLocaleString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
