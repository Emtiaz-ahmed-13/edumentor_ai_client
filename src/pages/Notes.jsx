import { useAuth } from "@clerk/clerk-react";
import {
  BookOpen,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Loader2,
  Plus,
  Send,
  Upload,
  Zap,
  CheckCircle2,
  MessageSquare,
  Sparkles,
  Square,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import noteService from "../api/note.service";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import { speakText, stopSpeaking } from "../utils/textToSpeech";

export default function Notes() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [error, setError] = useState("");
  const [qaQuestion, setQaQuestion] = useState("");
  const [qaLoading, setQaLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState([]);
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
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <div className="flex items-start gap-4 mb-5">
              <div className="bg-primary/10 p-3 rounded-xl text-primary flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold tracking-tight mb-1.5 text-foreground">{summary.title || note.title}</h2>
                <p className="text-xs font-semibold uppercase tracking-wider text-primary/80">{summary.subject || "Academic Resources"}</p>
              </div>
              {speakingIdx === 'summary' ? (
                <button
                  onClick={handleStop}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-500/10 text-rose-500 transition-all hover:bg-rose-100 flex-shrink-0"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  Stop
                </button>
              ) : (
                <button
                  onClick={() => handleSpeak(summary.overview, 'summary')}
                  disabled={ttsLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-primary hover:border-primary/40 transition-all disabled:opacity-50 flex-shrink-0"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Listen
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              <div className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700 flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{pageCount || 0} Pages</span>
              </div>
              <div className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-100 dark:border-zinc-700 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">{wordCount?.toLocaleString() || 0} Words</span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <p className="text-sm text-foreground/80 leading-relaxed">{summary.overview}</p>
            </div>
          </div>

          {/* Main Topics */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2 px-1">
              <ClipboardCheck className="w-4 h-4" />
              Summary
            </h3>
            <div className="space-y-3">
              {summary.mainTopics?.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 shadow-sm hover:shadow-md transition-all">
                  <h4 className="text-primary font-semibold text-sm mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {item.topic}
                  </h4>
                  <p className="text-sm text-foreground/70 leading-relaxed pl-3.5">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-2 px-1">
              <Zap className="w-4 h-4 text-amber-500" />
              Key Takeaways
            </h3>
            <div className="space-y-2.5">
              {summary.keyTakeaways?.map((point, i) => (
                <div key={i} className="flex items-start gap-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 p-4 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/80 leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Q&A */}
        <div className="space-y-4">
           {/* Document Q&A */}
           <div className="bg-zinc-900 dark:bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col h-[600px] shadow-xl overflow-hidden">
              <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white text-sm font-bold tracking-tight">Chat with Document</h3>
                  <div className="bg-primary/20 p-1.5 rounded-lg text-primary">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-xs text-zinc-500">Ask questions about this document</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-zinc-950/50">
                {qaHistory.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <div className="bg-zinc-800/50 p-4 rounded-xl mb-3">
                      <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto" />
                    </div>
                    <h4 className="text-white text-sm font-semibold mb-1">No messages yet</h4>
                    <p className="text-zinc-500 text-xs leading-relaxed max-w-xs">
                      Ask any question about the content of this document.
                    </p>
                  </div>
                )}
                {qaHistory.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700'
                    }`}>
                      {msg.content}
                      {msg.role === 'assistant' && (
                        <div className="mt-2 flex gap-2 border-t border-zinc-700/50 pt-2">
                          {speakingIdx === `chat-${i}` ? (
                            <button
                              onClick={handleStop}
                              className="flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                            >
                              <Square className="w-3 h-3 fill-current" />
                              Stop
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSpeak(msg.content, `chat-${i}`)}
                              disabled={ttsLoading}
                              className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-primary transition-colors disabled:opacity-30"
                            >
                              <Volume2 className="w-3 h-3" />
                              Listen
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    {msg.relevantSection && (
                      <div className="mt-2 p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-xs text-zinc-500 italic max-w-[85%]">
                        <span className="text-zinc-600 font-semibold block mb-0.5 text-[10px]">Reference:</span>
                        "{msg.relevantSection}"
                      </div>
                    )}
                  </div>
                ))}
                {qaLoading && (
                  <div className="flex items-start">
                    <div className="bg-zinc-800 p-3 rounded-xl rounded-tl-none border border-zinc-700">
                      <div className="flex gap-1.5">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0s]" />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleAskQuestion} className="p-3 bg-zinc-900 border-t border-zinc-800">
                <div className="relative">
                  <input
                    type="text"
                    value={qaQuestion}
                    onChange={(e) => setQaQuestion(e.target.value)}
                    placeholder="Ask a question..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all pr-11"
                  />
                  <button
                    type="submit"
                    disabled={!qaQuestion.trim() || qaLoading}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:scale-110 active:scale-95 transition-transform disabled:opacity-50 disabled:hover:scale-100"
                  >
                    <Send className="w-3.5 h-3.5" />
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

      <main className="flex-1 container mx-auto px-4 pt-20 pb-8 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Smart <span className="text-primary">Study Notes</span>
            </h1>
            <p className="text-zinc-500 font-medium text-xs mt-1.5 flex items-center gap-2">
               <Sparkles className="w-3.5 h-3.5 text-amber-500" />
               Upload PDF · Get AI Summary · Ask Questions
            </p>
          </div>

          {selectedNote && (
            <button 
              onClick={() => setSelectedNote(null)}
              className="flex items-center gap-2 px-5 py-3 bg-zinc-900 dark:bg-primary text-white dark:text-primary-foreground rounded-xl font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" />
              New Upload
            </button>
          )}
        </div>

        {!selectedNote ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Upload Area */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white dark:bg-zinc-900 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center hover:border-primary/40 transition-all group relative overflow-hidden shadow-sm">
                <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <form onSubmit={handleUpload} className="relative z-10">
                  <div className="bg-primary/10 w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary group-hover:scale-105 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-bold tracking-tight mb-1">Drop PDF Study Notes</h3>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-4">Up to 10MB · Max 8 Pages</p>
                  
                  <label className="block w-full cursor-pointer group/label">
                    <span className="sr-only">Choose file</span>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <div className="w-full py-2.5 px-4 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs font-semibold text-zinc-500 uppercase tracking-wider hover:bg-primary/5 hover:text-primary transition-colors flex items-center justify-center gap-2 mb-3">
                      {file ? `${file.name.slice(0, 20)}...` : "Choose File"}
                    </div>
                  </label>

                  {file && (
                    <div className="p-3 bg-primary/5 dark:bg-primary/10 rounded-lg flex items-center gap-3 border border-primary/20 animate-in zoom-in-95 mb-4">
                      <FileText className="w-5 h-5 text-primary" />
                      <div className="text-left overflow-hidden flex-1">
                        <p className="text-xs font-semibold truncate text-primary">{file.name}</p>
                        <p className="text-[10px] text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-3 mb-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-lg text-rose-600 dark:text-rose-400 text-xs font-semibold animate-shake">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!file || isUploading}
                    className="w-full py-3 bg-zinc-900 dark:bg-primary text-white dark:text-primary-foreground rounded-lg font-bold text-xs uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-xl hover:shadow-primary/30 transition-all group/btn"
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

              <div className="bg-emerald-50/50 dark:bg-emerald-500/5 rounded-xl p-4 border border-emerald-100 dark:border-emerald-500/10">
                 <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  EduMentor Pro Feature
                 </h4>
                 <p className="text-xs text-emerald-900 dark:text-emerald-400 leading-relaxed">
                  Our RAG (Retrieval Augmented Generation) logic breaks your PDF into chunks for deeper analysis, ensuring high accuracy.
                 </p>
              </div>
            </div>

            {/* List of Previous Summaries */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2 px-1">
                <BookOpen className="w-4 h-4" />
                Library of Knowledge
              </h4>

              {notes.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center shadow-sm">
                  <div className="bg-zinc-50 dark:bg-zinc-950 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-200">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-zinc-400">Your library is empty</h3>
                  <p className="text-xs text-zinc-400 mt-1.5">Upload a lecture note to see the magic happen.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {notes.map((note) => (
                    <button
                      key={note._id}
                      onClick={() => {
                        setSelectedNote(note);
                        setQaHistory([]);
                      }}
                      className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl text-left hover:border-primary/40 transition-all hover:translate-y-[-2px] hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden flex flex-col justify-between h-[150px]"
                    >
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <ChevronRight className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-2.5 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors text-zinc-400">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="overflow-hidden flex-1">
                            <h3 className="font-bold text-sm truncate pr-6">{note.title}</h3>
                            <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">
                              {new Date(note.createdAt).toLocaleDateString()} · {note.pageCount || 1} Pages
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                          {note.summary?.overview || "Study guide generated from uploaded PDF note."}
                        </p>
                      </div>
                      <div className="pt-3 flex gap-2">
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/5 text-primary px-2 py-1 rounded">
                          {note.summary?.subject || "Subject"}
                        </span>
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
              className="flex items-center gap-2 text-zinc-400 hover:text-primary text-xs font-semibold uppercase tracking-wider mb-6 transition-colors group"
             >
              <div className="bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
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

