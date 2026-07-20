import { motion } from 'motion/react';
import { CreditCard } from 'lucide-react';
import type { PaymentMethod } from '../../types';
import { getPaymentMethodIcon } from '../../lib/paymentMethodIcons';

interface Props {
  paymentMethods: PaymentMethod[];
  mostUsed: { name: string; count: number } | null;
}

export default function PaymentSummary({ paymentMethods, mostUsed }: Props) {
  const mostUsedPm = mostUsed
    ? paymentMethods.find(p => p.name === mostUsed.name)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]"
    >
      <h3 className="font-display text-sm font-bold text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 mb-3 uppercase tracking-wider flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        Top Payment Method
      </h3>
      {mostUsed ? (
        <div className="border-2 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-info)] p-2.5 bg-[var(--card-bg)]">
          <span className="font-mono text-[9px] text-[var(--text-muted)] font-bold block uppercase">Most Used</span>
          <span className="font-display text-sm font-black text-[var(--text-primary)] flex items-center gap-2">
            {getPaymentMethodIcon(mostUsedPm?.icon)} {mostUsed.name}
          </span>
          <span className="font-mono text-[10px] text-[var(--text-muted)] block">{mostUsed.count} transactions</span>
        </div>
      ) : (
        <p className="font-mono text-[11px] text-[var(--text-muted)] py-2">No payment method data for this period.</p>
      )}
    </motion.div>
  );
}
