import type { PeriodType } from '../../lib/analytics/dateRanges';

interface TimelineItem {
  type: PeriodType;
  label: string;
  emoji: string;
}

const timelineItems: TimelineItem[] = [
  { type: 'today', label: 'Today', emoji: '⭐' },
  { type: 'week', label: 'This Week', emoji: '📅' },
  { type: 'month', label: 'This Month', emoji: '📆' },
  { type: 'year', label: 'This Year', emoji: '📈' },
  { type: 'custom', label: 'Custom Range', emoji: '📂' },
];

interface Props {
  activePeriod: PeriodType;
  onSelect: (type: PeriodType) => void;
}

export default function TimelineSelector({ activePeriod, onSelect }: Props) {
  return (
    <div className="lg:col-span-12">
      <div className="border-2 border-black bg-white p-1.5 flex flex-nowrap gap-1 overflow-x-auto shadow-[2px_2px_0px_rgba(0,0,0,1)]">
        {timelineItems.map(item => (
          <button
            key={item.type}
            onClick={() => onSelect(item.type)}
            className={`flex items-center gap-1.5 px-3 py-2 font-display text-[11px] sm:text-xs font-bold border-2 border-black transition-all whitespace-nowrap ${
              activePeriod === item.type
                ? 'bg-[#FFDE4D] text-black shadow-none translate-x-[1px] translate-y-[1px]'
                : 'bg-white text-black hover:bg-gray-50 shadow-[1.5px_1.5px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none'
            }`}
            style={{ cursor: 'pointer' }}
          >
            <span>{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        ))}
        <div className="flex items-center gap-1.5 px-3 py-2 font-display text-[11px] sm:text-xs font-bold text-gray-400 border-2 border-dashed border-gray-300 whitespace-nowrap">
          <span>⚖</span>
          <span>Compare Periods</span>
          <span className="font-mono text-[8px] bg-gray-200 text-gray-500 px-1 py-0.5">SOON</span>
        </div>
      </div>
    </div>
  );
}
