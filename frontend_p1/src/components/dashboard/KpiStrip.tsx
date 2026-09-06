import React from 'react';
import { ShieldAlert, Mountain, AlertTriangle, CloudRain } from 'lucide-react';

export const KpiStrip: React.FC = () => {
  const kpis = [
    {
      label: 'Regional Risk Status',
      value: 'CRITICAL',
      sub: 'East Khasi Hills • Score 91/100',
      icon: ShieldAlert,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/25',
      glow: 'shadow-rose-500/10',
    },
    {
      label: 'Monitored Slopes',
      value: '14 Active',
      sub: 'Continuous InSAR & Gauge Feed',
      icon: Mountain,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/25',
      glow: 'shadow-emerald-500/10',
    },
    {
      label: 'Active Warnings',
      value: '2 Dispatched',
      sub: 'EOC Radio Frequency 142.85 MHz',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/25',
      glow: 'shadow-amber-500/10',
    },
    {
      label: 'Peak 24h Rainfall',
      value: '210.4 mm',
      sub: 'Teesta & Shillong Gauge Network',
      icon: CloudRain,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/25',
      glow: 'shadow-cyan-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            className="glass-card p-5 border border-white/[0.07] rounded-2xl flex items-center justify-between shadow-xl transition duration-300 hover:border-white/20"
          >
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                {kpi.label}
              </span>
              <div className="text-2xl font-black font-heading text-white tracking-tight">
                {kpi.value}
              </div>
              <span className="text-[11px] text-slate-400 block font-normal">
                {kpi.sub}
              </span>
            </div>

            <div className={`p-3 rounded-2xl border ${kpi.bg} ${kpi.glow} shadow-lg shrink-0`}>
              <Icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
