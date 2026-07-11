/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useAuthContext } from '../providers/AuthProvider';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  Sparkles, 
  Flame, 
  ShieldAlert, 
  Zap, 
  User, 
  Plus, 
  TrendingUp, 
  CheckCircle2,
  Terminal,
  AlertTriangle,
  Shield,
  Trash2,
  Lock,
  Edit3,
  Target,
  X
} from 'lucide-react';
import { useFinanceStore } from '../store';
import type { Budget, PaymentMethod } from '../types';
import { getPaymentMethodIcon } from '../lib/paymentMethodIcons';

export default function Settings() {
  const auth = useAuthContext();
  const { 
    preferences, 
    achievements, 
    accounts,
    paymentMethods,
    budgets,
    updatePreferences, 
    addAccount,
    addPaymentMethod,
    deletePaymentMethod,
    updatePaymentMethod,
    deleteAccount,
    addBudget,
    updateBudget,
    deleteBudget
  } = useFinanceStore();

  const [notification, setNotification] = useState<string | null>(null);

  // Settings form states
  const [name, setName] = useState(preferences.name);
  const [savingsGoal, setSavingsGoal] = useState(preferences.monthlySavingsGoal.toString());
  const [threshold, setThreshold] = useState(preferences.categoryThreshold.toString());
  const [reminderEnabled, setReminderEnabled] = useState(preferences.reminderEnabled ?? true);
  const [reminderTime, setReminderTime] = useState(preferences.reminderTime ?? '21:30');

  // Account creation form states
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<'bank' | 'cash' | 'investment' | 'credit' | 'asset' | 'liability'>('bank');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccColor, setNewAccColor] = useState('#38BDF8');
  const [newAccIcon, setNewAccIcon] = useState('Landmark');

  // Payment Method form states
  const [newPmName, setNewPmName] = useState('');
  const [newPmType, setNewPmType] = useState<'upi' | 'debit' | 'credit' | 'cash' | 'netbanking'>('upi');
  const [newPmAccountId, setNewPmAccountId] = useState(accounts[0]?.id || '');
  const [newPmColor, setNewPmColor] = useState('#C084FC');
  const [newPmIcon, setNewPmIcon] = useState('Smartphone');
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);

  // Budget Management state
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetCategory, setBudgetCategory] = useState('Food & Dining');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [budgetPeriod, setBudgetPeriod] = useState<'monthly' | 'weekly'>('monthly');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const colorPresets = [
    { value: '#38BDF8', label: 'Sky Blue' },
    { value: '#4ADE80', label: 'Neon Green' },
    { value: '#F43F5E', label: 'Rose Red' },
    { value: '#FB923C', label: 'Orange' },
    { value: '#C084FC', label: 'Purple' },
    { value: '#FCD34D', label: 'Yellow' }
  ];

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferences({
      name,
      monthlySavingsGoal: Number(savingsGoal) || 50000,
      categoryThreshold: Number(threshold) || 80,
      reminderEnabled,
      reminderTime
    });
    triggerNotification('SYSTEM CONFIGURATION RE-ALIGNED SUCCESSFULLY.');
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccName || !newAccBalance || isNaN(Number(newAccBalance))) return;

    if (!auth.userId) {
      console.error("No authenticated user found");
      return;
    }

    await addAccount(
      {
        name: newAccName,
        type: newAccType,
        balance: parseFloat(parseFloat(newAccBalance).toFixed(2)),
        color: newAccColor,
        icon: newAccIcon
      },
      auth.userId
    );

    setNewAccName('');
    setNewAccBalance('');
    triggerNotification(`NEW VAULT "${newAccName.toUpperCase()}" ADDED TO COMMON CENTS INDEX.`);
  };

  const handleEditPaymentMethod = (pm: PaymentMethod) => {
    setEditingPaymentMethod(pm);
    setNewPmName(pm.name);
    setNewPmType(pm.type);
    setNewPmAccountId(pm.accountId);
    setNewPmColor(pm.color);
    setNewPmIcon(pm.icon);
  };

  const handlePaymentMethodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPmName) return;

    const targetAccountId = newPmAccountId || (accounts[0]?.id || '');
    if (!targetAccountId) {
      triggerNotification('ERROR: SELECT OR CREATE A VALID VAULT ACCOUNT FIRST.');
      return;
    }

    if (editingPaymentMethod) {
      updatePaymentMethod({
        id: editingPaymentMethod.id,
        name: newPmName,
        type: newPmType,
        accountId: targetAccountId,
        color: newPmColor,
        icon: newPmIcon,
      });
      triggerNotification(`PAYMENT METHOD "${newPmName.toUpperCase()}" UPDATED SUCCESSFULLY.`);
      setEditingPaymentMethod(null);
    } else {
      addPaymentMethod({
        name: newPmName,
        type: newPmType,
        accountId: targetAccountId,
        color: newPmColor,
        icon: newPmIcon
      }, auth.userId ?? undefined);
      triggerNotification(`NEW PAYMENT METHOD "${newPmName.toUpperCase()}" INSTANTIATED.`);
    }

    setNewPmName('');
  };

  const handleCancelEditPaymentMethod = () => {
    setEditingPaymentMethod(null);
    setNewPmName('');
    setNewPmType('upi');
    setNewPmAccountId(accounts[0]?.id || '');
    setNewPmColor('#C084FC');
    setNewPmIcon('Smartphone');
  };

  const budgetCategories = [
    'Food & Dining',
    'Entertainment',
    'Housing',
    'Shopping',
    'Transport',
    'Utilities',
    'Travel',
    'Other'
  ];

  const getProgressColor = (ratio: number) => {
    if (ratio > 1) return '#FF6B6B';
    if (ratio > 0.8) return '#FB923C';
    if (ratio > 0.6) return '#FFDE4D';
    return '#4ADE80';
  };

  const getCategoryEmoji = (cat: string) => {
    const map: Record<string, string> = {
      'Food & Dining': '🍔',
      'Entertainment': '🎬',
      'Housing': '🏠',
      'Shopping': '🛍️',
      'Transport': '🚗',
      'Utilities': '💡',
      'Travel': '✈️',
      'Other': '📦'
    };
    return map[cat] || '📦';
  };

  const openAddBudget = () => {
    setEditingBudget(null);
    setBudgetCategory('Food & Dining');
    setBudgetLimit('');
    setBudgetPeriod('monthly');
    setShowBudgetModal(true);
  };

  const openEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetCategory(budget.category);
    setBudgetLimit(budget.limit.toString());
    setBudgetPeriod(budget.period);
    setShowBudgetModal(true);
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedLimit = parseFloat(budgetLimit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      triggerNotification('ERROR: VALID POSITIVE LIMIT AMOUNT REQUIRED.');
      return;
    }

    if (editingBudget) {
      await updateBudget({
        ...editingBudget,
        category: budgetCategory,
        limit: parsedLimit,
        period: budgetPeriod,
      });
      triggerNotification(`BUDGET "${budgetCategory.toUpperCase()}" UPDATED SUCCESSFULLY.`);
    } else {
      await addBudget({
        category: budgetCategory,
        limit: parsedLimit,
        spent: 0,
        period: budgetPeriod,
      }, auth.userId ?? undefined);
      triggerNotification(`NEW BUDGET "${budgetCategory.toUpperCase()}" ADDED SUCCESSFULLY.`);
    }

    setShowBudgetModal(false);
  };

  const handleDeleteBudget = async () => {
    if (!deleteConfirmId) return;
    await deleteBudget(deleteConfirmId);
    triggerNotification('BUDGET REMOVED FROM INDEX.');
    setDeleteConfirmId(null);
  };

  const getAchievementIcon = (iconName: string, active: boolean) => {
    const cls = `w-8 h-8 ${active ? 'text-black' : 'text-gray-400'}`;
    switch (iconName) {
      case 'Sparkles': return <Sparkles className={cls} />;
      case 'Flame': return <Flame className={cls} />;
      case 'ShieldAlert': return <ShieldAlert className={cls} />;
      case 'Zap': return <Zap className={cls} />;
      default: return <Sparkles className={cls} />;
    }
  };

  return (
    <><div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* HEADER SECTION */}
      <div className="lg:col-span-12 flex flex-col gap-4 border-b-4 border-black pb-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="bg-black p-2 border border-white">
            <SettingsIcon className="w-6 h-6 text-[#FFDE4D]" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-black uppercase">SYSTEM SHELL SETTINGS</h2>
            <p className="font-mono text-xs text-gray-500">Align global terminal limits, mount new vaults, and view system medals</p>
          </div>
        </div>

        {/* NOTIFICATION BANNER */}
        {notification && (
          <div className="bg-[#4ADE80] border-2 border-black p-3 font-mono text-xs font-bold text-black shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-bounce">
            [SYS_ALERT]: {notification}
          </div>
        )}
      </div>

      {/* LEFT COLUMN: GLOBAL PREFERENCES & ACCOUNT MOUNTING (7 SPAN) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* GLOBAL SHELL PREFERENCES */}
        <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <h3 className="font-display text-base font-bold text-black border-b-2 border-black pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-black" />
            GLOBAL CORE PREFERENCES
          </h3>

          <form onSubmit={handleSettingsSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] font-bold text-black block mb-1">OPERATOR ALIAS</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-yellow-50"
                  required
                />
              </div>

              <div>
                <label className="font-mono text-[10px] font-bold text-black block mb-1">MONTHLY SAVINGS TARGET (₹)</label>
                <input
                  type="number"
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-yellow-50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] font-bold text-black block mb-1">
                VELOCITY WARN THRESHOLD (%) - Current: {threshold}%
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-none border-2 border-black appearance-none cursor-pointer accent-black"
              />
              <span className="font-mono text-[9px] text-gray-500 block mt-1">
                Trigger dynamic red alerts inside budget meters when expenditures exceed this percentage limit.
              </span>
            </div>

            {/* DAILY TRANSACTION REMINDER SECTION */}
            <div className="border-2 border-black p-3 bg-gray-50 mt-1">
              <span className="font-mono text-[10px] font-bold text-black uppercase tracking-wider block mb-2 border-b border-black pb-1">
                📅 Daily Transaction Reminder
              </span>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                    className="w-4 h-4 bg-white border-2 border-black rounded-none appearance-none checked:bg-[#FF6B6B] checked:border-2 text-black cursor-pointer flex items-center justify-center relative checked:after:content-['✓'] checked:after:text-black checked:after:font-bold checked:after:text-xs"
                  />
                  <span className="font-mono text-xs font-bold text-black select-none">Enable Daily Reminder</span>
                </label>
                
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-black">REMINDER TIME:</span>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    disabled={!reminderEnabled}
                    className="bg-white border-2 border-black p-1 font-mono text-xs outline-none focus:bg-yellow-50 disabled:bg-gray-200 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* TEST PROMPT TRIGGER BUTTON */}
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-dashed border-gray-400">
                <span className="font-mono text-[9px] text-gray-500">
                  Receive a playful nudge if 0 transactions are logged for the day.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('trigger-test-reminder'));
                    triggerNotification('TEST REMINDER POPUP ENGAGED.');
                  }}
                  className="px-2 py-1 bg-[#4D96FF] text-black font-mono text-[9px] font-bold border-2 border-black shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#3b82f6] cursor-pointer"
                >
                  TEST REMINDER POPUP
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#FF78C4] text-black font-display text-xs font-bold px-4 py-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[#ff62b8] self-start"
              style={{ cursor: 'pointer' }}
            >
              SAVE CORE CONFIG
            </button>
          </form>
        </div>

        {/* VAULT MOUNT BOARD (ADD ACCOUNTS) */}
        <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <h3 className="font-display text-base font-bold text-black border-b-2 border-black pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Plus className="w-4 h-4 text-black" />
            MOUNT NEW VAULT INDEX
          </h3>

          <form onSubmit={handleAccountSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] font-bold text-black block mb-1">DISPLAY NAME</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Savings, Wallet Cash"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-yellow-50"
                  required
                />
              </div>

              <div>
                <label className="font-mono text-[10px] font-bold text-black block mb-1">OPENING BALANCE (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newAccBalance}
                  onChange={(e) => setNewAccBalance(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-yellow-50"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* ACC TYPE */}
              <div>
                <label className="font-mono text-[10px] font-bold text-black block mb-1">TYPE CLASSIFICATION</label>
                <select
                  value={newAccType}
                  onChange={(e) => setNewAccType(e.target.value as any)}
                  className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none"
                >
                  <option value="bank">BANK ACCOUNT</option>
                  <option value="cash">CASH</option>
                  <option value="investment">INVESTMENT</option>
                  <option value="credit">CREDIT CARD</option>
                  <option value="asset">ASSET</option>
                  <option value="liability">LIABILITY</option>
                </select>
              </div>

              {/* ICON CHOICE */}
              <div>
                <label className="font-mono text-[10px] font-bold text-black block mb-1">SHELL ICON</label>
                <select
                  value={newAccIcon}
                  onChange={(e) => setNewAccIcon(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none"
                >
                  <option value="Landmark">LANDMARK / BANK</option>
                  <option value="TrendingUp">TRENDING / TRADING</option>
                  <option value="Coins">COINS / STACK</option>
                  <option value="CreditCard">CARD / DEBIT</option>
                </select>
              </div>

              {/* COLOR PRESETS */}
              <div>
                <label className="font-mono text-[10px] font-bold text-black block mb-1">COLOR PALETTE</label>
                <select
                  value={newAccColor}
                  onChange={(e) => setNewAccColor(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none"
                >
                  {colorPresets.map(c => (
                    <option key={c.value} value={c.value}>{c.label.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="bg-[#A5F3FC] text-black font-display text-xs font-bold px-4 py-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[#83ebfa] self-start"
              style={{ cursor: 'pointer' }}
            >
              MOUNT SYSTEM VAULT
            </button>
          </form>
        </div>

        {/* MOUNT / EDIT PAYMENT METHOD */}
        <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <h3 className="font-display text-base font-bold text-black border-b-2 border-black pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
            {editingPaymentMethod ? <Edit3 className="w-4 h-4 text-black" /> : <Plus className="w-4 h-4 text-black" />}
            {editingPaymentMethod ? 'EDIT PAYMENT METHOD' : 'MOUNT NEW PAYMENT METHOD'}
            {editingPaymentMethod && (
              <span className="ml-auto font-mono text-[9px] bg-black text-white px-2 py-0.5">EDITING: {editingPaymentMethod.name.toUpperCase()}</span>
            )}
          </h3>

          <form onSubmit={handlePaymentMethodSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] font-bold text-black block mb-1">DISPLAY NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Google Pay, HDFC Debit Card"
                  value={newPmName}
                  onChange={(e) => setNewPmName(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-yellow-50"
                  required
                />
              </div>

              <div>
                <label className="font-mono text-[10px] font-bold text-black block mb-1">PAYMENT TYPE</label>
                <select
                  value={newPmType}
                  onChange={(e) => setNewPmType(e.target.value as any)}
                  className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none"
                >
                  <option value="upi">UPI</option>
                  <option value="debit">DEBIT CARD</option>
                  <option value="credit">CREDIT CARD</option>
                  <option value="cash">CASH</option>
                  <option value="netbanking">NET BANKING</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="font-mono text-[10px] font-bold text-black block mb-1">LINKED VAULT</label>
                <select
                  value={newPmAccountId}
                  onChange={(e) => setNewPmAccountId(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none"
                  required
                >
                  <option value="">-- SELECT VAULT --</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.type.toUpperCase()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono text-[10px] font-bold text-black block mb-1">SHELL ICON</label>
                <select
                  value={newPmIcon}
                  onChange={(e) => setNewPmIcon(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none"
                >
                  <option value="Smartphone">SMARTPHONE / UPI</option>
                  <option value="CreditCard">CREDIT CARD</option>
                  <option value="Coins">COINS / CASH</option>
                  <option value="Landmark">LANDMARK / NET BANKING</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-[10px] font-bold text-black block mb-1">COLOR PALETTE</label>
                <select
                  value={newPmColor}
                  onChange={(e) => setNewPmColor(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none"
                >
                  {colorPresets.map(c => (
                    <option key={c.value} value={c.value}>{c.label.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start">
              {editingPaymentMethod && (
                <button
                  type="button"
                  onClick={handleCancelEditPaymentMethod}
                  className="bg-white text-black font-display text-xs font-bold px-4 py-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-gray-100"
                  style={{ cursor: 'pointer' }}
                >
                  CANCEL
                </button>
              )}
              <button
                type="submit"
                className="bg-[#C084FC] text-black font-display text-xs font-bold px-4 py-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[#a855f7]"
                style={{ cursor: 'pointer' }}
              >
                {editingPaymentMethod ? 'SAVE PAYMENT METHOD' : 'MOUNT PAYMENT METHOD'}
              </button>
            </div>
          </form>
        </div>

        {/* ACTIVE PAYMENT METHODS INDEX */}
        <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <h3 className="font-display text-base font-bold text-black border-b-2 border-black pb-2 mb-3 uppercase tracking-wider flex items-center justify-between">
            <span>ACTIVE PAYMENT METHODS</span>
            <span className="bg-black text-white px-2 py-0.5 text-xs font-mono">{paymentMethods.length}</span>
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {paymentMethods.length === 0 ? (
              <p className="font-mono text-[11px] text-gray-500 py-2">No payment methods mounted yet. Use the tool above.</p>
            ) : (
              paymentMethods.map(pm => {
                const linkedVault = accounts.find(a => a.id === pm.accountId)?.name || 'Direct';
                return (
                  <div 
                    key={pm.id} 
                    className="border-2 border-black px-3 py-2 flex items-center justify-between gap-3 shadow-[2px_2px_0px_rgba(0,0,0,1)] text-xs font-mono font-bold"
                    style={{ backgroundColor: pm.color || '#E9D5FF' }}
                  >
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(pm.icon)}
                      <div>
                        <span className="text-black font-bold">{pm.name}</span>
                        <span className="block text-[9px] text-gray-600 font-normal">Vault: {linkedVault}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleEditPaymentMethod(pm)}
                        className="text-black hover:text-blue-600 p-0.5"
                        title="Edit Payment Method"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => deletePaymentMethod(pm.id)}
                        className="text-black hover:text-red-600 p-0.5"
                        title="Dismount Payment Method"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 🎯 BUDGET MANAGEMENT */}
        <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <h3 className="font-display text-base font-bold text-black border-b-2 border-black pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-black" />
            🎯 Budget Management
          </h3>

          <button
            onClick={openAddBudget}
            className="w-full bg-[#A5F3FC] text-black font-display text-xs font-bold px-4 py-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[#83ebfa] mb-4 flex items-center justify-center gap-2"
            style={{ cursor: 'pointer' }}
          >
            <Plus className="w-4 h-4" />
            ADD BUDGET
          </button>

          {budgets.length === 0 ? (
            <div className="border-2 border-black p-6 bg-gray-50 text-center flex flex-col items-center gap-3">
              <span className="text-3xl">🎯</span>
              <p className="font-display text-base font-bold text-black">No budgets created yet.</p>
              <p className="font-mono text-[11px] text-gray-500">Create category budgets to track your spending.</p>
              <button
                onClick={openAddBudget}
                className="bg-[#FFDE4D] text-black font-display text-xs font-bold px-4 py-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-yellow-400"
                style={{ cursor: 'pointer' }}
              >
                CREATE BUDGET
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {budgets.map(budget => {
                const pct = Math.min(budget.limit > 0 ? (budget.spent / budget.limit) * 100 : 0, 100);
                const remaining = budget.limit - budget.spent;
                return (
                  <div key={budget.id} className="border-2 border-black p-3 flex flex-col gap-2 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryEmoji(budget.category)}</span>
                        <span className="font-display text-sm font-bold text-black">{budget.category}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[9px] bg-black text-white px-1.5 py-0.5 font-bold">{budget.period.toUpperCase()}</span>
                        <button
                          onClick={() => openEditBudget(budget)}
                          className="p-1 border border-black hover:bg-gray-100 transition-colors"
                          title="Edit Budget"
                          style={{ cursor: 'pointer' }}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(budget.id)}
                          className="p-1 border border-black hover:bg-red-100 transition-colors"
                          title="Delete Budget"
                          style={{ cursor: 'pointer' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-3 border-2 border-black bg-gray-100">
                      <motion.div
                        className="h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        style={{ backgroundColor: getProgressColor(budget.limit > 0 ? budget.spent / budget.limit : 0) }}
                      />
                    </div>
                    <div className="flex items-center justify-between font-mono text-xs">
                      <span className="font-bold">
                        ₹{budget.spent.toLocaleString('en-IN')} / ₹{budget.limit.toLocaleString('en-IN')}
                      </span>
                      <span className={remaining >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                        Remaining ₹{Math.abs(remaining).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PRIVACY PROTECTION STATUS */}
        <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <h3 className="font-display text-base font-bold text-black border-b-2 border-black pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#FB923C]" />
            🔒 PRIVACY MODE
          </h3>
          <div className="font-mono text-xs text-black leading-relaxed flex flex-col gap-3">
            <p>
              Common Cents operates with standard sandbox local-first principles. Your raw sensitive banking keys never touch our index servers.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-black bg-green-50 p-2.5 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <span className="font-bold text-green-700 block mb-1">✓ STORES:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[10px] text-gray-700">
                  <li>display names</li>
                  <li>balances</li>
                  <li>categories</li>
                  <li>transaction history</li>
                  <li>payment methods</li>
                </ul>
              </div>
              <div className="border-2 border-black bg-red-50 p-2.5 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                <span className="font-bold text-red-700 block mb-1">✗ NEVER STORES:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[10px] text-gray-700">
                  <li>bank account numbers</li>
                  <li>UPI IDs</li>
                  <li>card numbers</li>
                  <li>IFSC codes</li>
                  <li>banking credentials</li>
                  <li>passwords</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: MEDALS / ACHIEVEMENTS GRID (5 SPAN) */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        
        {/* GAMIFIED MEDALS / ACHIEVEMENTS */}
        <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
          <h3 className="font-display text-base font-bold text-black border-b-2 border-black pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-black animate-pulse" />
            SYSTEM ACHIEVEMENTS LOG
          </h3>

          <div className="flex flex-col gap-4">
            {achievements.map((ach) => (
              <div 
                key={ach.id}
                className={`border-2 border-black p-3.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-start gap-3.5 transition-all ${
                  ach.isUnlocked 
                    ? 'bg-[#E1FFC2]' 
                    : 'bg-gray-50 border-dashed opacity-50'
                }`}
              >
                {/* ICON */}
                <div className={`p-2 border-2 border-black rounded-none ${ach.isUnlocked ? 'bg-[#4ADE80]' : 'bg-gray-200'}`}>
                  {getAchievementIcon(ach.icon, ach.isUnlocked)}
                </div>

                {/* DETAILS */}
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-xs font-bold text-black uppercase">{ach.title}</h4>
                    <span className="font-mono text-[9px] bg-black text-white px-1.5 py-0.2 font-bold">
                      +{ach.points} PTS
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-gray-600 mt-1">{ach.description}</p>
                  
                  {ach.isUnlocked && ach.unlockedAt && (
                    <div className="flex items-center gap-1 mt-2 text-[9px] font-mono text-green-700 font-bold">
                      <CheckCircle2 className="w-3 h-3 text-green-700" />
                      <span>UNLOCKED: {ach.unlockedAt}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECRETS AND CONFIGURATION RIG */}
        <div className="bg-zinc-900 border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)] text-[#39FF14] font-mono text-xs">
          <div className="flex items-center gap-2 border-b border-[#39FF14] pb-2 mb-3 text-white">
            <Terminal className="w-4 h-4 text-[#39FF14]" />
            <span className="font-display font-bold uppercase tracking-wider">SHELL ENVIRO RIG</span>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-white font-bold">[NODE_STATUS] DISK SAFE</p>
            <p className="text-[#39FF14]">&gt; HMR: DISABLED</p>
            <p className="text-[#39FF14]">&gt; ENGINE: TSX + ESBUILD</p>
            <p className="text-[#39FF14]">&gt; GEMINI CLIENT: ACTIVE</p>
            <p className="text-[#39FF14]">&gt; SYSTEM STORAGE: LOCALSTORAGE_DRIVE</p>
            <div className="bg-zinc-800 p-2 text-[9px] leading-relaxed mt-2 text-white border border-[#39FF14] border-dashed">
              <span className="font-bold text-[#39FF14]">ALERT:</span> All secrets and LLM variables can be configured using AI Studio's top Secrets panel. Exposing client-side tokens is prohibited by policy.
            </div>
          </div>
        </div>

      </div>

    </div>

      {/* ADD / EDIT BUDGET MODAL */}
      <AnimatePresence>
        {showBudgetModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBudgetModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-md w-full relative z-[110]"
            >
              <div className="border-b-4 border-black pb-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  <h3 className="font-display text-xl font-black text-black uppercase tracking-tight">
                    {editingBudget ? 'EDIT BUDGET' : 'ADD BUDGET'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowBudgetModal(false)}
                  className="p-1 bg-black text-white hover:bg-zinc-800 border-2 border-black transition-colors"
                  style={{ cursor: 'pointer' }}
                >
                  <X className="w-4 h-4 stroke-[2.5px]" />
                </button>
              </div>

              <form onSubmit={handleBudgetSubmit} className="space-y-4">
                <div>
                  <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                    CATEGORY INDEX
                  </label>
                  <select
                    value={budgetCategory}
                    onChange={(e) => setBudgetCategory(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                  >
                    {budgetCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                    LIMIT AMOUNT (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                    className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                    BUDGET PERIOD
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBudgetPeriod('monthly')}
                      className={`py-2 border-2 border-black font-mono text-[10px] font-bold transition-all shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none ${
                        budgetPeriod === 'monthly' ? 'bg-[#FFDE4D] text-black' : 'bg-white text-gray-700'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      MONTHLY
                    </button>
                    <button
                      type="button"
                      onClick={() => setBudgetPeriod('weekly')}
                      className={`py-2 border-2 border-black font-mono text-[10px] font-bold transition-all shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none ${
                        budgetPeriod === 'weekly' ? 'bg-[#FFDE4D] text-black' : 'bg-white text-gray-700'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      WEEKLY
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBudgetModal(false)}
                    className="w-1/2 bg-white hover:bg-gray-50 border-2 border-black py-2.5 font-mono text-xs font-bold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all"
                    style={{ cursor: 'pointer' }}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-[#A5F3FC] hover:bg-cyan-400 border-2 border-black py-2.5 font-mono text-xs font-bold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all"
                    style={{ cursor: 'pointer' }}
                  >
                    {editingBudget ? 'SAVE BUDGET' : 'ADD BUDGET'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE BUDGET CONFIRMATION */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-md w-full relative z-[110]"
            >
              <div className="border-b-4 border-black pb-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🗑️</span>
                  <h3 className="font-display text-xl font-black text-black uppercase tracking-tight">
                    DELETE BUDGET
                  </h3>
                </div>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="p-1 bg-black text-white hover:bg-zinc-800 border-2 border-black transition-colors"
                  style={{ cursor: 'pointer' }}
                >
                  <X className="w-4 h-4 stroke-[2.5px]" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="font-mono text-sm font-bold text-black">
                  Delete this budget?
                </p>
                <p className="font-mono text-[11px] text-gray-600">
                  This will NOT delete any transactions.
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(null)}
                    className="w-1/2 bg-white hover:bg-gray-50 border-2 border-black py-2.5 font-mono text-xs font-bold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all"
                    style={{ cursor: 'pointer' }}
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteBudget}
                    className="w-1/2 bg-[#FF6B6B] hover:bg-red-400 border-2 border-black py-2.5 font-mono text-xs font-bold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all"
                    style={{ cursor: 'pointer' }}
                  >
                    DELETE
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
