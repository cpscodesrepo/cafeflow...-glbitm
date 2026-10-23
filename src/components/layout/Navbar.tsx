import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Coffee, Search, PlusCircle, LayoutDashboard, Menu, X, ShieldCheck } from 'lucide-react';
import { useCafe } from '../../context/CafeContext';
import { IndianClock } from '../common/IndianClock';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { isAdminAuthenticated } = useCafe();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      {/* College Institutional Strip with Live Indian Clock */}
      <div className="bg-slate-950 px-4 py-1.5 border-b border-slate-850">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <span className="font-semibold text-slate-200">
              G.L. Bajaj Institute of Technology and Management
            </span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="hidden sm:inline text-orange-400 font-medium">
              Campus Cafe Token Management
            </span>
            <span className="text-slate-600 hidden md:inline">·</span>
            <span className="hidden md:inline text-slate-400">
              Greater Noida, Uttar Pradesh
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-4">
            <IndianClock variant="compact" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-18">
          {/* Zone 1: College Brand & CafeFlow Wordmark */}
          <Link to="/" className="flex items-center gap-3.5 whitespace-nowrap shrink-0 group py-1">
            <div className="h-11 w-auto bg-white rounded-lg p-1 border border-slate-700 shadow-sm flex items-center justify-center shrink-0">
              <img
                src="/assets/aistudio/glb_logo_2abf9b4e.jpg"
                alt="G.L. Bajaj Institute of Technology & Management Logo"
                className="h-9 w-auto object-contain"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-white group-hover:text-orange-400 transition-colors">
                  CafeFlow
                </span>
                <span className="text-[10px] bg-orange-950 text-orange-400 font-bold px-1.5 py-0.5 rounded border border-orange-900/60 uppercase tracking-wider">
                  GLBITM
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-normal">
                Official Campus Cafeteria
              </span>
            </div>
          </Link>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <Link
              to="/"
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 ${
                isActive('/') ? 'text-orange-400 border-b-2 border-orange-500 font-semibold' : ''
              }`}
            >
              Overview
            </Link>
            <Link
              to="/generate"
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 ${
                isActive('/generate') ? 'text-orange-400 border-b-2 border-orange-500 font-semibold' : ''
              }`}
            >
              Generate Token
            </Link>
            <Link
              to="/track"
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 ${
                isActive('/track') ? 'text-orange-400 border-b-2 border-orange-500 font-semibold' : ''
              }`}
            >
              Track My Token
            </Link>
            <Link
              to={isAdminAuthenticated ? '/admin' : '/admin/login'}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 pb-1 flex items-center gap-1.5 ${
                isActive('/admin') || isActive('/admin/login')
                  ? 'text-orange-400 border-b-2 border-orange-500 font-semibold'
                  : ''
              }`}
            >
              {isAdminAuthenticated ? (
                <>
                  <LayoutDashboard className="w-4 h-4 text-orange-400" />
                  <span>Kitchen Console</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>Staff Login</span>
                </>
              )}
            </Link>
          </nav>

          {/* Zone 3: Primary Action CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/generate"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-orange-600 rounded-lg hover:bg-orange-500 transition-all duration-200 shadow-sm shadow-orange-600/30 whitespace-nowrap shrink-0 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Generate Token</span>
            </Link>

            <Link
              to="/track"
              className="inline-flex sm:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
              title="Track Token"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/') ? 'bg-orange-500/10 text-orange-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Overview
          </Link>
          <Link
            to="/generate"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/generate') ? 'bg-orange-500/10 text-orange-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Generate Token
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/track') ? 'bg-orange-500/10 text-orange-400 font-semibold' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Track My Token
          </Link>
          <Link
            to={isAdminAuthenticated ? '/admin' : '/admin/login'}
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${
              isActive('/admin') || isActive('/admin/login')
                ? 'bg-orange-500/10 text-orange-400 font-semibold'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            {isAdminAuthenticated ? 'Kitchen Console' : 'Staff Login'}
          </Link>

          <div className="pt-2">
            <Link
              to="/generate"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-white bg-orange-600 rounded-lg hover:bg-orange-500"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Generate Token</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
