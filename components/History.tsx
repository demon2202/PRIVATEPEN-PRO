
import React, { useState } from 'react';
import { useStorage } from '../contexts/StorageContext';
import { Clock, ArrowRight, Trash2, ChevronDown, ChevronUp, Copy, RefreshCw, Check, AlertCircle, Sparkles } from 'lucide-react';

interface HistoryProps {
    onRestore: (text: string) => void;
}

export const History: React.FC<HistoryProps> = ({ onRestore }) => {
  const { history, clearHistory } = useStorage();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
        <Clock className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">No history yet</p>
        <p className="text-sm opacity-70">Your AI interactions will appear here</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Clock className="w-6 h-6 text-brand-500" />
                Activity History
            </h2>
             <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Review your past improvements and edits</p>
        </div>
        <button 
          onClick={() => { if(window.confirm('Delete all history?')) clearHistory(); }}
          className="text-sm text-red-500 hover:text-red-600 flex items-center space-x-1 px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-800"
        >
          <Trash2 size={16} />
          <span>Clear All</span>
        </button>
      </div>
      
      <div className="space-y-4 pb-12">
        {history.map((item) => {
            const isExpanded = expandedId === item.id;
            
            return (
              <div key={item.id} className={`bg-white dark:bg-slate-800 rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-brand-300 dark:border-brand-700 shadow-lg ring-1 ring-brand-500/10' : 'border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md'}`}>
                {/* Header Row */}
                <div 
                    onClick={() => toggleExpand(item.id)}
                    className={`flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${isExpanded ? 'bg-slate-50/50 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700' : ''}`}
                >
                  <div className="flex items-center gap-4">
                     <div className={`p-2 rounded-lg ${
                        item.type === 'grammar' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 
                        item.type === 'tone' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 
                        item.type === 'summary' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                     }`}>
                        {item.type === 'grammar' ? <Check size={18} /> : 
                         item.type === 'tone' ? <AlertCircle size={18} /> : 
                         <Sparkles size={18} />}
                     </div>
                     <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-slate-700 dark:text-slate-200 capitalize">{item.type} Check</span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                {new Date(item.timestamp).toLocaleString()}
                            </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-md">
                            {item.original.substring(0, 60)}...
                        </div>
                     </div>
                  </div>
                  <div className="text-slate-400">
                     {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>
                
                {/* Expanded Details */}
                {isExpanded && (
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/30 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                            
                            {/* Desktop Arrow Connector */}
                            <div className="hidden lg:flex absolute left-1/2 top-8 -translate-x-1/2 z-10 text-slate-300 dark:text-slate-600 bg-white dark:bg-slate-800 rounded-full p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <ArrowRight size={20} />
                            </div>

                            {/* Original */}
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center px-1">
                                    <span className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                                        Original
                                    </span>
                                    <button 
                                        onClick={() => copyToClipboard(item.original, `orig-${item.id}`)}
                                        className="text-xs text-slate-400 hover:text-brand-600 flex items-center gap-1.5 transition-colors px-2 py-1 rounded-md hover:bg-white dark:hover:bg-slate-800"
                                    >
                                        {copiedId === `orig-${item.id}` ? <Check size={12}/> : <Copy size={12} />}
                                        {copiedId === `orig-${item.id}` ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-red-100 dark:border-red-900/20 text-sm text-slate-600 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto shadow-sm relative group">
                                     {item.original}
                                </div>
                                <button 
                                    onClick={() => onRestore(item.original)}
                                    className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-xl transition-all"
                                >
                                    <RefreshCw size={14} /> Restore Original
                                </button>
                            </div>

                            {/* Improved */}
                            <div className="flex flex-col gap-3">
                                <div className="flex justify-between items-center px-1">
                                    <span className="flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
                                        <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
                                        Improved Version
                                    </span>
                                    <button 
                                        onClick={() => copyToClipboard(item.improved, `imp-${item.id}`)}
                                        className="text-xs text-slate-400 hover:text-brand-600 flex items-center gap-1.5 transition-colors px-2 py-1 rounded-md hover:bg-white dark:hover:bg-slate-800"
                                    >
                                        {copiedId === `imp-${item.id}` ? <Check size={12}/> : <Copy size={12} />}
                                        {copiedId === `imp-${item.id}` ? 'Copied' : 'Copy'}
                                    </button>
                                </div>
                                <div className="p-4 bg-brand-50/30 dark:bg-brand-900/10 rounded-xl border border-brand-100 dark:border-brand-500/20 text-sm text-slate-800 dark:text-slate-100 font-medium whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto shadow-sm">
                                    {item.improved || <span className="text-slate-400 italic flex items-center gap-2"><AlertCircle size={14}/> No text generated (Analysis only)</span>}
                                </div>
                                {item.improved && (
                                    <button 
                                        onClick={() => onRestore(item.improved)}
                                        className="w-full py-2.5 flex items-center justify-center gap-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-[0.98]"
                                    >
                                        <Check size={14} /> Use This Version
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
              </div>
            );
        })}
      </div>
    </div>
  );
};
