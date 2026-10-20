import { useMemo } from 'react';

interface ProbHistogramProps {
  probabilities: number[];
  color: string;
  label: string;
}

const HIST_W = 400;
const HIST_H = 120;
const HIST_B = 25;
const HIST_L = 10;
const HIST_R = 10;
const HIST_T = 10;

export function ProbHistogram({ probabilities, color, label }: ProbHistogramProps) {
  const binsCount = 40;
  
  const { bins, maxBinValue, minX, maxX } = useMemo(() => {
    if (probabilities.length === 0) return { bins: [], maxBinValue: 0, minX: 0, maxX: 100 };
    
    let min = Math.min(...probabilities);
    let max = Math.max(...probabilities);
    
    // Ensure some width if all samples are identical
    if (max - min < 0.01) {
      min -= 0.5;
      max += 0.5;
    }

    // Buffer
    const range = max - min;
    const minX = Math.max(0, min - range * 0.1);
    const maxX = Math.min(100, max + range * 0.1);
    
    const binSize = (maxX - minX) / binsCount;
    const bins = new Array(binsCount).fill(0);
    
    probabilities.forEach(p => {
      const bIdx = Math.floor((p - minX) / binSize);
      if (bIdx >= 0 && bIdx < binsCount) {
        bins[bIdx]++;
      } else if (bIdx === binsCount) {
        bins[binsCount - 1]++;
      }
    });
    
    return { bins, maxBinValue: Math.max(...bins), minX, maxX };
  }, [probabilities]);

  const xg = (p: number) => HIST_L + ((p - minX) / (maxX - minX)) * (HIST_W - HIST_L - HIST_R);
  const yg = (count: number) => HIST_H - HIST_B - (count / maxBinValue) * (HIST_H - HIST_B - HIST_T);

  const binWidth = (HIST_W - HIST_L - HIST_R) / binsCount;

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-muted">Distribución de Probabilidad ({label})</span>
      </div>
      <div className="bg-surface-2/30 rounded-lg p-3 border border-border/50">
        <svg viewBox={`0 0 ${HIST_W} ${HIST_H}`} className="w-full h-auto block overflow-visible">
          {/* Base line */}
          <line x1={HIST_L} y1={HIST_H - HIST_B} x2={HIST_W - HIST_R} y2={HIST_H - HIST_B} stroke="var(--border)" strokeWidth="1" />
          
          {/* Bins */}
          {bins.map((count, i) => {
            const x = HIST_L + i * binWidth;
            const y = yg(count);
            const h = HIST_H - HIST_B - y;
            if (h <= 0) return null;
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={Math.max(1, binWidth - 1)}
                height={h}
                fill={color}
                className="opacity-60"
                rx={1}
              />
            );
          })}
          
          {/* Labels */}
          <text x={xg(minX)} y={HIST_H - 8} className="fill-ink-muted text-[9px] font-mono" textAnchor="start">{minX.toFixed(1)}%</text>
          <text x={xg(maxX)} y={HIST_H - 8} className="fill-ink-muted text-[9px] font-mono" textAnchor="end">{maxX.toFixed(1)}%</text>
          
          {/* Median marker */}
          {probabilities.length > 0 && (() => {
            const sorted = [...probabilities].sort((a, b) => a - b);
            const med = sorted[Math.floor(sorted.length / 2)];
            const x = xg(med);
            return (
              <g>
                <line x1={x} y1={HIST_T} x2={x} y2={HIST_H - HIST_B} stroke={color} strokeWidth="1.5" strokeDasharray="2,2" />
                <circle cx={x} cy={HIST_T} r="2" fill={color} />
              </g>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}
