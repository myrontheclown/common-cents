import { motion, AnimatePresence } from 'motion/react';
import { Target, ChevronRight, ChevronDown } from 'lucide-react';
import type { PeriodSummary } from '../../lib/analytics/summaryEngine';
import { formatCurrency } from '../../lib/analytics/dateRanges';

interface Props {
  summary: PeriodSummary;
  expanded: boolean;
  onToggle: () => void;
}

export default function BudgetSummary({ summary, expanded, onToggle }: Props) {
  return (
    <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
      <button onClick={onToggle} className="w-full flex items-center justify-between" style={{ cursor: 'pointer' }}>
        <h3 className="font-display text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4" />
          Budgets & Goals
        </h3>
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t-2 border-[var(--border-color)] mt-3 pt-3 space-y-3">
              {summary.budgetHealth.total > 0 ? (
                <div className="border-2 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-success)] p-3 bg-[var(--card-bg)]">
                  <span className="font-mono text-[9px] font-bold text-[var(--text-muted)] uppercase block mb-1">Budget Health</span>
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 font-bold text-sm">{summary.budgetHealth.onTrack} on track</span>
                    {summary.budgetHealth.overBudget > 0 && (
                      <span className="text-red-600 font-bold text-sm">{summary.budgetHealth.overBudget} over budget</span>
                    )}
                  </div>
                  {summary.budgetHealth.total > 0 && (
                    <div className="w-full h-2 border border-[var(--border-color)] mt-2 bg-[var(--bg-muted)]">
                      <div className="h-full bg-[var(--accent-success)] transition-all" style={{ width: `${(summary.budgetHealth.onTrack / summary.budgetHealth.total) * 100}%` }} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-[var(--border-color)] p-3 bg-[var(--bg-muted)]">
                  <p className="font-mono text-[11px] text-[var(--text-muted)]">No budgets set up yet.</p>
                </div>
              )}

              {summary.goalsProgress.target > 0 ? (
                <div className="border-2 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-warning)] p-3 bg-[var(--card-bg)]">
                  <span className="font-mono text-[9px] font-bold text-[var(--text-muted)] uppercase block mb-1">Goals Progress</span>
                  <span className="font-display text-sm font-black text-[var(--text-primary)]">
                    {formatCurrency(summary.goalsProgress.current)} / {formatCurrency(summary.goalsProgress.target)}
                  </span>
                  <div className="w-full h-2 border border-[var(--border-color)] mt-2 bg-[var(--bg-muted)]">
                    <div className="h-full bg-[var(--accent-primary)] transition-all" style={{ width: `${Math.min(summary.goalsProgress.percentage, 100)}%` }} />
                  </div>
                </div>
              ) : (
                <div className="border-2 border-[var(--border-color)] p-3 bg-[var(--bg-muted)]">
                  <p className="font-mono text-[11px] text-[var(--text-muted)]">No savings goals set up yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
