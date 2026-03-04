
import React, { useState, useEffect } from 'react';
import { SidePanel } from './components/SidePanel';
import { Popup } from './components/Popup';
import { ContentScriptDemo } from './components/ContentScriptDemo';
import { StorageProvider } from './contexts/StorageContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Layout, AppWindow, FileText, Loader2, Key, Save, Check } from 'lucide-react';

// Icons wrapper
const Icons = {
  Popup: Layout,
  SidePanel: AppWindow,
  Content: FileText
};

// Internal component to access contexts
const AppContent = () => {
  const [view, setView] = useState<'popup' | 'sidepanel' | 'content'>('sidepanel');
  const [sidePanelTab, setSidePanelTab] = useState<'editor' | 'settings'>('editor');
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { settings, updateSettings, loading: settingsLoading } = useSettings();

  // Apply dark mode theme class to a wrapper or document
  useEffect(() => {
    const root = document.getElementById('root');
    const body = document.body;
    const html = document.documentElement;
    
    if (settings.theme === 'dark') {
      root?.classList.add('dark');
      body.classList.add('dark');
      html.classList.add('dark');
    } else {
      root?.classList.remove('dark');
      body.classList.remove('dark');
      html.classList.remove('dark');
    }
  }, [settings.theme]);

  if (authLoading || settingsLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <div className={`flex flex-col h-full bg-slate-100 dark:bg-slate-900 ${settings.theme === 'dark' ? 'dark' : ''} relative`}>
      
      {/* Dev Toolbar */}
      <div className="bg-slate-900 dark:bg-black text-white p-2 flex items-center justify-between shadow-md z-50 shrink-0 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-brand-500 tracking-wider px-2">PRIVATEPEN-PRO</span>
          <span className="text-xs text-slate-400 border-l border-slate-700 pl-2">Dev Preview Mode</span>
        </div>
        
        <div className="flex items-center space-x-4">
           <span className="text-xs text-slate-400 hidden md:inline">Logged in as {user?.name}</span>
           <div className="flex bg-slate-800 rounded-lg p-1 space-x-1">
            <button
              onClick={() => setView('popup')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                view === 'popup' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Icons.Popup size={16} />
              <span>Popup</span>
            </button>
            <button
              onClick={() => {
                setView('sidepanel');
                setSidePanelTab('editor'); // Reset to editor when clicking tab
              }}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                view === 'sidepanel' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Icons.SidePanel size={16} />
              <span>Side Panel</span>
            </button>
            <button
              onClick={() => setView('content')}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-colors ${
                view === 'content' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Icons.Content size={16} />
              <span>Content Script</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main View Container */}
      <div className={`flex-1 overflow-hidden relative flex justify-center bg-slate-200/50 dark:bg-slate-950`}>
        {view === 'popup' && (
          <div className="w-[400px] h-[550px] bg-white dark:bg-slate-900 shadow-2xl my-8 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <Popup onOpenEditor={() => setView('sidepanel')} />
          </div>
        )}
        
        {view === 'sidepanel' && (
          <div className="w-full h-full bg-white dark:bg-slate-900 flex flex-col md:max-w-4xl md:border-x md:border-slate-200 dark:md:border-slate-800 md:shadow-xl">
            <SidePanel initialTab={sidePanelTab} />
          </div>
        )}

        {view === 'content' && (
          <div className="w-full h-full overflow-y-auto">
            <ContentScriptDemo />
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <StorageProvider>
      <SettingsProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </SettingsProvider>
    </StorageProvider>
  );
}
