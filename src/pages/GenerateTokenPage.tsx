import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useCafe } from '../context/CafeContext';
import { MainCategory, MainCategoryPrefix, TokenOrder } from '../types/cafe';
import { IndianClock } from '../components/common/IndianClock';
import { TokenTicketCard } from '../components/common/TokenTicketCard';
import { 
  Coffee, 
  UtensilsCrossed, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Printer, 
  ArrowRight, 
  RotateCcw, 
  User, 
  GraduationCap, 
  Sparkles, 
  Info,
  ShieldCheck,
  Calendar,
  Check
} from 'lucide-react';

const COURSE_OPTIONS = [
  'B.Tech CSE',
  'B.Tech AI & ML',
  'B.Tech IT',
  'BCA',
  'Other',
];

interface CategoryCardConfig {
  id: MainCategory;
  prefix: MainCategoryPrefix;
  title: string;
  hindiTitle: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  examples: string[];
  counter: 'Counter 1' | 'Counter 2';
  prepTime: string;
  accentBg: string;
  activeBorder: string;
  activeBadge: string;
}

const CATEGORY_CARDS: CategoryCardConfig[] = [
  {
    id: 'Beverage',
    prefix: 'BV',
    title: 'Beverage (BV)',
    hindiTitle: 'चाय, कॉफी व जूस',
    subtitle: 'Tea, coffee, juice & fresh coolers',
    icon: Coffee,
    examples: ['Kulhad Masala Chai', 'Cold Coffee', 'Fresh Nimbu Shikanji', 'Filter Coffee'],
    counter: 'Counter 1',
    prepTime: '~3-5 mins',
    accentBg: 'from-amber-500/10 to-transparent',
    activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40',
    activeBadge: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    id: 'Fast Food',
    prefix: 'FF',
    title: 'Fast Food (FF)',
    hindiTitle: 'बर्गर, सैंडविच व मैगी',
    subtitle: 'Burger, sandwich, Maggi, momos & rolls',
    icon: UtensilsCrossed,
    examples: ['Crispy Samosa Plate', 'Paneer Grilled Sandwich', 'Cheese Maggi', 'Veg Momos'],
    counter: 'Counter 1',
    prepTime: '~5-8 mins',
    accentBg: 'from-orange-500/10 to-transparent',
    activeBorder: 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/40',
    activeBadge: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  {
    id: 'Other',
    prefix: 'OT',
    title: 'Other (OT)',
    hindiTitle: 'थाली, डोसा व स्नैक्स',
    subtitle: 'Snacks, thalis, dosas & miscellaneous',
    icon: Layers,
    examples: ['Crispy Masala Dosa', 'Chole Bhature Special', 'Rajma Chawal Thali', 'Desserts'],
    counter: 'Counter 2',
    prepTime: '~7-10 mins',
    accentBg: 'from-blue-500/10 to-transparent',
    activeBorder: 'border-blue-600 ring-2 ring-blue-600/20 bg-blue-50/40',
    activeBadge: 'bg-blue-100 text-blue-800 border-blue-300',
  },
];

export const GenerateTokenPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { generateToken } = useCafe();

  // Form State
  const [studentName, setStudentName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [customCourse, setCustomCourse] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MainCategory | null>(null);
  const [specialNote, setSpecialNote] = useState('');

  // Validation & UI feedback
  const [errors, setErrors] = useState<{
    name?: string;
    course?: string;
    category?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('');

  // Generated Token Success state
  const [generatedToken, setGeneratedToken] = useState<TokenOrder | null>(null);

  // Sync category from URL if present (e.g. ?category=Beverage)
  useEffect(() => {
    const catQuery = searchParams.get('category');
    if (catQuery) {
      if (catQuery.toLowerCase().includes('bev') || catQuery === 'BV') {
        setSelectedCategory('Beverage');
      } else if (catQuery.toLowerCase().includes('fast') || catQuery.toLowerCase().includes('snack') || catQuery === 'FF') {
        setSelectedCategory('Fast Food');
      } else if (catQuery.toLowerCase().includes('other') || catQuery.toLowerCase().includes('meal') || catQuery === 'OT') {
        setSelectedCategory('Other');
      }
    }
  }, [searchParams]);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: { name?: string; course?: string; category?: string } = {};

    const trimmedName = studentName.trim();
    if (!trimmedName) {
      newErrors.name = 'Student full name is required.';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Please enter at least 2 characters for the name.';
    }

    if (!selectedCourse) {
      newErrors.course = 'Please select your course.';
    } else if (selectedCourse === 'Other' && !customCourse.trim()) {
      newErrors.course = 'Please specify your course name.';
    }

    if (!selectedCategory) {
      newErrors.category = 'Please choose an order category card below.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * =========================================================================
   * TOKEN SUBMISSION HANDLER (MOCK DATA SIMULATION)
   *
   * FUTURE FIREBASE INTEGRATION HOOK:
   * When connecting to Firebase Firestore:
   * ```ts
   * import { db } from '../firebase/config';
   * import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
   *
   * const docRef = await addDoc(collection(db, 'tokens'), {
   *   tokenNumber: generatedTokenCode,
   *   studentName: studentName.trim(),
   *   course: resolvedCourse,
   *   category: selectedCategory,
   *   prefix: categoryConfig.prefix,
   *   status: 'pending',
   *   createdAt: serverTimestamp(),
   *   expiresAt: new Date(Date.now() + 45 * 60 * 1000),
   * });
   * ```
   * =========================================================================
   */
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoadingStepText('Allocating next canteen queue slot...');

    // Simulate smooth asynchronous token allocation
    setTimeout(() => {
      setLoadingStepText('Assigning counter & generating verification PIN...');
      
      setTimeout(() => {
        const resolvedCourse = selectedCourse === 'Other' ? customCourse.trim() : selectedCourse;
        const catConfig = CATEGORY_CARDS.find((c) => c.id === selectedCategory)!;

        const newOrder = generateToken({
          studentName: studentName.trim(),
          courseName: resolvedCourse,
          category: selectedCategory!,
          categoryPrefix: catConfig.prefix,
          counter: catConfig.counter,
          specialInstructions: specialNote.trim() || undefined,
        });

        setIsLoading(false);
        setGeneratedToken(newOrder);
      }, 350);
    }, 350);
  };

  // Helper quick-fill demo for testing
  const handleFillDemo = (name: string, course: string, cat: MainCategory) => {
    setStudentName(name);
    setSelectedCourse(course);
    setCustomCourse('');
    setSelectedCategory(cat);
    setErrors({});
  };

  // Helper date-time format for IST
  const formatTimeIST = (isoString?: string) => {
    if (!isoString) return '--:--';
    try {
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(new Date(isoString));
    } catch {
      return isoString;
    }
  };

  const formatDateIST = (isoString?: string) => {
    if (!isoString) return '';
    try {
      return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(isoString));
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* College Breadcrumb & Title */}
      <div className="border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-orange-600 uppercase tracking-wider">
            <span>G.L. Bajaj Cafeteria</span>
            <span>·</span>
            <span>Digital Token Terminal</span>
          </div>

          <IndianClock variant="badge" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Generate Cafe Token
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Fill in your details, select an order category, and instantly receive your demo token ticket with live queue tracking.
        </p>
      </div>

      {/* SUCCESS SCREEN VIEW */}
      {generatedToken ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          <TokenTicketCard token={generatedToken} showActions={true} />

          <div className="max-w-md mx-auto text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setGeneratedToken(null);
                setStudentName('');
                setSelectedCourse('');
                setCustomCourse('');
                setSelectedCategory(null);
                setSpecialNote('');
                setErrors({});
              }}
              className="inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Generate Another Token</span>
            </button>
          </div>
        </div>
      ) : (
        /* TOKEN GENERATION FORM */
        <div className="space-y-6">
          {/* Quick Demo Pre-fills */}
          <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
              <span className="font-semibold">Quick Demo Fill:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo('Aryan Tyagi', 'B.Tech CSE', 'Beverage')}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
              >
                Aryan (CSE / BV)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('Sneha Kapoor', 'B.Tech AI & ML', 'Fast Food')}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
              >
                Sneha (AI&ML / FF)
              </button>
              <button
                type="button"
                onClick={() => handleFillDemo('Rishabh Bansal', 'BCA', 'Other')}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium transition-colors"
              >
                Rishabh (BCA / OT)
              </button>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
            {/* 1. Student Full Name */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="studentName"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700"
                >
                  1. Student Full Name <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">As per G.L. Bajaj College ID</span>
              </div>

              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="studentName"
                  type="text"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="e.g. Aryan Sharma"
                  className={`w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border rounded-xl focus:outline-none transition-all ${
                    errors.name
                      ? 'border-rose-400 bg-rose-50/20 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-200 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500'
                  }`}
                />
              </div>

              {errors.name && (
                <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* 2. Course Name */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  2. Course Name <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Select your academic branch</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {COURSE_OPTIONS.map((course) => (
                  <button
                    key={course}
                    type="button"
                    onClick={() => {
                      setSelectedCourse(course);
                      if (errors.course) setErrors((prev) => ({ ...prev, course: undefined }));
                    }}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                      selectedCourse === course
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {course}
                  </button>
                ))}
              </div>

              {/* If "Other" course is selected, show custom course input */}
              {selectedCourse === 'Other' && (
                <div className="pt-2 animate-in fade-in duration-150">
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={customCourse}
                      onChange={(e) => {
                        setCustomCourse(e.target.value);
                        if (errors.course) setErrors((prev) => ({ ...prev, course: undefined }));
                      }}
                      placeholder="Specify your course (e.g. MBA, B.Tech ECE, MCA)..."
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
              )}

              {errors.course && (
                <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.course}</span>
                </p>
              )}
            </div>

            {/* 3. Order Category — Selectable Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    3. Order Category <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Choose one category to assign token prefix (BV, FF, or OT).
                  </p>
                </div>
                {selectedCategory && (
                  <span className="text-xs font-bold font-mono text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    Prefix: {selectedCategory === 'Beverage' ? 'BV' : selectedCategory === 'Fast Food' ? 'FF' : 'OT'}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CATEGORY_CARDS.map((card) => {
                  const Icon = card.icon;
                  const isSelected = selectedCategory === card.id;

                  return (
                    <div
                      key={card.id}
                      onClick={() => {
                        setSelectedCategory(card.id);
                        if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                      }}
                      className={`cursor-pointer rounded-2xl border p-5 transition-all duration-200 flex flex-col justify-between relative group ${
                        isSelected
                          ? card.activeBorder
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      {/* Selection Checkmark */}
                      {isSelected && (
                        <div className="absolute top-3.5 right-3.5 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}

                      <div>
                        {/* Icon & Prefix Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          
                          {!isSelected && (
                            <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                              {card.prefix}
                            </span>
                          )}
                        </div>

                        <h3 className="text-base font-bold text-slate-900 tracking-tight">
                          {card.title}
                        </h3>
                        <span className="text-[11px] text-slate-400 block mb-1">
                          {card.hindiTitle}
                        </span>

                        <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                          {card.subtitle}
                        </p>

                        {/* Examples */}
                        <div className="space-y-1 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                          <span className="font-semibold text-slate-600 block">Includes:</span>
                          <p className="line-clamp-2">
                            {card.examples.join(', ')}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{card.counter}</span>
                        <span className="font-medium text-slate-600">{card.prepTime}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {errors.category && (
                <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.category}</span>
                </p>
              )}
            </div>

            {/* Optional Special Instructions */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label 
                htmlFor="specialNote"
                className="block text-xs font-medium text-slate-600"
              >
                Special Instructions (Optional)
              </label>
              <input
                id="specialNote"
                type="text"
                value={specialNote}
                onChange={(e) => setSpecialNote(e.target.value)}
                placeholder="e.g. Less sugar in chai, extra crispy sandwich, parcel packaging..."
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 rounded-2xl font-bold text-sm text-white bg-orange-600 hover:bg-orange-500 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{loadingStepText || 'Generating Token...'}</span>
                  </div>
                ) : (
                  <>
                    <span>Generate Token</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-3">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Simulated demo token generator · G.L. Bajaj Institute of Technology & Management</span>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
