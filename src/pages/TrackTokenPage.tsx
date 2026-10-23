import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';
import { TokenOrder, MainCategoryPrefix } from '../types/cafe';
import { IndianClock } from '../components/common/IndianClock';
import { 
  formatISTTime, 
  formatISTDate, 
  calculateExpiryTime, 
  getRemainingSeconds, 
  formatCountdown, 
  resolveDisplayStatus, 
  DisplayTokenStatus,
  TOKEN_EXPIRY_MINUTES 
} from '../utils/tokenTime';
import { 
  getCurrentlyServingByCategory, 
  getPeopleAheadInCategory, 
  getEstimatedWaitingMinutes, 
  getAllCategorySummaries,
  QUEUE_SIMULATION_DISCLAIMER 
} from '../services/cafeQueueService';
import { 
  Search, 
  Clock, 
  ChefHat, 
  BellRing, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Hourglass, 
  Users, 
  RefreshCw, 
  ArrowRight, 
  Coffee, 
  UtensilsCrossed, 
  Layers, 
  Sparkles, 
  Volume2, 
  ExternalLink,
  ShieldCheck,
  Info,
  Calendar
} from 'lucide-react';

export const TrackTokenPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { tokens, recentUserTokens, getTokenByIdOrNumber, advanceTokenStatus, playChime } = useCafe();

  const [inputQuery, setInputQuery] = useState('');
  const [activeToken, setActiveToken] = useState<TokenOrder | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  
  // Live countdown remaining seconds
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Sync token from URL ?id=... or default to recent
  useEffect(() => {
    const idFromUrl = searchParams.get('id');
    if (idFromUrl) {
      const match = getTokenByIdOrNumber(idFromUrl);
      if (match) {
        setActiveToken(match);
        setInputQuery(match.tokenCode || match.id);
        setSearchError('');
      } else {
        setSearchError(`No active token matches "${idFromUrl}".`);
        setActiveToken(null);
      }
    } else if (recentUserTokens.length > 0) {
      setActiveToken(recentUserTokens[0]);
      setInputQuery(recentUserTokens[0].tokenCode || recentUserTokens[0].id);
      setSearchError('');
    } else if (tokens.length > 0) {
      setActiveToken(tokens[0]);
      setInputQuery(tokens[0].tokenCode || tokens[0].id);
      setSearchError('');
    }
  }, [searchParams, tokens, recentUserTokens]);

  // Live countdown timer for activeToken
  useEffect(() => {
    if (!activeToken) return;

    const updateCountdown = () => {
      setRemainingSeconds(getRemainingSeconds(activeToken.createdAt, TOKEN_EXPIRY_MINUTES));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeToken]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputQuery.trim();
    if (!trimmed) return;

    setIsSearching(true);
    setSearchError('');

    // Brief simulated lookup delay for responsive feedback
    setTimeout(() => {
      const match = getTokenByIdOrNumber(trimmed);
      setIsSearching(false);
      if (match) {
        setActiveToken(match);
        setSearchParams({ id: match.tokenCode || match.id });
      } else {
        setSearchError(`Token "${trimmed}" was not found in the canteen queue.`);
        setActiveToken(null);
      }
    }, 200);
  };

  const handleSelectRecent = (token: TokenOrder) => {
    setActiveToken(token);
    setInputQuery(token.tokenCode || token.id);
    setSearchParams({ id: token.tokenCode || token.id });
    setSearchError('');
  };

  // Calculations for activeToken
  const displayStatus: DisplayTokenStatus = activeToken
    ? resolveDisplayStatus(activeToken.status, activeToken.createdAt, TOKEN_EXPIRY_MINUTES)
    : 'WAITING';

  const isExpired = activeToken ? displayStatus === 'EXPIRED' || remainingSeconds <= 0 : false;
  const expiryDate = activeToken ? calculateExpiryTime(activeToken.createdAt, TOKEN_EXPIRY_MINUTES) : new Date();

  // Category-specific calculations using the shared service
  const peopleAhead = activeToken ? getPeopleAheadInCategory(tokens, activeToken) : 0;
  const currentlyServingThisCategory = activeToken
    ? getCurrentlyServingByCategory(tokens, activeToken.categoryPrefix)
    : null;
  const estimatedWait = activeToken
    ? getEstimatedWaitingMinutes(tokens, activeToken)
    : { minMinutes: 0, maxMinutes: 0, formattedText: '--' };

  // Summaries across all 3 queues (BV, FF, OT)
  const categorySummaries = getAllCategorySummaries(tokens);

  // Status badge style mapping
  const statusConfig: Record<DisplayTokenStatus, { badge: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
    WAITING: {
      badge: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: Hourglass,
      label: 'WAITING IN QUEUE',
    },
    SERVING: {
      badge: 'bg-blue-100 text-blue-900 border-blue-300 animate-pulse',
      icon: ChefHat,
      label: 'CURRENTLY SERVING',
    },
    COMPLETED: {
      badge: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: CheckCircle2,
      label: 'COMPLETED & SERVED',
    },
    EXPIRED: {
      badge: 'bg-rose-100 text-rose-900 border-rose-300',
      icon: AlertTriangle,
      label: 'TOKEN EXPIRED',
    },
    CANCELLED: {
      badge: 'bg-slate-200 text-slate-800 border-slate-300',
      icon: XCircle,
      label: 'CANCELLED',
    },
  };

  const StatusIcon = statusConfig[displayStatus].icon;

  // Progress Stepper calculation (0 to 100%)
  const getProgressState = () => {
    if (!activeToken) return { percent: 0, step: 0 };
    if (isExpired) return { percent: 100, step: 4 };
    if (activeToken.status === 'completed') return { percent: 100, step: 3 };
    if (activeToken.status === 'ready') return { percent: 80, step: 2 };
    if (activeToken.status === 'preparing') return { percent: 50, step: 1 };
    return { percent: 20, step: 0 }; // pending / waiting
  };

  const progressState = getProgressState();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">
            <span>G.L. Bajaj Campus Canteen</span>
            <span>·</span>
            <span>Live Category Queue Monitor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Track Token Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time queue tracking across Beverage (BV), Fast Food (FF), and Other (OT) counters.
          </p>
        </div>

        <IndianClock variant="badge" />
      </div>

      {/* TOKEN LOOKUP FIELD & TRACK BUTTON */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Enter Token (e.g. BV-001, FF-001, OT-001), Student ID, or Name..."
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 active:scale-98"
          >
            {isSearching ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Searching...</span>
              </span>
            ) : (
              <>
                <span>Track Token</span>
                <ArrowRight className="w-4 h-4 text-orange-400" />
              </>
            )}
          </button>
        </form>

        {/* Recent Tokens Chips */}
        {recentUserTokens.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium text-[11px]">Recent Canteen Tokens:</span>
            {recentUserTokens.map((t) => {
              const isSelected = activeToken?.id === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectRecent(t)}
                  className={`px-3 py-1 rounded-lg font-mono text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <span>{t.tokenCode || t.id}</span>
                  <span className="text-[10px] opacity-75">({t.categoryPrefix})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* THREE SEPARATE CATEGORY QUEUE STATUS CARDS (BV, FF, OT) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { prefix: 'BV' as MainCategoryPrefix, label: 'Beverage (BV)', icon: Coffee, desc: 'Tea, Coffee & Coolers' },
          { prefix: 'FF' as MainCategoryPrefix, label: 'Fast Food (FF)', icon: UtensilsCrossed, desc: 'Sandwiches, Maggi & Snacks' },
          { prefix: 'OT' as MainCategoryPrefix, label: 'Other (OT)', icon: Layers, desc: 'Dosas, Thalis & Meals' },
        ].map((cat) => {
          const summary = categorySummaries[cat.prefix];
          const isTargetCat = activeToken?.categoryPrefix === cat.prefix;
          const Icon = cat.icon;

          return (
            <div
              key={cat.prefix}
              className={`rounded-2xl p-4 border transition-all ${
                isTargetCat
                  ? 'bg-slate-900 text-white border-slate-800 shadow-md ring-2 ring-orange-500/20'
                  : 'bg-white text-slate-900 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isTargetCat ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold leading-tight">{cat.label}</h3>
                    <span className={`text-[10px] block ${isTargetCat ? 'text-slate-400' : 'text-slate-500'}`}>
                      {summary.counter}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isTargetCat
                      ? 'bg-orange-950 text-orange-400 border border-orange-900'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {summary.totalWaiting} Waiting
                </span>
              </div>

              <div
                className={`mt-3 p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  isTargetCat
                    ? 'bg-slate-950/80 border-slate-800'
                    : 'bg-slate-50 border-slate-100'
                }`}
              >
                <span className={isTargetCat ? 'text-slate-400' : 'text-slate-500'}>
                  Currently Serving:
                </span>
                <span className="font-mono font-extrabold text-sm text-emerald-400">
                  {summary.currentlyServing
                    ? summary.currentlyServing.tokenCode || summary.currentlyServing.id
                    : 'Kitchen Queue'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* LOADING STATE */}
      {isSearching && (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">
            Querying G.L. Bajaj Canteen System...
          </h3>
          <p className="text-xs text-slate-400">
            Fetching latest queue positions for Beverage, Fast Food, and Other counters.
          </p>
        </div>
      )}

      {/* INVALID-TOKEN STATE */}
      {!isSearching && searchError && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Token Not Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              {searchError} Please double-check the token code on your receipt (e.g. BV-001, FF-001, OT-001) or generate a new food token.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/generate"
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 transition-colors shadow-xs"
            >
              Generate New Token
            </Link>
            <Link
              to="/"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      )}

      {/* ACTIVE TOKEN DETAILS DISPLAY */}
      {!isSearching && !searchError && activeToken && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden space-y-6">
          {/* Top Banner: Big Token Number & Status */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-orange-400">
                    {activeToken.category} Queue ({activeToken.categoryPrefix})
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400">{activeToken.counter}</span>
                </div>

                <div className="flex items-baseline gap-4">
                  <h2 className="font-mono text-5xl sm:text-6xl font-black text-white tracking-tight leading-none">
                    {activeToken.tokenCode || activeToken.id}
                  </h2>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${statusConfig[displayStatus].badge}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                      <span>{statusConfig[displayStatus].label}</span>
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-3">
                  Student: <strong className="text-slate-200">{activeToken.studentName}</strong> ({activeToken.courseName || activeToken.department || 'B.Tech'}) · PIN: <span className="font-mono text-emerald-400 font-bold">{activeToken.pickupPin}</span>
                </p>
              </div>

              {/* Countdown & Expiry Box */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-right sm:min-w-44">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {isExpired ? 'Validity Status' : 'Validity Countdown'}
                </span>
                <div
                  className={`font-mono text-2xl font-black tabular-nums tracking-wide mt-0.5 ${
                    isExpired ? 'text-rose-500 line-through' : 'text-orange-400'
                  }`}
                >
                  {formatCountdown(remainingSeconds)}
                </div>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Expires: {formatISTTime(expiryDate)}
                </span>
              </div>
            </div>
          </div>

          {/* EXPIRED-TOKEN STATE BANNER */}
          {isExpired && (
            <div className="mx-6 sm:mx-8 bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-900 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="text-sm font-bold text-rose-950 block">
                  This Token Has Expired
                </strong>
                <p className="text-rose-800 leading-relaxed">
                  Tokens expire after exactly 60 minutes from issue to maintain cafeteria food freshness. 
                  If you haven't received your food, please visit the counter manager with your PIN ({activeToken.pickupPin}).
                </p>
              </div>
            </div>
          )}

          {/* DYNAMIC PROGRESS STEPPER */}
          <div className="px-6 sm:px-8 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Queue Progression</span>
              <span className="font-mono text-orange-600 font-bold">{progressState.percent}%</span>
            </div>

            {/* Progress bar line */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isExpired
                    ? 'bg-rose-500'
                    : progressState.percent === 100
                    ? 'bg-emerald-500'
                    : 'bg-orange-600'
                }`}
                style={{ width: `${progressState.percent}%` }}
              />
            </div>

            {/* Step markers */}
            <div className="grid grid-cols-4 gap-2 text-center pt-1 text-[11px]">
              <div className={`space-y-0.5 ${progressState.step >= 0 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                <span className="block">1. Order Placed</span>
                <span className="text-[10px] text-slate-400 block font-normal">Waiting</span>
              </div>
              <div className={`space-y-0.5 ${progressState.step >= 1 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                <span className="block">2. In Kitchen</span>
                <span className="text-[10px] text-slate-400 block font-normal">Preparing</span>
              </div>
              <div className={`space-y-0.5 ${progressState.step >= 2 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                <span className="block">3. Ready for Pickup</span>
                <span className="text-[10px] text-slate-400 block font-normal">Bell Rings</span>
              </div>
              <div className={`space-y-0.5 ${progressState.step >= 3 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                <span className="block">4. Served</span>
                <span className="text-[10px] text-slate-400 block font-normal">Collected</span>
              </div>
            </div>
          </div>

          {/* KEY QUEUE METRICS GRID */}
          <div className="px-6 sm:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Metric 1: Currently Serving */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                  Currently Serving ({activeToken.categoryPrefix})
                </span>
                <div className="font-mono text-2xl font-black text-slate-900">
                  {currentlyServingThisCategory
                    ? currentlyServingThisCategory.tokenCode || currentlyServingThisCategory.id
                    : 'Queue Active'}
                </div>
                <span className="text-[11px] text-slate-500 block">
                  at {activeToken.counter}
                </span>
              </div>

              {/* Metric 2: People Ahead in Same Category Queue */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                  Ahead in {activeToken.category} Queue
                </span>
                <div className="font-mono text-2xl font-black text-orange-600">
                  {peopleAhead === 0 ? 'Next Up!' : `${peopleAhead} ahead`}
                </div>
                <span className="text-[11px] text-slate-500 block">
                  {peopleAhead === 0 ? 'Your meal is being prepped' : 'orders in kitchen ahead of you'}
                </span>
              </div>

              {/* Metric 3: Estimated Waiting Time */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
                  Estimated Waiting Time
                </span>
                <div className="font-mono text-xl font-black text-slate-900">
                  {estimatedWait.formattedText}
                </div>
                <span className="text-[10px] text-slate-400 block">
                  *Clearly approximate based on rush
                </span>
              </div>
            </div>
          </div>

          {/* EMPTY-QUEUE STATE MESSAGE */}
          {peopleAhead === 0 && !isExpired && activeToken.status !== 'completed' && (
            <div className="mx-6 sm:mx-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                  !
                </div>
                <div>
                  <strong className="block font-bold">You are next in line!</strong>
                  <p className="text-emerald-800 text-[11px]">
                    No other pending orders ahead of you in the {activeToken.category} queue. Head to {activeToken.counter}.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={playChime}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Test Chime</span>
              </button>
            </div>
          )}

          {/* Order Details & Timing Information */}
          <div className="px-6 sm:px-8 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                Order Timings (Asia/Kolkata IST)
              </span>
              <div className="flex justify-between text-slate-600">
                <span>Creation Time:</span>
                <span className="font-mono font-bold text-slate-900">
                  {formatISTTime(activeToken.createdAt)} ({formatISTDate(activeToken.createdAt)})
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Expiry Time (60 Mins):</span>
                <span className="font-mono font-bold text-rose-700">
                  {formatISTTime(expiryDate)}
                </span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                Ticket Receipt Actions
              </span>
              <div className="flex items-center justify-between pt-1">
                <Link
                  to={`/token/${activeToken.tokenCode || activeToken.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 underline underline-offset-4"
                >
                  <span>Open Full Ticket Receipt</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs hover:bg-slate-100"
                >
                  Print
                </button>
              </div>
            </div>
          </div>

          {/* SIMULATED QUEUE UPDATE CONTROLS & DISCLAIMER */}
          <div className="px-6 sm:px-8 pb-8 pt-2 space-y-3">
            <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <Sparkles className="w-4 h-4 text-orange-600" />
                  <span>Demonstration Status Simulator</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Simulate live queue status change (WAITING &rarr; SERVING &rarr; COMPLETED) to preview real-time position updates.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => advanceTokenStatus(activeToken.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 shadow-sm transition-colors flex items-center gap-1.5 active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Advance Status</span>
                </button>
                <button
                  type="button"
                  onClick={playChime}
                  className="p-2 rounded-xl text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 transition-colors"
                  title="Test Pickup Bell"
                >
                  <Volume2 className="w-4 h-4 text-orange-600" />
                </button>
              </div>
            </div>

            {/* Disclaimer required by user */}
            <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>{QUEUE_SIMULATION_DISCLAIMER}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
