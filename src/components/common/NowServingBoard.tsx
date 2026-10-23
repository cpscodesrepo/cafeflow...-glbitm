import React from 'react';
import { useCafe } from '../../context/CafeContext';
import { Volume2, Sparkles, ChefHat, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  condensed?: boolean;
}

export const NowServingBoard: React.FC<Props> = ({ condensed = false }) => {
  const { tokens, playChime } = useCafe();

  const readyTokens = tokens.filter((t) => t.status === 'ready');
  const preparingTokens = tokens.filter((t) => t.status === 'preparing');

  const readyCounter1 = readyTokens.filter((t) => t.counter === 'Counter 1');
  const readyCounter2 = readyTokens.filter((t) => t.counter === 'Counter 2');

  if (condensed) {
    return (
      <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs uppercase font-bold tracking-wider text-slate-300">
              Live Token Board
            </span>
          </div>
          <button
            onClick={playChime}
            className="text-xs text-slate-400 hover:text-orange-400 flex items-center gap-1 transition-colors"
            title="Test Canteen Bell Chime"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chime</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Counter 1 (Beverages & Snacks)
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {readyCounter1.length > 0 ? (
                readyCounter1.map((t) => (
                  <Link
                    key={t.id}
                    to={`/track?id=${t.id}`}
                    className="font-mono text-base font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded hover:bg-emerald-900/80 transition-colors"
                  >
                    {t.tokenCode || `#${t.tokenNumber}`}
                  </Link>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic py-0.5">Cooking queue...</span>
              )}
            </div>
          </div>

          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-850">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              Counter 2 (Meals & Dosas)
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {readyCounter2.length > 0 ? (
                readyCounter2.map((t) => (
                  <Link
                    key={t.id}
                    to={`/track?id=${t.id}`}
                    className="font-mono text-base font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded hover:bg-emerald-900/80 transition-colors"
                  >
                    {t.tokenCode || `#${t.tokenNumber}`}
                  </Link>
                ))
              ) : (
                <span className="text-xs text-slate-500 italic py-0.5">Cooking queue...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
      {/* Board Header styled like digital canteen display */}
      <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
          <div>
            <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <span>G.L. BAJAJ CANTEEN TOKEN DISPLAY</span>
              <span className="text-xs font-normal text-orange-400 bg-orange-950/60 border border-orange-900/60 px-2 py-0.5 rounded">
                LIVE
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Listen for audio bell and look for your token number on pickup screens
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={playChime}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-xs text-slate-300 hover:text-white transition-all border border-slate-750"
            title="Simulate pickup chime"
          >
            <Volume2 className="w-4 h-4 text-orange-400" />
            <span>Test Bell Chime</span>
          </button>
          <Link
            to="/track"
            className="text-xs font-semibold text-orange-400 hover:text-orange-300 underline underline-offset-4"
          >
            Track Yours →
          </Link>
        </div>
      </div>

      {/* Main Now Serving Grid */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/90">
        {/* Counter 1 Ready */}
        <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 block">
                Counter 01
              </span>
              <h4 className="text-sm font-semibold text-white">Chai, Coffee & Quick Bites</h4>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Ready for Pickup</span>
            </div>
          </div>

          <div className="min-h-[90px] flex items-center justify-center p-3 bg-slate-900 rounded-lg border border-slate-800">
            {readyCounter1.length > 0 ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                {readyCounter1.map((t) => (
                  <Link
                    key={t.id}
                    to={`/track?id=${t.id}`}
                    className="group flex flex-col items-center bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-lg px-4 py-2 transition-all hover:scale-105"
                  >
                    <span className="font-mono text-3xl font-extrabold text-emerald-400 tracking-tight">
                      {t.tokenCode || `#${t.tokenNumber}`}
                    </span>
                    <span className="text-[10px] text-emerald-300/80 group-hover:text-emerald-200">
                      PIN: {t.pickupPin}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 text-xs py-2">
                <span>All caught up! Next order is cooking in kitchen.</span>
              </div>
            )}
          </div>
        </div>

        {/* Counter 2 Ready */}
        <div className="bg-slate-950/80 rounded-xl p-5 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-400 block">
                Counter 02
              </span>
              <h4 className="text-sm font-semibold text-white">Dosas, Thalis, Rolls & Maggi</h4>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Ready for Pickup</span>
            </div>
          </div>

          <div className="min-h-[90px] flex items-center justify-center p-3 bg-slate-900 rounded-lg border border-slate-800">
            {readyCounter2.length > 0 ? (
              <div className="flex flex-wrap items-center justify-center gap-3">
                {readyCounter2.map((t) => (
                  <Link
                    key={t.id}
                    to={`/track?id=${t.id}`}
                    className="group flex flex-col items-center bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 rounded-lg px-4 py-2 transition-all hover:scale-105"
                  >
                    <span className="font-mono text-3xl font-extrabold text-emerald-400 tracking-tight">
                      {t.tokenCode || `#${t.tokenNumber}`}
                    </span>
                    <span className="text-[10px] text-emerald-300/80 group-hover:text-emerald-200">
                      PIN: {t.pickupPin}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 text-xs py-2">
                <span>All caught up! Next order is cooking in kitchen.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Next Up / Kitchen Queue bar */}
      <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <ChefHat className="w-4 h-4 text-orange-400" />
          <span className="font-medium text-slate-300">Now Preparing in Kitchen:</span>
          {preparingTokens.length > 0 ? (
            <div className="flex items-center gap-2">
              {preparingTokens.slice(0, 6).map((t) => (
                <span
                  key={t.id}
                  className="font-mono font-semibold text-amber-400 bg-amber-950/40 border border-amber-800/50 px-2 py-0.5 rounded text-xs"
                >
                  {t.tokenCode || `#${t.tokenNumber}`}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-slate-500 italic">No pending preparation queue</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span>Avg Wait:</span>
          <span className="font-mono text-orange-400 font-semibold">6-10 Mins</span>
          <span>·</span>
          <span>Show token PIN to collect food</span>
        </div>
      </div>
    </div>
  );
};
