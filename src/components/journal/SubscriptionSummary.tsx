import { motion } from 'motion/react';
import { CreditCard } from 'lucide-react';
import type { Subscription } from '../../types';
import { formatCurrency } from '../../lib/analytics/dateRanges';

interface Props {
  subscriptions: Subscription[];
  monthlyCost: number;
}

export default function SubscriptionSummary({ subscriptions, monthlyCost }: Props) {
  const active = subscriptions.filter(s => s.active);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]"
    >
      <h3 className="font-display text-sm font-bold text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 mb-3 uppercase tracking-wider flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        Subscriptions
      </h3>
      <div className="space-y-2">
        {active.length > 0 ? (
          <>
            <div className="border-2 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-purple)] p-2.5 bg-[var(--card-bg)]">
              <span className="font-mono text-[9px] text-[var(--text-muted)] font-bold block uppercase">Monthly Cost</span>
              <span className="font-display text-sm font-black text-[var(--text-primary)]">{formatCurrency(monthlyCost)}</span>
            </div>
            <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
              {active.map(sub => (
                <div key={sub.id} className="border border-[var(--border-color)] p-2 flex items-center justify-between bg-[var(--bg-surface)]">
                  <span className="font-mono text-[10px] font-bold text-[var(--text-primary)]">{sub.service_name}</span>
                  <span className="font-mono text-[10px] text-[var(--text-muted)]">
                    ₹{sub.amount.toLocaleString('en-IN')}/{sub.billing_cycle === 'yearly' ? 'yr' : 'mo'}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="font-mono text-[11px] text-[var(--text-muted)] py-2">No active subscriptions.</p>
        )}
      </div>
    </motion.div>
  );
}
