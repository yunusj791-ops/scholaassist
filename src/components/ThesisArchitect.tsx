import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  Bookmark, 
  Download, 
  AlertCircle, 
  FolderTree, 
  Compass, 
  ShieldAlert, 
  HelpCircle,
  Award
} from 'lucide-react';
import { InstitutionLevel, ProposalResult } from '../types/academic';
import { SAMPLE_PROPOSALS } from '../data/samples';
import { saveItemToVault, exportItemAsMarkdown } from '../utils/vault';

interface Props {
  level: InstitutionLevel;
  onSaved: () => void;
}

export const ThesisArchitect: React.FC<Props> = ({ level, onSaved }) => {
  const [topic, setTopic] = useState('');
  const [discipline, setDiscipline] = useState('Computer Science & Artificial Intelligence');
  const [targetGoal, setTargetGoal] = useState('Full Dissertation Research Proposal');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProposalResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const disciplines = [
    'Computer Science & Artificial Intelligence',
    'Biomedical & Health Sciences',
    'Economics & Business Finance',
    'Social Sciences & Psychology',
    'Mechanical & Aerospace Engineering',
    'Environmental Science & Ecology',
    'Law, Public Policy & Governance',
    'Humanities, Literature & Philosophy'
  ];

  const proposalGoals = [
    'Full Dissertation Research Proposal',
    'Undergraduate Senior Capstone Project',
    'Grant Funding / Fellowship Proposal',
    'Conference Paper Blueprint'
  ];

  const handleGenerate = async (topicToUse?: string, discToUse?: string) => {
    const curTopic = topicToUse || topic;
    const curDisc = discToUse || discipline;
    if (!curTopic.trim()) {
      setError('Please provide a research topic, problem area, or select a preset.');
      return;
    }
    setError(null);
    setLoading(true);
    setSaved(false);

    try {
      const res = await fetch('/api/academic/proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: curTopic,
          discipline: curDisc,
          degreeLevel: level,
          targetGoal
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate proposal.');
      }

      const data: ProposalResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error formulating academic proposal.');
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (s: typeof SAMPLE_PROPOSALS[0]) => {
    setTopic(s.topic);
    setDiscipline(s.discipline);
    handleGenerate(s.topic, s.discipline);
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Academic Titles:\n${result.suggestedAcademicTitles.map(t => `- ${t}`).join('\n')}\n\nProblem Statement:\n${result.problemStatement}\n\nResearch Questions:\n${result.researchQuestions.map((q, i) => `${i+1}. ${q}`).join('\n')}\n\nTheoretical Framework:\n${result.theoreticalFramework}\n\nMethodology:\n${result.methodologicalDesign.approach} | Paradigm: ${result.methodologicalDesign.researchParadigm}\n\nChapter Breakdown:\n${result.chapterBreakdown.map(c => `${c.chapter}:\n  ${c.keySections.join(', ')}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToVault = () => {
    if (!result) return;
    saveItemToVault({
      type: 'thesis',
      title: result.suggestedAcademicTitles[0] || 'Dissertation Proposal',
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
              <FileText className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100 font-cinzel">Thesis & Research Proposal Architect</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Structure defense-ready problem statements, research questions, theoretical anchors, quantitative/qualitative methodologies, and 5-chapter dissertation blueprints for {level} studies.
          </p>
        </div>

        {/* Quick sample pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">Try Presets:</span>
          {SAMPLE_PROPOSALS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => loadSample(s)}
              className="text-xs bg-slate-800 hover:bg-indigo-900/30 hover:border-indigo-500/40 border border-slate-700 text-slate-300 hover:text-indigo-300 px-2.5 py-1 rounded-md transition cursor-pointer"
            >
              {s.label.split(' ')[0]}
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
        {/* Left Inputs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1.5">
                Core Research Topic or Inquisitive Premise
              </label>
              <textarea
                rows={5}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Assessing how federated learning improves privacy in electronic health record classification without sacrificing diagnostic accuracy..."
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-serif-academic leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                  Academic Discipline
                </label>
                <select
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {disciplines.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-1">
                  Target Proposal Format
                </label>
                <select
                  value={targetGoal}
                  onChange={(e) => setTargetGoal(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {proposalGoals.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={() => handleGenerate()}
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
                  <span>Drafting Dissertation Architecture...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Research Proposal</span>
                </>
              )}
            </button>
          </div>

          {/* Committee Criteria Helper */}
          <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-2">
            <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-amber-400" />
              <span>Dissertation Defense Standard</span>
            </h4>
            <p>
              Committees look for <strong>triangulation</strong>: ensure your Problem Statement clearly justifies your Research Questions, and each Research Question has an explicit instrument in the Methodology.
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
                  Defense-Ready Research Architecture
                </span>
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
                    className="flex items-center gap-1 text-xs bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 px-2.5 py-1.5 rounded-md transition cursor-pointer"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    <span>{saved ? 'Saved!' : 'Save to Vault'}</span>
                  </button>
                  <button
                    onClick={() => exportItemAsMarkdown({
                      id: 'temp',
                      title: result.suggestedAcademicTitles[0],
                      timestamp: Date.now(),
                      type: 'thesis',
                      data: result
                    })}
                    className="flex items-center gap-1 text-xs bg-slate-700/60 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-md transition cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-400" />
                    <span>.MD</span>
                  </button>
                </div>
              </div>

              {/* Proposal Content */}
              <div className="p-5 space-y-6 max-h-[750px] overflow-y-auto pr-3">
                {/* Academic Title Options */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Recommended Dissertation Titles
                  </span>
                  <div className="space-y-1.5">
                    {result.suggestedAcademicTitles.map((t, i) => (
                      <div key={i} className="p-2.5 bg-slate-900/60 border border-slate-700/40 rounded-lg text-xs font-serif-academic text-slate-200 font-semibold">
                        <span className="text-indigo-400 mr-2 font-mono-code font-normal">Option {i + 1}:</span>
                        {t}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Problem Statement */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Formal Statement of the Problem
                  </span>
                  <div className="p-4 bg-slate-900/80 border border-slate-700/60 rounded-xl text-xs text-slate-200 font-serif-academic leading-relaxed whitespace-pre-line">
                    {result.problemStatement}
                  </div>
                </div>

                {/* Research Questions & Hypotheses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                      <HelpCircle className="h-4 w-4 text-indigo-400" />
                      <span>Research Questions (RQs)</span>
                    </div>
                    <div className="space-y-2">
                      {result.researchQuestions.map((rq, idx) => (
                        <div key={idx} className="text-xs text-slate-300 font-serif-academic">
                          <span className="font-semibold text-indigo-300">RQ{idx + 1}:</span> {rq}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                      <Compass className="h-4 w-4 text-emerald-400" />
                      <span>Formal Hypotheses (H)</span>
                    </div>
                    <div className="space-y-2">
                      {result.hypotheses.map((h, idx) => (
                        <div key={idx} className="text-xs text-slate-300 font-serif-academic">
                          {h}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Theoretical Framework & Methodological Design */}
                <div className="bg-slate-900/70 border border-slate-700/50 rounded-xl p-4 space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Methodological Blueprint & Theoretical Anchor
                  </span>
                  <div className="text-xs text-slate-300 font-serif-academic border-b border-slate-800 pb-2">
                    <span className="font-semibold text-slate-200">Theoretical Foundations:</span> {result.theoreticalFramework}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300 pt-1">
                    <div>
                      <span className="font-semibold text-slate-400 block">Paradigm & Approach:</span>
                      <span>{result.methodologicalDesign.researchParadigm} • {result.methodologicalDesign.approach}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-400 block">Population & Sampling:</span>
                      <span>{result.methodologicalDesign.populationAndSampling}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-400 block">Data Collection Protocol:</span>
                      <span>{result.methodologicalDesign.dataCollection}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-400 block">Analytical Plan / Statistical Tests:</span>
                      <span>{result.methodologicalDesign.analyticalPlan}</span>
                    </div>
                  </div>
                </div>

                {/* Chapter Breakdown */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <FolderTree className="h-4 w-4 text-cyan-400" />
                    <span>Standard 5-Chapter Thesis Blueprint</span>
                  </div>
                  <div className="space-y-2">
                    {result.chapterBreakdown.map((ch, idx) => (
                      <div key={idx} className="bg-slate-900/40 border border-slate-800 rounded-lg p-3 text-xs">
                        <span className="font-semibold text-indigo-300 font-serif-academic block mb-1">
                          {ch.chapter}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {ch.keySections.map((sec, sIdx) => (
                            <span key={sIdx} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] border border-slate-700/60">
                              {sec}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ethical Considerations & IRB */}
                <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                    <ShieldAlert className="h-4 w-4" />
                    <span>IRB & Ethical Considerations</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 font-serif-academic list-disc list-inside">
                    {result.potentialEthicalRisks.map((risk, i) => (
                      <li key={i}>{risk}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[460px] bg-slate-800/20 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <FileText className="h-12 w-12 text-slate-700 mb-3 stroke-[1.2]" />
              <h3 className="font-semibold text-slate-300 text-sm">No Research Blueprint Configured</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Enter your research topic and academic field to build a defense-grade dissertation plan, problem statement, and 5-chapter roadmap.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
