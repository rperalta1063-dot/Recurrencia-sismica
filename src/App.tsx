import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, AlertTriangle, Info, Globe, Activity, BarChart3, Database, Columns, Loader2, BookOpen, Sun, Moon } from 'lucide-react';
import { countries, grRawData, riskLabels } from './data';
import { computeMCMCData, lambdasAt, pctSorted } from './utils/mcmc';
import { GRChart } from './components/GRChart';
import { ProbHistogram } from './components/ProbHistogram';
import { MCMCScatterPlot } from './components/MCMCScatterPlot';
import { MCMCLogWindow } from './components/MCMCLogWindow';
import { UserManual } from './components/UserManual';
import { Tooltip } from './components/Tooltip';
import { RiskProfileTable } from './components/RiskProfileTable';
import { SeismicMap } from './components/SeismicMap';

export default function App() {
  const mcmcData = useMemo(() => computeMCMCData(grRawData), []);
  const [currentCountry, setCurrentCountry] = useState(mcmcData.find(c => c.name === "Guatemala") || mcmcData[0]);
  const [comparisonCountry, setComparisonCountry] = useState(mcmcData.find(c => c.name === "Costa Rica") || mcmcData[1]);
  const [isComparisonMode, setIsComparisonMode] = useState(false);
  const [selectedM, setSelectedM] = useState(6.5);
  const [currentT, setCurrentT] = useState(25);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isManualB, setIsManualB] = useState(false);
  const [manualB, setManualB] = useState(1.0);
  const [mapViewMode, setMapViewMode] = useState<'total' | 'mcmc'>('mcmc');
  const [isCalculating, setIsCalculating] = useState(false);
  const [riskThreshold, setRiskThreshold] = useState(50); // Default 50%
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Handle theme logic
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  // Simulate recalculation delay for visual feedback
  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => setIsCalculating(false), 350);
    return () => clearTimeout(timer);
  }, [currentCountry, comparisonCountry, selectedM, isManualB, manualB, isComparisonMode]);

  const lamMed = currentCountry.curve.find(p => p.m >= selectedM)?.med ?? 0;
  const lamP5 = currentCountry.curve.find(p => p.m >= selectedM)?.p5 ?? 0;
  const lamP95 = currentCountry.curve.find(p => p.m >= selectedM)?.p95 ?? 0;

  const returnPeriodMed = lamMed > 0 ? 1 / lamMed : Infinity;
  const returnPeriodP5 = lamP95 > 0 ? 1 / lamP95 : Infinity;
  const returnPeriodP95 = lamP5 > 0 ? 1 / lamP5 : Infinity;

  const horizons = [1, 5, 10, 25, 50, 100];

  const getStats = (country: typeof currentCountry) => {
    const forcedB = isManualB ? manualB : undefined;
    const lam = lambdasAt(country.samples, selectedM, forcedB).sort((a, b) => a - b);
    const probArr = lam.map(l => 1 - Math.exp(-l * currentT)).sort((a, b) => a - b);
    const recArr = lam.map(l => 1 / l).sort((a, b) => a - b);

    return {
      pMed: pctSorted(probArr, 0.5) * 100,
      pLo: pctSorted(probArr, 0.05) * 100,
      pHi: pctSorted(probArr, 0.95) * 100,
      rMed: pctSorted(recArr, 0.5),
      rLo: pctSorted(recArr, 0.05),
      rHi: pctSorted(recArr, 0.95),
      probSamples: probArr.map(p => p * 100)
    };
  };

  const stats1 = useMemo(() => getStats(currentCountry), [currentCountry, selectedM, currentT, isManualB, manualB]);
  const stats2 = useMemo(() => getStats(comparisonCountry), [comparisonCountry, selectedM, currentT, isManualB, manualB]);

  const fmtYears = (y: number) => {
    if (!isFinite(y)) return "—";
    if (y >= 500) return "más de 500";
    if (y >= 10) return y.toFixed(0);
    return y.toFixed(1);
  };

  const handleCountrySelect = (country: typeof currentCountry) => {
    if (isComparisonMode) {
      if (currentCountry.name === country.name) return;
      setComparisonCountry(country);
    } else {
      setCurrentCountry(country);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-ink font-sans selection:bg-accent/30">
      <div className="max-w-[960px] mx-auto px-6 py-14 md:py-20 pb-20">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-3.5">
            <div>
              <p className="font-mono text-[11.5px] tracking-wider uppercase text-accent">
                Geofísica y Análisis de Riesgo
              </p>
              <h1 className="font-archivo font-extrabold text-3xl md:text-5xl tracking-tight leading-[1.08] text-balance mt-2">
                Recurrencia sísmica en Centroamérica y el Caribe
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface-2 border border-border text-ink-secondary hover:text-ink transition-colors"
                title={theme === 'light' ? 'Activar modo oscuro' : 'Activar modo claro'}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsManualOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-mono uppercase tracking-widest transition-all bg-accent/5 text-accent border border-accent/20 hover:bg-accent/10"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Guía Didáctica</span>
              </button>
              <button
                onClick={() => setIsComparisonMode(!isComparisonMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all border ${
                  isComparisonMode 
                  ? 'bg-accent-2/10 border-accent-2 text-accent-2' 
                  : 'bg-surface-2 border-border text-ink-secondary hover:text-ink'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                {isComparisonMode ? 'Modo Comparación: On' : 'Modo Comparación'}
              </button>
            </div>
          </div>
          <p className="text-[16.5px] text-ink-secondary leading-relaxed max-w-[68ch] mb-9">
            Estimador probabilístico interactivo, por país y por magnitud, para nueve países — construido con un modelo bayesiano de Gutenberg–Richter ajustado por MCMC sobre el catálogo del <em>U.S. Geological Survey</em> (USGS).
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-[1px] bg-border border border-border rounded-xl overflow-hidden mb-14"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-surface p-4 md:p-5">
            <span className="block font-mono font-medium text-2xl tabular-nums">9</span>
            <span className="text-[12.5px] text-ink-muted">Países modelados</span>
          </div>
          <div className="bg-surface p-4 md:p-5">
            <span className="block font-mono font-medium text-2xl tabular-nums">1980–2026</span>
            <span className="text-[12.5px] text-ink-muted">Ventana MCMC (46.7a)</span>
          </div>
          <div className="bg-surface p-4 md:p-5">
            <span className="block font-mono font-medium text-2xl tabular-nums">M5.0–M8.0</span>
            <span className="text-[12.5px] text-ink-muted">Rango de magnitud</span>
          </div>
          <div className="bg-surface p-4 md:p-5">
            <span className="block font-mono font-medium text-2xl tabular-nums">USGS</span>
            <span className="text-[12.5px] text-ink-muted">Fuente de datos</span>
          </div>
        </motion.div>

        {/* Interactive Estimator */}
        <section className="mt-14">
          <h2 className="font-archivo font-bold text-2xl tracking-tight mb-2">Estimador interactivo</h2>
          <p className="text-[14.5px] text-ink-muted max-w-[68ch] mb-6">
            Elige un país, una magnitud y un horizonte de tiempo. El resultado es la mediana posterior de una cadena de Markov Monte Carlo propia de ese país.
          </p>

          <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 relative overflow-hidden">
            {/* Intellectual Property Badge */}
            <div className="absolute top-0 right-0 p-3 opacity-40 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-2 border border-border text-[9px] font-mono font-bold text-ink-muted">
                <Database className="w-2.5 h-2.5" />
                <span>RPG PROPRIETARY MCMC MODEL</span>
              </div>
            </div>

            {/* Progress Indicator */}
            <AnimatePresence>
              {isCalculating && (
                <>
                  <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: "linear" }}
                    className="absolute top-0 left-0 right-0 h-1 bg-accent origin-left z-[60]"
                  />
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 bg-surface/40 backdrop-blur-[1px] flex items-center justify-center pointer-events-none"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-accent animate-spin" />
                      <span className="font-mono text-[10px] uppercase tracking-widest text-accent font-bold bg-surface px-2 py-1 rounded shadow-sm border border-accent/20">Recalculando modelo...</span>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <div className="space-y-6 md:space-y-8">
              {/* Country Selection */}
              <div>
                <label className="block font-mono text-[11px] tracking-widest uppercase text-ink-muted mb-3">
                  {isComparisonMode ? 'Países seleccionados (Primario / Comparación)' : 'País seleccionado'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {mcmcData.map(c => {
                    const isPrimary = currentCountry.name === c.name;
                    const isSecondary = isComparisonMode && comparisonCountry.name === c.name;
                    return (
                      <button
                        key={c.name}
                        onClick={() => handleCountrySelect(c)}
                        className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium border transition-all ${
                          isPrimary
                            ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20'
                            : isSecondary
                            ? 'bg-accent-2 border-accent-2 text-white shadow-lg shadow-accent-2/20'
                            : 'bg-surface-2 border-border text-ink-secondary hover:border-accent hover:text-ink'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Magnitude Slider */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="block font-mono text-[11px] tracking-widest uppercase text-ink-muted">
                    Magnitud mínima (Mw) — M≥{selectedM.toFixed(1)}
                  </label>
                  <span className="font-mono text-xl tabular-nums text-ink">M {selectedM.toFixed(1)}</span>
                </div>
                <div className="relative h-10 flex items-center">
                  <input
                    type="range"
                    min="5.0"
                    max="8.0"
                    step="0.1"
                    value={selectedM}
                    onChange={(e) => setSelectedM(parseFloat(e.target.value))}
                    className="w-full h-1 bg-gradient-to-r from-good via-warning to-critical rounded-full appearance-none cursor-pointer accent-ink focus:outline-none focus:ring-2 focus:ring-accent/50"
                  />
                </div>
                <div className="flex justify-between font-mono text-[11px] text-ink-muted mt-1.5">
                  <span>5.0</span>
                  <span>6.0</span>
                  <span>7.0</span>
                  <span>8.0</span>
                </div>
              </div>

              {/* Sensitivity Override (Manual B) */}
              <div className="p-4 bg-surface-2 border border-border rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <label className="block font-mono text-[11px] tracking-widest uppercase text-ink-muted">Simulación de Sensibilidad (Valor b)</label>
                    <p className="text-[10px] text-ink-muted mt-1">Modifica manualmente la tasa de decaimiento sísmico</p>
                  </div>
                  <button 
                    onClick={() => setIsManualB(!isManualB)}
                    className={`px-3 py-1 rounded text-[10px] font-mono uppercase tracking-wider transition-all border ${
                      isManualB ? 'bg-ink border-ink text-bg' : 'bg-surface border-border text-ink-muted'
                    }`}
                  >
                    {isManualB ? 'Manual: On' : 'Usar MCMC'}
                  </button>
                </div>

                <AnimatePresence>
                  {isManualB && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex justify-between items-end mb-2">
                        <span className="font-mono text-[11px] text-ink">b = {manualB.toFixed(2)}</span>
                        <span className="text-[10px] text-ink-muted">Valores típicos: 0.8 — 1.2</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.01"
                        value={manualB}
                        onChange={(e) => setManualB(parseFloat(e.target.value))}
                        className="w-full h-1 bg-surface rounded-full appearance-none cursor-pointer accent-accent"
                      />
                      <p className="text-[10px] text-ink-muted mt-4 italic">
                        * Un valor b más alto indica una mayor proporción de sismos pequeños frente a grandes. Un valor bajo (≤0.8) indica un riesgo sísmico mayor para magnitudes elevadas.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Risk Alert Threshold */}
              <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded bg-accent/10">
                      <AlertTriangle className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <div>
                      <label className="block font-mono text-[11px] tracking-widest uppercase text-accent font-bold">Umbral de Alerta de Riesgo</label>
                      <p className="text-[10px] text-ink-muted mt-0.5">Notifica cuando la probabilidad supera este valor</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-bold text-accent">{riskThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="99"
                  step="1"
                  value={riskThreshold}
                  onChange={(e) => setRiskThreshold(parseInt(e.target.value))}
                  className="w-full h-1 bg-accent/10 rounded-full appearance-none cursor-pointer accent-accent"
                />
              </div>

              {/* Horizon Selection */}
              <div>
                <label className="block font-mono text-[11px] tracking-widest uppercase text-ink-muted mb-3">
                  Horizonte temporal
                </label>
                <div className="flex flex-wrap gap-2">
                  {horizons.map(h => (
                    <button
                      key={h}
                      onClick={() => setCurrentT(h)}
                      className={`px-4 py-1.5 rounded-full text-[13px] font-medium border transition-all ${
                        currentT === h
                          ? 'bg-ink border-ink text-bg'
                          : 'bg-surface-2 border-border text-ink-secondary hover:border-accent hover:text-ink'
                      }`}
                    >
                      {h} año{h > 1 ? 's' : ''}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Output Card(s) */}
            <div className={`mt-8 grid gap-4 ${isComparisonMode ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              {/* Risk Alert Notification */}
              {stats1.pMed > riskThreshold && (
                <div className={isComparisonMode ? 'md:col-span-2' : 'grid-cols-1'}>
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-serious/10 border-2 border-serious/40 rounded-2xl p-5 flex items-center gap-4 shadow-xl shadow-serious/5 mb-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-serious/20 flex items-center justify-center animate-pulse">
                      <AlertTriangle className="w-6 h-6 text-serious" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded bg-serious text-white font-mono text-[9px] font-bold tracking-widest">ALERTA DE RIESGO</span>
                        <span className="text-[11px] font-bold text-serious uppercase tracking-tighter">Umbral excedido ({riskThreshold}%)</span>
                      </div>
                      <p className="text-[13px] text-ink leading-snug">
                        La probabilidad calculada para <strong className="text-serious">{currentCountry.name}</strong> ({stats1.pMed.toFixed(1)}%) supera su límite de tolerancia definido.
                      </p>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* Primary Country */}
              <motion.div
                className={`bg-surface-2 border border-border rounded-xl p-6 flex flex-col items-center text-center md:items-start md:text-left gap-4 ${isComparisonMode ? 'border-l-4 border-l-accent' : ''}`}
                layout
              >
                <div className="w-full flex justify-between items-center mb-1">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-accent">{currentCountry.name}</span>
                </div>
                <div className="font-mono font-medium text-5xl text-accent tabular-nums leading-none">
                  {stats1.pMed.toFixed(1)}%
                </div>
                <div>
                  <p className="text-[13px] text-ink-secondary leading-snug">
                    Probabilidad M≥{selectedM.toFixed(1)} en {currentT} años.
                  </p>
                  <p className="text-[11px] text-ink-muted mt-2">
                    <Tooltip content="El intervalo (p5-p95) que contiene el 90% de las simulaciones MCMC. Indica la incertidumbre epistémica del modelo.">
                      Cred. 90%
                    </Tooltip>: {stats1.pLo.toFixed(1)}–{stats1.pHi.toFixed(1)}% · <Tooltip content="El intervalo promedio de años entre eventos de la magnitud seleccionada (1/λ).">Recurrencia</Tooltip>: {fmtYears(stats1.rMed)}a
                  </p>
                </div>
                <ProbHistogram 
                  probabilities={stats1.probSamples} 
                  color="var(--accent)" 
                  label={currentCountry.name} 
                />
              </motion.div>

              {/* Secondary Country (Comparison) */}
              {isComparisonMode && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-surface-2 border border-border rounded-xl p-6 flex flex-col items-center text-center md:items-start md:text-left gap-4 border-l-4 border-l-accent-2"
                  layout
                >
                  <div className="w-full flex justify-between items-center mb-1">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-accent-2">{comparisonCountry.name}</span>
                  </div>
                  <div className="font-mono font-medium text-5xl text-accent-2 tabular-nums leading-none">
                    {stats2.pMed.toFixed(1)}%
                  </div>
                  <div>
                    <p className="text-[13px] text-ink-secondary leading-snug">
                      Probabilidad M≥{selectedM.toFixed(1)} en {currentT} años.
                    </p>
                    <p className="text-[11px] text-ink-muted mt-2">
                      <Tooltip content="El intervalo (p5-p95) que contiene el 90% de las simulaciones MCMC. Indica la incertidumbre epistémica del modelo.">
                        Cred. 90%
                      </Tooltip>: {stats2.pLo.toFixed(1)}–{stats2.pHi.toFixed(1)}% · <Tooltip content="El intervalo promedio de años entre eventos de la magnitud seleccionada (1/λ).">Recurrencia</Tooltip>: {fmtYears(stats2.rMed)}a
                    </p>
                  </div>
                  <ProbHistogram 
                    probabilities={stats2.probSamples} 
                    color="var(--color-accent-2)" 
                    label={comparisonCountry.name} 
                  />
                </motion.div>
              )}
            </div>

            {/* Risk Profile Table */}
            {!isComparisonMode && (
              <RiskProfileTable 
                country={currentCountry} 
                horizon={currentT} 
                isManualB={isManualB}
                manualB={manualB}
              />
            )}

            {/* Comparison Summary */}
            {isComparisonMode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-1 bg-surface-2 border border-border rounded-xl overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-px bg-border">
                  <div className="bg-surface-2 p-4">
                    <span className="block font-mono text-[9px] uppercase tracking-widest text-ink-muted mb-1">Dif. Probabilidad</span>
                    <div className="flex items-baseline gap-2">
                      <span className={`font-mono text-xl tabular-nums ${stats1.pMed > stats2.pMed ? 'text-serious' : 'text-good'}`}>
                        {stats1.pMed > stats2.pMed ? '+' : ''}{(((stats1.pMed - stats2.pMed) / stats2.pMed) * 100).toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-ink-muted">vs {comparisonCountry.name}</span>
                    </div>
                  </div>
                  <div className="bg-surface-2 p-4">
                    <span className="block font-mono text-[9px] uppercase tracking-widest text-ink-muted mb-1">Dif. Recurrencia</span>
                    <div className="flex items-baseline gap-2">
                      <span className={`font-mono text-xl tabular-nums ${stats1.rMed < stats2.rMed ? 'text-serious' : 'text-good'}`}>
                        {stats1.rMed < stats2.rMed ? '-' : '+'}{Math.abs(((stats1.rMed - stats2.rMed) / stats2.rMed) * 100).toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-ink-muted">en tiempo de retorno</span>
                    </div>
                  </div>
                </div>
                <div className="bg-surface/50 p-3 text-center border-t border-border">
                  <p className="text-[11px] text-ink-secondary">
                    Análisis relativo: <span className="text-ink">{currentCountry.name}</span> presenta una amenaza sísmica <span className={stats1.pMed > stats2.pMed ? 'text-serious' : 'text-good'}>{stats1.pMed > stats2.pMed ? 'mayor' : 'menor'}</span>. factor de <span className="text-ink font-mono">{(Math.max(stats1.pMed, stats2.pMed) / Math.min(stats1.pMed, stats2.pMed)).toFixed(2)}x</span>.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Return Period Tool */}
            <div className="mt-8 pt-8 border-t border-border">
              <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-24 h-24 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent/10" />
                    <circle 
                      cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" 
                      strokeDasharray={`${Math.min(282, (10 / returnPeriodMed) * 282)} 282`} 
                      className="text-accent transition-all duration-1000" 
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-8 h-8 text-accent opacity-50" />
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                    <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent font-bold">Periodo de Retorno Sísmico</h3>
                    <div className="px-1.5 py-0.5 rounded bg-accent text-white text-[8px] font-bold">ESTIMACIÓN MCMC</div>
                  </div>
                  <p className="text-3xl font-bold text-ink mb-2">
                    ~ {returnPeriodMed < 1 ? (returnPeriodMed * 12).toFixed(1) + ' meses' : returnPeriodMed.toFixed(1) + ' años'}
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-[11px] text-ink-secondary">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-ink-muted/30" />
                      <Tooltip content="Rango de años que abarca desde el percentil 5 al 95 de la distribución posterior.">
                        Intervalo (90% CI)
                      </Tooltip>: <b className="text-ink">{returnPeriodP5.toFixed(1)} – {returnPeriodP95.toFixed(1)} años</b>
                    </span>
                    <span className="text-ink-muted/50 hidden sm:inline">|</span>
                    <span className="text-ink-muted italic">Frecuencia estimada para Mw {selectedM.toFixed(1)}</span>
                  </div>
                </div>

                <div className="md:w-56 text-[10px] leading-relaxed text-ink-muted bg-surface/50 p-4 rounded-xl border border-border/50">
                  <p className="font-bold text-ink mb-1 uppercase tracking-wider">Concepto de Retorno</p>
                  Representa el tiempo promedio estadístico entre eventos de esta magnitud. Es el inverso de la tasa anual de excedencia calculada por el modelo bayesiano.
                </div>
              </div>
            </div>

            {/* Warnings */}
            <AnimatePresence>
              {selectedM > 7.0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 flex gap-3 p-3 text-[13px] text-ink-secondary bg-serious/10 border border-serious/40 rounded-lg overflow-hidden"
                >
                  <AlertTriangle className="w-4 h-4 text-serious shrink-0 mt-0.5" />
                  <p>
                    <strong>M≥{selectedM.toFixed(1)}</strong> es una extrapolación. Está por encima del rango observado (5.0–7.0), por lo que la incertidumbre real es mayor a la reportada.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chart Area */}
            <div className="mt-8 border-t border-border pt-8">
              <div className="flex flex-wrap gap-x-6 gap-y-3 mb-6 text-[10px] font-mono text-ink-muted uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" /> {isComparisonMode ? currentCountry.name : 'Sismos observados'}
                </div>
                {isComparisonMode && (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent-2" /> {comparisonCountry.name}
                  </div>
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <span className="w-4 h-0.5 bg-ink/20" /> 
                  <Tooltip content="El valor central de la distribución de probabilidad generada por las 10,000 muestras. Es el estimador más robusto.">
                    Mediana posterior
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-2.5 bg-ink/5 border border-ink/10 rounded-sm" /> 
                  <Tooltip content="Área sombreada que representa donde cae el 90% de la densidad de probabilidad posterior.">
                    Credibilidad 90%
                  </Tooltip>
                </div>
              </div>
              <GRChart 
                countries={isComparisonMode ? [currentCountry, comparisonCountry] : [currentCountry]} 
                selectedM={selectedM} 
                manualB={isManualB ? manualB : undefined}
              />
            </div>

            {/* Diagnostics */}
            {!isComparisonMode && (
              <div className="mt-8 border-t border-border pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div>
                    <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-secondary mb-3 flex items-center gap-2">
                      <Activity className="w-3 h-3" /> Diagnósticos MCMC
                    </h3>
                    <p className="font-mono text-[11px] text-ink-muted leading-relaxed">
                      La cadena de Markov muestra la convergencia de los parámetros del modelo. La correlación negativa entre <strong>b</strong> y <strong>λ₆</strong> es típica en ajustes de Gutenberg-Richter, donde una mayor tasa base a menudo se compensa con un decaimiento más pronunciado para ajustarse a los mismos datos observados.
                    </p>
                    <div className="mt-4 p-3 bg-surface-2/50 rounded-lg border border-border/50 font-mono text-[10px] text-ink-muted space-y-1">
                      <div className="flex justify-between">
                        <Tooltip content="Pendiente de la ley G-R. Valores bajos (≤0.8) implican sismos grandes más frecuentes.">
                          <span>Parámetro b:</span>
                        </Tooltip> 
                        <span className="text-ink">{currentCountry.bMed.toFixed(2)} [{currentCountry.bP5.toFixed(2)}–{currentCountry.bP95.toFixed(2)}]</span>
                      </div>
                      <div className="flex justify-between">
                        <Tooltip content="Tasa anual base de sismicidad para una magnitud de referencia de 6.0.">
                          <span>λ(M6.0):</span>
                        </Tooltip>
                        <span className="text-ink">{currentCountry.lam6Med.toFixed(3)} sismos/año</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Eventos (n):</span> 
                        <span className="text-ink">{currentCountry.totalEvents} (M≥5.0)</span>
                      </div>
                      <div className="flex justify-between">
                        <Tooltip content="Porcentaje de saltos aceptados en el algoritmo Metropolis-Hastings. El rango ideal es 20-45%.">
                          <span>Tasa Aceptación:</span>
                        </Tooltip>
                        <span className="text-ink">{(currentCountry.acceptRate * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                    <MCMCLogWindow 
                      acceptRate={currentCountry.acceptRate} 
                      countryName={currentCountry.name} 
                    />
                  </div>
                  <MCMCScatterPlot 
                    samples={currentCountry.samples} 
                    color="var(--accent)" 
                  />
                </div>

                <div className="mt-8 border-t border-border pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-mono text-[11px] uppercase tracking-widest text-ink-secondary flex items-center gap-2">
                      <Globe className="w-3 h-3" /> Distribución Geográfica
                    </h3>
                    <div className="flex p-0.5 bg-surface-2 rounded-lg border border-border overflow-hidden">
                      <button 
                        onClick={() => setMapViewMode('mcmc')}
                        className={`px-3 py-1 text-[9px] font-mono uppercase tracking-wider transition-all ${
                          mapViewMode === 'mcmc' ? 'bg-accent text-white shadow-sm' : 'text-ink-muted hover:text-ink'
                        }`}
                      >
                        MCMC (1980+)
                      </button>
                      <button 
                        onClick={() => setMapViewMode('total')}
                        className={`px-3 py-1 text-[9px] font-mono uppercase tracking-wider transition-all ${
                          mapViewMode === 'total' ? 'bg-ink text-bg shadow-sm' : 'text-ink-muted hover:text-ink'
                        }`}
                      >
                        Total (1900+)
                      </button>
                    </div>
                  </div>
                  <SeismicMap 
                    country={currentCountry} 
                    viewMode={mapViewMode} 
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Methodology */}
        <section className="mt-14">
          <div className="bg-surface border border-border rounded-xl p-6 md:p-8">
            <h3 className="font-archivo font-bold text-lg mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-accent" /> Metodología Bayesiana
            </h3>
            <p className="text-sm text-ink-secondary leading-relaxed mb-4">
              Para cada país se ajusta una relación de Gutenberg–Richter: <code className="bg-surface-2 px-1.5 py-0.5 rounded text-ink font-mono text-xs">log₁₀ λ(M) = log₁₀ λ(M6) − b·(M − 6)</code>. Los datos se modelan como procesos de Poisson cuya intensidad depende de la magnitud.
            </p>
            <p className="text-sm text-ink-secondary leading-relaxed mb-6">
              Una cadena de Metropolis–Hastings explora el espacio de parámetros buscando consistencia con el catálogo USGS. Este enfoque permite cuantificar la incertidumbre epistémica (falta de datos) de forma natural.
            </p>
            <div className="bg-surface-2 border border-border rounded-lg p-4 font-mono text-[13px] text-center">
              P(≥1 sismo M≥M en t años) = 1 − e<sup>−λ(M)·t</sup>
            </div>
          </div>
        </section>

        {/* Static Reference Tables */}
        <section className="mt-14">
          <h2 className="font-archivo font-bold text-2xl tracking-tight mb-2">Umbrales fijos de referencia</h2>
          <p className="text-[14.5px] text-ink-muted mb-8">
            Valores basados en el catálogo completo 1900–2026. Proporcionan un contexto histórico de mayor duración.
          </p>

          <div className="space-y-12">
            {/* Probability Chart M>=6 */}
            <div>
              <h3 className="text-sm font-mono text-ink-muted uppercase tracking-widest mb-4">Probabilidad M≥6.0 (10 años)</h3>
              <div className="space-y-3">
                {[...countries].sort((a, b) => b.p10 - a.p10).map(c => (
                  <div key={c.name} className="grid grid-cols-[1fr_auto] md:grid-cols-[180px_1fr_60px] items-center gap-3 md:gap-4 group">
                    <div className="text-[13px] text-ink-secondary group-hover:text-ink transition-colors">{c.name}</div>
                    <div className="h-6 bg-surface-2 rounded-md overflow-hidden relative hidden md:block">
                      <motion.div
                        className={`absolute inset-y-0 left-0 rounded-md transition-colors ${
                          c.risk === 'muyalto' ? 'bg-critical' :
                          c.risk === 'alto' ? 'bg-serious' :
                          c.risk === 'moderado' ? 'bg-warning' : 'bg-good'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${c.p10}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                    </div>
                    <div className="text-[13px] font-mono tabular-nums text-right text-ink-muted group-hover:text-accent">{c.p10.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Probability Chart M>=7 */}
            <div>
              <h3 className="text-sm font-mono text-ink-muted uppercase tracking-widest mb-4">Sismos Mayores M≥7.0 (25 años)</h3>
              <div className="space-y-3">
                {[...countries].sort((a, b) => b.p7_25 - a.p7_25).map(c => (
                  <div key={c.name} className="grid grid-cols-[1fr_auto] md:grid-cols-[180px_1fr_60px] items-center gap-3 md:gap-4 group">
                    <div className="text-[13px] text-ink-secondary group-hover:text-ink transition-colors">{c.name}</div>
                    <div className="h-6 bg-surface-2 rounded-md overflow-hidden relative hidden md:block">
                      <motion.div
                        className="absolute inset-y-0 left-0 bg-accent/40 border-r border-accent rounded-md"
                        initial={{ width: 0 }}
                        animate={{ width: `${c.p7_25}%` }}
                        transition={{ duration: 1, delay: 0.7 }}
                      />
                    </div>
                    <div className="text-[13px] font-mono tabular-nums text-right text-ink-muted group-hover:text-accent">{c.p7_25.toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Table & Geographic Info */}
        <section className="mt-20">
          <button
            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
            className="w-full flex items-center justify-between p-4 bg-surface border border-border rounded-xl hover:bg-surface-2 transition-colors"
          >
            <span className="font-mono text-xs uppercase tracking-widest text-ink-secondary">Ver detalles técnicos y cajas geográficas</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isDetailsOpen ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {isDetailsOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-6 space-y-8">
                  {/* Table */}
                  <div className="border border-border rounded-xl overflow-x-auto bg-surface">
                    <table className="w-full text-[13px] text-left border-collapse min-w-[800px]">
                      <thead className="bg-surface-2 border-b border-border">
                        <tr>
                          <th className="p-4 font-mono text-[10px] text-ink-muted uppercase">País</th>
                          <th className="p-4 font-mono text-[10px] text-ink-muted uppercase text-right">M≥6 (1900+)</th>
                          <th className="p-4 font-mono text-[10px] text-ink-muted uppercase text-right">M≥6 (1960+)</th>
                          <th className="p-4 font-mono text-[10px] text-ink-muted uppercase text-right">Recurrencia (a)</th>
                          <th className="p-4 font-mono text-[10px] text-ink-muted uppercase text-right">P 25a</th>
                          <th className="p-4 font-mono text-[10px] text-ink-muted uppercase text-right">M≥7 (1900+)</th>
                          <th className="p-4 font-mono text-[10px] text-ink-muted uppercase text-right">Riesgo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/50">
                        {[...countries].sort((a, b) => a.T - b.T).map(c => (
                          <tr key={c.name} className="hover:bg-ink/[0.02] transition-colors">
                            <td className="p-4 font-medium">{c.name}</td>
                            <td className="p-4 text-right tabular-nums">{c.n1}</td>
                            <td className="p-4 text-right tabular-nums">{c.n2}</td>
                            <td className="p-4 text-right tabular-nums font-mono">{c.T.toFixed(1)}</td>
                            <td className="p-4 text-right tabular-nums font-mono">{c.p25.toFixed(1)}%</td>
                            <td className="p-4 text-right tabular-nums">{c.n7}</td>
                            <td className="p-4 text-right">
                              <span className="inline-flex items-center gap-1.5">
                                <span className={`w-2 h-2 rounded-full ${
                                  c.risk === 'muyalto' ? 'bg-critical' :
                                  c.risk === 'alto' ? 'bg-serious' :
                                  c.risk === 'moderado' ? 'bg-warning' : 'bg-good'
                                }`} />
                                {riskLabels[c.risk]}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Geo Boxes */}
                  <div className="bg-surface border border-border rounded-xl p-6">
                    <h4 className="font-mono text-[11px] uppercase tracking-widest text-ink-muted mb-4">Áreas geográficas (Cajas Lat/Lon)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 font-mono text-[12.5px] text-ink-secondary">
                      {countries.map(c => (
                        <div key={c.name} className="flex justify-between border-b border-border/50 py-1.5">
                          <span>{c.name}</span>
                          <span className="text-ink-muted">{c.box}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Footer Info */}
        <footer className="mt-20 pt-8 border-t border-border flex flex-col items-center gap-6 text-center">
          <div className="max-w-2xl">
            <p className="text-[12px] text-ink-muted mb-4">
              Generado el 5 de septiembre de 2026 · Datos: USGS Earthquake Catalog (ComCat). No sustituye un estudio formal de amenaza sísmica de ingeniería.
            </p>
            <div className="h-px w-12 bg-border mx-auto mb-4" />
            <p className="text-[11px] font-mono text-ink-muted tracking-tight">
              © {new Date().getFullYear()} <span className="text-ink font-bold uppercase tracking-wider">Raul Peralta Giron</span>. Todos los derechos reservados.
            </p>
            <p className="text-[10px] text-ink-muted/60 leading-relaxed italic mt-2">
              Este software y sus algoritmos de estimación bayesiana son propiedad intelectual protegida. 
              Queda prohibida la reproducción total o parcial sin autorización expresa de Raul Peralta Giron.
            </p>
          </div>
          <div className="font-mono text-[10px] opacity-60 uppercase tracking-[0.2em]">
            CATÁLOGO: 1900–2026 (Ref) · 1980–2026 (MCMC)
          </div>
        </footer>

        <UserManual 
          isOpen={isManualOpen} 
          onClose={() => setIsManualOpen(false)} 
        />
      </div>
    </div>
  );
}

