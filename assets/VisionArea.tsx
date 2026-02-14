
import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Aperture, Scan, AlertTriangle, SwitchCamera, Activity, Cpu, Wifi, Radio, Upload, FileVideo, FileImage, X, Zap, Eye, Terminal, Maximize2, Crosshair, ChevronRight, Database } from 'lucide-react';
import { analyzeVisual } from '../services/geminiService';
import { ElectricSparkCard } from './CodeEditor';

interface VisionAreaProps {
  userPlan?: 'free' | 'pro' | 'quantum';
}

export const VisionArea: React.FC<VisionAreaProps> = ({ userPlan = 'free' }) => {
  // Input State
  const [prompt, setPrompt] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Vision State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreamActive, setIsStreamActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraMode, setCameraMode] = useState<'user' | 'environment'>('environment');
  const [scanningLine, setScanningLine] = useState(0);

  const MAX_FILE_SIZE = userPlan === 'free' ? 3 * 1024 * 1024 : 20 * 1024 * 1024;

  // Scanning Animation Loop
  useEffect(() => {
    let frameId: number;
    const animate = () => {
      setScanningLine(prev => (prev + 0.5) % 100);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Initialize camera if no file uploaded
  useEffect(() => {
    if (!uploadedFile) {
        startCamera();
    } else {
        stopCamera();
    }
    return () => stopCamera();
  }, [cameraMode, uploadedFile]);

  const startCamera = async () => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: cameraMode, 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 } 
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreamActive(true);
        setError(null);
      }
    } catch (err) {
      if (!uploadedFile) {
        setError("Camera Access Denied or Unavailable.");
      }
      setIsStreamActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreamActive(false);
    }
  };

  const toggleCameraMode = () => {
    setCameraMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File size exceeds limit (${userPlan === 'free' ? '3MB' : '20MB'}).`);
        return;
      }
      setUploadedFile(file);
      setError(null);
      // Reset analysis on new file
      setAnalysisResult(null);
    }
    e.target.value = '';
  };

  const clearUpload = () => {
      setUploadedFile(null);
      setAnalysisResult(null);
  };

  const executeAnalysis = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      let base64 = "";
      let mimeType = "";
      
      // Case 1: Uploaded File
      if (uploadedFile) {
         const reader = new FileReader();
         base64 = await new Promise<string>((resolve) => {
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(uploadedFile);
         });
         base64 = base64.split(',')[1];
         mimeType = uploadedFile.type;
      } 
      // Case 2: Camera Capture
      else if (videoRef.current && canvasRef.current && isStreamActive) {
         const video = videoRef.current;
         const canvas = canvasRef.current;
         canvas.width = video.videoWidth;
         canvas.height = video.videoHeight;
         const ctx = canvas.getContext('2d');
         if (ctx) {
             ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
             const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
             base64 = dataUrl.split(',')[1];
             mimeType = 'image/jpeg';
         }
      } else {
          throw new Error("No video source available.");
      }

      const query = prompt.trim() || "Analyze this visual input. Identify objects, text, and context.";
      
      const result = await analyzeVisual(query, base64, mimeType);
      setAnalysisResult(result);

    } catch (e: any) {
      setAnalysisResult(`Analysis Protocol Failed: ${e.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row flex-1 min-h-0 bg-deep-0 relative overflow-hidden p-4 md:p-6 gap-6">
      
      {/* 
         LEFT CANVAS: INPUT & CONTROLS 
      */}
      <div className="w-full lg:w-[320px] shrink-0 z-20 flex flex-col gap-4">
          <ElectricSparkCard className="flex flex-col gap-4 p-5 h-full min-h-[500px]" color="pink">
              
              {/* Header */}
              <div className="flex items-center gap-2 text-pink-400 font-display font-bold text-lg border-b border-white/10 pb-3">
                  <Eye size={20} className="animate-pulse" /> VISUAL CORTEX
              </div>
              
              {/* Analysis Directives */}
              <div className="space-y-2">
                 <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Terminal size={12} /> Analysis Directives
                 </label>
                 <textarea 
                   value={prompt}
                   onChange={(e) => setPrompt(e.target.value)}
                   className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-3 text-xs font-mono text-cyan-200 placeholder-gray-700 focus:outline-none focus:border-pink-500/50 resize-none transition-colors"
                   placeholder="// ENTER TARGET PARAMETERS..."
                 />
              </div>

              {/* Data Source */}
              <div className="space-y-2 flex-1">
                 <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Database size={12} /> Data Source
                 </label>
                 
                 <div className="relative group">
                    {uploadedFile ? (
                        <div className="bg-deep-2/80 border border-cyan-500/30 rounded-lg p-4 relative overflow-hidden">
                             <div className="absolute inset-0 bg-cyan-500/5 animate-pulse"></div>
                             <div className="flex items-center gap-3 relative z-10">
                                <div className="w-10 h-10 bg-cyan-900/30 rounded flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                                   {uploadedFile.type.startsWith('video') ? <FileVideo size={20}/> : <FileImage size={20}/>}
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-xs text-white font-bold truncate max-w-[150px]">{uploadedFile.name}</span>
                                    <span className="text-[10px] text-cyan-400 font-mono">{(uploadedFile.size/1024/1024).toFixed(2)} MB LOADED</span>
                                </div>
                             </div>
                             <button 
                                onClick={clearUpload} 
                                className="absolute top-2 right-2 p-1 text-red-400 hover:text-white hover:bg-red-500/20 rounded transition-colors z-20"
                             >
                                <X size={14}/>
                             </button>
                        </div>
                    ) : (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border border-dashed border-white/10 bg-white/5 hover:bg-white/10 rounded-lg p-6 text-center cursor-pointer transition-all hover:border-pink-500/30 group"
                        >
                           <div className="w-12 h-12 rounded-full bg-deep-1 flex items-center justify-center mx-auto mb-3 border border-white/5 group-hover:scale-110 transition-transform shadow-lg">
                               <Upload className="text-gray-400 group-hover:text-pink-400 transition-colors" size={20} />
                           </div>
                           <p className="text-xs font-bold text-gray-300">UPLOAD ARTIFACT</p>
                           <p className="text-[10px] text-gray-600 mt-1 font-mono">IMG/VID • MAX {userPlan === 'free' ? '3MB' : '20MB'}</p>
                           <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*" />
                        </div>
                    )}
                 </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-auto">
                 <button 
                    onClick={uploadedFile ? clearUpload : toggleCameraMode}
                    disabled={!!uploadedFile && !isStreamActive}
                    className="py-3 rounded-lg border border-white/10 bg-deep-2 hover:bg-white/5 text-gray-400 hover:text-white flex items-center justify-center gap-2 text-[10px] font-bold tracking-wider transition-all"
                 >
                    {uploadedFile ? <RefreshCw size={14}/> : <SwitchCamera size={14}/>}
                    {uploadedFile ? 'RESET' : 'SWITCH CAM'}
                 </button>
                 <button 
                    onClick={executeAnalysis}
                    disabled={isAnalyzing || (!isStreamActive && !uploadedFile)}
                    className={`
                      py-3 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold tracking-wider transition-all shadow-lg relative overflow-hidden group
                      ${isAnalyzing ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30 cursor-wait' : 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-cyan-500/20 hover:shadow-cyan-500/40'}
                    `}
                 >
                    {isAnalyzing ? (
                        <>
                           <RefreshCw size={14} className="animate-spin" /> PROCESSING
                        </>
                    ) : (
                        <>
                           <Zap size={14} fill="currentColor" /> INITIATE SCAN
                        </>
                    )}
                    {/* Button Shine Effect */}
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                 </button>
              </div>

          </ElectricSparkCard>
      </div>

      {/* 
         RIGHT CANVAS: LIVE FEED & OUTPUT 
      */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10">
          <ElectricSparkCard className="flex-1 relative flex flex-col overflow-hidden bg-black shadow-2xl" color="cyan">
             
             {/* Main Viewport */}
             <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-deep-3">
                 {/* Background Grid */}
                 <div className="absolute inset-0 opacity-20 pointer-events-none" 
                      style={{ 
                          backgroundImage: `linear-gradient(rgba(0, 242, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 242, 255, 0.1) 1px, transparent 1px)`,
                          backgroundSize: '40px 40px'
                      }}>
                 </div>
                 
                 {/* Media Content */}
                 {uploadedFile ? (
                     <div className="relative w-full h-full flex items-center justify-center p-4 z-10">
                        {uploadedFile.type.startsWith('video') ? (
                            <video src={URL.createObjectURL(uploadedFile)} controls className="max-w-full max-h-full rounded border border-cyan-500/30 shadow-[0_0_30px_rgba(0,242,255,0.1)]" />
                        ) : (
                            <img src={URL.createObjectURL(uploadedFile)} alt="preview" className="max-w-full max-h-full rounded border border-cyan-500/30 shadow-[0_0_30px_rgba(0,242,255,0.1)]" />
                        )}
                     </div>
                 ) : (
                    <>
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted 
                            className={`w-full h-full object-cover opacity-80 transition-transform duration-500 ${cameraMode === 'user' ? 'scale-x-[-1]' : ''}`}
                        />
                        {/* Static Noise Overlay */}
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] pointer-events-none mix-blend-overlay"></div>
                    </>
                 )}

                 {/* HUD OVERLAY LAYER */}
                 <div className="absolute inset-0 pointer-events-none select-none">
                     
                     {/* Corners */}
                     <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-xl"></div>
                     <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-xl"></div>
                     <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-xl"></div>
                     <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-cyan-500/50 rounded-br-xl"></div>

                     {/* Top Info Bar */}
                     <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/10">
                          <div className={`flex items-center gap-2 text-[10px] font-mono font-bold ${isStreamActive ? 'text-green-400' : 'text-red-400'}`}>
                             <div className={`w-2 h-2 rounded-full ${isStreamActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                             {isStreamActive ? 'LIVE FEED' : 'OFFLINE'}
                          </div>
                          <div className="w-[1px] h-3 bg-white/20"></div>
                          <div className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                             <Scan size={10} /> GEMINI-3 VISION
                          </div>
                     </div>

                     {/* Scanning Line */}
                     {isStreamActive && !isAnalyzing && (
                        <div 
                            className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(0,242,255,0.8)] z-10"
                            style={{ top: `${scanningLine}%` }}
                        />
                     )}

                     {/* Center Reticle */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/10 rounded-full flex items-center justify-center opacity-50">
                        <div className="w-40 h-40 border border-cyan-500/20 rounded-full flex items-center justify-center relative">
                             {/* Crosshair */}
                             <Crosshair className="text-cyan-500/40 w-full h-full p-8 absolute" strokeWidth={1} />
                             {isAnalyzing && <div className="absolute inset-0 border-t-2 border-cyan-400 rounded-full animate-spin"></div>}
                        </div>
                     </div>
                 </div>

                 {/* Error Message */}
                 {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-50">
                       <div className="text-center p-6 border border-red-500/30 bg-red-500/10 rounded-xl">
                          <AlertTriangle className="mx-auto text-red-500 mb-2 animate-bounce" size={32} />
                          <p className="text-red-400 font-bold font-mono text-sm">{error}</p>
                       </div>
                    </div>
                 )}
             </div>

             {/* Bottom Terminal Output */}
             <div className="h-48 bg-black/90 border-t border-cyan-500/30 backdrop-blur-md flex flex-col relative">
                  <div className="flex items-center justify-between px-4 py-2 bg-deep-1 border-b border-white/5">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 flex items-center gap-2">
                         <Terminal size={12} /> ANALYSIS_LOG_V3.0
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">
                         {isAnalyzing ? 'PROCESSING...' : 'STANDBY'}
                      </span>
                  </div>
                  
                  <div className="flex-1 p-4 overflow-y-auto font-mono text-sm relative">
                      {/* Scan Lines BG */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 pointer-events-none bg-[length:100%_4px,3px_100%]"></div>
                      
                      <div className="relative z-10">
                        {analysisResult ? (
                            <div className="text-cyan-100 whitespace-pre-wrap leading-relaxed animate-fade-in">
                                <span className="text-green-500 font-bold mr-2">{'>'}</span>
                                {analysisResult}
                                <span className="animate-pulse inline-block w-2 h-4 bg-cyan-500 align-middle ml-1"></span>
                            </div>
                        ) : (
                            <div className="text-gray-600 italic">
                               <p className="mb-1">{'>'} System Initialized.</p>
                               <p className="mb-1">{'>'} Neural Network Loaded.</p>
                               <p>{'>'} Awaiting visual input data...</p>
                               <span className="animate-pulse inline-block w-2 h-4 bg-gray-600 align-middle mt-1"></span>
                            </div>
                        )}
                      </div>
                  </div>
             </div>

          </ElectricSparkCard>
      </div>
      
      {/* Hidden Canvas for Processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};