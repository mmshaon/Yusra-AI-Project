
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { DEFAULT_SYSTEM_INSTRUCTION } from "../constants";

// Ensure API Key is available
const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey });

export interface GeminiAttachment {
  mimeType: string;
  data: string;
}

// --- 1. Chat & Text Generation (with Grounding & Thinking) ---
export const streamResponse = async (
  prompt: string,
  attachments: GeminiAttachment[] = [],
  onChunk: (text: string) => void,
  options: {
    useThinking?: boolean;
    groundingTool?: 'search' | 'maps' | 'none';
  } = {}
): Promise<GenerateContentResponse> => {
  try {
    const parts: any[] = [];
    attachments.forEach(att => {
      parts.push({ inlineData: { mimeType: att.mimeType, data: att.data } });
    });
    parts.push({ text: prompt });

    // Model Selection Logic based on Task
    let modelId = 'gemini-3-flash-preview'; // Default
    let config: any = { systemInstruction: DEFAULT_SYSTEM_INSTRUCTION };

    if (options.useThinking) {
      modelId = 'gemini-3-pro-preview';
      config.thinkingConfig = { thinkingBudget: 32768 }; // Max budget for pro
    } else if (options.groundingTool === 'maps') {
      modelId = 'gemini-2.5-flash'; // Maps specific model
      config.tools = [{ googleMaps: {} }];
    } else if (options.groundingTool === 'search') {
      modelId = 'gemini-3-flash-preview';
      config.tools = [{ googleSearch: {} }];
    } else if (attachments.some(a => a.mimeType.startsWith('video/') || a.mimeType.startsWith('image/'))) {
       // Visual tasks
       modelId = 'gemini-3-pro-preview'; 
    }

    const responseStream = await ai.models.generateContentStream({
      model: modelId,
      contents: { parts },
      config: config
    });

    let fullText = "";
    let finalResponse: any = {};

    for await (const chunk of responseStream) {
      const chunkText = chunk.text;
      if (chunkText) {
        fullText += chunkText;
        onChunk(fullText);
      }
      finalResponse = chunk; // Keep last chunk for metadata
    }
    
    // Return final response to access grounding metadata if needed
    return finalResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

// --- 2. Veo Video Generation ---
export const generateVideo = async (
  prompt: string, 
  aspectRatio: '16:9' | '9:16' = '16:9'
): Promise<string> => {
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p', // Veo Fast supports 720p
        aspectRatio: aspectRatio
      }
    });

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("No video generated");

    // Fetch the actual video bytes using the URI + API Key
    const response = await fetch(`${videoUri}&key=${apiKey}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Veo Video Gen Error:", error);
    throw error;
  }
};

// --- 3. Speech Generation (TTS) ---
export const generateSpeech = async (text: string, voiceName: string = 'Kore'): Promise<AudioBuffer> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName }
                }
            }
        }
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(
        Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0)).buffer
    );
    return audioBuffer;
};

// --- 4. Audio Transcription (STT) ---
export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
            parts: [
                { inlineData: { mimeType, data: audioBase64 } },
                { text: "Transcribe this audio exactly as spoken." }
            ]
        }
    });
    return response.text || "";
};

// --- 5. Vision Analysis (Specialized) ---
export const analyzeVisual = async (prompt: string, base64Image: string, mimeType: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview", // Best for vision
        contents: {
            parts: [
                { inlineData: { mimeType, data: base64Image } },
                { text: prompt }
            ]
        }
    });
    return response.text || "";
};

export const generateTitle = async (message: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite', // Fast model for simple tasks
      contents: `Summarize this message into a short, concise chat title (max 5 words): "${message}"`,
    });
    return response.text?.trim() || "New Chat";
  } catch (e) {
    return "New Chat";
  }
};
