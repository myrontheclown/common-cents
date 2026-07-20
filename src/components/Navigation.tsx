/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useFinanceStore } from '../store';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navigation({ activeTab, setActiveTab }: NavigationProps) {
  const { preferences, achievements } = useFinanceStore();
  
  // Calculate total achievement points from unlocked ones
  const totalPoints = achievements
    .filter(a => a.isUnlocked)
    .reduce((sum, a) => sum + a.points, 0);

  const navItems = [
    { id: 'command_center', label: 'Command', emoji: '🏠' },
    { id: 'ledger', label: 'Ledger', emoji: '💸' },
    { id: 'insights', label: 'Journal', emoji: '📖' },
    { id: 'wrapped', label: 'Wrapped', emoji: '🎵' },
    { id: 'settings', label: 'Settings', emoji: '⚙️' },
  ];

  return (
    <>
      {/* MINIMALIST TOP BRAND BAR */}
      <div className="w-full bg-[var(--bg-surface)] border-b-4 border-[var(--border-color)] p-4 mb-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--accent-primary)] p-1.5 border-2 border-[var(--border-color)] shadow-[2px_2px_0px_var(--shadow-color)] font-mono text-xs font-bold">
              C.C
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-[var(--text-primary)] flex items-center gap-2">
                COMMON CENTS
                <span className="font-mono text-[9px] bg-[var(--bg-badge)] text-[var(--text-badge)] px-1.5 py-0.2">
                  v1.0.0
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="bg-[var(--accent-success)] border-2 border-[var(--border-color)] px-2 py-0.5 font-mono text-[10px] font-bold text-[#000000] shadow-[1.5px_1.5px_0px_var(--shadow-color)]">
              {totalPoints} PTS
            </div>
            <div className="bg-[var(--accent-info)] border-2 border-[var(--border-color)] px-2 py-0.5 font-display text-[10px] font-bold text-[#000000] shadow-[1.5px_1.5px_0px_var(--shadow-color)] whitespace-nowrap">
              {preferences.name ? `Hello, ${preferences.name}` : 'HELLO, USER'}
            </div>
          </div>
        </div>
      </div>

      {/* FLOATING NAVIGATION DOCK */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[95vw]">
        <nav className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-2 flex items-center gap-1.5 sm:gap-3 shadow-[6px_6px_0px_var(--shadow-color)] rounded-none overflow-x-auto whitespace-nowrap">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 font-display text-xs sm:text-sm font-extrabold border-2 border-[var(--border-color)] transition-all ${
                  isActive
                    ? 'bg-[var(--accent-primary)] text-[#000000] translate-x-[1px] translate-y-[1px] shadow-none'
                    : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] shadow-[2.5px_2.5px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
                }`}
                style={{ cursor: 'pointer' }}
              >
                <span>{item.emoji}</span>
                <span className="font-bold">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}

