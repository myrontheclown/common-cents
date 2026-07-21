/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navigation from './components/Navigation';
import CommandCenter from './components/CommandCenter';
import Ledger from './components/Ledger';
import Journal from './components/Journal';
import Wrapped from './components/Wrapped';
import Settings from './components/Settings';
import FloatingHub from './components/FloatingHub';
import { useFinanceStore } from './store';
import type { ThemeMode } from './types';
import { useAuthContext } from './providers/AuthProvider';
import OnboardingModal from './components/OnboardingModal';
import { VaultRepository } from './lib/db/repositories';
import { TransactionRepository } from './lib/db/repositories/TransactionRepository';
import { PaymentMethodRepository } from './lib/db/repositories/PaymentMethodRepository';
import { GoalRepository } from './lib/db/repositories/GoalRepository';
import { SubscriptionRepository } from './lib/db/repositories/SubscriptionRepository';
import { BudgetRepository } from './lib/db/repositories/BudgetRepository';
import { AchievementRepository } from './lib/db/repositories/AchievementRepository';
import { vaultRowToAccount } from './lib/db/types';
import { Account } from './types';
import { transactionRowToTransaction } from './lib/db/transactionTypes';
import { paymentMethodRowToPaymentMethod } from './lib/db/paymentMethodTypes';
import { goalRowToGoal } from './lib/db/goalTypes';
import { subscriptionRowToSubscription } from './lib/db/subscriptionTypes';
import { budgetRowToBudget } from './lib/db/budgetTypes';
import { mergeAchievements } from './lib/db/achievementTypes';

const vaultRepo = new VaultRepository();
const transactionRepo = new TransactionRepository();
const paymentMethodRepo = new PaymentMethodRepository();
const goalRepo = new GoalRepository();
const subscriptionRepo = new SubscriptionRepository();
const budgetRepo = new BudgetRepository();
const achievementRepo = new AchievementRepository();

export default function App() {
  const auth = useAuthContext();
  const [activeTab, setActiveTab] = useState<string>('command_center');
  const [pendingVaultEdit, setPendingVaultEdit] = useState<Account | null>(null);
  const { preferences, transactions, recalculateStreak, resetAllData, updatePreferences, setAccounts, setVaultsHydrated, setTransactions, setTransactionsHydrated, setPaymentMethods, setPaymentMethodsHydrated, setGoals, setGoalsHydrated, setSubscriptions, setSubscriptionsHydrated, setBudgets, setBudgetsHydrated, setAchievements, setAchievementsHydrated } = useFinanceStore();
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [lastNotificationDate, setLastNotificationDate] = useState<string>('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  const prevUserIdRef = useRef<string | null>(null);

  // Theme application
  useEffect(() => {
    const theme = preferences.theme;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [preferences.theme]);

  // Reset all data when user ID changes to prevent stale data from previous user
  useEffect(() => {
    if (!auth.userId) return;
    if (prevUserIdRef.current !== null && prevUserIdRef.current !== auth.userId) {
      resetAllData();
    }
    prevUserIdRef.current = auth.userId;
  }, [auth.userId, resetAllData]);

  useEffect(() => {
    recalculateStreak();
  }, [recalculateStreak]);

  // Onboarding modal (for both Email and Google signups)
  useEffect(() => {
    if (auth.profile && auth.profile.onboarding_completed === false) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [auth.profile]);

  // Sync profile data to Zustand preferences when profile changes
  useEffect(() => {
    const p = auth.profile;
    if (!p) return;
    updatePreferences({
      name: p.display_name,
      age: p.age,
      currency: p.currency,
      monthlySavingsGoal: p.monthly_savings_goal,
    });
  }, [auth.profile, updatePreferences]);

  useEffect(() => {
    const userId = auth.userId;
    if (!userId) return;

    (async () => {
      try {
        const vaults = await vaultRepo.getVaults(userId);
        setAccounts(vaults.map(vaultRowToAccount));
      } catch (err) {
        console.error("VAULT HYDRATION FAILED", err);
      } finally {
        setVaultsHydrated(true);
      }
    })();
  }, [auth.userId, setAccounts, setVaultsHydrated]);

  useEffect(() => {
    const userId = auth.userId;
    if (!userId) return;

    (async () => {
      try {
        const rows = await transactionRepo.getTransactions(userId);
        setTransactions(rows.map(transactionRowToTransaction));
      } catch (err) {
        console.error("TRANSACTION HYDRATION FAILED", err);
      } finally {
        setTransactionsHydrated(true);
      }
    })();
  }, [auth.userId, setTransactions, setTransactionsHydrated]);

  useEffect(() => {
    const userId = auth.userId;
    if (!userId) return;

    (async () => {
      try {
        const rows = await paymentMethodRepo.getPaymentMethods(userId);
        setPaymentMethods(rows.map(paymentMethodRowToPaymentMethod));
      } catch (err) {
        console.error("PAYMENT METHOD HYDRATION FAILED", err);
      } finally {
        setPaymentMethodsHydrated(true);
      }
    })();
  }, [auth.userId, setPaymentMethods, setPaymentMethodsHydrated]);

  useEffect(() => {
    const userId = auth.userId;
    if (!userId) return;

    (async () => {
      try {
        const rows = await goalRepo.getGoals(userId);
        setGoals(rows.map(goalRowToGoal));
      } catch (err) {
        console.error("GOAL HYDRATION FAILED", err);
      } finally {
        setGoalsHydrated(true);
      }
    })();
  }, [auth.userId, setGoals, setGoalsHydrated]);

  useEffect(() => {
    const userId = auth.userId;
    if (!userId) return;

    (async () => {
      try {
        const rows = await subscriptionRepo.getSubscriptions(userId);
        setSubscriptions(rows.map(subscriptionRowToSubscription));
      } catch (err) {
        console.error("SUBSCRIPTION HYDRATION FAILED", err);
      } finally {
        setSubscriptionsHydrated(true);
      }
    })();
  }, [auth.userId, setSubscriptions, setSubscriptionsHydrated]);

  useEffect(() => {
    const userId = auth.userId;
    if (!userId) return;

    (async () => {
      try {
        const rows = await budgetRepo.getBudgets(userId);
        setBudgets(rows.map(budgetRowToBudget));
      } catch (err) {
        console.error("BUDGET HYDRATION FAILED", err);
      } finally {
        setBudgetsHydrated(true);
      }
    })();
  }, [auth.userId, setBudgets, setBudgetsHydrated]);

  useEffect(() => {
    const userId = auth.userId;
    if (!userId) return;

    (async () => {
      try {
        const [achievementRows, userAchievementRows] = await Promise.all([
          achievementRepo.getAchievements(),
          achievementRepo.getUserAchievements(userId),
        ]);
        setAchievements(mergeAchievements(achievementRows, userAchievementRows));
      } catch (err) {
        console.error("ACHIEVEMENT HYDRATION FAILED", err);
      } finally {
        setAchievementsHydrated(true);
      }
    })();
  }, [auth.userId, setAchievements, setAchievementsHydrated]);

  // Request browser notification permission if enabled and default
  useEffect(() => {
    if (preferences?.reminderEnabled && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [preferences?.reminderEnabled]);



  // Daily Reminder background checker
  useEffect(() => {
    if (!preferences?.reminderEnabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      const targetTimeStr = preferences.reminderTime || '21:30';
      const todayStr = now.toISOString().split('T')[0];

      if (currentTimeStr === targetTimeStr && lastNotificationDate !== todayStr) {
        // Check if there are any transactions logged for today
        const todayTxs = transactions.filter(t => t.date === todayStr);
        if (todayTxs.length === 0) {
          setLastNotificationDate(todayStr);
          
          // 1. Playful browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              const notification = new Notification('COMMON CENTS', {
                body: "Did you record today's transactions?",
                tag: 'daily-reminder',
                requireInteraction: true
              });
              notification.onclick = () => {
                window.focus();
                setIsReminderModalOpen(true);
              };
            } catch (err) {
              console.error('Failed to trigger native notification:', err);
            }
          }
          
          // 2. Always show in-app notification popup as well so user doesn't miss it
          setIsReminderModalOpen(true);
        }
      }
    }, 15000); // Check every 15 seconds for precision

    return () => clearInterval(interval);
  }, [preferences?.reminderEnabled, preferences?.reminderTime, transactions, lastNotificationDate]);

  // Listen for test reminder triggers from settings
  useEffect(() => {
    const handleTestReminder = () => {
      setIsReminderModalOpen(true);
    };
    window.addEventListener('trigger-test-reminder', handleTestReminder);
    return () => window.removeEventListener('trigger-test-reminder', handleTestReminder);
  }, []);

  // Listen for vault edit requests (dispatched from Command Center vault cards)
  useEffect(() => {
    const handleEditVault = (e: Event) => {
      const acc = (e as CustomEvent).detail as Account;
      setPendingVaultEdit(acc);
      setActiveTab('settings');
    };
    window.addEventListener('open-edit-vault', handleEditVault);
    return () => window.removeEventListener('open-edit-vault', handleEditVault);
  }, []);

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'command_center':
        return <CommandCenter onNavigateToLedger={() => setActiveTab('ledger')} />;
      case 'ledger':
        return <Ledger />;
      case 'insights':
        return <Journal />;
      case 'wrapped':
        return <Wrapped />;
      case 'settings':
        return <Settings pendingVaultEdit={pendingVaultEdit} onClearPendingVaultEdit={() => setPendingVaultEdit(null)} />;
      default:
        return <CommandCenter onNavigateToLedger={() => setActiveTab('ledger')} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] pb-32 flex flex-col font-sans selection:bg-[var(--accent-primary)] selection:text-[#000000]">
      {/* GLOBAL SYSTEM BAR */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* CONTENT AREA WITH MICRO-ANIMATIONS */}
      <main className="flex-grow w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="w-full"
          >
            {renderActiveComponent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* GLOBAL FLOATING ACTION ENGINE HUB */}
      <FloatingHub />

      {/* FOOTER RAILS */}
      <footer className="w-full text-center mt-12 py-6 border-t-4 border-[var(--border-color)] bg-[var(--bg-surface)]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-[var(--text-muted)]">
          <span className="uppercase font-bold tracking-widest text-[var(--text-primary)]">
            COMMON CENTS
          </span>
          <span className="uppercase">
            DESIGNED WITH NEUBRUTALIST PRECISION // ALL LOCAL DRIVES SECURED
          </span>
        </div>
      </footer>

      {/* ONBOARDING MODAL (Email & Google) */}
      {showOnboarding && auth.profile && auth.userId && (
        <OnboardingModal
          userId={auth.userId}
          prefillName={auth.profile.display_name}
          onComplete={() => {
            setShowOnboarding(false);
            auth.refreshProfile();
          }}
        />
      )}

      {/* DAILY REMINDER IN-APP DIALOG */}
      <AnimatePresence>
        {isReminderModalOpen && (
          <div className="fixed inset-0 bg-[var(--bg-badge)]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="max-w-md w-full bg-[var(--bg-page)] border-4 border-[var(--border-color)] p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)] relative"
            >
              {/* STYLISH CORNER BOXES FOR NEUBRUTALISM */}
              <div className="absolute top-[-10px] left-4 bg-[var(--bg-badge)] text-[var(--text-badge)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest border border-[var(--border-color)]">
                SYSTEM PROMPT
              </div>
              
              <div className="flex items-start gap-4 mt-2">
                <div className="bg-[var(--accent-primary)] border-3 border-[var(--border-color)] p-3 shadow-[2px_2px_0px_0px_var(--shadow-color)] flex-shrink-0">
                  <span className="text-2xl">⏰</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight uppercase">COMMON CENTS</h3>
                  <p className="text-[var(--text-primary)] font-medium mt-2 text-sm leading-relaxed">
                    Did you record today's transactions?
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsReminderModalOpen(false)}
                  className="px-4 py-2 border-3 border-[var(--border-color)] bg-[var(--bg-surface)] font-mono text-xs uppercase font-bold hover:bg-[var(--bg-hover)] shadow-[2px_2px_0px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    setIsReminderModalOpen(false);
                    window.dispatchEvent(new CustomEvent('open-add-transaction'));
                  }}
                  className="px-4 py-2 border-3 border-[var(--border-color)] bg-[var(--accent-primary)] font-mono text-xs uppercase font-bold shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                >
                  Add Transaction
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
