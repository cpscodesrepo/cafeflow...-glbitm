import React from 'react';
import { OrderStatus } from '../../types/cafe';
import { Clock, ChefHat, BellRing, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const TokenStatusBadge: React.FC<Props> = ({ status, size = 'md' }) => {
  const config = {
    pending: {
      label: 'Order Placed',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      icon: Clock,
      dot: 'bg-amber-500',
    },
    preparing: {
      label: 'Cooking in Kitchen',
      color: 'text-blue-700 bg-blue-50 border-blue-200',
      icon: ChefHat,
      dot: 'bg-blue-500',
    },
    ready: {
      label: 'Ready for Pickup',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200 animate-pulse',
      icon: BellRing,
      dot: 'bg-emerald-500',
    },
    completed: {
      label: 'Collected / Served',
      color: 'text-slate-600 bg-slate-100 border-slate-200',
      icon: CheckCircle2,
      dot: 'bg-slate-400',
    },
    cancelled: {
      label: 'Cancelled',
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      icon: XCircle,
      dot: 'bg-rose-500',
    },
  }[status];

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-md border ${config.color} ${sizeClasses} whitespace-nowrap`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      <span>{config.label}</span>
    </span>
  );
};
