import React from 'react';
import { Bell, Clock, CheckCircle2 } from 'lucide-react';
import { MOCK_ALERTS } from '../../services/api';

export const RecentActivity: React.FC = () => {
  return (
    <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <h3 className="font-heading font-bold text-white text-sm">Dispatched Warning Feed</h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-400">Live Telemetry</span>
      </div>

      <div className="space-y-3">
        {MOCK_ALERTS.map((alert) => (
          <div key={alert.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  alert.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                }`}>
                  {alert.severity}
                </span>
                <span className="text-xs font-semibold text-white">{alert.title}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <Clock className="w-3 h-3 text-gray-500" />
                <span>Active</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">{alert.message}</p>

            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-white/5">
              <span>{alert.district}, {alert.state}</span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Highway Patrol Notified</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
