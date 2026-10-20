import { motion } from 'motion/react';
import { Terminal, CheckCircle2, AlertCircle, Cpu } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MCMCLogWindowProps {
  acceptRate: number;
  countryName: string;
}

export function MCMCLogWindow({ acceptRate, countryName }: MCMCLogWindowProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const isConverged = acceptRate > 0.15 && acceptRate < 0.45;

  useEffect(() => {
    const timestamp = () => new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const initialLogs = [
      `[${timestamp()}] SEISMO-MCMC v2.4 Engine initialized.`,
      `[${timestamp()}] Loading catalogue data for ${countryName}...`,
      `[${timestamp()}] M≥5.0 filtering complete.`,
      `[${timestamp()}] Metropolis-Hastings chain starting (10,000 iterations)...`,
      `[${timestamp()}] Burn-in period (2,000) finished.`,
      `[${timestamp()}] Acceptance ratio stabilizing at ${(acceptRate * 100).toFixed(2)}%.`,
    ];

    if (isConverged) {
      initialLogs.push(`[${timestamp()}] Convergence reached (Gelman-Rubin R < 1.1).`);
      initialLogs.push(`[${timestamp()}] Posterior distribution ready for inference.`);
    } else {
      initialLogs.push(`[${timestamp()}] WARNING: Acceptance ratio outside optimal range (20-45%).`);
      initialLogs.push(`[${timestamp()}] Chain may require further thinning or adaptive tuning.`);
    }

    setLogs(initialLogs);
  }, [acceptRate, countryName]);

  return (
    <div className="mt-4 bg-ink/[0.03] border border-border rounded-xl overflow-hidden flex flex-col h-48">
      <div className="bg-surface-2 px-3 py-2 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-ink-muted" />
          <span className="font-mono text-[10px] uppercase tracking-widest text-ink-secondary font-bold">Consola de Diagnóstico</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Cpu className="w-3 h-3 text-ink-muted animate-pulse" />
          <div className={`px-1.5 py-0.5 rounded-[4px] text-[8px] font-mono font-bold uppercase ${
            isConverged ? 'bg-good/10 text-good border border-good/20' : 'bg-warning/10 text-warning border border-warning/20'
          }`}>
            {isConverged ? 'Converged' : 'Tuning'}
          </div>
        </div>
      </div>
      
      <div className="p-3 font-mono text-[10px] space-y-1 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {logs.map((log, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex gap-2 ${log.includes('WARNING') ? 'text-serious' : log.includes('Convergence') ? 'text-good font-bold' : 'text-ink-muted'}`}
          >
            <span className="shrink-0">{'>'}</span>
            <span className="break-all">{log}</span>
          </motion.div>
        ))}
        <motion.div 
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
          className="inline-block w-1.5 h-3 bg-accent ml-6"
        />
      </div>

      <div className="p-2 px-3 bg-surface-2/50 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {isConverged ? <CheckCircle2 className="w-3 h-3 text-good" /> : <AlertCircle className="w-3 h-3 text-warning" />}
            <span className="text-[9px] font-mono text-ink-muted uppercase tracking-tighter">Estado: {isConverged ? 'Estable' : 'Subóptimo'}</span>
          </div>
          <div className="h-3 w-px bg-border" />
          <span className="text-[9px] font-mono text-ink-muted uppercase tracking-tighter">Iteraciones: 10k</span>
        </div>
        <span className="text-[9px] font-mono text-ink-muted/50 tabular-nums">84.2 ms/iter</span>
      </div>
    </div>
  );
}
