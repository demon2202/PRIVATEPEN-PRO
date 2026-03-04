
import { Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  checkGrammar: true,
  checkTone: true,
  theme: 'light',
  language: 'en-US',
  customApiKey: ''
};

export const MODELS = {
  FLASH: 'gemini-3-flash-preview',
  PRO: 'gemini-3-pro-preview'
};

export const REWRITE_STYLES = [
  { id: 'formal', label: 'Formal', prompt: 'Rewrite this text to be formal, polite, and respectful. Avoid slang and contractions.' },
  { id: 'professional', label: 'Professional', prompt: 'Rewrite this text to be more professional and business-appropriate. Maintain clarity and precision.' },
  { id: 'casual', label: 'Casual', prompt: 'Rewrite this text to be casual, friendly, and conversational. Use natural language.' },
  { id: 'concise', label: 'Concise', prompt: 'Make this text concise and direct. Remove unnecessary words and redundancy without losing meaning.' },
  { id: 'creative', label: 'Creative', prompt: 'Rewrite this text in a creative and engaging way. Use evocative language and varied sentence structure.' },
  { id: 'academic', label: 'Academic', prompt: 'Rewrite this text in an academic style. Use sophisticated vocabulary and structured phrasing.' },
  { id: 'persuasive', label: 'Persuasive', prompt: 'Rewrite this text to be more persuasive and compelling. Focus on strong verbs and convincing arguments.' }
];

export const TEMPLATES = [
  {
    id: 'email-pro',
    name: 'Professional Email',
    content: "Dear [Name],\n\nI hope this email finds you well.\n\nI am writing to discuss [Topic].\n\nBest regards,\n[Your Name]"
  },
  {
    id: 'email-casual',
    name: 'Casual Email',
    content: "Hey [Name],\n\nJust wanted to check in about [Topic].\n\nCheers,\n[Your Name]"
  },
  {
    id: 'cover-letter',
    name: 'Cover Letter Intro',
    content: "Dear Hiring Manager,\n\nI am writing to express my strong interest in the [Position] role at [Company]."
  }
];
