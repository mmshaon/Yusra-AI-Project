
import React, { useState } from 'react';
import { Check, Zap, Cpu, Eye, Shield, Globe, Mail, PlayCircle, MessageSquare, Send, Star, ThumbsUp, User, Crown } from 'lucide-react';

export const SubscriptionPage: React.FC = () => {
  const [feedback, setFeedback] = useState("");
  const [reviews, setReviews] = useState([
    { id: 1, user: "Sarah K.", role: "Quantum User", rating: 5, text: "Yusra's coding capabilities are lightyears ahead. The quantum processing really feels instant. Best AI assistant I've used.", date: "2 days ago" },
    { id: 2, user: "Ahmed R.", role: "Pro User", rating: 5, text: "The voice mode is incredibly natural. It sounds just like a real person! The Bangla pronunciation is flawless.", date: "1 week ago" },
    { id: 3, user: "DevCore System", role: "Enterprise", rating: 5, text: "We integrated Yusra into our workflow for code analysis. Productivity increased by 300%.", date: "3 weeks ago" }
  ]);

  const features = [
    { icon: <Cpu size={20} className="text-cyan-400" />, title: "Quantum Processing", desc: "Access to advanced neural models for complex reasoning." },
    { icon: <Eye size={20} className="text-pink-500" />, title: "Neural Vision 2.0", desc: "Real-time object detection and advanced scene analysis." },
    { icon: <Zap size={20} className="text-yellow-400" />, title: "Zero Latency Voice", desc: "Native, natural voice interactions in multiple languages." },
    { icon: <Shield size={20} className="text-green-400" />, title: "Enterprise Security", desc: "Encrypted sessions and private data handling." },
    { icon: <Globe size={20} className="text-blue-400" />, title: "Multi-Language", desc: "Fluent in Bangla, English, Arabic, and 40+ languages." },
    { icon: <Star size={20} className="text-purple-400" />, title: "Code Lab Pro", desc: "Advanced syntax highlighting and AI code refactoring." },
  ];

  const handleSubmitFeedback = () => {
    if (!feedback.trim()) return;
    setReviews([{ id: Date.now(), user: "You", role: "Guest", rating: 5, text: feedback, date: "Just now" }, ...reviews]);
    setFeedback("");
    alert("Feedback transmitted to Quantum Core Database.");
  };

  return (
    <div className="flex-1 min-h-0 relative overflow-y-auto overflow-x-hidden no-scrollbar bg-deep-0 w-full">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse"></div>
         <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6 md:p-12 flex flex-col items-center">
        
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-900/20 text-cyan-400 text-xs font-mono tracking-widest uppercase">
            System Upgrade Available
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-pink-500 mb-6 drop-shadow-[0_0_15px_rgba(0,242,255,0.3)]">
            UNLOCK QUANTUM POTENTIAL
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Elevate your experience with Yusra's advanced neural architecture. Get faster responses, higher limits, and exclusive access to experimental tools.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mb-20">
          
          {/* Free Tier */}
          <div className="relative group p-1 rounded-2xl bg-gradient-to-b from-white/10 to-transparent hover:from-white/20 transition-all duration-300">
             <div className="bg-deep-1 h-full rounded-xl p-8 border border-white/5 relative overflow-hidden flex flex-col">
                <h3 className="text-2xl font-display font-bold text-gray-300 mb-2">NEURAL LINK</h3>
                <div className="text-4xl font-mono font-bold text-white mb-6">Free</div>
                <p className="text-gray-500 mb-8 text-sm">Essential tools for everyday tasks and basic coding assistance.</p>
                
                <ul className="space-y-4 mb-8 flex-1">
                   {['Standard Response Speed', 'Basic Vision Analysis', 'Community Support', '5 Sessions / Day'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-400 text-sm">
                        <div className="w-5 h-5 rounded-full bg-gray-800 flex items-center justify-center text-gray-500"><Check size={12}/></div>
                        {item}
                      </li>
                   ))}
                </ul>
                
                <button className="w-full py-4 rounded-xl border border-white/10 text-gray-300 font-bold tracking-wider hover:bg-white/5 transition-colors">
                   CURRENT PLAN
                </button>
             </div>
          </div>

          {/* Pro Tier - Animated */}
          <div className="relative group p-1 rounded-2xl">
             <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-pink-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity animate-pulse-glow"></div>
             <div className="bg-deep-2 h-full rounded-xl p-8 border border-cyan-500/30 relative overflow-hidden flex flex-col backdrop-blur-xl">
                {/* Shine Effect */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                
                <div className="flex justify-between items-start mb-2">
                   <h3 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500">QUANTUM CORE</h3>
                   <span className="px-2 py-1 bg-pink-500/20 text-pink-400 text-[10px] font-bold uppercase rounded border border-pink-500/30">Recommended</span>
                </div>
                
                <div className="flex items-baseline gap-1 mb-6">
                   <span className="text-4xl font-mono font-bold text-white">$19</span>
                   <span className="text-gray-500 text-sm">/mo</span>
                </div>
                <p className="text-gray-400 mb-8 text-sm">Full access to advanced vision, voice, and complex reasoning models.</p>
                
                <ul className="space-y-4 mb-8 flex-1">
                   {['Unlimited High-Speed Responses', 'Advanced Vision & Voice Mode', 'Priority Quantum Processing', 'Early Access to New Features', 'Commercial Usage Rights'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-gray-200 text-sm">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-cyan-500 to-pink-500 flex items-center justify-center text-white"><Check size={12}/></div>
                        {item}
                      </li>
                   ))}
                </ul>
                
                <button 
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-bold tracking-wider shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] transition-all active:scale-95 flex items-center justify-center gap-2 group-hover:gap-4 relative overflow-hidden"
                  onClick={() => alert("Redirecting to Secure Payment Gateway...")}
                >
                   <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                   <PlayCircle size={20} fill="currentColor" className="text-white" />
                   SUBSCRIBE NOW
                </button>
                <div className="mt-3 text-center">
                    <span className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
                       <Shield size={10} /> Secure payment managed by Creator
                    </span>
                </div>
             </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="w-full mb-20">
           <h2 className="text-2xl font-display font-bold text-center mb-12 text-gray-200">SYSTEM CAPABILITIES</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                 <div key={i} className="p-6 rounded-xl bg-deep-1 border border-white/5 hover:border-cyan-500/30 transition-colors group">
                    <div className="mb-4 p-3 bg-deep-2 w-fit rounded-lg border border-white/5 group-hover:scale-110 transition-transform duration-300">
                       {f.icon}
                    </div>
                    <h4 className="font-bold text-gray-200 mb-2">{f.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                 </div>
              ))}
           </div>
        </div>

        {/* Creator Info Section */}
        <div className="w-full max-w-4xl mb-20 bg-deep-2/50 border border-white/10 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                <div className="w-32 h-32 md:w-48 md:h-48 shrink-0 relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-pink-500 rounded-full blur opacity-50 animate-pulse"></div>
                    {/* Placeholder for Creator Image - Replace URL below with your actual hosted image URL */}
                    <img 
                        src="https://ui-avatars.com/api/?name=Mohammad+Shaon&size=256&background=000&color=fff" 
                        alt="Mohammad Maynul Hasan Shaon" 
                        className="w-full h-full rounded-full object-cover relative z-10 border-2 border-white/20" 
                    />
                    <div className="absolute bottom-0 right-0 bg-deep-1 p-2 rounded-full border border-white/10 z-20">
                        <Crown size={20} className="text-yellow-400" />
                    </div>
                </div>
                
                <div className="text-center md:text-left">
                    <div className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold tracking-widest uppercase rounded-full mb-3 border border-cyan-500/30">
                        System Architect
                    </div>
                    <h2 className="text-3xl font-display font-bold text-white mb-2">Mohammad Maynul Hasan Shaon</h2>
                    <p className="text-gray-400 mb-6 leading-relaxed max-w-lg">
                        The visionary mind behind Yusra Quantum AI. Dedicated to pushing the boundaries of artificial intelligence to create a legacy for his daughter, Ezreen Al Yusra.
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                        <div className="px-4 py-2 bg-deep-1 rounded-lg border border-white/5 flex items-center gap-2">
                           <Globe size={16} className="text-gray-500" />
                           <span className="text-sm text-gray-300">Global Visionary</span>
                        </div>
                        <div className="px-4 py-2 bg-deep-1 rounded-lg border border-white/5 flex items-center gap-2">
                           <Cpu size={16} className="text-gray-500" />
                           <span className="text-sm text-gray-300">AI Engineer</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* User Feedback & Comments Section */}
        <div className="w-full max-w-5xl mb-20">
            <h2 className="text-2xl font-display font-bold text-center mb-12 text-gray-200 flex items-center justify-center gap-3">
                <MessageSquare className="text-pink-500" /> USER FEEDBACK & REVIEWS
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Feedback Form */}
                <div className="lg:col-span-1 bg-deep-1 p-6 rounded-2xl border border-white/10 h-fit">
                    <h3 className="text-lg font-bold text-white mb-4">Leave a Comment</h3>
                    <p className="text-sm text-gray-400 mb-6">Help us improve the Quantum Core. Your feedback directly influences Yusra's neural training.</p>
                    
                    <div className="space-y-4">
                        <textarea 
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Share your experience..."
                            className="w-full bg-deep-2 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 resize-none h-32"
                        />
                        <button 
                            onClick={handleSubmitFeedback}
                            className="w-full py-3 bg-white/5 hover:bg-cyan-500/20 text-cyan-400 border border-white/5 hover:border-cyan-500/30 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                        >
                            <Send size={18} /> TRANSMIT FEEDBACK
                        </button>
                    </div>
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-4">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-deep-2/50 border border-white/5 rounded-xl p-6 hover:border-white/10 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-900 to-blue-900 flex items-center justify-center text-cyan-400 font-bold">
                                        {review.user.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-sm">{review.user}</div>
                                        <div className="text-[10px] text-cyan-400 uppercase tracking-wider">{review.role}</div>
                                    </div>
                                </div>
                                <div className="flex gap-1 text-yellow-400">
                                    {[...Array(review.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                                </div>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed mb-3">"{review.text}"</p>
                            <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono">
                                <span>{review.date}</span>
                                <button className="flex items-center gap-1 hover:text-cyan-400 transition-colors">
                                    <ThumbsUp size={12} /> Helpful
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Contact Section */}
        <div className="w-full max-w-2xl text-center p-8 rounded-2xl bg-gradient-to-r from-deep-2 to-deep-1 border border-white/5 relative overflow-hidden">
           <div className="absolute inset-0 bg-void-pattern opacity-30"></div>
           <div className="relative z-10">
              <Mail className="mx-auto text-cyan-400 mb-4" size={32} />
              <h3 className="text-xl font-bold text-white mb-2">Enterprise Inquiries</h3>
              <p className="text-gray-400 mb-6">Need a custom solution or API access? Contact our development team.</p>
              <a href="mailto:yusracmd@gmail.com" className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-400/50 hover:text-cyan-400 transition-all text-gray-300 font-mono">
                 yusracmd@gmail.com
              </a>
           </div>
        </div>

      </div>
    </div>
  );
};
