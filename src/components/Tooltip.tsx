import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <span 
      className="relative inline-flex items-center gap-1 group cursor-help"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      <HelpCircle className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100 transition-opacity" />
      
      <AnimatePresence>
        {show && (
          <motion.span
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 bg-ink text-bg text-[10px] leading-relaxed rounded-lg shadow-xl z-50 pointer-events-none block"
          >
            {content}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-ink" />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
