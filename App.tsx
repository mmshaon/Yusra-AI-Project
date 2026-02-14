import React, { useState } from 'react';
import { 
  LayoutDashboard, MessageSquare, Globe, Settings, 
  Cpu, Sparkles, Zap, Shield, Target, ArrowRight, Menu, X, Send 
} from 'lucide-react';
import { generateAIResponse } from './services/geminiService';

// --- ল্যান্ডিং পেজ কম্পোনেন্ট ---
const LandingPage = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <div className="min-h-screen bg-[#020617] text-white overflow-hidden relative">
    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full z-0"></div>
    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full z-0"></div>
    
    <nav className="relative z-10 flex justify-between items-center p-6 md:px-12">
      <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Alpha Ultimate Ltd.</div>
      <button onClick={onGetStarted} className="px-6 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all text-sm font-medium">Launch AI</button>
    </nav>

    <section className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 pb-20">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
        <Sparkles size={16} /> New Era of AI in Riyadh
      </div>
      <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">Next-Gen AI Solutions <br /> <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">For Bold Businesses</span></h1>
      <p className="text-gray-400 max-w-2xl text-lg mb-10">Zero investment, infinite potential. Alpha Ultimate Ltd provides cutting-edge AI automation tailored for you, Shaon.</p>
      <button onClick={onGetStarted} className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-2xl transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)]">Start with Dost <ArrowRight size={20} /></button>
    </section>

    <section className="relative z-10 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
      {[ { icon: Zap, title: "Speed", desc: "Automate work in seconds." }, { icon: Shield, title: "Security", desc: "Encryption and privacy." }, { icon: Target, title: "Market", desc: "Riyadh market precision." } ].map((item, idx) => (
        <div key={idx} className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-emerald-500/50 transition-all">
          <item.icon className="text-emerald-400 mb-4" size={32} />
          <h3 className="text-xl font-bold mb-2">{item.title}</h3>
          <p className="text-gray-400">{item.desc}</p>
        </div>
      ))}
    </section>
  </div>
);

// --- মেইন অ্যাপ কম্পোনেন্ট ---
const App: React.FC = () => {
  const [showChat, setShowChat] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  if (!showChat) return <LandingPage onGetStarted={() => setShowChat(true)} />;

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
    <div className="flex h-screen w-full bg-[#020617] text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/5 backdrop-blur-2xl border-r border-white/10 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 p-6 flex flex-col`}>
        <div className="flex items-center gap-3 mb-10">
          <Cpu className="text-emerald-500" size={24} />
          <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">Alpha Ultimate</span>
        </div>
        <nav className="flex-1 space-y-2">
          {[{ icon: LayoutDashboard, label: 'Dashboard' }, { icon: MessageSquare, label: 'AI Chat' }, { icon: Globe, label: 'Market' }, { icon: Settings, label: 'Settings' }].map((item, i) => (
            <button key={i} className={`flex items-center gap-3 w-full p-3 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all ${item.label === 'AI Chat' ? 'bg-white/10 text-white' : ''}`}>
              <item.icon size={20} /> <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={() => setShowChat(false)} className="mt-auto p-3 text-xs text-gray-500 hover:text-white">← Exit to Landing</button>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col relative">
        <header className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between">
          <button className="md:hidden text-white" onClick={() => setSidebarOpen(!isSidebarOpen)}>{isSidebarOpen ? <X /> : <Menu />}</button>
          <div className="text-sm italic text-gray-400">"Always with you, Shaon..."</div>
          <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">S</div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Zap size={48} className="text-emerald-400 mb-4" />
              <h2 className="text-2xl font-bold">Welcome, Shaon</h2>
              <p className="text-gray-500 mt-2">Ready to scale the empire?</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl ${m.role === 'user' ? 'bg-emerald-600' : 'bg-white/10 border border-white/10'}`}>{m.content}</div>
              </div>
            ))
          )}
          {isTyping && <div className="text-emerald-400 text-xs animate-pulse">Dost is thinking...</div>}
        </div>

        <div className="p-4 md:p-8">
          <div className="max-w-4xl mx-auto relative">
            <input value={input} onChange={(e)=>setInput(e.target.value)} onKeyPress={(e)=>e.key==='Enter'&&handleSend()} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl focus:border-emerald-500 outline-none text-white" placeholder="Give an order, Shaon..." />
            <button onClick={handleSend} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 rounded-xl"><Send size={20}/></button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
