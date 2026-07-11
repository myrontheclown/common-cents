/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  X, 
  TrendingDown, 
  TrendingUp, 
  Target, 
  RefreshCw,
  Sparkles,
  Check,
  CreditCard
} from 'lucide-react';
import { useFinanceStore } from '../store';
import { useAuthContext } from '../providers/AuthProvider';
import type { Goal, Subscription } from '../types';

type ModalType = 'expense' | 'income' | 'goal' | 'transfer' | 'subscription' | 'payment_method' | null;

export default function FloatingHub() {
  const auth = useAuthContext();
  const { accounts, paymentMethods, addTransaction, addGoal, updateGoal, addSubscription, updateSubscription, addPaymentMethod } = useFinanceStore();
  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    const handleOpenAdd = () => {
      openModal('expense');
    };
    window.addEventListener('open-add-transaction', handleOpenAdd);
    return () => window.removeEventListener('open-add-transaction', handleOpenAdd);
  }, [accounts]);

  React.useEffect(() => {
    const handleEditGoal = (e: Event) => {
      const goal = (e as CustomEvent).detail as Goal;
      setEditingGoal(goal);
      setGoalName(goal.name);
      setGoalTarget(String(goal.targetAmount));
      setGoalCurrentAmount(String(goal.currentAmount));
      setGoalDeadline(goal.deadline);
      setGoalStatus(goal.status);
      setError(null);
      setActiveModal('goal');
    };
    window.addEventListener('open-edit-goal', handleEditGoal);
    return () => window.removeEventListener('open-edit-goal', handleEditGoal);
  }, []);

  React.useEffect(() => {
    const handleEditSubscription = (e: Event) => {
      const sub = (e as CustomEvent).detail as Subscription;
      setEditingSubscription(sub);
      setSubServiceName(sub.service_name || sub.name || '');
      setSubAmount(String(sub.amount));
      setSubBillingCycle(sub.billing_cycle === 'yearly' ? 'yearly' : 'monthly');
      setSubCategory(sub.category || 'Utilities');
      setSubPaymentAccount(sub.payment_account || sub.accountId || accounts[0]?.id || '');
      setSubRenewalDate(sub.renewal_date || sub.nextBillingDate || '');
      setSubAutoDebit(sub.auto_debit ?? true);
      setSubIcon(sub.icon || 'CreditCard');
      setSubColor(sub.color || '#C084FC');
      setError(null);
      setActiveModal('subscription');
    };
    window.addEventListener('open-edit-subscription', handleEditSubscription);
    return () => window.removeEventListener('open-edit-subscription', handleEditSubscription);
  }, [accounts]);

  // Form States
  // Expense/Income
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [paymentMethodId, setPaymentMethodId] = useState('');

  // Goal
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalCurrentAmount, setGoalCurrentAmount] = useState('');
  const [goalStatus, setGoalStatus] = useState<'active' | 'completed' | 'paused'>('active');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  // Transfer
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');

  // Subscription Form States
  const [subServiceName, setSubServiceName] = useState('');
  const [subAmount, setSubAmount] = useState('');
  const [subBillingCycle, setSubBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [subCategory, setSubCategory] = useState('Utilities');
  const [subPaymentAccount, setSubPaymentAccount] = useState(accounts[0]?.id || '');
  const [subRenewalDate, setSubRenewalDate] = useState('');
  const [subAutoDebit, setSubAutoDebit] = useState(true);
  const [subIcon, setSubIcon] = useState('CreditCard');
  const [subColor, setSubColor] = useState('#C084FC');

  // Validation errors
  const [error, setError] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const openModal = (type: ModalType) => {
    setActiveModal(type);
    setIsOpen(false);
    setError(null);
    
    // Reset fields
    setDescription('');
    setAmount('');
    setCategory('Food & Dining');
    setAccountId(accounts[0]?.id || '');
    setPaymentMethodId('');
    setGoalName('');
    setGoalTarget('');
    setGoalDeadline('');
    setGoalCurrentAmount('');
    setGoalStatus('active');
    setEditingGoal(null);
    setEditingSubscription(null);
    setFromAccountId(accounts[0]?.id || '');
    // Default "to" account to a different one if available
    const otherAccount = accounts.find(a => a.id !== accounts[0]?.id);
    setToAccountId(otherAccount?.id || accounts[0]?.id || '');

    // Reset Subscription fields
    setSubServiceName('');
    setSubAmount('');
    setSubBillingCycle('monthly');
    setSubCategory('Utilities');
    setSubPaymentAccount(accounts[0]?.id || '');
    setSubRenewalDate('');
    setSubAutoDebit(true);
    setSubIcon('CreditCard');
    setSubColor('#C084FC');
  };

  const closeModal = () => {
    setActiveModal(null);
    setError(null);
    setEditingGoal(null);
    setEditingSubscription(null);
  };

  // Submission Handlers
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('DESCRIPTION CANNOT BE EMPTY.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('VALID POSITIVE AMOUNT REQUIRED.');
      return;
    }
    if (!accountId) {
      setError('SELECT A VALID VAULT ACCOUNT.');
      return;
    }

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      amount: parsedAmount,
      description,
      category,
      type: 'expense',
      accountId,
      paymentMethodId: paymentMethodId || undefined
    }, auth.userId ?? undefined);

    const accountName = accounts.find(a => a.id === accountId)?.name || 'VAULT';
    triggerToast(`EXPENSE OF ₹${parsedAmount.toLocaleString('en-IN')} LOGGED TO ${accountName.toUpperCase()} SECURELY.`);
    closeModal();
  };

  const handleIncomeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('DESCRIPTION CANNOT BE EMPTY.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('VALID POSITIVE AMOUNT REQUIRED.');
      return;
    }
    if (!accountId) {
      setError('SELECT A VALID VAULT ACCOUNT.');
      return;
    }

    addTransaction({
      date: new Date().toISOString().split('T')[0],
      amount: parsedAmount,
      description,
      category: 'Income',
      type: 'income',
      accountId,
      paymentMethodId: paymentMethodId || undefined
    }, auth.userId ?? undefined);

    const accountName = accounts.find(a => a.id === accountId)?.name || 'VAULT';
    triggerToast(`INFLOW OF ₹${parsedAmount.toLocaleString('en-IN')} DEPOSITED TO ${accountName.toUpperCase()} SECURELY.`);
    closeModal();
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim()) {
      setError('GOAL IDENTIFIER CANNOT BE EMPTY.');
      return;
    }
    const parsedTarget = parseFloat(goalTarget);
    if (isNaN(parsedTarget) || parsedTarget <= 0) {
      setError('VALID POSITIVE TARGET REQUIRED.');
      return;
    }
    if (!goalDeadline) {
      setError('SELECT A DEADLINE FOR THE VELOCITY TARGET.');
      return;
    }

    if (editingGoal) {
      const parsedCurrent = parseFloat(goalCurrentAmount);
      if (isNaN(parsedCurrent) || parsedCurrent < 0) {
        setError('CURRENT AMOUNT CANNOT BE NEGATIVE.');
        return;
      }

      // BONUS: auto-complete if current >= target
      const finalStatus = parsedCurrent >= parsedTarget ? 'completed' : goalStatus;

      updateGoal({
        ...editingGoal,
        name: goalName,
        targetAmount: parsedTarget,
        currentAmount: parsedCurrent,
        deadline: goalDeadline,
        status: finalStatus,
      });

      triggerToast(`GOAL "${goalName.toUpperCase()}" UPDATED SUCCESSFULLY.`);
    } else {
      addGoal({
        name: goalName,
        targetAmount: parsedTarget,
        currentAmount: 0,
        deadline: goalDeadline,
        category: 'Savings',
        status: 'active'
      }, auth.userId ?? undefined);

      triggerToast(`NEW GOAL "${goalName.toUpperCase()}" SAVED WITH ₹${parsedTarget.toLocaleString('en-IN')} TARGET.`);
    }

    closeModal();
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromAccountId === toAccountId) {
      setError('SOURCE AND DESTINATION VAULTS CANNOT BE IDENTICAL.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('VALID POSITIVE AMOUNT REQUIRED.');
      return;
    }

    const fromAcc = accounts.find(a => a.id === fromAccountId);
    const toAcc = accounts.find(a => a.id === toAccountId);

    if (!fromAcc || !toAcc) {
      setError('INVALID VAULTS SELECTED.');
      return;
    }

    // Add source debit
    addTransaction({
      date: new Date().toISOString().split('T')[0],
      amount: parsedAmount,
      description: `Transfer to ${toAcc.name}`,
      category: 'Transfer',
      type: 'expense',
      accountId: fromAccountId
    }, auth.userId ?? undefined);

    // Add destination credit
    addTransaction({
      date: new Date().toISOString().split('T')[0],
      amount: parsedAmount,
      description: `Transfer from ${fromAcc.name}`,
      category: 'Transfer',
      type: 'income',
      accountId: toAccountId
    }, auth.userId ?? undefined);

    triggerToast(`INTER-VAULT TRANSFER OF ₹${parsedAmount.toLocaleString('en-IN')} EXECUTED SUCCESSFULLY.`);
    closeModal();
  };

  const handleSubscriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subServiceName.trim()) {
      setError('SERVICE NAME CANNOT BE EMPTY.');
      return;
    }
    const parsedAmount = parseFloat(subAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('VALID POSITIVE AMOUNT REQUIRED.');
      return;
    }
    if (!subRenewalDate) {
      setError('SELECT A RENEWAL DATE.');
      return;
    }

    if (editingSubscription) {
      updateSubscription({
        ...editingSubscription,
        service_name: subServiceName,
        amount: parsedAmount,
        billing_cycle: subBillingCycle,
        category: subCategory,
        payment_account: subPaymentAccount,
        renewal_date: subRenewalDate,
        auto_debit: subAutoDebit,
        icon: subIcon,
        color: subColor,
      });
      triggerToast(`SUBSCRIPTION "${subServiceName.toUpperCase()}" UPDATED SUCCESSFULLY.`);
    } else {
      addSubscription({
        service_name: subServiceName,
        amount: parsedAmount,
        billing_cycle: subBillingCycle,
        category: subCategory,
        payment_account: subPaymentAccount,
        renewal_date: subRenewalDate,
        auto_debit: subAutoDebit,
        active: true,
        icon: subIcon,
        color: subColor
      }, auth.userId ?? undefined);

      triggerToast(`SUBSCRIPTION "${subServiceName.toUpperCase()}" ADDED SECURELY.`);
    }
    closeModal();
  };

  // Dynamic positioning for semicircular command wheel based on screen width
  const radius = isMobile ? 70 : 110;

  const fannedItems = [
    {
      id: 'expense',
      label: 'EXPENSE',
      emoji: '💸',
      color: '#FF78C4', // Pink
      icon: <TrendingDown className="w-5 h-5 text-black" />,
      x: -radius,
      y: 0
    },
    {
      id: 'income',
      label: 'INCOME',
      emoji: '💰',
      color: '#4ADE80', // Green
      icon: <TrendingUp className="w-5 h-5 text-black" />,
      x: Math.round(-radius * 0.7071),
      y: Math.round(-radius * 0.7071)
    },
    {
      id: 'subscription',
      label: 'SUBSCRIPTION',
      emoji: '💳',
      color: '#C084FC', // Purple
      icon: <CreditCard className="w-5 h-5 text-black" />,
      x: 0,
      y: -radius
    },
    {
      id: 'goal',
      label: 'GOAL',
      emoji: '🎯',
      color: '#FFDE4D', // Yellow
      icon: <Target className="w-5 h-5 text-black" />,
      x: Math.round(radius * 0.7071),
      y: Math.round(-radius * 0.7071)
    },
    {
      id: 'transfer',
      label: 'TRANSFER',
      emoji: '🔄',
      color: '#A5F3FC', // Cyan
      icon: <RefreshCw className="w-5 h-5 text-black" />,
      x: radius,
      y: 0
    }
  ];

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

  return (
    <>
      {/* GLOBAL SYSTEM SUCCESS TOAST */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[110] max-w-[90vw] bg-[#4ADE80] border-4 border-black p-4 shadow-[6px_6px_0px_rgba(0,0,0,1)] flex items-center gap-3"
          >
            <div className="bg-black p-1 border border-white shrink-0">
              <Sparkles className="w-5 h-5 text-[#FFDE4D] animate-pulse" />
            </div>
            <p className="font-mono text-xs font-bold text-black uppercase leading-tight">
              [SYS_ALERT]: {notification}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RADIAL BACKDROP BACKDROP */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleToggle}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-all"
          />
        )}
      </AnimatePresence>

      {/* FLOATING ACTION ENGINE SYSTEM CHASSIS */}
      <div 
        className="fixed left-1/2 -translate-x-1/2 z-50"
        style={{ bottom: isMobile ? '100px' : '110px' }}
      >
        
        {/* FAN RADIAL BUTTONS */}
        <AnimatePresence>
          {isOpen && fannedItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              animate={{ 
                x: item.x, 
                y: item.y, 
                scale: 1, 
                opacity: 1 
              }}
              exit={{ x: 0, y: 0, scale: 0, opacity: 0 }}
              transition={{ 
                type: 'spring', 
                stiffness: 450, 
                damping: 20,
                delay: idx * 0.03
              }}
              className="absolute"
              style={{ top: '4px', left: '4px' }} // Center offsets for circular button (56px center to 48px center)
            >
              <div className="flex flex-col items-center group w-12">
                <button
                  onClick={() => openModal(item.id as ModalType)}
                  className="w-12 h-12 rounded-full border-4 border-black flex items-center justify-center shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-x-[2.5px] active:translate-y-[2.5px] active:shadow-none transition-all"
                  style={{ backgroundColor: item.color, cursor: 'pointer' }}
                  title={item.label}
                >
                  {item.icon}
                </button>
                
                {/* Neobrutalist mini floating label */}
                <span className="font-mono text-[8px] font-extrabold bg-black text-white px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_rgba(255,255,255,1)] mt-1.5 tracking-wider select-none">
                  {item.emoji} {item.label}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* MAIN INTERACTIVE HUB BUTTON */}
        <motion.button
          onClick={handleToggle}
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 18 }}
          className={`w-14 h-14 rounded-full border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none transition-all z-50`}
          style={{ 
            backgroundColor: isOpen ? '#FF78C4' : '#FFDE4D',
            cursor: 'pointer' 
          }}
          id="global-floating-hub-btn"
        >
          {isOpen ? (
            <X className="w-7 h-7 text-black stroke-[3px]" />
          ) : (
            <Plus className="w-7 h-7 text-black stroke-[3px]" />
          )}
        </motion.button>
      </div>

      {/* CORE MODALS SYSTEM */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-md w-full relative z-[110]"
            >
              {/* Modal Header */}
              <div className="border-b-4 border-black pb-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {activeModal === 'expense' && '💸'}
                    {activeModal === 'income' && '💰'}
                    {activeModal === 'goal' && '🎯'}
                    {activeModal === 'transfer' && '🔄'}
                    {activeModal === 'subscription' && '💳'}
                  </span>
                  <h3 className="font-display text-xl font-black text-black uppercase tracking-tight">
                    {activeModal === 'expense' && 'LOG NEW EXPENSE'}
                    {activeModal === 'income' && 'LOG INFLOW INCOME'}
                    {activeModal === 'goal' && (editingGoal ? 'EDIT GOAL' : 'SET SAVINGS TARGET')}
                    {activeModal === 'transfer' && 'INTER-VAULT TRANSFER'}
                    {activeModal === 'subscription' && (editingSubscription ? 'EDIT SUBSCRIPTION' : 'ADD SUBSCRIPTION')}
                  </h3>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1 bg-black text-white hover:bg-zinc-800 border-2 border-black transition-colors"
                  style={{ cursor: 'pointer' }}
                >
                  <X className="w-4 h-4 stroke-[2.5px]" />
                </button>
              </div>

              {/* Error messages if any */}
              {error && (
                <div className="bg-[#FF9F9F] border-2 border-black p-2.5 font-mono text-[10px] font-bold text-black mb-4 shadow-[2px_2px_0px_rgba(0,0,0,1)] uppercase">
                  [SYSTEM_ERROR]: {error}
                </div>
              )}

              {/* MODAL FORM WRAPPERS */}
              {activeModal === 'expense' && (
                <form onSubmit={handleExpenseSubmit} className="space-y-4">
                  <div>
                    <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                      DESCRIPTION / LEDGER MEMO
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Swiggy Gourmet Dinner"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                        AMOUNT (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                        CATEGORY INDEX
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                      >
                        {budgetCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                      DEBIT SOURCE VAULT
                    </label>
                    <select
                      value={accountId}
                      onChange={(e) => setAccountId(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                    >
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} (₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                      PAYMENT METHOD
                    </label>
                    <select
                      value={paymentMethodId}
                      onChange={(e) => {
                        const pmId = e.target.value;
                        setPaymentMethodId(pmId);
                        const pm = paymentMethods.find(p => p.id === pmId);
                        if (pm && pm.accountId) {
                          setAccountId(pm.accountId);
                        }
                      }}
                      className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
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

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="w-1/2 bg-white hover:bg-gray-50 border-2 border-black py-2.5 font-mono text-xs font-bold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all"
                      style={{ cursor: 'pointer' }}
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 bg-[#FF78C4] hover:bg-pink-400 border-2 border-black py-2.5 font-mono text-xs font-bold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all"
                      style={{ cursor: 'pointer' }}
                    >
                      INDEX DEBIT
                    </button>
                  </div>
                </form>
              )}

              {activeModal === 'income' && (
                <form onSubmit={handleIncomeSubmit} className="space-y-4">
                  <div>
                    <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                      DESCRIPTION / INFLOW MEMO
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Tech Salary"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                        AMOUNT (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                        CREDIT DESTINATION VAULT
                      </label>
                      <select
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                      >
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} (₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                      PAYMENT METHOD
                    </label>
                    <select
                      value={paymentMethodId}
                      onChange={(e) => {
                        const pmId = e.target.value;
                        setPaymentMethodId(pmId);
                        const pm = paymentMethods.find(p => p.id === pmId);
                        if (pm && pm.accountId) {
                          setAccountId(pm.accountId);
                        }
                      }}
                      className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
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

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="w-1/2 bg-white hover:bg-gray-50 border-2 border-black py-2.5 font-mono text-xs font-bold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all"
                      style={{ cursor: 'pointer' }}
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 bg-[#4ADE80] hover:bg-green-400 border-2 border-black py-2.5 font-mono text-xs font-bold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all"
                      style={{ cursor: 'pointer' }}
                    >
                      INDEX DEPOSIT
                    </button>
                  </div>
                </form>
              )}

              {activeModal === 'goal' && (
                <form onSubmit={handleGoalSubmit} className="space-y-4">
                  <div>
                    <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                      GOAL IDENTIFIER / TARGET NAME
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Goa Summer Trip 2026"
                      value={goalName}
                      onChange={(e) => setGoalName(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                        TARGET AMOUNT (₹)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 50000"
                        value={goalTarget}
                        onChange={(e) => setGoalTarget(e.target.value)}
                        className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                      />
                    </div>

                    {editingGoal ? (
                      <div>
                        <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                          CURRENT AMOUNT (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 40000"
                          value={goalCurrentAmount}
                          onChange={(e) => setGoalCurrentAmount(e.target.value)}
                          className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                          TARGET DEADLINE
                        </label>
                        <input
                          type="date"
                          value={goalDeadline}
                          onChange={(e) => setGoalDeadline(e.target.value)}
                          className="w-full bg-white border-2 border-black p-1.5 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                        />
                      </div>
                    )}
                  </div>

                  {editingGoal ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                          TARGET DEADLINE
                        </label>
                        <input
                          type="date"
                          value={goalDeadline}
                          onChange={(e) => setGoalDeadline(e.target.value)}
                          className="w-full bg-white border-2 border-black p-1.5 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                          STATUS
                        </label>
                        <select
                          value={goalStatus}
                          onChange={(e) => setGoalStatus(e.target.value as 'active' | 'completed' | 'paused')}
                          className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                        >
                          <option value="active">ACTIVE</option>
                          <option value="completed">COMPLETED</option>
                          <option value="paused">PAUSED</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                        TARGET DEADLINE
                      </label>
                      <input
                        type="date"
                        value={goalDeadline}
                        onChange={(e) => setGoalDeadline(e.target.value)}
                        className="w-full bg-white border-2 border-black p-1.5 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                      />
                    </div>
                  )}

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="w-1/2 bg-white hover:bg-gray-50 border-2 border-black py-2.5 font-mono text-xs font-bold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all"
                      style={{ cursor: 'pointer' }}
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 bg-[#FFDE4D] hover:bg-yellow-400 border-2 border-black py-2.5 font-mono text-xs font-bold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all"
                      style={{ cursor: 'pointer' }}
                    >
                      {editingGoal ? 'SAVE GOAL' : 'MOUNT TARGET'}
                    </button>
                  </div>
                </form>
              )}

              {activeModal === 'transfer' && (
                <form onSubmit={handleTransferSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                        SOURCE VAULT (FROM)
                      </label>
                      <select
                        value={fromAccountId}
                        onChange={(e) => setFromAccountId(e.target.value)}
                        className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                      >
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} (₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                        DESTINATION VAULT (TO)
                      </label>
                      <select
                        value={toAccountId}
                        onChange={(e) => setToAccountId(e.target.value)}
                        className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                      >
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} (₹{acc.balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                      TRANSFER VOLUME AMOUNT (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                    />
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
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
                      COMMENCE TRANSFER
                    </button>
                  </div>
                </form>
              )}

              {activeModal === 'subscription' && (
                <form onSubmit={handleSubscriptionSubmit} className="space-y-4 text-left">
                  <div>
                    <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                      SERVICE NAME
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Netflix Premium"
                      value={subServiceName}
                      onChange={(e) => setSubServiceName(e.target.value)}
                      className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                      autoFocus
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                        AMOUNT (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={subAmount}
                        onChange={(e) => setSubAmount(e.target.value)}
                        className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                        BILLING CYCLE
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSubBillingCycle('monthly')}
                          className={`py-2 border-2 border-black font-mono text-[10px] font-bold transition-all shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none ${
                            subBillingCycle === 'monthly' ? 'bg-[#C084FC] text-black' : 'bg-white text-gray-700'
                          }`}
                          style={{ cursor: 'pointer' }}
                        >
                          MONTHLY
                        </button>
                        <button
                          type="button"
                          onClick={() => setSubBillingCycle('yearly')}
                          className={`py-2 border-2 border-black font-mono text-[10px] font-bold transition-all shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none ${
                            subBillingCycle === 'yearly' ? 'bg-[#C084FC] text-black' : 'bg-white text-gray-700'
                          }`}
                          style={{ cursor: 'pointer' }}
                        >
                          YEARLY
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                        CATEGORY INDEX
                      </label>
                      <select
                        value={subCategory}
                        onChange={(e) => setSubCategory(e.target.value)}
                        className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                      >
                        {budgetCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                        PAYMENT VAULT
                      </label>
                      <select
                        value={subPaymentAccount}
                        onChange={(e) => setSubPaymentAccount(e.target.value)}
                        className="w-full bg-white border-2 border-black p-2 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                      >
                        {accounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 items-end">
                    <div>
                      <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                        RENEWAL DATE
                      </label>
                      <input
                        type="date"
                        value={subRenewalDate}
                        onChange={(e) => setSubRenewalDate(e.target.value)}
                        className="w-full bg-white border-2 border-black p-1.5 font-mono text-xs outline-none focus:bg-[#FFFDEB] transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => setSubAutoDebit(!subAutoDebit)}
                        className={`w-full py-1.5 px-2 border-2 border-black font-mono text-[10px] font-bold flex items-center justify-between shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all ${
                          subAutoDebit ? 'bg-[#4ADE80] text-black' : 'bg-white text-gray-500'
                        }`}
                        style={{ cursor: 'pointer' }}
                      >
                        <span>AUTO DEBIT</span>
                        <span className="border-2 border-black bg-white w-4 h-4 flex items-center justify-center shrink-0">
                          {subAutoDebit && <Check className="w-3 h-3 text-black stroke-[3px]" />}
                        </span>
                      </button>
                    </div>
                  </div>

                  {editingSubscription && (
                    <div>
                      <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                        STATUS
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingSubscription({ ...editingSubscription, active: true })}
                          className={`py-2 border-2 border-black font-mono text-[10px] font-bold transition-all shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none ${
                            editingSubscription.active ? 'bg-[#4ADE80] text-black' : 'bg-white text-gray-700'
                          }`}
                          style={{ cursor: 'pointer' }}
                        >
                          🟢 ACTIVE
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingSubscription({ ...editingSubscription, active: false })}
                          className={`py-2 border-2 border-black font-mono text-[10px] font-bold transition-all shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none ${
                            !editingSubscription.active ? 'bg-gray-300 text-black' : 'bg-white text-gray-700'
                          }`}
                          style={{ cursor: 'pointer' }}
                        >
                          ⚪ PAUSED
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                        RECURRING ICON
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'Tv', label: '📺' },
                          { name: 'Music', label: '🎵' },
                          { name: 'Cpu', label: '💻' },
                          { name: 'Cloud', label: '☁️' },
                          { name: 'CreditCard', label: '💳' },
                          { name: 'Heart', label: '❤️' }
                        ].map(iconOpt => (
                          <button
                            key={iconOpt.name}
                            type="button"
                            onClick={() => setSubIcon(iconOpt.name)}
                            className={`w-7 h-7 flex items-center justify-center border-2 border-black text-xs shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none transition-all ${
                              subIcon === iconOpt.name ? 'bg-[#A5F3FC]' : 'bg-white'
                            }`}
                            style={{ cursor: 'pointer' }}
                          >
                            {iconOpt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="font-mono text-[10px] font-bold text-black block mb-1 uppercase tracking-wider">
                        AESTHETIC HUE
                      </label>
                      <div className="flex gap-1.5 pt-1">
                        {['#FF78C4', '#4ADE80', '#FFDE4D', '#38BDF8', '#FB923C', '#C084FC'].map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setSubColor(c)}
                            className={`w-5 h-5 rounded-full border-2 border-black transition-transform ${
                              subColor === c ? 'scale-110 ring-2 ring-black' : ''
                            }`}
                            style={{ backgroundColor: c, cursor: 'pointer' }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="w-1/2 bg-white hover:bg-gray-50 border-2 border-black py-2.5 font-mono text-xs font-bold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all"
                      style={{ cursor: 'pointer' }}
                    >
                      CANCEL
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 bg-[#C084FC] hover:bg-purple-400 border-2 border-black py-2.5 font-mono text-xs font-bold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all"
                      style={{ cursor: 'pointer' }}
                    >
                      {editingSubscription ? 'SAVE SUBSCRIPTION' : 'SECURE SUBSCRIPTION'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
