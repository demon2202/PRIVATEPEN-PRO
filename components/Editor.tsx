
import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { useSettings } from '../contexts/SettingsContext';
import { useStorage } from '../contexts/StorageContext';
import { Suggestion, ToneAnalysis } from '../types';
import { REWRITE_STYLES } from '../constants';
import { Loader2, Wand2, Check, Copy, BarChart, Download, Mic, MicOff, BookOpen, PenLine, Edit3, X, MessageSquare, ArrowRight, HelpCircle, Minimize2, Maximize2, Undo, Redo, ChevronDown } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

// --- Sub-components ---

const CustomTooltip = ({ children, content }: React.PropsWithChildren<{ content: string }>) => {
    return (
        <div className="group relative flex items-center">
            {children}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center">
                {content}
                <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
            </div>
        </div>
    )
}

const SegmentedBar = ({ value, color }: { value: number, color: string }) => {
    const segments = 10;
    const filled = Math.round((value / 100) * segments);
    return (
        <div className="flex gap-1 h-2.5 w-full">
            {[...Array(segments)].map((_, i) => (
                <div 
                    key={i} 
                    className={`flex-1 rounded-sm transition-all duration-300 ${i < filled ? color : 'bg-slate-200 dark:bg-slate-700'}`} 
                />
            ))}
        </div>
    )
}

interface ActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  loading?: boolean;
  disabled?: boolean;
  active?: boolean;
  variant?: 'primary' | 'default';
}

const ActionButton = ({ onClick, icon, label, loading, disabled, active, variant = 'default' }: ActionButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
      active
        ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-700'
        : variant === 'primary'
            ? 'bg-brand-600 text-white border-transparent hover:bg-brand-700 shadow-sm'
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {loading ? <Loader2 className="animate-spin" size={16} /> : icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

interface IconButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  title?: string;
  active?: boolean;
  disabled?: boolean;
  color?: 'default' | 'red';
}

const IconButton = ({ onClick, icon, title, active, disabled, color = 'default' }: IconButtonProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition-colors border border-transparent ${
      active
        ? color === 'red' 
            ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 border-red-200'
            : 'bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 border-brand-200'
        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {icon}
  </button>
);

// --- Dropdown Component ---

interface ToolbarDropdownProps {
    label: string;
    icon: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    disabled?: boolean;
    loading?: boolean;
}

const ToolbarDropdown: React.FC<ToolbarDropdownProps> = ({ label, icon, isOpen, onToggle, children, disabled, loading }) => (
    <div className="relative">
        <button
            onClick={onToggle}
            disabled={disabled || loading}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                isOpen
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-500'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {loading ? <Loader2 className="animate-spin" size={16} /> : icon}
            <span className="hidden sm:inline">{label}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}/>
        </button>

        <div className={`absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 z-50 flex flex-col gap-0.5 origin-top-left transition-all duration-200 ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
            {children}
        </div>
    </div>
);

interface DropdownItemProps {
    onClick: () => void;
    icon?: React.ReactNode;
    label: string;
    description?: string;
    shortcut?: string;
    active?: boolean;
}

const DropdownItem: React.FC<DropdownItemProps> = ({ onClick, icon, label, description, shortcut, active }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-2 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${
            active 
                ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' 
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
    >
        <div className="flex items-center gap-2.5">
            {icon && <span className={`text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 ${active ? 'text-brand-500' : ''}`}>{icon}</span>}
            <div>
                <div className="font-medium leading-none">{label}</div>
                {description && <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{description}</div>}
            </div>
        </div>
        {shortcut && <span className="text-[10px] text-slate-400 border border-slate-200 dark:border-slate-600 rounded px-1">{shortcut}</span>}
    </button>
);

const DropdownLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 first:mt-0">
        {children}
    </div>
);

const Separator: React.FC = () => <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />;


// --- Main Component ---

interface EditorProps {
  initialContent?: string;
  onClearTemplate?: () => void;
}

interface Notification {
  id: string;
  message: string;
  type: 'error' | 'success';
}

const TONE_CONFIG = [
  { key: 'formal', label: 'Formal', color: 'bg-blue-500', description: 'Strict adherence to rules, conventions, and standard language.' },
  { key: 'casual', label: 'Casual', color: 'bg-green-500', description: 'Relaxed, informal, and conversational style.' },
  { key: 'friendly', label: 'Friendly', color: 'bg-pink-500', description: 'Warm, approachable, and empathetic tone.' },
  { key: 'professional', label: 'Professional', color: 'bg-indigo-500', description: 'Competent, respectful, and business-oriented.' },
] as const;

export const Editor: React.FC<EditorProps> = ({ initialContent, onClearTemplate }) => {
  const [text, setText] = useState('');
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [toneData, setToneData] = useState<ToneAnalysis | null>(null);
  const [synonyms, setSynonyms] = useState<{word: string, list: string[]} | null>(null);
  
  // Dropdown states
  const [activeDropdown, setActiveDropdown] = useState<'rewrite' | 'tone' | null>(null);

  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [apiError, setApiError] = useState(false);
  
  const { settings } = useSettings();
  const { addToHistory } = useStorage();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  
  // Reading stats
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200);

  useEffect(() => {
    if (initialContent) {
      updateText(initialContent);
      onClearTemplate?.();
    }
  }, [initialContent, onClearTemplate]);

  useEffect(() => {
    if (apiError) setApiError(false);
  }, [text]);

  // Click outside listener for dropdowns
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
              setActiveDropdown(null);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); addNotification("Back online!", 'success'); };
    const handleOffline = () => { setIsOnline(false); addNotification("You are now offline.", 'error'); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Speech Recognition
  useEffect(() => {
    let recognition: any;
    if (isListening) {
      if ('webkitSpeechRecognition' in window) {
        // @ts-ignore
        recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
             transcript += event.results[i][0].transcript;
          }
          if (event.results[event.resultIndex].isFinal) {
             updateText(prev => prev + ' ' + transcript.trim());
          }
        };
        recognition.onerror = (event: any) => {
          console.error(event.error);
          setIsListening(false);
          addNotification("Speech recognition error: " + event.error, 'error');
        };
        recognition.start();
      } else {
        addNotification("Speech not supported.", 'error');
        setIsListening(false);
      }
    }
    return () => {
      if (recognition) recognition.stop();
    };
  }, [isListening]);

  // Undo / Redo Logic
  const updateText = (newTextOrFn: string | ((prev: string) => string), recordHistory = true) => {
      let nextText = '';
      if (typeof newTextOrFn === 'function') {
          nextText = newTextOrFn(text);
      } else {
          nextText = newTextOrFn;
      }
      
      if (nextText === text) return;

      setText(nextText);

      if (recordHistory) {
          const newHistory = history.slice(0, historyIndex + 1);
          newHistory.push(nextText);
          setHistory(newHistory);
          setHistoryIndex(newHistory.length - 1);
      }
  };

  const handleUndo = () => {
      if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setText(history[newIndex]);
      }
  };

  const handleRedo = () => {
      if (historyIndex < history.length - 1) {
          const newIndex = historyIndex + 1;
          setHistoryIndex(newIndex);
          setText(history[newIndex]);
      }
  };

  const addNotification = (message: string, type: 'error' | 'success') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => dismissNotification(id), 5000);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAIAction = async (action: 'grammar' | 'tone' | 'improve' | 'continue' | 'summarize' | 'expand' | 'shorten', promptOverride?: string) => {
    if (!isOnline) {
      addNotification("Offline.", 'error');
      return;
    }
    if (!text.trim()) {
        addNotification("Enter text first.", 'error');
        return;
    }
    
    setIsProcessing(true);
    setApiError(false);
    setSynonyms(null);
    setActiveDropdown(null); // Close any open dropdowns

    const lang = settings.language;
    const apiKey = settings.customApiKey;

    // Check for selection
    const start = textareaRef.current?.selectionStart ?? 0;
    const end = textareaRef.current?.selectionEnd ?? 0;
    const hasSelection = start !== end;
    const selectedText = text.substring(start, end);
    // Actions that operate on selection if available
    const supportsSelection = ['improve', 'summarize', 'expand', 'shorten'].includes(action);
    const textToProcess = hasSelection && supportsSelection ? selectedText : text;

    try {
      if (action === 'grammar') {
        const results = await geminiService.checkGrammar(text, lang, apiKey);
        const sortedResults = results.sort((a, b) => (a.index || 0) - (b.index || 0));
        setSuggestions(sortedResults);
        if (sortedResults.length === 0) {
            addNotification("No grammar issues found!", 'success');
        } else {
            addNotification(`Found ${sortedResults.length} issues.`, 'success');
        }
      } else if (action === 'tone') {
        // Tone Analysis always runs on full text for context, or selected if large enough
        const results = await geminiService.analyzeTone(textToProcess, lang, apiKey);
        setToneData(results);
      } else if (action === 'improve') {
        const instruction = promptOverride || "Improve clarity and flow";
        const improved = await geminiService.improveText(textToProcess, instruction, apiKey, undefined, lang);
        
        if (hasSelection) {
            updateText(text.substring(0, start) + improved + text.substring(end));
            addNotification("Selection rewritten.", 'success');
        } else {
            updateText(improved);
            saveHistory(text, improved, 'rewrite');
        }
        
      } else if (action === 'continue') {
        const continued = await geminiService.continueWriting(text, apiKey, lang);
        const newText = text + (text.endsWith(' ') ? '' : ' ') + continued;
        updateText(newText);
        saveHistory(text, newText, 'continue');
      } else if (action === 'summarize') {
        const summary = await geminiService.summarizeText(textToProcess, apiKey, lang);
        if (hasSelection) {
            updateText(text.substring(0, start) + summary + text.substring(end));
             addNotification("Selection summarized.", 'success');
        } else {
            updateText(summary);
            saveHistory(text, summary, 'summary');
        }
      } else if (action === 'expand') {
        const expanded = await geminiService.modifyLength(textToProcess, 'expand', apiKey, lang);
        if (hasSelection) {
             updateText(text.substring(0, start) + expanded + text.substring(end));
             addNotification("Selection expanded.", 'success');
        } else {
             updateText(expanded);
             saveHistory(text, expanded, 'expand');
        }
      } else if (action === 'shorten') {
        const shortened = await geminiService.modifyLength(textToProcess, 'shorten', apiKey, lang);
        if (hasSelection) {
            updateText(text.substring(0, start) + shortened + text.substring(end));
            addNotification("Selection shortened.", 'success');
        } else {
            updateText(shortened);
            saveHistory(text, shortened, 'expand'); // Reusing type for history
        }
      }
    } catch (error: any) {
      console.error("AI Error:", error);
      setApiError(true);
      addNotification("AI Service unavailable. Please check your API Key.", 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    
    setIsProcessing(true);
    setShowCustomPrompt(false);
    try {
        const result = await geminiService.customPrompt(text, customPrompt, settings.customApiKey);
        updateText(result);
        saveHistory(text, result, 'rewrite');
        setCustomPrompt('');
    } catch (e) {
        addNotification("Failed to process command.", 'error');
    } finally {
        setIsProcessing(false);
    }
  };

  const handleFindSynonyms = async () => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    
    if (start === end) {
      addNotification("Select a word first.", 'error');
      return;
    }

    const selectedWord = text.substring(start, end).trim();
    const context = text.substring(Math.max(0, start - 50), Math.min(text.length, end + 50));
    
    setIsProcessing(true);
    try {
      const results = await geminiService.getSynonyms(selectedWord, context, settings.customApiKey);
      setSynonyms({ word: selectedWord, list: results });
      setSuggestions([]);
    } catch (e) {
      addNotification("Synonyms failed.", 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'privatepen-export.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addNotification("Exported to text file.", 'success');
  };

  const saveHistory = async (original: string, improved: string, type: any) => {
    await addToHistory({ id: Date.now().toString(), timestamp: Date.now(), original, improved, type });
  }

  const applySuggestion = (suggestion: Suggestion) => {
    const currentSegment = text.substring(suggestion.index, suggestion.index + suggestion.original.length);
    
    if (currentSegment === suggestion.original) {
        const before = text.substring(0, suggestion.index);
        const after = text.substring(suggestion.index + suggestion.original.length);
        const newText = before + suggestion.suggestion + after;
        updateText(newText);
        
        const diff = suggestion.suggestion.length - suggestion.original.length;
        setSuggestions(prev => prev
            .filter(s => s.id !== suggestion.id)
            .map(s => s.index > suggestion.index ? { ...s, index: s.index + diff } : s)
        );
        addNotification("Applied fix.", 'success');
    } else {
        addNotification("Could not apply fix - text changed.", 'error');
        setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    }
  };

  const renderHighlightedText = () => {
    if (suggestions.length === 0) return text;
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;
    const sortedSuggestions = [...suggestions].sort((a, b) => a.index - b.index);

    sortedSuggestions.forEach((s) => {
      if (s.index > lastIndex) {
         elements.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, s.index)}</span>);
      }
      elements.push(
        <span key={s.id} onClick={() => applySuggestion(s)} className="relative inline-block cursor-pointer group rounded bg-red-100 dark:bg-red-900/40 border-b-2 border-red-500 hover:bg-red-200 dark:hover:bg-red-900/60 transition-colors mx-0.5">
          {text.substring(s.index, s.index + s.original.length)}
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-xs rounded-xl p-3 shadow-xl z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
             <div className="font-bold mb-1 text-green-400 flex justify-between">
                <span>Fix: {s.suggestion}</span>
                <span className="text-[10px] text-slate-400 font-normal uppercase border border-slate-600 px-1 rounded">Click to apply</span>
             </div>
             <div className="text-slate-300 leading-snug">{s.explanation}</div>
             <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45"></div>
          </div>
        </span>
      );
      lastIndex = s.index + s.original.length;
    });

    if (lastIndex < text.length) {
        elements.push(<span key={`text-end`}>{text.substring(lastIndex)}</span>);
    }
    return elements;
  };

  const toggleDropdown = (name: 'rewrite' | 'tone') => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  const chartData = toneData ? [
    { subject: 'Formal', A: toneData.formal, fullMark: 100 },
    { subject: 'Casual', A: toneData.casual, fullMark: 100 },
    { subject: 'Friendly', A: toneData.friendly, fullMark: 100 },
    { subject: 'Professional', A: toneData.professional, fullMark: 100 },
  ] : [];

  return (
    <div className="flex h-full flex-col md:flex-row bg-slate-50 dark:bg-slate-900 relative">
      
      {/* Notifications */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
        {notifications.map(n => (
            <div key={n.id} className={`flex items-center justify-between p-3 rounded-xl shadow-lg text-sm font-medium backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 pointer-events-auto border border-white/10 ${n.type === 'error' ? 'bg-red-600/90 text-white' : 'bg-green-600/90 text-white'}`}>
                <span>{n.message}</span>
                <button onClick={() => dismissNotification(n.id)} className="hover:bg-white/20 p-1 rounded-full transition-colors"><X size={14}/></button>
            </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col p-4 space-y-4 pt-8 md:pt-4 h-full overflow-hidden">
        
        {/* Custom Prompt Input Overlay */}
        {showCustomPrompt && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-lg z-50 px-4">
                <div className="bg-white dark:bg-slate-800 p-2 rounded-xl border border-brand-500/50 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 ring-4 ring-brand-500/10">
                    <form onSubmit={handleCustomSubmit} className="flex gap-2 items-center p-1">
                        <div className="p-2 bg-brand-100 dark:bg-brand-900/30 rounded-lg text-brand-600 dark:text-brand-400">
                            <MessageSquare size={18}/>
                        </div>
                        <input 
                            value={customPrompt}
                            onChange={e => setCustomPrompt(e.target.value)}
                            placeholder="Ask PrivatePen to rewrite, summarize, or fix..."
                            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 font-medium h-9"
                            autoFocus
                        />
                        <div className="flex items-center border-l border-slate-200 dark:border-slate-700 pl-2 gap-1">
                            <button type="button" onClick={() => setShowCustomPrompt(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"><X size={16}/></button>
                            <button type="submit" className="p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors shadow-sm"><ArrowRight size={16}/></button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Toolbar */}
        <div ref={toolbarRef} className="flex flex-wrap gap-2 items-center bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-300 z-40">
          <div className="flex items-center space-x-1 mr-2 border-r border-slate-200 dark:border-slate-700 pr-2">
            <IconButton onClick={handleUndo} icon={<Undo size={18} />} title="Undo" disabled={historyIndex <= 0 || isProcessing} />
            <IconButton onClick={handleRedo} icon={<Redo size={18} />} title="Redo" disabled={historyIndex >= history.length - 1 || isProcessing} />
          </div>

          <ActionButton 
            onClick={() => handleAIAction('grammar')} 
            icon={<Check size={16} />} 
            label="Fix" 
            variant="primary" 
            loading={isProcessing && !showCustomPrompt} 
            disabled={!isOnline} 
          />
          
          <ToolbarDropdown 
            label="Rewrite" 
            icon={<Wand2 size={16} />} 
            isOpen={activeDropdown === 'rewrite'} 
            onToggle={() => toggleDropdown('rewrite')}
            loading={isProcessing}
            disabled={!isOnline}
          >
             <DropdownLabel>Styles</DropdownLabel>
             {REWRITE_STYLES.map(style => (
                 <DropdownItem 
                    key={style.id}
                    onClick={() => handleAIAction('improve', style.prompt)}
                    label={style.label}
                 />
             ))}
             <Separator />
             <DropdownItem 
                onClick={() => { setShowCustomPrompt(true); setActiveDropdown(null); }}
                icon={<MessageSquare size={14}/>}
                label="Custom..."
                active
             />
          </ToolbarDropdown>

          <ToolbarDropdown 
            label="Tone" 
            icon={<BarChart size={16} />} 
            isOpen={activeDropdown === 'tone'} 
            onToggle={() => toggleDropdown('tone')}
            loading={isProcessing}
            disabled={!isOnline}
          >
             <DropdownItem 
                onClick={() => handleAIAction('tone')}
                icon={<BarChart size={14}/>}
                label="Analyze Tone"
                description="View comprehensive analysis"
             />
             <Separator />
             <DropdownLabel>Make it...</DropdownLabel>
             <DropdownItem onClick={() => handleAIAction('improve', 'Make this text sound more confident and authoritative.')} label="Confident" />
             <DropdownItem onClick={() => handleAIAction('improve', 'Make this text sound more friendly and approachable.')} label="Friendly" />
             <DropdownItem onClick={() => handleAIAction('improve', 'Make this text sound more diplomatic and polite.')} label="Diplomatic" />
          </ToolbarDropdown>

          {/* Separator between Editing and Generation Tools */}
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block" />

          {/* Direct Actions */}
          <ActionButton onClick={() => handleAIAction('expand')} icon={<Maximize2 size={16} />} label="Expand" loading={isProcessing} disabled={!isOnline} />
          <ActionButton onClick={() => handleAIAction('summarize')} icon={<Minimize2 size={16} />} label="Summarize" loading={isProcessing} disabled={!isOnline} />
          <ActionButton onClick={() => handleAIAction('continue')} icon={<PenLine size={16} />} label="Continue" loading={isProcessing} disabled={!isOnline} />
          
          <div className="flex-1" />
          
          <div className="flex items-center space-x-1">
             <IconButton onClick={() => setIsListening(!isListening)} active={isListening} disabled={!isOnline} icon={isListening ? <MicOff size={18} /> : <Mic size={18} />} color={isListening ? 'red' : 'default'} />
             <IconButton onClick={handleFindSynonyms} icon={<BookOpen size={18} />} title="Find Synonyms" />
             <IconButton onClick={handleExport} icon={<Download size={18} />} title="Export" />
             <IconButton onClick={() => { navigator.clipboard.writeText(text); addNotification("Copied!", 'success'); }} icon={<Copy size={18} />} title="Copy All" />
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative group overflow-hidden flex flex-col">
           {isProcessing && (
             <div className="absolute inset-0 z-30 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl transition-opacity duration-300">
                <div className="bg-white dark:bg-slate-800 px-6 py-4 rounded-full shadow-2xl flex items-center space-x-3 border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200">
                    <Loader2 className="animate-spin text-brand-600" size={20} />
                    <span className="font-medium text-slate-700 dark:text-slate-200 animate-pulse">AI is working...</span>
                </div>
             </div>
           )}

           <div className={`flex-1 relative rounded-xl border transition-all duration-300 h-full overflow-hidden flex flex-col ${isProcessing ? 'border-brand-300 dark:border-brand-700/50' : 'border-slate-200 dark:border-slate-700 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/10'}`}>
                {suggestions.length > 0 ? (
                    <div className="w-full h-full relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden flex flex-col">
                         <div className="absolute top-4 right-4 z-10 animate-in fade-in slide-in-from-top-2">
                            <button onClick={() => setSuggestions([])} className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 transition-transform hover:scale-105 active:scale-95">
                                <Edit3 size={14} /><span>Resume Editing</span>
                            </button>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-200 leading-loose text-lg">
                            {renderHighlightedText()}
                        </div>
                    </div>
                ) : (
                    <textarea
                        ref={textareaRef}
                        className="w-full h-full p-6 resize-none bg-white dark:bg-slate-800 outline-none font-sans text-slate-700 dark:text-slate-200 leading-loose text-lg transition-colors placeholder:text-slate-300 dark:placeholder:text-slate-600 rounded-xl"
                        placeholder="Start writing..."
                        value={text}
                        onChange={(e) => updateText(e.target.value)}
                        disabled={isProcessing}
                    />
                )}
           </div>

           <div className="absolute bottom-4 right-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 border border-slate-200 dark:border-slate-700 shadow-sm pointer-events-none transition-opacity duration-200">
                {wordCount} words • {readingTime} min read
           </div>
        </div>
      </div>

      {/* Sidebar for Tone/Synonyms */}
      {(toneData || synonyms) && (
        <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-4 overflow-y-auto shrink-0 animate-in slide-in-from-right-4 duration-300">
          {synonyms && (
             <div className="mb-6 bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <BookOpen size={16} className="text-brand-500"/>
                      Synonyms
                  </h3>
                  <button onClick={() => setSynonyms(null)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Close</button>
                </div>
                <div className="flex flex-wrap gap-2">
                   {synonyms.list.map((syn) => (
                      <button key={syn} onClick={() => { updateText(text.replace(synonyms.word, syn)); setSynonyms(null); }} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 hover:bg-brand-50 dark:hover:bg-brand-900/30 text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg text-sm transition-all border border-slate-200 dark:border-slate-600 hover:border-brand-200 dark:hover:border-brand-700">
                         {syn}
                      </button>
                   ))}
                </div>
             </div>
          )}
          {toneData && (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <BarChart size={16} className="text-purple-500"/>
                    Tone Analysis
                </h3>
                <button onClick={() => setToneData(null)} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Clear</button>
              </div>
              
              <div className="mb-8 -ml-4">
                 <ResponsiveContainer width="100%" height={240}>
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                        <PolarGrid stroke={settings.theme === 'dark' ? '#334155' : '#e2e8f0'} />
                        <PolarAngleAxis 
                            dataKey="subject" 
                            tick={{ fill: settings.theme === 'dark' ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 600 }} 
                        />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar
                            name="Tone"
                            dataKey="A"
                            stroke="#0ea5e9"
                            fill="#0ea5e9"
                            fillOpacity={0.5}
                        />
                        <RechartsTooltip 
                             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: settings.theme === 'dark' ? '#1e293b' : '#fff', color: settings.theme === 'dark' ? '#fff' : '#000' }}
                             itemStyle={{ color: '#0ea5e9' }}
                        />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {TONE_CONFIG.map(tone => (
                  <div key={tone.key} className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${tone.color}`}></div>
                        <div className="flex items-center gap-1.5 cursor-help">
                           <CustomTooltip content={tone.description}>
                                <div className="flex items-center gap-1">
                                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{tone.label}</span>
                                    <HelpCircle size={10} className="text-slate-400"/>
                                </div>
                           </CustomTooltip>
                        </div>
                     </div>
                     <span className="text-xs font-bold text-slate-900 dark:text-white">{(toneData as any)[tone.key]}%</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-4">
                 <div className="text-center">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Dominant</div>
                    <div className="font-bold text-brand-600 dark:text-brand-400 capitalize text-lg">{toneData.dominant}</div>
                 </div>
                 <div className="text-center border-l border-slate-100 dark:border-slate-700">
                     <div className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-semibold">Confidence</div>
                     <div className="font-bold text-slate-800 dark:text-white text-lg">{toneData.confidence}%</div>
                 </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
