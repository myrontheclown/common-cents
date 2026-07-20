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
      className="bg-[var(--bg-surface)] border-4 border-[var(--border-color)] p-5 shadow-[4px_4px_0px_var(--shadow-color)]"
    >
      <h3 className="font-display text-sm font-bold text-[var(--text-primary)] border-b-2 border-[var(--border-color)] pb-2 mb-3 uppercase tracking-wider flex items-center gap-2">
        <Award className="w-4 h-4" />
        Achievements
      </h3>
      <div className="border-2 border-[var(--border-color)] border-t-[3px] border-t-[var(--accent-purple)] p-3 bg-[var(--card-bg)]">
        {total > 0 ? (
          <>
            <span className="font-mono text-[9px] text-[var(--text-muted)] font-bold block uppercase">Budgets on Track</span>
            <span className="font-display text-base font-black text-[var(--text-primary)]">{onTrack}/{total}</span>
            <div className="w-full h-2 border border-[var(--border-color)] mt-2 bg-[var(--bg-muted)]">
              <div className="h-full bg-[var(--accent-primary)] transition-all" style={{ width: total > 0 ? `${(onTrack / total) * 100}%` : '0%' }} />
            </div>
          </>
        ) : (
          <p className="font-mono text-[11px] text-[var(--text-muted)]">No achievements yet. Set budgets to get started!</p>
        )}
      </div>
    </motion.div>
  );
}
