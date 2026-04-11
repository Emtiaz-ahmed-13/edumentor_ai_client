import { createBrowserRouter } from "react-router";
import AskAI from "../pages/AskAI";
import CodeAI from "../pages/CodeAI";
import ConceptSimplifier from "../pages/ConceptSimplifier";
import Home from "../pages/Home";
import Notes from "../pages/Notes";
import VoiceChat_5 from "../components/VoiceChat_5";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/ask-ai", element: <AskAI /> },
  { path: "/code-ai", element: <CodeAI /> },
  { path: "/concept-simplifier", element: <ConceptSimplifier /> },
  { path: "/document-qa", element: <DocumentQA /> },
  { path: "/notes", element: <Notes /> },
  { path: "/voice", element: <VoiceChat_5 /> },
]);
