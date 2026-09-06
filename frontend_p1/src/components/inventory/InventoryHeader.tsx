import React from 'react';
import { Search, Database, Globe, Layers, Download, MapPin } from 'lucide-react';

interface InventoryHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedState: string;
  onStateChange: (st: string) => void;
  selectedMovement: string;
  onMovementChange: (m: string) => void;
  onExportAllGeoJSON: () => void;
  counts: { total: number; gsi: number; nrsc: number };
}

const STATES = ['All States', 'Arunachal Pradesh', 'Meghalaya', 'Assam', 'Sikkim', 'Mizoram', 'Uttarakhand'];
const MOVEMENTS = ['All Movement Types', 'Debris flow', 'Rockfall', 'Translational slide', 'Rockslide'];

export const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedState,
  onStateChange,
  selectedMovement,
  onMovementChange,
  onExportAllGeoJSON,
  counts,
}) => {
  return (
    <div className="bg-[#0b1329]/90 border border-[#1e293b] rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Title & Action */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
            <Database className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-wide">Historical Landslide Inventory (GSI / NRSC)</h1>
            <p className="text-xs text-slate-400">National landslide occurrence database & spatial catalog</p>
          </div>
        </div>

        <button
          onClick={onExportAllGeoJSON}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-900/30 transition transform hover:-translate-y-0.5"
        >
          <Download className="w-4 h-4" />
          <span>Export GeoJSON Catalog</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111c38] border border-[#1e293b] p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-semibold">Total Slide Records</span>
            <span className="text-xl font-black text-white mt-0.5 block">{counts.total}</span>
          </div>
          <Database className="w-5 h-5 text-slate-400" />
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-emerald-300 block font-semibold">GSI Bhusanket</span>
            <span className="text-xl font-black text-emerald-400 mt-0.5 block">{counts.gsi}</span>
          </div>
          <Globe className="w-5 h-5 text-emerald-400" />
        </div>

        <div className="bg-cyan-500/10 border border-cyan-500/20 p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-cyan-300 block font-semibold">NRSC Satellite</span>
            <span className="text-xl font-black text-cyan-400 mt-0.5 block">{counts.nrsc}</span>
          </div>
          <Layers className="w-5 h-5 text-cyan-400" />
        </div>

        <div className="bg-[#111c38] border border-[#1e293b] p-3.5 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 block font-semibold">Monitored Highways</span>
            <span className="text-xl font-black text-amber-400 mt-0.5 block">14 NH/SH</span>
          </div>
          <MapPin className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search slide name, ID, village, or highway location..."
            className="w-full bg-[#111c38] border border-[#1e293b] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
          />
        </div>

        {/* State dropdown */}
        <select
          value={selectedState}
          onChange={(e) => onStateChange(e.target.value)}
          className="bg-[#111c38] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition cursor-pointer"
        >
          {STATES.map((st) => (
            <option key={st} value={st} className="bg-[#0b1329]">{st}</option>
          ))}
        </select>

        {/* Movement dropdown */}
        <select
          value={selectedMovement}
          onChange={(e) => onMovementChange(e.target.value)}
          className="bg-[#111c38] border border-[#1e293b] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition cursor-pointer"
        >
          {MOVEMENTS.map((m) => (
            <option key={m} value={m} className="bg-[#0b1329]">{m}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
