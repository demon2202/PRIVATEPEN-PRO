
# 🖋️ PRIVATEPEN-PRO

<div align="center">
   
[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini%203-8E75B2)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)]()
[![React](https://img.shields.io/badge/React-18-61DAFB)]()
[![Vite](https://img.shields.io/badge/Vite-4.0-646CFF)]()

**The Next-Generation AI Writing Assistant for Chrome**

*Context-Aware Grammar Checking • Tone Analysis • Instant Rewriting • Multi-Language Support*

[View Demo](#-screenshots) • [Report Bug](https://github.com/yourusername/privatepen-pro/issues) • [Request Feature](https://github.com/yourusername/privatepen-pro/issues)

</div>

---

## 📖 Table of Contents
- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Architecture & How It Works](#-architecture--how-it-works)
- [Code Deep Dive](#-code-deep-dive)
- [Tech Stack](#-tech-stack)
- [Installation & Setup](#-installation--setup)
- [Usage Guide](#-usage-guide)
- [Project Structure](#-project-structure)
- [Future Roadmap](#-future-roadmap)
- [Contributing](#-contributing)

---

## 🚀 Project Overview

**PrivatePen-Pro** is a sophisticated Chrome Extension and Web Application designed to integrate advanced AI capabilities directly into the browser's writing workflow. Unlike traditional regex-based spellcheckers, PrivatePen utilizes **Google's Gemini 3 Flash & Pro models** to understand the *semantics*, *context*, and *tone* of text.

Whether drafting emails in a Side Panel or correcting blog posts via an injected Floating Toolbar, the application ensures data privacy, high performance, and linguistically accurate results across any language.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **🧠 Neural Grammar Engine** | Uses LLMs to detect complex sentence structure errors, awkward phrasing, and context-dependent spelling mistakes. |
| **🎨 Emotional Tone Radar** | Visualizes writing style (Formal, Friendly, Aggressive, Professional) using interactive **Recharts** radar graphs. |
| **🔄 Contextual Rewriting** | Instantly transforms text styles (e.g., "Make it Professional", "Make it Pirate", "Summarize") while preserving meaning. |
| **🌐 Polyglot Core** | Built-in support for any language. Users can type "French" or "Klingon" in settings, and the AI adapts its output language and cultural nuances. |
| **⚡ Floating Injection** | A content script injects a lightweight toolbar into any webpage when text is selected, offering immediate AI assistance without leaving the tab. |
| **🎙️ Speech-to-Text** | Integrated Web Speech API support for dictation and hands-free drafting. |
| **💾 Smart Storage** | Abstracted storage layer that syncs user history, templates, and settings across devices (via Chrome Sync) or local storage (Dev mode). |

---

## 🏗️ Architecture & How It Works

PrivatePen-Pro follows a hybrid **Chrome Extension (Manifest V3)** and **Single Page Application (SPA)** architecture.

### 1. The Core Loop
1.  **Input:** User selects text (Content Script) or types in the Editor (Side Panel).
2.  **State Management:** React Context (`StorageContext`, `SettingsContext`) captures the input.
3.  **Service Layer:** The application calls `geminiService.ts`.
4.  **AI Processing:**
    *   **Gemini 3 Flash:** Used for low-latency tasks like Grammar Checking and Tone Analysis.
    *   **Gemini 3 Pro:** Used for complex creative tasks like Rewriting and Expansion.
5.  **Response Handling:** The AI returns either raw text or structured JSON (via `responseSchema`), which is parsed and rendered in the UI.

### 2. Extension Components
*   **Side Panel:** The main dashboard. Persistent, allows for long-form writing and history management.
*   **Content Scripts:** Isolated JavaScript environments that run on web pages (`content.ts`). They detect text selection, calculate DOM coordinates, and render the React `FloatingToolbar` component into the DOM shadow root (or container).
*   **Background Service Worker:** Handles context menu events and cross-origin logic if necessary.

---

## 💻 Code Deep Dive

Here is an explanation of the critical logic blocks in the application for developers.

### 🧠 `services/geminiService.ts` (The Brain)
This file handles all interactions with the Google GenAI SDK.

*   **JSON Enforcement:** To ensure the Grammar Checker returns data we can programmatically highlight, we use `responseMimeType: "application/json"` and define a strict `responseSchema`.
    ```typescript
    // Example: Enforcing structured output for grammar
    responseSchema: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
            original: { type: Type.STRING },
            suggestion: { type: Type.STRING },
            // ...
        }
      }
    }
    ```
*   **Prompt Engineering:** We use `systemInstruction` to define the persona (e.g., "You are a strict grammar checker" or "You are an expert linguist").

### 📝 `components/Editor.tsx` (The Interface)
The core writing component.
*   **State Management:** Uses complex state for `text`, `history` (Undo/Redo stack), and `suggestions`.
*   **Selection Handling:** Detects `selectionStart` and `selectionEnd` on the textarea to allow the AI to process *only* specific parts of the text.
*   **Real-time Visualization:** Integrates `Recharts` to render the `ToneAnalysis` data returned by the API.

### 💉 `content.ts` & `FloatingToolbar.tsx` (The Injection)
*   **Event Listeners:** `content.ts` listens for `mouseup` events globally.
*   **Coordinate Calculation:** Calculates the `DOMRect` of the selected text to position the toolbar directly above the cursor.
*   **Isolation:** Renders a separate React Root specifically for the toolbar to ensure styles don't conflict with the host webpage.

---

## 🛠 Tech Stack

*   **Frontend:** [React 18](https://reactjs.org/) (Component-based UI)
*   **Language:** [TypeScript](https://www.typescriptlang.org/) (Type safety & strict interfaces)
*   **Build Tool:** [Vite](https://vitejs.dev/) (Fast HMR & efficient bundling for extensions)
*   **AI Engine:** [Google Gemini API](https://ai.google.dev/) (`@google/genai` SDK)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Utility-first styling)
*   **Icons:** [Lucide React](https://lucide.dev/) (Consistent, lightweight icons)
*   **Data Viz:** [Recharts](https://recharts.org/) (Radar charts for tone analysis)

---

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v16+)
*   npm or yarn
*   A Google Cloud Project with **Gemini API** enabled.

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/privatepen-pro.git
cd privatepen-pro
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory.
```bash
touch .env
```
Add your API key (Get it from [Google AI Studio](https://aistudio.google.com/)):
```env
API_KEY=your_gemini_api_key_here
```

### 4. Build for Chrome
To create the production build:
```bash
npm run build
```
This generates a `dist` folder containing the manifest, compiled JS, and assets.

### 5. Load into Chrome
1.  Open Chrome and navigate to `chrome://extensions/`.
2.  Enable **Developer mode** (top right switch).
3.  Click **Load unpacked**.
4.  Select the `dist` folder generated in Step 4.

> **Developer Tip:** You can run `npm run dev` to launch the app in a web browser for UI testing, though Chrome-specific APIs (like `chrome.storage`) will be mocked.

---

## 🎮 Usage Guide

### Using the Side Panel
1.  Click the extension icon in the Chrome toolbar.
2.  Click **"Open Editor"**.
3.  **Drafting:** Type normally.
4.  **Grammar:** Click the "Fix" button. Red underlines will appear. Click them to accept changes.
5.  **Tone:** Click "Tone" -> "Analyze" to see the radar chart.
6.  **Language:** Go to Settings tab and type your target language (e.g., "Spanish").

### Using the Floating Assistant
1.  Highlight text on **any** website.
2.  The **PrivatePen Toolbar** will appear.
3.  Select **Fix**, **Rewrite**, or **Summarize**.
4.  Click **Replace** to overwrite the selected text with the AI version.

---

## 📂 Project Structure

```text
privatepen-pro/
├── public/              # Static assets (icons)
├── src/
│   ├── components/      # React UI Components
│   │   ├── Editor.tsx       # Main text editor logic
│   │   ├── FloatingToolbar.tsx # Injected widget
│   │   └── ...
│   ├── contexts/        # React Context (Auth, Settings, Storage)
│   ├── services/        # Business Logic
│   │   ├── geminiService.ts # AI integration
│   │   └── storageService.ts # Chrome storage wrapper
│   ├── background.ts    # Extension background worker
│   ├── content.ts       # Content script entry
│   ├── App.tsx          # Main routing
│   └── manifest.json    # Extension configuration
├── dist/                # Production build output
├── vite.config.ts       # Vite configuration
└── package.json         # Dependencies
```

---

## 🔮 Future Roadmap

*   [ ] **Context Awareness:** Allow the AI to read the entire webpage content to provide context-aware replies (e.g., for email replies).
*   [ ] **Custom Personas:** Create and save custom AI personalities (e.g., "My Brand Voice").
*   [ ] **PDF Support:** Ability to upload and summarize PDF documents.
*   [ ] **Team Sync:** Share templates and dictionaries across a team.

---

## 🖼️ Screenshots

*(Placeholder for screenshots - Add images of the Side Panel, Radar Chart, and Floating Toolbar here)*

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  
