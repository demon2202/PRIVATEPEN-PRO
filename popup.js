// Popup Script for PrivatePen Pro

let currentSettings = {};
let snippets = [];

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  await loadStats();
  await loadSnippets();
  attachEventListeners();
});

// Load settings from storage
async function loadSettings() {
  const data = await chrome.storage.local.get([
    'privacyMode', 'theme', 'whisperMode', 'autoComplete', 'language', 'styleProfile'
  ]);
  
  currentSettings = {
    privacyMode: data.privacyMode !== undefined ? data.privacyMode : true,
    theme: data.theme || 'auto',
    whisperMode: data.whisperMode || false,
    autoComplete: data.autoComplete || false,
    language: data.language || 'en',
    styleProfile: data.styleProfile || null
  };
  
  // Update UI
  document.getElementById('privacyMode').checked = currentSettings.privacyMode;
  document.getElementById('themeSelect').value = currentSettings.theme;
  document.getElementById('whisperMode').checked = currentSettings.whisperMode;
  document.getElementById('autoComplete').checked = currentSettings.autoComplete;
  document.getElementById('languageSelect').value = currentSettings.language;
  
  // Update privacy badge
  const badge = document.getElementById('privacyBadge');
  if (currentSettings.privacyMode) {
    badge.style.background = 'rgba(16, 185, 129, 0.3)';
  }
}

// Load statistics
async function loadStats() {
  const data = await chrome.storage.local.get('writingStats');
  const stats = data.writingStats || {
    totalWords: 0,
    sessionsCount: 0,
    avgSentenceLength: 0,
    toneDistribution: { formal: 0, casual: 0, neutral: 0 }
  };
  
  // Update stat cards
  document.getElementById('totalWords').textContent = formatNumber(stats.totalWords);
  document.getElementById('sessionsCount').textContent = stats.sessionsCount;
  document.getElementById('avgSentence').textContent = Math.round(stats.avgSentenceLength);
  
  // Update tone chart
  const total = Object.values(stats.toneDistribution).reduce((a, b) => a + b, 0);
  
  Object.entries(stats.toneDistribution).forEach(([tone, count]) => {
    const bar = document.querySelector(`.tone-bar[data-tone="${tone}"]`);
    if (bar) {
      const percentage = total > 0 ? (count / total) * 100 : 0;
      bar.querySelector('.tone-fill').style.width = `${percentage}%`;
      bar.querySelector('.tone-count').textContent = count;
    }
  });
}

// Load snippets
async function loadSnippets() {
  const data = await chrome.storage.local.get('snippets');
  snippets = data.snippets || [];
  renderSnippets();
}

// Render snippets list
function renderSnippets() {
  const listContainer = document.getElementById('snippetsList');
  
  if (snippets.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📝</span>
        <p>No snippets yet</p>
        <p class="empty-hint">Click "+ Add" to create your first snippet</p>
      </div>
    `;
    return;
  }
  
  listContainer.innerHTML = snippets.map((snippet, index) => `
    <div class="snippet-item" data-index="${index}">
      <div class="snippet-title">${escapeHtml(snippet.title)}</div>
      <div class="snippet-content">${escapeHtml(snippet.content)}</div>
      <div class="snippet-actions">
        <button class="snippet-btn copy-snippet" data-index="${index}">Copy</button>
        <button class="snippet-btn delete delete-snippet" data-index="${index}">Delete</button>
      </div>
    </div>
  `).join('');
  
  // Add event listeners
  document.querySelectorAll('.copy-snippet').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      copySnippet(parseInt(btn.dataset.index));
    });
  });
  
  document.querySelectorAll('.delete-snippet').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteSnippet(parseInt(btn.dataset.index));
    });
  });
}

// Copy snippet to clipboard
function copySnippet(index) {
  const snippet = snippets[index];
  navigator.clipboard.writeText(snippet.content).then(() => {
    showToast('Snippet copied to clipboard!');
  });
}

// Delete snippet
async function deleteSnippet(index) {
  if (confirm('Delete this snippet?')) {
    snippets.splice(index, 1);
    await chrome.storage.local.set({ snippets });
    renderSnippets();
    showToast('Snippet deleted');
  }
}

// Attach event listeners
function attachEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      switchTab(tab.dataset.tab);
    });
  });
  
  // Save settings
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  
  // Reset stats
  document.getElementById('resetStats').addEventListener('click', resetStats);
  
  // Open side panel
  document.getElementById('openSidePanel').addEventListener('click', openSidePanel);
  
  // Add snippet
  document.getElementById('addSnippet').addEventListener('click', showSnippetModal);
  
  // Modal actions
  document.getElementById('closeModal').addEventListener('click', hideSnippetModal);
  document.getElementById('cancelSnippet').addEventListener('click', hideSnippetModal);
  document.getElementById('saveSnippet').addEventListener('click', saveSnippet);
  
  // Upload profile
  document.getElementById('uploadProfile').addEventListener('click', uploadStyleProfile);
  
  // Close modal on outside click
  document.getElementById('snippetModal').addEventListener('click', (e) => {
    if (e.target.id === 'snippetModal') {
      hideSnippetModal();
    }
  });
}

// Switch tab
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    }
  });
  
  // Update tab content
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
    if (content.id === tabName) {
      content.classList.add('active');
    }
  });
}

// Save settings
async function saveSettings() {
  const newSettings = {
    privacyMode: document.getElementById('privacyMode').checked,
    theme: document.getElementById('themeSelect').value,
    whisperMode: document.getElementById('whisperMode').checked,
    autoComplete: document.getElementById('autoComplete').checked,
    language: document.getElementById('languageSelect').value
  };
  
  await chrome.storage.local.set(newSettings);
  currentSettings = { ...currentSettings, ...newSettings };
  
  showToast('Settings saved successfully!');
  
  // Update privacy badge
  const badge = document.getElementById('privacyBadge');
  if (newSettings.privacyMode) {
    badge.style.background = 'rgba(16, 185, 129, 0.3)';
  } else {
    badge.style.background = 'rgba(255, 255, 255, 0.2)';
  }
}

// Reset statistics
async function resetStats() {
  if (confirm('Are you sure you want to reset all statistics?')) {
    const emptyStats = {
      totalWords: 0,
      sessionsCount: 0,
      avgSentenceLength: 0,
      toneDistribution: { formal: 0, casual: 0, neutral: 0 }
    };
    
    await chrome.storage.local.set({ writingStats: emptyStats });
    await loadStats();
    showToast('Statistics reset');
  }
}

// Open side panel
function openSidePanel() {
  chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT })
    .catch(err => {
      console.error('Error opening side panel:', err);
      showToast('Could not open side panel');
    });
}

// Show snippet modal
function showSnippetModal() {
  document.getElementById('snippetModal').style.display = 'flex';
  document.getElementById('snippetTitle').value = '';
  document.getElementById('snippetContent').value = '';
  document.getElementById('snippetTitle').focus();
}

// Hide snippet modal
function hideSnippetModal() {
  document.getElementById('snippetModal').style.display = 'none';
}

// Save snippet
async function saveSnippet() {
  const title = document.getElementById('snippetTitle').value.trim();
  const content = document.getElementById('snippetContent').value.trim();
  
  if (!title || !content) {
    alert('Please fill in both title and content');
    return;
  }
  
  snippets.push({ title, content, createdAt: Date.now() });
  await chrome.storage.local.set({ snippets });
  
  hideSnippetModal();
  renderSnippets();
  showToast('Snippet saved!');
}

// Upload style profile
function uploadStyleProfile() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt,.md';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target.result;
      const profile = analyzeWritingStyle(content);
      
      await chrome.storage.local.set({ styleProfile: profile });
      showToast('Writing style profile created!');
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}

// Analyze writing style from sample
function analyzeWritingStyle(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = text.split(/\s+/);
  
  const avgSentenceLength = sentences.reduce((sum, s) => 
    sum + s.split(/\s+/).length, 0) / sentences.length;
  
  const avgWordLength = words.reduce((sum, w) => 
    sum + w.length, 0) / words.length;
  
  // Detect common phrases
  const commonPhrases = extractCommonPhrases(sentences);
  
  return {
    avgSentenceLength: Math.round(avgSentenceLength),
    avgWordLength: avgWordLength.toFixed(1),
    commonPhrases,
    sampleSize: sentences.length,
    createdAt: Date.now()
  };
}

// Extract common phrases
function extractCommonPhrases(sentences) {
  const phrases = {};
  
  sentences.forEach(sentence => {
    const words = sentence.toLowerCase().trim().split(/\s+/);
    
    // Look for 2-3 word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = words.slice(i, i + 2).join(' ');
      phrases[phrase] = (phrases[phrase] || 0) + 1;
    }
  });
  
  // Return top 5 phrases
  return Object.entries(phrases)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([phrase]) => phrase);
}

// Show toast notification
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    animation: slideUp 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// Utility functions
function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      transform: translateX(-50%) translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateX(-50%) translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes fadeOut {
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(-10px);
    }
  }
`;
document.head.appendChild(style);