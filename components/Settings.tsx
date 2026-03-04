
import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useStorage } from '../contexts/StorageContext';
import { Trash2, Sun, Moon, Globe } from 'lucide-react';

export const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const { clearHistory } = useStorage();

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 h-full overflow-y-auto">
      
      {/* Preferences */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Preferences</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">Theme</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Interface appearance</p>
            </div>
            
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => updateSettings({ theme: 'light' })}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        settings.theme === 'light' 
                        ? 'bg-white text-brand-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                    <Sun size={16} />
                    <span>Light</span>
                </button>
                <button
                    onClick={() => updateSettings({ theme: 'dark' })}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        settings.theme === 'dark' 
                        ? 'bg-slate-700 text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                    <Moon size={16} />
                    <span>Dark</span>
                </button>
            </div>
          </div>
          
          <div className="h-px bg-slate-100 dark:bg-slate-700" />
          
          <div className="space-y-3">
             <div>
              <h3 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                <Globe size={16} />
                <span>Target Language</span>
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Select or type any language for AI responses</p>
            </div>
            
            <div className="relative">
                <input 
                    list="languages"
                    value={settings.language}
                    onChange={(e) => updateSettings({ language: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                    placeholder="e.g. English, Spanish, Japanese..."
                />
                <datalist id="languages">
                    <option value="English (US)" />
                    <option value="English (UK)" />
                    <option value="Spanish" />
                    <option value="French" />
                    <option value="German" />
                    <option value="Italian" />
                    <option value="Portuguese" />
                    <option value="Chinese (Simplified)" />
                    <option value="Japanese" />
                    <option value="Korean" />
                    <option value="Russian" />
                    <option value="Hindi" />
                    <option value="Arabic" />
                    <option value="Turkish" />
                    <option value="Dutch" />
                </datalist>
            </div>
          </div>
        </div>
      </section>

      {/* Data Management */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30 transition-colors">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 text-red-600 dark:text-red-400">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white">Clear History</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Remove all saved analyses and drafts locally</p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Are you sure? This cannot be undone.')) {
                clearHistory();
              }
            }}
            className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center"
          >
            <Trash2 size={16} className="mr-2" />
            Clear Data
          </button>
        </div>
      </section>
    </div>
  );
};
