
import React from 'react';
import { MessageSquare, Code, Eye, Mic, FileText, History, Plus, Settings as SettingsIcon, Crown, ChevronLeft, ChevronRight, X, ShieldAlert, Globe, Film } from 'lucide-react';
import { ViewMode, Role, Language } from '../types';
import { APP_NAME, LOGO_URL } from '../constants';
import { useGlobal } from '../contexts/GlobalContext';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onNewChat: () => void;
  isOpen: boolean;
  toggleSidebar: () => void;
  sessionCount: number;
  userRole?: Role;
}

const NavItem: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  special?: boolean;
  danger?: boolean;
}> = ({ active, onClick, icon, label, isCollapsed, special, danger }) => (
  <div
    onClick={onClick}
    className={`
      relative flex items-center cursor-pointer transition-all duration-300 group
      ${isCollapsed ? 'justify-center w-10 h-10 mx-auto my-2 rounded-xl' : 'px-3 py-3 mx-2 my-1 gap-3 rounded-xl'}
      ${active 
        ? danger ? 'bg-red-500/20 text-red-400' : 'bg-cyan-dim text-cyan' 
        : special 
          ? 'bg-gradient-to-r from-pink-500/10 to-cyan-500/10 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400 border border-white/5 hover:border-pink-500/30' 
          : danger
            ? 'text-red-500 hover:bg-red-500/10'
            : 'text-gray-400 hover:bg-deep-2 hover:text-gray-100'}
    `}
  >
    {/* Active Indicator Line (Expanded Only) */}
    {active && !isCollapsed && (
      <div className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full ${danger ? 'bg-red-500' : 'bg-gradient-to-b from-cyan-400 to-pink-500'}`} />
    )}
    
    {/* Icon Container */}
    <div className={`
      flex items-center justify-center shrink-0 transition-transform duration-300 relative z-10
      ${active && isCollapsed ? (danger ? 'bg-red-500/10 rounded-lg' : 'text-cyan-400') : ''}
    `}>
      {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, {
         className: `transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'} ${active && !isCollapsed ? 'animate-pulse' : ''}`,
         size: isCollapsed ? 20 : 18
      })}
    </div>
    
    {/* Label (Expanded Only) */}
    {!isCollapsed && (
      <span className="font-medium text-sm tracking-wide font-sans truncate transition-opacity duration-300 opacity-100 flex-1">
        {label}
      </span>
    )}
    
    {/* Tooltip (Collapsed Only) */}
    {isCollapsed && (
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-deep-3 border border-white/10 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] pointer-events-none">
        {label}
        {/* Tiny arrow pointing left */}
        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-transparent border-r-deep-3"></div>
      </div>
    )}
  </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onNewChat, isOpen, toggleSidebar, sessionCount, userRole }) => {
  const { language, setLanguage, t, speak } = useGlobal();

  const handleNav = (view: ViewMode) => {
    onViewChange(view);
    if (window.innerWidth < 768) toggleSidebar();
    speak(t(view));
  };

  const cycleLanguage = () => {
      const nextLang: Record<Language, Language> = {
          'en': 'bn',
          'bn': 'ar',
          'ar': 'en'
      };
      setLanguage(nextLang[language]);
  };

  const getLangLabel = () => {
      if (language === 'en') return 'English';
      if (language === 'bn') return 'বাংলা';
      return 'العربية';
  };

  const isCollapsed = !isOpen && typeof window !== 'undefined' && window.innerWidth >= 768;

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] md:hidden animate-fade-in"
          onClick={toggleSidebar}
        />
      )}

      <div 
        className={`
          fixed md:relative top-0 left-0 h-full bg-deep-1/95 border-r border-cyan-dim backdrop-blur-xl transition-[width] duration-300 ease-in-out z-[80] flex flex-col shadow-2xl
          ${isOpen ? 'translate-x-0 w-[280px]' : '-translate-x-full md:translate-x-0 md:w-[72px]'}
        `}
      >
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400 via-pink-500 to-cyan-400 animate-scan bg-[length:200%_100%] opacity-50" />

        {/* Header / Logo */}
        <div className={`flex items-center p-4 border-b border-white/5 h-[70px] shrink-0 ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`flex items-center justify-center relative shrink-0 transition-all duration-300 ${isCollapsed ? 'w-10 h-10' : 'w-10 h-10'}`}>
               <div className="absolute inset-0 bg-cyan-400/20 blur-md rounded-full animate-pulse"></div>
               <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_5px_rgba(0,242,255,0.8)]" />
            </div>
            
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden transition-opacity duration-300 opacity-100">
                <h1 className="font-display text-sm font-bold tracking-[2px] text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 truncate">
                  {APP_NAME}
                </h1>
                <span className="text-[9px] text-gray-500 tracking-[1.5px] uppercase truncate">Quantum Intelligence</span>
              </div>
            )}
          </div>

          <button onClick={toggleSidebar} className="md:hidden text-gray-400 p-1">
             <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 no-scrollbar space-y-1">
          {!isCollapsed && (
            <div className="text-[10px] font-mono font-bold text-gray-600 tracking-widest uppercase mb-2 mt-2 px-4 transition-opacity opacity-100">
              Main Module
            </div>
          )}
          
          <NavItem active={currentView === 'chat'} onClick={() => handleNav('chat')} icon={<MessageSquare />} label={t('chat')} isCollapsed={isCollapsed} />
          <NavItem active={currentView === 'code'} onClick={() => handleNav('code')} icon={<Code />} label={t('code')} isCollapsed={isCollapsed} />
          <NavItem active={currentView === 'files'} onClick={() => handleNav('files')} icon={<FileText />} label="Files" isCollapsed={isCollapsed} />
          <NavItem active={currentView === 'vision'} onClick={() => handleNav('vision')} icon={<Eye />} label={t('vision')} isCollapsed={isCollapsed} />
          <NavItem active={currentView === 'video-studio'} onClick={() => handleNav('video-studio')} icon={<Film />} label="Veo Studio" isCollapsed={isCollapsed} />
          <NavItem active={currentView === 'voice'} onClick={() => handleNav('voice')} icon={<Mic />} label={t('voice')} isCollapsed={isCollapsed} />

          {!isCollapsed && (
            <div className="text-[10px] font-mono font-bold text-gray-600 tracking-widest uppercase mb-2 mt-6 px-4 transition-opacity opacity-100">
              Tools
            </div>
          )}
          
          <NavItem active={currentView === 'history'} onClick={() => handleNav('history')} icon={<History />} label={`${t('history')} (${sessionCount})`} isCollapsed={isCollapsed} />
          
          <div className="my-2 h-[1px] bg-white/5 mx-4"></div>
          
          <NavItem 
            active={currentView === 'subscription'} 
            onClick={() => handleNav('subscription')} 
            icon={<Crown className="text-pink-500 animate-[pulse_3s_infinite]" />} 
            label={t('plan')} 
            isCollapsed={isCollapsed}
            special={true}
          />
          
          {userRole === Role.CREATOR && (
            <>
              <div className="my-2 h-[1px] bg-red-500/20 mx-4"></div>
              <NavItem 
                active={currentView === 'creator-panel'} 
                onClick={() => handleNav('creator-panel')} 
                icon={<ShieldAlert className="text-red-500" />} 
                label={t('creator')} 
                isCollapsed={isCollapsed}
                danger={true}
              />
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-white/5 space-y-1 shrink-0 safe-bottom">
           <NavItem active={false} onClick={onNewChat} icon={<Plus className="text-white" />} label={t('new_chat')} isCollapsed={isCollapsed} />
           <NavItem active={currentView === 'settings'} onClick={() => handleNav('settings')} icon={<SettingsIcon className="text-gray-400" />} label={t('settings')} isCollapsed={isCollapsed} />
           
           {/* Language Switcher */}
           <div 
             onClick={cycleLanguage}
             className={`
               relative flex items-center cursor-pointer transition-all duration-300 group hover:bg-deep-2
               ${isCollapsed ? 'justify-center w-10 h-10 mx-auto my-2 rounded-xl' : 'px-3 py-3 mx-2 my-1 gap-3 rounded-xl'}
             `}
           >
              <div className={`flex items-center justify-center shrink-0 ${!isCollapsed ? 'bg-deep-1 border border-deep-3 rounded-lg p-1 text-gray-400 group-hover:text-cyan-400' : 'text-gray-400 group-hover:text-cyan-400'}`}>
                 <Globe size={isCollapsed ? 20 : 18} />
              </div>
              
              {!isCollapsed && (
                <span className="font-medium text-sm tracking-wide font-sans truncate flex-1 text-gray-400 group-hover:text-cyan-400">
                   {getLangLabel()}
                </span>
              )}

              {/* Tooltip for Language (Collapsed) */}
              {isCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-deep-3 border border-white/10 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100] pointer-events-none">
                  {getLangLabel()}
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-transparent border-r-deep-3"></div>
                </div>
              )}
           </div>
        </div>

        {/* Desktop Collapse Toggle */}
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-deep-2 border border-cyan-dim rounded-full items-center justify-center text-cyan hover:scale-110 transition-transform z-50 hidden md:flex shadow-lg"
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>
    </>
  );
};
