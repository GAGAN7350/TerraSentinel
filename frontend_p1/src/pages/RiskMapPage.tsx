import React, { useState, useMemo } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { MapFilterBar } from '../components/risk-map/MapFilterBar';
import { RiskMapViewer } from '../components/risk-map/RiskMapViewer';
import { SectorDetailsDrawer } from '../components/risk-map/SectorDetailsDrawer';
import { MOCK_SECTORS } from '../services/api';
import type { RiskSector, RiskLevel } from '../types';
import { ShieldAlert } from 'lucide-react';

export const RiskMapPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('All States');
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | 'ALL'>('ALL');
  const [activeLayer, setActiveLayer] = useState<'heatmap' | 'nodes' | 'rainfall' | 'topo'>('nodes');
  const [isBboxMode, setIsBboxMode] = useState<boolean>(false);
  const [selectedSector, setSelectedSector] = useState<RiskSector | null>(MOCK_SECTORS[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filtered sectors logic
  const filteredSectors = useMemo(() => {
    return MOCK_SECTORS.filter((sec: RiskSector) => {
      // Search
      const matchesSearch =
        sec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.state.toLowerCase().includes(searchQuery.toLowerCase());

      // State
      const matchesState = selectedState === 'All States' || sec.state === selectedState;

      // Risk
      const matchesRisk = selectedRisk === 'ALL' || sec.riskLevel === selectedRisk;

      return matchesSearch && matchesState && matchesRisk;
    });
  }, [searchQuery, selectedState, selectedRisk]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedState('All States');
    setSelectedRisk('ALL');
    setIsBboxMode(false);
  };

  const handleIssueAlert = (sec: RiskSector) => {
    setToastMessage(`Early Warning Alert broadcasted for ${sec.name} (${sec.riskLevel} Level)!`);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <AppShell>
      <div className="relative w-full h-[calc(100vh-5rem)] flex flex-col gap-4 p-4 lg:p-6 overflow-hidden">
        {/* Top Floating Filter Bar */}
        <MapFilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedState={selectedState}
          onStateChange={setSelectedState}
          selectedRisk={selectedRisk}
          onRiskChange={setSelectedRisk}
          activeLayer={activeLayer}
          onLayerChange={setActiveLayer}
          isBboxMode={isBboxMode}
          onToggleBboxMode={() => setIsBboxMode(!isBboxMode)}
          onResetFilters={handleResetFilters}
          filteredCount={filteredSectors.length}
        />

        {/* GIS Canvas Container */}
        <div className="relative flex-1 w-full rounded-2xl overflow-hidden shadow-2xl">
          <RiskMapViewer
            sectors={filteredSectors}
            selectedSector={selectedSector}
            onSelectSector={setSelectedSector}
            activeLayer={activeLayer}
            isBboxMode={isBboxMode}
          />
        </div>

        {/* Sector Details Slide-over Drawer */}
        <SectorDetailsDrawer
          sector={selectedSector}
          onClose={() => setSelectedSector(null)}
          onIssueAlert={handleIssueAlert}
        />

        {/* Floating Broadcast Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-rose-600 to-amber-600 border border-rose-400 text-white rounded-2xl shadow-2xl z-50 animate-bounce">
            <ShieldAlert className="w-5 h-5" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}
      </div>
    </AppShell>
  );
};
