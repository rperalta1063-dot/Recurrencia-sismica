import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Lightbulb, Map as MapIcon, ShieldAlert, Cpu, Layers } from 'lucide-react';

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserManual({ isOpen, onClose }: UserManualProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-surface-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg text-accent">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-archivo font-bold text-lg leading-none">Guía de Uso y Metodología</h2>
                  <p className="text-[10px] font-mono text-ink-muted uppercase tracking-widest mt-1.5">Manual Didáctico v1.0</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-ink/5 rounded-full transition-colors text-ink-muted hover:text-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              
              {/* Logic Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-accent">
                  <Cpu className="w-4 h-4" />
                  <h3 className="font-archivo font-bold uppercase text-xs tracking-wider">1. Lógica y Metodología</h3>
                </div>
                <div className="grid gap-4">
                  <div className="bg-accent/5 p-4 rounded-xl border border-accent/10">
                    <p className="text-sm font-medium text-ink mb-2">¿Cómo calculamos el riesgo?</p>
                    <p className="text-xs text-ink-secondary leading-relaxed">
                      Esta aplicación utiliza un enfoque <strong>Bayesiano</strong> mediante el algoritmo <strong>MCMC (Markov Chain Monte Carlo)</strong>. 
                      En lugar de dar un único número, el modelo realiza 10,000 simulaciones para encontrar la combinación más probable de parámetros (a y b) de la ley de <strong>Gutenberg-Richter</strong>.
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-surface-2 rounded-xl border border-border">
                      <span className="text-[10px] font-bold text-accent uppercase block mb-1">Gutenberg-Richter</span>
                      <p className="text-[11px] text-ink-muted">Relaciona la magnitud y la frecuencia de los sismos. A mayor magnitud, menor frecuencia.</p>
                    </div>
                    <div className="p-4 bg-surface-2 rounded-xl border border-border">
                      <span className="text-[10px] font-bold text-accent uppercase block mb-1">Probabilidad de Poisson</span>
                      <p className="text-[11px] text-ink-muted">Calculamos la probabilidad de que ocurra al menos un evento en un horizonte de tiempo (T).</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Usage Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-accent">
                  <Lightbulb className="w-4 h-4" />
                  <h3 className="font-archivo font-bold uppercase text-xs tracking-wider">2. Modo de Uso</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center font-mono text-xs font-bold">01</div>
                    <div>
                      <p className="text-sm font-bold text-ink">Selección y Ajuste</p>
                      <p className="text-xs text-ink-secondary">Selecciona un país en el mapa o lista. Ajusta la <strong>Magnitud (Mw)</strong> y el <strong>Horizonte Temporal</strong> para ver cómo cambia el riesgo.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center font-mono text-xs font-bold">02</div>
                    <div>
                      <p className="text-sm font-bold text-ink">Exploración 3D</p>
                      <p className="text-xs text-ink-secondary">Usa el botón de <strong>Relieve 3D</strong> en el mapa para visualizar la subducción. La profundidad focal revela la inclinación de las placas.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center font-mono text-xs font-bold">03</div>
                    <div>
                      <p className="text-sm font-bold text-ink">Alertas de Riesgo</p>
                      <p className="text-xs text-ink-secondary">Define tu umbral de tolerancia. Si la probabilidad MCMC supera tu límite, el sistema emitirá una alerta visual roja.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Interface Section */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-accent">
                  <Layers className="w-4 h-4" />
                  <h3 className="font-archivo font-bold uppercase text-xs tracking-wider">3. Componentes Clave</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-surface-2 transition-colors">
                    <MapIcon className="w-4 h-4 text-ink-muted mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-ink">Mapa de Epicentros</p>
                      <p className="text-[10px] text-ink-muted">Muestra la ubicación histórica y simulada (MCMC).</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-surface-2 transition-colors">
                    <ShieldAlert className="w-4 h-4 text-ink-muted mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold text-ink">Periodo de Retorno</p>
                      <p className="text-[10px] text-ink-muted">Tiempo promedio estimado entre sismos de esa magnitud.</p>
                    </div>
                  </div>
                </div>
              </section>

            </div>

            {/* Footer */}
            <div className="p-4 bg-surface-2 border-t border-border flex items-center justify-center">
              <p className="text-[10px] font-mono text-ink-muted uppercase tracking-[0.2em]">Desarrollado para la toma de decisiones basada en datos</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
