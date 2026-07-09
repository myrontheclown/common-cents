import { motion } from 'motion/react';
import { CreditCard } from 'lucide-react';
import type { PaymentMethod } from '../../types';

interface Props {
  paymentMethods: PaymentMethod[];
  mostUsed: { name: string; count: number } | null;
}

export default function PaymentSummary({ paymentMethods, mostUsed }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
    >
      <h3 className="font-display text-sm font-bold text-black border-b-2 border-black pb-2 mb-3 uppercase tracking-wider flex items-center gap-2">
        <CreditCard className="w-4 h-4" />
        Top Payment Method
      </h3>
      {mostUsed ? (
        <div className="border-2 border-black p-2.5 bg-[#A5F3FC]/20">
          <span className="font-mono text-[9px] text-gray-500 font-bold block uppercase">Most Used</span>
          <span className="font-display text-sm font-black text-black">{mostUsed.name}</span>
          <span className="font-mono text-[10px] text-gray-500 block">{mostUsed.count} transactions</span>
        </div>
      ) : (
        <p className="font-mono text-[11px] text-gray-500 py-2">No payment method data for this period.</p>
      )}
    </motion.div>
  );
}
