import React, { useState } from 'react';
import { AppShell } from '../components/layout/AppShell';
import { FactorWeightChart } from '../components/risk-details/FactorWeightChart';
import { ThresholdCurve } from '../components/risk-details/ThresholdCurve';
import { RiskSimulatorCard } from '../components/risk-details/RiskSimulatorCard';
import { ImpactAssessment } from '../components/risk-details/ImpactAssessment';
import { MOCK_SECTORS } from '../services/api';
import type { RiskSector } from '../types';
import {
  BrainCircuit,
  FileText,
  CheckCircle2,
  MapPin,
} from 'lucide-react';

export const RiskDetailsPage: React.FC = () => {
  const [selectedSector, setSelectedSector] = useState<RiskSector>(MOCK_SECTORS[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleExportPDF = () => {
    setToastMessage(`Generated Technical Hazard Assessment PDF for ${selectedSector.name}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Top Intelligence Bar */}
        <div className="bg-[#0b1329]/90 border border-[#1e293b] rounded-2xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
              <BrainCircuit className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-white tracking-wide">Risk Intelligence & ML Explainability</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs">
                  {selectedSector.riskLevel} {selectedSector.riskScore}/100
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedSector.name} • {selectedSector.district}, {selectedSector.state}</span>
              </p>
            </div>
          </div>

          {/* Sector Selector & Actions */}
          <div className="flex items-center gap-3">
            <select
              value={selectedSector.id}
              onChange={(e) => {
                const found = MOCK_SECTORS.find((s) => s.id === e.target.value);
                if (found) setSelectedSector(found);
              }}
              className="bg-[#111c38] border border-[#1e293b] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
            >
              {MOCK_SECTORS.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#0b1329]">
                  {s.name} ({s.riskLevel})
                </option>
              ))}
            </select>

            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-[#111c38] hover:bg-[#1a274c] border border-[#1e293b] text-slate-200 hover:text-white text-xs font-semibold rounded-xl transition"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Factor Weights & Rainfall Threshold */}
          <div className="space-y-6">
            <FactorWeightChart
              rainfall24h={selectedSector.rainfall24h}
              slopeAngle={selectedSector.slopeAngle}
            />
            <ThresholdCurve rainfall24h={selectedSector.rainfall24h} />
          </div>

          {/* Right Column: Interactive Risk Simulator & Impact Assessment */}
          <div className="space-y-6">
            <RiskSimulatorCard
              initialRainfall={selectedSector.rainfall24h}
              initialSlope={selectedSector.slopeAngle}
            />
            <ImpactAssessment />
          </div>
        </div>

        {/* Export Toast */}
        {toastMessage && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 bg-emerald-600 border border-emerald-400 text-white rounded-2xl shadow-2xl z-50 animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}
      </div>
    </AppShell>
  );
};
