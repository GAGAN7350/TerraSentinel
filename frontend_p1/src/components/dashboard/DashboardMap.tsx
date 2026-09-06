import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, MapPin, Wind } from 'lucide-react';
import type { RiskLevel } from '../../types';

export interface SectorNode {
  id: string;
  name: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  riskScore: number;
  riskLevel: RiskLevel;
  rainfall24h: number;
  slope: number;
  confidence: number;
  history: string;
}

export const SECTORS: SectorNode[] = [
  {
    id: 'sec-01',
    name: 'Shillong Bypass Sector',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    latitude: 25.57,
    longitude: 91.88,
    riskScore: 91,
    riskLevel: 'CRITICAL',
    rainfall24h: 210.4,
    slope: 38.5,
    confidence: 89,
    history: 'Recurring steep rockfall along NH-6 corridor after 150mm+ rainfall.',
  },
  {
    id: 'sec-02',
    name: 'West Siang Corridor',
    state: 'Arunachal Pradesh',
    district: 'West Siang',
    latitude: 27.10,
    longitude: 92.00,
    riskScore: 76,
    riskLevel: 'HIGH',
    rainfall24h: 145.2,
    slope: 35.0,
    confidence: 84,
    history: 'Debris flow hazard near NH-13 Km 42 basin.',
  },
  {
    id: 'sec-03',
    name: 'Gangtok Teesta Basin',
    state: 'Sikkim',
    district: 'East Sikkim',
    latitude: 27.33,
    longitude: 88.61,
    riskScore: 82,
    riskLevel: 'HIGH',
    rainfall24h: 165.0,
    slope: 41.2,
    confidence: 88,
    history: 'High erosion zone near Teesta river basin slope.',
  },
  {
    id: 'sec-04',
    name: 'Silchar Hill Sector',
    state: 'Assam',
    district: 'Cachar',
    latitude: 24.82,
    longitude: 92.79,
    riskScore: 48,
    riskLevel: 'MODERATE',
    rainfall24h: 65.0,
    slope: 22.1,
    confidence: 78,
    history: 'Active slope creep observed on SH-11 hill section.',
  },
];

interface DashboardMapProps {
  selectedSectorId?: string;
  onSelectSector?: (sector: SectorNode) => void;
}

export const DashboardMap: React.FC<DashboardMapProps> = ({ selectedSectorId, onSelectSector }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selected, setSelected] = useState<SectorNode>(SECTORS[0]);
  const [showLayers, setShowLayers] = useState({
    riskNodes: true,
    rainfallHeatmap: true,
    alerts: true,
    topoContours: true,
  });

  useEffect(() => {
    if (selectedSectorId) {
      const match = SECTORS.find((s) => s.id === selectedSectorId);
      if (match) setSelected(match);
    }
  }, [selectedSectorId]);

  const handleSelect = (sec: SectorNode) => {
    setSelected(sec);
    if (onSelectSector) onSelectSector(sec);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 550);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight || 550;
    };

    window.addEventListener('resize', handleResize);
    let time = 0;

    const render = () => {
      time += 0.02;

      // Dark Spatial Basemap
      ctx.fillStyle = '#0B0F19';
      ctx.fillRect(0, 0, width, height);

      // Render Topographic Elevation Contours
      if (showLayers.topoContours) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let y = 30; y < height; y += 40) {
          ctx.beginPath();
          for (let x = 0; x < width; x += 20) {
            const wave = Math.sin(x * 0.01 + y * 0.02 + time * 0.5) * 12;
            if (x === 0) ctx.moveTo(x, y + wave);
            else ctx.lineTo(x, y + wave);
          }
          ctx.stroke();
        }
      }

      // Render Rainfall Heatmap Grids
      if (showLayers.rainfallHeatmap) {
        SECTORS.forEach((sec) => {
          const mapX = ((sec.longitude - 88) / 7) * width;
          const mapY = height - ((sec.latitude - 23) / 5) * height;

          const heatGrad = ctx.createRadialGradient(mapX, mapY, 10, mapX, mapY, 120);
          heatGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
          heatGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
          ctx.fillStyle = heatGrad;
          ctx.beginPath();
          ctx.arc(mapX, mapY, 120, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Render Hazard Nodes
      SECTORS.forEach((sec) => {
        const mapX = ((sec.longitude - 88) / 7) * width;
        const mapY = height - ((sec.latitude - 23) / 5) * height;
        const isSelected = sec.id === selected.id;

        let color = '#10B981';
        if (sec.riskLevel === 'CRITICAL') color = '#EF4444';
        if (sec.riskLevel === 'HIGH') color = '#F97316';
        if (sec.riskLevel === 'MODERATE') color = '#F59E0B';

        // Warning Pulse Ring
        if (showLayers.alerts && sec.riskLevel === 'CRITICAL') {
          const pulseR = (time * 30) % 45 + 10;
          ctx.beginPath();
          ctx.arc(mapX, mapY, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.globalAlpha = 1 - pulseR / 45;
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Selection Highlight Ring
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(mapX, mapY, 16, 0, Math.PI * 2);
          ctx.strokeStyle = '#22D3EE';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Node Dot
        if (showLayers.riskNodes) {
          ctx.beginPath();
          ctx.arc(mapX, mapY, isSelected ? 7 : 5, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();

          // Node Label
          ctx.font = '11px Inter, sans-serif';
          ctx.fillStyle = isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)';
          ctx.fillText(sec.name, mapX + 12, mapY - 4);

          ctx.font = '10px Monospace, sans-serif';
          ctx.fillStyle = color;
          ctx.fillText(`${sec.riskScore}/100`, mapX + 12, mapY + 8);
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [selected, showLayers]);

  return (
    <div className="glass-panel p-4 rounded-2xl border border-white/10 relative overflow-hidden flex flex-col h-[560px]">
      {/* Map Header Toolbar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 z-10 bg-[#0B0F19]/80 backdrop-blur-md px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="font-heading font-bold text-white text-base">North-East India Hazard GIS Map</h2>
            <div className="text-[11px] text-gray-400">PostGIS WGS84 Spatial Coordinate Stream</div>
          </div>
        </div>

        {/* Map Layer Control Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLayers((p) => ({ ...p, riskNodes: !p.riskNodes }))}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1.5 transition-all ${
              showLayers.riskNodes ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-white/10 text-gray-500'
            }`}
          >
            {showLayers.riskNodes ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
            <span>Risk Nodes</span>
          </button>

          <button
            onClick={() => setShowLayers((p) => ({ ...p, rainfallHeatmap: !p.rainfallHeatmap }))}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1.5 transition-all ${
              showLayers.rainfallHeatmap ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-slate-900 border-white/10 text-gray-500'
            }`}
          >
            <Wind className="w-3 h-3" />
            <span>Rainfall Overlay</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Canvas Container */}
      <div className="flex-1 relative overflow-hidden my-2 rounded-xl border border-white/5 cursor-pointer">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Quick Node Selector Pills */}
        <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
          {SECTORS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => handleSelect(sec)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                sec.id === selected.id
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-900/80 border-white/10 text-gray-300 hover:border-white/30'
              }`}
            >
              {sec.name.split(' ')[0]} ({sec.riskScore})
            </button>
          ))}
        </div>

        {/* Selected Location Telemetry Card Overlay */}
        <div className="absolute bottom-4 right-4 z-10 w-80 glass-panel p-4 rounded-xl border border-white/15 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div>
              <div className="text-xs font-bold text-white">{selected.name}</div>
              <div className="text-[10px] text-gray-400">{selected.district}, {selected.state}</div>
            </div>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
              selected.riskLevel === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
            }`}>
              {selected.riskLevel}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
              <div className="text-[10px] text-gray-400 uppercase">Risk Score</div>
              <div className="text-base font-extrabold text-white">{selected.riskScore} / 100</div>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
              <div className="text-[10px] text-gray-400 uppercase">24h Rainfall</div>
              <div className="text-base font-bold text-cyan-400">{selected.rainfall24h} mm</div>
            </div>
          </div>

          <div className="text-[11px] text-gray-300 leading-tight bg-slate-900/40 p-2 rounded-lg border border-white/5">
            <strong>Geospatial Note:</strong> {selected.history}
          </div>
        </div>
      </div>
    </div>
  );
};
