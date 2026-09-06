import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { KpiStrip } from '../components/dashboard/KpiStrip';
import { DashboardMap, type SectorNode, SECTORS } from '../components/dashboard/DashboardMap';
import { PrioritySectors } from '../components/dashboard/PrioritySectors';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [selectedSector, setSelectedSector] = useState<SectorNode>(SECTORS[0]);
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Operational Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                Officer Operations Command
              </h1>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold uppercase">
                MAP FIRST
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              North-East India Spatial Risk Intelligence & Early Warning Dispatch Console
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/reports')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>SUBMIT FIELD OBSERVATION</span>
            </button>
          </div>
        </div>

        {/* Compact KPI Summary Strip */}
        <KpiStrip />

        {/* MAP FIRST MAIN DOMINANT VIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Map Canvas (Dominates 8 Columns) */}
          <div className="lg:col-span-8">
            <DashboardMap
              selectedSectorId={selectedSector.id}
              onSelectSector={(sec) => setSelectedSector(sec)}
            />
          </div>

          {/* Side Priority & Feed Column (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
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
