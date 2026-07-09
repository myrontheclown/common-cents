/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  ShieldAlert, 
  Zap, 
  Sparkles, 
  CheckCircle, 
  Calendar, 
  Activity, 
  Plus, 
  RotateCcw,
  AlertTriangle,
  Flame,
  User,
  Heart,
  HelpCircle,
  Lightbulb,
  Cpu,
  X
} from 'lucide-react';
import { useFinanceStore } from '../store';
import { useAuthContext } from '../providers/AuthProvider';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface CommandCenterProps {
  onNavigateToLedger: () => void;
}

export default function CommandCenter({ onNavigateToLedger }: CommandCenterProps) {
  const { 
    accounts, 
    transactions, 
    budgets, 
    subscriptions,
    goals,
    achievements,
    insights,
    preferences, 
    addTransaction,
    setInsights,
    paymentMethods
  } = useFinanceStore();
  const auth = useAuthContext();

  // Loading state for AI insights refresh
  const [refreshingInsights, setRefreshingInsights] = useState(false);
  const [insightLog, setInsightLog] = useState('');
  const [insightError, setInsightError] = useState<string | null>(null);

  // Quick transaction form state
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [accId, setAccId] = useState(accounts[0]?.id || 'bank-1');

  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);

  const getVaultEmoji = (type: string) => {
    switch (type) {
      case 'bank': return '🏦';
      case 'cash': return '💵';
      case 'investment': return '📈';
      case 'credit': return '💳';
      case 'asset': return '💎';
      case 'liability': return '📉';
      default: return '🏦';
    }
  };

  const getPaymentMethodEmoji = (type: string) => {
    switch (type) {
      case 'upi': return '📱';
      case 'debit': return '💳';
      case 'credit': return '💳';
      case 'cash': return '💵';
      case 'netbanking': return '🏦';
      default: return '📱';
    }
  };

  const formatINR = (value: number) => {
    const isNegative = value < 0;
    const absValue = Math.abs(value);
    const formatted = absValue.toLocaleString('en-IN', {
      maximumFractionDigits: 0
    });
    return `${isNegative ? '-' : ''}₹${formatted}`;
  };

  const getMonthlyChange = (accountId: string) => {
    if (transactions.length === 0) return 0;
    const sortedDates = [...transactions].map(t => t.date).sort();
    const latestDateStr = sortedDates[sortedDates.length - 1] || new Date().toISOString().split('T')[0];
    const latestYearMonth = latestDateStr.substring(0, 7);
    
    const accountTxs = transactions.filter(t => t.accountId === accountId && t.date.startsWith(latestYearMonth));
    return accountTxs.reduce((sum, t) => {
      return sum + (t.type === 'income' ? t.amount : -t.amount);
    }, 0);
  };

  const getMostUsedPaymentMethod = (accountId: string) => {
    const vaultTxs = transactions.filter(t => t.accountId === accountId && t.paymentMethodId);
    if (vaultTxs.length === 0) return 'None';
    
    const counts: Record<string, number> = {};
    vaultTxs.forEach(t => {
      if (t.paymentMethodId) {
        counts[t.paymentMethodId] = (counts[t.paymentMethodId] || 0) + 1;
      }
    });
    
    let mostUsedId = '';
    let maxCount = 0;
    for (const id in counts) {
      if (counts[id] > maxCount) {
        maxCount = counts[id];
        mostUsedId = id;
      }
    }
    
    if (!mostUsedId) return 'None';
    const pm = paymentMethods.find(p => p.id === mostUsedId);
    return pm ? `${getPaymentMethodEmoji(pm.type)} ${pm.name}` : 'None';
  };

  const getLastTransaction = (accountId: string) => {
    const vaultTxs = [...transactions]
      .filter(t => t.accountId === accountId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (vaultTxs.length === 0) return 'No activity';
    
    const t = vaultTxs[0];
    const txDate = new Date(t.date);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    let dateStr = t.date;
    if (txDate.toDateString() === today.toDateString()) {
      dateStr = 'Today';
    } else if (txDate.toDateString() === yesterday.toDateString()) {
      dateStr = 'Yesterday';
    }
    
    return `${t.description} • ${formatINR(t.amount)} • ${dateStr}`;
  };

  // Calculations for Section 1: HERE IS YOUR MONEY
  const totalNetWorth = accounts.reduce((sum, a) => sum + a.balance, 0);
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = Math.max(0, totalIncome - totalExpenses);

  // Safe to spend today calculation
  const checkingAcc = accounts.find(a => a.type === 'bank' || a.name.toLowerCase().includes('checking'));
  const checkingBalance = checkingAcc ? checkingAcc.balance : (accounts[0]?.balance || 150000);
  const safeToSpendToday = Math.max(0, (checkingBalance * 0.012) + 1200);

  // Calculations for Section 2: ARE YOU DOING WELL? (Scores out of 100)
  const financialScore = Math.min(99, Math.max(30, 70 + Math.floor(totalNetWorth / 7500)));
  const budgetSpentRatio = totalIncome > 0 ? (totalExpenses / totalIncome) : 0.6;
  const budgetScore = Math.max(25, Math.min(100, Math.round(100 - (budgetSpentRatio * 50))));
  const savingsScore = Math.min(100, Math.round((savings / (preferences.monthlySavingsGoal || 2500)) * 100)) || 65;
  const goalScore = goals.length > 0 
    ? Math.min(100, Math.round(goals.reduce((acc, g) => acc + (g.currentAmount / g.targetAmount), 0) / goals.length * 100)) 
    : 85;
  const spendingScore = Math.max(40, Math.min(100, 100 - Math.round((totalExpenses / 150000) * 15)));

  // Calculations for Section 3: WHERE DID YOUR MONEY GO?
  // 1. Weekly Spending (Last 7 Days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const total = transactions
      .filter(t => t.type === 'expense' && t.date === dateStr)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      date: dateStr,
      amount: total
    };
  }).reverse();

  // 2. Top Category
  const categorySpent: Record<string, number> = {};
  transactions.filter(t => t.type === 'expense').forEach(t => {
    categorySpent[t.category] = (categorySpent[t.category] || 0) + t.amount;
  });
  const topCategoryEntry = Object.entries(categorySpent).sort((a, b) => b[1] - a[1])[0];
  const topCategoryName = topCategoryEntry ? topCategoryEntry[0] : 'None Recorded';
  const topCategorySpent = topCategoryEntry ? topCategoryEntry[1] : 0;

  // 3. Spending Heatmap (Last 28 Days GitHub contribution style grid)
  const heatmapCells = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayTxs = transactions.filter(t => t.date === dateStr);
    const expenseTotal = dayTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      date: dateStr,
      day: d.getDate(),
      total: expenseTotal,
      count: dayTxs.length
    };
  });

  // 4. Monthly Trend Data (Seeded trailing trend for charts)
  const trendData = [
    { name: 'Jan', NetWorth: totalNetWorth - 15000, Income: 4200, Expenses: 3100 },
    { name: 'Feb', NetWorth: totalNetWorth - 11000, Income: 4500, Expenses: 2900 },
    { name: 'Mar', NetWorth: totalNetWorth - 8000, Income: 5000, Expenses: 3600 },
    { name: 'Apr', NetWorth: totalNetWorth - 4500, Income: 4800, Expenses: 3100 },
    { name: 'May', NetWorth: totalNetWorth - 2000, Income: 5100, Expenses: 3400 },
    { name: 'Jun', NetWorth: totalNetWorth, Income: totalIncome || 9250, Expenses: totalExpenses || 4118 },
  ];

  // Categories list
  const categoriesList = [
    'Food & Dining',
    'Entertainment',
    'Housing',
    'Shopping',
    'Transport',
    'Utilities',
    'Travel'
  ];

  const handleTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !amount || isNaN(Number(amount)) || Number(amount) <= 0) return;

    addTransaction({
      description: desc,
      amount: Number(parseFloat(amount).toFixed(2)),
      category: type === 'income' ? 'Income' : category,
      type,
      accountId: accId,
      date: new Date().toISOString().split('T')[0]
    }, auth.userId ?? undefined);

    setDesc('');
    setAmount('');
  };

  // Real-time API refresh of AI insights
  const fetchNewAIInsights = async () => {
    setRefreshingInsights(true);
    setInsightError(null);
    setInsightLog('Syncing local ledger payload...');
    
    setTimeout(() => setInsightLog('Querying Gemini-3.5-flash server...'), 500);

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions,
          budgets,
          accounts,
          preferences,
          subscriptions
        })
      });
      const data = await response.json();
      if (data.success && data.insights) {
        setInsights(data.insights);
      } else {
        throw new Error(data.error || 'Gemini inference failed');
      }
    } catch (err: any) {
      setInsightError(err.message || 'Server timeout');
    } finally {
      setRefreshingInsights(false);
    }
  };

  // Behavioral Commentary based on ratios
  const getBehavioralAnalysis = () => {
    if (topCategoryName === 'Food & Dining' && topCategorySpent > 300) {
      return "Sustenance outlay density is high. Food & Dining dominates daily velocity, suggesting a premium dining bias that drains core cash liquidity.";
    }
    if (savingsScore > 80) {
      return "Excellent cash preservation velocity. Saving over 40% of standard inflows bypasses secondary asset decay and strengthens solvency shields.";
    }
    if (totalExpenses > totalIncome) {
      return "Negative flow polarity identified. Aggregate outflows outpace current income cycles, causing gradual vault depletion. Recommend spending cap.";
    }
    return "Balanced distribution coordinates. Net worth scaling vector is positive. Carry on, operator.";
  };

  // Icons helper for achievements
  const renderAchievementIcon = (icon: string, unlocked: boolean) => {
    const cls = `w-5 h-5 ${unlocked ? 'text-black' : 'text-gray-400'}`;
    switch (icon) {
      case 'Sparkles': return <Sparkles className={cls} />;
      case 'Flame': return <Flame className={cls} />;
      case 'ShieldAlert': return <ShieldAlert className={cls} />;
      case 'Zap': return <Zap className={cls} />;
      default: return <Sparkles className={cls} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* LEFT COLUMN: HERO PANEL & MONEY METRICS (7 SPAN) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* SECTION 1: HERE IS YOUR MONEY */}
        <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <h2 className="font-display text-lg font-extrabold text-black border-b-2 border-black pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="text-xl">💰</span> HERE IS YOUR MONEY
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {/* Net Worth Card */}
            <div className="bg-[#FFE17D] border-2 border-black p-3 shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] col-span-2 md:col-span-1">
              <span className="font-mono text-[9px] font-bold text-gray-700 block uppercase">Total Net Worth</span>
              <span className="font-display text-xl font-extrabold text-black block overflow-hidden text-ellipsis whitespace-nowrap">
                ₹{totalNetWorth.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="font-mono text-[8px] text-gray-500 uppercase">OS Global Solvency</span>
            </div>

            {/* Income Card */}
            <div className="bg-[#9DF1DF] border-2 border-black p-3 shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)]">
              <span className="font-mono text-[9px] font-bold text-gray-700 block uppercase">Income</span>
              <span className="font-display text-lg font-extrabold text-black block overflow-hidden text-ellipsis whitespace-nowrap">
                +₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="font-mono text-[8px] text-gray-500">Inflows Recorded</span>
            </div>

            {/* Expenses Card */}
            <div className="bg-[#FF9F9F] border-2 border-black p-3 shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)]">
              <span className="font-mono text-[9px] font-bold text-gray-700 block uppercase">Expenses</span>
              <span className="font-display text-lg font-extrabold text-red-600 block overflow-hidden text-ellipsis whitespace-nowrap">
                -₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="font-mono text-[8px] text-gray-500">Outflows Recorded</span>
            </div>

            {/* Savings Card */}
            <div className="bg-[#A5F3FC] border-2 border-black p-3 shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)]">
              <span className="font-mono text-[9px] font-bold text-gray-700 block uppercase">Savings</span>
              <span className="font-display text-lg font-extrabold text-black block overflow-hidden text-ellipsis whitespace-nowrap">
                ₹{savings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
              <span className="font-mono text-[8px] text-gray-500">Flow Delta Balance</span>
            </div>

            {/* Current Logging Streak Card */}
            <div className="bg-[#FB923C] border-2 border-black p-3 shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] flex flex-col justify-between">
              <div>
                <span className="font-mono text-[9px] font-bold text-gray-800 block uppercase flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-black fill-current animate-pulse" /> STREAK
                </span>
                <span className="font-display text-xl font-extrabold text-black block mt-1 uppercase overflow-hidden text-ellipsis whitespace-nowrap">
                  {preferences.currentStreak ?? 0} { (preferences.currentStreak ?? 0) === 1 ? 'DAY' : 'DAYS' }
                </span>
              </div>
              <span className="font-mono text-[8px] text-gray-700 uppercase mt-2 block overflow-hidden text-ellipsis whitespace-nowrap">
                Longest: {preferences.longestStreak ?? 0}
              </span>
            </div>

            {/* Safe to Spend Today */}
            <div className="bg-[#E1FFC2] border-2 border-black p-3 shadow-[2.5px_2.5px_0px_rgba(0,0,0,1)] col-span-2 md:col-span-1">
              <span className="font-mono text-[9px] font-bold text-gray-700 block uppercase">Safe to spend today</span>
              <span className="font-display text-xl font-extrabold text-black block overflow-hidden text-ellipsis whitespace-nowrap">
                ₹{safeToSpendToday.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              <span className="font-mono text-[8px] text-gray-500 uppercase">Calculated daily velocity cap</span>
            </div>
          </div>

          {/* Quick Transaction Addition form inside section 1 */}
          <div className="bg-gray-50 border-2 border-black p-4 mt-2">
            <h3 className="font-display text-xs font-bold text-black uppercase mb-3 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5 text-black" />
              QUICK TRANSMISSION VALVE (INJECT CASHFLOW)
            </h3>
            <form onSubmit={handleTransactionSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="e.g. Uber Ride"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-white border-2 border-black p-1.5 font-mono text-xs outline-none"
                  required
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Amount ₹"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white border-2 border-black p-1.5 font-mono text-xs outline-none"
                  required
                />
              </div>
              <div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border-2 border-black p-1.5 font-mono text-xs outline-none"
                  disabled={type === 'income'}
                >
                  {categoriesList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-white border-2 border-black p-1.5 font-mono text-xs outline-none"
                >
                  <option value="expense">DEBIT</option>
                  <option value="income">CREDIT</option>
                </select>
                <button
                  type="submit"
                  className="bg-[#FF78C4] text-black font-display font-extrabold text-xs px-3 border-2 border-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                  style={{ cursor: 'pointer' }}
                >
                  TX
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* SECTION 2: ARE YOU DOING WELL? */}
        <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <h2 className="font-display text-lg font-extrabold text-black border-b-2 border-black pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="text-xl">📈</span> ARE YOU DOING WELL?
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Financial Score */}
            <div className="border-2 border-black p-3 bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] text-center">
              <span className="font-mono text-[8px] font-bold text-gray-500 uppercase block">Financial score</span>
              <span className="font-display text-2xl font-extrabold text-black block my-1">
                {financialScore}/100
              </span>
              <div className="w-full bg-gray-100 h-2 border border-black">
                <div className="bg-[#4ADE80] h-full" style={{ width: `${financialScore}%` }} />
              </div>
            </div>

            {/* Budget Score */}
            <div className="border-2 border-black p-3 bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] text-center">
              <span className="font-mono text-[8px] font-bold text-gray-500 uppercase block">Budget score</span>
              <span className="font-display text-2xl font-extrabold text-black block my-1">
                {budgetScore}/100
              </span>
              <div className="w-full bg-gray-100 h-2 border border-black">
                <div className="bg-[#FF78C4] h-full" style={{ width: `${budgetScore}%` }} />
              </div>
            </div>

            {/* Savings Score */}
            <div className="border-2 border-black p-3 bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] text-center">
              <span className="font-mono text-[8px] font-bold text-gray-500 uppercase block">Savings score</span>
              <span className="font-display text-2xl font-extrabold text-black block my-1">
                {savingsScore}/100
              </span>
              <div className="w-full bg-gray-100 h-2 border border-black">
                <div className="bg-[#38BDF8] h-full" style={{ width: `${savingsScore}%` }} />
              </div>
            </div>

            {/* Goal Score */}
            <div className="border-2 border-black p-3 bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] text-center">
              <span className="font-mono text-[8px] font-bold text-gray-500 uppercase block">Goal score</span>
              <span className="font-display text-2xl font-extrabold text-black block my-1">
                {goalScore}/100
              </span>
              <div className="w-full bg-gray-100 h-2 border border-black">
                <div className="bg-[#FFE17D] h-full" style={{ width: `${goalScore}%` }} />
              </div>
            </div>

            {/* Spending Score */}
            <div className="border-2 border-black p-3 bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)] text-center col-span-2 md:col-span-1">
              <span className="font-mono text-[8px] font-bold text-gray-500 uppercase block">Spending score</span>
              <span className="font-display text-2xl font-extrabold text-black block my-1">
                {spendingScore}/100
              </span>
              <div className="w-full bg-gray-100 h-2 border border-black">
                <div className="bg-[#FB923C] h-full" style={{ width: `${spendingScore}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: WHERE DID YOUR MONEY GO? */}
        <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <h2 className="font-display text-lg font-extrabold text-black border-b-2 border-black pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="text-xl">🗺️</span> WHERE DID YOUR MONEY GO?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            
            {/* Weekly Spending */}
            <div className="border-2 border-black p-3.5 bg-gray-50 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <h3 className="font-mono text-[10px] font-bold text-black uppercase mb-3 tracking-wide">
                Weekly spending (Last 7 Days)
              </h3>
              <div className="flex flex-col gap-2.5">
                {last7Days.map((day) => (
                  <div key={day.date} className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-black w-10">{day.dayName}</span>
                    <div className="flex-grow bg-white border border-black h-4 mx-2 relative overflow-hidden">
                      <div 
                        className="bg-[#FF9F9F] h-full border-r border-black"
                        style={{ width: `${Math.min(100, (day.amount / 150) * 100)}%` }}
                      />
                    </div>
                    <span className="font-bold text-black min-w-14 text-right">
                      ₹{day.amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Category & Spending Heatmap Side */}
            <div className="flex flex-col gap-4">
              
              {/* Top Category card */}
              <div className="border-2 border-black p-3.5 bg-[#FFDE4D] shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <span className="font-mono text-[10px] font-bold text-black uppercase tracking-wide block">
                  Top category
                </span>
                <span className="font-display text-xl font-black text-black uppercase block leading-tight mt-1">
                  {topCategoryName}
                </span>
                <span className="font-mono text-[10px] text-gray-700 block">
                  Aggregate: ₹{topCategorySpent.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </span>
              </div>

              {/* Spending Heatmap (GitHub Contribution style) */}
              <div className="border-2 border-black p-3.5 bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <span className="font-mono text-[10px] font-bold text-black uppercase tracking-wide block mb-2">
                  Spending heatmap (Last 28 Days)
                </span>
                <div className="grid grid-cols-7 gap-1">
                  {heatmapCells.map((cell, idx) => {
                    let color = 'bg-gray-100'; // No spending
                    if (cell.total > 0 && cell.total <= 30) {
                      color = 'bg-[#FFDE4D]/40';
                    } else if (cell.total > 30 && cell.total <= 120) {
                      color = 'bg-[#FF78C4]/60';
                    } else if (cell.total > 120) {
                      color = 'bg-[#FF78C4] border border-black';
                    }
                    return (
                      <div 
                        key={idx}
                        title={`Date: ${cell.date}, Spent: ₹${cell.total.toFixed(2)}`}
                        className={`aspect-square w-full rounded-none transition-all ${color}`}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[8px] font-mono text-gray-500 mt-2">
                  <span>28 DAYS AGO</span>
                  <span>TODAY</span>
                </div>
              </div>

            </div>
          </div>

          {/* Monthly Trend Recharts Area */}
          <div className="border-2 border-black p-4 bg-white shadow-[3px_3px_0px_rgba(0,0,0,1)]">
            <span className="font-mono text-[10px] font-bold text-black uppercase tracking-wide block mb-3">
              Monthly trend (Assets vs Cashflow)
            </span>
            <div className="w-full h-44 font-mono text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#000" strokeWidth={1.5} />
                  <YAxis stroke="#000" strokeWidth={1.5} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #000',
                      fontFamily: 'monospace'
                    }} 
                  />
                  <Area type="monotone" dataKey="NetWorth" stroke="#000" strokeWidth={2} fill="#A5F3FC" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* RIGHT COLUMN: INSIGHTS & UPCOMING PAYMENTS/GOALS (5 SPAN) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* SECTION 4: WHAT SHOULD YOU KNOW? */}
        <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-4">
            <h2 className="font-display text-lg font-extrabold text-black uppercase tracking-wider flex items-center gap-2">
              <span className="text-xl">💡</span> WHAT SHOULD YOU KNOW?
            </h2>
            <button
              onClick={fetchNewAIInsights}
              disabled={refreshingInsights}
              className="bg-[#FFDE4D] p-1 border-2 border-black text-[9px] font-mono font-bold shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] hover:bg-yellow-300"
              style={{ cursor: 'pointer' }}
            >
              {refreshingInsights ? 'SYS_REFRESHING...' : 'REFRESH INTEL'}
            </button>
          </div>

          <div className="flex flex-col gap-3.5">
            {/* AI Insights block */}
            <div className="border-2 border-black p-3.5 bg-black text-[#39FF14] font-mono text-xs shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-1.5 text-white mb-2 pb-1.5 border-b border-[#39FF14]/30">
                <Cpu className="w-3.5 h-3.5 text-[#39FF14] animate-pulse" />
                <span className="font-display text-[10px] font-extrabold text-[#39FF14]">AI insights (Active Diagnostics)</span>
              </div>

              {refreshingInsights ? (
                <div className="py-4 text-center">
                  <p className="animate-pulse">&gt; {insightLog}</p>
                </div>
              ) : insightError ? (
                <div className="text-red-400 text-[10px]">
                  <p>&gt; INF_FAILURE: {insightError}</p>
                  <p className="mt-1 text-white underline cursor-pointer" onClick={fetchNewAIInsights}>RETRY OPERATION</p>
                </div>
              ) : insights.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {insights.slice(0, 2).map((item, idx) => (
                    <div key={item.id || idx} className="text-[11px] leading-relaxed border-b border-[#39FF14]/15 pb-2 last:border-b-0 last:pb-0">
                      <p className="font-bold text-white uppercase">{item.title}</p>
                      <p className="text-[#39FF14]/80 text-[10px]">{item.summary}</p>
                      <p className="text-gray-300 text-[9px] italic mt-0.5">&gt; {item.detail}</p>
                      {item.impactValue && (
                        <div className="inline-block bg-[#39FF14]/10 border border-[#39FF14] px-1 text-[9px] font-bold text-[#39FF14] mt-1.5">
                          IMPACT: {item.impactValue}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">&gt; No active AI insight files loaded.</p>
              )}
            </div>

            {/* Behavioral analysis card */}
            <div className="border-2 border-black p-3.5 bg-[#9DF1DF] shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <span className="font-mono text-[10px] font-bold text-black uppercase tracking-wide block">
                Behavioral analysis
              </span>
              <p className="font-mono text-[11px] text-gray-800 mt-2 leading-relaxed">
                {getBehavioralAnalysis()}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 5: WHAT HAPPENS NEXT? */}
        <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <h2 className="font-display text-lg font-extrabold text-black border-b-2 border-black pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="text-xl">🔮</span> WHAT HAPPENS NEXT?
          </h2>

          <div className="flex flex-col gap-4">
            
            {/* Active Subscriptions & Drag */}
            <div className="border-2 border-black p-3.5 bg-white shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-black/10 pb-2 mb-3">
                <div>
                  <span className="font-mono text-[10px] font-bold text-black uppercase tracking-wide block">
                    Active subscriptions & recurring drag
                  </span>
                  <span className="font-mono text-[8px] text-gray-400 block uppercase">
                    Continuous capital outflow telemetry
                  </span>
                </div>
                <div className="bg-[#C084FC] border-2 border-black px-2 py-0.5 font-mono text-xs font-bold text-black shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)]">
                  ₹{(() => {
                    const activeSubsList = subscriptions.filter(s => s.active ?? s.isActive ?? true);
                    const totalMonthly = activeSubsList.reduce((sum, s) => {
                      const cycle = s.billing_cycle || (s.frequency === 'annual' ? 'yearly' : 'monthly');
                      if (cycle === 'yearly') {
                        return sum + (s.amount / 12);
                      }
                      return sum + s.amount;
                    }, 0);
                    return totalMonthly.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                  })()}/mo recurring
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-3 max-h-[140px] overflow-y-auto pr-1">
                {subscriptions.filter(s => s.active ?? s.isActive ?? true).map((sub) => {
                  const getSubEmoji = (iconName?: string) => {
                    switch (iconName) {
                      case 'Tv': return '📺';
                      case 'Music': return '🎵';
                      case 'Cpu': return '💻';
                      case 'Cloud': return '☁️';
                      case 'CreditCard': return '💳';
                      case 'Heart': return '❤️';
                      default: return '💳';
                    }
                  };
                  return (
                    <div key={sub.id} className="flex items-center justify-between text-xs font-mono border-b border-gray-50 pb-1.5 last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm select-none">{getSubEmoji(sub.icon)}</span>
                        <span className="font-bold text-black">{sub.service_name || sub.name}</span>
                        {sub.auto_debit && (
                          <span className="bg-[#4ADE80]/20 text-[#22c55e] border border-[#22c55e]/30 px-1 text-[7px] font-bold uppercase rounded-sm">
                            AUTO
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-black">
                          ₹{sub.amount.toLocaleString('en-IN')}/{sub.billing_cycle === 'yearly' || sub.frequency === 'annual' ? 'yr' : 'mo'}
                        </span>
                        <span className="text-[8px] text-gray-400 block">Next: {sub.renewal_date || sub.nextBillingDate}</span>
                      </div>
                    </div>
                  );
                })}
                {subscriptions.filter(s => s.active ?? s.isActive ?? true).length === 0 && (
                  <div className="text-center py-2 text-gray-400 text-[10px] uppercase font-mono italic">
                    No active subscriptions detected.
                  </div>
                )}
              </div>

              {/* LIVE DATABASE TABLE VIEW REPRESENTATION */}
              <div className="border border-black p-2 bg-gray-50 overflow-x-auto font-mono text-[9px] mt-1">
                <div className="flex items-center justify-between mb-1 pb-1 border-b border-black/10">
                  <span className="font-bold text-black uppercase text-[8px] text-gray-500">
                    🗃️ DB VIEW: [dbo].[subscriptions_table]
                  </span>
                  <span className="text-[7px] text-gray-400">SCHEMA V2.0 (PERSISTED)</span>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-black/20 bg-gray-200/50">
                      <th className="p-0.5 font-bold text-black uppercase">ID</th>
                      <th className="p-0.5 font-bold text-black uppercase">NAME</th>
                      <th className="p-0.5 font-bold text-black uppercase">CYCLE</th>
                      <th className="p-0.5 font-bold text-black uppercase">AMOUNT</th>
                      <th className="p-0.5 font-bold text-black uppercase">DEBIT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptions.map((s) => (
                      <tr key={s.id} className="border-b border-black/5 hover:bg-black/5">
                        <td className="p-0.5 text-gray-400">{s.id}</td>
                        <td className="p-0.5 font-bold text-black truncate max-w-[80px]">{s.service_name || s.name}</td>
                        <td className="p-0.5 text-black uppercase">{s.billing_cycle || s.frequency || 'monthly'}</td>
                        <td className="p-0.5 text-red-500 font-bold">₹{s.amount}</td>
                        <td className="p-0.5">
                          <span className={`px-0.5 text-[7px] font-bold uppercase rounded-sm ${s.active ?? s.isActive ? 'bg-[#4ADE80]/20 text-[#22c55e]' : 'bg-[#FF9F9F]/20 text-red-500'}`}>
                            {s.active ?? s.isActive ? 'ON' : 'OFF'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mission Objectives */}
            <div className="border-2 border-black p-3.5 bg-[#FFE2E2] shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <span className="font-mono text-[10px] font-bold text-black uppercase tracking-wide block mb-3">
                Mission objectives
              </span>
              <div className="flex flex-col gap-2 font-mono text-[11px] text-black">
                <div className="flex items-start gap-2">
                  <input type="checkbox" checked={subscriptions.filter(s => !s.isActive).length > 0} readOnly className="mt-0.5 accent-black border border-black" />
                  <div>
                    <span className="font-bold">Slay subscription drag</span>
                    <span className="text-[9px] text-gray-600 block">Disable 1 or more SaaS subscription leaks.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 border-t border-black/5 pt-2">
                  <input type="checkbox" checked={checkingBalance >= 150000} readOnly className="mt-0.5 accent-black border border-black" />
                  <div>
                    <span className="font-bold">Amplify HDFC Checking</span>
                    <span className="text-[9px] text-gray-600 block">Surge your bank vault reserves past ₹1,50,000 threshold.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 border-t border-black/5 pt-2">
                  <input type="checkbox" checked={(categorySpent['Shopping'] || 0) < 15000} readOnly className="mt-0.5 accent-black border border-black" />
                  <div>
                    <span className="font-bold">Limit Shopping Leak</span>
                    <span className="text-[9px] text-gray-600 block">Watch your retail indexing limits closely.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="border-2 border-black p-3.5 bg-[#FFE17D] shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <span className="font-mono text-[10px] font-bold text-black uppercase tracking-wide block mb-3">
                Achievements
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {achievements.map((ach) => (
                  <div 
                    key={ach.id} 
                    className={`border border-black p-2 flex items-center gap-2 ${
                      ach.isUnlocked ? 'bg-[#E1FFC2]' : 'bg-gray-100 opacity-60 border-dashed'
                    }`}
                  >
                    <div className="p-1.5 border border-black bg-white shrink-0">
                      {renderAchievementIcon(ach.icon, ach.isUnlocked)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-display font-black text-[9px] text-black uppercase truncate">{ach.title}</p>
                      <p className="font-mono text-[8px] text-gray-500 truncate">{ach.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Your Vaults Quick View */}
            <div className="border-2 border-black p-3.5 bg-[#D2F1FF] shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              <span className="font-mono text-[10px] font-bold text-black uppercase tracking-wide block mb-3">
                Your Vaults
              </span>
              
              <div className="flex flex-col gap-2">
                {accounts.map((acc) => {
                  const maxBalance = Math.max(...accounts.map(a => Math.abs(a.balance)), 1);
                  const getRelativeBlocks = (bal: number) => {
                    if (bal <= 0) return '░';
                    const ratio = bal / maxBalance;
                    const count = Math.max(1, Math.round(Math.sqrt(ratio) * 10));
                    return '█'.repeat(count);
                  };
                  const change = getMonthlyChange(acc.id);

                  return (
                    <div key={acc.id} className="flex flex-col gap-0.5 border-b border-black/10 pb-1.5 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between font-mono text-[11px] text-black">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-sm select-none shrink-0">{getVaultEmoji(acc.type)}</span>
                          <span className="font-bold truncate" title={acc.name}>{acc.name}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold">{formatINR(acc.balance)}</span>
                          <span className="text-black font-black tracking-tighter select-none">{getRelativeBlocks(acc.balance)}</span>
                        </div>
                      </div>
                      {change !== 0 && (
                        <div className="flex justify-between items-center pl-5 text-[8px] font-mono">
                          <span className="text-gray-500 uppercase">MONTHLY CHANGE:</span>
                          <span className={change > 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                            {change > 0 ? '+' : ''}{formatINR(change)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 text-right">
                <button
                  onClick={() => setIsVaultModalOpen(true)}
                  className="font-mono text-[10px] font-black text-black hover:underline uppercase tracking-wider"
                  style={{ cursor: 'pointer' }}
                >
                  VIEW ALL →
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* POPUP MODAL: VAULT INDEX */}
      {isVaultModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#FAF6F0] border-4 border-black p-6 w-full max-w-2xl shadow-[8px_8px_0px_rgba(0,0,0,1)] relative my-8">
            <button 
              onClick={() => setIsVaultModalOpen(false)}
              className="absolute top-4 right-4 bg-white border-2 border-black p-1 hover:bg-gray-100 active:translate-y-[1px]"
              style={{ cursor: 'pointer' }}
            >
              <X className="w-4 h-4 text-black" />
            </button>

            <h3 className="font-display text-lg font-black text-black border-b-2 border-black pb-2 mb-4 uppercase tracking-wider">
              VAULT INDEX
            </h3>

            <div className="bg-white border-2 border-black p-4 mb-4 shadow-[3px_3px_0px_rgba(0,0,0,1)]">
              <span className="font-mono text-[10px] font-bold text-gray-500 block uppercase tracking-widest">
                TOTAL NET WORTH
              </span>
              <span className="font-display text-3xl font-black text-black block mt-1">
                {formatINR(totalNetWorth)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-1">
              {accounts.map(acc => {
                const change = getMonthlyChange(acc.id);
                const changeColor = change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500';
                const changeStr = change > 0 ? `+${formatINR(change)}` : change < 0 ? `-${formatINR(Math.abs(change))}` : '₹0';
                
                const linked = paymentMethods.filter(pm => pm.accountId === acc.id);
                const mostUsed = getMostUsedPaymentMethod(acc.id);
                const lastTx = getLastTransaction(acc.id);

                return (
                  <div key={acc.id} className="border-2 border-black bg-white p-4 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex flex-col gap-3">
                    <div className="flex items-center gap-2 border-b-2 border-black pb-1.5">
                      <span className="text-xl select-none">{getVaultEmoji(acc.type)}</span>
                      <span className="font-display font-black text-sm uppercase text-black">{acc.name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider">BALANCE</span>
                        <span className="font-black text-black text-sm">{formatINR(acc.balance)}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider">MONTHLY CHANGE</span>
                        <span className={`font-black text-sm ${changeColor}`}>{changeStr}</span>
                      </div>
                    </div>

                    <div className="text-xs font-mono border-t border-black/5 pt-2">
                      <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider mb-1">LINKED METHODS</span>
                      {linked.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {linked.map(pm => (
                            <span key={pm.id} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-100 border border-black text-[9px] font-bold text-purple-700 uppercase">
                              {getPaymentMethodEmoji(pm.type)} {pm.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[9px] text-gray-400 italic">None linked</span>
                      )}
                    </div>

                    <div className="text-xs font-mono border-t border-black/5 pt-2">
                      <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider">MOST USED METHOD</span>
                      <span className="font-bold text-black text-[10px]">{mostUsed}</span>
                    </div>

                    <div className="text-xs font-mono border-t border-black/5 pt-2 mt-auto">
                      <span className="text-[9px] text-gray-500 font-bold block uppercase tracking-wider">LAST ACTIVITY</span>
                      <p className="text-[10px] text-gray-700 font-bold leading-tight truncate mt-0.5" title={lastTx}>
                        {lastTx}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
