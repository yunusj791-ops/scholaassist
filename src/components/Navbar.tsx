import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Quote, 
  FileText, 
  Sparkles, 
  Sigma, 
  BrainCircuit, 
  MessageSquareQuote,
  Bookmark,
  Award,
  ChevronDown,
  User,
  LogOut,
  ShieldCheck,
  CreditCard,
  Globe,
  Crown,
  CheckCircle2
} from 'lucide-react';
import { AcademicTab, InstitutionLevel } from '../types/academic';
import { COUNTRIES, CountryInfo } from '../data/countries';

interface NavbarProps {
  activeTab: AcademicTab;
  setActiveTab: (tab: AcademicTab) => void;
  level: InstitutionLevel;
  setLevel: (lvl: InstitutionLevel) => void;
  vaultCount: number;
  openVault: () => void;
  openTutorChat: () => void;
  isPro?: boolean;
  subscriptionPlanName?: string;
  onOpenPricing: () => void;
  user?: any | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  onOpenAdmin?: () => void;
  selectedCountry: CountryInfo;
  onSelectCountry: (country: CountryInfo) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  level,
  setLevel,
  vaultCount,
  openVault,
  openTutorChat,
  isPro,
  subscriptionPlanName,
  onOpenPricing,
  user,
  onOpenAuth,
  onLogout,
  onOpenAdmin,
  selectedCountry,
  onSelectCountry,
}) => {
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const tabs = [
    { id: 'projects' as AcademicTab, label: 'Project & Seminar Topics', icon: FileText, tag: 'File Download' },
    { id: 'synthesizer' as AcademicTab, label: 'Paper Synthesizer', icon: BookOpen, tag: 'Synthesis' },
    { id: 'citations' as AcademicTab, label: 'Citation Engine', icon: Quote, tag: 'APA/IEEE' },
    { id: 'thesis' as AcademicTab, label: 'Thesis Architect', icon: FileText, tag: 'Proposal' },
    { id: 'polisher' as AcademicTab, label: 'Tone Polisher', icon: Sparkles, tag: 'Elevate' },
    { id: 'formula' as AcademicTab, label: 'LaTeX & Formulas', icon: Sigma, tag: 'STEM' },
    { id: 'study' as AcademicTab, label: 'Active Recall', icon: BrainCircuit, tag: 'Cards & Quizzes' },
  ];

  const levels: InstitutionLevel[] = [
    'OND',
    'HND',
    'BSc',
    'MSc',
    'PhD',
    'Undergraduate',
    'Master’s Degree',
    'Doctoral / PhD'
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-md">
      {/* Top Banner with branding, country, credits, and auth */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="h-full w-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-lg font-bold tracking-wider text-slate-100">
                  SCHOLAR<span className="text-indigo-400">ASSIST</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Worldwide Academic AI
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Projects, Seminars, Theses & Verifiable Citations
              </p>
            </div>
          </div>

          {/* Controls: Country, Level, Credits, Pro, Auth */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Country Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCountryMenu(!showCountryMenu)}
                className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg px-2.5 py-1.5 transition text-xs text-slate-200 cursor-pointer"
                title={`Country: ${selectedCountry.name} (${selectedCountry.currency})`}
              >
                <span className="text-base">{selectedCountry.flag}</span>
                <span className="font-medium hidden md:inline">{selectedCountry.code}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>

              {showCountryMenu && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs max-h-80 overflow-y-auto"
                  onClick={() => setShowCountryMenu(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800 text-slate-400 font-semibold flex items-center justify-between">
                    <span>Select Country / Region</span>
                    <Globe className="h-3.5 w-3.5 text-indigo-400" />
                  </div>
                  <div className="divide-y divide-slate-800/50">
                    {COUNTRIES.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => {
                          onSelectCountry(c);
                          setShowCountryMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-800 rounded-lg transition cursor-pointer ${
                          selectedCountry.code === c.code ? 'bg-indigo-950/40 text-indigo-300' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{c.flag}</span>
                          <div>
                            <div className="font-medium text-slate-200">{c.name}</div>
                            <div className="text-[10px] text-slate-400">{c.educationSystem.split('(')[0].trim()}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono-code text-emerald-400">
                            {c.currency}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Institution Level Selector */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg px-2.5 py-1.5 transition text-xs">
              <Award className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value as InstitutionLevel)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer pr-1"
              >
                {levels.map((lvl) => (
                  <option key={lvl} value={lvl} className="bg-slate-900 text-slate-200">
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            {/* User Credits Badge / Status */}
            {user ? (
              <div className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs">
                {isPro ? (
                  <span className="flex items-center gap-1 text-emerald-300 font-bold">
                    <Crown className="h-3.5 w-3.5 text-amber-400" />
                    <span className="hidden sm:inline">PRO UNLIMITED</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-indigo-300 font-semibold" title="Free research generation credits">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    <span>{user.credits ?? 3} Free Credits</span>
                  </span>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-xs text-emerald-300">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-semibold">3 Free Credits</span>
              </div>
            )}

            {/* Paystack Pro Upgrade Button */}
            <button
              onClick={onOpenPricing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                isPro
                  ? 'bg-gradient-to-r from-emerald-950/80 to-slate-900 text-emerald-300 border-emerald-500/50 shadow-sm'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-emerald-400/30 shadow-md shadow-emerald-600/20'
              }`}
              title="Paystack Academic Subscriptions ($1.49 / $3.99)"
            >
              <CreditCard className="h-3.5 w-3.5 text-emerald-200" />
              <span className="hidden sm:inline">
                {isPro ? (subscriptionPlanName || 'PRO ACTIVE') : 'Upgrade ($1.49 / $3.99)'}
              </span>
              <span className="sm:hidden">
                {isPro ? 'PRO' : 'Upgrade'}
              </span>
            </button>

            {/* Research Vault Drawer Button */}
            <button
              onClick={openVault}
              className="relative flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700/80 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer"
              title="Open Research Vault"
            >
              <Bookmark className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden md:inline">Vault</span>
              {vaultCount > 0 && (
                <span className="px-1.5 py-0.2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 rounded-full text-[10px] font-bold">
                  {vaultCount}
                </span>
              )}
            </button>

            {/* User Auth / Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer"
                >
                  <User className="h-3.5 w-3.5 text-indigo-400" />
                  <span className="hidden sm:inline truncate max-w-[100px]">{user.fullName?.split(' ')[0] || 'Account'}</span>
                  <ChevronDown className="h-3 w-3 text-indigo-400" />
                </button>

                {showUserMenu && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 text-xs"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-800 space-y-1">
                      <div className="font-bold text-slate-200 truncate">{user.fullName}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                      <div className="text-[10px] text-indigo-400 font-medium">
                        {user.institution || 'Higher Institution'}
                      </div>
                    </div>

                    <div className="py-1">
                      <div className="px-3 py-2 text-slate-300 flex items-center justify-between">
                        <span>Research Credits:</span>
                        <span className="font-bold text-emerald-400">
                          {isPro ? 'Unlimited (Pro)' : `${user.credits ?? 3} left`}
                        </span>
                      </div>

                      {user.role === 'admin' && onOpenAdmin && (
                        <button
                          onClick={onOpenAdmin}
                          className="w-full text-left px-3 py-2 text-amber-300 hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer font-semibold"
                        >
                          <ShieldCheck className="h-4 w-4 text-amber-400" />
                          <span>Admin Dashboard</span>
                        </button>
                      )}

                      <button
                        onClick={onOpenPricing}
                        className="w-full text-left px-3 py-2 text-emerald-400 hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <CreditCard className="h-4 w-4 text-emerald-400" />
                        <span>Subscription & Payments</span>
                      </button>

                      <button
                        onClick={onLogout}
                        className="w-full text-left px-3 py-2 text-red-400 hover:bg-slate-800 rounded-lg flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 text-red-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition cursor-pointer font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3 py-1.5 text-xs text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-lg transition cursor-pointer font-semibold shadow-md shadow-indigo-600/20"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation row */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/40">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded transition ${
                  isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800 text-slate-400'
                }`}>
                  {tab.tag}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
