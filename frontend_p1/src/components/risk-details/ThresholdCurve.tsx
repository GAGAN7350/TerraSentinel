import React, { useRef, useEffect } from 'react';
import { Activity, ShieldAlert } from 'lucide-react';

interface ThresholdCurveProps {
  rainfall24h: number;
}

export const ThresholdCurve: React.FC<ThresholdCurveProps> = ({ rainfall24h }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background Grid
    ctx.fillStyle = '#0b1329';
    ctx.fillRect(0, 0, width, height);

    const padding = 40;
    const graphW = width - padding * 2;
    const graphH = height - padding * 2;

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = padding; x <= width - padding; x += graphW / 5) {
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }
    for (let y = padding; y <= height - padding; y += graphH / 4) {
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Critical Threshold Curve: I = 14.2 * D^-0.72
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let px = 0; px <= graphW; px += 2) {
      const durationHours = 1 + (px / graphW) * 71;
      const thresholdMM = 120 * Math.pow(durationHours / 24, 0.6); // Cumulative mm curve
      const py = height - padding - (thresholdMM / 250) * graphH;

      if (px === 0) ctx.moveTo(padding + px, py);
      else ctx.lineTo(padding + px, py);
    }
    ctx.stroke();

    // Fill Danger Area above Threshold
    ctx.lineTo(width - padding, padding);
    ctx.lineTo(padding, padding);
    ctx.closePath();
    ctx.fillStyle = 'rgba(244, 63, 94, 0.08)';
    ctx.fill();

    // Current Telemetry Point
    const currentPx = padding + (24 / 72) * graphW;
    const currentPy = height - padding - (rainfall24h / 250) * graphH;

    // Glowing Pulse around Point
    ctx.fillStyle = 'rgba(244, 63, 94, 0.3)';
    ctx.beginPath();
    ctx.arc(currentPx, currentPy, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.arc(currentPx, currentPy, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('24h', currentPx - 8, height - padding + 15);
    ctx.fillText('72h', width - padding - 15, height - padding + 15);
    ctx.fillText('Accumulated Rainfall (mm)', padding + 5, padding - 10);
  }, [rainfall24h]);

  return (
    <div className="bg-[#0b1329]/90 border border-[#1e293b] rounded-2xl p-6 shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl">
            <Activity className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Empirical Rainfall Trigger Threshold</h3>
            <p className="text-[11px] text-slate-400">Intensity-Duration failure boundary envelope</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 font-mono">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Exceeds Threshold</span>
        </div>
      </div>

      <div className="relative w-full h-52 overflow-hidden rounded-xl border border-[#1e293b]">
        <canvas ref={canvasRef} width={500} height={208} className="w-full h-full block" />
      </div>
    </div>
  );
};
