import { useState } from "react";
import { Brain, CheckCircle2, Loader2, XCircle } from "lucide-react";
import aiService from "../api/ai.service";
import quizService from "../api/quiz.service";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export default function QuizGenerator() {
  const [topic, setTopic] = useState("");
  const [material, setMaterial] = useState("");
  const [inputType, setInputType] = useState("topic");
  const [difficulty, setDifficulty] = useState("intermediate");
  const [numQuestions, setNumQuestions] = useState(5);
  
  const [loading, setLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (inputType === "topic" && !topic) return;
    if (inputType === "material" && !material) return;

    setLoading(true);
    setQuizData(null);
    setAnswers({});
    setIsSubmitted(false);

    try {
      const payload = inputType === "topic" ? topic : "Based on this material: " + material;
      const response = await aiService.generateQuiz(payload, difficulty, numQuestions);
      if (response.data && response.data.data) {
        setQuizData(response.data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to generate quiz", error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (qIndex, option) => {
    if (isSubmitted) return;
    setAnswers({ ...answers, [qIndex]: option });
  };

  const handleSubmitQuiz = async () => {
    let currentScore = 0;
    quizData.questions.forEach((q, index) => {
      if (answers[index] === q.correctAnswer) {
        currentScore += 1;
      }
    });
    
    setScore(currentScore);
    setIsSubmitted(true);

    // Feature 11 & 15: Save result to backend for analytics
    try {
      await quizService.submitQuiz({
        quizId: quizData._id,
        subject: quizData.subject,
        score: currentScore,
        totalQuestions: quizData.questions.length,
        difficulty: difficulty,
        topics: [quizData.topic]
      });
      console.log("Quiz result synced with analytics engine.");
    } catch (error) {
      console.error("Failed to sync quiz result:", error);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-foreground flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 flex justify-center items-center gap-3">
              <Brain className="w-10 h-10 text-primary" />
              AI Quiz Generator
            </h1>
            <p className="text-lg text-muted-foreground w-full max-w-2xl mx-auto">
              Test your knowledge instantly. Enter any topic to generate a dynamic multiple-choice quiz and get real-time feedback!
            </p>
          </div>

          {!quizData && (
            <Card className="shadow-lg border-zinc-200 dark:border-zinc-800 backdrop-blur-sm bg-white/50 dark:bg-zinc-900/50">
              <CardHeader>
                <CardTitle>Configure Your Quiz</CardTitle>
                <CardDescription>Customize the topic, difficulty, and length to begin.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <Button 
                    type="button" 
                    variant={inputType === "topic" ? "default" : "outline"} 
                    onClick={() => setInputType("topic")}
                    className="flex-1"
                  >
                    Enter Topic
                  </Button>
                  <Button 
                    type="button" 
                    variant={inputType === "material" ? "default" : "outline"} 
                    onClick={() => setInputType("material")}
                    className="flex-1"
                  >
                    Paste Material
                  </Button>
                </div>

                <form onSubmit={handleGenerate} className="space-y-6">
                  {inputType === "topic" ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Topic or Subject</label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g. World War II, React JS, Quantum Physics..."
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all dark:bg-zinc-900 dark:border-zinc-800"
                        required={inputType === "topic"}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Study Material / Text</label>
                      <textarea
                        value={material}
                        onChange={(e) => setMaterial(e.target.value)}
                        placeholder="Paste your notes, article, or document content here..."
                        rows={6}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all dark:bg-zinc-900 dark:border-zinc-800 resize-y"
                        required={inputType === "material"}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Difficulty Level</label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all dark:bg-zinc-900 dark:border-zinc-800"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Number of Questions</label>
                      <select
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(Number(e.target.value))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all dark:bg-zinc-900 dark:border-zinc-800"
                      >
                        <option value={3}>3 Questions</option>
                        <option value={5}>5 Questions</option>
                        <option value={10}>10 Questions</option>
                      </select>
                    </div>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full py-6 text-lg font-medium">
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Quiz...
                      </>
                    ) : (
                      "Generate Quiz"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {quizData && (
            <div className="space-y-8">
              {isSubmitted && (
                <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="p-6 text-center">
                    <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
                    <p className="text-xl">
                      You scored <span className="font-bold text-primary">{score}</span> out of {quizData.length}
                    </p>
                    <Button onClick={() => setQuizData(null)} variant="outline" className="mt-4">
                      Create Another Quiz
                    </Button>
                  </CardContent>
                </Card>
              )}

              {quizData.questions.map((q, index) => (
                <Card key={index} className={`shadow-md ${isSubmitted && answers[index] === q.correctAnswer ? "border-green-500/50" : isSubmitted && answers[index] !== q.correctAnswer ? "border-red-500/50" : ""}`}>
                  <CardHeader>
                    <CardTitle className="text-xl leading-relaxed">
                      <span className="text-muted-foreground mr-2">{index + 1}.</span>
                      {q.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((option, oIdx) => {
                        const isSelected = answers[index] === option;
                        let btnClass = "border-zinc-200 dark:border-zinc-800 hover:border-primary hover:bg-primary/5 text-left h-auto py-3 px-4 whitespace-normal transition-all duration-200";
                        
                        if (isSelected && !isSubmitted) {
                          btnClass = "border-primary bg-primary/10 text-primary";
                        } else if (isSubmitted) {
                          if (option === q.correctAnswer) {
                            btnClass = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
                          } else if (isSelected && option !== q.correctAnswer) {
                            btnClass = "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                          } else {
                            btnClass = "opacity-50 border-zinc-200 dark:border-zinc-800";
                          }
                        }

                        return (
                          <Button
                            key={oIdx}
                            variant="outline"
                            className={btnClass}
                            onClick={() => handleOptionSelect(index, option)}
                            disabled={isSubmitted}
                          >
                            <div className="flex items-start justify-between w-full">
                              <span>{option}</span>
                              {isSubmitted && option === q.correctAnswer && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 ml-2" />}
                              {isSubmitted && isSelected && option !== q.correctAnswer && <XCircle className="w-5 h-5 text-red-500 shrink-0 ml-2" />}
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                    
                    {isSubmitted && (
                      <div className="mt-6 p-4 rounded-lg bg-muted text-sm border">
                        <p className="font-semibold mb-1">Explanation:</p>
                        <p className="text-muted-foreground">{q.explanation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {!isSubmitted && (
                <div className="sticky bottom-6 flex justify-center z-10 transition-all">
                  <Button 
                    size="lg" 
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(answers).length !== quizData.length}
                    className="w-full max-w-sm py-6 text-lg font-bold shadow-xl"
                  >
                    Submit Quiz to Show Results
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
