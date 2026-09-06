import React from 'react';
import type { Landslide } from '../../types';
import { Globe } from 'lucide-react';

interface InventoryMapPreviewProps {
  landslide: Landslide | null;
}

export const InventoryMapPreview: React.FC<InventoryMapPreviewProps> = ({ landslide }) => {
  if (!landslide) return null;

  return (
    <div className="bg-[#0b1329]/90 border border-[#1e293b] rounded-2xl p-5 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
            <Globe className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Spatial Location Preview</h3>
            <p className="text-[11px] text-slate-400">GSI / NRSC GIS point reference</p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
          {landslide.source}
        </span>
      </div>

      <div className="bg-[#111c38] border border-[#1e293b] rounded-xl p-4 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Slide Identifier:</span>
          <span className="font-mono text-white font-bold">{landslide.slide_no || landslide.id}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Location Corridor:</span>
          <span className="text-cyan-400 font-semibold">{landslide.nh_sh_location || 'State Highway Sector'}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">WGS84 Coordinates:</span>
          <span className="font-mono text-emerald-400">{landslide.latitude.toFixed(4)}°N, {landslide.longitude.toFixed(4)}°E</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Movement Classification:</span>
          <span className="text-amber-400 font-semibold">{landslide.movement_type}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-400">Material Composition:</span>
          <span className="text-slate-200">{landslide.material_involved}</span>
        </div>

        <div className="pt-2 border-t border-[#1e293b] text-[11px] text-slate-400 italic">
          "{landslide.history}"
        </div>
      </div>
    </div>
  );
};
