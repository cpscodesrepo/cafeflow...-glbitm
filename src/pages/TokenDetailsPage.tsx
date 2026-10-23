import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';
import { TokenTicketCard } from '../components/common/TokenTicketCard';
import { TokenOrder } from '../types/cafe';
import { IndianClock } from '../components/common/IndianClock';
import { 
  Search, 
  ArrowLeft, 
  Sparkles, 
  PlusCircle, 
  Clock, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';

export const TokenDetailsPage: React.FC = () => {
  const { id: routeId } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { tokens, recentUserTokens, getTokenByIdOrNumber, advanceTokenStatus } = useCafe();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeToken, setActiveToken] = useState<TokenOrder | null>(null);
  const [notFoundQuery, setNotFoundQuery] = useState('');

  // Target query from either route parameter `/token/:id` or query param `/token?id=...`
  const targetId = routeId || searchParams.get('id');

  useEffect(() => {
    if (targetId) {
      const found = getTokenByIdOrNumber(targetId);
      if (found) {
        setActiveToken(found);
        setSearchQuery(found.tokenCode || found.id);
        setNotFoundQuery('');
      } else {
        setNotFoundQuery(targetId);
        setActiveToken(null);
      }
    } else if (recentUserTokens.length > 0) {
      // Default to most recent user token
      setActiveToken(recentUserTokens[0]);
      setSearchQuery(recentUserTokens[0].tokenCode || recentUserTokens[0].id);
    } else if (tokens.length > 0) {
      setActiveToken(tokens[0]);
      setSearchQuery(tokens[0].tokenCode || tokens[0].id);
    }
  }, [targetId, tokens, recentUserTokens]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const found = getTokenByIdOrNumber(searchQuery);
    if (found) {
      setActiveToken(found);
      setNotFoundQuery('');
      navigate(`/token/${found.tokenCode || found.id}`);
    } else {
      setNotFoundQuery(searchQuery);
      setActiveToken(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">
            <Link to="/" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Canteen Portal</span>
            </Link>
            <span>·</span>
            <span>Token Details Screen</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Digital Token Receipt
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time validity, 60-minute countdown, and canteen counter status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <IndianClock variant="badge" />
        </div>
      </div>

      {/* Quick Lookup Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Token (e.g. BV-001, FF-001, OT-001)..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 transition-colors shrink-0"
          >
            Find Token
          </button>
        </form>

        {/* Quick Recent Chips */}
        {recentUserTokens.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium text-[11px]">Recent Tokens:</span>
            {recentUserTokens.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveToken(t);
                  setSearchQuery(t.tokenCode || t.id);
                  navigate(`/token/${t.tokenCode || t.id}`);
                }}
                className={`px-2.5 py-1 rounded-md font-mono text-xs transition-colors ${
                  activeToken?.id === t.id
                    ? 'bg-orange-500 text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {t.tokenCode || t.id}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Ticket Display */}
      {activeToken ? (
        <div className="space-y-6">
          {/* Reusable TokenTicketCard Component */}
          <TokenTicketCard token={activeToken} showActions={true} />

          {/* Interactive Status Demonstration Controller */}
          <div className="max-w-md mx-auto bg-slate-100/80 rounded-2xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>Demo Status Simulator</span>
              </span>
              <button
                type="button"
                onClick={() => advanceTokenStatus(activeToken.id)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Next Status</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Advance this demo token through WAITING &rarr; SERVING &rarr; COMPLETED to preview live badge transitions.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {notFoundQuery ? `Token "${notFoundQuery}" Not Found` : 'No Token Selected'}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Please check your token number or generate a new token for the G.L. Bajaj cafeteria.
          </p>
          <div className="pt-2">
            <Link
              to="/generate"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Generate New Token</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
