import { motion } from 'motion/react';
import { parseDate } from '../../lib/analytics/dateRanges';
import type { PeriodSummary } from '../../lib/analytics/summaryEngine';

interface Props {
  customStart: string;
  customEnd: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onGenerate: () => void;
  isValid: boolean;
  summary: PeriodSummary | null;
}

export default function CustomRangePicker({ customStart, customEnd, onStartChange, onEndChange, onGenerate, isValid, summary }: Props) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formatDate = (d: string) => {
    if (!d) return '';
    const p = parseDate(d);
    return `${p.getDate()} ${months[p.getMonth()]} ${p.getFullYear()}`;
  };

  return (
    <div className="lg:col-span-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white border-2 border-black p-3 flex flex-col sm:flex-row items-start sm:items-end gap-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          <div>
            <label className="font-mono text-[9px] font-bold text-black block mb-1 uppercase">Start Date</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => onStartChange(e.target.value)}
              className="bg-white border-2 border-black p-1.5 font-mono text-xs outline-none focus:bg-yellow-50"
            />
          </div>
          <div>
            <label className="font-mono text-[9px] font-bold text-black block mb-1 uppercase">End Date</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => onEndChange(e.target.value)}
              className="bg-white border-2 border-black p-1.5 font-mono text-xs outline-none focus:bg-yellow-50"
            />
          </div>
          {customEnd && customStart && customEnd < customStart && (
            <p className="font-mono text-[10px] text-red-600 font-bold">End date must be on or after start date.</p>
          )}
          <button
            onClick={onGenerate}
            disabled={!isValid}
            className={`bg-[#A5F3FC] text-black font-display text-xs font-bold px-4 py-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:bg-[#83ebfa] transition-all ${
              !isValid ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ cursor: isValid ? 'pointer' : 'default' }}
          >
            GENERATE SUMMARY
          </button>
        </div>

        {summary && customStart && customEnd && (
          <div className="mt-2 flex items-center gap-2">
            <span className="font-mono text-[11px] text-gray-500 font-bold">
              {formatDate(customStart)} → {formatDate(customEnd)}
            </span>
            <span className="font-mono text-[9px] text-gray-400">
              &middot; {summary.transactionCount} transactions
            </span>
            <button
              onClick={() => { onStartChange(''); onEndChange(''); }}
              className="font-mono text-[9px] text-red-500 hover:text-red-700 underline ml-auto"
              style={{ cursor: 'pointer' }}
            >
              Clear Selection
            </button>
          </div>
        )}

        {!isValid && !customStart && !customEnd && (
          <p className="font-mono text-[10px] text-gray-500 mt-2">Select a date range and generate a summary.</p>
        )}
      </motion.div>
    </div>
  );
}
