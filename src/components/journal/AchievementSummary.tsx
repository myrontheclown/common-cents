import { motion } from 'motion/react';
import { Award } from 'lucide-react';

interface Props {
  onTrack: number;
  total: number;
}

export default function AchievementSummary({ onTrack, total }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.25 }}
      className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
    >
      <h3 className="font-display text-sm font-bold text-black border-b-2 border-black pb-2 mb-3 uppercase tracking-wider flex items-center gap-2">
        <Award className="w-4 h-4" />
        Achievements
      </h3>
      <div className="border-2 border-black p-3 bg-[#FFF8DC]">
        {total > 0 ? (
          <>
            <span className="font-mono text-[9px] text-gray-500 font-bold block uppercase">Budgets on Track</span>
            <span className="font-display text-base font-black text-black">{onTrack}/{total}</span>
            <div className="w-full h-2 border border-black mt-2 bg-gray-100">
              <div className="h-full bg-[#FFDE4D] transition-all" style={{ width: total > 0 ? `${(onTrack / total) * 100}%` : '0%' }} />
            </div>
          </>
        ) : (
          <p className="font-mono text-[11px] text-gray-500">No achievements yet. Set budgets to get started!</p>
        )}
      </div>
    </motion.div>
  );
}
