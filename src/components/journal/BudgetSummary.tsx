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
    <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
      <button onClick={onToggle} className="w-full flex items-center justify-between" style={{ cursor: 'pointer' }}>
        <h3 className="font-display text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
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
            <div className="border-t-2 border-black mt-3 pt-3 space-y-3">
              {summary.budgetHealth.total > 0 ? (
                <div className="border-2 border-black p-3">
                  <span className="font-mono text-[9px] font-bold text-gray-500 uppercase block mb-1">Budget Health</span>
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 font-bold text-sm">{summary.budgetHealth.onTrack} on track</span>
                    {summary.budgetHealth.overBudget > 0 && (
                      <span className="text-red-600 font-bold text-sm">{summary.budgetHealth.overBudget} over budget</span>
                    )}
                  </div>
                  {summary.budgetHealth.total > 0 && (
                    <div className="w-full h-2 border border-black mt-2 bg-gray-100">
                      <div className="h-full bg-[#4ADE80] transition-all" style={{ width: `${(summary.budgetHealth.onTrack / summary.budgetHealth.total) * 100}%` }} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-2 border-black p-3 bg-gray-50">
                  <p className="font-mono text-[11px] text-gray-500">No budgets set up yet.</p>
                </div>
              )}

              {summary.goalsProgress.target > 0 ? (
                <div className="border-2 border-black p-3">
                  <span className="font-mono text-[9px] font-bold text-gray-500 uppercase block mb-1">Goals Progress</span>
                  <span className="font-display text-sm font-black text-black">
                    {formatCurrency(summary.goalsProgress.current)} / {formatCurrency(summary.goalsProgress.target)}
                  </span>
                  <div className="w-full h-2 border border-black mt-2 bg-gray-100">
                    <div className="h-full bg-[#FFDE4D] transition-all" style={{ width: `${Math.min(summary.goalsProgress.percentage, 100)}%` }} />
                  </div>
                </div>
              ) : (
                <div className="border-2 border-black p-3 bg-gray-50">
                  <p className="font-mono text-[11px] text-gray-500">No savings goals set up yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
