import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

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

interface AuthPageProps {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string, onboarding: {
    displayName: string;
    age?: number | null;
    currency?: string;
    monthlySavingsGoal?: number;
  }) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
}

type AuthMode = 'signin' | 'signup';

export default function AuthPage({ onSignIn, onSignUp, onGoogleSignIn }: AuthPageProps) {
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [age, setAge] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [monthlySavingsGoal, setMonthlySavingsGoal] = useState('50000');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    if (!email.trim()) { setError('Email address is required.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Please enter a valid email address.'); return false; }
    if (!password) { setError('Password is required.'); return false; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return false; }
    if (mode === 'signup') {
      if (!displayName.trim()) { setError('Display name is required.'); return false; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return false; }
      if (age && (isNaN(Number(age)) || Number(age) <= 0)) { setError('Age must be a positive number.'); return false; }
      if (monthlySavingsGoal && (isNaN(Number(monthlySavingsGoal)) || Number(monthlySavingsGoal) < 0)) { setError('Monthly savings goal must be 0 or greater.'); return false; }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (mode === 'signin') {
        await onSignIn(email, password);
      } else {
        await onSignUp(email, password, {
          displayName: displayName.trim(),
          age: age ? Number(age) : null,
          currency,
          monthlySavingsGoal: monthlySavingsGoal ? Number(monthlySavingsGoal) : undefined,
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await onGoogleSignIn();
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(m => m === 'signin' ? 'signup' : 'signin');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-8 shadow-[12px_12px_0px_0px_var(--shadow-color)]">
          {/* BRANDING */}
          <div className="text-center mb-8">
            <div className="bg-[var(--accent-primary)] border-2 border-[var(--border-color)] p-2 inline-block mb-4 shadow-[3px_3px_0px_var(--shadow-color)]">
              <span className="font-display text-2xl font-black tracking-tight text-[var(--text-primary)]">
                C.C
              </span>
            </div>
            <h1 className="font-display text-3xl font-black text-[var(--text-primary)] tracking-tight uppercase">
              COMMON CENTS
            </h1>
            <p className="font-mono text-xs text-[var(--text-muted)] mt-2 uppercase tracking-wider">
              Own your money. Not the other way around.
            </p>
          </div>

          {/* GOOGLE AUTH */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border-3 border-[var(--border-color)] py-3 px-4 font-mono text-xs font-bold text-[var(--text-primary)] shadow-[4px_4px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_0px_var(--shadow-color)] mb-6"
            style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>CONTINUE WITH GOOGLE</span>
          </button>

          {/* OR DIVIDER */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-grow border-t-2 border-[var(--border-color)]" />
            <span className="font-mono text-[10px] font-bold text-[var(--text-primary)] uppercase tracking-widest">OR</span>
            <div className="flex-grow border-t-2 border-[var(--border-color)]" />
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="name"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1 uppercase tracking-wider">
                    DISPLAY NAME
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Rivera"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2.5 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)] transition-colors"
                    autoFocus={mode === 'signup'}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1 uppercase tracking-wider">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2.5 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)] transition-colors"
                autoFocus={mode === 'signin'}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1 uppercase tracking-wider">
                PASSWORD
              </label>
              <input
                type="password"
                placeholder={mode === 'signup' ? 'Minimum 8 characters' : 'Enter your password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2.5 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)] transition-colors"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
            </div>

            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="confirm"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <label className="font-mono text-[10px] font-bold text-[var(--text-primary)] block mb-1 uppercase tracking-wider">
                    CONFIRM PASSWORD
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[var(--bg-surface)] border-2 border-[var(--border-color)] p-2.5 font-mono text-xs outline-none focus:bg-[var(--bg-input-focus)] transition-colors"
                    autoComplete="new-password"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ONBOARDING FIELDS (Sign-up only) */}
            <AnimatePresence mode="wait">
              {mode === 'signup' && (
                <motion.div
                  key="onboarding"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t-2 border-[var(--border-color)] pt-4 mt-1"
                >
                  <span className="font-mono text-[9px] font-bold text-[var(--text-muted)] block mb-3 uppercase tracking-wider">
                    OPTIONAL PERSONALIZATION
                  </span>

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
                        CURRENCY <span className="text-[var(--text-muted)] font-normal">(OPTIONAL)</span>
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

                  <div className="mt-3">
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
                </motion.div>
              )}
            </AnimatePresence>

            {/* ERROR */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-[var(--accent-danger)] border-2 border-[var(--border-color)] p-2.5 font-mono text-[11px] font-bold text-[#000000]"
                >
                  <span className="text-[var(--text-primary)]">[AUTH_ERROR]:</span> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[var(--accent-primary)] border-3 border-[var(--border-color)] py-3 font-display text-sm font-bold text-[#000000] shadow-[4px_4px_0px_var(--shadow-color)] hover:shadow-[5px_5px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_0px_var(--shadow-color)] flex items-center justify-center gap-2"
              style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[var(--border-color)] border-t-transparent rounded-full animate-spin" />
                  <span>{mode === 'signin' ? 'SIGNING IN...' : 'CREATING ACCOUNT...'}</span>
                </>
              ) : (
                <span>{mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}</span>
              )}
            </button>
          </form>

          {/* MODE TOGGLE */}
          <div className="mt-6 text-center">
            <button
              onClick={switchMode}
              className="font-mono text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] underline underline-offset-2 transition-colors"
              style={{ cursor: 'pointer' }}
            >
              {mode === 'signin' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-6 text-center">
          <p className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-widest">
            Designed with Neubrutalist precision
          </p>
        </div>
      </motion.div>
    </div>
  );
}
