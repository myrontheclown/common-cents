import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface LowBalanceWarningProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  currentBalance: number;
  transactionAmount: number;
  projectedBalance: number;
}

export default function LowBalanceWarning({
  isOpen,
  onClose,
  onConfirm,
  currentBalance,
  transactionAmount,
  projectedBalance,
}: LowBalanceWarningProps) {
  if (!isOpen) return null;

  const fmt = (val: number) =>
    `₹${Math.abs(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[var(--bg-badge)]/60 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-6 shadow-[8px_8px_0px_var(--shadow-color)] max-w-md w-full relative z-[210]">
        <div className="border-b-4 border-[var(--border-color)] pb-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-display text-xl font-black text-[var(--text-primary)] uppercase tracking-tight">
              LOW VAULT BALANCE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-[var(--bg-badge)] text-[var(--text-badge)] hover:bg-zinc-800 border-2 border-[var(--border-color)] transition-colors"
            style={{ cursor: 'pointer' }}
          >
            <X className="w-4 h-4 stroke-[2.5px]" />
          </button>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="bg-[var(--bg-muted)] border-2 border-[var(--border-color)] p-3 space-y-2">
            <div className="flex justify-between">
              <span className="font-bold text-[var(--text-muted)]">Current Balance</span>
              <span className="font-bold text-[var(--text-primary)]">{fmt(currentBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-[var(--text-muted)]">Transaction</span>
              <span className="font-bold text-red-600">-{fmt(transactionAmount)}</span>
            </div>
            <div className="border-t border-[var(--border-color)]/20 pt-2 flex justify-between">
              <span className="font-bold text-[var(--text-muted)]">Balance After</span>
              <span className="font-bold text-red-600">{fmt(projectedBalance)}</span>
            </div>
          </div>

          <div className="bg-[var(--card-bg)] border-2 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-danger)] p-2.5 font-mono text-[10px] font-bold text-[var(--accent-danger)] text-center uppercase">
            This transaction will overdraw this vault.
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border-2 border-[var(--border-color)] py-2.5 font-mono text-xs font-bold text-[var(--text-primary)] shadow-[3px_3px_0px_var(--shadow-color)] active:translate-y-[1.5px] active:shadow-none transition-all"
            style={{ cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-1/2 bg-[var(--accent-danger)] border-2 border-[var(--border-color)] py-2.5 font-mono text-xs font-bold text-[#000000] shadow-[3px_3px_0px_var(--shadow-color)] hover:shadow-[4px_4px_0px_var(--shadow-color)] active:translate-y-[1.5px] active:shadow-none transition-all"
            style={{ cursor: 'pointer' }}
          >
            Proceed Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
