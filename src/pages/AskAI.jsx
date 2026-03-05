import { Bot, Brain, Loader2, Send, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import aiService from "../api/ai.service";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

export default function AskAI() {
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "assistant", content: "Hello! I'm your EduMentor AI tutor. How can I help you today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const userMessage = { role: "user", content: question };
    setChatHistory((prev) => [...prev, userMessage]);
    setQuestion("");
    setIsLoading(true);

    try {
      const response = await aiService.askQuestion(question);
      console.log("DEBUG FRONTEND: API Response:", response.data);
  
      // Without the interceptor, we need to access 'data.data'
      const aiResponse = response.data?.data?.explanation;
      
      const aiMessage = { 
        role: "assistant", 
        content: aiResponse || "I'm sorry, I couldn't process that. The response structure was unexpected." 
      };
      setChatHistory((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      const errorMessage = { role: "assistant", content: "Sorry, I'm having trouble connecting to the server. Please check your backend connection." };
      setChatHistory((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 flex flex-col pt-24 pb-8 container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-lg shadow-primary/20">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ask EduMentor AI</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Powered by advanced Gemini AI
            </p>
          </div>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden flex flex-col backdrop-blur-sm bg-opacity-80">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth"
          >
            {chatHistory.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                  msg.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                }`}>
                  {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                </div>
                
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : "bg-zinc-50 dark:bg-zinc-800/50 text-foreground rounded-tl-none border border-zinc-100 dark:border-zinc-800"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-zinc-400" />
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl rounded-tl-none border border-zinc-100 dark:border-zinc-800">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
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
                placeholder="Ask your mentor anything..."
                className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-zinc-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!question.trim() || isLoading}
                className="absolute right-2 p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
            <p className="text-[10px] text-zinc-400 mt-2 text-center uppercase tracking-widest font-medium">
              Educational AI Assistant • Think Big
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
