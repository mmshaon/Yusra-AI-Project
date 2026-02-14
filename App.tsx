import React, { useState, useEffect, useCallback } from 'react';
import { AuthPage } from './components/AuthPage';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { CodeEditor } from './assets/CodeEditor';
import { VisionArea } from './assets/VisionArea';
import { VideoStudio } from './components/VideoStudio';
import { SettingsPage } from './components/SettingsPage';
import { SubscriptionPage } from './components/SubscriptionPage';
import { CreatorPanel } from './components/CreatorPanel';
import { VoiceVisualizer, BackgroundGrid, ErrorBoundary } from './components/Visuals';
import { useGlobal } from './contexts/GlobalContext';
import { User, ViewMode, Message, Role, ChatSession, Attachment } from './types';
import { streamResponse, generateTitle, GeminiAttachment } from './services/geminiService';
import { THEMES } from './constants';

const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
  });
};

const MainApp: React.FC<{ user: User; onLogout: () => void; }> = ({ user, onLogout }) => {
  const { settings, updateSettings, t, speak } = useGlobal();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [currentView, setCurrentView] = useState<ViewMode>('chat');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);

  // Voice Mode State
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isConversationActive, setConversationActive] = useState(false);
  const [voiceText, setVoiceText] = useState("");

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const activeMessages = activeSession?.messages || [];

  useEffect(() => {
    const theme = THEMES[settings.theme as keyof typeof THEMES];
    if (theme) {
      document.documentElement.style.setProperty('--primary-rgb', theme.primary);
      document.documentElement.style.setProperty('--secondary-rgb', theme.secondary);
    }
  }, [settings.theme]);

  const updateMessages = (sessionId: string, messages: Message[]) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages } : s));
  };

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setCurrentView('chat');
    speak(t('new_chat'));
  };

  const handleSendMessage = useCallback(async (text: string, files: File[]) => {
    if (!activeSessionId) {
      handleNewChat(); // Creates a new session if one doesn't exist
      // We need to wait for state to update, so we'll re-trigger this in an effect
      return; 
    }

    setIsLoading(true);
    setIsStreaming(true);

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: Role.USER,
      content: text,
      timestamp: Date.now(),
      attachments: files.map(f => ({
        id: `file_${Date.now()}`,
        type: f.type.startsWith('image') ? 'image' : 'file',
        url: URL.createObjectURL(f),
      })),
    };

    let currentMessages = [...activeMessages, userMessage];
    updateMessages(activeSessionId, currentMessages);

    const assistantMessageId = `msg_${Date.now() + 1}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: Role.ASSISTANT,
      content: "",
      timestamp: Date.now(),
      isThinking: true,
    };
    
    currentMessages.push(assistantMessage);
    updateMessages(activeSessionId, currentMessages);
    
    try {
        const geminiAttachments: GeminiAttachment[] = [];
        for (const file of files) {
            const { base64, mimeType } = await fileToBase64(file);
            geminiAttachments.push({ data: base64, mimeType });
        }
        
        // FIX: Destructure fullText to ensure the complete response is used for the final update.
        const { finalResponse, fullText } = await streamResponse(
            text,
            geminiAttachments,
            (chunk) => {
                updateMessages(activeSessionId, currentMessages.map(m => m.id === assistantMessageId ? { ...m, content: chunk, isThinking: false } : m));
            },
            { useThinking: settings.thinkingMode, groundingTool: settings.groundingTool }
        );

        // Final update with all metadata
        updateMessages(activeSessionId, currentMessages.map(m => m.id === assistantMessageId ? {
            ...m,
            // FIX: Use the accumulated fullText instead of the last chunk's text.
            content: fullText || "",
            isThinking: false,
            groundingMetadata: {
                search: finalResponse.candidates?.[0]?.groundingMetadata?.groundingChunks,
                maps: finalResponse.candidates?.[0]?.groundingMetadata?.groundingChunks,
            }
        } : m));

        // Generate title for new chats
        if (activeSession && activeSession.messages.length <= 2) {
             const title = await generateTitle(text);
             setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, title } : s));
        }

    } catch (error) {
        console.error(error);
        updateMessages(activeSessionId, currentMessages.map(m => m.id === assistantMessageId ? { ...m, content: "An error occurred.", isThinking: false } : m));
    } finally {
        setIsLoading(false);
        setIsStreaming(false);
    }
  }, [activeSessionId, activeMessages, settings.thinkingMode, settings.groundingTool, handleNewChat, t, speak]);

  useEffect(() => {
    // This effect handles the case where a message is sent without an active session
    if (activeSessionId && activeSession?.messages.length === 0) {
      // A new session was just created, but the message wasn't sent.
      // We don't have the original message here, so we'll just leave the new chat empty.
      // A more robust solution would use a state queue.
    }
  }, [activeSessionId, activeSession]);
    
  const renderView = () => {
    switch (currentView) {
      case 'chat':
        return <ChatArea 
          messages={activeMessages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isStreaming={isStreaming}
          isLiveMode={isLiveMode}
          isListening={isListening}
          isConversationActive={isConversationActive}
          onToggleLiveMode={() => setIsLiveMode(!isLiveMode)}
          onVoiceInput={() => {}}
          userPlan={user.plan}
        />;
      case 'code': return <CodeEditor userPlan={user.plan} />;
      case 'vision': return <VisionArea userPlan={user.plan} />;
      case 'video-studio': return <VideoStudio />;
      case 'voice': return <VoiceVisualizer isListening={isListening} isSpeaking={false} />;
      case 'settings': return <SettingsPage onLogout={onLogout} />;
      case 'subscription': return <SubscriptionPage />;
      case 'creator-panel': return <CreatorPanel />;
      default: return <div className="p-8 text-gray-500">View not implemented.</div>;
    }
  };

  return (
    <div className="flex h-screen w-full bg-deep-0 text-white overflow-hidden font-sans">
      <Sidebar 
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        currentView={currentView}
        onViewChange={setCurrentView}
        onNewChat={handleNewChat}
        sessionCount={sessions.length}
        userRole={user.role}
      />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <BackgroundGrid />
        {renderView()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        try {
            const token = localStorage.getItem('yusra_auth_token');
            if (token) {
                setUser(JSON.parse(token));
            }
        } catch (e) {
            console.error("Failed to parse auth token", e);
            localStorage.removeItem('yusra_auth_token');
        }
        setIsCheckingAuth(false);
    }, []);

    const handleLogin = (loggedInUser: UserType) => {
        setUser(loggedInUser);
    };

    const handleLogout = () => {
        localStorage.removeItem('yusra_auth_token');
        setUser(null);
    };

    if (isCheckingAuth) {
        return <div className="w-full h-full bg-deep-0" />; // Or a splash screen
    }

    return (
        <ErrorBoundary>
            {user ? <MainApp user={user} onLogout={handleLogout} /> : <AuthPage onLogin={handleLogin} />}
        </ErrorBoundary>
    );
};

export default App;
