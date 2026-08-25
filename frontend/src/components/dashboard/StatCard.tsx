import React from 'react';
import { StatMetric } from '../../types';

export const StatCard: React.FC<StatMetric> = ({
  title,
  value,
  change,
  changeType = 'positive',
  description,
}) => {
  return (
    <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-indigo-500/30 transition-all duration-300 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {change && (
          <span
            className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
              changeType === 'positive'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : changeType === 'negative'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {change}
          </span>
        )}
      </div>
      <div className="text-2xl lg:text-3xl font-extrabold text-slate-100 tracking-tight">
        {value}
      </div>
      {description && (
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">{description}</p>
      )}
    </div>
  );
};
