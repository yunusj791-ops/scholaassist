import React, { useState, useEffect } from 'react';
import { 
  AcademicTab, 
  InstitutionLevel, 
  SavedResearchItem 
} from './types/academic';
import { Navbar } from './components/Navbar';
import { ProjectSeminarGenerator } from './components/ProjectSeminarGenerator';
import { LiteratureSynthesizer } from './components/LiteratureSynthesizer';
import { CitationEngine } from './components/CitationEngine';
import { ThesisArchitect } from './components/ThesisArchitect';
import { TonePolisher } from './components/TonePolisher';
import { FormulaDecipherer } from './components/FormulaDecipherer';
import { StudySuite } from './components/StudySuite';
import { ResearchTutorModal } from './components/ResearchTutorModal';
import { VaultDrawer } from './components/VaultDrawer';
import { PaystackSubscriptionModal } from './components/PaystackSubscriptionModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { getSavedItems } from './utils/vault';
import { COUNTRIES, CountryInfo } from './data/countries';
import { 
  MessageSquareQuote, 
  Sparkles, 
  ShieldCheck, 
  GraduationCap, 
  CreditCard,
  Crown,
  CheckCircle2,
  ExternalLink,
  Globe,
  Sliders,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState<AcademicTab>('projects');
  const [level, setLevel] = useState<InstitutionLevel>('Undergraduate');
  const [vaultItemsCount, setVaultItemsCount] = useState<number>(0);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [citationQuery, setCitationQuery] = useState('');
  const [subscription, setSubscription] = useState<any | null>(null);

  // Authentication & User State
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('scholarassist_token_v1');
  });
  const [user, setUser] = useState<any | null>(() => {
    const raw = localStorage.getItem('scholarassist_user_v1');
    return raw ? JSON.parse(raw) : null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Country Selection (Default Nigeria as requested, supports 15+ countries globally)
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(() => {
    const savedCode = localStorage.getItem('scholarassist_country_code');
    const found = COUNTRIES.find(c => c.code === savedCode);
    return found || COUNTRIES[0]; // Nigeria default
  });

  const refreshVaultCount = () => {
    const items = getSavedItems();
    setVaultItemsCount(items.length);
  };

  const refreshSubscription = () => {
    try {
      const raw = localStorage.getItem('scholarassist_subscription_v1');
      if (raw) {
        setSubscription(JSON.parse(raw));
      } else {
        setSubscription(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const syncUserProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.status && data.user) {
        setUser(data.user);
        localStorage.setItem('scholarassist_user_v1', JSON.stringify(data.user));
        if (data.user.subscription?.status === 'active') {
          const sub = {
            planId: data.user.subscription.planId,
            planName: data.user.subscription.planName,
            activatedAt: data.user.subscription.expiresAt,
          };
          setSubscription(sub);
          localStorage.setItem('scholarassist_subscription_v1', JSON.stringify(sub));
        }
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (e) {
      console.error('Error refreshing profile:', e);
    }
  };

  useEffect(() => {
    refreshVaultCount();
    refreshSubscription();
    if (token) {
      syncUserProfile();
    }

    // Check if user redirected back from Paystack with a reference
    const urlParams = new URLSearchParams(window.location.search);
    const paystackRef = urlParams.get('paystack_ref');
    if (paystackRef) {
      fetch(`/api/paystack/verify/${encodeURIComponent(paystackRef)}`)
        .then(r => r.json())
        .then(data => {
          if (data.status) {
            const plan = urlParams.get('plan') || 'scholar-pro-monthly';
            const sub = {
              planId: plan,
              planName: plan.includes('weekly') ? 'Weekly Research Pass' : 'Monthly Pro Researcher',
              reference: paystackRef,
              activatedAt: new Date().toISOString(),
            };
            localStorage.setItem('scholarassist_subscription_v1', JSON.stringify(sub));
            setSubscription(sub);
            confetti({
              particleCount: 120,
              spread: 90,
              origin: { y: 0.6 }
            });
            window.history.replaceState({}, document.title, window.location.pathname);
            syncUserProfile();
          }
        })
        .catch(err => console.error('Verification error:', err));
    }
  }, [token]);

  const handleCountryChange = (c: CountryInfo) => {
    setSelectedCountry(c);
    localStorage.setItem('scholarassist_country_code', c.code);
  };

  const handleAuthSuccess = (authenticatedUser: any, authToken: string) => {
    setUser(authenticatedUser);
    setToken(authToken);
    localStorage.setItem('scholarassist_user_v1', JSON.stringify(authenticatedUser));
    localStorage.setItem('scholarassist_token_v1', authToken);
    setIsAuthOpen(false);

    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.5 }
    });
  };

  const handleLogout = () => {
    if (token) {
      fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('scholarassist_token_v1');
    localStorage.removeItem('scholarassist_user_v1');
  };

  const handleSendToCitation = (title: string) => {
    setCitationQuery(title);
    setActiveTab('citations');
  };

  const handleSelectVaultItem = (item: SavedResearchItem) => {
    setActiveTab(item.type);
  };

  const isProActive = Boolean(
    (subscription && subscription.planId && subscription.planId !== 'scholar-free') ||
    (user?.subscription?.status === 'active')
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Academic Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        level={level}
        setLevel={setLevel}
        vaultCount={vaultItemsCount}
        openVault={() => setIsVaultOpen(true)}
        openTutorChat={() => setIsTutorOpen(true)}
        isPro={isProActive}
        subscriptionPlanName={subscription?.planName || user?.subscription?.planName}
        onOpenPricing={() => setIsPricingOpen(true)}
        user={user}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        onOpenAdmin={() => setIsAdminOpen(true)}
        selectedCountry={selectedCountry}
        onSelectCountry={handleCountryChange}
      />

      {/* Pro Membership Banner */}
      {isProActive && (
        <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-indigo-950/60 border-b border-emerald-500/30 px-4 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                <Crown className="h-3.5 w-3.5" />
              </span>
              <span className="font-semibold text-emerald-300">
                {subscription?.planName || user?.subscription?.planName || 'Scholar Pro'} Active
              </span>
              <span className="text-slate-400 hidden sm:inline">
                • Unlimited Research Syntheses, 5-Chapter Thesis Blueprints, and Paystack receipts unlocked.
              </span>
            </div>

            <button
              onClick={() => setIsPricingOpen(true)}
              className="text-slate-400 hover:text-slate-200 text-[11px] font-medium underline underline-offset-2 cursor-pointer"
            >
              Manage Subscription
            </button>
          </div>
        </div>
      )}

      {/* Non-registered Guest Notice Banner */}
      {!user && (
        <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border-b border-indigo-500/20 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span className="text-slate-300">
                Welcome to ScholarAssist Global! <strong>Create your free account to claim 3 research credits</strong> and download complete Word files.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthMode('register');
                  setIsAuthOpen(true);
                }}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-[11px] cursor-pointer transition shadow-sm"
              >
                Claim 3 Free Credits
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'projects' && (
          <ProjectSeminarGenerator
            level={level}
            setLevel={setLevel}
            onSaved={refreshVaultCount}
            isPro={isProActive}
            user={user}
            token={token}
            onRequireAuth={() => {
              setAuthMode('register');
              setIsAuthOpen(true);
            }}
            onRequirePricing={() => setIsPricingOpen(true)}
            onRefreshUser={syncUserProfile}
            country={selectedCountry}
            onSelectCountry={handleCountryChange}
          />
        )}

        {activeTab === 'synthesizer' && (
          <LiteratureSynthesizer
            level={level}
            onSaved={refreshVaultCount}
            onSendToCitation={handleSendToCitation}
          />
        )}

        {activeTab === 'citations' && (
          <CitationEngine
            level={level}
            initialQuery={citationQuery}
            onSaved={refreshVaultCount}
          />
        )}

        {activeTab === 'thesis' && (
          <ThesisArchitect
            level={level}
            onSaved={refreshVaultCount}
          />
        )}

        {activeTab === 'polisher' && (
          <TonePolisher
            level={level}
            onSaved={refreshVaultCount}
          />
        )}

        {activeTab === 'formula' && (
          <FormulaDecipherer
            level={level}
            onSaved={refreshVaultCount}
          />
        )}

        {activeTab === 'study' && (
          <StudySuite
            level={level}
            onSaved={refreshVaultCount}
          />
        )}
      </main>

      {/* Research Advisor Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsTutorOpen(true)}
          className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-4 py-3 rounded-full shadow-2xl shadow-indigo-600/40 border border-indigo-400/30 transition transform hover:-translate-y-0.5 cursor-pointer group"
          title="Open AI Research Advisor Chat"
        >
          <div className="relative">
            <MessageSquareQuote className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-xs font-semibold font-cinzel tracking-wider hidden sm:inline">
            Research Advisor
          </span>
        </button>
      </div>

      {/* Academic Integrity & Standards Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-indigo-400" />
            <span className="font-cinzel font-semibold text-slate-300">ScholarAssist</span>
            <span>— Worldwide Academic Research Platform</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-slate-400">
            <a
              href="https://paystack.shop/pay/ybdmctgjwr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition cursor-pointer font-medium"
              title="Weekly Plan ($1.49)"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Weekly ($1.49): paystack.shop/pay/ybdmctgjwr</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <span>•</span>
            <a
              href="https://paystack.shop/pay/q0bp-vzftt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer font-medium"
              title="Monthly Plan ($3.99)"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Monthly ($3.99): paystack.shop/pay/q0bp-vzftt</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <span>•</span>
            <button
              onClick={() => setIsPricingOpen(true)}
              className="hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
            >
              <span>Subscription Plans ($1.49 / $3.99)</span>
            </button>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Academic Integrity Standard</span>
            </span>
            <span>•</span>
            <button
              onClick={() => {
                if (user?.role === 'admin' && token) {
                  setIsAdminOpen(true);
                } else {
                  setAuthMode('login');
                  setIsAuthOpen(true);
                }
              }}
              className="hover:text-slate-300 transition cursor-pointer"
            >
              <span>Admin Access</span>
            </button>
          </div>
        </div>
      </footer>

      {/* User Authentication Modal (Register / Login / Password Reset) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authMode}
      />

      {/* Admin Dashboard Modal */}
      {isAdminOpen && token && (
        <AdminDashboard
          token={token}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* Paystack Subscription & Plans Modal */}
      <PaystackSubscriptionModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        userEmail={user?.email || 'student@university.edu'}
        onSubscriptionUpdated={() => {
          refreshSubscription();
          syncUserProfile();
        }}
      />

      {/* Research Advisor Chat Modal */}
      <ResearchTutorModal
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        level={level}
      />

      {/* Saved Items Vault Drawer */}
      <VaultDrawer
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        onVaultChanged={refreshVaultCount}
        onSelectItem={handleSelectVaultItem}
      />
    </div>
  );
}
