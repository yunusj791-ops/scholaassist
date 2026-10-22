import React, { useState } from 'react';
import { 
  BrainCircuit, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  RotateCw, 
  ChevronLeft, 
  ChevronRight, 
  Bookmark, 
  Award, 
  AlertCircle, 
  Check, 
  BookOpen, 
  FileCheck,
  RefreshCw,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { InstitutionLevel, StudyResult, Flashcard, QuizQuestion } from '../types/academic';
import { saveItemToVault } from '../utils/vault';

interface Props {
  level: InstitutionLevel;
  onSaved: () => void;
}

export const StudySuite: React.FC<Props> = ({ level, onSaved }) => {
  const [studyText, setStudyText] = useState('');
  const [itemCount, setItemCount] = useState(6);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StudyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sub-tabs: Flashcards vs. Exam Simulator
  const [studyTab, setStudyTab] = useState<'flashcards' | 'quiz' | 'freeresponse'>('flashcards');

  // Flashcards state
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Record<string, boolean>>({});

  // Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const sampleNote = `Convolutional Neural Networks (CNNs) rely on local receptive fields, shared weights, and spatial pooling to achieve translational invariance in image analysis. While standard kernels capture shift invariance, they do not inherently encode rotational or scale invariance without data augmentation. Residual Networks (ResNets) solve the vanishing gradient problem in deep networks via skip connections (identity shortcuts), allowing gradients to flow back without attenuation. In contrast, Vision Transformers (ViTs) divide images into 16x16 non-overlapping patches, project them linearly, and apply global multi-head self-attention, capturing long-range dependencies from the earliest layer at the cost of requiring larger pretraining datasets due to the absence of CNN inductive bias.`;

  const handleGenerate = async (customNote?: string) => {
    const textToUse = customNote || studyText;
    if (!textToUse.trim()) {
      setError('Please provide lecture notes, paper excerpts, or study material.');
      return;
    }
    setError(null);
    setLoading(true);
    setUserAnswers({});
    setQuizSubmitted(false);
    setCurrentCardIdx(0);
    setIsFlipped(false);

    try {
      const res = await fetch('/api/academic/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studyMaterial: textToUse,
          count: itemCount,
          level,
          mode: 'both'
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate study materials.');
      }

      const data: StudyResult = await res.json();
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error generating active-recall materials.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMastered = (cardId: string) => {
    setMasteredCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleSelectAnswer = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [qIdx]: optIdx
    }));
  };

  const calculateScore = () => {
    if (!result) return 0;
    let score = 0;
    result.quizQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    if (!result) return;
    const score = calculateScore();
    const ratio = score / result.quizQuestions.length;
    if (ratio >= 0.75) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleSaveToVault = () => {
    if (!result) return;
    saveItemToVault({
      type: 'study',
      title: result.topicTitle || 'Active Recall Deck',
      data: result,
    });
    onSaved();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BrainCircuit className="h-5 w-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-100 font-cinzel">Active Recall & Exam Mastery Suite</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Convert complex lecture transcripts, textbooks, and research papers into high-yield Leitner flashcards, conceptual multiple-choice exams, and dissertation oral rubrics.
          </p>
        </div>

        <button
          onClick={() => {
            setStudyText(sampleNote);
            handleGenerate(sampleNote);
          }}
          className="text-xs bg-slate-800 hover:bg-emerald-900/30 hover:border-emerald-500/40 border border-slate-700 text-slate-300 hover:text-emerald-300 px-3 py-1.5 rounded-md transition cursor-pointer self-start md:self-auto"
        >
          Load Neural Architectures Sample
        </button>
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
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Lecture Notes, Textbook Excerpt, or Study Guide
            </label>
            <textarea
              rows={8}
              value={studyText}
              onChange={(e) => setStudyText(e.target.value)}
              placeholder="Paste study material, syllabus points, or technical definitions here..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-serif-academic leading-relaxed"
            />

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-slate-300 uppercase tracking-wider">Number of items</span>
                <span className="text-emerald-400 font-bold">{itemCount} items</span>
              </div>
              <input
                type="range"
                min={4}
                max={10}
                value={itemCount}
                onChange={(e) => setItemCount(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

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
                  <span>Synthesizing Flashcards & Exam Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Study Materials</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-2">
            <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-amber-400" />
              <span>Cognitive Science of Active Recall</span>
            </h4>
            <p>
              Testing yourself with active generation forces neural retrieval pathways, resulting in up to 300% higher retention on university midterms compared to passive re-reading.
            </p>
          </div>
        </div>

        {/* Right Output */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="bg-slate-800/60 border border-slate-700/70 rounded-xl overflow-hidden shadow-xl">
              {/* Output Tabs Header */}
              <div className="bg-slate-800/90 border-b border-slate-700/60 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setStudyTab('flashcards')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      studyTab === 'flashcards'
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Flashcards ({result.flashcards.length})
                  </button>
                  <button
                    onClick={() => setStudyTab('quiz')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      studyTab === 'quiz'
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Exam Simulator ({result.quizQuestions.length})
                  </button>
                  <button
                    onClick={() => setStudyTab('freeresponse')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      studyTab === 'freeresponse'
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Defense Prompt & Rubric
                  </button>
                </div>

                <button
                  onClick={handleSaveToVault}
                  className="flex items-center gap-1 text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-2.5 py-1.5 rounded-md transition cursor-pointer"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  <span>Save Deck</span>
                </button>
              </div>

              {/* Tab 1: Flashcards */}
              {studyTab === 'flashcards' && (
                <div className="p-5 space-y-5">
                  {/* Card Navigation */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>
                      Card <strong className="text-slate-200">{currentCardIdx + 1}</strong> of {result.flashcards.length}
                    </span>
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-700">
                      Difficulty: {result.flashcards[currentCardIdx]?.difficulty}
                    </span>
                  </div>

                  {/* Interactive Flip Card */}
                  {result.flashcards[currentCardIdx] && (
                    <div
                      onClick={() => setIsFlipped(!isFlipped)}
                      className={`min-h-[260px] rounded-2xl p-6 cursor-pointer select-none transition-all duration-300 border flex flex-col justify-between shadow-lg relative ${
                        isFlipped
                          ? 'bg-gradient-to-br from-slate-900 to-indigo-950/60 border-indigo-500/50 shadow-indigo-500/10'
                          : 'bg-gradient-to-br from-slate-900 to-slate-800/80 border-slate-700/80 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="uppercase tracking-widest font-bold text-slate-400">
                          {isFlipped ? 'ANSWER / THEORETICAL MECHANICS' : 'PROMPT / EXAM QUESTION'}
                        </span>
                        <div className="flex items-center gap-1 text-indigo-400">
                          <RotateCw className="h-3 w-3" />
                          <span>Click to Flip</span>
                        </div>
                      </div>

                      <div className="my-auto py-4">
                        {isFlipped ? (
                          <p className="text-sm font-serif-academic text-slate-100 leading-relaxed">
                            {result.flashcards[currentCardIdx].back}
                          </p>
                        ) : (
                          <h3 className="text-base font-bold text-slate-100 font-cinzel leading-snug">
                            {result.flashcards[currentCardIdx].front}
                          </h3>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                        <div className="flex flex-wrap gap-1">
                          {result.flashcards[currentCardIdx].keyTerms?.map((term, tIdx) => (
                            <span key={tIdx} className="text-[10px] bg-slate-800/80 text-indigo-300 px-2 py-0.5 rounded border border-slate-700/60">
                              {term}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleMastered(result.flashcards[currentCardIdx].id);
                          }}
                          className={`text-xs px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 cursor-pointer ${
                            masteredCards[result.flashcards[currentCardIdx].id]
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700'
                          }`}
                        >
                          <Check className="h-3 w-3" />
                          <span>{masteredCards[result.flashcards[currentCardIdx].id] ? 'Mastered' : 'Mark Mastered'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Card Controls */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIdx(Math.max(0, currentCardIdx - 1));
                      }}
                      disabled={currentCardIdx === 0}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Previous</span>
                    </button>

                    <span className="text-xs text-slate-500">
                      {Object.values(masteredCards).filter(Boolean).length} of {result.flashcards.length} Mastered
                    </span>

                    <button
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIdx(Math.min(result.flashcards.length - 1, currentCardIdx + 1));
                      }}
                      disabled={currentCardIdx === result.flashcards.length - 1}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 2: Multiple-Choice Exam Simulator */}
              {studyTab === 'quiz' && (
                <div className="p-5 space-y-6 max-h-[750px] overflow-y-auto">
                  {quizSubmitted && (
                    <div className="p-4 bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-600/40 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Trophy className="h-8 w-8 text-amber-400 shrink-0" />
                        <div>
                          <h4 className="text-sm font-bold text-slate-100">
                            Exam Score: {calculateScore()} / {result.quizQuestions.length} ({Math.round((calculateScore() / result.quizQuestions.length) * 100)}%)
                          </h4>
                          <p className="text-xs text-slate-400">
                            Review detailed rationales and distractor analyses below.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setQuizSubmitted(false);
                          setUserAnswers({});
                        }}
                        className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        <span>Retake Exam</span>
                      </button>
                    </div>
                  )}

                  <div className="space-y-5">
                    {result.quizQuestions.map((q, qIdx) => {
                      const selected = userAnswers[qIdx];
                      const isCorrect = selected === q.correctIndex;
                      return (
                        <div key={q.id} className="bg-slate-900/60 border border-slate-700/50 rounded-xl p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-indigo-400 font-mono-code">
                              Question {qIdx + 1}
                            </span>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
                              {q.taxonomyLevel}
                            </span>
                          </div>

                          <h4 className="text-xs font-semibold text-slate-100 font-serif-academic leading-relaxed">
                            {q.question}
                          </h4>

                          {/* Options */}
                          <div className="space-y-1.5">
                            {q.options.map((opt, optIdx) => {
                              const isChoice = selected === optIdx;
                              let style = 'bg-slate-850 hover:bg-slate-800 text-slate-300 border-slate-800';
                              if (quizSubmitted) {
                                if (optIdx === q.correctIndex) {
                                  style = 'bg-emerald-950/40 text-emerald-200 border-emerald-500/60 font-medium';
                                } else if (isChoice && !isCorrect) {
                                  style = 'bg-red-950/40 text-red-200 border-red-500/60 line-through';
                                } else {
                                  style = 'bg-slate-900/40 text-slate-500 border-slate-800';
                                }
                              } else if (isChoice) {
                                style = 'bg-indigo-600/30 text-indigo-200 border-indigo-500';
                              }

                              return (
                                <button
                                  key={optIdx}
                                  onClick={() => handleSelectAnswer(qIdx, optIdx)}
                                  disabled={quizSubmitted}
                                  className={`w-full text-left p-2.5 rounded-lg text-xs border transition flex items-center justify-between cursor-pointer ${style}`}
                                >
                                  <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                                  {quizSubmitted && optIdx === q.correctIndex && (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 ml-2" />
                                  )}
                                  {quizSubmitted && isChoice && !isCorrect && (
                                    <XCircle className="h-4 w-4 text-red-400 shrink-0 ml-2" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Rationale when submitted */}
                          {quizSubmitted && (
                            <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-xs text-slate-300 font-serif-academic space-y-1">
                              <span className="font-semibold text-slate-200 block">Explanatory Rationale:</span>
                              <p className="leading-relaxed">{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {!quizSubmitted && (
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(userAnswers).length === 0}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-600/20"
                    >
                      Submit Exam ({Object.keys(userAnswers).length} / {result.quizQuestions.length} answered)
                    </button>
                  )}
                </div>
              )}

              {/* Tab 3: Free Response & Dissertation Rubric */}
              {studyTab === 'freeresponse' && (
                <div className="p-5 space-y-5 max-h-[750px] overflow-y-auto">
                  <div className="bg-slate-900/60 border border-slate-700/60 rounded-xl p-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      Oral Defense / Analytical Essay Prompt
                    </span>
                    <p className="text-xs font-bold text-slate-100 font-serif-academic leading-relaxed">
                      {result.freeResponsePrompt.question}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      Model Grading Rubric (Evaluation Standards)
                    </span>
                    <div className="space-y-1.5">
                      {result.freeResponsePrompt.modelGradingRubric.map((r, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-900/40 border border-slate-800 rounded-lg text-xs text-slate-300 font-serif-academic">
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                      Exemplar Key Arguments Expected
                    </span>
                    <ul className="text-xs text-slate-300 font-serif-academic space-y-1.5 list-disc list-inside bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                      {result.freeResponsePrompt.exemplarKeyPoints.map((pt, idx) => (
                        <li key={idx} className="leading-relaxed">{pt}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[460px] bg-slate-800/20 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <BrainCircuit className="h-12 w-12 text-slate-700 mb-3 stroke-[1.2]" />
              <h3 className="font-semibold text-slate-300 text-sm">No Active Recall Set Generated</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Paste your course notes or paper summary to generate interactive flip flashcards and an auto-graded exam simulator.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
