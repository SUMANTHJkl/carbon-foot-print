import React from 'react';
import { ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  yoyChange?: number | null;
  yoyIsReductionGood?: boolean;
  benchmark?: string;
  provenance?: string;
  period?: string;
  statusColor?: 'emerald' | 'amber' | 'ruby' | 'slate';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  yoyChange,
  yoyIsReductionGood = true,
  benchmark,
  provenance,
  period,
  statusColor = 'emerald',
}) => {
  const isPositive = yoyChange !== undefined && yoyChange !== null && yoyChange > 0;
  const isNegative = yoyChange !== undefined && yoyChange !== null && yoyChange < 0;

  // For emissions or intensity: reduction is green, increase is red
  const badgeColorClass =
    yoyChange === null || yoyChange === undefined
      ? 'bg-slate-100 text-slate-600'
      : isPositive
      ? yoyIsReductionGood
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : yoyIsReductionGood
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : 'bg-red-50 text-red-700 border-red-200';

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow transition-all relative group">
      {/* Header */}
      <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
        <span className="font-semibold tracking-wide uppercase text-[11px] text-slate-600 truncate">
          {title}
        </span>
        {provenance && (
          <div className="relative group/info cursor-help">
            <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
            <div className="absolute right-0 top-5 hidden group-hover/info:block bg-slate-900 text-white text-[11px] p-2.5 rounded-lg shadow-xl w-60 z-30 font-normal leading-relaxed border border-slate-700">
              {provenance}
            </div>
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className="flex items-baseline space-x-2 my-1">
        <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
          {value}
        </span>
        {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
      </div>

      {/* Footer / YoY / Benchmark */}
      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
        {yoyChange !== undefined && yoyChange !== null ? (
          <div className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded border text-[11px] font-semibold ${badgeColorClass}`}>
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : isNegative ? (
              <ArrowDownRight className="w-3 h-3" />
            ) : null}
            <span>{isPositive ? `+${yoyChange}%` : `${yoyChange}%`} YoY</span>
          </div>
        ) : benchmark ? (
          <span className="text-[11px] text-slate-500 font-medium">{benchmark}</span>
        ) : (
          <span className="text-[11px] text-slate-400">Baseline Verified</span>
        )}

        {period && (
          <span className="text-[10px] text-slate-400 font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
            {period}
          </span>
        )}
      </div>
    </div>
  );
};
