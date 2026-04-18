import { createBrowserRouter } from "react-router";
import AnswerEvaluator from "../pages/AnswerEvaluator";
import AskAI from "../pages/AskAI";
import CodeAI from "../pages/CodeAI";
import ConceptSimplifier from "../pages/ConceptSimplifier";
import DocumentQA from "../pages/DocumentQA";
import Home from "../pages/Home";
import Notes from "../pages/Notes";
import GoalTracking from "../pages/GoalTracking";
import LearningAnalytics from "../pages/LearningAnalytics";
import QuizGenerator from "../pages/QuizGenerator";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/ask-ai", element: <AskAI /> },
  { path: "/code-ai", element: <CodeAI /> },
  { path: "/concept-simplifier", element: <ConceptSimplifier /> },
  { path: "/document-qa", element: <DocumentQA /> },
  { path: "/evaluate", element: <AnswerEvaluator /> },
  { path: "/notes", element: <Notes /> },
  { path: "/quiz", element: <QuizGenerator /> },
  { path: "/analytics", element: <LearningAnalytics /> },
  { path: "/goals", element: <GoalTracking /> },
]);
