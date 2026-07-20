import { createContext, useContext, type ReactNode } from 'react';
import { useAuth, type AuthState } from '../hooks/useAuth';
import AuthPage from '../components/AuthPage';

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[var(--border-color)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  if (auth.error) {
    return (
      <div className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-4">
        <div className="border-4 border-[var(--border-color)] p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)] max-w-md text-center">
          <p className="font-bold text-lg mb-2">Connection Error</p>
          <p className="font-mono text-xs text-[var(--text-muted)] mb-4">
            {auth.error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border-3 border-[var(--border-color)] bg-[var(--accent-primary)] font-mono text-xs uppercase font-bold shadow-[3px_3px_0px_0px_var(--shadow-color)] hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!auth.user) {
    return (
      <AuthPage
        onSignIn={auth.signIn}
        onSignUp={auth.signUp}
        onGoogleSignIn={auth.signInWithGoogle}
      />
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthState {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
