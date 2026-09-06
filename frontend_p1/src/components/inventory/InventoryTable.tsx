import React from 'react';
import type { Landslide } from '../../types';
import { MapPin, Calendar, Eye, Download, Database } from 'lucide-react';

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
      <div className="glass-panel rounded-2xl p-16 text-center"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)' }}>
          <Database className="w-7 h-7" style={{ color: '#22d3ee' }} />
        </div>
        <h3 className="font-heading font-bold text-lg text-white mb-2">No Records Found</h3>
        <p className="text-sm max-w-sm mx-auto" style={{ color: 'rgba(148,163,184,0.6)' }}>
          No landslide records match the current spatial filters.
        </p>
      </div>
    );
  }

  const getSourceStyle = (source: string | null) => {
    if (source === 'GSI_BHUSANKET') {
      return { color: '#34d399', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.35)' };
    }
    return { color: '#22d3ee', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.3)' };
  };

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(9,15,33,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Slide ID & Source', 'Name / Highway', 'Location', 'Coordinates', 'Movement & Material', 'Date', 'Actions'].map((col) => (
                <th key={col}
                  className="py-3.5 px-4 font-mono text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: 'rgba(100,116,139,0.65)', whiteSpace: 'nowrap' }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {landslides.map((ls) => {
              const isSelected = selectedId === ls.id;
              const srcStyle = getSourceStyle(ls.source);

              return (
                <tr
                  key={ls.id}
                  onClick={() => onSelectLandslide(ls)}
                  className="cursor-pointer group transition-all duration-150"
                  style={{
                    background: isSelected ? 'rgba(6,182,212,0.08)' : 'transparent',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    borderLeft: isSelected ? '2px solid rgba(6,182,212,0.8)' : '2px solid transparent',
                  }}
                >
                  {/* Slide ID + Source */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-xs text-white mb-1">
                      {ls.slide_no || ls.id}
                    </div>
                    <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-md"
                      style={{ background: srcStyle.bg, border: `1px solid ${srcStyle.border}`, color: srcStyle.color }}>
                      {ls.source}
                    </span>
                  </td>

                  {/* Name + Highway */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-xs text-white mb-0.5">{ls.slide_name}</div>
                    <div className="font-mono text-[11px]" style={{ color: '#22d3ee' }}>
                      {ls.nh_sh_location || 'Local Sector'}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-4">
                    <div className="text-xs text-slate-200">{ls.village ? `${ls.village}, ` : ''}{ls.district}</div>
                    <div className="font-mono text-[11px]" style={{ color: 'rgba(100,116,139,0.7)' }}>{ls.state}</div>
                  </td>

                  {/* Coordinates */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 font-mono text-[11px]" style={{ color: '#34d399' }}>
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span>{ls.latitude.toFixed(4)}°N</span>
                    </div>
                    <div className="font-mono text-[11px] ml-4" style={{ color: 'rgba(100,116,139,0.7)' }}>
                      {ls.longitude.toFixed(4)}°E
                    </div>
                  </td>

                  {/* Movement + Material */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-xs" style={{ color: '#fbbf24' }}>{ls.movement_type}</div>
                    <div className="text-[11px]" style={{ color: 'rgba(100,116,139,0.7)' }}>{ls.material_involved}</div>
                  </td>

                  {/* Date */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1 font-mono text-[11px]"
                      style={{ color: 'rgba(100,116,139,0.7)' }}>
                      <Calendar className="w-3 h-3" />
                      <span>{ls.occurrence_date || 'Historical'}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectLandslide(ls); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: 'rgba(148,163,184,0.8)',
                        }}
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onExportRecordGeoJSON(ls); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                        style={{
                          background: 'rgba(6,182,212,0.08)',
                          border: '1px solid rgba(6,182,212,0.25)',
                          color: '#22d3ee',
                        }}
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
