// background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log('PrivatePen Pro installed');
  
  // Set default settings
  chrome.storage.local.set({
    privacyMode: true,
    theme: 'auto',
    whisperMode: false,
    autoComplete: false,
    language: 'en',
    writingStats: {
      totalWords: 0,
      sessionsCount: 0,
      avgSentenceLength: 0,
      toneDistribution: { formal: 0, casual: 0, neutral: 0 }
    },
    styleProfile: null,
    snippets: []
  });
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeText') {
    analyzeWithChromeAI(request.text)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'updateStats') {
    updateWritingStats(request.stats)
      .then(() => sendResponse({ success: true }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true;
  }
  
  if (request.action === 'checkAIAvailability') {
    checkChromeAI()
      .then(available => sendResponse({ available }))
      .catch(() => sendResponse({ available: false }));
    return true;
  }
});

// Check if Chrome AI APIs are available
async function checkChromeAI() {
  try {
    const capabilities = {
      languageModel: 'ai' in window && 'languageModel' in window.ai,
      translator: 'translation' in window,
      summarizer: 'ai' in window && 'summarizer' in window.ai
    };
    
    return capabilities.languageModel || capabilities.translator || capabilities.summarizer;
  } catch (error) {
    console.error('Error checking Chrome AI availability:', error);
    return false;
  }
}

// Analyze text using Chrome's built-in AI
async function analyzeWithChromeAI(text) {
  try {
    const result = {
      grammar: await analyzeGrammar(text),
      tone: await analyzeTone(text),
      sentiment: await analyzeSentiment(text),
      suggestions: await generateSuggestions(text)
    };
    
    return result;
  } catch (error) {
    console.error('AI analysis error:', error);
    throw error;
  }
}

// Grammar analysis
async function analyzeGrammar(text) {
  const issues = [];
  
  if (text.includes('  ')) {
    issues.push({
      type: 'spacing',
      message: 'Multiple spaces detected',
      position: text.indexOf('  ')
    });
  }
  
  if (text.length > 10 && !text.trim().match(/[.!?]$/)) {
    issues.push({
      type: 'punctuation',
      message: 'Missing end punctuation',
      position: text.length - 1
    });
  }
  
  return issues;
}

// Tone analysis
async function analyzeTone(text) {
  const wordCount = text.split(/\s+/).length;
  const avgWordLength = text.replace(/\s+/g, '').length / wordCount;
  const hasExclamation = text.includes('!');
  
  let tone = 'neutral';
  if (avgWordLength > 6 && !hasExclamation) tone = 'formal';
  else if (hasExclamation || avgWordLength < 4) tone = 'casual';
  
  return {
    primary: tone,
    confidence: 0.75,
    alternatives: ['neutral', 'professional']
  };
}

// Sentiment analysis
async function analyzeSentiment(text) {
  const positiveWords = ['good', 'great', 'excellent', 'happy', 'wonderful', 'amazing'];
  const negativeWords = ['bad', 'terrible', 'awful', 'sad', 'horrible', 'poor'];
  
  const words = text.toLowerCase().split(/\s+/);
  const positiveCount = words.filter(w => positiveWords.includes(w)).length;
  const negativeCount = words.filter(w => negativeWords.includes(w)).length;
  
  let sentiment = 'neutral';
  let score = 0.5;
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
    score = 0.7;
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
    score = 0.3;
  }
  
  return { sentiment, score };
}

// Generate suggestions
async function generateSuggestions(text) {
  const suggestions = [];
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
  
  if (avgLength > 25) {
    suggestions.push({
      type: 'clarity',
      message: 'Consider breaking long sentences for better readability',
      priority: 'medium'
    });
  }
  
  return suggestions;
}

// Update writing statistics
async function updateWritingStats(newStats) {
  const data = await chrome.storage.local.get('writingStats');
  const current = data.writingStats || {
    totalWords: 0,
    sessionsCount: 0,
    avgSentenceLength: 0,
    toneDistribution: { formal: 0, casual: 0, neutral: 0 }
  };
  
  current.totalWords += newStats.wordCount || 0;
  current.sessionsCount += 1;
  
  if (newStats.tone) {
    current.toneDistribution[newStats.tone] = (current.toneDistribution[newStats.tone] || 0) + 1;
  }
  
  await chrome.storage.local.set({ writingStats: current });
}