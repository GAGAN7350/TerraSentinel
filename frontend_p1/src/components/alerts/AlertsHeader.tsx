import React from 'react';
import { Search, PlusCircle, Bell, AlertTriangle, Info, Shield, Zap } from 'lucide-react';
import type { AlertSeverity } from '../../types';

interface AlertsHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedSeverity: AlertSeverity | 'ALL';
  onSeverityChange: (sev: AlertSeverity | 'ALL') => void;
  onOpenCreateModal: () => void;
  counts: { critical: number; warning: number; info: number; total: number };
}

const STAT_CARDS = (counts: AlertsHeaderProps['counts']) => [
  {
    label: 'Total Alerts',
    value: counts.total,
    icon: Shield,
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.08)',
    border: 'rgba(148,163,184,0.2)',
  },
  {
    label: 'Critical Hazard',
    value: counts.critical,
    icon: AlertTriangle,
    color: '#fb7185',
    bg: 'rgba(244,63,94,0.1)',
    border: 'rgba(244,63,94,0.3)',
    pulse: true,
  },
  {
    label: 'Warnings',
    value: counts.warning,
    icon: Zap,
    color: '#fbbf24',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.25)',
  },
  {
    label: 'Advisories',
    value: counts.info,
    icon: Info,
    color: '#22d3ee',
    bg: 'rgba(6,182,212,0.1)',
    border: 'rgba(6,182,212,0.25)',
  },
];

const SEV_PILLS = [
  { key: 'ALL', label: 'All' },
  { key: 'CRITICAL', label: 'Critical', color: '#fb7185', bg: 'rgba(244,63,94,0.15)', border: 'rgba(244,63,94,0.4)' },
  { key: 'HIGH', label: 'High', color: '#fb923c', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.4)' },
  { key: 'WARNING', label: 'Warning', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.35)' },
  { key: 'INFO', label: 'Info', color: '#22d3ee', bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.3)' },
] as const;

export const AlertsHeader: React.FC<AlertsHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedSeverity,
  onSeverityChange,
  onOpenCreateModal,
  counts,
}) => {
  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.35)', boxShadow: '0 0 20px rgba(244,63,94,0.15)' }}>
            <Bell className="w-5 h-5" style={{ color: '#fb7185' }} />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-xl text-white leading-none mb-1">
              Early Warning Broadcasts
            </h1>
            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.65)' }}>
              Real-time alert dispatch · Threshold monitoring · EOC coordination
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all"
          style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #d97706 100%)',
            color: '#fff',
            border: '1px solid rgba(220,38,38,0.5)',
            boxShadow: '0 0 24px rgba(220,38,38,0.25), 0 4px 12px rgba(0,0,0,0.4)',
            letterSpacing: '0.05em',
          }}
        >
          <PlusCircle className="w-4 h-4" />
          Broadcast Emergency Alert
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS(counts).map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-2xl p-4 relative overflow-hidden"
              style={{ background: card.bg, border: `1px solid ${card.border}` }}>
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${card.color}50, transparent)` }} />
              {card.pulse && (
                <div className="absolute top-3 right-3 flex h-2 w-2">
                  <span className="animate-ping absolute h-full w-full rounded-full opacity-75"
                    style={{ background: card.color }} />
                  <span className="relative rounded-full h-2 w-2" style={{ background: card.color }} />
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-[10px] font-semibold mb-2 uppercase tracking-wider"
                    style={{ color: 'rgba(148,163,184,0.6)' }}>
                    {card.label}
                  </div>
                  <div className="font-heading font-black text-3xl leading-none" style={{ color: card.color }}>
                    {card.value}
                  </div>
                </div>
                <Icon className="w-5 h-5 shrink-0" style={{ color: card.color, opacity: 0.8 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Search + Filter */}
      <div className="glass-panel rounded-2xl p-4 flex flex-wrap items-center gap-3"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'rgba(100,116,139,0.7)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search alerts by title, state, or district..."
            className="input-field w-full pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl"
          style={{ background: 'rgba(9,15,33,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {SEV_PILLS.map((pill) => {
            const active = selectedSeverity === pill.key;
            return (
              <button
                key={pill.key}
                onClick={() => onSeverityChange(pill.key as any)}
                className="px-3 py-1.5 rounded-lg font-mono text-[11px] font-semibold transition-all"
                style={active && 'color' in pill ? {
                  background: pill.bg,
                  border: `1px solid ${pill.border}`,
                  color: pill.color,
                } : active ? {
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#e2e8f0',
                } : {
                  color: 'rgba(100,116,139,0.8)',
                  border: '1px solid transparent',
                }}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
