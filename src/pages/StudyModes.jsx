import { useAuth } from "@clerk/clerk-react";
import {
  Brain,
  Clock,
  Play,
  Pause,
  RotateCcw,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Flame,
  Zap,
  Target,
  Trophy,
  Volume2,
  VolumeX,
  Coffee,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import studyService from "../api/study.service";
import noteService from "../api/note.service";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

// ─── Pomodoro Sub-component ───
const PomodoroTimer = ({ onSessionComplete }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState("work"); // work, shortBreak, longBreak
  const [muted, setMuted] = useState(false);
  const timerRef = useRef(null);

  const totalTime = mode === "work" ? 25 * 60 : mode === "shortBreak" ? 5 * 60 : 15 * 60;

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleModeComplete();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const handleModeComplete = () => {
    setIsActive(false);
    if (!muted) {
      const audio = new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg");
      audio.play();
    }
    
    if (mode === "work") {
      onSessionComplete(25);
      setMode("shortBreak");
      setTimeLeft(5 * 60);
    } else {
      setMode("work");
      setTimeLeft(25 * 60);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(totalTime);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="relative w-72 h-72 flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="144"
            cy="144"
            r="130"
            className="stroke-zinc-100 dark:stroke-zinc-800 fill-none"
            strokeWidth="8"
          />
          <circle
            cx="144"
            cy="144"
            r="130"
            className={`fill-none transition-all duration-300 ${mode === 'work' ? 'stroke-primary' : 'stroke-emerald-500'}`}
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * 130}
            strokeDashoffset={2 * Math.PI * 130 * (1 - progress / 100)}
            strokeLinecap="round"
          />
        </svg>

        <div className="text-center relative z-10">
          <span className="text-6xl font-black tracking-tighter text-zinc-900 dark:text-white tabular-nums">
            {formatTime(timeLeft)}
          </span>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mt-2">
            {mode === 'work' ? 'Deep Work Phase' : 'Neural Recovery'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={resetTimer}
          className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-zinc-500 hover:text-primary transition-all hover:scale-110"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={toggleTimer}
          className={`w-20 h-20 flex items-center justify-center rounded-[2rem] shadow-2xl transition-all hover:scale-110 active:scale-95 ${
            isActive ? 'bg-zinc-900 dark:bg-zinc-800 text-white' : 'bg-primary text-white shadow-primary/20'
          }`}
        >
          {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
        </button>
        <button
          onClick={() => setMuted(!muted)}
          className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-zinc-500 hover:text-primary transition-all hover:scale-110"
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl">
        <button 
          onClick={() => { setMode('work'); setTimeLeft(25*60); setIsActive(false); }}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'work' ? 'bg-white dark:bg-zinc-800 shadow-sm text-primary' : 'text-zinc-500'}`}
        >
          Focus
        </button>
        <button 
          onClick={() => { setMode('shortBreak'); setTimeLeft(5*60); setIsActive(false); }}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'shortBreak' ? 'bg-white dark:bg-zinc-800 shadow-sm text-emerald-500' : 'text-zinc-500'}`}
        >
          Short Break
        </button>
      </div>
    </div>
  );
};

// ─── Active Recall Sub-component ───
const ActiveRecall = ({ note, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const questions = note.summary.examQuestions.mcq || [];

  const handleNext = (mastery) => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setShowAnswer(false);
    } else {
      onComplete(mastery);
    }
  };

  if (questions.length === 0) return <div>No questions available for this note.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-700">
      <div className="flex items-center justify-between">
        <div className="px-4 py-1.5 bg-primary/10 rounded-full border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
          Question {currentIdx + 1} of {questions.length}
        </div>
        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
          Active Recall Mode
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-12 border border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 min-h-[300px] flex flex-col items-center justify-center text-center relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform">
            <Brain className="w-16 h-16" />
         </div>
         <h3 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white leading-snug">
           {questions[currentIdx].question}
         </h3>
         
         {showAnswer ? (
            <div className="mt-8 p-6 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-2xl animate-in zoom-in-95">
               <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2">Correct Response</span>
               <p className="font-bold text-emerald-900 dark:text-emerald-400">{questions[currentIdx].answer}</p>
            </div>
         ) : (
            <button 
              onClick={() => setShowAnswer(true)}
              className="mt-12 px-8 py-3 bg-zinc-900 dark:bg-zinc-800 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl"
            >
              Show Answer
            </button>
         )}
      </div>

      {showAnswer && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
          {[
            { label: "Forgot", val: 0, color: "hover:bg-rose-500" },
            { label: "Hard", val: 1, color: "hover:bg-amber-500" },
            { label: "Good", val: 2, color: "hover:bg-blue-500" },
            { label: "Perfect", val: 3, color: "hover:bg-emerald-500" }
          ].map((btn) => (
            <button
              key={btn.val}
              onClick={() => handleNext(btn.val)}
              className={`py-4 px-2 rounded-[1.5rem] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase tracking-widest transition-all ${btn.color} hover:text-white hover:border-transparent active:scale-95`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Main Page ───
export default function StudyModes() {
  const { getToken } = useAuth();
  const [activeTab, setActiveTab] = useState("focus"); // focus, recall, revision
  const [selectedNote, setSelectedNote] = useState(null);
  const [notes, setNotes] = useState([]);
  const [dueNotes, setDueNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isStudying, setIsStudying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const [allResp, dueResp] = await Promise.all([
          noteService.getAllNotes(token),
          studyService.getDueNotes(token)
        ]);
        setNotes(allResp.data || []);
        setDueNotes(dueResp.data || []);
      } catch (err) {
        console.error("Failed to fetch notes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getToken]);

  const handlePomodoroComplete = async (duration) => {
    try {
      const token = await getToken();
      await studyService.logSession({
        type: "focus",
        duration,
        noteId: selectedNote?._id
      }, token);
    } catch (err) { console.error(err); }
  };

  const handleRecallComplete = async (mastery) => {
    try {
      const token = await getToken();
      await Promise.all([
        studyService.logSession({
          type: "recall",
          duration: 10,
          noteId: selectedNote._id
        }, token),
        studyService.updateSchedule({
          noteId: selectedNote._id,
          performance: mastery
        }, token)
      ]);
      
      setIsStudying(false);
      setSelectedNote(null);
      // Refresh due notes
      const dueResp = await studyService.getDueNotes(token);
      setDueNotes(dueResp.data || []);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div><Footer /></div>;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-12 max-w-6xl">
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Zap className="w-3.5 h-3.5" />
            Adaptive Cognitive Training
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-white leading-[0.9]">
            Smart <span className="text-primary italic">Study Sessions</span>
          </h1>
        </div>

        {/* Tab Navigation */}
        {!isStudying && (
          <div className="flex flex-wrap gap-4 mb-12">
            {[
              { id: "focus", name: "Focus Mode", icon: <Clock className="w-5 h-5" />, desc: "Pomodoro Engine" },
              { id: "recall", name: "Active Recall", icon: <Brain className="w-5 h-5" />, desc: "Neural Testing" },
              { id: "revision", name: "Revision Mode", icon: <RotateCcw className="w-5 h-5" />, desc: "Spaced Repetition" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[200px] p-6 rounded-[2rem] border transition-all text-left group relative overflow-hidden ${
                  activeTab === tab.id 
                    ? 'bg-zinc-900 dark:bg-zinc-800 border-zinc-900 dark:border-zinc-700 shadow-2xl' 
                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-primary/40'
                }`}
              >
                <div className={`mb-4 w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                  activeTab === tab.id ? 'bg-primary text-white' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-400 group-hover:text-primary'
                }`}>
                  {tab.icon}
                </div>
                <h3 className={`text-base font-black tracking-tight ${activeTab === tab.id ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'}`}>
                  {tab.name}
                </h3>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${activeTab === tab.id ? 'text-zinc-400' : 'text-zinc-400'}`}>
                  {tab.desc}
                </p>
                {activeTab === tab.id && <div className="absolute top-4 right-4"><Sparkles className="w-4 h-4 text-primary" /></div>}
              </button>
            ))}
          </div>
        )}

        {/* Dynamic Content */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          {activeTab === "focus" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
              <div className="lg:col-span-1 space-y-6">
                 <div className="bg-amber-50/50 dark:bg-amber-500/5 rounded-[2.5rem] p-8 border border-amber-100 dark:border-amber-500/10">
                    <h4 className="text-sm font-black text-amber-900 dark:text-amber-400 mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Session Goal
                    </h4>
                    <p className="text-xs text-amber-800/80 dark:text-amber-400/60 font-medium leading-relaxed">
                      Deep work sessions of 25 minutes are proven to optimize focus and prevent cognitive burnout.
                    </p>
                 </div>
                 <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2">Focus Target</h4>
                    <select 
                      onChange={(e) => setSelectedNote(notes.find(n => n._id === e.target.value))}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-5 py-4 text-xs font-black shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="">No specific note (General)</option>
                      {notes.map(n => <option key={n._id} value={n._id}>{n.title}</option>)}
                    </select>
                 </div>
              </div>
              <div className="lg:col-span-2">
                <PomodoroTimer onSessionComplete={handlePomodoroComplete} />
              </div>
            </div>
          )}

          {activeTab === "recall" && (
            <div className="space-y-8">
              {!isStudying ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {notes.filter(n => n.summary?.examQuestions?.mcq?.length > 0).map((note) => (
                    <button
                      key={note._id}
                      onClick={() => { setSelectedNote(note); setIsStudying(true); }}
                      className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2rem] text-left hover:border-primary/40 transition-all hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden"
                    >
                       <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                             <BookOpen className="w-5 h-5" />
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-widest bg-zinc-50 dark:bg-zinc-800 px-2 py-1 rounded-md text-zinc-400">
                             {note.summary.examQuestions.mcq.length} Cards
                          </span>
                       </div>
                       <h3 className="font-black text-sm mb-2">{note.title}</h3>
                       <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{note.summary.subject}</p>
                       <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Start Session <ArrowRight className="w-3 h-3" />
                       </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                   <button 
                    onClick={() => setIsStudying(false)}
                    className="mb-8 flex items-center gap-3 text-zinc-400 hover:text-primary text-[10px] font-black uppercase tracking-[0.2em] transition-colors group"
                   >
                     <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                        <ChevronRight className="w-3.5 h-3.5 rotate-180" />
                     </div>
                     Exit Session
                   </button>
                   <ActiveRecall note={selectedNote} onComplete={handleRecallComplete} />
                </div>
              )}
            </div>
          )}

          {activeTab === "revision" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                 <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                       <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                          <Flame className="w-6 h-6" />
                       </div>
                       <div>
                          <h4 className="text-xl font-black tracking-tight">{dueNotes.length}</h4>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Items Due Today</p>
                       </div>
                    </div>
                    <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                       <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Daily Goal</span>
                          <span className="text-[10px] font-black text-primary">85%</span>
                       </div>
                       <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-[85%] rounded-full" />
                       </div>
                    </div>
                 </div>
                 
                 <div className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10">
                    <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-4">Algorithm Status</h4>
                    <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                      "Our spaced repetition engine calculates intervals based on difficulty. Studying these items today will boost long-term retention by 300%."
                    </p>
                 </div>
              </div>

              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2 mb-4">Daily Roadmap</h4>
                {dueNotes.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 rounded-[3rem] p-16 text-center border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center">
                     <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-6" />
                     <h3 className="text-2xl font-black tracking-tight mb-2">You're All Caught Up</h3>
                     <p className="text-zinc-400 text-sm font-medium">No revisions scheduled for today. Neural networks are fully synced.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dueNotes.map((schedule) => (
                      <div key={schedule._id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-[2.5rem] flex items-center justify-between group hover:shadow-xl hover:shadow-primary/5 transition-all">
                        <div className="flex items-center gap-5">
                           <div className="w-14 h-14 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                              <RotateCcw className="w-6 h-6" />
                           </div>
                           <div>
                              <h3 className="font-black text-sm tracking-tight">{schedule.noteId?.title}</h3>
                              <p className="text-[9px] font-black uppercase tracking-widest text-primary mt-1">{schedule.noteId?.subject || "Subject"}</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => { setActiveTab("recall"); setSelectedNote(schedule.noteId); setIsStudying(true); }}
                          className="px-6 py-3 bg-zinc-900 dark:bg-zinc-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all"
                        >
                          Revise Now
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
