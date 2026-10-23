import React from 'react';
import { Link } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';
import { IndianClock } from '../components/common/IndianClock';
import { 
  PlusCircle, 
  Search, 
  Clock, 
  Coffee, 
  UtensilsCrossed, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  BellRing, 
  ChefHat,
  ShieldCheck,
  Flame,
  Volume2
} from 'lucide-react';

import heroCanteenImg from '../assets/images/cafeflow_hero_canteen_1792755111089.jpg';
import foodThaliImg from '../assets/images/cafeflow_dish_thali_1792755111092.jpg';

export const HomePage: React.FC = () => {
  const { tokens, menuItems, playChime } = useCafe();

  // Dynamic queue summary from active state
  const readyTokens = tokens.filter((t) => t.status === 'ready');
  const preparingTokens = tokens.filter((t) => t.status === 'preparing');
  const pendingTokens = tokens.filter((t) => t.status === 'pending');
  
  const peopleWaiting = preparingTokens.length + pendingTokens.length;

  const servingCounter1 = readyTokens.find((t) => t.counter === 'Counter 1') || 
    preparingTokens.find((t) => t.counter === 'Counter 1') || null;

  const servingCounter2 = readyTokens.find((t) => t.counter === 'Counter 2') || 
    preparingTokens.find((t) => t.counter === 'Counter 2') || null;

  // Category data tailored to the 3 requested groups: Beverage, Fast Food, Other
  const categoryCards = [
    {
      id: 'beverage',
      title: 'Beverage',
      hindiTitle: 'पेय पदार्थ',
      description: 'Freshly prepared hot kulhad chai, hand-beaten cold coffee, spiced lemon shikanji, and seasonal coolers.',
      counter: 'Counter 1 (Beverages)',
      avgPrep: '2–4 mins',
      popular: ['Kulhad Masala Chai (₹20)', 'Thick Cold Coffee (₹55)', 'Fresh Nimbu Shikanji (₹30)'],
      icon: Coffee,
      badgeColor: 'text-amber-800 bg-amber-50 border-amber-200',
      targetCategory: 'Beverages & Chai',
      href: '/generate?category=Beverages%20%26%20Chai',
    },
    {
      id: 'fast-food',
      title: 'Fast Food',
      hindiTitle: 'फास्ट फूड व स्नैक्स',
      description: 'Crispy aloo samosas with tangy chutneys, grilled paneer sandwiches, street kathi rolls, and cheese Maggi.',
      counter: 'Counter 1 & 2',
      avgPrep: '4–7 mins',
      popular: ['Crispy Samosa Plate (₹30)', 'Paneer Grilled Sandwich (₹75)', 'Veg Cheese Maggi (₹55)'],
      icon: UtensilsCrossed,
      badgeColor: 'text-orange-800 bg-orange-50 border-orange-200',
      targetCategory: 'Quick Snacks',
      href: '/generate?category=Quick%20Snacks',
    },
    {
      id: 'other',
      title: 'Other',
      hindiTitle: 'थाली, डोसा व मील',
      description: 'Crisp South Indian masala dosas, fluffy chole bhature, homestyle rajma chawal canteen thalis, and daily lunch plates.',
      counter: 'Counter 2 (Hot Meals)',
      avgPrep: '6–9 mins',
      popular: ['Crispy Masala Dosa (₹85)', 'Chole Bhature Special (₹90)', 'Rajma Chawal Thali (₹85)'],
      icon: Layers,
      badgeColor: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      targetCategory: 'Meals & Combos',
      href: '/generate?category=Meals%20%26%20Combos',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-900 text-white rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 sm:mt-6 border border-slate-800 shadow-xl">
        {/* Subtle architectural gradient accents */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-700/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* College Insignia & Live Clock Header Strip */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs font-medium text-slate-200">
                  <span className="font-semibold text-orange-400">G.L. Bajaj Institute</span>
                  <span className="text-slate-600">·</span>
                  <span>Greater Noida, UP</span>
                </div>
                
                {/* Live Indian Clock showing HH:MM:SS IST */}
                <IndianClock variant="hero" />
              </div>

              {/* Exact Requested Hero Heading */}
              <h1 
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight"
                style={{ textWrap: 'balance' }}
              >
                Skip the Queue. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">
                  Grab Your Token.
                </span>
              </h1>

              {/* Exact Requested Subtitle */}
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Experience hassle-free dining at the G.L. Bajaj campus cafeteria. 
                Generate your digital food token in seconds and track your order's live queue progress from your lecture hall or bench.
              </p>

              {/* Hero Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/generate"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-orange-600 hover:bg-orange-500 transition-all duration-200 shadow-lg shadow-orange-600/25 active:scale-95"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Generate Token</span>
                </Link>

                <Link
                  to="/track"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-slate-800 hover:bg-slate-750 hover:text-white border border-slate-700 transition-all active:scale-95"
                >
                  <Search className="w-4 h-4 text-orange-400" />
                  <span>Track My Token</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-400 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Avg. Wait: ~6–10 Mins</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>Dual Campus Pickup Counters</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>PIN-Verified Food Handover</span>
                </div>
              </div>
            </div>

            {/* Right Column: Live Queue Summary Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden space-y-5">
                <div className="flex items-center justify-between border-b border-slate-850 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h3 className="text-xs uppercase font-bold tracking-wider text-slate-200">
                      Live Canteen Queue Summary
                    </h3>
                  </div>
                  <button
                    onClick={playChime}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-orange-400 hover:bg-slate-850 transition-colors"
                    title="Test Canteen Pickup Bell"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Currently Serving Display */}
                <div className="space-y-3">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                    Currently Serving
                  </span>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Counter 1 */}
                    <div className="bg-slate-900 rounded-xl p-3.5 border border-slate-800">
                      <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                        Counter 1 (Beverages)
                      </span>
                      {servingCounter1 ? (
                        <div className="mt-1">
                          <span className="font-mono text-2xl font-black text-emerald-400">
                            {servingCounter1.tokenCode || `#${servingCounter1.tokenNumber}`}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {servingCounter1.studentName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic block mt-1">
                          Cooking next...
                        </span>
                      )}
                    </div>

                    {/* Counter 2 */}
                    <div className="bg-slate-900 rounded-xl p-3.5 border border-slate-850">
                      <span className="text-[10px] text-orange-400 font-bold uppercase tracking-wider block">
                        Counter 2 (Meals & Fast Food)
                      </span>
                      {servingCounter2 ? (
                        <div className="mt-1">
                          <span className="font-mono text-2xl font-black text-emerald-400">
                            {servingCounter2.tokenCode || `#${servingCounter2.tokenNumber}`}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {servingCounter2.studentName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic block mt-1">
                          Cooking next...
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* People Waiting Metric Strip */}
                <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-orange-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">People Waiting</span>
                      <strong className="text-slate-100 font-mono text-sm">
                        {peopleWaiting} in Kitchen Queue
                      </strong>
                    </div>
                  </div>

                  <div className="text-right border-l border-slate-800 pl-4">
                    <span className="text-slate-400 block text-[11px]">Rush Status</span>
                    <span className="font-semibold text-emerald-400 text-xs">
                      {peopleWaiting <= 3 ? 'Normal Flow' : peopleWaiting <= 7 ? 'Moderate' : 'Peak Break'}
                    </span>
                  </div>
                </div>

                {/* Quick Link into Live Tracking */}
                <div className="pt-1">
                  <Link
                    to="/track"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors"
                  >
                    <span>View Full Live Status Screen</span>
                    <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE CATEGORY CARDS: Beverage, Fast Food, Other */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">
              <span>Campus Canteen Menu</span>
              <span>·</span>
              <span>Quick Categories</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Browse Menu Categories
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select a category to pre-order and generate your token ticket directly.
            </p>
          </div>

          <Link
            to="/generate"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline underline-offset-4"
          >
            <span>Explore All Items</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* The Three Responsive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-orange-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Category Top Banner */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-orange-400 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${cat.badgeColor}`}>
                      {cat.avgPrep} prep
                    </span>
                  </div>

                  <div className="mb-2">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-orange-600 transition-colors">
                      {cat.title}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium block">
                      {cat.hindiTitle}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {cat.description}
                  </p>

                  {/* Highlights list */}
                  <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Student Favorites:
                    </span>
                    {cat.popular.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="pt-6 mt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span>Pickup Location:</span>
                    <strong className="text-slate-700">{cat.counter}</strong>
                  </div>

                  <Link
                    to={cat.href}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-900 bg-slate-100 hover:bg-orange-500 hover:text-white transition-all duration-200 group-hover:bg-orange-600 group-hover:text-white shadow-xs"
                  >
                    <span>Order {cat.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS SECTION — EXACTLY THREE CLEAN STEPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-orange-600 uppercase tracking-wider">
            <span>Student Guide</span>
            <span>·</span>
            <span>Zero Queue Experience</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            How It Works
          </h2>
          <p className="text-sm text-slate-500">
            Three simple steps to enjoy fresh cafeteria meals without crowded queues.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 relative shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-3xl font-extrabold text-orange-500/30">01</span>
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center font-bold">
                <PlusCircle className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Select & Generate
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Choose your favorite beverages, snacks, or lunch combos on CafeFlow. 
              Confirm payment via UPI, GLB Canteen Card, or cash, and receive your digital token ticket instantly.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 relative shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-3xl font-extrabold text-orange-500/30">02</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold">
                <Search className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Live Queue Tracking
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Monitor your token in real time from anywhere in the college campus. 
              Watch the status shift from <em>Cooking in Kitchen</em> to <em>Ready for Pickup</em>.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 relative shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-3xl font-extrabold text-orange-500/30">03</span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Pick Up at Counter
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When the canteen audio chime sounds and your number turns green, 
              head to Counter 1 or Counter 2, show your 4-digit verification PIN, and collect your piping hot order.
            </p>
          </div>
        </div>
      </section>

      {/* CAMPUS CANTEEN ENVIRONMENT HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
              <span>Campus Cafeteria Notice</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              G.L. Bajaj Institute of Technology & Management Cafeteria
            </h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Serving thousands of students, faculty members, and research scholars daily across 
              Knowledge Park III, Greater Noida. Keep your digital token ready to avoid counter congestion.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/generate"
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-orange-600 hover:bg-orange-500 transition-colors shadow-sm"
            >
              Generate Token
            </Link>
            <Link
              to="/track"
              className="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-200 bg-slate-800 hover:bg-slate-750 border border-slate-700 transition-colors"
            >
              Track Token
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
