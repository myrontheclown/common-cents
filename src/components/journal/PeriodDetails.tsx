import { motion, AnimatePresence } from 'motion/react';
import { Receipt, ChevronRight, ChevronDown } from 'lucide-react';
import type { PeriodSummary } from '../../lib/analytics/summaryEngine';
import { formatCurrency } from '../../lib/analytics/dateRanges';

interface Props {
  summary: PeriodSummary;
  expanded: boolean;
  onToggle: () => void;
}

export default function PeriodDetails({ summary, expanded, onToggle }: Props) {
  return (
    <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
      <button onClick={onToggle} className="w-full flex items-center justify-between" style={{ cursor: 'pointer' }}>
        <h3 className="font-display text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
          <Receipt className="w-4 h-4" />
          Period Details
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
              <div className="border-2 border-[var(--border-color)] p-3 bg-[var(--bg-muted)]">
                <span className="font-mono text-[9px] font-bold text-[var(--text-muted)] uppercase block mb-1">Largest Expense</span>
                {summary.largestExpense ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-display text-sm font-bold text-[var(--text-primary)]">{summary.largestExpense.description}</span>
                      <span className="font-mono text-[10px] text-[var(--text-muted)] block">{summary.largestExpense.category} &middot; {summary.largestExpense.date}</span>
                    </div>
                    <span className="font-display text-base font-black text-red-600">{formatCurrency(summary.largestExpense.amount)}</span>
                  </div>
                ) : (
                  <p className="font-mono text-[11px] text-[var(--text-muted)]">No expenses recorded.</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="border-2 border-[var(--border-color)] p-2.5">
                  <span className="font-mono text-[8px] font-bold text-[var(--text-muted)] uppercase block">Avg Daily Spend</span>
                  <span className="font-display text-sm font-black text-[var(--text-primary)]">{formatCurrency(summary.averageDailySpending)}</span>
                </div>
                <div className="border-2 border-[var(--border-color)] p-2.5">
                  <span className="font-mono text-[8px] font-bold text-[var(--text-muted)] uppercase block">Transaction Count</span>
                  <span className="font-display text-sm font-black text-[var(--text-primary)]">{summary.transactionCount}</span>
                </div>
                <div className="border-2 border-[var(--border-color)] p-2.5">
                  <span className="font-mono text-[8px] font-bold text-[var(--text-muted)] uppercase block">Days in Period</span>
                  <span className="font-display text-sm font-black text-[var(--text-primary)]">{summary.daysInPeriod}</span>
                </div>
                <div className="border-2 border-[var(--border-color)] p-2.5">
                  <span className="font-mono text-[8px] font-bold text-[var(--text-muted)] uppercase block">Net Worth</span>
                  <span className="font-display text-sm font-black text-[var(--text-primary)]">{formatCurrency(summary.netWorth)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
