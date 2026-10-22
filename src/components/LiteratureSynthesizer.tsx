import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Copy, 
  Check, 
  Bookmark, 
  Download, 
  AlertCircle, 
  ArrowRight, 
  Target, 
  Layers, 
  Cpu, 
  AlertTriangle,
  Lightbulb,
  FileCheck2
} from 'lucide-react';
import { InstitutionLevel, SynthesisResult } from '../types/academic';
import { SAMPLE_PAPERS } from '../data/samples';
import { saveItemToVault, exportItemAsMarkdown } from '../utils/vault';

interface Props {
  level: InstitutionLevel;
  onSaved: () => void;
  onSendToCitation?: (title: string) => void;
}

export const LiteratureSynthesizer: React.FC<Props> = ({ level, onSaved, onSendToCitation }) => {
  const [paperText, setPaperText] = useState('');
  const [focusArea, setFocusArea] = useState('Methodology & Empirical Findings');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SynthesisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const focusOptions = [
    'Methodology & Empirical Findings',
    'Theoretical Foundations & Hypotheses',
    'Methodological Limitations & Validity Threats',
    'Literature Gaps & Future Directions',
    'Clinical / Applied Policy Implications'
  ];

  const handleSynthesize = async () => {
    if (!paperText.trim()) {
      setError('Please provide paper text, an abstract, or select an example paper.');
      return;
    }
    setError(null);
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch('/api/academic/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paperText,
          focusArea,
          studyLevel: level,
          outputStyle: 'rigorous-academic'
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to synthesize research paper.');
      }

      const data: SynthesisResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while communicating with the academic engine.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sample: typeof SAMPLE_PAPERS[0]) => {
    setPaperText(sample.text);
    setError(null);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Title: ${result.title}\nHypothesis: ${result.keyHypothesis}\nMethodology: ${result.methodology.type} (${result.methodology.sampleOrDataset})\nFindings:\n${result.keyFindings.map(f => `- ${f}`).join('\n')}\nLimitations:\n${result.criticalLimitations.map(l => `- ${l}`).join('\n')}\nGaps & Future:\n${result.researchGapsAndFutureWork.map(g => `- ${g}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToVault = () => {
    if (!result) return;
    saveItemToVault({
      type: 'synthesizer',
      title: result.title || 'Literature Synthesis',
      data: result,
    });
    setSaved(true);
    onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BookOpen className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100 font-cinzel">Literature Review & Paper Synthesizer</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Extract empirical hypotheses, methodological frameworks, sample parameters, statistical limitations, and literature gaps calibrated for {level} scholarship.
          </p>
        </div>

        {/* Preset sample pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">Try Presets:</span>
          {SAMPLE_PAPERS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => loadSample(s)}
              className="text-xs bg-slate-800 hover:bg-indigo-900/30 hover:border-indigo-500/40 border border-slate-700 text-slate-300 hover:text-indigo-300 px-2.5 py-1 rounded-md transition cursor-pointer"
            >
              {s.label.split(':')[0]}
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

      {/* Main Grid: Input and Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Pane */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Research Paper Text, Abstract, or DOI Info
              </label>
              <span className="text-[11px] text-slate-400">
                {paperText.length} characters
              </span>
            </div>

            <textarea
              rows={11}
              value={paperText}
              onChange={(e) => setPaperText(e.target.value)}
              placeholder="Paste research article abstract, methodology section, empirical findings, or paper excerpt here..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-serif-academic leading-relaxed"
            />

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Synthesis Analytical Lens
              </label>
              <select
                value={focusArea}
                onChange={(e) => setFocusArea(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {focusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSynthesize}
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
                  <span>Synthesizing Academic Corpus...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Critical Synthesis</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Academic Tips Card */}
          <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-2">
            <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
              <span>Scholar Tip for Literature Reviews</span>
            </h4>
            <p>
              When synthesizing sources for a thesis chapter, avoid merely summarizing author by author. Instead, group papers by themes, methodology contradictions, and empirical convergence.
            </p>
          </div>
        </div>

        {/* Right Output Pane */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl overflow-hidden shadow-xl">
              {/* Output Top Bar */}
              <div className="bg-slate-800/90 border-b border-slate-700/60 px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <FileCheck2 className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Academic Synthesis Matrix
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs bg-slate-700/60 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-md transition cursor-pointer"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handleSaveToVault}
                    className="flex items-center gap-1 text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-2.5 py-1.5 rounded-md transition cursor-pointer"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>{saved ? 'Saved!' : 'Save to Vault'}</span>
                  </button>

                  <button
                    onClick={() => exportItemAsMarkdown({
                      id: 'temp',
                      title: result.title,
                      timestamp: Date.now(),
                      type: 'synthesizer',
                      data: result
                    })}
                    className="flex items-center gap-1 text-xs bg-slate-700/60 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-md transition cursor-pointer"
                    title="Export as Markdown"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-400" />
                    <span>.MD</span>
                  </button>

                  {onSendToCitation && (
                    <button
                      onClick={() => onSendToCitation(result.title)}
                      className="flex items-center gap-1 text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-2.5 py-1.5 rounded-md transition cursor-pointer"
                      title="Generate Reference for this Paper"
                    >
                      <span>Cite</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Output Content Body */}
              <div className="p-5 space-y-6 max-h-[750px] overflow-y-auto pr-3">
                {/* Title & Core Hypothesis */}
                <div className="space-y-2 border-b border-slate-700/50 pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Scholarly Title & Thesis
                  </span>
                  <h2 className="text-base font-bold text-slate-100 font-serif-academic leading-snug">
                    {result.title}
                  </h2>
                  <div className="p-3 bg-slate-900/60 border border-slate-700/40 rounded-lg text-xs text-slate-300">
                    <span className="font-semibold text-indigo-300 mr-1.5">Hypothesis / Primary Research Question:</span>
                    <span className="font-serif-academic italic">{result.keyHypothesis}</span>
                  </div>
                </div>

                {/* Theoretical Framework & Methodology */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                      <Layers className="h-4 w-4 text-purple-400" />
                      <span>Theoretical Framework</span>
                    </div>
                    <p className="text-xs text-slate-300 font-serif-academic leading-relaxed">
                      {result.theoreticalFramework}
                    </p>
                  </div>

                  <div className="bg-slate-900/40 border border-slate-700/40 rounded-lg p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                      <Cpu className="h-4 w-4 text-cyan-400" />
                      <span>Methodological Design</span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <p><span className="text-slate-400 font-medium">Type:</span> {result.methodology.type}</p>
                      <p><span className="text-slate-400 font-medium">Corpus/Sample:</span> {result.methodology.sampleOrDataset}</p>
                      <p><span className="text-slate-400 font-medium">Procedures:</span> {result.methodology.procedures}</p>
                    </div>
                  </div>
                </div>

                {/* Key Empirical Findings */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    <Target className="h-4 w-4" />
                    <span>Key Empirical Findings</span>
                  </div>
                  <div className="space-y-2">
                    {result.keyFindings.map((finding, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 bg-emerald-950/20 border border-emerald-800/30 rounded-lg p-3 text-xs text-slate-200 font-serif-academic"
                      >
                        <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{finding}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Methodological Limitations & Future Research */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Limitations */}
                  <div className="bg-amber-950/15 border border-amber-800/30 rounded-lg p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Threats to Validity & Limitations</span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1.5 font-serif-academic list-disc list-inside">
                      {result.criticalLimitations.map((lim, i) => (
                        <li key={i} className="leading-relaxed">{lim}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Gaps & Future Work */}
                  <div className="bg-indigo-950/20 border border-indigo-800/30 rounded-lg p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                      <Lightbulb className="h-4 w-4" />
                      <span>Literature Gaps & Next Steps</span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1.5 font-serif-academic list-disc list-inside">
                      {result.researchGapsAndFutureWork.map((gap, i) => (
                        <li key={i} className="leading-relaxed">{gap}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Practical Implications & Balanced Critique */}
                <div className="space-y-3 pt-2 border-t border-slate-700/50">
                  <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-3.5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Societal & University Implications
                    </span>
                    <p className="text-xs text-slate-300 font-serif-academic leading-relaxed">
                      {result.practicalImplications}
                    </p>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-3.5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Methodological Critique & Peer-Review Appraisal
                    </span>
                    <p className="text-xs text-slate-300 font-serif-academic italic leading-relaxed">
                      "{result.suggestedCritique}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[460px] bg-slate-800/20 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <BookOpen className="h-12 w-12 text-slate-700 mb-3 stroke-[1.2]" />
              <h3 className="font-semibold text-slate-300 text-sm">No Paper Synthesized Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Paste an empirical paper, dissertation abstract, or click one of the presets on the top right to generate a comprehensive academic analysis matrix.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
