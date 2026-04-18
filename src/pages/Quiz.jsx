import {
  AlertCircle,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Cpu,
  FileText,
  GraduationCap,
  Loader2,
  RefreshCcw,
  Sparkles,
  Star,
  Target,
  Trash2,
  Trophy,
  Upload,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import quizService from "../api/quiz.service";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";

// ─── Constants ───────────────────────────────────────────────────────────────

const DIFFICULTY_LEVELS = [
  { id: "beginner", label: "Beginner", icon: Zap, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20", active: "bg-emerald-500 text-white border-emerald-500" },
  { id: "intermediate", label: "Intermediate", icon: Cpu, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20", active: "bg-blue-500 text-white border-blue-500" },
  { id: "advanced", label: "Advanced", icon: GraduationCap, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-200 dark:border-purple-500/20", active: "bg-purple-500 text-white border-purple-500" },
];

const QUESTION_COUNTS = [5, 10, 15, 20];

const GRADE_COLORS = {
  A: "text-emerald-600 bg-emerald-50 border-emerald-200",
  B: "text-blue-600 bg-blue-50 border-blue-200",
  C: "text-amber-600 bg-amber-50 border-amber-200",
  D: "text-orange-600 bg-orange-50 border-orange-200",
  F: "text-rose-600 bg-rose-50 border-rose-200",
};

// ─── Sub-Components ──────────────────────────────────────────────────────────

function QuizSetupPanel({ onGenerate, isLoading }) {
  const [sourceType, setSourceType] = useState("topic");
  const [topic, setTopic] = useState("");
  const [material, setMaterial] = useState("");
  const [materialMode, setMaterialMode] = useState("paste"); // "paste" | "pdf"
  const [pdfFile, setPdfFile] = useState(null);
  const [difficulty, setDifficulty] = useState("intermediate");
  const [numQuestions, setNumQuestions] = useState(10);
  const [dragOver, setDragOver] = useState(false);

  const handlePdfDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") setPdfFile(file);
  };

  const isReady =
    sourceType === "topic"
      ? topic.trim().length > 0
      : materialMode === "paste"
      ? material.trim().length > 0
      : pdfFile !== null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isReady) return;
    onGenerate({
      topic,
      material,
      difficulty,
      numQuestions,
      sourceType,
      materialMode,
      pdfFile,
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 md:p-8 space-y-6">
      {/* Source Type Toggle */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
          Quiz Source
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setSourceType("topic")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
              sourceType === "topic"
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-primary/40"
            }`}
          >
            <Target className="w-4 h-4" />
            From Topic
          </button>
          <button
            type="button"
            onClick={() => setSourceType("material")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${
              sourceType === "material"
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-primary/40"
            }`}
          >
            <FileText className="w-4 h-4" />
            From Material
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Topic or Material Input */}
        {sourceType === "topic" ? (
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-zinc-400 mb-2">
              Topic / Subject
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Photosynthesis, Binary Trees, World War II..."
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all placeholder:text-zinc-400"
              disabled={isLoading}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {/* Sub-toggle: Paste vs PDF */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMaterialMode("paste")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  materialMode === "paste"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-primary/40"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                Paste Text
              </button>
              <button
                type="button"
                onClick={() => setMaterialMode("pdf")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                  materialMode === "pdf"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-primary/40"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload PDF
              </button>
            </div>

            {materialMode === "paste" ? (
              <div>
                <textarea
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="Paste your notes, textbook excerpts, or any study material here..."
                  rows={6}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all placeholder:text-zinc-400 resize-none"
                  disabled={isLoading}
                />
                {material && (
                  <p className="text-[10px] text-zinc-400 mt-1 font-bold">
                    {material.split(/\s+/).filter(Boolean).length} words
                  </p>
                )}
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handlePdfDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : pdfFile
                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                    : "border-zinc-300 dark:border-zinc-700 hover:border-primary/50 hover:bg-primary/5"
                }`}
                onClick={() => document.getElementById("quiz-pdf-input").click()}
              >
                <input
                  id="quiz-pdf-input"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setPdfFile(e.target.files[0] || null)}
                  disabled={isLoading}
                />
                {pdfFile ? (
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="w-5 h-5 text-emerald-600" />
                    </div>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{pdfFile.name}</p>
                    <p className="text-xs text-zinc-400 font-medium">
                      {(pdfFile.size / 1024).toFixed(0)} KB
                    </p>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                      className="text-xs text-rose-500 font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="w-5 h-5 text-zinc-400" />
                    </div>
                    <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
                      Drag & drop or click to upload
                    </p>
                    <p className="text-xs text-zinc-400 font-medium">PDF only · Max 10MB</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Difficulty */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
            Difficulty Level
          </p>
          <div className="flex gap-2">
            {DIFFICULTY_LEVELS.map((level) => {
              const Icon = level.icon;
              const isActive = difficulty === level.id;
              return (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => setDifficulty(level.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-bold text-xs transition-all ${
                    isActive
                      ? level.active
                      : `${level.bg} ${level.border} ${level.color}`
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {level.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Number of Questions */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3">
            Number of Questions
          </p>
          <div className="flex gap-2">
            {QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNumQuestions(n)}
                className={`w-14 py-2 rounded-xl border-2 font-black text-sm transition-all ${
                  numQuestions === n
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                    : "bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-400"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isReady}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20 text-sm uppercase tracking-widest"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Quiz...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Quiz
            </>
          )}
        </button>
      </form>
    </div>
  );
}

// ─── MCQ Question Card ────────────────────────────────────────────────────────

function MCQCard({ question, index, selectedAnswer, onSelect, showResult }) {
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div className={`rounded-2xl border-2 p-5 transition-all ${
      showResult
        ? isCorrect
          ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-500/5 dark:border-emerald-500/20"
          : selectedAnswer
          ? "border-rose-200 bg-rose-50 dark:bg-rose-500/5 dark:border-rose-500/20"
          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
        : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
    }`}>
      <div className="flex items-start gap-3 mb-4">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
          {index + 1}
        </span>
        <p className="text-sm font-semibold text-foreground leading-relaxed">{question.question}</p>
      </div>

      <div className="space-y-2 ml-10">
        {question.options.map((opt, i) => {
          const isSelected = selectedAnswer === opt;
          const isRight = opt === question.correctAnswer;
          let style = "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 hover:border-primary/40 hover:bg-primary/5";
          if (showResult) {
            if (isRight) style = "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
            else if (isSelected && !isRight) style = "border-rose-400 bg-rose-50 dark:bg-rose-500/10 text-rose-600";
          } else if (isSelected) {
            style = "border-primary bg-primary/10 text-primary";
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => !showResult && onSelect(opt)}
              disabled={showResult}
              className={`w-full text-left px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all flex items-center gap-3 ${style}`}
            >
              {showResult && isRight && <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
              {showResult && isSelected && !isRight && <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />}
              {(!showResult || (!isRight && !isSelected)) && (
                <span className="w-4 h-4 rounded-full border-2 border-current flex-shrink-0 opacity-40" />
              )}
              {opt}
            </button>
          );
        })}
      </div>

      {showResult && question.explanation && (
        <div className="ml-10 mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 font-medium">
          <span className="font-black uppercase tracking-widest mr-1">Explanation:</span>
          {question.explanation}
        </div>
      )}

      {showResult && (
        <p className="ml-10 mt-2 text-xs font-black uppercase tracking-widest">
          {isCorrect
            ? <span className="text-emerald-600">+{question.points} pts</span>
            : selectedAnswer
            ? <span className="text-rose-500">0 pts</span>
            : <span className="text-zinc-400">Skipped</span>}
        </p>
      )}
    </div>
  );
}

// ─── True/False Card ─────────────────────────────────────────────────────────

function TrueFalseCard({ question, index, selectedAnswer, onSelect, showResult }) {
  const isCorrect = selectedAnswer === question.correctAnswer;

  return (
    <div className={`rounded-2xl border-2 p-5 transition-all ${
      showResult
        ? isCorrect
          ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-500/5 dark:border-emerald-500/20"
          : selectedAnswer
          ? "border-rose-200 bg-rose-50 dark:bg-rose-500/5 dark:border-rose-500/20"
          : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
        : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
    }`}>
      <div className="flex items-start gap-3 mb-4">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-black flex items-center justify-center">
          {index + 1}
        </span>
        <p className="text-sm font-semibold text-foreground leading-relaxed">{question.question}</p>
      </div>

      <div className="flex gap-3 ml-10">
        {["True", "False"].map((opt) => {
          const isSelected = selectedAnswer === opt;
          const isRight = opt === question.correctAnswer;
          let style = opt === "True"
            ? "border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
            : "border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10";

          if (isSelected && !showResult) {
            style = opt === "True"
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-rose-500 bg-rose-500 text-white";
          }
          if (showResult && isRight) {
            style = "border-emerald-500 bg-emerald-500 text-white";
          }
          if (showResult && isSelected && !isRight) {
            style = "border-rose-500 bg-rose-200 dark:bg-rose-500/20 text-rose-700";
          }

          return (
            <button
              key={opt}
              type="button"
              onClick={() => !showResult && onSelect(opt)}
              disabled={showResult}
              className={`flex-1 py-3 rounded-xl border-2 text-sm font-black transition-all ${style}`}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {showResult && question.explanation && (
        <div className="ml-10 mt-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 font-medium">
          <span className="font-black uppercase tracking-widest mr-1">Explanation:</span>
          {question.explanation}
        </div>
      )}

      {showResult && (
        <p className="ml-10 mt-2 text-xs font-black uppercase tracking-widest">
          {isCorrect
            ? <span className="text-emerald-600">+{question.points} pts</span>
            : selectedAnswer
            ? <span className="text-rose-500">0 pts</span>
            : <span className="text-zinc-400">Skipped</span>}
        </p>
      )}
    </div>
  );
}

// ─── Short Answer Card ────────────────────────────────────────────────────────

function ShortAnswerCard({ question, index, userAnswer, onAnswerChange, evaluation, onEvaluate, isEvaluating, showResult }) {
  const gradeClass = evaluation ? GRADE_COLORS[evaluation.grade] || GRADE_COLORS.F : "";

  return (
    <div className="rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5">
      <div className="flex items-start gap-3 mb-4">
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-black flex items-center justify-center">
          {index + 1}
        </span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground leading-relaxed">{question.question}</p>
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-500 mt-1 block">
            Short Answer · {question.points} pts
          </span>
        </div>
      </div>

      <div className="ml-10 space-y-3">
        <textarea
          value={userAnswer}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder="Type your answer here..."
          rows={3}
          disabled={!!evaluation || showResult}
          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all placeholder:text-zinc-400 resize-none disabled:opacity-70"
        />

        {!evaluation && !showResult && (
          <button
            type="button"
            onClick={() => onEvaluate(question, userAnswer)}
            disabled={!userAnswer?.trim() || isEvaluating}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-xs font-black rounded-xl hover:bg-purple-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            {isEvaluating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Evaluating...
              </>
            ) : (
              <>
                <Star className="w-3.5 h-3.5" />
                Evaluate My Answer
              </>
            )}
          </button>
        )}

        {evaluation && (
          <div className="space-y-3 animate-in fade-in duration-300">
            {/* Score Badge */}
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-xl border-2 font-black text-lg ${gradeClass}`}>
                {evaluation.grade}
              </div>
              <div>
                <p className="text-sm font-black text-foreground">
                  {evaluation.score} / {evaluation.maxScore} pts
                  <span className="text-zinc-400 font-bold text-xs ml-2">({evaluation.percentage}%)</span>
                </p>
                <p className="text-xs text-zinc-500 font-medium">{evaluation.overallFeedback}</p>
              </div>
            </div>

            {/* Strengths */}
            {evaluation.strengths?.length > 0 && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">Strengths</p>
                <ul className="space-y-1">
                  {evaluation.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improvements */}
            {evaluation.improvements?.length > 0 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">Areas to Improve</p>
                <ul className="space-y-1">
                  {evaluation.improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Points */}
            {evaluation.keyMissingPoints?.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-2">Key Missing Points</p>
                <ul className="space-y-1">
                  {evaluation.keyMissingPoints.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300 font-medium">
                      <XCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested Answer */}
            {evaluation.suggestedAnswer && (
              <details className="group">
                <summary className="cursor-pointer flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-primary transition-colors">
                  <ChevronDown className="w-3.5 h-3.5 group-open:rotate-180 transition-transform" />
                  View Model Answer
                </summary>
                <div className="mt-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                  {evaluation.suggestedAnswer}
                </div>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Score Summary ────────────────────────────────────────────────────────────

function ScoreSummary({ quiz, answers, evaluations, onReset }) {
  let earnedPoints = 0;
  let totalPoints = 0;

  quiz.questions.forEach((q, i) => {
    totalPoints += q.points || 10;
    if (q.type === "mcq" || q.type === "true-false") {
      if (answers[i] === q.correctAnswer) earnedPoints += q.points || 10;
    } else if (q.type === "short-answer" && evaluations[i]) {
      earnedPoints += evaluations[i].score || 0;
    }
  });

  const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  let grade = "F";
  if (percentage >= 90) grade = "A";
  else if (percentage >= 80) grade = "B";
  else if (percentage >= 70) grade = "C";
  else if (percentage >= 60) grade = "D";

  const gradeClass = GRADE_COLORS[grade] || GRADE_COLORS.F;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Trophy className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-black text-foreground">Quiz Complete!</h3>

        <div className="flex items-center justify-center gap-6 py-4">
          <div className={`text-6xl font-black w-24 h-24 rounded-2xl border-4 flex items-center justify-center ${gradeClass}`}>
            {grade}
          </div>
          <div className="text-left">
            <p className="text-4xl font-black text-foreground">{earnedPoints}<span className="text-zinc-400 text-2xl">/{totalPoints}</span></p>
            <p className="text-xl font-black text-primary">{percentage}%</p>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
              {quiz.totalQuestions} questions · {quiz.difficulty}
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-all mx-auto shadow-lg shadow-primary/20 text-sm uppercase tracking-widest"
        >
          <RefreshCcw className="w-4 h-4" />
          Take Another Quiz
        </button>
      </div>
    </div>
  );
}

// ─── History Sidebar ──────────────────────────────────────────────────────────

function HistorySidebar({ history, onLoadQuiz, onDeleteQuiz }) {
  if (!history || history.length === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl p-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
        <BookOpen className="w-3.5 h-3.5" />
        Recent Quizzes
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
        {history.map((q) => (
          <div
            key={q._id}
            className="flex items-center gap-2 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 hover:border-primary/30 hover:bg-primary/5 transition-all group"
          >
            <button
              onClick={() => onLoadQuiz(q._id)}
              className="flex-1 text-left"
            >
              <p className="text-xs font-bold text-foreground truncate">{q.title}</p>
              <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                {q.totalQuestions}Q · {q.difficulty} · {q.subject}
              </p>
            </button>
            <button
              onClick={() => onDeleteQuiz(q._id)}
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-zinc-400 hover:text-rose-500 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function Quiz() {
  const [quiz, setQuiz] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  // Answers: index → selected string
  const [answers, setAnswers] = useState({});
  // Short-answer evaluations: index → evaluation object
  const [evaluations, setEvaluations] = useState({});
  const [evaluatingIdx, setEvaluatingIdx] = useState(null);

  const [submitted, setSubmitted] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const QUESTIONS_PER_PAGE = 5;

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load quiz history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await quizService.getHistory();
        setHistory(res.data?.data || []);
      } catch {
        // Non-fatal
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, []);

  const handleGenerate = async (params) => {
    setIsGenerating(true);
    setGenerateError("");
    setQuiz(null);
    setAnswers({});
    setEvaluations({});
    setSubmitted(false);
    setCurrentPage(0);

    try {
      let res;
      // PDF upload path
      if (params.sourceType === "material" && params.materialMode === "pdf" && params.pdfFile) {
        res = await quizService.generateFromPdf({
          file: params.pdfFile,
          difficulty: params.difficulty,
          numQuestions: params.numQuestions,
        });
      } else {
        res = await quizService.generateQuiz(params);
      }
      const data = res.data?.data;
      setQuiz(data);
      // Refresh history
      const histRes = await quizService.getHistory();
      setHistory(histRes.data?.data || []);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "";
      if (msg.includes("quota") || msg.includes("429")) {
        setGenerateError("API quota exceeded. Please wait 1-2 minutes and try again.");
      } else if (msg.includes("503") || msg.includes("overloaded")) {
        setGenerateError("AI model is busy right now. Please wait a moment and try again.");
      } else {
        setGenerateError("Failed to generate quiz. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadQuiz = async (id) => {
    try {
      const res = await quizService.getById(id);
      setQuiz(res.data?.data);
      setAnswers({});
      setEvaluations({});
      setSubmitted(false);
      setCurrentPage(0);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      // ignore
    }
  };

  const handleDeleteQuiz = async (id) => {
    try {
      await quizService.deleteQuiz(id);
      setHistory((prev) => prev.filter((h) => h._id !== id));
      if (quiz?._id === id) {
        setQuiz(null);
        setAnswers({});
        setEvaluations({});
        setSubmitted(false);
      }
    } catch {
      // ignore
    }
  };

  const handleEvaluate = async (question, userAnswer, idx) => {
    if (!userAnswer?.trim()) return;
    setEvaluatingIdx(idx);
    try {
      const res = await quizService.evaluateAnswer({
        question: question.question,
        correctAnswer: question.correctAnswer,
        userAnswer,
        maxPoints: question.points || 10,
      });
      setEvaluations((prev) => ({ ...prev, [idx]: res.data?.data }));
    } catch {
      // Non-fatal
    } finally {
      setEvaluatingIdx(null);
    }
  };

  const handleSubmitQuiz = () => {
    setSubmitted(true);
    setCurrentPage(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setQuiz(null);
    setAnswers({});
    setEvaluations({});
    setSubmitted(false);
    setCurrentPage(0);
  };

  // Pagination
  const totalPages = quiz ? Math.ceil(quiz.questions.length / QUESTIONS_PER_PAGE) : 0;
  const pagedQuestions = quiz
    ? quiz.questions.slice(currentPage * QUESTIONS_PER_PAGE, (currentPage + 1) * QUESTIONS_PER_PAGE)
    : [];
  const globalOffset = currentPage * QUESTIONS_PER_PAGE;

  const answeredCount = Object.keys(answers).length +
    Object.keys(evaluations).length;
  const shortAnswerCount = quiz?.questions.filter((q) => q.type === "short-answer").length || 0;
  const objectiveCount = (quiz?.totalQuestions || 0) - shortAnswerCount;
  const canSubmit = quiz && (
    Object.keys(answers).length >= objectiveCount &&
    Object.keys(evaluations).length >= shortAnswerCount
  );

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 pt-20 pb-10 container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-4">
            <div className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-xl shadow-primary/20 rotate-3 transition-transform hover:rotate-0">
              <ClipboardList className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                AI Quiz <span className="text-primary italic">Generator</span>
              </h1>
              <p className="text-xs font-bold text-muted-foreground flex items-center gap-2 uppercase tracking-widest mt-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                Feature 9 &amp; 10 · Quiz + Answer Evaluation
              </p>
            </div>
          </div>

          {quiz && !submitted && (
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-black text-zinc-500">
                <span className="text-primary">{answeredCount}</span>/{quiz.totalQuestions} answered
              </div>
              <button
                onClick={handleSubmitQuiz}
                disabled={!canSubmit}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-black rounded-xl hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20 text-xs uppercase tracking-widest"
              >
                <Trophy className="w-4 h-4" />
                Submit Quiz
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
          {/* Left: Main Content */}
          <div className="space-y-6">
            {/* Error */}
            {generateError && (
              <div className="flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl text-rose-600 text-sm font-bold animate-in fade-in duration-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {generateError}
              </div>
            )}

            {/* Score Summary (after submit) */}
            {submitted && quiz && (
              <ScoreSummary
                quiz={quiz}
                answers={answers}
                evaluations={evaluations}
                onReset={handleReset}
              />
            )}

            {/* Setup Panel (no active quiz) */}
            {!quiz && <QuizSetupPanel onGenerate={handleGenerate} isLoading={isGenerating} />}

            {/* Quiz Questions */}
            {quiz && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Quiz Meta */}
                <div className="flex flex-wrap items-center gap-2 px-1">
                  <span className="text-xs font-black uppercase tracking-widest bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
                    {quiz.subject}
                  </span>
                  <span className="text-xs font-bold text-zinc-500">{quiz.title}</span>
                  <span className="text-xs font-bold text-zinc-400 ml-auto">
                    Page {currentPage + 1}/{totalPages}
                  </span>
                </div>

                {/* Questions */}
                {pagedQuestions.map((q, localIdx) => {
                  const globalIdx = globalOffset + localIdx;
                  if (q.type === "mcq") {
                    return (
                      <MCQCard
                        key={globalIdx}
                        question={q}
                        index={globalIdx}
                        selectedAnswer={answers[globalIdx]}
                        onSelect={(opt) => setAnswers((prev) => ({ ...prev, [globalIdx]: opt }))}
                        showResult={submitted}
                      />
                    );
                  }
                  if (q.type === "true-false") {
                    return (
                      <TrueFalseCard
                        key={globalIdx}
                        question={q}
                        index={globalIdx}
                        selectedAnswer={answers[globalIdx]}
                        onSelect={(opt) => setAnswers((prev) => ({ ...prev, [globalIdx]: opt }))}
                        showResult={submitted}
                      />
                    );
                  }
                  if (q.type === "short-answer") {
                    return (
                      <ShortAnswerCard
                        key={globalIdx}
                        question={q}
                        index={globalIdx}
                        userAnswer={answers[globalIdx] || ""}
                        onAnswerChange={(val) => setAnswers((prev) => ({ ...prev, [globalIdx]: val }))}
                        evaluation={evaluations[globalIdx]}
                        onEvaluate={(question, ans) => handleEvaluate(question, ans, globalIdx)}
                        isEvaluating={evaluatingIdx === globalIdx}
                        showResult={submitted}
                      />
                    );
                  }
                  return null;
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:border-primary/40 hover:text-primary disabled:opacity-30 transition-all"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                    <div className="flex gap-1.5">
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                            i === currentPage
                              ? "bg-primary text-white"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={currentPage === totalPages - 1}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 text-sm font-bold text-zinc-600 dark:text-zinc-300 hover:border-primary/40 hover:text-primary disabled:opacity-30 transition-all"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* New Quiz button */}
                {!submitted && (
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-primary transition-colors"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" />
                    Generate a different quiz
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: History Sidebar */}
          <div className="space-y-4">
            {loadingHistory ? (
              <div className="flex items-center justify-center p-6 text-zinc-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : (
              <HistorySidebar
                history={history}
                onLoadQuiz={handleLoadQuiz}
                onDeleteQuiz={handleDeleteQuiz}
              />
            )}

            {/* Tip Card */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Pro Tips
              </p>
              <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                <li>• Answer all MCQ &amp; T/F, then click <strong>Evaluate</strong> on short answers</li>
                <li>• Paste lecture notes to generate topic-specific quizzes</li>
                <li>• Submit to see full results &amp; explanations</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 20px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); }
      `}</style>
    </div>
  );
}
