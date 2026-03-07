import {
  AlertCircle,
  Bot,
  Brain,
  ChevronRight,
  ClipboardCheck,
  ClipboardCopy,
  Cpu,
  GraduationCap,
  Lightbulb,
  List,
  Loader2,
  MessageSquare,
  RefreshCcw,
  Send,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import aiService from "../api/ai.service";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

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

/**
 * Renders a rich, structured AI response containing:
 * - explanation paragraph
 * - numbered step-by-step breakdown
 * - analogy callout
 * - key points list
 */
function StructuredAIMessage({ data }) {
  const { explanation, steps, analogy, realLifeExample, keyPoints } = data;

  return (
    <div className="space-y-4 text-sm leading-relaxed">
      {/* Explanation */}
      {explanation && (
        <p className="text-foreground/90 font-medium leading-relaxed">{explanation}</p>
      )}

      {/* Step-by-Step Breakdown */}
      {Array.isArray(steps) && steps.length > 0 && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
          <h4 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
            <List className="w-3.5 h-3.5" />
            Step-by-Step Breakdown
          </h4>
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground shadow-lg shadow-primary/20">
                  {i + 1}
                </span>
                <span className="text-foreground/80 font-medium">
                  {/* Strip "Step N:" prefix if Gemini included it */}
                  {step.replace(/^step\s*\d+[:.]\s*/i, "")}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Analogy & Example Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {analogy && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 transition-colors hover:bg-amber-400/10">
            <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                Analogy
              </span>
              <p className="mt-1 text-foreground/80 font-medium text-xs italic leading-relaxed">{analogy}</p>
            </div>
          </div>
        )}

        {realLifeExample && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4 transition-colors hover:bg-emerald-400/10">
            <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">
                Real-Life Example
              </span>
              <p className="mt-1 text-foreground/80 font-medium text-xs leading-relaxed">{realLifeExample}</p>
            </div>
          </div>
        )}
      </div>

      {/* Key Points */}
      {Array.isArray(keyPoints) && keyPoints.length > 0 && (
        <div className="pt-2">
          <h4 className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
            <ChevronRight className="w-3.5 h-3.5" />
            Key Strategic Points
          </h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/50 text-foreground/80 font-medium text-xs">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary/60" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Converts chat history into a plain-text-only array suitable for sending
 * to the API (structured AI messages are serialised to a text summary).
 */
function buildHistoryForApi(chatHistory) {
  return chatHistory.map((msg) => {
    if (typeof msg.content === "string") {
      return { role: msg.role, content: msg.content };
    }
    // For structured AI messages, send the explanation as the content text
    return {
      role: msg.role,
      content: msg.content?.explanation || JSON.stringify(msg.content),
    };
  });
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AskAI() {
  const [question, setQuestion] = useState("");
  const [difficulty, setDifficulty] = useState('intermediate');
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your EduMentor AI tutor. Ask me anything — I'll give you a clear, step-by-step breakdown of any topic based on your chosen proficiency level.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!question.trim() || isLoading) return;

    const userMessage = { role: "user", content: question };

    // Build history BEFORE appending the new user message
    const historyForApi = buildHistoryForApi(chatHistory);

    setChatHistory((prev) => [...prev, userMessage]);
    setQuestion("");
    setIsLoading(true);
    setError("");

    try {
      const response = await aiService.askQuestion(question, difficulty, historyForApi);
      const data = response.data?.data;

      // Ensure data has the expected fields
      const hasStructure = data && (data.explanation || data.steps || data.keyPoints);

      const aiMessage = {
        role: "assistant",
        content: hasStructure
          ? data
          : data?.explanation || "I encountered an error while processing your request. Please try again.",
      };

      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error("AI Error:", err);
      setError("I'm having trouble connecting to the mentor server. Please ensure the backend is active.");
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting to the server. Please check your backend connection.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (msg) => {
    if (msg.role === "user" || typeof msg.content === "string") {
      return (
        <span className="whitespace-pre-wrap font-medium">{msg.content}</span>
      );
    }
    // Structured AI response
    return <StructuredAIMessage data={msg.content} />;
  };

  const lastDifficulty = DIFFICULTY_LEVELS.find(l => l.id === difficulty);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 flex flex-col pt-24 pb-8 container mx-auto px-4 max-w-4xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-xl shadow-primary/20 rotate-3 transition-transform hover:rotate-0">
              <Brain className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">Ask <span className="text-primary italic">EduMentor</span> AI</h1>
              <p className="text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest mt-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                Step-by-step breakdowns · Multi-turn memory
              </p>
            </div>
          </div>

          {/* Difficulty Selector */}
           <div className="bg-white dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex gap-1">
            {DIFFICULTY_LEVELS.map((level) => {
              const Icon = level.icon;
              const isActive = difficulty === level.id;
              return (
                <button
                  key={level.id}
                  onClick={() => setDifficulty(level.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all duration-300 ${
                    isActive 
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

        {/* Chat Container */}
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col relative">
          {/* Subtle Background Accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
          
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth custom-scrollbar relative z-10"
            style={{ minHeight: "450px", maxHeight: "calc(100vh - 400px)" }}
          >
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-5 animate-in fade-in slide-in-from-bottom-2 duration-500 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                    msg.role === "user"
                      ? "bg-zinc-900 dark:bg-primary text-white dark:text-primary-foreground rotate-3"
                      : "bg-white dark:bg-zinc-800 text-primary border border-zinc-100 dark:border-zinc-700 -rotate-3"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[85%] p-5 rounded-3xl text-sm leading-relaxed shadow-sm ${
                    msg.role === "user"
                      ? "bg-zinc-900 dark:bg-primary text-white rounded-tr-none"
                      : "bg-zinc-50 dark:bg-zinc-800/40 text-foreground rounded-tl-none border border-zinc-100 dark:border-zinc-800"
                  }`}
                >
                  {renderMessageContent(msg)}
                </div>
              </div>
            ))}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold animate-pulse">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading indicator */}
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
          </div>

          {/* Input Area */}
          <div className="p-6 md:p-8 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-100 dark:border-zinc-800 backdrop-blur-xl relative z-20">
            <form onSubmit={handleSend} className="relative flex items-center gap-4">
              <div className="relative flex-1 group">
                <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Describe your query or ask a follow-up..."
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-4 pr-16 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-zinc-400 resize-none h-[58px] flex items-center"
                  rows={1}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!question.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-zinc-900 dark:bg-primary text-white dark:text-primary-foreground rounded-xl hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/20 transition-all disabled:opacity-30 disabled:translate-y-0 disabled:shadow-none"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
            <div className="flex items-center justify-between mt-4 px-2">
               <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">
                EduMentor AI Tutor · {difficulty} Mode
              </p>
              <div className="flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${lastDifficulty?.color.replace('text', 'bg')} animate-pulse`} />
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Engine Ready</span>
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
