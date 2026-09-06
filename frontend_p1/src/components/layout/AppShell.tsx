import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Map,
  Bell,
  AlertTriangle,
  Database,
  Settings,
  LogOut,
  UserCheck,
  Activity,
  Cpu,
  Radio,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Satellite,
  CloudRain,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AppShellProps {
  children: React.ReactNode;
}

const navItems = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard, desc: 'Command Center' },
  { label: 'Risk Map', path: '/map', icon: Map, desc: 'Spatial GIS View', badge: '' },
  { label: 'Risk Intelligence', path: '/risk-details', icon: Cpu, desc: 'ML Breakdown' },
  { label: 'Alerts', path: '/alerts', icon: Bell, desc: 'Early Warnings', badge: '2' },
  { label: 'Field Reports', path: '/reports', icon: AlertTriangle, desc: 'Ground Truth' },
  { label: 'Inventory', path: '/inventory', icon: Database, desc: 'GSI / NRSC Data' },
];

const TICKER_MESSAGES = [
  '⚠ CRITICAL: Teesta Valley NH-10 — slope failure risk 91/100, 210mm rainfall exceeded trigger threshold',
  '⚡ ALERT: East Khasi Hills bypass — active debris slumping detected, clearance team dispatched',
  '📡 IMD FEED: Sikkim — 72h cumulative rainfall projected 340mm — immediate monitoring protocol activated',
  '🛰 ISRO InSAR: West Siang slope velocity increased 12mm/day — evacuation advisory issued',
];

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [time, setTime] = useState(new Date());
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    const tickerInterval = setInterval(() => {
      setTickerIndex((i) => (i + 1) % TICKER_MESSAGES.length);
    }, 6000);
    const clockInterval = setInterval(() => setTime(new Date()), 1000);
    return () => {
      clearInterval(tickerInterval);
      clearInterval(clockInterval);
    };
  }, []);

  return (
    <div
      className="min-h-dvh flex flex-col font-sans overflow-hidden"
      style={{ background: '#02050f', color: '#e2e8f0' }}
    >
      {/* ── TOP COMMAND HEADER ── */}
      <header
        className="h-14 glass-ultra sticky top-0 z-50 flex items-center px-5 gap-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.25) 0%, rgba(6,182,212,0.15) 100%)',
              border: '1px solid rgba(16,185,129,0.4)',
              boxShadow: '0 0 16px rgba(16,185,129,0.2)',
            }}>
            <Shield className="w-4 h-4 text-emerald-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
              style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
          </div>
          <div>
            <div className="font-heading font-extrabold text-xs tracking-[0.15em] text-white uppercase">
              TerraSentinel
            </div>
            <div className="font-mono text-[9px] tracking-widest text-slate-500 uppercase">
              Hazard Intelligence
            </div>
          </div>
        </Link>

        <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.07)' }} className="mx-1 shrink-0" />

        {/* LIVE TICKER */}
        <div className="flex-1 min-w-0 flex items-center gap-3 overflow-hidden">
          <span className="shrink-0 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md"
            style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.35)', color: '#fb7185' }}>
            LIVE
          </span>
          <div className="overflow-hidden flex-1">
            <p className="text-xs text-slate-300 font-medium truncate animate-fade-in-up" key={tickerIndex}>
              {TICKER_MESSAGES[tickerIndex]}
            </p>
          </div>
        </div>

        {/* Right: Telemetry + User */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          {/* System Status Pills */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
              <Wifi className="w-3 h-3" />
              <span>API ONLINE</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold"
              style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)', color: '#22d3ee' }}>
              <Satellite className="w-3 h-3 animate-pulse" />
              <span>IMD FEED</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#64748b' }}>
              <span>{time.toLocaleTimeString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' })} IST</span>
            </div>
          </div>

          <div style={{ width: '1px', height: '28px', background: 'rgba(255,255,255,0.07)' }} className="hidden lg:block" />

          {/* Officer */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)' }}>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold text-slate-200 leading-none">{user?.full_name || 'Field Officer'}</div>
              <div className="font-mono text-[10px] text-emerald-400 mt-0.5 uppercase tracking-wide">
                {user?.role || 'COMMANDER'}
              </div>
            </div>
          </div>

          <button
            onClick={() => { logout(); navigate('/'); }}
            title="Logout"
            className="btn-ghost p-2 rounded-lg"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ── HAZARD ALERT TICKER STRIP ── */}
      <div
        className="h-8 flex items-center px-5 gap-3 shrink-0 font-mono text-[11px]"
        style={{ background: 'rgba(244,63,94,0.05)', borderBottom: '1px solid rgba(244,63,94,0.12)' }}
      >
        <span className="flex items-center gap-1.5 font-bold shrink-0"
          style={{ color: '#fb7185' }}>
          <Radio className="w-3 h-3 animate-pulse" />
          HAZARD MONITOR
        </span>
        <span style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }} />
        <div className="flex items-center gap-6 overflow-hidden">
          <span className="text-slate-400">
            <span style={{ color: '#fb7185' }}>CRITICAL</span> &nbsp;·&nbsp; Teesta Valley NH-10 &nbsp;·&nbsp; Score: <span className="text-white font-bold">91/100</span>
          </span>
          <span className="text-slate-400 hidden md:block">
            <span style={{ color: '#fb923c' }}>HIGH</span> &nbsp;·&nbsp; Shillong Bypass NH-6 &nbsp;·&nbsp; Rain: <span className="text-cyan-400 font-bold">165.8mm</span>
          </span>
          <span className="text-slate-400 hidden xl:block">
            <CloudRain className="w-3 h-3 inline mr-1 text-cyan-400" />
            Peak 24h Rainfall: <span className="text-cyan-400 font-bold">210.4mm</span> (Teesta Gauge Network)
          </span>
        </div>
        <div className="ml-auto shrink-0 flex items-center gap-1.5" style={{ color: '#34d399' }}>
          <Activity className="w-3 h-3 animate-pulse" />
          <span className="hidden sm:block">STREAMING LIVE</span>
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── SIDEBAR ── */}
        <aside
          className="flex flex-col justify-between shrink-0 overflow-hidden z-40"
          style={{
            width: collapsed ? '60px' : '220px',
            transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            background: 'rgba(5, 9, 22, 0.95)',
            borderRight: '1px solid rgba(255,255,255,0.055)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Nav Items */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {!collapsed && (
              <div className="px-3 pt-4 pb-2">
                <span className="font-mono text-[9px] font-bold tracking-[0.2em] uppercase"
                  style={{ color: 'rgba(100,116,139,0.7)' }}>
                  Navigation
                </span>
              </div>
            )}

            {navItems.map((item) => {
              const active = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl relative transition-all duration-200 group"
                  style={{
                    background: active ? 'rgba(16,185,129,0.12)' : 'transparent',
                    border: active ? '1px solid rgba(16,185,129,0.3)' : '1px solid transparent',
                    color: active ? '#34d399' : 'rgba(148,163,184,0.9)',
                  }}
                >
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                      style={{ background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
                  )}
                  <Icon className="w-4 h-4 shrink-0 transition-colors"
                    style={{ color: active ? '#34d399' : 'rgba(100,116,139,0.9)' }} />
                  {!collapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate">{item.label}</div>
                      <div className="font-mono text-[10px] truncate" style={{ color: 'rgba(100,116,139,0.7)' }}>
                        {item.desc}
                      </div>
                    </div>
                  )}
                  {!collapsed && item.badge && (
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                      style={{ background: 'rgba(244,63,94,0.2)', border: '1px solid rgba(244,63,94,0.4)', color: '#fb7185' }}>
                      {item.badge}
                    </span>
                  )}
                  {/* Hover glow */}
                  {!active && (
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-2 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            {!collapsed && (
              <div className="mx-1 mb-2 p-2.5 rounded-xl"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px]" style={{ color: 'rgba(100,116,139,0.8)' }}>AI Model Status</span>
                  <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                </div>
                <div className="font-mono text-[11px] font-bold" style={{ color: '#34d399' }}>
                  ner-risk-v1.4 • LIVE
                </div>
                <div className="font-mono text-[10px]" style={{ color: 'rgba(100,116,139,0.7)' }}>
                  Latency: &lt;5s
                </div>
              </div>
            )}
            <Link to="/dashboard"
              className="flex items-center gap-3 px-3 py-2 rounded-xl w-full text-left transition-all duration-200"
              style={{ color: 'rgba(100,116,139,0.8)' }}
              title={collapsed ? 'Settings' : undefined}
            >
              <Settings className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="text-xs font-semibold">System Settings</span>}
            </Link>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl w-full transition-all duration-200 mt-1"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                color: 'rgba(100,116,139,0.8)',
              }}
            >
              {collapsed ? <ChevronRight className="w-4 h-4 mx-auto" /> : (
                <>
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold">Collapse</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden relative page-enter"
          style={{ background: 'rgba(2, 5, 15, 0.98)' }}
        >
          {/* Ambient background glow orbs */}
          <div className="fixed pointer-events-none inset-0 overflow-hidden z-0">
            <div className="absolute top-0 left-1/3 w-[600px] h-[400px] rounded-full opacity-30 animate-ambient"
              style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', filter: 'blur(60px)' }} />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[300px] rounded-full opacity-20 animate-ambient"
              style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', filter: 'blur(60px)', animationDelay: '2s' }} />
          </div>

          <div className="relative z-10 p-5 lg:p-7">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
