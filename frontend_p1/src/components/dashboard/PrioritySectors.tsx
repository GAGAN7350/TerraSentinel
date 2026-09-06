import React from 'react';
import type { SectorNode } from './DashboardMap';
import { SECTORS } from './DashboardMap';
import { AlertOctagon, MapPin, ChevronRight, Radio } from 'lucide-react';

interface PrioritySectorsProps {
  selectedSectorId: string;
  onSelectSector: (sector: SectorNode) => void;
}

const RISK_CONFIG = {
  CRITICAL: {
    badge: 'badge-critical',
    barColor: '#f43f5e',
    barGlow: 'rgba(244,63,94,0.4)',
    dot: '#f43f5e',
  },
  HIGH: {
    badge: 'badge-high',
    barColor: '#f97316',
    barGlow: 'rgba(249,115,22,0.3)',
    dot: '#f97316',
  },
  MODERATE: {
    badge: 'badge-moderate',
    barColor: '#f59e0b',
    barGlow: 'rgba(245,158,11,0.25)',
    dot: '#f59e0b',
  },
  LOW: {
    badge: 'badge-low',
    barColor: '#10b981',
    barGlow: 'rgba(16,185,129,0.3)',
    dot: '#10b981',
  },
};

export const PrioritySectors: React.FC<PrioritySectorsProps> = ({
  selectedSectorId,
  onSelectSector,
}) => {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)' }}>
            <AlertOctagon className="w-4 h-4" style={{ color: '#fb7185' }} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm text-white">Priority Sector Watch</h3>
            <p className="font-mono text-[10px]" style={{ color: 'rgba(100,116,139,0.8)' }}>
              Sorted by ML risk score
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg"
          style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }}>
          <Radio className="w-3 h-3 animate-pulse" />
          LIVE
        </div>
      </div>

      {/* Sector List */}
      <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
        {SECTORS.map((sec, i) => {
          const isSelected = selectedSectorId === sec.id;
          const cfg = RISK_CONFIG[sec.riskLevel];

          return (
            <div
              key={sec.id}
              onClick={() => onSelectSector(sec)}
              className="px-5 py-4 cursor-pointer relative group transition-all duration-200"
              style={{
                background: isSelected
                  ? 'rgba(16,185,129,0.08)'
                  : 'transparent',
                animationDelay: `${i * 60}ms`,
              }}
            >
              {isSelected && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-10 rounded-r"
                  style={{ background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
              )}

              {/* Hover bg */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(255,255,255,0.02)' }} />

              <div className="relative">
                {/* Row 1: Name + Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs leading-tight truncate"
                      style={{ color: isSelected ? '#e2e8f0' : '#cbd5e1' }}>
                      {sec.name}
                    </h4>
                    <div className="flex items-center gap-1 mt-1"
                      style={{ color: 'rgba(100,116,139,0.8)' }}>
                      <MapPin className="w-2.5 h-2.5 shrink-0" />
                      <span className="font-mono text-[10px] truncate">{sec.district}, {sec.state}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`${cfg.badge} font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg`}>
                      {sec.riskLevel}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity"
                      style={{ color: '#34d399' }} />
                  </div>
                </div>

                {/* Risk Score Bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px]" style={{ color: 'rgba(100,116,139,0.7)' }}>Risk Score</span>
                    <span className="font-mono text-[11px] font-bold" style={{ color: cfg.barColor }}>
                      {sec.riskScore}/100
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${sec.riskScore}%`,
                        background: `linear-gradient(90deg, ${cfg.barColor}80, ${cfg.barColor})`,
                        boxShadow: `0 0 8px ${cfg.barGlow}`,
                      }}
                    />
                  </div>
                </div>

                {/* Telemetry Row */}
                <div className="flex items-center gap-4 font-mono text-[10px]"
                  style={{ color: 'rgba(100,116,139,0.7)' }}>
                  <span>☁ <span style={{ color: '#22d3ee' }}>{sec.rainfall24h}mm</span></span>
                  <span>⛰ <span style={{ color: '#fbbf24' }}>{sec.slopeAngle}°</span></span>
                  <span style={{ color: cfg.dot }}>● {sec.lithology.split('&')[0].trim().substring(0, 14)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
