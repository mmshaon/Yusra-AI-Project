
export enum Role {
  USER = 'user',
  ASSISTANT = 'assistant',
  CREATOR = 'creator'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  photoUrl?: string;
  plan: 'free' | 'pro' | 'quantum';
  memory?: UserMemory; 
}

export interface UserMemory {
  summary: string;
  topics: string[];
  lastInteraction: number;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  groundingMetadata?: {
    search?: any[];
    maps?: any[];
  };
  isThinking?: boolean;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'audio' | 'video';
  url: string;
  base64?: string;
  mimeType?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
}

export interface AppSettings {
  theme: 'alpha' | 'violet' | 'gold' | 'matrix' | 'danger';
  autoSpeak: boolean;
  voiceRate: number; 
  voicePitch: number; 
  preferredVoiceURI: string | null; 
  soundEffects: boolean;
  memoryEnabled: boolean;
  showTimestamps: boolean;
  groundingTool: 'none' | 'search' | 'maps';
  thinkingMode: boolean;
  wakeWord: string; // New: Custom wake word
}

export type ViewMode = 'chat' | 'code' | 'vision' | 'video-studio' | 'voice' | 'settings' | 'history' | 'subscription' | 'creator-panel' | 'profile' | 'files';

export type Language = 'en' | 'bn' | 'ar';