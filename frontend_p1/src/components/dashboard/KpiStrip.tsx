import React from 'react';
import { ShieldAlert, Activity, CloudRain, BellRing } from 'lucide-react';

export const KpiStrip: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="glass-panel p-4 rounded-xl border border-red-500/30 bg-red-500/5 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-red-400">Regional Risk Rating</div>
          <div className="text-2xl font-extrabold font-heading text-white mt-1">91 / 100</div>
          <div className="text-[10px] text-red-300">CRITICAL • East Khasi Hills</div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
          <ShieldAlert className="w-5 h-5" />
        </div>
      </div>

      <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Monitored Slopes</div>
          <div className="text-2xl font-extrabold font-heading text-white mt-1">100+ Slopes</div>
          <div className="text-[10px] text-emerald-300">8 NER States Active</div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Activity className="w-5 h-5" />
        </div>
      </div>

      <div className="glass-panel p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400">Peak 24h Rainfall</div>
          <div className="text-2xl font-extrabold font-heading text-white mt-1">210.4 mm</div>
          <div className="text-[10px] text-cyan-300">IMD Shillong Gauge</div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <CloudRain className="w-5 h-5" />
        </div>
      </div>

      <div className="glass-panel p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">Active Warnings</div>
          <div className="text-2xl font-extrabold font-heading text-white mt-1">2 Dispatched</div>
          <div className="text-[10px] text-amber-300">Highway Patrol Notified</div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
          <BellRing className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};
