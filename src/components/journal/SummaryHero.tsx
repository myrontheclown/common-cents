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
      <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
        <div className="flex items-center justify-between flex-wrap gap-2 border-b-2 border-[var(--border-color)] pb-2 mb-4">
          <h3 className="font-display text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
            {getSectionLabel(periodType)}
          </h3>
          <div className="flex items-center gap-2">
            {periodType !== 'today' && (
              <span className="font-mono text-[9px] text-[var(--text-muted)]">{periodLabel}</span>
            )}
            <span className="font-mono text-[8px] bg-[var(--bg-badge)] text-[var(--text-badge)] px-1.5 py-0.5 font-bold tracking-wider">
              {getPeriodBadge(periodType)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border-2 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-success)] bg-[var(--card-income)] p-3 shadow-[2px_2px_0px_var(--shadow-color)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_var(--shadow-color)]">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-[var(--accent-success)]" />
              <span className="font-mono text-[9px] font-bold text-[var(--accent-success)] uppercase">Income</span>
            </div>
            <span className="font-display text-lg font-black text-[var(--text-primary)]">{formatCurrencyCompact(summary.income)}</span>
          </div>
          <div className="border-2 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-danger)] bg-[var(--card-expenses)] p-3 shadow-[2px_2px_0px_var(--shadow-color)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_var(--shadow-color)]">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown className="w-3.5 h-3.5 text-[var(--accent-danger)]" />
              <span className="font-mono text-[9px] font-bold text-[var(--accent-danger)] uppercase">Expenses</span>
            </div>
            <span className="font-display text-lg font-black text-[var(--text-primary)]">{formatCurrencyCompact(summary.expenses)}</span>
          </div>
          <div className="border-2 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-info)] bg-[var(--card-savings)] p-3 shadow-[2px_2px_0px_var(--shadow-color)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_var(--shadow-color)]">
            <div className="flex items-center gap-1.5 mb-1">
              <Wallet className="w-3.5 h-3.5 text-[var(--accent-info)]" />
              <span className="font-mono text-[9px] font-bold text-[var(--accent-info)] uppercase">Savings</span>
            </div>
            <span className={`font-display text-lg font-black ${summary.savings >= 0 ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'}`}>
              {formatCurrencyCompact(summary.savings)}
            </span>
          </div>
          <div className="border-2 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-warning)] bg-[var(--card-cash-flow)] p-3 shadow-[2px_2px_0px_var(--shadow-color)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_var(--shadow-color)]">
            <div className="flex items-center gap-1.5 mb-1">
              <BarChart3 className="w-3.5 h-3.5 text-[var(--accent-warning)]" />
              <span className="font-mono text-[9px] font-bold text-[var(--accent-warning)] uppercase">Cash Flow</span>
            </div>
            <span className={`font-display text-lg font-black ${summary.cashflow >= 0 ? 'text-[var(--accent-success)]' : 'text-[var(--accent-danger)]'}`}>
              {formatCurrencyCompact(summary.cashflow)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
