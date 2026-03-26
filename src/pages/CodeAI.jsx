import {
  AlertCircle,
  Bug,
  CheckCircle2,
  Code2,
  Cpu,
  FileCode,
  GraduationCap,
  Lightbulb,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
  Square,
  Volume2,
} from "lucide-react";
import { useState } from "react";
import aiService from "../api/ai.service";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import { speakText, stopSpeaking } from "../utils/textToSpeech";

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript', icon: FileCode },
  { id: 'python', label: 'Python', icon: FileCode },
  { id: 'java', label: 'Java', icon: FileCode },
  { id: 'cpp', label: 'C++', icon: FileCode },
  { id: 'html', label: 'HTML/CSS', icon: FileCode },
];

const DIFFICULTY_LEVELS = [
  { id: 'beginner', label: 'Beginner', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { id: 'intermediate', label: 'Intermediate', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { id: 'advanced', label: 'Advanced', color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
];

export default function CodeAI() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [ttsLoading, setTtsLoading] = useState(false);

  const handleSpeak = async (text, id) => {
    setSpeakingIdx(id);
    setTtsLoading(true);
    try {
      await speakText(text);
    } catch (err) {
      console.error("TTS Error:", err);
    } finally {
      setSpeakingIdx(null);
      setTtsLoading(false);
    }
  };

  const handleStop = () => {
    stopSpeaking();
    setSpeakingIdx(null);
    setTtsLoading(false);
  };

  const handleAnalyze = async () => {
    if (!code.trim() || isLoading) return;

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await aiService.analyzeCode(code, language, difficulty);
      setResult(response.data?.data);
    } catch (err) {
      console.error("Code Analysis Error:", err);
      setError("Failed to analyze code. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCode("");
    setResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 flex flex-col pt-24 pb-12 container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4">
            <div className="bg-zinc-900 dark:bg-primary text-white dark:text-primary-foreground p-3 rounded-2xl shadow-xl rotate-3 transition-transform hover:rotate-0">
              <Code2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">Code <span className="text-primary italic">Optimizer</span></h1>
              <p className="text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest mt-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                Debug · Explain · Optimize
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.label}</option>
              ))}
            </select>

            <div className="bg-white dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 flex gap-1">
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setDifficulty(level.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${difficulty === level.id
                      ? `${level.bg} ${level.color} shadow-sm`
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                    }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
          {/* Input Section */}
          <div className="flex flex-col gap-4">
            <div className="flex-1 bg-zinc-900 rounded-[2rem] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col relative group">
              <div className="absolute top-4 left-6 flex gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>
              <div className="pt-12 pb-4 px-6 flex-1 flex flex-col">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="// Paste your code here..."
                  className="flex-1 bg-transparent text-zinc-300 font-mono text-sm resize-none focus:outline-none custom-scrollbar"
                  spellCheck="false"
                />
              </div>
              <div className="p-4 bg-zinc-800/50 border-t border-zinc-800 flex justify-between items-center">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-widest"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Clear
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={!code.trim() || isLoading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/20 transition-all disabled:opacity-50 disabled:translate-y-0"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Analyze Code
                    </>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold animate-pulse">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>

          {/* Results Section */}
          <div className="flex flex-col gap-6">
            {!result && !isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 border-dashed">
                <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mb-6 text-zinc-400">
                  <Cpu className="w-8 h-8 opacity-20" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Ready to Analyze</h3>
                <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                  Paste your logic, functions, or snippets to get expert feedback on your code.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse" />
                </div>
                <p className="mt-6 text-xs font-black text-muted-foreground uppercase tracking-[0.3em] animate-pulse">
                  Processing Logic...
                </p>
              </div>
            )}

            {result && (
              <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 overflow-y-auto pr-2 custom-scrollbar max-h-[calc(100vh-320px)]">
                {/* Explanation */}
                <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                      <Lightbulb className="w-3.5 h-3.5" />
                      Conceptual Breakdown
                    </h4>
                    <div className="flex gap-2">
                      {speakingIdx === 'explanation' ? (
                        <button
                          onClick={handleStop}
                          className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg border border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-500/10 text-rose-500 transition-all"
                        >
                          <Square className="w-3 h-3 fill-current" />
                          Stop
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSpeak(result.explanation, 'explanation')}
                          disabled={ttsLoading}
                          className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-500 hover:text-primary hover:border-primary/40 transition-all disabled:opacity-50"
                        >
                          {speakingIdx === 'explanation' && ttsLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                          Listen
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                    {result.explanation}
                  </p>
                </div>

                {/* Bugs */}
                {result.bugs && result.bugs.length > 0 && (
                  <div className="bg-rose-50 dark:bg-rose-500/5 p-6 rounded-[2rem] border border-rose-200 dark:border-rose-500/20">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-4 flex items-center gap-2">
                      <Bug className="w-3.5 h-3.5" />
                      Issues Detected
                    </h4>
                    <div className="space-y-4">
                      {result.bugs.map((bug, i) => (
                        <div key={i} className="flex gap-4 items-start">
                          <div className="mt-1 w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">
                              {bug.type}
                            </p>
                            <p className="text-sm text-foreground/80 font-medium mb-2">{bug.description}</p>
                            <div className="bg-white/50 dark:bg-zinc-950/30 p-3 rounded-xl border border-rose-200/50 dark:border-rose-500/10">
                              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                <Zap className="w-3 h-3" />
                                Proposed Fix
                              </p>
                              <p className="text-xs text-foreground/70 font-mono">{bug.fix}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Optimizations */}
                {result.optimizations && result.optimizations.length > 0 && (
                  <div className="bg-amber-50 dark:bg-amber-500/5 p-6 rounded-[2rem] border border-amber-200 dark:border-amber-500/20">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500 mb-4 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5" />
                      Optimization Engine
                    </h4>
                    <ul className="space-y-3">
                      {result.optimizations.map((opt, i) => (
                        <li key={i} className="flex items-start gap-3 bg-white/50 dark:bg-zinc-950/30 p-3 rounded-xl border border-amber-200/50 dark:border-amber-500/10 text-sm text-foreground/80 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          {opt}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Corrected Code */}
                {result.correctedCode && (
                  <div className="bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800 shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Optimized version
                      </h4>
                      <button
                        onClick={() => navigator.clipboard.writeText(result.correctedCode)}
                        className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors"
                      >
                        Copy Result
                      </button>
                    </div>
                    <pre className="text-xs font-mono text-emerald-400/90 overflow-x-auto p-4 bg-zinc-950/50 rounded-xl border border-zinc-800">
                      {result.correctedCode}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 20px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.1); }
      `}</style>
    </div>
  );
}
