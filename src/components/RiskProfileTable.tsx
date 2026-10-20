import { lambdasAt, pctSorted } from '../utils/mcmc';
import { CountryMCMC } from '../types';

interface RiskProfileTableProps {
  country: CountryMCMC;
  horizon: number;
  isManualB: boolean;
  manualB: number;
}

export function RiskProfileTable({ country, horizon, isManualB, manualB }: RiskProfileTableProps) {
  const magnitudes = [5.5, 6.0, 6.5, 7.0];
  
  const rows = magnitudes.map(M => {
    const forcedB = isManualB ? manualB : undefined;
    const lamArr = lambdasAt(country.samples, M, forcedB).sort((a, b) => a - b);
    const probArr = lamArr.map(l => 1 - Math.exp(-l * horizon)).sort((a, b) => a - b);
    const recArr = lamArr.map(l => 1 / l).sort((a, b) => a - b);

    return {
      M,
      prob: pctSorted(probArr, 0.5) * 100,
      probLow: pctSorted(probArr, 0.05) * 100,
      probHigh: pctSorted(probArr, 0.95) * 100,
      recurrence: pctSorted(recArr, 0.5),
    };
  });

  return (
    <div className="mt-8 bg-surface-2 border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-border bg-surface flex items-center justify-between">
        <h3 className="font-archivo font-bold text-[11px] uppercase tracking-wider text-accent">Perfil de Riesgo Multi-Magnitud ({horizon} años)</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[500px]">
          <thead>
            <tr className="border-b border-border bg-surface/50 font-mono text-[9px] uppercase tracking-wider text-ink-muted">
              <th className="px-4 py-3 font-bold">Magnitud Umbral</th>
              <th className="px-4 py-3 font-bold">Probabilidad Mediana</th>
              <th className="px-4 py-3 font-bold">Rango Credibilidad (90%)</th>
              <th className="px-4 py-3 font-bold">Recurrencia Estimada</th>
            </tr>
          </thead>
          <tbody className="text-[12px] font-mono">
            {rows.map((row, i) => (
              <tr key={row.M} className={`border-b border-border/50 hover:bg-ink/5 transition-colors ${i === rows.length - 1 ? 'border-0' : ''}`}>
                <td className="px-4 py-3 font-bold text-ink whitespace-nowrap">M ≥ {row.M.toFixed(1)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${row.prob > 50 ? 'bg-serious/10 text-serious' : 'bg-good/10 text-good'}`}>
                    {row.prob.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-3 text-ink-secondary tabular-nums">
                  {row.probLow.toFixed(1)}% – {row.probHigh.toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-ink-muted tabular-nums">
                  {row.recurrence >= 500 ? '500+ años' : `~ ${row.recurrence.toFixed(1)} años`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-surface/30 text-[10px] text-ink-muted italic border-t border-border">
        * Estimaciones robustas generadas para <strong>{country.name}</strong>. Reflejan la probabilidad acumulada de excedencia.
      </div>
    </div>
  );
}
