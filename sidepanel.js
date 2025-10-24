// Side Panel Script for PrivatePen Pro

let currentText = '';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  attachEventListeners();
  loadLastText();
});

// Attach event listeners
function attachEventListeners() {
  const inputText = document.getElementById('inputText');
  
  // Update stats on input
  inputText.addEventListener('input', () => {
    currentText = inputText.value;
    updateStats();
    saveLastText();
  });
  
  // Action buttons
  document.getElementById('checkGrammar').addEventListener('click', () => performAction('grammar'));
  document.getElementById('analyzeTone').addEventListener('click', () => performAction('tone'));
  document.getElementById('summarizeText').addEventListener('click', () => performAction('summarize'));
  document.getElementById('rephraseText').addEventListener('click', () => performAction('rephrase'));
  document.getElementById('expandText').addEventListener('click', () => performAction('expand'));
  document.getElementById('clearText').addEventListener('click', clearText);
  document.getElementById('closeResults').addEventListener('click', hideResults);
  
  // Keyboard shortcuts
  inputText.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      performAction('grammar');
    }
  });
}

// Update text statistics
function updateStats() {
  const text = currentText.trim();
  
  const words = text.length > 0 ? text.split(/\s+/).length : 0;
  const chars = text.length;
  const sentences = text.length > 0 ? text.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0;
  
  document.getElementById('wordCount').textContent = words;
  document.getElementById('charCount').textContent = chars;
  document.getElementById('sentenceCount').textContent = sentences;
}

// Perform action
async function performAction(action) {
  const text = currentText.trim();
  
  if (!text) {
    showNotification('Please enter some text first', 'warning');
    return;
  }
  
  showLoading(action);
  
  try {
    let result;
    
    switch (action) {
      case 'grammar':
        result = await checkGrammar(text);
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
    }
  } catch (error) {
    console.error('Action error:', error);
    showNotification('An error occurred. Please try again.', 'error');
    hideResults();
  }
}

// Check grammar
async function checkGrammar(text) {
  // Simulate AI processing
  await delay(800);
  
  const issues = [];
  
  // Basic grammar checks
  if (text.includes('  ')) {
    issues.push({
      type: 'spacing',
      message: 'Multiple spaces detected',
      suggestion: 'Use single spaces between words'
    });
  }
  
  if (!text.trim().match(/[.!?]$/)) {
    issues.push({
      type: 'punctuation',
      message: 'Missing end punctuation',
      suggestion: 'Add a period, exclamation mark, or question mark'
    });
  }
  
  // Check for passive voice (simple check)
  if (text.match(/\b(was|were|been|being)\s+\w+ed\b/i)) {
    issues.push({
      type: 'style',
      message: 'Passive voice detected',
      suggestion: 'Consider using active voice for clarity'
    });
  }
  
  // Check for word repetition
  const words = text.toLowerCase().split(/\s+/);
  const wordCounts = {};
  words.forEach(word => {
    if (word.length > 4) {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    }
  });
  
  Object.entries(wordCounts).forEach(([word, count]) => {
    if (count > 3) {
      issues.push({
        type: 'repetition',
        message: `Word "${word}" appears ${count} times`,
        suggestion: 'Consider using synonyms for variety'
      });
    }
  });
  
  return issues;
}

// Analyze tone
async function analyzeTone(text) {
  await delay(600);
  
  const wordCount = text.split(/\s+/).length;
  const avgWordLength = text.replace(/\s+/g, '').length / wordCount;
  const hasExclamation = text.includes('!');
  const hasQuestion = text.includes('?');
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = wordCount / sentences.length;
  
  // Determine primary tone
  let primaryTone = 'neutral';
  let confidence = 0.75;
  
  if (avgWordLength > 6 && avgSentenceLength > 20) {
    primaryTone = 'formal';
    confidence = 0.85;
  } else if (hasExclamation || avgWordLength < 4.5) {
    primaryTone = 'casual';
    confidence = 0.80;
  }
  
  // Sentiment analysis
  const positiveWords = ['good', 'great', 'excellent', 'wonderful', 'amazing', 'fantastic', 'love', 'best', 'happy', 'perfect'];
  const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 'poor', 'disappointing', 'sad', 'unfortunate'];
  
  const lowerText = text.toLowerCase();
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  let sentiment = 'neutral';
  let sentimentScore = 0.5;
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
    sentimentScore = Math.min(0.9, 0.5 + (positiveCount * 0.1));
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
    sentimentScore = Math.max(0.1, 0.5 - (negativeCount * 0.1));
  }
  
  return {
    primary: primaryTone,
    confidence,
    sentiment,
    sentimentScore,
    suggestions: getToneSuggestions(primaryTone, sentiment)
  };
}

// Get tone suggestions
function getToneSuggestions(tone, sentiment) {
  const suggestions = [];
  
  if (tone === 'formal') {
    suggestions.push('Consider adding personal touches for better engagement');
    suggestions.push('Your writing is professional and clear');
  } else if (tone === 'casual') {
    suggestions.push('Great for informal communication');
    suggestions.push('For professional contexts, consider a more formal tone');
  }
  
  if (sentiment === 'negative') {
    suggestions.push('Consider balancing negative points with positive aspects');
  } else if (sentiment === 'positive') {
    suggestions.push('Your positive tone creates an engaging message');
  }
  
  return suggestions;
}

// Summarize text
async function summarizeText(text) {
  await delay(1000);
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length <= 2) {
    return {
      brief: text,
      detailed: text,
      keyPoints: [text]
    };
  }
  
  // Brief summary: first and last sentence
  const brief = sentences[0].trim() + '. ' + sentences[sentences.length - 1].trim() + '.';
  
  // Detailed summary: first third of sentences
  const detailedCount = Math.max(2, Math.ceil(sentences.length / 3));
  const detailed = sentences.slice(0, detailedCount).map(s => s.trim()).join('. ') + '.';
  
  // Key points: extract sentences with important words
  const importantWords = ['important', 'key', 'main', 'essential', 'critical', 'significant', 'must', 'need', 'should'];
  const keyPoints = sentences
    .filter(s => importantWords.some(word => s.toLowerCase().includes(word)))
    .slice(0, 3)
    .map(s => s.trim());
  
  if (keyPoints.length === 0) {
    // Fallback: use first few sentences
    keyPoints.push(...sentences.slice(0, 3).map(s => s.trim()));
  }
  
  return { brief, detailed, keyPoints };
}

// Rephrase text
async function rephraseText(text) {
  await delay(900);
  
  // Formal version
  const formal = text
    .replace(/\bget\b/gi, 'obtain')
    .replace(/\bgot\b/gi, 'obtained')
    .replace(/\bvery\b/gi, 'extremely')
    .replace(/\breally\b/gi, 'genuinely')
    .replace(/\bkinda\b/gi, 'somewhat')
    .replace(/\ba lot of\b/gi, 'numerous')
    .replace(/\bthing\b/gi, 'matter')
    .replace(/\bstuff\b/gi, 'material');
  
  // Simple version
  const sentences = text.split(/[.!?]+/).filter(s => s.trim());
  const simple = sentences
    .map(s => {
      const words = s.trim().split(/\s+/);
      return words.slice(0, Math.min(15, words.length)).join(' ');
    })
    .join('. ') + '.';
  
  // Creative version
  const creative = text
    .replace(/\bsaid\b/gi, 'articulated')
    .replace(/\bshow\b/gi, 'demonstrate')
    .replace(/\bgood\b/gi, 'remarkable')
    .replace(/\bbad\b/gi, 'unfortunate')
    .replace(/\bmake\b/gi, 'create')
    .replace(/\bthink\b/gi, 'believe')
    .replace(/\bimportant\b/gi, 'crucial');
  
  return { formal, simple, creative };
}

// Expand text
async function expandText(text) {
  await delay(700);
  
  const words = text.split(/\s+/);
  
  if (words.length > 50) {
    // Condense to bullet points
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const bullets = sentences.slice(0, 5).map(s => '• ' + s.trim());
    
    return {
      type: 'condense',
      result: bullets.join('\n'),
      original: text
    };
  } else {
    // Expand with additional context
    const expanded = text + 
      ' Furthermore, this concept is particularly significant as it demonstrates fundamental principles that are essential to understanding the broader context. ' +
      'By examining these elements more closely, we can gain valuable insights that enhance our comprehension of the subject matter.';
    
    return {
      type: 'expand',
      result: expanded,
      original: text
    };
  }
}

// Display results
function displayGrammarResults(issues) {
  const title = document.getElementById('resultsTitle');
  const content = document.getElementById('resultsContent');
  
  title.textContent = '🪶 Grammar Check Results';
  
  if (issues.length === 0) {
    content.innerHTML = `
      <div class="result-item" style="border-left-color: #10b981;">
        <div class="result-label" style="color: #10b981;">All Clear!</div>
        <div class="result-content">No grammar issues detected. Your writing looks great!</div>
      </div>
    `;
  } else {
    content.innerHTML = issues.map(issue => `
      <div class="result-item">
        <div class="result-label">${issue.type}</div>
        <div class="result-content">
          <strong>${issue.message}</strong><br>
          <span style="color: #6b7280; font-size: 13px;">${issue.suggestion}</span>
        </div>
      </div>
    `).join('');
  }
  
  showResults();
}

function displayToneResults(result) {
  const title = document.getElementById('resultsTitle');
  const content = document.getElementById('resultsContent');
  
  title.textContent = '🎭 Tone Analysis';
  
  const sentimentEmoji = result.sentiment === 'positive' ? '😊' : 
                         result.sentiment === 'negative' ? '😟' : '😐';
  
  content.innerHTML = `
    <div class="result-item">
      <div class="result-label">Primary Tone</div>
      <div class="result-content">
        <strong>${capitalize(result.primary)}</strong> 
        <span style="color: #6b7280;">(${Math.round(result.confidence * 100)}% confident)</span>
      </div>
    </div>
    
    <div class="result-item">
      <div class="result-label">Sentiment</div>
      <div class="result-content">
        ${sentimentEmoji} <strong>${capitalize(result.sentiment)}</strong>
        <div style="margin-top: 8px; background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
          <div style="width: ${result.sentimentScore * 100}%; height: 100%; background: linear-gradient(90deg, #ef4444, #fbbf24, #10b981); transition: width 0.3s ease;"></div>
        </div>
      </div>
    </div>
    
    <div class="result-item">
      <div class="result-label">Suggestions</div>
      <div class="result-content">
        ${result.suggestions.map(s => `• ${s}`).join('<br>')}
      </div>
    </div>
  `;
  
  showResults();
}

function displaySummaryResults(result) {
  const title = document.getElementById('resultsTitle');
  const content = document.getElementById('resultsContent');
  
  title.textContent = '📄 Text Summary';
  
  content.innerHTML = `
    <div class="result-item">
      <div class="result-label">Brief Summary</div>
      <div class="result-content">${result.brief}</div>
      <div class="result-actions">
        <button class="result-btn" onclick="copyToClipboard('${escapeQuotes(result.brief)}')">Copy</button>
        <button class="result-btn secondary" onclick="replaceText('${escapeQuotes(result.brief)}')">Replace</button>
      </div>
    </div>
    
    <div class="result-item">
      <div class="result-label">Detailed Summary</div>
      <div class="result-content">${result.detailed}</div>
      <div class="result-actions">
        <button class="result-btn" onclick="copyToClipboard('${escapeQuotes(result.detailed)}')">Copy</button>
        <button class="result-btn secondary" onclick="replaceText('${escapeQuotes(result.detailed)}')">Replace</button>
      </div>
    </div>
    
    <div class="result-item">
      <div class="result-label">Key Points</div>
      <div class="result-content">
        ${result.keyPoints.map((point, i) => `${i + 1}. ${point}`).join('<br><br>')}
      </div>
    </div>
  `;
  
  showResults();
}

function displayRephraseResults(result) {
  const title = document.getElementById('resultsTitle');
  const content = document.getElementById('resultsContent');
  
  title.textContent = '💬 Rephrase Options';
  
  content.innerHTML = `
    <div class="result-item">
      <div class="result-label">Formal Style</div>
      <div class="result-content">${result.formal}</div>
      <div class="result-actions">
        <button class="result-btn" onclick="copyToClipboard('${escapeQuotes(result.formal)}')">Copy</button>
        <button class="result-btn secondary" onclick="replaceText('${escapeQuotes(result.formal)}')">Replace</button>
      </div>
    </div>
    
    <div class="result-item">
      <div class="result-label">Simple Style</div>
      <div class="result-content">${result.simple}</div>
      <div class="result-actions">
        <button class="result-btn" onclick="copyToClipboard('${escapeQuotes(result.simple)}')">Copy</button>
        <button class="result-btn secondary" onclick="replaceText('${escapeQuotes(result.simple)}')">Replace</button>
      </div>
    </div>
    
    <div class="result-item">
      <div class="result-label">Creative Style</div>
      <div class="result-content">${result.creative}</div>
      <div class="result-actions">
        <button class="result-btn" onclick="copyToClipboard('${escapeQuotes(result.creative)}')">Copy</button>
        <button class="result-btn secondary" onclick="replaceText('${escapeQuotes(result.creative)}')">Replace</button>
      </div>
    </div>
  `;
  
  showResults();
}

function displayExpandResults(result) {
  const title = document.getElementById('resultsTitle');
  const content = document.getElementById('resultsContent');
  
  title.textContent = result.type === 'expand' ? '🧩 Expanded Text' : '🧩 Condensed Text';
  
  content.innerHTML = `
    <div class="result-item">
      <div class="result-label">${result.type === 'expand' ? 'Expanded Version' : 'Condensed Version'}</div>
      <div class="result-content" style="white-space: pre-line;">${result.result}</div>
      <div class="result-actions">
        <button class="result-btn" onclick="copyToClipboard('${escapeQuotes(result.result)}')">Copy</button>
        <button class="result-btn secondary" onclick="replaceText('${escapeQuotes(result.result)}')">Replace</button>
      </div>
    </div>
  `;
  
  showResults();
}

// Show/hide results
function showResults() {
  document.getElementById('resultsSection').classList.add('visible');
}

function hideResults() {
  document.getElementById('resultsSection').classList.remove('visible');
}

// Show loading
function showLoading(action) {
  const title = document.getElementById('resultsTitle');
  const content = document.getElementById('resultsContent');
  
  const actionNames = {
    grammar: 'Checking Grammar',
    tone: 'Analyzing Tone',
    summarize: 'Summarizing',
    rephrase: 'Rephrasing',
    expand: 'Processing'
  };
  
  title.textContent = actionNames[action] || 'Processing';
  content.innerHTML = '<div class="loading">Analyzing your text...</div>';
  
  showResults();
}

// Clear text
function clearText() {
  if (confirm('Clear all text?')) {
    document.getElementById('inputText').value = '';
    currentText = '';
    updateStats();
    hideResults();
    saveLastText();
  }
}

// Copy to clipboard
window.copyToClipboard = function(text) {
  navigator.clipboard.writeText(text).then(() => {
    showNotification('Copied to clipboard!', 'success');
  }).catch(err => {
    console.error('Copy failed:', err);
    showNotification('Failed to copy', 'error');
  });
};

// Replace text
window.replaceText = function(text) {
  document.getElementById('inputText').value = text;
  currentText = text;
  updateStats();
  saveLastText();
  showNotification('Text replaced!', 'success');
};

// Save/load last text
function saveLastText() {
  chrome.storage.local.set({ lastText: currentText });
}

async function loadLastText() {
  const data = await chrome.storage.local.get('lastText');
  if (data.lastText) {
    document.getElementById('inputText').value = data.lastText;
    currentText = data.lastText;
    updateStats();
  }
}

// Show notification
function showNotification(message, type = 'info') {
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#667eea'
  };
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${colors[type] || colors.info};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Utility functions
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeQuotes(text) {
  return text.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeOut {
    to {
      opacity: 0;
      transform: translateY(-10px);
    }
  }
`;
document.head.appendChild(style);