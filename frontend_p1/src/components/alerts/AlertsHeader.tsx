import React from 'react';
import { Search, PlusCircle, Bell, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import type { AlertSeverity } from '../../types';

interface AlertsHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedSeverity: AlertSeverity | 'ALL';
  onSeverityChange: (sev: AlertSeverity | 'ALL') => void;
  onOpenCreateModal: () => void;
  counts: { critical: number; warning: number; info: number; total: number };
}

export const AlertsHeader: React.FC<AlertsHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedSeverity,
  onSeverityChange,
  onOpenCreateModal,
  counts,
}) => {
  return (
    <div className="bg-[#0b1329]/90 border border-[#1e293b] rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Top Title & Broadcast Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
            <Bell className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wide">Early Warning & Emergency Broadcasts</h1>
            <p className="text-xs text-slate-400">Real-time alert dispatch center & threshold monitoring</p>
          </div>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-900/30 transition transform hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Broadcast Emergency Alert</span>
        </button>
      </div>

      {/* Severity Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111c38] border border-[#1e293b] p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-semibold">Total Alerts</span>
            <span className="text-xl font-black text-white mt-0.5 block">{counts.total}</span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-slate-400" />
        </div>

        <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-rose-300 block font-semibold">Critical Hazard</span>
            <span className="text-xl font-black text-rose-400 mt-0.5 block">{counts.critical}</span>
          </div>
          <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-amber-300 block font-semibold">Warnings</span>
            <span className="text-xl font-black text-amber-400 mt-0.5 block">{counts.warning}</span>
          </div>
          <AlertTriangle className="w-5 h-5 text-amber-400" />
        </div>

        <div className="bg-cyan-500/10 border border-cyan-500/20 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-cyan-300 block font-semibold">Advisories</span>
            <span className="text-xl font-black text-cyan-400 mt-0.5 block">{counts.info}</span>
          </div>
          <Info className="w-5 h-5 text-cyan-400" />
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
            placeholder="Filter alerts by title, state, or district..."
            className="w-full bg-[#111c38] border border-[#1e293b] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 transition"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#111c38] p-1 rounded-xl border border-[#1e293b]">
          {(['ALL', 'CRITICAL', 'HIGH', 'WARNING', 'INFO'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => onSeverityChange(sev as any)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                selectedSeverity === sev
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
