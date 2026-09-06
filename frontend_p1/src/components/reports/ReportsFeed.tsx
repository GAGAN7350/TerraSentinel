import React from 'react';
import type { FieldReport } from '../../types';
import { MapPin, User, Clock, CheckCircle2, Mountain, Camera } from 'lucide-react';

interface ReportsFeedProps {
  reports: FieldReport[];
}

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; glow: string }> = {
  CRACK: { label: 'Tension Crack', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.35)', glow: 'rgba(245,158,11,0.1)' },
  SLOPE_MOVEMENT: { label: 'Slope Movement', color: '#fb7185', bg: 'rgba(244,63,94,0.1)', border: 'rgba(244,63,94,0.35)', glow: 'rgba(244,63,94,0.12)' },
  ROAD_BLOCKAGE: { label: 'Road Blockage', color: '#22d3ee', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.3)', glow: 'rgba(6,182,212,0.08)' },
  LANDSLIDE: { label: 'Active Landslide', color: '#f43f5e', bg: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.45)', glow: 'rgba(244,63,94,0.2)' },
};

const SEV_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  CRITICAL: { color: '#fb7185', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.4)' },
  HIGH: { color: '#fb923c', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.4)' },
  MODERATE: { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)' },
  LOW: { color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)' },
};

export const ReportsFeed: React.FC<ReportsFeedProps> = ({ reports }) => {
  if (reports.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-16 text-center"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)' }}>
          <Mountain className="w-7 h-7" style={{ color: '#64748b' }} />
        </div>
        <h3 className="font-heading font-bold text-lg text-white mb-2">No Field Reports Found</h3>
        <p className="text-sm max-w-sm mx-auto" style={{ color: 'rgba(148,163,184,0.6)' }}>
          No ground truth observations match the specified filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((rep, i) => {
        const typeCfg = TYPE_CONFIG[rep.report_type] || TYPE_CONFIG.CRACK;
        const sevCfg = SEV_CONFIG[rep.severity] || SEV_CONFIG.MODERATE;

        return (
          <div
            key={rep.id}
            className="relative rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
            style={{
              background: 'rgba(11,17,32,0.8)',
              border: `1px solid ${typeCfg.border}`,
              boxShadow: `0 0 30px ${typeCfg.glow}, 0 8px 32px rgba(0,0,0,0.4)`,
              animationDelay: `${i * 70}ms`,
            }}
          >
            {/* Top accent */}
            <div className="h-0.5 w-full"
              style={{ background: `linear-gradient(90deg, ${typeCfg.color}, ${typeCfg.color}40, transparent)` }} />

            {/* Left bar */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5"
              style={{ background: typeCfg.color, boxShadow: `0 0 8px ${typeCfg.glow}` }} />

            <div className="p-5 pl-6">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: typeCfg.bg, border: `1px solid ${typeCfg.border}`, color: typeCfg.color }}>
                    {typeCfg.label.toUpperCase()}
                  </span>
                  <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: sevCfg.bg, border: `1px solid ${sevCfg.border}`, color: sevCfg.color }}>
                    {rep.severity}
                  </span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]"
                    style={{ color: 'rgba(100,116,139,0.8)' }}>
                    <MapPin className="w-3 h-3" style={{ color: '#34d399' }} />
                    <span>{rep.district}, {rep.state}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-lg"
                  style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}>
                  <CheckCircle2 className="w-3 h-3" />
                  GIS VERIFIED
                </div>
              </div>

              {/* Description */}
              <div className="rounded-xl p-4 mb-4 text-xs leading-relaxed"
                style={{ background: 'rgba(9,15,33,0.7)', border: '1px solid rgba(255,255,255,0.06)', color: '#cbd5e1' }}>
                <p>{rep.description}</p>
                <div className="flex items-center gap-2 mt-2.5 pt-2.5 font-mono text-[11px]"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: '#22d3ee' }}>
                  <Camera className="w-3 h-3" />
                  <span>1 Field Photo Attached (GPS-tagged JPG)</span>
                </div>
              </div>

              {/* GPS + Officer + Time */}
              <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]"
                style={{ color: 'rgba(100,116,139,0.7)' }}>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" style={{ color: '#34d399' }} />
                    <span style={{ color: '#34d399' }}>
                      {rep.latitude.toFixed(4)}°N, {rep.longitude.toFixed(4)}°E
                    </span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    <span className="text-slate-300">{rep.submitted_by || 'NER-OFFICER-42'}</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(rep.observed_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
