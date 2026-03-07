
/**
 * Concept Simplifier Page - Full UI Component
 * Student: Syed Muntazir Mehdi (ID: 22299525)
 * Feature 4 - EduMentor AI
 * Design: Dark Glassmorphism with Premium SaaS Look
 */

import React, { useState, useEffect } from 'react';
import { simplifyConcept, getHistory } from '../services/conceptService';

// Helper function to format time ago
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

// Helper to get difficulty badge color
const getDifficultyColor = (level) => {
  switch (level) {
    case 'beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

// Shimmer Skeleton Component
const ShimmerCard = () => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-6 animate-pulse">
    <div className="h-4 bg-white/10 rounded w-1/3 mb-4"></div>
    <div className="space-y-2">
      <div className="h-3 bg-white/10 rounded w-full"></div>
      <div className="h-3 bg-white/10 rounded w-5/6"></div>
      <div className="h-3 bg-white/10 rounded w-4/6"></div>
    </div>
  </div>
);

// Result Card Component
const ResultCard = ({ title, content, borderColor = 'border-indigo-500/30', icon, isList = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const textToCopy = isList 
      ? content.map((item, i) => `• ${item}`).join('\n')
      : content;
    
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!content) return null;

  return (
    <div className={`bg-white/5 border-l-4 ${borderColor} border border-white/10 rounded-xl p-6 transition-all duration-300 hover:bg-white/10 hover:shadow-lg hover:shadow-indigo-500/10 group relative`}>
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 hover:bg-white/10 rounded-lg"
        title="Copy to clipboard"
      >
        {copied ? (
          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>

      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <span className="text-xl">{icon}</span>
        {title}
      </h3>

      {isList ? (
        <ul className="space-y-2">
          {Array.isArray(content) && content.map((item, index) => (
            <li key={index} className="text-gray-300 flex items-start gap-2">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-300 leading-relaxed">{content}</p>
      )}
    </div>
  );
};

// History Card Component
const HistoryCard = ({ concept, onClick, isActive }) => (
  <button
    onClick={() => onClick(concept)}
    className={`w-full text-left p-4 rounded-xl transition-all duration-300 ${
      isActive 
        ? 'bg-indigo-500/20 border border-indigo-500/30 shadow-lg shadow-indigo-500/20' 
        : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10'
    }`}
  >
    <div className="flex justify-between items-start mb-2">
      <h4 className="font-medium text-white truncate flex-1">{concept.topic || concept.question}</h4>
      <span className={`text-xs px-2 py-1 rounded-full border ${getDifficultyColor(concept.difficultyLevel || concept.difficulty)}`}>
        {concept.difficultyLevel || concept.difficulty}
      </span>
    </div>
    <p className="text-xs text-gray-400">{formatTimeAgo(concept.createdAt)}</p>
  </button>
);

// Main Component
const ConceptSimplifier = () => {
  const [topic, setTopic] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('beginner');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [currentResult, setCurrentResult] = useState(null);
  const [error, setError] = useState('');
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const data = await getHistory();
      setHistory(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Failed to load history:', err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setCurrentResult(null);

    try {
      const result = await simplifyConcept({
        topic: topic.trim(),
        difficultyLevel
      });
      
      setCurrentResult(result);
      await loadHistory();
    } catch (err) {
      setError(err.message || 'Failed to simplify concept. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (concept) => {
    setCurrentResult(concept);
    setTopic(concept.topic || concept.question || '');
    setDifficultyLevel(concept.difficultyLevel || concept.difficulty || 'beginner');
  };

  const handleExampleClick = (example) => {
    setTopic(example);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] to-[#1a1a3e] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Concept Simplifier
          </h1>
          <p className="text-gray-400 text-lg">Turn any complex topic into crystal-clear understanding</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 sticky top-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                Past Concepts
              </h2>
              
              {historyLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : history.length === 0 ? (
                <p className="text-gray-400 text-sm">No concepts yet. Start by simplifying one!</p>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
                  {history.map((concept, index) => (
                    <HistoryCard
                      key={concept._id || index}
                      concept={concept}
                      onClick={handleHistoryClick}
                      isActive={currentResult && (currentResult._id === concept._id || currentResult.question === concept.question)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6">
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Type any concept... e.g. Quantum Entanglement, Recursion, Black Holes"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 resize-none h-32 text-lg"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-400 text-sm mb-3">Select Difficulty Level:</label>
                  <div className="flex gap-3 flex-wrap">
                    {[
                      { level: 'beginner', label: 'Beginner' },
                      { level: 'intermediate', label: 'Intermediate' },
                      { level: 'advanced', label: 'Advanced' }
                    ].map(({ level, label }) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficultyLevel(level)}
                        className={`px-5 py-2.5 rounded-full border transition-all duration-300 ${
                          difficultyLevel === level
                            ? 'bg-indigo-500/30 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !topic.trim()}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 disabled:cursor-not-allowed relative overflow-hidden group"
                >
                  <span className={`flex items-center justify-center gap-2 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                    Simplify It
                  </span>
                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Results Section */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ShimmerCard />
                <ShimmerCard />
                <ShimmerCard />
                <ShimmerCard />
              </div>
            ) : currentResult ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                <ResultCard
                  title="Simple Explanation"
                  content={currentResult.explanation}
                  icon="E"
                  borderColor="border-indigo-500/30"
                />
                <ResultCard
                  title="Real-Life Example"
                  content={currentResult.realLifeExample}
                  icon="R"
                  borderColor="border-green-500/30"
                />
                <ResultCard
                  title="Analogy"
                  content={currentResult.analogy}
                  icon="A"
                  borderColor="border-purple-500/30"
                />
                <ResultCard
                  title="Key Points"
                  content={currentResult.keyPoints}
                  icon="K"
                  borderColor="border-amber-500/30"
                  isList={true}
                />
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-12 text-center">
                <div className="text-8xl mb-4">M</div>
                <h3 className="text-2xl font-semibold text-white mb-2">Ask me anything - I will make it simple</h3>
                <p className="text-gray-400 mb-6">Try these examples:</p>
                <div className="flex gap-3 justify-center flex-wrap">
                  {['Quantum Computing', 'Neural Networks', 'Blockchain'].map((example) => (
                    <button
                      key={example}
                      onClick={() => handleExampleClick(example)}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-300 hover:bg-indigo-500/20 hover:border-indigo-500/30 hover:text-white transition-all duration-300"
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

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ConceptSimplifier;

