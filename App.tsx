import React, { useState } from 'react';
import { 
  MessageSquare, LayoutDashboard, Globe, Settings, 
  Menu, X, Send, Sparkles, Cpu, ChevronRight 
} from 'lucide-react';
import { generateAIResponse } from './services/geminiService';

const App: React.FC = () => {
  const [isLaunched, setIsLaunched] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

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

  if (!isLaunched) {
    return (
      <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center mb-6 border border-emerald-500/30 animate-pulse">
          <Cpu className="text-emerald-400" size={40} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Alpha Ultimate Ltd.</h1>
        <p className="text-gray-500 text-center mb-8 max-w-[250px]">Riyadh's Premier Quantum AI Intelligence by Shaon</p>
        <button 
          onClick={() => setIsLaunched(true)}
          className="w-full max-w-[280px] py-4 bg-emerald-500 text-black font-bold rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
        >
          Launch Your AI Dost <ChevronRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#020617] text-white flex flex-col overflow-hidden relative">
      
      {/* 🟢 Header */}
      <header className="h-16 flex items-center justify-between px-4 border-b border-white/5 bg-[#020617]/80 backdrop-blur-md z-30">
        <button onClick={() => setIsMenuOpen(true)} className="p-2 text-emerald-400"><Menu size={24} /></button>
        <div className="text-sm font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent uppercase tracking-widest">{activeTab}</div>
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-[10px] font-black">S</div>
      </header>

      {/* 🔴 Sidebar (Mobile Slider) */}
      <div className={`fixed inset-0 z-50 transition-all duration-300 ${isMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
        <aside className={`absolute left-0 top-0 h-full w-72 bg-[#0f172a] p-6 shadow-2xl transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-between items-center mb-10">
            <span className="font-bold text-emerald-400">COMMAND CENTER</span>
            <button onClick={() => setIsMenuOpen(false)}><X /></button>
          </div>
          <nav className="space-y-4">
            {[
              { id: 'chat', icon: MessageSquare, label: 'AI Chat' },
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'market', icon: Globe, label: 'Market' },
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }}
                className={`flex items-center gap-4 w-full p-4 rounded-2xl ${activeTab === item.id ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400'}`}
              >
                <item.icon size={20} /> <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>
      </div>

      {/* 🔵 Main Dynamic Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-32">
        {activeTab === 'chat' && (
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="h-[50vh] flex flex-col items-center justify-center opacity-20">
                <Sparkles size={60} />
                <p className="mt-4">Talk to your Dost, Shaon</p>
              </div>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-emerald-600' : 'bg-white/5 border border-white/10'}`}>{m.content}</div>
                </div>
              ))
            )}
            {isTyping && <div className="text-emerald-400 text-xs animate-pulse">Processing...</div>}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center animate-in fade-in">
            <Settings className="mx-auto text-emerald-400 mb-4" size={40} />
            <h3 className="text-xl font-bold">Settings</h3>
            <p className="text-gray-400 text-sm mt-2">API: Connected (Gemini 1.5 Flash)</p>
            <button className="mt-6 w-full py-3 bg-white/5 rounded-xl border border-white/10">Edit Profile</button>
          </div>
        )}

        {activeTab !== 'chat' && activeTab !== 'settings' && (
          <div className="text-center text-gray-500 italic mt-20">Coming soon for Shaon...</div>
        )}
      </main>

      {/* ⌨️ Chat Input Bar (Sticky Bottom) */}
      {activeTab === 'chat' && (
        <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent z-40">
          <div className="relative flex items-center gap-2 max-w-lg mx-auto">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Order your Dost..."
              className="flex-1 bg-white/10 border border-white/10 p-4 rounded-2xl outline-none focus:border-emerald-500/50"
            />
            <button onClick={handleSend} className="p-4 bg-emerald-500 text-black rounded-2xl shadow-xl shadow-emerald-500/20 active:scale-90 transition-all">
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
