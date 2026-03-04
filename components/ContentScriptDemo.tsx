import React, { useState } from 'react';
import { FloatingToolbar } from './FloatingToolbar';

export const ContentScriptDemo = () => {
  const [selectedText, setSelectedText] = useState('');
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);

  const handleSelection = (e: React.SyntheticEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      // Adjust rect for the container scroll/position if needed, but for demo simpler
      // We need to offset because the container is inside the App
      setSelectedText(selection.toString());
      setSelectionRect(rect);
    } else {
      setSelectedText('');
      setSelectionRect(null);
    }
  };

  return (
    <div className="min-h-full bg-white p-12 relative" onMouseUp={handleSelection} onKeyUp={handleSelection}>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-yellow-800 text-sm mb-8">
          <strong>Demo Instructions:</strong> Select any text in the paragraphs below to trigger the Floating Assistant Toolbar. This mimics how the extension works on any website.
        </div>

        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-8">The Future of Writing</h1>
        
        <p className="text-lg text-slate-700 leading-relaxed font-serif">
          Writing is an art form that has evolved over thousands of years. From clay tablets to digital screens, 
          the essence of communication remains the same: conveying ideas from one mind to another. However, 
          the tools we use have changed dramatically. Today, artificial intelligence stands poised to revolutionize 
          how we draft, edit, and perfect our written words.
        </p>

        <p className="text-lg text-slate-700 leading-relaxed font-serif">
          Imagine a world where writer's block is a thing of the past. Where the perfect word is always at your 
          fingertips, and confusing sentences are clarified instantly. This is not science fiction; it is the 
          reality we are building with tools like PrivatePen Pro.
        </p>

        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 mt-8">
            <h3 className="font-bold text-slate-800 mb-2">Editable Area Test</h3>
            <textarea 
                className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" 
                rows={4}
                defaultValue="Try selecting this text to fix grammar errors. The quick brown fox jumps over the lazy dog."
            ></textarea>
        </div>
      </div>

      {/* Simulated Floating Toolbar */}
      {selectedText && selectionRect && (
        <FloatingToolbar 
            rect={selectionRect} 
            selectedText={selectedText}
            onClose={() => {
                setSelectedText('');
                setSelectionRect(null);
                window.getSelection()?.removeAllRanges();
            }} 
        />
      )}
    </div>
  );
};
