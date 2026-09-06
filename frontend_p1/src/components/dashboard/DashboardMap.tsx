import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Layers, ZoomIn, ZoomOut, Activity, MapPin, Crosshair, Maximize2 } from 'lucide-react';
import { SECTORS } from '../../data/sectors';
import type { SectorNode } from '../../data/sectors';

export type { SectorNode };
export { SECTORS };

const RISK_COLORS = {
  CRITICAL: { core: '#f43f5e', glow: 'rgba(244,63,94,0.6)', pulse: 'rgba(244,63,94,0.2)' },
  HIGH: { core: '#f97316', glow: 'rgba(249,115,22,0.5)', pulse: 'rgba(249,115,22,0.18)' },
  MODERATE: { core: '#f59e0b', glow: 'rgba(245,158,11,0.45)', pulse: 'rgba(245,158,11,0.15)' },
  LOW: { core: '#10b981', glow: 'rgba(16,185,129,0.5)', pulse: 'rgba(16,185,129,0.15)' },
};

// Geo bounds for NER: lon 88–96, lat 22–28
const GEO = { lonMin: 88, lonMax: 96.5, latMin: 22, latMax: 28.5 };

function geoToCanvas(lon: number, lat: number, w: number, h: number) {
  const padding = 0.12;
  const px = padding + ((lon - GEO.lonMin) / (GEO.lonMax - GEO.lonMin)) * (1 - padding * 2);
  const py = 1 - (padding + ((lat - GEO.latMin) / (GEO.latMax - GEO.latMin)) * (1 - padding * 2));
  return { x: px * w, y: py * h };
}

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
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const [activeLayer, setActiveLayer] = useState<'nodes' | 'heatmap' | 'rainfall'>('nodes');
  const [zoom, setZoom] = useState(1);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const selectedSector = SECTORS.find((s) => s.id === selectedSectorId) || SECTORS[0];

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    timeRef.current += 0.018;
    const t = timeRef.current;

    ctx.clearRect(0, 0, W, H);

    // ── BACKGROUND ──
    ctx.fillStyle = '#020814';
    ctx.fillRect(0, 0, W, H);

    // Subtle horizon glow
    const horizGrad = ctx.createLinearGradient(0, 0, 0, H);
    horizGrad.addColorStop(0, 'rgba(16,185,129,0.04)');
    horizGrad.addColorStop(0.5, 'rgba(6,182,212,0.02)');
    horizGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = horizGrad;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-W / 2, -H / 2);

    // ── GRID: Fine dot matrix ──
    const gridStep = 40;
    for (let x = 0; x < W; x += gridStep) {
      for (let y = 0; y < H; y += gridStep) {
        ctx.beginPath();
        ctx.arc(x, y, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        ctx.fill();
      }
    }

    // ── GRID: Meridian + Parallel lines (geo) ──
    ctx.strokeStyle = 'rgba(16,185,129,0.06)';
    ctx.lineWidth = 0.5;
    for (let lon = 89; lon <= 96; lon += 2) {
      const { x: x1 } = geoToCanvas(lon, GEO.latMin, W, H);
      ctx.beginPath(); ctx.moveTo(x1, 0); ctx.lineTo(x1, H); ctx.stroke();
    }
    for (let lat = 23; lat <= 28; lat++) {
      const { y: y1 } = geoToCanvas(GEO.lonMin, lat, W, H);
      ctx.beginPath(); ctx.moveTo(0, y1); ctx.lineTo(W, y1); ctx.stroke();
    }

    // ── TOPOGRAPHIC CONTOUR WAVES ──
    for (let r = 60; r < Math.max(W, H) * 0.8; r += 80) {
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += 0.04) {
        const d1 = Math.sin(a * 4 + t) * 18;
        const d2 = Math.cos(a * 7 - t * 0.7) * 12;
        const cx = W / 2 + (r + d1 + d2) * Math.cos(a);
        const cy = H / 2 + (r + d1 + d2) * 0.65 * Math.sin(a);
        a === 0 ? ctx.moveTo(cx, cy) : ctx.lineTo(cx, cy);
      }
      ctx.closePath();
      const alpha = Math.max(0.02, 0.1 - r / (Math.max(W, H) * 3));
      ctx.strokeStyle = `rgba(16,185,129,${alpha})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // ── TERRAIN HEIGHT GRADIENT OVERLAY ──
    const terrainGrad = ctx.createRadialGradient(W * 0.45, H * 0.35, 20, W * 0.45, H * 0.35, Math.min(W, H) * 0.5);
    terrainGrad.addColorStop(0, 'rgba(16,185,129,0.04)');
    terrainGrad.addColorStop(0.5, 'rgba(6,182,212,0.02)');
    terrainGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = terrainGrad;
    ctx.fillRect(0, 0, W, H);

    // ── HEATMAP / RAINFALL ──
    if (activeLayer === 'heatmap' || activeLayer === 'rainfall') {
      SECTORS.forEach((sec) => {
        const { x: px, y: py } = geoToCanvas(sec.longitude, sec.latitude, W, H);
        const radius = sec.riskScore * 2 + 60;
        const pulse = Math.sin(t * 1.5 + sec.riskScore * 0.1) * 12;
        const r = radius + pulse;

        const g = ctx.createRadialGradient(px, py, 0, px, py, r);
        const c = RISK_COLORS[sec.riskLevel];
        g.addColorStop(0, c.glow);
        g.addColorStop(0.4, activeLayer === 'rainfall' ? 'rgba(6,182,212,0.25)' : c.pulse);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // ── SECTOR CONNECTOR LINES (if sector selected) ──
    if (selectedSectorId) {
      const sel = SECTORS.find(s => s.id === selectedSectorId);
      if (sel) {
        const { x: sx, y: sy } = geoToCanvas(sel.longitude, sel.latitude, W, H);
        SECTORS.forEach((sec) => {
          if (sec.id === selectedSectorId) return;
          const { x: px, y: py } = geoToCanvas(sec.longitude, sec.latitude, W, H);
          ctx.beginPath();
          ctx.setLineDash([4, 8]);
          ctx.moveTo(sx, sy);
          ctx.lineTo(px, py);
          ctx.strokeStyle = 'rgba(16,185,129,0.12)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.setLineDash([]);
        });
      }
    }

    // ── SECTOR NODES ──
    SECTORS.forEach((sec) => {
      const { x: px, y: py } = geoToCanvas(sec.longitude, sec.latitude, W, H);
      const isSel = sec.id === selectedSectorId;
      const isHov = sec.id === hoveredId;
      const c = RISK_COLORS[sec.riskLevel];

      // Pulse rings for critical/selected
      if (sec.riskLevel === 'CRITICAL' || isSel) {
        for (let ring = 1; ring <= (isSel ? 3 : 2); ring++) {
          const pulseRadius = 12 + (Math.sin(t * 2.5 + ring * 1.2) + 1) * (ring * 10);
          const alpha = Math.max(0, 0.5 - ring * 0.12 - pulseRadius / 100);
          ctx.beginPath();
          ctx.arc(px, py, pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = isSel ? `rgba(16,185,129,${alpha})` : `${c.core}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = isSel ? 1.5 : 1;
          ctx.stroke();
        }
      }

      // Shadow glow
      ctx.shadowColor = c.core;
      ctx.shadowBlur = isSel ? 24 : isHov ? 18 : sec.riskLevel === 'CRITICAL' ? 14 : 8;

      // Core node
      const nodeR = isSel ? 10 : isHov ? 9 : 7;
      const grad = ctx.createRadialGradient(px - nodeR * 0.3, py - nodeR * 0.3, 0, px, py, nodeR);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, c.core);
      grad.addColorStop(1, c.glow.replace('0.6', '0.9').replace('0.5', '0.9').replace('0.45', '0.9'));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, nodeR, 0, Math.PI * 2);
      ctx.fill();

      // White ring
      ctx.shadowBlur = 0;
      ctx.strokeStyle = isSel ? '#ffffff' : 'rgba(255,255,255,0.8)';
      ctx.lineWidth = isSel ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.arc(px, py, nodeR, 0, Math.PI * 2);
      ctx.stroke();

      // Label chip
      const labelText = `${sec.name.split('(')[0].trim().substring(0, 22)}`;
      const scoreText = `${sec.riskScore}`;
      ctx.font = `600 10px Inter, sans-serif`;
      const lw = ctx.measureText(labelText).width;

      const chipX = px - lw / 2 - 12;
      const chipY = py - 36;
      const chipW = lw + 48;
      const chipH = 22;

      // Chip background
      ctx.fillStyle = isSel ? 'rgba(4,10,28,0.95)' : 'rgba(4,8,22,0.88)';
      ctx.strokeStyle = isSel ? 'rgba(16,185,129,0.7)' : `${c.core}50`;
      ctx.lineWidth = isSel ? 1.5 : 1;
      ctx.shadowColor = isSel ? 'rgba(16,185,129,0.4)' : 'transparent';
      ctx.shadowBlur = isSel ? 12 : 0;
      ctx.beginPath();
      ctx.roundRect(chipX, chipY, chipW, chipH, 5);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = isSel ? '#e2e8f0' : 'rgba(226,232,240,0.85)';
      ctx.fillText(labelText, chipX + 6, chipY + 14);

      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillStyle = c.core;
      ctx.fillText(scoreText, chipX + chipW - 22, chipY + 14);
    });

    ctx.restore();

    // ── MAP OVERLAY TEXT ──
    ctx.font = `500 10px JetBrains Mono, monospace`;
    ctx.fillStyle = 'rgba(100,116,139,0.5)';
    ctx.fillText('24°N', 14, H - 14);
    ctx.fillText('28°N', 14, 20);
    ctx.fillText('88°E', 14, H / 2);
    ctx.fillText('96°E', W - 36, H / 2);

    animRef.current = requestAnimationFrame(draw);
  }, [selectedSectorId, activeLayer, zoom, hoveredId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
    };
  }, [draw]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !canvasRef.current) return;
    // Click detection
    SECTORS.forEach((sec) => {
      const { x, y } = geoToCanvas(sec.longitude, sec.latitude, canvasRef.current!.width, canvasRef.current!.height);
      const adjX = (x - canvasRef.current!.width / 2) * zoom + canvasRef.current!.width / 2;
      const adjY = (y - canvasRef.current!.height / 2) * zoom + canvasRef.current!.height / 2;
      const actualX = adjX * (rect.width / canvasRef.current!.width);
      const actualY = adjY * (rect.height / canvasRef.current!.height);
      if (Math.hypot(e.clientX - rect.left - actualX, e.clientY - rect.top - actualY) < 28) {
        onSelectSector(sec);
      }
    });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !canvasRef.current) return;
    let found: string | null = null;
    SECTORS.forEach((sec) => {
      const { x, y } = geoToCanvas(sec.longitude, sec.latitude, canvasRef.current!.width, canvasRef.current!.height);
      const adjX = (x - canvasRef.current!.width / 2) * zoom + canvasRef.current!.width / 2;
      const adjY = (y - canvasRef.current!.height / 2) * zoom + canvasRef.current!.height / 2;
      const sx = adjX * (rect.width / canvasRef.current!.width);
      const sy = adjY * (rect.height / canvasRef.current!.height);
      if (Math.hypot(e.clientX - rect.left - sx, e.clientY - rect.top - sy) < 24) {
        found = sec.id;
      }
    });
    setHoveredId(found);
  };

  const selectedCfg = RISK_COLORS[selectedSector.riskLevel];

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        height: '560px',
        background: '#020814',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 32px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setHoveredId(null)}
        style={{ width: '100%', height: '100%', display: 'block', cursor: hoveredId ? 'pointer' : 'crosshair' }}
      />

      {/* ── TOP FLOATING CONTROLS ── */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        {/* Layer Toggle */}
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(5,8,22,0.9)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(16px)' }}>
          <Layers className="w-3.5 h-3.5 mr-1.5" style={{ color: '#22d3ee' }} />
          {(['nodes', 'heatmap', 'rainfall'] as const).map((lyr) => (
            <button
              key={lyr}
              onClick={() => setActiveLayer(lyr)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all"
              style={activeLayer === lyr ? {
                background: 'rgba(16,185,129,0.2)',
                border: '1px solid rgba(16,185,129,0.45)',
                color: '#34d399',
              } : {
                color: 'rgba(100,116,139,0.8)',
                border: '1px solid transparent',
              }}
            >
              {lyr.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Status */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl font-mono text-[11px]"
          style={{ background: 'rgba(5,8,22,0.9)', border: '1px solid rgba(255,255,255,0.09)', backdropFilter: 'blur(16px)' }}>
          <Activity className="w-3.5 h-3.5 animate-pulse" style={{ color: '#34d399' }} />
          <span style={{ color: '#34d399' }}>GIS STREAM: LIVE</span>
        </div>
      </div>

      {/* ── ZOOM CONTROLS ── */}
      <div className="absolute right-4 bottom-28 flex flex-col gap-1.5 z-10">
        {[
          { icon: ZoomIn, action: () => setZoom(z => Math.min(z + 0.25, 3)), title: 'Zoom In' },
          { icon: ZoomOut, action: () => setZoom(z => Math.max(z - 0.25, 0.5)), title: 'Zoom Out' },
          { icon: Maximize2, action: () => setZoom(1), title: 'Reset Zoom' },
        ].map(({ icon: Ic, action, title }) => (
          <button key={title} onClick={action} title={title}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: 'rgba(5,8,22,0.9)',
              border: '1px solid rgba(255,255,255,0.09)',
              backdropFilter: 'blur(16px)',
              color: 'rgba(148,163,184,0.8)',
            }}>
            <Ic className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* ── SELECTED SECTOR TELEMETRY CARD ── */}
      <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
        <div className="rounded-2xl p-4 max-w-md"
          style={{
            background: 'rgba(5,8,22,0.92)',
            border: `1px solid ${selectedCfg.core}40`,
            backdropFilter: 'blur(20px)',
            boxShadow: `0 0 24px ${selectedCfg.glow.replace('0.6','0.2')}`,
          }}>
          {/* Sector Name Row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: '#34d399' }} />
              <h4 className="font-semibold text-xs text-slate-200 truncate leading-tight">
                {selectedSector.name}
              </h4>
            </div>
            <span className="font-mono text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0"
              style={{
                background: `${selectedCfg.core}18`,
                border: `1px solid ${selectedCfg.core}45`,
                color: selectedCfg.core,
              }}>
              {selectedSector.riskLevel} · {selectedSector.riskScore}/100
            </span>
          </div>

          {/* Meta */}
          <p className="font-mono text-[10px] mb-3" style={{ color: 'rgba(100,116,139,0.8)' }}>
            {selectedSector.district}, {selectedSector.state} · {selectedSector.lithology}
          </p>

          {/* Telemetry Grid */}
          <div className="grid grid-cols-3 gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem' }}>
            {[
              { label: 'Rainfall 24h', value: `${selectedSector.rainfall24h}mm`, color: '#22d3ee' },
              { label: 'Slope Angle', value: `${selectedSector.slopeAngle}°`, color: '#fbbf24' },
              { label: 'Risk Score', value: `${selectedSector.riskScore}/100`, color: selectedCfg.core },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="font-mono text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'rgba(100,116,139,0.6)' }}>
                  {label}
                </div>
                <div className="font-mono font-bold text-xs" style={{ color }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CROSSHAIR CORNER DECORATIONS ── */}
      {[
        { top: '12px', left: '12px', borderTop: '2px solid rgba(16,185,129,0.4)', borderLeft: '2px solid rgba(16,185,129,0.4)' },
        { top: '12px', right: '12px', borderTop: '2px solid rgba(16,185,129,0.4)', borderRight: '2px solid rgba(16,185,129,0.4)' },
        { bottom: '12px', left: '12px', borderBottom: '2px solid rgba(16,185,129,0.4)', borderLeft: '2px solid rgba(16,185,129,0.4)' },
        { bottom: '12px', right: '12px', borderBottom: '2px solid rgba(16,185,129,0.4)', borderRight: '2px solid rgba(16,185,129,0.4)' },
      ].map((style, i) => (
        <div key={i} className="absolute w-5 h-5 pointer-events-none z-20" style={style as React.CSSProperties} />
      ))}

      {/* Crosshair center icon */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <Crosshair className="w-4 h-4" style={{ color: 'rgba(16,185,129,0.25)' }} />
      </div>
    </div>
  );
};
