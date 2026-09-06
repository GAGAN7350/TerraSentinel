import React, { useState, useEffect } from 'react';
import { ShieldAlert, Mountain, AlertTriangle, CloudRain, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiItem {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  accentColor: string;
  glowColor: string;
  borderColor: string;
  bgColor: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  critical?: boolean;
}

const kpis: KpiItem[] = [
  {
    label: 'Regional Risk Index',
    value: '91/100',
    sub: 'East Khasi Hills • Teesta Basin',
    icon: ShieldAlert,
    accentColor: '#fb7185',
    glowColor: 'rgba(244,63,94,0.2)',
    borderColor: 'rgba(244,63,94,0.3)',
    bgColor: 'rgba(244,63,94,0.07)',
    trend: 'up',
    trendValue: '+7 pts (3h)',
    critical: true,
  },
  {
    label: 'Active Monitored Slopes',
    value: '14',
    sub: 'Continuous InSAR + Gauge Feed',
    icon: Mountain,
    accentColor: '#34d399',
    glowColor: 'rgba(16,185,129,0.2)',
    borderColor: 'rgba(16,185,129,0.3)',
    bgColor: 'rgba(16,185,129,0.07)',
    trend: 'stable',
    trendValue: 'No change',
  },
  {
    label: 'Dispatched Warnings',
    value: '2',
    sub: 'EOC Radio 142.85 MHz • SMS',
    icon: AlertTriangle,
    accentColor: '#fbbf24',
    glowColor: 'rgba(245,158,11,0.2)',
    borderColor: 'rgba(245,158,11,0.3)',
    bgColor: 'rgba(245,158,11,0.07)',
    trend: 'up',
    trendValue: '+1 issued today',
  },
  {
    label: 'Peak 24h Rainfall',
    value: '210.4mm',
    sub: 'Teesta + Shillong Gauge Network',
    icon: CloudRain,
    accentColor: '#22d3ee',
    glowColor: 'rgba(6,182,212,0.2)',
    borderColor: 'rgba(6,182,212,0.3)',
    bgColor: 'rgba(6,182,212,0.07)',
    trend: 'down',
    trendValue: '-18mm vs 6h ago',
  },
];

export const KpiStrip: React.FC = () => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;
        const trendColor = kpi.trend === 'up' ? '#fb7185' : kpi.trend === 'down' ? '#34d399' : '#64748b';

        return (
          <div
            key={kpi.label}
            className="relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1"
            style={{
              background: kpi.bgColor,
              border: `1px solid ${kpi.borderColor}`,
              boxShadow: `0 0 30px ${kpi.glowColor}, 0 8px 32px rgba(0,0,0,0.4)`,
              opacity: animated ? 1 : 0,
              transform: animated ? 'translateY(0)' : 'translateY(12px)',
              transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 80}ms`,
            }}
          >
            {/* Top edge shimmer */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${kpi.accentColor}60, transparent)` }} />

            {kpi.critical && (
              <div className="absolute top-3 right-3 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ background: kpi.accentColor }} />
                <span className="relative inline-flex rounded-full h-2 w-2"
                  style={{ background: kpi.accentColor }} />
              </div>
            )}

            <div className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="font-mono text-[10px] font-semibold tracking-[0.12em] uppercase mb-2"
                    style={{ color: 'rgba(148,163,184,0.65)' }}>
                    {kpi.label}
                  </div>
                  <div className="font-heading font-black text-3xl leading-none tracking-tight text-white">
                    {kpi.value}
                  </div>
                </div>
                <div className="rounded-xl p-2.5 shrink-0"
                  style={{
                    background: `${kpi.accentColor}15`,
                    border: `1px solid ${kpi.accentColor}30`,
                  }}>
                  <Icon className="w-5 h-5" style={{ color: kpi.accentColor }} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: 'rgba(148,163,184,0.6)' }}>
                  {kpi.sub}
                </span>
                <div className="flex items-center gap-1"
                  style={{ color: trendColor }}>
                  <TrendIcon className="w-3 h-3" />
                  <span className="font-mono text-[10px] font-semibold">{kpi.trendValue}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
