// This file is for the Chrome Extension build.
// Logic for injecting the React FloatingToolbar into web pages.

import React from 'react';
import { createRoot } from 'react-dom/client';
import { FloatingToolbar } from './components/FloatingToolbar';
import { SettingsProvider } from './contexts/SettingsContext';
import { StorageProvider } from './contexts/StorageContext';

// Create container
const container = document.createElement('div');
container.id = 'privatepen-root';
document.body.appendChild(container);

const root = createRoot(container);

// Render function
const renderToolbar = (rect: DOMRect | null, text: string) => {
  if (rect && text) {
    // Fix: Use React.createElement to support rendering in a .ts file
    root.render(
      React.createElement(React.StrictMode, null,
        React.createElement(SettingsProvider, null,
          React.createElement(StorageProvider, null,
            React.createElement(FloatingToolbar, {
              rect: rect,
              selectedText: text,
              onClose: () => renderToolbar(null, '')
            })
          )
        )
      )
    );
  } else {
    root.render(null);
  }
};

// Event listener
document.addEventListener('mouseup', () => {
  const selection = window.getSelection();
  if (selection && selection.toString().trim().length > 0) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    // Check if selection is inside our own toolbar to avoid closing it
    const isInsideToolbar = document.getElementById('privatepen-root')?.contains(selection.anchorNode);
    
    if (!isInsideToolbar) {
        renderToolbar(rect, selection.toString());
    }
  }
});

// Clear on keyup (e.g. escape)
document.addEventListener('keyup', (e) => {
    if (e.key === 'Escape') {
        renderToolbar(null, '');
    }
});