import { useMemo } from 'react';
import { CountryMCMC } from '../types';
import { THRESHOLDS, T_MCMC } from '../data';
import { lambdasAt, pctSorted } from '../utils/mcmc';

interface GRChartProps {
  countries: CountryMCMC[];
  selectedM: number;
  manualB?: number;
}

const GR_W = 680;
const GR_H = 340;
const GR_L = 56;
const GR_R = 20;
const GR_T = 16;
const GR_B = 40;
const LOG_TOP = 2.3;
const LOG_BOTTOM = -3.3;

export function GRChart({ countries, selectedM, manualB }: GRChartProps) {
  const xg = (m: number) => GR_L + ((m - 5.0) / (8.0 - 5.0)) * (GR_W - GR_L - GR_R);
  const yg = (rate: number) => {
    const logr = Math.log10(Math.max(rate, 1e-6));
    const t = (LOG_TOP - logr) / (LOG_TOP - LOG_BOTTOM);
    return GR_T + Math.min(Math.max(t, 0), 1) * (GR_H - GR_T - GR_B);
  };

  const decades = [2, 1, 0, -1, -2, -3];
  const mTicks = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0];

  const renderCountryPaths = (country: CountryMCMC, index: number) => {
    const isSecond = index === 1;
    const accentColor = isSecond ? 'var(--color-accent-2)' : 'var(--accent)';
    const bandColor = isSecond ? 'var(--color-band-2)' : 'var(--band)';

    // Use manual curve if manualB is provided
    const curve = manualB !== undefined ? (() => {
      const gridM: number[] = [];
      for (let m = 5.0; m <= 8.001; m += 0.06) gridM.push(Math.round(m * 1000) / 1000);
      return gridM.map((m) => {
        const lam = lambdasAt(country.samples, m, manualB).sort((a, b) => a - b);
        return {
          m,
          med: pctSorted(lam, 0.5),
          p5: pctSorted(lam, 0.05),
          p95: pctSorted(lam, 0.95),
        };
      });
    })() : country.curve;

    const bandPath = curve.map((p) => `${xg(p.m)},${yg(p.p95)}`).join(' L ') + 
      ' L ' + [...curve].reverse().map((p) => `${xg(p.m)},${yg(p.p5)}`).join(' L ') + ' Z';
    
    const medPath = 'M ' + curve.map((p) => `${xg(p.m)},${yg(p.med)}`).join(' L ');

    const lamAtSel = lambdasAt(country.samples, selectedM, manualB).sort((a, b) => a - b);
    const medSel = pctSorted(lamAtSel, 0.5);
    const xSel = xg(selectedM);
    const ySel = yg(medSel);

    return (
      <g key={country.name}>
        {/* Credibility Band */}
        <path d={bandPath} fill={bandColor} stroke="none" />
        
        {/* Median Path */}
        <path d={medPath} fill="none" stroke={accentColor} strokeWidth="2" />

        {/* Observed Points */}
        {country.cum.map((n, i) => {
          if (n <= 0) return null;
          const rate = n / T_MCMC;
          const x = xg(THRESHOLDS[i]);
          const y = yg(rate);
          return (
            <g key={`point-${country.name}-${i}`}>
              <circle cx={x} cy={y} r="3.5" fill={accentColor} stroke="var(--surface)" strokeWidth="1" />
            </g>
          );
        })}

        {/* Selected Magnitude Marker */}
        <circle cx={xSel} cy={ySel} r={isSecond ? 4 : 5.5} fill="var(--ink)" stroke={accentColor} strokeWidth="2.5" />
      </g>
    );
  };

  const xSel = xg(selectedM);

  return (
    <div className="gr-chart-wrap w-full overflow-hidden">
      <svg viewBox={`0 0 ${GR_W} ${GR_H}`} className="w-full h-auto block" role="img">
        {/* Grid and Axes */}
        {decades.map((d) => {
          const y = yg(Math.pow(10, d));
          return (
            <g key={`y-${d}`}>
              <line x1={GR_L} y1={y} x2={GR_W - GR_R} y2={y} stroke="var(--grid)" strokeWidth="1" />
              <text className="gr-axis-label fill-ink-muted text-[10.5px] font-mono" x={GR_L - 8} y={y + 3} textAnchor="end">
                {d === 0 ? '1' : (
                  <tspan>
                    10<tspan baselineShift="super" fontSize="7">{d}</tspan>
                  </tspan>
                )}
              </text>
            </g>
          );
        })}
        {mTicks.map((m) => {
          const x = xg(m);
          return (
            <g key={`x-${m}`}>
              <line x1={x} y1={GR_T} x2={x} y2={GR_H - GR_B} stroke="var(--grid)" strokeWidth="1" />
              <text className="gr-axis-label fill-ink-muted text-[10.5px] font-mono" x={x} y={GR_H - GR_B + 18} textAnchor="middle">
                {m.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Magnitude Marker Line */}
        <line x1={xSel} y1={GR_T} x2={xSel} y2={GR_H - GR_B} stroke="var(--ink-muted)" strokeWidth="1" strokeDasharray="3,3" />

        {/* Country Paths */}
        {countries.map((c, i) => renderCountryPaths(c, i))}

        <text className="gr-axis-label fill-ink-muted text-[10.5px] font-mono" x={GR_W / 2} y={GR_H - 6} textAnchor="middle">
          Magnitud mínima (Mw)
        </text>
        <text
          className="gr-axis-label fill-ink-muted text-[10.5px] font-mono"
          x="14"
          y={(GR_T + GR_H - GR_B) / 2}
          textAnchor="middle"
          transform={`rotate(-90 14 ${(GR_T + GR_H - GR_B) / 2})`}
        >
          Sismos/año (M≥M), escala log
        </text>
      </svg>
    </div>
  );
}

