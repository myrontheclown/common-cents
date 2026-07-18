import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ChevronRight, ChevronDown } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import type { PeriodSummary } from '../../lib/analytics/summaryEngine';
import { formatCurrency } from '../../lib/analytics/dateRanges';

const barColors = ['#FFDE4D', '#FF78C4', '#9DF1DF', '#FF9F9F', '#38BDF8', '#4ADE80', '#A5F3FC', '#C084FC'];

interface Props {
  summary: PeriodSummary;
  chartData: { name: string; Value: number }[];
  expanded: boolean;
  onToggle: () => void;
}

export default function CategoryChart({ summary, chartData, expanded, onToggle }: Props) {
  return (
    <div className="bg-white border-4 border-black p-5 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
      <button onClick={onToggle} className="w-full flex items-center justify-between" style={{ cursor: 'pointer' }}>
        <h3 className="font-display text-sm font-bold text-black uppercase tracking-wider flex items-center gap-2">
          <ShoppingBag className="w-4 h-4" />
          Top Spending Categories
        </h3>
        {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t-2 border-black mt-3 pt-3">
              {summary.topCategories.length > 0 ? (
                <>
                  <div className="w-full h-48 font-mono text-[10px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <XAxis dataKey="name" stroke="#000" strokeWidth={1.5} />
                        <YAxis stroke="#000" strokeWidth={1.5} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#fff', border: '2px solid #000', borderRadius: '0px', fontFamily: 'monospace' }}
                          formatter={(value: any) => [formatCurrency(Number(value)), 'Amount']}
                        />
                        <Bar dataKey="Value" stroke="#000" strokeWidth={2}>
                          {chartData.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-1.5 mt-3">
                    {summary.topCategories.slice(0, 5).map((cat, i) => (
                      <div key={cat.name} className="flex items-center justify-between border border-black p-2 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 border border-black" style={{ backgroundColor: barColors[i % barColors.length] }} />
                          <span className="font-bold">{cat.name}</span>
                        </div>
                        <span>{formatCurrency(cat.amount)} ({cat.percentage.toFixed(0)}%)</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="font-mono text-[11px] text-gray-500 py-2">No spending data for this period.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
