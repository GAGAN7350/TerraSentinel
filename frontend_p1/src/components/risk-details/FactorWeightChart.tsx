import React from 'react';
import { Cpu, HelpCircle } from 'lucide-react';

interface FactorWeightChartProps {
  rainfall24h: number;
  slopeAngle: number;
  soilSaturation?: number;
}

export const FactorWeightChart: React.FC<FactorWeightChartProps> = ({
  rainfall24h,
  slopeAngle,
  soilSaturation = 88.4,
}) => {
  const factors = [
    {
      name: '24h Precipitation Intensity',
      weight: 35,
      value: `${rainfall24h} mm`,
      status: rainfall24h > 150 ? 'CRITICAL' : rainfall24h > 100 ? 'HIGH' : 'MODERATE',
      color: 'bg-rose-500',
      textColor: 'text-rose-400',
    },
    {
      name: 'Slope Gradient & Geometry',
      weight: 25,
      value: `${slopeAngle}°`,
      status: slopeAngle > 35 ? 'HIGH' : 'MODERATE',
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
    },
    {
      name: 'Pore Water / Soil Saturation',
      weight: 20,
      value: `${soilSaturation}%`,
      status: soilSaturation > 80 ? 'HIGH' : 'MODERATE',
      color: 'bg-cyan-500',
      textColor: 'text-cyan-400',
    },
    {
      name: 'Lithology & Rock Structural Integrity',
      weight: 12,
      value: 'Metamorphic Gneiss',
      status: 'MODERATE',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
    },
    {
      name: 'Land Cover & Vegetation Density',
      weight: 8,
      value: 'NDVI 0.42 (Sparse)',
      status: 'MODERATE',
      color: 'bg-slate-500',
      textColor: 'text-slate-400',
    },
  ];

  return (
    <div className="bg-[#0b1329]/90 border border-[#1e293b] rounded-2xl p-6 shadow-2xl space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">ML Factor Weight Attribution</h3>
            <p className="text-[11px] text-slate-400">RandomForest-XGBoost Ensemble feature importance</p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-white transition" title="Feature Attribution Info">
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {factors.map((f) => (
          <div key={f.name} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">{f.name}</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-400">{f.value}</span>
                <span className={`font-mono font-bold text-[11px] ${f.textColor}`}>
                  {f.weight}% weight
                </span>
              </div>
            </div>
            <div className="w-full bg-[#111c38] rounded-full h-2 overflow-hidden p-0.5 border border-[#1e293b]">
              <div
                className={`h-full rounded-full ${f.color} transition-all duration-500`}
                style={{ width: `${f.weight * 2.5}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
