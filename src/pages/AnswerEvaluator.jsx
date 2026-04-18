import { useState } from "react";
import { Brain, FileText, CheckCircle, XCircle, TrendingUp, Loader2, Award } from "lucide-react";
import aiService from "../api/ai.service";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export default function AnswerEvaluator() {
  const [question, setQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!question || !userAnswer) return;

    setLoading(true);
    setEvaluation(null);

    try {
      const response = await aiService.evaluateAnswer(question, userAnswer);
      if (response.data && response.data.data) {
        setEvaluation(response.data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to evaluate answer", error);
      alert("Failed to evaluate answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 flex justify-center items-center gap-3">
              <FileText className="w-10 h-10 text-primary" />
              AI Answer Evaluator
            </h1>
            <p className="text-lg text-muted-foreground w-full max-w-2xl mx-auto">
              Get an instant AI review of your descriptive or essay-type answers. Discover your score, strengths, and areas to improve!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="space-y-6">
              <Card className="shadow-lg border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle>Submit Your Answer</CardTitle>
                  <CardDescription>Type the question and your corresponding answer below.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleEvaluate} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">The Question</label>
                      <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="e.g. What were the primary causes of World War 1?"
                        rows={3}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none dark:bg-zinc-900 dark:border-zinc-800"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Descriptive Answer</label>
                      <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Write your full answer here..."
                        rows={8}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-y dark:bg-zinc-900 dark:border-zinc-800"
                        required
                      />
                    </div>

                    <Button type="submit" disabled={loading || !question || !userAnswer} className="w-full py-6 text-lg font-medium">
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Evaluating Answer...
                        </>
                      ) : (
                        "Evaluate Answer"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {!evaluation && !loading && (
                <div className="h-full border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-white/50 dark:bg-zinc-900/50">
                  <Brain className="w-16 h-16 mb-4 opacity-50" />
                  <h3 className="text-xl font-medium text-foreground mb-2">Waiting for Submission</h3>
                  <p>Your detailed AI evaluation report will appear right here.</p>
                </div>
              )}

              {loading && (
                <div className="h-full border border-zinc-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-white/50 dark:bg-zinc-900/50">
                  <Loader2 className="w-16 h-16 mb-4 animate-spin text-primary" />
                  <h3 className="text-xl font-medium text-foreground">AI is reading...</h3>
                </div>
              )}

              {evaluation && (
                <Card className="shadow-lg border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden border-t-4 border-t-primary">
                  <div className="bg-primary/10 p-6 flex items-center justify-between border-b border-primary/10">
                    <div>
                      <h3 className="text-2xl font-bold">Overall Score</h3>
                      <p className="text-muted-foreground text-sm">Based on accuracy, depth, and clarity.</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-background border-4 border-primary flex flex-col items-center justify-center shadow-inner">
                        <span className="text-xl font-black text-primary leading-none">{evaluation.grade}</span>
                      </div>
                      <div className="w-20 h-20 rounded-full bg-background border-4 border-primary flex items-center justify-center shadow-inner">
                        <span className="text-3xl font-black text-primary">{evaluation.score}</span>
                        <span className="text-sm font-medium text-muted-foreground ml-1">/{evaluation.maxScore || 10}</span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6 space-y-6">
                    {evaluation.overallFeedback && (
                      <p className="text-sm text-muted-foreground leading-relaxed border-b border-zinc-200 dark:border-zinc-800 pb-4">
                        {evaluation.overallFeedback}
                      </p>
                    )}
                    {evaluation.strengths && evaluation.strengths.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center text-green-600 dark:text-green-400">
                          <CheckCircle className="w-5 h-5 mr-2" /> Strengths
                        </h4>
                        <ul className="space-y-2">
                          {evaluation.strengths.map((str, i) => (
                            <li key={i} className="flex items-start bg-green-500/5 p-3 rounded-lg border border-green-500/10">
                              <span className="text-sm">{str}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {evaluation.keyMissingPoints && evaluation.keyMissingPoints.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center text-red-600 dark:text-red-400">
                          <XCircle className="w-5 h-5 mr-2" /> Key Missing Points
                        </h4>
                        <ul className="space-y-2">
                          {evaluation.keyMissingPoints.map((point, i) => (
                            <li key={i} className="flex items-start bg-red-500/5 p-3 rounded-lg border border-red-500/10">
                              <span className="text-sm">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {evaluation.improvements && evaluation.improvements.length > 0 && (
                      <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <h4 className="font-semibold flex items-center text-primary">
                          <TrendingUp className="w-5 h-5 mr-2" /> How to Improve
                        </h4>
                        <ul className="space-y-2">
                          {evaluation.improvements.map((tip, i) => (
                            <li key={i} className="bg-primary/5 p-3 rounded-lg border border-primary/10 text-sm leading-relaxed">
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {evaluation.suggestedAnswer && (
                      <div className="space-y-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <h4 className="font-semibold flex items-center text-amber-600 dark:text-amber-400">
                          <Award className="w-5 h-5 mr-2" /> Suggested Answer
                        </h4>
                        <div className="bg-amber-500/5 p-4 rounded-lg border border-amber-500/10 text-sm leading-relaxed">
                          {evaluation.suggestedAnswer}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
