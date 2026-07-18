import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Wallet, BarChart3 } from 'lucide-react';
import type { PeriodSummary } from '../../lib/analytics/summaryEngine';
import { formatCurrencyCompact } from '../../lib/analytics/dateRanges';
import type { PeriodType } from '../../lib/analytics/dateRanges';

function getSectionLabel(type: PeriodType): string {
  switch (type) {
    case 'today': return '⭐ Today';
    case 'week': return '📅 This Week';
    case 'month': return '📆 This Month';
    case 'year': return '📈 This Year';
    case 'custom': return '📂 Custom Range';
  }
}

function getPeriodBadge(type: PeriodType): string {
  switch (type) {
    case 'today': return 'TODAY';
    case 'week': return 'THIS WEEK';
    case 'month': return 'THIS MONTH';
    case 'year': return 'THIS YEAR';
    case 'custom': return 'CUSTOM RANGE';
  }
}

interface Props {
  summary: PeriodSummary;
  periodType: PeriodType;
  periodLabel: string;
}

export default function SummaryHero({ summary, periodType, periodLabel }: Props) {
  return (
    <motion.div
      key={periodType + '-hero'}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="lg:col-span-12"
    >
      <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b-2 border-black pb-2 mb-4">
          <h3 className="font-display text-sm font-bold text-black uppercase tracking-wider">
            {getSectionLabel(periodType)}
          </h3>
          <div className="flex items-center gap-2">
            {periodType !== 'today' && (
              <span className="font-mono text-[9px] text-gray-500">{periodLabel}</span>
            )}
            <span className="font-mono text-[8px] bg-black text-white px-1.5 py-0.5 font-bold tracking-wider">
              {getPeriodBadge(periodType)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border-2 border-black bg-[#E1FFC2] p-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-green-700" />
              <span className="font-mono text-[9px] font-bold text-green-800 uppercase">Income</span>
            </div>
            <span className="font-display text-lg font-black text-black">{formatCurrencyCompact(summary.income)}</span>
          </div>
          <div className="border-2 border-black bg-[#FFE2E2] p-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-red-700" />
              <span className="font-mono text-[9px] font-bold text-red-800 uppercase">Expenses</span>
            </div>
            <span className="font-display text-lg font-black text-black">{formatCurrencyCompact(summary.expenses)}</span>
          </div>
          <div className="border-2 border-black bg-[#E4F2FF] p-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-1.5 mb-1">
              <Wallet className="w-3.5 h-3.5 text-blue-700" />
              <span className="font-mono text-[9px] font-bold text-blue-800 uppercase">Savings</span>
            </div>
            <span className={`font-display text-lg font-black ${summary.savings >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrencyCompact(summary.savings)}
            </span>
          </div>
          <div className="border-2 border-black bg-[#FFF0D9] p-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-1.5 mb-1">
              <BarChart3 className="w-3.5 h-3.5 text-orange-700" />
              <span className="font-mono text-[9px] font-bold text-orange-800 uppercase">Cash Flow</span>
            </div>
            <span className={`font-display text-lg font-black ${summary.cashflow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrencyCompact(summary.cashflow)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
