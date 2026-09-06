import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Activity,
  CloudRain,
  Cpu,
  Bell,
  ArrowRight,
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
    <div className="min-h-screen bg-[#040711] text-slate-100 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* HERO SECTION WITH AMBIENT BACKDROP GLOW & 3D TERRAIN CANVAS */}
      <section className="relative min-h-[92vh] flex items-center pt-28 pb-16 px-6 lg:px-12 overflow-hidden">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

        <TerrainCanvas />

        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-7">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/[0.08] border border-emerald-500/25 text-emerald-400 text-xs font-semibold backdrop-blur-xl">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="font-mono tracking-wider">GEOSPATIAL HAZARD INTELLIGENCE • NER SECTOR</span>
            </div>

            <h1 className="font-heading font-bold text-5xl sm:text-6xl md:text-7xl leading-[1.05] tracking-tight text-white">
              Know the slope. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Before it moves.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl font-normal leading-relaxed">
              AI-powered landslide early-warning and slope stability intelligence for North-East India. Integrating GSI historical inventories, IMD precipitation streams, and physics-informed machine learning.
            </p>

            {/* Hero Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/map')}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold tracking-wider transition-all transform hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(16,185,129,0.25)] flex items-center gap-2.5"
              >
                <span>EXPLORE INTERACTIVE RISK MAP</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/alerts')}
                className="px-7 py-4 rounded-2xl bg-[#0b1120]/80 border border-white/[0.1] hover:border-emerald-500/40 text-slate-200 hover:text-white text-xs font-semibold transition duration-300 backdrop-blur-xl flex items-center gap-2.5 shadow-xl"
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span>VIEW LIVE ALERTS</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/[0.08] max-w-lg">
              <div>
                <div className="text-2xl font-bold font-heading text-white">8 States</div>
                <div className="text-xs text-slate-400 mt-0.5">NER Regional Coverage</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-heading text-cyan-400">10,000+</div>
                <div className="text-xs text-slate-400 mt-0.5">GSI Inventory Catalog</div>
              </div>
              <div>
                <div className="text-2xl font-bold font-heading text-emerald-400">&lt; 5s</div>
                <div className="text-xs text-slate-400 mt-0.5">Inference Stream Latency</div>
              </div>
            </div>
          </div>

          {/* Right Live Stream Card */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="glass-panel p-7 rounded-3xl border border-white/[0.1] space-y-5 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">Live Monitoring Stream</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-bold">
                  SHILLONG BASIN
                </span>
              </div>

              <div className="space-y-3.5">
                <div className="p-4 rounded-2xl bg-[#0b1120]/80 border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                      <CloudRain className="w-4.5 h-4.5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">24h Rainfall Intensity</div>
                      <div className="text-[11px] text-slate-400">IMD Station Network</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-sm text-cyan-400">210.4 mm</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0b1120]/80 border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                      <Activity className="w-4.5 h-4.5 text-rose-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">Predicted Slope Risk</div>
                      <div className="text-[11px] text-slate-400">East Khasi Hills Sector</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-rose-400 px-3 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30">
                    91/100 • CRITICAL
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-[#0b1120]/80 border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <Cpu className="w-4.5 h-4.5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">ML Model Version</div>
                      <div className="text-[11px] text-slate-400">Physics-Informed Ensemble</div>
                    </div>
                  </div>
                  <span className="font-mono font-semibold text-xs text-emerald-400">ner-risk-v1.4</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-xs font-bold text-slate-200 transition duration-300 flex items-center justify-center gap-2 border border-white/[0.08]"
              >
                <span>OPEN COMMAND CONSOLE</span>
                <ChevronRight className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE HAZARD TICKER BAR */}
      <section className="bg-[#060a17]/90 border-y border-white/[0.08] py-3.5 px-6 lg:px-12 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 font-mono font-bold text-[10px]">
              HAZARD ALERT
            </span>
            <span className="font-semibold text-slate-200">
              East Khasi Hills (NH-6): Critical slope failure risk triggered by 210mm rain accumulation.
            </span>
          </div>
          <button
            onClick={() => navigate('/alerts')}
            className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1.5 shrink-0 transition"
          >
            <span>View All Regional Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 4-STEP INTELLIGENCE PIPELINE */}
      <section className="py-24 px-6 lg:px-12 relative max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-white">
            Terrain → Data → AI → Warning
          </h2>
          <p className="text-sm text-slate-400">
            End-to-end early warning pipeline transforming spatial parameters into real-time hazard intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-heading font-bold text-xl">
              01
            </div>
            <h3 className="font-heading font-bold text-white text-lg">Terrain Acquisition</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-resolution DEM models, slope gradients, lithology, and historical GSI landslide inventories.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-heading font-bold text-xl">
              02
            </div>
            <h3 className="font-heading font-bold text-white text-lg">Environmental Feeds</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time precipitation feeds from IMD gauges, satellite GPM IMERG grid cells, and 24h/72h rainfall accumulation.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-heading font-bold text-xl">
              03
            </div>
            <h3 className="font-heading font-bold text-white text-lg">Explainable AI Scoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Physics-informed ML models computing slope stability risk scores (0–100) with factor weight attributions.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/[0.07] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-heading font-bold text-xl">
              04
            </div>
            <h3 className="font-heading font-bold text-white text-lg">Early Warning Dispatch</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated alerts, GIS risk maps, and ground-truth field observations for district emergency response.
            </p>
          </div>
        </div>
      </section>

      {/* RISK SIMULATOR SECTION */}
      <section className="py-12 px-6 lg:px-12 max-w-7xl mx-auto">
        <RiskSimulator />
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.08] bg-[#030509] py-12 px-6 lg:px-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="font-heading font-bold text-white text-base">TERRASENTINEL</span>
            <span className="text-slate-500">| North-East India Early-Warning System</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>API Status: <strong className="text-slate-200">{healthStatus}</strong></span>
            </div>
            <span>FastAPI + PostGIS 16</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
