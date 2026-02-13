import React, { useState } from 'react';
import { Play, Download, Film, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { generateVideo } from '../services/geminiService';
import { ElectricSparkCard } from '../assets/CodeEditor';

export const VideoStudio: React.FC = () => {
    const [prompt, setPrompt] = useState("");
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [isGenerating, setIsGenerating] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [status, setStatus] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        setVideoUrl(null);
        setError(null);
        setStatus("Initializing Veo-3.1 Quantum Core...");

        try {
            const steps = ["Parsing spatial semantics...", "Rendering latent frames...", "Synthesizing motion vectors...", "Finalizing render..."];
            let stepIdx = 0;
            const interval = setInterval(() => {
                setStatus(steps[stepIdx % steps.length]);
                stepIdx++;
            }, 3000);

            const url = await generateVideo(prompt, aspectRatio);
            
            clearInterval(interval);
            setVideoUrl(url);
            setStatus("Generation Complete.");
        } catch (e: any) {
            console.error(e);
            setError(e.message || "Unknown error occurred during video generation.");
            setStatus("Generation Failed.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex-1 min-h-0 bg-deep-0 p-4 md:p-8 overflow-y-auto relative animate-fade-in">
             <div className="max-w-5xl mx-auto flex flex-col h-full gap-6">
                 
                 <div className="flex items-center gap-4 mb-4">
                     <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/30 text-pink-500">
                         <Film size={32} />
                     </div>
                     <div>
                         <h2 className="text-3xl font-display font-bold text-white tracking-wide">VEO STUDIO</h2>
                         <p className="text-gray-400 font-mono text-sm">Generative Video Synthesis powered by Veo 3.1</p>
                     </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
                     <div className="lg:col-span-1 flex flex-col gap-4">
                         <ElectricSparkCard className="p-6 flex flex-col gap-6" color="pink">
                             <div className="space-y-2">
                                 <label className="text-xs font-mono text-pink-400 uppercase font-bold">Creative Prompt</label>
                                 <textarea 
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder="Describe a scene: A cyberpunk city with neon rain..."
                                    className="w-full h-40 bg-deep-2 border border-white/10 rounded-xl p-4 text-white focus:border-pink-500/50 outline-none resize-none placeholder-gray-600"
                                 />
                             </div>

                             <div className="space-y-2">
                                 <label className="text-xs font-mono text-pink-400 uppercase font-bold">Aspect Ratio</label>
                                 <div className="flex gap-2">
                                     <button 
                                        onClick={() => setAspectRatio('16:9')}
                                        className={`flex-1 py-3 rounded-lg border transition-all font-mono text-xs ${aspectRatio === '16:9' ? 'bg-pink-500 text-white border-pink-500' : 'bg-deep-2 border-white/10 text-gray-400 hover:text-white'}`}
                                     >
                                         16:9 Landscape
                                     </button>
                                     <button 
                                        onClick={() => setAspectRatio('9:16')}
                                        className={`flex-1 py-3 rounded-lg border transition-all font-mono text-xs ${aspectRatio === '9:16' ? 'bg-pink-500 text-white border-pink-500' : 'bg-deep-2 border-white/10 text-gray-400 hover:text-white'}`}
                                     >
                                         9:16 Portrait
                                     </button>
                                 </div>
                             </div>

                             <button 
                                onClick={handleGenerate}
                                disabled={isGenerating || !prompt}
                                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${isGenerating ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-pink-500/20 active:scale-95'}`}
                             >
                                 {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />}
                                 {isGenerating ? 'RENDERING...' : 'GENERATE VIDEO'}
                             </button>
                         </ElectricSparkCard>
                         <div className="bg-deep-1 border border-white/5 rounded-xl p-4 text-xs text-gray-500 leading-relaxed font-mono">
                             <p>NOTE: Video generation is computationally intensive. It may take 1-2 minutes to render a preview.</p>
                         </div>
                     </div>

                     <div className="lg:col-span-2 flex flex-col">
                         <ElectricSparkCard className="flex-1 min-h-[400px] flex items-center justify-center relative overflow-hidden bg-black" color="cyan">
                             {videoUrl ? (
                                 <div className="relative w-full h-full flex items-center justify-center">
                                     <video 
                                        src={videoUrl} 
                                        controls 
                                        autoPlay 
                                        loop 
                                        className={`max-w-full max-h-full shadow-2xl ${aspectRatio === '9:16' ? 'h-full w-auto' : 'w-full h-auto'}`}
                                     />
                                     <a 
                                        href={videoUrl} 
                                        download="veo-generation.mp4"
                                        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-pink-500 text-white rounded-full backdrop-blur-md transition-colors z-50"
                                        title="Download Video"
                                     >
                                         <Download size={20} />
                                     </a>
                                 </div>
                             ) : (
                                 <div className="text-center p-8 relative z-10">
                                     {isGenerating ? (
                                         <div className="flex flex-col items-center gap-4">
                                             <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
                                             <p className="text-pink-400 font-mono animate-pulse">{status}</p>
                                         </div>
                                     ) : (
                                         <div className="flex flex-col items-center gap-4 text-gray-600">
                                             <Film size={64} className="opacity-20" />
                                             <p>Ready to generate. Enter a prompt to begin.</p>
                                             {error && <p className="text-red-400 text-xs font-mono bg-red-500/10 p-2 rounded mt-2">{error}</p>}
                                         </div>
                                     )}
                                 </div>
                             )}
                             {!videoUrl && !isGenerating && (
                                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none"></div>
                             )}
                         </ElectricSparkCard>
                     </div>
                 </div>
             </div>
        </div>
    );
};