import React from 'react';
import { Bell, Clock, Radio, ExternalLink } from 'lucide-react';
import { MOCK_ALERTS } from '../../services/api';

const SEVERITY_CONFIG = {
  CRITICAL: { color: '#fb7185', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.35)', label: 'CRITICAL' },
  HIGH: { color: '#fb923c', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.35)', label: 'HIGH' },
  WARNING: { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', label: 'WARNING' },
  INFO: { color: '#22d3ee', bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.3)', label: 'INFO' },
};

export const RecentActivity: React.FC = () => {
  const recentAlerts = MOCK_ALERTS.slice(0, 3);

  return (
    <div className="glass-panel rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <Bell className="w-4 h-4" style={{ color: '#fbbf24' }} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-white">Warning Feed</h3>
            <p className="font-mono text-[10px]" style={{ color: 'rgba(100,116,139,0.8)' }}>
              Live dispatch stream
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold"
          style={{ color: 'rgba(100,116,139,0.7)' }}>
          <Radio className="w-3 h-3" style={{ color: '#34d399' }} />
          ACTIVE
        </div>
      </div>

      {/* Alert Items */}
      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        {recentAlerts.map((alert) => {
          const cfg = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.INFO;

          return (
            <div key={alert.id} className="px-5 py-3.5 group cursor-pointer hover:bg-white/[0.02] transition-colors relative">
              <div className="flex items-center justify-between mb-2">
                <span
                  className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md"
                  style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                >
                  {cfg.label}
                </span>
                <div className="flex items-center gap-1 font-mono text-[10px]"
                  style={{ color: 'rgba(100,116,139,0.6)' }}>
                  <Clock className="w-2.5 h-2.5" />
                  Active
                </div>
              </div>

              <p className="text-xs font-semibold text-slate-200 mb-1.5 leading-tight">
                {alert.title}
              </p>

              <p className="text-[11px] leading-relaxed mb-2"
                style={{ color: 'rgba(148,163,184,0.7)' }}>
                {alert.message.substring(0, 100)}…
              </p>

              <div className="flex items-center justify-between font-mono text-[10px]">
                <span style={{ color: 'rgba(100,116,139,0.6)' }}>{alert.district}, {alert.state}</span>
                <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#34d399' }}>
                  <ExternalLink className="w-3 h-3" />
                  View
                </span>
              </div>

              {/* left accent bar */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 rounded-r opacity-60"
                style={{ background: cfg.color }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
