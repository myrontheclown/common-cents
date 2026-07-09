import { motion } from 'motion/react';
import { Bot, Sparkles } from 'lucide-react';

export default function AiCoachPlaceholder() {
  return (
    <div className="lg:col-span-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
        className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
      >
        <h3 className="font-display text-sm font-bold text-black border-b-2 border-black pb-2 mb-3 uppercase tracking-wider flex items-center gap-2">
          <Bot className="w-4 h-4" />
          AI Coach
        </h3>
        <div className="border-2 border-black p-4 bg-[#F0F9FF]">
          <p className="font-mono text-[11px] text-gray-600 leading-relaxed">
            <Sparkles className="w-3 h-3 inline-block mr-1 text-blue-500" />
            AI Coach coming soon! You'll get personalized financial advice and insights powered by your transaction data.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
