import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  Zap, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Layers,
  ChevronRight,
  Info,
  KeyRound,
  Calendar,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PAYSTACK_WEEKLY_SHOP_URL = 'https://paystack.shop/pay/ybdmctgjwr';
export const PAYSTACK_MONTHLY_SHOP_URL = 'https://paystack.shop/pay/q0bp-vzftt';

interface Plan {
  id: string;
  name: string;
  priceUSD: number;
  priceNGN: number;
  interval: string;
  popular?: boolean;
  tagline: string;
  paystackUrl?: string;
  features: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  onSubscriptionUpdated?: () => void;
}

export const PaystackSubscriptionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userEmail = '',
  onSubscriptionUpdated
}) => {
  const [email, setEmail] = useState(userEmail || 'student@university.edu');
  const [currency, setCurrency] = useState<'USD' | 'NGN' | 'GHS' | 'KES' | 'ZAR' | 'GBP' | 'EUR'>('USD');
  const [selectedPlanId, setSelectedPlanId] = useState('scholar-weekly-pass');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTx, setSuccessTx] = useState<any | null>(null);
  const [paystackConfig, setPaystackConfig] = useState<{ isConfigured: boolean; publicKey: string } | null>(null);

  // Direct reference / receipt verification state
  const [receiptRef, setReceiptRef] = useState('');
  const [verifyingReceipt, setVerifyingReceipt] = useState(false);

  const plans: Plan[] = [
    {
      id: 'scholar-free',
      name: 'Free Scholar Tier',
      priceUSD: 0,
      priceNGN: 0,
      interval: '3 free credits',
      tagline: 'Standard registration grant for new academic scholars',
      features: [
        '3 One-Time Complete Research Credits',
        'Full 5-Chapter Project or Seminar Generation',
        'Recent 2021-2026 APA 7th Citations',
        'Live In-Browser Section Editor',
        'DOCX Word & Markdown File Downloads'
      ]
    },
    {
      id: 'scholar-weekly-pass',
      name: 'Weekly Research Pass',
      priceUSD: 1.49,
      priceNGN: 2200,
      interval: '7 days',
      paystackUrl: PAYSTACK_WEEKLY_SHOP_URL,
      tagline: 'Affordable week-long pass for urgent project & seminar deadlines',
      features: [
        'Full 7-Day Unlimited Academic Access',
        'Unlimited Project & Seminar Topic Downloads (.DOC)',
        'Recent & Verifiable 2021-2026 APA 7th Citations',
        'Empirical Survey & Laboratory Data Analysis',
        'Live Section-by-Section Customization',
        'Save Work Permanently to Cloud Vault'
      ]
    },
    {
      id: 'scholar-pro-monthly',
      name: 'Monthly Pro Researcher',
      priceUSD: 3.99,
      priceNGN: 5900,
      interval: 'per month',
      popular: true,
      paystackUrl: PAYSTACK_MONTHLY_SHOP_URL,
      tagline: 'Most popular for undergraduate, ND/HND & postgraduate students',
      features: [
        'Full 30-Day Unlimited Research Access',
        'Unlimited 5-Chapter Project & Seminar Downloads (.DOC & PDF)',
        'All Citation Standards (APA 7th, MLA 9th, Chicago, IEEE, Harvard)',
        'Academic Tone Polisher & Rhetoric Refiner',
        'STEM LaTeX Formula Decipherer with Overleaf export',
        'Active Recall Flashcards & Exam Simulator',
        '24/7 AI Research Advisor & Dissertation Mentor'
      ]
    },
    {
      id: 'scholar-thesis-semester',
      name: 'Semester Dissertation Pass',
      priceUSD: 8.99,
      priceNGN: 13000,
      interval: 'semester (4 months)',
      paystackUrl: PAYSTACK_MONTHLY_SHOP_URL,
      tagline: 'Comprehensive thesis suite for final year & postgraduate defense',
      features: [
        'Everything in Monthly Pro Researcher',
        'Oral Defense Rubrics & Likely Examiner Questions',
        'IRB Ethical Approvals & Validity Threat Auditing',
        'Batch Bibliography Manager (export 100+ references to .bib)',
        'Priority High-Speed Model Generation'
      ]
    }
  ];

  useEffect(() => {
    if (userEmail) setEmail(userEmail);
  }, [userEmail]);

  useEffect(() => {
    fetch('/api/paystack/status')
      .then(r => r.json())
      .then(data => {
        setPaystackConfig(data);
      })
      .catch(e => console.error('Paystack status fetch error:', e));
  }, []);

  if (!isOpen) return null;

  const currentSelectedPlan = plans.find(p => p.id === selectedPlanId) || plans[1];

  const getPriceDisplay = (plan: Plan) => {
    if (plan.id === 'scholar-free') return '$0.00 Free';
    if (currency === 'USD') return `$${plan.priceUSD.toFixed(2)}`;
    if (currency === 'NGN') return `₦${plan.priceNGN.toLocaleString()}`;
    if (currency === 'GHS') return `GH₵${Math.round(plan.priceUSD * 15.5)}`;
    if (currency === 'KES') return `KSh${Math.round(plan.priceUSD * 130)}`;
    if (currency === 'ZAR') return `R${Math.round(plan.priceUSD * 18.2)}`;
    if (currency === 'GBP') return `£${(plan.priceUSD * 0.79).toFixed(2)}`;
    if (currency === 'EUR') return `€${(plan.priceUSD * 0.92).toFixed(2)}`;
    return `$${plan.priceUSD.toFixed(2)}`;
  };

  const getNumericAmount = (plan: Plan) => {
    if (currency === 'USD') return plan.priceUSD;
    if (currency === 'NGN') return plan.priceNGN;
    if (currency === 'GHS') return Math.round(plan.priceUSD * 15.5);
    if (currency === 'KES') return Math.round(plan.priceUSD * 130);
    if (currency === 'ZAR') return Math.round(plan.priceUSD * 18.2);
    if (currency === 'GBP') return Math.round(plan.priceUSD * 0.79 * 100) / 100;
    if (currency === 'EUR') return Math.round(plan.priceUSD * 0.92 * 100) / 100;
    return plan.priceUSD;
  };

  const handlePaystackCheckout = async () => {
    if (selectedPlanId === 'scholar-free') {
      const sub = {
        planId: 'scholar-free',
        planName: 'Free Scholar Tier (3 Credits)',
        activatedAt: new Date().toISOString(),
      };
      localStorage.setItem('scholarassist_subscription_v1', JSON.stringify(sub));
      if (onSubscriptionUpdated) onSubscriptionUpdated();
      onClose();
      return;
    }

    if (!email || !email.includes('@')) {
      setError('Please provide a valid student or institutional email address.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const amountToCharge = getNumericAmount(currentSelectedPlan);

      // If user selected Weekly Plan or Monthly Plan with direct Paystack Shop URL
      if (currentSelectedPlan.paystackUrl) {
        // Open the dedicated Paystack shop link in a new tab
        window.open(currentSelectedPlan.paystackUrl, '_blank', 'noopener,noreferrer');
      }

      // Initialize Paystack transaction on our backend
      const initRes = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          amount: amountToCharge,
          currency,
          planId: currentSelectedPlan.id,
          planName: currentSelectedPlan.name,
          metadata: {
            planInterval: currentSelectedPlan.interval,
            paystackShopUrl: currentSelectedPlan.paystackUrl
          }
        }),
      });

      const initData = await initRes.json();
      if (!initRes.ok || !initData.status) {
        throw new Error(initData.error || 'Failed to initialize Paystack session.');
      }

      const reference = initData.data.reference;

      // Automatically verify transaction
      setVerifying(true);
      const verifyRes = await fetch(`/api/paystack/verify/${encodeURIComponent(reference)}`);
      const verifyData = await verifyRes.json();

      if (verifyRes.ok && verifyData.status) {
        const subData = {
          planId: currentSelectedPlan.id,
          planName: currentSelectedPlan.name,
          currency,
          amount: amountToCharge,
          reference: verifyData.data.reference,
          activatedAt: verifyData.data.paidAt || new Date().toISOString(),
          customerEmail: email,
          isSimulated: Boolean(verifyData.simulated || initData.simulated),
        };

        localStorage.setItem('scholarassist_subscription_v1', JSON.stringify(subData));
        setSuccessTx(subData);

        confetti({
          particleCount: 110,
          spread: 85,
          origin: { y: 0.6 }
        });

        if (onSubscriptionUpdated) onSubscriptionUpdated();
      } else {
        throw new Error(verifyData.error || 'Payment verification failed.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Payment processing error.');
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  const handleVerifyDirectReceipt = async () => {
    if (!receiptRef.trim()) {
      setError('Please enter your Paystack payment reference or receipt code.');
      return;
    }

    setError(null);
    setVerifyingReceipt(true);

    try {
      const res = await fetch(`/api/paystack/verify/${encodeURIComponent(receiptRef.trim())}`);
      const data = await res.json();

      if (res.ok && data.status) {
        const isWeekly = receiptRef.toLowerCase().includes('week') || selectedPlanId === 'scholar-weekly-pass';
        const subData = {
          planId: isWeekly ? 'scholar-weekly-pass' : 'scholar-pro-monthly',
          planName: isWeekly ? 'Weekly Research Pass' : 'Monthly Pro Researcher',
          currency: 'USD',
          amount: isWeekly ? 1.49 : 3.99,
          reference: receiptRef.trim(),
          activatedAt: new Date().toISOString(),
          customerEmail: email || 'student@university.edu',
        };

        localStorage.setItem('scholarassist_subscription_v1', JSON.stringify(subData));
        setSuccessTx(subData);

        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 }
        });

        if (onSubscriptionUpdated) onSubscriptionUpdated();
      } else {
        throw new Error(data.message || 'Reference not found or not yet settled on Paystack.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check the reference code.');
    } finally {
      setVerifyingReceipt(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="h-full w-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 font-cinzel">ScholarAssist Subscriptions</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Paystack Verified
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Paystack Checkout for Weekly ($1.49) & Monthly ($3.99) Research Passes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {successTx ? (
            /* Success Receipt View */
            <div className="p-8 text-center space-y-5 bg-gradient-to-b from-slate-900 to-emerald-950/20 border border-emerald-500/40 rounded-2xl">
              <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  Transaction Verified & Pro Activated
                </span>
                <h2 className="text-2xl font-bold text-slate-100 font-cinzel mt-1">
                  Welcome to {successTx.planName}!
                </h2>
                <p className="text-xs text-slate-300 max-w-md mx-auto mt-2">
                  Your Paystack payment reference <strong className="text-emerald-300 font-mono-code">{successTx.reference}</strong> has been confirmed. Full academic privileges and unlimited downloads are unlocked.
                </p>
              </div>

              {/* Receipt details */}
              <div className="max-w-md mx-auto bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 text-xs text-left space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Student Email:</span>
                  <span className="text-slate-200 font-medium">{successTx.customerEmail}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Amount Paid:</span>
                  <span className="text-emerald-300 font-bold">
                    {successTx.currency === 'NGN' ? `₦${successTx.amount?.toLocaleString()}` : `$${successTx.amount}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Activated On:</span>
                  <span className="text-slate-200">{new Date(successTx.activatedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Payment Gateway:</span>
                  <span className="text-slate-200">Paystack Verified</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-600/30"
                >
                  Return to Academic Workspace
                </button>
              </div>
            </div>
          ) : (
            /* Plans & Checkout Selector */
            <>
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/50 text-red-300 rounded-lg text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Official Paystack Links Notice Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Weekly Plan Link Card */}
                <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-200">
                      <Clock className="h-4 w-4 text-indigo-400" />
                      <span>Weekly Plan ($1.49 / 7 Days)</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono-code block">
                      {PAYSTACK_WEEKLY_SHOP_URL}
                    </span>
                  </div>
                  <a
                    href={PAYSTACK_WEEKLY_SHOP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-[11px] flex items-center gap-1 transition cursor-pointer shrink-0 shadow-sm"
                  >
                    <span>Open Link</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Monthly Plan Link Card */}
                <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-200">
                      <Calendar className="h-4 w-4 text-emerald-400" />
                      <span>Monthly Plan ($3.99 / 30 Days)</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono-code block">
                      {PAYSTACK_MONTHLY_SHOP_URL}
                    </span>
                  </div>
                  <a
                    href={PAYSTACK_MONTHLY_SHOP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-[11px] flex items-center gap-1 transition cursor-pointer shrink-0 shadow-sm"
                  >
                    <span>Open Link</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {/* Currency & Student Email Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800/40 border border-slate-800 rounded-xl p-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                    Student / Institutional Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-medium"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Paystack receipts and subscription confirmation are linked to this email.
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                    Display Currency (Default: USD)
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    {[
                      { code: 'USD', label: '$ USD (Default)' },
                      { code: 'NGN', label: '₦ NGN' },
                      { code: 'GHS', label: 'GH₵ GHS' },
                      { code: 'KES', label: 'KSh KES' },
                      { code: 'ZAR', label: 'R ZAR' },
                      { code: 'GBP', label: '£ GBP' },
                      { code: 'EUR', label: '€ EUR' },
                    ].map(c => (
                      <button
                        key={c.code}
                        onClick={() => setCurrency(c.code as any)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition font-medium cursor-pointer ${
                          currency === c.code
                            ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 font-bold'
                            : 'bg-slate-900 text-slate-400 border-slate-700/60 hover:text-slate-200'
                        }`}
                      >
                        {c.code}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Prices displayed in USD with affordable regional conversions.
                  </span>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.slice(1).map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`relative rounded-2xl p-5 border cursor-pointer transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-slate-800/90 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500/30'
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500 text-slate-950 shadow-md">
                          Most Popular For Students
                        </span>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-slate-100 font-cinzel">
                            {plan.name}
                          </h4>
                          <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-emerald-400 bg-emerald-400' : 'border-slate-600'
                          }`}>
                            {isSelected && <Check className="h-3 w-3 text-slate-950 stroke-[3]" />}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-100 font-mono-code">
                              {getPriceDisplay(plan)}
                            </span>
                            <span className="text-xs text-slate-400">/{plan.interval}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {plan.tagline}
                          </p>
                        </div>

                        {plan.paystackUrl && (
                          <div className="pt-2">
                            <a
                              href={plan.paystackUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-2"
                            >
                              <span>Direct Paystack Link</span>
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}

                        <div className="pt-3 border-t border-slate-700/40 space-y-1.5">
                          {plan.features.map((f, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-1.5 text-xs text-slate-300">
                              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <span className="text-[11px] leading-tight">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 space-y-2">
                        <button
                          type="button"
                          className={`w-full py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {isSelected ? 'Selected Plan' : 'Select Plan'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Already Paid on Paystack? Activate Reference Form */}
              <div className="bg-slate-850/80 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-slate-200">
                  <KeyRound className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Already Paid via Paystack Shop? Instant Activation
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  If you paid on <span className="text-indigo-300 font-mono-code">{PAYSTACK_WEEKLY_SHOP_URL}</span> (Weekly) or <span className="text-emerald-300 font-mono-code">{PAYSTACK_MONTHLY_SHOP_URL}</span> (Monthly), enter your Paystack transaction reference, receipt number, or payment ID below to activate immediately:
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={receiptRef}
                    onChange={(e) => setReceiptRef(e.target.value)}
                    placeholder="e.g. SCHOLAR_1729381923 or Paystack Reference"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 font-mono-code focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleVerifyDirectReceipt}
                    disabled={verifyingReceipt}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0"
                  >
                    {verifyingReceipt ? (
                      <>
                        <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Verify & Activate Pro</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Checkout Trigger */}
        {!successTx && (
          <div className="p-4 bg-slate-850 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-400 text-center sm:text-left">
              <span>Selected: </span>
              <strong className="text-slate-200">{currentSelectedPlan.name}</strong>
              <span> ({getPriceDisplay(currentSelectedPlan)}/{currentSelectedPlan.interval})</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handlePaystackCheckout}
                disabled={loading || verifying}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/20 ${
                  loading || verifying
                    ? 'bg-emerald-700/50 text-emerald-200 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {loading || verifying ? (
                  <>
                    <div className="h-3.5 w-3.5 border-2 border-emerald-200 border-t-transparent rounded-full animate-spin" />
                    <span>{verifying ? 'Verifying with Paystack...' : 'Contacting Paystack...'}</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>Pay with Paystack ({getPriceDisplay(currentSelectedPlan)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
