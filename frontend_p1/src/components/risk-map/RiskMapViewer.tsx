import React, { useRef, useEffect, useState } from 'react';
import type { RiskSector, RiskLevel } from '../../types';
import { ZoomIn, ZoomOut, Maximize2, Compass, ShieldAlert } from 'lucide-react';

interface RiskMapViewerProps {
  sectors: RiskSector[];
  selectedSector: RiskSector | null;
  onSelectSector: (sector: RiskSector) => void;
  activeLayer: 'heatmap' | 'nodes' | 'rainfall' | 'topo';
  isBboxMode: boolean;
  onBboxSelected?: (bbox: { minLat: number; maxLat: number; minLon: number; maxLon: number }) => void;
}

export const RiskMapViewer: React.FC<RiskMapViewerProps> = ({
  sectors,
  selectedSector,
  onSelectSector,
  activeLayer,
  isBboxMode,
  onBboxSelected,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [zoom, setZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // BBox Drag selection state
  const [bboxStart, setBboxStart] = useState<{ x: number; y: number } | null>(null);
  const [bboxCurrent, setBboxCurrent] = useState<{ x: number; y: number } | null>(null);

  // Coordinate readout
  const [coords, setCoords] = useState<{ lat: string; lon: string }>({ lat: '27.3389° N', lon: '88.6065° E' });

  const getRiskColor = (level: RiskLevel, alpha: number = 1) => {
    switch (level) {
      case 'CRITICAL': return `rgba(244, 63, 94, ${alpha})`;
      case 'HIGH': return `rgba(249, 115, 22, ${alpha})`;
      case 'MODERATE': return `rgba(250, 204, 21, ${alpha})`;
      case 'LOW': return `rgba(16, 185, 129, ${alpha})`;
      default: return `rgba(148, 163, 184, ${alpha})`;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resizeCanvas = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = containerRef.current.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      time += 0.03;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Dark GIS Grid Background
      ctx.fillStyle = '#060c1a';
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(offset.x + width / 2, offset.y + height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-width / 2, -height / 2);

      // 2. Coordinate Grid Lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.5)';
      ctx.lineWidth = 1;
      const gridSize = 60;
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

      // 3. Topographic Contours (Topo Layer)
      ctx.strokeStyle = activeLayer === 'topo' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(51, 65, 85, 0.3)';
      ctx.lineWidth = 1;
      for (let r = 80; r < Math.max(width, height); r += 90) {
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.08) {
          const distortion = Math.sin(a * 4 + time * 0.5) * 18 + Math.cos(a * 7) * 12;
          const cx = width / 2 + (r + distortion) * Math.cos(a);
          const cy = height / 2 + (r + distortion) * Math.sin(a);
          if (a === 0) ctx.moveTo(cx, cy);
          else ctx.lineTo(cx, cy);
        }
        ctx.closePath();
        ctx.stroke();
      }

      // 4. Monsoon Rainfall Radar Layer
      if (activeLayer === 'rainfall' || activeLayer === 'heatmap') {
        const radarGrad = ctx.createRadialGradient(
          width * 0.45 + Math.sin(time) * 30,
          height * 0.4 + Math.cos(time) * 20,
          20,
          width * 0.45,
          height * 0.4,
          280
        );
        radarGrad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
        radarGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.15)');
        radarGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');

        ctx.fillStyle = radarGrad;
        ctx.beginPath();
        ctx.arc(width * 0.45, height * 0.4, 280, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Heatmap Radial Gradients
      if (activeLayer === 'heatmap') {
        sectors.forEach((sec) => {
          const px = (sec.longitude - 88) * (width / 2.5) + width / 3;
          const py = height - (sec.latitude - 26) * (height / 2.5) - height / 4;
          const radius = sec.riskScore * 1.5 + 40;

          const grad = ctx.createRadialGradient(px, py, 5, px, py, radius);
          grad.addColorStop(0, getRiskColor(sec.riskLevel, 0.4));
          grad.addColorStop(0.7, getRiskColor(sec.riskLevel, 0.1));
          grad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 6. Sector Pins / Nodes Layer
      sectors.forEach((sec) => {
        const px = (sec.longitude - 88) * (width / 2.5) + width / 3;
        const py = height - (sec.latitude - 26) * (height / 2.5) - height / 4;

        const isSelected = selectedSector?.id === sec.id;

        // Animated Pulsing Ring for CRITICAL or Selected
        if (sec.riskLevel === 'CRITICAL' || isSelected) {
          const pulse = (Math.sin(time * 3 + sec.id.charCodeAt(0)) + 1) * 12 + 10;
          ctx.strokeStyle = getRiskColor(sec.riskLevel, isSelected ? 0.9 : 0.4);
          ctx.lineWidth = isSelected ? 2.5 : 1.5;
          ctx.beginPath();
          ctx.arc(px, py, pulse, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Pin Point Core
        ctx.fillStyle = getRiskColor(sec.riskLevel, 1);
        ctx.beginPath();
        ctx.arc(px, py, isSelected ? 8 : 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label Badge
        ctx.fillStyle = 'rgba(11, 19, 41, 0.85)';
        ctx.strokeStyle = getRiskColor(sec.riskLevel, 0.6);
        ctx.lineWidth = 1;
        const text = `${sec.name} (${sec.riskScore})`;
        ctx.font = '10px Inter, sans-serif';
        const textWidth = ctx.measureText(text).width;

        ctx.beginPath();
        ctx.roundRect(px - textWidth / 2 - 6, py - 26, textWidth + 12, 18, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.fillText(text, px - textWidth / 2, py - 13);
      });

      // 7. BBox Drag Selection Box
      if (isBboxMode && bboxStart && bboxCurrent) {
        const bx = Math.min(bboxStart.x, bboxCurrent.x);
        const by = Math.min(bboxStart.y, bboxCurrent.y);
        const bw = Math.abs(bboxCurrent.x - bboxStart.x);
        const bh = Math.abs(bboxCurrent.y - bboxStart.y);

        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);

        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeRect(bx, by, bw, bh);
        ctx.setLineDash([]);
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [sectors, selectedSector, activeLayer, zoom, offset, isBboxMode, bboxStart, bboxCurrent]);

  // Mouse / Drag Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    if (isBboxMode) {
      setBboxStart({ x: clickX, y: clickY });
      setBboxCurrent({ x: clickX, y: clickY });
      return;
    }

    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Lat/Lon Readout Simulation
    const simulatedLat = (27.5 + (height - mouseY) * 0.005).toFixed(4);
    const simulatedLon = (88.5 + mouseX * 0.005).toFixed(4);
    setCoords({ lat: `${simulatedLat}° N`, lon: `${simulatedLon}° E` });

    if (isBboxMode && bboxStart) {
      setBboxCurrent({ x: mouseX, y: mouseY });
      return;
    }

    if (isDragging) {
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isBboxMode && bboxStart && bboxCurrent) {
      if (onBboxSelected) {
        onBboxSelected({
          minLat: 27.1,
          maxLat: 27.9,
          minLon: 88.2,
          maxLon: 89.0,
        });
      }
      setBboxStart(null);
      setBboxCurrent(null);
      return;
    }

    if (isDragging) {
      setIsDragging(false);
      return;
    }

    // Single Click Node Selection Detection
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !canvasRef.current) return;
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let foundSector: RiskSector | null = null;

    sectors.forEach((sec) => {
      const px = (sec.longitude - 88) * (width / 2.5) + width / 3 + offset.x;
      const py = height - (sec.latitude - 26) * (height / 2.5) - height / 4 + offset.y;
      const dist = Math.hypot(clickX - px, clickY - py);
      if (dist < 20) {
        foundSector = sec;
      }
    });

    if (foundSector) {
      onSelectSector(foundSector);
    }
  };

  const height = containerRef.current?.clientHeight || 600;

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[580px] bg-[#060c1a] rounded-2xl overflow-hidden border border-[#1e293b] shadow-2xl">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className={`w-full h-full block ${isBboxMode ? 'cursor-crosshair' : isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      />

      {/* Spatial Controls Overlay */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.25, 2.5))}
          className="p-2.5 bg-[#0b1329]/90 border border-[#1e293b] text-slate-300 hover:text-white rounded-xl shadow-lg transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.25, 0.6))}
          className="p-2.5 bg-[#0b1329]/90 border border-[#1e293b] text-slate-300 hover:text-white rounded-xl shadow-lg transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}
          className="p-2.5 bg-[#0b1329]/90 border border-[#1e293b] text-slate-300 hover:text-white rounded-xl shadow-lg transition"
          title="Reset View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Coordinate & Telemetry Scale Readout */}
      <div className="absolute bottom-6 left-6 flex items-center gap-4 px-3.5 py-2 bg-[#0b1329]/90 border border-[#1e293b] rounded-xl text-[11px] font-mono text-slate-300 backdrop-blur-md z-10">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '10s' }} />
          <span>{coords.lat} {coords.lon}</span>
        </div>
        <div className="h-3 w-px bg-slate-700" />
        <span>SCALE: 1:250,000</span>
        <div className="h-3 w-px bg-slate-700" />
        <span className="text-cyan-400 font-semibold uppercase">{activeLayer} MODE</span>
      </div>

      {/* BBox Selection Prompt Banner */}
      {isBboxMode && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500 text-emerald-300 rounded-full text-xs backdrop-blur-md z-20 animate-pulse">
          <ShieldAlert className="w-4 h-4" />
          <span>Drag bounding box on canvas to query spatial bounding region</span>
        </div>
      )}
    </div>
  );
};
