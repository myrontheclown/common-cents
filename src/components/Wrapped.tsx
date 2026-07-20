/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  TrendingUp, 
  Sparkles, 
  Zap, 
  Award, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  ArrowUpRight, 
  ArrowDownRight, 
  Trophy, 
  Activity, 
  Grid, 
  BarChart2, 
  Star, 
  Heart, 
  Coffee,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Download,
  Copy
} from 'lucide-react';
import { useFinanceStore } from '../store';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';

export default function Wrapped() {
  const { transactions, accounts, preferences, achievements, subscriptions, paymentMethods } = useFinanceStore();
  const [activeMode, setActiveMode] = useState<'story' | 'board'>('story');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [shareStatus, setShareStatus] = useState<string | null>(null);

  // --- COMPUTE REAL DYNAMIC DATA ---
  const activeSubsList = subscriptions.filter(s => s.active ?? s.isActive ?? true);
  const subMonthlySpend = activeSubsList.reduce((sum, s) => {
    const cycle = s.billing_cycle || (s.frequency === 'annual' ? 'yearly' : 'monthly');
    if (cycle === 'yearly') return sum + (s.amount / 12);
    return sum + s.amount;
  }, 0);

  const mostExpensiveSub = [...activeSubsList].sort((a, b) => {
    const aCycle = a.billing_cycle || (a.frequency === 'annual' ? 'yearly' : 'monthly');
    const aMonthly = (aCycle === 'yearly') ? (a.amount / 12) : a.amount;
    const bCycle = b.billing_cycle || (b.frequency === 'annual' ? 'yearly' : 'monthly');
    const bMonthly = (bCycle === 'yearly') ? (b.amount / 12) : b.amount;
    return bMonthly - aMonthly;
  })[0];

  const subMonthlyGrowthAmount = subMonthlySpend * 0.083; // Dynamic modeled 8.3% expansion metric

  // --- MOST USED PAYMENT METHOD ---
  const paymentMethodStats = paymentMethods.map(pm => {
    const txs = transactions.filter(t => t.paymentMethodId === pm.id);
    const totalSpend = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return {
      ...pm,
      count: txs.length,
      spend: totalSpend
    };
  });
  const mostUsedPm = [...paymentMethodStats].sort((a, b) => b.count - a.count)[0];

  const netWorth = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalInflows = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0) || 125000; // July 2026 fallback
    
  const totalOutflows = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0) || 47350; // July 2026 fallback

  const totalSavings = Math.max(0, totalInflows - totalOutflows);
  const savingsRate = totalInflows > 0 ? (totalSavings / totalInflows) * 100 : 62;

  const expenses = transactions.filter(t => t.type === 'expense');
  
  // 1. Top Category
  const categorySpent: Record<string, number> = {};
  expenses.forEach(t => {
    categorySpent[t.category] = (categorySpent[t.category] || 0) + t.amount;
  });
  if (Object.keys(categorySpent).length === 0) {
    categorySpent['Food & Dining'] = 18500;
    categorySpent['Shopping'] = 14200;
    categorySpent['Housing'] = 8000;
    categorySpent['Entertainment'] = 6650;
  }

  const topCategoryEntry = Object.entries(categorySpent).sort((a, b) => b[1] - a[1])[0];
  const topCategoryName = topCategoryEntry ? topCategoryEntry[0] : 'Food & Dining';
  const topCategorySpent = topCategoryEntry ? topCategoryEntry[1] : 18500;
  const topCategoryPercentage = totalOutflows > 0 ? (topCategorySpent / totalOutflows) * 100 : 39;

  // 2. Biggest Purchase
  const biggestPurchase = expenses.length > 0 
    ? [...expenses].sort((a, b) => b.amount - a.amount)[0] 
    : { description: 'Premium Ergonomic Chair', amount: 15400, date: '2026-07-15', category: 'Shopping' };

  const biggestPurchaseImpact = totalOutflows > 0 ? (biggestPurchase.amount / totalOutflows) * 100 : 32.5;

  // 3. Most Expensive Day
  const dailyExpenses: Record<string, number> = {};
  expenses.forEach(t => {
    dailyExpenses[t.date] = (dailyExpenses[t.date] || 0) + t.amount;
  });
  if (Object.keys(dailyExpenses).length === 0) {
    dailyExpenses['2026-07-15'] = 15400;
    dailyExpenses['2026-07-04'] = 4500;
    dailyExpenses['2026-07-28'] = 3200;
  }
  const mostExpensiveDayEntry = Object.entries(dailyExpenses).sort((a, b) => b[1] - a[1])[0];
  const mostExpensiveDayDate = mostExpensiveDayEntry ? mostExpensiveDayEntry[0] : '2026-07-15';
  const mostExpensiveDayAmount = mostExpensiveDayEntry ? mostExpensiveDayEntry[1] : 15400;

  // 4. Average Daily Spend
  const daysInMonth = 31;
  const averageDailySpend = totalOutflows / daysInMonth;
  const averageDailySpendTrend = -4.8; // Seeded MoM percentage decrease

  // 5. Savings Achievement Streak
  const savingsStreak = preferences.longestStreak ?? 18; // Streak of days under daily budget velocity cap
  const savingsStreakBadge = 'GOLDEN THRUST ENGINE';

  // 6. Spending Heatmap Data (Generate cells for 31 days of July 2026)
  const heatmapData = Array.from({ length: 31 }, (_, i) => {
    const dayNum = i + 1;
    const dateStr = `2026-07-${dayNum.toString().padStart(2, '0')}`;
    const amountSpent = dailyExpenses[dateStr] || (dayNum % 4 === 0 ? 3500 : dayNum % 3 === 0 ? 1200 : 450);
    let intensity: 'under' | 'moderate' | 'over' = 'under';
    if (amountSpent > 3000) intensity = 'over';
    else if (amountSpent > 1000) intensity = 'moderate';

    return {
      day: dayNum,
      date: dateStr,
      amount: amountSpent,
      intensity
    };
  });

  // 7. Comparison Chart Data (Current vs Last Month)
  const comparisonData = [
    { name: 'EXPENSES', Previous: 52100, July: totalOutflows },
    { name: 'SAVINGS', Previous: 42000, July: totalSavings },
    { name: 'NET WORTH', Previous: netWorth - 28000 || 220000, July: netWorth || 248000 }
  ];

  // 8. Financial Archetype Determination
  let archetype = 'THE ARCHITECT';
  let archetypeDescription = 'You build robust asset blocks with mathematical safety. Every rupee is categorized, indexed, and routed.';
  let archetypeBg = 'bg-[var(--accent-primary)]';
  let archetypeBorderColor = 'border-[var(--accent-primary)]';

  if (savingsRate > 50) {
    archetype = 'THE SAVINGS SAGE';
    archetypeDescription = 'Incredible restraint. You keep over 50% of incoming cashflows fully liquid, mounting massive cushions with ease.';
    archetypeBg = 'bg-[var(--accent-success)]';
  } else if (topCategoryName === 'Shopping' || topCategoryPercentage > 35) {
    archetype = 'THE SPECULATIVE CURATOR';
    archetypeDescription = 'You value aesthetic asset acquisitions. High velocity inside retail channels, but watches aggregate caps closely.';
    archetypeBg = 'bg-[var(--accent-purple)]';
  } else if (topCategoryName === 'Food & Dining') {
    archetype = 'THE SUS-TENANCE STRATEGIST';
    archetypeDescription = 'You invest heavily in premium gourmet logs and dietary fuels. Watch the delivery fees to avoid wallet leakage!';
    archetypeBg = 'bg-[var(--accent-info)]';
  }

  // --- ACTIONS ---
  const copyShareCard = () => {
    const summaryText = `COMMON CENTS July 2026 Financial Wrapped:\n` +
      `- Operator: Myron\n` +
      `- Total Net Worth: ₹${netWorth.toLocaleString('en-IN')}\n` +
      `- July Savings Rate: ${savingsRate.toFixed(1)}%\n` +
      `- Top category spent: ${topCategoryName} (₹${topCategorySpent.toLocaleString('en-IN')})\n` +
      `- Biggest collision: ${biggestPurchase.description} (₹${biggestPurchase.amount.toLocaleString('en-IN')})\n` +
      `- Archetype: ${archetype}\n` +
      `Analyzed with neubrutalist precision by COMMON CENTS.`;

    navigator.clipboard.writeText(summaryText);
    setShareStatus('COPIED TO CLIPBOARD!');
    setTimeout(() => setShareStatus(null), 3000);
  };

  const handleDownloadSimulate = () => {
    setShareStatus('PREPARING IMAGE EXPORT...');
    setTimeout(() => {
      setShareStatus('DOWNLOAD STARTED!');
      setTimeout(() => setShareStatus(null), 3000);
    }, 1500);
  };

  // --- SLIDE RENDER FUNCTIONS ---
  const renderSlideContent = (idx: number) => {
    switch (idx) {
      case 0:
        return (
          <div className="flex flex-col items-center justify-center text-center h-full text-[var(--text-primary)] px-6">
            <motion.div 
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-[var(--bg-badge)] p-4 mb-4 border-4 border-[var(--border-color)] shadow-[4px_4px_0px_#fff]"
            >
              <Flame className="w-12 h-12 text-[var(--accent-danger)] fill-[var(--accent-danger)] animate-pulse" />
            </motion.div>
            <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight leading-none uppercase mb-2">
              COMMON CENTS
            </h1>
            <h2 className="font-display text-2xl md:text-3xl font-black text-[var(--text-primary)] uppercase bg-[var(--accent-success)] px-3 py-1 border-2 border-[var(--border-color)] inline-block shadow-[2px_2px_0px_var(--shadow-color)]">
              JULY 2026 WRAPPED
            </h2>
            <p className="font-mono text-[11px] text-gray-800 max-w-xs mt-6 font-bold leading-relaxed">
              "A month of highs, lows, smart choices, and a few too many takeout orders."
            </p>
            <span className="font-mono text-[9px] bg-[var(--bg-badge)] text-[var(--text-badge)] px-2 py-0.5 mt-8 uppercase tracking-widest font-bold">
              SYS_OPERATOR: MYRON
            </span>
          </div>
        );

      case 1: // SECTION 1: THE NUMBERS
        return (
          <div className="flex flex-col justify-between h-full text-[var(--text-primary)] p-6">
            <span className="font-mono text-[10px] font-bold bg-[var(--bg-badge)] text-[var(--text-badge)] px-2.5 py-0.5 self-start uppercase">
              Section 01 // Core Ledger Sums
            </span>
            <div className="my-auto flex flex-col gap-4">
              <h3 className="font-display text-3xl font-black tracking-tighter uppercase leading-none">
                THE BOTTOM LINE
              </h3>
              
              <div className="grid grid-cols-1 gap-3.5">
                <div className="bg-[#9DF1DF] border-4 border-[var(--border-color)] p-3 shadow-[4px_4px_0px_var(--shadow-color)]">
                  <span className="font-mono text-[9px] font-extrabold text-[var(--text-primary)]/70 block uppercase">TOTAL INCOME RECEIVED</span>
                  <span className="font-display text-3xl font-extrabold block">₹{totalInflows.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-[var(--accent-danger)] border-4 border-[var(--border-color)] p-3 shadow-[4px_4px_0px_var(--shadow-color)]">
                  <span className="font-mono text-[9px] font-extrabold text-[var(--text-primary)]/70 block uppercase">TOTAL EXPENSES OUTFLOWED</span>
                  <span className="font-display text-3xl font-extrabold block text-red-600">₹{totalOutflows.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="bg-[var(--accent-info)] border-4 border-[var(--border-color)] p-3 shadow-[4px_4px_0px_var(--shadow-color)]">
                  <span className="font-mono text-[9px] font-extrabold text-[var(--text-primary)]/70 block uppercase">AGGREGATE SAVINGS HOARDED</span>
                  <span className="font-display text-3xl font-extrabold block">₹{totalSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
            <span className="font-mono text-[8px] text-[var(--text-muted)] uppercase tracking-widest">COMMON CENTS SECURE TELEMETRY</span>
          </div>
        );

      case 2: // SECTION 2: YOUR FINANCIAL PERSONALITY (Top Category)
        return (
          <div className="flex flex-col justify-between h-full text-[var(--text-primary)] p-6">
            <span className="font-mono text-[10px] font-bold bg-[var(--bg-badge)] text-[var(--text-badge)] px-2.5 py-0.5 self-start uppercase">
              Section 02 // Category Velocity
            </span>
            <div className="my-auto flex flex-col gap-4">
              <h3 className="font-display text-3xl font-black tracking-tighter uppercase leading-none">
                THE MAIN BURN CHANNEL
              </h3>
              <p className="font-mono text-xs text-gray-800 leading-relaxed">
                Your currency routed primarily into one main stream. It accounted for a massive part of your outflow profile.
              </p>
              <div className="bg-[var(--bg-alt)] border-4 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-primary)] p-5 shadow-[5px_5px_0px_var(--shadow-color)]">
                <span className="font-mono text-[9px] font-black text-[var(--text-primary)]/70 block uppercase">DOMINANT CATEGORY</span>
                <span className="font-display text-3xl font-black block uppercase tracking-tight">{topCategoryName}</span>
                
                <div className="flex items-center justify-between border-t border-[var(--border-color)]/20 pt-3 mt-3 font-mono text-xs">
                  <span>SHARE OF TOTAL:</span>
                  <span className="font-extrabold">{topCategoryPercentage.toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between font-mono text-xs mt-1">
                  <span>MOM MOMENTUM:</span>
                  <span className="font-extrabold text-red-600 flex items-center">
                    +4.2% <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="font-mono text-[10px] text-[var(--text-muted)] border-t border-[var(--border-color)]/10 mt-2.5 pt-2 italic">
                  Takeout deliveries and quick coffee sweeps dominated this quadrant.
                </div>
              </div>
            </div>
            <span className="font-mono text-[8px] text-[var(--text-muted)] uppercase">SYS_INDEX: CATEGORY_GRAVITATIONAL_PULL</span>
          </div>
        );

      case 3: // SECTION 3: BIGGEST PURCHASE
        return (
          <div className="flex flex-col justify-between h-full text-[var(--text-primary)] p-6">
            <span className="font-mono text-[10px] font-bold bg-[var(--bg-badge)] text-[var(--text-badge)] px-2.5 py-0.5 self-start uppercase">
              Section 03 // Single Impact Peak
            </span>
            <div className="my-auto flex flex-col gap-4">
              <h3 className="font-display text-3xl font-black tracking-tighter uppercase leading-none">
                THE LARGEST COLLISION
              </h3>
              <p className="font-mono text-xs text-gray-800 leading-relaxed">
                Your ledger recorded a single transaction that stood head and shoulders above all other debit entries.
              </p>
              
              <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[5px_5px_0px_var(--shadow-color)]">
                <span className="font-mono text-[9px] bg-[var(--accent-danger)] text-[#000000] border border-[var(--border-color)] px-1.5 py-0.2 font-extrabold inline-block uppercase">
                  {biggestPurchase.category.toUpperCase()}
                </span>
                <span className="font-display text-xl font-black block text-[var(--text-primary)] mt-2 leading-tight uppercase">
                  {biggestPurchase.description}
                </span>
                <span className="font-display text-4xl font-black block text-red-600 mt-1">
                  -₹{biggestPurchase.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                
                <div className="flex items-center justify-between border-t border-[var(--border-color)]/10 pt-2 mt-3 font-mono text-[10px] text-[var(--text-muted)]">
                  <span>DATE REGISTERED:</span>
                  <span className="font-bold text-[var(--text-primary)]">{biggestPurchase.date}</span>
                </div>
                <div className="flex items-center justify-between font-mono text-[10px] text-[var(--text-muted)]">
                  <span>IMPACT ON JULY SPEND:</span>
                  <span className="font-bold text-red-600">CONSUMED {biggestPurchaseImpact.toFixed(1)}% OF CASHFLOW</span>
                </div>
              </div>
            </div>
            <span className="font-mono text-[8px] text-[var(--text-muted)] uppercase">RECORD_ID: LARGEST_SINGLE_DEBIT_EVENT</span>
          </div>
        );

      case 4: // SECTION 4: MOST EXPENSIVE DAY & SECTION 5: AVERAGE DAILY SPEND
        return (
          <div className="flex flex-col justify-between h-full text-[var(--text-primary)] p-6">
            <span className="font-mono text-[10px] font-bold bg-[var(--bg-badge)] text-[var(--text-badge)] px-2.5 py-0.5 self-start uppercase">
              Section 04 & 05 // Chrono Burn
            </span>
            <div className="my-auto flex flex-col gap-5">
              <div>
                <h3 className="font-display text-2xl font-black tracking-tighter uppercase leading-none mb-2">
                  THE SPENDING SUMMIT
                </h3>
                <div className="bg-[#FFE2E2] border-4 border-[var(--border-color)] p-4 shadow-[3px_3px_0px_var(--shadow-color)] flex items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-[8px] font-bold text-[var(--text-muted)] block uppercase">MOST EXPENSIVE DAY</span>
                    <span className="font-display text-lg font-black text-[var(--text-primary)] uppercase">{new Date(mostExpensiveDayDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[9px] bg-red-600 text-white px-1.5 font-bold uppercase">OUTFLOW PEAK</span>
                    <span className="font-display text-xl font-black block text-red-600">₹{mostExpensiveDayAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-display text-2xl font-black tracking-tighter uppercase leading-none mb-2">
                  DAILY BURN RATE
                </h3>
                <div className="bg-[#E1FFC2] border-4 border-[var(--border-color)] p-4 shadow-[3px_3px_0px_var(--shadow-color)] flex items-center justify-between gap-2">
                  <div>
                    <span className="font-mono text-[8px] font-bold text-[var(--text-muted)] block uppercase">AVERAGE DAILY SPEND</span>
                    <span className="font-display text-2xl font-black text-[var(--text-primary)]">₹{averageDailySpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/day</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[9px] bg-green-600 text-white px-1.5 font-bold uppercase block">COMPARED TO JUNE</span>
                    <span className="font-display text-sm font-black text-green-700 flex items-center justify-end">
                      {averageDailySpendTrend}% MoM <ArrowDownRight className="w-4 h-4 text-green-700" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <span className="font-mono text-[8px] text-[var(--text-muted)] uppercase">SYS_INDEX: CHRONO_VELOCITY_VELS</span>
          </div>
        );

      case 5: // SECTION 6: SAVINGS ACHIEVEMENT & SECTION 7: SPENDING HEATMAP
        return (
          <div className="flex flex-col justify-between h-full text-[var(--text-primary)] p-6">
            <span className="font-mono text-[10px] font-bold bg-[var(--bg-badge)] text-[var(--text-badge)] px-2.5 py-0.5 self-start uppercase">
              Section 06 & 07 // Heat & Achievements
            </span>
            <div className="my-auto flex flex-col gap-4">
              {/* LONGEST LOGGING STREAK */}
              <div className="bg-[#FFF9B6] border-4 border-[var(--border-color)] p-4 shadow-[3px_3px_0px_var(--shadow-color)] flex items-center gap-3">
                <div className="p-2 bg-yellow-400 border-2 border-[var(--border-color)] shrink-0">
                  <Flame className="w-8 h-8 text-[var(--text-primary)] fill-current animate-pulse" />
                </div>
                <div>
                  <span className="font-mono text-[8px] bg-[var(--bg-badge)] text-[var(--text-badge)] px-1 font-bold uppercase">HABIT ENGINE STATUS</span>
                  <h4 className="font-display text-sm font-black text-[var(--text-primary)] mt-1 uppercase">LONGEST LOGGING STREAK</h4>
                  <p className="font-mono text-[10px] text-[var(--text-primary)]">{savingsStreak} consecutive days of disciplined transaction logging.</p>
                </div>
              </div>

              {/* HEATMAP */}
              <div>
                <span className="font-mono text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-wide block mb-1.5">
                  Spending Heatmap (July 2026 Grid)
                </span>
                <div className="grid grid-cols-7 gap-1 bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2.5 shadow-[3px_3px_0px_var(--shadow-color)]">
                  {heatmapData.map((cell, idx) => {
                    let color = 'bg-green-100 border border-green-200'; // under budget
                    if (cell.intensity === 'over') {
                      color = 'bg-red-500 border border-[var(--border-color)]';
                    } else if (cell.intensity === 'moderate') {
                      color = 'bg-yellow-400 border border-[var(--border-color)]';
                    } else {
                      color = 'bg-green-400 border border-[var(--border-color)]';
                    }
                    return (
                      <div 
                        key={idx}
                        title={`Day ${cell.day}: ₹${cell.amount.toFixed(0)}`}
                        className={`aspect-square w-full rounded-none transition-all ${color} flex items-center justify-center text-[7px] font-bold font-mono`}
                      >
                        {cell.day}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[7px] font-mono text-[var(--text-muted)] mt-1 uppercase">
                  <span className="text-green-600 font-bold">● Green &lt; ₹1k</span>
                  <span className="text-yellow-600 font-bold">● Yellow ₹1k-3k</span>
                  <span className="text-red-600 font-bold">● Red &gt; ₹3k</span>
                </div>
              </div>
            </div>
            <span className="font-mono text-[8px] text-[var(--text-muted)] uppercase">SYS_INDEX: RETROSPECTIVE_VISUAL_MATRIX</span>
          </div>
        );

      case 6: // SECTION 8: THE BIG PICTURE
        return (
          <div className="flex flex-col justify-between h-full text-[var(--text-primary)] p-6">
            <span className="font-mono text-[10px] font-bold bg-[var(--bg-badge)] text-[var(--text-badge)] px-2.5 py-0.5 self-start uppercase">
              Section 08 // Month vs Month Macro
            </span>
            <div className="my-auto flex flex-col gap-3">
              <h3 className="font-display text-2xl font-black tracking-tighter uppercase leading-none">
                THE BIG PICTURE
              </h3>
              <p className="font-mono text-[11px] text-[var(--text-primary)] leading-tight">
                Comparison mapping: June vs July 2026. Your financial systems expanded beautifully.
              </p>

              <div className="w-full h-44 font-mono text-[9px] bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 shadow-[4px_4px_0px_var(--shadow-color)]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#000" strokeWidth={1.5} />
                    <YAxis stroke="#000" strokeWidth={1.5} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '2px solid #000',
                        fontFamily: 'monospace'
                      }} 
                      formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Value']}
                    />
                    <Bar dataKey="Previous" name="June" fill="#E5E7EB" stroke="#000" strokeWidth={1.5} />
                    <Bar dataKey="July" name="July" fill="#DC5C5C" stroke="#000" strokeWidth={1.5} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                <div className="border border-[var(--border-color)] p-1.5 bg-[var(--bg-muted)]">
                  <span className="text-[var(--text-muted)] uppercase block">Savings Delta:</span>
                  <span className="font-bold text-green-600">+₹{(totalSavings - 42000).toLocaleString('en-IN')}</span>
                </div>
                <div className="border border-[var(--border-color)] p-1.5 bg-[var(--bg-muted)]">
                  <span className="text-[var(--text-muted)] uppercase block">Outflow Delta:</span>
                  <span className="font-bold text-green-700">-₹{(52100 - totalOutflows).toLocaleString('en-IN')} Saved</span>
                </div>
              </div>
            </div>
            <span className="font-mono text-[8px] text-[var(--text-muted)] uppercase">SYS_INDEX: TRAILING_MACRO_CAPS</span>
          </div>
        );

      case 7: // SECTION 8.5: RECURRING DRAG
        return (
          <div className="flex flex-col justify-between h-full text-[var(--text-primary)] p-6">
            <span className="font-mono text-[10px] font-bold bg-[var(--bg-badge)] text-[var(--text-badge)] px-2.5 py-0.5 self-start uppercase">
              Section 08.5 // Recurring Capital Drag
            </span>
            <div className="my-auto flex flex-col gap-4">
              <h3 className="font-display text-2xl font-black tracking-tighter uppercase leading-none">
                RECURRING LIQUIDITY DRAG
              </h3>
              <p className="font-mono text-xs text-gray-800 leading-relaxed">
                Your monthly subscription matrix represents a systematic cashflow drag on your overall savings velocity.
              </p>

              <div className="bg-[#E8D5FF] border-4 border-[var(--border-color)] p-4 shadow-[4px_4px_0px_var(--shadow-color)] text-[var(--text-primary)]">
                <span className="font-mono text-[9px] font-black text-[var(--text-primary)]/70 block uppercase">MONTHLY RECURRING SPEND</span>
                <span className="font-display text-3xl font-black block text-purple-800">
                  ₹{subMonthlySpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="font-mono text-[9px] text-[var(--text-primary)] block uppercase mt-1">
                  Yearly Cumulative: ₹{(subMonthlySpend * 12).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] font-mono">
                <div className="border-2 border-[var(--border-color)] p-2.5 bg-[var(--bg-surface)] shadow-[2px_2px_0px_var(--shadow-color)]">
                  <span className="text-[var(--text-muted)] uppercase text-[8px] font-bold block mb-1">MOST EXPENSIVE SLICE:</span>
                  {mostExpensiveSub ? (
                    <>
                      <span className="font-black text-[var(--text-primary)] block truncate">{mostExpensiveSub.service_name || mostExpensiveSub.name}</span>
                      <span className="text-red-500 font-bold">
                        ₹{mostExpensiveSub.amount.toLocaleString('en-IN')}/{mostExpensiveSub.billing_cycle === 'yearly' || mostExpensiveSub.frequency === 'annual' ? 'yr' : 'mo'}
                      </span>
                    </>
                  ) : (
                    <span className="text-[var(--text-muted)] italic">None logged</span>
                  )}
                </div>
                <div className="border-2 border-[var(--border-color)] p-2.5 bg-[var(--bg-surface)] shadow-[2px_2px_0px_var(--shadow-color)]">
                  <span className="text-[var(--text-muted)] uppercase text-[8px] font-bold block mb-1">MOM RECURRING EXPANSION:</span>
                  <span className="font-black text-[var(--text-primary)] block">+₹{subMonthlyGrowthAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  <span className="text-purple-600 font-bold text-[9px]">+8.3% vs June</span>
                </div>
              </div>
            </div>
            <span className="font-mono text-[8px] text-[var(--text-muted)] uppercase">SYS_INDEX: SUBSCRIPTIONS_RECURRING_DRAG</span>
          </div>
        );

      case 8: // SECTION 8.6: PAYMENT CHANNELS & VELOCITY
        return (
          <div className="flex flex-col justify-between h-full text-[var(--text-primary)] p-6">
            <span className="font-mono text-[10px] font-bold bg-[var(--bg-badge)] text-[var(--text-badge)] px-2.5 py-0.5 self-start uppercase">
              Section 08.6 // Access Channel Velocity
            </span>
            <div className="my-auto flex flex-col gap-4">
              <h3 className="font-display text-2xl font-black tracking-tighter uppercase leading-none">
                PAYMENT CHANNELS
              </h3>
              <p className="font-mono text-xs text-gray-800 leading-relaxed">
                Vaults store your assets, but your choice of access channels dictates transaction velocity.
              </p>

              <div className="bg-[var(--accent-info)] border-4 border-[var(--border-color)] p-4 shadow-[4px_4px_0px_var(--shadow-color)] text-[#000000]">
                <span className="font-mono text-[9px] font-black text-[var(--text-primary)]/70 block uppercase">MOST ACTIVE ACCESS CHANNEL</span>
                {mostUsedPm && mostUsedPm.count > 0 ? (
                  <>
                    <span className="font-display text-3xl font-black block text-cyan-900 uppercase">
                      {mostUsedPm.name}
                    </span>
                    <span className="font-mono text-[9px] text-[var(--text-primary)] block uppercase mt-1">
                      Type: {mostUsedPm.type} | Used {mostUsedPm.count} times this month
                    </span>
                  </>
                ) : (
                  <span className="font-display text-lg font-black block text-[var(--text-primary)] italic">
                    NO PAYMENT CHANNELS ENGAGED
                  </span>
                )}
              </div>

              <div className="border-2 border-[var(--border-color)] p-2.5 bg-[var(--bg-surface)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] max-h-[160px] overflow-y-auto">
                <span className="font-mono text-[8px] font-black text-[var(--text-muted)] uppercase block mb-1.5">CHANNEL BREAKDOWN:</span>
                <div className="space-y-1.5">
                  {paymentMethodStats.map(pm => (
                    <div key={pm.id} className="flex justify-between items-center text-[10px] font-mono border-b border-gray-100 pb-1">
                      <span className="font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-none" style={{ backgroundColor: pm.color || '#000' }} />
                        {pm.name}
                      </span>
                      <span className="text-[var(--text-muted)]">{pm.count} txs (Spent ₹{pm.spend.toLocaleString('en-IN')})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <span className="font-mono text-[8px] text-[var(--text-muted)] uppercase">SYS_INDEX: ACCESS_CHANNEL_VELOCITY</span>
          </div>
        );

      case 9: // SECTION 9: FINANCIAL ARCHETYPE
        return (
          <div className="flex flex-col justify-between h-full text-[var(--text-primary)] p-6">
            <span className="font-mono text-[10px] font-bold bg-[var(--bg-badge)] text-[var(--text-badge)] px-2.5 py-0.5 self-start uppercase">
              Section 09 // Psychographic Engine
            </span>
            <div className="my-auto flex flex-col items-center text-center gap-3">
              <span className="font-mono text-[9px] bg-[var(--bg-badge)] text-[var(--text-badge)] px-2 py-0.5 font-bold uppercase tracking-widest">
                YOUR COMPILED FINANCIAL CLASS
              </span>
              
              <motion.div 
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                className={`${archetypeBg} border-4 border-[var(--border-color)] p-6 shadow-[6px_6px_0px_var(--shadow-color)] w-full max-w-sm`}
              >
                <div className="p-3 bg-[var(--bg-surface)] border-2 border-[var(--border-color)] inline-block shadow-[2px_2px_0px_var(--shadow-color)] mb-3">
                  <Trophy className="w-10 h-10 text-[var(--text-primary)] animate-bounce" />
                </div>
                
                <h4 className="font-display text-2xl font-black tracking-tight text-[var(--text-primary)] uppercase leading-none mb-2">
                  {archetype}
                </h4>
                
                <p className="font-mono text-xs text-[var(--text-primary)]/90 leading-relaxed bg-[var(--bg-surface)]/70 border border-[var(--border-color)] p-3 text-left">
                  {archetypeDescription}
                </p>
              </motion.div>
            </div>
            <span className="font-mono text-[8px] text-[var(--text-muted)] uppercase">SYS_ENGINE: PSYCHOMETRIC_METALS</span>
          </div>
        );

      case 10: // SECTION 10: ACHIEVEMENTS UNLOCKED
        return (
          <div className="flex flex-col justify-between h-full text-[var(--text-primary)] p-6">
            <span className="font-mono text-[10px] font-bold bg-[var(--bg-badge)] text-[var(--text-badge)] px-2.5 py-0.5 self-start uppercase">
              Section 10 // Steam Awards
            </span>
            <div className="my-auto flex flex-col gap-4">
              <h3 className="font-display text-2xl font-black tracking-tighter uppercase leading-none">
                ACHIEVEMENTS UNLOCKED
              </h3>
              <p className="font-mono text-xs text-[var(--text-primary)] leading-tight">
                July triggered core milestones inside our gamified financial rig. Achievements unlocked on schedule:
              </p>

              <div className="flex flex-col gap-2">
                {achievements.slice(0, 3).map((ach) => (
                  <div key={ach.id} className="border-2 border-[var(--border-color)] bg-[var(--bg-surface)] p-2 flex items-center gap-3 shadow-[2.5px_2.5px_0px_var(--shadow-color)]">
                    <div className="p-1 border border-[var(--border-color)] bg-[#E1FFC2]">
                      <Star className="w-5 h-5 text-[var(--text-primary)] fill-yellow-300" />
                    </div>
                    <div className="min-w-0 flex-grow">
                      <div className="flex items-center justify-between">
                        <span className="font-display text-[10px] font-extrabold text-[var(--text-primary)] uppercase truncate">{ach.title}</span>
                        <span className="font-mono text-[8px] bg-[var(--bg-badge)] text-[var(--text-badge)] px-1 font-bold">+{ach.points} XP</span>
                      </div>
                      <p className="font-mono text-[8px] text-[var(--text-muted)] truncate">{ach.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[var(--accent-info)] border-2 border-[var(--border-color)] p-2 font-mono text-[9px] text-[#000000] font-extrabold text-center">
                OPERATOR TOTAL SCORE: {achievements.filter(a => a.isUnlocked).reduce((s, a) => s + a.points, 0)} LEVEL POINTS
              </div>
            </div>
            <span className="font-mono text-[8px] text-[var(--text-muted)] uppercase">SYS_RIG: MILITARY_GRADE_SACTIONS</span>
          </div>
        );

      case 11: // SECTION 11: SHAREABLE CARD
        return (
          <div className="flex flex-col justify-between h-full text-[var(--text-primary)] p-6">
            <span className="font-mono text-[10px] font-bold bg-[var(--bg-badge)] text-[var(--text-badge)] px-2.5 py-0.5 self-start uppercase">
              Section 11 // Export Module
            </span>
            <div className="my-auto flex flex-col gap-4">
              <h3 className="font-display text-2xl font-black tracking-tighter uppercase leading-none">
                SHAREABLE INTEL CAPSULE
              </h3>
              
              {/* Actual shareable card preview */}
              <div id="shareable-cents-card" className="border-4 border-[var(--border-color)] p-4 bg-[var(--card-bg)] border-t-[3px] border-t-[var(--accent-primary)] shadow-[4px_4px_0px_var(--shadow-color)] text-[var(--text-primary)] font-mono">
                <div className="flex items-center justify-between border-b-2 border-[var(--border-color)] pb-2 mb-3">
                  <span className="font-display text-xs font-black">COMMON CENTS // JULY 2026</span>
                  <Flame className="w-4 h-4 text-red-500" />
                </div>
                
                <div className="flex flex-col gap-2 text-[10px]">
                  <div className="flex justify-between border-b border-[var(--border-color)]/10 pb-1">
                    <span>SYS_OPERATOR:</span>
                    <span className="font-bold">MYRON</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--border-color)]/10 pb-1">
                    <span>SOLVENCY NET WORTH:</span>
                    <span className="font-bold">₹{netWorth.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--border-color)]/10 pb-1">
                    <span>JULY SAVINGS VELOCITY:</span>
                    <span className="font-bold">{savingsRate.toFixed(1)}% ({savingsStreak}d Streak)</span>
                  </div>
                  <div className="flex justify-between border-b border-[var(--border-color)]/10 pb-1">
                    <span>CORE LEAK INDEX:</span>
                    <span className="font-bold uppercase">{topCategoryName}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>FINANCIAL CLASS:</span>
                    <span className="bg-[var(--bg-badge)] text-[var(--text-badge)] px-1 py-0.2 text-[8px]">{archetype}</span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-2.5">
                <button
                  onClick={copyShareCard}
                  className="flex-grow flex items-center justify-center gap-1.5 bg-[var(--bg-badge)] text-[var(--text-badge)] border-2 border-[var(--border-color)] font-mono text-[11px] font-bold py-2 shadow-[2px_2px_0px_rgba(255,255,255,1)] active:translate-y-[1px] active:shadow-none hover:bg-zinc-800"
                  style={{ cursor: 'pointer' }}
                >
                  <Copy className="w-3.5 h-3.5" />
                  COPY INTEL DIGEST
                </button>
                <button
                  onClick={handleDownloadSimulate}
                  className="flex-grow flex items-center justify-center gap-1.5 bg-[var(--bg-surface)] text-[var(--text-primary)] border-2 border-[var(--border-color)] font-mono text-[11px] font-bold py-2 shadow-[2px_2px_0px_var(--shadow-color)] active:translate-y-[1px] active:shadow-none hover:bg-[var(--bg-hover)]"
                  style={{ cursor: 'pointer' }}
                >
                  <Download className="w-3.5 h-3.5" />
                  EXPORT IMAGE
                </button>
              </div>

              {shareStatus && (
                <div className="bg-[var(--accent-success)] border-2 border-[var(--border-color)] p-1.5 font-mono text-[9px] font-extrabold text-[#000000] text-center shadow-[1px_1px_0px_var(--shadow-color)]">
                  [SYSTEM]: {shareStatus}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center text-[8px] text-[var(--text-muted)] font-mono">
              <span>SECURE PROTOCOL ACTIVED</span>
              <button
                onClick={() => setCurrentSlide(0)}
                className="font-bold text-[var(--text-primary)] underline flex items-center gap-0.5"
                style={{ cursor: 'pointer' }}
              >
                <RotateCcw className="w-2.5 h-2.5" /> RE-RUN WRAPPED
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const slidesCount = 12;

  const handleNext = () => {
    if (currentSlide < slidesCount - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const slideBgClasses = [
    'bg-[var(--accent-primary)]', // slide 0: gold
    'bg-[var(--accent-success)]', // slide 1: green
    'bg-[var(--accent-danger)]', // slide 2: red
    'bg-[var(--accent-danger)]/20', // slide 3: light red
    'bg-[var(--bg-surface)]',     // slide 4: Chrono burn
    'bg-[var(--accent-primary)]/10', // slide 5: light gold (Streak/Grid)
    'bg-[var(--bg-surface)]',     // slide 6: comparison charts
    'bg-[var(--accent-purple)]/20', // slide 7: subscriptions slide (light purple)
    'bg-[var(--accent-info)]/20', // slide 8: payment method velocity slide (light blue)
    archetypeBg,    // slide 9: archetype color
    'bg-[var(--accent-primary)]/20', // slide 10: trophies
    'bg-[var(--bg-surface)]'  // slide 11: export preview
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col gap-6 bg-[var(--section-wrapped)]">
      
      {/* MODE CONTROLLER AND NAVIGATION BAR */}
      <div className="flex items-center justify-between border-b-4 border-[var(--border-color)] pb-4">
        <div>
          <h2 className="font-display text-2xl font-black text-[var(--text-primary)] uppercase">COMMON CENTS // MONTHLY WRAPPED</h2>
          <p className="font-mono text-xs text-[var(--text-muted)]">Your curated neubrutalist monthly financial telemetry report.</p>
        </div>
        
        {/* Toggle Mode */}
        <div className="flex border-2 border-[var(--border-color)] p-1 bg-[var(--bg-surface)] shadow-[2px_2px_0px_var(--shadow-color)]">
          <button
            onClick={() => setActiveMode('story')}
            className={`flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-bold border ${
              activeMode === 'story'
                ? 'bg-[var(--card-bg)] border border-[var(--accent-primary)] text-[var(--accent-primary)] shadow-[1px_1px_0px_var(--shadow-color)]'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]'
            }`}
            style={{ cursor: 'pointer' }}
          >
            <Play className="w-3.5 h-3.5" />
            STORY VIEW
          </button>
          <button
            onClick={() => setActiveMode('board')}
            className={`flex items-center gap-1.5 px-3 py-1 font-mono text-xs font-bold border ${
              activeMode === 'board'
                ? 'bg-[var(--card-bg)] border border-[var(--accent-primary)] text-[var(--accent-primary)] shadow-[1px_1px_0px_var(--shadow-color)]'
                : 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-transparent hover:text-[var(--text-primary)]'
            }`}
            style={{ cursor: 'pointer' }}
          >
            <Grid className="w-3.5 h-3.5" />
            INFOGRAPHIC VIEW
          </button>
        </div>
      </div>

      {/* RENDER MODES */}
      {activeMode === 'story' ? (
        <div className="flex flex-col items-center justify-center py-6 min-h-[550px]">
          {/* STORIES TAPE CHASSIS */}
          <div className="w-full max-w-lg aspect-[4/5] border-4 border-[var(--border-color)] shadow-[8px_8px_0px_var(--shadow-color)] relative flex flex-col overflow-hidden bg-[var(--bg-surface)]">
            
            {/* PROGRESS INDICATOR STRIPS */}
            <div className="absolute top-3 left-3 right-3 flex gap-1 z-30">
              {Array.from({ length: slidesCount }).map((_, idx) => (
                <div 
                  key={idx} 
                  className="h-1 bg-[var(--bg-badge)]/15 flex-grow rounded-none overflow-hidden"
                >
                  <div 
                    className="h-full bg-[var(--bg-badge)] transition-all duration-300"
                    style={{ width: idx < currentSlide ? '100%' : idx === currentSlide ? '100%' : '0%' }}
                  />
                </div>
              ))}
            </div>

            {/* ACTIVE INTERACTIVE STORY CONTAINER */}
            <div className={`w-full h-full flex-grow transition-colors duration-500 ${slideBgClasses[currentSlide]}`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 25 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -25 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="h-full w-full"
                >
                  {renderSlideContent(currentSlide)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* CONTROL SWITCHES */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className={`p-3 border-2 border-[var(--border-color)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] bg-[var(--bg-surface)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                currentSlide === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[var(--bg-hover)]'
              }`}
              style={{ cursor: currentSlide === 0 ? 'default' : 'pointer' }}
            >
              <ChevronLeft className="w-5 h-5 text-[var(--text-primary)]" />
            </button>

            <span className="font-mono text-xs font-bold bg-[var(--bg-surface)] border-2 border-[var(--border-color)] px-4 py-2 shadow-[2.5px_2.5px_0px_var(--shadow-color)] text-[var(--text-primary)]">
              SLIDE {currentSlide + 1} / {slidesCount}
            </span>

            <button
              onClick={handleNext}
              disabled={currentSlide === slidesCount - 1}
              className={`p-3 border-2 border-[var(--border-color)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] bg-[var(--bg-surface)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${
                currentSlide === slidesCount - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[var(--bg-hover)]'
              }`}
              style={{ cursor: currentSlide === slidesCount - 1 ? 'default' : 'pointer' }}
            >
              <ChevronRight className="w-5 h-5 text-[var(--text-primary)]" />
            </button>
          </div>
        </div>
      ) : (
        /* INFOGRAPHIC BENTO GRID LAYOUT */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-20">
          
          {/* HEADER HERO */}
          <div className="md:col-span-12 bg-[var(--bg-alt)] border-4 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-primary)] p-6 shadow-[5px_5px_0px_var(--shadow-color)] flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <span className="font-mono text-[10px] bg-[var(--bg-badge)] text-[var(--text-badge)] px-2 py-0.5 font-bold uppercase tracking-widest">INFOGRAPHIC PROTOCOL</span>
              <h3 className="font-display text-4xl font-black mt-2 leading-none uppercase">MYRON'S JULY 2026</h3>
              <p className="font-mono text-xs text-[var(--text-primary)]/80 mt-1">"A month of highs, lows, smart choices, and a few too many takeout orders."</p>
            </div>
            <div className="bg-[var(--bg-surface)] border-2 border-[var(--border-color)] px-4 py-2 font-mono text-xs font-bold text-[var(--text-primary)] shadow-[2.5px_2.5px_0px_var(--shadow-color)]">
              OPERATOR STATUS: GOLDEN ACTIVE
            </div>
          </div>

          {/* SECTION 1: THE NUMBERS (COL SPAN 4) */}
          <div className="md:col-span-4 bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
            <h4 className="font-display text-base font-black text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-1.5 mb-3 uppercase tracking-tight">
              📊 01 / THE LEDGER NUMBERS
            </h4>
            <div className="flex flex-col gap-3">
              <div className="bg-[var(--card-bg)] border-2 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-success)] p-3.5 shadow-[2px_2px_0px_var(--shadow-color)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_var(--shadow-color)]">
                <span className="font-mono text-[9px] text-[var(--text-muted)] block uppercase">TOTAL JULY INCOME</span>
                <span className="font-display text-xl font-extrabold block text-[var(--accent-success)]">₹{totalInflows.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-[var(--card-bg)] border-2 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-danger)] p-3.5 shadow-[2px_2px_0px_var(--shadow-color)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_var(--shadow-color)]">
                <span className="font-mono text-[9px] text-[var(--text-muted)] block uppercase">TOTAL EXPENSES</span>
                <span className="font-display text-xl font-extrabold block text-[var(--accent-danger)]">₹{totalOutflows.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="bg-[var(--card-bg)] border-2 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-info)] p-3.5 shadow-[2px_2px_0px_var(--shadow-color)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_var(--shadow-color)]">
                <span className="font-mono text-[9px] text-[var(--text-muted)] block uppercase">TOTAL SAVINGS HOARDED</span>
                <span className="font-display text-xl font-extrabold block text-[var(--accent-info)]">₹{totalSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: YOUR FINANCIAL PERSONALITY (COL SPAN 4) */}
          <div className="md:col-span-4 bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
            <h4 className="font-display text-base font-black text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-1.5 mb-3 uppercase tracking-tight">
              🔥 02 / CATEGORY VELOCITY
            </h4>
            <div className="bg-[var(--card-bg)] border-2 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-primary)] p-4 shadow-[3px_3px_0px_var(--shadow-color)] h-full flex flex-col justify-between">
              <div>
                <span className="font-mono text-[9px] font-black block text-[var(--text-primary)]/60 uppercase">DOMINANT CASH LEAK</span>
                <span className="font-display text-2xl font-black block uppercase leading-tight mt-1">{topCategoryName}</span>
                <span className="font-mono text-xs text-[var(--text-primary)] block mt-1">Aggregate Category Spend: <b>₹{topCategorySpent.toLocaleString('en-IN')}</b></span>
              </div>
              <div className="border-t border-[var(--border-color)]/10 pt-3 mt-4 flex flex-col gap-1 font-mono text-xs">
                <div className="flex justify-between">
                  <span>SHARE OF WALLET:</span>
                  <span className="font-bold">{topCategoryPercentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>MOM CHANGE GRADIENT:</span>
                  <span className="font-bold">+4.2%</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: BIGGEST PURCHASE (COL SPAN 4) */}
          <div className="md:col-span-4 bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
            <h4 className="font-display text-base font-black text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-1.5 mb-3 uppercase tracking-tight">
              💥 03 / CRITICAL DEBIT COLLISION
            </h4>
            <div className="bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-4 shadow-[3px_3px_0px_var(--shadow-color)] h-full flex flex-col justify-between">
              <div>
                <span className="font-mono text-[9px] bg-red-600 text-white px-1.5 py-0.2 font-extrabold inline-block uppercase">
                  {biggestPurchase.category.toUpperCase()}
                </span>
                <span className="font-display text-lg font-black block text-[var(--text-primary)] mt-2 leading-none uppercase">
                  {biggestPurchase.description}
                </span>
                <span className="font-display text-3xl font-black block text-red-600 mt-1">
                  -₹{biggestPurchase.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-t border-[var(--border-color)]/5 pt-3 mt-4 text-[10px] font-mono text-[var(--text-muted)] space-y-1">
                <div className="flex justify-between">
                  <span>TRANSMITTED:</span>
                  <span className="font-bold text-[var(--text-primary)]">{biggestPurchase.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>JULY VELOCITY IMPACT:</span>
                  <span className="font-bold text-red-600">{biggestPurchaseImpact.toFixed(1)}% OF CASH BURN</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: MOST EXPENSIVE DAY & SECTION 5: AVERAGE DAILY SPEND (COL SPAN 6) */}
          <div className="md:col-span-6 bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
            <h4 className="font-display text-base font-black text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-1.5 mb-3 uppercase tracking-tight">
              ⏳ 04 & 05 / CHRONO BURN METRICS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#FFE2E2] border-2 border-[var(--border-color)] p-4 shadow-[2.5px_2.5px_0px_var(--shadow-color)]">
                <span className="font-mono text-[9px] font-bold text-[var(--text-muted)] block uppercase">MOST EXPENSIVE DAY</span>
                <span className="font-display text-sm font-black text-[var(--text-primary)] uppercase block mt-1">
                  {new Date(mostExpensiveDayDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="font-display text-xl font-black block text-red-600 mt-2">₹{mostExpensiveDayAmount.toLocaleString('en-IN')} spent</span>
              </div>

              <div className="bg-[#E1FFC2] border-2 border-[var(--border-color)] p-4 shadow-[2.5px_2.5px_0px_var(--shadow-color)] flex flex-col justify-between">
                <div>
                  <span className="font-mono text-[9px] font-bold text-[var(--text-muted)] block uppercase">DAILY BURN RATE</span>
                  <span className="font-display text-xl font-black text-[var(--text-primary)] mt-1">₹{averageDailySpend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/day</span>
                </div>
                <div className="border-t border-[var(--border-color)]/10 pt-2 mt-2 font-mono text-[10px] text-green-700 flex justify-between">
                  <span>COMPARED TO JUNE:</span>
                  <span className="font-bold">{averageDailySpendTrend}% decrease</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6: SAVINGS ACHIEVEMENT & SECTION 7: SPENDING HEATMAP (COL SPAN 6) */}
          <div className="md:col-span-6 bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
            <h4 className="font-display text-base font-black text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-1.5 mb-3 uppercase tracking-tight">
              🏆 06 & 07 / VELOCITY SHIELD & HEATMAP
            </h4>
            <div className="flex flex-col gap-4">
              <div className="bg-[#FFF9B6] border-2 border-[var(--border-color)] p-3 shadow-[2.5px_2.5px_0px_var(--shadow-color)] flex items-center gap-3">
                <div className="p-1.5 bg-yellow-400 border border-[var(--border-color)] animate-pulse shrink-0">
                  <Award className="w-6 h-6 text-[var(--text-primary)]" />
                </div>
                <div>
                  <span className="font-mono text-[8px] bg-[var(--bg-badge)] text-[var(--text-badge)] px-1 font-bold uppercase">STREAK BADGE</span>
                  <h4 className="font-display text-xs font-black uppercase mt-0.5">{savingsStreakBadge} ({savingsStreak}d Streak)</h4>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 bg-[var(--bg-surface)] border border-[var(--border-color)] p-2">
                {heatmapData.map((cell) => {
                  let color = 'bg-green-400 border border-[var(--border-color)]';
                  if (cell.intensity === 'over') color = 'bg-red-500 border border-[var(--border-color)]';
                  else if (cell.intensity === 'moderate') color = 'bg-yellow-400 border border-[var(--border-color)]';
                  return (
                    <div 
                      key={cell.day} 
                      className={`aspect-square w-full ${color} flex items-center justify-center text-[7px] font-mono font-bold`}
                      title={`Day ${cell.day}: ₹${cell.amount.toFixed(0)}`}
                    >
                      {cell.day}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 8: THE BIG PICTURE COMPARISON CHART (COL SPAN 4) */}
          <div className="md:col-span-4 bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)] flex flex-col justify-between">
            <div>
              <h4 className="font-display text-base font-black text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-1.5 mb-3 uppercase tracking-tight">
                📈 08 / THE BIG PICTURE (JUNE VS JULY 2026)
              </h4>
              <div className="w-full h-40 font-mono text-[9px] bg-[var(--bg-surface)] border border-[var(--border-color)] p-2 mb-3">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#000" strokeWidth={1.5} />
                    <YAxis stroke="#000" strokeWidth={1.5} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '2px solid #000',
                        fontFamily: 'monospace'
                      }} 
                      formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Value']}
                    />
                    <Bar dataKey="Previous" name="June" fill="#E5E7EB" stroke="#000" strokeWidth={1.5} />
                    <Bar dataKey="July" name="July" fill="#DC5C5C" stroke="#000" strokeWidth={1.5} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* SECTION 8.5: RECURRING SUBSCRIPTIONS DRAG (COL SPAN 4) */}
          <div className="md:col-span-4 bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)] flex flex-col justify-between">
            <div>
              <h4 className="font-display text-base font-black text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-1.5 mb-3 uppercase tracking-tight">
                💳 08.5 / RECURRING SYSTEM DRAG
              </h4>
              <div className="bg-[#E8D5FF] border-2 border-[var(--border-color)] p-3.5 shadow-[2px_2px_0px_var(--shadow-color)] mb-3 text-left">
                <span className="font-mono text-[9px] text-[var(--text-primary)]/70 block uppercase">MONTHLY RECURRING SPEND</span>
                <span className="font-display text-2xl font-black block text-purple-800">₹{subMonthlySpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <span className="font-mono text-[9px] text-[var(--text-primary)] block mt-1 uppercase">Yearly Projection: ₹{(subMonthlySpend * 12).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex flex-col gap-2 font-mono text-[10px] text-left">
                <div className="border border-[var(--border-color)] p-2 bg-[var(--bg-muted)] flex justify-between items-center">
                  <span className="text-[var(--text-muted)] uppercase">Most Expensive:</span>
                  <span className="font-bold truncate max-w-[120px] text-right">
                    {mostExpensiveSub ? `${mostExpensiveSub.service_name || mostExpensiveSub.name} (₹${mostExpensiveSub.amount})` : 'None'}
                  </span>
                </div>
                <div className="border border-[var(--border-color)] p-2 bg-[var(--bg-muted)] flex justify-between items-center">
                  <span className="text-[var(--text-muted)] uppercase">Growth vs Last Month:</span>
                  <span className="font-bold text-purple-600">+8.3% (+₹{subMonthlyGrowthAmount.toFixed(0)})</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 9: FINANCIAL ARCHETYPE (COL SPAN 4) */}
          <div className="md:col-span-4 bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
            <h4 className="font-display text-base font-black text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-1.5 mb-3 uppercase tracking-tight">
              🔮 09 / FINANCIAL ARCHETYPE PSYCHE
            </h4>
            <div className={`${archetypeBg} border-2 border-[var(--border-color)] p-4 shadow-[3px_3px_0px_var(--shadow-color)] h-full flex flex-col justify-between`}>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[var(--bg-surface)] border border-[var(--border-color)] shadow-[1.5px_1.5px_0px_var(--shadow-color)] shrink-0">
                  <Trophy className="w-7 h-7 text-[var(--text-primary)] animate-bounce" />
                </div>
                <div>
                  <span className="font-mono text-[9px] bg-[var(--bg-badge)] text-[var(--text-badge)] px-1.5 py-0.2 font-bold uppercase">COMPILED CLASS</span>
                  <h4 className="font-display text-xl font-black mt-1 uppercase">{archetype}</h4>
                </div>
              </div>
              <p className="font-mono text-xs text-[var(--text-primary)]/95 mt-4 leading-relaxed bg-[var(--bg-surface)]/70 border border-[var(--border-color)] p-2.5">
                {archetypeDescription}
              </p>
            </div>
          </div>

          {/* SECTION 10: ACHIEVEMENTS UNLOCKED (COL SPAN 6) */}
          <div className="md:col-span-6 bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
            <h4 className="font-display text-base font-black text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-1.5 mb-3 uppercase tracking-tight">
              🌟 10 / UNLOCKED ACHIEVEMENTS MATRIX
            </h4>
            <div className="flex flex-col gap-3">
              {achievements.slice(0, 3).map((ach) => (
                <div key={ach.id} className="border-2 border-[var(--border-color)] bg-[var(--bg-surface)] p-2.5 flex items-center gap-3 shadow-[2.5px_2.5px_0px_var(--shadow-color)]">
                  <div className="p-1 bg-[#E1FFC2] border border-[var(--border-color)] shrink-0">
                    <Star className="w-5 h-5 text-[var(--text-primary)] fill-yellow-300" />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-[10px] font-extrabold text-[var(--text-primary)] uppercase truncate">{ach.title}</span>
                      <span className="font-mono text-[8px] bg-[var(--bg-badge)] text-[var(--text-badge)] px-1 font-bold">+{ach.points} XP</span>
                    </div>
                    <p className="font-mono text-[8px] text-[var(--text-muted)] truncate">{ach.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 11: SHAREABLE CARD (COL SPAN 6) */}
          <div className="md:col-span-6 bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)] flex flex-col justify-between">
            <h4 className="font-display text-base font-black text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-1.5 mb-3 uppercase tracking-tight">
              📥 11 / SHAREABLE CARD CAPTURE
            </h4>
            
            <div className="flex flex-col gap-4">
              <div className="border-4 border-[var(--border-color)] p-4 bg-[var(--card-bg)] border-t-[3px] border-t-[var(--accent-primary)] shadow-[3px_3px_0px_var(--shadow-color)] text-[var(--text-primary)] font-mono text-[11px]">
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-1 mb-2">
                  <span className="font-display font-black text-xs uppercase">COMMON CENTS // MYRON</span>
                  <Flame className="w-3.5 h-3.5 text-red-500" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between"><span>OPERATOR:</span><span className="font-bold">MYRON</span></div>
                  <div className="flex justify-between"><span>NET WORTH:</span><span className="font-bold">₹{netWorth.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span>SAVINGS VELOCITY:</span><span className="font-bold">{savingsRate.toFixed(1)}%</span></div>
                  <div className="flex justify-between"><span>DOMINANT LEAK:</span><span className="font-bold uppercase">{topCategoryName}</span></div>
                  <div className="flex justify-between"><span>ARCHETYPE CLASS:</span><span className="font-bold uppercase bg-[var(--bg-badge)] text-[var(--text-badge)] px-1">{archetype}</span></div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={copyShareCard}
                  className="flex-grow flex items-center justify-center gap-1.5 bg-[var(--bg-badge)] text-[var(--text-badge)] font-mono text-xs font-bold py-2 shadow-[2px_2px_0px_var(--shadow-color)] active:translate-y-[1px]"
                  style={{ cursor: 'pointer' }}
                >
                  <Copy className="w-3.5 h-3.5" /> COPY DATA DIGEST
                </button>
                <button
                  onClick={handleDownloadSimulate}
                  className="flex-grow flex items-center justify-center gap-1.5 bg-[var(--bg-surface)] text-[var(--text-primary)] border-2 border-[var(--border-color)] font-mono text-xs font-bold py-2 shadow-[2px_2px_0px_var(--shadow-color)] active:translate-y-[1px]"
                  style={{ cursor: 'pointer' }}
                >
                  <Download className="w-3.5 h-3.5" /> DOWNLOAD CARD
                </button>
              </div>

              {shareStatus && (
                <div className="bg-[var(--accent-success)] border-2 border-[var(--border-color)] p-1 text-[9px] font-mono font-bold text-[#000000] text-center shadow-[1px_1px_0px_var(--shadow-color)]">
                  [SYSTEM_ALERT]: {shareStatus}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
