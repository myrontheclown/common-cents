import { useState, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { useFinanceStore } from '../store';
import type { PeriodType } from '../lib/analytics/dateRanges';
import {
  getTodayRange,
  getWeekRange,
  getMonthRange,
  getYearRange,
  parseDate,
} from '../lib/analytics/dateRanges';
import { calculatePeriodSummary } from '../lib/analytics/summaryEngine';
import { generateQuickInsights } from '../lib/analytics/quickInsights';
import JournalHeader from './journal/JournalHeader';
import TimelineSelector from './journal/TimelineSelector';
import SummaryHero from './journal/SummaryHero';
import QuickInsights from './journal/QuickInsights';
import CustomRangePicker from './journal/CustomRangePicker';
import CategoryChart from './journal/CategoryChart';
import PeriodDetails from './journal/PeriodDetails';
import BudgetSummary from './journal/BudgetSummary';
import SubscriptionSummary from './journal/SubscriptionSummary';
import AchievementSummary from './journal/AchievementSummary';
import PaymentSummary from './journal/PaymentSummary';
import AiCoachPlaceholder from './journal/AiCoachPlaceholder';

function getPeriodLabel(type: PeriodType, start: string, end: string): string {
  if (type === 'week') {
    const s = parseDate(start);
    const e = parseDate(end);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[s.getMonth()]} ${s.getDate()} – ${months[e.getMonth()]} ${e.getDate()}, ${e.getFullYear()}`;
  }
  if (type === 'month') {
    const s = parseDate(start);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[s.getMonth()]} ${s.getFullYear()}`;
  }
  if (type === 'year') {
    return `${parseDate(start).getFullYear()}`;
  }
  if (type === 'today') {
    const d = new Date();
    return `${d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
  }
  return `${start} to ${end}`;
}

export default function Journal() {
  const { transactions, budgets, goals, subscriptions, achievements, accounts, paymentMethods } = useFinanceStore();

  const [activePeriod, setActivePeriod] = useState<PeriodType>('today');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    categories: false,
    details: false,
    budgets: false,
  });
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const todayRange = useMemo(() => getTodayRange(), []);
  const weekRange = useMemo(() => getWeekRange(), []);
  const monthRange = useMemo(() => getMonthRange(), []);
  const yearRange = useMemo(() => getYearRange(), []);

  const range = useMemo(() => {
    switch (activePeriod) {
      case 'today': return todayRange;
      case 'week': return weekRange;
      case 'month': return monthRange;
      case 'year': return yearRange;
      case 'custom': return { start: customStart, end: customEnd };
    }
  }, [activePeriod, todayRange, weekRange, monthRange, yearRange, customStart, customEnd]);

  const summary = useMemo(() => {
    if (activePeriod === 'custom' && (!customStart || !customEnd)) return null;
    return calculatePeriodSummary(
      range.start, range.end,
      transactions, budgets, goals, subscriptions, achievements, accounts, paymentMethods,
    );
  }, [range, activePeriod, customStart, customEnd, transactions, budgets, goals, subscriptions, achievements, accounts, paymentMethods]);

  const insights = useMemo(() => {
    if (!summary) return [];
    return generateQuickInsights(summary);
  }, [summary]);

  const periodLabel = useMemo(() => getPeriodLabel(activePeriod, range.start, range.end), [activePeriod, range]);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const chartData = useMemo(() => {
    if (!summary) return [];
    return summary.topCategories.slice(0, 7).map(c => ({
      name: c.name,
      Value: c.amount,
    }));
  }, [summary]);

  const handleCustomGenerate = () => {
    if (!customStart || !customEnd) return;
    if (customEnd < customStart) return;
    setActivePeriod('custom');
  };

  const isValidCustom = customStart && customEnd && customEnd >= customStart;

  return (
    <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
      <JournalHeader />

      <TimelineSelector
        activePeriod={activePeriod}
        onSelect={setActivePeriod}
      />

      {/* PERIOD LABEL */}
      {activePeriod !== 'custom' && summary && (
        <div className="lg:col-span-12">
          <p className="font-mono text-[11px] text-gray-500 font-bold">
            <Calendar className="w-3.5 h-3.5 inline mr-1" />
            {periodLabel} &middot; {summary.transactionCount} transactions
          </p>
        </div>
      )}

      {/* CUSTOM RANGE INPUTS */}
      {activePeriod === 'custom' && (
        <CustomRangePicker
          customStart={customStart}
          customEnd={customEnd}
          onStartChange={setCustomStart}
          onEndChange={setCustomEnd}
          onGenerate={handleCustomGenerate}
          isValid={isValidCustom}
          summary={summary}
        />
      )}

      {/* MAIN CONTENT */}
      {summary ? (
        <>
          {/* HERO SUMMARY */}
          <SummaryHero
            summary={summary}
            periodType={activePeriod}
            periodLabel={periodLabel}
          />

          {/* QUICK INSIGHTS */}
          <QuickInsights insights={insights} />

          <div className="lg:col-span-8 flex flex-col gap-4">
            <CategoryChart
              summary={summary}
              chartData={chartData}
              expanded={expandedSections['categories']}
              onToggle={() => toggleSection('categories')}
            />
            <PeriodDetails
              summary={summary}
              expanded={expandedSections['details']}
              onToggle={() => toggleSection('details')}
            />
            <BudgetSummary
              summary={summary}
              expanded={expandedSections['budgets']}
              onToggle={() => toggleSection('budgets')}
            />
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <SubscriptionSummary
              subscriptions={subscriptions}
              monthlyCost={summary.subscriptionCost}
            />
            <AchievementSummary
              onTrack={summary.budgetHealth.onTrack}
              total={summary.budgetHealth.total}
            />
            <PaymentSummary
              paymentMethods={paymentMethods}
              mostUsed={summary.mostUsedPaymentMethod}
            />
          </div>
        </>
      ) : activePeriod === 'custom' ? (
        <div className="lg:col-span-12">
          <div className="bg-white border-4 border-black p-10 text-center shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col items-center gap-3">
              <span className="text-4xl">📖</span>
              <p className="font-display text-lg font-bold text-black">No financial activity found for this period.</p>
              <p className="font-mono text-xs text-gray-500">Start logging transactions to build your financial journal.</p>
            </div>
          </div>
        </div>
      ) : null}

      {/* QUICK NAV */}
      {summary && (
        <div className="lg:col-span-12">
          <div className="flex flex-wrap gap-2 justify-center">
            {(['today', 'week', 'month', 'year'] as PeriodType[]).map(item => (
              <button
                key={item}
                onClick={() => setActivePeriod(item)}
                className="font-mono text-[9px] font-bold bg-white border-2 border-black px-3 py-1.5 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-gray-50 transition-all"
                style={{ cursor: 'pointer' }}
              >
                {item === 'today' ? '⭐' : item === 'week' ? '📅' : item === 'month' ? '📆' : '📈'} Jump to {item === 'today' ? 'Today' : item === 'week' ? 'This Week' : item === 'month' ? 'This Month' : 'This Year'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI COACH PLACEHOLDER */}
      <AiCoachPlaceholder />
    </div>
  );
}
