import React, { useState, useEffect } from 'react';
import { Target, PlusCircle, PlayCircle, PauseCircle, FileText, Clock, Flame, Sparkles, Zap, BrainCircuit, AlertCircle, Activity } from 'lucide-react';
import { Link } from 'react-router';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api/v1";

export default function GoalTracking() {
  const [goals, setGoals] = useState([]);
  const [productivity, setProductivity] = useState(null);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('daily');
  const [targetDuration, setTargetDuration] = useState(30);

  const fetchGoalsAndProductivity = async () => {
    try {
      const gRes = await fetch(`${API_BASE}/goals`);
      const pRes = await fetch(`${API_BASE}/goals/productivity-score`);
      
      const gData = await gRes.json();
      const pData = await pRes.json();
      
      if (gData.data) {
        // Hydrate backend data with initial pause state if undefined
        const loadedGoals = gData.data.map(g => ({ ...g, isPaused: g.isPaused || false }));
        setGoals(loadedGoals);
      }
      if (pData.data) setProductivity(pData.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGoalsAndProductivity();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setGoals(prev => prev.map(g => {
        if (g.status !== "Completed" && !g.isPaused) {
          const newProg = g.progressDuration + 1;
          return {
             ...g, 
             progressDuration: newProg,
             status: newProg >= g.targetDuration ? "Completed" : "In Progress"
          };
        }
        return g;
      }));
    }, 60000); 
    
    return () => clearInterval(interval);
  }, []);

  const handleAddGoal = async (e, quickData = null) => {
    if (e) e.preventDefault();
    const isQuick = !!quickData;
    
    const placeholderTempId = Math.random().toString();
    const tempGoal = {
        _id: placeholderTempId,
        title: isQuick ? quickData.title : title,
        type: isQuick ? quickData.type : type,
        targetDuration: isQuick ? quickData.targetDuration : Number(targetDuration),
        progressDuration: 0,
        status: 'Not Started',
        isPaused: false
    };
    
    setGoals([tempGoal, ...goals]);
    if(!isQuick) {
        setShowForm(false);
        setTitle('');
        setTargetDuration(30);
    }

    try {
      const res = await fetch(`${API_BASE}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            title: tempGoal.title, 
            type: tempGoal.type, 
            targetDuration: tempGoal.targetDuration 
        })
      });
      const data = await res.json();
      if (data.data) {
        const enriched = { ...data.data, isPaused: false };
        setGoals(prev => prev.map(g => g._id === placeholderTempId ? enriched : g));
        fetchGoalsAndProductivity();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const togglePause = (id) => {
    setGoals(prev => prev.map(g => g._id === id ? { ...g, isPaused: !g.isPaused } : g));
  };

  const getStatusColor = (status, isPaused) => {
    if (status === 'Completed') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (isPaused) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (status === 'In Progress') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-zinc-100 text-zinc-700 border-zinc-200';
  };

  const ringColor = productivity?.score >= 75 ? 'text-emerald-500' : productivity?.score >= 40 ? 'text-amber-500' : 'text-red-500';
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = productivity ? circumference - (productivity.score / 100) * circumference : circumference;

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10 font-sans selection:bg-indigo-100">
      <div className="mx-auto max-w-7xl">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 mb-2">Goal Coaching</h1>
            <p className="text-zinc-500 font-medium">Manage objectives and monitor your overall productivity scores.</p>
          </div>
          <div className="flex bg-white border border-zinc-200 px-4 py-2 rounded-xl shadow-sm text-sm font-bold text-zinc-700 items-center gap-2">
             <BrainCircuit className="w-4 h-4 text-indigo-500" />
             Synchronized with Neural Engine
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           <div className="lg:col-span-2 space-y-6">
              
              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-extrabold text-zinc-900 flex items-center gap-2 tracking-tight">
                    <Target className="w-7 h-7 text-indigo-500 drop-shadow-sm" /> Active Goals
                 </h2>
                 <button 
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 shadow-md shadow-zinc-200"
                 >
                   <PlusCircle className="w-4 h-4" /> Add Goal
                 </button>
              </div>

              <div className="flex flex-wrap gap-3 py-2">
                 <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center mr-2">Smart Presets <Zap className="w-3 h-3 ml-1 text-amber-500" /></span>
                 <button onClick={() => handleAddGoal(null, {title: "Deep Work Sprint", type: "daily", targetDuration: 60})} className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-colors">
                    + Deep Work (60m)
                 </button>
                 <button onClick={() => handleAddGoal(null, {title: "React Concept Review", type: "daily", targetDuration: 30})} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 transition-colors">
                    + React Review (30m)
                 </button>
                 <button onClick={() => handleAddGoal(null, {title: "Weekly Code Challenge", type: "weekly", targetDuration: 120})} className="px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 text-xs font-bold rounded-lg border border-pink-200 transition-colors">
                    + Code Challenge (120m)
                 </button>
              </div>

              {showForm && (
                <div className="bg-white border-2 text-left border-indigo-100 rounded-2xl p-6 shadow-xl mb-6 animate-in fade-in slide-in-from-top-4 origin-top transition-all">
                  <h3 className="font-extrabold text-lg text-zinc-900 mb-4 flex items-center gap-2"><PlusCircle className="text-indigo-500 w-5 h-5"/> Configure Milestone</h3>
                  <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div className="md:col-span-3">
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Goal Title</label>
                      <input required value={title} onChange={e=>setTitle(e.target.value)} type="text" placeholder="e.g. Master React Hooks" className="w-full text-zinc-900 font-medium px-4 py-3 border-2 border-zinc-200 bg-zinc-50 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Timeframe Strategy</label>
                      <select value={type} onChange={e=>setType(e.target.value)} className="w-full bg-zinc-50 font-medium text-zinc-900 px-4 py-3 border-2 border-zinc-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer">
                        <option value="daily">Daily Objective</option>
                        <option value="weekly">Weekly Campaign</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1.5">Target (Minutes)</label>
                      <input required value={targetDuration} onChange={e=>setTargetDuration(e.target.value)} type="number" min="5" className="w-full bg-zinc-50 font-medium text-zinc-900 px-4 py-3 border-2 border-zinc-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all" />
                    </div>
                    <div className="flex items-end">
                       <button type="submit" className="w-full h-[52px] bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-2 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-200 active:scale-95">
                         Lock In Target <Sparkles className="w-4 h-4"/>
                       </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="space-y-5">
                {goals.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border-2 border-zinc-200 border-dashed">
                       <div className="mx-auto w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
                           <Target className="h-8 w-8 text-zinc-300" />
                       </div>
                       <h3 className="text-base font-extrabold text-zinc-900">No active directives</h3>
                       <p className="text-sm font-medium text-zinc-500 mt-1">Tap 'Add Goal' or a Quick Preset to launch.</p>
                    </div>
                ) : (
                  goals.map(goal => {
                    const percent = Math.min(Math.round((goal.progressDuration / goal.targetDuration) * 100), 100);
                    const isUrgent = goal.type === 'daily' && percent > 0 && percent < 30;

                    return (
                      <div key={goal._id} className={`bg-white rounded-2xl border-2 p-6 transition-all duration-300 shadow-sm relative overflow-hidden group ${goal.status === 'Completed' ? 'border-emerald-200 bg-emerald-50/10' : isUrgent && !goal.isPaused ? 'border-amber-200 hover:border-amber-400' : goal.isPaused ? 'border-amber-200 opacity-90' : 'border-zinc-200 hover:border-indigo-300 hover:shadow-md'}`}>
                        
                        {goal.status === 'Completed' && (
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 via-transparent to-transparent opacity-50 z-0 pointer-events-none"></div>
                        )}
                        
                        <div className="relative z-10 flex justify-between items-start mb-4">
                           <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[10px] uppercase font-black tracking-wider px-2.5 py-1 rounded-md border shadow-sm ${getStatusColor(goal.status, goal.isPaused)}`}>
                                   {goal.status === 'Completed' ? <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3"/> COMPLETED</span> : goal.isPaused ? <span className="flex items-center gap-1"><PauseCircle className="w-3 h-3"/> PAUSED</span> : isUrgent ? <span className="flex items-center gap-1 animate-pulse"><AlertCircle className="w-3 h-3"/> FALLING BEHIND</span> : <span className="flex items-center gap-1"><Activity className="w-3 h-3 text-blue-500"/> ACTIVE</span>}
                                </span>
                                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 px-2.5 py-1 rounded-md">{goal.type}</span>
                              </div>
                              <h3 className={`font-extrabold text-xl ${goal.status === 'Completed' ? 'text-emerald-900' : goal.isPaused ? 'text-zinc-500' : 'text-zinc-900'}`}>{goal.title}</h3>
                           </div>
                           <div className="text-right flex flex-col items-end">
                              <span className={`text-3xl font-black font-mono tracking-tighter ${goal.status === 'Completed' ? 'text-emerald-500' : goal.isPaused ? 'text-amber-500' : isUrgent ? 'text-amber-500' : 'text-indigo-600'}`}>{percent}%</span>
                           </div>
                        </div>
                        
                        <div className="mb-5 relative z-10">
                           <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                              <span>{Math.floor(goal.progressDuration)} mins logged</span>
                              <span>{goal.targetDuration} mins target</span>
                           </div>
                           <div className={`h-3 w-full bg-zinc-100 rounded-full overflow-hidden shadow-inner ${goal.isPaused ? 'opacity-70' : ''}`}>
                              <div className={`h-full transition-all duration-1000 ease-out flex items-center justify-end pr-1 ${goal.status === 'Completed' ? 'bg-emerald-500' : goal.isPaused ? 'bg-amber-400' : isUrgent ? 'bg-amber-500 animate-pulse' : 'bg-indigo-500'}`} style={{ width: `${percent}%` }}>
                                  {percent > 5 && percent < 100 && !goal.isPaused && <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-ping"></div>}
                              </div>
                           </div>
                        </div>

                        <div className="flex flex-wrap gap-3 pt-4 border-t border-zinc-100 relative z-10 transition-colors group-hover:border-zinc-200">
                            {goal.status !== 'Completed' && (
                              <button onClick={() => togglePause(goal._id)} className={`inline-flex items-center gap-1.5 px-4 py-2 ${goal.isPaused ? 'bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-700 border-amber-200' : 'bg-white hover:bg-amber-50 text-zinc-600 border-zinc-200'} text-xs font-bold rounded-lg border transition-all hover:shadow-md cursor-pointer`}>
                                {goal.isPaused ? <PlayCircle className="w-4 h-4" /> : <PauseCircle className="w-4 h-4" />} 
                                {goal.isPaused ? 'Resume Goal' : 'Pause Goal'}
                              </button>
                            )}
                            {goal.status !== 'Completed' && (
                              <Link to="/analytics" className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-xs font-bold rounded-lg border border-indigo-100 transition-all hover:shadow-md hover:shadow-indigo-200">
                                <Activity className="w-4 h-4" /> Focus View
                              </Link>
                            )}
                            <Link to="/document-qa" className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-bold rounded-lg border border-zinc-200 transition-colors">
                              <CheckSquare className="w-4 h-4 text-emerald-500" /> Topic Quiz
                            </Link>
                            <Link to="/ask-ai" className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 text-xs font-bold rounded-lg border border-zinc-200 transition-colors">
                              <FileText className="w-4 h-4 text-blue-500" /> AI Tutor
                            </Link>
                            <Link to="/" className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 text-xs font-bold rounded-lg border border-zinc-900 transition-all shadow-sm">
                              <Zap className="w-4 h-4 text-amber-400" /> Explore Platform
                            </Link>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

           </div>

           <div className="lg:col-span-1 space-y-6">
              
              <div className="bg-gradient-to-br from-orange-400 via-rose-500 to-pink-600 rounded-3xl p-6 text-white shadow-xl shadow-rose-500/25 relative overflow-hidden group">
                 <div className="absolute -top-10 -right-10 p-6 opacity-20 transition-transform duration-700 group-hover:rotate-12 group-hover:scale-110">
                    <Flame className="w-48 h-48" />
                 </div>
                 <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2 font-bold text-orange-100 uppercase tracking-widest text-[11px]">
                       <div className="w-6 h-6 bg-white/20 backdrop-blur rounded-md flex items-center justify-center"><Flame className="w-4 h-4 fill-current" /></div> 
                       Current Momentum
                    </div>
                    <div className="flex items-baseline gap-2 mt-4">
                       <span className="text-6xl font-black tabular-nums tracking-tighter">{productivity?.components?.streakConsistency?.value || 0}</span>
                       <span className="text-lg font-bold text-rose-100">Days</span>
                    </div>
                    <p className="text-xs font-medium text-pink-100 mt-2 bg-white/10 p-2 rounded-lg backdrop-blur">
                        You're in the top 5% of active users this week. Keep burning!
                    </p>
                 </div>
              </div>

              <div className="bg-white rounded-3xl border border-zinc-200 p-8 shadow-sm flex flex-col items-center justify-center relative hover:shadow-lg transition-shadow">
                 <h3 className="font-extrabold text-zinc-900 absolute top-6 left-6 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-zinc-400" /> Productivity Index
                 </h3>
                 
                 <div className="relative w-52 h-52 mt-10 mb-6">
                    <svg className="w-full h-full transform -rotate-90 filter drop-shadow-sm">
                      <circle cx="104" cy="104" r={radius} stroke="currentColor" strokeWidth="16" fill="transparent" className="text-zinc-100" />
                      {productivity && (
                        <circle 
                           cx="104" cy="104" r={radius} 
                           stroke="currentColor" 
                           strokeWidth="16" 
                           fill="transparent" 
                           strokeDasharray={circumference}
                           strokeDashoffset={strokeDashoffset}
                           strokeLinecap="round"
                           className={`${ringColor} transition-all duration-1500 ease-out`}
                        />
                      )}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-6xl font-black tracking-tighter text-zinc-900 drop-shadow-sm mb-1">
                          {productivity?.score || 0}
                       </span>
                       <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md">Rating / 100</span>
                    </div>
                 </div>
                 
                 <div className="bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5 flex-wrap justify-center">
                    <Target className="w-3.5 h-3.5" /> High Performance Zone
                 </div>
              </div>

              <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-sm">
                 <h3 className="text-sm font-extrabold text-zinc-900 mb-4">Metric Breakdown</h3>
                 <div className="grid grid-cols-2 gap-4">
                    
                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 hover:bg-blue-50 transition-colors">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-1">Study Load</p>
                       <p className="text-2xl font-black text-blue-900">{productivity?.components?.studyTime?.points || 0} <span className="text-xs text-blue-400/50 font-bold">/ 25</span></p>
                    </div>
                    
                    <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 hover:bg-indigo-50 transition-colors">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-1">Goals Met</p>
                       <p className="text-2xl font-black text-indigo-900">{productivity?.components?.goalCompletion?.points || 0} <span className="text-xs text-indigo-400/50 font-bold">/ 35</span></p>
                    </div>
                    
                    <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 hover:bg-orange-50 transition-colors">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-1">Consistency</p>
                       <p className="text-2xl font-black text-orange-900">{productivity?.components?.streakConsistency?.points || 0} <span className="text-xs text-orange-400/50 font-bold">/ 25</span></p>
                    </div>
                    
                    <div className="p-4 bg-pink-50/50 rounded-2xl border border-pink-100 hover:bg-pink-50 transition-colors">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-pink-500 mb-1">Engagement</p>
                       <p className="text-2xl font-black text-pink-900">{productivity?.components?.engagementLevel?.points || 0} <span className="text-xs text-pink-400/50 font-bold">/ 15</span></p>
                    </div>

                 </div>
              </div>

              <div className="bg-zinc-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute -left-6 -bottom-6 opacity-10">
                      <BrainCircuit className="w-32 h-32 text-indigo-300" />
                  </div>
                  <div className="relative z-10">
                     <div className="flex items-center gap-2 mb-3">
                         <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                         </div>
                         <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-300">Neural Insights</h3>
                     </div>
                     <p className="text-sm font-medium text-zinc-300 leading-relaxed">
                         "Your velocity peaks in the <span className="text-indigo-400 font-bold">afternoon</span>. To maximize goal completion, I recommend tackling High-Priority daily objectives between 2PM and 5PM."
                     </p>
                  </div>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}

function CheckSquare(props) {
  return <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 11 3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;
}
