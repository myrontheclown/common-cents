/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navigation from './components/Navigation';
import CommandCenter from './components/CommandCenter';
import Ledger from './components/Ledger';
import Insights from './components/Insights';
import Wrapped from './components/Wrapped';
import Settings from './components/Settings';
import FloatingHub from './components/FloatingHub';
import { useFinanceStore } from './store';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('command_center');
  const { preferences, transactions, recalculateStreak } = useFinanceStore();
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [lastNotificationDate, setLastNotificationDate] = useState<string>('');

  useEffect(() => {
    recalculateStreak();
  }, [recalculateStreak]);

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

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'command_center':
        return <CommandCenter onNavigateToLedger={() => setActiveTab('ledger')} />;
      case 'ledger':
        return <Ledger />;
      case 'insights':
        return <Insights />;
      case 'wrapped':
        return <Wrapped />;
      case 'settings':
        return <Settings />;
      default:
        return <CommandCenter onNavigateToLedger={() => setActiveTab('ledger')} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-black pb-32 flex flex-col font-sans selection:bg-[#FFDE4D] selection:text-black">
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
      <footer className="w-full text-center mt-12 py-6 border-t-4 border-black bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-gray-500">
          <span className="uppercase font-bold tracking-widest text-black">
            COMMON CENTS
          </span>
          <span className="uppercase">
            DESIGNED WITH NEUBRUTALIST PRECISION // ALL LOCAL DRIVES SECURED
          </span>
        </div>
      </footer>

      {/* DAILY REMINDER IN-APP DIALOG */}
      <AnimatePresence>
        {isReminderModalOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="max-w-md w-full bg-[#FAF6F0] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative"
            >
              {/* STYLISH CORNER BOXES FOR NEUBRUTALISM */}
              <div className="absolute top-[-10px] left-4 bg-black text-white px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest border border-black">
                SYSTEM PROMPT
              </div>
              
              <div className="flex items-start gap-4 mt-2">
                <div className="bg-[#FF6B6B] border-3 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
                  <span className="text-2xl">⏰</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight uppercase">COMMON CENTS</h3>
                  <p className="text-gray-700 font-medium mt-2 text-sm leading-relaxed">
                    Did you record today's transactions?
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsReminderModalOpen(false)}
                  className="px-4 py-2 border-3 border-black bg-white font-mono text-xs uppercase font-bold hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    setIsReminderModalOpen(false);
                    window.dispatchEvent(new CustomEvent('open-add-transaction'));
                  }}
                  className="px-4 py-2 border-3 border-black bg-[#FFDE4D] font-mono text-xs uppercase font-bold hover:bg-[#ffe570] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
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
