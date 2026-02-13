import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { CodeEditor } from './assets/CodeEditor';
import { VisionArea } from './assets/VisionArea';
import { VideoStudio } from './components/VideoStudio';
import { SubscriptionPage } from './components/SubscriptionPage';
import { AuthPage } from './components/AuthPage';
import { CreatorPanel } from './components/CreatorPanel';
import { SettingsPage } from './components/SettingsPage';
import { BackgroundGrid, VoiceVisualizer, ErrorBoundary } from './components/Visuals';
import { Footer } from './components/Footer';
import { Message, Role, ViewMode, ChatSession, User } from './types';
import { streamResponse, generateTitle, GeminiAttachment } from './services/geminiService';
import { updateUserProfile } from './services/authService';
import { Menu, Users, LogOut, Zap, Clock, Calendar, Check, Camera, Edit2, Save, User as UserIcon, CheckCircle, Upload, FileText } from 'lucide-react';
import { THEMES } from './constants';
import { useGlobal } from './contexts/GlobalContext';

const AppContent: React.FC = () => {
  const { language, speak, cancelSpeech, t, settings } = useGlobal(); 
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('yusra_sessions');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [view, setView] = useState<ViewMode>('chat');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [isLoading, setIsLoading] = useState(false);
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); 
  const [isLiveMode, setIsLiveMode] = useState(false); 
  const [isConversationActive, setIsConversationActive] = useState(false); 
  
  const [voiceText, setVoiceText] = useState("");
  
  const [profileEditName, setProfileEditName] = useState("");
  const profileFileRef = useRef<HTMLInputElement>(null);
  const headerFileInputRef = useRef<HTMLInputElement>(null);

  const conversationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAiBusyRef = useRef(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const themeConfig = THEMES[settings.theme] || THEMES['cyber'];
    document.documentElement.style.setProperty('--primary-rgb', themeConfig.primary);
    document.documentElement.style.setProperty('--secondary-rgb', themeConfig.secondary);
  }, [settings.theme]);
  
  useEffect(() => {
    const storedUser = localStorage.getItem('yusra_auth_token');
    if (storedUser) {
        try {
            setCurrentUser(JSON.parse(storedUser));
        } catch (e) {
            localStorage.removeItem('yusra_auth_token');
        }
    }
  }, []);

  useEffect(() => {
      if(currentUser) setProfileEditName(currentUser.name);
  }, [currentUser]);

  const handleLogout = () => {
      setCurrentUser(null);
      localStorage.removeItem('yusra_auth_token');
      setView('chat');
      speak(language === 'en' ? "Signing out. Session terminated." : "সাইন আউট করা হচ্ছে। সেশন সমাপ্ত।", true);
  };

  const handleProfileUpdate = async () => {
      if (!currentUser) return;
      try {
          const updated = await updateUserProfile(currentUser.id, { name: profileEditName });
          setCurrentUser(updated);
          localStorage.setItem('yusra_auth_token', JSON.stringify(updated));
          speak(language === 'en' ? "Profile updated successfully." : "প্রোফাইল আপডেট সফল হয়েছে।");
      } catch (e) {
          speak("Error updating profile.");
      }
  };

  const handleProfilePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!currentUser || !e.target.files?.[0]) return;
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64 = reader.result as string;
          const updated = await updateUserProfile(currentUser.id, { photoUrl: base64 });
          setCurrentUser(updated);
          localStorage.setItem('yusra_auth_token', JSON.stringify(updated));
          speak(language === 'en' ? "Avatar updated." : "অবতার আপডেট হয়েছে।");
      };
      reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (currentUser) {
       localStorage.setItem('yusra_sessions', JSON.stringify(sessions));
    }
  }, [sessions, currentUser]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const resetConversationTimeout = useCallback(() => {
    if (conversationTimeoutRef.current) clearTimeout(conversationTimeoutRef.current);
    if (isConversationActive) {
      conversationTimeoutRef.current = setTimeout(() => {
        setIsConversationActive(false);
        const timeoutText = language === 'en' ? "Going to standby." : "স্ট্যান্ডবাই মোডে যাচ্ছি।";
        speak(timeoutText, false);
         try { (window as any).recognition.start(); } catch {}
      }, 20000); 
    }
  }, [isConversationActive, speak, language]);

  useEffect(() => {
    resetConversationTimeout();
    return () => { if (conversationTimeoutRef.current) clearTimeout(conversationTimeoutRef.current); };
  }, [isConversationActive, resetConversationTimeout]);

  const handleSendMessageRef = useRef<(text: string, attachments: File[]) => Promise<void>>(async () => {});

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = false; 
    recognition.interimResults = false;
    let speechLang = 'en-US';
    if (language === 'bn') speechLang = 'bn-BD';
    if (language === 'ar') speechLang = 'ar-SA';
    recognition.lang = speechLang;
    
    recognition.onstart = () => {
        setIsListening(true);
        cancelSpeech();
        setIsSpeaking(false);
    };

    recognition.onresult = (event: any) => {
      cancelSpeech();
      const text = event.results[0][0].transcript;
      const lowerText = text.toLowerCase().trim();
      setIsListening(false);
      
      if ((window as any).isLiveModeRef.current) {
        if ((window as any).isConversationActiveRef.current) {
          resetConversationTimeout();
          if (['stop', 'cancel', 'bye', 'goodbye', 'sleep', 'off'].includes(lowerText.replace(/[.,!]/g, ''))) {
             setIsConversationActive(false);
             const byeText = language === 'en' ? "Goodbye." : "বিদায়।";
             speak(byeText);
             setTimeout(() => { try { recognition.start(); } catch {} }, 1500);
             return;
          }
          handleSendMessageRef.current(text, []);
        } else {
          const wakeWord = settings.wakeWord || 'Yusra';
          const wakeWordPattern = new RegExp(`^(hi|hey|hello|ok|okay|salam|marhaba)?\\s*${wakeWord}`, 'i');
          const match = text.match(wakeWordPattern);
          
          if (match) {
            setIsConversationActive(true);
            const command = text.replace(match[0], '').trim();
            if (command.length > 2) {
               handleSendMessageRef.current(command, []);
            } else {
               let greeting = "I'm here.";
               if(language === 'bn') greeting = "আমি আছি।";
               if(language === 'ar') greeting = "أنا هنا.";
               speak(greeting);
               setTimeout(() => { try { recognition.start(); } catch {} }, 1000);
            }
          } else {
             setTimeout(() => { try { recognition.start(); } catch {} }, 500);
          }
        }
      } else {
        if (text && text.trim().length > 0) handleSendMessageRef.current(text, []);
      }
    };
    
    recognition.onerror = () => {
        setIsListening(false);
        if ((window as any).isLiveModeRef.current) {
            setTimeout(() => { try { recognition.start(); } catch {} }, 1000);
        }
    };
    
    recognition.onend = () => {
      setIsListening(false);
      if ((window as any).isLiveModeRef.current && !isAiBusyRef.current) {
         setTimeout(() => { try { if ((window as any).isLiveModeRef.current && !isAiBusyRef.current) recognition.start(); } catch(e) {} }, 300);
      }
    };
    (window as any).recognition = recognition;
  }, [language, resetConversationTimeout, speak, cancelSpeech, settings.wakeWord]);

  useEffect(() => {
    (window as any).isLiveModeRef = { current: isLiveMode };
    (window as any).isConversationActiveRef = { current: isConversationActive };
  }, [isLiveMode, isConversationActive]);

  const toggleVoice = useCallback(() => {
    const recognition = (window as any).recognition;
    if (!recognition) { alert("Voice input is not supported in your browser."); return; }
    let speechLang = 'en-US';
    if (language === 'bn') speechLang = 'bn-BD';
    if (language === 'ar') speechLang = 'ar-SA';
    recognition.lang = speechLang;

    if (isListening) { recognition.stop(); setIsListening(false); } 
    else { try { recognition.start(); setIsListening(true); } catch (e) { } }
  }, [isListening, language]);

  const toggleLiveMode = () => {
    const newMode = !isLiveMode;
    setIsLiveMode(newMode);
    if (newMode) {
      setIsConversationActive(false); 
      const activeText = language === 'en' ? `Voice system active. Say Hi ${settings.wakeWord || 'Yusra'}.` : `ভয়েস সিস্টেম সক্রিয়। হাই ${settings.wakeWord || 'ইউসরা'} বলুন।`;
      speak(activeText);
      toggleVoice();
    } else {
      setIsConversationActive(false);
      cancelSpeech();
      const recognition = (window as any).recognition;
      if (recognition) recognition.stop();
    }
  };

  const handleSendMessage = async (text: string, attachments: File[]) => {
    if (isLoading) return;
    isAiBusyRef.current = true;
    const recognition = (window as any).recognition;
    if (recognition) recognition.stop();

    const geminiAttachments: GeminiAttachment[] = [];
    const uiAttachments: any[] = [];

    for (const file of attachments) {
      const reader = new FileReader();
      const base64Data = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      
      const cleanBase64 = base64Data.split(',')[1];
      geminiAttachments.push({
        mimeType: file.type || 'application/octet-stream',
        data: cleanBase64
      });

      if (file.type.startsWith('image/')) {
        uiAttachments.push({ id: Date.now().toString() + Math.random(), type: 'image', url: base64Data });
      }
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: text,
      timestamp: Date.now(),
      attachments: uiAttachments,
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      currentSessionId = Date.now().toString();
      setActiveSessionId(currentSessionId);
      const newSession: ChatSession = { id: currentSessionId, title: language === 'en' ? "New Conversation" : "নতুন আলাপ", messages: [userMsg], createdAt: Date.now() };
      setSessions(prev => [newSession, ...prev]);
      generateTitle(text).then(title => {
        setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, title } : s));
      });
    } else {
      setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [...s.messages, userMsg] } : s));
    }

    try {
      const assistantMsgId = (Date.now() + 1).toString();
      const assistantMsgSkeleton: Message = { id: assistantMsgId, role: Role.ASSISTANT, content: "", timestamp: Date.now() };
      setMessages(prev => [...prev, assistantMsgSkeleton]);

      setIsSpeaking(true);

      const options = {
          useThinking: settings.thinkingMode,
          groundingTool: settings.groundingTool,
      };

      const finalResponse = await streamResponse(text, geminiAttachments, (chunkText) => {
        setMessages(prev => prev.map(msg => msg.id === assistantMsgId ? { ...msg, content: chunkText } : msg));
      }, options);

      const groundingMetadata = finalResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const metadata = groundingMetadata ? {
          search: groundingMetadata.filter((c: any) => c.web),
          maps: groundingMetadata.filter((c: any) => c.maps)
      } : undefined;

      const fullText = finalResponse.candidates?.[0]?.content?.parts?.[0]?.text || "";

      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) return { ...s, messages: [...s.messages, { ...assistantMsgSkeleton, content: fullText, groundingMetadata: metadata }] };
        return s;
      }));
      
      if (settings.autoSpeak || (window as any).isLiveModeRef.current) {
         speak(fullText);
         const estimatedTime = fullText.length * 60 + 1000;
         setTimeout(() => {
             isAiBusyRef.current = false;
             setIsSpeaking(false);
             if ((window as any).isLiveModeRef.current) try { (window as any).recognition.start(); } catch {}
         }, estimatedTime);
      } else {
         isAiBusyRef.current = false;
         setIsSpeaking(false);
      }
    } catch (error) {
      isAiBusyRef.current = false;
      setIsSpeaking(false);
      const errorMsg = "⚠️ Connection Error. Please try again.";
      setMessages(prev => prev.map(msg => msg.role === Role.ASSISTANT && !msg.content ? { ...msg, content: errorMsg } : msg));
      if ((window as any).isLiveModeRef.current) try { (window as any).recognition.start(); } catch {}
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { handleSendMessageRef.current = handleSendMessage; }, [handleSendMessage, settings]);

  const startNewChat = () => { setMessages([]); setActiveSessionId(null); setView('chat'); if(window.innerWidth < 768) setIsSidebarOpen(false); speak(t('new_chat')); };
  const loadSession = (session: ChatSession) => { setActiveSessionId(session.id); setMessages(session.messages); setView('chat'); if(window.innerWidth < 768) setIsSidebarOpen(false); };
  const deleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) startNewChat();
  };

  const formattedDate = React.useMemo(() => {
    const day = currentTime.getDate();
    const suffix = ["th", "st", "nd", "rd"][((day % 10 > 3) || (Math.floor(day % 100 / 10) === 1)) ? 0 : day % 10];
    const month = currentTime.toLocaleString(language === 'en' ? 'en-US' : language === 'bn' ? 'bn-BD' : 'ar-SA', { month: 'long' });
    const year = currentTime.getFullYear().toString().slice(-2);
    return `${day}${suffix} ${month} ${year}`;
  }, [currentTime, language]);

  const formattedTime = currentTime.toLocaleTimeString(language === 'en' ? 'en-US' : language === 'bn' ? 'bn-BD' : 'ar-SA', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }).toLowerCase();

  if (!currentUser) {
    return <AuthPage onLogin={setCurrentUser} />;
  }

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden text-sm md:text-base font-sans relative bg-deep-0 transition-colors duration-500">
      <BackgroundGrid />
      
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-deep-1/90 backdrop-blur border-b border-white/5 z-[60] flex items-center px-4 justify-between safe-top shadow-lg">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-cyan-400 p-2">
            <Menu size={24} />
          </button>
          <span className="font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 text-lg">YUSRA</span>
        </div>
        <div className="flex items-center gap-4">
             <div className="hidden sm:block text-xs font-mono font-bold text-[#00ff41] tabular-nums tracking-wider">{formattedTime}</div>
             <button onClick={() => setView('profile')} className="text-cyan-400 p-1">
               <Users size={20} />
             </button>
            <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-pink-500 animate-pulse' : 'bg-gray-500'}`}></div>
        </div>
      </div>

      <Sidebar 
        currentView={view} 
        onViewChange={setView} 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewChat={startNewChat}
        sessionCount={sessions.length}
        userRole={currentUser.role}
      />

      <main className="flex-1 flex flex-col relative h-full pt-16 md:pt-0 transition-all duration-300 overflow-hidden w-full z-0">
        <header className="hidden md:flex h-[70px] items-center justify-between px-6 border-b border-cyan-dim/30 bg-deep-1/50 backdrop-blur-sm z-30 shrink-0 relative">
          <div className="flex items-center gap-8">
            <div className="flex flex-col justify-center min-w-[120px]">
              <div className="text-xl font-mono font-bold text-[#00ff41] drop-shadow-[0_0_10px_rgba(0,255,65,0.6)] leading-none tracking-widest tabular-nums">
                {formattedTime}
              </div>
              <div className="text-[10px] font-display text-cyan-600/80 tracking-[0.2em] mt-1 uppercase text-right">
                {formattedDate}
              </div>
            </div>
            
            <div className="h-8 w-[1px] bg-white/5"></div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-cyan-dim/10 border border-cyan-dim/30 rounded text-xs font-mono text-cyan-400 tracking-wider">
                {t('status_online')}
              </div>
              
              {isLiveMode && (
                <div className={`flex items-center gap-2 px-3 py-1 border rounded text-xs font-mono transition-all duration-500 ${isConversationActive ? 'bg-pink-500/10 border-pink-500/30 text-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.2)]' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'}`}>
                   <Zap size={10} fill={isConversationActive ? "currentColor" : "none"} className={isConversationActive ? "animate-pulse" : ""} /> 
                   {isConversationActive ? 'ACTIVE LISTENING' : 'STANDBY MODE'}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 transition-colors ${isListening ? 'bg-deep-2 shadow-[0_0_15px_rgba(0,242,255,0.1)]' : 'bg-deep-1'}`}>
                <div className={`w-2 h-2 rounded-full transition-all ${isListening ? 'bg-pink-500 animate-ping scale-110' : 'bg-gray-500'}`}></div>
                <span className={`text-xs font-mono transition-colors ${isListening ? 'text-pink-400' : 'text-gray-400'}`}>
                  {isListening ? t('mic_active') : t('mic_ready')}
                </span>
             </div>
             
             <button 
                onClick={() => setView('profile')}
                className="p-2 text-cyan-400 hover:text-white hover:bg-white/10 rounded-full transition-all border border-transparent hover:border-cyan-400/30"
                title="My Identity"
             >
                <Users size={20} />
             </button>

             <div className="relative group flex items-center gap-3">
                <div className="text-right">
                    <div className="text-xs font-bold text-white">{currentUser.name}</div>
                    <div className="text-[10px] text-cyan-400 font-mono uppercase">{currentUser.role === Role.CREATOR ? 'System Admin' : currentUser.plan}</div>
                </div>
                
                <div 
                    className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-pink-500 p-[1px] relative overflow-hidden transition-transform group-hover:scale-105 cursor-pointer"
                    onClick={() => setView('profile')}
                    title="Open User Settings"
                >
                    <img src={currentUser.photoUrl || "https://ui-avatars.com/api/?background=random"} alt="User" className="w-full h-full rounded-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Camera size={14} className="text-white" />
                    </div>
                </div>
                
                <div className="absolute top-full right-0 mt-2 w-40 bg-deep-2 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                    <button 
                        onClick={() => setView('profile')}
                        className="w-full flex items-center gap-2 px-4 py-3 text-xs text-gray-300 hover:bg-white/5 border-b border-white/5 transition-colors"
                    >
                        <Upload size={14} className="text-cyan-400" /> User Settings
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-3 text-xs text-red-400 hover:bg-white/5 transition-colors"
                    >
                        <LogOut size={14} /> Disconnect
                    </button>
                </div>
                <input type="file" ref={headerFileInputRef} onChange={handleProfilePhotoUpload} className="hidden" accept="image/*" />
             </div>
          </div>
        </header>

        {view === 'chat' && (
          <ChatArea 
            messages={messages} 
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            isStreaming={isLoading}
            onVoiceInput={toggleVoice}
            isListening={isListening}
            isLiveMode={isLiveMode}
            isConversationActive={isConversationActive}
            onToggleLiveMode={toggleLiveMode}
            voiceText={voiceText}
            onVoiceTextConsumed={() => setVoiceText("")}
            userPlan={currentUser.plan}
          />
        )}

        {view === 'code' && (
          <CodeEditor userPlan={currentUser.plan} />
        )}
        
        {view === 'vision' && (
           <VisionArea userPlan={currentUser.plan} />
        )}

        {view === 'video-studio' && (
           <VideoStudio />
        )}

        {view === 'files' && (
          <div className="flex-1 flex items-center justify-center text-gray-500 animate-fade-in flex-col">
              <div className="w-24 h-24 bg-deep-2 rounded-full flex items-center justify-center mb-6 border border-white/5">
                  <FileText size={48} className="opacity-50 text-orange-400" />
              </div>
              <h2 className="text-xl font-display font-bold text-white mb-2">FILE SYSTEM</h2>
              <p className="text-sm font-mono text-gray-500">Quantum Storage Access</p>
          </div>
        )}
        
        {view === 'voice' && (
          <div className="flex-1 flex items-center justify-center flex-col gap-8 text-gray-500 animate-fade-in relative z-10 p-4">
              <VoiceVisualizer isListening={isListening} isSpeaking={isSpeaking} />
              <div className="flex flex-col items-center gap-4 max-w-sm w-full">
                 <button 
                   onClick={() => toggleLiveMode()}
                   className={`w-full py-4 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 font-bold tracking-wide ${isLiveMode ? 'bg-red-500/20 border-red-500 text-red-400 hover:bg-red-500/30' : 'bg-cyan-500/20 border-cyan-500 text-cyan-400 hover:bg-cyan-500/30'}`}
                 >
                    <Zap size={20} fill={isLiveMode ? "currentColor" : "none"} />
                    {isLiveMode ? t('voice_deactivate') : t('voice_activate')}
                 </button>
                 <p className="text-xs text-gray-600 font-mono text-center">
                    {isLiveMode ? (language === 'en' ? `System Listening for "Hi ${settings.wakeWord || 'Yusra'}"` : language === 'bn' ? `"হাই ${settings.wakeWord || 'ইউসরা'}" শোনার অপেক্ষায়` : `النظام يستمع لـ "مرحباً ${settings.wakeWord || 'يسرى'}"`) : (language === 'en' ? 'Tap Activate to start Hands-Free Mode' : language === 'bn' ? 'হ্যান্ডস-ফ্রি মোড শুরু করতে সক্রিয় চাপুন' : 'اضغط للتفعيل لبدء وضع التحدث الحر')}
                 </p>
              </div>
          </div>
        )}
        
        {view === 'creator-panel' && (
            <CreatorPanel />
        )}

        {(view === 'profile') && (
            <div className="flex-1 p-4 md:p-8 overflow-y-auto animate-fade-in">
                <div className="max-w-4xl mx-auto bg-deep-2/50 border border-white/5 rounded-2xl p-8 backdrop-blur-md">
                    <h2 className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-3">
                        <UserIcon className="text-cyan-400" /> {t('profile').toUpperCase()}
                    </h2>
                    
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-full border-2 border-cyan-500 p-1 bg-deep-3 overflow-hidden">
                                <img src={currentUser.photoUrl || "https://ui-avatars.com/api/?background=random"} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            </div>
                            <div 
                                onClick={() => profileFileRef.current?.click()}
                                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white font-bold text-xs"
                            >
                                <Camera size={24} className="mb-1" />
                            </div>
                            <input type="file" ref={profileFileRef} onChange={handleProfilePhotoUpload} className="hidden" accept="image/*" />
                        </div>
                        
                        <div className="flex-1 space-y-6 w-full max-w-lg">
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-gray-500">IDENTITY NAME</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={profileEditName}
                                        onChange={(e) => setProfileEditName(e.target.value)}
                                        className="flex-1 bg-deep-1 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-cyan-500/50 outline-none"
                                    />
                                    <button onClick={handleProfileUpdate} className="p-3 bg-cyan-500/10 text-cyan-400 rounded-lg hover:bg-cyan-500/20"><Save size={18} /></button>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-mono text-gray-500">QUANTUM ID</label>
                                <div className="w-full bg-deep-1 border border-white/5 rounded-lg px-4 py-3 text-gray-400 flex items-center gap-2 cursor-not-allowed">
                                    <div className="flex-1">{currentUser.email}</div>
                                    <CheckCircle size={14} className="text-green-500" />
                                </div>
                            </div>

                            <div className="p-4 bg-deep-1 rounded-xl border border-white/5 flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-gray-500 font-mono mb-1">CURRENT PLAN</div>
                                    <div className="text-lg font-bold text-white uppercase">{currentUser.plan}</div>
                                </div>
                                <button onClick={() => setView('subscription')} className="px-4 py-2 bg-pink-500/10 text-pink-400 border border-pink-500/30 rounded-lg text-xs font-bold hover:bg-pink-500/20">
                                    UPGRADE
                                </button>
                            </div>

                            <div className="p-4 bg-deep-1 rounded-xl border border-white/5">
                                <div className="text-xs text-gray-500 font-mono mb-2">PHOTO UPLOAD</div>
                                <button 
                                  onClick={() => profileFileRef.current?.click()}
                                  className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-colors"
                                >
                                  <Upload size={16} /> Upload New Avatar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {view === 'history' && (
          <div className="flex-1 p-4 md:p-8 overflow-y-auto no-scrollbar">
             <div className="max-w-6xl mx-auto">
               <h2 className="text-xl md:text-2xl font-display font-bold text-cyan-400 mb-6 flex items-center gap-3">
                  <Clock className="text-pink-500" /> {t('history').toUpperCase()}
               </h2>
               
               {sessions.length === 0 ? (
                 <div className="text-center py-20 text-gray-500">
                   <Clock size={48} className="mx-auto mb-4 opacity-20" />
                   <p>{language === 'en' ? "No recorded quantum signatures." : language === 'bn' ? "কোনো রেকর্ড পাওয়া যায়নি।" : "لم يتم العثور على سجلات."}</p>
                   <button onClick={startNewChat} className="mt-4 text-cyan-400 hover:underline">{t('new_chat')}</button>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessions.map(session => (
                       <div 
                         key={session.id} 
                         onClick={() => loadSession(session)}
                         className={`
                           group p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden
                           ${activeSessionId === session.id 
                             ? 'bg-cyan-900/10 border-cyan-500/50 shadow-[0_0_20px_rgba(0,242,255,0.1)]' 
                             : 'bg-deep-2 border-white/5 hover:border-cyan-400/30 hover:bg-deep-2/80'}
                         `}
                       >
                         <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-cyan-400/10 transition-colors"></div>
                         
                         <div className="flex justify-between items-start mb-3 relative z-10">
                           <div className="w-8 h-8 rounded-lg bg-deep-1 flex items-center justify-center text-cyan-400 border border-white/5">
                             <Clock size={16} />
                           </div>
                           <button 
                             onClick={(e) => deleteSession(e, session.id)}
                             className="text-gray-600 hover:text-red-400 transition-colors p-1"
                             title="Delete Session"
                           >
                             <LogOut size={16} />
                           </button>
                         </div>
                         
                         <h3 className="font-medium text-gray-200 mb-2 line-clamp-2 min-h-[40px] group-hover:text-cyan-300 transition-colors relative z-10">
                           {session.title}
                         </h3>
                         
                         <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono relative z-10">
                           <div className="flex items-center gap-1">
                             <Calendar size={10} />
                             {new Date(session.createdAt).toLocaleDateString()}
                           </div>
                           <div className="flex items-center gap-1">
                             <Clock size={10} />
                             {new Date(session.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                           </div>
                         </div>
                         
                         <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                       </div>
                    ))}
                 </div>
               )}
             </div>
          </div>
        )}

        {view === 'subscription' && (
           <SubscriptionPage />
        )}

        {view === 'settings' && (
           <SettingsPage onLogout={handleLogout} />
        )}

        <Footer />
      </main>
    </div>
  );
};

export default AppContent;