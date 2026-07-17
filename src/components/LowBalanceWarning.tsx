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
        className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-md w-full relative z-[210]">
        <div className="border-b-4 border-black pb-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h3 className="font-display text-xl font-black text-black uppercase tracking-tight">
              LOW VAULT BALANCE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 bg-black text-white hover:bg-zinc-800 border-2 border-black transition-colors"
            style={{ cursor: 'pointer' }}
          >
            <X className="w-4 h-4 stroke-[2.5px]" />
          </button>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <div className="bg-gray-50 border-2 border-black p-3 space-y-2">
            <div className="flex justify-between">
              <span className="font-bold text-gray-600">Current Balance</span>
              <span className="font-bold text-black">{fmt(currentBalance)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-gray-600">Transaction</span>
              <span className="font-bold text-red-600">-{fmt(transactionAmount)}</span>
            </div>
            <div className="border-t border-black/20 pt-2 flex justify-between">
              <span className="font-bold text-gray-600">Balance After</span>
              <span className="font-bold text-red-600">{fmt(projectedBalance)}</span>
            </div>
          </div>

          <div className="bg-[#FF9F9F] border-2 border-black p-2.5 font-mono text-[10px] font-bold text-black text-center uppercase">
            This transaction will overdraw this vault.
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/2 bg-white hover:bg-gray-50 border-2 border-black py-2.5 font-mono text-xs font-bold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all"
            style={{ cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-1/2 bg-[#FF78C4] hover:bg-pink-400 border-2 border-black py-2.5 font-mono text-xs font-bold text-black shadow-[3px_3px_0px_rgba(0,0,0,1)] active:translate-y-[1.5px] active:shadow-none transition-all"
            style={{ cursor: 'pointer' }}
          >
            Proceed Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
