import React, { useState } from 'react';
import { 
  Quote, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Bookmark, 
  AlertCircle, 
  FileCode, 
  BookMarked, 
  Plus,
  Trash2,
  ListPlus
} from 'lucide-react';
import { CitationResult, InstitutionLevel } from '../types/academic';
import { SAMPLE_CITATIONS } from '../data/samples';
import { saveItemToVault, exportItemAsBibtex } from '../utils/vault';

interface Props {
  level: InstitutionLevel;
  initialQuery?: string;
  onSaved: () => void;
}

export const CitationEngine: React.FC<Props> = ({ level, initialQuery = '', onSaved }) => {
  const [sourceInput, setSourceInput] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CitationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFormat, setActiveFormat] = useState<'apa7' | 'mla9' | 'chicago' | 'harvard' | 'ieee' | 'bibtex'>('apa7');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Batch collection
  const [batchList, setBatchList] = useState<CitationResult[]>([]);

  const handleGenerate = async (inputToUse?: string) => {
    const textToProcess = inputToUse || sourceInput;
    if (!textToProcess.trim()) {
      setError('Please provide paper information, title, DOI, or raw citation string.');
      return;
    }
    setError(null);
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch('/api/academic/citations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceInput: textToProcess,
          preferredStyle: activeFormat
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to format citations.');
      }

      const data: CitationResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Citation processing error.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveToVault = () => {
    if (!result) return;
    saveItemToVault({
      type: 'citations',
      title: result.metadata.title || 'Academic Citation',
      data: result,
    });
    setSaved(true);
    onSaved();
    setTimeout(() => setSaved(false), 2500);
  };

  const handleAddToBatch = () => {
    if (!result) return;
    if (!batchList.some(b => b.metadata.title === result.metadata.title)) {
      setBatchList([...batchList, result]);
    }
  };

  const handleCopyAllBatch = (format: 'apa7' | 'mla9' | 'chicago' | 'harvard' | 'ieee' | 'bibtex') => {
    if (batchList.length === 0) return;
    const combined = batchList.map(b => b.citations[format]).join('\n\n');
    navigator.clipboard.writeText(combined);
    setCopiedKey('batch_all');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadAllBibtex = () => {
    if (batchList.length === 0) return;
    const combined = batchList.map(b => b.citations.bibtex).join('\n\n');
    const blob = new Blob([combined], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `references_batch_${Date.now()}.bib`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Quote className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100 font-cinzel">Citation & Bibliography Engine</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Multi-standard academic citations conforming to APA 7th, MLA 9th, Chicago 17th, Harvard, IEEE, and LaTeX BibTeX standards with in-text parenthetical and narrative guides.
          </p>
        </div>

        {/* Quick sample pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">Try Presets:</span>
          {SAMPLE_CITATIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSourceInput(s.input);
                handleGenerate(s.input);
              }}
              className="text-xs bg-slate-800 hover:bg-emerald-900/30 hover:border-emerald-500/40 border border-slate-700 text-slate-300 hover:text-emerald-300 px-2.5 py-1 rounded-md transition cursor-pointer"
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

      {/* Main Form and Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-4">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Source String, Title, DOI, or Raw Reference
            </label>
            <textarea
              rows={6}
              value={sourceInput}
              onChange={(e) => setSourceInput(e.target.value)}
              placeholder="e.g. Vaswani et al. Attention is all you need, NeurIPS 2017, or 10.1038/s41586-020-2649-2, or an unformatted bibliography line..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-mono-code leading-relaxed"
            />

            <button
              onClick={() => handleGenerate()}
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-emerald-600/20 ${
                loading
                  ? 'bg-emerald-700/50 text-emerald-200 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-emerald-200 border-t-transparent rounded-full animate-spin" />
                  <span>Parsing Academic Metadata & Rules...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Citation Standards</span>
                </>
              )}
            </button>
          </div>

          {/* Batch Bibliography Manager */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <BookMarked className="h-4 w-4 text-emerald-400" />
                <span>Working Bibliography ({batchList.length})</span>
              </div>
              {batchList.length > 0 && (
                <button
                  onClick={() => setBatchList([])}
                  className="text-[11px] text-slate-400 hover:text-red-400 transition cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {batchList.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                Generate references and click "Add to Working Bibliography" to assemble a complete thesis reference list.
              </p>
            ) : (
              <div className="space-y-2">
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {batchList.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-900/60 p-2 rounded text-xs border border-slate-800">
                      <span className="truncate max-w-[220px] text-slate-300 font-medium">
                        {idx + 1}. {item.metadata.title}
                      </span>
                      <button
                        onClick={() => setBatchList(batchList.filter((_, i) => i !== idx))}
                        className="text-slate-500 hover:text-red-400 transition cursor-pointer ml-2"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-700/40">
                  <button
                    onClick={() => handleCopyAllBatch(activeFormat)}
                    className="flex-1 py-1.5 bg-slate-700/60 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {copiedKey === 'batch_all' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>Copy All ({activeFormat.toUpperCase()})</span>
                  </button>
                  <button
                    onClick={handleDownloadAllBibtex}
                    className="py-1.5 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                    title="Export All to .bib file"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>.BIB</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Output Formats */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl overflow-hidden shadow-xl space-y-4 p-5">
              {/* Header with Title and Metadata */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-700/50 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    Extracted Academic Metadata
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 font-serif-academic mt-0.5">
                    {result.metadata.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    <span className="text-slate-300 font-medium">Authors:</span> {result.metadata.authors.join(', ')} • ({result.metadata.year})
                  </p>
                  <p className="text-xs text-slate-400">
                    <span className="text-slate-300 font-medium">Source:</span> {result.metadata.publication} 
                    {result.metadata.volume && ` Vol. ${result.metadata.volume}`}
                    {result.metadata.issue && ` No. ${result.metadata.issue}`}
                    {result.metadata.pages && ` pp. ${result.metadata.pages}`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAddToBatch}
                    className="flex items-center gap-1 text-xs bg-slate-700/60 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-md transition cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Add to List</span>
                  </button>
                  <button
                    onClick={handleSaveToVault}
                    className="flex items-center gap-1 text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-2.5 py-1.5 rounded-md transition cursor-pointer"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>{saved ? 'Saved!' : 'Save'}</span>
                  </button>
                </div>
              </div>

              {/* Format Switcher Tabs */}
              <div className="flex flex-wrap gap-1.5 border-b border-slate-700/40 pb-2">
                {[
                  { id: 'apa7', label: 'APA 7th' },
                  { id: 'mla9', label: 'MLA 9th' },
                  { id: 'chicago', label: 'Chicago (Author-Date)' },
                  { id: 'harvard', label: 'Harvard' },
                  { id: 'ieee', label: 'IEEE (Engineering)' },
                  { id: 'bibtex', label: 'LaTeX BibTeX' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFormat(f.id as any)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                      activeFormat === f.id
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Active Citation Display */}
              <div className="bg-slate-900/80 border border-slate-700/60 rounded-xl p-4 space-y-3 relative">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300 uppercase tracking-wider">
                    {activeFormat.toUpperCase()} Reference Format
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyText(result.citations[activeFormat], activeFormat)}
                      className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded transition cursor-pointer"
                    >
                      {copiedKey === activeFormat ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedKey === activeFormat ? 'Copied!' : 'Copy'}</span>
                    </button>
                    {activeFormat === 'bibtex' && (
                      <button
                        onClick={() => exportItemAsBibtex({
                          id: 'temp',
                          title: result.metadata.title,
                          timestamp: Date.now(),
                          type: 'citations',
                          data: result
                        })}
                        className="flex items-center gap-1 text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded transition cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>.bib</span>
                      </button>
                    )}
                  </div>
                </div>

                {activeFormat === 'bibtex' ? (
                  <pre className="font-mono-code text-xs text-emerald-300 bg-slate-950/80 p-3.5 rounded-lg overflow-x-auto whitespace-pre leading-relaxed border border-emerald-900/40">
                    {result.citations.bibtex}
                  </pre>
                ) : (
                  <p className="font-serif-academic text-sm text-slate-100 leading-relaxed p-3.5 bg-slate-950/50 rounded-lg border border-slate-800">
                    {result.citations[activeFormat]}
                  </p>
                )}
              </div>

              {/* In-Text Citation Formats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Parenthetical</span>
                    <button
                      onClick={() => handleCopyText(result.inTextCitation.parenthetical, 'paren')}
                      className="text-slate-400 hover:text-emerald-300 cursor-pointer"
                    >
                      {copiedKey === 'paren' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                  <p className="font-serif-academic text-xs text-indigo-300">
                    {result.inTextCitation.parenthetical}
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Narrative</span>
                    <button
                      onClick={() => handleCopyText(result.inTextCitation.narrative, 'narrative')}
                      className="text-slate-400 hover:text-emerald-300 cursor-pointer"
                    >
                      {copiedKey === 'narrative' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                  <p className="font-serif-academic text-xs text-indigo-300">
                    {result.inTextCitation.narrative}
                  </p>
                </div>

                <div className="bg-slate-900/60 border border-slate-700/40 rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400">IEEE Numeric</span>
                    <button
                      onClick={() => handleCopyText(result.inTextCitation.ieeeNumeric, 'ieee')}
                      className="text-slate-400 hover:text-emerald-300 cursor-pointer"
                    >
                      {copiedKey === 'ieee' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                  <p className="font-mono-code text-xs text-emerald-300">
                    {result.inTextCitation.ieeeNumeric}
                  </p>
                </div>
              </div>

              {/* Formatting Notes */}
              {result.formattingNotes && (
                <div className="p-3 bg-slate-900/40 border border-slate-700/40 rounded-lg text-xs text-slate-400">
                  <span className="font-semibold text-slate-300 mr-1.5">Style Note:</span>
                  <span>{result.formattingNotes}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[460px] bg-slate-800/20 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <Quote className="h-12 w-12 text-slate-700 mb-3 stroke-[1.2]" />
              <h3 className="font-semibold text-slate-300 text-sm">No Reference Formatted Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Paste an article title, DOI (e.g. 10.1145/...), or book info to automatically format all standard citations and BibTeX entries.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
