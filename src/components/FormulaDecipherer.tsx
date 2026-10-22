import React, { useState } from 'react';
import { 
  Sigma, 
  Sparkles, 
  Copy, 
  Check, 
  Bookmark, 
  Download, 
  AlertCircle, 
  Code2, 
  Layers, 
  Calculator, 
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { FormulaResult, InstitutionLevel } from '../types/academic';
import { SAMPLE_FORMULAS } from '../data/samples';
import { saveItemToVault, exportItemAsMarkdown } from '../utils/vault';

interface Props {
  level: InstitutionLevel;
  onSaved: () => void;
}

export const FormulaDecipherer: React.FC<Props> = ({ level, onSaved }) => {
  const [formulaInput, setFormulaInput] = useState('');
  const [contextField, setContextField] = useState('Applied Mathematics & Machine Learning');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FormulaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedLatex, setCopiedLatex] = useState(false);
  const [saved, setSaved] = useState(false);

  const fields = [
    'Applied Mathematics & Machine Learning',
    'Physics & Classical / Quantum Mechanics',
    'Statistics & Probability Theory',
    'Economics & Financial Mathematics',
    'Biomedical & Biochemical Kinetics',
    'Electrical & Mechanical Engineering'
  ];

  const handleDecipher = async (customInput?: string, customField?: string) => {
    const textToUse = customInput || formulaInput;
    const fieldToUse = customField || contextField;
    if (!textToUse.trim()) {
      setError('Please input a formula, mathematical expression, or select a preset.');
      return;
    }
    setError(null);
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch('/api/academic/formula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formulaInput: textToUse,
          contextField: fieldToUse
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to decipher formula.');
      }

      const data: FormulaResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error parsing STEM equation.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (s: typeof SAMPLE_FORMULAS[0]) => {
    setFormulaInput(s.input);
    setContextField(s.field);
    handleDecipher(s.input, s.field);
  };

  const handleCopyLatex = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.latexBlock);
    setCopiedLatex(true);
    setTimeout(() => setCopiedLatex(false), 2000);
  };

  const handleSaveToVault = () => {
    if (!result) return;
    saveItemToVault({
      type: 'formula',
      title: result.formulaName || 'STEM Equation Analysis',
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
              <Sigma className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100 font-cinzel">LaTeX & STEM Formula Decipherer</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Break down complex mathematical, scientific, and statistical equations into clean LaTeX code, Greek symbol roles, theoretical derivations, and student traps.
          </p>
        </div>

        {/* Quick sample pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">Try Presets:</span>
          {SAMPLE_FORMULAS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => loadSample(s)}
              className="text-xs bg-slate-800 hover:bg-indigo-900/30 hover:border-indigo-500/40 border border-slate-700 text-slate-300 hover:text-indigo-300 px-2.5 py-1 rounded-md transition cursor-pointer"
            >
              {s.label.split('(')[0]}
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
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Mathematical Expression, Code, or Formula Name
              </label>
              <textarea
                rows={5}
                value={formulaInput}
                onChange={(e) => setFormulaInput(e.target.value)}
                placeholder="e.g. f(x) = (1/(sigma*sqrt(2*pi))) * exp(-0.5*((x-mu)/sigma)^2) or Navier Stokes or Bellman Equation..."
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono-code leading-relaxed"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                Scientific / Mathematical Field
              </label>
              <select
                value={contextField}
                onChange={(e) => setContextField(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {fields.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleDecipher()}
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
                  <span>Deciphering Variables & LaTeX Syntax...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Decipher Equation</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-2">
            <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Code2 className="h-3.5 w-3.5 text-indigo-400" />
              <span>LaTeX in Overleaf & Thesis Templates</span>
            </h4>
            <p>
              When writing a Master's or PhD dissertation in LaTeX (Overleaf/TeXLive), ScholarAssist gives you clean, compile-ready math expressions without missing brackets or syntax errors.
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
                  STEM Equation Decryption
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLatex}
                    className="flex items-center gap-1 text-xs bg-slate-700/60 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-md transition cursor-pointer"
                  >
                    {copiedLatex ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
                    <span>{copiedLatex ? 'Copied LaTeX' : 'Copy LaTeX'}</span>
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
                      title: result.formulaName,
                      timestamp: Date.now(),
                      type: 'formula',
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
                {/* Formula Header & LaTeX Code Box */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-100 font-cinzel">
                      {result.formulaName}
                    </h2>
                    <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded border border-indigo-500/20 font-mono-code">
                      {result.latexInline}
                    </span>
                  </div>

                  <div className="p-4 bg-slate-950/80 border border-indigo-500/40 rounded-xl relative overflow-x-auto">
                    <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-400 uppercase font-mono-code">
                      <span>LaTeX Block Notation</span>
                      <button
                        onClick={handleCopyLatex}
                        className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="h-3 w-3" />
                        <span>Copy Code</span>
                      </button>
                    </div>
                    <code className="text-xs font-mono-code text-indigo-200 block whitespace-pre leading-relaxed">
                      {result.latexBlock}
                    </code>
                  </div>

                  <p className="text-xs text-slate-300 font-serif-academic leading-relaxed italic bg-slate-900/60 p-3 rounded-lg border border-slate-700/40">
                    "{result.plainEnglishSummary}"
                  </p>
                </div>

                {/* Anatomy / Symbol by Symbol Breakdown */}
                <div className="space-y-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Layers className="h-3.5 w-3.5" />
                    <span>Equation Anatomy & Variable Dictionary</span>
                  </span>
                  <div className="space-y-2">
                    {result.variablesBreakdown.map((v, idx) => (
                      <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono-code text-sm font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 shrink-0">
                            {v.symbol}
                          </span>
                          <div>
                            <span className="font-semibold text-slate-200 block">{v.name}</span>
                            <span className="text-[11px] text-slate-400">{v.role}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700/60 self-start sm:self-center font-mono-code">
                          {v.unitOrType}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step by step derivation / logic */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Calculator className="h-3.5 w-3.5" />
                    <span>Derivation & Operational Mechanics</span>
                  </span>
                  <div className="space-y-1.5">
                    {result.stepByStepDerivationOrMeaning.map((step, i) => (
                      <div key={i} className="p-2.5 bg-slate-900/40 border border-slate-800 rounded-lg text-xs text-slate-300 font-serif-academic leading-relaxed">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Practical Research Application & Student Traps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-700/50">
                  <div className="bg-slate-900/60 border border-slate-700/40 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                      <span>Empirical University Use Case</span>
                    </span>
                    <p className="text-xs text-slate-300 font-serif-academic leading-relaxed">
                      {result.practicalApplication}
                    </p>
                  </div>

                  <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>Exam Traps & Common Fallacies</span>
                    </span>
                    <p className="text-xs text-slate-300 font-serif-academic leading-relaxed">
                      {result.commonStudentPitfalls}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[460px] bg-slate-800/20 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <Sigma className="h-12 w-12 text-slate-700 mb-3 stroke-[1.2]" />
              <h3 className="font-semibold text-slate-300 text-sm">No Formula Deciphered Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Enter an equation, statistical loss function, or physical law to generate LaTeX formatting, variable dictionaries, and intuitive conceptual breakdowns.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
