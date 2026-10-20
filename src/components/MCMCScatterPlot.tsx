import { useMemo } from 'react';
import { Sample } from '../types';

interface MCMCScatterPlotProps {
  samples: Sample[];
  color: string;
}

const PLOT_W = 400;
const PLOT_H = 300;
const PLOT_L = 40;
const PLOT_R = 10;
const PLOT_T = 10;
const PLOT_B = 40;

export function MCMCScatterPlot({ samples, color }: MCMCScatterPlotProps) {
  // We'll downsample to avoid rendering thousands of SVG circles
  const displaySamples = useMemo(() => {
    const step = Math.max(1, Math.floor(samples.length / 500));
    const result = [];
    for (let i = 0; i < samples.length; i += step) {
      result.push(samples[i]);
    }
    return result;
  }, [samples]);

  const { minB, maxB, minL, maxL } = useMemo(() => {
    let minB = Infinity, maxB = -Infinity, minL = Infinity, maxL = -Infinity;
    samples.forEach(s => {
      if (s.b < minB) minB = s.b;
      if (s.b > maxB) maxB = s.b;
      if (s.logl < minL) minL = s.logl;
      if (s.logl > maxL) maxL = s.logl;
    });
    // Add buffer
    const rangeB = maxB - minB;
    const rangeL = maxL - minL;
    return {
      minB: minB - rangeB * 0.1,
      maxB: maxB + rangeB * 0.1,
      minL: minL - rangeL * 0.1,
      maxL: maxL + rangeL * 0.1
    };
  }, [samples]);

  const xg = (b: number) => PLOT_L + ((b - minB) / (maxB - minB)) * (PLOT_W - PLOT_L - PLOT_R);
  const yg = (logl: number) => PLOT_H - PLOT_B - ((logl - minL) / (maxL - minL)) * (PLOT_H - PLOT_B - PLOT_T);

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-2">
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">Correlación de Parámetros (b vs log λ₆)</span>
      </div>
      <div className="bg-surface-2/30 rounded-xl p-4 border border-border/50">
        <svg viewBox={`0 0 ${PLOT_W} ${PLOT_H}`} className="w-full h-auto block overflow-visible">
          {/* Grid lines */}
          <line x1={PLOT_L} y1={PLOT_H - PLOT_B} x2={PLOT_W - PLOT_R} y2={PLOT_H - PLOT_B} stroke="var(--border)" strokeWidth="1" />
          <line x1={PLOT_L} y1={PLOT_T} x2={PLOT_L} y2={PLOT_H - PLOT_B} stroke="var(--border)" strokeWidth="1" />
          
          {/* Axis Labels */}
          <text x={PLOT_W / 2 + PLOT_L / 2} y={PLOT_H - 8} className="fill-ink-muted text-[10px] font-mono" textAnchor="middle">Parámetro b</text>
          <text 
            x={12} 
            y={(PLOT_H - PLOT_B + PLOT_T) / 2} 
            className="fill-ink-muted text-[10px] font-mono" 
            textAnchor="middle" 
            transform={`rotate(-90 12 ${(PLOT_H - PLOT_B + PLOT_T) / 2})`}
          >
            log₁₀ λ(M6)
          </text>

          {/* Scale labels */}
          <text x={PLOT_L} y={PLOT_H - PLOT_B + 14} className="fill-ink-muted text-[9px] font-mono" textAnchor="middle">{minB.toFixed(2)}</text>
          <text x={PLOT_W - PLOT_R} y={PLOT_H - PLOT_B + 14} className="fill-ink-muted text-[9px] font-mono" textAnchor="middle">{maxB.toFixed(2)}</text>
          
          <text x={PLOT_L - 6} y={PLOT_H - PLOT_B} className="fill-ink-muted text-[9px] font-mono" textAnchor="end">{minL.toFixed(2)}</text>
          <text x={PLOT_L - 6} y={PLOT_T + 4} className="fill-ink-muted text-[9px] font-mono" textAnchor="end">{maxL.toFixed(2)}</text>

          {/* Scatter points */}
          {displaySamples.map((s, i) => (
            <circle
              key={i}
              cx={xg(s.b)}
              cy={yg(s.logl)}
              r="1.5"
              fill={color}
              className="opacity-20"
            />
          ))}

          {/* Medians intersection */}
          {(() => {
            const bs = [...samples].map(s => s.b).sort((a, b) => a - b);
            const ls = [...samples].map(s => s.logl).sort((a, b) => a - b);
            const medB = bs[Math.floor(bs.length / 2)];
            const medL = ls[Math.floor(ls.length / 2)];
            const x = xg(medB);
            const y = yg(medL);
            return (
              <g>
                <line x1={x} y1={PLOT_T} x2={x} y2={PLOT_H - PLOT_B} stroke={color} strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1={PLOT_L} y1={y} x2={PLOT_W - PLOT_R} y2={y} stroke={color} strokeWidth="0.5" strokeDasharray="2,2" />
                <circle cx={x} cy={y} r="3" fill="var(--ink)" stroke={color} strokeWidth="1.5" />
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}
