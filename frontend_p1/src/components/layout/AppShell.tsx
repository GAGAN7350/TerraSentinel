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
    { label: 'Alerts', path: '/alerts', icon: Bell, badge: '2' },
    { label: 'Field Reports', path: '/reports', icon: AlertTriangle },
    { label: 'Landslide Inventory', path: '/inventory', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-gray-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-gray-950">
      {/* Top Telemetry Header */}
      <header className="h-16 border-b border-white/10 bg-[#0A0E17]/90 backdrop-blur-md sticky top-0 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="font-heading font-extrabold text-base text-white tracking-wider hidden sm:inline">
              TERRASENTINEL
            </span>
          </Link>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {/* Quick Search */}
          <div className="relative hidden md:block w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search district, slide ID, or location..."
              className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-900/80 border border-white/10 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {/* Status Indicators & Profile */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>REGIONAL HAZARD: CRITICAL</span>
          </div>

          <div className="flex items-center gap-2 border-l border-white/10 pl-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-emerald-400 font-bold text-xs">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-white leading-none">
                  {user?.full_name || 'Field Officer'}
                </div>
                <div className="text-[10px] text-emerald-400 uppercase font-mono mt-0.5">
                  {user?.role || 'OFFICER'} • NER SECTOR
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              title="Logout"
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Persistent Command-Center Sidebar */}
        <aside
          className={`border-r border-white/10 bg-[#090D15] flex flex-col justify-between transition-all duration-300 z-30 ${
            collapsed ? 'w-16' : 'w-64'
          }`}
        >
          <div>
            <div className="p-3 flex justify-between items-center border-b border-white/5">
              {!collapsed && <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider px-2">Navigation</span>}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors mx-auto"
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            <nav className="p-2 space-y-1">
              {navItems.map((item) => {
                const active = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      active
                        ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 shadow-lg shadow-emerald-500/10'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-emerald-400' : 'text-gray-400'}`} />
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                    {!collapsed && item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-white/5 space-y-2">
            {!collapsed && (
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-gray-400">
                  <span>Inference Stream</span>
                  <Activity className="w-3 h-3 text-emerald-400" />
                </div>
                <div className="font-mono text-emerald-400 font-bold">24/7 ACTIVE</div>
              </div>
            )}

            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <Settings className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Settings</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#07090E] p-4 sm:p-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
};
