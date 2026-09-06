import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  Map,
  Bell,
  AlertTriangle,
  Database,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCheck,
  Search,
  Activity,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Risk Map', path: '/map', icon: Map },
    { label: 'Risk Intelligence', path: '/risk-details', icon: Cpu },
    { label: 'Alerts', path: '/alerts', icon: Bell, badge: '2' },
    { label: 'Field Reports', path: '/reports', icon: AlertTriangle },
    { label: 'Landslide Inventory', path: '/inventory', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-[#040711] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Sleek Ambient Glowing Header */}
      <header className="h-16 border-b border-white/[0.08] bg-[#060a17]/80 backdrop-blur-xl sticky top-0 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10 group-hover:border-emerald-400/60 transition duration-300">
              <Shield className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-sm tracking-wider text-white flex items-center gap-1.5">
                TERRASENTINEL
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </span>
              <span className="text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                AI HAZARD PLATFORM
              </span>
            </div>
          </Link>

          <div className="h-5 w-px bg-white/[0.08] hidden sm:block" />

          {/* Quick Search */}
          <div className="relative hidden md:block w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search corridor, slide ID, or district..."
              className="w-full pl-10 pr-4 py-1.5 rounded-xl bg-[#0b1120]/80 border border-white/[0.08] text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition duration-300"
            />
          </div>
        </div>

        {/* Status Indicators & Officer Profile */}
        <div className="flex items-center gap-5">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/[0.08] border border-rose-500/25 text-rose-400 text-xs font-semibold backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
            <span className="font-mono font-bold tracking-wide">HAZARD LEVEL: CRITICAL</span>
          </div>

          <div className="flex items-center gap-3 border-l border-white/[0.08] pl-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0b1120] border border-white/[0.08] flex items-center justify-center text-emerald-400 font-bold text-xs shadow-md">
                <UserCheck className="w-4.5 h-4.5" />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-200">
                  {user?.full_name || 'Field Patrol Officer'}
                </div>
                <div className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase mt-0.5">
                  {user?.role || 'COMMANDER'} • NER SECTOR
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              title="Logout"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition duration-200 ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sleek Modern Command Sidebar */}
        <aside
          className={`border-r border-white/[0.08] bg-[#050814]/90 backdrop-blur-xl flex flex-col justify-between transition-all duration-300 z-30 ${
            collapsed ? 'w-16' : 'w-64'
          }`}
        >
          <div>
            <div className="p-4 flex justify-between items-center border-b border-white/[0.05]">
              {!collapsed && (
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest px-1 font-mono">
                  Command Center
                </span>
              )}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition duration-200 mx-auto"
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            <nav className="p-3 space-y-1.5">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/35 text-emerald-300 shadow-lg shadow-emerald-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                    {!collapsed && item.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-rose-500 text-white shadow-md shadow-rose-500/30">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Stream */}
          <div className="p-3 border-t border-white/[0.05] space-y-2">
            {!collapsed && (
              <div className="p-3 rounded-xl bg-[#0b1120]/70 border border-white/[0.06] space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                  <span>AI Inference Model</span>
                  <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
                </div>
                <div className="font-mono text-emerald-400 font-bold tracking-wide">STREAM 24/7 ONLINE</div>
              </div>
            )}

            <button className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/[0.06] transition duration-200">
              <Settings className="w-4 h-4 shrink-0" />
              {!collapsed && <span>System Settings</span>}
            </button>
          </div>
        </aside>

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto bg-[#040711] p-6 lg:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
};
