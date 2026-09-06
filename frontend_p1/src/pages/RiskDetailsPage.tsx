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
  Cpu,
  ChevronDown,
} from 'lucide-react';

const RISK_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  CRITICAL: { color: '#fb7185', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.4)' },
  HIGH: { color: '#fb923c', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.4)' },
  MODERATE: { color: '#fbbf24', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)' },
  LOW: { color: '#34d399', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.35)' },
};

export const RiskDetailsPage: React.FC = () => {
  const [selectedSector, setSelectedSector] = useState<RiskSector>(MOCK_SECTORS[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleExportPDF = () => {
    setToastMessage(`Technical Hazard Assessment PDF generated for ${selectedSector.name}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const riskCfg = RISK_COLORS[selectedSector.riskLevel] || RISK_COLORS.MODERATE;

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* ── PAGE HEADER ── */}
        <div className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'rgba(11,17,32,0.8)',
            border: `1px solid ${riskCfg.border}`,
            boxShadow: `0 0 40px ${riskCfg.bg}, 0 8px 32px rgba(0,0,0,0.4)`,
          }}>
          {/* Accent top bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5"
            style={{ background: `linear-gradient(90deg, ${riskCfg.color}, ${riskCfg.color}40, transparent)` }} />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', boxShadow: '0 0 20px rgba(16,185,129,0.15)' }}>
                <BrainCircuit className="w-5.5 h-5.5" style={{ color: '#34d399' }} />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="font-heading font-extrabold text-xl text-white leading-none">
                    Risk Intelligence & ML Explainability
                  </h1>
                  <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: riskCfg.bg, border: `1px solid ${riskCfg.border}`, color: riskCfg.color }}>
                    {selectedSector.riskLevel} · {selectedSector.riskScore}/100
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]"
                  style={{ color: 'rgba(100,116,139,0.8)' }}>
                  <MapPin className="w-3 h-3" style={{ color: '#34d399' }} />
                  <span>{selectedSector.name} · {selectedSector.district}, {selectedSector.state}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Sector Selector */}
              <div className="relative">
                <select
                  value={selectedSector.id}
                  onChange={(e) => {
                    const found = MOCK_SECTORS.find((s) => s.id === e.target.value);
                    if (found) setSelectedSector(found);
                  }}
                  className="appearance-none pr-8 pl-3.5 py-2 rounded-xl text-xs cursor-pointer outline-none"
                  style={{
                    background: 'rgba(9,15,33,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#e2e8f0',
                  }}
                >
                  {MOCK_SECTORS.map((s) => (
                    <option key={s.id} value={s.id} style={{ background: '#09111f' }}>
                      {s.name.substring(0, 28)} ({s.riskLevel})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                  style={{ color: 'rgba(100,116,139,0.7)' }} />
              </div>

              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all"
                style={{
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.3)',
                  color: '#34d399',
                }}
              >
                <FileText className="w-3.5 h-3.5" />
                Export PDF
              </button>
            </div>
          </div>

          {/* Telemetry quick stats */}
          <div className="grid grid-cols-3 gap-4 mt-5 pt-5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { label: '24h Rainfall', value: `${selectedSector.rainfall24h}mm`, color: '#22d3ee' },
              { label: 'Slope Angle', value: `${selectedSector.slopeAngle}°`, color: '#fbbf24' },
              { label: 'Lithology', value: selectedSector.lithology?.split('&')[0].trim().substring(0, 18) || 'N/A', color: '#a78bfa' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="font-mono text-[10px] uppercase tracking-wider"
                  style={{ color: 'rgba(100,116,139,0.65)' }}>
                  {label}
                </span>
                <span className="font-heading font-bold text-lg" style={{ color }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── MODEL INFO STRIP ── */}
        <div className="flex items-center gap-4 px-5 py-3 rounded-2xl font-mono text-[11px]"
          style={{ background: 'rgba(9,15,33,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Cpu className="w-4 h-4" style={{ color: '#34d399' }} />
          <span style={{ color: '#34d399' }}>ML Model: ner-risk-v1.4</span>
          <span style={{ color: 'rgba(100,116,139,0.4)' }}>·</span>
          <span style={{ color: 'rgba(148,163,184,0.7)' }}>Physics-Informed Ensemble (LSTM + XGBoost + InSAR)</span>
          <span style={{ color: 'rgba(100,116,139,0.4)' }}>·</span>
          <span style={{ color: 'rgba(148,163,184,0.7)' }}>Training: 10,847 GSI records · Accuracy: 91.4%</span>
          <span style={{ color: 'rgba(100,116,139,0.4)' }} className="ml-auto">·</span>
          <span style={{ color: '#34d399' }}>ONLINE</span>
        </div>

        {/* ── 2-COLUMN GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FactorWeightChart
              rainfall24h={selectedSector.rainfall24h}
              slopeAngle={selectedSector.slopeAngle}
            />
            <ThresholdCurve rainfall24h={selectedSector.rainfall24h} />
          </div>
          <div className="space-y-6">
            <RiskSimulatorCard
              initialRainfall={selectedSector.rainfall24h}
              initialSlope={selectedSector.slopeAngle}
            />
            <ImpactAssessment />
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl z-50 animate-bounce"
            style={{ background: 'rgba(16,185,129,0.9)', border: '1px solid rgba(52,211,153,0.6)', color: 'white' }}>
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}
      </div>
    </AppShell>
  );
};
