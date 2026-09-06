import React from 'react';
import type { Landslide } from '../../types';
import { MapPin, Calendar, Download, Eye } from 'lucide-react';

interface InventoryTableProps {
  landslides: Landslide[];
  selectedId: string | null;
  onSelectLandslide: (landslide: Landslide) => void;
  onExportRecordGeoJSON: (landslide: Landslide) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  landslides,
  selectedId,
  onSelectLandslide,
  onExportRecordGeoJSON,
}) => {
  if (landslides.length === 0) {
    return (
      <div className="bg-[#0b1329]/90 border border-[#1e293b] rounded-2xl p-12 text-center text-slate-400 text-xs">
        No landslide records found matching the current spatial filters.
      </div>
    );
  }

  const getSourceBadge = (source: string | null) => {
    if (source === 'GSI_BHUSANKET') {
      return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300';
    }
    return 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300';
  };

  return (
    <div className="bg-[#0b1329]/90 border border-[#1e293b] rounded-2xl shadow-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs text-slate-200">
          <thead>
            <tr className="bg-[#111c38]/80 border-b border-[#1e293b] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-3.5 px-4">Slide ID & Source</th>
              <th className="py-3.5 px-4">Landslide Name / Highway</th>
              <th className="py-3.5 px-4">Location (District / State)</th>
              <th className="py-3.5 px-4">Coordinates (°N, °E)</th>
              <th className="py-3.5 px-4">Movement & Material</th>
              <th className="py-3.5 px-4">Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]/60">
            {landslides.map((ls) => {
              const isSelected = selectedId === ls.id;
              return (
                <tr
                  key={ls.id}
                  onClick={() => onSelectLandslide(ls)}
                  className={`cursor-pointer transition ${
                    isSelected ? 'bg-cyan-500/10 border-l-4 border-l-cyan-400' : 'hover:bg-[#111c38]/50'
                  }`}
                >
                  {/* Slide ID & Source */}
                  <td className="py-3.5 px-4 font-mono">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-white text-xs">{ls.slide_no || ls.id}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border w-fit ${getSourceBadge(ls.source)}`}>
                        {ls.source}
                      </span>
                    </div>
                  </td>

                  {/* Name & Highway */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-xs">{ls.slide_name}</div>
                    <div className="text-[11px] text-cyan-400 mt-0.5">{ls.nh_sh_location || 'Local Sector'}</div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4">
                    <div className="text-xs text-slate-200">{ls.village ? `${ls.village}, ` : ''}{ls.district}</div>
                    <div className="text-[11px] text-slate-400">{ls.state}</div>
                  </td>

                  {/* Coordinates */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{ls.latitude.toFixed(4)}°, {ls.longitude.toFixed(4)}°</span>
                    </div>
                  </td>

                  {/* Movement & Material */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-amber-300 text-xs">{ls.movement_type}</div>
                    <div className="text-[11px] text-slate-400">{ls.material_involved}</div>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4 text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{ls.occurrence_date || 'Historical'}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectLandslide(ls);
                        }}
                        className="p-1.5 bg-[#111c38] hover:bg-[#1a274c] border border-[#1e293b] text-slate-300 rounded-lg transition"
                        title="View Spatial Telemetry"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onExportRecordGeoJSON(ls);
                        }}
                        className="p-1.5 bg-[#111c38] hover:bg-[#1a274c] border border-[#1e293b] text-cyan-400 rounded-lg transition"
                        title="Export GeoJSON"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
