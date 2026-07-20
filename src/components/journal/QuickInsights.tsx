import { motion } from 'motion/react';
import { Lightbulb } from 'lucide-react';
import type { QuickInsight } from '../../lib/analytics/quickInsights';

interface Props {
  insights: QuickInsight[];
}

export default function QuickInsights({ insights }: Props) {
  if (insights.length === 0) return null;

  return (
    <div className="lg:col-span-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]"
      >
        <h3 className="font-display text-sm font-bold text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 mb-3 uppercase tracking-wider flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          Quick Insights
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {insights.map((insight, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="border-2 border-[var(--border-color)] p-3 flex items-start gap-2 bg-[var(--card-bg)] shadow-[2px_2px_0px_var(--shadow-color)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_var(--shadow-color)]"
              style={{ borderTop: `3px solid ${insight.color}` }}
            >
              <span className="text-base shrink-0">{insight.icon}</span>
              <p className="font-mono text-[11px] text-[var(--text-primary)] font-medium leading-relaxed">{insight.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
