import React from 'react';
import type { Alert } from '../../types';
import {
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  Radio,
  Send,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

interface AlertsListProps {
  alerts: Alert[];
  onResolveAlert: (id: string) => void;
}

export const AlertsList: React.FC<AlertsListProps> = ({ alerts, onResolveAlert }) => {
  if (alerts.length === 0) {
    return (
      <div className="bg-[#0b1329]/90 border border-[#1e293b] rounded-2xl p-12 text-center space-y-3">
        <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
        <h3 className="text-base font-bold text-white">No Active Emergency Alerts</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          All monitored sectors are operating within normal rainfall and slope safety margins.
        </p>
      </div>
    );
  }

  const getSeverityStyle = (sev: string) => {
    switch (sev) {
      case 'CRITICAL': return 'border-rose-500/50 bg-rose-500/10 text-rose-300';
      case 'HIGH':
      case 'WARNING': return 'border-amber-500/50 bg-amber-500/10 text-amber-300';
      default: return 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300';
    }
  };

  return (
    <div className="space-y-4">
      {alerts.map((alt) => (
        <div
          key={alt.id}
          className="bg-[#0b1329]/90 border border-[#1e293b] hover:border-slate-700 rounded-2xl p-6 shadow-2xl transition-all space-y-4 relative overflow-hidden"
        >
          {/* Top Row: Title & Severity Badge */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl border mt-0.5 ${getSeverityStyle(alt.severity)}`}>
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">{alt.title}</h3>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getSeverityStyle(alt.severity)}`}>
                    {alt.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{alt.district}, {alt.state} • Issued {new Date(alt.issued_at || alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </p>
              </div>
            </div>

            {/* Broadcast Channels Badges */}
            <div className="flex items-center gap-2 bg-[#111c38] px-3 py-1.5 rounded-xl border border-[#1e293b] text-[11px] text-slate-300">
              <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span className="font-mono text-emerald-400 font-semibold">EOC FREQ 142.85 MHz</span>
              <span className="text-slate-600">•</span>
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>SMS GATEWAY ACTIVE</span>
            </div>
          </div>

          {/* Alert Message Body */}
          <div className="bg-[#111c38] border border-[#1e293b] rounded-xl p-4 text-xs text-slate-200 leading-relaxed">
            {alt.message}
          </div>

          {/* Bottom Bar: Expiration & Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Expires in 23h 45m</span>
              <span className="text-slate-600">•</span>
              <span>Status: <strong className="text-emerald-400">{alt.status}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onResolveAlert(alt.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs rounded-xl transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Resolve Alert</span>
              </button>

              <button
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111c38] hover:bg-[#1a274c] border border-[#1e293b] text-slate-200 text-xs font-semibold rounded-xl transition"
              >
                <Send className="w-3.5 h-3.5 text-rose-400" />
                <span>Dispatch NDRF Patrol</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
