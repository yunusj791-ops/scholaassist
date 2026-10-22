import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  CreditCard, 
  DollarSign, 
  Settings, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Search, 
  Plus, 
  Crown, 
  ExternalLink,
  RefreshCw,
  Sliders,
  Globe,
  FileText,
  Lock
} from 'lucide-react';

interface Props {
  token: string;
  onClose: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ token, onClose }) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'pricing' | 'gateways' | 'transactions'>('overview');

  // Form states for pricing updates
  const [weeklyPriceUSD, setWeeklyPriceUSD] = useState(1.49);
  const [monthlyPriceUSD, setMonthlyPriceUSD] = useState(3.99);
  const [freeTierCredits, setFreeTierCredits] = useState(3);
  const [weeklyShopUrl, setWeeklyShopUrl] = useState('https://paystack.shop/pay/ybdmctgjwr');
  const [monthlyShopUrl, setMonthlyShopUrl] = useState('https://paystack.shop/pay/q0bp-vzftt');
  const [savingPrice, setSavingPrice] = useState(false);
  const [priceSuccess, setPriceSuccess] = useState(false);

  // User search
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/overview', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (!res.ok || !json.status) {
        throw new Error(json.error || 'Failed to fetch admin dashboard.');
      }
      setData(json);
      if (json.platformConfig?.pricing) {
        setWeeklyPriceUSD(json.platformConfig.pricing.weeklyPriceUSD || 1.49);
        setMonthlyPriceUSD(json.platformConfig.pricing.monthlyPriceUSD || 3.99);
        setFreeTierCredits(json.platformConfig.pricing.freeTierCredits || 3);
      }
      if (json.platformConfig?.supportedGateways?.paystack?.weeklyShopUrl) {
        setWeeklyShopUrl(json.platformConfig.supportedGateways.paystack.weeklyShopUrl);
      }
      if (json.platformConfig?.supportedGateways?.paystack?.monthlyShopUrl) {
        setMonthlyShopUrl(json.platformConfig.supportedGateways.paystack.monthlyShopUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Error communicating with admin server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [token]);

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPrice(true);
    setPriceSuccess(false);
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          weeklyPriceUSD: Number(weeklyPriceUSD),
          monthlyPriceUSD: Number(monthlyPriceUSD),
          freeTierCredits: Number(freeTierCredits)
        })
      });
      const json = await res.json();
      if (!res.ok || !json.status) {
        throw new Error(json.error || 'Failed to update pricing.');
      }
      setPriceSuccess(true);
      fetchOverview();
      setTimeout(() => setPriceSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Error updating platform pricing.');
    } finally {
      setSavingPrice(false);
    }
  };

  const handleSaveShopUrl = async () => {
    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          shopUrl: monthlyShopUrl,
          weeklyShopUrl,
          monthlyShopUrl 
        })
      });
      const json = await res.json();
      if (!res.ok || !json.status) throw new Error(json.error);
      setActionSuccessMessage('Paystack weekly and monthly shop URLs updated successfully.');
      setTimeout(() => setActionSuccessMessage(null), 3000);
      fetchOverview();
    } catch (err: any) {
      setError(err.message || 'Error updating gateway.');
    }
  };

  const handleGrantCredits = async (userId: string, amount: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });
      const json = await res.json();
      if (!res.ok || !json.status) throw new Error(json.error);
      setActionSuccessMessage(`Successfully granted +${amount} credits to user.`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
      fetchOverview();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleActivatePro = async (userId: string, planName: string, durationDays: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          planId: 'admin-manual-pro',
          planName,
          durationDays
        })
      });
      const json = await res.json();
      if (!res.ok || !json.status) throw new Error(json.error);
      setActionSuccessMessage(`Activated ${planName} for user.`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
      fetchOverview();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredUsers = (data?.users || []).filter((u: any) => {
    const q = searchQuery.toLowerCase();
    return (
      u.fullName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.country?.toLowerCase().includes(q) ||
      u.institution?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <h1 className="text-xl font-bold text-slate-100 font-cinzel">
                Platform Administrator Control Center
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                Worldwide Governance & Pricing Authority
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-2 max-w-3xl">
            Configure global pricing ($1.49 weekly, $3.99 monthly), adjust student research credits, monitor Paystack and international transactions, and manage worldwide institution policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchOverview}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium cursor-pointer transition"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh Data</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer transition"
          >
            Exit to Student View
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-950/40 border border-red-800/50 text-red-300 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {actionSuccessMessage && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      {data?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-indigo-400" />
              <span>Registered Students</span>
            </span>
            <p className="text-2xl font-bold text-slate-100 font-mono-code">
              {data.stats.totalUsers}
            </p>
            <span className="text-[10px] text-slate-500">Across 190+ countries</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              <span>Active Pro Subscribers</span>
            </span>
            <p className="text-2xl font-bold text-amber-400 font-mono-code">
              {data.stats.activeSubscribers}
            </p>
            <span className="text-[10px] text-slate-500">Weekly & Monthly Passes</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>Free Credits Active</span>
            </span>
            <p className="text-2xl font-bold text-emerald-400 font-mono-code">
              {data.stats.totalCreditsRemaining}
            </p>
            <span className="text-[10px] text-slate-500">Student research credits</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
            <span className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-cyan-400" />
              <span>Verified Revenue (USD)</span>
            </span>
            <p className="text-2xl font-bold text-cyan-400 font-mono-code">
              ${data.stats.totalRevenueUSD.toFixed(2)}
            </p>
            <span className="text-[10px] text-slate-500">Paystack & International</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-2 text-xs">
        {[
          { id: 'overview', label: 'Platform Overview', icon: Sliders },
          { id: 'pricing', label: 'Pricing & Credit Limits', icon: DollarSign },
          { id: 'users', label: 'Student Accounts & Credits', icon: Users },
          { id: 'gateways', label: 'Paystack & International Gateways', icon: CreditCard },
          { id: 'transactions', label: 'Transaction Audit Trail', icon: FileText },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-4 py-3 font-semibold transition cursor-pointer border-b-2 ${
                activeTab === t.id
                  ? 'border-indigo-500 text-indigo-300 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-100 font-cinzel">
              Current Platform Configuration
            </h3>
            <div className="text-xs space-y-2 text-slate-300">
              <div className="flex justify-between p-2.5 bg-slate-850 rounded-lg">
                <span className="text-slate-400">Weekly Pass Price:</span>
                <strong className="text-emerald-400 font-mono-code">${weeklyPriceUSD} / 7 days</strong>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-850 rounded-lg">
                <span className="text-slate-400">Monthly Pass Price:</span>
                <strong className="text-emerald-400 font-mono-code">${monthlyPriceUSD} / month</strong>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-850 rounded-lg">
                <span className="text-slate-400">Free Signup Research Credits:</span>
                <strong className="text-indigo-400 font-mono-code">{freeTierCredits} One-Time Credits</strong>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-850 rounded-lg">
                <span className="text-slate-400">Paystack Weekly Plan ($1.49):</span>
                <span className="text-indigo-300 font-mono-code truncate max-w-[200px]">{weeklyShopUrl}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-slate-850 rounded-lg">
                <span className="text-slate-400">Paystack Monthly Plan ($3.99):</span>
                <span className="text-emerald-300 font-mono-code truncate max-w-[200px]">{monthlyShopUrl}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-100 font-cinzel">
              Academic Integrity & Governance
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-serif-academic">
              ScholarAssist operates in strict alignment with university academic research policies. Users retain permanent access to their created research dossiers, and empirical student data takes analytical precedence over hypothetical samples.
            </p>
            <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 space-y-1">
              <span className="font-bold block">Zero Document Exposure Policy:</span>
              <span>Administrators can audit account metrics and transaction references without violating student intellectual property or private research drafts.</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRICING & LIMITS */}
      {activeTab === 'pricing' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-cinzel">
              Adjust Worldwide Subscription Pricing & Free Credits
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Changes take effect immediately across all international student checkout endpoints.
            </p>
          </div>

          {priceSuccess && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>Platform pricing and credit allocations updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleSavePricing} className="space-y-4 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Weekly Pass Price (USD) — 7 Days Unlimited Access
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={weeklyPriceUSD}
                  onChange={(e) => setWeeklyPriceUSD(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 font-mono-code focus:outline-none focus:border-indigo-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Standard baseline: $1.49 / 7 days (affordable for students in developing & international markets).
              </span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Monthly Pro Pass Price (USD) — 30 Days Unlimited Access
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-500 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={monthlyPriceUSD}
                  onChange={(e) => setMonthlyPriceUSD(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 font-mono-code focus:outline-none focus:border-indigo-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Standard baseline: $3.99 / month (complete 5-chapter thesis & active recall exam suite).
              </span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Free Tier Research Credits (Granted upon Registration)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                required
                value={freeTierCredits}
                onChange={(e) => setFreeTierCredits(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono-code focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Each credit permits 1 complete chapter or full project synthesis. Once exhausted, paid pass is required.
              </span>
            </div>

            <button
              type="submit"
              disabled={savingPrice}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              {savingPrice ? 'Saving Pricing Rules...' : 'Save & Deploy Pricing'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: USERS & CREDITS */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-100 font-cinzel">
                Registered Student Accounts ({data?.users?.length || 0})
              </h3>
              <p className="text-xs text-slate-400">
                Manage user research credit balances, subscription status, and institutional affiliation.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student, email, country..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-850 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Student / Scholar</th>
                  <th className="py-2.5 px-3">Country & Institution</th>
                  <th className="py-2.5 px-3">Credits</th>
                  <th className="py-2.5 px-3">Plan Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-100 block">{u.fullName}</span>
                      <span className="text-[11px] text-slate-400 font-mono-code">{u.email}</span>
                      {u.role === 'admin' && (
                        <span className="inline-block mt-0.5 text-[9px] uppercase px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                          Administrator
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-slate-200 block">{u.country}</span>
                      <span className="text-[11px] text-slate-400 truncate max-w-[200px] block">
                        {u.institution}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="font-mono-code font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
                        {u.credits > 9000 ? '∞ Unlimited' : `${u.credits} Credits`}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        u.subscription.status === 'active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {u.subscription.planName || 'Free Scholar'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right space-x-1">
                      <button
                        onClick={() => handleGrantCredits(u.id, 5)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] border border-slate-700 cursor-pointer"
                        title="Add 5 Free Credits"
                      >
                        +5 Credits
                      </button>

                      <button
                        onClick={() => handleActivatePro(u.id, 'Scholar Pro Monthly ($3.99)', 30)}
                        className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded text-[11px] border border-emerald-500/30 cursor-pointer"
                        title="Grant 30 Days Pro"
                      >
                        Grant Pro
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: GATEWAYS */}
      {activeTab === 'gateways' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-2xl">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-cinzel">
              Payment Gateway Connections & Direct Links
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Supports Nigerian merchants (Paystack), African regional payments, and global USD cards (Stripe/PayPal).
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Paystack Weekly Store Link */}
            <div className="p-4 bg-slate-850 border border-slate-700 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Paystack Weekly Plan URL ($1.49 / 7 Days):</span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-mono-code">Weekly</span>
              </div>
              <input
                type="url"
                value={weeklyShopUrl}
                onChange={(e) => setWeeklyShopUrl(e.target.value)}
                placeholder="https://paystack.shop/pay/ybdmctgjwr"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono-code focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Paystack Monthly Store Link */}
            <div className="p-4 bg-slate-850 border border-slate-700 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Paystack Monthly Plan URL ($3.99 / 30 Days):</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono-code">Monthly</span>
              </div>
              <input
                type="url"
                value={monthlyShopUrl}
                onChange={(e) => setMonthlyShopUrl(e.target.value)}
                placeholder="https://paystack.shop/pay/q0bp-vzftt"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200 font-mono-code focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              onClick={handleSaveShopUrl}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-md shadow-emerald-600/20"
            >
              Update Paystack URLs
            </button>

            {/* Global Card & Stripe info */}
            <div className="p-4 bg-slate-850 border border-slate-700 rounded-xl space-y-1">
              <span className="font-bold text-slate-200 block">International Cards & Multi-Currency Processing:</span>
              <p className="text-slate-400 leading-relaxed">
                Worldwide students can checkout via Paystack with cards, bank transfers, USSD, and mobile money. Transactions from both weekly and monthly links activate accounts server-side.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TRANSACTIONS */}
      {activeTab === 'transactions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 font-cinzel">
              Transaction Audit Trail ({data?.transactions?.length || 0})
            </h3>
            <p className="text-xs text-slate-400">
              Verified payment records for weekly & monthly passes across Paystack and International Cards.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-850 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Student Email</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Amount (USD)</th>
                  <th className="py-2.5 px-3">Gateway</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono-code">
                {(data?.transactions || []).map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-850/50">
                    <td className="py-2.5 px-3 text-indigo-400">{tx.reference}</td>
                    <td className="py-2.5 px-3 text-slate-300">{tx.email}</td>
                    <td className="py-2.5 px-3 text-slate-200 font-sans">{tx.planName}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">${tx.amountUSD?.toFixed(2)}</td>
                    <td className="py-2.5 px-3 uppercase text-slate-400 text-[10px]">{tx.gateway}</td>
                    <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                      {new Date(tx.verifiedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
