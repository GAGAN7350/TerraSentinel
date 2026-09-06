import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { KpiStrip } from '../components/dashboard/KpiStrip';
import { DashboardMap, type SectorNode, SECTORS } from '../components/dashboard/DashboardMap';
import { PrioritySectors } from '../components/dashboard/PrioritySectors';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { PlusCircle, Activity, Shield, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [selectedSector, setSelectedSector] = useState<SectorNode>(SECTORS[0]);
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="space-y-6 pb-4">
        {/* ── PAGE HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <Shield className="w-4 h-4" style={{ color: '#34d399' }} />
              </div>
              <div>
                <h1 className="font-heading font-extrabold text-xl text-white leading-none">
                  Officer Operations Command
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded"
                    style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
                    MAP FIRST
                  </span>
                  <span className="font-mono text-[10px]" style={{ color: 'rgba(100,116,139,0.7)' }}>
                    NER Spatial Risk Intelligence Console
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl font-mono text-[11px]"
              style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', color: '#34d399' }}>
              <Activity className="w-3 h-3 animate-pulse" />
              <span>STREAMING LIVE</span>
            </div>

            <button
              onClick={() => navigate('/alerts')}
              className="btn-ghost flex items-center gap-2"
            >
              <Zap className="w-3.5 h-3.5" style={{ color: '#fbbf24' }} />
              <span>Issue Alert</span>
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="btn-primary flex items-center gap-2"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Submit Observation</span>
            </button>
          </div>
        </div>

        {/* ── KPI STRIP ── */}
        <KpiStrip />

        {/* ── MAP + SIDEBAR ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Map Canvas - 8 columns */}
          <div className="lg:col-span-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            {/* Map sub-header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-bold text-sm text-slate-200">
                  Interactive GIS Risk Map
                </h2>
                <span className="font-mono text-[10px]" style={{ color: 'rgba(100,116,139,0.6)' }}>
                  North-East India · 8 States Coverage
                </span>
              </div>
              <button
                onClick={() => navigate('/map')}
                className="font-mono text-[11px] font-semibold flex items-center gap-1.5 transition-colors"
                style={{ color: '#34d399' }}
              >
                Open Full GIS View →
              </button>
            </div>
            <DashboardMap
              selectedSectorId={selectedSector.id}
              onSelectSector={(sec) => setSelectedSector(sec)}
            />
          </div>

          {/* Right column - 4 columns */}
          <div className="lg:col-span-4 space-y-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <PrioritySectors
              selectedSectorId={selectedSector.id}
              onSelectSector={(sec) => setSelectedSector(sec)}
            />
            <RecentActivity />
          </div>
        </div>
      </div>
    </AppShell>
  );
};
