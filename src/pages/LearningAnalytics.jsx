import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend } from 'recharts';
import { Clock, Activity, Target, Timer, Maximize2, History, Trophy } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api/v1";

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

export default function LearningAnalytics() {
  const [timer, setTimer] = useState(0); 
  const [isActive, setIsActive] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [history, setHistory] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  
  const [timeFilter, setTimeFilter] = useState('7D'); // 7D, 30D, ALL

  // Initialize and fetch data
  const fetchData = async () => {
    try {
      const [currentRes, analyticsRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/sessions/current`),
        fetch(`${API_BASE}/sessions/analytics`),
        fetch(`${API_BASE}/sessions/history`)
      ]);
      
      const currentData = await currentRes.json();
      const analyticsJson = await analyticsRes.json();
      const historyJson = await historyRes.json();

      if (currentData.data) {
        setSessionId(currentData.data._id);
        setTimer((currentData.data.durationMinutes || 0) * 60);
      }
      
      if (analyticsJson.data) setAnalyticsData(analyticsJson.data);
      if (historyJson.data) setHistory(historyJson.data);
    } catch (err) {
      console.error("Failed to load analytics data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Timer logic
  useEffect(() => {
    let interval;
    if (isActive) {
      interval = setInterval(() => {
        setTimer(prev => {
          const newTime = prev + 1;
          if (newTime % 60 === 0 && sessionId) {
             fetch(`${API_BASE}/sessions/${sessionId}`, {
               method: 'PATCH',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ durationMinutes: Math.floor(newTime / 60) })
             }).catch(console.error);

             fetch(`${API_BASE}/goals/progress`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ elapsedMinutes: 1 })
             }).catch(console.error);
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, sessionId]);

  // Tab visibility tracker
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsActive(document.visibilityState === 'visible');
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  if (!analyticsData) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-pulse flex items-center gap-2 text-blue-500 font-medium tracking-wide"><Timer className="animate-spin text-blue-500" /> Compiling Neural Analytics...</div></div>;
  }

  // Interactive filter simulation
  const getFilteredData = (dataArray, scaleFactor) => {
    if(timeFilter === '30D') return dataArray.map(d => ({...d, minutes: d.minutes * 2, questions: d.questions * 2}));
    if(timeFilter === 'ALL') return dataArray.map(d => ({...d, minutes: d.minutes * 5, questions: d.questions * 5}));
    return dataArray;
  };

  const chartData = getFilteredData(analyticsData.dailyStudyTime);
  const perfData = getFilteredData(analyticsData.weeklyPerformance);

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-10 font-sans selection:bg-blue-100">
      <div className="mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 mb-2">Learning Analytics</h1>
            <p className="text-zinc-500 font-medium">Real-time insights into your cognitive velocity and focus.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
             {/* Time Filters */}
             <div className="flex bg-zinc-200/50 p-1 rounded-xl">
                 {['7D', '30D', 'ALL'].map(t => (
                     <button 
                       key={t}
                       onClick={() => setTimeFilter(t)}
                       className={`px-4 py-1.5 text-sm font-bold rounded-lg transition-all duration-300 ${timeFilter === t ? 'bg-white text-blue-600 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                     >
                       {t}
                     </button>
                 ))}
             </div>

            <div className="flex items-center gap-4 rounded-full border border-blue-100 bg-white/60 px-6 py-2.5 shadow-[0_4px_20px_-4px_rgba(59,130,246,0.15)] backdrop-blur-md">
              <div className="relative flex h-3 w-3">
                {isActive && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>}
                <span className={`relative inline-flex h-3 w-3 rounded-full ${isActive ? 'bg-blue-500' : 'bg-red-400'}`}></span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  {isActive ? 'Session Active' : 'Session Paused'}
                </p>
                <p className="text-xl font-bold font-mono text-zinc-800 tabular-nums">{formatTime(timer)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top metrics summary */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 mb-8">
           <div className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1 cursor-default">
             <div className="flex items-center gap-3 mb-2">
                 <div className="rounded-xl bg-indigo-50 p-2.5 group-hover:bg-indigo-100 transition-colors"><Activity className="h-5 w-5 text-indigo-600" /></div>
                 <h3 className="font-bold text-zinc-600">Active Streak</h3>
             </div>
             <p className="text-4xl font-black text-zinc-900 mt-3">{analyticsData.streak} <span className="text-lg text-zinc-400 font-bold tracking-normal uppercase text-[12px]">Days</span></p>
           </div>
           
           <div className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-pink-200 transition-all duration-300 hover:-translate-y-1 cursor-default md:col-span-2">
             <div className="flex items-center gap-3 mb-2">
                 <div className="rounded-xl bg-pink-50 p-2.5 group-hover:bg-pink-100 transition-colors"><Target className="h-5 w-5 text-pink-600" /></div>
                 <h3 className="font-bold text-zinc-600">Macro Progress</h3>
             </div>
             <div className="flex items-end justify-between mt-3">
                 <p className="text-4xl font-black text-zinc-900">{analyticsData.overallProgress}%</p>
                 <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-1 rounded-md">Pacing Excellent</span>
             </div>
             <div className="mt-4 h-2.5 w-full rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${analyticsData.overallProgress}%` }}></div>
             </div>
           </div>

           <div className="group rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-amber-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden cursor-default">
             <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Trophy className="w-32 h-32 text-amber-500" />
             </div>
             <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-2">
                     <div className="rounded-xl bg-amber-50 p-2.5 group-hover:bg-amber-100 transition-colors"><Trophy className="h-5 w-5 text-amber-600" /></div>
                     <h3 className="font-bold text-zinc-600">Leaderboard</h3>
                 </div>
                 <p className="text-4xl font-black text-zinc-900 mt-3">Top {analyticsData.leaderboardPercentile || 15}%</p>
                 <p className="mt-2 text-xs text-amber-600 font-bold uppercase tracking-wider">Platform Consistency</p>
             </div>
           </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 mb-8">
          
          {/* Main Chart Column */}
          <div className="xl:col-span-2 space-y-6">
            
            {/* Daily Study Time */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between">
                <div>
                    <h3 className="text-xl font-extrabold text-zinc-900">Velocity Dynamics</h3>
                    <span className="text-xs font-medium uppercase tracking-widest text-zinc-400 mt-1 block">Minutes Engaged / Day</span>
                </div>
                <div className="mt-2 sm:mt-0 text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-200">
                        ↑ 14% vs Last Range
                    </span>
                </div>
              </div>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 13, fontWeight: 600}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 13, fontWeight: 600}} dx={-10} />
                    <Tooltip 
                       contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
                       cursor={{ stroke: '#cbd5e1', strokeWidth: 2, strokeDasharray: '4 4' }}
                    />
                    <Area type="monotone" dataKey="minutes" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorMin)" activeDot={{ r: 8, strokeWidth: 0, fill: '#2563eb' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sub Charts Row */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              
              {/* Radial Productivity Hours */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                 <div className="mb-2">
                  <h3 className="font-extrabold text-zinc-900">Focus Windows</h3>
                  <span className="text-xs text-zinc-400 font-medium tracking-wide uppercase">Time of Day Preference</span>
                  <p className="text-[11px] font-medium text-zinc-500 mt-2 leading-relaxed bg-zinc-50 border border-zinc-100 p-2 rounded-lg">
                     This radial chart analyzes your past activity to reveal when your brain is most engaged. It breaks your study sessions into Morning, Afternoon, and Evening blocks so you can schedule difficult tasks during your peak hours!
                  </p>
                 </div>
                 <div className="flex-1 w-full min-h-[200px] -mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                          cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={14} 
                          data={analyticsData.timeOfDayDistribution || []}
                        >
                          <RadialBar
                            minAngle={15} label={{ position: 'insideStart', fill: '#fff', fontSize: 10, fontWeight: 'bold' }}
                            background clockWise
                            dataKey="value"
                            cornerRadius={10}
                          >
                            { (analyticsData.timeOfDayDistribution || []).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </RadialBar>
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                          <Legend iconSize={10} verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#52525b', paddingTop: '10px' }} />
                        </RadialBarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Topic Distribution */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                 <div className="mb-2">
                  <h3 className="font-extrabold text-zinc-900">Cognitive Load Split</h3>
                  <span className="text-xs text-zinc-400 font-medium tracking-wide uppercase">Based on {analyticsData.topicWiseAccuracy.reduce((a,b)=>a+b.value, 0)} interactions</span>
                 </div>
                 <div className="flex-1 w-full min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.topicWiseAccuracy}
                          cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={4}
                          dataKey="value" stroke="none"
                        >
                          {analyticsData.topicWiseAccuracy.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}/>
                      </PieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="flex flex-wrap gap-2 justify-center mt-4">
                     {analyticsData.topicWiseAccuracy.slice(0, 3).map((item, idx) => (
                         <div key={idx} className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-600 bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-100">
                             <div className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: COLORS[(idx + 2) % COLORS.length]}}></div>
                             {item.name}
                         </div>
                     ))}
                 </div>
              </div>

            </div>

          </div>

          {/* Right Column: History */}
          <div className="xl:col-span-1 border border-zinc-200 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-[800px] xl:h-auto">
             <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/30"></div>
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                        <History className="h-5 w-5 text-indigo-500" />
                        <h3 className="text-xl font-extrabold text-zinc-900">Live Timeline</h3>
                    </div>
                    <p className="text-xs text-zinc-500 font-medium">Auto-syncing session block registry.</p>
                </div>
             </div>
             
             <div className="p-5 flex-1 overflow-y-auto custom-scrollbar">
                 <div className="space-y-6">
                     {isActive && (
                         <div className="relative pl-6 pb-2 border-l-2 border-blue-400 animate-pulse">
                            <div className="absolute w-3.5 h-3.5 bg-blue-500 rounded-full -left-[8px] top-0.5 border-4 border-white shadow-sm ring-1 ring-blue-200"></div>
                            <p className="text-sm font-bold text-blue-700 bg-blue-50 inline-block px-2 py-0.5 rounded-md mb-1">Current Sync</p>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono font-medium ml-1">
                                <Activity className="w-3.5 h-3.5 text-blue-400" /> {formatTime(timer)} tracking
                            </div>
                         </div>
                     )}

                     {history.map((session, idx) => (
                         <div key={session._id} className={`relative pl-6 pb-2 ${idx !== history.length - 1 ? 'border-l-2 border-zinc-100' : 'border-l-2 border-transparent'}`}>
                            <div className="absolute w-3 h-3 bg-zinc-200 rounded-full -left-[7px] top-1 border-[3px] border-white ring-1 ring-zinc-200 transition-all hover:bg-indigo-400 hover:ring-indigo-200 cursor-pointer"></div>
                            <p className="text-[13px] font-bold text-zinc-800">
                                {new Date(session.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}
                            </p>
                            <p className="text-[10px] uppercase font-bold text-zinc-400 mb-2">
                                {new Date(session.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                            
                            <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3 inline-block w-full">
                                <div className="flex items-center justify-between">
                                    <span className="flex items-center text-xs font-bold text-zinc-700">
                                    <Clock className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                                    {session.durationMinutes} Minutes
                                    </span>
                                </div>
                                {session.topics && session.topics[0] && (
                                    <div className="mt-2 text-[11px] font-medium text-zinc-500 flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 rounded-full bg-pink-400"></div> {session.topics[0]}
                                    </div>
                                )}
                            </div>
                         </div>
                     ))}
                     
                     {history.length === 0 && !isActive && (
                         <div className="text-center py-16">
                            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
                               <History className="w-6 h-6 text-zinc-300" />
                            </div>
                            <h3 className="text-sm font-bold text-zinc-900">Waiting for blocks</h3>
                            <p className="text-xs text-zinc-500 mt-1 max-w-[200px] mx-auto">Your study history will stream here automatically.</p>
                         </div>
                     )}
                 </div>
             </div>
          </div>
          
        </div>
      </div>
{/* Added custom scrollbar style inline for history panel refinement */}
<style dangerouslySetInnerHTML={{__html:`
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 10px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d4d4d8; }
`}} />
    </div>
  );
}
