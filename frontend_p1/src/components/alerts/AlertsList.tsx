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
  Wifi,
} from 'lucide-react';

interface AlertsListProps {
  alerts: Alert[];
  onResolveAlert: (id: string) => void;
}

const SEV_CONFIG: Record<string, { color: string; bg: string; border: string; glow: string; label: string }> = {
  CRITICAL: { color: '#fb7185', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.35)', glow: 'rgba(244,63,94,0.15)', label: 'CRITICAL' },
  HIGH: { color: '#fb923c', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.35)', glow: 'rgba(249,115,22,0.12)', label: 'HIGH' },
  WARNING: { color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', glow: 'rgba(245,158,11,0.1)', label: 'WARNING' },
  INFO: { color: '#22d3ee', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.3)', glow: 'rgba(6,182,212,0.08)', label: 'INFO' },
};

export const AlertsList: React.FC<AlertsListProps> = ({ alerts, onResolveAlert }) => {
  if (alerts.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-16 text-center"
        style={{ border: '1px solid rgba(16,185,129,0.2)' }}>
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
          <ShieldCheck className="w-7 h-7" style={{ color: '#34d399' }} />
        </div>
        <h3 className="font-heading font-bold text-lg text-white mb-2">All Clear — No Active Alerts</h3>
        <p className="text-sm max-w-sm mx-auto" style={{ color: 'rgba(148,163,184,0.6)' }}>
          All monitored sectors are within safe rainfall and slope stability margins.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alt, i) => {
        const cfg = SEV_CONFIG[alt.severity] || SEV_CONFIG.INFO;
        const isResolved = alt.status === 'RESOLVED';

        return (
          <div
            key={alt.id}
            className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: isResolved ? 'rgba(9,15,33,0.5)' : 'rgba(11,17,32,0.8)',
              border: `1px solid ${isResolved ? 'rgba(255,255,255,0.06)' : cfg.border}`,
              boxShadow: isResolved ? 'none' : `0 0 30px ${cfg.glow}, 0 8px 32px rgba(0,0,0,0.4)`,
              opacity: isResolved ? 0.6 : 1,
              animationDelay: `${i * 60}ms`,
            }}
          >
            {/* Top accent bar */}
            {!isResolved && (
              <div className="h-0.5 w-full"
                style={{ background: `linear-gradient(90deg, ${cfg.color}, ${cfg.color}40, transparent)` }} />
            )}

            {/* Left severity bar */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5"
              style={{ background: isResolved ? 'rgba(255,255,255,0.1)' : cfg.color, boxShadow: `0 0 8px ${cfg.glow}` }} />

            <div className="p-6 pl-7">
              {/* Header Row */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <AlertTriangle className="w-4.5 h-4.5" style={{ color: cfg.color }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 mb-1 flex-wrap">
                      <h3 className="font-heading font-bold text-base text-white">{alt.title}</h3>
                      <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-lg"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                        {cfg.label}
                      </span>
                      {isResolved && (
                        <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-lg"
                          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
                          RESOLVED
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px]"
                      style={{ color: 'rgba(100,116,139,0.8)' }}>
                      <MapPin className="w-3 h-3" style={{ color: '#34d399' }} />
                      <span>{alt.district}, {alt.state}</span>
                      <span style={{ color: 'rgba(100,116,139,0.4)' }}>·</span>
                      <Clock className="w-3 h-3" />
                      <span>{new Date(alt.issued_at || alt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* Broadcast channels */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono text-[11px]"
                  style={{ background: 'rgba(9,15,33,0.8)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <Radio className="w-3 h-3 animate-pulse" style={{ color: '#fb7185' }} />
                  <span style={{ color: '#34d399' }}>EOC 142.85 MHz</span>
                  <span style={{ color: 'rgba(100,116,139,0.4)' }}>·</span>
                  <MessageSquare className="w-3 h-3" style={{ color: '#22d3ee' }} />
                  <span style={{ color: '#22d3ee' }}>SMS</span>
                  <span style={{ color: 'rgba(100,116,139,0.4)' }}>·</span>
                  <Wifi className="w-3 h-3" style={{ color: '#fbbf24' }} />
                  <span style={{ color: '#fbbf24' }}>PUSH</span>
                </div>
              </div>

              {/* Message Body */}
              <div className="rounded-xl px-4 py-3 mb-4 text-xs leading-relaxed"
                style={{ background: 'rgba(9,15,33,0.7)', border: '1px solid rgba(255,255,255,0.06)', color: '#cbd5e1' }}>
                {alt.message}
              </div>

              {/* Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 font-mono text-[11px]"
                  style={{ color: 'rgba(100,116,139,0.7)' }}>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" style={{ color: '#fbbf24' }} />
                    Expires 23h 45m
                  </span>
                  <span style={{ color: 'rgba(100,116,139,0.3)' }}>·</span>
                  <span>
                    Status:{' '}
                    <span className="font-bold" style={{ color: isResolved ? '#34d399' : '#fbbf24' }}>
                      {alt.status}
                    </span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {!isResolved && (
                    <>
                      <button
                        onClick={() => onResolveAlert(alt.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all"
                        style={{
                          background: 'rgba(16,185,129,0.12)',
                          border: '1px solid rgba(16,185,129,0.35)',
                          color: '#34d399',
                        }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Resolve Alert
                      </button>
                      <button
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all"
                        style={{
                          background: cfg.bg,
                          border: `1px solid ${cfg.border}`,
                          color: cfg.color,
                        }}
                      >
                        <Send className="w-3.5 h-3.5" />
                        Dispatch NDRF
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
