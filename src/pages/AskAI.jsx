import {
  Bot,
  Brain,
  ChevronRight,
  Lightbulb,
  List,
  Loader2,
  Send,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import aiService from "../api/ai.service";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

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
        <p className="text-foreground/90">{explanation}</p>
      )}

      {/* Step-by-Step Breakdown */}
      {Array.isArray(steps) && steps.length > 0 && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <h4 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <List className="w-3.5 h-3.5" />
            Step-by-Step Breakdown
          </h4>
          <ol className="space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="text-foreground/80">
                  {/* Strip "Step N:" prefix if Gemini included it */}
                  {step.replace(/^step\s*\d+[:.]\s*/i, "")}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Analogy */}
      {analogy && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3">
          <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-500">
              Analogy
            </span>
            <p className="mt-1 text-foreground/80">{analogy}</p>
          </div>
        </div>
      )}

      {/* Real-Life Example */}
      {realLifeExample && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3">
          <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-500">
              Real-Life Example
            </span>
            <p className="mt-1 text-foreground/80">{realLifeExample}</p>
          </div>
        </div>
      )}

      {/* Key Points */}
      {Array.isArray(keyPoints) && keyPoints.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <ChevronRight className="w-3.5 h-3.5" />
            Key Points
          </h4>
          <ul className="space-y-1.5">
            {keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-foreground/80">
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
  const [chatHistory, setChatHistory] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your EduMentor AI tutor. Ask me anything — I'll give you a clear, step-by-step breakdown of any topic.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const userMessage = { role: "user", content: question };

    // Build history BEFORE appending the new user message so the AI sees prior turns
    const historyForApi = buildHistoryForApi(chatHistory);

    setChatHistory((prev) => [...prev, userMessage]);
    setQuestion("");
    setIsLoading(true);

    try {
      const response = await aiService.askQuestion(question, historyForApi);
      const data = response.data?.data;

      // If the response has steps, store the full structured object; otherwise plain text
      const hasStructure =
        data && (data.explanation || data.steps || data.keyPoints);

      const aiMessage = {
        role: "assistant",
        content: hasStructure
          ? data
          : data?.explanation ||
            "I'm sorry, I couldn't process that. The response structure was unexpected.",
      };

      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      setChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting to the server. Please check your backend connection.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (msg) => {
    if (msg.role === "user" || typeof msg.content === "string") {
      return (
        <span className="whitespace-pre-wrap">{msg.content}</span>
      );
    }
    // Structured AI response
    return <StructuredAIMessage data={msg.content} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 flex flex-col pt-24 pb-8 container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-lg shadow-primary/20">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ask EduMentor AI</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Step-by-step breakdowns · Follow-up questions · Powered by Gemini AI
            </p>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col backdrop-blur-sm bg-opacity-80">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth"
            style={{ minHeight: "420px", maxHeight: "calc(100vh - 340px)" }}
          >
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
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
                  className={`max-w-[82%] p-4 rounded-2xl text-sm shadow-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-zinc-50 dark:bg-zinc-800/50 text-foreground rounded-tl-none border border-zinc-100 dark:border-zinc-800"
                  }`}
                >
                  {renderMessageContent(msg)}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl rounded-tl-none border border-zinc-100 dark:border-zinc-800">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="ml-2 text-xs text-muted-foreground">Thinking…</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800 backdrop-blur-md">
            <form onSubmit={handleSend} className="relative flex items-center gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask anything… or follow up on a previous answer"
                className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-zinc-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!question.trim() || isLoading}
                className="absolute right-2 p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
            <p className="text-[10px] text-zinc-400 mt-2 text-center uppercase tracking-widest font-medium">
              EduMentor AI · Remembers your conversation · Ask follow-ups freely
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
