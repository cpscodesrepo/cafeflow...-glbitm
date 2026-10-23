import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TokenOrder } from '../../types/cafe';
import { 
  formatISTTime, 
  formatISTDate, 
  calculateExpiryTime, 
  getRemainingSeconds, 
  formatCountdown, 
  resolveDisplayStatus, 
  DisplayTokenStatus,
  TOKEN_EXPIRY_MINUTES
} from '../../utils/tokenTime';
import { 
  Clock, 
  User, 
  GraduationCap, 
  Tag, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Home, 
  Printer, 
  ShieldCheck, 
  Hourglass,
  BellRing,
  XCircle,
  ChefHat
} from 'lucide-react';

interface Props {
  token: TokenOrder;
  showActions?: boolean;
}

export const TokenTicketCard: React.FC<Props> = ({ token, showActions = true }) => {
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() =>
    getRemainingSeconds(token.createdAt, TOKEN_EXPIRY_MINUTES)
  );

  // Live countdown timer ticking every second
  useEffect(() => {
    // Immediate calculation
    setRemainingSeconds(getRemainingSeconds(token.createdAt, TOKEN_EXPIRY_MINUTES));

    const timer = setInterval(() => {
      const remaining = getRemainingSeconds(token.createdAt, TOKEN_EXPIRY_MINUTES);
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [token.createdAt]);

  const displayStatus: DisplayTokenStatus = resolveDisplayStatus(
    token.status,
    token.createdAt,
    TOKEN_EXPIRY_MINUTES
  );

  const isExpired = displayStatus === 'EXPIRED' || remainingSeconds <= 0;
  const expiryDate = calculateExpiryTime(token.createdAt, TOKEN_EXPIRY_MINUTES);

  // Status badge styling config
  const statusStyles: Record<DisplayTokenStatus, { badge: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
    WAITING: {
      badge: 'bg-amber-100 text-amber-900 border-amber-300',
      text: 'WAITING',
      icon: Hourglass,
    },
    SERVING: {
      badge: 'bg-blue-100 text-blue-900 border-blue-300 animate-pulse',
      text: 'SERVING',
      icon: ChefHat,
    },
    COMPLETED: {
      badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      text: 'COMPLETED',
      icon: CheckCircle2,
    },
    EXPIRED: {
      badge: 'bg-rose-100 text-rose-900 border-rose-300',
      text: 'EXPIRED',
      icon: AlertTriangle,
    },
    CANCELLED: {
      badge: 'bg-slate-200 text-slate-800 border-slate-300',
      text: 'CANCELLED',
      icon: XCircle,
    },
  };

  const StatusIcon = statusStyles[displayStatus].icon;

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Outer Ticket Container with classic cut-out notches */}
      <div className="relative bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-slate-900">
        
        {/* Ticket Header: College Brand */}
        <div className="bg-slate-900 text-white p-6 text-center border-b border-slate-800 relative">
          {/* Decorative side notches */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">
              G.L. Bajaj Cafeteria · Greater Noida
            </span>
          </div>

          <h2 className="text-sm font-semibold tracking-wide text-slate-300 uppercase">
            Official Food Token Ticket
          </h2>

          {/* Prominent Token Number Box */}
          <div className="mt-4 bg-slate-950 p-5 rounded-2xl border border-slate-800 shadow-inner">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              TOKEN NUMBER
            </span>
            <div className="font-mono text-5xl sm:text-6xl font-black text-orange-400 tracking-tight leading-none">
              {token.tokenCode || token.id}
            </div>

            <div className="mt-3 flex items-center justify-center gap-3 text-xs">
              <span className="text-slate-300 font-medium">
                {token.category} ({token.categoryPrefix})
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400 font-mono font-bold">
                PIN: {token.pickupPin}
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge & Live 60-Min Countdown Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Status:
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${statusStyles[displayStatus].badge}`}
            >
              <StatusIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{statusStyles[displayStatus].text}</span>
            </span>
          </div>

          {/* Countdown Clock */}
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              {isExpired ? 'Validity Ended' : 'Time Remaining'}
            </span>
            <div
              className={`font-mono text-sm sm:text-base font-extrabold tabular-nums tracking-wide ${
                isExpired
                  ? 'text-rose-600 line-through'
                  : remainingSeconds < 300
                  ? 'text-rose-600 animate-pulse'
                  : 'text-slate-900'
              }`}
            >
              {formatCountdown(remainingSeconds)}
            </div>
          </div>
        </div>

        {/* Clear Expiry Banner if Countdown reached zero */}
        {isExpired && (
          <div className="bg-rose-50 border-b border-rose-200 p-4 text-xs text-rose-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="font-bold text-rose-950 block">Token Expired</strong>
              <p className="text-rose-800 leading-snug">
                This token has passed the 60-minute cafeteria validity window. 
                Please generate a fresh token at the canteen terminal or counter.
              </p>
            </div>
          </div>
        )}

        {/* Ticket Perforation Line Visual Effect */}
        <div className="relative my-1">
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border border-slate-200" />
          <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-50 rounded-full border border-slate-200" />
          <div className="border-b-2 border-dashed border-slate-200 mx-5" />
        </div>

        {/* Student & Order Details Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Student Name */}
            <div className="space-y-1 bg-slate-50/70 p-3 rounded-xl border border-slate-150">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                Student Name
              </span>
              <strong className="text-slate-900 text-sm block truncate">
                {token.studentName}
              </strong>
            </div>

            {/* Course Name */}
            <div className="space-y-1 bg-slate-50/70 p-3 rounded-xl border border-slate-150">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block flex items-center gap-1">
                <GraduationCap className="w-3 h-3 text-slate-400" />
                Course
              </span>
              <strong className="text-slate-900 text-sm block truncate">
                {token.courseName || token.department || 'B.Tech'}
              </strong>
            </div>

            {/* Order Category */}
            <div className="space-y-1 bg-slate-50/70 p-3 rounded-xl border border-slate-150">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                Order Category
              </span>
              <span className="font-bold text-slate-900 text-sm block">
                {token.category} ({token.categoryPrefix})
              </span>
            </div>

            {/* Pickup Counter */}
            <div className="space-y-1 bg-slate-50/70 p-3 rounded-xl border border-slate-150">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                Pickup Counter
              </span>
              <strong className="text-orange-700 text-sm block">
                {token.counter}
              </strong>
            </div>
          </div>

          {/* Time Block (Asia/Kolkata IST) */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Creation Time (IST):
              </span>
              <span className="font-mono font-bold text-slate-800">
                {formatISTTime(token.createdAt)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-slate-200/80 pt-2">
              <span className="text-rose-700 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                Expiry Time (60 Mins IST):
              </span>
              <span className="font-mono font-bold text-rose-800">
                {formatISTTime(expiryDate)}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 text-right pt-0.5">
              <span>Date: {formatISTDate(token.createdAt)} · Asia/Kolkata</span>
            </div>
          </div>

          {/* Action Buttons: "Track Queue" & "Back to Home" */}
          {showActions && (
            <div className="space-y-2 pt-2">
              <Link
                to={`/track?id=${token.tokenCode || token.id}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 shadow-md shadow-orange-600/20 transition-all active:scale-98"
              >
                <Search className="w-4 h-4" />
                <span>Track Queue</span>
              </Link>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Back to Home</span>
                </Link>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
              </div>
            </div>
          )}

          {/* Small Footer Security Notice */}
          <div className="pt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Show token PIN to the canteen staff at counter collection.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
