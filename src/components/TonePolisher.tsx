import React, { useState } from 'react';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Bookmark, 
  Download, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  BookOpenCheck,
  TrendingUp,
  Glasses
} from 'lucide-react';
import { InstitutionLevel, PolishResult } from '../types/academic';
import { SAMPLE_DRAFTS } from '../data/samples';
import { saveItemToVault, exportItemAsMarkdown } from '../utils/vault';

interface Props {
  level: InstitutionLevel;
  onSaved: () => void;
}

export const TonePolisher: React.FC<Props> = ({ level, onSaved }) => {
  const [draftText, setDraftText] = useState('');
  const [targetTone, setTargetTone] = useState('Peer-Reviewed Formal Empirical (STEM / Science)');
  const [citationSystem, setCitationSystem] = useState('APA 7th');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PolishResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const toneOptions = [
    'Peer-Reviewed Formal Empirical (STEM / Science)',
    'Critical Scholarly Discourse (Humanities & Philosophy)',
    'Quantitative Social Science & Econometrics',
    'Executive Policy Whitepaper'
  ];

  const handlePolish = async (customDraft?: string) => {
    const textToUse = customDraft || draftText;
    if (!textToUse.trim()) {
      setError('Please provide a paragraph or essay draft to polish.');
      return;
    }
    setError(null);
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch('/api/academic/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftText: textToUse,
          targetTone,
          citationSystem
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to refine draft.');
      }

      const data: PolishResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error executing academic copy-editing.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (s: typeof SAMPLE_DRAFTS[0]) => {
    setDraftText(s.text);
    handlePolish(s.text);
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.polishedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToVault = () => {
    if (!result) return;
    saveItemToVault({
      type: 'polisher',
      title: 'Polished Academic Excerpt (' + targetTone.split(' ')[0] + ')',
      data: result,
    });
    setSaved(true);
    onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100 font-cinzel">Academic Tone Polisher & Rhetoric Refiner</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Transform informal or tentative student prose into peer-reviewed journal prose, incorporating appropriate academic hedging, eliminating colloquialisms, and detailing editorial rationale.
          </p>
        </div>

        {/* Quick sample pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">Try Presets:</span>
          {SAMPLE_DRAFTS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => loadSample(s)}
              className="text-xs bg-slate-800 hover:bg-indigo-900/30 hover:border-indigo-500/40 border border-slate-700 text-slate-300 hover:text-indigo-300 px-2.5 py-1 rounded-md transition cursor-pointer"
            >
              {s.label.split(' ')[0]} {s.label.split(' ')[1]}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-800/50 text-red-300 rounded-lg text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Student Draft Paragraph or Section
              </label>
              <span className="text-[11px] text-slate-400">{draftText.length} chars</span>
            </div>

            <textarea
              rows={8}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="Paste your rough draft, essay paragraph, or research notes here..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-serif-academic leading-relaxed"
            />

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Target Scholarly Rhetorical Style
              </label>
              <select
                value={targetTone}
                onChange={(e) => setTargetTone(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {toneOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handlePolish()}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-indigo-600/20 ${
                loading
                  ? 'bg-indigo-700/50 text-indigo-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-indigo-200 border-t-transparent rounded-full animate-spin" />
                  <span>Applying Academic Editorial Standards...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Elevate Academic Prose</span>
                </>
              )}
            </button>
          </div>

          {/* Academic Hedging Rule */}
          <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-2">
            <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Glasses className="h-3.5 w-3.5 text-indigo-400" />
              <span>The Art of Scholarly "Hedging"</span>
            </h4>
            <p>
              In academic publishing, absolute assertions (e.g. <em>"this proves"</em>, <em>"obviously"</em>) are red flags. Peer reviewers expect epistemic modesty: <em>"these empirical findings corroborate"</em> or <em>"the data suggests a pronounced correlation"</em>.
            </p>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl overflow-hidden shadow-xl">
              {/* Output Header */}
              <div className="bg-slate-800/90 border-b border-slate-700/60 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                  Publication-Caliber Academic Prose
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs bg-slate-700/60 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-md transition cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                    <span>{copied ? 'Copied' : 'Copy Polished'}</span>
                  </button>
                  <button
                    onClick={handleSaveToVault}
                    className="flex items-center gap-1 text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-2.5 py-1.5 rounded-md transition cursor-pointer"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>{saved ? 'Saved!' : 'Save'}</span>
                  </button>
                  <button
                    onClick={() => exportItemAsMarkdown({
                      id: 'temp',
                      title: 'Polished Academic Excerpt',
                      timestamp: Date.now(),
                      type: 'polisher',
                      data: result
                    })}
                    className="flex items-center gap-1 text-xs bg-slate-700/60 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-md transition cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-400" />
                    <span>.MD</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-6 max-h-[750px] overflow-y-auto pr-3">
                {/* Polished Academic Text Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Polished Academic Text</span>
                    </span>
                    <span className="text-[11px] text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      {result.readabilityMetrics.toneRating}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-900/90 border border-indigo-500/30 rounded-xl text-slate-100 font-serif-academic text-sm leading-relaxed shadow-inner">
                    {result.polishedText}
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="p-3.5 bg-slate-900/50 border border-slate-700/50 rounded-lg text-xs text-slate-300">
                  <span className="font-semibold text-slate-200 block mb-1">Editorial Transformation Summary:</span>
                  <p className="leading-relaxed">{result.executiveSummaryOfChanges}</p>
                </div>

                {/* Editorial Critiques with Rationale */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Sentence-by-Sentence Editorial Annotations
                  </span>
                  <div className="space-y-2.5">
                    {result.editorialCritique.map((crit, idx) => (
                      <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-xs space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="line-through text-red-400/80 bg-red-950/30 px-2 py-0.5 rounded font-serif-academic">
                            "{crit.originalSegment}"
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 text-slate-500 shrink-0 hidden sm:block" />
                          <span className="text-emerald-300 font-medium bg-emerald-950/30 px-2 py-0.5 rounded font-serif-academic">
                            "{crit.revisedSegment}"
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 italic">
                          <span className="font-semibold text-slate-300 not-italic">Editorial Rationale:</span> {crit.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vocabulary Upgrades */}
                {result.vocabularyUpgrades && result.vocabularyUpgrades.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">
                      Scholarly Vocabulary Elevations
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {result.vocabularyUpgrades.map((v, i) => (
                        <div key={i} className="p-2.5 bg-slate-900/60 border border-slate-700/40 rounded-lg text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 line-through">{v.original}</span>
                            <ArrowRight className="h-3 w-3 text-slate-500" />
                            <span className="text-indigo-300 font-semibold">{v.scholarlyAlternative}</span>
                          </div>
                          {v.contextualNote && (
                            <p className="text-[10px] text-slate-500 mt-1">{v.contextualNote}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[460px] bg-slate-800/20 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <Sparkles className="h-12 w-12 text-slate-700 mb-3 stroke-[1.2]" />
              <h3 className="font-semibold text-slate-300 text-sm">No Draft Processed Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Paste your thesis paragraph or rough thoughts to upgrade the syntax, hedging, and scholarly rigor.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
