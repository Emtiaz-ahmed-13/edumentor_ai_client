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
  Bot,
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
        <div className="lg:col-span-2 space-y-5">
          {/* Overview & Metadata */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight">{summary.title || note.title}</h2>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-0.5">{summary.subject || "Academic Resources"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {speakingIdx === 'summary' ? (
                  <button
                    onClick={handleStop}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold rounded-full border border-rose-200 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-500/10 text-rose-500 transition-all"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    Stop
                  </button>
                ) : (
                  <button
                    onClick={() => handleSpeak(summary.overview, 'summary')}
                    disabled={ttsLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold rounded-full border border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:text-primary hover:border-primary/40 transition-all disabled:opacity-50"
                  >
                    {speakingIdx === 'summary' && ttsLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Volume2 className="w-3 h-3" />
                    )}
                    Listen Overview
                  </button>
                )}
                <div className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-full border border-zinc-100 dark:border-zinc-700 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[9px] font-bold text-zinc-500 uppercase">{pageCount || 0} Pages</span>
                </div>
                <div className="px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-full border border-zinc-100 dark:border-zinc-700 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[9px] font-bold text-zinc-500 uppercase">{wordCount || 0} Words</span>
                </div>
              </div>
            </div>
            <p className="text-foreground/80 leading-relaxed font-medium text-sm">{summary.overview}</p>
          </div>

          {/* Main Topics */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2 px-2">
              <ClipboardCheck className="w-4 h-4" />
              Core Concepts Explored
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.mainTopics?.map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm hover:border-primary/20 transition-all">
                  <h3 className="text-primary font-black uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {item.topic}
                  </h3>
                  <p className="text-xs text-foreground/70 leading-relaxed font-medium">{item.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key Takeaways & Definitions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2 px-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Key Takeaways
              </h4>
              <div className="space-y-3">
                {summary.keyTakeaways?.map((point, i) => (
                  <div key={i} className="flex items-start gap-4 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl group">
                    <CheckCircle2 className="mt-0.5 w-4 h-4 text-emerald-500 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity" />
                    <p className="text-xs font-bold text-foreground/80 leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2 px-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Terminology
              </h4>
              <div className="space-y-3">
                {summary.definitions?.map((def, i) => (
                  <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-1">{def.term}</span>
                    <p className="text-[11px] font-medium text-foreground/70">{def.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MCQs & Short Answers */}
          <div className="space-y-6 pt-4">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2 px-2">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              Exam Preparation (MCQs)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.examQuestions?.mcq?.map((q, i) => (
                <div key={i} className="bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 p-6 rounded-3xl space-y-4">
                  <div className="flex gap-3">
                    <span className="text-amber-500 font-black text-xs">Q{i+1}:</span>
                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{q.question}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {q.options?.map((opt, idx) => (
                      <div key={idx} className="bg-white dark:bg-zinc-950 px-3 py-2 rounded-xl border border-amber-200/20 text-[10px] font-medium text-zinc-600 dark:text-zinc-400">
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-amber-200/20">
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Correct: {q.answer}</p>
                  </div>
                </div>
              ))}
            </div>

            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2 px-2 pt-4">
              <FileText className="w-4 h-4 text-blue-500" />
              Short Answer Practice
            </h4>
            <div className="space-y-4">
              {summary.examQuestions?.shortAnswer?.map((q, i) => (
                <div key={i} className="bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 p-6 rounded-3xl">
                  <p className="text-xs font-bold text-blue-900 dark:text-blue-400 mb-3">{q.question}</p>
                  <div className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-blue-200/20">
                    <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400 block mb-2">Model Answer</span>
                    <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 italic">"{q.modelAnswer}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Q&A + Tips */}
        <div className="space-y-5">
           {/* Document Q&A */}
           <div className="bg-zinc-900 dark:bg-zinc-900 border border-zinc-800 rounded-[2.5rem] flex flex-col h-[600px] shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-white text-sm font-black tracking-tight">Chat with Document</h4>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">EduMentor Engine v2.0</p>
                </div>
                <div className="bg-primary/20 p-2 rounded-xl text-primary">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-zinc-950/50">
                {qaHistory.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <Bot className="w-10 h-10 text-zinc-700 mb-4" />
                    <p className="text-zinc-500 text-[11px] font-medium leading-relaxed">
                      Ask any specific question about the content of this document. I'll search for the answer.
                    </p>
                  </div>
                )}
                {qaHistory.map((msg, i) => (
                  <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[90%] p-4 rounded-2xl text-[11px] font-medium leading-relaxed relative group/msg ${
                      msg.role === 'user' 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-zinc-800 text-zinc-200 rounded-tl-none border border-zinc-700'
                    }`}>
                      {msg.content}
                      {msg.role === 'assistant' && (
                        <div className="mt-2 flex gap-2 border-t border-zinc-700/50 pt-2 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                          {speakingIdx === `chat-${i}` ? (
                            <button
                              onClick={handleStop}
                              className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300"
                            >
                              <Square className="w-2.5 h-2.5 fill-current" />
                              Stop
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSpeak(msg.content, `chat-${i}`)}
                              disabled={ttsLoading}
                              className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors disabled:opacity-30"
                            >
                              <Volume2 className="w-2.5 h-2.5" />
                              Listen
                            </button>
                          )}
                        </div>
                      )}
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
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-[11px] text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all pr-12"
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

           {/* Study Tips */}
           <div className="bg-amber-50/50 dark:bg-amber-500/5 rounded-[2rem] p-6 border border-amber-100 dark:border-amber-500/10">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-4 flex items-center gap-2">
              <Lightbulb className="w-3.5 h-3.5" />
              EduMentor Study Tips
             </h4>
             <ul className="space-y-4">
                {summary.studyTips?.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-amber-200/50 flex items-center justify-center text-[10px] font-bold text-amber-700">{i+1}</div>
                    <p className="text-[11px] font-medium text-amber-900 dark:text-amber-400/80 leading-relaxed">{tip}</p>
                  </li>
                ))}
             </ul>
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

            {/* List of Previous Summaries */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2 px-2">
                <BookOpen className="w-4 h-4" />
                Library of Knowledge
              </h4>

              {notes.length === 0 ? (
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-12 text-center shadow-sm">
                  <div className="bg-zinc-50 dark:bg-zinc-950 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-200">
                    <BookOpen className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-zinc-400">Your library is empty</h3>
                  <p className="text-xs font-medium text-zinc-400 mt-2">Upload a lecture note to see the magic happen.</p>
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
                      className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl text-left hover:border-primary/40 transition-all hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden flex flex-col justify-between h-[160px]"
                    >
                      <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                         <ChevronRight className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-zinc-50 dark:bg-zinc-800 p-3.5 rounded-2xl group-hover:bg-primary/10 group-hover:text-primary transition-colors text-zinc-400">
                            <FileText className="w-6 h-6" />
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="font-black text-sm truncate pr-4">{note.title}</h3>
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                              {new Date(note.createdAt).toLocaleDateString()} · {note.pageCount || 1} Pages
                            </p>
                          </div>
                        </div>
                        <p className="text-[11px] font-medium text-zinc-500 line-clamp-3 leading-relaxed">
                          {note.summary?.overview || "Study guide generated from uploaded PDF note."}
                        </p>
                      </div>
                      <div className="pt-4 flex gap-2">
                        <span className="text-[8px] font-black uppercase tracking-widest bg-primary/5 text-primary px-2 py-1 rounded-md">
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

