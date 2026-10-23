import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';
import { TokenOrder, MainCategoryPrefix, MainCategory } from '../types/cafe';
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
import { QUEUE_SIMULATION_DISCLAIMER } from '../services/cafeQueueService';
import { 
  Users, 
  Clock, 
  ChefHat, 
  BellRing, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Hourglass, 
  Search, 
  RefreshCw, 
  LogOut, 
  PlusCircle, 
  Trash2, 
  X, 
  ShieldCheck, 
  Volume2, 
  Info, 
  Printer, 
  ArrowRight,
  Filter,
  Layers,
  Coffee,
  UtensilsCrossed,
  RotateCcw,
  Check
} from 'lucide-react';

type TabFilter = 'All' | 'Beverage' | 'Fast Food' | 'Other' | 'Expired';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    tokens, 
    adminUser, 
    isAdminAuthenticated, 
    logoutAdmin, 
    advanceTokenStatus,
    serveNextToken, 
    markTokenCompleted, 
    cancelToken, 
    removeToken, 
    refreshTokens, 
    resetToDefaultData, 
    playChime,
    generateToken
  } = useCafe();

  // Redirect if not signed in to placeholder auth
  React.useEffect(() => {
    if (!isAdminAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAdminAuthenticated, navigate]);

  // UI state
  const [activeTab, setActiveTab] = useState<TabFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewHistory, setViewHistory] = useState(false);

  // Destructive Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'cancel' | 'remove';
    token: TokenOrder | null;
  }>({
    isOpen: false,
    type: 'cancel',
    token: null,
  });

  // Walk-in order modal state
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinCourse, setWalkinCourse] = useState('B.Tech CSE');
  const [walkinCategory, setWalkinCategory] = useState<MainCategory>('Beverage');

  // Summary Metrics Calculation
  const summaryMetrics = useMemo(() => {
    let active = 0;
    let waiting = 0;
    let serving = 0;
    let completed = 0;
    let expired = 0;

    tokens.forEach((t) => {
      const status = resolveDisplayStatus(t.status, t.createdAt, TOKEN_EXPIRY_MINUTES);
      if (status === 'EXPIRED') {
        expired++;
      } else if (status === 'COMPLETED') {
        completed++;
      } else if (status === 'SERVING') {
        serving++;
        active++;
      } else if (status === 'WAITING') {
        waiting++;
        active++;
      }
    });

    return { active, waiting, serving, completed, expired };
  }, [tokens]);

  // Filter Active Tokens
  const filteredActiveTokens = useMemo(() => {
    return tokens.filter((t) => {
      const status = resolveDisplayStatus(t.status, t.createdAt, TOKEN_EXPIRY_MINUTES);

      // Tab filtering
      if (activeTab === 'Expired') {
        if (status !== 'EXPIRED') return false;
      } else if (activeTab === 'Beverage') {
        if (t.category !== 'Beverage' && t.categoryPrefix !== 'BV') return false;
        if (status === 'COMPLETED' || status === 'CANCELLED') return false;
      } else if (activeTab === 'Fast Food') {
        if (t.category !== 'Fast Food' && t.categoryPrefix !== 'FF') return false;
        if (status === 'COMPLETED' || status === 'CANCELLED') return false;
      } else if (activeTab === 'Other') {
        if (t.category !== 'Other' && t.categoryPrefix !== 'OT') return false;
        if (status === 'COMPLETED' || status === 'CANCELLED') return false;
      } else {
        // 'All' active tab (excludes completed and cancelled from active queue table)
        if (status === 'COMPLETED' || status === 'CANCELLED') return false;
      }

      // Search filtering
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const codeMatch = (t.tokenCode || t.id).toLowerCase().includes(q);
        const nameMatch = t.studentName.toLowerCase().includes(q);
        const courseMatch = (t.courseName || '').toLowerCase().includes(q);
        if (!codeMatch && !nameMatch && !courseMatch) return false;
      }

      return true;
    });
  }, [tokens, activeTab, searchQuery]);

  // History Tokens (Completed, Cancelled, Expired)
  const historyTokens = useMemo(() => {
    return tokens.filter((t) => {
      const status = resolveDisplayStatus(t.status, t.createdAt, TOKEN_EXPIRY_MINUTES);
      const isHistorical = status === 'COMPLETED' || status === 'CANCELLED' || status === 'EXPIRED';
      if (!isHistorical) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const codeMatch = (t.tokenCode || t.id).toLowerCase().includes(q);
        const nameMatch = t.studentName.toLowerCase().includes(q);
        return codeMatch || nameMatch;
      }

      return true;
    });
  }, [tokens, searchQuery]);

  // Manual refresh queue handler
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    refreshTokens();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  // Serve Next by category handler
  const handleServeNext = (prefix?: MainCategoryPrefix) => {
    const served = serveNextToken(prefix);
    if (!served) {
      alert(`No pending orders in the ${prefix || 'current'} queue.`);
    }
  };

  // Confirmation handlers
  const openConfirmModal = (type: 'cancel' | 'remove', token: TokenOrder) => {
    setConfirmModal({
      isOpen: true,
      type,
      token,
    });
  };

  const executeConfirmedAction = () => {
    if (!confirmModal.token) return;

    if (confirmModal.type === 'cancel') {
      cancelToken(confirmModal.token.id);
    } else if (confirmModal.type === 'remove') {
      removeToken(confirmModal.token.id);
    }

    setConfirmModal({ isOpen: false, type: 'cancel', token: null });
  };

  // Quick Walk-in submit handler
  const handleCreateWalkin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!walkinName.trim()) return;

    const prefix = walkinCategory === 'Beverage' ? 'BV' : walkinCategory === 'Fast Food' ? 'FF' : 'OT';

    generateToken({
      studentName: walkinName.trim(),
      courseName: walkinCourse,
      category: walkinCategory,
      categoryPrefix: prefix,
      counter: walkinCategory === 'Other' ? 'Counter 2' : 'Counter 1',
    });

    setWalkinName('');
    setShowWalkinModal(false);
  };

  // Status badge helper
  const renderStatusBadge = (t: TokenOrder) => {
    const status: DisplayTokenStatus = resolveDisplayStatus(t.status, t.createdAt, TOKEN_EXPIRY_MINUTES);

    const config: Record<DisplayTokenStatus, { badge: string; icon: React.ComponentType<{ className?: string }> }> = {
      WAITING: { badge: 'bg-amber-100 text-amber-900 border-amber-300', icon: Hourglass },
      SERVING: { badge: 'bg-blue-100 text-blue-900 border-blue-300 animate-pulse', icon: ChefHat },
      COMPLETED: { badge: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: CheckCircle2 },
      EXPIRED: { badge: 'bg-rose-100 text-rose-900 border-rose-300', icon: AlertTriangle },
      CANCELLED: { badge: 'bg-slate-200 text-slate-800 border-slate-300', icon: XCircle },
    };

    const Icon = config[status].icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${config[status].badge} whitespace-nowrap`}>
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span>{status}</span>
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* SECURITY & DEMO SESSION DISCLAIMER BANNER */}
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
          <div>
            <strong className="font-bold text-amber-950 block">Demo Admin Session (Frontend-Only Prototype)</strong>
            <span className="text-amber-800 text-[11px] leading-snug">
              This dashboard operates on local shared mock state for G.L. Bajaj cafeteria operations. 
              Changes reflect immediately across student tracking during this browser session. 
              Production authentication and cloud database security rules will be provisioned via Firebase.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            onClick={resetToDefaultData}
            className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold transition-colors flex items-center gap-1"
            title="Reset Mock Queue to Initial Sample Data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Mock Data</span>
          </button>
        </div>
      </div>

      {/* DASHBOARD HEADER */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-900/60">
                G.L. Bajaj Canteen Console
              </span>
              <span className="text-slate-600">·</span>
              <IndianClock variant="compact" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Cafe Owner & Staff Dashboard
            </h1>

            <p className="text-xs text-slate-400">
              Logged in as <strong className="text-slate-200">{adminUser?.name || 'Cafe Operator'}</strong> ({adminUser?.email || 'admin@glbitm.ac.in'})
            </p>
          </div>

          {/* Quick Header Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowWalkinModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 shadow-sm transition-colors active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Walk-in Order</span>
            </button>

            <button
              onClick={() => handleServeNext()}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-colors active:scale-95"
              title="Serve Next Pending Token Across All Categories"
            >
              <ChefHat className="w-4 h-4" />
              <span>Serve Next</span>
            </button>

            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors"
              title="Refresh Queue State"
            >
              <RefreshCw className={`w-4 h-4 text-orange-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={playChime}
              className="p-2.5 rounded-xl text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors"
              title="Test Canteen Bell Chime"
            >
              <Volume2 className="w-4 h-4 text-orange-400" />
            </button>

            <button
              onClick={logoutAdmin}
              className="p-2.5 rounded-xl text-rose-400 bg-slate-800 hover:bg-rose-950/80 border border-slate-700 transition-colors"
              title="Logout Staff Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1. SUMMARY CARDS: Active Tokens, Waiting, Serving, Completed, Expired */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mt-6 pt-6 border-t border-slate-800">
          {/* Card 1: Active Tokens */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Active Tokens
            </span>
            <div className="font-mono text-3xl font-black text-white tabular-nums">
              {summaryMetrics.active}
            </div>
            <span className="text-[10px] text-slate-500 block">Waiting + Serving</span>
          </div>

          {/* Card 2: Waiting */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
              Waiting in Line
            </span>
            <div className="font-mono text-3xl font-black text-amber-400 tabular-nums">
              {summaryMetrics.waiting}
            </div>
            <span className="text-[10px] text-slate-500 block">Pending cook start</span>
          </div>

          {/* Card 3: Serving */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">
              Serving / Ready
            </span>
            <div className="font-mono text-3xl font-black text-blue-400 tabular-nums">
              {summaryMetrics.serving}
            </div>
            <span className="text-[10px] text-slate-500 block">Cooking or at counter</span>
          </div>

          {/* Card 4: Completed */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
              Completed
            </span>
            <div className="font-mono text-3xl font-black text-emerald-400 tabular-nums">
              {summaryMetrics.completed}
            </div>
            <span className="text-[10px] text-slate-500 block">Served today</span>
          </div>

          {/* Card 5: Expired */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider block">
              Expired (60m)
            </span>
            <div className="font-mono text-3xl font-black text-rose-400 tabular-nums">
              {summaryMetrics.expired}
            </div>
            <span className="text-[10px] text-slate-500 block">Exceeded window</span>
          </div>
        </div>
      </div>

      {/* QUICK QUEUE CALL STRIP BY CATEGORY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Coffee className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Beverage (BV)</span>
              <span className="text-[10px] text-slate-500">Counter 1</span>
            </div>
          </div>
          <button
            onClick={() => handleServeNext('BV')}
            className="px-3 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg transition-colors"
          >
            Serve Next BV
          </button>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center font-bold">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Fast Food (FF)</span>
              <span className="text-[10px] text-slate-500">Counter 1</span>
            </div>
          </div>
          <button
            onClick={() => handleServeNext('FF')}
            className="px-3 py-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-lg transition-colors"
          >
            Serve Next FF
          </button>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Other (OT)</span>
              <span className="text-[10px] text-slate-500">Counter 2</span>
            </div>
          </div>
          <button
            onClick={() => handleServeNext('OT')}
            className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Serve Next OT
          </button>
        </div>
      </div>

      {/* 2. TABS & SEARCH BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            {(['All', 'Beverage', 'Fast Food', 'Other', 'Expired'] as TabFilter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setViewHistory(false);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                  activeTab === tab && !viewHistory
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab}
                {tab === 'Expired' && summaryMetrics.expired > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-mono">
                    {summaryMetrics.expired}
                  </span>
                )}
              </button>
            ))}

            <span className="text-slate-300 mx-1 hidden sm:inline">|</span>

            {/* Toggle History Tab */}
            <button
              onClick={() => setViewHistory(!viewHistory)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                viewHistory
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Token History ({historyTokens.length})</span>
            </button>
          </div>

          {/* Search by Token Number or Student Name */}
          <div className="flex items-center gap-2 w-full lg:w-72">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search token # or student name..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={handleManualRefresh}
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
              title="Refresh Queue"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. TOKEN TABLE / CARD LAYOUT */}
      {!viewHistory ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Active Queue: {activeTab}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                ({filteredActiveTokens.length} {filteredActiveTokens.length === 1 ? 'order' : 'orders'})
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="text-[11px]">Actions:</span>
              <span className="font-semibold text-slate-700">Serve Next</span>
              <span>·</span>
              <span className="font-semibold text-slate-700">Mark Completed</span>
              <span>·</span>
              <span className="font-semibold text-slate-700">Cancel</span>
              <span>·</span>
              <span className="font-semibold text-slate-700">Remove</span>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Token #</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Course</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Creation Time (IST)</th>
                  <th className="py-3.5 px-4">Expiry Time (60m)</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredActiveTokens.map((t) => {
                  const expiryDate = calculateExpiryTime(t.createdAt, TOKEN_EXPIRY_MINUTES);
                  const status = resolveDisplayStatus(t.status, t.createdAt, TOKEN_EXPIRY_MINUTES);
                  const isReady = t.status === 'ready';

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Token Number */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono text-base font-extrabold text-slate-900">
                          {t.tokenCode || t.id}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          PIN: {t.pickupPin}
                        </span>
                      </td>

                      {/* Student Name */}
                      <td className="py-3.5 px-4">
                        <strong className="font-semibold text-slate-900 block truncate max-w-40">
                          {t.studentName}
                        </strong>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {t.phone || t.rollNumber || 'GLBITM'}
                        </span>
                      </td>

                      {/* Course */}
                      <td className="py-3.5 px-4 font-medium text-slate-700 whitespace-nowrap">
                        {t.courseName || t.department || 'B.Tech'}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800">
                          {t.category}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded ml-1.5 border border-orange-200">
                          {t.categoryPrefix}
                        </span>
                      </td>

                      {/* Creation Time */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                        {formatISTTime(t.createdAt)}
                      </td>

                      {/* Expiry Time */}
                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                        <span className={status === 'EXPIRED' ? 'text-rose-600 font-bold' : ''}>
                          {formatISTTime(expiryDate)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderStatusBadge(t)}
                      </td>

                      {/* Action Buttons: Serve Next, Mark Completed, Cancel, Remove */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Serve Next Action */}
                          {t.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => {
                                serveNextToken(t.categoryPrefix);
                              }}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                              title="Start Cooking & Call Order"
                            >
                              Serve Next
                            </button>
                          )}

                          {t.status === 'preparing' && (
                            <button
                              type="button"
                              onClick={() => {
                                advanceTokenStatus(t.id);
                              }}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-1"
                              title="Mark Ready for Counter Pickup and ring bell"
                            >
                              <BellRing className="w-3 h-3" />
                              <span>Ready</span>
                            </button>
                          )}

                          {/* Mark Completed Action */}
                          {t.status !== 'completed' && t.status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => markTokenCompleted(t.id)}
                              className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
                              title="Mark Completed"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Cancel Action */}
                          {t.status !== 'completed' && t.status !== 'cancelled' && (
                            <button
                              type="button"
                              onClick={() => openConfirmModal('cancel', t)}
                              className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
                              title="Cancel Order"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Remove Action */}
                          <button
                            type="button"
                            onClick={() => openConfirmModal('remove', t)}
                            className="p-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
                            title="Remove Token"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Responsive Cards View */}
          <div className="lg:hidden p-4 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredActiveTokens.map((t) => {
              const expiryDate = calculateExpiryTime(t.createdAt, TOKEN_EXPIRY_MINUTES);

              return (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xl font-black text-slate-900 block">
                          {t.tokenCode || t.id}
                        </span>
                        <span className="text-[10px] font-semibold text-orange-600 block">
                          {t.category} ({t.categoryPrefix}) · {t.counter}
                        </span>
                      </div>
                      {renderStatusBadge(t)}
                    </div>

                    <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-150 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Student:</span>
                        <strong className="text-slate-900">{t.studentName}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Course:</span>
                        <span className="text-slate-800 font-medium">{t.courseName}</span>
                      </div>
                      <div className="flex justify-between font-mono text-[11px]">
                        <span className="text-slate-500">PIN:</span>
                        <span className="text-emerald-700 font-bold">{t.pickupPin}</span>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-slate-500 flex justify-between px-1">
                      <span>Created: {formatISTTime(t.createdAt)}</span>
                      <span>Expires: {formatISTTime(expiryDate)}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {t.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => serveNextToken(t.categoryPrefix)}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-blue-600 rounded-lg"
                        >
                          Serve Next
                        </button>
                      )}
                      {t.status === 'preparing' && (
                        <button
                          type="button"
                          onClick={() => advanceTokenStatus(t.id)}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 rounded-lg flex items-center gap-1"
                        >
                          <BellRing className="w-3 h-3" />
                          <span>Ready</span>
                        </button>
                      )}
                      {t.status !== 'completed' && t.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => markTokenCompleted(t.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg"
                        >
                          Completed
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {t.status !== 'completed' && t.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={() => openConfirmModal('cancel', t)}
                          className="p-1.5 text-amber-700 bg-amber-50 rounded-lg"
                          title="Cancel"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => openConfirmModal('remove', t)}
                        className="p-1.5 text-rose-700 bg-rose-50 rounded-lg"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredActiveTokens.length === 0 && (
            <div className="p-12 text-center space-y-3">
              <ChefHat className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">
                No active tokens in this view
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery
                  ? `No tokens match query "${searchQuery}".`
                  : `There are currently no active tokens waiting in the ${activeTab} queue.`}
              </p>
              <button
                onClick={() => {
                  setActiveTab('All');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-orange-600 hover:underline"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      ) : (
        /* 5. SEPARATE TOKEN HISTORY SECTION (Completed & Expired Tokens) */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
          <div className="p-4 sm:p-5 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-600" />
                <span>Token History (Completed, Cancelled & Expired)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Archived records for canteen fulfillment auditing.
              </p>
            </div>

            <button
              onClick={() => setViewHistory(false)}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl"
            >
              Back to Active Queue
            </button>
          </div>

          {/* History Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Token #</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Issued At</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {historyTokens.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {t.tokenCode || t.id}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900 truncate max-w-40">
                      {t.studentName}
                    </td>
                    <td className="py-3 px-4">{t.courseName}</td>
                    <td className="py-3 px-4">
                      {t.category} ({t.categoryPrefix})
                    </td>
                    <td className="py-3 px-4 font-mono">{formatISTTime(t.createdAt)}</td>
                    <td className="py-3 px-4">{renderStatusBadge(t)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openConfirmModal('remove', t)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Remove from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {historyTokens.length === 0 && (
            <div className="p-12 text-center text-xs text-slate-400">
              No historical tokens found.
            </div>
          )}
        </div>
      )}

      {/* CONFIRMATION DIALOG FOR DESTRUCTIVE ACTIONS */}
      {confirmModal.isOpen && confirmModal.token && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 text-slate-900">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  confirmModal.type === 'remove'
                    ? 'bg-rose-50 text-rose-600 border border-rose-200'
                    : 'bg-amber-50 text-amber-600 border border-amber-200'
                }`}
              >
                {confirmModal.type === 'remove' ? (
                  <Trash2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold">
                  {confirmModal.type === 'remove'
                    ? 'Remove Token from Queue?'
                    : 'Cancel This Food Token?'}
                </h3>
                <span className="font-mono text-xs text-orange-600 font-bold block">
                  {confirmModal.token.tokenCode || confirmModal.token.id} · {confirmModal.token.studentName}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {confirmModal.type === 'remove'
                ? 'This will permanently remove this token from the active session queue. The student tracker will immediately update.'
                : 'This will mark the token as CANCELLED. The student tracker will update to indicate the cancellation.'}
            </p>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, type: 'cancel', token: null })}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={executeConfirmedAction}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white transition-colors ${
                  confirmModal.type === 'remove'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                {confirmModal.type === 'remove' ? 'Yes, Remove Token' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WALK-IN ORDER MODAL */}
      {showWalkinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 text-slate-900 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold">New Walk-in Canteen Token</h3>
                <span className="text-xs text-slate-400">Generate an offline token directly at register</span>
              </div>
              <button
                onClick={() => setShowWalkinModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWalkin} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  placeholder="e.g. Priyanshu Sharma"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Course *</label>
                <select
                  value={walkinCourse}
                  onChange={(e) => setWalkinCourse(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
                >
                  <option value="B.Tech CSE">B.Tech CSE</option>
                  <option value="B.Tech AI & ML">B.Tech AI & ML</option>
                  <option value="B.Tech IT">B.Tech IT</option>
                  <option value="BCA">BCA</option>
                  <option value="Other">Other Branch</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Order Category *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Beverage', 'Fast Food', 'Other'] as MainCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setWalkinCategory(cat)}
                      className={`p-2 rounded-xl text-center font-bold border transition-all ${
                        walkinCategory === cat
                          ? 'border-orange-500 bg-orange-50 text-orange-950 shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 shadow-sm"
                >
                  Issue Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
