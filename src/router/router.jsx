import { createBrowserRouter } from "react-router";
import AnswerEvaluator from "../pages/AnswerEvaluator";
import AskAI from "../pages/AskAI";
import CodeAI from "../pages/CodeAI";
import ConceptSimplifier from "../pages/ConceptSimplifier";
import DocumentQA from "../pages/DocumentQA";
import Home from "../pages/Home";
import Notes from "../pages/Notes";
import QuizGenerator from "../pages/QuizGenerator";
import VoiceChat_5 from "../components/VoiceChat_5";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/ask-ai", element: <AskAI /> },
  { path: "/code-ai", element: <CodeAI /> },
  { path: "/concept-simplifier", element: <ConceptSimplifier /> },
  { path: "/document-qa", element: <DocumentQA /> },
  { path: "/evaluate", element: <AnswerEvaluator /> },
  { path: "/notes", element: <Notes /> },
  { path: "/quiz", element: <QuizGenerator /> },
  { path: "/voice", element: <VoiceChat_5 /> },
  { path: "/voice-chat", element: <VoiceChat_5 /> },
]);
