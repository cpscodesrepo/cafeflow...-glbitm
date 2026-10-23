import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Home, Search, PlusCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center mx-auto">
          <Coffee className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="font-mono text-xs font-bold text-orange-600 uppercase tracking-widest block">
            404 Error · Page Not Found
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Off-Menu Location
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            The canteen terminal page you requested does not exist or has been moved.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Home className="w-4 h-4" />
            <span>Canteen Home</span>
          </Link>

          <Link
            to="/track"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Search className="w-4 h-4 text-orange-500" />
            <span>Track Token</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
