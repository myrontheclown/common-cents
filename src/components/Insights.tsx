/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  Terminal,
  Zap,
  Cpu,
  ArrowUpRight
} from 'lucide-react';
import { useFinanceStore } from '../store';
import { getPaymentMethodIcon } from '../lib/paymentMethodIcons';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

export default function Insights() {
  const { 
    transactions, 
    budgets, 
    accounts, 
    preferences, 
    insights, 
    setInsights,
    subscriptions,
    paymentMethods
  } = useFinanceStore();

  const [loading, setLoading] = useState(false);
  const [loadingLog, setLoadingLog] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Recharts Spend category breakdown calculation
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const categoryTotals: Record<string, number> = {};
  
  expenseTransactions.forEach(t => {
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const chartData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    Value: parseFloat(value.toFixed(2))
  })).sort((a, b) => b.Value - a.Value);

  // Colors for neubrutalist chart bars
  const barColors = ['#D4A72C', '#DC5C5C', '#22C55E', '#F59E0B', '#4F8CC9', '#8B5CF6', '#3B82F6'];

  // Cool terminal logs sequence for loading
  const logSequence = [
    'Initializing COMMON CENTS cybernetic agent...',
    'Extracting vault balances and cashflows...',
    'Analyzing category limit velocity gradients...',
    'Invoking Google GenAI model: gemini-3.5-flash...',
    'Synthesizing actionable arbitrage brackets...',
    'Structuring custom neubrutalist payload...'
  ];

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    let logIdx = 0;
    setLoadingLog(logSequence[0]);

    // Cycle through logs quickly for cyberpunk aesthetic
    const logInterval = setInterval(() => {
      if (logIdx < logSequence.length - 1) {
        logIdx++;
        setLoadingLog(logSequence[logIdx]);
      }
    }, 600);

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
        throw new Error(data.error || 'Unknown server error');
      }
    } catch (err: any) {
      setError(err.message || 'Network failure communicating with COMMON CENTS server');
    } finally {
      clearInterval(logInterval);
      setLoading(false);
    }
  };

  const getInsightTypeStyles = (type: string) => {
    switch (type) {
      case 'tip': 
        return {
          accent: 'border-t-[var(--accent-success)]',
          icon: <TrendingUp className="w-5 h-5 text-[var(--accent-success)]" />,
          label: 'ARBITRAGE ADVANTAGE'
        };
      case 'warning': 
        return {
          accent: 'border-t-[var(--accent-danger)]',
          icon: <AlertTriangle className="w-5 h-5 text-[var(--accent-danger)]" />,
          label: 'VELOCITY WARNING'
        };
      case 'celebration': 
        return {
          accent: 'border-t-[var(--accent-warning)]',
          icon: <CheckCircle className="w-5 h-5 text-[var(--accent-warning)] animate-bounce" />,
          label: 'MILESTONE UNLOCKED'
        };
      default: 
        return {
          accent: 'border-t-[var(--accent-info)]',
          icon: <Cpu className="w-5 h-5 text-[var(--accent-info)]" />,
          label: 'SYSTEM ANALYSIS'
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* HEADER ROW */}
      <div className="lg:col-span-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-4 border-[var(--border-color)] pb-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] uppercase">NEURAL INSIGHTS DRIVER</h2>
          <p className="font-mono text-xs text-[var(--text-muted)]">
            Cybernetic financial analytics driven by Google Gemini LLM reasoning
          </p>
        </div>
        
        <button
          onClick={fetchInsights}
          disabled={loading}
          className={`flex items-center gap-1.5 bg-[var(--accent-primary)] text-[#000000] font-display text-xs font-bold px-4 py-2 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] transition-all ${
            loading 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px]'
          }`}
          style={{ cursor: loading ? 'default' : 'pointer' }}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'CALCULATING...' : 'QUERY AI INSIGHTS'}
        </button>
      </div>

      {/* LEFT COLUMN: ACTIVE RECOMMENDATIONS (8 SPAN) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* LOADING SHIELD */}
        {loading && (
          <div className="bg-black text-[#39FF14] font-mono p-8 border-4 border-[#39FF14] shadow-[6px_6px_0px_var(--shadow-color)] flex flex-col gap-4 animate-pulse">
            <div className="flex items-center gap-2 text-white">
              <Cpu className="w-6 h-6 animate-spin text-[#39FF14]" />
              <span className="font-display font-bold tracking-widest text-[#39FF14]">COMMON CENTS AGENT INFERENCE</span>
            </div>
            <div className="bg-zinc-900 p-4 border border-[#39FF14] text-xs leading-relaxed">
              <p className="text-white mb-2 font-bold">[CORE_SYS_ONLINE]</p>
              <p>&gt; {loadingLog}</p>
              <p>&gt; Pipeline latency sweeps: active</p>
            </div>
          </div>
        )}

        {/* ERROR SHIELD */}
        {error && (
          <div className="bg-[var(--card-bg)] border-4 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-danger)] p-5 shadow-[4px_4px_0px_var(--shadow-color)] flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-[var(--text-primary)] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display font-bold text-[var(--text-primary)] uppercase text-sm">INFERENCE RUNTIME FAILURE</h4>
              <p className="font-mono text-xs text-[var(--text-primary)] mt-1">{error}</p>
              <button 
                onClick={fetchInsights}
                className="mt-3 bg-[var(--bg-surface)] border-2 border-[var(--border-color)] px-3 py-1 text-xs font-mono font-bold hover:bg-[var(--bg-hover)] shadow-[2px_2px_0px_var(--shadow-color)] active:translate-y-[1px]"
                style={{ cursor: 'pointer' }}
              >
                RE-TRANSMIT QUERY
              </button>
            </div>
          </div>
        )}

        {/* LIST OF INSIGHTS */}
        {!loading && !error && (
          <div className="flex flex-col gap-6">
            {insights.map((insight) => {
              const style = getInsightTypeStyles(insight.type);
              return (
                <div 
                  key={insight.id}
                  className={`bg-[var(--card-bg)] border-4 border-[var(--border-color)] border-t-[3px] p-6 shadow-[6px_6px_0px_var(--shadow-color)] flex flex-col md:flex-row gap-5 items-start transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[7px_7px_0px_var(--shadow-color)] ${style.accent}`}
                >
                  {/* ICON BLOCK */}
                  <div className={`p-3 border-2 border-[var(--border-color)] rounded-none shrink-0 bg-[var(--card-bg)]`}>
                    {style.icon}
                  </div>

                  {/* DETAILS */}
                  <div className="flex-grow">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="font-mono text-[9px] bg-[var(--bg-badge)] text-[var(--text-badge)] px-1.5 py-0.5 font-bold tracking-wider">
                        {style.label}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--text-muted)] font-bold">{insight.date}</span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-[var(--text-primary)] leading-tight mb-1">
                      {insight.title}
                    </h3>
                    
                    <p className="font-display text-sm font-bold text-[var(--text-primary)] italic mb-3">
                      {insight.summary}
                    </p>

                    <p className="font-mono text-xs text-[var(--text-muted)] leading-relaxed bg-[var(--bg-muted)] p-3 border border-[var(--border-color)] border-dashed mb-4">
                      {insight.detail}
                    </p>

                    {/* ACTION & IMPACT PANEL */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[var(--border-color)]/10 pt-3">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5 text-[var(--text-primary)] shrink-0" />
                        <span className="font-mono text-[10px] font-bold text-[var(--text-primary)] uppercase">
                          Action: <span className="text-[var(--text-muted)] font-normal">{insight.actionableStep}</span>
                        </span>
                      </div>
                      
                      {insight.impactValue && (
                        <div className="bg-[var(--accent-success)] border-2 border-[var(--border-color)] px-2.5 py-0.5 font-mono text-xs font-bold text-[#000000] inline-flex items-center gap-1 shadow-[2px_2px_0px_var(--shadow-color)]">
                          <Zap className="w-3.5 h-3.5" />
                          {insight.impactValue}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* RIGHT COLUMN: CHARTS & META (4 SPAN) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* OUTFLOW DISTRIBUTION BAR CHART */}
        <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
          <h3 className="font-display text-base font-bold text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 mb-4 uppercase tracking-wider">
            OUTFLOW DISTRIBUTION
          </h3>

          {chartData.length > 0 ? (
            <div className="w-full h-60 font-mono text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#000" strokeWidth={1.5} />
                  <YAxis stroke="#000" strokeWidth={1.5} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '2px solid #000',
                      borderRadius: '0px',
                      fontFamily: 'monospace'
                    }} 
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                  />
                  <Bar dataKey="Value" stroke="#000" strokeWidth={2}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="p-8 text-center text-xs font-mono font-bold text-[var(--text-muted)] uppercase border border-[var(--border-color)] border-dashed">
              No outflow transactions recorded
            </div>
          )}
        </div>

        {/* SUBSCRIPTION DEBIT AUDITOR */}
        <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
          <h3 className="font-display text-base font-bold text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
            <span>💳</span> SUBSCRIPTION DEBIT AUDITOR
          </h3>
          
          {(() => {
            const activeSubs = subscriptions.filter(s => s.active ?? s.isActive ?? true);
            const yearlySpend = activeSubs.reduce((sum, s) => {
              const cycle = s.billing_cycle || (s.frequency === 'annual' ? 'yearly' : 'monthly');
              if (cycle === 'yearly') {
                return sum + s.amount;
              }
              return sum + (s.amount * 12);
            }, 0);

            const expensiveSubs = activeSubs.filter(s => {
              const cycle = s.billing_cycle || (s.frequency === 'annual' ? 'yearly' : 'monthly');
              const monthlyEquiv = (cycle === 'yearly') ? (s.amount / 12) : s.amount;
              return monthlyEquiv > 500;
            });

            return (
              <div className="space-y-4">
                <div className="bg-[var(--accent-purple)]/10 border-2 border-[var(--border-color)] p-3.5 font-mono shadow-[2.5px_2.5px_0px_var(--shadow-color)]">
                  <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase tracking-wider mb-1">
                    YEARLY RECURRING OUTFLOW
                  </span>
                  <span className="text-2xl font-black text-[var(--text-primary)]">
                    ₹{yearlySpend.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[9px] text-[var(--text-muted)] block uppercase mt-1">
                    Equivalent to ₹{(yearlySpend / 12).toLocaleString('en-IN', { maximumFractionDigits: 0 })} per month drag
                  </span>
                </div>

                <div className="font-mono text-xs">
                  <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase tracking-wider mb-2">
                    INTELLIGENCE ANOMALY DETECTION
                  </span>
                  {expensiveSubs.length > 0 ? (
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                      {expensiveSubs.map(s => {
                        const cycle = s.billing_cycle || (s.frequency === 'annual' ? 'yearly' : 'monthly');
                        const monthlyEquiv = (cycle === 'yearly') ? (s.amount / 12) : s.amount;
                        return (
                          <div key={s.id} className="border border-[var(--border-color)] bg-[#FFE2E2] p-2.5 shadow-[1.5px_1.5px_0px_var(--shadow-color)]">
                            <div className="flex items-center justify-between font-bold mb-1">
                              <span className="text-[var(--text-primary)] uppercase text-[10px]">{s.service_name || s.name}</span>
                              <span className="text-red-600 text-[10px]">
                                ₹{s.amount.toLocaleString('en-IN')}/{cycle === 'yearly' ? 'yr' : 'mo'}
                              </span>
                            </div>
                            <p className="text-[9px] text-[var(--text-primary)] leading-relaxed">
                              ⚠️ EXPENSIVE RECURRING DEBIT: Costs ₹{monthlyEquiv.toLocaleString('en-IN', { maximumFractionDigits: 0 })}/mo equivalent. Consider downgrading or auditing usage metrics.
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="border border-[var(--border-color)] border-dashed bg-[var(--bg-muted)] p-3 text-center text-[var(--text-muted)] text-[9px] uppercase italic">
                      Zero high-cost subscriptions (&gt;₹500/mo) detected. Capital efficiency is high.
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* PAYMENT METHOD VELOCITY */}
        <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
          <h3 className="font-display text-base font-bold text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
            <span>⚡</span> PAYMENT METHOD VELOCITY
          </h3>
          {(() => {
            const methodStats = paymentMethods.map(pm => {
              const txs = transactions.filter(t => t.paymentMethodId === pm.id);
              const totalSpend = txs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
              const totalInflow = txs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
              return {
                ...pm,
                count: txs.length,
                spend: totalSpend,
                inflow: totalInflow
              };
            });

            const sortedByUsage = [...methodStats].sort((a, b) => b.count - a.count);
            const mostUsed = sortedByUsage[0];

            return (
              <div className="space-y-4">
                {mostUsed && mostUsed.count > 0 ? (
                  <div className="bg-[var(--accent-info)]/20 border-2 border-[var(--border-color)] p-3 font-mono shadow-[2.5px_2.5px_0px_var(--shadow-color)]">
                    <span className="text-[9px] text-[var(--text-muted)] font-bold block uppercase tracking-wider mb-1">
                      MOST ENGAGED METHOD
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[var(--text-primary)]">
                        {mostUsed.name}
                      </span>
                      <span className="bg-[var(--bg-badge)] text-[var(--text-badge)] text-[8px] font-mono font-bold px-1.5 py-0.2 uppercase">
                        {mostUsed.type}
                      </span>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] block mt-1">
                      Accessed <span className="font-bold text-[var(--text-primary)]">{mostUsed.count} times</span> | Spent <span className="font-bold text-[var(--text-primary)]">₹{mostUsed.spend.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </span>
                  </div>
                ) : (
                  <div className="bg-[var(--bg-muted)] border border-[var(--border-color)] border-dashed p-3 text-center text-[var(--text-muted)] text-[9px] uppercase italic">
                    No payment method engagement tracked yet
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase tracking-wider">
                    PAYMENT CHANNEL ENGAGEMENT
                  </span>
                  <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                    {methodStats.map(pm => {
                      const vault = accounts.find(a => a.id === pm.accountId)?.name || 'Direct';
                      return (
                        <div key={pm.id} className="border border-[var(--border-color)] bg-[var(--bg-surface)] p-2 flex items-center justify-between hover:bg-[var(--bg-hover)]">
                          <div>
                            <div className="flex items-center gap-1.5">
                              {getPaymentMethodIcon(pm.icon)}
                              <span 
                                className="inline-block w-2 h-2 border border-[var(--border-color)] rounded-none"
                                style={{ backgroundColor: pm.color || '#000' }}
                              />
                              <span className="text-[var(--text-primary)] uppercase text-[10px] font-bold">{pm.name}</span>
                            </div>
                            <span className="text-[8px] text-[var(--text-muted)] font-mono font-bold block mt-0.5 uppercase">
                              Type: {pm.type} | Linked: {vault}
                            </span>
                          </div>
                          <div className="text-right font-mono">
                            <span className="text-[var(--text-primary)] text-[10px] font-bold block">
                              {pm.count} txs
                            </span>
                            <span className="text-[var(--text-muted)] text-[8px] block mt-0.5">
                              ₹{pm.spend.toLocaleString('en-IN', { maximumFractionDigits: 0 })} spent
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* NEURAL STATS BLOCK */}
        <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
          <h3 className="font-display text-base font-bold text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 mb-4 uppercase tracking-wider">
            SHELL CAPABILITIES
          </h3>
          <div className="flex flex-col gap-2.5 font-mono text-[11px] text-[var(--text-primary)]">
            <div className="flex items-center justify-between border-b border-[var(--border-color)]/5 pb-1.5">
              <span>MODEL IDENTIFIER:</span>
              <span className="font-bold text-[var(--text-primary)]">gemini-3.5-flash</span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--border-color)]/5 pb-1.5">
              <span>LATENCY TOLERANCE:</span>
              <span className="font-bold text-[var(--text-primary)]">DYNAMIC (HMR OFF)</span>
            </div>
            <div className="flex items-center justify-between border-b border-[var(--border-color)]/5 pb-1.5">
              <span>INTELLIGENCE MODE:</span>
              <span className="font-bold text-[var(--text-primary)]">SCHEMA VALIDATED JSON</span>
            </div>
            <div className="flex items-center justify-between">
              <span>OAUTH HOOKS:</span>
              <span className="font-bold text-red-500">OFFLINE BY-PASS</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
