
import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import { REWRITE_STYLES } from '../constants';
import { Wand2, Check, X, Loader2, Replace, Copy, ArrowRight, Sparkles, MessageSquare, ChevronRight, ChevronLeft } from 'lucide-react';

interface Props {
  rect: DOMRect;
  selectedText: string;
  onClose: () => void;
}

export const FloatingToolbar = ({ rect, selectedText, onClose }: Props) => {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'main' | 'styles' | 'custom'>('main');
  const [customPrompt, setCustomPrompt] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { settings } = useSettings();

  // Focus input when custom mode opens
  useEffect(() => {
    if (mode === 'custom' && inputRef.current) {
        inputRef.current.focus();
    }
  }, [mode]);

  const style: React.CSSProperties = {
    position: 'fixed',
    top: `${rect.top - 60}px`,
    left: `${rect.left}px`,
    zIndex: 2147483647,
  };

  const handleAction = async (prompt: string, type: 'fix' | 'improve' | 'custom' | 'summarize' = 'improve') => {
    setLoading(true);
    try {
      let improved = '';
      if (type === 'fix') {
         improved = await geminiService.improveText(selectedText, "Fix all grammar, spelling, and punctuation errors. Do not change the style.", settings.customApiKey);
      } else if (type === 'summarize') {
         improved = await geminiService.summarizeText(selectedText, settings.customApiKey);
      } else if (type === 'custom') {
         improved = await geminiService.customPrompt(selectedText, prompt, settings.customApiKey);
      } else {
         improved = await geminiService.improveText(selectedText, prompt, settings.customApiKey);
      }
      
      setResult(improved);
    } catch (e) {
      console.error(e);
      setResult("Error processing text.");
    } finally {
      setLoading(false);
      setMode('main'); // Reset mode but show result
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customPrompt.trim()) {
        handleAction(customPrompt, 'custom');
    }
  };

  const handleReplace = () => {
    if (!result) return;
    try {
      const success = document.execCommand('insertText', false, result);
      if (!success) {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(result));
        }
      }
      onClose();
    } catch (e) {
      navigator.clipboard.writeText(result);
      alert("Could not replace automatically. Copied to clipboard.");
    }
  };

  // Result View
  if (result) {
    return (
        <div style={style} className="animate-in fade-in slide-in-from-bottom-2 duration-200 font-sans">
            <div className="bg-slate-900 text-white rounded-xl shadow-2xl p-1.5 flex items-center space-x-1 border border-slate-700/50 backdrop-blur-sm ring-1 ring-white/10 max-w-md">
                <div className="px-3 py-1.5 text-sm font-medium border-r border-slate-700 overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px]" title={result}>
                    {result}
                </div>
                <button onClick={handleReplace} className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-green-400 hover:text-white hover:bg-green-900/50 transition-colors rounded">
                    <Replace size={12} /><span>Replace</span>
                </button>
                <button onClick={() => { navigator.clipboard.writeText(result); onClose(); }} className="p-2 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors" title="Copy">
                    <Copy size={14} />
                </button>
                <button onClick={() => setResult(null)} className="p-2 hover:bg-slate-800 text-slate-400 border-l border-slate-700 rounded-r-lg">
                    <X size={14} />
                </button>
            </div>
             <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900 mx-auto mt-[-1px]" />
        </div>
    );
  }

  // Loading View
  if (loading) {
     return (
        <div style={style} className="animate-in fade-in slide-in-from-bottom-2 duration-200 font-sans">
             <div className="bg-slate-900 text-white rounded-xl shadow-2xl px-4 py-2 flex items-center gap-2 text-xs font-medium border border-slate-700/50">
                <Loader2 className="animate-spin text-brand-400" size={14} />
                <span>PrivatePen is writing...</span>
            </div>
        </div>
     );
  }

  // Main Toolbar View
  return (
    <div style={style} className="animate-in fade-in slide-in-from-bottom-2 duration-200 font-sans z-[999999]">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl p-1.5 flex items-center space-x-1 border border-slate-700/50 backdrop-blur-sm ring-1 ring-white/10">
        
        {mode === 'main' && (
            <>
                <ToolBtn onClick={() => handleAction("Fix grammar", 'fix')} icon={<Check size={14} className="text-green-400"/>} label="Fix" />
                <ToolBtn onClick={() => setMode('styles')} icon={<Wand2 size={14} className="text-purple-400"/>} label="Rewrite" />
                <ToolBtn onClick={() => handleAction("Summarize this text", 'summarize')} icon={<Sparkles size={14} className="text-amber-400"/>} label="Summary" />
                <div className="w-px h-4 bg-slate-700 mx-1" />
                <ToolBtn onClick={() => setMode('custom')} icon={<MessageSquare size={14} />} label="Ask AI" />
                <button onClick={onClose} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors ml-1">
                    <X size={14} />
                </button>
            </>
        )}

        {mode === 'styles' && (
            <div className="flex items-center space-x-1 animate-in slide-in-from-right-2 duration-200">
                <button onClick={() => setMode('main')} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"><ChevronLeft size={14}/></button>
                <div className="w-px h-4 bg-slate-700 mx-1" />
                {REWRITE_STYLES.slice(0, 3).map(style => (
                    <ToolBtn key={style.id} onClick={() => handleAction(style.prompt)} icon={null} label={style.label} />
                ))}
                <ToolBtn onClick={() => handleAction(REWRITE_STYLES[3].prompt)} icon={null} label="More..." />
            </div>
        )}

        {mode === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="flex items-center space-x-2 animate-in slide-in-from-right-2 duration-200 px-1">
                <button type="button" onClick={() => setMode('main')} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"><ChevronLeft size={14}/></button>
                <input 
                    ref={inputRef}
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. Make it sound like a pirate"
                    className="bg-transparent border-none outline-none text-xs text-white placeholder-slate-500 w-48 focus:ring-0"
                    autoFocus
                />
                <button type="submit" disabled={!customPrompt.trim()} className="p-1.5 bg-brand-600 hover:bg-brand-500 rounded-lg text-white disabled:opacity-50">
                    <ArrowRight size={14} />
                </button>
            </form>
        )}

      </div>
      <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900 mx-auto mt-[-1px]" />
    </div>
  );
};

interface ToolBtnProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const ToolBtn: React.FC<ToolBtnProps> = ({ onClick, icon, label }) => (
    <button 
        onClick={onClick}
        className="flex items-center space-x-1.5 px-3 py-1.5 hover:bg-slate-700 rounded-lg transition-colors text-xs font-medium group whitespace-nowrap"
    >
        {icon && <span>{icon}</span>}
        <span>{label}</span>
    </button>
);
