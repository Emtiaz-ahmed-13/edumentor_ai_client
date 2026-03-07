import {
  AlertTriangle,
  BookOpen,
  Brain,
  Check,
  Copy,
  Globe, HelpCircle,
  History,
  Loader2,
  Sparkles,
  Target,
  Trash2,
  Zap
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import Footer from '../components/layout/Footer';
import Navbar from '../components/layout/Navbar';
import { deleteConcept, getHistory, simplifyConcept } from '../services/conceptService';

const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const DIFFICULTY_STYLES = {
  beginner: { 
    badge: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20', 
    dot: 'bg-emerald-500' 
  },
  intermediate: { 
    badge: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20', 
    dot: 'bg-amber-500' 
  },
  advanced: { 
    badge: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20', 
    dot: 'bg-rose-500' 
  },
};

const RESULT_CARDS = [
  { key: 'explanation',         title: 'Simple Explanation',      icon: <BookOpen className="w-5 h-5 text-indigo-500" />, border: 'border-l-indigo-500', shadow: 'hover:shadow-indigo-500/10', isList: false },
  { key: 'realLifeExample',     title: 'Real-Life Example',       icon: <Globe className="w-5 h-5 text-emerald-500" />, border: 'border-l-emerald-500', shadow: 'hover:shadow-emerald-500/10', isList: false },
  { key: 'analogy',             title: 'Analogy',                 icon: <Zap className="w-5 h-5 text-purple-500" />, border: 'border-l-purple-500', shadow: 'hover:shadow-purple-500/10', isList: false },
  { key: 'keyPoints',           title: 'Key Points',              icon: <Target className="w-5 h-5 text-amber-500" />, border: 'border-l-amber-500', shadow: 'hover:shadow-amber-500/10', isList: true },
  { key: 'funFact',             title: 'Fun Fact',                icon: <Sparkles className="w-5 h-5 text-pink-500" />, border: 'border-l-pink-500', shadow: 'hover:shadow-pink-500/10', isList: false },
  { key: 'commonMisconception', title: 'Common Misconception',    icon: <HelpCircle className="w-5 h-5 text-rose-500" />, border: 'border-l-rose-500', shadow: 'hover:shadow-rose-500/10', isList: false },
];

const EXAMPLE_TOPICS = [
  'Quantum Entanglement',
  'Neural Networks',
  'Blockchain',
  'DNA Replication',
  'Black Holes',
  'Recursion in Programming',
];

const ShimmerCard = () => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 animate-pulse shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 bg-zinc-100 dark:bg-white/10 rounded-xl" />
      <div className="h-4 bg-zinc-100 dark:bg-white/10 rounded-lg w-1/3" />
    </div>
    <div className="space-y-2.5">
      <div className="h-3 bg-zinc-100 dark:bg-white/10 rounded-lg w-full" />
      <div className="h-3 bg-zinc-100 dark:bg-white/10 rounded-lg w-5/6" />
      <div className="h-3 bg-zinc-100 dark:bg-white/10 rounded-lg w-4/6" />
      <div className="h-3 bg-zinc-100 dark:bg-white/10 rounded-lg w-5/6" />
    </div>
  </div>
);

const CopyButton = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(textToCopy).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 shadow-sm"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-4 h-4 text-emerald-500" />
      ) : (
        <Copy className="w-4 h-4 text-zinc-400" />
      )}
    </button>
  );
};

const ResultCard = ({ title, content, icon, border, shadow, isList }) => {
  if (!content || (Array.isArray(content) && content.length === 0)) return null;

  const textToCopy = isList
    ? (Array.isArray(content) ? content.map(item => `• ${item}`).join('\n') : String(content))
    : String(content);

  return (
    <div className={`relative group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 border-l-4 ${border} rounded-2xl p-6 transition-all duration-300 hover:shadow-xl ${shadow} hover:-translate-y-0.5`}>
      <CopyButton textToCopy={textToCopy} />

      <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2.5">
        <span className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
          {icon}
        </span>
        <span>{title}</span>
      </h3>

      {isList ? (
        <ul className="space-y-3">
          {(Array.isArray(content) ? content : [content]).map((item, idx) => (
            <li key={idx} className="text-zinc-600 dark:text-zinc-400 flex items-start gap-3 text-sm leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{content}</p>
      )}
    </div>
  );
};

const HistoryItem = ({ concept, isActive, onClick, onDelete }) => {
  const [deleting, setDeleting] = useState(false);
  const styles = DIFFICULTY_STYLES[concept.difficultyLevel || concept.difficulty] || DIFFICULTY_STYLES.beginner;

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!concept._id) return;
    setDeleting(true);
    try {
      await onDelete(concept._id);
    } finally {
      if (typeof setDeleting === 'function') {
        setDeleting(false);
      }
    }
  };

  return (
    <div
      onClick={() => onClick(concept)}
      className={`group relative w-full text-left p-3.5 rounded-xl cursor-pointer transition-all duration-300 border ${
        isActive
          ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/30 shadow-sm'
          : 'bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-500/30'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className={`font-bold text-sm leading-snug line-clamp-2 flex-1 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
          {concept.topic || concept.question || 'Unknown Topic'}
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/20 text-zinc-400 hover:text-rose-500 flex-shrink-0 mt-0.5 border border-transparent hover:border-rose-100 dark:hover:border-rose-500/30 shadow-sm"
          title="Delete"
        >
          {deleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${styles.badge}`}>
          <span className={`w-1 h-1 rounded-full ${styles.dot}`} />
          {concept.difficultyLevel || concept.difficulty || 'beginner'}
        </span>
        <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-medium">
          <History className="w-3 h-3" />
          {formatTimeAgo(concept.createdAt)}
        </span>
      </div>
    </div>
  );
};

const ConceptSimplifier = () => {
  const [topic, setTopic] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('beginner');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [error, setError] = useState('');

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await getHistory();
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter a topic to simplify.');
      return;
    }

    setLoading(true);
    setError('');
    setCurrentResult(null);

    try {
      const result = await simplifyConcept({ topic: topic.trim(), difficultyLevel });
      setCurrentResult(result);
      loadHistory();
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (concept) => {
    setCurrentResult(concept);
    setTopic(concept.topic || concept.question || '');
    setDifficultyLevel(concept.difficultyLevel || concept.difficulty || 'beginner');
    setError('');
  };

  const handleDelete = async (id) => {
    try {
      await deleteConcept(id);
      setHistory((prev) => prev.filter((c) => c._id !== id));
      if (currentResult?._id === id) {
        setCurrentResult(null);
      }
    } catch (err) {
      console.error('Delete failed:', err.message);
    }
  };

  const handleExampleClick = (example) => {
    setTopic(example);
    setError('');
  };

  const currentDifficultyStyles = DIFFICULTY_STYLES[difficultyLevel] || DIFFICULTY_STYLES.beginner;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-primary/20">
      <Navbar />

      <main className="relative flex-1 pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">

          {/* ── Header ── */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/30 rounded-full px-4 py-1.5 text-indigo-600 dark:text-indigo-300 text-xs font-bold tracking-wider uppercase mb-4 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              Powered by Gemini AI
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white mb-3 tracking-tight">
              Concept Simplifier
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-lg max-w-xl mx-auto font-medium">
              Enter any complex topic and get a crystal-clear breakdown — examples, analogies, and more.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">

            {/* ── Left Sidebar: History ── */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                    <History className="w-4 h-4 text-indigo-500" />
                  </div>
                  <h2 className="font-bold text-zinc-900 dark:text-white text-sm uppercase tracking-wide">Recent Concepts</h2>
                  {history.length > 0 && (
                    <span className="ml-auto text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                      {history.length}
                    </span>
                  )}
                </div>

                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                  {historyLoading ? (
                    [1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-20 bg-zinc-50 dark:bg-white/5 rounded-xl animate-pulse border border-zinc-100 dark:border-zinc-800" />
                    ))
                  ) : history.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-12 h-12 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BookOpen className="w-6 h-6 text-zinc-300 dark:text-zinc-600" />
                      </div>
                      <p className="text-zinc-400 text-xs font-bold uppercase tracking-tighter">No history yet</p>
                    </div>
                  ) : (
                    history.map((concept, idx) => (
                      <HistoryItem
                        key={concept._id || idx}
                        concept={concept}
                        isActive={currentResult && (currentResult._id === concept._id)}
                        onClick={handleHistoryClick}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </div>
              </div>
            </aside>

            {/* ── Right Panel ── */}
            <div className="space-y-6">

              {/* Input card */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
                
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  {/* Topic input */}
                  <div>
                    <label className="block text-zinc-900 dark:text-zinc-200 text-xs font-bold uppercase tracking-wider mb-3">
                      Topic or Concept
                    </label>
                    <textarea
                      id="topic-input"
                      value={topic}
                      onChange={(e) => { setTopic(e.target.value); setError(''); }}
                      placeholder="e.g. Quantum Entanglement, Recursion, DNA Replication..."
                      rows={4}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 py-4 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300 resize-none text-base leading-relaxed"
                    />
                  </div>

                  {/* Difficulty selector */}
                  <div>
                    <label className="block text-zinc-900 dark:text-zinc-200 text-xs font-bold uppercase tracking-wider mb-3">
                      Difficulty Level
                    </label>
                    <div className="flex gap-3 flex-wrap">
                      {[
                        { level: 'beginner',     label: 'Beginner', emoji: '🌱' },
                        { level: 'intermediate', label: 'Intermediate', emoji: '🔥' },
                        { level: 'advanced',     label: 'Advanced', emoji: '🚀' },
                      ].map(({ level, label, emoji }) => {
                        const s = DIFFICULTY_STYLES[level];
                        const active = difficultyLevel === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            id={`difficulty-${level}`}
                            onClick={() => setDifficultyLevel(level)}
                            className={`px-6 py-3 rounded-xl border text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                              active
                                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]'
                                : 'bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                          >
                            <span>{emoji}</span> {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-center gap-2 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-medium">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    id="simplify-btn"
                    type="submit"
                    disabled={loading || !topic.trim()}
                    className="w-full bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 font-bold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-primary/20 group"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Breaking it down...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 group-hover:animate-pulse" />
                        <span>Simplify Concept</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Results */}
              <div className="space-y-6">
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {RESULT_CARDS.map((_, i) => <ShimmerCard key={i} />)}
                  </div>
                ) : currentResult ? (
                  <div className="space-y-6 animate-fade-in">
                    {/* Result meta badge */}
                    <div className="flex items-center gap-3 px-1">
                      <div className={`w-2 h-2 rounded-full ${currentDifficultyStyles.dot}`} />
                      <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                        {currentResult.topic || currentResult.question}
                      </h2>
                      <span className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border tracking-widest ${currentDifficultyStyles.badge}`}>
                        {currentResult.difficultyLevel || currentResult.difficulty}
                      </span>
                    </div>

                    {/* 6-card grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {RESULT_CARDS.map(({ key, title, icon, border, shadow, isList }) => (
                        <ResultCard
                          key={key}
                          title={title}
                          content={currentResult[key]}
                          icon={icon}
                          border={border}
                          shadow={shadow}
                          isList={isList}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Empty state */
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-16 text-center shadow-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Brain className="w-10 h-10 text-indigo-500 shadow-sm" />
                      </div>
                      <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mb-3">Ready to simplify anything?</h3>
                      <p className="text-zinc-500 dark:text-zinc-400 mb-10 max-w-md mx-auto font-medium">Type any concept above and get an instant, personalized breakdown.</p>
                      
                      <div className="flex gap-2 justify-center flex-wrap">
                        {EXAMPLE_TOPICS.map((example) => (
                          <button
                            key={example}
                            onClick={() => handleExampleClick(example)}
                            className="px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full text-zinc-500 dark:text-zinc-400 text-sm font-bold hover:bg-white dark:hover:bg-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-500/30 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-md transition-all duration-300"
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 99px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.1); }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default ConceptSimplifier;
