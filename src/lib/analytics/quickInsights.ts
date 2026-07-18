import type { PeriodSummary } from './summaryEngine';

export interface QuickInsight {
  icon: string;
  text: string;
  color: string;
}

export function generateQuickInsights(summary: PeriodSummary): QuickInsight[] {
  const insights: QuickInsight[] = [];
  const { income, expenses, savings, transactionCount, topCategory, budgetHealth } = summary;

  if (transactionCount === 0) {
    insights.push({
      icon: '📭',
      text: 'No financial activity recorded for this period.',
      color: '#9CA3AF',
    });
    return insights;
  }

  if (savings > 0 && income > 0) {
    const savingsRate = (savings / income) * 100;
    insights.push({
      icon: savingsRate >= 20 ? '🌟' : '✅',
      text: savingsRate >= 20
        ? `You saved ${savingsRate.toFixed(0)}% of your income — excellent rate!`
        : `You saved ${savingsRate.toFixed(0)}% of your income.`,
      color: '#4ADE80',
    });
  } else if (savings <= 0 && expenses > 0) {
    insights.push({
      icon: '⚠️',
      text: 'Expenses exceeded income this period.',
      color: '#FF6B6B',
    });
  }

  if (topCategory && expenses > 0) {
    const pct = (topCategory.amount / expenses) * 100;
    insights.push({
      icon: '🍽️',
      text: `${topCategory.name} was your largest expense at ${pct.toFixed(0)}% of spending.`,
      color: '#FB923C',
    });
  }

  if (budgetHealth.total > 0) {
    if (budgetHealth.overBudget === 0) {
      insights.push({
        icon: '✅',
        text: 'You stayed within all your budgets.',
        color: '#4ADE80',
      });
    } else {
      insights.push({
        icon: '⚠️',
        text: `${budgetHealth.overBudget} of ${budgetHealth.total} budgets exceeded.`,
        color: '#FF6B6B',
      });
    }
  }

  if (income > expenses) {
    insights.push({
      icon: '💰',
      text: 'Positive cash flow — you earned more than you spent.',
      color: '#38BDF8',
    });
  }

  return insights;
}
