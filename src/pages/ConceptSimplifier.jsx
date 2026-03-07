
/**
 * Concept Simplifier Page — Premium Full UI
 * Student: Syed Muntazir Mehdi (ID: 22299525)
 * Feature 4 — EduMentor AI
 */

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { simplifyConcept, getHistory, deleteConcept } from '../services/conceptService';

// ─── Helpers ────────────────────────────────────────────────────────────────

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
  beginner:     { badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', dot: 'bg-emerald-400' },
  intermediate: { badge: 'bg-amber-500/20 text-amber-400 border-amber-500/40',   dot: 'bg-amber-400'   },
  advanced:     { badge: 'bg-rose-500/20 text-rose-400 border-rose-500/40',       dot: 'bg-rose-400'    },
};

const RESULT_CARDS = [
  { key: 'explanation',         title: 'Simple Explanation',      icon: '💡', border: 'border-l-indigo-500', glow: 'hover:shadow-indigo-500/10',  isList: false },
  { key: 'realLifeExample',     title: 'Real-Life Example',       icon: '🌍', border: 'border-l-emerald-500', glow: 'hover:shadow-emerald-500/10', isList: false },
  { key: 'analogy',             title: 'Analogy',                 icon: '🔮', border: 'border-l-purple-500', glow: 'hover:shadow-purple-500/10', isList: false },
  { key: 'keyPoints',           title: 'Key Points',              icon: '🎯', border: 'border-l-amber-500',  glow: 'hover:shadow-amber-500/10',  isList: true  },
  { key: 'funFact',             title: 'Fun Fact',                icon: '⚡', border: 'border-l-pink-500',   glow: 'hover:shadow-pink-500/10',   isList: false },
  { key: 'commonMisconception', title: 'Common Misconception',    icon: '⚠️', border: 'border-l-rose-500',   glow: 'hover:shadow-rose-500/10',   isList: false },
];

const EXAMPLE_TOPICS = [
  'Quantum Entanglement',
  'Neural Networks',
  'Blockchain',
  'DNA Replication',
  'Black Holes',
  'Recursion in Programming',
];

// ─── Sub-Components ─────────────────────────────────────────────────────────

const ShimmerCard = () => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 bg-white/10 rounded-xl" />
      <div className="h-4 bg-white/10 rounded-lg w-1/3" />
    </div>
    <div className="space-y-2.5">
      <div className="h-3 bg-white/10 rounded-lg w-full" />
      <div className="h-3 bg-white/10 rounded-lg w-5/6" />
      <div className="h-3 bg-white/10 rounded-lg w-4/6" />
      <div className="h-3 bg-white/10 rounded-lg w-5/6" />
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
      className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10"
      title="Copy to clipboard"
    >
      {copied ? (
        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
};

const ResultCard = ({ title, content, icon, border, glow, isList }) => {
  if (!content || (Array.isArray(content) && content.length === 0)) return null;

  const textToCopy = isList
    ? (Array.isArray(content) ? content.map(item => `• ${item}`).join('\n') : String(content))
    : String(content);

  return (
    <div className={`relative group bg-white/[0.04] border border-white/10 border-l-4 ${border} rounded-2xl p-6 transition-all duration-300 hover:bg-white/[0.07] hover:shadow-xl ${glow} hover:-translate-y-0.5`}>
      <CopyButton textToCopy={textToCopy} />

      <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2.5">
        <span className="text-xl leading-none">{icon}</span>
        <span>{title}</span>
      </h3>

      {isList ? (
        <ul className="space-y-2">
          {(Array.isArray(content) ? content : [content]).map((item, idx) => (
            <li key={idx} className="text-gray-300 flex items-start gap-2.5 text-sm leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-300 text-sm leading-relaxed">{content}</p>
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
      setDeleting(false);
    }
  };

  return (
    <div
      onClick={() => onClick(concept)}
      className={`group relative w-full text-left p-3.5 rounded-xl cursor-pointer transition-all duration-300 ${
        isActive
          ? 'bg-indigo-500/20 border border-indigo-500/40 shadow-lg shadow-indigo-500/10'
          : 'bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-white/20'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="font-medium text-white text-sm leading-snug line-clamp-2 flex-1">
          {concept.topic || concept.question || 'Unknown Topic'}
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-lg hover:bg-red-500/20 text-gray-500 hover:text-red-400 flex-shrink-0 mt-0.5"
          title="Delete"
        >
          {deleting ? (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${styles.badge}`}>
          {concept.difficultyLevel || concept.difficulty || 'beginner'}
        </span>
        <span className="text-[11px] text-gray-500">
          {formatTimeAgo(concept.createdAt)}
        </span>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

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
      loadHistory(); // refresh sidebar non-blocking
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
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white font-sans">
      <Navbar />

      {/* Ambient background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-900/20 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] translate-y-1/2" />
      </div>

      <main className="relative flex-1 pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">

          {/* ── Header ── */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Powered by Gemini AI · ID: 22299525
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 tracking-tight">
              Concept Simplifier
            </h1>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Enter any complex topic and get a crystal-clear breakdown — examples, analogies, key points and more.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

            {/* ── Left Sidebar: History ── */}
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h2 className="font-semibold text-white text-sm">Recent Concepts</h2>
                  {history.length > 0 && (
                    <span className="ml-auto text-[11px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                      {history.length}
                    </span>
                  )}
                </div>

                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
                  {historyLoading ? (
                    [1, 2, 3].map((i) => (
                      <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
                    ))
                  ) : history.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-2">📚</div>
                      <p className="text-gray-500 text-xs">No history yet.</p>
                      <p className="text-gray-600 text-xs">Simplify a concept to start!</p>
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
            <div className="space-y-5">

              {/* Input card */}
              <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Topic input */}
                  <div>
                    <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Topic or Concept
                    </label>
                    <textarea
                      id="topic-input"
                      value={topic}
                      onChange={(e) => { setTopic(e.target.value); setError(''); }}
                      placeholder="e.g. Quantum Entanglement, Recursion, DNA Replication..."
                      rows={3}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 resize-none text-base leading-relaxed"
                    />
                  </div>

                  {/* Difficulty selector */}
                  <div>
                    <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2.5">
                      Difficulty Level
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { level: 'beginner',     label: '🌱 Beginner'     },
                        { level: 'intermediate', label: '🔥 Intermediate' },
                        { level: 'advanced',     label: '🚀 Advanced'     },
                      ].map(({ level, label }) => {
                        const s = DIFFICULTY_STYLES[level];
                        const active = difficultyLevel === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            id={`difficulty-${level}`}
                            onClick={() => setDifficultyLevel(level)}
                            className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-300 ${
                              active
                                ? `${s.badge} shadow-md scale-[1.03]`
                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    id="simplify-btn"
                    type="submit"
                    disabled={loading || !topic.trim()}
                    className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:via-gray-700 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-indigo-900/30 hover:shadow-indigo-900/50 hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <span className={`flex items-center justify-center gap-2 transition-opacity ${loading ? 'opacity-0' : 'opacity-100'}`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Simplify It
                    </span>
                    {loading && (
                      <span className="absolute inset-0 flex items-center justify-center gap-2">
                        <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Generating…
                      </span>
                    )}
                  </button>
                </form>
              </div>

              {/* Results */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {RESULT_CARDS.map((_, i) => <ShimmerCard key={i} />)}
                </div>
              ) : currentResult ? (
                <div className="space-y-4">
                  {/* Result meta badge */}
                  <div className="flex items-center gap-3 px-1">
                    <div className={`w-2 h-2 rounded-full ${currentDifficultyStyles.dot}`} />
                    <span className="text-sm text-gray-300 font-medium">
                      {currentResult.topic || currentResult.question}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${currentDifficultyStyles.badge}`}>
                      {currentResult.difficultyLevel || currentResult.difficulty}
                    </span>
                    {currentResult.createdAt && (
                      <span className="ml-auto text-xs text-gray-600">
                        {formatTimeAgo(currentResult.createdAt)}
                      </span>
                    )}
                  </div>

                  {/* 6-card grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {RESULT_CARDS.map(({ key, title, icon, border, glow, isList }) => (
                      <ResultCard
                        key={key}
                        title={title}
                        content={currentResult[key]}
                        icon={icon}
                        border={border}
                        glow={glow}
                        isList={isList}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                /* Empty state */
                <div className="bg-white/[0.03] border border-white/10 border-dashed rounded-2xl p-12 text-center">
                  <div className="text-6xl mb-4 select-none">🧠</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Ready to simplify anything
                  </h3>
                  <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                    Type any concept above — from quantum physics to everyday finance — and get an instant, personalized breakdown.
                  </p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {EXAMPLE_TOPICS.map((example) => (
                      <button
                        key={example}
                        onClick={() => handleExampleClick(example)}
                        className="px-3.5 py-1.5 bg-white/5 border border-white/10 rounded-full text-gray-400 text-xs hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:text-indigo-300 transition-all duration-300 hover:scale-105"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};

export default ConceptSimplifier;
