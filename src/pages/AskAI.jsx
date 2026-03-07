import {
  AlertCircle,
  Bot,
  Brain,
  ClipboardCheck,
  ClipboardCopy,
  Cpu,
  GraduationCap,
  Loader2,
  MessageSquare,
  RefreshCcw,
  Sparkles,
  Zap
} from "lucide-react";
import { useState } from "react";
import aiService from "../api/ai.service";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

/**
 * Adaptive AI Question Answering - Professional Edition
 * Feature 1 — EduMentor AI
 */

const DIFFICULTY_LEVELS = [
  { id: 'beginner', label: 'Beginner', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-100 dark:border-emerald-500/20' },
  { id: 'intermediate', label: 'Intermediate', icon: Cpu, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-100 dark:border-blue-500/20' },
  { id: 'advanced', label: 'Advanced', icon: GraduationCap, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10', border: 'border-purple-100 dark:border-purple-500/20' },
];

export default function AskAI() {
  const [question, setQuestion] = useState("");
  const [difficulty, setDifficulty] = useState('intermediate');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await aiService.askQuestion(question.trim(), difficulty);
      const explanation = response.data?.data?.explanation;
      
      if (explanation) {
        setResult({
          question: question.trim(),
          answer: explanation,
          difficulty: difficulty,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      } else {
        throw new Error("The AI provided an empty response. Please try rephrasing.");
      }
    } catch (err) {
      console.error("AI Error:", err);
      setError(err.message || "I'm having trouble connecting to the mentor server. Please ensure the backend is active.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 pt-24 pb-20 container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Adaptive Learning Platform</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center justify-center gap-3">
            Ask <span className="text-primary italic">EduMentor</span> AI
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto text-lg font-medium">
            Get structured, precision-engineered answers for any internal or academic query, tailored specifically to your expertise level.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Controls & Input Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-primary/10 transition-colors duration-500"></div>
              
              <div className="relative z-10 space-y-8">
                {/* Difficulty Selector */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      Proficiency Level
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {DIFFICULTY_LEVELS.map((level) => {
                      const Icon = level.icon;
                      const isActive = difficulty === level.id;
                      return (
                        <button
                          key={level.id}
                          onClick={() => setDifficulty(level.id)}
                          className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-300 gap-2 ${
                            isActive 
                              ? `${level.border} ${level.bg} scale-[1.02] shadow-sm` 
                              : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 grayscale opacity-60 hover:opacity-100 hover:grayscale-0'
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? level.color : 'text-zinc-400'}`} />
                          <span className={`text-[10px] font-bold uppercase tracking-tight ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-500'}`}>
                            {level.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Input Area */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Query Definition
                  </label>
                  <form onSubmit={handleSend} className="space-y-4">
                    <div className="relative">
                      <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Define your query here..."
                        className="w-full h-44 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-5 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none text-base leading-relaxed font-medium"
                        disabled={isLoading}
                      />
                    </div>
                    
                    {error && (
                      <div className="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-sm font-medium animate-in slide-in-from-top-1">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!question.trim() || isLoading}
                      className="w-full bg-zinc-900 dark:bg-primary text-white dark:text-primary-foreground font-black py-5 px-8 rounded-2xl transition-all hover:translate-y-[-2px] hover:shadow-2xl hover:shadow-primary/30 active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="uppercase tracking-widest text-sm">Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 group-hover:fill-current" />
                          <span className="uppercase tracking-widest text-sm">Request Answer</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

          </div>

          {/* Result Column */}
          <div className="lg:col-span-7">
            {result ? (
              <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden h-full flex flex-col animate-in fade-in zoom-in-95 duration-500">
                <div className="p-8 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-800/20">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm`}>
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest tracking-tighter">Mentor Analysis</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">{result.difficulty}</span>
                        <span className="text-[10px] font-medium text-zinc-400">{result.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={copyToClipboard}
                      className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 relative group"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <ClipboardCheck className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <ClipboardCopy className="w-5 h-5 group-hover:text-primary transition-colors" />
                      )}
                      {copied && (
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded-md">Copied!</span>
                      )}
                    </button>
                    <button 
                      onClick={handleSend}
                      className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 group"
                      title="Regenerate answer"
                    >
                      <RefreshCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500 group-hover:text-primary" />
                    </button>
                  </div>
                </div>
                
                <div className="p-10 flex-1 overflow-y-auto custom-scrollbar space-y-8">
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">Query Abstract</p>
                    <h4 className="text-2xl font-black text-zinc-900 dark:text-white leading-tight">
                      {result.question}
                    </h4>
                  </div>
                  
                  <div className="h-px bg-gradient-to-r from-primary/30 to-transparent w-full" />
                  
                  <div className="space-y-6">
                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-1 h-8 bg-primary rounded-full" />
                      <p className="text-zinc-700 dark:text-zinc-300 text-xl leading-relaxed whitespace-pre-wrap font-medium">
                        {result.answer}
                      </p>
                    </div>
                    
                    <div className="pt-8 grid grid-cols-2 gap-4">
                      <div className="p-5 bg-zinc-50 dark:bg-zinc-800/40 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Mentor Note</p>
                        <p className="text-xs text-zinc-500 leading-relaxed italic">
                          This explanation was optimized for a {result.difficulty} level learner using real-time generative modeling.
                        </p>
                      </div>
                      <div className="p-5 bg-primary/5 rounded-3xl border border-primary/10 flex flex-col justify-center items-center text-center">
                         <Sparkles className="w-5 h-5 text-primary mb-2" />
                         <p className="text-[9px] font-black text-primary uppercase tracking-widest">Premium Output</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-100/30 dark:bg-zinc-900/40 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] h-full flex flex-col items-center justify-center p-12 text-center group transition-all duration-500 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/60">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
                  <div className="relative w-24 h-24 bg-white dark:bg-zinc-800 rounded-3xl flex items-center justify-center shadow-xl border border-zinc-100 dark:border-zinc-700 rotate-6 group-hover:rotate-0 transition-transform duration-500">
                    <Brain className="w-12 h-12 text-zinc-200 dark:text-zinc-700 group-hover:text-primary transition-colors duration-500" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-3">Awaiting Your Definition</h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto text-lg leading-relaxed">
                  Submit a query on the left to activate the EduMentor intelligence engine.
                </p>
                <div className="mt-8 flex gap-2">
                   {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full" />)}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); }
      `}</style>
    </div>
  );
}
