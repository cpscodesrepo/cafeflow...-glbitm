import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';
import { Coffee, ShieldCheck, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginAdmin, isAdminAuthenticated } = useCafe();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to admin
  React.useEffect(() => {
    if (isAdminAuthenticated) {
      navigate('/admin');
    }
  }, [isAdminAuthenticated, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const success = loginAdmin(email, password);
      setLoading(false);
      if (success) {
        navigate('/admin');
      } else {
        setError('Invalid staff credentials. Please check your canteen email or ID.');
      }
    }, 300);
  };

  const handleQuickDemoFill = () => {
    setEmail('admin@glbitm.ac.in');
    setPassword('canteen123');
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-14rem)] flex items-center justify-center px-4 sm:px-6 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-orange-500 mx-auto flex items-center justify-center shadow-lg shadow-orange-500/10">
            <Coffee className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600 block">
            G.L. Bajaj Institute of Technology & Management
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Cafe Staff & Kitchen Portal
          </h1>
          <p className="text-xs text-slate-500">
            Authorized canteen administrators, counter operators and head chefs.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Staff Email / ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@glbitm.ac.in"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">Default: canteen123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              {loading ? (
                <span>Authenticating Staff...</span>
              ) : (
                <>
                  <span>Sign In to Kitchen Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-orange-400" />
                </>
              )}
            </button>
          </form>

          {/* One-click demo credential box */}
          <div className="pt-4 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-between gap-3">
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block">Try Staff Account:</span>
                <span className="text-slate-500 font-mono text-[11px]">admin@glbitm.ac.in</span>
              </div>
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="px-3 py-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors shrink-0"
              >
                Auto Fill
              </button>
            </div>
          </div>
        </div>

        {/* Back to student site */}
        <div className="text-center text-xs text-slate-500">
          <span>Are you a student? </span>
          <Link to="/" className="text-orange-600 font-semibold hover:underline">
            Back to Student Canteen Home
          </Link>
        </div>
      </div>
    </div>
  );
};
