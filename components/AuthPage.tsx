
import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Chrome, ArrowRight, Zap, ShieldCheck, AlertCircle, Fingerprint, Crown, Sparkles, Globe, Volume2, VolumeX, Mic, Megaphone, Gift } from 'lucide-react';
import { login, register, googleLogin, recoverAccount } from '../services/authService';
import { User as UserType } from '../types';
import { APP_NAME, LOGO_URL } from '../constants';
import { LoadingIndicator, BackgroundGrid } from './Visuals';
import { useGlobal } from '../contexts/GlobalContext';
import { Footer } from './Footer';

interface AuthPageProps {
  onLogin: (user: UserType) => void;
}

type AuthMode = 'signin' | 'signup' | 'recovery';

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const { language, setLanguage, t, speak, isVoiceEnabled, toggleVoice, cancelSpeech } = useGlobal();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);

  // Voice Guidance on Mount
  useEffect(() => {
    if (!hasWelcomed) {
      // Small delay to allow browser to be ready
      setTimeout(() => {
        let welcomeText = "";
        if (language === 'en') welcomeText = "Welcome to Yusra AI. I am the virtual clone of Ezreen Al Yusra. System initiated. Please sign in or create your identity.";
        else if (language === 'bn') welcomeText = "ইউসরা এআই-তে স্বাগতম। আমি ইজরিন আল ইউসরার ভার্চুয়াল ক্লোন। সিস্টেম চালু হয়েছে। দয়া করে সাইন ইন করুন অথবা আপনার পরিচয় তৈরি করুন।";
        else if (language === 'ar') welcomeText = "مرحبًا بكم في يسرى للذكاء الاصطناعي. أنا الاستنساخ الافتراضي لإزرين اليسرى. النظام بدأ. يرجى تسجيل الدخول أو إنشاء هويتك.";
        
        // Only speak if voice is enabled (default true)
        if (isVoiceEnabled) {
             speak(welcomeText, true); 
        }
        setHasWelcomed(true);
      }, 800);
    }
  }, [language, speak, hasWelcomed, isVoiceEnabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const user = await login(email, password);
        if (rememberMe) {
          localStorage.setItem('yusra_auth_token', JSON.stringify(user));
        }
        speak(language === 'en' ? "Identity verified. Loading Quantum Core Interface." : "পরিচয় নিশ্চিত করা হয়েছে। কোয়ান্টাম কোর ইন্টারফেস লোড হচ্ছে।");
        onLogin(user);
      } else if (mode === 'signup') {
        const user = await register(name, email, password);
        speak(language === 'en' ? "Identity created. Initializing neural link. Welcome to the network." : "পরিচয় তৈরি হয়েছে। নিউরাল লিংক শুরু হচ্ছে। নেটওয়ার্কে স্বাগতম।");
        onLogin(user);
      } else if (mode === 'recovery') {
        const msg = await recoverAccount(email);
        setSuccess(msg);
        setIsLoading(false); 
        speak(language === 'en' ? "Recovery protocol executed. Check your secure comms." : "পুনরুদ্ধার প্রোটোকল কার্যকর করা হয়েছে। আপনার নিরাপদ যোগাযোগ চেক করুন।");
      }
    } catch (err: any) {
      setError(err.message || "Authentication Failed");
      speak(language === 'en' ? "Access denied. Credentials invalid." : "প্রবেশ নিষিদ্ধ। তথ্য সঠিক নয়।");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
      setIsLoading(true);
      try {
          const user = await googleLogin();
          speak(language === 'en' ? "Google authentication authorized." : "গুগল অনুমোদন সফল হয়েছে।");
          onLogin(user);
      } catch (e) {
          setError("Google Sign-In failed.");
          setIsLoading(false);
      }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccess(null);
    if (newMode === 'signin') speak(t('signin'));
    if (newMode === 'signup') speak(t('register'));
  };

  const cycleLanguage = () => {
      if (language === 'en') setLanguage('bn');
      else if (language === 'bn') setLanguage('ar');
      else setLanguage('en');
  };

  // Creator Notice Box Component
  const NoticeBox = () => (
    <div className="w-full max-w-[440px] mt-8 relative group animate-fade-in-up">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity animate-pulse"></div>
      <div className="relative bg-deep-1 border border-white/10 rounded-xl p-4 flex items-start gap-4 shadow-xl text-left" dir={language === 'ar' ? 'rtl' : 'ltr'}>
         <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg text-white shrink-0 shadow-lg">
            <Megaphone size={20} fill="currentColor" />
         </div>
         <div className="flex-1">
            <h3 className="text-white font-bold text-sm mb-1 flex items-center justify-between">
               <span>{t('notice_title')}</span>
               <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-mono animate-pulse">LIVE</span>
            </h3>
            <p className="text-xs text-gray-200 leading-relaxed">
               <span className="font-bold text-yellow-300">🎉 {t('notice_content')}</span> 
               <br/><span className="text-pink-300 mt-1 block flex items-center gap-1"><Gift size={10} /> {t('notice_offer')}</span>
            </p>
         </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-deep-0 relative overflow-hidden font-sans selection:bg-cyan-500/30">
      <BackgroundGrid />
      
      {/* Intense Colorful Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[150px] animate-orb-1 mix-blend-screen"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-500/20 rounded-full blur-[150px] animate-orb-2 mix-blend-screen"></div>
         <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[180px] animate-pulse mix-blend-screen"></div>
      </div>

      {/* Top Controls */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
         <button 
           onClick={cycleLanguage}
           className="flex items-center gap-2 px-4 py-2 bg-deep-1/80 border border-white/20 rounded-full text-xs font-mono font-bold text-cyan-400 hover:bg-white/10 hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(0,242,255,0.2)]"
         >
            <Globe size={14} />
            {language === 'en' ? 'EN' : language === 'bn' ? 'BN' : 'AR'}
         </button>
         
         <div className="flex bg-deep-1/80 border border-white/20 rounded-full p-1 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
             <button 
               onClick={toggleVoice}
               className={`p-2 rounded-full transition-all ${isVoiceEnabled ? 'bg-cyan-500 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
               title={isVoiceEnabled ? "Voice Enabled" : "Voice Disabled"}
             >
                {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
             </button>
             {isVoiceEnabled && (
                <button
                    onClick={cancelSpeech}
                    className="p-2 rounded-full text-red-400 hover:bg-red-500/20 transition-all ml-1"
                    title="Stop Speaking"
                >
                    <Mic size={16} className="text-red-400" />
                </button>
             )}
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 p-4 pt-12">
        
        {/* Logo & Identity Area */}
        <div className="text-center mb-6 animate-fade-in flex flex-col items-center">
           <div className="w-36 h-36 mx-auto relative mb-6 group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 to-pink-500 blur-[50px] rounded-full animate-pulse opacity-60 group-hover:opacity-80 transition-opacity"></div>
              <img 
                src={LOGO_URL} 
                alt="Yusra Logo" 
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_25px_rgba(0,242,255,0.6)] group-hover:scale-110 transition-transform duration-500" 
              />
              {/* Rotating Ring */}
              <div className="absolute inset-[-10px] border border-white/20 rounded-full animate-[spin_10s_linear_infinite] opacity-50 pointer-events-none"></div>
           </div>
           
           <h1 className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-pink-400 tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] mb-2 animate-text-shimmer bg-[length:200%_auto]">
               {t('welcome_title')}
           </h1>
           
           <div className="mt-2 space-y-2">
              <div className="flex items-center justify-center gap-2 text-cyan-100 text-sm font-medium tracking-wide">
                 <Sparkles size={14} className="text-pink-400 animate-pulse" />
                 <span className="text-glow">{t('welcome_subtitle')}</span>
                 <Sparkles size={14} className="text-pink-400 animate-pulse" />
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-mono uppercase tracking-[0.2em] border-t border-b border-white/10 py-1 w-fit mx-auto">
                 <Crown size={10} className="text-yellow-400" />
                 <span>Architect: Mohammad Maynul Hasan Shaon</span>
              </div>
           </div>
        </div>

        {/* Auth Card - Glassmorphism */}
        <div className="glass-panel rounded-3xl p-8 relative overflow-hidden animate-fade-in-up transform transition-all hover:scale-[1.01] w-full max-w-[440px]">
           {/* Top Highlight Line */}
           <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cyan-500 via-pink-500 to-cyan-500 animate-scan"></div>

           <div className="flex mb-8 bg-black/40 rounded-xl p-1.5 border border-white/10 relative">
              {['signin', 'signup'].map((m) => (
                 <button 
                   key={m}
                   onClick={() => switchMode(m as AuthMode)}
                   className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all z-10 ${mode === m ? 'text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'text-gray-500 hover:text-gray-300'}`}
                 >
                    {m === 'signin' ? t('signin') : t('register')}
                 </button>
              ))}
              <div 
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-cyan-600 to-cyan-500 rounded-lg transition-all duration-500 ease-out shadow-[0_0_20px_rgba(6,182,212,0.4)] ${mode === 'signup' ? 'translate-x-[calc(100%+6px)]' : 'translate-x-0'}`}
              ></div>
           </div>

           {mode === 'recovery' && (
               <div className="mb-6 flex items-center gap-2 text-cyan-400 cursor-pointer hover:text-cyan-300 transition-colors group" onClick={() => switchMode('signin')}>
                  <ArrowRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={14} /> 
                  <span className="text-sm font-bold">Back to Sign In</span>
               </div>
           )}

           <form onSubmit={handleSubmit} className="space-y-6">
              
              {mode === 'signup' && (
                 <div className="space-y-1 group">
                    <label className="text-xs font-mono text-cyan-400 ml-1 uppercase font-bold">{t('name')}</label>
                    <div className="relative">
                       <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                       <input 
                         type="text" 
                         value={name}
                         onChange={(e) => setName(e.target.value)}
                         className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all"
                         placeholder="John Doe"
                         required
                       />
                    </div>
                 </div>
              )}

              <div className="space-y-1 group">
                 <label className="text-xs font-mono text-cyan-400 ml-1 uppercase font-bold">{t('email')}</label>
                 <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all"
                      placeholder="name@example.com"
                      required
                    />
                 </div>
              </div>

              {mode !== 'recovery' && (
                  <div className="space-y-1 group">
                     <label className="text-xs font-mono text-cyan-400 ml-1 uppercase font-bold">{t('password')}</label>
                     <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors" size={18} />
                        <input 
                          type="password" 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all"
                          placeholder="••••••••"
                          required
                        />
                     </div>
                  </div>
              )}

              {/* Extras: Remember Me & Forgot Pass */}
              {mode === 'signin' && (
                 <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white transition-colors">
                       <input 
                         type="checkbox" 
                         checked={rememberMe}
                         onChange={(e) => setRememberMe(e.target.checked)}
                         className="rounded bg-black/40 border-white/20 text-cyan-500 focus:ring-0 cursor-pointer" 
                        />
                       Keep Session Active
                    </label>
                    <button type="button" onClick={() => switchMode('recovery')} className="text-pink-400 hover:text-pink-300 hover:underline transition-colors">
                       Reset Security Key?
                    </button>
                 </div>
              )}

              {/* Status Messages */}
              {error && (
                 <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400 text-sm animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                    <AlertCircle size={18} className="shrink-0" /> <span className="font-bold">{error}</span>
                 </div>
              )}
              {success && (
                 <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-xl flex items-center gap-3 text-green-400 text-sm shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                    <ShieldCheck size={18} className="shrink-0" /> <span className="font-bold">{success}</span>
                 </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-500 hover:to-pink-500 text-white font-bold tracking-widest text-sm shadow-[0_0_25px_rgba(236,72,153,0.4)] hover:shadow-[0_0_40px_rgba(236,72,153,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
              >
                 {isLoading ? (
                    <LoadingIndicator text="Authenticating" />
                 ) : (
                    <>
                       {mode === 'signin' ? t('initiate') : mode === 'signup' ? t('create_id') : 'RECOVER ASSETS'}
                       <Zap size={18} fill="currentColor" className="group-hover:animate-pulse" />
                    </>
                 )}
              </button>

              {/* Divider */}
              {mode !== 'recovery' && (
                  <>
                    <div className="relative flex py-2 items-center opacity-70">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-500 text-[10px] font-mono uppercase tracking-widest">Quantum Authentication</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    <button 
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold flex items-center justify-center gap-3 hover:bg-white/10 hover:border-white/30 transition-all group"
                    >
                        <Chrome size={20} className="text-white group-hover:text-cyan-400 transition-colors" />
                        <span>{t('google_auth')}</span>
                    </button>
                  </>
              )}
           </form>
           
           {/* Decorative Fingerprint */}
           <div className="absolute -bottom-10 -right-10 opacity-[0.03] pointer-events-none rotate-12">
              <Fingerprint size={200} className="text-cyan-500" />
           </div>
        </div>

        {/* Creator Notice Box - MOVED BOTTOM */}
        <NoticeBox />

        <div className="text-center mt-8 text-gray-500 text-[10px] font-mono opacity-60 hover:opacity-100 transition-opacity">
           <p className="flex items-center justify-center gap-2"><ShieldCheck size={10} className="text-green-500"/> SECURE QUANTUM ENCRYPTION ENABLED</p>
           <p className="mt-1">SYSTEM ID: {APP_NAME} v2.5.0 • MAX SECURITY</p>
        </div>
      </div>
      
      {/* Global Footer */}
      <Footer />
    </div>
  );
};
