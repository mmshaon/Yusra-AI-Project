
import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";
import { DEFAULT_SYSTEM_INSTRUCTION } from "../constants";

// Ensure API Key is available
const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: apiKey });

export interface GeminiAttachment {
  mimeType: string;
  data: string;
}

// --- Audio Decoding Helpers (Guideline Compliant) ---
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodePcmAudio(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
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
): Promise<{ finalResponse: GenerateContentResponse, fullText: string }> => {
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
    
    // FIX: Return both the final response for metadata and the full accumulated text
    return { finalResponse: finalResponse as GenerateContentResponse, fullText };
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
    
    const audioBytes = decodeBase64(base64Audio);
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    // CRITICAL FIX: Use custom decoder for raw PCM data instead of native decodeAudioData
    const audioBuffer = await decodePcmAudio(audioBytes, audioContext, 24000, 1);
    
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
      model: 'gemini-flash-lite-latest', // Corrected: Use valid, fast model
      contents: `Summarize this message into a short, concise chat title (max 5 words): "${message}"`,
    });
    return response.text?.trim() || "New Chat";
  } catch (e) {
    return "New Chat";
  }
};

// New function for the "Dost" app
export const generateAIResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are Dost, an AI assistant for Alpha Ultimate Ltd in Riyadh. Your user is Shaon. Be helpful, concise, and professional. User prompt: "${prompt}"`,
    });
    return response.text || "Sorry, I couldn't think of a response.";
  } catch (error) {
    console.error("Dost AI Error:", error);
    return "There was an error connecting to the AI service.";
  }
};
