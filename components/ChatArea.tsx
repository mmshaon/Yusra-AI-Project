
import React, { useRef, useEffect, useState } from 'react';
import { Send, Paperclip, Mic, StopCircle, User, Bot, Copy, Volume2, Globe, Zap, Camera, MapPin, Search, Brain, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message, Role } from '../types';
import { LoadingIndicator } from './Visuals';
import { SAMPLE_PROMPTS, LOGO_URL } from '../constants';
import { useGlobal } from '../contexts/GlobalContext';
import { transcribeAudio, generateSpeech } from '../services/geminiService';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (text: string, attachments: File[]) => void;
  isLoading: boolean;
  isStreaming: boolean;
  onStopGeneration?: () => void;
  onVoiceInput: () => void;
  isListening: boolean;
  isLiveMode: boolean;
  isConversationActive: boolean;
  onToggleLiveMode: () => void;
  voiceText?: string;
  onVoiceTextConsumed?: () => void;
  userPlan?: 'free' | 'pro' | 'quantum';
}

export const ChatArea: React.FC<ChatAreaProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  isStreaming,
  onStopGeneration,
  onVoiceInput,
  isListening,
  isLiveMode,
  isConversationActive,
  onToggleLiveMode,
  voiceText,
  onVoiceTextConsumed,
  userPlan = 'free'
}) => {
  const { language, setLanguage, t, settings, updateSettings, speak } = useGlobal();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // Audio Transcription State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const MAX_FILE_SIZE = userPlan === 'free' ? 3 * 1024 * 1024 : 20 * 1024 * 1024; // 3MB vs 20MB

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (voiceText && onVoiceTextConsumed) {
      setInput(prev => (prev ? prev + " " : "") + voiceText);
      onVoiceTextConsumed();
    }
  }, [voiceText, onVoiceTextConsumed]);

  const handleSend = () => {
    if (!input.trim() && attachments.length === 0) return;
    onSendMessage(input, attachments);
    setInput("");
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startAudioRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = (reader.result as string).split(',')[1];
                try {
                    const text = await transcribeAudio(base64, 'audio/webm');
                    setInput(prev => (prev ? prev + " " : "") + text);
                } catch (e) {
                    console.error("Transcription failed", e);
                    speak("Audio transcription failed.");
                }
            };
            reader.readAsDataURL(audioBlob);
            stream.getTracks().forEach(t => t.stop());
        };

        recorder.start();
        setIsRecordingAudio(true);
    } catch (e) {
        console.error("Mic access denied", e);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
        mediaRecorderRef.current.stop();
        setIsRecordingAudio(false);
    }
  };

  const handleTTS = async (text: string) => {
      // Use Gemini TTS if online/enabled, else fallback to global speak
      try {
          const buffer = await generateSpeech(text);
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start(0);
      } catch (e) {
          // Fallback
          speak(text);
      }
  };

  const validateAndAddFiles = (files: File[]) => {
    const validFiles = [];
    const invalidFiles = [];

    for (const file of files) {
      if (file.size <= MAX_FILE_SIZE) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file);
      }
    }

    if (invalidFiles.length > 0) {
      alert(`Some files exceeded the limit (${userPlan === 'free' ? '3MB' : '20MB'}): ${invalidFiles.map(f => f.name).join(', ')}`);
    }

    if (validFiles.length > 0) {
      setAttachments(prev => [...prev, ...validFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateAndAddFiles(Array.from(e.target.files));
    }
    e.target.value = '';
  };

  // Dynamic Placeholder
  let placeholder = t('input_placeholder');
  if (isLiveMode) {
    if (isConversationActive) {
      placeholder = language === 'en' ? "Listening for command..." : "কমান্ডের জন্য শুনছি...";
    } else {
      placeholder = language === 'en' ? "Standby... Say 'Hi Yusra'" : "স্ট্যান্ডবাই... বলুন 'হাই ইউসরা'";
    }
  } else if (isListening) {
    placeholder = language === 'en' ? "Listening..." : "শুনছি...";
  } else if (isRecordingAudio) {
    placeholder = "Recording audio for transcription...";
  }

  return (
    <div className="flex-1 flex flex-col h-full relative z-10 w-full">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 no-scrollbar w-full">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 md:p-8 animate-fade-in w-full">
            {/* Animated Main Logo Empty State */}
            <div className="relative w-32 h-32 mb-6 group shrink-0">
              <div className="absolute inset-0 bg-cyan-400/20 blur-[30px] rounded-full animate-pulse"></div>
              <img 
                src={LOGO_URL} 
                alt="Yusra" 
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_15px_rgba(0,242,255,0.4)] animate-orb-1" 
              />
            </div>
            
            <h2 className="font-display text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 mb-4 tracking-wider">
              {t('welcome_title')}
            </h2>
            <p className="text-gray-400 max-w-md mb-8 font-light leading-relaxed text-sm md:text-base px-2">
              {t('welcome_subtitle')}.
              <br/>
              Dedicated to Mohammad Maynul Hasan Shaon's baby daughter.
              <span className="text-xs font-mono text-cyan-600/70 mt-3 block">Expert in Coding & General Queries</span>
            </p>
            
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 max-w-2xl">
              {SAMPLE_PROMPTS.map((prompt, idx) => (
                <button 
                  key={idx}
                  onClick={() => setInput(prompt.prompt)}
                  className="px-3 py-2 bg-deep-2 border border-white/10 rounded-full text-xs text-gray-300 hover:border-cyan-400 hover:text-cyan-400 transition-all active:scale-95"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-3 md:gap-4 max-w-4xl mx-auto w-full ${msg.role === Role.USER ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center shrink-0 border overflow-hidden relative
                ${msg.role === Role.ASSISTANT 
                  ? 'bg-deep-2 border-cyan-dim shadow-[0_0_10px_rgba(0,242,255,0.2)]' 
                  : 'bg-deep-2 border-pink-500/20 text-pink-500'}
              `}>
                {msg.role === Role.ASSISTANT ? (
                   <img src={LOGO_URL} alt="Yusra" className="w-full h-full object-cover p-1" />
                ) : (
                   <User size={16} />
                )}
              </div>

              {/* Bubble */}
              <div className={`
                flex flex-col gap-1 min-w-[100px] max-w-[85%] md:max-w-[75%]
                ${msg.role === Role.USER ? 'items-end' : 'items-start'}
              `}>
                <div className={`
                  p-3 md:p-4 rounded-2xl text-sm leading-relaxed backdrop-blur-md shadow-xl w-full
                  ${msg.role === Role.USER 
                    ? 'bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-tr-sm text-cyan-50' 
                    : 'bg-deep-2/80 border border-white/5 rounded-tl-sm text-gray-200'}
                `}>
                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {msg.attachments.map((att, i) => (
                        att.type === 'image' && (
                          <img key={i} src={att.url} alt="attachment" className="max-w-full h-auto rounded-lg border border-white/10 max-h-48 object-cover" />
                        )
                      ))}
                    </div>
                  )}

                  {/* Text Content with Markdown */}
                  <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-pre:bg-deep-3 prose-pre:border prose-pre:border-white/10 prose-code:text-cyan-300 break-words">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {/* Grounding Source Display (Search/Maps) */}
                  {(msg.groundingMetadata?.search || msg.groundingMetadata?.maps) && (
                      <div className="mt-3 pt-3 border-t border-white/10 text-xs">
                          {msg.groundingMetadata.search?.map((s: any, i: number) => (
                              <a key={i} href={s.web.uri} target="_blank" rel="noopener noreferrer" className="block text-cyan-400 hover:underline mb-1 flex items-center gap-2">
                                  <Search size={10} /> {s.web.title}
                              </a>
                          ))}
                          {msg.groundingMetadata.maps?.map((m: any, i: number) => (
                              <div key={i} className="mb-1">
                                  <a href={m.web.uri} target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline flex items-center gap-2">
                                      <MapPin size={10} /> {m.web.title}
                                  </a>
                              </div>
                          ))}
                      </div>
                  )}
                </div>
                
                {/* Meta */}
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-mono text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  {msg.role === Role.ASSISTANT && (
                    <>
                      <button className="text-gray-500 hover:text-cyan-400 transition-colors p-1" onClick={() => navigator.clipboard.writeText(msg.content)} title="Copy">
                        <Copy size={12} />
                      </button>
                      <button className="text-gray-500 hover:text-cyan-400 transition-colors p-1" onClick={() => handleTTS(msg.content)} title="Speak">
                        <Volume2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="flex gap-4 max-w-4xl mx-auto px-2">
             <div className="w-8 h-8 rounded-full bg-deep-2 border border-cyan-dim text-cyan-400 flex items-center justify-center shrink-0 p-1">
                <img src={LOGO_URL} alt="Yusra" className="w-full h-full object-cover opacity-70 animate-pulse" />
             </div>
             <LoadingIndicator text={settings.thinkingMode ? "Deep Thinking..." : "Quantum Processing"} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="shrink-0 p-3 md:p-6 bg-deep-1/80 border-t border-white/5 backdrop-blur-xl w-full safe-bottom">
        {attachments.length > 0 && (
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2 no-scrollbar">
            {attachments.map((file, i) => (
              <div key={i} className="relative group shrink-0">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg border border-cyan-dim/30 bg-deep-2 flex items-center justify-center overflow-hidden">
                  {file.type.startsWith('image') 
                    ? <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                    : <span className="text-xs text-gray-400">{file.name.slice(0,8)}...</span>
                  }
                </div>
                <button 
                  onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs z-10"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className={`
          relative max-w-4xl mx-auto flex items-end gap-2 bg-deep-2/50 p-2 rounded-2xl border transition-all shadow-lg
          ${isConversationActive 
             ? 'border-pink-500/80 shadow-[0_0_20px_rgba(236,72,153,0.3)] bg-pink-500/5' 
             : isLiveMode 
               ? 'border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
               : 'border-white/10 focus-within:border-cyan-500/50 focus-within:shadow-[0_0_20px_rgba(0,242,255,0.1)]'}
        `}>
          {/* File Input */}
          <input type="file" multiple ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
          <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} className="hidden" onChange={handleFileSelect} />
          
          <button onClick={() => fileInputRef.current?.click()} className="p-2 md:p-3 text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-xl transition-colors shrink-0" title="Attach Files">
            <Paperclip size={20} />
          </button>

          <button onClick={() => cameraInputRef.current?.click()} className="p-2 md:p-3 text-gray-400 hover:text-pink-500 hover:bg-pink-500/10 rounded-xl transition-colors shrink-0" title="Camera Input">
            <Camera size={20} />
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-0 focus:ring-0 text-gray-100 placeholder-gray-500 resize-none py-3 max-h-[120px] min-h-[44px] no-scrollbar text-sm md:text-base"
            rows={1}
            disabled={isLiveMode && isListening}
            style={{ minHeight: '44px' }}
          />
          
          <div className="flex flex-col gap-1 items-center pb-1 shrink-0">
             {/* Tools / Modes Toggles */}
             <div className="flex gap-1">
                 <button 
                    onClick={() => updateSettings({ thinkingMode: !settings.thinkingMode })}
                    className={`p-1 rounded transition-colors ${settings.thinkingMode ? 'text-purple-400 bg-purple-400/10' : 'text-gray-500 hover:text-purple-400'}`}
                    title="Deep Think Mode"
                 >
                    <Brain size={14} />
                 </button>
                 <button 
                    onClick={() => updateSettings({ groundingTool: settings.groundingTool === 'search' ? 'none' : 'search' })}
                    className={`p-1 rounded transition-colors ${settings.groundingTool === 'search' ? 'text-blue-400 bg-blue-400/10' : 'text-gray-500 hover:text-blue-400'}`}
                    title="Google Search Grounding"
                 >
                    <Search size={14} />
                 </button>
                 <button 
                    onClick={() => updateSettings({ groundingTool: settings.groundingTool === 'maps' ? 'none' : 'maps' })}
                    className={`p-1 rounded transition-colors ${settings.groundingTool === 'maps' ? 'text-green-400 bg-green-400/10' : 'text-gray-500 hover:text-green-400'}`}
                    title="Google Maps Grounding"
                 >
                    <MapPin size={14} />
                 </button>
             </div>

             {input || attachments.length > 0 ? (
                <button onClick={handleSend} className="p-2 md:p-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all">
                  <Send size={20} />
                </button>
              ) : (
                <div className="flex gap-1">
                  {/* Audio Transcription Button */}
                  <button 
                    onClick={isRecordingAudio ? stopAudioRecording : startAudioRecording}
                    className={`p-2 md:p-3 rounded-xl transition-all ${isRecordingAudio ? 'bg-red-500 text-white animate-pulse' : 'text-gray-400 hover:text-red-500 hover:bg-red-500/10'}`}
                    title={isRecordingAudio ? "Stop Recording" : "Transcribe Audio"}
                  >
                     <Mic size={20} />
                  </button>
                  
                  <button 
                    onClick={onToggleLiveMode}
                    className={`p-2 md:p-3 rounded-xl transition-all ${isLiveMode ? (isConversationActive ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]' : 'bg-yellow-500/20 text-yellow-400') : 'text-gray-400 hover:text-pink-500 hover:bg-pink-500/10'}`}
                    title="Toggle Live Voice Mode"
                  >
                    <Zap size={20} fill={isLiveMode ? "currentColor" : "none"} />
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
