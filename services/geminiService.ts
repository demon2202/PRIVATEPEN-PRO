
import { GoogleGenAI, Type } from "@google/genai";
import { MODELS } from '../constants';
import { ToneAnalysis, Suggestion } from '../types';

const getClient = (apiKey?: string) => {
  const key = apiKey || process.env.API_KEY;
  if (!key) {
    throw new Error("API Key is missing. Please configure it in your environment.");
  }
  return new GoogleGenAI({ apiKey: key });
};

export const geminiService = {
  async checkGrammar(text: string, language: string = 'en-US', apiKey?: string): Promise<Suggestion[]> {
    const client = getClient(apiKey);

    const response = await client.models.generateContent({
      model: MODELS.FLASH,
      contents: `You are a strict grammar checker. Analyze the following text for grammar, spelling, punctuation, and awkward phrasing.
      
      IMPORTANT: The text is written in ${language}. Ensure your analysis respects the rules of ${language}.
      
      Return a STRICT JSON array of objects. Do not include markdown formatting like \`\`\`json.
      
      Text to analyze: "${text}"`,
      config: {
        systemInstruction: "You are a world-class editor. Find errors and suggest fixes. If the text is perfect, return an empty array.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['grammar', 'spelling', 'style'] },
              original: { type: Type.STRING },
              suggestion: { type: Type.STRING },
              explanation: { type: Type.STRING },
              index: { type: Type.INTEGER }
            },
            required: ['id', 'type', 'original', 'suggestion', 'explanation']
          }
        }
      }
    });

    try {
      const cleanText = response.text?.replace(/```json|```/g, '').trim();
      if (cleanText) {
        return JSON.parse(cleanText) as Suggestion[];
      }
      return [];
    } catch (e) {
      console.error("Failed to parse grammar check response", e);
      return [];
    }
  },

  async analyzeTone(text: string, language: string = 'en-US', apiKey?: string): Promise<ToneAnalysis> {
    const client = getClient(apiKey);

    const response = await client.models.generateContent({
      model: MODELS.FLASH,
      contents: `Analyze the tone of this text.
      Text Language: ${language}.
      Text: "${text}"`,
      config: {
        systemInstruction: "You are an expert linguist specializing in tone and sentiment analysis.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            formal: { type: Type.NUMBER },
            casual: { type: Type.NUMBER },
            friendly: { type: Type.NUMBER },
            professional: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER },
            dominant: { type: Type.STRING }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ToneAnalysis;
    }
    throw new Error("No response from AI");
  },

  async improveText(text: string, instruction: string, apiKey?: string, customSystemInstruction?: string, language: string = 'en-US'): Promise<string> {
    const client = getClient(apiKey);

    const sysInstruction = customSystemInstruction || `You are a professional writing assistant. Your goal is to improve clarity, flow, and impact.`;

    const response = await client.models.generateContent({
      model: MODELS.PRO,
      contents: `Task: ${instruction}
      Target Language: ${language}
      Input Text: "${text}"
      
      IMPORTANT: The output must be written in ${language}. If the task asks to change the tone or style, apply that change but ensure the result is in ${language}.
      
      Output (Return ONLY the rewritten text in ${language}):`,
      config: {
        systemInstruction: sysInstruction
      }
    });

    return response.text?.trim() || text;
  },

  async customPrompt(text: string, prompt: string, apiKey?: string): Promise<string> {
    const client = getClient(apiKey);
    
    const response = await client.models.generateContent({
      model: MODELS.PRO,
      contents: `User Command: ${prompt}
      
      Text to Process: "${text}"
      
      Result (Return only the processed text):`,
      config: {
        systemInstruction: "You are a versatile AI writing tool. Execute the user's command on the provided text precisely. If the user asks for a specific style, format, or change, apply it. Do not add conversational filler."
      }
    });

    return response.text?.trim() || "";
  },

  async translateText(text: string, targetLanguage: string, apiKey?: string): Promise<string> {
    const client = getClient(apiKey);

    const response = await client.models.generateContent({
      model: MODELS.FLASH,
      contents: `Translate the following text to ${targetLanguage}. Ensure the tone is preserved. Return only the translated text.
      Text: "${text}"`,
      config: {
        systemInstruction: "You are an expert translator fluent in multiple languages, capable of capturing cultural nuances."
      }
    });

    return response.text || text;
  },

  async summarizeText(text: string, apiKey?: string, language: string = 'en-US'): Promise<string> {
    const client = getClient(apiKey);
    
    const response = await client.models.generateContent({
      model: MODELS.FLASH,
      contents: `Create a concise summary of the following text in ${language}. Capture the main points clearly.
      Text: "${text}"`,
      config: {
        systemInstruction: "You are a precise summarizer. Return only the summary."
      }
    });

    return response.text?.trim() || text;
  },

  async modifyLength(text: string, type: 'shorten' | 'expand', apiKey?: string, language: string = 'en-US'): Promise<string> {
    const client = getClient(apiKey);

    const instruction = type === 'shorten' 
      ? `Make this text more concise and remove redundancy while keeping key information.` 
      : `Expand this text by adding relevant details, examples, and descriptive language to make it more comprehensive. Ensure the new content flows naturally.`;

    const response = await client.models.generateContent({
      model: MODELS.PRO,
      contents: `${instruction}
      
      Target Language: ${language}
      IMPORTANT: Return only the result text in ${language}.
      
      Text: "${text}"`,
      config: {
         systemInstruction: "You are an expert editor."
      }
    });

    return response.text || text;
  },

  async continueWriting(text: string, apiKey?: string, language: string = 'en-US'): Promise<string> {
    const client = getClient(apiKey);
    
    // Grab the last 1500 characters to provide context
    const context = text.slice(-1500);

    const response = await client.models.generateContent({
      model: MODELS.PRO,
      contents: `Continue writing the following text naturally in ${language}. Maintain the existing tone and style. Provide about 2-3 sentences.
      Text Context: "${context}"
      
      Continuation:`,
      config: {
         systemInstruction: "You are a creative co-writer. Mimic the user's style perfectly."
      }
    });

    return response.text || "";
  },

  async getSynonyms(word: string, contextSentence: string, apiKey?: string): Promise<string[]> {
    const client = getClient(apiKey);

    const response = await client.models.generateContent({
      model: MODELS.FLASH,
      contents: `Find 5 synonyms for the word "${word}" that fit the context of this sentence: "${contextSentence}". Return only a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    try {
      const cleanText = response.text?.replace(/```json|```/g, '').trim();
      if (cleanText) {
        return JSON.parse(cleanText) as string[];
      }
      return [];
    } catch (e) {
      return [];
    }
  }
};
