import React, { useState, useRef, useEffect } from 'react';
import { Layers, ZoomIn, ZoomOut, Activity, MapPin } from 'lucide-react';

export interface SectorNode {
  id: string;
  name: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  riskScore: number;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  slopeAngle: number;
  rainfall24h: number;
  lithology: string;
}

export const SECTORS: SectorNode[] = [
  {
    id: 'sec-001',
    name: 'Teesta Valley Corridor (NH-10)',
    district: 'East Sikkim',
    state: 'Sikkim',
    latitude: 27.33,
    longitude: 88.61,
    riskScore: 91,
    riskLevel: 'CRITICAL',
    slopeAngle: 42.5,
    rainfall24h: 210.4,
    lithology: 'Metamorphic Gneiss & Quartzite',
  },
  {
    id: 'sec-002',
    name: 'Shillong Bypass Pass (NH-6)',
    district: 'East Khasi Hills',
    state: 'Meghalaya',
    latitude: 25.57,
    longitude: 91.88,
    riskScore: 84,
    riskLevel: 'HIGH',
    slopeAngle: 38.0,
    rainfall24h: 165.8,
    lithology: 'Sandstone Bedrock',
  },
  {
    id: 'sec-003',
    name: 'West Siang Along Ridge (NH-13)',
    district: 'West Siang',
    state: 'Arunachal Pradesh',
    latitude: 27.10,
    longitude: 92.00,
    riskScore: 78,
    riskLevel: 'HIGH',
    slopeAngle: 35.2,
    rainfall24h: 142.0,
    lithology: 'Weathered Granite',
  },
  {
    id: 'sec-004',
    name: 'Silchar Hill Cut (SH-11)',
    district: 'Cachar',
    state: 'Assam',
    latitude: 24.82,
    longitude: 92.79,
    riskScore: 52,
    riskLevel: 'MODERATE',
    slopeAngle: 24.5,
    rainfall24h: 68.5,
    lithology: 'Silty Sand Deposit',
  },
];

interface DashboardMapProps {
  selectedSectorId: string;
  onSelectSector: (sector: SectorNode) => void;
}

export const DashboardMap: React.FC<DashboardMapProps> = ({
  selectedSectorId,
  onSelectSector,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeLayer, setActiveLayer] = useState<'nodes' | 'heatmap' | 'rainfall'>('nodes');
  const [zoom, setZoom] = useState<number>(1);
  const selectedSector = SECTORS.find((s) => s.id === selectedSectorId) || SECTORS[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      time += 0.025;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Deep Metallic Canvas Background
      ctx.fillStyle = '#040814';
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-width / 2, -height / 2);

      // Subtle Precision Coordinate Grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Topographic Contour Curves
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.lineWidth = 1;
      for (let r = 100; r < Math.max(width, height); r += 110) {
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.06) {
          const distortion = Math.sin(a * 5 + time) * 14 + Math.cos(a * 8) * 10;
          const cx = width / 2 + (r + distortion) * Math.cos(a);
          const cy = height / 2 + (r + distortion) * Math.sin(a);
          if (a === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Heatmap Radial Gradients
      if (activeLayer === 'heatmap' || activeLayer === 'rainfall') {
        SECTORS.forEach((sec) => {
          const px = (sec.longitude - 88) * (width / 5) + width / 4;
          const py = height - (sec.latitude - 24) * (height / 4) - height / 5;

          const grad = ctx.createRadialGradient(px, py, 4, px, py, sec.riskScore * 1.8 + 40);
          const color =
            sec.riskLevel === 'CRITICAL'
              ? 'rgba(244, 63, 94, 0.35)'
              : sec.riskLevel === 'HIGH'
              ? 'rgba(249, 115, 22, 0.3)'
              : 'rgba(16, 185, 129, 0.2)';
          grad.addColorStop(0, color);
          grad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, py, sec.riskScore * 1.8 + 40, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Render Interactive Pins
      SECTORS.forEach((sec) => {
        const px = (sec.longitude - 88) * (width / 5) + width / 4;
        const py = height - (sec.latitude - 24) * (height / 4) - height / 5;
        const isSel = sec.id === selectedSectorId;

        // Animated Pulsing Node Ring
        if (sec.riskLevel === 'CRITICAL' || isSel) {
          const pulse = (Math.sin(time * 3.5 + sec.riskScore) + 1) * 10 + 10;
          ctx.strokeStyle =
            sec.riskLevel === 'CRITICAL'
              ? `rgba(244, 63, 94, ${isSel ? 0.9 : 0.5})`
              : `rgba(16, 185, 129, ${isSel ? 0.9 : 0.5})`;
          ctx.lineWidth = isSel ? 2.5 : 1.5;
          ctx.beginPath();
          ctx.arc(px, py, pulse, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Pin Point Core
        ctx.fillStyle =
          sec.riskLevel === 'CRITICAL' ? '#f43f5e' : sec.riskLevel === 'HIGH' ? '#f97316' : '#10b981';
        ctx.beginPath();
        ctx.arc(px, py, isSel ? 8 : 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label Badge
        const label = `${sec.name} (${sec.riskScore})`;
        ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
        const tw = ctx.measureText(label).width;

        ctx.fillStyle = 'rgba(6, 10, 23, 0.9)';
        ctx.strokeStyle = isSel ? 'rgba(16, 185, 129, 0.8)' : 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(px - tw / 2 - 8, py - 28, tw + 16, 20, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.fillText(label, px - tw / 2, py - 14);
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [selectedSectorId, activeLayer, zoom]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !canvasRef.current) return;
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    SECTORS.forEach((sec) => {
      const px = (sec.longitude - 88) * (width / 5) + width / 4;
      const py = height - (sec.latitude - 24) * (height / 4) - height / 5;
      const dist = Math.hypot(clickX - px, clickY - py);
      if (dist < 25) {
        onSelectSector(sec);
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[580px] bg-[#040814] rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl group"
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full block cursor-crosshair"
      />

      {/* Floating Header Controls */}
      <div className="absolute top-5 left-5 right-5 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#060a17]/90 border border-white/[0.1] rounded-xl backdrop-blur-md pointer-events-auto shadow-lg">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Layers:</span>
          {(['nodes', 'heatmap', 'rainfall'] as const).map((lyr) => (
            <button
              key={lyr}
              onClick={() => setActiveLayer(lyr)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                activeLayer === lyr
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lyr.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="px-3 py-1.5 bg-[#060a17]/90 border border-white/[0.1] rounded-xl backdrop-blur-md text-xs font-mono text-emerald-400 flex items-center gap-2 pointer-events-auto shadow-lg">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          <span>GIS VECTOR STREAM: ACTIVE</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="absolute bottom-5 right-5 flex flex-col gap-2 z-10">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}
          className="p-2.5 bg-[#060a17]/90 border border-white/[0.1] text-slate-300 hover:text-white rounded-xl shadow-lg transition backdrop-blur-md"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.2, 0.8))}
          className="p-2.5 bg-[#060a17]/90 border border-white/[0.1] text-slate-300 hover:text-white rounded-xl shadow-lg transition backdrop-blur-md"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Sector Telemetry Overlay Card */}
      <div className="absolute bottom-5 left-5 p-4 bg-[#060a17]/90 border border-white/[0.1] rounded-2xl backdrop-blur-md z-10 max-w-sm space-y-2 shadow-2xl">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            {selectedSector.name}
          </h4>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300">
            {selectedSector.riskLevel} {selectedSector.riskScore}/100
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {selectedSector.district}, {selectedSector.state} • {selectedSector.lithology}
        </p>
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 pt-1 border-t border-white/[0.06]">
          <span>Rain: <strong className="text-cyan-400">{selectedSector.rainfall24h} mm</strong></span>
          <span>Slope: <strong className="text-amber-400">{selectedSector.slopeAngle}°</strong></span>
        </div>
      </div>
    </div>
  );
};
