import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, MessageSquare, Globe, Settings, 
  Cpu, Sparkles, Zap, Shield, Target, ArrowRight, Menu, X, Send 
} from 'lucide-react';
import { generateAIResponse } from './services/geminiService';

const App: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat'); // Tab management
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Close sidebar on mobile when tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false); // Mobile optimized: auto-close drawer
  };

  if (!showChat) {
    return (
      <div className="min-h-screen bg-[#020617] text-white relative flex flex-col items-center justify-center p-6 text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 blur-[120px] rounded-full z-0"></div>
        <div className="relative z-10">
          <Sparkles className="text-emerald-400 mb-4 mx-auto" size={48} />
          <h1 className="text-4xl font-extrabold mb-4">Alpha Ultimate Ltd.</h1>
          <p className="text-gray-400 mb-8 max-w-sm">Leading AI Innovation in Riyadh. Ready to start, Shaon?</p>
          <button onClick={() => setShowChat(true)} className="px-8 py-4 bg-emerald-500 text-black font-bold rounded-2xl flex items-center gap-2 mx-auto shadow-lg">
            Launch Your AI Dost <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    if (!input.trim()) return;
    const newMsgs = [...messages, { role: 'user', content: input }];
    setMessages(newMsgs);
    setInput("");
    setIsTyping(true);
    try {
      const res = await generateAIResponse(input);
      setMessages([...newMsgs, { role: 'ai', content: res }]);
    } catch (e) { console.error(e); } finally { setIsTyping(false); }
  };

  return (
    <div className="flex h-screen w-full bg-[#020617] text-gray-100 overflow-hidden relative">
      
      {/* 📱 Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 🏛️ Optimized Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0f172a] border-r border-white/10 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-out flex flex-col shadow-2xl`}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="text-emerald-500" size={28} />
            <span className="text-lg font-bold">Alpha Ultimate</span>
          </div>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}><X /></button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {[
            { id: 'chat', icon: MessageSquare, label: 'AI Chat' },
            { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'market', icon: Globe, label: 'Market Analysis' },
            { id: 'settings', icon: Settings, label: 'Settings' }
          ].map((item) => (
            <button 
              key={item.id} 
              onClick={() => handleTabChange(item.id)}
              className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all ${activeTab === item.id ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'hover:bg-white/5 text-gray-400'}`}
            >
              <item.icon size={22} />
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={() => setShowChat(false)} className="p-6 text-sm text-gray-500 hover:text-white">← Back to Home</button>
      </aside>

      {/* 🚀 Main Display */}
      <main className="flex-1 flex flex-col h-full w-full relative">
        <header className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-[#020617]/80 backdrop-blur-md">
          <button className="md:hidden p-2 bg-white/5 rounded-xl text-emerald-400" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-500/60">{activeTab} Mode</div>
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg">S</div>
        </header>

        {/* Dynamic Content Sections */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeTab === 'chat' && (
             <div className="space-y-6 max-w-3xl mx-auto">
                {messages.length === 0 ? (
                  <div className="h-[60vh] flex flex-col items-center justify-center text-center opacity-50">
                    <Zap size={64} className="mb-4 text-emerald-500" />
                    <p className="text-xl">What's on your mind, Shaon?</p>
                  </div>
                ) : (
                  messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-emerald-600 text-white' : 'bg-white/10 border border-white/10 text-gray-100'}`}>
                        {m.content}
                      </div>
                    </div>
                  ))
                )}
                {isTyping && <div className="text-emerald-400 animate-pulse text-sm">Dost is processing...</div>}
             </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl mx-auto p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
              <Settings className="mx-auto mb-4 text-emerald-400" size={48} />
              <h2 className="text-2xl font-bold mb-2">System Settings</h2>
              <p className="text-gray-400">Manage your AI API keys and Profile settings here.</p>
              <button className="mt-6 px-6 py-2 bg-white/10 rounded-xl">Edit Profile</button>
            </div>
          )}

          {activeTab !== 'chat' && activeTab !== 'settings' && (
            <div className="text-center mt-20 text-gray-500 italic">This module is being optimized for Shaon's Infinix...</div>
          )}
        </div>

        {/* Fixed Bottom Input for Chat */}
        {activeTab === 'chat' && (
          <div className="p-4 md:p-8 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent">
            <div className="max-w-3xl mx-auto relative flex gap-2">
              <input 
                value={input} 
                onChange={(e)=>setInput(e.target.value)} 
                onKeyPress={(e)=>e.key==='Enter'&&handleSend()} 
                className="flex-1 p-4 bg-white/10 border border-white/10 rounded-2xl focus:border-emerald-500 outline-none text-white text-lg" 
                placeholder="Talk to Dost..." 
              />
              <button onClick={handleSend} className="p-4 bg-emerald-500 text-black rounded-2xl shadow-xl active:scale-95 transition-transform"><Send size={24}/></button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
