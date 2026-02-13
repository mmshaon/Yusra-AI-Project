
import React from 'react';
import { Zap, Volume2, Globe, Brain, Cpu, RefreshCw, LogOut, Info, Settings as SettingsIcon, Mic, Sliders, PlayCircle } from 'lucide-react';
import { useGlobal } from '../contexts/GlobalContext';
import { THEMES } from '../constants';

export const SettingsPage: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { settings, updateSettings, availableVoices, speak, language, setLanguage } = useGlobal();

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ preferredVoiceURI: e.target.value });
  };

  const testVoice = () => {
    let text = "Voice calibration test. This is my current speaking voice.";
    if (language === 'bn') text = "কণ্ঠস্বর পরীক্ষা। এটি আমার বর্তমান কথা বলার কণ্ঠ।";
    if (language === 'ar') text = "اختبار معايرة الصوت. هذا هو صوتي الحالي.";
    speak(text, true);
  };

  const clearMemory = () => {
      if(confirm("Are you sure you want to wipe Yusra's learned memory for this session?")) {
         // Logic to clear memory (in this mock, just a toast)
         alert("Memory protocols reset.");
      }
  };

  // Helper to check if a voice matches current language
  const isRelevantVoice = (voice: SpeechSynthesisVoice) => {
      if (language === 'bn') return voice.lang.includes('bn') || voice.lang.includes('BD') || voice.lang.includes('IN');
      if (language === 'ar') return voice.lang.includes('ar');
      return voice.lang.startsWith('en');
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto animate-fade-in">
       <div className="max-w-3xl mx-auto">
          <header className="mb-8 flex items-center gap-4 border-b border-white/10 pb-6">
              <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400 border border-cyan-500/20">
                  <SettingsIcon size={24} />
              </div>
              <div>
                  <h2 className="text-2xl font-display font-bold text-white">SYSTEM CONFIGURATION</h2>
                  <p className="text-gray-400 text-sm">Advanced control panel for Yusra Quantum Core</p>
              </div>
          </header>

          <div className="space-y-6">
              
              {/* Section: Visual Interface */}
              <section className="bg-deep-2/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                  <h3 className="text-sm font-mono text-cyan-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                      <Cpu size={16} /> Visual Interface
                  </h3>
                  
                  <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 block mb-3">THEME ENGINE</label>
                            <div className="flex gap-3">
                                {Object.keys(THEMES).map(t => (
                                    <button 
                                        key={t} 
                                        onClick={() => updateSettings({ theme: t as any })}
                                        className={`w-10 h-10 rounded-lg border-2 transition-all duration-300 relative group ${settings.theme === t ? 'border-white scale-110 shadow-lg shadow-white/10' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                        style={{ background: `rgb(${THEMES[t as keyof typeof THEMES].primary})` }}
                                        title={THEMES[t as keyof typeof THEMES].name}
                                    >
                                        {settings.theme === t && <div className="absolute inset-0 bg-white/20 animate-pulse rounded-md"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-3">LANGUAGE MODULE</label>
                            <div className="flex bg-deep-1 rounded-lg p-1 border border-white/5 overflow-hidden">
                                <button 
                                    onClick={() => setLanguage('en')}
                                    className={`flex-1 py-2 text-[10px] md:text-xs font-bold rounded-md transition-all ${language === 'en' ? 'bg-cyan-500 text-white shadow' : 'text-gray-500 hover:text-white'}`}
                                >
                                    EN
                                </button>
                                <button 
                                    onClick={() => setLanguage('bn')}
                                    className={`flex-1 py-2 text-[10px] md:text-xs font-bold rounded-md transition-all ${language === 'bn' ? 'bg-cyan-500 text-white shadow' : 'text-gray-500 hover:text-white'}`}
                                >
                                    BN
                                </button>
                                <button 
                                    onClick={() => setLanguage('ar')}
                                    className={`flex-1 py-2 text-[10px] md:text-xs font-bold rounded-md transition-all ${language === 'ar' ? 'bg-cyan-500 text-white shadow' : 'text-gray-500 hover:text-white'}`}
                                >
                                    AR
                                </button>
                            </div>
                        </div>
                      </div>
                  </div>
              </section>

              {/* Section: Voice Synthesis (Advanced) */}
              <section className="bg-deep-2/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                  <h3 className="text-sm font-mono text-cyan-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                      <Volume2 size={16} /> Audio Synthesis
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                          <div>
                              <label className="flex items-center justify-between text-xs text-gray-400 mb-2">
                                  <span>VOICE ENGINE</span>
                                  <button onClick={testVoice} className="text-cyan-400 flex items-center gap-1 hover:text-white transition-colors">
                                      <PlayCircle size={12} /> Test
                                  </button>
                              </label>
                              <select 
                                value={settings.preferredVoiceURI || ''} 
                                onChange={handleVoiceChange}
                                className="w-full bg-deep-1 border border-white/10 rounded-lg p-3 text-sm text-white focus:border-cyan-500/50 outline-none"
                              >
                                  <option value="">Auto-Detect (Quantum Best Match)</option>
                                  {availableVoices.sort((a,b) => {
                                      // Sort relevant voices to top
                                      const aRel = isRelevantVoice(a);
                                      const bRel = isRelevantVoice(b);
                                      if(aRel && !bRel) return -1;
                                      if(!aRel && bRel) return 1;
                                      return a.name.localeCompare(b.name);
                                  }).map(v => (
                                      <option key={v.voiceURI} value={v.voiceURI} className={isRelevantVoice(v) ? 'bg-cyan-900/30 font-bold' : ''}>
                                          {v.name} ({v.lang}) {isRelevantVoice(v) ? '★' : ''}
                                      </option>
                                  ))}
                              </select>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <div className="flex justify-between mb-2">
                                      <label className="text-xs text-gray-400">SPEED</label>
                                      <span className="text-xs font-mono text-cyan-400">{settings.voiceRate}x</span>
                                  </div>
                                  <input 
                                    type="range" 
                                    min="0.5" max="2" step="0.1" 
                                    value={settings.voiceRate} 
                                    onChange={(e) => updateSettings({ voiceRate: parseFloat(e.target.value) })}
                                    className="w-full accent-cyan-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" 
                                  />
                              </div>
                              <div>
                                  <div className="flex justify-between mb-2">
                                      <label className="text-xs text-gray-400">PITCH</label>
                                      <span className="text-xs font-mono text-pink-400">{settings.voicePitch}</span>
                                  </div>
                                  <input 
                                    type="range" 
                                    min="0.5" max="2" step="0.1" 
                                    value={settings.voicePitch} 
                                    onChange={(e) => updateSettings({ voicePitch: parseFloat(e.target.value) })}
                                    className="w-full accent-pink-500 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer" 
                                  />
                              </div>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-deep-1 rounded-xl border border-white/5">
                              <div>
                                  <div className="text-sm text-gray-200 font-bold">Wake Word</div>
                                  <div className="text-xs text-gray-500">Custom voice activation (Default: Yusra)</div>
                              </div>
                              <input 
                                type="text" 
                                value={settings.wakeWord || 'Yusra'}
                                onChange={(e) => updateSettings({ wakeWord: e.target.value })}
                                className="bg-deep-2 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-cyan-500/50 outline-none w-24 text-center"
                              />
                          </div>
                      </div>
                      
                      <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-deep-1 rounded-xl border border-white/5">
                              <span className="text-sm text-gray-200 font-bold">Auto-Speak Responses</span>
                              <button 
                                onClick={() => updateSettings({ autoSpeak: !settings.autoSpeak })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.autoSpeak ? 'bg-cyan-500' : 'bg-gray-700'}`}
                              >
                                  <div className={`absolute top-1 bottom-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.autoSpeak ? 'left-7' : 'left-1'}`}></div>
                              </button>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-deep-1 rounded-xl border border-white/5">
                              <span className="text-sm text-gray-200 font-bold">Interface Sounds</span>
                              <button 
                                onClick={() => updateSettings({ soundEffects: !settings.soundEffects })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${settings.soundEffects ? 'bg-pink-500' : 'bg-gray-700'}`}
                              >
                                  <div className={`absolute top-1 bottom-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.soundEffects ? 'left-7' : 'left-1'}`}></div>
                              </button>
                          </div>
                      </div>
                  </div>
              </section>

              {/* Section: Quantum Features */}
              <section className="bg-deep-2/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                  <h3 className="text-sm font-mono text-cyan-400 mb-6 uppercase tracking-widest flex items-center gap-2">
                      <Brain size={16} /> Neural Configuration
                  </h3>
                  
                  <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-deep-1 rounded-xl border border-white/5">
                           <div>
                               <div className="text-sm text-gray-200 font-bold">Deep Think Mode</div>
                               <div className="text-xs text-gray-500">Enable Gemini 3 Pro reasoning (Higher token usage)</div>
                           </div>
                           <button 
                             onClick={() => updateSettings({ thinkingMode: !settings.thinkingMode })}
                             className={`w-12 h-6 rounded-full transition-colors relative ${settings.thinkingMode ? 'bg-purple-500' : 'bg-gray-700'}`}
                           >
                               <div className={`absolute top-1 bottom-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.thinkingMode ? 'left-7' : 'left-1'}`}></div>
                           </button>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-deep-1 rounded-xl border border-white/5">
                           <div>
                               <div className="text-sm text-gray-200 font-bold">Memory Retention</div>
                               <div className="text-xs text-gray-500">Allow Yusra to remember context across sessions</div>
                           </div>
                           <div className="flex items-center gap-2">
                               <button onClick={clearMemory} className="p-2 text-red-400 hover:bg-white/5 rounded" title="Reset Memory">
                                  <RefreshCw size={14} />
                               </button>
                               <button 
                                 onClick={() => updateSettings({ memoryEnabled: !settings.memoryEnabled })}
                                 className={`w-12 h-6 rounded-full transition-colors relative ${settings.memoryEnabled ? 'bg-green-500' : 'bg-gray-700'}`}
                               >
                                   <div className={`absolute top-1 bottom-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.memoryEnabled ? 'left-7' : 'left-1'}`}></div>
                               </button>
                           </div>
                      </div>
                  </div>
              </section>

              {/* System Info */}
              <section className="pt-4">
                 <button 
                    onClick={onLogout}
                    className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold rounded-xl border border-red-500/30 flex items-center justify-center gap-2 transition-all"
                 >
                    <LogOut size={18} /> TERMINATE SESSION
                 </button>
                 <div className="text-center mt-6 text-[10px] text-gray-600 font-mono">
                     <p>YUSRA QUANTUM CORE v2.5.0</p>
                     <p>ARCHITECT: MOHAMMAD MAYNUL HASAN SHAON</p>
                     <p>UNIT ID: Y-001-ALPHA</p>
                 </div>
              </section>
          </div>
       </div>
    </div>
  );
};
