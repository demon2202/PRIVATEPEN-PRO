
export interface Settings {
  checkGrammar: boolean;
  checkTone: boolean;
  theme: 'light' | 'dark';
  language: string;
  customApiKey?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  original: string;
  improved: string;
  type: 'grammar' | 'tone' | 'summary' | 'expand' | 'rewrite' | 'continue';
}

export interface ToneAnalysis {
  formal: number;
  casual: number;
  friendly: number;
  professional: number;
  confidence: number;
  dominant: string;
}

export interface Suggestion {
  id: string;
  type: 'grammar' | 'style' | 'tone';
  original: string;
  suggestion: string;
  explanation: string;
  index: number; // position in text
}

export interface Template {
  id: string;
  name: string;
  content: string;
  isCustom?: boolean;
}

export enum ViewState {
  EDITOR = 'EDITOR',
  HISTORY = 'HISTORY',
  SETTINGS = 'SETTINGS',
  TEMPLATES = 'TEMPLATES'
}
