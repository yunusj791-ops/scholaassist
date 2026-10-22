import React, { useState } from 'react';
import { 
  X, 
  Bookmark, 
  Trash2, 
  Download, 
  FileText, 
  Quote, 
  Sparkles, 
  Sigma, 
  BrainCircuit, 
  BookOpen, 
  ExternalLink,
  Printer
} from 'lucide-react';
import { SavedResearchItem } from '../types/academic';
import { 
  getSavedItems, 
  removeItemFromVault, 
  exportItemAsMarkdown, 
  exportItemAsBibtex 
} from '../utils/vault';
import { downloadProjectAsWord } from '../utils/projectDownloader';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onVaultChanged: () => void;
  onSelectItem?: (item: SavedResearchItem) => void;
}

export const VaultDrawer: React.FC<Props> = ({ isOpen, onClose, onVaultChanged, onSelectItem }) => {
  const [filter, setFilter] = useState<string>('all');
  const items = getSavedItems();

  if (!isOpen) return null;

  const filteredItems = filter === 'all' ? items : items.filter(i => i.type === filter);

  const handleDelete = (id: string) => {
    removeItemFromVault(id);
    onVaultChanged();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'projects': return <FileText className="h-4 w-4 text-blue-400" />;
      case 'synthesizer': return <BookOpen className="h-4 w-4 text-indigo-400" />;
      case 'citations': return <Quote className="h-4 w-4 text-emerald-400" />;
      case 'thesis': return <FileText className="h-4 w-4 text-cyan-400" />;
      case 'polisher': return <Sparkles className="h-4 w-4 text-purple-400" />;
      case 'formula': return <Sigma className="h-4 w-4 text-amber-400" />;
      case 'study': return <BrainCircuit className="h-4 w-4 text-rose-400" />;
      default: return <Bookmark className="h-4 w-4 text-slate-400" />;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-850">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Bookmark className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 font-cinzel">Research Vault</h3>
                <p className="text-[11px] text-slate-400">
                  {items.length} Saved Academic Documents & Syntheses
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
                title="Print Academic Dossier"
              >
                <Printer className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="p-3 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-slate-900/60">
            {[
              { id: 'all', label: 'All' },
              { id: 'projects', label: 'Projects (.DOC)' },
              { id: 'synthesizer', label: 'Syntheses' },
              { id: 'citations', label: 'Citations' },
              { id: 'thesis', label: 'Proposals' },
              { id: 'polisher', label: 'Polished' },
              { id: 'formula', label: 'Formulas' },
              { id: 'study', label: 'Decks' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`text-[11px] px-2.5 py-1 rounded-md transition whitespace-nowrap cursor-pointer ${
                  filter === f.id
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-800/40'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredItems.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Bookmark className="h-8 w-8 mb-2 opacity-30 stroke-[1.5]" />
                <p className="text-xs font-medium text-slate-400">Vault is empty</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Click "Save to Vault" across any tool to store syntheses, citations, proposals, or study sets.
                </p>
              </div>
            ) : (
              filteredItems.map(item => (
                <div
                  key={item.id}
                  className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-2.5 transition hover:border-slate-600"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded bg-slate-800 border border-slate-700">
                        {getIcon(item.type)}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 font-serif-academic line-clamp-1">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.timestamp).toLocaleDateString()} • {item.type.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded transition cursor-pointer"
                      title="Delete from Vault"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Actions for Item */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-xs">
                    <button
                      onClick={() => exportItemAsMarkdown(item)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download .MD</span>
                    </button>

                    {item.type === 'projects' && (
                      <button
                        onClick={() => downloadProjectAsWord(item.data)}
                        className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-medium"
                        title="Download as Word Document (.doc)"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download .DOC</span>
                      </button>
                    )}

                    {item.type === 'citations' && (
                      <button
                        onClick={() => exportItemAsBibtex(item)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <Download className="h-3 w-3" />
                        <span>Download .BIB</span>
                      </button>
                    )}

                    {onSelectItem && (
                      <button
                        onClick={() => {
                          onSelectItem(item);
                          onClose();
                        }}
                        className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
