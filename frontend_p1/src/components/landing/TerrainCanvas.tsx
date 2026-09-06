import React, { useEffect, useRef } from 'react';

interface HazardPoint {
  x: number;
  y: number;
  label: string;
  state: string;
  level: 'CRITICAL' | 'HIGH' | 'MODERATE';
  score: number;
}

export const TerrainCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight || 650;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = (e.clientX - rect.left - width / 2) / (width / 2);
      mouseRef.current.targetY = (e.clientY - rect.top - height / 2) / (height / 2);
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    // Rainfall / Monsoon particles
    const rainParticles = Array.from({ length: 90 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 20 + 10,
      speed: Math.random() * 8 + 6,
      opacity: Math.random() * 0.4 + 0.1,
    }));

    // NER Hazard Radar Nodes
    const hazardNodes: HazardPoint[] = [
      { x: width * 0.48, y: height * 0.45, label: 'East Khasi Hills', state: 'Meghalaya', level: 'CRITICAL', score: 91 },
      { x: width * 0.62, y: height * 0.32, label: 'West Siang Sector', state: 'Arunachal Pradesh', level: 'HIGH', score: 76 },
      { x: width * 0.54, y: height * 0.58, label: 'Silchar Hill Basin', state: 'Assam', level: 'MODERATE', score: 48 },
      { x: width * 0.32, y: height * 0.28, label: 'Gangtok Teesta Zone', state: 'Sikkim', level: 'HIGH', score: 82 },
    ];

    let time = 0;

    const render = () => {
      time += 0.015;

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const offsetX = mouseRef.current.x * 25;
      const offsetY = mouseRef.current.y * 25;

      // Background Gradient
      const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
      bgGradient.addColorStop(0, '#07090E');
      bgGradient.addColorStop(0.5, '#0D1322');
      bgGradient.addColorStop(1, '#07090E');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      // Render Topographic Elevation Contour Lines
      ctx.save();
      ctx.translate(offsetX, offsetY);

      const contourCount = 14;
      for (let i = 0; i < contourCount; i++) {
        ctx.beginPath();
        const baseElevation = (i / contourCount) * height * 0.7 + height * 0.15;
        const alpha = 0.05 + (i / contourCount) * 0.15;
        
        ctx.strokeStyle = i % 3 === 0 ? `rgba(6, 182, 212, ${alpha + 0.1})` : `rgba(16, 185, 129, ${alpha})`;
        ctx.lineWidth = i % 3 === 0 ? 1.5 : 1;

        for (let x = -50; x <= width + 50; x += 25) {
          const noise1 = Math.sin(x * 0.005 + time + i * 0.3) * 35;
          const noise2 = Math.cos(x * 0.012 - time * 0.8 + i) * 20;
          const noise3 = Math.sin(x * 0.002 + i * 0.5) * 45;
          const y = baseElevation + noise1 + noise2 + noise3;

          if (x === -50) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Render Scanning Radar Sweep Circle
      const radarCenterX = width * 0.5;
      const radarCenterY = height * 0.45;
      const radarRadius = Math.min(width, height) * 0.38;

      ctx.beginPath();
      ctx.arc(radarCenterX, radarCenterY, radarRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.12)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Radar pulse ring expansion
      const pulseRadius = (time * 60) % radarRadius;
      ctx.beginPath();
      ctx.arc(radarCenterX, radarCenterY, pulseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(16, 185, 129, ${0.4 * (1 - pulseRadius / radarRadius)})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Render Hazard Nodes in NER
      hazardNodes.forEach((node) => {
        const nx = node.x;
        const ny = node.y;

        let color = '#10B981'; // LOW
        if (node.level === 'CRITICAL') color = '#EF4444';
        if (node.level === 'HIGH') color = '#F97316';
        if (node.level === 'MODERATE') color = '#F59E0B';

        // Outer beacon ring
        const ringSize = (time * 25 + node.score) % 30 + 8;
        ctx.beginPath();
        ctx.arc(nx, ny, ringSize, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.globalAlpha = Math.max(0, 1 - ringSize / 38);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Core Point
        ctx.beginPath();
        ctx.arc(nx, ny, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Node Label Tag
        ctx.font = '11px Inter, sans-serif';
        ctx.fillStyle = 'rgba(249, 250, 251, 0.85)';
        ctx.fillText(node.label, nx + 12, ny - 6);

        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = color;
        ctx.fillText(`${node.level} • ${node.score}/100`, nx + 12, ny + 8);
      });

      ctx.restore();

      // Render Monsoon Rain Atmosphere
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.35)';
      ctx.lineWidth = 1;
      rainParticles.forEach((p) => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 2, p.y + p.length);
        ctx.stroke();

        p.y += p.speed;
        p.x -= 0.5;

        if (p.y > height) {
          p.y = -p.length;
          p.x = Math.random() * width;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-auto">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Subtle overlay gradient vignettes */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-transparent to-[#07090E]/60 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#07090E]/80 via-transparent to-[#07090E]/80 pointer-events-none" />
    </div>
  );
};
