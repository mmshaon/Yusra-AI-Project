

import React, { useState, useRef, useEffect, useMemo, memo } from 'react';
import { Play, Sparkles, Terminal, Palette, Settings, X, RotateCcw, Eye, Paperclip, Upload, Code as CodeIcon, FileText, Check, Camera, Bug, Save, AlertTriangle, Download, Lock } from 'lucide-react';
import { streamResponse, GeminiAttachment } from '../services/geminiService';
import JSZip from 'jszip';

type SyntaxTheme = {
  keyword: string;
  string: string;
  comment: string;
  number: string;
  function: string;
  operator: string;
  default: string;
};

type EditorTheme = {
  name: string;
  bg: string;
  gutterBg: string;
  text: string;
  cursor: string;
  selection: string;
  syntax: SyntaxTheme;
  borderColor: string;
};

const DEFAULT_THEMES: Record<string, EditorTheme> = {
  quantum: { 
    name: 'Quantum Dark', 
    bg: '#050c18', 
    gutterBg: '#020610',
    text: '#e2e8f0', 
    cursor: '#00f2ff', 
    selection: 'rgba(0, 242, 255, 0.2)',
    borderColor: '#00f2ff',
    syntax: {
      keyword: '#f472b6', 
      string: '#fcd34d', 
      comment: '#64748b', 
      number: '#22d3ee', 
      function: '#c084fc', 
      operator: '#67e8f9', 
      default: '#cbd5e1'
    }
  },
  matrix: { 
    name: 'Matrix', 
    bg: '#000000', 
    gutterBg: '#0a0a0a',
    text: '#00ff41', 
    cursor: '#00ff41', 
    selection: 'rgba(0, 255, 65, 0.2)',
    borderColor: '#00ff41',
    syntax: {
      keyword: '#008f11', 
      string: '#00ff41', 
      comment: '#003b00', 
      number: '#00ff41', 
      function: '#00ff41', 
      operator: '#008f11', 
      default: '#00ff41'
    }
  },
  dracula: { 
    name: 'Vampire', 
    bg: '#282a36', 
    gutterBg: '#21222c',
    text: '#f8f8f2', 
    cursor: '#ff79c6', 
    selection: 'rgba(189, 147, 249, 0.2)',
    borderColor: '#ff79c6',
    syntax: {
      keyword: '#ff79c6', 
      string: '#f1fa8c', 
      comment: '#6272a4', 
      number: '#bd93f9', 
      function: '#50fa7b', 
      operator: '#ff79c6', 
      default: '#f8f8f2'
    }
  }
};

const DEFAULT_CODE = `// Welcome to Quantum Code Lab
// Type HTML/CSS directly to preview, or write JS to run in console.

function quantumHello() {
  console.log("System Online.");
  return "Ready for instructions.";
}

quantumHello();`;

const KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 
  'console', 'await', 'async', 'import', 'from', 'export', 'default', 'class', 
  'extends', 'new', 'try', 'catch', 'switch', 'case', 'break', 'continue', 
  'true', 'false', 'null', 'undefined', 'typeof', 'void', 'delete', 'debugger',
  'html', 'body', 'div', 'span', 'style', 'script'
]);

interface CodeEditorProps {
    userPlan?: 'free' | 'pro' | 'quantum';
}

// Electric Spark Border Component
export const ElectricSparkCard: React.FC<{ children: React.ReactNode; className?: string; color?: 'cyan' | 'pink' }> = ({ children, className = '', color = 'cyan' }) => {
  const borderGradient = color === 'cyan' 
    ? 'from-transparent via-cyan-400 to-transparent' 
    : 'from-transparent via-pink-500 to-transparent';
  
  const glowClass = color === 'cyan' ? 'shadow-[0_0_25px_rgba(34,211,238,0.1)]' : 'shadow-[0_0_25px_rgba(236,72,153,0.1)]';

  return (
    <div className={`relative rounded-xl overflow-hidden bg-deep-1/80 backdrop-blur-md border border-white/5 group ${glowClass} ${className}`}>
       <div className={`absolute inset-0 pointer-events-none opacity-20 ${color === 'cyan' ? 'bg-cyan-400/5' : 'bg-pink-500/5'} animate-pulse`} />
       {children}
       <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${borderGradient} animate-spark-x opacity-0`} />
       <div className={`absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-r ${borderGradient} animate-spark-x-rev opacity-0`} />
       <div className={`absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b ${borderGradient} animate-spark-y opacity-0`} />
       <div className={`absolute bottom-0 right-0 h-full w-[2px] bg-gradient-to-b ${borderGradient} animate-spark-y-rev opacity-0`} />
    </div>
  );
};

export const CodeEditor = memo<CodeEditorProps>(({ userPlan = 'free' }) => {
  const [themes, setThemes] = useState<Record<string, EditorTheme>>(() => {
    try {
      const saved = localStorage.getItem('yusra_editor_themes');
      return saved ? JSON.parse(saved) : DEFAULT_THEMES;
    } catch { return DEFAULT_THEMES; }
  });
  
  const [activeThemeKey, setActiveThemeKey] = useState<string>('quantum');
  const [code, setCode] = useState(() => {
    try {
      return localStorage.getItem('yusra_code_content') || DEFAULT_CODE;
    } catch { return DEFAULT_CODE; }
  });

  const [debouncedCode, setDebouncedCode] = useState(code);
  const [output, setOutput] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'console' | 'preview' | 'ai'>('console');
  const [statusMsg, setStatusMsg] = useState<{text: string, type: 'success' | 'info'} | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Use a ref to store the latest code for the interval closure
  const codeRef = useRef(code);

  // Input Canvas State
  const [instructions, setInstructions] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILE_SIZE = userPlan === 'free' ? 3 * 1024 * 1024 : 20 * 1024 * 1024;

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const currentTheme = themes[activeThemeKey];

  useEffect(() => { localStorage.setItem('yusra_editor_themes', JSON.stringify(themes)); }, [themes]);

  // Sync ref with state
  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  // Robust Auto-Save Interval
  useEffect(() => {
    const saveInterval = setInterval(() => {
        // Save using the ref value so we don't need to reset the interval on every render
        localStorage.setItem('yusra_code_content', codeRef.current);
        setLastSaved(new Date());
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, []); // Empty dependency array ensures timer is stable

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedCode(code); }, 500);
    return () => clearTimeout(handler);
  }, [code]);

  useEffect(() => {
     if (/^\s*<(!DOCTYPE|html|div|body|head|style|script)/i.test(code)) {
        // Initial auto-detect
     }
  }, []); 

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CONSOLE_LOG') {
        const { level, args } = event.data;
        const msg = args.map((a: string) => a).join(' ');
        setOutput(prev => [...prev, `[PREVIEW:${level.toUpperCase()}] ${msg}`]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (statusMsg) {
      const timer = setTimeout(() => setStatusMsg(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const { scrollTop, scrollLeft } = e.currentTarget;
    if (preRef.current) {
        preRef.current.scrollTop = scrollTop;
        preRef.current.scrollLeft = scrollLeft;
    }
    if (lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = scrollTop;
    }
  };

  const showStatus = (text: string, type: 'success' | 'info' = 'info') => {
    setStatusMsg({ text, type });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files) as File[];
      const validFiles = [];
      let skippedCount = 0;

      for (const file of newFiles) {
          if (file.size <= MAX_FILE_SIZE) {
              validFiles.push(file);
          } else {
              skippedCount++;
          }
      }
      
      if (skippedCount > 0) {
        showStatus(`${skippedCount} files skipped (Limit: ${userPlan === 'free' ? '3MB' : '20MB'})`, "info");
      }
      setUploadedFiles(prev => [...prev, ...validFiles]);
    }
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const runCode = async () => {
    setActiveTab('console');
    setOutput([]);
    
    const pushLog = (msg: string) => setOutput(prev => [...prev, msg]);
    const mockConsole = {
      log: (...args: any[]) => pushLog(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
      error: (...args: any[]) => pushLog(`[ERROR] ${args.map(a => String(a)).join(' ')}`),
      warn: (...args: any[]) => pushLog(`[WARN] ${args.map(a => String(a)).join(' ')}`),
      clear: () => setOutput([])
    };

    try {
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const run = new AsyncFunction('console', code);
      await run(mockConsole);
    } catch (error) {
      mockConsole.error(error instanceof Error ? error.message : String(error));
    }
  };

  const handleAnalyzeCode = async () => {
    if (!code.trim()) {
        showStatus("Editor is empty", "info");
        return;
    }
    
    setActiveTab('ai');
    setIsAnalyzing(true);
    setAnalysis("Scanning code structure for anomalies...");

    try {
        const prompt = `Task: Static Code Analysis. Code: ${code}`;
        // FIX: Update call to handle new return type from streamResponse
        await streamResponse(prompt, [], (text) => {
            setAnalysis(text);
        });
    } catch {
        setAnalysis("Analysis interrupted due to quantum interference.");
    } finally {
        setIsAnalyzing(false);
    }
  };

  const executeAiCommand = async () => {
    if (!instructions.trim() && uploadedFiles.length === 0) {
      showStatus("No instructions provided", "info");
      return;
    }
    
    setActiveTab('ai');
    setIsAnalyzing(true);
    setAnalysis("Processing instructions & files...");

    const attachments: GeminiAttachment[] = [];
    for (const file of uploadedFiles) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      attachments.push({
        mimeType: file.type || 'application/octet-stream',
        data: base64.split(',')[1]
      });
    }

    try {
      const prompt = `Current Code: ${code}. Instructions: ${instructions}`;
      // FIX: Update call to streamResponse to correctly get the full text.
      const { fullText } = await streamResponse(prompt, attachments, (text) => {
        setAnalysis(text);
      });

      const codeBlockMatch = fullText.match(/```(?:javascript|js|html|css|xml)?\n([\s\S]*?)```/);
      if (codeBlockMatch && (instructions.toLowerCase().includes("code") || instructions.toLowerCase().includes("create"))) {
         setCode(codeBlockMatch[1]);
         showStatus("Code updated from Quantum Core", "success");
         if (/^\s*<(!DOCTYPE|html|div|body)/i.test(codeBlockMatch[1])) {
             setActiveTab('preview');
         }
      }

    } catch {
      setAnalysis("Processing failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadZip = async () => {
    if (userPlan === 'free') {
        alert("🔒 ACCESS DENIED: Source code export is restricted to Pro & Quantum tiers.");
        return;
    }

    try {
        showStatus("Compressing assets...", "info");
        const zip = new JSZip();
        
        if (/^\s*<(!DOCTYPE|html|div|body)/i.test(code)) {
            zip.file("index.html", code);
        } else {
            zip.file("script.js", code);
        }
        
        zip.file("README.md", "# Generated by Yusra Quantum AI\n\nThis project was generated using the Yusra Quantum AI Engine.\n\nCreator: Mohammad Maynul Hasan Shaon");

        const content = await zip.generateAsync({ type: "blob" });
        const url = window.URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = "yusra_project_export.zip";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showStatus("Download complete", "success");
    } catch (e) {
        console.error(e);
        showStatus("Compression protocol failed", "info");
    }
  };

  const highlightedCode = useMemo(() => {
    const syntax = currentTheme.syntax;
    // Regex optimized to reduce fragment count
    const tokens = code.split(/(".*?"|'.*?'|`.*?`|\/\/.*$|\/\*[\s\S]*?\*\/|\b\d+(?:\.\d+)?\b|\b[a-zA-Z_$][a-zA-Z0-9_$]*\b|[(){}[\];,.+\-*/%=<>!&|^~?:])/gm);
    
    return tokens.map((token, i) => {
      if (!token) return null;
      let color = syntax.default;
      let fontWeight = 'normal';
      
      if (token.startsWith('//') || token.startsWith('/*')) color = syntax.comment;
      else if (/^["'`]/.test(token)) color = syntax.string;
      else if (/^\d/.test(token)) color = syntax.number;
      else if (KEYWORDS.has(token)) { color = syntax.keyword; fontWeight = 'bold'; }
      else if (/^[a-zA-Z_$]/.test(token) && tokens[i+1]?.trim().startsWith('(')) color = syntax.function;
      else if (/^[(){}[\];,.+\-*/%=<>!&|^~?:]+$/.test(token)) color = syntax.operator;

      return <span key={`${i}-${token}`} style={{ color, fontWeight }}>{token}</span>;
    });
  }, [code, currentTheme]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      setCode(value.substring(0, start) + '  ' + value.substring(end));
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  };

  const lineCount = code.split('\n').length;

  const renderPreview = (codeContent: string) => {
      const consoleScript = `
        <script>
            (function(){
                const send = (level, args) => {
                    try {
                        window.parent.postMessage({ type: 'CONSOLE_LOG', level, args: Array.from(args).map(a => String(a)) }, '*');
                    } catch(e) {}
                };
                const originalLog = console.log; console.log = (...args) => { originalLog(...args); send('log', args); };
                const originalErr = console.error; console.error = (...args) => { originalErr(...args); send('error', args); };
                const originalWarn = console.warn; console.warn = (...args) => { originalWarn(...args); send('warn', args); };
                window.onerror = (msg, url, line) => send('error', [msg + ' (Line ' + line + ')']);
            })();
        </script>
      `;

      let previewContent = "";
      
      if (/^\s*<(!DOCTYPE|html|div|body|head|style|script)/i.test(codeContent)) {
          previewContent = codeContent + consoleScript;
      } else if (/^\s*<(div|span|p|h[1-6]|ul|ol|table|form|input|button|img)/i.test(codeContent)) {
          previewContent = codeContent + consoleScript;
      } else {
          previewContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>body { font-family: sans-serif; padding: 20px; color: #555; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8f9fa; }</style>
                ${consoleScript}
            </head>
            <body>
                <div style="max-width: 400px; border: 1px dashed #ccc; padding: 40px; border-radius: 12px;">
                  <h3>Preview Area</h3>
                  <p>HTML output will appear here.</p>
                </div>
            </body>
            </html>`;
      }

      if (userPlan === 'free') {
          const watermarkScript = `
            <div style="position: fixed; bottom: 12px; right: 12px; z-index: 9999; pointer-events: none; opacity: 0.8; font-family: sans-serif;">
               <div style="background: rgba(0,0,0,0.8); color: white; padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: bold; border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; gap: 4px;">
                  <span style="color: #00f2ff;">⚡</span> POWERED BY YUSRA
               </div>
            </div>
          `;
          if (previewContent.includes('</body>')) {
              previewContent = previewContent.replace('</body>', `${watermarkScript}</body>`);
          } else {
              previewContent += watermarkScript;
          }
      }

      return previewContent;
  };

  const sharedStyle: React.CSSProperties = {
    fontFamily: '"Share Tech Mono", "Consolas", "Monaco", monospace',
    fontSize: '14px',
    lineHeight: '1.6',
    padding: '16px',
    margin: 0,
    border: 0,
    width: '100%',
    height: '100%',
    whiteSpace: 'pre',
    overflowWrap: 'normal',
    boxSizing: 'border-box',
    tabSize: 2,
  };

  return (
    <div className="relative flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden bg-deep-0">
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#030810]">
         <div className="absolute inset-0 bg-gradient-to-br from-[#020610] via-[#050c18] to-[#0a1628] opacity-50"></div>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vmax] h-[150vmax] bg-[radial-gradient(circle,rgba(0,242,255,0.03)_0%,transparent_60%)] animate-water-ripple pointer-events-none mix-blend-screen"></div>
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>
      </div>
      
      <div className="flex-1 flex flex-col p-4 md:p-6 gap-4 z-10 md:w-1/2 min-w-[300px]">
        
        <ElectricSparkCard className="flex flex-col gap-4 p-4 h-1/3 min-h-[200px]" color="pink">
           <div className="flex justify-between items-center border-b border-white/5 pb-2">
             <div className="flex items-center gap-2 text-pink-400 font-display text-sm font-bold">
               <FileText size={16} /> INPUT CANVAS
             </div>
             <div className="text-[10px] text-gray-500 font-mono">
               {userPlan === 'free' ? '3MB' : '20MB'} MAX / ANY TYPE
             </div>
           </div>

           <div className="flex-1 flex flex-col gap-2">
             <textarea 
               value={instructions}
               onChange={(e) => setInstructions(e.target.value)}
               placeholder="// Enter directives for Code Gen or Analysis..."
               className="flex-1 bg-deep-2/50 border border-white/10 rounded-lg p-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-pink-500/50 resize-none font-mono"
             />
             
             {uploadedFiles.length > 0 && (
               <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                 {uploadedFiles.map((f, i) => (
                   <div key={i} className="flex items-center gap-2 bg-deep-2 border border-white/10 px-2 py-1 rounded text-xs text-gray-300 shrink-0">
                     <span className="max-w-[100px] truncate">{f.name}</span>
                     <button onClick={() => removeFile(i)} className="text-red-400 hover:text-red-300"><X size={12}/></button>
                   </div>
                 ))}
               </div>
             )}

             <div className="flex justify-between items-center pt-2">
                <div className="flex gap-2">
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" multiple />
                  <input type="file" ref={cameraInputRef} onChange={handleFileUpload} accept="image/*" capture="environment" className="hidden" />
                  
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-gray-300 transition-colors border border-white/5">
                     <Paperclip size={14} /> Attach
                  </button>
                  <button onClick={() => cameraInputRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-pink-500/10 hover:text-pink-500 rounded-lg text-xs text-gray-300 transition-colors border border-white/5">
                     <Camera size={14} /> Camera
                  </button>
                </div>
                <button onClick={executeAiCommand} className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white text-xs font-bold tracking-wider rounded-lg shadow-lg shadow-pink-500/20 active:scale-95 transition-all">
                   <Sparkles size={14} /> PROCESS INPUT
                </button>
             </div>
           </div>
        </ElectricSparkCard>

        <ElectricSparkCard className="flex-1 flex flex-col relative overflow-hidden" color="cyan">
            <div className="flex items-center justify-between p-2 border-b border-white/5 bg-deep-2/50">
               <div className="flex items-center gap-2">
                  <CodeIcon size={14} className="text-cyan-400" />
                  <span className="text-xs font-mono text-cyan-400">SOURCE EDITOR</span>
                  {lastSaved && (
                      <span className="ml-2 text-[10px] text-gray-500 font-mono flex items-center gap-1 animate-pulse">
                          <Save size={10} className="text-green-500" /> 
                          <span className="text-green-400/80">SAVED {lastSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
                      </span>
                  )}
               </div>
               <div className="flex items-center gap-2">
                 <button 
                    onClick={handleAnalyzeCode} 
                    className="p-1.5 bg-pink-500/10 text-pink-400 rounded hover:bg-pink-500/20 flex items-center gap-1" 
                    title="Analyze Code for Bugs"
                 >
                    <Bug size={14} /> <span className="hidden sm:inline text-[10px] font-bold">ANALYZE</span>
                 </button>
                 
                 <div className="h-4 w-[1px] bg-white/10 mx-1"></div>
                 
                 <button 
                    onClick={handleDownloadZip}
                    disabled={userPlan === 'free'}
                    className={`p-1.5 rounded flex items-center gap-1 transition-colors ${userPlan === 'free' ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'}`}
                    title={userPlan === 'free' ? "Upgrade to download ZIP" : "Download Project ZIP"}
                 >
                    {userPlan === 'free' ? <Lock size={12} /> : <Download size={12} />}
                    <span className="hidden sm:inline text-[10px] font-bold">EXPORT</span>
                 </button>

                 <div className="h-4 w-[1px] bg-white/10 mx-1"></div>

                 <select 
                    value={activeThemeKey}
                    onChange={(e) => setActiveThemeKey(e.target.value)}
                    className="bg-deep-1 border border-white/10 rounded text-[10px] text-gray-400 px-2 py-1 focus:outline-none"
                  >
                    {Object.keys(themes).map((k) => <option key={k} value={k}>{themes[k].name}</option>)}
                  </select>
                  <button onClick={runCode} className="p-1.5 bg-green-500/10 text-green-400 rounded hover:bg-green-500/20" title="Run JS">
                     <Play size={14} />
                  </button>
               </div>
            </div>

            <div className="relative flex-1 flex overflow-hidden bg-opacity-90" style={{ backgroundColor: currentTheme.bg }}>
                <div 
                  ref={lineNumbersRef}
                  className="w-10 shrink-0 py-4 text-right pr-2 border-r border-white/5 select-none overflow-hidden text-gray-600 font-mono text-xs leading-[1.6]"
                  style={{ backgroundColor: currentTheme.gutterBg }}
                >
                  <div style={{ paddingTop: '16px', paddingBottom: '16px' }}>
                    {Array.from({ length: Math.max(lineCount, 30) }, (_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>
                </div>

                <div className="relative flex-1 h-full overflow-hidden transform-gpu will-change-transform">
                  {/* Syntax Highlight Layer */}
                  <pre 
                    ref={preRef}
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none overflow-hidden"
                    style={{
                      ...sharedStyle,
                      backgroundColor: 'transparent',
                      color: 'transparent', 
                      zIndex: 1,
                      textAlign: 'left'
                    }}
                  >
                    {highlightedCode}
                    <br />
                  </pre>

                  {/* Input Layer */}
                  <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onScroll={handleScroll}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    autoCapitalize="off"
                    autoComplete="off"
                    autoCorrect="off"
                    className="absolute inset-0 outline-none resize-none overflow-auto focus:ring-0 selection:bg-cyan-500/20"
                    style={{
                      ...sharedStyle,
                      color: 'transparent', 
                      backgroundColor: 'transparent',
                      caretColor: currentTheme.cursor, 
                      zIndex: 2,
                      textAlign: 'left'
                    }}
                  />
                </div>
            </div>
        </ElectricSparkCard>
      </div>

      <div className="flex-1 flex flex-col p-4 md:p-6 md:pl-0 gap-4 z-10 md:w-1/2">
        <ElectricSparkCard className="h-full flex flex-col" color="cyan">
            <div className="flex border-b border-white/5 bg-black/20 shrink-0">
              <button onClick={() => setActiveTab('console')} className={`flex-1 p-3 text-xs font-mono flex items-center justify-center gap-2 transition-colors ${activeTab === 'console' ? 'text-green-400 bg-white/5 border-b-2 border-green-400' : 'text-gray-500 hover:text-gray-300'}`}>
                <Terminal size={14} /> CONSOLE
              </button>
              <button onClick={() => setActiveTab('preview')} className={`flex-1 p-3 text-xs font-mono flex items-center justify-center gap-2 transition-colors ${activeTab === 'preview' ? 'text-amber-400 bg-white/5 border-b-2 border-amber-400' : 'text-gray-500 hover:text-gray-300'}`}>
                <Eye size={14} /> PREVIEW
              </button>
              <button onClick={() => setActiveTab('ai')} className={`flex-1 p-3 text-xs font-mono flex items-center justify-center gap-2 transition-colors ${activeTab === 'ai' ? 'text-cyan-400 bg-white/5 border-b-2 border-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}>
                <Sparkles size={14} /> AI OUTPUT
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4 font-mono text-sm relative no-scrollbar bg-[#050c18]">
              {activeTab === 'console' && (
                <div className="space-y-1">
                  {output.length === 0 && <span className="text-gray-600 italic">// Console output... Run code or type in Preview scripts to see logs.</span>}
                  {output.map((line, i) => (
                    <div key={i} className={`break-words border-b border-white/5 pb-1 mb-1 ${line.toLowerCase().includes('error') ? 'text-red-400' : line.toLowerCase().includes('warn') ? 'text-yellow-400' : 'text-green-400'}`}>
                      <span className="opacity-50 select-none mr-2">$</span>{line}
                    </div>
                  ))}
                </div>
              )}
              
              {activeTab === 'preview' && (
                <div className="w-full h-full bg-white rounded-md overflow-hidden relative group">
                     <iframe 
                        title="live-preview" 
                        srcDoc={renderPreview(debouncedCode)} 
                        className="w-full h-full border-0" 
                        sandbox="allow-scripts allow-modals allow-popups allow-forms" 
                     />
                     {userPlan === 'free' && (
                        <div className="absolute inset-0 bg-black/10 pointer-events-none flex items-end justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <div className="bg-black/80 text-white text-[10px] px-2 py-1 rounded-full border border-white/20 backdrop-blur">Preview Mode</div>
                        </div>
                     )}
                </div>
              )}

              {activeTab === 'ai' && (
                <div className="text-gray-300 space-y-4">
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2 text-cyan-400 animate-pulse"><Sparkles size={14} /> Analyzing...</div>
                  ) : analysis ? (
                    <div className="prose prose-invert prose-sm max-w-none">
                        <h4 className="text-cyan-400 font-bold mb-2 pb-2 border-b border-white/10">Analysis Results</h4>
                        {analysis}
                    </div>
                  ) : (
                    <span className="text-gray-600 italic">// Results from AI processing will appear here.</span>
                  )}
                </div>
              )}
            </div>
        </ElectricSparkCard>
      </div>
    </div>
  );
});