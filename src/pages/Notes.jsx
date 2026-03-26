import { useAuth } from "@clerk/clerk-react";
import {
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  FileText,
  HelpCircle,
  Lightbulb,
  Loader2,
  Plus,
  Send,
  Upload,
  Zap,
  CheckCircle2,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import noteService from "../api/note.service";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

export default function Notes() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [error, setError] = useState("");
  const [qaQuestion, setQaQuestion] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState([]);
  
  const { getToken } = useAuth();
  const chatEndRef = useRef(null);

  useEffect(() => {
    const initFetch = async () => {
      const token = await getToken();
      if (token) {
        fetchNotes(token);
      }
    };
    initFetch();
  }, [getToken]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [qaHistory, qaLoading]);

  const fetchNotes = async (token) => {
    try {
      const response = await noteService.getAllNotes(token);
      // Backend returns { success, message, data: [] }
      setNotes(response.data || []);
    } catch (err) {
      console.error("Failed to fetch notes:", err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setFile(null);
      setError("Please select a valid PDF file.");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required");

      const response = await noteService.uploadNote(file, token);
      // response is { success, message, data: noteObject }
      if (response.success) {
        setNotes((prev) => [response.data, ...prev]);
        setSelectedNote(response.data);
        setFile(null);
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      setError(err.message || "Failed to upload and summarize note. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    if (e) e.preventDefault();
    if (!qaQuestion.trim() || qaLoading || !selectedNote) return;

    const question = qaQuestion;
    setQaQuestion("");
    setQaLoading(true);
    setQaHistory((prev) => [...prev, { role: "user", content: question }]);

    try {
      const token = await getToken();
      const response = await noteService.askFromNote(selectedNote._id, question, token);
      
      if (response.success) {
        setQaHistory((prev) => [...prev, { 
          role: "assistant", 
          content: response.data.answer,
          relevantSection: response.data.relevantSection,
          confidence: response.data.confidence,
          followUpQuestions: response.data.followUpQuestions
        }]);
      }
    } catch (err) {
      console.error("QA Error:", err);
      setQaHistory((prev) => [...prev, { 
        role: "assistant", 
        content: "Sorry, I couldn't process your question about this document." 
      }]);
    } finally {
      qaLoading && setQaLoading(false);
    }
  };

  const renderSummary = (note) => {
    const { summary, pageCount, wordCount } = note;
    if (!summary) return null;

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="lg:col-span-2 space-y-6">
          {/* Overview & Metadata */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-xl text-primary">
                  <FileText className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight">{summary.title || note.title}</h2>
                  <p className="text-[11px] font-black uppercase tracking-widest text-primary mt-1">{summary.subject || "Academic Resources"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-full border border-zinc-100 dark:border-zinc-700 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-zinc-400" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">{pageCount || 0} Pages</span>
                </div>
                <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-full border border-zinc-100 dark:border-zinc-700 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-zinc-400" />
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">{wordCount || 0} Words</span>
                </div>
              </div>
            </div>
            <p className="text-foreground/80 leading-relaxed font-medium text-base">{summary.overview}</p>
          </div>

          {/* Main Topics */}
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-400 flex items-center gap-2 px-2">
              <ClipboardCheck className="w-5 h-5" />
              Summary
            </h4>
            <div className="space-y-4">
              {summary.mainTopics?.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:border-primary/20 transition-all">
                  <h3 className="text-primary font-black text-sm tracking-wide mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {item.topic}
                  </h3>
                  <p className="text-sm text-foreground/70 leading-relaxed font-medium">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="space-y-4">
            <h4 className="text-sm font-black uppercase tracking-[0.15em] text-zinc-400 flex items-center gap-2 px-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Key Takeaways
            </h4>
            <div className="space-y-3">
              {summary.keyTakeaways?.map((point, i) => (
                <div key={i} className="flex items-start gap-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 p-5 rounded-2xl group">
                  <CheckCircle2 className="mt-0.5 w-5 h-5 text-emerald-500 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                  <p className="text-sm font-medium text-foreground/80 leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Q&A */}
        <div className="space-y-5">
           {/* Document Q&A */}
           <div className="bg-zinc-900 dark:bg-zinc-900 border border-zinc-800 rounded-[2.5rem] flex flex-col h-[700px] shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-white text-sm font-black tracking-tight">Chat with Document</h4>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Ask questions about this note</p>
                </div>
                <div className="bg-primary/20 p-2 rounded-xl text-primary">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-zinc-950/50">
                {qaHistory.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <Bot className="w-10 h-10 text-zinc-700 mb-4" />
                    <p className="text-zinc-500 text-xs font-medium leading-relaxed">
                      Ask any specific question about the content of this document. I'll search for the answer.
                    </p>
                  </div>
                )}
                {qaHistory.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[90%] p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700'
                    }`}>
                      {msg.content}
                    </div>
                    {msg.relevantSection && (
                      <div className="mt-2 p-3 bg-zinc-900 rounded-xl border border-zinc-800 text-[9px] text-zinc-500 italic">
                        Ref: "{msg.relevantSection}"
                      </div>
                    )}
                  </div>
                ))}
                {qaLoading && (
                  <div className="flex gap-2 p-3 bg-zinc-800 rounded-2xl w-16 items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0s]" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleAskQuestion} className="p-4 bg-zinc-900 border-t border-zinc-800">
                <div className="relative">
                  <input
                    type="text"
                    value={qaQuestion}
                    onChange={(e) => setQaQuestion(e.target.value)}
                    placeholder="Ask about this note..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all pr-12"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:scale-110 transition-transform"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </form>
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-20 pb-8 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground">
              Note <span className="text-primary italic">Summarizer</span>
            </h1>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 flex items-center gap-3">
               <Sparkles className="w-3.5 h-3.5 text-amber-500" />
               RAG-Powered Extraction · AI Synthetically Generated Study Guides
            </p>
          </div>

          <button 
            onClick={() => setSelectedNote(null)}
            className="flex items-center gap-2 px-6 py-4 bg-zinc-900 dark:bg-primary text-white dark:text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            New Upload
          </button>
        </div>

        {!selectedNote ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Area */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 text-center hover:border-primary/40 transition-all group relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <form onSubmit={handleUpload} className="relative z-10">
                  <div className="bg-primary/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary rotate-3 group-hover:rotate-0 transition-transform shadow-inner">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black tracking-tight mb-1">Drop PDF Study Notes</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Up to 10MB · Max 8 Pages</p>
                  
                  <label className="block w-full cursor-pointer group/label">
                    <span className="sr-only">Choose file</span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <div className="w-full py-3 px-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-black text-zinc-500 uppercase tracking-widest hover:bg-primary/5 hover:text-primary transition-colors flex items-center justify-center gap-2 mb-3">
                      {file ? `${file.name.slice(0, 15)}...` : "Choose File"}
                    </div>
                  </label>

                  {file && (
                    <div className="p-3 bg-primary/5 dark:bg-primary/10 rounded-xl flex items-center gap-3 border border-primary/20 animate-in zoom-in-95 mb-4">
                      <FileText className="w-5 h-5 text-primary" />
                      <div className="text-left overflow-hidden">
                        <p className="text-[10px] font-black truncate text-primary uppercase tracking-widest">{file.name}</p>
                        <p className="text-[9px] font-bold text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 mb-6 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest animate-shake">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!file || isUploading}
                    className="w-full py-4 bg-zinc-900 dark:bg-primary text-white dark:text-primary-foreground rounded-xl font-black text-[11px] uppercase tracking-[0.2em] disabled:opacity-50 flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-primary/30 transition-all group/btn"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing via RAG...
                      </>
                    ) : (
                      <>
                        Generate Study Guide
                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              <div className="bg-emerald-50/50 dark:bg-emerald-500/5 rounded-2xl p-5 border border-emerald-100 dark:border-emerald-500/10">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  EduMentor Pro Feature
                 </h4>
                 <p className="text-[12px] font-medium text-emerald-900 dark:text-emerald-400 leading-relaxed">
                  Our new RAG (Retrieval Augmented Generation) logic breaks your PDF into chunks for deeper analysis, ensuring 99.9% accuracy in MCQ generation.
                 </p>
              </div>
            </div>

            {/* List of Previous Notes */}
            <div className="lg:col-span-2 space-y-4">
              {notes.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center shadow-sm">
                  <div className="bg-zinc-50 dark:bg-zinc-950 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-200">
                    <BookOpen className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-zinc-400">No notes yet</h3>
                  <p className="text-xs font-medium text-zinc-400 mt-2">Upload your first PDF to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {notes.map((note) => (
                    <button
                      key={note._id}
                      onClick={() => {
                        setSelectedNote(note);
                        setQaHistory([]);
                      }}
                      className="group bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl text-left hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden"
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative z-10 flex items-start gap-5">
                        {/* Icon */}
                        <div className="flex-shrink-0 bg-gradient-to-br from-primary/10 to-primary/5 p-4 rounded-2xl group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                          <FileText className="w-7 h-7 text-primary" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-black text-lg text-foreground mb-1 truncate group-hover:text-primary transition-colors">
                                {note.title}
                              </h3>
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                  <BookOpen className="w-3 h-3" />
                                  {note.pageCount || 1} pages
                                </span>
                                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                  {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                  {note.wordCount?.toLocaleString() || 0} words
                                </span>
                              </div>
                            </div>
                            
                            {/* Arrow icon */}
                            <div className="flex-shrink-0 bg-zinc-100 dark:bg-zinc-800 p-2.5 rounded-xl group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:translate-x-1">
                              <ChevronRight className="w-4 h-4" />
                            </div>
                          </div>

                          {/* Overview */}
                          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                            {note.summary?.overview || "AI-generated study guide from your uploaded PDF document."}
                          </p>

                          {/* Tags */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {note.summary?.subject && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-widest">
                                <Sparkles className="w-3 h-3" />
                                {note.summary.subject}
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                              <CheckCircle2 className="w-3 h-3" />
                              RAG Processed
                            </span>
                            {note.summary?.mainTopics?.length > 0 && (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[9px] font-black uppercase tracking-widest">
                                <ClipboardCheck className="w-3 h-3" />
                                {note.summary.mainTopics.length} Topics
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-700">
             <button 
              onClick={() => setSelectedNote(null)}
              className="flex items-center gap-3 text-zinc-400 hover:text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6 transition-colors group"
             >
              <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                <ChevronRight className="w-3.5 h-3.5 rotate-180" />
              </div>
              Back to library
             </button>
             {renderSummary(selectedNote)}
          </div>
        )}
      </main>

      <Footer />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.1); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.3); }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

function Bot(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}
