import {
  AlertCircle,
  Bot,
  Brain,
  ChevronRight,
  ClipboardCheck,
  ClipboardCopy,
  Cpu,
  FileText,
  GraduationCap,
  Lightbulb,
  List,
  Loader2,
  MessageSquare,
  RefreshCcw,
  Send,
  Sparkles,
  Square,
  Upload,
  User,
  Volume2,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import documentQAService from "../api/documentQA.service";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import { speakText, stopSpeaking } from "../utils/textToSpeech";

// ─── Constants ──────────────────────────────────────────────────────────────

const DIFFICULTY_LEVELS = [
  {
    id: 'beginner',
    label: 'Beginner',
    icon: Zap,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-100 dark:border-emerald-500/20'
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    icon: Cpu,
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    border: 'border-blue-100 dark:border-blue-500/20'
  },
  {
    id: 'advanced',
    label: 'Advanced',
    icon: GraduationCap,
    color: 'text-purple-500',
    bg: 'bg-purple-50 dark:bg-purple-500/10',
    border: 'border-purple-100 dark:border-purple-500/20'
  },
];

// ─── Structured AI Message Renderer ───────────────────────────────────────────

function StructuredAIMessage({ data, onSpeak, onStop, isSpeaking, isTtsLoading }) {
  const { explanation, sourceSnippet, keyPoints, relevanceScore } = data;

  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <div className="flex justify-between items-start gap-4">
        {explanation && (
          <p className="text-foreground/90 font-medium leading-relaxed flex-1">{explanation}</p>
        )}
        <div className="flex-shrink-0 pt-1">
          {isSpeaking ? (
            <button
              onClick={onStop}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold rounded-full border border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-500/10 text-rose-500 transition-all"
            >
              <Square className="w-3 h-3 fill-current" />
              Stop
            </button>
          ) : (
            <button
              onClick={() => onSpeak(explanation)}
              disabled={isTtsLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold rounded-full border border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:text-primary hover:border-primary/40 transition-all disabled:opacity-50"
            >
              {isTtsLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Volume2 className="w-3 h-3" />
              )}
              Listen
            </button>
          )}
        </div>
      </div>

      {sourceSnippet && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
          <h4 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            <FileText className="w-3.5 h-3.5" />
            Source Reference
          </h4>
          <blockquote className="italic text-foreground/70 border-l-2 border-primary/30 pl-4 py-1">
            "{sourceSnippet}"
          </blockquote>
        </div>
      )}

      {Array.isArray(keyPoints) && keyPoints.length > 0 && (
        <div className="pt-2">
          <h4 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            <ChevronRight className="w-3.5 h-3.5" />
            Key Insights
          </h4>
          <ul className="grid grid-cols-1 gap-2">
            {keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/50 text-foreground/80 font-medium text-xs">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/60" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {relevanceScore !== undefined && (
        <div className="flex items-center gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/50 mt-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Relevance:</span>
            <div className="flex-1 max-w-24 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-primary transition-all duration-1000" 
                    style={{ width: `${relevanceScore * 10}%` }}
                />
            </div>
            <span className="text-[10px] font-bold text-primary">{relevanceScore}/10</span>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function DocumentQA() {
  const [question, setQuestion] = useState("");
  const [difficulty, setDifficulty] = useState('intermediate');
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content: "Hi! Upload a document (PDF or TXT) and I'll help you extract insights or answer questions based on its content.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [documentContext, setDocumentContext] = useState("");
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError("");
    try {
      const response = await documentQAService.uploadDocument(file);
      setDocumentContext(response.data.fullText);
      setFileName(response.data.fileName);
      
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Successfully loaded **${response.data.fileName}**. You can now ask questions about it!`,
        },
      ]);
    } catch (err) {
      console.error("Upload Error:", err);
      setError("Failed to upload document. Please ensure it's a valid PDF or TXT file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!question.trim() || isLoading) return;
    if (!documentContext) {
        setError("Please upload a document first.");
        return;
    }

    const userMessage = { role: "user", content: question };
    setChatHistory((prev) => [...prev, userMessage]);
    setQuestion("");
    setIsLoading(true);
    setError("");

    try {
      const response = await documentQAService.askQuestion(
        question, 
        documentContext, 
        difficulty, 
        chatHistory.slice(-5).map(m => ({ role: m.role, content: typeof m.content === 'string' ? m.content : m.content.explanation }))
      );
      
      const data = response.data;
      const aiMessage = {
        role: "assistant",
        content: data.explanation ? data : { explanation: data.explanation || "I couldn't find a specific answer in the document." },
      };

      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("QA Error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 flex flex-col pt-20 pb-6 container mx-auto px-4 max-w-4xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-xl shadow-primary/20 rotate-3 transition-transform hover:rotate-0">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">Doc <span className="text-primary italic">Intelligence</span></h1>
              <p className="text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest mt-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                RAG-based Question Answering
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* Upload Button */}
             <button 
                onClick={() => fileInputRef.current.click()}
                disabled={isUploading}
                className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:border-primary transition-all disabled:opacity-50"
             >
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {fileName ? "Change Document" : "Upload Document"}
             </button>
             <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".pdf,.txt"
             />

             {/* Difficulty Selector */}
             <div className="bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex gap-1">
                {DIFFICULTY_LEVELS.map((level) => {
                const Icon = level.icon;
                const isActive = difficulty === level.id;
                return (
                    <button
                    key={level.id}
                    onClick={() => setDifficulty(level.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all duration-300 ${isActive
                        ? `${level.border} ${level.bg} scale-[1.05] shadow-sm`
                        : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                        }`}
                    >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? level.color : 'text-zinc-400'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-zinc-900 dark:text-white' : ''}`}>
                        {level.label}
                    </span>
                    </button>
                );
                })}
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />

          {fileName && (
              <div className="px-6 py-3 bg-zinc-50/80 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between z-10">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 truncate max-w-xs">{fileName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Context Active</span>
                  </div>
              </div>
          )}

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 scroll-smooth custom-scrollbar relative z-10"
            style={{ minHeight: "450px", maxHeight: "calc(100vh - 450px)" }}
          >
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-5 animate-in fade-in slide-in-from-bottom-2 duration-500 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${msg.role === "user"
                      ? "bg-zinc-900 dark:bg-primary text-white dark:text-primary-foreground rotate-3"
                      : "bg-white dark:bg-zinc-800 text-primary border border-zinc-100 dark:border-zinc-700 -rotate-3"
                    }`}
                >
                  {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${msg.role === "user"
                      ? "bg-zinc-900 dark:bg-primary text-white rounded-tr-none"
                      : "bg-zinc-50 dark:bg-zinc-800/40 text-foreground rounded-tl-none border border-zinc-100 dark:border-zinc-800"
                    }`}
                >
                  {msg.role === "user" || typeof msg.content === "string" ? (
                    <span className="whitespace-pre-wrap font-medium">{msg.content}</span>
                  ) : (
                    <StructuredAIMessage 
                        data={msg.content} 
                        onSpeak={(text) => handleSpeak(text, idx)}
                        onStop={handleStop}
                        isSpeaking={speakingIdx === idx}
                        isTtsLoading={ttsLoading && speakingIdx === idx}
                    />
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-5 animate-in fade-in duration-300">
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 border border-zinc-100 dark:border-zinc-700">
                  <Bot className="w-5 h-5 text-primary/40" />
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/20 p-5 rounded-3xl rounded-tl-none border border-zinc-50 dark:border-zinc-800 w-32 flex items-center justify-center">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-primary/30 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-primary/30 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-primary/30 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold animate-pulse">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-5 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 backdrop-blur-xl relative z-20">
            <form onSubmit={handleSend} className="relative flex items-center gap-4">
              <div className="relative flex-1 group">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={fileName ? "Ask a question about the document..." : "Please upload a document first..."}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-4 pr-16 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-zinc-400 resize-none h-[58px] flex items-center"
                  rows={1}
                  disabled={isLoading || !fileName}
                />
                <button
                  type="submit"
                  disabled={!question.trim() || isLoading || !fileName}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-zinc-900 dark:bg-primary text-white dark:text-primary-foreground rounded-xl hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-30 disabled:translate-y-0 disabled:shadow-none"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </form>
            <div className="flex items-center justify-between mt-3 px-2">
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">
                EduMentor RAG Engine · {difficulty} Mode
              </p>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${documentContext ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                    {documentContext ? 'Context Ready' : 'Waiting for Document'}
                </span>
              </div>
            </div>
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
