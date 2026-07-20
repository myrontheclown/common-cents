import { useState } from 'react';
import { motion } from 'motion/react';
import { updateProfile } from '../lib/auth';
import { useFinanceStore } from '../store';

const CURRENCIES = [
  { value: 'INR', label: 'INR (₹)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'JPY', label: 'JPY (¥)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
  { value: 'SGD', label: 'SGD (S$)' },
  { value: 'AED', label: 'AED (د.إ)' },
  { value: 'CHF', label: 'CHF (Fr)' },
];

interface GoogleOnboardingModalProps {
  userId: string;
  prefillName: string;
  onComplete: () => void;
}

export default function GoogleOnboardingModal({ userId, prefillName, onComplete }: GoogleOnboardingModalProps) {
  const [displayName, setDisplayName] = useState(prefillName);
  const [age, setAge] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [monthlySavingsGoal, setMonthlySavingsGoal] = useState('50000');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const updatePreferences = useFinanceStore(s => s.updatePreferences);

  const handleSave = async () => {
    if (!displayName.trim()) { setError('Display name is required.'); return; }
    if (age && (isNaN(Number(age)) || Number(age) <= 0)) { setError('Age must be a positive number.'); return; }
    if (monthlySavingsGoal && (isNaN(Number(monthlySavingsGoal)) || Number(monthlySavingsGoal) < 0)) { setError('Monthly savings goal must be 0 or greater.'); return; }
    setError(null);
    setSaving(true);
    try {
      await updateProfile(userId, {
        display_name: displayName.trim(),
        age: age ? Number(age) : null,
        currency,
        monthly_savings_goal: monthlySavingsGoal ? Number(monthlySavingsGoal) : 0,
        onboarding_completed: true,
      });
      updatePreferences({
        name: displayName.trim(),
        age: age ? Number(age) : null,
        currency,
        monthlySavingsGoal: monthlySavingsGoal ? Number(monthlySavingsGoal) : 0,
      });
      onComplete();
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg-badge)]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', duration: 0.4 }}
        className="max-w-lg w-full bg-[var(--bg-page)] border-4 border-[var(--border-color)] p-8 shadow-[12px_12px_0px_0px_var(--shadow-color)]"
      >
        <div className="text-center mb-6">
          <div className="bg-[var(--accent-primary)] border-2 border-[var(--border-color)] p-2 inline-block mb-4 shadow-[3px_3px_0px_var(--shadow-color)]">
            <span className="font-display text-2xl font-black tracking-tight text-[var(--text-primary)]">C.C</span>
          </div>
          <h2 className="font-display text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight">
            WELCOME TO COMMON CENTS
          </h2>
          <p className="font-mono text-xs text-[var(--text-muted)] mt-2 uppercase tracking-wider">
            Let's personalise your experience
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1 uppercase tracking-wider">
              DISPLAY NAME
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2.5 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)] transition-colors"
              autoFocus
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
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2.5 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)] transition-colors"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1 uppercase tracking-wider">
                CURRENCY
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2.5 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)] transition-colors"
              >
                {CURRENCIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
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
              value={monthlySavingsGoal}
              onChange={(e) => setMonthlySavingsGoal(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2.5 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)] transition-colors"
            />
          </div>
        </div>

        {error && (
          <div className="bg-[var(--accent-danger)] border-2 border-[var(--border-color)] p-2.5 font-mono text-[11px] font-bold text-[#000000] mt-4">
            <span className="text-[var(--text-primary)]">[ERROR]:</span> {error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-[var(--accent-primary)] border-3 border-[var(--border-color)] py-3 font-display text-sm font-bold text-[#000000] shadow-[4px_4px_0px_var(--shadow-color)] hover:shadow-[5px_5px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-[var(--border-color)] border-t-transparent rounded-full animate-spin" />
                <span>SAVING...</span>
              </>
            ) : (
              <span>GET STARTED</span>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
