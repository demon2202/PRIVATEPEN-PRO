import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { PenTool, CheckCircle, BarChart2, FileText, Settings as SettingsIcon } from 'lucide-react';
import { Settings } from './Settings';

declare const chrome: any;

interface PopupProps {
  onOpenEditor?: () => void;
}

export const Popup = ({ onOpenEditor }: PopupProps) => {
  const [view, setView] = useState<'menu' | 'settings'>('menu');
  const { settings, updateSettings } = useSettings();

  const toggleFeature = (key: 'checkGrammar' | 'checkTone') => {
    updateSettings({ [key]: !settings[key] });
  };

  const openSidePanel = () => {
    if (onOpenEditor) {
      onOpenEditor();
    }
    
    if (typeof chrome !== 'undefined' && chrome.sidePanel) {
      // Logic for actual extension environment
       console.log("Opening side panel...");
       // In strict extension context, this might require window ID handling, 
       // but for this UI harness, the prop callback handles the view switch.
    }
  };

  if (view === 'settings') {
    return (
      <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center space-x-2 bg-white dark:bg-slate-900">
          <button onClick={() => setView('menu')} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
            ← Back
          </button>
          <span className="font-bold text-slate-900 dark:text-white">Settings</span>
        </div>
        <div className="flex-1 overflow-auto">
          <Settings />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="bg-brand-600 text-white p-6 pb-12 rounded-b-[2.5rem] shadow-lg">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <PenTool className="w-6 h-6" />
            <span className="font-bold text-lg tracking-wide">PRIVATEPEN</span>
          </div>
          <button onClick={() => setView('settings')} className="text-brand-100 hover:text-white transition-colors">
            <SettingsIcon size={20} />
          </button>
        </div>
        <p className="text-brand-100 text-sm">Your AI Writing Assistant is active.</p>
      </div>

      <div className="-mt-8 px-6 space-y-4">
        {/* Quick Toggles */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md space-y-3 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${settings.checkGrammar ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                <CheckCircle size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-slate-800 dark:text-white">Auto Grammar</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Real-time checking</span>
              </div>
            </div>
            <Switch checked={settings.checkGrammar} onChange={() => toggleFeature('checkGrammar')} />
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-700" />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${settings.checkTone ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
                <BarChart2 size={20} />
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-slate-800 dark:text-white">Tone Analysis</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">Style detection</span>
              </div>
            </div>
            <Switch checked={settings.checkTone} onChange={() => toggleFeature('checkTone')} />
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={openSidePanel}
          className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 p-4 rounded-xl shadow-sm flex items-center justify-between group transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-slate-700 text-brand-600 dark:text-brand-400 group-hover:bg-brand-600 group-hover:text-white transition-colors">
              <FileText size={20} />
            </div>
            <div className="text-left">
              <span className="block font-medium text-slate-800 dark:text-white">Open Editor</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Access full writing suite</span>
            </div>
          </div>
          <span className="text-slate-400 dark:text-slate-500">→</span>
        </button>

        <div className="text-center text-xs text-slate-400 dark:text-slate-600 mt-8">
          Version 1.1.0 • Login & Dark Mode Enabled
        </div>
      </div>
    </div>
  );
};

const Switch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`w-11 h-6 rounded-full transition-colors relative ${
      checked ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-600'
    }`}
  >
    <span
      className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);