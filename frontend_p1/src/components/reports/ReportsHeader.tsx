import React from 'react';
import { Search, PlusCircle, ClipboardList, AlertOctagon, Mountain, Truck } from 'lucide-react';
import type { ReportType } from '../../types';

interface ReportsHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedType: ReportType | 'ALL';
  onTypeChange: (type: ReportType | 'ALL') => void;
  onOpenCreateModal: () => void;
  counts: { crack: number; slope: number; road: number; slide: number; total: number };
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  onOpenCreateModal,
  counts,
}) => {
  return (
    <div className="bg-[#0b1329]/90 border border-[#1e293b] rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Title & Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
            <ClipboardList className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wide">Officer Field Reports & Ground Truth</h1>
            <p className="text-xs text-slate-400">Patrol team observations, slope crack logs, and road blockages</p>
          </div>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-emerald-900/30 transition transform hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit Field Observation</span>
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111c38] border border-[#1e293b] p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-semibold">Tension Cracks</span>
            <span className="text-xl font-black text-amber-400 mt-0.5 block">{counts.crack}</span>
          </div>
          <AlertOctagon className="w-5 h-5 text-amber-400" />
        </div>

        <div className="bg-[#111c38] border border-[#1e293b] p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-semibold">Slope Movement</span>
            <span className="text-xl font-black text-rose-400 mt-0.5 block">{counts.slope}</span>
          </div>
          <Mountain className="w-5 h-5 text-rose-400" />
        </div>

        <div className="bg-[#111c38] border border-[#1e293b] p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-semibold">Road Blockages</span>
            <span className="text-xl font-black text-cyan-400 mt-0.5 block">{counts.road}</span>
          </div>
          <Truck className="w-5 h-5 text-cyan-400" />
        </div>

        <div className="bg-[#111c38] border border-[#1e293b] p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-semibold">Total Submissions</span>
            <span className="text-xl font-black text-emerald-400 mt-0.5 block">{counts.total}</span>
          </div>
          <ClipboardList className="w-5 h-5 text-emerald-400" />
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search observation description, officer, or district..."
            className="w-full bg-[#111c38] border border-[#1e293b] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#111c38] p-1 rounded-xl border border-[#1e293b]">
          {(['ALL', 'CRACK', 'SLOPE_MOVEMENT', 'ROAD_BLOCKAGE', 'LANDSLIDE'] as const).map((t) => (
            <button
              key={t}
              onClick={() => onTypeChange(t as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                selectedType === t
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
