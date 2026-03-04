import { Settings, HistoryItem, Template } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

// Defines the shape of our storage
interface StorageSchema {
  settings: Settings;
  history: HistoryItem[];
  customTemplates: Template[];
}

declare const chrome: any;

const isExtension = typeof chrome !== 'undefined' && !!chrome.storage;

export const storageService = {
  async getSettings(): Promise<Settings> {
    if (isExtension) {
      const result = await chrome.storage.sync.get(['settings']);
      return result.settings || DEFAULT_SETTINGS;
    }
    const stored = localStorage.getItem('pp_settings');
    return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
  },

  async saveSettings(settings: Settings): Promise<void> {
    if (isExtension) {
      await chrome.storage.sync.set({ settings });
    } else {
      localStorage.setItem('pp_settings', JSON.stringify(settings));
    }
  },

  async getHistory(): Promise<HistoryItem[]> {
    if (isExtension) {
      const result = await chrome.storage.local.get(['history']);
      return result.history || [];
    }
    const stored = localStorage.getItem('pp_history');
    return stored ? JSON.parse(stored) : [];
  },

  async addToHistory(item: HistoryItem): Promise<void> {
    const history = await this.getHistory();
    const newHistory = [item, ...history].slice(0, 50); // Keep last 50
    
    if (isExtension) {
      await chrome.storage.local.set({ history: newHistory });
    } else {
      localStorage.setItem('pp_history', JSON.stringify(newHistory));
    }
  },

  async clearHistory(): Promise<void> {
    if (isExtension) {
      await chrome.storage.local.set({ history: [] });
    } else {
      localStorage.removeItem('pp_history');
    }
  },

  async getCustomTemplates(): Promise<Template[]> {
    if (isExtension) {
      const result = await chrome.storage.sync.get(['customTemplates']);
      return result.customTemplates || [];
    }
    const stored = localStorage.getItem('pp_templates');
    return stored ? JSON.parse(stored) : [];
  },

  async saveCustomTemplates(templates: Template[]): Promise<void> {
    if (isExtension) {
      await chrome.storage.sync.set({ customTemplates: templates });
    } else {
      localStorage.setItem('pp_templates', JSON.stringify(templates));
    }
  }
};