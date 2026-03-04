
import React, { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useStorage } from '../contexts/StorageContext';
import { useAuth } from '../contexts/AuthContext';
import { Editor } from './Editor';
import { Settings as SettingsComponent } from './Settings';
import { History } from './History';
import { Templates } from './Templates';
import { FileEdit, History as HistoryIcon, Settings as SettingsIcon, LayoutTemplate, PenTool, LogOut } from 'lucide-react';

interface SidePanelProps {
  initialTab?: 'editor' | 'history' | 'templates' | 'settings';
}

export const SidePanel = ({ initialTab = 'editor' }: SidePanelProps) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'history' | 'templates' | 'settings'>(initialTab);
  const [templateContent, setTemplateContent] = useState<string>('');
  const { logout } = useAuth();

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const handleTemplateSelect = (content: string) => {
    setTemplateContent(content);
    setActiveTab('editor');
  };

  const handleHistoryRestore = (content: string) => {
    setTemplateContent(content);
    setActiveTab('editor');
  };

  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400">
          <PenTool className="w-6 h-6" />
          <h1 className="font-bold text-lg hidden sm:inline">PrivatePen Pro</h1>
        </div>
        <div className="flex space-x-1 items-center">
          <NavButton 
            active={activeTab === 'editor'} 
            onClick={() => setActiveTab('editor')} 
            icon={<FileEdit size={18} />} 
            label="Editor" 
          />
          <NavButton 
            active={activeTab === 'templates'} 
            onClick={() => setActiveTab('templates')} 
            icon={<LayoutTemplate size={18} />} 
            label="Templates" 
          />
          <NavButton 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
            icon={<HistoryIcon size={18} />} 
            label="History" 
          />
          <NavButton 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
            icon={<SettingsIcon size={18} />} 
            label="Settings" 
          />
          
          <div className="w-px h-5 bg-slate-300 dark:bg-slate-700 mx-1" />
          
           <button
            onClick={logout}
            title="Sign Out"
            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'editor' && (
          <Editor initialContent={templateContent} onClearTemplate={() => setTemplateContent('')} />
        )}
        {activeTab === 'history' && <History onRestore={handleHistoryRestore} />}
        {activeTab === 'templates' && <Templates onSelect={handleTemplateSelect} />}
        {activeTab === 'settings' && <SettingsComponent />}
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button
    onClick={onClick}
    title={label}
    className={`p-2 rounded-lg transition-colors flex items-center space-x-2 ${
      active 
        ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200'
    }`}
  >
    {icon}
    <span className="hidden lg:inline text-sm font-medium">{label}</span>
  </button>
);
