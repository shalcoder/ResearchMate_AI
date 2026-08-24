import React from 'react';
import { RecentActivityItem } from '../../types';

interface ActivityFeedProps {
  activities: RecentActivityItem[];
  title?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  title = 'Recent Activity',
}) => {
  return (
    <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-xl backdrop-blur-md">
      <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center justify-between">
        <span>{title}</span>
        <span className="text-xs text-indigo-400 font-medium cursor-pointer hover:underline">
          View All
        </span>
      </h3>
      <div className="space-y-4">
        {activities.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/60 hover:border-slate-700 transition-colors"
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-200">{item.title}</p>
              {item.metadata && (
                <p className="text-[11px] text-slate-400">{item.metadata}</p>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap ml-2">
              {item.timestamp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
