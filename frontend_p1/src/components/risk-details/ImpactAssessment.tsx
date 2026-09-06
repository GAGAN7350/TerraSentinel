import React from 'react';
import { Users, Truck, AlertOctagon, Zap, Home } from 'lucide-react';

export const ImpactAssessment: React.FC = () => {
  const impacts = [
    {
      title: 'Population at High Risk',
      value: '1,420 citizens',
      sub: '2 settlements within 500m failure zone',
      icon: Users,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    },
    {
      title: 'Highway & Access Arteries',
      value: 'NH-10 Km 12–16',
      sub: 'Teesta corridor main supply line',
      icon: Truck,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
    {
      title: 'Critical Energy Infrastructure',
      value: 'TEESTA-III Hydro Power Line',
      sub: '220kV Grid Line runs along slope',
      icon: Zap,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Emergency Shelter Status',
      value: '3 Readiness Hubs',
      sub: 'Ranipool Community Centre active',
      icon: Home,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="bg-[#0b1329]/90 border border-[#1e293b] rounded-2xl p-6 shadow-2xl space-y-5">
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <AlertOctagon className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm">Downstream Impact & Vulnerability</h3>
          <p className="text-[11px] text-slate-400">Elements exposed to potential mass debris displacement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {impacts.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-[#111c38] border border-[#1e293b] p-4 rounded-xl flex items-start gap-3.5"
            >
              <div className={`p-2.5 rounded-xl border shrink-0 ${item.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-semibold">{item.title}</span>
                <span className="text-sm font-bold text-white mt-0.5 block">{item.value}</span>
                <span className="text-[11px] text-slate-400 mt-1 block">{item.sub}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
