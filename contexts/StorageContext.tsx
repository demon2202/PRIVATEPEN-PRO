import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import { HistoryItem, Template } from '../types';
import { storageService } from '../services/storageService';

interface StorageContextType {
  history: HistoryItem[];
  customTemplates: Template[];
  addToHistory: (item: HistoryItem) => Promise<void>;
  clearHistory: () => Promise<void>;
  refreshHistory: () => Promise<void>;
  addTemplate: (template: Template) => Promise<void>;
  removeTemplate: (id: string) => Promise<void>;
  updateTemplate: (template: Template) => Promise<void>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export function StorageProvider({ children }: PropsWithChildren<{}>) {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);

  const refreshData = async () => {
    const hItems = await storageService.getHistory();
    const tItems = await storageService.getCustomTemplates();
    setHistory(hItems);
    setCustomTemplates(tItems);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addToHistory = async (item: HistoryItem) => {
    await storageService.addToHistory(item);
    await refreshData();
  };

  const clearHistory = async () => {
    await storageService.clearHistory();
    setHistory([]);
  };

  const addTemplate = async (template: Template) => {
    const newTemplates = [...customTemplates, template];
    setCustomTemplates(newTemplates);
    await storageService.saveCustomTemplates(newTemplates);
  };

  const removeTemplate = async (id: string) => {
    const newTemplates = customTemplates.filter(t => t.id !== id);
    setCustomTemplates(newTemplates);
    await storageService.saveCustomTemplates(newTemplates);
  };

  const updateTemplate = async (template: Template) => {
    const newTemplates = customTemplates.map(t => (t.id === template.id ? template : t));
    setCustomTemplates(newTemplates);
    await storageService.saveCustomTemplates(newTemplates);
  };

  return (
    <StorageContext.Provider value={{ 
      history, 
      customTemplates, 
      addToHistory, 
      clearHistory, 
      refreshHistory: refreshData,
      addTemplate,
      removeTemplate,
      updateTemplate
    }}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (!context) throw new Error("useStorage must be used within StorageProvider");
  return context;
}