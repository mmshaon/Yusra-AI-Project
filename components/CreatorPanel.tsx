
import React, { useState, useEffect, useRef } from 'react';
import { Users, Activity, Package, Radio, Server, Database, Upload, Grid, Trash2, Edit2, Brain, FileText, Mic, MicOff, Camera, User as UserIcon, Save, ChevronRight, Zap, FileJson, Terminal, Loader2, X, ShieldAlert, Cpu, Lock } from 'lucide-react';
import { User, Role } from '../types';
import { getAllUsers, deleteUser, updateUserProfile } from '../services/authService';
import { useGlobal } from '../contexts/GlobalContext';
import { ElectricSparkCard } from '../assets/CodeEditor';

interface KnowledgeNode {
    id: string;
    name: string;
    type: string;
    size: number;
    tokens: number;
    status: 'processing' | 'active' | 'error';
    contentSnippet: string;
    timestamp: number;
}

export const CreatorPanel: React.FC = () => {
    const { speak } = useGlobal();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'distribution' | 'system' | 'training'>('dashboard');
    const [users, setUsers] = useState<User[]>([]);
    
    // User Edit State
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState<Partial<User>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Training State
    const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeNode[]>([]);
    const [processingLog, setProcessingLog] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const trainingInputRef = useRef<HTMLInputElement>(null);
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Voice Command State
    const [isListening, setIsListening] = useState(false);
    const [lastCommand, setLastCommand] = useState("");

    useEffect(() => {
        loadUsers();
    }, []);

    // Auto-scroll logs
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [processingLog]);

    // Voice Command Logic
    useEffect(() => {
        if (!isListening) return;

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US'; 

        recognition.onresult = (event: any) => {
            const command = event.results[0][0].transcript.toLowerCase();
            setLastCommand(command);
            processCommand(command);
            setIsListening(false);
        };

        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        
        try { recognition.start(); } catch {}

        return () => recognition.stop();
    }, [isListening]);

    const processCommand = (cmd: string) => {
        if (cmd.includes('dashboard') || cmd.includes('home')) setActiveTab('dashboard');
        else if (cmd.includes('users') || cmd.includes('people')) setActiveTab('users');
        else if (cmd.includes('system') || cmd.includes('core')) setActiveTab('system');
        else if (cmd.includes('training') || cmd.includes('learn')) setActiveTab('training');
        else if (cmd.includes('distribution') || cmd.includes('key')) setActiveTab('distribution');
        else {
            speak("Command not recognized.");
            return;
        }
        speak("Affirmative.");
    };

    const loadUsers = async () => {
        const fetched = await getAllUsers();
        setUsers(fetched);
    };

    const handleUserClick = (user: User) => {
        setSelectedUser(user);
        setEditForm({ ...user });
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditForm(prev => ({ ...prev, photoUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const saveUserChanges = async () => {
        if (selectedUser && editForm) {
            await updateUserProfile(selectedUser.id, editForm);
            speak("User profile updated successfully.");
            setSelectedUser(null);
            loadUsers();
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (confirm("WARNING: Irreversible deletion of neural link. Proceed?")) {
            await deleteUser(id);
            speak("User disconnected from the matrix.");
            if (selectedUser?.id === id) setSelectedUser(null);
            loadUsers();
        }
    };

    // --- Neural Training Logic ---
    const addLog = (msg: string) => {
        const now = new Date();
        const timePart = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const msPart = now.getMilliseconds().toString().padStart(3, '0');
        const timestamp = `${timePart}.${msPart}`;
        setProcessingLog(prev => [...prev, `[${timestamp}] ${msg}`]);
    };

    const handleTrainingUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files) as File[];
            setIsProcessing(true);
            setProcessingLog([]);
            speak("Initiating ingestion protocol.");
            processFilesQueue(files);
        }
        e.target.value = ''; 
    };

    const processFilesQueue = async (files: File[]) => {
        addLog(">> QUANTUM INGESTION SEQUENCE STARTED");
        addLog(`>> DETECTED ${files.length} ARTIFACTS`);
        
        for (const file of files) {
            await processSingleFile(file);
        }
        setIsProcessing(false);
        addLog(">> BATCH COMPLETE. MEMORY UPDATED.");
        speak("Knowledge integration complete.");
    };

    const processSingleFile = (file: File): Promise<void> => {
        return new Promise((resolve) => {
            const nodeId = 'NODE-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            addLog(`Reading stream: ${file.name} (${(file.size/1024).toFixed(2)} KB)`);
            
            const reader = new FileReader();
            
            reader.onload = async (e) => {
                const text = e.target?.result as string;
                const tokenEstimate = Math.ceil(text.length / 4);
                
                setTimeout(() => addLog(`Tokenizing content... Count: ${tokenEstimate}`), 400);
                setTimeout(() => addLog(`Generating embedding vectors (Dim: 1024)...`), 1200);
                setTimeout(() => addLog(`Optimizing neural weights...`), 2000);
                
                setTimeout(() => {
                    const newNode: KnowledgeNode = {
                        id: nodeId,
                        name: file.name,
                        type: file.name.split('.').pop()?.toUpperCase() || 'TXT',
                        size: file.size,
                        tokens: tokenEstimate,
                        status: 'active',
                        contentSnippet: text.slice(0, 100) + "...",
                        timestamp: Date.now()
                    };
                    
                    setKnowledgeBase(prev => [newNode, ...prev]);
                    addLog(`>> SUCCESS: Node ${nodeId} integrated.`);
                    resolve();
                }, 3000);
            };

            reader.onerror = () => {
                addLog(`!! ERROR: Corruption detected in ${file.name}`);
                resolve();
            };

            if (file.type.includes('json') || file.name.endsWith('.json') || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.csv')) {
                reader.readAsText(file);
            } else {
                addLog(`!! SKIP: Binary format ${file.type} requires decoding plugin.`);
                resolve();
            }
        });
    };

    const deleteKnowledgeNode = (id: string) => {
        setKnowledgeBase(prev => prev.filter(n => n.id !== id));
        addLog(`>> SYSTEM: Node ${id} purged from memory.`);
    };

    const stats = [
        { label: 'Active Neurons', value: '8.4M', icon: <Activity className="text-cyan-400" />, change: '+12%' },
        { label: 'Total Users', value: users.length.toString(), icon: <Users className="text-pink-500" />, change: '+5%' },
        { label: 'API Requests', value: '1.2B', icon: <Server className="text-yellow-400" />, change: '+24%' },
        { label: 'Revenue', value: '$124K', icon: <Database className="text-green-400" />, change: '+8%' },
    ];

    return (
        <div className="flex-1 bg-deep-0 relative overflow-hidden h-full flex flex-col font-sans">
             <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #00f2ff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

             <div className="relative z-10 flex-1 flex overflow-hidden">
                 
                 <div className="w-64 bg-deep-1/90 backdrop-blur-xl border-r border-white/5 flex flex-col p-4 shrink-0 z-20">
                     <div className="mb-8 px-2 pt-2">
                         <div className="flex items-center gap-2 mb-1">
                             <ShieldAlert className="text-red-500 animate-pulse" size={20} />
                             <h2 className="text-lg font-display font-bold text-white tracking-widest">CREATOR</h2>
                         </div>
                         <p className="text-[10px] text-gray-500 font-mono tracking-widest pl-7">ROOT ACCESS: GRANTED</p>
                     </div>
                     
                     <div className="mb-6 bg-deep-2/50 rounded-xl p-3 border border-red-500/20">
                        <button 
                            onClick={() => setIsListening(!isListening)}
                            className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-all border ${isListening ? 'bg-red-500 text-white border-red-500 animate-pulse' : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white'}`}
                        >
                            {isListening ? <MicOff size={14}/> : <Mic size={14}/>}
                            {isListening ? 'LISTENING...' : 'VOICE COMMAND'}
                        </button>
                        {lastCommand && <p className="text-[10px] text-red-400 text-center mt-2 font-mono truncate">"{lastCommand}"</p>}
                     </div>

                     <nav className="space-y-1">
                         {[
                             { id: 'dashboard', label: 'Overwatch', icon: Grid },
                             { id: 'users', label: 'User Matrix', icon: Users },
                             { id: 'training', label: 'Neural Training', icon: Brain },
                             { id: 'distribution', label: 'Distribution', icon: Package },
                             { id: 'system', label: 'Core System', icon: Server }
                         ].map(item => (
                             <button 
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)} 
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${activeTab === item.id ? 'bg-red-500/10 text-red-400 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
                            >
                                 <item.icon size={16} /> <span>{item.label}</span>
                             </button>
                         ))}
                     </nav>
                     
                     <div className="mt-auto pt-4 border-t border-white/5">
                         <div className="flex items-center gap-3 px-2">
                             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                             <span className="text-[10px] font-mono text-gray-500 uppercase">System Stable</span>
                         </div>
                     </div>
                 </div>

                 <div className="flex-1 overflow-y-auto p-8 relative scroll-smooth no-scrollbar">
                     
                     <header className="flex justify-between items-center mb-8 sticky top-0 bg-deep-0/80 backdrop-blur-md z-30 py-4 -mt-4 border-b border-white/5">
                         <div>
                             <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                 {activeTab} <ChevronRight className="text-gray-600" size={20} />
                             </h1>
                             <p className="text-gray-500 text-xs font-mono mt-1">SYS_TIME: {new Date().toISOString()}</p>
                         </div>
                         <div className="flex items-center gap-4">
                             <div className="px-3 py-1 bg-red-500/10 border border-red-500/30 rounded text-red-400 text-xs font-bold animate-pulse flex items-center gap-2">
                                 <Radio size={12} /> SECURE FEED
                             </div>
                             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-600 p-[1px] shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                                 <img src="https://ui-avatars.com/api/?name=Shaon+Cmd&background=000&color=fff" className="w-full h-full rounded-full" alt="Creator" />
                             </div>
                         </div>
                     </header>

                     {activeTab === 'dashboard' && (
                         <div className="space-y-8 animate-fade-in">
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                 {stats.map((s, i) => (
                                     <div key={i} className="bg-deep-2/50 border border-white/5 p-6 rounded-2xl relative overflow-hidden group hover:border-red-500/30 transition-all duration-500">
                                         <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-red-500/10 transition-colors"></div>
                                         <div className="flex justify-between items-start mb-4 relative z-10">
                                             <div className="p-3 bg-deep-1 rounded-lg border border-white/5 text-white">{s.icon}</div>
                                             <span className="text-green-400 text-xs font-mono bg-green-400/10 px-2 py-1 rounded border border-green-400/20">{s.change}</span>
                                         </div>
                                         <div className="text-3xl font-display font-bold text-white mb-1 relative z-10">{s.value}</div>
                                         <div className="text-gray-500 text-xs uppercase tracking-wider relative z-10 font-mono">{s.label}</div>
                                     </div>
                                 ))}
                             </div>

                             <div className="h-72 bg-deep-2/30 border border-white/5 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
                                 <h3 className="text-gray-400 font-mono text-xs uppercase mb-6 flex items-center gap-2"><Activity size={14} className="text-red-500"/> Global Neural Activity</h3>
                                 <div className="absolute inset-x-0 bottom-0 h-48 flex items-end justify-between px-6 pb-6 gap-1 opacity-60">
                                     {[...Array(60)].map((_, i) => (
                                         <div 
                                            key={i} 
                                            className="w-full bg-gradient-to-t from-red-600 via-orange-500 to-yellow-400 rounded-t-sm transition-all duration-1000 ease-in-out hover:opacity-100 opacity-80" 
                                            style={{ 
                                                height: `${Math.max(10, Math.random() * 90)}%`,
                                                animation: `pulse ${1 + Math.random()}s infinite`
                                            }}
                                         ></div>
                                     ))}
                                 </div>
                             </div>
                         </div>
                     )}

                     {activeTab === 'users' && (
                         <div className="bg-deep-2/50 border border-white/5 rounded-2xl overflow-hidden animate-fade-in backdrop-blur-sm">
                             <table className="w-full text-left border-collapse">
                                 <thead className="bg-deep-1/80 border-b border-white/5 text-gray-400 text-xs font-mono uppercase">
                                     <tr>
                                         <th className="p-4 pl-6">Identity</th>
                                         <th className="p-4">Access Level</th>
                                         <th className="p-4">Plan</th>
                                         <th className="p-4">Status</th>
                                         <th className="p-4 text-right pr-6">Action</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-white/5 text-sm">
                                     {users.length === 0 ? (
                                         <tr><td colSpan={5} className="p-12 text-center text-gray-500 italic font-mono">No entities found in the matrix.</td></tr>
                                     ) : users.map(user => (
                                         <tr key={user.id} className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => handleUserClick(user)}>
                                             <td className="p-4 pl-6 flex items-center gap-4">
                                                 <div className="w-10 h-10 rounded-full bg-deep-3 p-[1px] relative overflow-hidden border border-white/10 group-hover:border-cyan-400/50 transition-colors">
                                                     {user.photoUrl ? <img src={user.photoUrl} alt="" className="w-full h-full rounded-full object-cover" /> : <div className="w-full h-full bg-gray-700 flex items-center justify-center text-xs font-bold">{user.name.charAt(0)}</div>}
                                                 </div>
                                                 <div>
                                                     <div className="font-bold text-gray-200 group-hover:text-cyan-400 transition-colors">{user.name}</div>
                                                     <div className="text-gray-500 text-xs font-mono">{user.email}</div>
                                                 </div>
                                             </td>
                                             <td className="p-4">
                                                 <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${user.role === Role.CREATOR ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-gray-300 border border-white/10'}`}>{user.role}</span>
                                             </td>
                                             <td className="p-4">
                                                 <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${user.plan === 'quantum' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : user.plan === 'pro' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-gray-700/50 text-gray-400 border border-white/5'}`}>
                                                     {user.plan}
                                                 </span>
                                             </td>
                                             <td className="p-4"><span className="text-green-400 text-xs font-mono flex items-center gap-2"><div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div> ONLINE</span></td>
                                             <td className="p-4 text-right pr-6">
                                                 <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                     <button className="p-2 bg-deep-1 rounded-lg border border-white/10 hover:bg-cyan-500/20 hover:text-cyan-400 hover:border-cyan-500/30"><Edit2 size={14}/></button>
                                                 </div>
                                             </td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                         </div>
                     )}

                     {activeTab === 'training' && (
                         <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <ElectricSparkCard className="p-8 relative group" color="cyan">
                                        <input type="file" ref={trainingInputRef} onChange={handleTrainingUpload} multiple accept=".txt,.json,.md,.csv" className="hidden" />
                                        <div 
                                            className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-cyan-500/50 hover:bg-white/5 transition-all cursor-pointer flex flex-col items-center justify-center h-64 relative z-10"
                                            onClick={() => trainingInputRef.current?.click()}
                                        >
                                            <div className="w-20 h-20 bg-deep-3 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_30px_rgba(0,242,255,0.2)] border border-white/10">
                                                {isProcessing ? <Loader2 className="text-cyan-400 animate-spin" size={32} /> : <Upload className="text-gray-300 group-hover:text-cyan-400" size={32} />}
                                            </div>
                                            <h3 className="text-xl font-bold text-white mb-2 tracking-wide">INITIALIZE NEURAL UPLOAD</h3>
                                            <p className="text-sm text-gray-400 font-mono">
                                                Drag & Drop Knowledge Artifacts (.txt, .json, .md)
                                            </p>
                                            {isProcessing && <p className="text-xs text-cyan-400 font-mono mt-4 animate-pulse">INGESTING DATA STREAMS...</p>}
                                        </div>
                                    </ElectricSparkCard>

                                    <div className="bg-black/90 rounded-xl border border-white/10 flex flex-col h-64 font-mono text-xs shadow-2xl relative overflow-hidden">
                                        <div className="flex items-center justify-between px-4 py-2 bg-deep-1 border-b border-white/10">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Terminal size={12} /> <span className="font-bold">SYSTEM_LOG_V2.log</span>
                                            </div>
                                            <div className="flex gap-1.5">
                                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500"></div>
                                            </div>
                                        </div>
                                        <div ref={logContainerRef} className="flex-1 p-4 overflow-y-auto space-y-1.5 text-gray-300 no-scrollbar relative z-10">
                                            {processingLog.length === 0 && <span className="text-gray-600 italic opacity-50">>> Waiting for input stream...</span>}
                                            {processingLog.map((log, i) => (
                                                <div key={i} className="break-words animate-fade-in-up border-l-2 border-cyan-500/30 pl-2">
                                                    <span className="text-cyan-600 mr-2">{'>'}</span>
                                                    {log}
                                                </div>
                                            ))}
                                            {isProcessing && (
                                                <div className="text-cyan-400 animate-pulse pl-2">_</div>
                                            )}
                                        </div>
                                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] pointer-events-none bg-[length:100%_4px,3px_100%] opacity-20"></div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-deep-2/50 border border-white/5 rounded-xl p-6 backdrop-blur-md">
                                        <h4 className="text-xs text-gray-500 font-mono uppercase mb-4 tracking-widest flex items-center gap-2"><Cpu size={14}/> Node Statistics</h4>
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                                <div className="text-xs text-gray-400">Total Nodes</div>
                                                <div className="text-2xl font-bold text-white font-mono">{knowledgeBase.length.toString().padStart(3, '0')}</div>
                                            </div>
                                            <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                                <div className="text-xs text-gray-400">Token Count</div>
                                                <div className="text-2xl font-bold text-cyan-400 font-mono">{knowledgeBase.reduce((acc, curr) => acc + curr.tokens, 0).toLocaleString()}</div>
                                            </div>
                                            <div className="flex justify-between items-end border-b border-white/5 pb-2">
                                                <div className="text-xs text-gray-400">Memory Usage</div>
                                                <div className="text-2xl font-bold text-pink-400 font-mono">{(knowledgeBase.reduce((acc, curr) => acc + curr.size, 0) / 1024).toFixed(2)} KB</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 rounded-xl relative overflow-hidden bg-deep-1 border border-white/10 group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <h4 className="text-xs text-purple-400 font-mono uppercase mb-3 flex items-center gap-2 relative z-10"><Zap size={14}/> Fine-Tuning Status</h4>
                                        <p className="text-[10px] text-gray-400 leading-relaxed mb-4 relative z