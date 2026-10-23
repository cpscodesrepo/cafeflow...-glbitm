import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Phone, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: College Emblem & Brand */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-auto bg-white rounded-lg p-1.5 border border-slate-750 shadow-sm flex items-center justify-center">
                <img
                  src="/assets/aistudio/glb_logo_2abf9b4e.jpg"
                  alt="G.L. Bajaj Institute of Technology and Management"
                  className="h-9 w-auto object-contain"
                />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white block">
                  CafeFlow · GLBITM
                </span>
                <span className="text-xs text-orange-400 font-medium">
                  Official Campus Cafe Token Management
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Official digital food token and live queue tracking system developed for students, 
              faculty, and staff at <strong className="text-slate-200">G.L. Bajaj Institute of Technology and Management, Greater Noida, Uttar Pradesh, India</strong>.
            </p>

            <div className="flex items-start gap-2 text-xs text-slate-400 pt-1">
              <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <span>Plot No. 2, Knowledge Park III, Greater Noida, Gautam Buddha Nagar, Uttar Pradesh 201306, India</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Canteen Portals
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-orange-400 transition-colors">
                  Overview & Live Queue
                </Link>
              </li>
              <li>
                <Link to="/generate" className="hover:text-orange-400 transition-colors">
                  Generate Food Token
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-orange-400 transition-colors">
                  Track My Token
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-orange-400 transition-colors">
                  Kitchen Staff Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-orange-400 transition-colors">
                  Canteen Staff Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Canteen Hours & Counters */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Campus Cafe Operating Hours
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-200 font-semibold block">Monday – Saturday</span>
                  <span>8:30 AM – 7:30 PM (Class hours continuous)</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-200 font-semibold block">Canteen Token Support</span>
                  <span>Intercom: 241 · canteen@glbitm.ac.in</span>
                </div>
              </div>
              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-800">
                <p>Counter 1: Hot Beverages & Fast Food</p>
                <p>Counter 2: Fresh Dosas, Meals & Thalis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} CafeFlow · G.L. Bajaj Institute of Technology and Management, Greater Noida, Uttar Pradesh, India.
          </p>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Student First Initiative</span>
            <span>·</span>
            <span>Zero-Queue Campus Cafeteria</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
