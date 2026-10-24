import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Calculator,
  Cpu,
  BookOpen,
  Wrench,
  Users,
  Repeat,
  CheckCircle2,
} from 'lucide-react';
import Button from '../components/common/Button';

const CATEGORIES = [
  {
    name: 'Electronics & Kits',
    desc: 'Arduino, Raspberry Pi, Sensors & Multimeters',
    icon: Cpu,
    color: 'from-blue-500 to-indigo-600',
    count: '30+ items',
  },
  {
    name: 'Lab Gear',
    desc: 'Lab coats, Safety Goggles & Chemistry Kits',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-600',
    count: '25+ items',
  },
  {
    name: 'Textbooks & Notes',
    desc: 'Semester textbooks, handbooks & exam guides',
    icon: BookOpen,
    color: 'from-amber-500 to-orange-600',
    count: '50+ items',
  },
  {
    name: 'Drafting & Tools',
    desc: 'Mini Drafters, Roller Scales & Drawing Boards',
    icon: Wrench,
    color: 'from-purple-500 to-violet-600',
    count: '15+ items',
  },
];

export const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
        {/* Background gradient decorative shapes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-brand-200/40 via-campus-200/30 to-brand-100/20 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-bold uppercase tracking-wider shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="w-4 h-4 text-brand-600" />
            <span>Campus Peer-to-Peer Equipment Economy</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.1]">
            Borrow academic gear.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-campus-600">
              Save thousands.
            </span>{' '}
            Ace your semester.
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Stop buying 1-semester tools brand new. Connect directly with seniors & peers to borrow
            drafters, Arduino kits, calculators, and lab gear safely with campus trust ratings.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link to="/explore">
              <Button variant="primary" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5 shadow-lg shadow-brand-500/25">
                Explore Available Gear
                <ArrowRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>

            <Link to={isAuthenticated ? '/list-item' : '/register'}>
              <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base px-8 py-3.5">
                List Your Idle Equipment
              </Button>
            </Link>
          </div>

          {/* Value Badges */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 font-semibold">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Verified College IDs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Free or Nominal Daily Rates</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>WhatsApp In-Person Handoff</span>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Browse by Academic Category
          </h2>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Everything you need for engineering labs, architecture drafting, and university exams
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/explore?category=${encodeURIComponent(cat.name)}`}
                className="group relative bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-brand-500/40 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors text-base">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cat.desc}</p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-600">
                  <span>Browse catalog</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* How It Works (State Machine visualization for users) */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 rounded-3xl max-w-7xl mx-auto px-6 sm:px-12">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-400">
            Simple & Transparent
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            How CampusGeeks Works
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            A state-driven workflow designed to protect both the lender and the borrower.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-lg mx-auto md:mx-0">
              1
            </div>
            <h3 className="font-bold text-base text-slate-100">Browse & Select Dates</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Find the exact gear you need and request it with specific pickup and return dates.
            </p>
          </div>

          <div className="space-y-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-lg mx-auto md:mx-0">
              2
            </div>
            <h3 className="font-bold text-base text-slate-100">Lender Approval</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The owner reviews your profile, department, and past trust score before accepting.
            </p>
          </div>

          <div className="space-y-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-xl bg-campus-500/20 text-campus-400 border border-campus-500/30 flex items-center justify-center font-bold text-lg mx-auto md:mx-0">
              3
            </div>
            <h3 className="font-bold text-base text-slate-100">Campus Handover</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Click the pre-filled WhatsApp link to meet at the library or dorm for the handoff.
            </p>
          </div>

          <div className="space-y-3 text-center md:text-left">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-lg mx-auto md:mx-0">
              4
            </div>
            <h3 className="font-bold text-base text-slate-100">Return & Mutual Review</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Return the item on time, receive your deposit back, and boost each other's trust score.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
