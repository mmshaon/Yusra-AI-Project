
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { LOGO_URL } from '../constants';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const BackgroundGrid: React.FC = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-deep-0">
    {/* Dynamic Grid Layer */}
    <div 
      className="absolute inset-0 opacity-[0.05]" 
      style={{
        backgroundImage: `
          linear-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        animation: 'panGrid 60s linear infinite'
      }}
    />
    
    {/* Colorful Nebula Layers */}
    <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-primary/10 rounded-full blur-[120px] animate-orb-1 mix-blend-screen"></div>
    <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-pink-500/10 rounded-full blur-[120px] animate-orb-2 mix-blend-screen"></div>
    <div className="absolute top-[40%] left-[30%] w-[60vw] h-[60vw] bg-purple-500/10 rounded-full blur-[150px] animate-orb-3 mix-blend-screen"></div>

    {/* Digital Noise Texture */}
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
    
    <style>{`
      @keyframes panGrid {
        0% { transform: perspective(1000px) rotateX(10deg) translateY(0); }
        100% { transform: perspective(1000px) rotateX(10deg) translateY(40px); }
      }
    `}</style>
  </div>
);

export const LoadingIndicator: React.FC<{ text?: string }> = ({ text = "Processing" }) => (
  <div className="flex items-center gap-3 p-3 bg-deep-1/50 rounded-xl border border-white/5 w-fit animate-fade-in shadow-[0_0_15px_rgba(59,130,246,0.1)] backdrop-blur-sm">
    <div className="relative w-5 h-5">
      <div className="absolute inset-0 border-2 border-primary/30 rounded-full"></div>
      <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
      <div className="absolute inset-2 bg-primary/20 rounded-full animate-quantum-pulse"></div>
    </div>
    <span className="text-xs font-mono text-primary/80 tracking-widest">{text.toUpperCase()}...</span>
  </div>
);

// --- APPLE INTELLIGENCE / SIRI STYLE ORB VISUALIZER ---
export const VoiceVisualizer: React.FC<{ isListening: boolean; isSpeaking: boolean }> = ({ isListening, isSpeaking }) => {
  return (
    <div className="relative flex items-center justify-center w-full h-[500px] animate-fade-in overflow-hidden">
      <style>{`
        @keyframes siri-pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @keyframes siri-rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes siri-blob {
            0% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
            33% { border-radius: 70% 30% 50% 50% / 30% 30% 70% 70%; }
            66% { border-radius: 100% 60% 60% 100% / 100% 100% 60% 60%; }
            100% { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
        }
      `}</style>

      {/* The Siri Orb Container */}
      <div className={`relative w-[300px] h-[300px] transition-all duration-700 ${isSpeaking ? 'scale-110' : isListening ? 'scale-100' : 'scale-90 opacity-50'}`}>
        
        {/* Glow Layer 1 (Cyan/Blue) */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary via-blue-500 to-purple-600 rounded-full blur-[60px] opacity-60 animate-[siri-pulse_3s_ease-in-out_infinite]"></div>
        
        {/* Glow Layer 2 (Pink/Orange) */}
        <div className="absolute inset-4 bg-gradient-to-bl from-pink-500 via-orange-400 to-yellow-300 rounded-full blur-[50px] opacity-60 animate-[siri-pulse_4s_ease-in-out_infinite_reverse]"></div>

        {/* The Liquid Blob Core */}
        <div 
            className="absolute inset-10 bg-white/10 backdrop-blur-3xl overflow-hidden shadow-[inset_0_0_40px_rgba(255,255,255,0.5)] border border-white/20"
            style={{
                animation: 'siri-blob 10s linear infinite, siri-rotate 20s linear infinite',
                background: `linear-gradient(135deg, rgba(59, 130, 246,0.4), rgba(236,72,153,0.4), rgba(255,255,255,0.2))`
            }}
        >
             {/* Inner reflections */}
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/40 to-transparent opacity-50"></div>
        </div>
        
        {/* Center Logo/Icon */}
        <div className="absolute inset-0 flex items-center justify-center z-20">
             <img src={LOGO_URL} className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] opacity-90" alt="Yusra" />
        </div>
      </div>
      
      {/* Siri-style Text Prompt */}
      <div className="absolute bottom-10 w-full text-center">
        <p className={`font-sans text-2xl font-bold tracking-wide transition-all duration-500 ${isSpeaking ? 'text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-300 scale-105' : isListening ? 'text-white scale-100' : 'text-gray-500'}`}>
          {isSpeaking ? 'Yusra is speaking...' : isListening ? 'Listening...' : '"Hey Yusra"'}
        </p>
        <div className="mt-2 flex justify-center gap-2">
            {[...Array(5)].map((_, i) => (
                <div 
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isListening || isSpeaking ? 'bg-white animate-bounce' : 'bg-gray-600'}`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
            ))}
        </div>
      </div>
    </div>
  );
};

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // FIX: Replaced the constructor with a state class property.
  // This modern syntax correctly initializes state and resolves typing errors
  // where `this.state` and `this.props` were not recognized on the component instance.
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Yusra Quantum Core Error:", error, errorInfo);
  }

  handleReset = () => {
      localStorage.removeItem('yusra_app_settings');
      localStorage.removeItem('yusra_code_content');
      window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-deep-0 flex items-center justify-center p-4 relative overflow-hidden font-sans">
            <BackgroundGrid />
            <div className="relative z-10 max-w-md w-full glass-panel rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(239,68,68,0.2)] animate-fade-in border-red-500/30">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <AlertTriangle className="text-red-500" size={32} />
                </div>
                <h2 className="text-2xl font-display font-bold text-red-500 mb-2">CRITICAL SYSTEM ERROR</h2>
                <p className="text-gray-400 text-sm mb-6">
                    A quantum anomaly has destabilized the interface. Automatic recovery protocols are ready.
                </p>
                <div className="bg-black/30 rounded p-3 mb-6 text-left overflow-auto max-h-32 border border-white/5">
                    <code className="text-xs text-red-400 font-mono">
                        {this.state.error?.message || "Unknown Exception"}
                    </code>
                </div>
                <button 
                    onClick={this.handleReset}
                    className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-red-500/20"
                >
                    <RefreshCw size={18} /> REBOOT SYSTEM
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}
