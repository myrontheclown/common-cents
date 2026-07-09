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
    <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
      <button onClick={onToggle} className="w-full flex items-center justify-between" style={{ cursor: 'pointer' }}>
        <h3 className="font-display text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
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
            <div className="border-t-2 border-black mt-3 pt-3 space-y-3">
              <div className="border-2 border-black p-3 bg-gray-50">
                <span className="font-mono text-[9px] font-bold text-gray-500 uppercase block mb-1">Largest Expense</span>
                {summary.largestExpense ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-display text-sm font-bold text-black">{summary.largestExpense.description}</span>
                      <span className="font-mono text-[10px] text-gray-500 block">{summary.largestExpense.category} &middot; {summary.largestExpense.date}</span>
                    </div>
                    <span className="font-display text-base font-black text-red-600">{formatCurrency(summary.largestExpense.amount)}</span>
                  </div>
                ) : (
                  <p className="font-mono text-[11px] text-gray-400">No expenses recorded.</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="border-2 border-black p-2.5">
                  <span className="font-mono text-[8px] font-bold text-gray-500 uppercase block">Avg Daily Spend</span>
                  <span className="font-display text-sm font-black text-black">{formatCurrency(summary.averageDailySpending)}</span>
                </div>
                <div className="border-2 border-black p-2.5">
                  <span className="font-mono text-[8px] font-bold text-gray-500 uppercase block">Transaction Count</span>
                  <span className="font-display text-sm font-black text-black">{summary.transactionCount}</span>
                </div>
                <div className="border-2 border-black p-2.5">
                  <span className="font-mono text-[8px] font-bold text-gray-500 uppercase block">Days in Period</span>
                  <span className="font-display text-sm font-black text-black">{summary.daysInPeriod}</span>
                </div>
                <div className="border-2 border-black p-2.5">
                  <span className="font-mono text-[8px] font-bold text-gray-500 uppercase block">Net Worth</span>
                  <span className="font-display text-sm font-black text-black">{formatCurrency(summary.netWorth)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
