import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Activity,
  CloudRain,
  Cpu,
  Bell,
  ArrowRight,
  Database,
  AlertTriangle,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Navbar } from '../components/landing/Navbar';
import { TerrainCanvas } from '../components/landing/TerrainCanvas';
import { RiskSimulator } from '../components/landing/RiskSimulator';
import { ApiService } from '../services/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [healthStatus, setHealthStatus] = useState<string>('checking...');

  useEffect(() => {
    ApiService.checkHealth().then((res) => {
      setHealthStatus(res.status);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#07090E] text-gray-100 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-gray-950">
      {/* Top Navbar */}
      <Navbar />

      {/* HERO SECTION WITH 3D TOPOGRAPHIC TERRAIN CANVAS */}
      <section className="relative min-h-[90vh] flex items-center pt-28 pb-16 px-4 sm:px-8">
        <TerrainCanvas />

        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Copy */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>GEOSPATIAL HAZARD INTELLIGENCE FOR NORTH-EAST INDIA</span>
            </div>

            <h1 className="font-heading font-extrabold text-5xl sm:text-6xl md:text-7xl leading-[1.08] tracking-tight text-white">
              Know the slope. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Before it moves.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 max-w-xl font-normal leading-relaxed">
              AI-powered landslide early-warning and risk-monitoring platform for the North Eastern Region of India. Integrating historical GSI inventories, satellite precipitation, and physics-informed machine learning.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/map')}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 text-sm font-bold transition-all transform hover:scale-[1.02] active:scale-95 shadow-xl shadow-emerald-500/20 flex items-center gap-2"
              >
                <span>EXPLORE RISK MAP</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/alerts')}
                className="px-6 py-3.5 rounded-xl bg-slate-900/80 border border-white/15 hover:border-emerald-500/40 text-gray-200 hover:text-white text-sm font-semibold transition-all backdrop-blur-md flex items-center gap-2"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span>VIEW ACTIVE ALERTS</span>
              </button>
            </div>

            {/* Quick Metrics Pills */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-lg">
              <div>
                <div className="text-2xl font-bold font-heading text-white">8 States</div>
                <div className="text-xs text-gray-400">NER Regional Scope</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-heading text-cyan-400">10,000+</div>
                <div className="text-xs text-gray-400">GSI Slide Inventory</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-heading text-emerald-400">&lt; 5s</div>
                <div className="text-xs text-gray-400">Inference Latency</div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Live Telemetry Badge */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="glass-panel p-6 rounded-2xl border border-white/15 space-y-4 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">Live Monitoring Stream</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  SHILLONG BASIN
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CloudRain className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">24h Rainfall Intensity</div>
                      <div className="text-[11px] text-gray-400">IMD Station Network</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-sm text-cyan-400">210.4 mm</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">Predicted Slope Risk</div>
                      <div className="text-[11px] text-gray-400">East Khasi Hills Sector</div>
                    </div>
                  </div>
                  <span className="font-mono font-extrabold text-sm text-red-400 px-2 py-1 rounded bg-red-500/10 border border-red-500/30">
                    91 / 100 • CRITICAL
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/70 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-5 h-5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-semibold text-white">ML Model Version</div>
                      <div className="text-[11px] text-gray-400">Physics-Informed Ensemble</div>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-xs text-emerald-400">ner-risk-v1.4</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/map')}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <span>OPEN INTERACTIVE DASHBOARD</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE HAZARD TICKER BAR */}
      <section className="bg-slate-900/90 border-y border-white/10 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-red-400 font-bold uppercase text-[10px]">
              HAZARD ALERT
            </span>
            <span className="font-semibold text-gray-200">
              East Khasi Hills (NH-6): Critical landslide risk triggered by 210mm rain.
            </span>
          </div>
          <button
            onClick={() => navigate('/alerts')}
            className="text-emerald-400 hover:underline font-semibold flex items-center gap-1 shrink-0"
          >
            <span>View All Regional Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* INTERACTIVE 4-STEP INTELLIGENCE PIPELINE */}
      <section className="py-24 px-4 sm:px-8 relative max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            Terrain → Data → AI → Warning
          </h2>
          <p className="text-sm text-gray-400">
            TerraSentinel’s end-to-end early warning pipeline transforms raw spatial parameters into actionable risk intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-heading font-bold text-xl">
              01
            </div>
            <h3 className="font-heading font-bold text-white text-lg">Terrain Acquisition</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              High-resolution DEM elevation models, slope gradients, soil composition, and GSI historical landslide inventories.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-heading font-bold text-xl">
              02
            </div>
            <h3 className="font-heading font-bold text-white text-lg">Environmental Streams</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Real-time precipitation feeds from IMD weather gauges, satellite GPM IMERG, and 24h/72h rainfall accumulation trackers.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-heading font-bold text-xl">
              03
            </div>
            <h3 className="font-heading font-bold text-white text-lg">Explainable AI Scoring</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Physics-informed ML models compute slope stability risk scores (0–100) with confidence intervals and contributing factor breakdowns.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-heading font-bold text-xl">
              04
            </div>
            <h3 className="font-heading font-bold text-white text-lg">Early Warning Dispatch</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Automated alerts, GIS risk maps, and field report synchronization for emergency officers and district administrations.
            </p>
          </div>
        </div>
      </section>

      {/* INTERACTIVE RISK SIMULATOR SECTION */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <RiskSimulator />
      </section>

      {/* SCIENTIFIC FEATURES GRID */}
      <section className="py-24 px-4 sm:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            Built for Operational Precision
          </h2>
          <p className="text-sm text-gray-400">
            Designed specifically for North-East India’s rugged terrain, intense monsoon precipitation, and critical transport corridors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-7 rounded-2xl border border-white/10 space-y-4">
            <Database className="w-8 h-8 text-emerald-400" />
            <h3 className="font-heading font-bold text-white text-xl">GSI Historical Inventory</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Normalized storage and API access for historical landslide records, movement types, material involved, and highway locations.
            </p>
          </div>

          <div className="glass-card p-7 rounded-2xl border border-white/10 space-y-4">
            <CloudRain className="w-8 h-8 text-cyan-400" />
            <h3 className="font-heading font-bold text-white text-xl">Rainfall Monitoring</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Multi-source precipitation modeling combining IMD ground gauge observations and satellite grid cell data.
            </p>
          </div>

          <div className="glass-card p-7 rounded-2xl border border-white/10 space-y-4">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
            <h3 className="font-heading font-bold text-white text-xl">Field Officer Mobile Workflow</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Ground-truth report submissions for field officers observing tension cracks, slope movements, and road blockages.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#05070B] py-12 px-4 sm:px-8 text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="font-heading font-bold text-white text-base">TERRASENTINEL</span>
            <span className="text-gray-500">| North-East India Landslide Early-Warning System</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Backend API Status: <strong className="text-gray-200">{healthStatus}</strong></span>
            </div>
            <span>FastAPI + PostGIS 16</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
