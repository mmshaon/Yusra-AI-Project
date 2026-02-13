import React from 'react';
import { Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-3 px-4 border-t border-white/5 bg-deep-1/90 backdrop-blur-md text-center shrink-0 z-40 animate-fade-in relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent"></div>
      <div className="flex flex-col items-center justify-center gap-1.5">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] md:text-xs font-mono text-gray-500 uppercase tracking-widest">
          <span className="flex items-center gap-1 group cursor-default">
             Architect <span className="text-cyan-400 font-bold group-hover:text-cyan-300 transition-colors">Mohammad Maynul Hasan Shaon</span>
          </span>
          <span className="hidden sm:inline text-gray-700">|</span>
          <span className="flex items-center gap-1">
             Connect <a href="mailto:yusracmd@gmail.com" className="text-gray-400 hover:text-pink-400 transition-colors">yusracmd@gmail.com</a>
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-600 font-sans font-medium">
           <Cpu size={10} className="text-gray-500" />
           <span>Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-pink-500 font-bold">EAYTek Neural AI</span> Startup</span>
        </div>
      </div>
    </footer>
  );
};