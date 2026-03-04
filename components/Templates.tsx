
import React, { useState } from 'react';
import { TEMPLATES } from '../constants';
import { useStorage } from '../contexts/StorageContext';
import { FileText, Plus, Trash2, Save, X, Edit2, LayoutTemplate, Copy, ArrowRight, Sparkles, Check } from 'lucide-react';
import { Template } from '../types';

export const Templates = ({ onSelect }: { onSelect: (content: string) => void }) => {
  const { customTemplates, addTemplate, removeTemplate, updateTemplate } = useStorage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', content: '' });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: '', content: '' });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (template: Template, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(template.id);
    setFormData({ name: template.name, content: template.content });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ name: '', content: '' });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.content) return;

    if (editingId) {
      await updateTemplate({
        id: editingId,
        name: formData.name,
        content: formData.content,
        isCustom: true
      });
    } else {
      await addTemplate({
        id: Date.now().toString(),
        name: formData.name,
        content: formData.content,
        isCustom: true
      });
    }

    handleCloseForm();
  };

  const handleCopy = (content: string, id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto h-full overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <LayoutTemplate className="w-7 h-7 text-brand-500" />
                Templates Library
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Jumpstart your writing with pre-made layouts</p>
        </div>
        {!isFormOpen && (
            <button 
            onClick={handleOpenCreate}
            className="flex items-center space-x-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg font-medium active:scale-95"
            >
            <Plus size={18} />
            <span>Create Template</span>
            </button>
        )}
      </div>

      {isFormOpen && (
        <div className="mb-10 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-brand-200 dark:border-slate-600 shadow-xl animate-in slide-in-from-top-4 ring-4 ring-brand-500/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <LayoutTemplate size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    {editingId ? <Edit2 size={20} className="text-brand-500"/> : <Plus size={20} className="text-brand-500"/>}
                    {editingId ? 'Edit Template' : 'New Template'}
                </h3>
                <button onClick={handleCloseForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-100 dark:bg-slate-700 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600"><X size={18}/></button>
            </div>
            <div className="space-y-5">
                <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Template Name</label>
                <input 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                    placeholder="e.g., Weekly Report Structure"
                    autoFocus
                />
                </div>
                <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Content Layout</label>
                <textarea 
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 leading-relaxed font-mono text-sm"
                    placeholder="Dear [Name],&#10;&#10;Type your template structure here..."
                />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <button 
                    onClick={handleCloseForm}
                    className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors text-sm font-medium"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    disabled={!formData.name || !formData.content}
                    className="flex items-center space-x-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all text-sm font-medium"
                >
                    <Save size={18} />
                    <span>{editingId ? 'Update Template' : 'Save Template'}</span>
                </button>
                </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Templates Section */}
      {customTemplates.length > 0 && (
        <div className="mb-12">
           <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-5 flex items-center gap-2 px-1">
            <span>My Templates</span>
            <span className="bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-md text-[10px] font-bold">{customTemplates.length}</span>
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customTemplates.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelect(t.content)}
                className="group relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-brand-300 dark:hover:border-brand-700 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden h-60 hover:-translate-y-1"
              >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-brand-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                            <Sparkles size={20} />
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                            <button 
                                onClick={(e) => handleCopy(t.content, t.id, e)}
                                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                                title="Copy"
                            >
                                {copiedId === t.id ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                            <button 
                                onClick={(e) => handleOpenEdit(t, e)}
                                className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors"
                                title="Edit"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if(window.confirm("Delete this template?")) removeTemplate(t.id);
                                }}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 truncate text-lg group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{t.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                      {t.content}
                    </p>
                  </div>
                  <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700/50 text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>Click to use</span>
                      <ArrowRight size={14} className="-translate-x-2 group-hover:translate-x-0 transition-transform" />
                  </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-5 px-1">Standard Templates</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => onSelect(t.content)}
            className="flex flex-col text-left bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 group h-60 overflow-hidden hover:-translate-y-1 relative"
          >
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
             
             <div className="p-5 flex-1 w-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                        <FileText size={20} />
                    </div>
                    <div 
                        className="p-2 text-slate-300 group-hover:text-blue-500 transition-colors"
                        onClick={(e) => handleCopy(t.content, t.id, e)}
                    >
                         {copiedId === t.id ? <Check size={16} /> : <Copy size={16} />}
                    </div>
                </div>
                
                <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2 text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{t.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                {t.content}
                </p>
            </div>
            <div className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700/50 text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Use Template</span>
                <ArrowRight size={14} className="-translate-x-2 group-hover:translate-x-0 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
