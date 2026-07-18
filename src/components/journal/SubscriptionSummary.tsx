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
      className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
    >
      <h3 className="font-display text-sm font-bold text-black border-b-2 border-black pb-2 mb-3 uppercase tracking-wider flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        Subscriptions
      </h3>
      <div className="space-y-2">
        {active.length > 0 ? (
          <>
            <div className="border-2 border-black p-2.5 bg-[#F3E8FF]">
              <span className="font-mono text-[9px] text-gray-500 font-bold block uppercase">Monthly Cost</span>
              <span className="font-display text-sm font-black text-black">{formatCurrency(monthlyCost)}</span>
            </div>
            <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
              {active.map(sub => (
                <div key={sub.id} className="border border-black p-2 flex items-center justify-between bg-white">
                  <span className="font-mono text-[10px] font-bold text-black">{sub.service_name}</span>
                  <span className="font-mono text-[10px] text-gray-600">
                    ₹{sub.amount.toLocaleString('en-IN')}/{sub.billing_cycle === 'yearly' ? 'yr' : 'mo'}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="font-mono text-[11px] text-gray-500 py-2">No active subscriptions.</p>
        )}
      </div>
    </motion.div>
  );
}
