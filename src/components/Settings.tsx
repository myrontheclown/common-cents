/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useAuthContext } from '../providers/AuthProvider';
import React, { useState, useEffect } from 'react';
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
  X,
  LogOut,
  Key,
  Mail,
  Calendar
} from 'lucide-react';
import { updateProfile, updatePassword } from '../lib/auth';
import { useFinanceStore } from '../store';
import type { Account, Budget, PaymentMethod } from '../types';
import { getPaymentMethodIcon } from '../lib/paymentMethodIcons';

interface SettingsProps {
  pendingVaultEdit: Account | null;
  onClearPendingVaultEdit: () => void;
}

export default function Settings({ pendingVaultEdit, onClearPendingVaultEdit }: SettingsProps) {
  const auth = useAuthContext();
  const { 
    preferences, 
    achievements, 
    accounts,
    paymentMethods,
    budgets,
    updatePreferences, 
    addAccount,
    updateAccount,
    addPaymentMethod,
    deletePaymentMethod,
    updatePaymentMethod,
    deleteAccount,
    addBudget,
    updateBudget,
    deleteBudget
  } = useFinanceStore();

  const [notification, setNotification] = useState<string | null>(null);

  // Profile / Sign out state
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Edit profile form
  const [editDisplayName, setEditDisplayName] = useState(auth.profile?.display_name || preferences.name || '');
  const [editAge, setEditAge] = useState(auth.profile?.age?.toString() || '');
  const [editCurrency, setEditCurrency] = useState(auth.profile?.currency || 'INR');
  const [editSavingsGoal, setEditSavingsGoal] = useState(auth.profile?.monthly_savings_goal?.toString() || preferences.monthlySavingsGoal.toString());

  // Change password form
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Google password creation
  const [showGooglePassword, setShowGooglePassword] = useState(false);
  const [googleNewPassword, setGoogleNewPassword] = useState('');
  const [googleConfirmPassword, setGoogleConfirmPassword] = useState('');
  const [googlePasswordError, setGooglePasswordError] = useState<string | null>(null);
  const [googlePasswordLoading, setGooglePasswordLoading] = useState(false);

  // Settings form states
  const [name, setName] = useState(preferences.name);
  const [savingsGoal, setSavingsGoal] = useState(preferences.monthlySavingsGoal.toString());
  const [threshold, setThreshold] = useState(preferences.categoryThreshold.toString());
  const [reminderEnabled, setReminderEnabled] = useState(preferences.reminderEnabled ?? true);
  const [reminderTime, setReminderTime] = useState(preferences.reminderTime ?? '21:30');

  // Account creation form states
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<'bank' | 'cash' | 'investment' | 'credit' | 'asset' | 'liability'>('bank');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [newAccMinBalance, setNewAccMinBalance] = useState('');
  const [newAccColor, setNewAccColor] = useState('#4F8CC9');
  const [newAccIcon, setNewAccIcon] = useState('Landmark');

  // Payment Method form states
  const [newPmName, setNewPmName] = useState('');
  const [newPmType, setNewPmType] = useState<'upi' | 'debit' | 'credit' | 'cash' | 'netbanking'>('upi');
  const [newPmAccountId, setNewPmAccountId] = useState(accounts[0]?.id || '');
  const [newPmColor, setNewPmColor] = useState('#8B5CF6');
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
    { value: '#4F8CC9', label: 'Steel Blue' },
    { value: '#22C55E', label: 'Green' },
    { value: '#DC5C5C', label: 'Premium Red' },
    { value: '#F59E0B', label: 'Amber' },
    { value: '#8B5CF6', label: 'Royal Purple' },
    { value: '#D4A72C', label: 'Gold' }
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

    if (editingAccount) {
      if (!newAccName) return;
      await updateAccount({
        ...editingAccount,
        name: newAccName,
        type: newAccType,
        color: newAccColor,
        icon: newAccIcon,
        minimumBalance: newAccMinBalance ? Number(newAccMinBalance) : undefined,
      });
      triggerNotification(`VAULT "${newAccName.toUpperCase()}" UPDATED SUCCESSFULLY.`);
      resetAccountForm();
      return;
    }

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
        minimumBalance: newAccMinBalance ? Number(newAccMinBalance) : undefined,
        color: newAccColor,
        icon: newAccIcon
      },
      auth.userId
    );

    resetAccountForm();
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
    setNewPmColor('#8B5CF6');
    setNewPmIcon('Smartphone');
  };

  const resetAccountForm = () => {
    setEditingAccount(null);
    setNewAccName('');
    setNewAccBalance('');
    setNewAccMinBalance('');
    setNewAccType('bank');
    setNewAccColor('#4F8CC9');
    setNewAccIcon('Landmark');
  };

  React.useEffect(() => {
    if (!pendingVaultEdit) return;
    const acc = pendingVaultEdit;
    setEditingAccount(acc);
    setNewAccName(acc.name);
    setNewAccType(acc.type);
    setNewAccColor(acc.color);
    setNewAccIcon(acc.icon);
    setNewAccBalance('');
    setNewAccMinBalance(acc.minimumBalance?.toString() || '');
    onClearPendingVaultEdit();
    (document.getElementById('settings-shell') as HTMLElement)?.scrollIntoView({ behavior: 'smooth' });
  }, [pendingVaultEdit]);

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
    if (ratio > 1) return '#DC5C5C';
    if (ratio > 0.8) return '#F59E0B';
    if (ratio > 0.6) return '#D4A72C';
    return '#22C55E';
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

    const duplicate = budgets.find(b =>
      b.category === budgetCategory &&
      b.period === budgetPeriod &&
      (editingBudget ? b.id !== editingBudget.id : true)
    );
    if (duplicate) {
      triggerNotification('ERROR: BUDGET ALREADY EXISTS FOR THIS CATEGORY AND PERIOD.');
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
    const cls = `w-8 h-8 ${active ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`;
    switch (iconName) {
      case 'Sparkles': return <Sparkles className={cls} />;
      case 'Flame': return <Flame className={cls} />;
      case 'ShieldAlert': return <ShieldAlert className={cls} />;
      case 'Zap': return <Zap className={cls} />;
      default: return <Sparkles className={cls} />;
    }
  };

  return (
    <><div id="settings-shell" className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[var(--section-settings)]">
      
      {/* HEADER SECTION */}
      <div className="lg:col-span-12 flex flex-col gap-4 border-b-4 border-[var(--border-color)] pb-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="bg-[var(--bg-badge)] p-2 border border-[var(--border-color)]">
            <SettingsIcon className="w-6 h-6 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-[var(--text-primary)] uppercase">SYSTEM SHELL SETTINGS</h2>
            <p className="font-mono text-xs text-[var(--text-muted)]">Align global terminal limits, mount new vaults, and view system medals</p>
          </div>
        </div>

        {/* NOTIFICATION BANNER */}
        {notification && (
          <div className="bg-[var(--accent-success)] border-2 border-[var(--border-color)] p-3 font-mono text-xs font-bold text-[#000000] shadow-[4px_4px_0px_var(--shadow-color)] animate-bounce">
            [SYS_ALERT]: {notification}
          </div>
        )}
      </div>

      {/* PROFILE CARD */}
      <div className="lg:col-span-12">
        <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* AVATAR */}
            <div className="w-16 h-16 bg-[var(--accent-primary)] border-3 border-[var(--border-color)] shadow-[3px_3px_0px_var(--shadow-color)] flex items-center justify-center flex-shrink-0">
              <span className="font-display text-2xl font-black text-[var(--text-primary)]">
                {(auth.profile?.display_name || preferences.name || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
            {/* INFO */}
              <div className="flex-grow min-w-0">
                <h3 className="font-display text-xl font-black text-[var(--text-primary)] uppercase tracking-tight truncate">
                  {auth.profile?.display_name || preferences.name || 'User'}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-[var(--text-muted)]" />
                    <span className="font-mono text-[10px] text-[var(--text-muted)] truncate">
                      {auth.profile?.email || auth.user?.email || 'No email'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3 h-3 text-[var(--text-muted)]" />
                    <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase">
                      {auth.user?.app_metadata?.provider || 'email'}
                    </span>
                  </div>
                  {auth.profile?.age != null && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-[var(--text-muted)]">
                        Age: {auth.profile.age}
                      </span>
                    </div>
                  )}
                  {auth.profile?.currency && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-[var(--text-muted)]">
                        Currency: {auth.profile.currency}
                      </span>
                    </div>
                  )}
                  {auth.profile && (
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-[var(--text-muted)]">
                        Monthly Goal: {auth.profile.currency === 'INR' ? '₹' : auth.profile.currency + ' '}{auth.profile.monthly_savings_goal.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  {auth.profile?.created_at && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-[var(--text-muted)]" />
                      <span className="font-mono text-[10px] text-[var(--text-muted)]">
                        Joined {new Date(auth.profile.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            {/* ACTIONS */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0">
              <button
                onClick={() => {
                  setEditDisplayName(auth.profile?.display_name || preferences.name || '');
                  setEditAge(auth.profile?.age?.toString() || '');
                  setEditCurrency(auth.profile?.currency || 'INR');
                  setEditSavingsGoal(auth.profile?.monthly_savings_goal?.toString() || preferences.monthlySavingsGoal.toString());
                  setShowEditProfile(true);
                }}
                className="px-3 py-2 bg-[var(--accent-info)] border-2 border-[var(--border-color)] font-mono text-[10px] font-bold text-[#000000] shadow-[2px_2px_0px_var(--shadow-color)] hover:shadow-[3px_3px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5"
                style={{ cursor: 'pointer' }}
              >
                <Edit3 className="w-3 h-3" />
                EDIT PROFILE
              </button>
              {auth.user?.app_metadata?.provider !== 'google' && (
                <button
                  onClick={() => {
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setPasswordError(null);
                    setShowChangePassword(true);
                  }}
                  className="px-3 py-2 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border-2 border-[var(--border-color)] font-mono text-[10px] font-bold text-[var(--text-primary)] shadow-[2px_2px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5"
                  style={{ cursor: 'pointer' }}
                >
                  <Key className="w-3 h-3" />
                  CHANGE PASSWORD
                </button>
              )}
              <button
                onClick={() => setShowSignOutConfirm(true)}
                className="px-3 py-2 bg-[var(--accent-danger)] border-2 border-[var(--border-color)] font-mono text-[10px] font-bold text-[#000000] shadow-[2px_2px_0px_var(--shadow-color)] hover:shadow-[3px_3px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5"
                style={{ cursor: 'pointer' }}
              >
                <LogOut className="w-3 h-3" />
                SIGN OUT
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECURITY SECTION - Google users can set a password */}
      {auth.user?.app_metadata?.provider === 'google' && (
        <div className="lg:col-span-12">
          <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 mb-3 uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4 text-[var(--text-primary)]" />
                SECURITY
              </h3>
            </div>
            <p className="font-mono text-[10px] text-[var(--text-muted)] mb-3">
              Your account currently uses Google for authentication. Set a password to also sign in with email + password.
            </p>
            {!showGooglePassword ? (
              <button
                onClick={() => setShowGooglePassword(true)}
                className="px-3 py-2 bg-[var(--accent-info)] border-2 border-[var(--border-color)] font-mono text-[10px] font-bold text-[#000000] shadow-[2px_2px_0px_var(--shadow-color)] hover:shadow-[3px_3px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center gap-1.5"
                style={{ cursor: 'pointer' }}
              >
                <Key className="w-3 h-3" />
                CREATE PASSWORD FOR EMAIL LOGIN
              </button>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setGooglePasswordError(null);
                if (googleNewPassword.length < 8) {
                  setGooglePasswordError('Password must be at least 8 characters.');
                  return;
                }
                if (googleNewPassword !== googleConfirmPassword) {
                  setGooglePasswordError('Passwords do not match.');
                  return;
                }
                setGooglePasswordLoading(true);
                try {
                  await updatePassword(googleNewPassword);
                  setShowGooglePassword(false);
                  setGoogleNewPassword('');
                  setGoogleConfirmPassword('');
                  triggerNotification('PASSWORD CREATED SUCCESSFULLY. YOU CAN NOW SIGN IN WITH EMAIL + PASSWORD.');
                } catch (err: any) {
                  setGooglePasswordError(err?.message || 'Failed to set password.');
                } finally {
                  setGooglePasswordLoading(false);
                }
              }} className="space-y-3">
                <div>
                  <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1 uppercase tracking-wider">
                    NEW PASSWORD
                  </label>
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={googleNewPassword}
                    onChange={(e) => setGoogleNewPassword(e.target.value)}
                    className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)] transition-colors"
                    autoFocus
                    required
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1 uppercase tracking-wider">
                    CONFIRM PASSWORD
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter password"
                    value={googleConfirmPassword}
                    onChange={(e) => setGoogleConfirmPassword(e.target.value)}
                    className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)] transition-colors"
                    required
                  />
                </div>
                {googlePasswordError && (
                  <div className="bg-[var(--accent-danger)] border-2 border-[var(--border-color)] p-2 font-mono text-[11px] font-bold text-[#000000]">
                    [PASSWORD_ERROR]: {googlePasswordError}
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGooglePassword(false);
                      setGoogleNewPassword('');
                      setGoogleConfirmPassword('');
                      setGooglePasswordError(null);
                    }}
                    className="bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border-2 border-[var(--border-color)] py-2 px-4 font-mono text-xs font-bold text-[var(--text-primary)] shadow-[2px_2px_0px_var(--shadow-color)] active:translate-y-[1px] active:shadow-none transition-all"
                    style={{ cursor: 'pointer' }}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={googlePasswordLoading}
                    className="bg-[var(--accent-primary)] border-2 border-[var(--border-color)] py-2 px-4 font-mono text-xs font-bold text-[#000000] shadow-[2px_2px_0px_var(--shadow-color)] hover:shadow-[3px_3px_0px_var(--shadow-color)] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ cursor: googlePasswordLoading ? 'not-allowed' : 'pointer' }}
                  >
                    {googlePasswordLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[var(--border-color)] border-t-transparent rounded-full animate-spin" />
                        SETTING...
                      </>
                    ) : (
                      'SET PASSWORD'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* THEME SELECTOR */}
      <div className="lg:col-span-12">
        <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
          <h3 className="font-display text-base font-bold text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
            THEME
          </h3>
          <div className="flex gap-2">
            {(['system', 'light', 'dark'] as const).map(option => (
              <button
                key={option}
                onClick={() => updatePreferences({ theme: option })}
                className={`flex-1 py-2.5 border-2 border-[var(--border-color)] font-mono text-[10px] font-bold uppercase tracking-wider transition-all ${
                  preferences.theme === option
                    ? 'bg-[var(--card-bg)] border border-[var(--accent-primary)] text-[var(--accent-primary)] shadow-[2px_2px_0px_var(--shadow-color)]'
                    : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                } active:translate-x-[1px] active:translate-y-[1px] active:shadow-none`}
                style={{ cursor: 'pointer' }}
              >
                {option === 'system' ? 'SYSTEM' : option === 'light' ? '☀ LIGHT' : '☾ DARK'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LEFT COLUMN: GLOBAL PREFERENCES & ACCOUNT MOUNTING (7 SPAN) */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        
        {/* GLOBAL SHELL PREFERENCES */}
        <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
          <h3 className="font-display text-base font-bold text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-[var(--text-primary)]" />
            GLOBAL CORE PREFERENCES
          </h3>

          <form onSubmit={handleSettingsSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">OPERATOR ALIAS</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)]"
                  required
                />
              </div>

              <div>
                <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">MONTHLY SAVINGS TARGET (₹)</label>
                <input
                  type="number"
                  value={savingsGoal}
                  onChange={(e) => setSavingsGoal(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">
                VELOCITY WARN THRESHOLD (%) - Current: {threshold}%
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-none border-2 border-[var(--border-color)] appearance-none cursor-pointer accent-black"
              />
              <span className="font-mono text-[9px] text-[var(--text-muted)] block mt-1">
                Trigger dynamic red alerts inside budget meters when expenditures exceed this percentage limit.
              </span>
            </div>

            {/* DAILY TRANSACTION REMINDER SECTION */}
            <div className="border-2 border-[var(--border-color)] p-3 bg-[var(--bg-muted)] mt-1">
              <span className="font-mono text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-wider block mb-2 border-b border-[var(--border-color)] pb-1">
                📅 Daily Transaction Reminder
              </span>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminderEnabled}
                    onChange={(e) => setReminderEnabled(e.target.checked)}
                    className="w-4 h-4 bg-[var(--bg-surface)] border-2 border-[var(--border-color)] rounded-none appearance-none checked:bg-[var(--accent-danger)] checked:border-2 text-[#000000] cursor-pointer flex items-center justify-center relative checked:after:content-['✓'] checked:after:text-[var(--text-primary)] checked:after:font-bold checked:after:text-xs"
                  />
                  <span className="font-mono text-xs font-bold text-[var(--text-primary)] select-none">Enable Daily Reminder</span>
                </label>
                
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-[var(--text-primary)]">REMINDER TIME:</span>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    disabled={!reminderEnabled}
                    className="bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-1 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)] disabled:bg-[var(--bg-muted)] disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* TEST PROMPT TRIGGER BUTTON */}
              <div className="flex justify-between items-center mt-3 pt-2 border-t border-dashed border-gray-400">
                <span className="font-mono text-[9px] text-[var(--text-muted)]">
                  Receive a playful nudge if 0 transactions are logged for the day.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('trigger-test-reminder'));
                    triggerNotification('TEST REMINDER POPUP ENGAGED.');
                  }}
                  className="px-2 py-1 bg-[#4D96FF] text-[var(--text-primary)] font-mono text-[9px] font-bold border-2 border-[var(--border-color)] shadow-[1px_1px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-[#3b82f6] cursor-pointer"
                >
                  TEST REMINDER POPUP
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="bg-[var(--accent-danger)] text-[#000000] font-display text-xs font-bold px-4 py-2 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] hover:shadow-[3px_3px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none self-start"
              style={{ cursor: 'pointer' }}
            >
              SAVE CORE CONFIG
            </button>
          </form>
        </div>

        {/* VAULT MOUNT BOARD (ADD/EDIT ACCOUNTS) */}
        <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
          <h3 className="font-display text-base font-bold text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
            {editingAccount ? <Edit3 className="w-4 h-4 text-[var(--text-primary)]" /> : <Plus className="w-4 h-4 text-[var(--text-primary)]" />}
            {editingAccount ? 'EDIT VAULT INDEX' : 'MOUNT NEW VAULT INDEX'}
            {editingAccount && (
              <span className="ml-auto font-mono text-[9px] bg-[var(--bg-badge)] text-[var(--text-badge)] px-2 py-0.5">EDITING: {editingAccount.name.toUpperCase()}</span>
            )}
          </h3>

          <form onSubmit={handleAccountSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">DISPLAY NAME</label>
                <input
                  type="text"
                  placeholder="e.g. HDFC Savings, Wallet Cash"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)]"
                  required
                />
              </div>

              {editingAccount ? (
                <div>
                  <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">CURRENT BALANCE (₹)</label>
                  <div className="w-full bg-[var(--bg-muted)] border-2 border-[var(--border-color)] p-2 font-mono text-xs text-[var(--text-muted)] flex items-center h-[38px]">
                    Balance is derived from transactions and cannot be edited directly.
                  </div>
                </div>
              ) : (
                <div>
                  <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">OPENING BALANCE (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newAccBalance}
                    onChange={(e) => setNewAccBalance(e.target.value)}
                    className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)]"
                    required
                  />
                </div>
              )}
            </div>

            <div>
              <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">MINIMUM BALANCE (₹) <span className="text-[var(--text-muted)] font-normal">(OPTIONAL)</span></label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 5000"
                value={newAccMinBalance}
                onChange={(e) => setNewAccMinBalance(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)]"
              />
              <span className="font-mono text-[9px] text-[var(--text-muted)] block mt-1">
                Get alerted when vault balance drops below this threshold.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* ACC TYPE */}
              <div>
                <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">TYPE CLASSIFICATION</label>
                <select
                  value={newAccType}
                  onChange={(e) => setNewAccType(e.target.value as any)}
                  className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none"
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
                <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">SHELL ICON</label>
                <select
                  value={newAccIcon}
                  onChange={(e) => setNewAccIcon(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none"
                >
                  <option value="Landmark">LANDMARK / BANK</option>
                  <option value="TrendingUp">TRENDING / TRADING</option>
                  <option value="Coins">COINS / STACK</option>
                  <option value="CreditCard">CARD / DEBIT</option>
                </select>
              </div>

              {/* COLOR PRESETS */}
              <div>
                <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">COLOR PALETTE</label>
                <select
                  value={newAccColor}
                  onChange={(e) => setNewAccColor(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none"
                >
                  {colorPresets.map(c => (
                    <option key={c.value} value={c.value}>{c.label.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 self-start">
              {editingAccount && (
                <button
                  type="button"
                  onClick={resetAccountForm}
                  className="bg-[var(--bg-surface)] text-[var(--text-primary)] font-display text-xs font-bold px-4 py-2 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[var(--bg-hover)]"
                  style={{ cursor: 'pointer' }}
                >
                  CANCEL
                </button>
              )}
              <button
                type="submit"
                className="bg-[var(--accent-info)] text-[#000000] font-display text-xs font-bold px-4 py-2 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] hover:shadow-[3px_3px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none self-start"
                style={{ cursor: 'pointer' }}
              >
                {editingAccount ? 'SAVE VAULT' : 'MOUNT SYSTEM VAULT'}
              </button>
            </div>
          </form>
        </div>

        {/* MOUNT / EDIT PAYMENT METHOD */}
        <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
          <h3 className="font-display text-base font-bold text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
            {editingPaymentMethod ? <Edit3 className="w-4 h-4 text-[var(--text-primary)]" /> : <Plus className="w-4 h-4 text-[var(--text-primary)]" />}
            {editingPaymentMethod ? 'EDIT PAYMENT METHOD' : 'MOUNT NEW PAYMENT METHOD'}
            {editingPaymentMethod && (
              <span className="ml-auto font-mono text-[9px] bg-[var(--bg-badge)] text-[var(--text-badge)] px-2 py-0.5">EDITING: {editingPaymentMethod.name.toUpperCase()}</span>
            )}
          </h3>

          <form onSubmit={handlePaymentMethodSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">DISPLAY NAME</label>
                <input
                  type="text"
                  placeholder="e.g. Google Pay, HDFC Debit Card"
                  value={newPmName}
                  onChange={(e) => setNewPmName(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)]"
                  required
                />
              </div>

              <div>
                <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">PAYMENT TYPE</label>
                <select
                  value={newPmType}
                  onChange={(e) => setNewPmType(e.target.value as any)}
                  className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none"
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
                <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">LINKED VAULT</label>
                <select
                  value={newPmAccountId}
                  onChange={(e) => setNewPmAccountId(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none"
                  required
                >
                  <option value="">-- SELECT VAULT --</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.type.toUpperCase()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">SHELL ICON</label>
                <select
                  value={newPmIcon}
                  onChange={(e) => setNewPmIcon(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none"
                >
                  <option value="Smartphone">SMARTPHONE / UPI</option>
                  <option value="CreditCard">CREDIT CARD</option>
                  <option value="Coins">COINS / CASH</option>
                  <option value="Landmark">LANDMARK / NET BANKING</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1">COLOR PALETTE</label>
                <select
                  value={newPmColor}
                  onChange={(e) => setNewPmColor(e.target.value)}
                  className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none"
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
                  className="bg-[var(--bg-surface)] text-[var(--text-primary)] font-display text-xs font-bold px-4 py-2 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[var(--bg-hover)]"
                  style={{ cursor: 'pointer' }}
                >
                  CANCEL
                </button>
              )}
              <button
                type="submit"
                className="bg-[var(--accent-danger)] text-[#000000] font-display text-xs font-bold px-4 py-2 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] hover:shadow-[3px_3px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                style={{ cursor: 'pointer' }}
              >
                {editingPaymentMethod ? 'SAVE PAYMENT METHOD' : 'MOUNT PAYMENT METHOD'}
              </button>
            </div>
          </form>
        </div>

        {/* ACTIVE PAYMENT METHODS INDEX */}
        <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
          <h3 className="font-display text-base font-bold text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 mb-3 uppercase tracking-wider flex items-center justify-between">
            <span>ACTIVE PAYMENT METHODS</span>
            <span className="bg-[var(--bg-badge)] text-[var(--text-badge)] px-2 py-0.5 text-xs font-mono">{paymentMethods.length}</span>
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {paymentMethods.length === 0 ? (
              <p className="font-mono text-[11px] text-[var(--text-muted)] py-2">No payment methods mounted yet. Use the tool above.</p>
            ) : (
              paymentMethods.map(pm => {
                const linkedVault = accounts.find(a => a.id === pm.accountId)?.name || 'Direct';
                return (
                  <div 
                    key={pm.id} 
                    className="border-2 border-[var(--border-color)] px-3 py-2 flex items-center justify-between gap-3 shadow-[2px_2px_0px_var(--shadow-color)] text-xs font-mono font-bold"
                    style={{ backgroundColor: pm.color || '#E9D5FF' }}
                  >
                    <div className="flex items-center gap-2">
                      {getPaymentMethodIcon(pm.icon)}
                      <div>
                        <span className="text-[var(--text-primary)] font-bold">{pm.name}</span>
                        <span className="block text-[9px] text-[var(--text-muted)] font-normal">Vault: {linkedVault}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleEditPaymentMethod(pm)}
                        className="text-[var(--text-primary)] hover:text-blue-600 p-0.5"
                        title="Edit Payment Method"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => deletePaymentMethod(pm.id)}
                        className="text-[var(--text-primary)] hover:text-red-600 p-0.5"
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
        <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
          <h3 className="font-display text-base font-bold text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-4 h-4 text-[var(--text-primary)]" />
            🎯 Budget Management
          </h3>

          <button
            onClick={openAddBudget}
            className="w-full bg-[var(--accent-info)] text-[#000000] font-display text-xs font-bold px-4 py-2 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] hover:shadow-[3px_3px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none mb-4 flex items-center justify-center gap-2"
            style={{ cursor: 'pointer' }}
          >
            <Plus className="w-4 h-4" />
            ADD BUDGET
          </button>

          {budgets.length === 0 ? (
            <div className="border-2 border-[var(--border-color)] p-6 bg-[var(--bg-muted)] text-center flex flex-col items-center gap-3">
              <span className="text-3xl">🎯</span>
              <p className="font-display text-base font-bold text-[var(--text-primary)]">No budgets created yet.</p>
              <p className="font-mono text-[11px] text-[var(--text-muted)]">Create category budgets to track your spending.</p>
              <button
                onClick={openAddBudget}
                className="bg-[var(--accent-primary)] text-[#000000] font-display text-xs font-bold px-4 py-2 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] hover:shadow-[3px_3px_0px_var(--shadow-color)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
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
                const isExceeded = budget.spent > budget.limit;
                return (
                  <div key={budget.id} className={`border-2 border-[var(--border-color)] border-t-[3px] p-3 flex flex-col gap-2 bg-[var(--card-bg)] shadow-[2px_2px_0px_var(--shadow-color)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_var(--shadow-color)] ${isExceeded ? 'border-t-[var(--accent-danger)]' : 'border-t-[var(--accent-success)]'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryEmoji(budget.category)}</span>
                        <span className="font-display text-sm font-bold text-[var(--text-primary)]">{budget.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] bg-[var(--bg-badge)] text-[var(--text-badge)] px-1.5 py-0.5 font-bold">{budget.period.toUpperCase()}</span>
                        <span className="font-mono text-[10px] font-bold text-[var(--text-muted)]">{Math.round(pct)}%</span>
                        <button
                          onClick={() => openEditBudget(budget)}
                          className="p-1 border border-[var(--border-color)] hover:bg-[var(--bg-hover)] transition-colors"
                          title="Edit Budget"
                          style={{ cursor: 'pointer' }}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(budget.id)}
                          className="p-1 border border-[var(--border-color)] hover:bg-red-100 transition-colors"
                          title="Delete Budget"
                          style={{ cursor: 'pointer' }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-3 border-2 border-[var(--border-color)] bg-[var(--bg-muted)]">
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
                      {isExceeded ? (
                        <span className="text-red-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Exceeded by ₹{Math.abs(remaining).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-green-600 font-bold">
                          Remaining ₹{remaining.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PRIVACY PROTECTION STATUS */}
        <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
          <h3 className="font-display text-base font-bold text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Lock className="w-4 h-4 text-[var(--accent-warning)]" />
            🔒 PRIVACY MODE
          </h3>
          <div className="font-mono text-xs text-[var(--text-primary)] leading-relaxed flex flex-col gap-3">
            <p>
              Common Cents operates with standard sandbox local-first principles. Your raw sensitive banking keys never touch our index servers.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-success)] bg-[var(--card-bg)] p-2.5 shadow-[2px_2px_0px_var(--shadow-color)]">
                <span className="font-bold text-[var(--accent-success)] block mb-1">✓ STORES:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[10px] text-[var(--text-primary)]">
                  <li>display names</li>
                  <li>balances</li>
                  <li>categories</li>
                  <li>transaction history</li>
                  <li>payment methods</li>
                </ul>
              </div>
              <div className="border-2 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-danger)] bg-[var(--card-bg)] p-2.5 shadow-[2px_2px_0px_var(--shadow-color)]">
                <span className="font-bold text-[var(--accent-danger)] block mb-1">✗ NEVER STORES:</span>
                <ul className="list-disc list-inside space-y-0.5 text-[10px] text-[var(--text-primary)]">
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
        <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]">
          <h3 className="font-display text-base font-bold text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--text-primary)] animate-pulse" />
            SYSTEM ACHIEVEMENTS LOG
          </h3>

          <div className="flex flex-col gap-4">
            {achievements.map((ach) => (
              <div 
                key={ach.id}
                className={`border-2 border-[var(--border-color)] p-3.5 shadow-[2px_2px_0px_var(--shadow-color)] flex items-start gap-3.5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_var(--shadow-color)] ${
                  ach.isUnlocked 
                    ? 'bg-[var(--card-bg)] border-t-[3px] border-t-[var(--accent-success)]' 
                    : 'bg-[var(--card-bg)] border-dashed opacity-50'
                }`}
              >
                {/* ICON */}
                <div className={`p-2 border-2 border-[var(--border-color)] rounded-none ${ach.isUnlocked ? 'bg-[var(--accent-success)]' : 'bg-gray-200'}`}>
                  {getAchievementIcon(ach.icon, ach.isUnlocked)}
                </div>

                {/* DETAILS */}
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-xs font-bold text-[var(--text-primary)] uppercase">{ach.title}</h4>
                    <span className="font-mono text-[9px] bg-[var(--bg-badge)] text-[var(--text-badge)] px-1.5 py-0.2 font-bold">
                      +{ach.points} PTS
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-[var(--text-muted)] mt-1">{ach.description}</p>
                  
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
        <div className="bg-zinc-900 border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)] text-[#39FF14] font-mono text-xs">
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
              className="absolute inset-0 bg-[var(--bg-badge)]/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-6 shadow-[8px_8px_0px_var(--shadow-color)] max-w-md w-full relative z-[110]"
            >
              <div className="border-b-4 border-[var(--border-color)] pb-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  <h3 className="font-display text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                    {editingBudget ? 'EDIT BUDGET' : 'ADD BUDGET'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowBudgetModal(false)}
                  className="p-1 bg-[var(--bg-badge)] text-[var(--text-badge)] hover:bg-zinc-800 border-2 border-[var(--border-color)] transition-colors"
                  style={{ cursor: 'pointer' }}
                >
                  <X className="w-4 h-4 stroke-[2.5px]" />
                </button>
              </div>

              <form onSubmit={handleBudgetSubmit} className="space-y-4">
                <div>
                  <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1 uppercase tracking-wider">
                    CATEGORY INDEX
                  </label>
                  <select
                    value={budgetCategory}
                    onChange={(e) => setBudgetCategory(e.target.value)}
                    className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)] transition-colors"
                  >
                    {budgetCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1 uppercase tracking-wider">
                    LIMIT AMOUNT (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                    className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)] transition-colors"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1 uppercase tracking-wider">
                    BUDGET PERIOD
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBudgetPeriod('monthly')}
                      className={`py-2 border-2 border-[var(--border-color)] font-mono text-[10px] font-bold transition-all shadow-[1.5px_1.5px_0px_var(--shadow-color)] active:translate-y-[1px] active:shadow-none ${
                        budgetPeriod === 'monthly' ? 'bg-[var(--card-bg)] border border-[var(--accent-primary)] text-[var(--accent-primary)]' : 'bg-[var(--bg-surface)] text-[var(--text-primary)]'
                      }`}
                      style={{ cursor: 'pointer' }}
                    >
                      MONTHLY
                    </button>
                    <button
                      type="button"
                      onClick={() => setBudgetPeriod('weekly')}
                      className={`py-2 border-2 border-[var(--border-color)] font-mono text-[10px] font-bold transition-all shadow-[1.5px_1.5px_0px_var(--shadow-color)] active:translate-y-[1px] active:shadow-none ${
                        budgetPeriod === 'weekly' ? 'bg-[var(--card-bg)] border border-[var(--accent-primary)] text-[var(--accent-primary)]' : 'bg-[var(--bg-surface)] text-[var(--text-primary)]'
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
                    className="w-1/2 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border-2 border-[var(--border-color)] py-2.5 font-mono text-xs font-bold text-[var(--text-primary)] shadow-[3px_3px_0px_var(--shadow-color)] active:translate-y-[1.5px] active:shadow-none transition-all"
                    style={{ cursor: 'pointer' }}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-[var(--accent-info)] border-2 border-[var(--border-color)] py-2.5 font-mono text-xs font-bold text-[#000000] shadow-[3px_3px_0px_var(--shadow-color)] hover:shadow-[4px_4px_0px_var(--shadow-color)] active:translate-y-[1.5px] active:shadow-none transition-all"
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
              className="absolute inset-0 bg-[var(--bg-badge)]/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-6 shadow-[8px_8px_0px_var(--shadow-color)] max-w-md w-full relative z-[110]"
            >
              <div className="border-b-4 border-[var(--border-color)] pb-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🗑️</span>
                  <h3 className="font-display text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                    DELETE BUDGET
                  </h3>
                </div>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="p-1 bg-[var(--bg-badge)] text-[var(--text-badge)] hover:bg-zinc-800 border-2 border-[var(--border-color)] transition-colors"
                  style={{ cursor: 'pointer' }}
                >
                  <X className="w-4 h-4 stroke-[2.5px]" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="font-mono text-sm font-bold text-[var(--text-primary)]">
                  Delete this budget?
                </p>
                <p className="font-mono text-[11px] text-[var(--text-muted)]">
                  This will NOT delete any transactions.
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(null)}
                    className="w-1/2 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border-2 border-[var(--border-color)] py-2.5 font-mono text-xs font-bold text-[var(--text-primary)] shadow-[3px_3px_0px_var(--shadow-color)] active:translate-y-[1.5px] active:shadow-none transition-all"
                    style={{ cursor: 'pointer' }}
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteBudget}
                    className="w-1/2 bg-[var(--accent-danger)] border-2 border-[var(--border-color)] py-2.5 font-mono text-xs font-bold text-[#000000] shadow-[3px_3px_0px_var(--shadow-color)] hover:shadow-[4px_4px_0px_var(--shadow-color)] active:translate-y-[1.5px] active:shadow-none transition-all"
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

      {/* EDIT PROFILE MODAL */}
      <AnimatePresence>
        {showEditProfile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditProfile(false)}
              className="absolute inset-0 bg-[var(--bg-badge)]/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-6 shadow-[8px_8px_0px_var(--shadow-color)] max-w-md w-full relative z-[110]"
            >
              <div className="border-b-4 border-[var(--border-color)] pb-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[var(--text-primary)]" />
                  <h3 className="font-display text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                    EDIT PROFILE
                  </h3>
                </div>
                <button
                  onClick={() => setShowEditProfile(false)}
                  className="p-1 bg-[var(--bg-badge)] text-[var(--text-badge)] hover:bg-zinc-800 border-2 border-[var(--border-color)] transition-colors"
                  style={{ cursor: 'pointer' }}
                >
                  <X className="w-4 h-4 stroke-[2.5px]" />
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!editDisplayName.trim()) return;
                try {
                  await updateProfile(auth.userId!, {
                    display_name: editDisplayName.trim(),
                    age: editAge ? Number(editAge) : null,
                    currency: editCurrency,
                    monthly_savings_goal: editSavingsGoal ? Number(editSavingsGoal) : 0,
                  });
                  updatePreferences({
                    name: editDisplayName.trim(),
                    age: editAge ? Number(editAge) : null,
                    currency: editCurrency,
                    monthlySavingsGoal: editSavingsGoal ? Number(editSavingsGoal) : 0,
                  });
                  await auth.refreshProfile();
                  setShowEditProfile(false);
                  triggerNotification('PROFILE UPDATED SUCCESSFULLY.');
                } catch {
                  triggerNotification('ERROR: FAILED TO UPDATE PROFILE.');
                }
              }} className="space-y-4">
                <div>
                  <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1 uppercase tracking-wider">
                    DISPLAY NAME
                  </label>
                  <input
                    type="text"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)] transition-colors"
                    autoFocus
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1 uppercase tracking-wider">
                      AGE <span className="text-[var(--text-muted)] font-normal">(OPTIONAL)</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="150"
                      placeholder="e.g. 28"
                      value={editAge}
                      onChange={(e) => setEditAge(e.target.value)}
                      className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1 uppercase tracking-wider">
                      CURRENCY
                    </label>
                    <select
                      value={editCurrency}
                      onChange={(e) => setEditCurrency(e.target.value)}
                      className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)] transition-colors"
                    >
                      {['INR','USD','EUR','GBP','JPY','CAD','AUD','SGD','AED','CHF'].map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1 uppercase tracking-wider">
                    MONTHLY SAVINGS GOAL <span className="text-[var(--text-muted)] font-normal">(OPTIONAL)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    placeholder="50000"
                    value={editSavingsGoal}
                    onChange={(e) => setEditSavingsGoal(e.target.value)}
                    className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)] transition-colors"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditProfile(false)}
                    className="w-1/2 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border-2 border-[var(--border-color)] py-2.5 font-mono text-xs font-bold text-[var(--text-primary)] shadow-[3px_3px_0px_var(--shadow-color)] active:translate-y-[1.5px] active:shadow-none transition-all"
                    style={{ cursor: 'pointer' }}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 bg-[var(--accent-primary)] border-2 border-[var(--border-color)] py-2.5 font-mono text-xs font-bold text-[#000000] shadow-[3px_3px_0px_var(--shadow-color)] hover:shadow-[4px_4px_0px_var(--shadow-color)] active:translate-y-[1.5px] active:shadow-none transition-all"
                    style={{ cursor: 'pointer' }}
                  >
                    SAVE
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CHANGE PASSWORD MODAL */}
      <AnimatePresence>
        {showChangePassword && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChangePassword(false)}
              className="absolute inset-0 bg-[var(--bg-badge)]/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-6 shadow-[8px_8px_0px_var(--shadow-color)] max-w-md w-full relative z-[110]"
            >
              <div className="border-b-4 border-[var(--border-color)] pb-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-[var(--text-primary)]" />
                  <h3 className="font-display text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                    CHANGE PASSWORD
                  </h3>
                </div>
                <button
                  onClick={() => setShowChangePassword(false)}
                  className="p-1 bg-[var(--bg-badge)] text-[var(--text-badge)] hover:bg-zinc-800 border-2 border-[var(--border-color)] transition-colors"
                  style={{ cursor: 'pointer' }}
                >
                  <X className="w-4 h-4 stroke-[2.5px]" />
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault();
                setPasswordError(null);
                if (newPassword.length < 8) {
                  setPasswordError('Password must be at least 8 characters.');
                  return;
                }
                if (newPassword !== confirmNewPassword) {
                  setPasswordError('Passwords do not match.');
                  return;
                }
                setPasswordLoading(true);
                try {
                  await updatePassword(newPassword);
                  setShowChangePassword(false);
                  triggerNotification('PASSWORD UPDATED SUCCESSFULLY.');
                } catch (err: any) {
                  setPasswordError(err?.message || 'Failed to update password.');
                } finally {
                  setPasswordLoading(false);
                }
              }} className="space-y-4">
                <div>
                  <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1 uppercase tracking-wider">
                    NEW PASSWORD
                  </label>
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)] transition-colors"
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1 uppercase tracking-wider">
                    CONFIRM NEW PASSWORD
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)] transition-colors"
                    required
                  />
                </div>

                {passwordError && (
                  <div className="bg-[var(--accent-danger)] border-2 border-[var(--border-color)] p-2 font-mono text-[11px] font-bold text-[#000000]">
                    [PASSWORD_ERROR]: {passwordError}
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(false)}
                    className="w-1/2 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border-2 border-[var(--border-color)] py-2.5 font-mono text-xs font-bold text-[var(--text-primary)] shadow-[3px_3px_0px_var(--shadow-color)] active:translate-y-[1.5px] active:shadow-none transition-all"
                    style={{ cursor: 'pointer' }}
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="w-1/2 bg-[var(--accent-danger)] border-2 border-[var(--border-color)] py-2.5 font-mono text-xs font-bold text-[#000000] shadow-[3px_3px_0px_var(--shadow-color)] hover:shadow-[4px_4px_0px_var(--shadow-color)] active:translate-y-[1.5px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ cursor: passwordLoading ? 'not-allowed' : 'pointer' }}
                  >
                    {passwordLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-[var(--border-color)] border-t-transparent rounded-full animate-spin" />
                        UPDATING...
                      </>
                    ) : (
                      'UPDATE PASSWORD'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIGN OUT CONFIRMATION */}
      <AnimatePresence>
        {showSignOutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSignOutConfirm(false)}
              className="absolute inset-0 bg-[var(--bg-badge)]/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-6 shadow-[8px_8px_0px_var(--shadow-color)] max-w-md w-full relative z-[110]"
            >
              <div className="border-b-4 border-[var(--border-color)] pb-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LogOut className="w-5 h-5 text-[var(--text-primary)]" />
                  <h3 className="font-display text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">
                    SIGN OUT
                  </h3>
                </div>
                <button
                  onClick={() => setShowSignOutConfirm(false)}
                  className="p-1 bg-[var(--bg-badge)] text-[var(--text-badge)] hover:bg-zinc-800 border-2 border-[var(--border-color)] transition-colors"
                  style={{ cursor: 'pointer' }}
                >
                  <X className="w-4 h-4 stroke-[2.5px]" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="font-mono text-sm font-bold text-[var(--text-primary)]">
                  Are you sure?
                </p>
                <p className="font-mono text-[11px] text-[var(--text-muted)]">
                  You will need to sign in again to access your data.
                </p>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSignOutConfirm(false)}
                    className="w-1/2 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border-2 border-[var(--border-color)] py-2.5 font-mono text-xs font-bold text-[var(--text-primary)] shadow-[3px_3px_0px_var(--shadow-color)] active:translate-y-[1.5px] active:shadow-none transition-all"
                    style={{ cursor: 'pointer' }}
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await auth.signOut();
                    }}
                    className="w-1/2 bg-[var(--accent-danger)] border-2 border-[var(--border-color)] py-2.5 font-mono text-xs font-bold text-[#000000] shadow-[3px_3px_0px_var(--shadow-color)] hover:shadow-[4px_4px_0px_var(--shadow-color)] active:translate-y-[1.5px] active:shadow-none transition-all"
                    style={{ cursor: 'pointer' }}
                  >
                    SIGN OUT
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
