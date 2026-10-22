import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquareQuote, 
  Send, 
  Sparkles, 
  X, 
  GraduationCap, 
  Bot, 
  User, 
  Copy, 
  Check, 
  Lightbulb,
  Trash2,
  Globe,
  FolderDown
} from 'lucide-react';
import { InstitutionLevel } from '../types/academic';
import { CountryInfo } from '../data/countries';
import { downloadCustomTextAsWord } from '../utils/projectDownloader';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isDraft?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  level: InstitutionLevel;
  country?: CountryInfo;
}

export const ResearchTutorModal: React.FC<Props> = ({ isOpen, onClose, level, country }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am ScholarAssist - Global Academic Research Assistant for OND, HND, BSc, MSc, and PhD students.\n\nI help students from ANY country (Nigeria, USA, UK, India, Ghana, Kenya, Canada, etc.) with Project, Thesis, Dissertation and Seminar research.\n\nWhat is your Level (OND/HND/BSc/MSc/PhD) and Country? Type your topic or research question below to begin!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [actionLoadingIdx, setActionLoadingIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const starterQuestions = [
    `I am ${level} from ${country?.name || 'Nigeria'}. Help me formulate Chapter 1 Introduction.`,
    'Generate Chapter 2 Literature Review with recent 2020-2026 APA 7th citations.',
    'Critique my Chapter 3 Research Methodology and calculate sample size.',
    'Formulate Chapter 5 Recommendations and defense questions.'
  ];


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const newHistory: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/academic/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          academicContext: `Student Level: ${level}`
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to receive advisor advice.');
      }

      const data = await res.json();
      setMessages([...newHistory, { role: 'assistant', content: data.reply }]);
    } catch (err: any) {
      console.error(err);
      setMessages([
        ...newHistory,
        { role: 'assistant', content: 'Apologies, I encountered an advisory communication disruption. Please try rephrasing your research inquiry.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 font-cinzel">Academic Advisor & Research Mentor</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  {level}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Methodology critique, conceptual framing & dissertation defense readiness
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 1 && (
              <button
                onClick={() => setMessages([messages[0]])}
                className="text-slate-400 hover:text-slate-200 text-xs p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="Clear Conversation"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Chat message stream */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-4 text-xs leading-relaxed relative group ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-xs'
                    : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 font-serif-academic rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                {msg.role === 'assistant' && (
                  <>
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1 bg-slate-900/80 rounded text-slate-400 hover:text-slate-200 cursor-pointer"
                      title="Copy advice"
                    >
                      {copiedIdx === idx ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>

                    {/* 3 Core Action Buttons (Rule 4) */}
                    {idx > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex flex-wrap items-center gap-1.5 font-sans">
                        <button
                          onClick={async () => {
                            setActionLoadingIdx(idx);
                            try {
                              const r = await fetch('/api/academic/humanize-chapter', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  chapterText: msg.content,
                                  chapterTitle: 'Research Draft',
                                  level,
                                  country: country?.name || 'Nigeria'
                                })
                              });
                              const res = await r.json();
                              if (res.success && res.humanizedText) {
                                setMessages(prev => [...prev, {
                                  role: 'assistant',
                                  content: `${res.humanizedText}`
                                }]);
                              }
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setActionLoadingIdx(null);
                            }
                          }}
                          disabled={actionLoadingIdx === idx}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition"
                          title="Rewrite to sound 100% human-written by a real student from your country"
                        >
                          <Sparkles className="h-3 w-3 text-amber-400" />
                          <span>Humanize This Chapter</span>
                        </button>

                        <button
                          onClick={async () => {
                            setActionLoadingIdx(idx);
                            try {
                              const r = await fetch('/api/academic/rewrite-country-style', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  chapterText: msg.content,
                                  chapterTitle: 'Research Draft',
                                  level,
                                  targetCountry: country?.name || 'Nigeria'
                                })
                              });
                              const res = await r.json();
                              if (res.success && res.rewrittenText) {
                                setMessages(prev => [...prev, {
                                  role: 'assistant',
                                  content: `${res.rewrittenText}`
                                }]);
                              }
                            } catch (e) {
                              console.error(e);
                            } finally {
                              setActionLoadingIdx(null);
                            }
                          }}
                          disabled={actionLoadingIdx === idx}
                          className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition"
                          title="Rewrite to match academic writing standards of your country"
                        >
                          <Globe className="h-3 w-3 text-indigo-400" />
                          <span>Rewrite for My Country Style</span>
                        </button>

                        <button
                          onClick={() => {
                            downloadCustomTextAsWord(
                              'ScholarAssist_Research_Draft',
                              msg.content,
                              'Academic Consultation',
                              level,
                              country?.name || 'International'
                            );
                          }}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition"
                          title="Download formatted file for Microsoft Word"
                        >
                          <FolderDown className="h-3 w-3 text-emerald-400" />
                          <span>Download as Word Docx</span>
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 animate-pulse" />
              </div>
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl rounded-bl-xs p-3 text-xs text-slate-400 flex items-center gap-2">
                <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce" />
                <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-slate-400">Consulting scholarly methodology corpus...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested prompts on initial state */}
        {messages.length === 1 && (
          <div className="px-5 py-2 border-t border-slate-800 bg-slate-900/60">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2">
              <Lightbulb className="h-3 w-3 text-amber-400" />
              <span>Recommended Inquiries:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {starterQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="text-[11px] bg-slate-800 hover:bg-indigo-900/30 hover:border-indigo-500/40 border border-slate-700 text-slate-300 hover:text-indigo-300 px-2.5 py-1 rounded-md transition text-left cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 bg-slate-850 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for academic advice on your thesis, literature gap, or methodology..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition cursor-pointer shrink-0 shadow-lg shadow-indigo-600/20"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
