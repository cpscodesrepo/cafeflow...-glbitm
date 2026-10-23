import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { Users, Clock, AlertCircle } from 'lucide-react';

export const RushMeter: React.FC = () => {
  const { stats } = useCafe();

  const getRushLevel = (activeCount: number) => {
    if (activeCount <= 2) {
      return {
        level: 'Normal Flow',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        barColor: 'bg-emerald-500',
        percent: 25,
        avgMins: '3-6 mins',
        msg: 'Minimal wait time. Orders are being cooked immediately.',
      };
    }
    if (activeCount <= 5) {
      return {
        level: 'Moderate Rush',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        barColor: 'bg-amber-500',
        percent: 60,
        avgMins: '7-11 mins',
        msg: 'Typical campus lunch traffic. Pre-booking token recommended.',
      };
    }
    return {
      level: 'Peak Campus Rush',
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      barColor: 'bg-rose-500',
      percent: 90,
      avgMins: '12-16 mins',
      msg: 'High volume between lecture intervals. Track your token live.',
    };
  };

  const currentRush = getRushLevel(stats.activeOrdersCount);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-700" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Canteen Live Traffic Meter
          </h4>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${currentRush.color}`}>
          {currentRush.level}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 rounded-full ${currentRush.barColor}`}
          style={{ width: `${currentRush.percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Estimated wait: <strong className="text-slate-800">{currentRush.avgMins}</strong></span>
        </div>
        <div>
          <span>In Kitchen Queue: <strong className="text-slate-800 font-mono">{stats.activeOrdersCount} orders</strong></span>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 mt-2">
        {currentRush.msg}
      </p>
    </div>
  );
};
