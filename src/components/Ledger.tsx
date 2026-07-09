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
  AlertTriangle
} from 'lucide-react';
import { useFinanceStore } from '../store';
import { useAuthContext } from '../providers/AuthProvider';
import { Transaction, Subscription, PaymentMethod } from '../types';

export default function Ledger() {
  const auth = useAuthContext();
  const { 
    transactions, 
    accounts, 
    subscriptions,
    paymentMethods,
    deleteTransaction,
    addTransaction,
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

    addTransaction({
      description: newDesc,
      amount: parseFloat(parseFloat(newAmount).toFixed(2)),
      category: newType === 'income' ? 'Income' : newCat,
      type: newType,
      accountId: newAccId,
      paymentMethodId: newPmId || undefined,
      date: newDate
    }, auth.userId ?? undefined);

    // Reset and close
    setNewDesc('');
    setNewAmount('');
    setNewPmId('');
    setIsModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 flex flex-col gap-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-4 border-black pb-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-black uppercase">GLOBAL JOURNAL LEDGER</h2>
          <p className="font-mono text-xs text-gray-500">Real-time ledger entries, query audits, and recurring debit controllers</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 bg-[#FF78C4] text-black font-display text-xs font-bold px-4 py-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          style={{ cursor: 'pointer' }}
        >
          <Plus className="w-4 h-4" />
          TRANSMIT NEW ENTRY
        </button>
      </div>

      {/* FILTER & CONTROL RIG */}
      <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* SEARCH BAR */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-black" />
          <input
            type="text"
            placeholder="Search descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-black pl-9 pr-3 py-1.5 font-mono text-xs outline-none focus:bg-yellow-50"
          />
        </div>

        {/* TYPE FILTER */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-black hidden sm:inline" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full bg-white border-2 border-black p-1.5 font-mono text-xs outline-none"
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
            className="w-full bg-white border-2 border-black p-1.5 font-mono text-xs outline-none"
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
            className="w-full bg-white border-2 border-black p-1.5 font-mono text-xs outline-none"
          >
            <option value="all">ALL VAULTS</option>
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.name.toUpperCase()}</option>
            ))}
          </select>
        </div>

      </div>

      {/* PRIMARY LEDGER TABLE */}
      <div className="bg-white border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-gray-100 border-b-4 border-black font-mono text-xs font-bold text-black select-none">
              <th 
                className="p-3 border-r-2 border-black cursor-pointer hover:bg-yellow-50"
                onClick={() => handleSort('date')}
              >
                <span className="flex items-center gap-1">
                  DATE {sortBy === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}
                </span>
              </th>
              <th 
                className="p-3 border-r-2 border-black cursor-pointer hover:bg-yellow-50"
                onClick={() => handleSort('description')}
              >
                <span className="flex items-center gap-1">
                  DESCRIPTION {sortBy === 'description' && (sortOrder === 'asc' ? '▲' : '▼')}
                </span>
              </th>
              <th className="p-3 border-r-2 border-black">CATEGORY</th>
              <th className="p-3 border-r-2 border-black">VAULT</th>
              <th 
                className="p-3 border-r-2 border-black cursor-pointer hover:bg-yellow-50 text-right"
                onClick={() => handleSort('amount')}
              >
                <span className="flex items-center justify-end gap-1">
                  AMOUNT {sortBy === 'amount' && (sortOrder === 'asc' ? '▲' : '▼')}
                </span>
              </th>
              <th className="p-3 text-center">AUDIT ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black font-mono text-xs">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((t) => {
                const acc = accounts.find(a => a.id === t.accountId);
                return (
                  <tr key={t.id} className="hover:bg-gray-50 bg-white">
                    {/* DATE */}
                    <td className="p-3 border-r-2 border-black whitespace-nowrap text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-500" />
                        {t.date}
                      </span>
                    </td>

                    {/* DESCRIPTION */}
                    <td className="p-3 border-r-2 border-black">
                      <div className="font-display font-bold text-sm text-black">{t.description}</div>
                      {t.paymentMethodId && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-purple-100 border border-black text-[9px] font-mono font-bold text-purple-700 uppercase">
                            💳 {paymentMethods.find(pm => pm.id === t.paymentMethodId)?.name || 'Payment Method'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* CATEGORY */}
                    <td className="p-3 border-r-2 border-black">
                      <span className="bg-gray-100 border border-black px-1.5 py-0.5 text-[10px] font-bold text-gray-700 uppercase tracking-wider">
                        {t.category}
                      </span>
                    </td>

                    {/* VAULT */}
                    <td className="p-3 border-r-2 border-black font-bold">
                      <span 
                        className="inline-block w-2.5 h-2.5 border border-black mr-1.5"
                        style={{ backgroundColor: acc?.color || '#000' }}
                      />
                      {acc?.name || 'Unknown'}
                    </td>

                    {/* AMOUNT */}
                    <td className={`p-3 border-r-2 border-black font-bold text-right text-sm ${
                      t.type === 'income' ? 'text-green-600' : 'text-black'
                    }`}>
                      {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => deleteTransaction(t.id)}
                        className="p-1.5 bg-[#FF9F9F] border border-black hover:bg-red-400 active:translate-y-[1px] transition-all"
                        title="Delete record"
                        style={{ cursor: 'pointer' }}
                      >
                        <Trash2 className="w-4 h-4 text-black" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 font-bold bg-white uppercase tracking-wider">
                  NO AUDITABLE DATA FOUND MATCHING FILTERS
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* RECURRING DEBIT CONTROLLER (SUBSCRIPTIONS) */}
      <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-2 border-b-2 border-black pb-2 mb-4">
          <TrendingDown className="w-5 h-5 text-black" />
          <h3 className="font-display text-base font-bold text-black uppercase tracking-wider">
            RECURRING SYSTEM DRAGS (SUBSCRIPTIONS)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subscriptions.map((sub) => {
            const acc = accounts.find(a => a.id === sub.accountId);
            return (
              <div 
                key={sub.id} 
                className={`border-2 border-black p-4 flex items-center justify-between shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-all ${
                  sub.isActive ? 'bg-[#FFE2E2]' : 'bg-gray-100 opacity-60'
                }`}
              >
                <div>
                  <h4 className="font-display text-sm font-bold text-black flex items-center gap-1.5">
                    {sub.name}
                    {!sub.isActive && (
                      <span className="font-mono text-[8px] bg-black text-white px-1 py-0.2">
                        PAUSED
                      </span>
                    )}
                  </h4>
                  <p className="font-mono text-[10px] text-gray-600 mt-1">
                    Debit: <span className="font-bold">₹{sub.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {sub.frequency}</span>
                  </p>
                  <p className="font-mono text-[9px] text-gray-500 mt-0.5">
                    Next billing: {sub.nextBillingDate} ({acc?.name})
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* TOGGLE ACTIVE */}
                  <button
                    onClick={() => toggleSubscriptionActive(sub.id)}
                    className={`p-2 border-2 border-black flex items-center justify-center font-mono text-xs font-bold transition-all shadow-[1px_1px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] ${
                      sub.isActive 
                        ? 'bg-[#FFDE4D] text-black' 
                        : 'bg-green-400 text-black'
                    }`}
                    style={{ cursor: 'pointer' }}
                  >
                    {sub.isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  {/* DELETION */}
                  <button
                    onClick={() => deleteSubscription(sub.id)}
                    className="p-2 bg-[#FF9F9F] border-2 border-black flex items-center justify-center shadow-[1px_1px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
                    style={{ cursor: 'pointer' }}
                  >
                    <X className="w-3.5 h-3.5 text-black" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* POPUP MODAL: TRANSMIT ENTRY */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-[#FAF6F0] border-4 border-black p-6 w-full max-w-md shadow-[8px_8px_0px_rgba(0,0,0,1)] relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 bg-white border-2 border-black p-1 hover:bg-gray-100 active:translate-y-[1px]"
              style={{ cursor: 'pointer' }}
            >
              <X className="w-4 h-4 text-black" />
            </button>

            <h3 className="font-display text-lg font-bold text-black border-b-2 border-black pb-2 mb-4 uppercase tracking-wider">
              TRANSMIT LEDGER RECORD
            </h3>

            <form onSubmit={handleModalSubmit} className="flex flex-col gap-3">
              {/* TYPE TOGGLE */}
              <div className="grid grid-cols-2 gap-2 border-2 border-black p-1 bg-white mb-2">
                <button
                  type="button"
                  onClick={() => setNewType('expense')}
                  className={`py-1.5 font-display text-xs font-bold border border-black ${
                    newType === 'expense'
                      ? 'bg-[#FF9F9F] text-black shadow-[1px_1px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-gray-400'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  OUTFLOW
                </button>
                <button
                  type="button"
                  onClick={() => setNewType('income')}
                  className={`py-1.5 font-display text-xs font-bold border border-black ${
                    newType === 'income'
                      ? 'bg-[#9DF1DF] text-black shadow-[1px_1px_0px_rgba(0,0,0,1)]'
                      : 'bg-white text-gray-400'
                  }`}
                  style={{ cursor: 'pointer' }}
                >
                  INFLOW
                </button>
              </div>

              {/* DESC */}
              <div>
                <label className="font-mono text-[10px] font-bold text-black block mb-1">TRANSMISSION NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Supreme Box Logo Tee"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2 font-mono text-xs focus:bg-yellow-50 outline-none"
                  required
                />
              </div>

              {/* AMOUNT */}
              <div>
                <label className="font-mono text-[10px] font-bold text-black block mb-1">VALUE AMOUNT (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2 font-mono text-xs focus:bg-yellow-50 outline-none"
                  required
                />
              </div>

              {/* DATE */}
              <div>
                <label className="font-mono text-[10px] font-bold text-black block mb-1">RECORD DATE</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2 font-mono text-xs focus:bg-yellow-50 outline-none"
                  required
                />
              </div>

              {/* VAULT & CATEGORY */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-mono text-[10px] font-bold text-black block mb-1">VAULT</label>
                  <select
                    value={newAccId}
                    onChange={(e) => setNewAccId(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>

                {newType === 'expense' ? (
                  <div>
                    <label className="font-mono text-[10px] font-bold text-black block mb-1">CATEGORY</label>
                    <select
                      value={newCat}
                      onChange={(e) => setNewCat(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none"
                    >
                      {categories.filter(c => c !== 'Income').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="bg-gray-100 border-2 border-black border-dashed p-2 flex items-center justify-center font-mono text-[10px] font-bold text-gray-500 uppercase">
                    MAPPED TO INCOME
                  </div>
                )}
              </div>

              {/* PAYMENT METHOD */}
              <div>
                <label className="font-mono text-[10px] font-bold text-black block mb-1">PAYMENT METHOD</label>
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
                  className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-yellow-50 transition-colors"
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
                className="w-full bg-[#FFDE4D] text-black font-display text-xs font-bold py-2.5 border-2 border-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all mt-4"
                style={{ cursor: 'pointer' }}
              >
                TRANSMIT LEDGER RECORD
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
