import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface Props {
  variant?: 'compact' | 'badge' | 'hero';
}

export const IndianClock: React.FC<Props> = ({ variant = 'badge' }) => {
  const [timeString, setTimeString] = useState<string>('');
  const [dateString, setDateString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Format time in Asia/Kolkata
      const timeFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });

      const dateFormatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });

      setTimeString(timeFormatter.format(now));
      setDateString(dateFormatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!timeString) return null;

  if (variant === 'compact') {
    return (
      <span className="font-mono text-xs tabular-nums font-semibold tracking-wider">
        {timeString} IST
      </span>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-200 shadow-xs">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <Clock className="w-3.5 h-3.5 text-orange-400 shrink-0" />
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <span className="text-slate-400">{dateString}</span>
          <span className="text-slate-600">·</span>
          <span className="font-mono font-bold text-white tabular-nums tracking-wide">
            {timeString} IST
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 text-xs">
      <Clock className="w-3 h-3 text-orange-400 shrink-0" />
      <span className="font-mono font-semibold text-white tabular-nums tracking-wide">
        {timeString} <span className="text-slate-400 text-[10px] font-sans">IST</span>
      </span>
    </div>
  );
};
