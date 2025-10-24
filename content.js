// Enhanced Content Script with WORKING THEME SWITCHING

let currentElement = null;
let floatingToolbar = null;
let isAnalyzing = false;
let settings = {};
let selectionText = '';
let isDragging = false;
let dragOffset = { x: 0, y: 0 };

async function init() {
  // Load initial settings
  settings = await chrome.storage.local.get([
    'privacyMode', 'theme', 'whisperMode', 'autoComplete', 'language'
  ]);
  
  createFloatingToolbar();
  attachEventListeners();
  initializeNewFeatures();
  applyTheme(settings.theme || 'auto');
  
  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
      if (changes.theme) {
        settings.theme = changes.theme.newValue;
        applyTheme(changes.theme.newValue);
      }
      if (changes.privacyMode) {
        settings.privacyMode = changes.privacyMode.newValue;
        updatePrivacyIndicator();
      }
      if (changes.whisperMode) {
        settings.whisperMode = changes.whisperMode.newValue;
      }
    }
  });
}

// Apply theme to the toolbar
function applyTheme(theme) {
  if (!floatingToolbar) return;
  
  // Remove existing theme classes
  floatingToolbar.classList.remove('theme-light', 'theme-dark', 'theme-auto');
  
  if (theme === 'dark') {
    floatingToolbar.classList.add('theme-dark');
  } else if (theme === 'light') {
    floatingToolbar.classList.add('theme-light');
  } else {
    // Auto theme - check system preference
    floatingToolbar.classList.add('theme-auto');
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      floatingToolbar.classList.add('theme-dark');
    } else {
      floatingToolbar.classList.add('theme-light');
    }
  }
  
  console.log('Theme applied:', theme);
}

// Update privacy indicator
function updatePrivacyIndicator() {
  const indicator = floatingToolbar?.querySelector('.privatepen-privacy-indicator');
  if (indicator) {
    if (settings.privacyMode) {
      indicator.classList.add('active');
    } else {
      indicator.classList.remove('active');
    }
  }
}

// Initialize additional features
function initializeNewFeatures() {
  createWordCounter();
  document.addEventListener('contextmenu', handleContextMenu);
  document.addEventListener('keydown', handleKeyboardShortcuts);
  
  // Listen for system theme changes
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (settings.theme === 'auto') {
        applyTheme('auto');
      }
    });
  }
}

// Create Word Counter
function createWordCounter() {
  const counter = document.createElement('div');
  counter.id = 'privatepen-counter';
  counter.className = 'privatepen-counter privatepen-hidden';
  counter.innerHTML = `
    <div class="counter-content">
      <span class="counter-label">Words:</span>
      <span class="counter-value" id="counterWords">0</span>
      <span class="counter-separator">|</span>
      <span class="counter-label">Chars:</span>
      <span class="counter-value" id="counterChars">0</span>
    </div>
  `;
  document.body.appendChild(counter);
}

function createFloatingToolbar() {
  if (floatingToolbar) return;
  
  floatingToolbar = document.createElement('div');
  floatingToolbar.id = 'privatepen-toolbar';
  floatingToolbar.className = 'privatepen-hidden theme-auto';
  floatingToolbar.innerHTML = `
    <div class="privatepen-drag-handle" id="dragHandle">
      <span class="drag-icon">⋮⋮</span>
      <span class="drag-text">Drag to move</span>
      <button class="theme-toggle-btn" id="themeToggle" title="Toggle Theme">
        <span class="theme-icon">🌓</span>
      </button>
    </div>
    <div class="privatepen-toolbar-inner">
      <button class="privatepen-btn" data-action="grammar" title="Grammar Check">
        <span>✓</span>
      </button>
      <button class="privatepen-btn" data-action="tone" title="Tone Analysis">
        <span>🎭</span>
      </button>
      <button class="privatepen-btn" data-action="summarize" title="Summarize">
        <span>📄</span>
      </button>
      <button class="privatepen-btn" data-action="rephrase" title="Rephrase">
        <span>💬</span>
      </button>
      <button class="privatepen-btn" data-action="expand" title="Expand/Condense">
        <span>🔄</span>
      </button>
      <button class="privatepen-btn" data-action="translate" title="Translate">
        <span>🌐</span>
      </button>
      <button class="privatepen-btn" data-action="simplify" title="Simplify">
        <span>💡</span>
      </button>
      <button class="privatepen-btn" data-action="bullets" title="Bullets">
        <span>•••</span>
      </button>
      <div class="privatepen-privacy-indicator ${settings.privacyMode ? 'active' : ''}" title="Privacy Mode">
        <span>🔒</span>
      </div>
    </div>
    <div class="privatepen-results" style="display: none;"></div>
  `;
  
  document.body.appendChild(floatingToolbar);
  
  // Make toolbar draggable
  const dragHandle = floatingToolbar.querySelector('#dragHandle');
  dragHandle.addEventListener('mousedown', startDragging);
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDragging);
  
  // Add theme toggle button listener
  const themeToggle = floatingToolbar.querySelector('#themeToggle');
  themeToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleTheme();
  });
  
  // Add action listeners
  floatingToolbar.querySelectorAll('.privatepen-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleToolbarAction(btn.dataset.action);
    });
  });
}

// Toggle theme directly from toolbar
async function toggleTheme() {
  const themes = ['auto', 'light', 'dark'];
  const currentIndex = themes.indexOf(settings.theme || 'auto');
  const newTheme = themes[(currentIndex + 1) % 3];
  
  settings.theme = newTheme;
  await chrome.storage.local.set({ theme: newTheme });
  applyTheme(newTheme);
  
  showNotification(`Theme changed to ${newTheme}`, 'success');
}

// Dragging functions
function startDragging(e) {
  if (e.target.id === 'themeToggle' || e.target.closest('#themeToggle')) {
    return; // Don't drag when clicking theme toggle
  }
  
  isDragging = true;
  const rect = floatingToolbar.getBoundingClientRect();
  dragOffset.x = e.clientX - rect.left;
  dragOffset.y = e.clientY - rect.top;
  floatingToolbar.style.transition = 'none';
  floatingToolbar.querySelector('#dragHandle').style.cursor = 'grabbing';
}

function drag(e) {
  if (!isDragging) return;
  
  e.preventDefault();
  const newX = e.clientX - dragOffset.x;
  const newY = e.clientY - dragOffset.y;
  
  // Keep toolbar within viewport
  const maxX = window.innerWidth - floatingToolbar.offsetWidth;
  const maxY = window.innerHeight - floatingToolbar.offsetHeight;
  
  floatingToolbar.style.left = `${Math.max(0, Math.min(newX, maxX))}px`;
  floatingToolbar.style.top = `${Math.max(0, Math.min(newY, maxY))}px`;
}

function stopDragging() {
  if (isDragging) {
    isDragging = false;
    floatingToolbar.style.transition = '';
    floatingToolbar.querySelector('#dragHandle').style.cursor = '';
  }
}

// Rest of your functions remain the same...
// [Include all the other functions from the previous code]

function attachEventListeners() {
  // Focus events
  document.addEventListener('focusin', (e) => {
    if (isTextInput(e.target)) {
      currentElement = e.target;
      if (!settings.whisperMode) {
        showToolbar(e.target);
        showWordCounter(e.target);
      }
      e.target.addEventListener('input', updateWordCounter);
    }
  });
  
  document.addEventListener('focusout', (e) => {
    setTimeout(() => {
      if (!floatingToolbar.matches(':hover')) {
        hideToolbar();
        hideWordCounter();
      }
    }, 200);
  });
  
  // Selection handling
  document.addEventListener('mouseup', handleTextSelection);
}

function handleTextSelection(e) {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText.length > 5) {
    selectionText = selectedText;
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    floatingToolbar.style.left = `${rect.left}px`;
    floatingToolbar.style.top = `${rect.bottom + window.scrollY + 5}px`;
    floatingToolbar.classList.remove('privatepen-hidden');
    floatingToolbar.classList.add('privatepen-visible');
  }
}

function handleKeyboardShortcuts(e) {
  if (!currentElement) return;
  
  if (e.ctrlKey && e.shiftKey) {
    switch(e.key.toUpperCase()) {
      case 'G':
        e.preventDefault();
        handleToolbarAction('grammar');
        break;
      case 'T':
        e.preventDefault();
        handleToolbarAction('tone');
        break;
      case 'S':
        e.preventDefault();
        handleToolbarAction('summarize');
        break;
      case 'R':
        e.preventDefault();
        handleToolbarAction('rephrase');
        break;
    }
  }
}

function handleContextMenu(e) {
  const selection = window.getSelection().toString().trim();
  if (selection.length > 0) {
    selectionText = selection;
  }
}

function showWordCounter(element) {
  const counter = document.getElementById('privatepen-counter');
  if (!counter) return;
  
  const rect = element.getBoundingClientRect();
  counter.style.left = `${rect.right - 150}px`;
  counter.style.top = `${rect.top + window.scrollY - 40}px`;
  counter.classList.remove('privatepen-hidden');
  counter.classList.add('privatepen-visible');
  
  updateWordCounter();
}

function hideWordCounter() {
  const counter = document.getElementById('privatepen-counter');
  if (counter) {
    counter.classList.remove('privatepen-visible');
    counter.classList.add('privatepen-hidden');
  }
}

function updateWordCounter() {
  if (!currentElement) return;
  
  const text = getTextFromElement(currentElement);
  const words = text.trim().length > 0 ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  
  const wordsEl = document.getElementById('counterWords');
  const charsEl = document.getElementById('counterChars');
  
  if (wordsEl) wordsEl.textContent = words;
  if (charsEl) charsEl.textContent = chars;
}

function isTextInput(element) {
  if (!element) return false;
  const tagName = element.tagName.toLowerCase();
  return tagName === 'textarea' || 
         (tagName === 'input' && ['text', 'email', 'search', 'url'].includes(element.type)) ||
         element.isContentEditable;
}

function showToolbar(element) {
  if (!floatingToolbar) return;
  const rect = element.getBoundingClientRect();
  floatingToolbar.style.left = `${rect.left}px`;
  floatingToolbar.style.top = `${rect.bottom + window.scrollY + 5}px`;
  floatingToolbar.classList.remove('privatepen-hidden');
  floatingToolbar.classList.add('privatepen-visible');
}

function hideToolbar() {
  if (!floatingToolbar) return;
  floatingToolbar.classList.remove('privatepen-visible');
  floatingToolbar.classList.add('privatepen-hidden');
  hideResults();
}

async function handleToolbarAction(action) {
  if (isAnalyzing) return;
  
  let text = selectionText || getTextFromElement(currentElement);
  
  if (!text || text.trim().length === 0) {
    showNotification('Please enter or select some text first', 'warning');
    return;
  }
  
  isAnalyzing = true;
  showLoading(action);
  
  try {
    let result;
    switch (action) {
      case 'grammar':
        result = await analyzeGrammar(text);
        displayGrammarResults(result);
        break;
      case 'tone':
        result = await analyzeTone(text);
        displayToneResults(result);
        break;
      case 'summarize':
        result = await summarizeText(text);
        displaySummaryResults(result);
        break;
      case 'rephrase':
        result = await rephraseText(text);
        displayRephraseResults(result);
        break;
      case 'expand':
        result = await expandText(text);
        displayExpandResults(result);
        break;
      case 'translate':
        result = await translateText(text);
        displayTranslateResults(result);
        break;
      case 'simplify':
        result = await simplifyText(text);
        displaySimplifyResults(result);
        break;
      case 'bullets':
        result = await convertToBullets(text);
        displayBulletsResults(result);
        break;
    }
    
    chrome.runtime.sendMessage({
      action: 'updateStats',
      stats: { wordCount: text.split(/\s+/).length, tone: result?.tone?.primary }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    showNotification('Analysis failed. Please try again.', 'error');
  } finally {
    isAnalyzing = false;
    selectionText = '';
  }
}

function getTextFromElement(element) {
  if (!element) return '';
  return element.isContentEditable ? element.innerText : element.value;
}

function setTextInElement(element, text) {
  if (!element) return;
  if (element.isContentEditable) {
    element.innerText = text;
  } else {
    element.value = text;
  }
  element.dispatchEvent(new Event('input', { bubbles: true }));
  updateWordCounter();
}

// [Include all analysis functions from previous code]
async function analyzeGrammar(text) {
  await simulateDelay(500);
  
  const issues = [];
  
  // Check for double spaces
  if (text.includes('  ')) {
    issues.push({
      type: 'spacing',
      message: 'Multiple consecutive spaces detected',
      position: text.indexOf('  ')
    });
  }
  
  // Check for missing punctuation
  if (text.length > 10 && !text.trim().match(/[.!?]$/)) {
    issues.push({
      type: 'punctuation',
      message: 'Missing punctuation at the end of sentence',
      position: text.length - 1
    });
  }
  
  // Check for capital letter at start
  if (text.length > 0 && !text.match(/^[A-Z]/)) {
    issues.push({
      type: 'capitalization',
      message: 'Sentence should start with a capital letter',
      position: 0
    });
  }
  
  return issues;
}

async function analyzeTone(text) {
  await simulateDelay(400);
  
  const wordCount = text.split(/\s+/).length;
  const avgWordLength = text.replace(/\s+/g, '').length / wordCount;
  const exclamations = (text.match(/!/g) || []).length;
  
  let tone = 'neutral';
  let confidence = 0.75;
  
  if (avgWordLength > 6 && exclamations === 0) {
    tone = 'formal';
    confidence = 0.85;
  } else if (exclamations > 1 || avgWordLength < 4) {
    tone = 'casual';
    confidence = 0.80;
  }
  
  const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful'];
  const negativeWords = ['bad', 'terrible', 'awful', 'poor', 'disappointing'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  let sentiment = 'neutral';
  let score = 0.5;
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
    score = 0.7;
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
    score = 0.3;
  }
  
  return {
    tone: { primary: tone, confidence },
    sentiment: { sentiment, score }
  };
}

async function summarizeText(text) {
  await simulateDelay(600);
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length <= 2) {
    return { brief: text, detailed: text };
  }
  
  const brief = sentences[0].trim() + '.';
  const mid = Math.floor(sentences.length / 2);
  const detailed = [sentences[0], sentences[mid], sentences[sentences.length - 1]]
    .map(s => s.trim())
    .join('. ') + '.';
  
  return { brief, detailed };
}

async function rephraseText(text) {
  await simulateDelay(500);
  
  const formal = text
    .replace(/\b(get|got)\b/gi, 'obtain')
    .replace(/\b(very|really)\b/gi, 'extremely')
    .replace(/\b(but)\b/gi, 'however');
  
  const simple = text
    .replace(/\b(obtain|acquire)\b/gi, 'get')
    .replace(/\b(utilize)\b/gi, 'use')
    .replace(/\b(demonstrate)\b/gi, 'show');
  
  const creative = text
    .replace(/\b(good)\b/gi, 'remarkable')
    .replace(/\b(said)\b/gi, 'expressed')
    .replace(/\b(important)\b/gi, 'crucial');
  
  return { formal, simple, creative };
}

async function expandText(text) {
  await simulateDelay(400);
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const wordCount = text.split(/\s+/).length;
  
  if (wordCount > 50) {
    const condensed = sentences.slice(0, 3).map((s, i) => `${i + 1}. ${s.trim()}`).join('\n');
    return { type: 'condense', result: condensed };
  } else {
    const expanded = text + ' Furthermore, this concept provides valuable insights that enhance our understanding.';
    return { type: 'expand', result: expanded };
  }
}

async function translateText(text) {
  await simulateDelay(700);
  
  return {
    spanish: 'Este es un ejemplo de traducción al español.',
    french: 'Ceci est un exemple de traduction en français.',
    german: 'Dies ist ein Übersetzungsbeispiel ins Deutsche.',
    hindi: 'यह हिंदी अनुवाद का एक उदाहरण है।'
  };
}

async function simplifyText(text) {
  await simulateDelay(400);
  
  const complexToSimple = {
    'utilize': 'use',
    'implement': 'do',
    'facilitate': 'help',
    'demonstrate': 'show',
    'approximately': 'about'
  };
  
  let simplified = text;
  let changeCount = 0;
  
  Object.entries(complexToSimple).forEach(([complex, simple]) => {
    const regex = new RegExp(`\\b${complex}\\b`, 'gi');
    const newText = simplified.replace(regex, simple);
    if (newText !== simplified) {
      changeCount++;
      simplified = newText;
    }
  });
  
  return {
    original: text,
    simplified: simplified,
    changes: changeCount > 0 ? `Simplified ${changeCount} complex terms!` : 'Text is already simple!'
  };
}

async function convertToBullets(text) {
  await simulateDelay(300);
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const bullets = sentences.map(s => `• ${s.trim()}`).join('\n');
  const numbered = sentences.map((s, i) => `${i + 1}. ${s.trim()}`).join('\n');
  const checkboxes = sentences.map(s => `☐ ${s.trim()}`).join('\n');
  const arrows = sentences.map(s => `→ ${s.trim()}`).join('\n');
  
  return { bullets, numbered, checkboxes, arrows };
}

// [Include all display functions from previous code]
function displayGrammarResults(issues) {
  const resultsDiv = floatingToolbar.querySelector('.privatepen-results');
  
  if (issues.length === 0) {
    resultsDiv.innerHTML = `
      <div class="privatepen-success">
        <span>✓</span> Perfect! No grammar issues found.
      </div>
    `;
  } else {
    resultsDiv.innerHTML = `
      <div class="privatepen-result-header">
        <span>🔍</span> Grammar Check - ${issues.length} issue${issues.length > 1 ? 's' : ''}
      </div>
      ${issues.map(issue => `
        <div class="privatepen-issue">
          <span class="issue-type">${issue.type}</span>
          <span class="issue-message">${issue.message}</span>
        </div>
      `).join('')}
    `;
  }
  showResults();
}

function displayToneResults(result) {
  const resultsDiv = floatingToolbar.querySelector('.privatepen-results');
  const emoji = result.sentiment.sentiment === 'positive' ? '😊' : 
                result.sentiment.sentiment === 'negative' ? '😟' : '😐';
  
  resultsDiv.innerHTML = `
    <div class="privatepen-result-header">
      <span>🎭</span> Tone Analysis
    </div>
    <div class="privatepen-tone-result">
      <div class="tone-item">
        <strong>Tone:</strong> ${capitalize(result.tone.primary)} 
        <span class="confidence">(${Math.round(result.tone.confidence * 100)}% confident)</span>
      </div>
      <div class="tone-item">
        <strong>Sentiment:</strong> ${emoji} ${capitalize(result.sentiment.sentiment)}
        <div class="sentiment-bar">
          <div class="sentiment-fill" style="width: ${result.sentiment.score * 100}%"></div>
        </div>
      </div>
    </div>
  `;
  showResults();
}

function displaySummaryResults(result) {
  const resultsDiv = floatingToolbar.querySelector('.privatepen-results');
  resultsDiv.innerHTML = `
    <div class="privatepen-result-header">
      <span>📄</span> Text Summary
    </div>
    <div class="privatepen-summary">
      <div class="summary-option">
        <strong>Brief:</strong>
        <p>${result.brief}</p>
        <button class="privatepen-copy-btn" data-text="${escapeHtml(result.brief)}">Copy</button>
        <button class="privatepen-apply-btn" data-text="${escapeHtml(result.brief)}">Apply</button>
      </div>
      <div class="summary-option">
        <strong>Detailed:</strong>
        <p>${result.detailed}</p>
        <button class="privatepen-copy-btn" data-text="${escapeHtml(result.detailed)}">Copy</button>
        <button class="privatepen-apply-btn" data-text="${escapeHtml(result.detailed)}">Apply</button>
      </div>
    </div>
  `;
  addButtonHandlers();
  showResults();
}

function displayRephraseResults(result) {
  const resultsDiv = floatingToolbar.querySelector('.privatepen-results');
  resultsDiv.innerHTML = `
    <div class="privatepen-result-header">
      <span>💬</span> Rephrase Options
    </div>
    <div class="privatepen-rephrase">
      ${Object.entries(result).map(([style, text]) => `
        <div class="rephrase-option">
          <strong>${capitalize(style)}:</strong>
          <p>${text}</p>
          <button class="privatepen-copy-btn" data-text="${escapeHtml(text)}">Copy</button>
          <button class="privatepen-apply-btn" data-text="${escapeHtml(text)}">Apply</button>
        </div>
      `).join('')}
    </div>
  `;
  addButtonHandlers();
  showResults();
}

function displayExpandResults(result) {
  const resultsDiv = floatingToolbar.querySelector('.privatepen-results');
  resultsDiv.innerHTML = `
    <div class="privatepen-result-header">
      <span>🔄</span> ${result.type === 'expand' ? 'Expanded' : 'Condensed'} Text
    </div>
    <div class="privatepen-expand">
      <p>${result.result.replace(/\n/g, '<br>')}</p>
      <button class="privatepen-copy-btn" data-text="${escapeHtml(result.result)}">Copy</button>
      <button class="privatepen-apply-btn" data-text="${escapeHtml(result.result)}">Apply</button>
    </div>
  `;
  addButtonHandlers();
  showResults();
}

function displayTranslateResults(translations) {
  const resultsDiv = floatingToolbar.querySelector('.privatepen-results');
  resultsDiv.innerHTML = `
    <div class="privatepen-result-header">
      <span>🌐</span> Translations
    </div>
    <div class="privatepen-translate">
      ${Object.entries(translations).map(([lang, text]) => `
        <div class="translate-option">
          <strong>${capitalize(lang)}:</strong>
          <p>${text}</p>
          <button class="privatepen-copy-btn" data-text="${escapeHtml(text)}">Copy</button>
        </div>
      `).join('')}
    </div>
  `;
  addButtonHandlers();
  showResults();
}

function displaySimplifyResults(result) {
  const resultsDiv = floatingToolbar.querySelector('.privatepen-results');
  resultsDiv.innerHTML = `
    <div class="privatepen-result-header">
      <span>💡</span> Simplified Text
    </div>
    <div class="privatepen-simplify">
      <div class="simplify-info">${result.changes}</div>
      <div class="simplify-result">
        <p>${result.simplified}</p>
        <button class="privatepen-copy-btn" data-text="${escapeHtml(result.simplified)}">Copy</button>
        <button class="privatepen-apply-btn" data-text="${escapeHtml(result.simplified)}">Apply</button>
      </div>
    </div>
  `;
  addButtonHandlers();
  showResults();
}

function displayBulletsResults(result) {
  const resultsDiv = floatingToolbar.querySelector('.privatepen-results');
  resultsDiv.innerHTML = `
    <div class="privatepen-result-header">
      <span>•••</span> List Formats
    </div>
    <div class="privatepen-bullets">
      ${Object.entries(result).map(([type, text]) => `
        <div class="bullet-option">
          <strong>${capitalize(type)}:</strong>
          <p style="white-space: pre-line;">${text}</p>
          <button class="privatepen-copy-btn" data-text="${escapeHtml(text)}">Copy</button>
          <button class="privatepen-apply-btn" data-text="${escapeHtml(text)}">Apply</button>
        </div>
      `).join('')}
    </div>
  `;
  addButtonHandlers();
  showResults();
}

function showResults() {
  const resultsDiv = floatingToolbar.querySelector('.privatepen-results');
  resultsDiv.style.display = 'block';
}

function hideResults() {
  const resultsDiv = floatingToolbar.querySelector('.privatepen-results');
  resultsDiv.style.display = 'none';
}

function showLoading(action) {
  const resultsDiv = floatingToolbar.querySelector('.privatepen-results');
  const messages = {
    grammar: 'Checking grammar...',
    tone: 'Analyzing tone...',
    summarize: 'Creating summary...',
    rephrase: 'Generating variations...',
    expand: 'Processing text...',
    translate: 'Translating...',
    simplify: 'Simplifying...',
    bullets: 'Formatting...'
  };
  
  resultsDiv.innerHTML = `
    <div class="privatepen-loading">
      ${messages[action] || 'Processing...'}
    </div>
  `;
  showResults();
}

function addButtonHandlers() {
  floatingToolbar.querySelectorAll('.privatepen-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.dataset.text;
      navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard!', 'success');
      });
    });
  });
  
  floatingToolbar.querySelectorAll('.privatepen-apply-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentElement) {
        setTextInElement(currentElement, btn.dataset.text);
        showNotification('Text applied!', 'success');
        hideResults();
      }
    });
  });
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `privatepen-notification privatepen-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('privatepen-fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Utility functions
function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize
init();