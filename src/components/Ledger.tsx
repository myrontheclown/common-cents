/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Plus, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  X,
  Play,
  Pause,
  AlertTriangle,
  Pencil
} from 'lucide-react';
import { useFinanceStore } from '../store';
import { useAuthContext } from '../providers/AuthProvider';
import { Transaction, Subscription, PaymentMethod } from '../types';
import { getPaymentMethodIcon } from '../lib/paymentMethodIcons';
import LowBalanceWarning from './LowBalanceWarning';

export default function Ledger() {
  const auth = useAuthContext();
  const { 
    transactions, 
    accounts, 
    subscriptions,
    paymentMethods,
    deleteTransaction,
    addTransaction,
    updateTransaction,
    toggleSubscriptionActive,
    deleteSubscription
  } = useFinanceStore();

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  
  // Sort states
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'income' | 'expense'>('expense');
  const [newCat, setNewCat] = useState('Food & Dining');
  const [newAccId, setNewAccId] = useState(accounts[0]?.id || 'bank-1');
  const [newPmId, setNewPmId] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Low balance warning state
  const [showBalanceWarning, setShowBalanceWarning] = useState(false);
  const [pendingTxData, setPendingTxData] = useState<{
    txData: Parameters<typeof addTransaction>[0] & { id?: string };
    isEdit: boolean;
    currentBalance: number;
  } | null>(null);

  const openEditModal = (tx: Transaction) => {
    setEditingTx(tx);
    setNewDesc(tx.description);
    setNewAmount(tx.amount.toString());
    setNewType(tx.type);
    setNewCat(tx.type === 'expense' ? tx.category : 'Food & Dining');
    setNewAccId(tx.accountId);
    setNewPmId(tx.paymentMethodId || '');
    setNewDate(tx.date);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingTx(null);
    setNewDesc('');
    setNewAmount('');
    setNewPmId('');
    setNewDate(new Date().toISOString().split('T')[0]);
    setNewType('expense');
    setNewCat('Food & Dining');
    setNewAccId(accounts[0]?.id || 'bank-1');
    setIsModalOpen(false);
  };

  // Unique categories derived from transactions + defaults
  const categories = Array.from(new Set([
    'Food & Dining', 'Entertainment', 'Housing', 'Shopping', 'Transport', 'Utilities', 'Income', 'Savings',
    ...transactions.map(t => t.category)
  ])).filter(Boolean);

  // Sorting handlers
  const handleSort = (field: 'date' | 'amount' | 'description') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Filter transactions
  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesCat = filterCategory === 'all' || t.category.toLowerCase() === filterCategory.toLowerCase();
      const matchesAcc = filterAccount === 'all' || t.accountId === filterAccount;
      return matchesSearch && matchesType && matchesCat && matchesAcc;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === 'amount') {
        comparison = a.amount - b.amount;
      } else if (sortBy === 'description') {
        comparison = a.description.localeCompare(b.description);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc || !newAmount || isNaN(Number(newAmount))) return;

    const txData = {
      description: newDesc,
      amount: parseFloat(parseFloat(newAmount).toFixed(2)),
      category: newType === 'income' ? 'Income' : newCat,
      type: newType,
      accountId: newAccId,
      paymentMethodId: newPmId || undefined,
      date: newDate
    };

    if (newType === 'expense') {
      const selectedAccount = accounts.find(a => a.id === newAccId);
      if (selectedAccount) {
        const projectedBalance = selectedAccount.balance - txData.amount;
        if (projectedBalance < 0) {
          setPendingTxData({
            txData,
            isEdit: !!editingTx,
            currentBalance: selectedAccount.balance,
          });
          setShowBalanceWarning(true);
          return;
        }
      }
    }

    if (editingTx) {
      updateTransaction({ ...txData, id: editingTx.id });
    } else {
      addTransaction(txData, auth.userId ?? undefined);
    }

    resetForm();
  };

  const handleProceedWithTx = () => {
    if (!pendingTxData) return;

    if (pendingTxData.isEdit && editingTx) {
      updateTransaction({ ...pendingTxData.txData, id: editingTx.id });
    } else {
      addTransaction(pendingTxData.txData, auth.userId ?? undefined);
    }

    setShowBalanceWarning(false);
    setPendingTxData(null);
    resetForm();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col gap-6 bg-[var(--section-money)]">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-4 border-[var(--border-color)] pb-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] uppercase">GLOBAL JOURNAL LEDGER</h2>
          <p className="font-mono text-xs text-[var(--text-muted)]">Real-time ledger entries, query audits, and recurring debit controllers</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-[var(--accent-danger)] text-[#000000] font-display text-xs font-bold px-4 py-2 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          style={{ cursor: 'pointer' }}
        >
          <Plus className="w-4 h-4" />
          TRANSMIT NEW ENTRY
        </button>
      </div>

      {/* FILTER & CONTROL RIG */}
      <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-4 shadow-[4px_4px_0px_var(--shadow-color)] grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--text-primary)]" />
          <input
            type="text"
            placeholder="Search descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] pl-9 pr-3 py-1.5 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)]"
          />
        </div>

        {/* TYPE FILTER */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--text-primary)] hidden sm:inline" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-1.5 font-mono text-xs outline-none"
          >
            <option value="all">ALL ENTRIES</option>
            <option value="expense">OUTFLOWS (-)</option>
            <option value="income">INFLOWS (+)</option>
          </select>
        </div>

        {/* CATEGORY FILTER */}
        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-1.5 font-mono text-xs outline-none"
          >
            <option value="all">ALL CATEGORIES</option>
            {categories.map(cat => (
              <option key={cat} value={cat.toLowerCase()}>{cat.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* VAULT FILTER */}
        <div>
          <select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-1.5 font-mono text-xs outline-none"
          >
            <option value="all">ALL VAULTS</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name.toUpperCase()}</option>
            ))}
          </select>
        </div>

      </div>

      {/* PRIMARY LEDGER TABLE */}
      <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] shadow-[6px_6px_0px_var(--shadow-color)] overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-[var(--bg-muted)] border-b-4 border-[var(--border-color)] font-mono text-xs font-bold text-[var(--text-primary)] select-none">
              <th 
                className="p-3 border-r-2 border-[var(--border-color)] cursor-pointer hover:bg-yellow-50"
                onClick={() => handleSort('date')}
              >
                <span className="flex items-center gap-1">
                  DATE {sortBy === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
                </span>
              </th>
              <th 
                className="p-3 border-r-2 border-[var(--border-color)] cursor-pointer hover:bg-yellow-50"
                onClick={() => handleSort('description')}
              >
                <span className="flex items-center gap-1">
                  DESCRIPTION {sortBy === 'description' && (sortOrder === 'asc' ? '▲' : '▼')}
                </span>
              </th>
              <th className="p-3 border-r-2 border-[var(--border-color)]">CATEGORY</th>
              <th className="p-3 border-r-2 border-[var(--border-color)]">VAULT</th>
              <th 
                className="p-3 border-r-2 border-[var(--border-color)] cursor-pointer hover:bg-yellow-50 text-right"
                onClick={() => handleSort('amount')}
              >
                <span className="flex items-center justify-end gap-1">
                  AMOUNT {sortBy === 'amount' && (sortOrder === 'asc' ? '▲' : '▼')}
                </span>
              </th>
              <th className="p-3 text-center">AUDIT ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-[var(--border-color)] font-mono text-xs">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((t) => {
                const acc = accounts.find(a => a.id === t.accountId);
                return (
                  <tr key={t.id} className="hover:bg-[var(--bg-hover)] bg-[var(--bg-surface)]">
                    {/* DATE */}
                    <td className="p-3 border-r-2 border-[var(--border-color)] whitespace-nowrap text-[var(--text-primary)]">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        {t.date}
                      </span>
                    </td>

                    {/* DESCRIPTION */}
                    <td className="p-3 border-r-2 border-[var(--border-color)]">
                      <div className="font-display font-bold text-sm text-[var(--text-primary)]">{t.description}</div>
                      {t.paymentMethodId && (() => {
                        const p = paymentMethods.find(pm => pm.id === t.paymentMethodId);
                        return (
                          <div className="mt-1">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-100 border border-[var(--border-color)] text-[9px] font-mono font-bold text-purple-700 uppercase">
                              {getPaymentMethodIcon(p?.icon)} {p?.name || 'Payment Method'}
                            </span>
                          </div>
                        );
                      })()}
                    </td>

                    {/* CATEGORY */}
                    <td className="p-3 border-r-2 border-[var(--border-color)]">
                      <span className="bg-[var(--bg-muted)] border border-[var(--border-color)] px-1.5 py-0.5 text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-wider">
                        {t.category}
                      </span>
                    </td>

                    {/* VAULT */}
                    <td className="p-3 border-r-2 border-[var(--border-color)] font-bold">
                      <span 
                        className="inline-block w-2.5 h-2.5 border border-[var(--border-color)] mr-1.5"
                        style={{ backgroundColor: acc?.color || '#000' }}
                      />
                      {acc?.name || 'Unknown'}
                    </td>

                    {/* AMOUNT */}
                    <td className={`p-3 border-r-2 border-[var(--border-color)] font-bold text-right text-sm ${
                      t.type === 'income' ? 'text-green-600' : 'text-[var(--text-primary)]'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-3 text-center flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEditModal(t)}
                        className="p-1.5 bg-[var(--accent-primary)] border border-[var(--border-color)] hover:shadow-[2px_2px_0px_var(--shadow-color)] active:translate-y-[1px] transition-all"
                        title="Edit record"
                        style={{ cursor: 'pointer' }}
                      >
                        <Pencil className="w-4 h-4 text-[var(--text-primary)]" />
                      </button>
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="p-1.5 bg-[var(--accent-danger)] border border-[var(--border-color)] hover:shadow-[2px_2px_0px_var(--shadow-color)] active:translate-y-[1px] transition-all"
                        title="Delete record"
                        style={{ cursor: 'pointer' }}
                      >
                        <Trash2 className="w-4 h-4 text-[var(--text-primary)]" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[var(--text-muted)] font-bold bg-[var(--bg-surface)] uppercase tracking-wider">
                  NO AUDITABLE DATA FOUND MATCHING FILTERS
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* RECURRING DEBIT CONTROLLER (SUBSCRIPTIONS) */}
      <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
        <div className="flex items-center gap-2 border-b-2 border-[var(--border-color)] pb-2 mb-4">
          <TrendingDown className="w-5 h-5 text-[var(--text-primary)]" />
          <h3 className="font-display text-base font-bold text-[var(--text-primary)] uppercase tracking-wider">
            RECURRING SYSTEM DRAGS (SUBSCRIPTIONS)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscriptions.map((sub) => {
            const acc = accounts.find(a => a.id === (sub.payment_account || sub.accountId));
            const svcName = sub.service_name || sub.name || '';
            const amount = sub.amount;
            const cycle = sub.billing_cycle || sub.frequency || 'monthly';
            const renewalDate = sub.renewal_date || sub.nextBillingDate || '';
            const isActive = sub.active ?? sub.isActive ?? true;

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const renewal = new Date(renewalDate);
            renewal.setHours(0, 0, 0, 0);
            const diffTime = renewal.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            let renewalLabel: string;
            let renewalColor: string;
            let renewalBg: string;
            if (diffDays < 0) {
              renewalLabel = `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
              renewalColor = 'text-red-600';
              renewalBg = 'bg-red-100';
            } else if (diffDays === 0) {
              renewalLabel = 'Renews Today';
              renewalColor = 'text-orange-600';
              renewalBg = 'bg-orange-100';
            } else if (diffDays === 1) {
              renewalLabel = 'Renews Tomorrow';
              renewalColor = 'text-orange-600';
              renewalBg = 'bg-orange-100';
            } else if (diffDays <= 7) {
              renewalLabel = `⚠ Renews in ${diffDays} days`;
              renewalColor = 'text-amber-600';
              renewalBg = 'bg-amber-100';
            } else {
              renewalLabel = `Renews in ${diffDays} days`;
              renewalColor = 'text-green-600';
              renewalBg = 'bg-green-100';
            }

            return (
              <div
                key={sub.id}
                className={`border-2 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-primary)] p-4 bg-[var(--card-bg)] shadow-[2px_2px_0px_var(--shadow-color)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_var(--shadow-color)] ${
                  isActive ? '' : 'opacity-60'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-display text-sm font-bold text-[var(--text-primary)]">
                      {svcName}
                    </h4>
                    {isActive ? (
                      <span className="font-mono text-[8px] bg-[var(--accent-success)] text-[#000000] px-1 py-0.5 font-bold border border-[var(--border-color)]">
                        🟢 ACTIVE
                      </span>
                    ) : (
                      <span className="font-mono text-[8px] bg-[var(--bg-muted)] text-[var(--text-primary)] px-1 py-0.5 font-bold border border-[var(--border-color)]">
                        ⚪ PAUSED
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px]">
                  <span className="text-[var(--text-muted)]">
                    Amount:{' '}
                    <span className="font-bold text-[var(--text-primary)]">
                      ₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/{cycle === 'yearly' ? 'yr' : 'mo'}
                    </span>
                  </span>
                  <span className="text-[var(--text-muted)]">
                    Renewal:{' '}
                    <span className="font-bold text-[var(--text-primary)]">{renewalDate}</span>
                  </span>
                  <span className="text-[var(--text-muted)] col-span-2">
                    Vault:{' '}
                    <span className="font-bold text-[var(--text-primary)]">{acc?.name || 'Direct'}</span>
                  </span>
                </div>

                <div className={`mt-2 px-1.5 py-0.5 border border-[var(--border-color)] font-mono text-[9px] font-bold ${renewalColor} ${renewalBg} inline-block`}>
                  {renewalLabel}
                </div>

                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[var(--border-color)] border-dashed">
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('open-edit-subscription', { detail: sub }));
                    }}
                    className="p-1.5 bg-[var(--accent-primary)] border border-[var(--border-color)] hover:shadow-[2px_2px_0px_var(--shadow-color)] active:translate-y-[1px] transition-all"
                    title="Edit Subscription"
                    style={{ cursor: 'pointer' }}
                  >
                    <Pencil className="w-3.5 h-3.5 text-[var(--text-primary)]" />
                  </button>
                  <button
                    onClick={() => toggleSubscriptionActive(sub.id)}
                    className={`p-1.5 border border-[var(--border-color)] flex items-center justify-center font-mono text-xs font-bold transition-all shadow-[1px_1px_0px_var(--shadow-color)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] ${
                      isActive
                        ? 'bg-[var(--card-bg)] border border-[var(--accent-primary)] text-[var(--accent-primary)]'
                        : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => deleteSubscription(sub.id)}
                    className="p-1.5 bg-[var(--accent-danger)] border border-[var(--border-color)] hover:shadow-[2px_2px_0px_var(--shadow-color)] active:translate-y-[1px] transition-all"
                    title="Delete Subscription"
                    style={{ cursor: 'pointer' }}
                  >
                    <X className="w-3.5 h-3.5 text-[var(--text-primary)]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* POPUP MODAL: TRANSMIT ENTRY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-badge)]/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[var(--bg-page)] border-4 border-[var(--border-color)] p-6 w-full max-w-md shadow-[8px_8px_0px_var(--shadow-color)] relative">
            <button 
              onClick={resetForm}
              className="absolute top-4 right-4 bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-1 hover:bg-[var(--bg-hover)] active:translate-y-[1px]"
              style={{ cursor: 'pointer' }}
            >
              <X className="w-4 h-4 text-[var(--text-primary)]" />
            </button>

            <h3 className="font-display text-lg font-bold text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 mb-4 uppercase tracking-wider">
              {editingTx ? 'EDIT TRANSACTION' : 'TRANSMIT LEDGER RECORD'}
            </h3>

            <form onSubmit={handleModalSubmit} className="flex flex-col gap-3">
              {/* TYPE TOGGLE */}
              <div className="grid grid-cols-2 gap-2 border-2 border-[var(--border-color)] p-1 bg-[var(--bg-surface)] mb-2">
                <button
                  type="button"
                  onClick={() => setNewType('expense')}
                  className={`py-1.5 font-display text-xs font-bold border border-[var(--border-color)] ${
                    newType === 'expense'
                      ? 'bg-[var(--card-bg)] border border-[var(--accent-danger)] text-[var(--accent-danger)] shadow-[1px_1px_0px_var(--shadow-color)]'
                      : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  OUTFLOW
                </button>
                <button
                  type="button"
                  onClick={() => setNewType('income')}
                  className={`py-1.5 font-display text-xs font-bold border border-[var(--border-color)] ${
                    newType === 'income'
                      ? 'bg-[var(--card-bg)] border border-[var(--accent-success)] text-[var(--accent-success)] shadow-[1px_1px_0px_var(--shadow-color)]'
                      : 'bg-[var(--bg-surface)] text-[var(--text-muted)]'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  INFLOW
                </button>
              </div>

              {/* DESC */}
              <div>
                <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">TRANSMISSION NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Supreme Box Logo Tee"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs focus:bg-[var(--bg-input-focus)] outline-none"
                  required
                />
              </div>

              {/* AMOUNT */}
              <div>
                <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">VALUE AMOUNT (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs focus:bg-[var(--bg-input-focus)] outline-none"
                  required
                />
              </div>

              {/* DATE */}
              <div>
                <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">RECORD DATE</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs focus:bg-[var(--bg-input-focus)] outline-none"
                  required
                />
              </div>

              {/* VAULT & CATEGORY */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">VAULT</label>
                  <select
                    value={newAccId}
                    onChange={(e) => setNewAccId(e.target.value)}
                    className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>

                {newType === 'expense' ? (
                  <div>
                    <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">CATEGORY</label>
                    <select
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value)}
                      className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none"
                    >
                      {categories.filter(c => c !== 'Income').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="bg-[var(--bg-muted)] border-2 border-[var(--border-color)] border-dashed p-2 flex items-center justify-center font-mono text-[10px] font-bold text-[var(--text-muted)] uppercase">
                    MAPPED TO INCOME
                  </div>
                )}
              </div>

              {/* PAYMENT METHOD */}
              <div>
                <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">PAYMENT METHOD</label>
                <select
                  value={newPmId}
                  onChange={(e) => {
                    const pmId = e.target.value;
                    setNewPmId(pmId);
                    const pm = paymentMethods.find(p => p.id === pmId);
                    if (pm && pm.accountId) {
                      setNewAccId(pm.accountId);
                    }
                  }}
                  className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)] transition-colors"
                >
                  <option value="">DIRECT FROM VAULT (CASH/NETBANKING)</option>
                  {paymentMethods.map(pm => {
                    const linkedVault = accounts.find(a => a.id === pm.accountId)?.name || 'Direct';
                    return (
                      <option key={pm.id} value={pm.id}>
                        {pm.name} ({pm.type.toUpperCase()} - {linkedVault})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* TRANSMIT ENTRY */}
              <button
                type="submit"
                className="w-full bg-[var(--accent-primary)] text-[#000000] font-display text-xs font-bold py-2.5 border-2 border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)] hover:shadow-[4px_4px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all mt-4"
                style={{ cursor: 'pointer' }}
              >
                {editingTx ? 'UPDATE LEDGER RECORD' : 'TRANSMIT LEDGER RECORD'}
              </button>
            </form>
          </div>
        </div>
      )}

      {pendingTxData && (
        <LowBalanceWarning
          isOpen={showBalanceWarning}
          onClose={() => {
            setShowBalanceWarning(false);
            setPendingTxData(null);
          }}
          onConfirm={handleProceedWithTx}
          currentBalance={pendingTxData.currentBalance}
          transactionAmount={pendingTxData.txData.amount}
          projectedBalance={pendingTxData.currentBalance - pendingTxData.txData.amount}
        />
      )}
    </div>
  );
}
