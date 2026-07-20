import { motion } from 'motion/react';
import { Bot, Sparkles } from 'lucide-react';

export default function AiCoachPlaceholder() {
  return (
    <div className="lg:col-span-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
        className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]"
      >
        <h3 className="font-display text-sm font-bold text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 mb-3 uppercase tracking-wider flex items-center gap-2">
          <Bot className="w-4 h-4" />
          AI Coach
        </h3>
        <div className="border-2 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-info)] p-4 bg-[var(--card-bg)]">
          <p className="font-mono text-[11px] text-[var(--text-muted)] leading-relaxed">
            <Sparkles className="w-3 h-3 inline-block mr-1 text-[var(--accent-info)]" />
            AI Coach coming soon! You'll get personalized financial advice and insights powered by your transaction data.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
