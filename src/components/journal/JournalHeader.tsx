import { motion } from 'motion/react';
import { BookOpen } from 'lucide-react';

export default function JournalHeader() {
  return (
    <div className="lg:col-span-12">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b-4 border-black pb-4"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-black p-2 border border-white">
            <BookOpen className="w-6 h-6 text-[#FFDE4D]" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-black uppercase">Financial Journal</h2>
            <p className="font-mono text-xs text-gray-500">Your financial story, one period at a time.</p>
          </div>
        </div>
        <p className="font-mono text-[10px] text-gray-400 mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </motion.div>
    </div>
  );
}
