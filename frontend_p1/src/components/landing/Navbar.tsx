import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Activity, Map, Bell, AlertTriangle, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, login, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 transition-all">
      <div className="max-w-7xl mx-auto glass-panel px-5 py-3 flex items-center justify-between">
        {/* Brand Logo & Telemetry Status */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center group-hover:border-emerald-400 transition-colors">
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-lg text-white tracking-wider">
                TERRASENTINEL
              </span>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                NER-AI
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Telemetry Active • PostGIS 16</span>
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-300">
          <Link to="/" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>Overview</span>
          </Link>
          <Link to="/map" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <Map className="w-4 h-4 text-cyan-400" />
            <span>Risk Map</span>
          </Link>
          <Link to="/alerts" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <Bell className="w-4 h-4 text-amber-400" />
            <span>Alerts</span>
          </Link>
          <Link to="/reports" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span>Field Reports</span>
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 transition-all flex items-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{user?.full_name?.split(' ')[0] || 'Officer'}</span>
              </button>
              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700 text-gray-300 text-xs hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                login('officer@terrasentinel.demo', 'officer');
                navigate('/dashboard');
              }}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-xs font-bold transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              EXPLORE RISK MAP →
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
