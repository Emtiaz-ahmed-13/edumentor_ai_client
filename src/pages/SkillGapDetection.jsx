import { useAuth } from "@clerk/clerk-react";
import {
  BarChart3,
  Brain,
  ChevronRight,
  Info,
  LineChart,
  Loader2,
  PieChart,
  RefreshCw,
  Trophy,
  AlertTriangle,
  Target,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";
import quizService from "../api/quiz.service";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

const StatCard = ({ title, value, icon, color, trend }) => (
  <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity rounded-bl-[3rem]`} />
    <div className="relative z-10 flex items-start justify-between">
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">{title}</span>
        <h3 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{trend} Increase</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 text-zinc-500 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
  </div>
);

const SubjectProgressBar = ({ subject, accuracy, color }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <div>
        <h4 className="text-sm font-black tracking-tight text-zinc-800 dark:text-zinc-200">{subject}</h4>
        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Knowledge Retention</span>
      </div>
      <span className="text-sm font-black text-primary italic">{accuracy}%</span>
    </div>
    <div className="h-2.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
      <div 
        className={`h-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
        style={{ width: `${accuracy}%` }}
      />
    </div>
  </div>
);

export default function SkillGapDetection() {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const response = await quizService.getWeakTopics(token);
      if (response.success) {
        setData(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
      setError("Failed to load skill gap data. Have you taken any quizzes yet?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [getToken]);

  const getAccuracyColor = (acc) => {
    if (acc >= 90) return "from-emerald-500 to-teal-500";
    if (acc >= 70) return "from-blue-500 to-indigo-500";
    if (acc >= 50) return "from-amber-500 to-orange-500";
    return "from-rose-500 to-pink-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-black tracking-tight animate-pulse">Analyzing Learning Logic...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate global average
  const globalAccuracy = (data?.performanceData && data.performanceData.length > 0)
    ? Math.round(data.performanceData.reduce((acc, curr) => acc + curr.accuracy, 0) / data.performanceData.length)
    : 0;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 pt-24 pb-12 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <Brain className="w-3.5 h-3.5" />
              Neural Learning Analysis
            </div>
            <h1 className="text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-[0.9]">
              Skill Gap <span className="text-primary italic">Detection</span>
            </h1>
            <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-[10px] mt-4 max-w-lg">
               Identify conceptual friction points and optimize your study path using data-driven performance metrics.
            </p>
          </div>
          <button 
            onClick={fetchData}
            className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-primary/40 transition-all shadow-sm active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            Recalculate
          </button>
        </div>

        {error ? (
          <div className="bg-rose-50 dark:bg-rose-500/5 rounded-[3rem] border border-rose-100 dark:border-rose-500/10 p-20 text-center shadow-xl">
             <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto mb-8" />
             <h2 className="text-2xl font-black tracking-tight mb-2 text-rose-900 dark:text-rose-400">Analysis Error</h2>
             <p className="text-zinc-500 text-sm font-medium mb-8 max-w-sm mx-auto">
               {error}
             </p>
             <button 
                onClick={fetchData}
                className="inline-flex items-center gap-3 px-8 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all"
             >
                Try Re-analyzing
                <RefreshCw className="w-4 h-4" />
             </button>
          </div>
        ) : !data || data.totalQuizzes === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-[3rem] border border-zinc-200 dark:border-zinc-800 p-20 text-center shadow-xl shadow-zinc-200/50 relative overflow-hidden">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 blur-[100px] rounded-full" />
             <Target className="w-16 h-16 text-zinc-200 mx-auto mb-8 relative z-10" />
             <h2 className="text-2xl font-black tracking-tight mb-2 relative z-10">Data Engine Standby</h2>
             <p className="text-zinc-400 text-sm font-medium mb-8 max-w-sm mx-auto relative z-10">
               We need at least one quiz submission to map your cognitive progress. Upload a note and take a quiz to begin.
             </p>
             <a 
               href="/notes" 
               className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:shadow-primary/40 transition-all relative z-10"
             >
               Start Your First Quiz
               <ChevronRight className="w-4 h-4" />
             </a>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Total Assessments" 
                value={data?.totalQuizzes || 0} 
                icon={<PieChart className="w-5 h-5" />}
                color="from-blue-500 to-indigo-500"
              />
              <StatCard 
                title="Global Accuracy" 
                value={`${globalAccuracy}%`} 
                icon={<Target className="w-5 h-5" />}
                trend="4.2%"
                color="from-emerald-500 to-teal-500"
              />
              <StatCard 
                title="Weak Subjects" 
                value={data?.weakTopics?.length || 0} 
                icon={<AlertTriangle className="w-5 h-5" />}
                color="from-rose-500 to-pink-500"
              />
              <StatCard 
                title="Mastery Streak" 
                value="5 Days" 
                icon={<Trophy className="w-5 h-5 text-amber-500" />}
                color="from-amber-500 to-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Performance Rankings */}
              <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black tracking-tight">Subject Mastery Index</h3>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Cross-disciplinary accuracy analysis</p>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-700">
                    <BarChart3 className="w-5 h-5 text-zinc-400" />
                  </div>
                </div>

                <div className="space-y-8">
                  {data?.performanceData?.sort((a, b) => b.accuracy - a.accuracy).map((item, idx) => (
                    <SubjectProgressBar 
                      key={idx}
                      subject={item.subject}
                      accuracy={item.accuracy}
                      color={getAccuracyColor(item.accuracy)}
                    />
                  ))}
                </div>
              </div>

              {/* Weak Topics Analysis */}
              <div className="space-y-6">
                <div className="bg-rose-50/50 dark:bg-rose-500/5 rounded-[2.5rem] border border-rose-100 dark:border-rose-500/10 p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                    <AlertTriangle className="w-12 h-12 text-rose-500" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight text-rose-900 dark:text-rose-400 mb-6 flex items-center gap-3">
                    Critical Gaps
                  </h3>
                  
                  {data.weakTopics.length > 0 ? (
                    <div className="space-y-4">
                      {data.weakTopics.map((topic, i) => (
                        <div key={i} className="bg-white dark:bg-zinc-950 p-5 rounded-[1.5rem] border border-rose-100 dark:border-rose-500/20 shadow-sm shadow-rose-500/5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-sm font-black text-rose-800 dark:text-rose-400">{topic.subject}</h4>
                              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mt-1">Below Proficiency</p>
                            </div>
                            <span className="text-xs font-black text-rose-600">{topic.accuracy}%</span>
                          </div>
                          <div className="flex items-center gap-2 mt-4">
                            <button className="flex-1 py-2 rounded-xl bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-colors">
                              Review Notes
                            </button>
                            <button className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-primary transition-colors">
                              <Info className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center">
                      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                      <p className="text-rose-900/60 dark:text-rose-400/60 text-xs font-bold uppercase tracking-widest">No Critical Gaps Found!</p>
                      <p className="text-[10px] text-zinc-500 mt-2">Your performance is consistently above 70%.</p>
                    </div>
                  )}
                </div>

                <div className="bg-primary/5 rounded-[2.5rem] border border-primary/10 p-8">
                  <h4 className="text-sm font-black tracking-tight mb-4 flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-primary" />
                    AI Recommendation
                  </h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                    Based on your low accuracy in <span className="text-rose-600 font-bold">{data.weakTopics[0]?.subject || "certain areas"}</span>, we suggest enabling "Spaced Repetition" in your Study Modes.
                  </p>
                  <button className="mt-6 w-full py-3 bg-zinc-900 dark:bg-zinc-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors">
                    Optimize My Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
